import { useState, useEffect } from 'react';
import axios from 'axios';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function TaskDialog({ open, onOpenChange, task, onTaskSaved }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'personal',
    priority: 'medium',
    due_date: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        category: task.category || 'personal',
        priority: task.priority || 'medium',
        due_date: task.due_date || ''
      });
    } else {
      setFormData({
        title: '',
        description: '',
        category: 'personal',
        priority: 'medium',
        due_date: ''
      });
    }
  }, [task, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      if (task) {
        // Update existing task
        await axios.put(`${API}/tasks/${task.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Task updated successfully');
      } else {
        // Create new task
        await axios.post(`${API}/tasks`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Task created successfully');
      }
      
      onTaskSaved();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving task:', error);
      toast.error('Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-heading font-bold text-zinc-900">
            {task ? 'Edit Task' : 'Create New Task'}
          </DialogTitle>
          <DialogDescription>
            {task ? 'Update your task details' : 'Add a new task to your list'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              data-testid="task-title-input"
              type="text"
              placeholder="Enter task title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="rounded-xl border-zinc-200 bg-zinc-50/50 focus:bg-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all duration-200"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              data-testid="task-description-input"
              placeholder="Enter task description (optional)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="rounded-xl border-zinc-200 bg-zinc-50/50 focus:bg-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all duration-200"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger data-testid="task-category-select" className="rounded-xl border-zinc-200 bg-zinc-50/50 focus:bg-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="work">Work</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger data-testid="task-priority-select" className="rounded-xl border-zinc-200 bg-zinc-50/50 focus:bg-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="due_date">Due Date</Label>
            <Input
              id="due_date"
              data-testid="task-duedate-input"
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              className="rounded-xl border-zinc-200 bg-zinc-50/50 focus:bg-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all duration-200"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 rounded-full font-medium border-zinc-300 hover:bg-zinc-50 transition-all duration-200"
            >
              Cancel
            </Button>
            <Button
              data-testid="task-save-btn"
              type="submit"
              disabled={loading}
              className="flex-1 rounded-full font-medium bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-sm hover:shadow-md active:scale-95 transition-all duration-200"
            >
              {loading ? 'Saving...' : (task ? 'Update Task' : 'Create Task')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
