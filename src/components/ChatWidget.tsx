'use client';

import { useState, useEffect, useRef } from 'react';
import Toast from './Toast';

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
  const [hasAutoReply, setHasAutoReply] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Get or create visitor ID - ĐẢM BẢO KHÔNG THAY ĐỔI
    if (typeof window !== 'undefined') {
      let vid = localStorage.getItem('visitorId');
      if (!vid || vid.trim() === '') {
        vid = `visitor-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('visitorId', vid);
      }
      // Chỉ set nếu chưa có hoặc khác
      if (!visitorId || vid !== visitorId) {
        setVisitorId(vid);
      }

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
          
          // Check if auto-reply already sent (chỉ gửi 1 lần)
          const hasAutoReplySent = visitorMessages.some((m: Message) => 
            m.isAdmin && 
            m.message.includes('Thank you for your message! Our support team will respond as soon as possible.')
          );
          setHasAutoReply(hasAutoReplySent);
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

  // Polling để nhận reply từ admin - chạy cả khi chat đóng để nhận notification
  useEffect(() => {
    if (!visitorId) return;

    const loadMessagesFromServer = async () => {
      try {
        const response = await fetch(`/api/chat?t=${Date.now()}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
          },
          cache: 'no-store',
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && Array.isArray(data.messages)) {
            // MERGE với localStorage để không mất messages
            const localMessages = JSON.parse(localStorage.getItem('chatMessages') || '[]');
            const serverMessages = data.messages;
            
            // Merge: Ưu tiên server, nhưng giữ lại messages local nếu server không có
            const messageMap = new Map<string, Message>();
            
            // Thêm messages từ server trước (ưu tiên)
            serverMessages.forEach((m: Message) => {
              messageMap.set(m.id, m);
            });
            
            // Thêm messages từ local nếu chưa có trong server (fallback)
            localMessages.forEach((m: Message) => {
              if (m.visitorId === visitorId && !messageMap.has(m.id)) {
                messageMap.set(m.id, m);
              }
            });
            
            // Convert map to array và update localStorage
            const mergedMessages = Array.from(messageMap.values());
            localStorage.setItem('chatMessages', JSON.stringify(mergedMessages));
            
            // Filter messages for this visitor và đảm bảo isAdmin đúng
            const visitorMessages = mergedMessages
              .filter((m: Message) => m.visitorId === visitorId)
              .map((m: Message) => {
                // Đảm bảo logic isAdmin đúng:
                // - Nếu message có name là 'Admin' hoặc 'Support Team' → isAdmin: true
                // - Nếu message có name khác → isAdmin: false (khách hàng)
                const isAdminMessage = m.name === 'Admin' || m.name === 'Support Team';
                return {
                  ...m,
                  isAdmin: isAdminMessage ? true : false, // Force correct isAdmin value
                };
              });
            
            // Always update messages từ merged data để đảm bảo sync
            setMessages(prevMessages => {
              // Check if there are new messages (admin replies)
              const currentMessageIds = new Set(prevMessages.map(m => m.id));
              const newMessages = visitorMessages.filter((m: Message) => !currentMessageIds.has(m.id));
              
              if (newMessages.length > 0) {
                // Show notification if chat is minimized or closed
                if (isMinimized || !isOpen) {
                  setToast({ 
                    message: `You have ${newMessages.length} new message(s)`, 
                    type: 'info' 
                  });
                }
              }
              
              // LUÔN update từ merged data để đảm bảo sync đúng
              // Sort by timestamp để đảm bảo thứ tự đúng
              const sorted = [...visitorMessages].sort((a, b) => 
                new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
              );
              
              return sorted;
            });
          }
        } else {
          console.error('Failed to load messages:', response.status, response.statusText);
          // Fallback: Load từ localStorage nếu server fail
          const localMessages = JSON.parse(localStorage.getItem('chatMessages') || '[]');
          const visitorMessages = localMessages.filter((m: Message) => m.visitorId === visitorId);
          if (visitorMessages.length > 0) {
            setMessages(visitorMessages);
          }
        }
      } catch (error) {
        console.error('Error loading messages from server:', error);
        // Fallback: Load từ localStorage nếu có lỗi
        const localMessages = JSON.parse(localStorage.getItem('chatMessages') || '[]');
        const visitorMessages = localMessages.filter((m: Message) => m.visitorId === visitorId);
        if (visitorMessages.length > 0) {
          setMessages(visitorMessages);
        }
      }
    };

    // Load immediately
    loadMessagesFromServer();

    // Poll every 2 seconds (chạy cả khi chat đóng để nhận notification)
    const interval = setInterval(loadMessagesFromServer, 2000);
    return () => clearInterval(interval);
  }, [visitorId, isOpen, isMinimized]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    if (showNameEmail && (!name.trim() || !email.trim())) {
      setToast({ message: 'Please enter your name and email first', type: 'warning' });
      return;
    }

    const newMessage: Message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      visitorId: visitorId,
      name: name || 'Anonymous',
      email: email || '',
      message: message.trim(),
      timestamp: new Date().toISOString(),
      isAdmin: false, // KHÁCH HÀNG luôn là false
      read: false,
    };

    // Get all messages and add new one
    const allMessages = JSON.parse(localStorage.getItem('chatMessages') || '[]');
    allMessages.push(newMessage);
    localStorage.setItem('chatMessages', JSON.stringify(allMessages));

    // Update local state with visitor's messages (optimistic update)
    const visitorMessages = allMessages.filter((m: Message) => m.visitorId === visitorId);
    setMessages(visitorMessages);
    
    setMessage('');
    if (showNameEmail) {
      setShowNameEmail(false);
    }

    // Save to server và gửi Telegram SONG SONG (parallel) để nhanh hơn
    // Không await để không block UI
    Promise.all([
      // Save to server (Vercel KV) để admin có thể thấy
      fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: allMessages }),
      }).catch(error => {
        console.error('Error saving chat to server:', error);
        // Retry once after 1 second
        setTimeout(() => {
          fetch('/api/chat', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ messages: allMessages }),
          }).catch(err => console.error('Retry failed:', err));
        }, 1000);
      }),
      
      // Send to Telegram
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
        }),
      }).catch(error => {
        console.error('Error sending to Telegram:', error);
        // Retry once after 1 second
        setTimeout(() => {
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
            }),
          }).catch(err => console.error('Telegram retry failed:', err));
        }, 1000);
      }),
    ]).catch(error => {
      console.error('Error in parallel requests:', error);
    });

    // Auto-reply (optional) - CHỈ GỬI 1 LẦN cho mỗi visitor
    if (!hasAutoReply) {
      setTimeout(() => {
        // Double check để tránh race condition
        const allMessagesCheck = JSON.parse(localStorage.getItem('chatMessages') || '[]');
        const visitorMessagesCheck = allMessagesCheck.filter((m: Message) => m.visitorId === visitorId);
        const alreadyHasAutoReply = visitorMessagesCheck.some((m: Message) => 
          m.isAdmin && 
          m.message.includes('Thank you for your message! Our support team will respond as soon as possible.')
        );
        
        if (alreadyHasAutoReply) {
          setHasAutoReply(true);
          return;
        }
        
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
        
        // Mark as sent
        setHasAutoReply(true);
        
        // Optimistic update - hiển thị ngay
        const visitorMessages = allMessages.filter((m: Message) => m.visitorId === visitorId);
        setMessages(visitorMessages);
        
        // Save to server (không block UI)
        fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ messages: allMessages }),
        }).catch(error => {
          console.error('Error saving auto-reply to server:', error);
          // Retry once
          setTimeout(() => {
            fetch('/api/chat', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ messages: allMessages }),
            }).catch(err => console.error('Auto-reply retry failed:', err));
          }, 1000);
        });
      }, 800);
    }
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
                        className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-base placeholder-gray-400 focus:outline-none focus:border-blue-500"
                      />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Your Email"
                        className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-base placeholder-gray-400 focus:outline-none focus:border-blue-500"
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
                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-base placeholder-gray-400 focus:outline-none focus:border-blue-500"
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

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}

