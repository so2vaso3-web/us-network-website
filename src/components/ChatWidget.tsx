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
    // CHỈ chạy 1 lần khi component mount, không cần dependencies
    if (typeof window !== 'undefined' && !visitorId) {
      let vid = localStorage.getItem('visitorId');
      if (!vid || vid.trim() === '') {
        vid = `visitor-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('visitorId', vid);
      }
      // Chỉ set nếu chưa có
      if (!visitorId) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Chỉ chạy 1 lần khi mount, visitorId được set trong effect này

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

  // Polling để nhận reply từ admin - TỐI ƯU để mượt mà và không mất messages
  useEffect(() => {
    if (!visitorId) return;

    let isPolling = false; // Flag để tránh concurrent requests
    let lastPollTime = 0;

    const loadMessagesFromServer = async () => {
      // Debounce: Chỉ poll nếu đã qua 1.5 giây từ lần poll trước
      const now = Date.now();
      if (isPolling || (now - lastPollTime < 1500)) {
        return;
      }
      
      isPolling = true;
      lastPollTime = now;

      try {
        const response = await fetch(`/api/chat?t=${now}`, {
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
                // Đảm bảo logic isAdmin đúng
                const isAdminMessage = m.name === 'Admin' || m.name === 'Support Team';
                return {
                  ...m,
                  isAdmin: isAdminMessage ? true : false,
                };
              })
              .sort((a: Message, b: Message) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()); // Sort ngay từ đầu
            
            // Update messages một cách mượt mà
            setMessages(prevMessages => {
              // Chỉ update nếu có thay đổi thực sự
              if (prevMessages.length === visitorMessages.length) {
                const hasChanges = prevMessages.some((prev, idx) => {
                  const curr = visitorMessages[idx];
                  return !curr || prev.id !== curr.id || prev.message !== curr.message || prev.timestamp !== curr.timestamp;
                });
                if (!hasChanges) {
                  return prevMessages; // Không có thay đổi, giữ nguyên để tránh re-render
                }
              }
              
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
              
              return visitorMessages; // Đã sort rồi
            });
          }
        } else {
          console.error('Failed to load messages:', response.status, response.statusText);
          // Fallback: Load từ localStorage nếu server fail
          const localMessages = JSON.parse(localStorage.getItem('chatMessages') || '[]');
          const visitorMessages = localMessages
            .filter((m: Message) => m.visitorId === visitorId)
            .sort((a: Message, b: Message) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
          if (visitorMessages.length > 0) {
            setMessages(visitorMessages);
          }
        }
      } catch (error) {
        console.error('Error loading messages from server:', error);
        // Fallback: Load từ localStorage nếu có lỗi
        const localMessages = JSON.parse(localStorage.getItem('chatMessages') || '[]');
        const visitorMessages = localMessages
          .filter((m: Message) => m.visitorId === visitorId)
          .sort((a: Message, b: Message) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        if (visitorMessages.length > 0) {
          setMessages(visitorMessages);
        }
      } finally {
        isPolling = false;
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

    // Update local state with visitor's messages (optimistic update) - SORT để đảm bảo thứ tự
    const visitorMessages = allMessages
      .filter((m: Message) => m.visitorId === visitorId)
      .sort((a: Message, b: Message) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
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
        
        // Optimistic update - hiển thị ngay (SORT để đảm bảo thứ tự)
        const visitorMessages = allMessages
          .filter((m: Message) => m.visitorId === visitorId)
          .sort((a: Message, b: Message) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
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
      {/* Chat Button - Fixed Bottom Right with Beautiful Icon and Animations */}
      <button
        onClick={() => {
          setIsOpen(true);
          setIsMinimized(false);
        }}
        className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-full shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-110 flex items-center justify-center group chat-button-pulse ${isOpen ? 'hidden' : 'flex'}`}
        aria-label="Open chat"
      >
        {/* Animated Ripple Effect */}
        <span className="absolute inset-0 rounded-full bg-white/20 animate-ping opacity-75"></span>
        <span className="absolute inset-0 rounded-full bg-white/10 animate-pulse"></span>
        
        {/* Beautiful Chat Icon SVG */}
        <svg
          className="w-7 h-7 sm:w-8 sm:h-8 text-white relative z-10 transition-transform duration-300 group-hover:scale-110"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          viewBox="0 0 24 24"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          <path d="M8 10h.01M12 10h.01M16 10h.01" strokeWidth="2.5" />
        </svg>
        
        {/* Unread Badge */}
        {(() => {
          if (typeof window !== 'undefined' && visitorId) {
            const allMessages = JSON.parse(localStorage.getItem('chatMessages') || '[]');
            const visitorMessages = allMessages.filter((m: Message) => m.visitorId === visitorId && !m.read && !m.isAdmin);
            if (visitorMessages.length > 0) {
              return (
                <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg animate-bounce border-2 border-white">
                  {visitorMessages.length > 9 ? '9+' : visitorMessages.length}
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
          className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 bg-[#1a1f3a] rounded-lg sm:rounded-xl border border-gray-700 shadow-2xl flex flex-col transition-all duration-300 animate-slideInRight ${
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
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-900/50 scroll-smooth">
                {messages.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 animate-fadeIn">
                    <svg
                      className="w-16 h-16 mx-auto mb-3 opacity-50"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
                      />
                    </svg>
                    <p className="text-sm">No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  <>
                    {messages.map((msg, index) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.isAdmin ? 'justify-start' : 'justify-end'} animate-fadeIn`}
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        <div
                          className={`max-w-[75%] rounded-lg p-3 transition-all duration-200 hover:scale-[1.02] ${
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
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 hover:scale-105 active:scale-95'
                        : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    }`}
                    aria-label="Send message"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      viewBox="0 0 24 24"
                    >
                      <line x1="22" y1="2" x2="11" y2="13"></line>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
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

