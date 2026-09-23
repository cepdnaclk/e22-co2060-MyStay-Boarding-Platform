import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Send, User, MessageSquare, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import { API_BASE_URL } from '../../config';

interface Conversation {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  lastMessage: string;
  lastMessageTime: string;
}

interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  message_text: string;
  created_at: string;
}

export function Chat() {
  const { receiverId } = useParams();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [activeContact, setActiveContact] = useState<{ id: number; name: string; role: string } | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
  const token = localStorage.getItem('token');

  // Redirect if not logged in
  useEffect(() => {
    if (!token || !currentUser) {
      alert("Please login to access messages.");
      navigate('/login');
    }
  }, [token, currentUser, navigate]);

  // Fetch active conversations list
  const fetchConversations = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/messages/conversations`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setConversations(data);

        // If we have a receiverId in URL, and it is in our conversations list, set it as active contact
        if (receiverId) {
          const contact = data.find((c: Conversation) => c.id === Number(receiverId));
          if (contact) {
            setActiveContact({ id: contact.id, name: contact.name, role: contact.role });
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    }
  };

  // Fetch single user details if receiverId is not in conversations list
  const fetchActiveContactInfo = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/users/${id}`);
      if (response.ok) {
        const data = await response.json();
        setActiveContact({ id: data.id, name: data.name, role: data.role });
      }
    } catch (error) {
      console.error('Failed to fetch contact info:', error);
    }
  };

  // Fetch conversation history
  const fetchHistory = async (otherUserId: number) => {
    setIsLoadingHistory(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/messages/history/${otherUserId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Failed to fetch chat history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeContact) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          receiver_id: activeContact.id,
          message_text: inputText.trim()
        })
      });

      if (response.ok) {
        const data = await response.json();
        const newMsg: Message = {
          id: data.messageId,
          sender_id: currentUser.id,
          receiver_id: activeContact.id,
          message_text: inputText.trim(),
          created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, newMsg]);
        setInputText('');
        fetchConversations(); // Update list to show latest message preview
      } else {
        alert("Failed to send message.");
      }
    } catch (error) {
      console.error('Send error:', error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchConversations();
    }
  }, [token]);

  // Handle route change of receiverId
  useEffect(() => {
    if (receiverId && token) {
      const rId = Number(receiverId);
      // Fetch details if we don't have it in active contact or if it mismatch
      if (!activeContact || activeContact.id !== rId) {
        const existing = conversations.find(c => c.id === rId);
        if (existing) {
          setActiveContact({ id: existing.id, name: existing.name, role: existing.role });
        } else {
          fetchActiveContactInfo(receiverId);
        }
      }
      fetchHistory(rId);
    } else {
      setActiveContact(null);
      setMessages([]);
    }
  }, [receiverId, conversations, token]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Poll for new messages every 5 seconds
  useEffect(() => {
    if (!activeContact || !token) return;

    const interval = setInterval(() => {
      fetchHistory(activeContact.id);
    }, 5000);

    return () => clearInterval(interval);
  }, [activeContact, token]);

  if (!currentUser) return null;

  return (
    <div className="min-h-[calc(100vh-130px)] flex bg-[#f7fafa]">
      <div className="container mx-auto px-4 py-6 max-w-6xl flex gap-6">
        
        {/* Left conversations list */}
        <div className={`w-full md:w-80 flex-shrink-0 flex flex-col bg-white rounded-2xl border border-teal-50 shadow-sm overflow-hidden ${receiverId ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b border-teal-50 flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: '#0d1f1d' }}>
              <MessageSquare className="w-5 h-5" style={{ color: '#1a7a6e' }} />
              Conversations
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-teal-50/50">
            {conversations.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">
                No conversations yet. Start chatting from a listing detail page!
              </div>
            ) : (
              conversations.map((c) => {
                const isActive = activeContact?.id === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => navigate(`/chat/${c.id}`)}
                    className="p-4 cursor-pointer transition-all hover:bg-teal-50/30 flex items-center gap-3"
                    style={isActive ? { backgroundColor: '#e8f5f3' } : {}}
                  >
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0" style={{ backgroundColor: '#1a7a6e' }}>
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <h4 className="font-semibold text-sm truncate" style={{ color: '#0d1f1d' }}>{c.name}</h4>
                        <span className="text-[10px] text-gray-400">
                          {new Date(c.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate">{c.lastMessage}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right chat panel */}
        <div className={`flex-1 flex flex-col bg-white rounded-2xl border border-teal-50 shadow-sm overflow-hidden ${!receiverId ? 'hidden md:flex justify-center items-center text-gray-400 p-8' : 'flex'}`}>
          {!activeContact ? (
            <div className="text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300 animate-pulse" />
              <h3 className="text-base font-semibold text-gray-700">Your Chatroom</h3>
              <p className="text-sm mt-1">Select a conversation or navigate to a stay detail page to message the landlord.</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="p-4 border-b border-teal-50 flex items-center gap-3">
                <button onClick={() => navigate('/chat')} className="md:hidden p-1.5 rounded-lg hover:bg-teal-50 text-gray-600 transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0" style={{ backgroundColor: '#1a7a6e' }}>
                  {activeContact.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-sm" style={{ color: '#0d1f1d' }}>{activeContact.name}</h3>
                  <span className="text-xs capitalize px-2 py-0.5 rounded-full inline-block mt-0.5" style={{ backgroundColor: '#e8f5f3', color: '#1a7a6e' }}>
                    {activeContact.role}
                  </span>
                </div>
              </div>

              {/* Message log */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#fafcfc]">
                {isLoadingHistory && messages.length === 0 ? (
                  <div className="text-center text-gray-400 text-sm py-8 animate-pulse">Loading history...</div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-gray-400 text-xs py-8">
                    Send a message to start this private chat.
                  </div>
                ) : (
                  messages.map((m) => {
                    const isOwn = m.sender_id === currentUser.id;
                    return (
                      <div key={m.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 shadow-sm text-sm ${
                          isOwn 
                            ? 'bg-[#1a7a6e] text-white rounded-tr-none' 
                            : 'bg-white text-gray-800 rounded-tl-none border border-teal-50/70'
                        }`}>
                          <p className="leading-relaxed break-words">{m.message_text}</p>
                          <span className={`text-[9px] block text-right mt-1.5 ${isOwn ? 'text-teal-100' : 'text-gray-400'}`}>
                            {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input section */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-teal-50 flex gap-2">
                <Input
                  type="text"
                  placeholder="Type a message..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 border-teal-100 focus-visible:ring-1 focus-visible:ring-[#1a7a6e]"
                  required
                />
                <Button type="submit" size="icon" style={{ backgroundColor: '#1a7a6e', color: 'white', border: 'none' }}>
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
