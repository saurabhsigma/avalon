'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FaChalkboard, FaUser, FaLock, FaStar, FaBook, FaPencilAlt, FaRocket } from 'react-icons/fa';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.user.role === 'admin') {
          router.push('/admin/dashboard');
        } else if (data.user.role === 'teacher') {
          router.push('/teacher/dashboard');
        } else {
          router.push('/student/dashboard');
        }
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-blue-50 flex items-center justify-center p-4 relative overflow-hidden gradient-animated">
      {/* Simplified Background Elements - Only 3 for performance */}
      <motion.div
        animate={{ 
          y: [0, -20, 0]
        }}
        transition={{ 
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute bottom-20 left-10 text-5xl opacity-40"
      >
        📚
      </motion.div>
      
      <motion.div
        animate={{ 
          rotate: [0, 360]
        }}
        transition={{ 
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute bottom-1/3 right-20 text-5xl opacity-30"
      >
        🚀
      </motion.div>

      <motion.div
        animate={{ 
          y: [0, 15, 0]
        }}
        transition={{ 
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-1/2 right-1/4 text-4xl opacity-40"
      >
        💡
      </motion.div>

      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="absolute top-4 left-4 z-10"
      >
        <Link href="/" className="flex items-center gap-3">
          <motion.div 
            whileHover={{ rotate: 360, scale: 1.1 }}
            transition={{ duration: 0.5 }}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 border-3 border-green-800 shadow-md"
          >
            <FaChalkboard className="text-xl text-white" />
          </motion.div>
          <span className="text-xl font-bold text-green-800">AcademyAI</span>
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md z-10"
      >
        <Card className="doodle-card bg-white border-4 border-green-800 shadow-2xl relative overflow-hidden">
          {/* Floating Stars Inside Card */}
          <motion.div
            animate={{ 
              x: [0, 10, 0],
              y: [0, -10, 0],
              rotate: [0, 180, 360]
            }}
            transition={{ 
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-4 right-4 text-2xl opacity-20 z-0"
          >
            ⭐
          </motion.div>
          
          <motion.div
            animate={{ 
              x: [0, -10, 0],
              y: [0, 10, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{ 
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute bottom-4 left-4 text-xl opacity-20 z-0"
          >
            ✨
          </motion.div>

          <CardHeader className="text-center bg-gradient-to-r from-yellow-100 via-yellow-50 to-green-100 border-b-4 border-green-800 relative z-10">
            <motion.div
              initial={{ rotate: -10, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ 
                type: "spring", 
                stiffness: 200,
                delay: 0.2
              }}
              whileHover={{ 
                scale: 1.1,
                rotate: [0, -10, 10, -10, 0]
              }}
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-600 border-4 border-green-800 shadow-lg pulse-glow"
            >
              <FaUser className="text-2xl text-white" />
            </motion.div>
            <CardTitle className="text-3xl font-bold text-green-800 drop-shadow-sm">Welcome Back! 👋</CardTitle>
            <CardDescription className="text-base font-semibold text-gray-700">
              Sign in to continue your learning journey 🚀
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6 pt-6">
              {error && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="rounded-xl bg-red-100 border-3 border-red-600 p-4 text-sm font-semibold text-red-800"
                >
                  {error}
                </motion.div>
              )}

              {/* Demo Credentials Info */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl bg-blue-50 border-2 border-blue-300 p-4 text-sm"
              >
                <p className="font-bold text-blue-900 mb-2">🎯 Demo Credentials:</p>
                <p className="text-blue-800"><strong>Teacher:</strong> teacher2@gmail.com / 123456</p>
                <p className="text-blue-800"><strong>Student:</strong> student3@gmail.com / 123456</p>
              </motion.div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <FaUser className="text-green-600" />
                  Email
                </label>
                <Input
                  type="email"
                  placeholder="teacher2@gmail.com or student3@gmail.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="doodle-border border-2 border-green-600 focus:border-green-800 text-base p-3"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <FaLock className="text-green-600" />
                  Password
                </label>
                <Input
                  type="password"
                  placeholder="123456"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="doodle-border border-2 border-green-600 focus:border-green-800 text-base p-3"
                />
              </div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  type="submit"
                  disabled={loading}
                  className="doodle-button w-full bg-green-500 hover:bg-green-600 text-white font-bold text-lg py-6 border-4 border-green-800 shadow-lg"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </motion.div>
            </CardContent>
            <div className="px-6 pb-6 text-center">
              <p className="text-sm text-gray-700 font-medium">
                Don't have an account?{' '}
                <Link href="/register" className="text-green-700 font-bold hover:text-green-800 underline">
                  Sign up here
                </Link>
              </p>
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
