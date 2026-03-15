import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Edit2, Trash2, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function TaskItem({ task, index, onToggleComplete, onEdit, onDelete }) {
  const priorityColors = {
    high: 'bg-rose-100 text-rose-700',
    medium: 'bg-amber-100 text-amber-700',
    low: 'bg-emerald-100 text-emerald-700'
  };

  const categoryColors = {
    work: 'bg-violet-100 text-violet-700',
    personal: 'bg-sky-100 text-sky-700'
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group flex items-center justify-between p-4 bg-white hover:bg-zinc-50 border border-zinc-100 rounded-xl transition-all duration-200 hover:border-violet-200 hover:shadow-sm"
    >
      <div className="flex items-start gap-4 flex-1">
        <button
          data-testid={`task-toggle-${task.id}`}
          onClick={() => onToggleComplete(task.id, task.completed)}
          className="mt-1 transition-all duration-200 hover:scale-110"
        >
          {task.completed ? (
            <CheckCircle2 className="w-6 h-6 text-violet-600" />
          ) : (
            <Circle className="w-6 h-6 text-zinc-300 hover:text-violet-600" />
          )}
        </button>
        <div className="flex-1">
          <h3 className={`font-medium text-zinc-900 mb-1 ${
            task.completed ? 'line-through text-zinc-400' : ''
          }`}>
            {task.title}
          </h3>
          {task.description && (
            <p className="text-sm text-zinc-500 mb-2">{task.description}</p>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={`rounded-full px-3 py-0.5 text-xs font-medium ${priorityColors[task.priority]}`}>
              {task.priority}
            </Badge>
            <Badge className={`rounded-full px-3 py-0.5 text-xs font-medium ${categoryColors[task.category]}`}>
              {task.category}
            </Badge>
            {task.due_date && (
              <div className="flex items-center gap-1 text-xs text-zinc-500">
                <Calendar className="w-3 h-3" />
                <span>{new Date(task.due_date).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <Button
          data-testid={`task-edit-${task.id}`}
          onClick={() => onEdit(task)}
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-violet-50 hover:text-violet-600"
        >
          <Edit2 className="w-4 h-4" />
        </Button>
        <Button
          data-testid={`task-delete-${task.id}`}
          onClick={() => onDelete(task.id)}
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-rose-50 hover:text-rose-600"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}
