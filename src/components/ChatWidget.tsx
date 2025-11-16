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
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isLoadingRef = useRef(false); // Track xem có request đang pending không để tránh race condition

  // Load messages from server and sync
  const loadMessages = async () => {
    if (!visitorId) return;
    
    // Tránh race condition: Nếu có request đang pending, skip
    if (isLoadingRef.current) {
      return;
    }
    
    isLoadingRef.current = true;
    
    try {
      // Load from server first
      const response = await fetch(`/api/chat?t=${Date.now()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
        cache: 'no-store',
      });

      let allMessages: Message[] = [];
      let serverMessages: Message[] = [];
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.messages)) {
          serverMessages = data.messages;
        }
      }
      
      // MERGE với localStorage để không mất tin nhắn mới vừa gửi (SỬA: Tránh mất tin nhắn khi spam)
      if (typeof window !== 'undefined') {
        const localMessages = JSON.parse(localStorage.getItem('chatMessages') || '[]');
        if (Array.isArray(localMessages) && localMessages.length > 0) {
          // Merge: Ưu tiên server, nhưng giữ lại local nếu local mới hơn (để giữ tin nhắn vừa gửi)
          const messageMap = new Map<string, Message>();
          
          // Thêm messages từ server trước (ưu tiên)
          serverMessages.forEach((m: Message) => {
            messageMap.set(m.id, m);
          });
          
          // Thêm messages từ local nếu chưa có trong server HOẶC local mới hơn (để giữ tin nhắn vừa gửi)
          localMessages.forEach((m: Message) => {
            const existing = messageMap.get(m.id);
            if (!existing) {
              // Chưa có trong server, thêm vào (tin nhắn mới vừa gửi)
              messageMap.set(m.id, m);
            } else {
              // Có trong cả 2, so sánh timestamp để giữ bản mới hơn
              const localTime = new Date(m.timestamp).getTime();
              const serverTime = new Date(existing.timestamp).getTime();
              if (localTime > serverTime) {
                // Local mới hơn (tin nhắn vừa gửi), giữ lại
                messageMap.set(m.id, m);
              }
            }
          });
          
          // Convert map to array
          allMessages = Array.from(messageMap.values());
          
          // Update localStorage với merged data
          localStorage.setItem('chatMessages', JSON.stringify(allMessages));
        } else {
          // Không có trong localStorage, dùng server
          allMessages = serverMessages;
          if (allMessages.length > 0) {
            localStorage.setItem('chatMessages', JSON.stringify(allMessages));
          }
        }
      } else {
        // Không có localStorage, dùng server
        allMessages = serverMessages;
      }
      
      // Fallback: Load from localStorage nếu server không có và localStorage cũng rỗng
      if (allMessages.length === 0 && typeof window !== 'undefined') {
        const saved = localStorage.getItem('chatMessages');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            allMessages = Array.isArray(parsed) ? parsed : [];
          } catch (e) {
            console.error('Error parsing localStorage:', e);
          }
        }
      }
      
      // Filter messages for this visitor
      let visitorMessages = allMessages.filter((m: Message) => m.visitorId === visitorId);
      
      // Remove duplicate welcome messages - CHỈ GIỮ LẠI 1 WELCOME MESSAGE
      const welcomeMessages = visitorMessages.filter((m: Message) => 
        m.isAdmin && 
        (m.id?.startsWith('welcome-') || m.message?.includes('Welcome to our support chat'))
      );
      
      if (welcomeMessages.length > 1) {
        // Giữ lại welcome message đầu tiên, xóa các cái còn lại
        const firstWelcome = welcomeMessages[0];
        visitorMessages = visitorMessages.filter((m: Message) => 
          !(m.isAdmin && (m.id?.startsWith('welcome-') || m.message?.includes('Welcome to our support chat'))) || m.id === firstWelcome.id
        );
        
        // Update localStorage
        const updatedAllMessages = allMessages.filter((m: Message) => 
          !(m.visitorId === visitorId && m.isAdmin && (m.id?.startsWith('welcome-') || m.message?.includes('Welcome to our support chat'))) || m.id === firstWelcome.id
        );
        localStorage.setItem('chatMessages', JSON.stringify(updatedAllMessages));
        
        // Save to server
        fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ messages: updatedAllMessages }),
        }).catch(err => console.error('Failed to remove duplicate welcome messages:', err));
      }
      
      // Đảm bảo welcome message được đánh dấu là read
      visitorMessages = visitorMessages.map((m: Message) => {
        if (m.isAdmin && (m.id?.startsWith('welcome-') || m.message?.includes('Welcome to our support chat'))) {
          return { ...m, read: true };
        }
        return m;
      });
      
      // Sort by timestamp
      visitorMessages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      
      // Update state only if changed - SỬA LOGIC SO SÁNH ĐỂ TRÁNH FLICKER (CẢI THIỆN)
      setMessages(prev => {
        // So sánh sâu để tránh update không cần thiết - SỬA: So sánh theo ID map thay vì index
        if (prev.length !== visitorMessages.length) {
          return visitorMessages;
        }
        
        // Tạo map từ prev để so sánh nhanh hơn và chính xác hơn
        const prevMap = new Map(prev.map(m => [m.id, m]));
        
        // So sánh từng message theo ID - chính xác hơn so với so sánh theo index
        const hasChanges = visitorMessages.some(curr => {
          const prevMsg = prevMap.get(curr.id);
          if (!prevMsg) return true; // Message mới
          
          // So sánh tất cả các trường quan trọng
          return prevMsg.message !== curr.message || 
                 prevMsg.read !== curr.read ||
                 prevMsg.timestamp !== curr.timestamp ||
                 prevMsg.isAdmin !== curr.isAdmin ||
                 prevMsg.name !== curr.name ||
                 prevMsg.email !== curr.email;
        });
        
        // Chỉ update khi có thay đổi thực sự
        if (!hasChanges) {
          return prev; // Giữ nguyên state cũ để tránh flicker
        }
        
        return visitorMessages;
      });
      
      // Check if welcome message exists
      const hasWelcome = visitorMessages.some((m: Message) => 
        m.isAdmin && 
        (m.id?.startsWith('welcome-') || m.message?.includes('Welcome to our support chat'))
      );
      setHasWelcomeMessage(hasWelcome);
    } catch (error) {
      console.error('Error loading messages:', error);
      // Fallback to localStorage
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('chatMessages');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            const visitorMessages = parsed.filter((m: Message) => m.visitorId === visitorId);
            setMessages(visitorMessages);
          } catch (e) {
            console.error('Error loading from localStorage:', e);
          }
        }
      }
    } finally {
      // Reset loading flag sau khi hoàn thành (dù thành công hay thất bại)
      isLoadingRef.current = false;
    }
  };

  useEffect(() => {
    // Get or create visitor ID
    if (typeof window !== 'undefined') {
      let vid = localStorage.getItem('visitorId');
      if (!vid) {
        vid = `visitor-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('visitorId', vid);
      }
      setVisitorId(vid);
    }
  }, []);

  useEffect(() => {
    // Load messages when visitorId is ready
    if (visitorId) {
      loadMessages();
      
      // Polling để nhận tin nhắn mới từ admin (SỬA: Giảm xuống 1 giây để nhanh hơn)
      const interval = setInterval(loadMessages, 1000);
      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visitorId]);

  useEffect(() => {
    // Add welcome message when chat opens for first time - CHỈ 1 LẦN
    if (isOpen && !isMinimized && visitorId && !hasWelcomeMessage) {
      // Check if welcome message already exists
      const allMessages = JSON.parse(localStorage.getItem('chatMessages') || '[]');
      const existingWelcome = allMessages.find((m: Message) => 
        m.visitorId === visitorId && 
        m.isAdmin && 
        (m.id?.startsWith('welcome-') || m.message?.includes('Welcome to our support chat'))
      );
      
      if (!existingWelcome) {
        const welcomeMessage: Message = {
          id: `welcome-${visitorId}`,
          visitorId,
          name: 'Support Team',
          email: '',
          message: '👋 Hello! Welcome to our support chat. We\'re here to help you with any questions or concerns. How can we assist you today?',
          timestamp: new Date().toISOString(),
          isAdmin: true,
          read: true, // Welcome message is always read
        };

        allMessages.push(welcomeMessage);
        localStorage.setItem('chatMessages', JSON.stringify(allMessages));
        
        // Update local messages
        const visitorMessages = allMessages.filter((m: Message) => m.visitorId === visitorId);
        visitorMessages.sort((a: Message, b: Message) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        setMessages(visitorMessages);
        setHasWelcomeMessage(true);
        
        // Save to server
        fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ messages: allMessages }),
        }).catch(err => console.error('Failed to save welcome message:', err));
      } else {
        // Welcome message already exists, just mark as read
        setHasWelcomeMessage(true);
      }
    }
  }, [isOpen, isMinimized, visitorId, hasWelcomeMessage]);

  useEffect(() => {
    // Auto-scroll to bottom when new message
    if (messagesEndRef.current && isOpen && !isMinimized) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized]);

  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    if (showNameEmail && (!name.trim() || !email.trim())) {
      setAlertMessage('Please enter your name and email first');
      setShowAlert(true);
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

    // Update local state immediately (optimistic update) - SỬA: Sort messages trước khi update
    const visitorMessages = allMessages.filter((m: Message) => m.visitorId === visitorId);
    visitorMessages.sort((a: Message, b: Message) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    // Force update ngay lập tức, không cần so sánh vì đây là tin nhắn mới vừa gửi
    setMessages(visitorMessages);
    
    setMessage('');
    if (showNameEmail) {
      setShowNameEmail(false);
    }

    // Save to server và reload ngay sau khi save thành công (SỬA: Check ngay lập tức)
    fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages: allMessages }),
    })
    .then(() => {
      // Reload messages ngay sau khi save thành công để nhận tin nhắn mới từ admin
      setTimeout(() => {
        loadMessages();
      }, 300); // Giảm thời gian chờ xuống 300ms
    })
    .catch(err => console.error('Failed to save message to server:', err));

    // Send Telegram notification for new chat message (non-blocking)
    fetch('/api/telegram', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: newMessage.name,
        email: newMessage.email,
        message: newMessage.message,
        visitorId: newMessage.visitorId,
        isReply: false,
      }),
    }).catch(err => console.error('Failed to send Telegram notification:', err));

    // Auto-reply (optional) - removed, admin will reply manually
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
        className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-16 h-16 sm:w-18 sm:h-18 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center group backdrop-blur-sm border-2 border-white/20 ${isOpen ? 'hidden' : 'flex'} animate-bounce-slow`}
        aria-label="Open chat"
        style={{
          boxShadow: '0 10px 40px rgba(99, 102, 241, 0.4), 0 0 20px rgba(168, 85, 247, 0.2)',
          animation: 'float 3s ease-in-out infinite, pulse-glow 2s ease-in-out infinite',
        }}
      >
        {/* Pulsing ring effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-30 transition-opacity duration-300 animate-ping"></div>
        
        {/* Rotating gradient ring */}
        <div 
          className="absolute inset-0 rounded-full opacity-20"
          style={{
            background: 'conic-gradient(from 0deg, rgba(99, 102, 241, 0.8), rgba(168, 85, 247, 0.8), rgba(236, 72, 153, 0.8), rgba(99, 102, 241, 0.8))',
            animation: 'spin 3s linear infinite',
          }}
        ></div>
        
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-40 blur-xl transition-opacity duration-300"></div>
        
        {/* Main icon with animation - Modern chat icon */}
        <svg className="w-7 h-7 sm:w-8 sm:h-8 text-white relative z-10 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" fill="currentColor" opacity="0.9"/>
          <circle cx="8" cy="10" r="1.5" fill="white"/>
          <circle cx="12" cy="10" r="1.5" fill="white"/>
          <circle cx="16" cy="10" r="1.5" fill="white"/>
        </svg>
        
        {/* Notification badge with pulse animation - CHỈ HIỆN KHI CÓ TIN NHẮN MỚI TỪ ADMIN (KHÔNG PHẢI WELCOME) */}
        {(() => {
          if (typeof window !== 'undefined' && visitorId) {
            const allMessages = JSON.parse(localStorage.getItem('chatMessages') || '[]');
            // Chỉ đếm tin nhắn từ admin, chưa đọc, và KHÔNG PHẢI welcome message
            const unreadAdminMessages = allMessages.filter((m: Message) => 
              m.visitorId === visitorId && 
              m.isAdmin && 
              !m.read &&
              !m.id?.startsWith('welcome-') &&
              !m.message?.includes('Welcome to our support chat')
            );
            if (unreadAdminMessages.length > 0) {
              return (
                <span 
                  className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg border-2 border-white/30 animate-pulse"
                  style={{
                    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                  }}
                >
                  {unreadAdminMessages.length}
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
          className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl sm:rounded-3xl border border-gray-700/50 shadow-2xl backdrop-blur-xl flex flex-col transition-all duration-300 animate-in slide-in-from-bottom-5 ${
            isMinimized ? 'w-[calc(100vw-2rem)] sm:w-80 h-14' : 'w-[calc(100vw-2rem)] sm:w-96 md:w-[420px] h-[580px] sm:h-[620px] md:h-[650px] max-w-[95vw] sm:max-w-none'
          }`}
          style={{
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(99, 102, 241, 0.1)',
          }}
        >
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-t-2xl sm:rounded-t-3xl p-4 sm:p-5 flex items-center justify-between relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/90 via-purple-600/90 to-pink-600/90 backdrop-blur-sm"></div>
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-purple-300 rounded-full blur-3xl"></div>
            </div>
            <div className="flex items-center gap-3 sm:gap-4 relative z-10">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 backdrop-blur-md border-2 border-white/30 flex items-center justify-center shadow-lg">
                <i className="fas fa-headset text-white text-lg sm:text-xl"></i>
              </div>
              <div>
                <h3 className="text-white font-bold text-base sm:text-lg drop-shadow-lg">Live Chat Support</h3>
                <p className="text-white/90 text-xs sm:text-sm font-medium">We&apos;re here to help!</p>
              </div>
            </div>
            <div className="flex items-center gap-2 relative z-10">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-white hover:text-white/80 hover:bg-white/10 transition-all duration-200 w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center backdrop-blur-sm"
                aria-label={isMinimized ? 'Maximize' : 'Minimize'}
              >
                <i className={`fas ${isMinimized ? 'fa-window-maximize' : 'fa-window-minimize'} text-sm`}></i>
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-white/80 hover:bg-white/10 transition-all duration-200 w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center backdrop-blur-sm"
                aria-label="Close chat"
              >
                <i className="fas fa-times text-sm sm:text-base"></i>
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-gradient-to-b from-gray-900/95 to-gray-800/95 backdrop-blur-sm">
                {messages.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
                      <i className="fas fa-comments text-3xl text-indigo-400 opacity-60"></i>
                    </div>
                    <p className="text-sm font-medium">No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  <>
                    {messages.map((msg, index) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.isAdmin ? 'justify-start' : 'justify-end'} animate-in fade-in slide-in-from-bottom-2`}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div
                          className={`max-w-[80%] sm:max-w-[75%] rounded-2xl p-4 shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-[1.02] ${
                            msg.isAdmin
                              ? 'bg-gradient-to-br from-gray-700/90 to-gray-800/90 text-white border border-gray-600/50'
                              : 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white border border-purple-400/30'
                          }`}
                        >
                          {msg.isAdmin && (
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center">
                                <i className="fas fa-user-shield text-xs text-white"></i>
                              </div>
                              <span className="text-xs font-bold text-gray-300 uppercase tracking-wide">{msg.name}</span>
                            </div>
                          )}
                          <p className="text-sm sm:text-base whitespace-pre-wrap break-words leading-relaxed">{msg.message}</p>
                          <p className={`text-xs mt-2 ${msg.isAdmin ? 'text-gray-400' : 'text-white/70'}`}>
                            {formatTime(msg.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Input Area */}
              <div className="p-4 sm:p-5 border-t border-gray-700/50 bg-gradient-to-b from-gray-800/80 to-gray-900/80 backdrop-blur-sm space-y-3 rounded-b-2xl sm:rounded-b-3xl">
                {showNameEmail && (
                  <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-bottom-2">
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <i className="fas fa-user text-sm"></i>
                      </div>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your Name"
                        className="w-full pl-10 pr-4 py-3 bg-gray-700/80 border border-gray-600/50 rounded-xl text-white text-sm placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 backdrop-blur-sm"
                      />
                    </div>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <i className="fas fa-envelope text-sm"></i>
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Your Email"
                        className="w-full pl-10 pr-4 py-3 bg-gray-700/80 border border-gray-600/50 rounded-xl text-white text-sm placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 backdrop-blur-sm"
                      />
                    </div>
                  </div>
                )}
                <div className="flex gap-3">
                  <div className="flex-1 relative">
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
                      className="w-full px-4 py-3 pr-12 bg-gray-700/80 border border-gray-600/50 rounded-xl text-white text-sm placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 backdrop-blur-sm"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <i className="fas fa-smile text-sm"></i>
                    </div>
                  </div>
                  <button
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                    className={`px-5 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg backdrop-blur-sm ${
                      message.trim()
                        ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 hover:scale-105 active:scale-95 border border-purple-400/30'
                        : 'bg-gray-700/50 text-gray-500 cursor-not-allowed border border-gray-600/30'
                    }`}
                  >
                    <i className="fas fa-paper-plane text-base"></i>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Alert Modal */}
      {showAlert && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
          onClick={() => setShowAlert(false)}
        >
          <div 
            className="bg-[#1a1f3a] rounded-xl p-6 max-w-md w-full border border-gray-700 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                <i className="fas fa-exclamation-triangle text-yellow-400 text-xl"></i>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-1">Notice</h3>
                <p className="text-gray-300 text-sm">{alertMessage}</p>
              </div>
            </div>
            <button
              onClick={() => setShowAlert(false)}
              className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-lg font-semibold hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 transition-all duration-300 flex items-center justify-center gap-2 text-white min-h-[44px]"
            >
              <i className="fas fa-check"></i>
              <span>OK</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}

