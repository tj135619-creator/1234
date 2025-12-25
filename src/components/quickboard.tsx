import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  CheckCircle2, 
  MessageCircle, 
  BookOpen, 
  Zap, 
  Trophy,
  Sparkles, 
  ChevronRight
} from 'lucide-react';

const App = () => {
  return (
    /* Changed bg-[#0a0118] to transparent background with a subtle radial glow */
    <div className="min-h-screen bg-transparent flex items-center justify-center p-4 font-sans selection:bg-purple-500/30">
      <div className="w-full max-w-md space-y-8">
        {/* Header - Styled like your uploaded 01.tsx */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between px-2"
        >
          <div>
            <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-white to-purple-200 text-3xl font-bold tracking-tight text-shadow-sm">
              Hey, Tanishka J!
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-[10px] font-bold text-purple-300 uppercase tracking-wider">
                <Sparkles size={10} className="text-yellow-400" />
                Level 12
              </span>
              <p className="text-purple-300/40 text-xs font-medium">Your progress is soaring 🚀</p>
            </div>
          </div>
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative"
          >
             <div className="w-14 h-14 p-1 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/20">
                <div className="w-full h-full rounded-xl bg-purple-900/80 overflow-hidden backdrop-blur-sm">
                  <img src="https://api.dicebear.com/7.x/pixel-art/svg?seed=Tanishka" alt="avatar" />
                </div>
             </div>
             <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-4 border-transparent shadow-sm"></div>
          </motion.div>
        </motion.div>

        <QuickActionsGrid />
      </div>
    </div>
  );
};

const QuickActionsGrid = () => {
  const [hoveredAction, setHoveredAction] = useState(null);

  const secondaryActions = [
    { 
        id: 'goals', 
        label: 'Daily Goals', 
        icon: <CheckCircle2 size={22} />, 
        color: 'from-emerald-400 to-teal-600',
        badge: '2 left'
    },
    { 
        id: 'ask', 
        label: 'Community', 
        icon: <MessageCircle size={22} />, 
        color: 'from-purple-500 to-indigo-600',
        badge: 'NEW'
    },
    { 
        id: 'flash', 
        label: 'Flashcards', 
        icon: <BookOpen size={22} />, 
        color: 'from-pink-500 to-rose-600',
        badge: null 
    },
  ];

  return (
    <div className="space-y-6">
      <div className="px-1 flex items-center justify-between">
        <h2 className="text-purple-300/30 text-[10px] font-black uppercase tracking-[0.3em]">Quick Dashboard</h2>
      </div>

      {/* PRIMARY ACTION: Styled as the main gradient card in your 01.tsx */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ y: -4 }}
        className="relative group cursor-pointer"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 blur-xl group-hover:opacity-100 transition-opacity opacity-0 rounded-[2rem]"></div>
        
        <div className="relative overflow-hidden bg-purple-900/20 backdrop-blur-xl border border-purple-500/20 rounded-[2rem] p-6 shadow-2xl">
          {/* Animated Background Pulse */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-1.5 rounded-lg bg-white/5 border border-white/10">
                <Zap size={14} className="text-yellow-400" fill="currentColor" />
              </div>
              <span className="text-white/40 text-[10px] font-black uppercase tracking-widest text-shadow">Active Lesson</span>
            </div>

            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-white text-2xl font-bold leading-tight">Mastering<br/>React Hooks</h3>
                <p className="text-purple-200/50 text-sm mt-1 font-medium">Lesson 4: useEffect Lifecycle</p>
              </div>
              <motion.button 
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 rounded-2xl shadow-lg shadow-purple-500/40 text-white"
              >
                <Play size={28} fill="white" />
              </motion.button>
            </div>

            {/* Progress Bar - styled like 01.tsx */}
            <div className="space-y-3 pt-2 border-t border-white/5">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-bold text-white/30 uppercase tracking-tighter">Current Progress</span>
                <span className="text-lg font-black text-white leading-none">65<span className="text-xs text-purple-400">%</span></span>
              </div>
              <div className="h-3 bg-black/30 rounded-full p-[2px] border border-white/5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '65%' }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 bg-[length:200%_auto] rounded-full shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                ></motion.div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* SECONDARY ACTIONS GRID */}
      <div className="grid grid-cols-3 gap-4">
        {secondaryActions.map((action, idx) => (
          <motion.button
            key={action.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * idx }}
            onHoverStart={() => setHoveredAction(action.id)}
            onHoverEnd={() => setHoveredAction(null)}
            className="relative group flex flex-col items-center p-4 rounded-3xl bg-purple-900/10 border border-purple-500/10 backdrop-blur-md transition-all hover:bg-purple-800/20 active:scale-95"
          >
            {action.badge && (
              <span className="absolute -top-1 right-2 px-2 py-0.5 bg-gradient-to-r from-pink-600 to-rose-600 text-[8px] font-black text-white rounded-full shadow-lg border border-white/20 z-20">
                {action.badge}
              </span>
            )}

            <div className={`p-3 rounded-2xl mb-3 bg-gradient-to-br ${action.color} shadow-lg transition-all group-hover:scale-110 group-hover:rotate-3`}>
              <div className="text-white">
                {action.icon}
              </div>
            </div>

            <span className="text-[9px] font-bold text-purple-200/50 uppercase tracking-wider group-hover:text-white transition-colors">
              {action.label}
            </span>
            
            {/* Animated underline indicator */}
            <AnimatePresence>
              {hoveredAction === action.id && (
                <motion.div 
                  layoutId="underline"
                  className="absolute bottom-2 w-1 h-1 bg-white rounded-full shadow-[0_0_8px_white]"
                />
              )}
            </AnimatePresence>
          </motion.button>
        ))}
      </div>

      {/* DAILY STREAK BOX - Styled like the cards in 01.tsx */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-4 p-4 rounded-3xl bg-gradient-to-r from-purple-900/20 to-transparent border-l-4 border-pink-500 backdrop-blur-sm"
      >
        <div className="w-12 h-12 rounded-2xl bg-pink-500/10 flex items-center justify-center text-pink-500 shadow-inner">
          <Trophy size={24} />
        </div>
        <div className="flex-1">
          <p className="text-white/90 font-bold text-sm">7 Day Streak! 🔥</p>
          <p className="text-purple-300/30 text-[10px] uppercase font-bold tracking-widest">Next reward in 24h</p>
        </div>
        <ChevronRight size={18} className="text-purple-500/30" />
      </motion.div>
    </div>
  );
};

export default App;