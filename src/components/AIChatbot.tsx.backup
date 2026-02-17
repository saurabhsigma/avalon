'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FaRobot, FaPaperPlane, FaTimes, FaCommentDots } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export default function AIChatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const sendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg: Message = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const res = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: [...messages, userMsg] })
            });

            if (res.ok) {
                const data = await res.json();
                setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
            }
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: 'assistant', content: 'Network error. Please check your connection.' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        className="mb-4 w-80 sm:w-96 shadow-2xl rounded-2xl overflow-hidden"
                    >
                        <Card className="border-4 border-blue-500 flex flex-col h-[500px] bg-white">
                            <CardHeader className="bg-blue-600 text-white p-4 flex flex-row items-center justify-between sticky top-0">
                                <div className="flex items-center gap-2">
                                    <div className="bg-white p-1.5 rounded-full text-blue-600">
                                        <FaRobot size={20} />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg font-bold">AI Assistant</CardTitle>
                                        <p className="text-xs text-blue-100">Ask me anything about your studies!</p>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setIsOpen(false)}
                                    className="text-white hover:bg-blue-700 hover:text-white rounded-full h-8 w-8"
                                >
                                    <FaTimes />
                                </Button>
                            </CardHeader>
                            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 scrollbar-thin scrollbar-thumb-blue-200">
                                {messages.length === 0 && (
                                    <div className="text-center text-gray-400 mt-10">
                                        <FaRobot className="text-5xl mx-auto mb-3 opacity-20" />
                                        <p>Hello! I'm here to help you learn.</p>
                                        <p className="text-sm">Ask me a question to get started.</p>
                                    </div>
                                )}
                                {messages.map((msg, idx) => (
                                    <div
                                        key={idx}
                                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm
                                                ${msg.role === 'user'
                                                    ? 'bg-blue-600 text-white rounded-br-none'
                                                    : 'bg-white text-gray-800 border-2 border-gray-100 rounded-bl-none'
                                                }
                                            `}
                                        >
                                            {msg.content}
                                        </div>
                                    </div>
                                ))}
                                {loading && (
                                    <div className="flex justify-start">
                                        <div className="bg-white p-3 rounded-2xl rounded-bl-none border-2 border-gray-100 flex gap-1 items-center">
                                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </CardContent>
                            <div className="p-3 bg-white border-t border-gray-200">
                                <form onSubmit={sendMessage} className="flex gap-2">
                                    <Input
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder="Type your question..."
                                        className="rounded-full border-gray-300 focus-visible:ring-blue-500"
                                        disabled={loading}
                                    />
                                    <Button
                                        type="submit"
                                        size="icon"
                                        className="rounded-full bg-blue-600 hover:bg-blue-700 w-10 h-10 shrink-0"
                                        disabled={loading || !input.trim()}
                                    >
                                        <FaPaperPlane className="text-sm" />
                                    </Button>
                                </form>
                            </div>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`doodle-button rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-colors border-4
                    ${isOpen ? 'bg-red-500 border-red-700 text-white' : 'bg-blue-600 border-blue-800 text-white'}
                `}
            >
                {isOpen ? <FaTimes size={24} /> : <FaCommentDots size={28} />}
            </motion.button>
        </div>
    );
}
