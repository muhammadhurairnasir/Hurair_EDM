import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Loader2 } from 'lucide-react';
import api from '../../services/api.js';

export default function Chatbot({ restaurantId, customerId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Hi! I am your AI Shopping Assistant. You can ask me to "track my order", "recommend something", or questions about "shipping" and "returns".' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const { data } = await api.post('/ai/chat', { message: userMsg.text, restaurantId, customerId });
      setMessages(prev => [...prev, { role: 'bot', text: data.data.reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', text: 'Sorry, I am having trouble connecting to the network right now.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Button Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-2xl transition-transform hover:scale-110 z-50 flex items-center justify-center animate-bounce duration-1000"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[350px] h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 animate-in slide-in-from-bottom-5 overflow-hidden border border-gray-100">
          
          {/* Header */}
          <div className="bg-blue-600 p-4 flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm">AI Store Assistant</h3>
                <p className="text-xs text-blue-100 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Online
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white hover:text-blue-100 bg-white/10 p-1 rounded-md transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 text-sm">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl p-3 shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                }`}>
                  <div className="flex items-center gap-1 mb-1 opacity-70">
                    {msg.role === 'bot' ? <Bot className="w-3 h-3" /> : <User className="w-3 h-3" />}
                    <span className="text-[10px] uppercase font-bold tracking-wider">{msg.role}</span>
                  </div>
                  <p className="leading-relaxed">{msg.text}</p>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-500 border border-gray-100 rounded-2xl rounded-bl-none p-3 shadow-sm flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-500" /> AI is typing...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              className="flex-1 bg-gray-100 text-gray-800 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
            />
            <button 
              type="submit" 
              disabled={!input.trim() || isTyping}
              className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}
    </>
  );
}
