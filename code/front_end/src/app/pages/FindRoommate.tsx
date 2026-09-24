import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Users, Search, PlusCircle, MapPin, Calendar, MessageSquare, Send, Trash2, Phone, Briefcase, GraduationCap, Filter, UserCheck } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { API_BASE_URL } from '../../config';

interface Reply {
  id: number;
  post_id: number;
  user_id: number;
  replier_name: string;
  message: string;
  created_at: string;
}

interface RoommatePost {
  id: number;
  user_id: number;
  user_name: string;
  user_email?: string;
  user_phone?: string;
  role: 'Student' | 'Working Professional' | 'Other';
  title: string;
  location: string;
  budget: string;
  gender_pref: string;
  description: string;
  contact_info: string;
  created_at: string;
  replies: Reply[];
}

export function FindRoommate() {
  const [posts, setPosts] = useState<RoommatePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [genderFilter, setGenderFilter] = useState('All');

  // New Post Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    role: 'Student',
    location: '',
    budget: '',
    gender_pref: 'Any',
    description: '',
    contact_info: ''
  });

  // Active reply text state by post_id
  const [replyText, setReplyText] = useState<{ [postId: number]: string }>({});
  const [replySubmitting, setReplySubmitting] = useState<{ [postId: number]: boolean }>({});

  const currentUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null;
  const token = localStorage.getItem('token');

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/roommates`);
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (err) {
      console.error("Failed to fetch roommate posts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      alert("Please login to post a roommate request.");
      return;
    }
    if (!newPost.title.trim() || !newPost.location.trim() || !newPost.description.trim()) {
      alert("Please fill in all required fields (Title, Location, Description).");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/roommates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newPost)
      });

      if (res.ok) {
        setNewPost({
          title: '',
          role: 'Student',
          location: '',
          budget: '',
          gender_pref: 'Any',
          description: '',
          contact_info: ''
        });
        setIsDialogOpen(false);
        fetchPosts();
      } else {
        const errData = await res.json();
        alert(`Error: ${errData.error || 'Failed to submit post'}`);
      }
    } catch (err) {
      console.error("Error submitting post:", err);
      alert("Server error occurred while submitting.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendReply = async (postId: number) => {
    const text = replyText[postId];
    if (!token) {
      alert("Please login to reply to this post.");
      return;
    }
    if (!text || !text.trim()) return;

    setReplySubmitting(prev => ({ ...prev, [postId]: true }));
    try {
      const res = await fetch(`${API_BASE_URL}/api/roommates/${postId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: text })
      });

      if (res.ok) {
        setReplyText(prev => ({ ...prev, [postId]: '' }));
        fetchPosts();
      } else {
        const errData = await res.json();
        alert(`Error: ${errData.error || 'Failed to send reply'}`);
      }
    } catch (err) {
      console.error("Error sending reply:", err);
    } finally {
      setReplySubmitting(prev => ({ ...prev, [postId]: false }));
    }
  };

  const handleDeletePost = async (postId: number) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/roommates/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        fetchPosts();
      } else {
        const errData = await res.json();
        alert(`Error: ${errData.error}`);
      }
    } catch (err) {
      console.error("Error deleting post:", err);
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.user_name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === 'All' || post.role === roleFilter;
    const matchesGender = genderFilter === 'All' || post.gender_pref === genderFilter;

    return matchesSearch && matchesRole && matchesGender;
  });

  return (
    <div className="min-h-screen bg-gray-50/50 pb-16">
      {/* Hero Banner Header */}
      <div className="bg-gradient-to-r from-[#125048] to-[#1a7a6e] text-white py-12 px-4 shadow-sm">
        <div className="container mx-auto max-w-5xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-medium backdrop-blur-sm">
              <Users className="w-3.5 h-3.5 text-[#e07b39]" />
              <span>Roommate Finder Community</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold" style={{ fontFamily: "'DM Serif Display', serif" }}>
              Find Your Ideal Roommate
            </h1>
            <p className="text-teal-100 text-sm md:text-base max-w-xl">
              Are you a student or working professional looking for someone to share a boarding place, apartment, or room? Post a request or reply below!
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                size="lg"
                className="gap-2 shadow-lg hover:shadow-xl transition-all font-semibold flex-shrink-0"
                style={{ backgroundColor: '#e07b39', color: 'white', border: 'none' }}
              >
                <PlusCircle className="w-5 h-5" />
                Post Roommate Request
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle style={{ fontFamily: "'DM Serif Display', serif", fontSize: '22px' }}>
                  Post Roommate Request
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleCreatePost} className="space-y-4 py-2">
                <div>
                  <Label htmlFor="post-title">Headline / Title *</Label>
                  <Input
                    id="post-title"
                    placeholder="e.g., Looking for female student roommate near Peradeniya Campus"
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="post-role">I am a...</Label>
                    <Select
                      value={newPost.role}
                      onValueChange={(val) => setNewPost({ ...newPost, role: val as any })}
                    >
                      <SelectTrigger id="post-role">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Student">Student</SelectItem>
                        <SelectItem value="Working Professional">Working Professional</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="post-gender">Gender Preference</Label>
                    <Select
                      value={newPost.gender_pref}
                      onValueChange={(val) => setNewPost({ ...newPost, gender_pref: val })}
                    >
                      <SelectTrigger id="post-gender">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Any">Any</SelectItem>
                        <SelectItem value="Female">Female Only</SelectItem>
                        <SelectItem value="Male">Male Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="post-location">Target Location / Area *</Label>
                    <Input
                      id="post-location"
                      placeholder="e.g., Peradeniya, Kandy"
                      value={newPost.location}
                      onChange={(e) => setNewPost({ ...newPost, location: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="post-budget">Monthly Budget (Rs.)</Label>
                    <Input
                      id="post-budget"
                      placeholder="e.g., Rs. 15,000 / mo"
                      value={newPost.budget}
                      onChange={(e) => setNewPost({ ...newPost, budget: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="post-desc">Description & Preferences *</Label>
                  <Textarea
                    id="post-desc"
                    placeholder="Share details about yourself, preferred move-in date, habits, or specific room details..."
                    rows={4}
                    value={newPost.description}
                    onChange={(e) => setNewPost({ ...newPost, description: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="post-contact">Direct Contact Info (Optional)</Label>
                  <Input
                    id="post-contact"
                    placeholder="e.g., Phone 0771234567 or WhatsApp"
                    value={newPost.contact_info}
                    onChange={(e) => setNewPost({ ...newPost, contact_info: e.target.value })}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full font-semibold mt-2"
                  style={{ backgroundColor: '#1a7a6e', color: 'white' }}
                >
                  {isSubmitting ? 'Publishing Request...' : 'Publish Roommate Request'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Main Container */}
      <div className="container mx-auto max-w-5xl px-4 mt-8 space-y-6">
        {/* Search & Filter Bar */}
        <Card className="shadow-sm border border-teal-950/10 bg-white">
          <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search input */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <Input
                placeholder="Search by area, title, or keywords..."
                className="pl-9 bg-gray-50 border-gray-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filter Selects */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#1a7a6e]" />
                <span className="text-xs font-medium text-gray-500">Role:</span>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-40 h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Roles</SelectItem>
                    <SelectItem value="Student">Student</SelectItem>
                    <SelectItem value="Working Professional">Professional</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-500">Gender Pref:</span>
                <Select value={genderFilter} onValueChange={setGenderFilter}>
                  <SelectTrigger className="w-36 h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Preferences</SelectItem>
                    <SelectItem value="Any">Any</SelectItem>
                    <SelectItem value="Female">Female Only</SelectItem>
                    <SelectItem value="Male">Male Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Posts List */}
        {loading ? (
          <div className="text-center py-16 space-y-3">
            <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-500 text-sm">Loading roommate requests...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <Card className="text-center py-16 px-4 border border-dashed border-gray-300">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-700 mb-1">No Roommate Posts Found</h3>
            <p className="text-sm text-gray-500 mb-4 max-w-md mx-auto">
              {searchQuery || roleFilter !== 'All' || genderFilter !== 'All'
                ? 'Try adjusting your search terms or filters.'
                : 'Be the first to post a request looking for a roommate!'}
            </p>
            <Button
              onClick={() => setIsDialogOpen(true)}
              style={{ backgroundColor: '#1a7a6e', color: 'white' }}
              className="gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              Post Roommate Request
            </Button>
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredPosts.map((post) => {
              const isOwner = currentUser && (currentUser.id === post.user_id || currentUser.role === 'admin');

              return (
                <Card key={post.id} className="shadow-sm border border-gray-200 hover:border-teal-300 transition-all bg-white overflow-hidden">
                  <CardContent className="p-6">
                    {/* Header line: User info + role badge + date */}
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-white shadow-sm flex-shrink-0"
                          style={{ backgroundColor: post.role === 'Working Professional' ? '#2a9d8f' : '#1a7a6e' }}
                        >
                          {post.user_name ? post.user_name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-semibold text-gray-900 leading-none">{post.user_name}</h4>
                            <span
                              className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold flex items-center gap-1"
                              style={
                                post.role === 'Working Professional'
                                  ? { backgroundColor: '#e6f4f1', color: '#1a7a6e' }
                                  : { backgroundColor: '#fdf0e8', color: '#e07b39' }
                              }
                            >
                              {post.role === 'Working Professional' ? (
                                <Briefcase className="w-3 h-3" />
                              ) : (
                                <GraduationCap className="w-3 h-3" />
                              )}
                              {post.role}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Posted {new Date(post.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {/* Action buttons on top right */}
                      <div className="flex items-center gap-2">
                        {currentUser && currentUser.id !== post.user_id && (
                          <Link to={`/chat/${post.user_id}`}>
                            <Button size="sm" variant="outline" className="gap-1.5 text-xs text-teal-700 border-teal-200 hover:bg-teal-50">
                              <MessageSquare className="w-3.5 h-3.5" />
                              Private Message
                            </Button>
                          </Link>
                        )}
                        {isOwner && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1.5 h-8 w-8"
                            onClick={() => handleDeletePost(post.id)}
                            title="Delete post"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Post Title */}
                    <h3 className="text-lg font-semibold text-gray-900 mb-3" style={{ color: '#0d1f1d' }}>
                      {post.title}
                    </h3>

                    {/* Meta Chips (Location, Budget, Gender Preference) */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-700">
                        <MapPin className="w-3.5 h-3.5 text-teal-600" />
                        {post.location}
                      </span>
                      {post.budget && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-amber-50 text-amber-800 border border-amber-100">
                          <span>Budget: {post.budget}</span>
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-teal-50 text-teal-800 border border-teal-100">
                        <UserCheck className="w-3.5 h-3.5 text-teal-600" />
                        Prefers: {post.gender_pref}
                      </span>
                      {post.contact_info && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                          <Phone className="w-3.5 h-3.5 text-blue-600" />
                          {post.contact_info}
                        </span>
                      )}
                    </div>

                    {/* Post Description */}
                    <p className="text-gray-700 text-sm whitespace-pre-line leading-relaxed mb-6 bg-gray-50/70 p-3.5 rounded-lg border border-gray-100">
                      {post.description}
                    </p>

                    {/* Replies / Comments Section */}
                    <div className="border-t border-gray-100 pt-4 space-y-3">
                      <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-[#1a7a6e]" />
                        Replies ({post.replies?.length || 0})
                      </h5>

                      {/* List of Replies */}
                      {post.replies && post.replies.length > 0 && (
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                          {post.replies.map((reply) => (
                            <div key={reply.id} className="bg-teal-50/40 p-3 rounded-lg border border-teal-100/60 text-xs">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-semibold text-teal-900">{reply.replier_name}</span>
                                <span className="text-[10px] text-gray-400">
                                  {new Date(reply.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className="text-gray-700">{reply.message}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Reply Input Box */}
                      <div className="flex gap-2 pt-1">
                        <Input
                          placeholder={token ? "Write a public reply..." : "Please login to reply..."}
                          className="text-xs h-9 bg-gray-50 border-gray-200 focus:bg-white"
                          value={replyText[post.id] || ''}
                          disabled={!token || replySubmitting[post.id]}
                          onChange={(e) => setReplyText({ ...replyText, [post.id]: e.target.value })}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendReply(post.id);
                            }
                          }}
                        />
                        <Button
                          size="sm"
                          className="h-9 px-3 gap-1 font-semibold text-xs flex-shrink-0"
                          style={{ backgroundColor: '#1a7a6e', color: 'white' }}
                          disabled={!token || !replyText[post.id]?.trim() || replySubmitting[post.id]}
                          onClick={() => handleSendReply(post.id)}
                        >
                          <Send className="w-3.5 h-3.5" />
                          Reply
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
