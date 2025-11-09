import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight,
  ArrowLeft,
  Heart,
  Target,
  Users,
  MessageCircle,
  TrendingUp,
  CheckCircle,
  Brain,
  Trophy,
  Zap,
  Star,
  Swords
} from "lucide-react";
import { SignupForm } from "./signup-form";

const SignInView = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [userName, setUserName] = useState("");

  // Quiz questions
  const quizQuestions = [
    {
      id: "struggle",
      question: "what's giving you the most trouble?",
      options: [
        { value: "starting", label: "Starting conversations", icon: MessageCircle },
        { value: "friends", label: "Making new friends", icon: Users },
        { value: "confidence", label: "Building confidence", icon: TrendingUp },
        { value: "maintaining", label: "Keeping friendships", icon: Heart }
      ]
    },
    {
      id: "comfort",
      question: "how do you feel in social situations?",
      options: [
        { value: "very_uncomfortable", label: "Honestly? I avoid them", icon: null },
        { value: "uncomfortable", label: "Pretty anxious most of the time", icon: null },
        { value: "okay", label: "Depends on the vibe", icon: null },
        { value: "comfortable", label: "Usually fine", icon: null }
      ]
    },
    {
      id: "goal",
      question: "what would actually help you?",
      options: [
        { value: "casual", label: "Just being able to chat without overthinking", icon: null },
        { value: "circle", label: "Having a solid group of friends", icon: null },
        { value: "networking", label: "Getting better at meeting new people", icon: null },
        { value: "authentic", label: "Being comfortable being myself", icon: null }
      ]
    }
  ];

  const detailedFeatures = [
    {
      icon: Brain,
      title: "Daily Practice That Doesn't Suck",
      description:
        "One small thing each day. Could be saying hi to someone. Could be joining a conversation. Nothing crazy. Just enough to build momentum without freaking out.",
      gradient: "from-blue-500 to-blue-600",
    },
    {
      icon: TrendingUp,
      title: "See Your Progress (It Actually Helps)",
      description:
        "Track what you've done with a simple visual map. Sometimes you need to see you're making progress to keep going. This does that.",
      gradient: "from-purple-500 to-purple-600",
    },
    {
      icon: MessageCircle,
      title: "Practice Conversations First",
      description:
        "Get guidance before jumping into real situations. Think through what you'll say, how to respond, that kind of thing. Takes the edge off.",
      gradient: "from-indigo-500 to-indigo-600",
    },
    {
      icon: Trophy,
      title: "Small Wins Add Up",
      description:
        "Track your consistency and celebrate showing up. Because honestly, showing up is half the battle. We'll help you see those wins.",
      gradient: "from-violet-500 to-violet-600",
    },
    {
      icon: Target,
      title: "Focus On What Matters To You",
      description:
        "You pick what to work on. Meeting people? Speaking up more? Leading conversations? Whatever you need, that's what we'll focus on.",
      gradient: "from-emerald-500 to-emerald-600",
    },
    {
      icon: Users,
      title: "You're Not Alone In This",
      description:
        "Connect with others working on the same stuff. Try challenges together, share what's working. Sometimes just knowing others get it makes a difference.",
      gradient: "from-orange-500 to-orange-600",
    },
  ];

  const pages = [
    // Page 0: Welcome
    {
      component: () => (
        <div className="min-h-screen bg-slate-900 overflow-x-hidden">
          {/* Animated Background */}
          <div className="fixed inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-slate-900 animate-gradient-shift bg-[length:400%_400%]"></div>
          
          {/* Floating Background Elements */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <motion.div 
              className="absolute top-20 left-20 w-32 h-32 bg-blue-500/10 rounded-full blur-xl"
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div 
              className="absolute top-40 right-32 w-24 h-24 bg-purple-500/10 rounded-full blur-xl"
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            />
            <motion.div 
              className="absolute bottom-32 left-1/4 w-40 h-40 bg-indigo-500/10 rounded-full blur-xl"
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>

          <div className="relative z-10 min-h-screen flex flex-col">
            {/* Header */}
            <header className="p-6">
              <div className="max-w-7xl mx-auto">
                <motion.div 
                  className="flex items-center space-x-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Swords className="text-white text-lg" />
                  </div>
                  <h1 className="text-2xl font-bold text-white">GoalGrid</h1>
                </motion.div>
              </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center px-6 py-12">
              <motion.div 
                className="max-w-3xl mx-auto text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <Heart className="text-white" size={40} />
                  </div>
                  <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                    So yeah, I made this thing...
                  </h1>
                  <p className="text-xl md:text-2xl text-slate-300 leading-relaxed mb-8">
                    Look, I'm not gonna pretend this is some magic solution. But it might actually help.
                  </p>
                </div>

                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 mb-8">
                  <p className="text-slate-200 text-lg leading-relaxed mb-4">
                    I used to overthink every conversation. Felt like everyone else just "got it" and I was figuring it out alone.
                  </p>
                  <p className="text-slate-300 text-lg leading-relaxed">
                    Turns out? Most people feel this way. And it gets easier with practice. Not overnight, but it does get easier.
                  </p>
                </div>

                <Button
                  onClick={() => setCurrentPage(1)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-lg"
                >
                  Keep reading
                  <ArrowRight className="ml-2" size={20} />
                </Button>
              </motion.div>
            </main>
          </div>
        </div>
      )
    },

    // Page 1: The Problem
    {
      component: () => (
        <div className="min-h-screen bg-slate-900 overflow-x-hidden">
          <div className="fixed inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-slate-900"></div>
          
          <div className="relative z-10 min-h-screen flex flex-col">
            <header className="p-6">
              <div className="max-w-7xl mx-auto">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Swords className="text-white text-lg" />
                  </div>
                  <h1 className="text-2xl font-bold text-white">GoalGrid</h1>
                </div>
              </div>
            </header>

            <main className="flex-1 flex items-center justify-center px-6 py-12">
              <motion.div 
                className="max-w-3xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 text-center">
                  Here's what I noticed...
                </h2>

                <div className="space-y-6 mb-12">
                  <motion.div 
                    className="bg-red-500/10 backdrop-blur-sm border border-red-500/20 rounded-2xl p-6"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <p className="text-slate-200 text-lg leading-relaxed">
                      Most of us are just winging it. Reading advice online, hoping we'll magically get better at talking to people.
                    </p>
                  </motion.div>

                  <motion.div 
                    className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <p className="text-slate-200 text-lg leading-relaxed mb-4">
                      You've probably tried:
                    </p>
                    <ul className="space-y-3 text-slate-300 text-lg">
                      <li className="flex items-start">
                        <span className="text-blue-400 mr-3">•</span>
                        <span>Watching YouTube videos at 2am (never doing what they suggest)</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-400 mr-3">•</span>
                        <span>Hoping it'll just click someday</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-400 mr-3">•</span>
                        <span>Forcing yourself into situations that just make you feel worse</span>
                      </li>
                    </ul>
                  </motion.div>

                  <motion.div 
                    className="bg-green-500/10 backdrop-blur-sm border border-green-500/20 rounded-2xl p-6"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <p className="text-slate-200 text-lg leading-relaxed">
                      What actually works? <span className="text-green-400 font-semibold">Small steps. Regular practice. Starting where you're at, not where you think you should be.</span>
                    </p>
                  </motion.div>
                </div>

                <div className="flex justify-center space-x-4">
                  <Button
                    onClick={() => setCurrentPage(0)}
                    variant="ghost"
                    className="text-slate-400 hover:text-white hover:bg-white/10"
                  >
                    <ArrowLeft className="mr-2" size={20} />
                    Back
                  </Button>
                  <Button
                    onClick={() => setCurrentPage(2)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-lg"
                  >
                    Okay, I'm curious
                    <ArrowRight className="ml-2" size={20} />
                  </Button>
                </div>
              </motion.div>
            </main>
          </div>
        </div>
      )
    },

    // Page 2: Name Input
    {
      component: () => (
        <div className="min-h-screen bg-slate-900 overflow-x-hidden">
          <div className="fixed inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-slate-900"></div>
          
          <div className="relative z-10 min-h-screen flex flex-col">
            <header className="p-6">
              <div className="max-w-7xl mx-auto">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Swords className="text-white text-lg" />
                  </div>
                  <h1 className="text-2xl font-bold text-white">GoalGrid</h1>
                </div>
              </div>
            </header>

            <main className="flex-1 flex items-center justify-center px-6 py-12">
              <motion.div 
                className="max-w-2xl mx-auto w-full"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 text-center">
                  Cool, let's start with your name
                </h2>
                <p className="text-slate-300 text-xl text-center mb-12">
                  What should I call you?
                </p>

                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 mb-8">
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Your name..."
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-6 py-4 text-white text-lg placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
                    autoFocus
                  />
                </div>

                <div className="flex justify-center space-x-4">
                  <Button
                    onClick={() => setCurrentPage(1)}
                    variant="ghost"
                    className="text-slate-400 hover:text-white hover:bg-white/10"
                  >
                    <ArrowLeft className="mr-2" size={20} />
                    Back
                  </Button>
                  <Button
                    onClick={() => setCurrentPage(3)}
                    disabled={!userName.trim()}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 shadow-lg text-lg"
                  >
                    Continue
                    <ArrowRight className="ml-2" size={20} />
                  </Button>
                </div>
              </motion.div>
            </main>
          </div>
        </div>
      )
    },

    // Pages 3-5: Quiz Questions
    ...quizQuestions.map((q, index) => ({
      component: () => (
        <div className="min-h-screen bg-slate-900 overflow-x-hidden">
          <div className="fixed inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-slate-900"></div>
          
          <div className="relative z-10 min-h-screen flex flex-col">
            <header className="p-6">
              <div className="max-w-7xl mx-auto">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Swords className="text-white text-lg" />
                  </div>
                  <h1 className="text-2xl font-bold text-white">GoalGrid</h1>
                </div>
              </div>
            </header>

            <main className="flex-1 flex items-center justify-center px-6 py-12">
              <motion.div 
                className="max-w-3xl mx-auto w-full"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="text-center mb-12">
                  <div className="flex justify-center space-x-2 mb-8">
                    {quizQuestions.map((_, i) => (
                      <div
                        key={i}
                        className={`h-2 rounded-full transition-all duration-300 ${
                          i <= index ? 'bg-blue-500 w-12' : 'bg-white/20 w-8'
                        }`}
                      />
                    ))}
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                    {userName}, {q.question}
                  </h2>
                  <p className="text-slate-400 text-lg">
                    Question {index + 1} of {quizQuestions.length}
                  </p>
                </div>

                <div className="grid gap-4 mb-8">
                  {q.options.map((option) => {
                    const Icon = option.icon;
                    const isSelected = quizAnswers[q.id] === option.value;
                    
                    return (
                      <motion.button
                        key={option.value}
                        onClick={() => {
                          setQuizAnswers({ ...quizAnswers, [q.id]: option.value });
                          setTimeout(() => setCurrentPage(currentPage + 1), 300);
                        }}
                        className={`bg-white/5 hover:bg-white/10 backdrop-blur-sm border rounded-2xl p-6 text-left transition-all duration-200 ${
                          isSelected 
                            ? 'border-blue-500 bg-blue-500/10' 
                            : 'border-white/10'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center space-x-4">
                          {Icon && (
                            <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${
                              isSelected 
                                ? 'bg-blue-500' 
                                : 'bg-white/10'
                            }`}>
                              <Icon className="text-white" size={28} />
                            </div>
                          )}
                          {!Icon && (
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                              isSelected 
                                ? 'border-blue-500' 
                                : 'border-white/30'
                            }`}>
                              {isSelected && <div className="w-3 h-3 rounded-full bg-blue-500" />}
                            </div>
                          )}
                          <span className="text-white text-lg">{option.label}</span>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                <div className="flex justify-center">
                  <Button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    variant="ghost"
                    className="text-slate-400 hover:text-white hover:bg-white/10"
                  >
                    <ArrowLeft className="mr-2" size={20} />
                    Back
                  </Button>
                </div>
              </motion.div>
            </main>
          </div>
        </div>
      )
    })),

    // Page 6: Processing
    {
      component: () => (
        <div className="min-h-screen bg-slate-900 overflow-x-hidden">
          <div className="fixed inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-slate-900"></div>
          
          <div className="relative z-10 min-h-screen flex flex-col">
            <header className="p-6">
              <div className="max-w-7xl mx-auto">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Swords className="text-white text-lg" />
                  </div>
                  <h1 className="text-2xl font-bold text-white">GoalGrid</h1>
                </div>
              </div>
            </header>

            <main className="flex-1 flex items-center justify-center px-6 py-12">
              <motion.div 
                className="max-w-2xl mx-auto text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
              >
                <div className="mb-12">
                  <motion.div 
                    className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-8"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Target className="text-white" size={48} />
                  </motion.div>
                  <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                    Alright {userName}, give me a sec...
                  </h2>
                  <p className="text-xl text-slate-300">
                    Figuring out what might actually help you
                  </p>
                </div>

                <div className="space-y-4 mb-12">
                  {[
                    "Looking at what you told me",
                    "Putting together a starting point",
                    "Setting up your first steps"
                  ].map((text, i) => (
                    <motion.div
                      key={i}
                      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 text-slate-300 text-lg"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.3, duration: 0.5 }}
                    >
                      <CheckCircle className="inline mr-3 text-green-400" size={24} />
                      {text}
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5 }}
                >
                  <Button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-lg"
                  >
                    Show me
                    <ArrowRight className="ml-2" size={20} />
                  </Button>
                </motion.div>
              </motion.div>
            </main>
          </div>
        </div>
      )
    },

    // Page 7: Personalized Plan with Features
    {
      component: () => {
        const struggle = quizAnswers.struggle;
        
        let recommendation = {
          title: "Where We'll Start",
          description: "Based on what you said",
          steps: []
        };

        if (struggle === "starting") {
          recommendation.steps = [
            "Week 1-2: Start with quick hellos. Nothing fancy. Just get used to initiating.",
            "Week 3-4: Work on keeping a conversation going for a minute or two.",
            "Week 5+: Build up to longer chats that feel natural."
          ];
        } else if (struggle === "friends") {
          recommendation.steps = [
            "Week 1-2: Figure out where people like you actually hang out.",
            "Week 3-4: Practice turning random chats into actual connections.",
            "Week 5+: Learn how to go from acquaintance to friend."
          ];
        } else if (struggle === "confidence") {
          recommendation.steps = [
            "Week 1-2: Notice when you're being hard on yourself. Just notice it.",
            "Week 3-4: Stack up some small social wins. Build proof you can do this.",
            "Week 5+: Start saying what you actually think. Practice being you."
          ];
        } else {
          recommendation.steps = [
            "Week 1-2: Get better at keeping in touch without it being weird.",
            "Week 3-4: Practice actually being present when you're with people.",
            "Week 5+: Make your existing friendships stronger."
          ];
        }

        return (
          <div className="min-h-screen bg-slate-900 overflow-x-hidden">
            <div className="fixed inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-slate-900"></div>
            
            <div className="relative z-10 min-h-screen">
              <header className="p-6">
                <div className="max-w-7xl mx-auto">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <Swords className="text-white text-lg" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">GoalGrid</h1>
                  </div>
                </div>
              </header>

              <main className="px-6 py-12">
                <motion.div 
                  className="max-w-6xl mx-auto"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                      Okay {userName}, here's what I'm thinking
                    </h2>
                    <p className="text-slate-300 text-xl">
                      Nothing crazy. Just a realistic path forward.
                    </p>
                  </div>

                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 mb-8">
                    <h3 className="text-2xl font-bold text-white mb-8 flex items-center">
                      <Target className="mr-3 text-blue-400" size={32} />
                      {recommendation.title}
                    </h3>
                    
                    <div className="space-y-6">
                      {recommendation.steps.map((step, i) => (
                        <div key={i} className="flex items-start space-x-6">
                          <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                            <span className="text-blue-400 font-bold text-xl">{i + 1}</span>
                          </div>
                          <p className="text-slate-200 text-lg leading-relaxed pt-2">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-blue-500/10 backdrop-blur-sm border border-blue-500/20 rounded-2xl p-8 mb-12">
                    <p className="text-slate-200 text-lg leading-relaxed text-center">
                      <span className="text-blue-400 font-semibold">The deal:</span> One small thing each day. That's it. No overwhelming yourself, no pressure to be perfect. Just show up and do the thing.
                    </p>
                  </div>

                  {/* Features Section */}
                  <h3 className="text-3xl md:text-4xl font-bold text-white mb-8 text-center">
                    Here's how it works
                  </h3>

                  <div className="grid gap-6 mb-12">
                    {detailedFeatures.map((feature, index) => (
                      <motion.div
                        key={feature.title}
                        className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-200"
                        initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 * (index + 1) }}
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-6">
                          <div
                            className={`flex-shrink-0 w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center`}
                          >
                            <feature.icon
                              className="text-white"
                              size={32}
                            />
                          </div>

                          <div className="flex-1">
                            <h4 className="text-white font-bold text-xl mb-3">
                              {feature.title}
                            </h4>
                            <p className="text-slate-300 text-base leading-relaxed">
                              {feature.description}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="flex justify-center space-x-4">
                    <Button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      variant="ghost"
                      className="text-slate-400 hover:text-white hover:bg-white/10"
                    >
                      <ArrowLeft className="mr-2" size={20} />
                      Back
                    </Button>
                    <Button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-lg"
                    >
                      Alright, let's try it
                      <ArrowRight className="ml-2" size={20} />
                    </Button>
                  </div>
                </motion.div>
              </main>
            </div>
          </div>
        );
      }
    },

    // Page 8: Sign Up
    {
  component: () => (
    <div className="min-h-screen bg-slate-900 overflow-x-hidden">
      <div className="fixed inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-slate-900 animate-gradient-shift bg-[length:400%_400%]"></div>
      
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-20 left-20 w-32 h-32 bg-blue-500/10 rounded-full blur-xl"
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute top-40 right-32 w-24 h-24 bg-purple-500/10 rounded-full blur-xl"
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        <header className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Swords className="text-white text-lg" />
              </div>
              <h1 className="text-2xl font-bold text-white">GoalGrid</h1>
            </div>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center px-6 py-12">
          <motion.div 
            className="max-w-2xl mx-auto w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-8">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Cool, {userName}. Let's get you set up
              </h2>
              <p className="text-slate-300 text-xl mb-8">
                Just need an email and password
              </p>
            </div>

            {/* This is where the signup form goes */}
            <SignupForm onSignupSuccess={() => {
              console.log("Signup successful!");
              // The SignupForm component handles navigation internally
              // so you don't need to do anything here
            }} />

            <div className="flex justify-center mt-8">
              <Button
                onClick={() => setCurrentPage(currentPage - 1)}
                variant="ghost"
                className="text-slate-400 hover:text-white hover:bg-white/10"
              >
                <ArrowLeft className="mr-2" size={20} />
                Back
              </Button>
            </div>
          </motion.div>
        </main>

        <footer className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="border-t border-white/10 pt-6">
              <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                <div className="text-slate-400 text-sm">
                  © 2024 GoalGrid. All rights reserved.
                </div>
                <div className="flex items-center space-x-6 text-sm">
                  <a href="#" className="text-slate-400 hover:text-white transition-colors">Privacy Policy</a>
                  <a href="#" className="text-slate-400 hover:text-white transition-colors">Terms of Service</a>
                  <a href="#" className="text-slate-400 hover:text-white transition-colors">Contact Support</a>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
  ];

  return (
    <AnimatePresence mode="wait">
      <div key={currentPage}>
        {pages[currentPage].component()}
      </div>

      {/* Page indicator */}
      
    </AnimatePresence>
  );
};

export default SignInView;