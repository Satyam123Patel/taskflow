import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Calendar, Tag, TrendingUp } from 'lucide-react';
import AuthDialog from '@/components/AuthDialog';
import { Button } from '@/components/ui/button';

export default function LandingPage({ setIsAuthenticated }) {
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  const openAuth = (mode) => {
    setAuthMode(mode);
    setShowAuth(true);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-xl border-b border-zinc-200/60"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600" />
              <span className="text-xl font-heading font-bold text-zinc-900">TaskFlow</span>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                data-testid="header-login-btn"
                onClick={() => openAuth('login')} 
                variant="ghost" 
                className="rounded-full font-medium"
              >
                Log In
              </Button>
              <Button 
                data-testid="header-signup-btn"
                onClick={() => openAuth('signup')} 
                className="rounded-full font-medium bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-sm hover:shadow-md active:scale-95 transition-all duration-200"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold font-heading tracking-tight mb-6">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-600 via-fuchsia-500 to-rose-500">
                  Organize Your Life
                </span>
                <br />
                <span className="text-zinc-900">One Task at a Time</span>
              </h1>
              <p className="text-base md:text-lg leading-relaxed text-zinc-600 mb-8 max-w-xl">
                TaskFlow helps you manage your daily tasks with style. Prioritize what matters, 
                track your progress, and achieve your goals with a beautifully designed interface.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  data-testid="hero-get-started-btn"
                  onClick={() => openAuth('signup')} 
                  className="rounded-full font-medium bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white px-8 py-6 text-lg shadow-md hover:shadow-lg active:scale-95 transition-all duration-200"
                >
                  Get Started Free
                </Button>
                <Button 
                  data-testid="hero-learn-more-btn"
                  variant="outline" 
                  className="rounded-full font-medium px-8 py-6 text-lg border-zinc-300 hover:bg-zinc-50 transition-all duration-200"
                >
                  Learn More
                </Button>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative"
            >
              <img 
                src="https://images.unsplash.com/photo-1751644332113-2004a1b143f1?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTZ8MHwxfHNlYXJjaHwxfHwzZCUyMGFic3RyYWN0JTIwY29sb3JmdWwlMjBzaGFwZXMlMjBtaW5pbWFsaXN0fGVufDB8fHx8MTc3MzM0NTE0NXww&ixlib=rb-4.1.0&q=85"
                alt="3D abstract shapes"
                className="w-full h-auto rounded-2xl shadow-2xl"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-zinc-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-semibold font-heading tracking-tight text-zinc-900 mb-4">
              Everything You Need
            </h2>
            <p className="text-base md:text-lg text-zinc-600 max-w-2xl mx-auto">
              Powerful features designed to help you stay organized and productive
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <CheckCircle2 className="w-8 h-8" />,
                title: "Simple Task Management",
                description: "Create, edit, and complete tasks with ease. Stay on top of your to-dos effortlessly.",
                color: "from-violet-500 to-violet-600"
              },
              {
                icon: <Tag className="w-8 h-8" />,
                title: "Smart Categories",
                description: "Organize tasks by categories and priorities. Filter and find what you need instantly.",
                color: "from-fuchsia-500 to-fuchsia-600"
              },
              {
                icon: <Calendar className="w-8 h-8" />,
                title: "Due Date Tracking",
                description: "Set deadlines and never miss important tasks. Stay ahead with smart reminders.",
                color: "from-rose-500 to-rose-600"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1"
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center text-white mb-6`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-semibold font-heading text-zinc-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-base text-zinc-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-3xl md:text-5xl font-semibold font-heading tracking-tight text-zinc-900 mb-6">
            Ready to Get Organized?
          </h2>
          <p className="text-base md:text-lg text-zinc-600 mb-8 max-w-2xl mx-auto">
            Join thousands of users who are achieving more every day with TaskFlow.
          </p>
          <Button 
            data-testid="cta-get-started-btn"
            onClick={() => openAuth('signup')} 
            className="rounded-full font-medium bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white px-8 py-6 text-lg shadow-md hover:shadow-lg active:scale-95 transition-all duration-200"
          >
            Get Started Now
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center text-sm text-zinc-600">
          <p>&copy; 2024 TaskFlow. All rights reserved.</p>
        </div>
      </footer>

      {/* Auth Dialog */}
      <AuthDialog 
        open={showAuth} 
        onOpenChange={setShowAuth} 
        mode={authMode}
        setMode={setAuthMode}
        setIsAuthenticated={setIsAuthenticated}
      />
    </div>
  );
}
