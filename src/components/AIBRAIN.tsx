import { useState, useEffect, useRef } from 'react';
import { Send, User, Bot, Loader2, Brain, Target, BookOpen, Zap, Calendar, CheckCircle, Sparkles, ArrowRight } from 'lucide-react';
import { getApiKeys } from 'src/backend/apikeys';

export default function AIChatInterface({onComplete}) {
  const [currentPhase, setCurrentPhase] = useState(1);
  const [sessionId] = useState(`session_${Date.now()}`);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPhaseTransition, setShowPhaseTransition] = useState(false);
  const messagesEndRef = useRef(null);


  const API_BASE = "https://pythonbackend-74es.onrender.com";

  const phases = [
    {
      id: 1,
      name: "Diagnostic",
      coach: "Dr. Maya",
      icon: Brain,
      color: "from-purple-500 to-pink-500",
      bgGradient: "from-purple-950 via-purple-900 to-pink-950",
      description: "Understanding your challenges",
      minMessages: 5
    },
    {
      id: 2,
      name: "Skills Analysis",
      coach: "Coach Jordan",
      icon: Target,
      color: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-950 via-blue-900 to-cyan-950",
      description: "Identifying skill gaps",
      minMessages: 3
    },
    {
      id: 3,
      name: "Education",
      coach: "Prof. Chen",
      icon: BookOpen,
      color: "from-green-500 to-emerald-500",
      bgGradient: "from-green-950 via-green-900 to-emerald-950",
      description: "Learning the psychology",
      minMessages: 2
    },
    {
      id: 4,
      name: "Goal Setting",
      coach: "Alex",
      icon: Zap,
      color: "from-amber-500 to-orange-500",
      bgGradient: "from-amber-950 via-orange-900 to-orange-950",
      description: "Creating SMART goals",
      minMessages: 3
    },
    {
      id: 5,
      name: "Action Planning",
      coach: "Riley",
      icon: Calendar,
      color: "from-fuchsia-500 to-pink-500",
      bgGradient: "from-fuchsia-950 via-pink-900 to-pink-950",
      description: "Building your 5-day plan",
      minMessages: 2
    },
    {
      id: 6,
      name: "Accountability",
      coach: "Sam",
      icon: CheckCircle,
      color: "from-teal-500 to-green-500",
      bgGradient: "from-teal-950 via-green-900 to-green-950",
      description: "Setting up tracking",
      minMessages: 2
    }
  ];

  const currentPhaseData = phases[currentPhase - 1];
  const userMessageCount = messages.filter(m => m.role === 'user').length;
  const canMoveToNext = userMessageCount >= currentPhaseData.minMessages && currentPhase < 6;

  useEffect(() => {
    initializeSession();
  }, []);

  const initializeSession = async () => {
  setIsLoading(true);
  try {
    // Fetch API keys from Firebase
    const apiKeys = await getApiKeys();
    if (apiKeys.length === 0) {
      throw new Error("No API keys available");
    }

    // Try each key until one works
    let success = false;
    for (const apiKey of apiKeys) {
      try {
        const response = await fetch(`${API_BASE}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session_id: sessionId,
            api_key: apiKey,
            phase: 1,
            message: ""
          })
        });

        if (!response.ok) continue;

        const data = await response.json();
        
        setMessages([{
          id: Date.now(),
          role: 'assistant',
          content: data.response,
          timestamp: Date.now()
        }]);
        
        success = true;
        break;
      } catch (err) {
        console.warn('API key failed, trying next...', err);
        continue;
      }
    }

    if (!success) {
      throw new Error("All API keys failed");
    }

  } catch (error) {
    console.error('Initialization error:', error);
    setMessages([{
      id: Date.now(),
      role: 'assistant',
      content: '⚠️ Could not connect to server. Please try again.',
      timestamp: Date.now()
    }]);
  }
  setIsLoading(false);
};

  const handleSendMessage = async () => {
  if (!inputMessage.trim() || isLoading) return;

  const userMsg = {
    id: Date.now(),
    role: 'user',
    content: inputMessage,
    timestamp: Date.now()
  };

  setMessages(prev => [...prev, userMsg]);
  const userInput = inputMessage;
  setInputMessage('');
  setIsLoading(true);

  try {
    // Fetch API keys from Firebase
    const apiKeys = await getApiKeys();
    if (apiKeys.length === 0) {
      throw new Error("No API keys available");
    }

    // Try each key until one works
    let success = false;
    for (const apiKey of apiKeys) {
      try {
        const response = await fetch(`${API_BASE}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session_id: sessionId,
            api_key: apiKey,
            phase: currentPhase,
            message: userInput
          })
        });

        if (!response.ok) continue;

        const data = await response.json();

        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          role: 'assistant',
          content: data.response,
          timestamp: Date.now()
        }]);

        success = true;
        break;
      } catch (err) {
        console.warn('API key failed, trying next...', err);
        continue;
      }
    }

    if (!success) {
      throw new Error("All API keys failed");
    }

  } catch (error) {
    console.error('Send error:', error);
    setMessages(prev => [...prev, {
      id: Date.now() + 1,
      role: 'assistant',
      content: '⚠️ Error sending message. Please try again.',
      timestamp: Date.now()
    }]);
  }

  setIsLoading(false);
};

  const handleNextPhase = async () => {
    if (!canMoveToNext) return;

    setShowPhaseTransition(true);
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/transition`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          new_phase: currentPhase + 1
        })
      });

      const data = await response.json();

      setTimeout(() => {
        setCurrentPhase(currentPhase + 1);
        setMessages([{
          id: Date.now(),
          role: 'assistant',
          content: data.response,
          timestamp: Date.now()
        }]);
        setShowPhaseTransition(false);
        setIsLoading(false);
      }, 2000);

    } catch (error) {
      console.error('Transition error:', error);
      setShowPhaseTransition(false);
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const PhaseIcon = currentPhaseData.icon;

  return (
    <div className={`h-screen flex flex-col bg-gradient-to-br ${currentPhaseData.bgGradient} text-white transition-all duration-1000 overflow-hidden`}>
      
      {/* PHASE TRANSITION OVERLAY */}
      {showPhaseTransition && (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex items-center justify-center p-6">
          <div className="text-center space-y-6 animate-fade-in">
            <div className={`w-24 h-24 mx-auto bg-gradient-to-br ${phases[currentPhase].color} rounded-3xl flex items-center justify-center animate-bounce-slow shadow-2xl`}>
              {(() => {
                const NextIcon = phases[currentPhase].icon;
                return <NextIcon className="w-12 h-12 text-white" />;
              })()}
            </div>
            <div className="space-y-3">
              <p className="text-2xl font-bold text-white">Moving to Phase {currentPhase + 1}</p>
              <p className={`text-xl bg-gradient-to-r ${phases[currentPhase].color} bg-clip-text text-transparent font-bold`}>
                Meeting {phases[currentPhase].coach}
              </p>
              <p className="text-base text-gray-300">{phases[currentPhase].description}</p>
            </div>
            <div className="flex gap-2 justify-center">
              <div className="w-3 h-3 bg-white/50 rounded-full animate-pulse"></div>
              <div className="w-3 h-3 bg-white/50 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
              <div className="w-3 h-3 bg-white/50 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
            </div>
          </div>
        </div>
      )}

      {/* COMPACT HEADER */}
      <div className="flex-shrink-0 bg-black/40 backdrop-blur-xl border-b border-white/10 shadow-xl">
        <div className="px-4 py-3">
          {/* Current Phase Info - Single Line */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className={`w-12 h-12 bg-gradient-to-br ${currentPhaseData.color} rounded-xl flex items-center justify-center shadow-lg flex-shrink-0`}>
                <PhaseIcon className="w-6 h-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold truncate">
                    Phase {currentPhase}: {currentPhaseData.name}
                  </h1>
                </div>
                <p className="text-xs text-gray-400 truncate">{currentPhaseData.description}</p>
              </div>
            </div>

            <div className="text-right flex-shrink-0">
              <p className="text-2xl font-bold">{currentPhase}/6</p>
            </div>
          </div>

          {/* Mini Phase Timeline */}
          <div className="flex gap-1 mt-3">
            {phases.map((phase) => (
              <div key={phase.id} className="flex-1 h-1 rounded-full transition-all" 
                style={{
                  background: phase.id < currentPhase 
                    ? `linear-gradient(to right, var(--tw-gradient-stops))` 
                    : phase.id === currentPhase 
                    ? `linear-gradient(to right, var(--tw-gradient-stops))`
                    : '#374151'
                }}
                className={
                  phase.id < currentPhase ? `bg-gradient-to-r ${phase.color}` :
                  phase.id === currentPhase ? `bg-gradient-to-r ${phase.color} animate-pulse` :
                  'bg-gray-700'
                }
              />
            ))}
          </div>
        </div>
      </div>

      {/* MESSAGES AREA - FULL HEIGHT */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4" style={{minHeight: 0}}>
        <div className="max-w-4xl mx-auto space-y-4 pb-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${
                message.role === 'user' 
                  ? 'bg-gradient-to-br from-gray-600 to-gray-800' 
                  : `bg-gradient-to-br ${currentPhaseData.color}`
              }`}>
                {message.role === 'user' ? (
                  <User className="w-5 h-5 text-white" />
                ) : (
                  <Bot className="w-5 h-5 text-white" />
                )}
              </div>

              {/* Message Bubble */}
              <div className={`flex-1 ${message.role === 'user' ? 'max-w-[80%]' : 'max-w-[85%]'}`}>
                {message.role === 'user' ? (
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl shadow-lg">
                    <p className="text-base text-white whitespace-pre-wrap leading-relaxed break-words">
                      {message.content}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                ) : (
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-xl">
                    {/* Coach Badge */}
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`px-2.5 py-1 bg-gradient-to-r ${currentPhaseData.color} rounded-full flex items-center gap-1.5`}>
                        <Sparkles className="w-3 h-3 text-white" />
                        <span className="text-xs font-bold text-white">{currentPhaseData.coach}</span>
                      </div>
                    </div>

                    <p className="text-base text-white whitespace-pre-wrap leading-relaxed break-words">
                      {message.content}
                    </p>

                    <p className="text-xs text-gray-400 mt-3 flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                      {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Loading */}
          {isLoading && !showPhaseTransition && (
            <div className="flex gap-3">
              <div className={`w-10 h-10 bg-gradient-to-br ${currentPhaseData.color} rounded-xl flex items-center justify-center shadow-lg`}>
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-xl">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                  <span className="text-base text-white">{currentPhaseData.coach} is thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* INPUT AREA - COMPACT & FIXED */}
      <div className="flex-shrink-0 border-t border-white/10 bg-black/40 backdrop-blur-md shadow-2xl">
        <div className="px-4 py-3">
          {/* Next Phase Button */}
          {canMoveToNext && (
            <div className="mb-3 animate-fade-in">
              <button
                onClick={handleNextPhase}
                className={`w-full px-5 py-3 bg-gradient-to-r ${phases[currentPhase].color} rounded-xl transition-all transform active:scale-95 flex items-center justify-center gap-2 font-bold text-base shadow-lg`}
              >
                <span className="truncate">Phase {currentPhase + 1}: {phases[currentPhase].name}</span>
                <ArrowRight className="w-5 h-5 flex-shrink-0" />
              </button>
            </div>
          )}

          {currentPhase === 6 && ( // <--- CONDITION 2: Finish Button
            <div className="mb-3 animate-fade-in">
              <button
                onClick={() => onComplete()} // Replace with your actual finish logic (e.g., redirect, API call to save results)
                className="w-full px-5 py-3 bg-gradient-to-r from-teal-500 to-green-500 rounded-xl transition-all transform active:scale-95 flex items-center justify-center gap-2 font-bold text-base shadow-lg ring-4 ring-green-500/30"
              >
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <span>Finish Conversation & View Plan</span>
              </button>
            </div>
          )}

          <div className="flex gap-2 items-end">
            <div className="flex-1 min-w-0">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder={`Message ${currentPhaseData.coach}...`}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:ring-2 focus:ring-white/20 text-base resize-none transition-all"
                rows={1}
                style={{ minHeight: '48px', maxHeight: '96px' }}
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className={`p-3 bg-gradient-to-r ${currentPhaseData.color} active:scale-95 rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0 shadow-lg`}
            >
              <Send className="w-6 h-6 text-white" />
            </button>
          </div>

          {!canMoveToNext && currentPhase < 6 && (
            <p className="text-center text-xs text-gray-400 mt-2">
              Continue ({userMessageCount}/{currentPhaseData.minMessages} messages)
            </p>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }

        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }

        .animate-bounce-slow {
          animation: bounce-slow 2s infinite;
        }

        textarea {
          scrollbar-width: thin;
          scrollbar-color: rgba(255,255,255,0.2) transparent;
        }

        textarea::-webkit-scrollbar {
          width: 4px;
        }

        textarea::-webkit-scrollbar-track {
          background: transparent;
        }

        textarea::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.2);
          border-radius: 2px;
        }

        /* Smooth scrolling */
        .overflow-y-auto {
          -webkit-overflow-scrolling: touch;
          scroll-behavior: smooth;
        }

        /* Prevent zoom on input focus for iOS */
        @media screen and (max-width: 640px) {
          input, textarea, select {
            font-size: 16px !important;
          }
        }

        /* Hide scrollbar but keep functionality */
        .overflow-y-auto::-webkit-scrollbar {
          width: 0px;
        }
      `}</style>
    </div>
  );
}