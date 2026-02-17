'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import FloatingDecorations from "@/components/FloatingDecorations";
import { 
  FaVideo, FaChalkboardTeacher, FaRobot, FaChartLine, 
  FaUsers, FaTrophy, FaBookReader, FaGraduationCap,
  FaBook, FaLightbulb, FaSignOutAlt, FaDatabase, FaBrain, FaSearch
} from "react-icons/fa";
import { SiPinecone } from "react-icons/si";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error('Error checking auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    router.refresh();
  };

  const goToDashboard = () => {
    if (user?.role === 'admin') {
      router.push('/admin/dashboard');
    } else if (user?.role === 'teacher') {
      router.push('/teacher/dashboard');
    } else {
      router.push('/student/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 relative overflow-hidden">
      <FloatingDecorations />
      
      {/* Modern Header */}
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 80 }}
        className="sticky top-0 z-50 border-b-2 border-white/20 glass-card backdrop-blur-md shadow-lg"
      >
        <div className="container mx-auto flex h-20 items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3 group">
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg border-2 border-white"
            >
              <FaGraduationCap className="text-2xl text-white" />
            </motion.div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              EduPlatform
            </span>
          </Link>
          <nav className="flex items-center gap-4">
            {loading ? (
              <div className="animate-pulse h-10 w-32 glass-card rounded-full"></div>
            ) : user ? (
              <>
                <span className="text-gray-700 font-semibold">
                  Hello, {user.name}! 👋
                </span>
                <Button 
                  onClick={goToDashboard}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold px-6 border-2 border-white shadow-lg rounded-full"
                >
                  Dashboard
                </Button>
                <Button 
                  onClick={handleLogout}
                  variant="outline"
                  className="border-2 border-red-500 text-red-500 hover:bg-red-50 font-bold px-6 rounded-full"
                >
                  <FaSignOutAlt className="mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button 
                    variant="outline" 
                    className="border-2 border-purple-500 text-purple-600 hover:bg-purple-50 font-bold px-6 rounded-full"
                  >
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold px-8 border-2 border-white shadow-lg rounded-full">
                      Get Started
                    </Button>
                  </motion.div>
                </Link>
              </>
            )}
          </nav>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mx-auto max-w-5xl text-center"
        >
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="mb-6 inline-block"
          >
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-2 border-white px-6 py-2 text-base font-bold rounded-full shadow-lg">
              <FaLightbulb className="mr-2" />
              AI-Powered Learning Platform
            </Badge>
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              Next-Gen Education
            </span>
            <br />
            <span className="text-gray-800">Starts Here</span>
          </h1>

          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed font-medium">
            Experience the future of learning with live classes, AI assistance, and semantic material search powered by <strong className="text-purple-600">Pinecone</strong>
          </p>

          <div className="flex flex-wrap gap-4 justify-center mb-12">
            {user ? (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  onClick={goToDashboard}
                  size="lg"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold text-lg px-10 py-7 rounded-full border-2 border-white shadow-xl"
                >
                  <FaChalkboardTeacher className="mr-2 text-xl" />
                  Go to Dashboard
                </Button>
              </motion.div>
            ) : (
              <>
                <Link href="/register">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button 
                      size="lg"
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold text-lg px-10 py-7 rounded-full border-2 border-white shadow-xl"
                    >
                      <FaGraduationCap className="mr-2 text-xl" />
                      Start Learning Free
                    </Button>
                  </motion.div>
                </Link>
                <Link href="/login">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button 
                      size="lg"
                      variant="outline"
                      className="border-2 border-purple-500 text-purple-600 hover:bg-purple-50 font-bold text-lg px-10 py-7 rounded-full"
                    >
                      <FaChalkboardTeacher className="mr-2 text-xl" />
                      I'm a Teacher
                    </Button>
                  </motion.div>
                </Link>
              </>
            )}
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap gap-6 justify-center items-center text-sm text-gray-600 font-semibold">
            <div className="flex items-center gap-2">
              <FaUsers className="text-purple-500" />
              <span>10,000+ Students</span>
            </div>
            <div className="flex items-center gap-2">
              <FaChalkboardTeacher className="text-pink-500" />
              <span>500+ Teachers</span>
            </div>
            <div className="flex items-center gap-2">
              <FaVideo className="text-blue-500" />
              <span>5,000+ Classes</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Sponsor Feature - Pinecone */}
      <section className="container mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card border-2 border-white p-10 rounded-3xl shadow-2xl max-w-4xl mx-auto"
        >
          <div className="text-center mb-8">
            <Badge className="bg-gradient-to-r from-green-500 to-teal-500 text-white border-2 border-white px-4 py-2 text-sm font-bold rounded-full shadow-lg mb-4">
              Powered by Pinecone
            </Badge>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              Intelligent Material Discovery
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Our platform uses <strong>Pinecone's vector database</strong> to power semantic search, making study materials instantly discoverable
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              className="glass-card border-2 border-white/50 p-6 rounded-2xl text-center"
            >
              <div className="bg-gradient-to-br from-purple-100 to-purple-200 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FaSearch className="text-3xl text-purple-600" />
              </div>
              <h3 className="font-bold text-gray-800 mb-2">Smart Search</h3>
              <p className="text-sm text-gray-600">Natural language queries find relevant materials instantly</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              className="glass-card border-2 border-white/50 p-6 rounded-2xl text-center"
            >
              <div className="bg-gradient-to-br from-pink-100 to-pink-200 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FaBrain className="text-3xl text-pink-600" />
              </div>
              <h3 className="font-bold text-gray-800 mb-2">AI Context</h3>
              <p className="text-sm text-gray-600">Chatbot retrieves relevant materials for accurate answers</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              className="glass-card border-2 border-white/50 p-6 rounded-2xl text-center"
            >
              <div className="bg-gradient-to-br from-blue-100 to-blue-200 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FaDatabase className="text-3xl text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-800 mb-2">Vector DB</h3>
              <p className="text-sm text-gray-600">100K vectors in free tier, perfect for education</p>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Features - Glass Cards */}
      <section className="container mx-auto px-6 py-16">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl font-bold text-center mb-4"
        >
          <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Platform Features
          </span>
        </motion.h2>
        <p className="text-center text-gray-600 mb-12 text-lg">
          Everything you need for modern education
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { 
              icon: FaVideo, 
              title: "Live Video Classes", 
              desc: "Real-time video sessions with LiveKit integration",
              gradient: "from-blue-500 to-cyan-500"
            },
            { 
              icon: FaRobot, 
              title: "AI Chatbot", 
              desc: "Context-aware assistance powered by Groq AI",
              gradient: "from-purple-500 to-pink-500"
            },
            { 
              icon: FaSearch, 
              title: "Smart Search", 
              desc: "Semantic material discovery with Pinecone",
              gradient: "from-green-500 to-teal-500"
            },
            { 
              icon: FaBookReader, 
              title: "Study Materials", 
              desc: "PDFs, videos, images, and links organized by subject",
              gradient: "from-yellow-500 to-orange-500"
            },
            { 
              icon: FaChartLine, 
              title: "Analytics Dashboard", 
              desc: "Track progress, grades, and attendance",
              gradient: "from-red-500 to-pink-500"
            },
            { 
              icon: FaTrophy, 
              title: "Gamification", 
              desc: "Earn points, badges, and compete on leaderboards",
              gradient: "from-indigo-500 to-purple-500"
            }
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
            >
              <Card className="glass-card border-2 border-white h-full hover:shadow-2xl transition-all">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className={`p-4 rounded-2xl bg-gradient-to-br ${feature.gradient} text-white shadow-lg`}>
                      <feature.icon className="text-2xl" />
                    </div>
                    <CardTitle className="text-lg font-bold text-gray-800">
                      {feature.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base text-gray-600">
                    {feature.desc}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20 pb-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="glass-card border-2 border-white p-12 text-center rounded-3xl shadow-2xl relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-blue-500/10"></div>
          
          <div className="relative z-10">
            <motion.div 
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="inline-block mb-6"
            >
              <FaGraduationCap className="text-6xl bg-gradient-to-br from-purple-500 to-pink-500 bg-clip-text text-transparent" />
            </motion.div>
            
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Ready to Transform Education?
              </span>
            </h2>
            
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of students and teachers already learning on our AI-powered platform
            </p>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {user ? (
                <Button 
                  onClick={goToDashboard}
                  size="lg"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold text-xl px-12 py-8 rounded-full border-2 border-white shadow-xl"
                >
                  <FaChalkboardTeacher className="mr-3 text-2xl" />
                  Go to Dashboard
                </Button>
              ) : (
                <Link href="/register">
                  <Button 
                    size="lg"
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold text-xl px-12 py-8 rounded-full border-2 border-white shadow-xl"
                  >
                    <FaGraduationCap className="mr-3 text-2xl" />
                    Start Learning Now
                  </Button>
                </Link>
              )}
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t-2 border-white/20 glass-card py-8 backdrop-blur-md">
        <div className="container mx-auto px-6 text-center">
          <p className="text-lg font-semibold text-gray-700 mb-2">
            Built with 💜 for education
          </p>
          <p className="text-sm text-gray-600">
            © 2026 EduPlatform - Powered by Pinecone, Groq AI & LiveKit
          </p>
        </div>
      </footer>
    </div>
  );
}
