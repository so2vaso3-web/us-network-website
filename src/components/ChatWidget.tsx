'use client';

import { useState, useEffect, useRef } from 'react';

interface Message {
  id: string;
  visitorId: string;
  name: string;
  email: string;
  message: string;
  timestamp: string;
  isAdmin: boolean;
  read: boolean;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [showNameEmail, setShowNameEmail] = useState(true);
  const [visitorId, setVisitorId] = useState<string>('');
  const [hasWelcomeMessage, setHasWelcomeMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Get or create visitor ID
    if (typeof window !== 'undefined') {
      let vid = localStorage.getItem('visitorId');
      if (!vid) {
        vid = `visitor-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('visitorId', vid);
      }
      setVisitorId(vid);

      // Load messages for this visitor
      const savedMessages = localStorage.getItem('chatMessages');
      if (savedMessages) {
        try {
          const parsed = JSON.parse(savedMessages);
          const visitorMessages = parsed.filter((m: Message) => m.visitorId === vid);
          setMessages(visitorMessages);
          
          // Check if welcome message exists
          const hasWelcome = visitorMessages.some((m: Message) => m.isAdmin && (m.message.includes('Welcome') || m.message.includes('Hello')));
          setHasWelcomeMessage(hasWelcome);
        } catch (e) {
          console.error('Error loading messages:', e);
        }
      }
    }
  }, []);

  useEffect(() => {
    // Add welcome message when chat opens for first time
    if (isOpen && !isMinimized && visitorId && !hasWelcomeMessage && messages.length === 0) {
      const welcomeMessage: Message = {
        id: `welcome-${Date.now()}`,
        visitorId,
        name: 'Support Team',
        email: '',
        message: 'Hello! Welcome to our support chat. How can we help you today?',
        timestamp: new Date().toISOString(),
        isAdmin: true,
        read: false,
      };

      const allMessages = JSON.parse(localStorage.getItem('chatMessages') || '[]');
      allMessages.push(welcomeMessage);
      localStorage.setItem('chatMessages', JSON.stringify(allMessages));
      
      setMessages([welcomeMessage]);
      setHasWelcomeMessage(true);
    }
  }, [isOpen, isMinimized, visitorId, hasWelcomeMessage, messages.length]);

  useEffect(() => {
    // Auto-scroll to bottom when new message
    if (messagesEndRef.current && isOpen && !isMinimized) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized]);

  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    if (showNameEmail && (!name.trim() || !email.trim())) {
      alert('Please enter your name and email first');
      return;
    }

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      visitorId: visitorId,
      name: name || 'Anonymous',
      email: email || '',
      message: message.trim(),
      timestamp: new Date().toISOString(),
      isAdmin: false,
      read: false,
    };

    // Get all messages and add new one
    const allMessages = JSON.parse(localStorage.getItem('chatMessages') || '[]');
    allMessages.push(newMessage);
    localStorage.setItem('chatMessages', JSON.stringify(allMessages));

    // Update local state with visitor's messages
    const visitorMessages = allMessages.filter((m: Message) => m.visitorId === visitorId);
    setMessages(visitorMessages);
    
    setMessage('');
    if (showNameEmail) {
      setShowNameEmail(false);
    }

    // Auto-reply (optional)
    setTimeout(() => {
      const autoReply: Message = {
        id: `msg-${Date.now()}-reply`,
        visitorId: visitorId,
        name: 'Support Team',
        email: '',
        message: 'Thank you for your message! Our support team will respond as soon as possible.',
        timestamp: new Date().toISOString(),
        isAdmin: true,
        read: false,
      };
      
      const allMessages = JSON.parse(localStorage.getItem('chatMessages') || '[]');
      allMessages.push(autoReply);
      localStorage.setItem('chatMessages', JSON.stringify(allMessages));
      
      const visitorMessages = allMessages.filter((m: Message) => m.visitorId === visitorId);
      setMessages(visitorMessages);
    }, 1000);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Chat Button - Fixed Bottom Right */}
      <button
        onClick={() => {
          setIsOpen(true);
          setIsMinimized(false);
        }}
        className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-full shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-110 flex items-center justify-center ${isOpen ? 'hidden' : 'flex'}`}
        aria-label="Open chat"
      >
        <i className="fas fa-comments text-white text-xl sm:text-2xl"></i>
        {(() => {
          if (typeof window !== 'undefined' && visitorId) {
            const allMessages = JSON.parse(localStorage.getItem('chatMessages') || '[]');
            const visitorMessages = allMessages.filter((m: Message) => m.visitorId === visitorId && !m.read && !m.isAdmin);
            if (visitorMessages.length > 0) {
              return (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {visitorMessages.length}
                </span>
              );
            }
          }
          return null;
        })()}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 bg-[#1a1f3a] rounded-lg sm:rounded-xl border border-gray-700 shadow-2xl flex flex-col transition-all duration-300 ${
            isMinimized ? 'w-80 h-12' : 'w-80 sm:w-96 h-[500px] sm:h-[600px]'
          }`}
        >
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-t-lg sm:rounded-t-xl p-3 sm:p-4 flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/20 flex items-center justify-center">
                <i className="fas fa-headset text-white text-sm sm:text-base"></i>
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm sm:text-base">Live Chat Support</h3>
                <p className="text-white/80 text-xs">We&apos;re here to help!</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-white hover:text-white/80 transition-colors w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center"
                aria-label={isMinimized ? 'Maximize' : 'Minimize'}
              >
                <i className={`fas ${isMinimized ? 'fa-window-maximize' : 'fa-window-minimize'} text-sm`}></i>
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-white/80 transition-colors w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center"
                aria-label="Close chat"
              >
                <i className="fas fa-times text-sm sm:text-base"></i>
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-900/50">
                {messages.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <i className="fas fa-comments text-4xl mb-3 opacity-50"></i>
                    <p className="text-sm">No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  <>
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.isAdmin ? 'justify-start' : 'justify-end'}`}
                      >
                        <div
                          className={`max-w-[75%] rounded-lg p-3 ${
                            msg.isAdmin
                              ? 'bg-gray-700 text-white'
                              : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                          }`}
                        >
                          {msg.isAdmin && (
                            <div className="text-xs font-semibold mb-1 opacity-80">{msg.name}</div>
                          )}
                          <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                          <p className="text-xs mt-1 opacity-70">{formatTime(msg.timestamp)}</p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Input Area */}
              <div className="p-3 sm:p-4 border-t border-gray-700 bg-gray-800/50 space-y-3">
                {showNameEmail && (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your Name"
                        className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-400 focus:outline-none focus:border-blue-500"
                      />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Your Email"
                        className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-400 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </>
                )}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Type your message..."
                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                      message.trim()
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                        : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <i className="fas fa-paper-plane"></i>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}

