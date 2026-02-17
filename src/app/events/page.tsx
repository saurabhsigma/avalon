'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaCalendarPlus, FaCalendarAlt, FaClock, FaMapMarkerAlt, 
  FaArrowUp, FaArrowDown, FaExternalLinkAlt, FaUser, FaTrophy,
  FaEdit, FaTrash
} from 'react-icons/fa';

interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  coverPhoto: string;
  link?: string;
  organizerId: {
    _id: string;
    name: string;
    role: string;
  };
  upvotes: string[];
  downvotes: string[];
  score: number;
  createdAt: string;
}

export default function EventsPage() {
  const [user, setUser] = useState<any>(null);
  const [topEvents, setTopEvents] = useState<Event[]>([]);
  const [otherEvents, setOtherEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [userVotes, setUserVotes] = useState<{ [key: string]: 'upvote' | 'downvote' | null }>({});
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const userRes = await fetch('/api/auth/me');
      if (!userRes.ok) {
        router.push('/login');
        return;
      }
      const userData = await userRes.json();
      setUser(userData.user);

      const eventsRes = await fetch('/api/events');
      if (eventsRes.ok) {
        const data = await eventsRes.json();
        setTopEvents(data.topEvents || []);
        setOtherEvents(data.otherEvents || []);

        // Initialize user votes
        const votes: { [key: string]: 'upvote' | 'downvote' | null } = {};
        [...data.topEvents, ...data.otherEvents].forEach((event: Event) => {
          if (event.upvotes.includes(userData.user._id)) {
            votes[event._id] = 'upvote';
          } else if (event.downvotes.includes(userData.user._id)) {
            votes[event._id] = 'downvote';
          } else {
            votes[event._id] = null;
          }
        });
        setUserVotes(votes);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (eventId: string, voteType: 'upvote' | 'downvote') => {
    try {
      const res = await fetch('/api/events/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, voteType }),
      });

      if (res.ok) {
        const data = await res.json();
        setUserVotes(prev => ({ ...prev, [eventId]: data.userVote }));
        
        // Update the event in the lists
        const updateEvent = (event: Event) => {
          if (event._id === eventId) {
            return data.event;
          }
          return event;
        };
        
        setTopEvents(prev => prev.map(updateEvent));
        setOtherEvents(prev => prev.map(updateEvent));
      }
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      const res = await fetch(`/api/events?id=${eventId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const EventCard = ({ event, index, isTop }: { event: Event; index: number; isTop?: boolean }) => {
    const userVote = userVotes[event._id];
    const canEdit = user && event.organizerId._id === user._id;
    const canDelete = user && (event.organizerId._id === user._id || user.role === 'admin');

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className={`doodle-card bg-white ${isTop ? 'border-yellow-500' : 'border-blue-400'} overflow-hidden`}
      >
        {isTop && (
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 px-4 py-2 flex items-center gap-2">
            <FaTrophy className="text-white text-xl" />
            <span className="text-white font-bold">Top Event #{index + 1}</span>
          </div>
        )}
        
        <div className="flex flex-col md:flex-row">
          {/* Voting Section */}
          <div className="flex md:flex-col items-center md:items-center justify-center gap-2 p-4 bg-gradient-to-br from-gray-50 to-gray-100 border-r-0 md:border-r-3 border-b-3 md:border-b-0 border-gray-300">
            <button
              onClick={() => handleVote(event._id, 'upvote')}
              className={`p-2 rounded-lg transition-all ${
                userVote === 'upvote'
                  ? 'bg-green-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-green-100'
              }`}
            >
              <FaArrowUp className="text-xl" />
            </button>
            <span className="text-2xl font-bold text-gray-900">{event.score}</span>
            <button
              onClick={() => handleVote(event._id, 'downvote')}
              className={`p-2 rounded-lg transition-all ${
                userVote === 'downvote'
                  ? 'bg-red-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-red-100'
              }`}
            >
              <FaArrowDown className="text-xl" />
            </button>
          </div>

          {/* Content Section */}
          <div className="flex-1 p-6">
            <div className="flex gap-4">
              {/* Cover Photo */}
              <div className="flex-shrink-0">
                <img
                  src={event.coverPhoto}
                  alt={event.title}
                  className="w-32 h-32 object-cover rounded-xl border-3 border-blue-400 shadow-md"
                />
              </div>

              {/* Event Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-2xl font-bold text-gray-900">{event.title}</h3>
                  {(canEdit || canDelete) && (
                    <div className="flex gap-2">
                      {canEdit && (
                        <Link href={`/events/edit/${event._id}`}>
                          <button className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-all">
                            <FaEdit />
                          </button>
                        </Link>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => handleDelete(event._id)}
                          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all"
                        >
                          <FaTrash />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <p className="text-gray-700 mb-4 line-clamp-2">{event.description}</p>

                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-700 font-medium">
                    <FaCalendarAlt className="text-blue-600" />
                    {formatDate(event.date)}
                  </div>
                  <div className="flex items-center gap-2 text-gray-700 font-medium">
                    <FaClock className="text-green-600" />
                    {event.time}
                  </div>
                  <div className="flex items-center gap-2 text-gray-700 font-medium">
                    <FaUser className="text-purple-600" />
                    {event.organizerId.name} ({event.organizerId.role})
                  </div>
                </div>

                {event.link && (
                  <div className="mt-4">
                    <a
                      href={event.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="doodle-button bg-gradient-to-r from-blue-500 to-purple-600 text-white border-blue-700 inline-flex items-center gap-2 text-sm"
                    >
                      <FaExternalLinkAlt />
                      Event Link
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-background">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-lg font-medium text-gray-700">Loading events...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <DashboardLayout userRole={user.role} userName={user.name}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Events 🎉
            </h1>
            <p className="text-gray-700 mt-2 font-medium">Discover and participate in upcoming events</p>
          </div>
          <Link href="/events/create">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="doodle-button bg-gradient-to-r from-blue-500 to-purple-600 text-white border-blue-700 flex items-center gap-2"
            >
              <FaCalendarPlus />
              <span>Create Event</span>
            </motion.button>
          </Link>
        </div>

        {/* Top 3 Events */}
        {topEvents.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <FaTrophy className="text-3xl text-yellow-500" />
              <h2 className="text-2xl font-bold text-gray-900">Top Events</h2>
            </div>
            {topEvents.map((event, index) => (
              <EventCard key={event._id} event={event} index={index} isTop />
            ))}
          </div>
        )}

        {/* Other Events */}
        {otherEvents.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">All Events</h2>
            {otherEvents.map((event, index) => (
              <EventCard key={event._id} event={event} index={index} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {topEvents.length === 0 && otherEvents.length === 0 && (
          <div className="doodle-card bg-gradient-to-r from-yellow-100 to-blue-100 border-yellow-500 p-12 text-center">
            <FaCalendarAlt className="text-6xl text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-3">No events yet! 🎊</h2>
            <p className="text-gray-700 font-medium mb-6">Be the first to create an event</p>
            <Link href="/events/create">
              <button className="doodle-button bg-gradient-to-r from-blue-500 to-purple-600 text-white border-blue-700">
                Create Your First Event 🚀
              </button>
            </Link>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
