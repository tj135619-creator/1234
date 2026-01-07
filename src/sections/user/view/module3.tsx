import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, MessageSquare, Repeat, Activity, Heart, 
  ArrowRight, ArrowLeft, CheckCircle2, AlertCircle,
  Trophy, Lightbulb, UserCircle2, Sparkles, 
  ChevronRight, RefreshCcw, Quote, Compass,
  Layers, Ghost, Flame, Target, Share2, 
  Ear, MessageCircle, FastForward, Link
} from 'lucide-react';

// --- Global Theme & UI Components ---

const THEME = {
  background: "bg-gradient-to-br from-slate-900 via-purple-900/30 to-slate-950",
  card: "bg-slate-800/40 backdrop-blur-md border border-purple-500/20 rounded-2xl",
  accent: "text-purple-400",
  gradient: "from-purple-500 to-indigo-600"
};

const ProgressBar = ({ current, total }) => (
  <div className="fixed top-0 left-0 right-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-purple-900/50 p-4">
    <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <Activity className="w-5 h-5 text-purple-400" />
        <span className="font-bold text-slate-200 hidden sm:block uppercase tracking-widest text-xs">Module 3: Depth & Momentum</span>
      </div>
      <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden max-w-md">
        <motion.div 
          className="h-full bg-gradient-to-r from-purple-500 to-indigo-500"
          initial={{ width: 0 }}
          animate={{ width: `${(current / total) * 100}%` }}
          transition={{ type: "spring", stiffness: 50 }}
        />
      </div>
      <span className="text-[10px] font-mono text-purple-400 font-bold bg-purple-500/10 px-2 py-1 rounded">STAGE {current}/{total}</span>
    </div>
  </div>
);

const Card = ({ children, className = "", onClick }) => (
  <motion.div 
    whileHover={onClick ? { scale: 1.01 } : {}}
    onClick={onClick}
    className={`${THEME.card} p-6 sm:p-8 ${className} ${onClick ? 'cursor-pointer' : ''}`}
  >
    {children}
  </motion.div>
);

const Tip = ({ children }) => (
  <div className="p-4 bg-purple-500/5 border border-purple-500/20 rounded-xl flex gap-3 items-start">
    <Lightbulb className="text-purple-400 shrink-0 mt-1" size={18} />
    <div className="text-sm text-slate-400 leading-relaxed italic">{children}</div>
  </div>
);

// --- Steps ---

const IntroStep = () => (
  <div className="space-y-12 text-center max-w-3xl mx-auto py-10">
    <motion.div 
      initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
      animate={{ scale: 1, opacity: 1, rotate: 0 }}
      className="inline-flex p-6 bg-purple-500/10 rounded-3xl text-purple-400 mb-4 shadow-2xl shadow-purple-500/20"
    >
      <FastForward size={64} />
    </motion.div>
    
    <div className="space-y-4">
      <h1 className="text-5xl sm:text-7xl font-black tracking-tight bg-gradient-to-r from-white via-purple-200 to-slate-500 bg-clip-text text-transparent">
        Momentum Mastery.
      </h1>
      <p className="text-xl text-slate-400 max-w-xl mx-auto leading-relaxed">
        Stop acting like an investigator. Start acting like a <span className="text-purple-400 font-bold">partner</span>. Most conversations die because they lack <span className="italic">Depth Velocity</span>.
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[
        { icon: <Repeat size={20}/>, label: "Mirroring", desc: "Reflecting vibes, not just facts." },
        { icon: <Layers size={20}/>, label: "Stacking", desc: "Building hooks into branches." },
        { icon: <Link size={20}/>, label: "Bridging", desc: "Moving topics without friction." }
      ].map((item, i) => (
        <Card key={i} className="text-left border-purple-500/10 hover:border-purple-500/30 transition-all">
          <div className="text-purple-400 mb-2">{item.icon}</div>
          <p className="font-bold text-white text-sm">{item.label}</p>
          <p className="text-xs text-slate-500">{item.desc}</p>
        </Card>
      ))}
    </div>
  </div>
);

const ReflectionLab = () => {
  const [selected, setSelected] = useState(0);
  
  const tools = [
    {
      title: "The Emotional Mirror",
      formula: "That sounds [Emotion] + because [Shared Logic]",
      example: "That sounds exhausting because you're clearly someone who gives 100% to everything you touch.",
      logic: "Validates their character, not just the situation."
    },
    {
      title: "The Cold Read",
      formula: "I bet you're the type of person who...",
      example: "I bet you're the type of person who thrives in chaos but secretly loves a quiet weekend in.",
      logic: "Provokes a reaction. People love being analyzed (if it's positive/neutral)."
    },
    {
      title: "The 'Why' Projection",
      formula: "It seems like you value [X] over [Y]",
      example: "It seems like you value the impact of your work more than just the title on your desk.",
      logic: "Moves from Surface (What) to Depth (Values)."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black text-white">The Reflection Toolkit</h2>
        <p className="text-slate-400 italic">Statements build bridges. Questions build walls.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-3">
          {tools.map((t, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={`w-full text-left p-4 rounded-xl border transition-all ${selected === i ? 'bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-500/20' : 'bg-slate-900/50 border-slate-800 text-slate-400'}`}
            >
              <span className="text-xs font-bold uppercase opacity-60 block mb-1">Technique {i+1}</span>
              <span className="font-bold">{t.title}</span>
            </button>
          ))}
        </div>

        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={selected}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="bg-slate-900 border-purple-500/40 h-full">
                <div className="space-y-6">
                  <div>
                    <span className="text-[10px] font-bold text-purple-400 uppercase tracking-tighter">The Formula</span>
                    <p className="text-xl font-mono text-indigo-300">{tools[selected].formula}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-tighter">In Action</span>
                    <p className="text-lg italic text-slate-200">"{tools[selected].example}"</p>
                  </div>
                  <div className="pt-4 border-t border-slate-800">
                    <p className="text-sm text-slate-500">{tools[selected].logic}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const StackingLab = () => {
  const [selectedHook, setSelectedHook] = useState(null);
  const prompt = "I've been **learning to surf** in **Portugal**, it's **terrifying** but I love the **community** there.";
  
  const branches = {
    "learning to surf": {
      depth: "Values & Growth",
      response: "There's something humble about being a beginner at something physically demanding. Did you pick it up to challenge yourself, or just for the fun of it?",
      transition: "Reminds me of when I tried rock climbing—total disaster, but that first success is like a drug."
    },
    "Portugal": {
      depth: "Environment & Lifestyle",
      response: "Portugal has this 'End of the World' energy, especially on the coast. I bet it feels like you're miles away from real life when you're there.",
      transition: "I've always wondered if the slower pace of life there makes it hard to come back to the city."
    },
    "terrifying": {
      depth: "Emotional Vulnerability",
      response: "I love that you called it terrifying. Most people would just say 'hard.' It sounds like you're someone who likes to feel the edge of things.",
      transition: "That raw adrenaline usually makes for the best memories once the fear fades."
    },
    "community": {
      depth: "Belonging & Identity",
      response: "Subcultures like the surf community usually have their own unspoken rules. Was it hard to break into that circle, or were they welcoming?",
      transition: "I've noticed that shared struggle (like big waves) usually bonds people way faster than a cocktail party ever could."
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-black">Threading Lab: Advanced Stacking</h2>
        <p className="text-slate-400">Click a <span className="text-purple-400 font-bold">highlighted hook</span> to see how to branch into depth.</p>
      </div>

      <Card className="bg-slate-950 border-purple-500/20 py-12 px-6">
        <p className="text-2xl sm:text-3xl text-slate-300 text-center leading-relaxed">
          {prompt.split("**").map((part, i) => (
            branches[part] ? (
              <button 
                key={i}
                onClick={() => setSelectedHook(part)}
                className={`transition-all px-2 py-1 mx-1 rounded-lg border ${selectedHook === part ? 'bg-purple-600 border-purple-400 text-white' : 'text-purple-400 border-purple-500/30 hover:bg-purple-500/10'}`}
              >
                {part}
              </button>
            ) : <span key={i}>{part}</span>
          ))}
        </p>
      </Card>

      <AnimatePresence mode="wait">
        {selectedHook && (
          <motion.div
            key={selectedHook}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <Card className="bg-purple-900/10 border-purple-500/30">
              <div className="flex items-center gap-2 text-purple-400 font-bold text-xs uppercase mb-3 tracking-widest">
                <Compass size={14} /> Depth Level: {branches[selectedHook].depth}
              </div>
              <p className="text-lg text-slate-200 italic">"{branches[selectedHook].response}"</p>
            </Card>
            <Card className="bg-slate-800/20 border-slate-700">
              <div className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase mb-3 tracking-widest">
                <Link size={14} /> The Transition Bridge
              </div>
              <p className="text-sm text-slate-400">"{branches[selectedHook].transition}"</p>
              <div className="mt-4 flex gap-1">
                <div className="h-1 flex-1 bg-purple-500/40 rounded"></div>
                <div className="h-1 flex-1 bg-purple-500/40 rounded"></div>
                <div className="h-1 flex-1 bg-purple-500 rounded"></div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <Tip>
        Notice how we don't just ask "Where in Portugal?" We share a <span className="text-white">perception</span> first. That's the momentum secret.
      </Tip>
    </div>
  );
};

const TransitionMatrix = () => {
  const [active, setActive] = useState(0);
  const scenarios = [
    {
      from: "The Weather / Small Talk",
      to: "Career / Passions",
      bridge: "Actually, these gloomy days are the only time I'm actually productive. It’s like the lack of sun forces me to focus on [Topic]. What’s the one thing that gets you into a flow state?"
    },
    {
      from: "Professional / Work",
      to: "Personal / Adventure",
      bridge: "It sounds like you've got a lot on your plate. I’m curious, when you’re NOT managing [Work Topic], what’s the thing you do purely for the sake of adventure?"
    },
    {
      from: "Hobbies / Sports",
      to: "Values / Philosophy",
      bridge: "I’ve noticed that people who love [Hobby] usually value [Value] more than most. Is that what keeps you coming back to it?"
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-black">The Bridge Matrix</h2>
        <p className="text-slate-400">Mastering the "pivot" to move from boring to fascinating.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {scenarios.map((s, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`p-6 rounded-2xl border transition-all text-left space-y-4 ${active === i ? 'bg-purple-600 border-purple-400 text-white shadow-xl shadow-purple-500/30 scale-105' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">Bridge {i+1}</span>
              <Share2 size={16} />
            </div>
            <div className="flex items-center gap-2">
              <div className="px-2 py-1 bg-white/10 rounded text-[10px]">{s.from}</div>
              <ArrowRight size={12} />
              <div className="px-2 py-1 bg-white/20 rounded text-[10px] font-bold">{s.to}</div>
            </div>
            <p className="text-sm italic leading-relaxed">"{s.bridge}"</p>
          </button>
        ))}
      </div>
      
      <div className="p-8 bg-slate-900/60 rounded-3xl border border-purple-500/20 text-center">
        <h3 className="font-bold text-purple-400 mb-2">The Pivot Rule</h3>
        <p className="text-slate-400 text-sm italic">"Don't change the channel. Just change the angle of the scene."</p>
      </div>
    </div>
  );
};

const MomentumSimulator = ({ onComplete }) => {
  const [stage, setStage] = useState(0);
  const [feedback, setFeedback] = useState(null);

  const challenges = [
    {
      speaker: "I finally quit my job at the bank to start my own catering business. It's scary but needed.",
      options: [
        { 
          text: "What kind of food are you going to cook?", 
          correct: false, 
          msg: "Fact-finding. This kills the momentum. Focus on the 'Scary' part instead." 
        },
        { 
          text: "That’s a massive leap. I bet the moment you actually handed in that resignation felt like a mix of terror and pure freedom.", 
          correct: true, 
          msg: "Perfect! You mirrored the emotion and projected a feeling they likely had." 
        },
        { 
          text: "Banks are boring anyway. When do you officially start?", 
          correct: false, 
          msg: "Dismissive and too focused on logistics. Acknowledge their brave move first." 
        }
      ]
    },
    {
      speaker: "I've been traveling solo through Japan for a month. Honestly, it's a bit lonely sometimes.",
      options: [
        { 
          text: "Which city has been your favorite so far?", 
          correct: false, 
          msg: "Standard interview mode. They mentioned loneliness—address the feeling!" 
        },
        { 
          text: "I feel like solo travel is the ultimate test of your own company. Does the loneliness make the moments of connection with strangers feel more intense?", 
          correct: true, 
          msg: "Expert level. You acknowledged the loneliness and bridged into a deeper philosophy." 
        },
        { 
          text: "Oh, solo travel is great! You should try to find some hostels to meet people.", 
          correct: false, 
          msg: "Advice-giving mode. Nobody wants advice yet. They want to be heard." 
        }
      ]
    }
  ];

  const handleChoice = (opt) => {
    setFeedback(opt);
    setTimeout(() => {
      if (opt.correct) {
        if (stage < challenges.length - 1) {
          setStage(s => s + 1);
          setFeedback(null);
        } else {
          onComplete();
        }
      } else {
        setFeedback(null);
      }
    }, 2500);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex justify-between items-center px-4">
        <h2 className="text-xl font-black text-purple-400 uppercase tracking-widest flex items-center gap-2">
          <Ghost size={20} /> Momentum Duel
        </h2>
        <span className="text-slate-500 font-mono text-sm">{stage + 1}/{challenges.length}</span>
      </div>

      <Card className="bg-slate-900 border-purple-500/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <MessageCircle size={100} />
        </div>
        <div className="relative z-10 flex gap-6 items-start">
          <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center shrink-0 shadow-lg shadow-purple-500/20">
            <UserCircle2 className="text-white" size={28} />
          </div>
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase">They say...</span>
            <p className="text-xl text-slate-200 leading-relaxed italic">"{challenges[stage].speaker}"</p>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        {challenges[stage].options.map((opt, i) => (
          <button
            key={i}
            disabled={feedback !== null}
            onClick={() => handleChoice(opt)}
            className={`w-full text-left p-6 rounded-2xl border transition-all relative overflow-hidden group ${feedback === opt ? (opt.correct ? 'bg-emerald-500/20 border-emerald-500' : 'bg-red-500/20 border-red-500') : 'bg-slate-900 border-slate-800 hover:border-purple-500/50 hover:bg-slate-800'}`}
          >
            <div className="flex items-center justify-between gap-4">
              <span className={`text-lg ${feedback === opt ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>{opt.text}</span>
              <div className={`shrink-0 transition-transform ${feedback === opt ? 'rotate-90' : 'group-hover:translate-x-1'}`}>
                {feedback === opt ? (opt.correct ? <CheckCircle2 className="text-emerald-400" /> : <AlertCircle className="text-red-400" />) : <ChevronRight className="text-slate-600" />}
              </div>
            </div>
            <AnimatePresence>
              {feedback === opt && (
                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="pt-4 mt-4 border-t border-white/10 text-sm font-medium">
                  {opt.msg}
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        ))}
      </div>
    </div>
  );
};

const ClosingStep = () => (
  <div className="max-w-2xl mx-auto text-center space-y-10 py-12">
    <motion.div 
      initial={{ scale: 0, rotate: -45 }}
      animate={{ scale: 1, rotate: 0 }}
      className="inline-block p-8 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full text-white mb-2 shadow-3xl shadow-purple-500/40"
    >
      <Trophy size={80} />
    </motion.div>
    
    <div className="space-y-4">
      <h2 className="text-5xl font-black text-white">Momentum Unlocked.</h2>
      <p className="text-slate-400 text-lg">
        You've graduated from the "Interrogator" to the "Partner." Depth is no longer a destination; it's a habit.
      </p>
    </div>

    <div className="grid grid-cols-1 gap-4 text-left">
      <Card className="bg-emerald-500/5 border-emerald-500/20">
        <h4 className="text-emerald-400 font-bold mb-2 flex items-center gap-2 uppercase text-xs">
          <Flame size={14} /> The 48-Hour Challenge
        </h4>
        <p className="text-slate-300 text-sm">Find three people today. Use a <span className="font-bold text-white">Cold Read</span> or an <span className="font-bold text-white">Emotional Mirror</span> before asking a single question. Notice how their eyes change when they feel "seen."</p>
      </Card>
    </div>
    
    <button 
      onClick={() => window.location.reload()}
      className="inline-flex items-center gap-3 px-10 py-5 bg-white text-slate-950 hover:bg-purple-100 rounded-3xl font-black transition-all shadow-2xl shadow-white/10 group"
    >
      <RefreshCcw className="group-hover:rotate-180 transition-transform duration-500" size={24} />
      complete
    </button>
  </div>
);

// --- Main App Controller ---

export default function App() {
  const [step, setStep] = useState(1);
  const totalSteps = 6;

  const nextStep = () => setStep(s => Math.min(s + 1, totalSteps));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  return (
    <div className={`min-h-screen ${THEME.background} text-slate-100 font-sans selection:bg-purple-500/40`}>
      <ProgressBar current={step} total={totalSteps} />
      
      <main className="pt-32 pb-32 px-6 sm:px-12 relative z-10">
        {/* Background Ambient Glow */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px]" />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5, ease: "circOut" }}
          >
            {step === 1 && <IntroStep />}
            {step === 2 && <ReflectionLab />}
            {step === 3 && <StackingLab />}
            {step === 4 && <TransitionMatrix />}
            {step === 5 && <MomentumSimulator onComplete={nextStep} />}
            {step === 6 && <ClosingStep />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Navigation Footer */}
      {step < totalSteps && (
        <div className="fixed bottom-0 left-0 right-0 p-8 flex justify-center pointer-events-none z-50">
          <div className="flex gap-4 max-w-4xl w-full pointer-events-auto items-center">
            {step > 1 && (
              <button 
                onClick={prevStep}
                className="flex items-center justify-center p-5 bg-slate-900/80 border border-slate-700 hover:bg-slate-800 rounded-3xl transition-all backdrop-blur-md"
              >
                <ArrowLeft size={24} />
              </button>
            )}
            <button 
              onClick={nextStep}
              className={`flex-1 flex items-center justify-center gap-3 py-5 bg-gradient-to-r ${THEME.gradient} text-white rounded-3xl font-black text-lg transition-all shadow-2xl shadow-purple-500/20 hover:shadow-purple-500/40 active:scale-95`}
            >
              {step === 5 ? "TAKE THE FINAL TEST" : "CONTINUE JOURNEY"}
              <ArrowRight size={24} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}