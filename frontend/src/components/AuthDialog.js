import { useState } from 'react';
import axios from 'axios';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function AuthDialog({ open, onOpenChange, mode, setMode, setIsAuthenticated }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
      const payload = mode === 'login' 
        ? { email: formData.email, password: formData.password }
        : { email: formData.email, password: formData.password, name: formData.name };

      const response = await axios.post(`${API}${endpoint}`, payload);
      
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      setIsAuthenticated(true);
      toast.success(mode === 'login' ? 'Welcome back!' : 'Account created successfully!');
      onOpenChange(false);
      
      // Reset form
      setFormData({ email: '', password: '', name: '' });
    } catch (error) {
      console.error('Auth error:', error);
      const message = error.response?.data?.detail || 'An error occurred';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-heading font-bold text-zinc-900">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'login' ? 'Log in to access your tasks' : 'Sign up to get started with TaskFlow'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {mode === 'signup' && (
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                data-testid="auth-name-input"
                type="text"
                placeholder="Enter your name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="rounded-xl border-zinc-200 bg-zinc-50/50 focus:bg-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all duration-200"
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              data-testid="auth-email-input"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="rounded-xl border-zinc-200 bg-zinc-50/50 focus:bg-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all duration-200"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              data-testid="auth-password-input"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              className="rounded-xl border-zinc-200 bg-zinc-50/50 focus:bg-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all duration-200"
            />
          </div>
          <Button
            data-testid="auth-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full rounded-full font-medium bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white py-6 shadow-sm hover:shadow-md active:scale-95 transition-all duration-200"
          >
            {loading ? 'Please wait...' : (mode === 'login' ? 'Log In' : 'Sign Up')}
          </Button>
          <div className="text-center text-sm text-zinc-600">
            {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
            <button
              data-testid="auth-toggle-mode-btn"
              type="button"
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              className="text-violet-600 hover:text-violet-700 font-medium"
            >
              {mode === 'login' ? 'Sign up' : 'Log in'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
