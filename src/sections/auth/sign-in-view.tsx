import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight,
  Brain,
  TrendingUp,
  MessageCircle,
  Trophy,
  Target,
  Users,
  Zap,
  Star,
  CheckCircle,
  Swords
} from "lucide-react";
import SignupForm from "./Newfolder/signupform";
import FeaturePreview from "./Newfolder/featurespreview";

const detailedFeatures = [
  {
    icon: Brain,
    title: "Daily Social Practice",
    description:
      "Each day, you'll get a small, practical exercise. Start with simple actions like greeting someone or starting a short chat. Over time, these build into stronger social confidence.",
    benefits: [
      "Exercises match your current comfort level",
      "Small steps you can do daily",
      "Gradual skill improvement"
    ],
    gradient: "from-blue-500 to-blue-600",
  },
  {
    icon: TrendingUp,
    title: "Visual Progress Tracker",
    description:
      "See your growth over time with a simple map that highlights the steps you've completed. Watching your progress helps you stay motivated and see tangible improvements.",
    benefits: [
      "Track what you've accomplished",
      "Identify next steps",
      "Stay motivated by progress"
    ],
    gradient: "from-purple-500 to-purple-600",
  },
  {
    icon: MessageCircle,
    title: "Guided Conversations",
    description:
      "Get on-the-spot guidance while practicing social interactions. This helps you prepare for real-life conversations and gain confidence before trying something new.",
    benefits: [
      "Practice different scenarios",
      "Receive feedback quickly",
      "Learn by doing"
    ],
    gradient: "from-indigo-500 to-indigo-600",
  },
  {
    icon: Trophy,
    title: "Daily Milestones",
    description:
      "Celebrate small wins by tracking daily consistency and earning visual markers for your progress. The goal is to make improvement feel achievable and rewarding.",
    benefits: [
      "Recognize your daily efforts",
      "Celebrate small achievements",
      "Encourage routine building"
    ],
    gradient: "from-violet-500 to-violet-600",
  },
  {
    icon: Target,
    title: "Personal Goals",
    description:
      "Decide what areas you want to focus on — whether meeting new people, speaking up more, or leading a group. Each step is tailored to what matters most to you.",
    benefits: [
      "Focus on your priorities",
      "Receive guidance that fits you",
      "Adapt as you progress"
    ],
    gradient: "from-emerald-500 to-emerald-600",
  },
  {
    icon: Users,
    title: "Shared Learning",
    description:
      "Connect with others who are working on similar social skills. Try small group challenges and share experiences to stay accountable and learn from peers.",
    benefits: [
      "Exchange ideas with others",
      "Support from a small group",
      "Shared progress boosts motivation"
    ],
    gradient: "from-orange-500 to-orange-600",
  },
];


const successStats = [
  { number: "1", label: "Book" },
  { number: "30+", label: "actionable techniques" },
  { number: "10-15", label: "Minutes per day" },
  { number: "94%", label: "Users report improvement" },
];

export function SignInView() {
  const [showThankYou, setShowThankYou] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignupSuccess = () => {
    setShowThankYou(true);
  };

  const handleNextStep = () => {
    window.location.href = "/creategoal";
  };

  // Thank You Content (shown after successful signup) - FULL SCREEN
  if (showThankYou) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Welcome Section */}
          <motion.div
            className="text-center mb-8 md:mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="bg-green-500/20 border border-green-500/50 rounded-2xl p-6 md:p-8 mb-6 md:mb-8">
              <CheckCircle
                className="text-green-400 mx-auto mb-4"
                size={64}
              />
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Welcome to GoalGrid!
              </h2>
              <p className="text-green-200 text-lg md:text-xl">
                Your social skills journey starts now
              </p>
            </div>

            {/* Success Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
              {successStats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 md:p-6 text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * (index + 1) }}
                >
                  <div className="text-xl md:text-2xl font-bold text-blue-400 mb-2">
                    {stat.number}
                  </div>
                  <div className="text-slate-300 text-xs md:text-sm">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* What's Next Section */}
          <motion.div
            className="text-center mb-8 md:mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
              What's Coming Next?
            </h3>
            <p className="text-slate-300 text-base md:text-lg mb-6 md:mb-8 px-4">
              You're about to set your first social skills goal and receive
              your personalized learning path
            </p>

            <Button
              onClick={handleNextStep}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 md:py-4 px-6 md:px-8 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-base md:text-lg"
              data-testid="button-next-step"
            >
              <span className="mr-2">Set Your First Goal</span>
              <ArrowRight size={20} />
            </Button>
          </motion.div>

          {/* Detailed Features Section */}
          <motion.div
            className="mb-8 md:mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-6 md:mb-8 text-center px-4">
              Your Complete Social Skills Toolkit
            </h3>

            <div className="grid gap-4 md:gap-8">
              {detailedFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 md:p-8 hover:bg-white/10 transition-all duration-200"
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * (index + 1) }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-6">
                    <div
                      className={`flex-shrink-0 w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center`}
                    >
                      <feature.icon
                        className="text-white"
                        size={24}
                      />
                    </div>

                    <div className="flex-1">
                      <h4 className="text-white font-bold text-lg md:text-xl mb-2 md:mb-3">
                        {feature.title}
                      </h4>
                      <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-3 md:mb-4">
                        {feature.description}
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {feature.benefits.map((benefit, benefitIndex) => (
                          <span
                            key={benefitIndex}
                            className="bg-blue-500/20 border border-blue-500/30 px-2 md:px-3 py-1 rounded-full text-blue-200 text-xs md:text-sm"
                          >
                            <Zap className="inline w-3 h-3 mr-1" />
                            {benefit}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Testimonial Section */}
          

          {/* Final CTA */}
          <motion.div
            className="text-center pb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
          >
            <p className="text-slate-300 text-base md:text-lg mb-6 px-4">
              Ready to transform your social life? Let's set your first goal
              and create your personalized journey.
            </p>

            <Button
              onClick={handleNextStep}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 md:py-4 px-6 md:px-8 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-base md:text-lg"
              data-testid="button-final-cta"
            >
              <span className="mr-2">Start Your Journey Now</span>
              <ArrowRight size={20} />
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  // Initial Landing Page View (SignupPage integrated here)
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  return (
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
        <motion.div 
          className="absolute bottom-20 right-20 w-28 h-28 bg-violet-500/10 rounded-full blur-xl"
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
      </div>

      {/* Main Container */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
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
              <motion.div 
                className="text-slate-300 text-sm"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Already have an account? 
                <button 
                  className="text-blue-400 hover:text-blue-300 transition-colors font-medium ml-1"
                  data-testid="link-signin"
                >
                  Sign In
                </button>
              </motion.div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="max-w-6xl w-full">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Left Side - Signup Form */}
              <motion.div 
                className="order-2 lg:order-1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <SignupForm onSignupSuccess={handleSignupSuccess} />
              </motion.div>

              {/* Right Side - Feature Preview */}
              <motion.div 
                className="order-1 lg:order-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <FeaturePreview />
              </motion.div>
            </div>
          </div>
        </main>

        {/* Footer */}
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
  );
}