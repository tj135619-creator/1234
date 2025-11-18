import { useState, useEffect, useRef } from 'react';
import { Sparkles, Send, Trash2, User, Bot, Loader2, MessageCircle, Zap, Plus, ChevronDown, Brain, Star, Copy, Check, Wand2 } from 'lucide-react';

export default function AIChatInterface({ onNext }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: 'Hello! I\'m your AI assistant. How can I help you today?',
      timestamp: Date.now()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [copiedId, setCopiedId] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickPrompts = [
    { icon: '💡', text: 'Creative ideas', category: 'Brainstorm' },
    { icon: '📝', text: 'Help writing', category: 'Writing' },
    { icon: '🎯', text: 'Solve problem', category: 'Problem' },
    { icon: '📚', text: 'Explain concept', category: 'Learning' },
    { icon: '🔍', text: 'Research topic', category: 'Research' },
    { icon: '💬', text: 'Just chat', category: 'Chat' },
  ];

  
const handleSendMessage = async () => {
  if (!inputMessage.trim() || isLoading) return;

  const userMessage = {
    id: Date.now(),
    role: "user",
    content: inputMessage,
    timestamp: Date.now(),
  };

  setMessages((prev) => [...prev, userMessage]);

  const userInput = inputMessage;
  setInputMessage("");
  setIsLoading(true);

  // Get the API key (IMPORTANT)
  const groqKey = localStorage.getItem("GROQ_KEY");

  if (!groqKey) {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now() + 1,
        role: "assistant",
        content: "Missing Groq API key. Please set it in your settings.",
        timestamp: Date.now(),
      },
    ]);
    setIsLoading(false);
    return;
  }

  try {
    const response = await fetch("https://one23-u2ck.onrender.com/agent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        groq_api_key: "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",   // REQUIRED NOW
        answer: userInput,       // Your actual message
      }),
    });

    let data;
    try {
      data = await response.json();
    } catch (jsonErr) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          content:
            "Server error or HTML returned. Try again in a moment.",
          timestamp: Date.now(),
        },
      ]);
      setIsLoading(false);
      return;
    }

    const aiMessage = {
      id: Date.now() + 1,
      role: "assistant",
      content: data?.content || JSON.stringify(data),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, aiMessage]);
  } catch (error) {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now() + 1,
        role: "assistant",
        content: "Could not reach AI server.",
        timestamp: Date.now(),
      },
    ]);
  }

  setIsLoading(false);
};

  const handleQuickPrompt = (prompt) => {
    setInputMessage(prompt);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 1,
        role: 'assistant',
        content: 'Chat cleared! How can I help you today?',
        timestamp: Date.now()
      }
    ]);
  };

  const handleCopyMessage = (id, content) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-purple-900 to-indigo-950 text-white bubbly-font">

      {/* ONBOARDING POPUP */}
      {showOnboarding && (
        <div className="fixed bottom-6 right-6 z-[100] animate-slide-in-right">
          <div className="bg-gradient-to-br from-purple-900/95 to-indigo-900/95 backdrop-blur-xl p-5 md:p-6 rounded-2xl border-2 border-purple-500/50 shadow-2xl max-w-sm w-full relative">
            <button
              onClick={() => setShowOnboarding(false)}
              className="absolute top-3 right-3 p-1.5 hover:bg-purple-800/50 rounded-lg transition-all"
            >
              <svg className="w-5 h-5 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="mb-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white">Quick Guide 💡</h3>
              </div>
              <p className="text-purple-200 text-sm">Start chatting with AI</p>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-start gap-2 text-sm">
                <MessageCircle className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                <p className="text-purple-300">Type your message or use quick prompts</p>
              </div>

              <div className="flex items-start gap-2 text-sm">
                <Zap className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                <p className="text-purple-300">Get instant AI-powered responses</p>
              </div>

              <div className="flex items-start gap-2 text-sm">
                <Star className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                <p className="text-purple-300">Copy useful responses with one click</p>
              </div>
            </div>

            <button
              onClick={() => setShowOnboarding(false)}
              className="w-full px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl font-semibold text-white text-sm transition-all shadow-lg"
            >
              Got it! 🚀
            </button>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="sticky top-0 z-50 bg-gradient-to-r from-purple-900/95 via-purple-800/95 to-indigo-900/95 backdrop-blur-md border-b-2 border-purple-500/30 shadow-2xl">
        <div className="px-4 md:px-6 lg:px-10 py-3 md:py-4">
          <div className="flex items-center justify-between gap-3">

            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl">
                <Brain className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg md:text-xl font-bold text-purple-100">AI Chat Assistant</h1>
                <p className="text-xs md:text-sm text-purple-300">Powered by AI</p>
              </div>

              {/* NEXT BUTTON TO MOVE TO NEXT PAGE */}

  <button
    onClick={onNext}
    className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white text-lg font-bold rounded-2xl shadow-xl transition-all"
  >
    Next →
  </button>



            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleClearChat}
                className="p-2 md:p-2.5 bg-purple-800/40 hover:bg-purple-700/40 rounded-xl border border-purple-500/30 transition-all shadow-lg"
              >
                <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* MAIN CHAT */}
      <div className="flex flex-col h-[calc(100vh-80px)]">

        <div className="flex-1 overflow-y-auto px-4 md:px-6 lg:px-10 py-6 space-y-4">

          {/* QUICK PROMPTS */}
          {messages.length === 1 && (
            <div className="mb-4">
              <h2 className="text-base md:text-lg font-bold text-purple-100 mb-3 flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-purple-400" />
                Quick Prompts
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {quickPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickPrompt(prompt.text)}
                    className="p-2.5 bg-gradient-to-br from-purple-900/40 to-indigo-900/40 backdrop-blur-sm rounded-xl border border-purple-500/20 hover:border-purple-400/40 transition-all text-center shadow-md hover:shadow-lg hover:scale-[1.03]"
                  >
                    <span className="text-2xl mb-1 block">{prompt.icon}</span>
                    <p className="text-xs font-medium text-purple-100 leading-tight">{prompt.text}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* CHAT MESSAGES */}
          <div className="max-w-5xl mx-auto space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* AVATAR */}
                <div className={`flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center shadow-xl ${
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-pink-500 to-purple-600'
                    : 'bg-gradient-to-br from-purple-500 via-indigo-600 to-blue-600'
                }`}>
                  {message.role === 'user' ? (
                    <User className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  ) : (
                    <Bot className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  )}
                </div>

                {/* MESSAGE BUBBLE */}
                <div className={`flex-1 ${message.role === 'user' ? 'max-w-[75%]' : 'max-w-[85%]'}`}>
                  {message.role === 'user' ? (
                    <div className="bg-gradient-to-br from-pink-600/90 to-purple-600/90 backdrop-blur-md border border-pink-500/30 p-4 rounded-3xl shadow-lg">
                      <p className="text-sm md:text-base text-white whitespace-pre-wrap leading-relaxed">
                        {message.content}
                      </p>
                      <p className="text-xs text-pink-200/80 mt-2">
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  ) : (
                    <div className="relative">

                      <div className="absolute -top-2 -left-2 w-6 h-6 bg-purple-500/30 rounded-full blur-xl"></div>
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-pink-500/20 rounded-full blur-xl"></div>

                      <div className="bg-gradient-to-br from-purple-900/70 via-indigo-900/70 to-purple-900/70 backdrop-blur-xl border-2 border-purple-400/40 p-6 md:p-8 rounded-3xl shadow-2xl relative overflow-hidden">

                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/5 to-transparent animate-shimmer"></div>

                        <div className="flex items-center gap-2 mb-4">
                          <div className="px-3 py-1 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full border border-purple-400/40 flex items-center gap-2">
                            <Sparkles className="w-3 h-3 text-purple-300" />
                            <span className="text-xs font-bold text-purple-200">AI Assistant</span>
                          </div>
                        </div>

                        <p className="text-base md:text-lg text-white whitespace-pre-wrap leading-relaxed font-medium">
                          {message.content}
                        </p>

                        <div className="flex items-center justify-between mt-6 pt-4 border-t border-purple-400/20 relative z-10">
                          <p className="text-xs text-purple-300 flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          <button
                            onClick={() => handleCopyMessage(message.id, message.content)}
                            className="p-2 hover:bg-purple-700/50 rounded-xl transition-all group"
                          >
                            {copiedId === message.id ? (
                              <div className="flex items-center gap-1">
                                <Check className="w-4 h-4 text-green-400" />
                                <span className="text-xs text-green-400 font-medium">Copied!</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                <Copy className="w-4 h-4 text-purple-300 group-hover:text-purple-200" />
                                <span className="text-xs text-purple-300 group-hover:text-purple-200 font-medium">Copy</span>
                              </div>
                            )}
                          </button>
                        </div>

                        <div className="absolute top-4 right-4 w-16 h-16 border-t-2 border-r-2 border-purple-400/20 rounded-tr-3xl"></div>
                        <div className="absolute bottom-4 left-4 w-16 h-16 border-b-2 border-l-2 border-purple-400/20 rounded-bl-3xl"></div>

                      </div>

                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-purple-500 via-indigo-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <Bot className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <div className="p-6 rounded-3xl bg-gradient-to-br from-purple-900/70 to-indigo-900/70 backdrop-blur-xl border-2 border-purple-400/40 shadow-2xl max-w-[85%]">
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                    </div>
                    <span className="text-base text-purple-300 font-medium">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

        </div>

        {/* INPUT BAR */}
        <div className="border-t-2 border-purple-500/30 bg-gradient-to-r from-purple-900/95 via-purple-800/95 to-indigo-900/95 backdrop-blur-md">
          <div className="px-4 md:px-6 lg:px-10 py-4 max-w-5xl mx-auto">

            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Type your message... (Shift+Enter for new line)"
                  className="w-full px-4 md:px-5 py-3 md:py-4 bg-purple-950/50 border-2 border-purple-500/30 rounded-2xl text-white placeholder-purple-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 text-sm md:text-base resize-none transition-all"
                  rows={1}
                  style={{ minHeight: '52px', maxHeight: '120px' }}
                />
              </div>

              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="p-3 md:p-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl flex-shrink-0"
              >
                <Send className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </button>
            </div>

            <p className="text-xs text-purple-400 mt-2 text-center">
              AI responses are simulated in this demo
            </p>

          </div>
        </div>

        {/* NEXT PAGE BUTTON — ADDED HERE */}
        <div className="p-4 flex justify-center">
          <button
            onClick={onNext}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white text-lg font-bold rounded-2xl shadow-xl transition-all"
          >
            Next →
          </button>
        </div>

      </div>

      {/* STYLES */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&display=swap');

        .bubbly-font {
          font-family: 'Fredoka', sans-serif;
        }

        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }

        .animate-shimmer {
          animation: shimmer 3s infinite;
        }
      `}</style>

    </div>
  );
}
