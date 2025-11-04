import { motion } from 'framer-motion';
import { 
  Sparkles, ArrowRight, Zap, Target, BookOpen, Trophy, 
  Flame, Clock, Star, Brain, Heart, Shield, Crown,
  CheckCircle, Play, TrendingUp, Rocket, Award , Calendar
} from 'lucide-react';
import { useState } from 'react';

export default function FirstLessonPrompt({ onStartLesson, user }) {
  const [showCommitment, setShowCommitment] = useState(false);
  const [commitmentChecks, setCommitmentChecks] = useState({
    time: false,
    focus: false,
    action: false,
    commit: false
  });

  const allChecked = Object.values(commitmentChecks).every(v => v);

  const handleStartJourney = () => {
    if (allChecked) {
      onStartLesson();
    }
  };

  const features = [
    {
      icon: Sparkles,
      title: "Interactive Experience",
      description: "Not just reading - you'll be actively engaged every step",
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: Brain,
      title: "Deep Learning",
      description: "Concepts that stick with you and change your perspective",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Target,
      title: "Actionable Tasks",
      description: "Clear, practical steps you can implement immediately",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Shield,
      title: "Obstacle Breaking",
      description: "We'll tackle your doubts and concerns head-on",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Heart,
      title: "Personal Growth",
      description: "Transform how you think, feel, and act",
      color: "from-red-500 to-pink-500"
    },
    {
      icon: Trophy,
      title: "Earn Rewards",
      description: "XP, badges, and a growing sense of achievement",
      color: "from-yellow-500 to-amber-500"
    }
  ];

  const journeySteps = [
    { icon: Play, label: "Intro", time: "2 min" },
    { icon: Heart, label: "Motivation", time: "2 min" },
    { icon: BookOpen, label: "Deep Dive", time: "3 min" },
    { icon: Brain, label: "Quiz", time: "3 min" },
    { icon: Sparkles, label: "Wisdom", time: "2 min" },
    { icon: Target, label: "Action", time: "2 min" },
    { icon: Calendar, label: "Schedule", time: "3 min" },
    { icon: Shield, label: "Obstacles", time: "3 min" },
    { icon: BookOpen, label: "Reflect", time: "2 min" },
    { icon: Trophy, label: "Complete", time: "1 min" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/30 to-slate-900 text-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-purple-400/30 rounded-full"
            initial={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000)
            }}
            animate={{
              y: [null, Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000)],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          {/* Animated Logo/Icon */}
          <motion.div
            animate={{ 
              rotate: 360,
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              rotate: { duration: 20, repeat: Infinity, ease: "linear" },
              scale: { duration: 2, repeat: Infinity }
            }}
            className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-purple-500 via-blue-600 to-purple-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-purple-500/50"
          >
            <Rocket className="w-16 h-16 text-white" />
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-200 via-blue-200 to-purple-200 bg-clip-text text-transparent"
          >
            Your Transformation
            <br />
            Starts Today
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl md:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto"
          >
            Welcome, <span className="text-purple-400 font-semibold">{user?.displayName || 'Learner'}</span>! 
            You're about to begin a 5-day journey that will change how you see yourself and the world.
          </motion.p>

          {/* Stats Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap justify-center gap-4 mb-12"
          >
            <div className="bg-purple-500/10 backdrop-blur-sm border border-purple-500/30 rounded-xl px-6 py-3">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-400" />
                <span className="text-purple-300 font-medium">23 minutes</span>
              </div>
            </div>
            <div className="bg-blue-500/10 backdrop-blur-sm border border-blue-500/30 rounded-xl px-6 py-3">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-400" />
                <span className="text-blue-300 font-medium">10 Stages</span>
              </div>
            </div>
            <div className="bg-yellow-500/10 backdrop-blur-sm border border-yellow-500/30 rounded-xl px-6 py-3">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                <span className="text-yellow-300 font-medium">+100 XP</span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-center mb-8 flex items-center justify-center gap-3">
            <Star className="w-8 h-8 text-yellow-400" />
            What Makes This Different
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 + index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:border-purple-500/50 transition-all cursor-pointer"
                >
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-slate-400">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Journey Preview */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mb-16 bg-slate-800/50 backdrop-blur-sm rounded-3xl p-8 border border-slate-700/50"
        >
          <h2 className="text-3xl font-bold text-center mb-8 flex items-center justify-center gap-3">
            <TrendingUp className="w-8 h-8 text-green-400" />
            Your 23-Minute Journey Map
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {journeySteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.3 + index * 0.1 }}
                  className="bg-slate-700/30 rounded-xl p-4 text-center border border-slate-600/50"
                >
                  <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-white font-semibold text-sm mb-1">{step.label}</p>
                  <p className="text-slate-400 text-xs">{step.time}</p>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 bg-purple-500/20 border border-purple-500/30 rounded-full px-6 py-3">
              <Award className="w-5 h-5 text-purple-400" />
              <span className="text-purple-300 font-medium">Complete all stages to earn your Day 1 badge</span>
            </div>
          </div>
        </motion.div>

        {/* Social Proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="mb-16 grid md:grid-cols-3 gap-6"
        >
          <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 rounded-2xl p-6 border border-green-500/30 text-center">
            <div className="text-4xl font-bold text-green-400 mb-2">1,247</div>
            <p className="text-green-200">People started today</p>
          </div>
          <div className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 rounded-2xl p-6 border border-blue-500/30 text-center">
            <div className="text-4xl font-bold text-blue-400 mb-2">94%</div>
            <p className="text-blue-200">Completion rate</p>
          </div>
          <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-2xl p-6 border border-purple-500/30 text-center">
            <div className="text-4xl font-bold text-purple-400 mb-2">4.9★</div>
            <p className="text-purple-200">Average rating</p>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.7 }}
          className="text-center"
        >
          {!showCommitment ? (
            <div className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 backdrop-blur-sm rounded-3xl p-12 border-2 border-purple-500/50">
              <h2 className="text-4xl font-bold text-white mb-4">
                Are You Ready?
              </h2>
              <p className="text-xl text-slate-300 mb-8">
                This isn't just another lesson. This is the beginning of something bigger.
              </p>
              
              <motion.button
                onClick={() => setShowCommitment(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold text-2xl px-16 py-6 rounded-2xl shadow-2xl shadow-purple-500/50 transition-all"
              >
                I'm Ready <ArrowRight className="inline ml-3 w-7 h-7" />
              </motion.button>

              <p className="text-slate-500 mt-6 text-sm">
                You'll finish by {new Date(Date.now() + 23 * 60000).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
              </p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-800/50 backdrop-blur-sm rounded-3xl p-12 border-2 border-purple-500/50"
            >
              <div className="mb-8">
                <Crown className="w-20 h-20 text-yellow-400 mx-auto mb-4" />
                <h2 className="text-4xl font-bold text-white mb-4">
                  One Last Thing...
                </h2>
                <p className="text-xl text-slate-300">
                  Set yourself up for success. Check all that apply:
                </p>
              </div>

              <div className="max-w-2xl mx-auto space-y-4 mb-8">
                {[
                  { key: 'time', label: 'I have 23 uninterrupted minutes', icon: Clock },
                  { key: 'focus', label: "I'm in a distraction-free space", icon: Shield },
                  { key: 'action', label: "I'm ready to take action, not just consume", icon: Zap },
                  { key: 'commit', label: 'I commit to completing Day 1 today', icon: Heart }
                ].map(({ key, label, icon: Icon }) => (
                  <motion.button
                    key={key}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setCommitmentChecks(prev => ({ ...prev, [key]: !prev[key] }))}
                    className={`w-full flex items-center gap-4 p-5 rounded-xl border-2 transition-all ${
                      commitmentChecks[key]
                        ? 'bg-green-500/20 border-green-500'
                        : 'bg-slate-700/30 border-slate-600 hover:border-slate-500'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      commitmentChecks[key] ? 'bg-green-500 border-green-500' : 'border-slate-500'
                    }`}>
                      {commitmentChecks[key] && <CheckCircle className="w-6 h-6 text-white" />}
                    </div>
                    <Icon className={`w-6 h-6 flex-shrink-0 ${commitmentChecks[key] ? 'text-green-400' : 'text-slate-400'}`} />
                    <span className={`flex-1 text-left text-lg ${commitmentChecks[key] ? 'text-white' : 'text-slate-300'}`}>
                      {label}
                    </span>
                  </motion.button>
                ))}
              </div>

              <button
                onClick={handleStartJourney}
                disabled={!allChecked}
                className={`text-2xl px-16 py-6 rounded-2xl font-bold transition-all shadow-2xl ${
                  allChecked
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-green-500/50'
                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                }`}
              >
                {allChecked ? (
                  <>
                    START DAY 1 NOW! <Rocket className="inline ml-3 w-8 h-8" />
                  </>
                ) : (
                  'Check all boxes to begin'
                )}
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}