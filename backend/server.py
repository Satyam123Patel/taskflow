from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import jwt
from jwt import ExpiredSignatureError, InvalidTokenError
from passlib.context import CryptContext

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

# FastAPI app
app = FastAPI()

# Router
api_router = APIRouter(prefix="/api")


# =========================
# Models
# =========================

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    email: str
    name: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    category: Optional[str] = "personal"
    priority: Optional[str] = "medium"
    due_date: Optional[str] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    priority: Optional[str] = None
    due_date: Optional[str] = None
    completed: Optional[bool] = None


class Task(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    title: str
    description: str = ""
    category: str = "personal"
    priority: str = "medium"
    due_date: Optional[str] = None
    completed: bool = False
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


# =========================
# Helper Functions
# =========================

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    return pwd_context.hash(password)


def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials

        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials"
            )

        user = await db.users.find_one({"id": user_id}, {"_id": 0})

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )

        return user

    except ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )

    except InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )


# =========================
# Auth Routes
# =========================

@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserRegister):
    existing_user = await db.users.find_one({"email": user_data.email})

    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    user_id = str(uuid.uuid4())

    user_doc = {
        "id": user_id,
        "email": user_data.email,
        "name": user_data.name,
        "password": get_password_hash(user_data.password),
        "created_at": datetime.now(timezone.utc).isoformat()
    }

    await db.users.insert_one(user_doc)

    access_token = create_access_token({"sub": user_id})

    return TokenResponse(
        access_token=access_token,
        user=UserResponse(
            id=user_id,
            email=user_data.email,
            name=user_data.name
        )
    )


@api_router.post("/auth/login", response_model=TokenResponse)
async def login(user_data: UserLogin):
    user = await db.users.find_one({"email": user_data.email}, {"_id": 0})

    if not user or not verify_password(user_data.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    access_token = create_access_token({"sub": user["id"]})

    return TokenResponse(
        access_token=access_token,
        user=UserResponse(
            id=user["id"],
            email=user["email"],
            name=user["name"]
        )
    )


@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        id=current_user["id"],
        email=current_user["email"],
        name=current_user["name"]
    )


# =========================
# Task Routes
# =========================

@api_router.post("/tasks", response_model=Task)
async def create_task(task_data: TaskCreate, current_user: dict = Depends(get_current_user)):
    task = Task(
        user_id=current_user["id"],
        title=task_data.title,
        description=task_data.description or "",
        category=task_data.category or "personal",
        priority=task_data.priority or "medium",
        due_date=task_data.due_date
    )

    await db.tasks.insert_one(task.model_dump())

    return task


@api_router.get("/tasks", response_model=List[Task])
async def get_tasks(
    category: Optional[str] = None,
    priority: Optional[str] = None,
    completed: Optional[bool] = None,
    current_user: dict = Depends(get_current_user)
):
    query = {"user_id": current_user["id"]}

    if category:
        query["category"] = category
    if priority:
        query["priority"] = priority
    if completed is not None:
        query["completed"] = completed

    tasks = await db.tasks.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return tasks


@api_router.put("/tasks/{task_id}", response_model=Task)
async def update_task(task_id: str, task_data: TaskUpdate, current_user: dict = Depends(get_current_user)):
    existing_task = await db.tasks.find_one(
        {"id": task_id, "user_id": current_user["id"]},
        {"_id": 0}
    )

    if not existing_task:
        raise HTTPException(status_code=404, detail="Task not found")

    update_data = {
        k: v for k, v in task_data.model_dump().items()
        if v is not None
    }

    if update_data:
        await db.tasks.update_one(
            {"id": task_id, "user_id": current_user["id"]},
            {"$set": update_data}
        )

    updated_task = await db.tasks.find_one({"id": task_id}, {"_id": 0})

    return Task(**updated_task)


@api_router.patch("/tasks/{task_id}/toggle", response_model=Task)
async def toggle_task_completion(task_id: str, current_user: dict = Depends(get_current_user)):
    existing_task = await db.tasks.find_one(
        {"id": task_id, "user_id": current_user["id"]},
        {"_id": 0}
    )

    if not existing_task:
        raise HTTPException(status_code=404, detail="Task not found")

    new_status = not existing_task.get("completed", False)

    await db.tasks.update_one(
        {"id": task_id, "user_id": current_user["id"]},
        {"$set": {"completed": new_status}}
    )

    updated_task = await db.tasks.find_one({"id": task_id}, {"_id": 0})

    return Task(**updated_task)


@api_router.delete("/tasks/{task_id}")
async def delete_task(task_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.tasks.delete_one(
        {"id": task_id, "user_id": current_user["id"]}
    )

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")

    return {"message": "Task deleted successfully"}


@api_router.get("/tasks/stats")
async def get_task_stats(current_user: dict = Depends(get_current_user)):
    all_tasks = await db.tasks.find(
        {"user_id": current_user["id"]},
        {"_id": 0}
    ).to_list(1000)

    total = len(all_tasks)
    completed = len([t for t in all_tasks if t.get("completed", False)])
    pending = total - completed
    high_priority = len([
        t for t in all_tasks
        if t.get("priority") == "high" and not t.get("completed")
    ])

    return {
        "total": total,
        "completed": completed,
        "pending": pending,
        "high_priority": high_priority
    }


# =========================
# App Config
# =========================

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()