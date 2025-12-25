import React from "react";
import { motion } from "framer-motion";
import {
  Play,
  CheckCircle2,
  MessageCircle,
  BookOpen,
  Zap,
  Trophy,
  ChevronRight,
  ListTodo,
  BarChart3,
  Users
} from "lucide-react";

export default function App() {
  return (
    <div className="min-h-screen bg-transparent flex justify-center px-4 py-10">
      <div className="w-full max-w-md space-y-10">
        <Header />
        <MainAction />
        <ActionButtons />
        <QuickActions />
        <Streak />
      </div>
    </div>
  );
}

/* ---------------- HEADER ---------------- */

const Header = () => (
  <div className="text-center space-y-2">
    <p className="text-[10px] uppercase tracking-[0.35em] text-white/30">
      Your Progress
    </p>
    <h1 className="text-white text-2xl font-bold">
      Today’s Focus
    </h1>
  </div>
);

/* ---------------- MAIN ACTION ---------------- */

const MainAction = () => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    className="relative rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl p-7"
  >
    <div className="flex items-center gap-3 mb-6">
      <div className="p-2 rounded-xl bg-white/10">
        <Zap size={14} className="text-yellow-400" />
      </div>
      <span className="text-white/40 text-[10px] font-bold tracking-widest">
        ACTIVE LESSON
      </span>
    </div>

    <h2 className="text-white text-3xl font-bold leading-tight">
      RESUME <br />
      <span className="text-white/60">your lesson</span>
    </h2>

    

    <div className="flex items-center justify-between pt-6">
      <div className="flex-1">
        <div className="flex justify-between text-xs text-white/40 mb-2">
          <span>Progress</span>
          <span className="text-white font-semibold">65%</span>
        </div>

        <div className="h-3 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "65%" }}
            transition={{ duration: 1 }}
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
          />
        </div>
      </div>

      <a href="#resume-lesson">
        <motion.button
          whileTap={{ scale: 0.95 }}
          className="ml-4 p-5 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600"
        >
          <Play className="text-white" size={22} />
        </motion.button>
      </a>
    </div>
  </motion.div>
);

/* ---------------- PRIMARY ACTION BUTTONS ---------------- */

const ActionButtons = () => (
  <div className="flex flex-col space-y-3">
    <ActionButton
      href="#resume-lesson"
      icon={<Play />}
      text="Resume Lesson"
      gradient="from-purple-500 to-pink-500"
    />

    <ActionButton
      href="#daily-tasks"
      icon={<ListTodo />}
      text="View Today’s Tasks"
      gradient="from-emerald-500 to-teal-500"
    />

    <ActionButton
      href="#progress"
      icon={<BarChart3 />}
      text="View Progress"
      gradient="from-blue-500 to-cyan-500"
    />

    <ActionButton
      href="#community"
      icon={<Users />}
      text="Go to Community"
      gradient="from-pink-500 to-rose-500"
    />
  </div>
);

const ActionButton = ({ icon, text, gradient, href }) => (
  <a href={href} className="block">
    <motion.div
      whileTap={{ scale: 0.97 }}
      className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl bg-gradient-to-br ${gradient}`}
    >
      <div className="flex items-center gap-3 text-white font-semibold">
        {icon}
        {text}
      </div>
      <ChevronRight className="text-white/70" />
    </motion.div>
  </a>
);

/* ---------------- QUICK ACTIONS ---------------- */

const QuickActions = () => {
  const actions = [
    {
      label: "Daily Goals",
      icon: <CheckCircle2 size={20} />,
      color: "from-emerald-400 to-teal-500",
      href: "#daily-tasks"
    },
    {
      label: "Community",
      icon: <MessageCircle size={20} />,
      color: "from-purple-500 to-indigo-500",
      badge: "NEW",
      href: "#community"
    },
    {
      label: "Flashcards",
      icon: <BookOpen size={20} />,
      color: "from-pink-500 to-rose-500",
      href: "#flashcards"
    }
  ];

  return (
    <div>
      <p className="text-[10px] text-white/30 font-bold tracking-widest mb-4">
        QUICK ACTIONS
      </p>

      <div className="grid grid-cols-3 gap-4">
        {actions.map((a, i) => (
          <a key={i} href={a.href}>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="relative p-4 rounded-2xl bg-white/5 border border-white/10 text-center"
            >
              {a.badge && (
                <span className="absolute -top-2 -right-2 text-[9px] px-2 py-1 rounded bg-pink-500 text-white font-bold">
                  {a.badge}
                </span>
              )}

              <div className={`mx-auto mb-3 p-3 rounded-xl bg-gradient-to-br ${a.color}`}>
                {a.icon}
              </div>

              <p className="text-[10px] font-semibold text-white/40 uppercase">
                {a.label}
              </p>
            </motion.div>
          </a>
        ))}
      </div>
    </div>
  );
};

/* ---------------- STREAK ---------------- */

const Streak = () => (
  <a href="#streak">
    <motion.div
      whileHover={{ x: 4 }}
      className="flex items-center gap-4 p-5 rounded-2xl bg-white/5 border border-white/10"
    >
      <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
        <Trophy className="text-pink-500" />
      </div>

      <div className="flex-1">
        <p className="text-white font-semibold">7 Day Streak</p>
        <p className="text-white/30 text-xs">Next reward in 24h</p>
      </div>

      <ChevronRight className="text-white/30" />
    </motion.div>
  </a>
);
