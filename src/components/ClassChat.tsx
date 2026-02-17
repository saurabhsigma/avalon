'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { FaPaperPlane, FaFile, FaBullhorn, FaUser, FaClock, FaThumbtack } from 'react-icons/fa';

interface Message {
  _id: string;
  senderId: string;
  senderName: string;
  senderRole: 'teacher' | 'student';
  messageType: 'text' | 'file' | 'announcement';
  content: string;
  fileUrl?: string;
  fileName?: string;
  isPinned: boolean;
  createdAt: string;
}

interface ClassChatProps {
  classId: string;
  userRole: 'teacher' | 'student';
  userId: string;
}

export default function ClassChat({ classId, userRole, userId }: ClassChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isAnnouncement, setIsAnnouncement] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [classId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/class-chat?classId=${classId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const response = await fetch('/api/class-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classId,
          content: newMessage,
          messageType: isAnnouncement ? 'announcement' : 'text',
        }),
      });

      if (response.ok) {
        setNewMessage('');
        setIsAnnouncement(false);
        fetchMessages();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const togglePin = async (messageId: string, currentPinState: boolean) => {
    try {
      const response = await fetch(`/api/class-chat?id=${messageId}&action=pin`, {
        method: 'PATCH',
      });
      if (response.ok) {
        // Immediately update local state for instant feedback
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg._id === messageId ? { ...msg, isPinned: !currentPinState } : msg
          )
        );
        // Also fetch to sync with server
        await fetchMessages();
      }
    } catch (error) {
      console.error('Error pinning message:', error);
    }
  };

  const pinnedMessages = messages.filter(m => m.isPinned);
  const regularMessages = messages.filter(m => !m.isPinned);

  return (
    <div className="flex flex-col h-[calc(100vh-200px)]">
      {/* Pinned Messages */}
      {pinnedMessages.length > 0 && (
        <div className="bg-yellow-100 border-4 border-yellow-600 rounded-lg p-4 mb-4">
          <h3 className="font-bold text-yellow-900 mb-2 flex items-center gap-2">
            <FaThumbtack /> Pinned Messages
          </h3>
          <div className="space-y-2">
            {pinnedMessages.map((msg) => (
              <div key={msg._id} className="bg-white border-2 border-yellow-500 rounded p-2 text-sm flex justify-between items-start gap-2">
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{msg.senderName}</p>
                  <p className="text-gray-700">{msg.content}</p>
                </div>
                {userRole === 'teacher' && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => togglePin(msg._id, msg.isPinned)}
                    className="h-6 w-6 p-0 flex-shrink-0"
                    title="Unpin message"
                  >
                    <FaThumbtack className="text-yellow-600" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Messages Area */}
      <Card className="flex-1 doodle-card bg-white border-4 border-green-600 flex flex-col overflow-hidden">
        <CardHeader className="bg-green-100 border-b-4 border-green-600">
          <CardTitle className="text-2xl font-bold text-green-800 flex items-center gap-2">
            💬 Class Chat
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-br from-green-50 to-blue-50">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-lg font-semibold">No messages yet!</p>
              <p>Start the conversation 👋</p>
            </div>
          ) : (
            <>
              {regularMessages.map((msg, index) => {
                const isOwn = msg.senderId === userId;
                const isTeacherMsg = msg.senderRole === 'teacher';
                const isAnnouncement = msg.messageType === 'announcement';

                return (
                  <motion.div
                    key={msg._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] ${isAnnouncement ? 'w-full max-w-full' : ''}`}>
                      <div className={`doodle-card p-3 ${
                        isAnnouncement
                          ? 'bg-yellow-100 border-4 border-yellow-600'
                          : isOwn
                          ? 'bg-blue-100 border-3 border-blue-500'
                          : isTeacherMsg
                          ? 'bg-green-100 border-3 border-green-500'
                          : 'bg-white border-3 border-gray-400'
                      } shadow-md`}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-gray-800 flex items-center gap-1">
                              {isTeacherMsg && '👨‍🏫'}
                              {msg.senderName}
                            </span>
                            {isTeacherMsg && (
                              <Badge className="bg-green-600 text-white text-xs">Teacher</Badge>
                            )}
                            {isAnnouncement && (
                              <Badge className="bg-yellow-600 text-white text-xs flex items-center gap-1">
                                <FaBullhorn className="text-xs" /> Announcement
                              </Badge>
                            )}
                          </div>
                          {userRole === 'teacher' && !isAnnouncement && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => togglePin(msg._id, msg.isPinned)}
                              className="h-6 w-6 p-0"
                              title={msg.isPinned ? 'Unpin message' : 'Pin message'}
                            >
                              <FaThumbtack className={msg.isPinned ? 'text-yellow-600' : 'text-gray-400'} />
                            </Button>
                          )}
                        </div>
                        <p className="text-gray-800 font-medium whitespace-pre-wrap break-words">
                          {msg.content}
                        </p>
                        {msg.fileUrl && (
                          <a
                            href={msg.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 mt-2 text-blue-600 hover:underline text-sm"
                          >
                            <FaFile /> {msg.fileName}
                          </a>
                        )}
                        <div className="flex items-center gap-1 mt-2 text-xs text-gray-600">
                          <FaClock className="text-xs" />
                          {new Date(msg.createdAt).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              <div ref={messagesEndRef} />
            </>
          )}
        </CardContent>

        {/* Input Area */}
        <div className="border-t-4 border-green-600 bg-green-100 p-4">
          <form onSubmit={sendMessage} className="space-y-3">
            {userRole === 'teacher' && (
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <input
                  type="checkbox"
                  checked={isAnnouncement}
                  onChange={(e) => setIsAnnouncement(e.target.checked)}
                  className="w-4 h-4 rounded border-2"
                />
                <FaBullhorn className="text-yellow-600" />
                Send as Announcement
              </label>
            )}
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 border-3 border-gray-400 focus:border-green-600"
                disabled={sending}
              />
              <Button
                type="submit"
                disabled={sending || !newMessage.trim()}
                className="doodle-button bg-green-500 hover:bg-green-600 text-white font-bold px-6 border-green-800"
              >
                <FaPaperPlane />
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
