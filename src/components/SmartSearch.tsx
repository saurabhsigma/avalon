'use client';

import { useState } from 'react';
import { FaSearch, FaSpinner, FaBook, FaVideo, FaImage, FaLink } from 'react-icons/fa';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

interface SearchResult {
  _id: string;
  title: string;
  description: string;
  type: string;
  url: string;
  thumbnail?: string;
  relevanceScore: number;
  subjectId?: {
    name: string;
    color: string;
  };
  uploadedBy?: {
    name: string;
  };
  createdAt: string;
}

const typeIcons = {
  pdf: FaBook,
  video: FaVideo,
  image: FaImage,
  link: FaLink,
};

const typeColors = {
  pdf: 'bg-red-100 text-red-700',
  video: 'bg-blue-100 text-blue-700',
  image: 'bg-green-100 text-green-700',
  link: 'bg-purple-100 text-purple-700',
};

export default function SmartSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || loading) return;

    setLoading(true);
    setSearched(true);

    try {
      const res = await fetch('/api/materials/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, limit: 10 }),
      });

      if (res.ok) {
        const data = await res.json();
        setResults(data.results || []);
      } else {
        console.error('Search failed');
        setResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Search Bar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FaSearch className="text-purple-500" />
            Smart Material Search
            <Badge variant="outline" className="ml-2">Powered by Pinecone</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              type="text"
              placeholder="Search for topics, concepts, or keywords..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={loading || !query.trim()}>
              {loading ? (
                <FaSpinner className="animate-spin" />
              ) : (
                <FaSearch />
              )}
              <span className="ml-2">Search</span>
            </Button>
          </form>
          <p className="text-sm text-gray-500 mt-2">
            Use natural language to find relevant study materials using AI-powered semantic search
          </p>
        </CardContent>
      </Card>

      {/* Search Results */}
      {searched && (
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <FaSpinner className="animate-spin text-4xl text-purple-500" />
            </div>
          ) : results.length > 0 ? (
            <>
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">
                  Found {results.length} relevant material{results.length !== 1 ? 's' : ''}
                </h3>
                <Badge variant="secondary">
                  Sorted by Relevance
                </Badge>
              </div>
              
              <div className="grid gap-4">
                {results.map((result) => {
                  const Icon = typeIcons[result.type as keyof typeof typeIcons] || FaBook;
                  const typeColor = typeColors[result.type as keyof typeof typeColors] || 'bg-gray-100 text-gray-700';
                  
                  return (
                    <Card key={result._id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          {/* Thumbnail or Icon */}
                          <div className="flex-shrink-0">
                            {result.thumbnail ? (
                              <img
                                src={result.thumbnail}
                                alt={result.title}
                                className="w-20 h-20 rounded-lg object-cover"
                              />
                            ) : (
                              <div className={`w-20 h-20 rounded-lg ${typeColor} flex items-center justify-center`}>
                                <Icon className="text-2xl" />
                              </div>
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <h4 className="font-semibold text-lg truncate">{result.title}</h4>
                              <div className="flex items-center gap-2">
                                <Badge className={typeColor}>
                                  {result.type.toUpperCase()}
                                </Badge>
                                <Badge variant="outline" className="whitespace-nowrap">
                                  {Math.round((result.relevanceScore || 0) * 100)}% match
                                </Badge>
                              </div>
                            </div>

                            {result.description && (
                              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                {result.description}
                              </p>
                            )}

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 text-sm text-gray-500">
                                {result.subjectId && (
                                  <Badge
                                    variant="secondary"
                                    style={{
                                      backgroundColor: result.subjectId.color + '20',
                                      color: result.subjectId.color,
                                    }}
                                  >
                                    {result.subjectId.name}
                                  </Badge>
                                )}
                                {result.uploadedBy && (
                                  <span>by {result.uploadedBy.name}</span>
                                )}
                              </div>

                              <Button
                                size="sm"
                                onClick={() => window.open(result.url, '_blank')}
                              >
                                Open Material
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <FaSearch className="text-4xl text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No materials found</h3>
                <p className="text-gray-500">
                  Try different keywords or broader search terms
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
