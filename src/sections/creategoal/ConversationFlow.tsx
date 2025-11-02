import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { initializeApp, getApps } from "firebase/app";
import { getFirestore, doc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";


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

interface Message {
id: string;
role: "user" | "assistant";
content: string;
}

interface Avatar {
name: "Skyler" | "Raven" | "Phoenix";
}

// AVATAR PERSONALITIES - ACTUALLY DIFFERENT
const AVATAR_PERSONALITIES = {
Skyler: {
icon: "🌤️",
gradient: "from-purple-400 via-blue-400 to-purple-500",
borderGlow: "rgba(147, 51, 234, 0.6)",
greeting: "Hey. No pressure here. What's one thing about your social life you wish was different?",
style: "analytical",
followUp: "I get that. What would it feel like if that changed, even a little?",
},
Raven: {
icon: "🦅",
gradient: "from-purple-600 via-violet-500 to-purple-600",
borderGlow: "rgba(124, 58, 237, 0.6)",
greeting: "Most advice doesn't work for people like us. What's been on your mind lately?",
style: "creative",
followUp: "That makes sense. What's one small thing you'd try if you knew no one would judge you?",
},
Phoenix: {
icon: "🔥",
gradient: "from-purple-700 via-fuchsia-600 to-purple-700",
borderGlow: "rgba(168, 85, 247, 0.6)",
greeting: "Let's keep this simple. What's making you feel stuck right now?",
style: "intense",
followUp: "Got it. What's the smallest step that doesn't feel overwhelming?",
},
};

const GENERATION_STEPS = [
{ icon: "🔍", text: "Analyzing your goal..." },
{ icon: "📊", text: "Finding similar success patterns..." },
{ icon: "✍️", text: "Customizing Day 1: Foundation..." },
{ icon: "✍️", text: "Customizing Day 2: Momentum..." },
{ icon: "✍️", text: "Customizing Day 3: Breakthrough..." },
{ icon: "✍️", text: "Customizing Day 4: Refinement..." },
{ icon: "✍️", text: "Customizing Day 5: Commitment..." },
{ icon: "✅", text: "Finalizing your personalized plan..." },
];


interface ConversationFlowProps {
avatar: Avatar | null;
isLoading: boolean;
progress: number;
answers: Record<string, string>;
}

// CONSTELLATION BACKGROUND COMPONENT
// CONSTELLATION BACKGROUND COMPONENT - ORGANIC INDIVIDUAL MOVEMENT
// CONSTELLATION BACKGROUND - MECHANICAL STYLE (like AILocationDiscovery)
const ConstellationBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Create particles (stars)
    const particles: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      opacity: number;
    }[] = [];

    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3, // Slow horizontal drift
        vy: (Math.random() - 0.5) * 0.3, // Slow vertical drift
        radius: Math.random() * 2 + 1,
        opacity: Math.random() * 0.4 + 0.3
      });
    }

    const maxDistance = 120;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update particle positions
      particles.forEach(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Bounce off edges
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;
      });

      // Draw connections (constellation lines)
      particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach(p2 => {
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < maxDistance) {
            const opacity = (1 - distance / maxDistance) * 0.15;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(168, 85, 247, ${opacity})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        });
      });

      // Draw particles (stars)
      particles.forEach(particle => {
        // Main star dot
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(168, 85, 247, ${particle.opacity})`;
        ctx.fill();

        // Subtle glow
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius + 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(168, 85, 247, ${particle.opacity * 0.3})`;
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
};


export default function ConversationFlow({ avatar, isLoading, progress, answers }: ConversationFlowProps) {
const [messages, setMessages] = useState<Message[]>([]);
const [inputValue, setInputValue] = useState("");
const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
const [hasSharedGoal, setHasSharedGoal] = useState(false);
const [showExamplePlan, setShowExamplePlan] = useState(true);
const [currentStep, setCurrentStep] = useState(0);
const [planPreview, setPlanPreview] = useState<any>(null);
const [isTyping, setIsTyping] = useState(false);
const [typingText, setTypingText] = useState("");

const textareaRef = useRef<HTMLTextAreaElement>(null);
const [localLoading, setLocalLoading] = useState(false);
const [successfulDays, setSuccessfulDays] = useState(0);
const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

const navigate = useNavigate();
const auth = getAuth();
const userId = auth.currentUser?.uid || "user_demo";
const messagesEndRef = useRef<HTMLDivElement>(null);

const avatarConfig = avatar ? AVATAR_PERSONALITIES[avatar.name] : AVATAR_PERSONALITIES.Skyler;

// Remove the import line completely

// Replace the apiKeys line with:
const apiKeys = [
  "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",
  "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"
];

// TOAST NOTIFICATION
const showToast = (message: string, type: 'success' | 'error' = 'success') => {
setToast({ message, type });
setTimeout(() => setToast(null), 3500);
};


// Auto-scroll to bottom
useEffect(() => {
messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
}, [messages, typingText]);

// Typewriter effect for AI messages
useEffect(() => {
const lastMsg = messages[messages.length - 1];
if (!lastMsg || lastMsg.role !== "assistant") return;

setIsTyping(true);
setTypingText("");

let index = 0;
const interval = setInterval(() => {
setTypingText(lastMsg.content.slice(0, index + 1));
index++;
if (index >= lastMsg.content.length) {
clearInterval(interval);
setIsTyping(false);
}
}, 20);

return () => clearInterval(interval);
}, [messages]);

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
setShowExamplePlan(false);
setLocalLoading(true);

// Mark that user shared goal
if (!hasSharedGoal) {
setHasSharedGoal(true);
}

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

// 3️⃣ Add AI message
const aiMessage: Message = {
id: (Date.now() + 1).toString(),
role: "assistant",
content: data.reply || "I understand. Tell me more.",
};
setMessages((prev) => [...prev, aiMessage]);
} catch (err) {
console.error("AI fetch error:", err);
const errorMessage: Message = {
id: (Date.now() + 1).toString(),
role: "assistant",
content: "I'm having trouble connecting. Try again.",
};
setMessages((prev) => [...prev, errorMessage]);
} finally {
setLocalLoading(false);
}
};

const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    handleSendMessage(inputValue);
  }
};

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
console.log("✅ planCreated set to true");
} catch (error) {
console.error("❌ Error marking plan as created:", error);
}
};

const handleGeneratePlan = async () => {
console.log("🚀 Starting 5-day task overview generation...");
setIsGeneratingPlan(true);
setCurrentStep(0);

try {
const userMessages = messages.filter((m) => m.role === "user");
const userAnswers = Object.values(answers);
const goalName =
(userMessages[0]?.content && userMessages[0].content.trim()) ||
(userAnswers[0] && userAnswers[0].toString().trim()) ||
"social skills";

const joinDate = new Date().toISOString().split('T')[0];
const apiKey = apiKeys[Math.floor(Math.random() * apiKeys.length)];

const payload = {
user_id: userId,
goal_name: goalName,
user_answers: userAnswers,
join_date: joinDate,
};

// Simulate step-by-step progress
const progressInterval = setInterval(() => {
setCurrentStep(prev => {
if (prev < GENERATION_STEPS.length) return prev + 1;
return prev;
});
}, 1200);

const resp = await fetch(
"https://one23-u2ck.onrender.com/create-task-overview",
{
method: "POST",
headers: {
"Content-Type": "application/json",
Authorization: `Bearer ${apiKey}`,
},
body: JSON.stringify(payload),
}
);

clearInterval(progressInterval);

let data: any;
try {
data = await resp.json();
} catch (jsonErr) {
const rawText = await resp.text();
console.error("❌ Invalid JSON response:", rawText);
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

// Save to Firebase
const courseId = "social_skills"; // Force it to always save as 'social_skills'
const userPlanRef = doc(firestore, "users", userId, "datedcourses", courseId);

await setDoc(userPlanRef, {
task_overview: data.overview,
goal_name: goalName,
user_id: userId,
course_id: courseId,
generated_at: serverTimestamp(),
created_at: serverTimestamp(),
});

console.log("✅ 5-day task overview saved to Firebase");

setSuccessfulDays(5);
setCurrentStep(GENERATION_STEPS.length);
await markPlanAsCreated();

// Show plan preview
setPlanPreview({
days: data.overview.days || [
{ day: 1, title: "Build Foundation", task: "Start with 15min daily practice" },
{ day: 2, title: "Gain Momentum", task: "Increase to 30min, track progress" },
{ day: 3, title: "Push Boundaries", task: "Try one challenging scenario" },
{ day: 4, title: "Reflect & Adjust", task: "Review what's working" },
{ day: 5, title: "Commit Long-term", task: "Set up sustainable routine" },
]
});

showToast("🎉 Your 5-day plan is ready!", "success");

} catch (err: any) {
console.error("🔥 handleGeneratePlan error:", err);
showToast(`⚠️ Plan generation failed: ${err.message}`, "error");
} finally {
setIsGeneratingPlan(false);
}
};



const latestAIMessage = isTyping ? typingText : messages.filter(m => m.role === "assistant").pop()?.content;

return (
<div className="relative w-full min-h-screen bg-gradient-to-br from-purple-950 via-purple-900 to-purple-950 overflow-hidden" style={{ perspective: '1000px' }}>

{/* ANIMATED GRADIENT + CONSTELLATION BACKGROUND */}
<div className="fixed inset-0 pointer-events-none">
{/* Animated changing gradient */}
<div className="absolute inset-0 animate-gradient-shift" 
     style={{
       background: 'linear-gradient(-45deg, #1a0b2e, #2d1b4e, #1e1533, #0f0520)',
       backgroundSize: '400% 400%'
     }} />

{/* Constellation effect */}
<ConstellationBackground />

{/* Subtle ambient orbs (dimmed) */}
<div className="absolute top-20 left-20 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-float" />
<div className="absolute bottom-20 right-20 w-[500px] h-[500px] bg-fuchsia-600/10 rounded-full blur-3xl animate-float-delayed" />
</div>

{/* MAIN CONTENT CONTAINER */}
{/* MAIN CONTENT CONTAINER */}
<div className="relative z-10 flex flex-col items-center min-h-screen px-6 pt-8 pb-40">
  <div className="flex-1 flex items-center justify-center w-full">
    <div className="w-full max-w-4xl">


{/* PAGE HEADER - REASSURING */}
<div className="relative z-10 pt-12 pb-8 px-6 text-center">
  <div className="max-w-3xl mx-auto">
    <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-purple-800/40 backdrop-blur-sm rounded-full border border-purple-500/30">
      <span className="text-sm font-medium text-purple-200">Starting Point</span>
    </div>
    
    <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
      Let's Start With Where You Are Right Now
    </h1>
    
    <p className="text-base md:text-lg text-purple-200 leading-relaxed mb-6">
      I'll ask a few simple questions to understand what's going on in your life. 
      Nothing scary—just enough to make sure the plan actually makes sense for you.
    </p>
    
    <div className="inline-block bg-purple-900/40 backdrop-blur-sm border border-purple-400/30 rounded-2xl px-6 py-3">
      <p className="text-sm text-purple-300">
        💬 Usually takes 2 minutes. Go at your own pace.
      </p>
    </div>
  </div>
</div>

{/* HERO SECTION - 3D ELEVATED */}
{showExamplePlan && messages.length === 0 && (
<div className="w-full max-w-4xl mb-12 text-center animate-fade-in-3d">
<h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight leading-tight"
style={{
textShadow: '0 4px 12px rgba(168, 85, 247, 0.3)',
transform: 'translateZ(50px)'
}}>
You're Not the Only One<br />
<span className="text-purple-300">Who Feels Left Behind Socially</span>
</h1>
<p className="text-lg text-purple-200 mb-4 leading-relaxed" style={{ transform: 'translateZ(30px)' }}>
Most people here started exactly where you are.<br />
Quiet. Unsure. Just wanting one real connection.
</p>
<p className="text-sm text-purple-300/70 mb-12" style={{ transform: 'translateZ(30px)' }}>
This isn't about "fixing" yourself. It's about small steps that don't feel scary.
</p>

{/* EXAMPLE PLAN PREVIEW - 3D CARDS */}
<div className="relative mb-12" style={{ transform: 'translateZ(20px)', transformStyle: 'preserve-3d' }}>
<div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-fuchsia-600/20 rounded-3xl blur-xl" style={{ transform: 'translateZ(-10px)' }} />

<div className="relative bg-gradient-to-br from-purple-900/40 to-purple-950/40 backdrop-blur-2xl border border-purple-400/30 rounded-3xl p-10 shadow-2xl"
style={{
boxShadow: '0 25px 50px -12px rgba(168, 85, 247, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.1)',
transform: 'translateZ(0px)'
}}>
<h3 className="text-2xl font-bold text-white mb-8" style={{ textShadow: '0 4px 12px rgba(168, 85, 247, 0.5)' }}>
Heres What's gonna happen
</h3>

<div className="grid gap-5">
{[
{ 
      day: 1, 
      title: "Just Get Started", 
      task: "Today is about getting comfortable with the idea. No pressure to do anything big—just think about one small social interaction you could have this week.",
      tips: [
        "Pick a low-stakes moment (like saying hi to a neighbor)",
        "Don't judge yourself if you don't do it today",
        "Just notice where you feel most comfortable"
      ]
    },
    { 
      day: 2, 
      title: "Visit Your First Place", 
      task: "Today, you'll visit one of the places we identified. You don't have to talk to anyone—just go there, observe, and get a feel for the environment. Maybe grab a coffee or browse for 10 minutes.",
      tips: [
        "Go during a quieter time if that feels easier",
        "Notice what people are doing (reading, working, chatting)",
        "It's okay to just sit and be present—that counts"
      ]
    },
    { 
      day: 3, 
      title: "Try One Small Interaction", 
      task: "Return to the same place or try a different one. This time, aim for one tiny interaction—asking a barista a question, commenting on someone's book, or just making eye contact and smiling.",
      tips: [
        "Pick the easiest option that doesn't feel scary",
        "If it doesn't happen naturally, that's fine—try again tomorrow",
        "Even just being there builds your comfort level"
      ]
    },
    { 
      day: 4, 
      title: "Reflect on What Felt Right", 
      task: "Take a break from going out. Today is for thinking about what worked and what didn't. Which place felt most comfortable? What made you nervous? What would make it easier next time?",
      tips: [
        "Write down what you noticed about yourself",
        "Don't criticize yourself—just observe",
        "Adjust your approach based on what felt manageable"
      ]
    },
    { 
      day: 5, 
      title: "Make It Your Routine", 
      task: "Go back to your favorite spot one more time. By now, it should feel a little more familiar. The goal is to make this place part of your regular routine—not to force friendships, just to exist in a social space comfortably.",
      tips: [
        "Aim to go at least once a week moving forward",
        "You might start recognizing familiar faces (that's progress)",
        "Consistency matters more than big breakthroughs"
      ]
    },
  
].map((item, idx) => (
<div key={item.day}
className="group relative flex items-start gap-5 bg-gradient-to-r from-purple-800/30 to-purple-900/30 backdrop-blur-sm rounded-2xl p-6 border border-purple-400/20 transition-all duration-500 hover:scale-105 hover:border-purple-400/50"
style={{
boxShadow: '0 10px 30px -10px rgba(168, 85, 247, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.1)',
transform: `translateZ(${5 + idx * 2}px)`,
transformStyle: 'preserve-3d'
}}>
{/* 3D number badge */}
<div className={`flex-shrink-0 w-16 h-16 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg group-hover:shadow-2xl transition-all duration-500`}
style={{
boxShadow: '0 10px 25px -5px rgba(168, 85, 247, 0.5), inset 0 2px 4px rgba(255, 255, 255, 0.3)',
transform: 'translateZ(10px)'
}}>
{item.day}
</div>
<div className="flex-1 text-left">
<h4 className="text-white font-bold text-xl mb-2">{item.title}</h4>
<p className="text-purple-200 text-base leading-relaxed">{item.desc}</p>
</div>

{/* Hover glow effect */}
<div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-400/5 to-purple-500/0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
</div>
))}
</div>
</div>
</div>

{/* 3D CTA BUTTON */}
<button
onClick={() => {
setShowExamplePlan(false);
setTimeout(() => textareaRef.current?.focus(), 100);
}}
className="relative px-10 py-5 bg-gradient-to-r from-purple-600 via-fuchsia-600 to-purple-600 text-white text-xl font-black rounded-full transition-all duration-500 hover:scale-110 group overflow-hidden"
style={{
boxShadow: '0 20px 40px -10px rgba(168, 85, 247, 0.6), inset 0 2px 4px rgba(255, 255, 255, 0.3)',
transform: 'translateZ(60px)'
}}>
{/* Shine effect */}
<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
<span className="relative z-10 flex items-center gap-3">
I'm Ready to Start (Take Your Time)
</span>
</button>
</div>
)}

{/* CONVERSATION MESSAGES - 3D DEPTH */}
{/* LATEST AI MESSAGE - CENTERED & ELEVATED */}
{!showExamplePlan && (
  <div className="w-full max-w-2xl mx-auto">
    <div className="animate-slide-in-3d">
      <div
        className="rounded-2xl p-6 bg-purple-900/40 backdrop-blur-lg border border-purple-400/20 text-white"
        style={{
          boxShadow: '0 8px 16px -4px rgba(168, 85, 247, 0.3)',
        }}
      >
        {/* Avatar Header - Smaller */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center text-lg">
            {avatarConfig.icon}
          </div>
          <span className="text-sm text-purple-300 font-medium">
            {avatar?.name || "Skyler"}
          </span>
        </div>

        {/* AI Message Text - Smaller */}
        <p className="text-base md:text-lg leading-relaxed whitespace-pre-wrap">
          {isTyping 
            ? typingText 
            : messages.filter(m => m.role === "assistant").pop()?.content || avatarConfig.greeting}
        </p>

        {/* Typing Cursor */}
        {(isTyping || localLoading) && (
          <span className="inline-block w-1.5 h-5 bg-purple-400 ml-1 animate-pulse rounded-sm" />
        )}
      </div>
    </div>
  </div>
)}

{/* PLAN GENERATION STATUS - 3D MODAL */}
{isGeneratingPlan && (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="relative max-w-2xl w-full">
      <div className="bg-gradient-to-br from-purple-900 via-purple-800 to-fuchsia-900 rounded-2xl shadow-2xl overflow-hidden border border-purple-500/30 p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-fuchsia-500 rounded-2xl mb-4 shadow-lg animate-pulse">
            <span className="text-5xl">⚡</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Creating Your Plan
          </h2>
          <p className="text-purple-200">This will take about 10 seconds...</p>
        </div>

        <div className="space-y-3 mb-6">
          {GENERATION_STEPS.map((step, index) => (
            <div
              key={index}
              className={`flex items-center gap-4 transition-all duration-500 ${
                index < currentStep ? "opacity-100" : "opacity-40"
              }`}
            >
              <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold transition-all duration-300 ${
                index < currentStep
                  ? "bg-gradient-to-br from-purple-500 to-fuchsia-500 text-white shadow-lg"
                  : "bg-purple-800/40 text-purple-400"
              }`}>
                {index < currentStep ? "✓" : step.icon}
              </div>
              <p className="text-white font-medium">{step.text}</p>
            </div>
          ))}
        </div>

        <div className="relative h-3 bg-purple-950/50 rounded-full overflow-hidden border border-purple-500/20">
          <div
            className="h-full bg-gradient-to-r from-purple-500 via-fuchsia-500 to-purple-600 transition-all duration-500 rounded-full shadow-lg"
            style={{
              width: `${(currentStep / GENERATION_STEPS.length) * 100}%`
            }}
          />
        </div>
      </div>
    </div>
  </div>
)}


{/* PLAN PREVIEW - 3D ELEVATED MODAL */}
{planPreview && !isGeneratingPlan && (
<div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
<div className="relative max-w-2xl w-full my-8">
<div className="bg-gradient-to-br from-purple-900 via-purple-800 to-fuchsia-900 rounded-2xl shadow-2xl overflow-hidden border border-purple-500/30">
<div className="bg-gradient-to-r from-purple-600 to-fuchsia-600 px-8 py-6">
<div className="flex items-center gap-3 mb-2">
<span className="text-4xl">🎉</span>
<h2 className="text-3xl font-bold text-white">Your Plan is Ready</h2>
</div>
<p className="text-purple-100">Take it one day at a time. You've got this!</p>
</div>

<div className="p-6 max-h-96 overflow-y-auto">
<div className="space-y-3">
{planPreview.days.map((day: any) => (
<div key={day.day} className="flex gap-4 p-4 bg-purple-800/40 backdrop-blur-sm rounded-xl hover:bg-purple-700/50 transition-colors border border-purple-500/20">
<div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-500 to-fuchsia-500 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg">
{day.day}
</div>
<div className="flex-1 min-w-0">
<h3 className="font-semibold text-white mb-1">{day.title}</h3>
<p className="text-sm text-purple-200">{day.task}</p>
</div>
</div>
))}
</div>
</div>

<div className="flex gap-3 p-6 bg-purple-950/50 border-t border-purple-500/20">
<button
onClick={() => setPlanPreview(null)}
className="flex-1 px-6 py-3 bg-purple-800/50 border-2 border-purple-500/30 text-white font-semibold rounded-lg hover:bg-purple-700/50 hover:border-purple-400/50 transition-colors">
Adjust Plan
</button>
<button
onClick={() => navigate("/")}
className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white font-semibold rounded-lg hover:from-purple-500 hover:to-fuchsia-500 transition-all shadow-lg hover:shadow-xl">
Start Day 1 🚀
</button>
</div>
</div>
</div>
</div>
)}
</div>
</div>
</div>

{/* GENERATE PLAN BUTTON - 3D FLOATING */}
{/* GENERATE PLAN BUTTON - 3D FLOATING TOP */}
{/* GENERATE PLAN BUTTON - 3D FLOATING TOP */}
{hasSharedGoal && !isGeneratingPlan && !planPreview && (
<button
onClick={handleGeneratePlan}
className="fixed top-6 right-6 z-40 group px-5 py-2.5 bg-purple-900/60 hover:bg-purple-800/70 backdrop-blur-lg border-2 border-purple-400/30 hover:border-purple-400/50 text-white text-sm font-medium rounded-2xl transition-all duration-300 shadow-md hover:shadow-purple-500/30"
>
  <span className="flex items-center gap-2">
    <svg className="w-4 h-4 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
    <span>Create My Plan</span>
  </span>
</button>
)}

{!showExamplePlan && !planPreview && !isGeneratingPlan && (
  <div className="fixed bottom-0 left-0 right-0 z-40 px-4 py-4 bg-purple-950/90 backdrop-blur-lg border-t border-purple-400/20">
    <div className="max-w-2xl mx-auto">
      <div className="bg-purple-900/40 border border-purple-400/30 rounded-2xl p-3 shadow-lg">
        <Textarea
          ref={textareaRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="What's been on your mind? (no pressure, just share what feels right)"
          className="w-full min-h-[60px] max-h-[120px] bg-transparent border-none text-white text-base placeholder:text-purple-300/60 focus:outline-none resize-none p-3"
        />

        {/* Send button - Simpler */}
        <div className="flex justify-end pt-2">
          <button
            onClick={() => handleSendMessage(inputValue)}
            disabled={!inputValue.trim()}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-purple-600"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  </div>
)}

{/* TOAST NOTIFICATION */}
{toast && (
<div className={`fixed top-8 left-1/2 transform -translate-x-1/2 z-[100] px-8 py-4 rounded-2xl shadow-2xl backdrop-blur-xl border-2 transition-all duration-500 ${
toast.type === 'success'
? 'bg-green-900/90 border-green-400/50 text-green-100'
: 'bg-red-900/90 border-red-400/50 text-red-100'
}`}
style={{ boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.5)' }}>
<p className="text-lg font-bold">{toast.message}</p>
</div>
)}

{/* CSS ANIMATIONS */}
<style jsx>{`
@keyframes float {
0%, 100% { transform: translateY(0px) translateZ(50px); }
50% { transform: translateY(-20px) translateZ(50px); }
}

@keyframes float-delayed {
0%, 100% { transform: translateY(0px) translateZ(-50px); }
50% { transform: translateY(20px) translateZ(-50px); }
}

@keyframes fade-in-3d {
from {
opacity: 0;
transform: translateZ(-50px) scale(0.95);
}
to {
opacity: 1;
transform: translateZ(0px) scale(1);
}
}

@keyframes slide-in-3d {
from {
opacity: 0;
transform: translateX(-30px) translateZ(-20px);
}
to {
opacity: 1;
transform: translateX(0) translateZ(0);
}
}

@keyframes pulse-3d {
0%, 100% {
transform: translateZ(30px) scale(1);
box-shadow: 0 20px 40px -10px rgba(168, 85, 247, 0.7);
}
50% {
transform: translateZ(30px) scale(1.05);
box-shadow: 0 25px 50px -10px rgba(168, 85, 247, 0.9);
}
}

@keyframes bounce-subtle {
0%, 100% { transform: translateZ(40px) translateY(0); }
50% { transform: translateZ(40px) translateY(-10px); }
}

.animate-float {
animation: float 6s ease-in-out infinite;
}

.animate-float-delayed {
animation: float-delayed 8s ease-in-out infinite;
}

.animate-fade-in-3d {
animation: fade-in-3d 0.8s ease-out forwards;
}

.animate-slide-in-3d {
animation: slide-in-3d 0.6s ease-out forwards;
}

.animate-pulse-3d {
animation: pulse-3d 2s ease-in-out infinite;
}

.animate-bounce-subtle {
animation: bounce-subtle 2s ease-in-out infinite;
}


@keyframes float {
0%, 100% { transform: translateY(0px) translateZ(50px); }
50% { transform: translateY(-20px) translateZ(50px); }
}

@keyframes float-delayed {
0%, 100% { transform: translateY(0px) translateZ(-50px); }
50% { transform: translateY(20px) translateZ(-50px); }
}

/* 🌈 ADD THIS NEW ANIMATION */
@keyframes gradient-shift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.animate-gradient-shift {
  animation: gradient-shift 15s ease infinite;
}

@keyframes fade-in-3d {
from {
opacity: 0;
transform: translateZ(-50px) scale(0.95);
}
to {
opacity: 1;
transform: translateZ(0px) scale(1);
}
}

/* ... rest of your existing animations ... */

`}</style>
</div>
);
}