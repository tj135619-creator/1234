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
greeting: "Let's break this down systematically. What specific, measurable outcome do you want?",
style: "analytical",
followUp: "Great. On a scale of 1-10, how committed are you to achieving this?",
},
Raven: {
icon: "🦅",
gradient: "from-purple-600 via-violet-500 to-purple-600",
borderGlow: "rgba(124, 58, 237, 0.6)",
greeting: "Most people approach this all wrong. What unconventional method are you willing to try?",
style: "creative",
followUp: "Interesting. What's the wildest thing you'd do if failure wasn't an option?",
},
Phoenix: {
icon: "🔥",
gradient: "from-purple-700 via-fuchsia-600 to-purple-700",
borderGlow: "rgba(168, 85, 247, 0.6)",
greeting: "No fluff. What's ONE action you'll take TODAY?",
style: "intense",
followUp: "Good. What's stopping you from starting RIGHT NOW?",
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

{/* 3D LAYERED BACKGROUND */}
<div className="fixed inset-0 pointer-events-none">
{/* Back layer - Deep purple */}
<div className="absolute inset-0 bg-gradient-to-br from-purple-950 via-purple-900 to-black" style={{ transform: 'translateZ(-100px) scale(1.1)' }} />

{/* Middle layer - Animated orbs */}
<div className="absolute top-20 left-20 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-float" style={{ transform: 'translateZ(-50px)' }} />
<div className="absolute bottom-20 right-20 w-[500px] h-[500px] bg-fuchsia-600/20 rounded-full blur-3xl animate-float-delayed" style={{ transform: 'translateZ(-50px)' }} />

{/* Front layer - Subtle glow */}
<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-500/10 via-transparent to-transparent" style={{ transform: 'translateZ(0px)' }} />
</div>

{/* MAIN CONTENT CONTAINER */}
{/* MAIN CONTENT CONTAINER */}
<div className="relative z-10 flex flex-col items-center min-h-screen px-6 pt-8 pb-40">
  <div className="flex-1 flex items-center justify-center w-full">
    <div className="w-full max-w-4xl">

{/* HERO SECTION - 3D ELEVATED */}
{showExamplePlan && messages.length === 0 && (
<div className="w-full max-w-4xl mb-12 text-center animate-fade-in-3d">
<h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight"
style={{
textShadow: '0 10px 30px rgba(168, 85, 247, 0.5), 0 0 60px rgba(168, 85, 247, 0.3)',
transform: 'translateZ(50px)'
}}>
Get Your Personalized<br />
<span className="bg-gradient-to-r from-purple-400 via-fuchsia-400 to-purple-500 text-transparent bg-clip-text">
5-Day Action Plan
</span>
</h1>
<p className="text-xl text-purple-200 mb-12" style={{ transform: 'translateZ(30px)' }}>
<span className="text-3xl font-bold text-white">12,847</span> people achieved their goals this month
</p>

{/* EXAMPLE PLAN PREVIEW - 3D CARDS */}
<div className="relative mb-12" style={{ transform: 'translateZ(20px)', transformStyle: 'preserve-3d' }}>
<div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-fuchsia-600/20 rounded-3xl blur-xl" style={{ transform: 'translateZ(-10px)' }} />

<div className="relative bg-gradient-to-br from-purple-900/40 to-purple-950/40 backdrop-blur-2xl border border-purple-400/30 rounded-3xl p-10 shadow-2xl"
style={{
boxShadow: '0 25px 50px -12px rgba(168, 85, 247, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.1)',
transform: 'translateZ(0px)'
}}>
<h3 className="text-3xl font-black text-white mb-8" style={{ textShadow: '0 4px 12px rgba(168, 85, 247, 0.5)' }}>
Here's What You'll Get:
</h3>

<div className="grid gap-5">
{[
{ day: 1, title: "Build Foundation", desc: "Start small with manageable actions", color: "from-purple-500 to-purple-600" },
{ day: 2, title: "Gain Momentum", desc: "Build on Day 1 with increased intensity", color: "from-purple-600 to-violet-600" },
{ day: 3, title: "Push Boundaries", desc: "Step outside your comfort zone", color: "from-violet-600 to-fuchsia-600" },
{ day: 4, title: "Reflect & Adjust", desc: "Review progress and optimize", color: "from-fuchsia-600 to-purple-600" },
{ day: 5, title: "Commit Long-term", desc: "Create sustainable habits", color: "from-purple-600 to-purple-700" },
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
Ready? Tell Me Your Goal 🎯
</span>
</button>
</div>
)}

{/* CONVERSATION MESSAGES - 3D DEPTH */}
{/* LATEST AI MESSAGE - CENTERED & ELEVATED */}
{!showExamplePlan && (
  <div className="w-full max-w-3xl flex items-center justify-center">
    <div className="w-full animate-slide-in-3d">
      <div
        className="rounded-3xl p-8 md:p-10 transition-all duration-500 hover:scale-105 bg-gradient-to-br from-purple-900/60 to-purple-950/60 backdrop-blur-xl border border-purple-400/20 text-white"
        style={{
          boxShadow: '0 25px 50px -12px rgba(168, 85, 247, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.1)',
          transform: 'translateZ(30px)',
          transformStyle: 'preserve-3d'
        }}
      >
        {/* Avatar Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center text-2xl shadow-lg"
               style={{ 
                 boxShadow: '0 10px 25px -5px rgba(168, 85, 247, 0.6), inset 0 2px 4px rgba(255, 255, 255, 0.3)',
                 transform: 'translateZ(10px)' 
               }}>
            {avatarConfig.icon}
          </div>
          <span className="text-base text-purple-300 font-bold tracking-wide uppercase">
            {avatar?.name || "Skyler"}
          </span>
        </div>

        {/* AI Message Text */}
        <p className="text-xl md:text-2xl leading-relaxed whitespace-pre-wrap">
          {isTyping 
            ? typingText 
            : messages.filter(m => m.role === "assistant").pop()?.content || avatarConfig.greeting}
        </p>

        {/* Typing Cursor */}
        {isTyping && (
          <span className="inline-block w-2 h-7 bg-purple-400 ml-1 animate-pulse rounded-sm" />
        )}

        {/* Loading Indicator */}
        {localLoading && (
          <span className="inline-block w-2 h-7 bg-purple-400 ml-1 animate-pulse rounded-sm" />
        )}
      </div>
    </div>
  </div>
)}

{/* PLAN GENERATION STATUS - 3D MODAL */}
{isGeneratingPlan && (
<div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-6">
<div className="relative max-w-2xl w-full" style={{ transform: 'translateZ(100px)', transformStyle: 'preserve-3d' }}>
{/* Glow shadow */}
<div className="absolute inset-0 bg-gradient-to-br from-purple-600/40 to-fuchsia-600/40 rounded-3xl blur-2xl" style={{ transform: 'translateZ(-20px)' }} />

<div className="relative bg-gradient-to-br from-purple-900/95 to-purple-950/95 backdrop-blur-2xl border-2 border-purple-400/40 rounded-3xl p-12 shadow-2xl"
style={{ boxShadow: '0 30px 60px -15px rgba(168, 85, 247, 0.6), inset 0 2px 4px rgba(255, 255, 255, 0.1)' }}>
<div className="text-center mb-10">
<div className="inline-flex items-center justify-center w-28 h-28 bg-gradient-to-br from-purple-500 to-purple-700 rounded-3xl mb-6 shadow-2xl animate-pulse-3d"
style={{
boxShadow: '0 20px 40px -10px rgba(168, 85, 247, 0.7), inset 0 2px 4px rgba(255, 255, 255, 0.3)',
transform: 'translateZ(30px)'
}}>
<span className="text-6xl">⚡</span>
</div>
<h2 className="text-4xl font-black text-white mb-3" style={{ textShadow: '0 4px 12px rgba(168, 85, 247, 0.5)' }}>
Creating Your Plan
</h2>
<p className="text-purple-300 text-lg">This will take about 10 seconds...</p>
</div>

{/* STEP-BY-STEP STATUS - 3D */}
<div className="space-y-4 mb-8">
{GENERATION_STEPS.map((step, index) => (
<div
key={index}
className={`flex items-center gap-5 transition-all duration-700 ${
index < currentStep ? "opacity-100 translate-x-0" : "opacity-40 translate-x-4"
}`}
style={{ transform: `translateZ(${index * 3}px)` }}
>
<div className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold transition-all duration-500 ${
index < currentStep
? "bg-gradient-to-br from-purple-500 to-purple-700 text-white shadow-lg scale-110"
: "bg-purple-800/30 text-purple-400"
}`}
style={index < currentStep ? {
boxShadow: '0 10px 25px -5px rgba(168, 85, 247, 0.6)',
transform: 'translateZ(10px)'
} : {}}>
{index < currentStep ? "✓" : step.icon}
</div>
<p className="text-white text-lg font-medium">{step.text}</p>
</div>
))}
</div>

{/* 3D PROGRESS BAR */}
<div className="relative h-4 bg-purple-950/50 rounded-full overflow-hidden border border-purple-400/30"
style={{ boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.3)' }}>
<div
className="h-full bg-gradient-to-r from-purple-500 via-fuchsia-500 to-purple-600 transition-all duration-500 rounded-full"
style={{
width: `${(currentStep / GENERATION_STEPS.length) * 100}%`,
boxShadow: '0 0 20px rgba(168, 85, 247, 0.8)'
}}
/>
</div>
</div>
</div>
</div>
)}

{/* PLAN PREVIEW - 3D ELEVATED MODAL */}
{planPreview && !isGeneratingPlan && (
<div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-6 overflow-y-auto">
<div className="relative max-w-4xl w-full" style={{ transform: 'translateZ(100px)', transformStyle: 'preserve-3d' }}>
{/* Glow shadow */}
<div className="absolute inset-0 bg-gradient-to-br from-purple-600/40 to-fuchsia-600/40 rounded-3xl blur-3xl" style={{ transform: 'translateZ(-30px)' }} />

<div className="relative bg-gradient-to-br from-purple-900/95 to-purple-950/95 backdrop-blur-2xl border-2 border-purple-400/40 rounded-3xl p-12 shadow-2xl"
style={{ boxShadow: '0 40px 80px -20px rgba(168, 85, 247, 0.6), inset 0 2px 4px rgba(255, 255, 255, 0.1)' }}>
<div className="text-center mb-10">
<div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-purple-500 to-purple-700 rounded-3xl mb-5 shadow-2xl animate-bounce-subtle"
style={{
boxShadow: '0 20px 40px -10px rgba(168, 85, 247, 0.7), inset 0 2px 4px rgba(255, 255, 255, 0.3)',
transform: 'translateZ(40px)'
}}>
<span className="text-5xl">🎉</span>
</div>
<h2 className="text-5xl font-black text-white mb-3" style={{ textShadow: '0 4px 12px rgba(168, 85, 247, 0.5)' }}>
Your Plan is Ready!
</h2>
<p className="text-purple-300 text-xl">Here's your personalized 5-day roadmap</p>
</div>

<div className="grid gap-5 mb-10">
{planPreview.days.map((day: any, idx: number) => (
<div key={day.day}
className="group relative bg-gradient-to-r from-purple-800/40 to-purple-900/40 backdrop-blur-sm border-2 border-purple-400/30 rounded-3xl p-7 hover:border-purple-400/60 transition-all duration-500 hover:scale-105"
style={{
boxShadow: '0 15px 35px -10px rgba(168, 85, 247, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.1)',
transform: `translateZ(${10 + idx * 5}px)`,
transformStyle: 'preserve-3d'
}}>
<div className="flex items-start gap-5">
<div className="flex-shrink-0 w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl flex items-center justify-center text-white font-black text-3xl shadow-lg group-hover:shadow-2xl transition-all duration-500"
style={{
boxShadow: '0 12px 28px -6px rgba(168, 85, 247, 0.6), inset 0 2px 4px rgba(255, 255, 255, 0.3)',
transform: 'translateZ(15px)'
}}>
{day.day}
</div>
<div className="flex-1">
<h3 className="text-white font-black text-2xl mb-2">{day.title}</h3>
<p className="text-purple-200 text-lg leading-relaxed">{day.task}</p>
</div>
</div>

{/* Hover shine */}
<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-3xl" />
</div>
))}
</div>

<div className="flex gap-5 justify-center">
<button
onClick={() => setPlanPreview(null)}
className="px-8 py-4 bg-purple-800/50 hover:bg-purple-700/60 text-white text-lg font-bold rounded-2xl transition-all duration-300 border-2 border-purple-400/30 hover:border-purple-400/50 hover:scale-105"
style={{ boxShadow: '0 10px 25px -5px rgba(168, 85, 247, 0.3)' }}>
Adjust Plan
</button>
<button
onClick={() => navigate("/")}
className="relative px-10 py-4 bg-gradient-to-r from-purple-600 via-fuchsia-600 to-purple-600 text-white text-lg font-black rounded-2xl transition-all duration-300 hover:scale-110 group overflow-hidden"
style={{ boxShadow: '0 15px 35px -5px rgba(168, 85, 247, 0.6), inset 0 2px 4px rgba(255, 255, 255, 0.3)' }}>
<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
<span className="relative z-10">Start Day 1 🚀</span>
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
className="fixed top-32 left-16 z-40 px-10 py-5 bg-gradient-to-r from-purple-600 via-fuchsia-600 to-purple-600 text-white text-xl font-black rounded-2xl transition-all duration-500 hover:scale-110 group overflow-hidden animate-float"
style={{
boxShadow: '0 20px 40px -10px rgba(168, 85, 247, 0.7), inset 0 2px 4px rgba(255, 255, 255, 0.3)',
transform: 'translateZ(80px)'
}}>
<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
<span className="relative z-10">⚡ Generate Plan</span>
</button>
)}

{!showExamplePlan && !planPreview && !isGeneratingPlan && (
  <div className="fixed bottom-0 left-0 right-0 z-40 px-6 py-6 bg-gradient-to-t from-purple-950 via-purple-900/95 to-transparent backdrop-blur-xl border-t-2 border-purple-400/20"
       style={{
         boxShadow: '0 -10px 40px -10px rgba(168, 85, 247, 0.4)',
         transform: 'translateZ(50px)',
         transformStyle: 'preserve-3d'
       }}>

<div className="max-w-4xl mx-auto">
<div className="relative">
{/* 3D Shadow layer */}
<div className="absolute inset-0 bg-gradient-to-br from-purple-600/30 to-fuchsia-600/30 rounded-3xl blur-xl"
style={{ transform: 'translateZ(-10px)' }} />

{/* Main input container */}
<div className="relative bg-gradient-to-br from-purple-900/60 to-purple-950/60 backdrop-blur-2xl border-2 border-purple-400/30 rounded-3xl p-2 shadow-2xl"
style={{
boxShadow: '0 20px 40px -10px rgba(168, 85, 247, 0.5), inset 0 2px 4px rgba(255, 255, 255, 0.1)',
transform: 'translateZ(0px)'
}}>
<Textarea
ref={textareaRef}
value={inputValue}
onChange={(e) => setInputValue(e.target.value)}
onKeyDown={handleKeyPress}
placeholder={`Share your goal with ${avatar?.name || 'Skyler'}...`}
className="w-full min-h-[80px] max-h-[200px] bg-transparent border-none text-white text-lg placeholder:text-purple-300/60 focus:outline-none resize-none p-5"
style={{
textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
}}
/>

{/* Send button - 3D elevated */}
<div className="flex justify-end items-center gap-3 px-3 pb-2">
<button
onClick={() => handleSendMessage(inputValue)}
disabled={!inputValue.trim()}
className="relative px-8 py-3 bg-gradient-to-r from-purple-600 via-fuchsia-600 to-purple-600 text-white font-bold rounded-2xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 group overflow-hidden"
style={{
boxShadow: inputValue.trim()
? '0 12px 28px -6px rgba(168, 85, 247, 0.6), inset 0 2px 4px rgba(255, 255, 255, 0.3)'
: 'none',
transform: 'translateZ(10px)'
}}>
{/* Shine effect */}
<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
<span className="relative z-10 flex items-center gap-2">
Send
<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
</svg>
</span>
</button>
</div>
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
`}</style>
</div>
);
}