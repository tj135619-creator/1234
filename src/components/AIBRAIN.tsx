import { useState, useEffect, useRef } from 'react';
import { Send, User, Bot, Loader2, Brain, Target, BookOpen, Zap, Calendar, CheckCircle, Sparkles, ArrowRight, Download, Clock, TrendingUp } from 'lucide-react';
import { getApiKeys } from "src/backend/apikeys";


export default function AIChatInterface({onComplete}) {
  const [currentPhase, setCurrentPhase] = useState(1);
  const [sessionId] = useState(`session_${Date.now()}`);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPhaseTransition, setShowPhaseTransition] = useState(false);
  const [phaseComplete, setPhaseComplete] = useState(false);
  const [structuredData, setStructuredData] = useState({});
  const [showDataPreview, setShowDataPreview] = useState(false);
  const messagesEndRef = useRef(null);

  const API_BASE = "https://pythonbackend-74es.onrender.com";

  const phases = [
    {
      id: 1,
      name: "Discovery",
      coach: "Jordan",
      role: "Your Listener",
      icon: Brain,
      color: "from-purple-500 to-pink-500",
      bgGradient: "from-purple-950 via-purple-900 to-pink-950",
      description: "Understanding your story",
      minMessages: 5
    },
    {
      id: 2,
      name: "Assessment",
      coach: "Jordan",
      role: "Skills Analyst",
      icon: Target,
      color: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-950 via-blue-900 to-cyan-950",
      description: "Identifying skill gaps",
      minMessages: 4
    },
    {
      id: 3,
      name: "Education",
      coach: "Jordan",
      role: "Your Teacher",
      icon: BookOpen,
      color: "from-green-500 to-emerald-500",
      bgGradient: "from-green-950 via-green-900 to-emerald-950",
      description: "Learning the psychology",
      minMessages: 3
    },
    {
      id: 4,
      name: "Goal Setting",
      coach: "Jordan",
      role: "Strategic Partner",
      icon: Zap,
      color: "from-amber-500 to-orange-500",
      bgGradient: "from-amber-950 via-orange-900 to-orange-950",
      description: "Creating your targets",
      minMessages: 3
    },
    {
      id: 5,
      name: "Action Planning",
      coach: "Jordan",
      role: "Action Coach",
      icon: Calendar,
      color: "from-fuchsia-500 to-pink-500",
      bgGradient: "from-fuchsia-950 via-pink-900 to-pink-950",
      description: "Building your 5-day plan",
      minMessages: 2
    },
    {
      id: 6,
      name: "Accountability",
      coach: "Jordan",
      role: "Your Ally",
      icon: CheckCircle,
      color: "from-teal-500 to-green-500",
      bgGradient: "from-teal-950 via-green-900 to-green-950",
      description: "Setting up tracking",
      minMessages: 2
    }
  ];

  const currentPhaseData = phases[currentPhase - 1];
  const userMessageCount = messages.filter(m => m.role === 'user').length;
  const canMoveToNext = true
  const progressPercent = Math.min((userMessageCount / currentPhaseData.minMessages) * 100, 100);

  useEffect(() => {
    initializeSession();
  }, []);

  const initializeSession = async () => {
  setIsLoading(true);
  try {
    const apiKeys = await getApiKeys();
    const apiKey = apiKeys[apiKeys.length - 1]; // pick latest key

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

    if (!response.ok) throw new Error("Failed to initialize");
    const data = await response.json();

    setMessages([{
      id: Date.now(),
      role: 'assistant',
      content: data.response,
      timestamp: Date.now()
    }]);

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

  const userMsg = { id: Date.now(), role: 'user', content: inputMessage, timestamp: Date.now() };
  setMessages(prev => [...prev, userMsg]);
  const userInput = inputMessage;
  setInputMessage('');
  setIsLoading(true);

  try {
    const apiKeys = await getApiKeys();
    const apiKey = apiKeys[apiKeys.length - 1]; // pick latest key

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

    if (!response.ok) throw new Error("Failed to send");
    const data = await response.json();

    setMessages(prev => [...prev, {
      id: Date.now() + 1,
      role: 'assistant',
      content: data.response,
      timestamp: Date.now()
    }]);

    if (data.phase_complete) {
      setPhaseComplete(true);
      if (data.structured_data) {
        setStructuredData(prev => ({ ...prev, [`phase${currentPhase}`]: data.structured_data }));
        setShowDataPreview(true);
      }
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
  console.log("🚀 Attempting to move to next phase");
  
  if (!canMoveToNext) {
    console.log("⚠️ Cannot move to next phase yet (canMoveToNext=false)");
    return;
  }

  console.log("⏳ Starting phase transition...");
  setShowPhaseTransition(true);
  setIsLoading(true);
  setShowDataPreview(false);

  try {
    console.log("📡 Sending transition request to backend:", {
      session_id: sessionId,
      new_phase: currentPhase + 1
    });

    const response = await fetch(`${API_BASE}/transition`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionId,
        new_phase: currentPhase + 1
      })
    });

    console.log("📩 Response received from backend:", response);

    const data = await response.json();
    console.log("📝 Parsed JSON data:", data);

    setTimeout(() => {
      console.log("✅ Updating local state for new phase:", currentPhase + 1);
      setCurrentPhase(currentPhase + 1);
      setMessages([{
        id: Date.now(),
        role: 'assistant',
        content: data.response,
        timestamp: Date.now()
      }]);
      setPhaseComplete(false);
      setShowPhaseTransition(false);
      setIsLoading(false);
      console.log("🎯 Phase transition complete. Messages and state updated.");
    }, 2000);

  } catch (error) {
    console.error("❌ Transition error:", error);
    setShowPhaseTransition(false);
    setIsLoading(false);
  }
};


  const handleExportSession = async () => {
    try {
      const response = await fetch(`${API_BASE}/export/${sessionId}`);
      const data = await response.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `jordan-session-${sessionId}.json`;
      a.click();
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const PhaseIcon = currentPhaseData.icon;

  // Structured Data Preview Component
  const DataPreview = () => {
    const data = structuredData[`phase${currentPhase}`];
    if (!data || !showDataPreview) return null;

    return (
      <div className="animate-slide-up mb-3 p-3 sm:p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm sm:text-base font-bold text-white">Phase {currentPhase} Summary</h3>
          <button onClick={() => setShowDataPreview(false)} className="text-xs text-gray-400">Hide</button>
        </div>
        
        {currentPhase === 1 && data.main_challenge && (
          <div className="space-y-1.5 text-xs sm:text-sm">
            <p className="text-white"><span className="font-semibold">Challenge:</span> {data.main_challenge}</p>
            <p className="text-gray-300"><span className="font-semibold">Feeling:</span> {data.emotional_state}</p>
          </div>
        )}
        
        {currentPhase === 2 && data.skill_gaps && (
          <div className="space-y-1.5 text-xs sm:text-sm">
            <p className="text-white font-semibold">Skill Gaps:</p>
            <ul className="list-disc list-inside text-gray-300 space-y-0.5">
              {data.skill_gaps.slice(0, 3).map((skill, i) => <li key={i}>{skill}</li>)}
            </ul>
          </div>
        )}
        
        {currentPhase === 3 && data.key_concepts && (
          <div className="space-y-1.5 text-xs sm:text-sm">
            <p className="text-white font-semibold">Key Concepts:</p>
            <ul className="list-disc list-inside text-gray-300 space-y-0.5">
              {data.key_concepts.slice(0, 3).map((concept, i) => <li key={i}>{concept}</li>)}
            </ul>
          </div>
        )}
        
        {currentPhase === 4 && data.week_1_goal && (
          <div className="space-y-1.5 text-xs sm:text-sm">
            <p className="text-white"><span className="font-semibold">Week 1:</span> {data.week_1_goal.description}</p>
          </div>
        )}
        
        {currentPhase === 5 && data.plan_title && (
          <div className="space-y-1.5 text-xs sm:text-sm">
            <p className="text-white"><span className="font-semibold">Plan:</span> {data.plan_title}</p>
            <p className="text-gray-300"><span className="font-semibold">Difficulty:</span> {data.difficulty_level}</p>
          </div>
        )}
        
        {currentPhase === 6 && data.tracking_method && (
          <div className="space-y-1.5 text-xs sm:text-sm">
            <p className="text-white"><span className="font-semibold">Tracking:</span> {data.tracking_method}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`h-screen flex flex-col bg-gradient-to-br ${currentPhaseData.bgGradient} text-white transition-all duration-1000 overflow-hidden`}>
      
      {/* PHASE TRANSITION OVERLAY */}
      {showPhaseTransition && (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6">
          <div className="text-center space-y-4 sm:space-y-6 animate-fade-in max-w-md">
            <div className={`w-16 h-16 sm:w-24 sm:h-24 mx-auto bg-gradient-to-br ${phases[currentPhase].color} rounded-3xl flex items-center justify-center animate-bounce-slow shadow-2xl`}>
              {(() => {
                const NextIcon = phases[currentPhase].icon;
                return <NextIcon className="w-8 h-8 sm:w-12 sm:h-12 text-white" />;
              })()}
            </div>
            <div className="space-y-2 sm:space-y-3">
              <p className="text-xl sm:text-2xl font-bold text-white">Phase {currentPhase + 1}</p>
              <p className={`text-lg sm:text-xl bg-gradient-to-r ${phases[currentPhase].color} bg-clip-text text-transparent font-bold`}>
                {phases[currentPhase].name}
              </p>
              <p className="text-sm sm:text-base text-gray-300">{phases[currentPhase].description}</p>
            </div>
            <div className="flex gap-2 justify-center">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-white/50 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-white/50 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-white/50 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
            </div>
          </div>
        </div>
      )}

      {/* COMPACT HEADER */}
      <div className="flex-shrink-0 bg-black/40 backdrop-blur-xl border-b border-white/10 shadow-xl">
        <div className="px-3 sm:px-4 py-2.5 sm:py-3">
          {/* Current Phase Info */}
          <div className="flex items-center justify-between gap-2 sm:gap-3">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${currentPhaseData.color} rounded-xl flex items-center justify-center shadow-lg flex-shrink-0`}>
                <PhaseIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <h1 className="text-sm sm:text-lg font-bold truncate">
                    {currentPhaseData.name}
                  </h1>
                  {phaseComplete && (
                    <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-400 flex-shrink-0" />
                  )}
                </div>
                <p className="text-xs text-gray-400 truncate">{currentPhaseData.role}</p>
              </div>
            </div>

            <div className="text-right flex-shrink-0">
              <p className="text-lg sm:text-2xl font-bold">{currentPhase}/6</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-2 sm:mt-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-400">
                {userMessageCount}/{currentPhaseData.minMessages} messages
              </span>
              <span className="text-xs text-gray-400">{Math.round(progressPercent)}%</span>
            </div>
            <div className="w-full h-1.5 sm:h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r ${currentPhaseData.color} transition-all duration-500 rounded-full`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Mini Phase Timeline */}
          <div className="flex gap-1 mt-2 sm:mt-3">
            {phases.map((phase) => (
              <div 
                key={phase.id} 
                className={`flex-1 h-1 rounded-full transition-all ${
                  phase.id < currentPhase 
                    ? `bg-gradient-to-r ${phase.color}` 
                    : phase.id === currentPhase 
                    ? `bg-gradient-to-r ${phase.color} animate-pulse`
                    : 'bg-gray-700'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* MESSAGES AREA */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-3 sm:py-4 space-y-3 sm:space-y-4" style={{minHeight: 0}}>
        <div className="max-w-4xl mx-auto space-y-3 sm:space-y-4 pb-3 sm:pb-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-2 sm:gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shadow-lg ${
                message.role === 'user' 
                  ? 'bg-gradient-to-br from-gray-600 to-gray-800' 
                  : `bg-gradient-to-br ${currentPhaseData.color}`
              }`}>
                {message.role === 'user' ? (
                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                ) : (
                  <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                )}
              </div>

              {/* Message Bubble */}
              <div className={`flex-1 ${message.role === 'user' ? 'max-w-[85%]' : 'max-w-[90%]'}`}>
                {message.role === 'user' ? (
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 p-3 sm:p-4 rounded-2xl shadow-lg">
                    <p className="text-sm sm:text-base text-white whitespace-pre-wrap leading-relaxed break-words">
                      {message.content}
                    </p>
                    <p className="text-xs text-gray-400 mt-1.5 sm:mt-2">
                      {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                ) : (
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-3 sm:p-4 rounded-2xl shadow-xl">
                    {/* Coach Badge */}
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                      <div className={`px-2 py-0.5 sm:px-2.5 sm:py-1 bg-gradient-to-r ${currentPhaseData.color} rounded-full flex items-center gap-1 sm:gap-1.5`}>
                        <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                        <span className="text-xs font-bold text-white">{currentPhaseData.coach}</span>
                      </div>
                      <span className="text-xs text-gray-400">{currentPhaseData.role}</span>
                    </div>

                    <p className="text-sm sm:text-base text-white whitespace-pre-wrap leading-relaxed break-words">
                      {message.content}
                    </p>

                    <p className="text-xs text-gray-400 mt-2 sm:mt-3 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full animate-pulse"></span>
                      {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Loading */}
          {isLoading && !showPhaseTransition && (
            <div className="flex gap-2 sm:gap-3">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br ${currentPhaseData.color} rounded-xl flex items-center justify-center shadow-lg`}>
                <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="p-3 sm:p-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-xl">
                <div className="flex items-center gap-2 sm:gap-3">
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 text-white animate-spin" />
                  <span className="text-sm sm:text-base text-white">Jordan is thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* INPUT AREA */}
      <div className="flex-shrink-0 border-t border-white/10 bg-black/40 backdrop-blur-md shadow-2xl">
  <div className="px-3 sm:px-4 py-2.5 sm:py-3">

    {/* Data Preview */}
    <DataPreview />

    {/* Next Phase Button (above input for visibility) */}
    {canMoveToNext && currentPhase < 6 && (
      <div className="mb-2 sm:mb-3 animate-fade-in">
        <button
          onClick={handleNextPhase}
          className={`w-full px-4 py-2.5 sm:px-5 sm:py-3 bg-gradient-to-r ${phases[currentPhase].color} rounded-xl transition-all transform active:scale-95 flex items-center justify-center gap-2 font-bold text-sm sm:text-base shadow-lg`}
        >
          <span className="truncate">Continue to {phases[currentPhase].name}</span>
          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
        </button>
      </div>
    )}

    {/* Finish Button */}
    {currentPhase === 6 && phaseComplete && (
      <div className="mb-2 sm:mb-3 animate-fade-in space-y-2">
        <button
          onClick={() => onComplete()}
          className="w-full px-4 py-2.5 sm:px-5 sm:py-3 bg-gradient-to-r from-teal-500 to-green-500 rounded-xl transition-all transform active:scale-95 flex items-center justify-center gap-2 font-bold text-sm sm:text-base shadow-lg ring-2 sm:ring-4 ring-green-500/30"
        >
          <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
          <span>View Your Complete Plan</span>
        </button>
        <button
          onClick={handleExportSession}
          className="w-full px-4 py-2 sm:px-5 sm:py-2.5 bg-white/10 border border-white/20 rounded-xl transition-all transform active:scale-95 flex items-center justify-center gap-2 font-semibold text-xs sm:text-sm"
        >
          <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
          <span>Download Session Data</span>
        </button>
      </div>
    )}

    {/* Input + Send + Inline Next Phase */}
    <div className="flex gap-2 items-end mt-2">
      <div className="flex-1 min-w-0 relative">
        <textarea
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          placeholder={`Message Jordan...`}
          className="w-full px-3 py-2.5 sm:px-4 sm:py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:ring-2 focus:ring-white/20 text-sm sm:text-base resize-none transition-all"
          rows={1}
          style={{ minHeight: '44px', maxHeight: '88px' }}
        />
        
        
      </div>

      {/* Send Button */}
      <button
        onClick={handleSendMessage}
        disabled={!inputMessage.trim() || isLoading}
        className={`p-2.5 sm:p-3 bg-gradient-to-r ${currentPhaseData.color} active:scale-95 rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0 shadow-lg`}
      >
        <Send className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
      </button>
    </div>

    {!phaseComplete && (
      <p className="text-center text-xs text-gray-400 mt-1.5 sm:mt-2">
        {progressPercent < 100
          ? `Keep going (${userMessageCount}/${currentPhaseData.minMessages})`
          : 'Almost ready to continue...'}
      </p>
    )}
  </div>
</div>


      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }

        @keyframes slide-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.4s ease-out;
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

        .overflow-y-auto {
          -webkit-overflow-scrolling: touch;
          scroll-behavior: smooth;
        }

        @media screen and (max-width: 640px) {
          input, textarea, select {
            font-size: 16px !important;
          }
        }

        .overflow-y-auto::-webkit-scrollbar {
          width: 0px;
        }

        /* Improve tap targets on mobile */
        @media (hover: none) and (pointer: coarse) {
          button {
            min-height: 44px;
          }
        }
      `}</style>
    </div>
  );
}