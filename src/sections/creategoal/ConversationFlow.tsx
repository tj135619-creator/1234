import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { Avatar, Message } from "@shared/schema";
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { cn } from "@/lib/utils";
import apiKeysData from "./apikeys.json";
import { useNavigate } from "react-router-dom";
import { doc, setDoc, serverTimestamp, getDoc, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import ConversationTrailer from "./ConversationTrailer"; // import the trailer component
import ParticlesBackground from './ParticlesBackground';

// FIREBASE CONFIG (YOUR ORIGINAL)
const firebaseConfig = {
  apiKey: "AIzaSyBNCXIOAX2HUdeLvUxkTJh7DVbv8JU485s",
  authDomain: "goalgrid-c5e9c.firebaseapp.com",
  projectId: "goalgrid-c5e9c",
  storageBucket: "goalgrid-c5e9c.firebasestorage.app",
  messagingSenderId: "544004357501",
  appId: "1:544004357501:web:4b81a3686422b28534e014",
  measurementId: "G-BJQMLK9JJ1",
};
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
export const firestore = getFirestore(app);

interface ConversationFlowProps {
  avatar: Avatar | null;
  isLoading: boolean;
  progress: number;
  answers: Record<string, string>;
}

interface Plan {
  [key: string]: any;
}

const avatarStyles = {
  Skyler: { gradient: "from-blue-400 to-blue-600", light: "from-blue-100 to-blue-200", dark: "from-blue-900 to-blue-800" },
  Raven: { gradient: "from-purple-400 to-purple-600", light: "from-purple-100 to-purple-200", dark: "from-purple-900 to-purple-800" },
  Phoenix: { gradient: "from-orange-400 to-red-600", light: "from-orange-100 to-red-200", dark: "from-orange-900 to-red-800" },
};

const avatarIcons = {
  Skyler: "🌤️",
  Raven: "🦅",
  Phoenix: "🔥",
};

export default function ConversationFlow({
  avatar,
  isLoading,
  progress,
  answers,
}: ConversationFlowProps) {
  const style = avatar ? avatarStyles[avatar] : null;
  const [messages, setMessages] = useState<Message[]>([]);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [generatedPlan, setGeneratedPlan] = useState<Plan | null>(null);
  const [typingMessages, setTypingMessages] = useState<Record<string, string>>({});
  const [successfulDays, setSuccessfulDays] = useState(0);
  const [currentAIResponse, setCurrentAIResponse] = useState<Message | null>(null);
  const [currentTyping, setCurrentTyping] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showTrailer, setShowTrailer] = useState(true); 
  const [showParticles, setShowParticles] = useState(false);
  const [messageKey, setMessageKey] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const navigate = useNavigate();
  const auth = getAuth();
  const userId = auth.currentUser?.uid || "user_demo";
  const [localLoading, setLocalLoading] = useState(false);

  const apiKeys = apiKeysData.keys;

  // TOAST NOTIFICATION
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // FOCUS INPUT
  const focusInput = () => {
    setShowInput(true);
    setTimeout(() => textareaRef.current?.focus(), 0);
  };

  // TYPEWRITER EFFECT
  useEffect(() => {
   const latestAI = messages.filter((m) => m.role === "assistant").pop();
  if (!latestAI) return;

  let idx = 0;
  const interval = setInterval(() => {
    idx++;
    setTypingMessages((prev) => ({
      ...prev,
      [latestAI.id]: latestAI.content.slice(0, idx),
    }));
    if (idx >= latestAI.content.length) clearInterval(interval);
  }, 12);

  return () => clearInterval(interval);
}, [messages]);

  // YOUR ORIGINAL LOGIC - COMPLETELY UNCHANGED
  const markPlanAsCreated = async () => {
    try {
      if (!auth.currentUser) {
        console.error("❌ No authenticated user found");
        return;
      }

      const userRef = doc(firestore, "users", auth.currentUser.uid);
      
      await updateDoc(userRef, {
        planCreated: true,
        planCreatedAt: serverTimestamp(),
      });
      
      console.log("✅ planCreated set to true for user:", auth.currentUser.uid);
    } catch (error) {
      console.error("❌ Error marking plan as created:", error);
    }
  };
  
  const handleGeneratePlan = async () => {
  console.log("🚀 Starting 5-day task overview generation...");
  setIsGeneratingPlan(true);

  try {
    const userMessages = messages.filter((m) => m.role === "user");
    const userAnswers = Object.values(answers);
    const goalName =
      (userMessages[0]?.content && userMessages[0].content.trim()) ||
      (userAnswers[0] && userAnswers[0].toString().trim()) ||
      "social skills";

    // Get today's date in YYYY-MM-DD format
    const joinDate = new Date().toISOString().split('T')[0];

    console.log("📅 Join date:", joinDate);
    console.log("🎯 Goal name:", goalName);
    console.log("💬 User answers:", userAnswers);

    const apiKey = apiKeys[Math.floor(Math.random() * apiKeys.length)];
    console.log("🔑 Using API key:", apiKey);

    const payload = {
      user_id: userId,
      goal_name: goalName,
      user_answers: userAnswers,
      join_date: joinDate,  // NEW: Pass the join date
    };

    // Call the NEW endpoint - single call for all 5 days!
    const resp = await fetch(
      "https://one23-u2ck.onrender.com/create-task-overview",  // ← NEW ENDPOINT
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(payload),
      }
    );

    let data: any;
    try {
      data = await resp.json();
    } catch (jsonErr) {
      const rawText = await resp.text();
      console.error("❌ Invalid JSON response from server:", rawText);
      throw new Error(`Failed due to invalid JSON: ${jsonErr}`);
    }

    if (!resp.ok) {
      console.error("❌ Server error:", data);
      throw new Error(data.error || "Failed to generate task overview");
    }

    if (!data.success || !data.overview) {
      console.error("❌ Invalid response structure:", data);
      throw new Error("Task overview data missing or malformed");
    }

    console.log("✅ Task overview received:", data.overview);

    // Save to Firebase - single document with all days
    const courseId = data.course_id || goalName.toLowerCase().replace(" ", "_");
    const userPlanRef = doc(firestore, "users", userId, "datedcourses", courseId);
    
    await setDoc(userPlanRef, {
      task_overview: data.overview,  // Contains all 5 days
      goal_name: goalName,
      user_id: userId,
      course_id: courseId,
      generated_at: serverTimestamp(),
      created_at: serverTimestamp(),
    });

    console.log("✅ 5-day task overview successfully saved to Firebase");

    // Update progress indicator (all 5 days at once)
    setSuccessfulDays(5);

    // Mark plan as created
    await markPlanAsCreated();
    
    setShowParticles(true);
    showToast("🎉 Your 5-day plan is ready!", "success");

  } catch (err) {
    console.error("🔥 handleGeneratePlan error:", err);
    showToast(`⚠️ Plan generation failed: ${err.message}`, "error");
  } finally {
    setIsGeneratingPlan(false);
    setTimeout(() => {
      navigate("/");
    }, 2000);
  }

  console.log("⏹️ Task overview generation finished.");
};



  const handleSend = () => {
    if (!inputValue.trim() || isLoading || localLoading) return;
    handleSendMessage(inputValue.trim());
    setInputValue("");
    setShowInput(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

const handleSendMessage = async (msgContent: string) => {
  if (!msgContent.trim() || localLoading || isLoading) return;

  // 1️⃣ Add user message immediately
  const userMessage: Message = {
    id: Date.now().toString(),
    role: "user",
    content: msgContent,
  };
  setMessages((prev) => [...prev, userMessage]);
  setInputValue("");
  setShowInput(false);
  setLocalLoading(true);

  // 2️⃣ Call AI API
  const apiKey = apiKeys[Math.floor(Math.random() * apiKeys.length)];
  try {
    const payload = {
      user_id: userId,
      message: msgContent,
      goal_name: answers["q1"] || "social skills",
      answers,
    };

    const resp = await fetch("https://one23-u2ck.onrender.com/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    const rawText = await resp.text();
    let data: any;
    try {
      data = JSON.parse(rawText);
    } catch {
      data = { reply: rawText };
    }

    // 3️⃣ Set AI message separately for typing
    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: data.reply || "I understand. Tell me more.",
    };
    setCurrentAIResponse(aiMessage);
    setCurrentTyping("");

    // 4️⃣ Typewriter effect
    let idx = 0;
    const interval = setInterval(() => {
      idx++;
      setCurrentTyping(aiMessage.content.slice(0, idx));
      if (idx >= aiMessage.content.length) {
        clearInterval(interval);
        // 5️⃣ Add AI message to main messages list after typing finishes
        setMessages((prev) => [...prev, aiMessage]);
        setCurrentAIResponse(null);
      }
    }, 12);
  } catch (err) {
    console.error("AI fetch error:", err);
    const errorMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: "I'm having trouble connecting to the AI. Try again.",
    };
    setMessages((prev) => [...prev, errorMessage]);
  } finally {
    setLocalLoading(false);
  }
};

  // GET LATEST AI MESSAGE
const latestAI = messages.filter((m) => m.role === "assistant").pop();
const displayMessage = latestAI
  ? typingMessages[latestAI.id] || latestAI.content
  : "Hey! What is it that you exactly want to achieve in your social life or social skills?";


  const cardGradientClasses = style?.light || "from-gray-100 to-gray-200";

  return (
    <div className="relative w-full min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 overflow-hidden">
      <ParticlesBackground />

 	{/* Trailer Overlay */}
      {showTrailer && <ConversationTrailer onClose={() => setShowTrailer(false)} />}
      
      {/* ANIMATED BACKGROUND BLOBS */}
      {/* DYNAMIC AMBIENCE: STARFIELD & CONTEXTUAL LIGHTING */}
<div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
  {/* Contextual Lighting Effect (Subtle glow matching avatar) */}
  <div className={`absolute inset-0 transition-all duration-1000 ${
    avatar === 'Skyler' ? 'bg-blue-500/5' :
    avatar === 'Raven' ? 'bg-purple-500/5' :
    avatar === 'Phoenix' ? 'bg-orange-500/5' : ''
  } blur-3xl opacity-50 animate-pulse`} />
  
  {/* Starfield Placeholder (Requires CSS/Library implementation) */}
  <div className="w-full h-full bg-transparent starfield-effect">
    {/* If using CSS: Add background-image or ::before for starfield */}
  </div>
</div>

      

      {/* MAIN AI MESSAGE - RESPONSIVE CARD */}
<div className="fixed inset-0 flex items-start  justify-center z-20 px-6 pt-80 pb-40 overflow-y-auto">
  <div
    key={messageKey}
    className={`w-full max-w-3xl transform transition-all duration-700 ${
      isGeneratingPlan ? "scale-90 opacity-30" : "scale-100 opacity-100"
    }`}
  >
    <div
  className={`relative p-8 rounded-3xl shadow-2xl border border-purple-400/30 bg-gradient-to-br from-purple-600 via-pink-500 to-purple-700 overflow-hidden group transition-all duration-300`}
  style={{
    // Apply the inner shadow/light source effect here
    boxShadow: `
      0 0 10px rgba(186, 85, 211, 0.3), /* Outer glow (soft purple) */
      inset 0 0 15px rgba(255, 255, 255, 0.4), /* Inner white glow/reflection */
      inset 0 0 5px rgba(255, 0, 255, 0.2) /* Inner magenta light */
    `,
    border: '1px solid rgba(200, 100, 255, 0.3)' // Slightly thicker, more pronounced border
  }}
>

      {/* CARD SHINE */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 transform -skew-x-12"></div>

      {/* DECORATIVE LIGHTS */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/20 to-transparent rounded-full blur-2xl opacity-50"></div>
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-t from-white/10 to-transparent rounded-full blur-2xl opacity-30"></div>

      {/* TEXT CONTENT */}
      <div className="relative z-10">
        <p
  className="text-black text-lg md:text-2xl lg:text-3xl font-semibold leading-relaxed whitespace-pre-wrap break-words"
>
  {currentTyping || messages.filter((m) => m.role === "assistant").pop()?.content || "Hey! What do you want to achieve?"}
</p>

      </div>

      {localLoading && (
        <span className="inline-block ml-1 h-8 w-1 bg-gradient-to-r from-gray-300 to-gray-500 animate-pulse rounded-sm"></span>
      )}
    </div>
  </div>
</div>


      {/* PROGRESS CIRCLE - DURING GENERATION */}
      {isGeneratingPlan && (
        <div className="fixed inset-0 flex items-center justify-center z-30 pointer-events-none">
          <style>{`
            @keyframes rotateCircle {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}</style>
          
          <div className="relative w-56 h-56">
            <svg className="w-full h-full transform -rotate-90 drop-shadow-2xl" viewBox="0 0 160 160">
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#60a5fa" />
                  <stop offset="50%" stopColor="#a78bfa" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>

              {/* Background Circle */}
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="10"
              />

              {/* Progress Circle */}
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke="url(#progressGradient)"
                strokeWidth="10"
                strokeDasharray={`${(successfulDays / 5) * 439} 439`}
                strokeLinecap="round"
                className="transition-all duration-700"
                filter="url(#glow)"
              />
            </svg>

            {/* Center Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-center">
                <p className="text-7xl font-black text-white drop-shadow-2xl">{successfulDays}</p>
                <p className="text-2xl text-blue-100 font-semibold drop-shadow-lg">of 5 days</p>
                <div className="mt-4 flex gap-1 justify-center">
                  {[1, 2, 3, 4, 5].map((day) => (
                    <div
                      key={day}
                      className={`h-2 rounded-full transition-all duration-500 ${
                        day <= successfulDays
                          ? 'w-3 bg-gradient-to-r from-blue-400 to-purple-400'
                          : 'w-2 bg-white/20'
                      }`}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONFETTI PARTICLES */}
      {showParticles && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-pulse"
              style={{
                left: Math.random() * 100 + "%",
                top: Math.random() * 100 + "%",
                animation: `fall ${2 + Math.random() * 1}s linear forwards`,
                animationDelay: `${Math.random() * 0.5}s`,
              }}
            ></div>
          ))}
          <style>{`
            @keyframes fall {
              to {
                transform: translateY(${100 + Math.random() * 200}px) rotate(${Math.random() * 360}deg);
                opacity: 0;
              }
            }
          `}</style>
        </div>
      )}

      {/* GENERATE PLAN - PREMIUM BUTTON TOP CENTER */}
<div className="fixed top-36 left-1/2 transform -translate-x-1/2 z-50 pointer-events-auto">
  <button
    onClick={handleGeneratePlan}
    disabled={isLoading || isGeneratingPlan || localLoading}
    className={`relative w-80 h-20 md:w-96 md:h-24 rounded-full font-extrabold text-2xl md:text-3xl flex items-center justify-center gap-4 transition-all duration-500 overflow-hidden group ${
      isGeneratingPlan
        ? "bg-gradient-to-r from-purple-600 via-pink-500 to-purple-700 text-white scale-105"
        : "bg-gradient-to-r from-purple-700 via-pink-600 to-purple-500 text-white hover:scale-110 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
    }`}
    style={{
      boxShadow: isGeneratingPlan
        ? "0 0 60px rgba(186,85,211,0.9), inset 0 0 25px rgba(255,255,255,0.15)"
        : "0 0 45px rgba(186,85,211,0.8), inset 0 0 20px rgba(255,255,255,0.2)",
    }}
  >
    {/* SHIMMER EFFECT */}
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 transform -skew-x-12 animate-pulse"></div>

    {/* ICON + TEXT */}
    <span className="relative z-10 flex items-center gap-3">
      {isGeneratingPlan ? "⏳" : "⚡"} Generate Your Plan
    </span>
  </button>
</div>






   {/* INPUT AREA - ALWAYS VISIBLE */}
<div
  className="fixed bottom-0 left-0 right-0 z-50 px-6 py-6 pointer-events-auto translate-y-0"
  style={{
    background: "linear-gradient(to top, rgba(55,0,100,0.95), rgba(75,0,130,0.7), transparent)",
    backdropFilter: "blur(20px)",
  }}
>
  <div className="flex gap-3 max-w-3xl mx-auto">
    <div className="flex-1 relative">
      <Textarea
        ref={textareaRef}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Share your thoughts..."
        className="w-full min-h-[56px] max-h-32 resize-none bg-purple-900/30 text-white border border-purple-600/30 placeholder-purple-300 focus:ring-2 focus:ring-purple-500
 focus:border-transparent focus:outline-none transition-all duration-300 backdrop-blur-sm"
        disabled={localLoading || isGeneratingPlan}
      />
    </div>

    <button
      onClick={handleSend}
      disabled={localLoading || isGeneratingPlan || !inputValue.trim()}
      className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 border border-purple-400/30
  relative overflow-hidden group"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -skew-x-12"></div>
      <span className="relative z-10">✉️</span>
    </button>
  </div>

  {/* SUGGESTION PILLS - ANIMATED */}
  <div className="flex gap-2 mt-4 max-w-3xl mx-auto flex-wrap">
    {["Help me start", "What's next?", "Tell me more"].map((suggestion, i) => (
      <button
        key={i}
        onClick={() => {
          setInputValue(suggestion);
          textareaRef.current?.focus();
        }}
        className="px-4 py-2 bg-white/5 hover:bg-white/15 text-gray-200 text-sm rounded-full transition-all duration-300 border border-white/10 hover:border-white/30 backdrop-blur-sm hover:scale-105 transform"
        style={{
          animation: `slideInUp 0.5s ease-out forwards`,
          animationDelay: `${i * 0.1}s`,
          opacity: 0,
        }}
      >
        {suggestion}
      </button>
    ))}
    <style>{`
      @keyframes slideInUp {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `}</style>
  </div>
</div>


        {/* SUGGESTION PILLS - ANIMATED */}
        <div className="flex gap-2 mt-4 max-w-3xl mx-auto flex-wrap">
          
          
          <style>{`
            @keyframes slideInUp {
              from {
                opacity: 0;
                transform: translateY(10px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `}</style>
        </div>
      </div>
  );
}