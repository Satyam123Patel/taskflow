import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, LogOut, Filter, CheckCircle2, Circle, Clock, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import TaskItem from '@/components/TaskItem';
import TaskDialog from '@/components/TaskDialog';
import { Badge } from '@/components/ui/badge';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Dashboard({ setIsAuthenticated }) {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0, high_priority: 0 });
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filterCategory, setFilterCategory] = useState(null);
  const [filterPriority, setFilterPriority] = useState(null);
  const [filterCompleted, setFilterCompleted] = useState(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchUser();
    fetchTasks();
    fetchStats();
  }, [filterCategory, filterPriority, filterCompleted]);

  const fetchUser = async () => {
    try {
      const response = await axios.get(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user:', error);
      handleLogout();
    }
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterCategory) params.append('category', filterCategory);
      if (filterPriority) params.append('priority', filterPriority);
      if (filterCompleted !== null) params.append('completed', filterCompleted);

      const response = await axios.get(`${API}/tasks?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/tasks/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
  };

  const handleCreateTask = () => {
    setEditingTask(null);
    setShowTaskDialog(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowTaskDialog(true);
  };

  const handleToggleComplete = async (taskId, currentStatus) => {
    try {
      await axios.patch(`${API}/tasks/${taskId}/toggle`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTasks();
      fetchStats();
      toast.success(currentStatus ? 'Task marked as incomplete' : 'Task completed!');
    } catch (error) {
      console.error('Error toggling task:', error);
      toast.error('Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await axios.delete(`${API}/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTasks();
      fetchStats();
      toast.success('Task deleted successfully');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };

  const handleTaskSaved = () => {
    fetchTasks();
    fetchStats();
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-zinc-200/60"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600" />
              <span className="text-xl font-heading font-bold text-zinc-900">TaskFlow</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-zinc-600">Hello, {user?.name || 'User'}!</span>
              <Button
                data-testid="logout-btn"
                onClick={handleLogout}
                variant="ghost"
                size="icon"
                className="rounded-full"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <div className="bg-gradient-to-br from-violet-50 to-violet-100 p-6 rounded-2xl border border-violet-200">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle2 className="w-5 h-5 text-violet-600" />
              <span className="text-sm font-medium text-violet-600">Total Tasks</span>
            </div>
            <p className="text-3xl font-bold font-heading text-violet-700">{stats.total}</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-2xl border border-emerald-200">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-600">Completed</span>
            </div>
            <p className="text-3xl font-bold font-heading text-emerald-700">{stats.completed}</p>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-2xl border border-amber-200">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 text-amber-600" />
              <span className="text-sm font-medium text-amber-600">Pending</span>
            </div>
            <p className="text-3xl font-bold font-heading text-amber-700">{stats.pending}</p>
          </div>
          <div className="bg-gradient-to-br from-rose-50 to-rose-100 p-6 rounded-2xl border border-rose-200">
            <div className="flex items-center gap-3 mb-2">
              <AlertCircle className="w-5 h-5 text-rose-600" />
              <span className="text-sm font-medium text-rose-600">High Priority</span>
            </div>
            <p className="text-3xl font-bold font-heading text-rose-700">{stats.high_priority}</p>
          </div>
        </motion.div>

        {/* Filters and Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6"
        >
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="w-5 h-5 text-zinc-500" />
            <Badge
              data-testid="filter-all-btn"
              onClick={() => { setFilterCategory(null); setFilterPriority(null); setFilterCompleted(null); }}
              className={`cursor-pointer rounded-full px-4 py-1.5 font-medium transition-all duration-200 ${
                !filterCategory && !filterPriority && filterCompleted === null
                  ? 'bg-violet-600 text-white hover:bg-violet-700'
                  : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
              }`}
            >
              All
            </Badge>
            <Badge
              data-testid="filter-work-btn"
              onClick={() => { setFilterCategory('work'); setFilterPriority(null); setFilterCompleted(null); }}
              className={`cursor-pointer rounded-full px-4 py-1.5 font-medium transition-all duration-200 ${
                filterCategory === 'work'
                  ? 'bg-violet-600 text-white hover:bg-violet-700'
                  : 'bg-violet-100 text-violet-700 hover:bg-violet-200'
              }`}
            >
              Work
            </Badge>
            <Badge
              data-testid="filter-personal-btn"
              onClick={() => { setFilterCategory('personal'); setFilterPriority(null); setFilterCompleted(null); }}
              className={`cursor-pointer rounded-full px-4 py-1.5 font-medium transition-all duration-200 ${
                filterCategory === 'personal'
                  ? 'bg-sky-600 text-white hover:bg-sky-700'
                  : 'bg-sky-100 text-sky-700 hover:bg-sky-200'
              }`}
            >
              Personal
            </Badge>
            <Badge
              data-testid="filter-high-priority-btn"
              onClick={() => { setFilterPriority('high'); setFilterCategory(null); setFilterCompleted(null); }}
              className={`cursor-pointer rounded-full px-4 py-1.5 font-medium transition-all duration-200 ${
                filterPriority === 'high'
                  ? 'bg-rose-600 text-white hover:bg-rose-700'
                  : 'bg-rose-100 text-rose-700 hover:bg-rose-200'
              }`}
            >
              High Priority
            </Badge>
          </div>
          <Button
            data-testid="create-task-btn"
            onClick={handleCreateTask}
            className="rounded-full font-medium bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-sm hover:shadow-md active:scale-95 transition-all duration-200"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Task
          </Button>
        </motion.div>

        {/* Task List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          {loading ? (
            <div className="text-center py-12 text-zinc-500">Loading tasks...</div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-12">
              <Circle className="w-16 h-16 text-zinc-300 mx-auto mb-4" />
              <p className="text-zinc-500 mb-4">No tasks yet. Create your first task!</p>
              <Button
                data-testid="empty-state-create-btn"
                onClick={handleCreateTask}
                className="rounded-full font-medium bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Task
              </Button>
            </div>
          ) : (
            tasks.map((task, index) => (
              <TaskItem
                key={task.id}
                task={task}
                index={index}
                onToggleComplete={handleToggleComplete}
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
              />
            ))
          )}
        </motion.div>
      </main>

      {/* Task Dialog */}
      <TaskDialog
        open={showTaskDialog}
        onOpenChange={setShowTaskDialog}
        task={editingTask}
        onTaskSaved={handleTaskSaved}
      />
    </div>
  );
}