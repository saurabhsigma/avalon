'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBrain, FaTimes, FaPaperPlane, FaSpinner } from 'react-icons/fa';
import { Button } from './ui/button';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const formatMessage = (text: string) => {
  // Handle undefined or null text
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  // Convert markdown-style formatting to HTML
  let formatted = text;
  
  // Bold text **text** or __text__
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  formatted = formatted.replace(/__(.*?)__/g, '<strong>$1</strong>');
  
  // Italic text *text* or _text_
  formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
  formatted = formatted.replace(/_(.*?)_/g, '<em>$1</em>');
  
  // Code blocks `code`
  formatted = formatted.replace(/`([^`]+)`/g, '<code class="bg-purple-100 px-1 rounded">$1</code>');
  
  // Line breaks
  formatted = formatted.replace(/\n/g, '<br/>');
  
  // Numbered lists
  formatted = formatted.replace(/(\d+\.)\s/g, '<br/><strong>$1</strong> ');
  
  // Bullet points
  formatted = formatted.replace(/^[•\-]\s/gm, '<br/>• ');
  
  return formatted;
};

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: input,
          history: messages.slice(-6) // Keep last 3 exchanges for context
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const aiMessage: Message = { role: 'assistant', content: data.response };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        const aiMessage: Message = { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' };
        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const aiMessage: Message = { role: 'assistant', content: 'Sorry, I could not connect. Please try again.' };
      setMessages(prev => [...prev, aiMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-gradient-to-br from-purple-500 to-blue-600 text-white rounded-full p-4 shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-110"
        >
          <FaBrain className="text-3xl" />
        </motion.button>
      )}

      {/* Chatbot Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed top-0 right-0 h-full w-full md:w-96 z-50 bg-white shadow-2xl flex flex-col"
            style={{
              backgroundImage: `repeating-linear-gradient(white 0px, white 30px, #e5e7eb 30px, #e5e7eb 31px)`,
            }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-full">
                  <FaBrain className="text-2xl" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">AI Study Assistant</h3>
                  <p className="text-xs text-white/80">Ask me anything!</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20 rounded-full"
              >
                <FaTimes className="text-xl" />
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 mt-8">
                  <FaBrain className="text-5xl mx-auto mb-3 text-purple-300" />
                  <p className="font-bold text-gray-700">Welcome, Student! 📚</p>
                  <p className="text-sm mt-2">I'm here to help you with your studies.</p>
                  <p className="text-sm">Ask me questions about homework, concepts, or anything!</p>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-4 rounded-2xl shadow-md ${
                        msg.role === 'user'
                          ? 'bg-blue-100 border-2 border-blue-300'
                          : 'bg-white border-2 border-purple-300 ai-message'
                      }`}
                      style={{
                        fontFamily: msg.role === 'user' ? "'Indie Flower', cursive" : "'Courier New', monospace",
                        fontSize: msg.role === 'user' ? '17px' : '14px',
                        lineHeight: msg.role === 'user' ? '1.6' : '1.8',
                      }}
                    >
                      {msg.role === 'user' ? (
                        <p className="text-blue-900">{msg.content}</p>
                      ) : (
                        <div 
                          className="text-gray-900 max-w-none"
                          dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
                        />
                      )}
                    </div>
                  </motion.div>
                ))
              )}
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-purple-50 border-2 border-purple-200 p-3 rounded-2xl shadow-md">
                    <FaSpinner className="animate-spin text-purple-500" />
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-gray-50 border-t-2 border-gray-200 shadow-lg">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type your question..."
                  disabled={loading}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-full focus:outline-none focus:border-purple-500 shadow-sm"
                  style={{ fontFamily: "'Indie Flower', cursive", fontSize: '16px' }}
                />
                <Button
                  onClick={sendMessage}
                  disabled={!input.trim() || loading}
                  className="bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-full px-5 hover:shadow-lg disabled:opacity-50"
                >
                  <FaPaperPlane />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
