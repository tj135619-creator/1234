import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { AlertTriangle, Eye, EyeOff, Loader2, CheckCircle } from "lucide-react";
import { signUpWithGoogle, signUpWithEmail } from "./auth";
import { useToast } from "@/hooks/use-toast";
import { MessageCircle } from "lucide-react";
import { Users } from "lucide-react";
import { TrendingUp } from "lucide-react";
import { Heart } from "lucide-react";
import { Trophy } from "lucide-react";
import { Target } from "lucide-react";
import { Zap } from "lucide-react";
import { Star } from "lucide-react";
import { Swords } from "lucide-react";
import { ArrowLeft } from "lucide-react";
import { ArrowRight } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { Brain } from "lucide-react";


const signupSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine(val => val === true, "Please accept the Terms of Service and Privacy Policy"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type SignupFormData = z.infer<typeof signupSchema>;

const SignupForm = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [userName, setUserName] = useState("");

  // Quiz questions
  const quizQuestions = [
    {
      id: "struggle",
      question: "What's your biggest challenge right now?",
      options: [
        { value: "starting", label: "Starting conversations", icon: MessageCircle },
        { value: "friends", label: "Making new friends", icon: Users },
        { value: "confidence", label: "Building confidence", icon: TrendingUp },
        { value: "maintaining", label: "Keeping friendships", icon: Heart }
      ]
    },
    {
      id: "comfort",
      question: "How comfortable are you in social situations?",
      options: [
        { value: "very_uncomfortable", label: "I avoid them when I can", icon: null },
        { value: "uncomfortable", label: "Pretty nervous, honestly", icon: null },
        { value: "okay", label: "It depends on the situation", icon: null },
        { value: "comfortable", label: "I'm mostly comfortable", icon: null }
      ]
    },
    {
      id: "goal",
      question: "What would success look like for you?",
      options: [
        { value: "casual", label: "Having casual chats without anxiety", icon: null },
        { value: "circle", label: "Building a solid friend circle", icon: null },
        { value: "networking", label: "Being good at networking", icon: null },
        { value: "authentic", label: "Just being myself around people", icon: null }
      ]
    }
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
                    Hey there 👋
                  </h1>
                  <p className="text-xl md:text-2xl text-slate-300 leading-relaxed mb-8">
                    I'm not here to sell you anything fancy. I just want to help you feel more comfortable around people.
                  </p>
                </div>

                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 mb-8">
                  <p className="text-slate-200 text-lg leading-relaxed mb-4">
                    Social skills aren't something you're born with - they're something you build, bit by bit.
                  </p>
                  <p className="text-slate-300 text-lg leading-relaxed">
                    And honestly? Small, consistent steps work better than any crash course ever could.
                  </p>
                </div>

                <Button
                  onClick={() => setCurrentPage(1)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-lg"
                >
                  I'm listening
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
                  Here's the thing...
                </h2>

                <div className="space-y-6 mb-12">
                  <motion.div 
                    className="bg-red-500/10 backdrop-blur-sm border border-red-500/20 rounded-2xl p-6"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <p className="text-slate-200 text-lg leading-relaxed">
                      Most people struggle with social situations because they're trying to figure it all out on their own.
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
                        <span>Watching videos and reading articles (but never actually doing anything)</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-400 mr-3">•</span>
                        <span>Hoping you'll just "get better" with time</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-400 mr-3">•</span>
                        <span>Pushing yourself into uncomfortable situations and feeling worse</span>
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
                      What actually works? <span className="text-green-400 font-semibold">Small, guided practice that meets you where you are.</span>
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
                    Show me how
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
                  First, let's get to know each other
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
                    Got it, {userName}
                  </h2>
                  <p className="text-xl text-slate-300">
                    Let me put together something that'll actually help...
                  </p>
                </div>

                <div className="space-y-4 mb-12">
                  {[
                    "Understanding your challenges",
                    "Creating your practice plan",
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
                    Show me my plan
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
          title: "Your Starting Point",
          description: "Based on what you shared, here's how we'll help you grow",
          steps: []
        };

        if (struggle === "starting") {
          recommendation.steps = [
            "Week 1-2: Practice simple greetings with low-pressure situations",
            "Week 3-4: Learn conversation starters that feel natural",
            "Week 5+: Build comfort with longer conversations"
          ];
        } else if (struggle === "friends") {
          recommendation.steps = [
            "Week 1-2: Identify where to meet like-minded people",
            "Week 3-4: Practice turning small talk into connections",
            "Week 5+: Develop skills to deepen friendships"
          ];
        } else if (struggle === "confidence") {
          recommendation.steps = [
            "Week 1-2: Challenge negative self-talk patterns",
            "Week 3-4: Build wins with small social successes",
            "Week 5+: Practice assertiveness and authenticity"
          ];
        } else {
          recommendation.steps = [
            "Week 1-2: Learn how to stay in touch consistently",
            "Week 3-4: Practice being present and engaged",
            "Week 5+: Deepen existing relationships"
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
                      Alright {userName}, here's your plan
                    </h2>
                    <p className="text-slate-300 text-xl">
                      No fluff. Just practical steps that'll actually work for you.
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
                      <span className="text-blue-400 font-semibold">Here's the deal:</span> You'll get one small, doable task each day. No overwhelm, no pressure. Just consistent practice that builds real confidence.
                    </p>
                  </div>

                  {/* Features Section */}
                  <h3 className="text-3xl md:text-4xl font-bold text-white mb-8 text-center">
                    How we'll help you get there
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
                      Let's do this
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
                <div className="text-center mb-12">
                  <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                    Ready when you are, {userName}
                  </h2>
                  <p className="text-slate-300 text-xl">
                    Create your account to get started
                  </p>
                </div>

                <SignupForm onSignupSuccess={() => alert("Welcome! This will redirect to your dashboard")} />

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
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3">
          <span className="text-slate-300 text-sm font-medium">
            Step {currentPage + 1} of {pages.length}
          </span>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default SignupForm;