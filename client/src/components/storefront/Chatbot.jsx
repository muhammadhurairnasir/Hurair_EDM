import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Loader2, Sparkles, ShoppingCart, Package, Tag, ChevronDown } from 'lucide-react';
import api from '../../services/api.js';

/** Renders **bold** markdown syntax inside chat bubbles */
const FormattedText = ({ text }) => {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <span>
      {parts.map((part, i) =>
        part.startsWith('**') && part.endsWith('**')
          ? <strong key={i}>{part.slice(2, -2)}</strong>
          : part.split('\n').map((line, j, arr) => (
              <span key={`${i}-${j}`}>
                {line}
                {j < arr.length - 1 && <br />}
              </span>
            ))
      )}
    </span>
  );
};

const QUICK_STARTS = [
  { label: 'Show Menu', icon: <ShoppingCart className="w-3 h-3" /> },
  { label: 'Track my order', icon: <Package className="w-3 h-3" /> },
  { label: 'Any coupons?', icon: <Tag className="w-3 h-3" /> },
  { label: 'Recommend something', icon: <Sparkles className="w-3 h-3" /> },
];

export default function Chatbot({ restaurantId, customerId, cart = [], onAddToCart }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: '👋 Hi! I\'m your **AI Store Assistant**.\n\nI can help you:\n• 🔍 Search & filter menu items\n• 📦 Track your orders\n• 🛒 Manage your cart\n• 🎟️ Find coupons & deals\n• ❓ Answer any FAQs\n\nWhat can I do for you today?',
      suggestions: ['Show menu', 'Track my order', 'Any coupons?', 'Recommend something']
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const sendMessage = async (text) => {
    if (!text.trim() || isTyping) return;

    const userMsg = { role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const { data } = await api.post('/ai/chat', {
        message: text,
        restaurantId,
        customerId,
        cart  // pass cart for abandoned cart detection
      });
        const botMsg = {
        role: 'bot',
        text: data.data.reply,
        suggestions: data.data.suggestions || []
      };
      
      // NEW: Handle direct actions (like Add to Cart)
      if (data.data.action?.type === 'ADD_TO_CART') {
        onAddToCart(data.data.action.item);
      }
      
      setMessages(prev => [...prev, botMsg]);
      if (!isOpen) setUnreadCount(prev => prev + 1);
    } catch {
      setMessages(prev => [...prev, {
        role: 'bot',
        text: '⚠️ Sorry, I\'m having trouble connecting. Please try again shortly.',
        suggestions: []
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleChip = (text) => {
    sendMessage(text);
  };

  return (
    <>
      {/* Floating Launcher */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-2xl transition-all hover:scale-110 z-50 flex items-center justify-center"
          style={{ animation: 'chatPulse 3s ease-in-out infinite' }}
          aria-label="Open AI Chat Assistant"
        >
          <MessageSquare className="w-6 h-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
              {unreadCount}
            </span>
          )}
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[380px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-100 overflow-hidden"
          style={{ height: isMinimized ? 'auto' : '540px', transition: 'height 0.2s ease' }}>

          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 flex items-center justify-between text-white flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm leading-tight">AI Store Assistant</h3>
                <p className="text-[11px] text-blue-100 flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
                  Always Online • Powered by AI
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-lg transition-colors"
              >
                <ChevronDown className={`w-4 h-4 transition-transform ${isMinimized ? 'rotate-180' : ''}`} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Quick Start Chips (only when 1 message) */}
              {messages.length === 1 && (
                <div className="px-3 pt-3 pb-1 flex flex-wrap gap-2 bg-gray-50 border-b border-gray-100 flex-shrink-0">
                  {QUICK_STARTS.map(({ label, icon }) => (
                    <button
                      key={label}
                      onClick={() => handleChip(label)}
                      className="flex items-center gap-1.5 bg-white border border-blue-100 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-blue-50 hover:border-blue-300 transition-all shadow-sm"
                    >
                      {icon} {label}
                    </button>
                  ))}
                </div>
              )}

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 text-sm">
                {messages.map((msg, idx) => (
                  <div key={idx}>
                    <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {msg.role === 'bot' && (
                        <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                          <Bot className="w-4 h-4 text-blue-600" />
                        </div>
                      )}
                      <div className={`max-w-[82%] rounded-2xl px-4 py-3 shadow-sm ${
                        msg.role === 'user'
                          ? 'bg-blue-600 text-white rounded-br-none'
                          : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                      }`}>
                        <p className="leading-relaxed text-[13px]">
                          <FormattedText text={msg.text} />
                        </p>
                      </div>
                      {msg.role === 'user' && (
                        <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center ml-2 mt-1 flex-shrink-0">
                          <User className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Quick Reply Chips after bot message */}
                    {msg.role === 'bot' && msg.suggestions?.length > 0 && idx === messages.length - 1 && (
                      <div className="flex flex-wrap gap-1.5 mt-2 ml-9">
                        {msg.suggestions.map(s => (
                          <button
                            key={s}
                            onClick={() => handleChip(s)}
                            className="text-xs bg-blue-50 border border-blue-200 text-blue-700 font-medium px-3 py-1 rounded-full hover:bg-blue-100 transition-colors"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start items-end gap-2">
                    <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex items-center gap-2">
                      <span className="flex gap-1">
                        <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                      </span>
                      <span className="text-xs text-gray-400">AI is typing</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-gray-100 flex items-center gap-2 flex-shrink-0">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder='Try "show burgers under $15"...'
                  className="flex-1 bg-gray-100 text-gray-800 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="bg-blue-600 text-white p-2.5 rounded-xl hover:bg-blue-700 disabled:opacity-40 transition-colors flex-shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          )}
        </div>
      )}

      <style>{`
        @keyframes chatPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(37,99,235,0.4); }
          50% { box-shadow: 0 0 0 12px rgba(37,99,235,0); }
        }
      `}</style>
    </>
  );
}
