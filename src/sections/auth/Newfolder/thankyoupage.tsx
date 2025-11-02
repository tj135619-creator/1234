import { useEffect } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle,
  ArrowRight,
  Brain,
  TrendingUp,
  MessageCircle,
  Trophy,
  Star,
  Target,
  Users,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const detailedFeatures = [
  {
    icon: Brain,
    title: "Micro-Missions You Can Actually Do",
    description:
      "Start with actions so small they feel manageable—like 'make eye contact with one person today.' Our AI creates daily steps based on where you actually are, not where you think you should be.",
    benefits: [
      "Matched to your comfort level",
      "Based on proven psychology",
      "Build confidence gradually",
    ],
    gradient: "from-blue-500 to-blue-600",
  },
  {
    icon: TrendingUp,
    title: "See Your Progress (Privately)",
    description:
      "Track your journey on a visual map that only you can see. Each completed mission unlocks the next small step—watch your path unfold without anyone watching or judging.",
    benefits: [
      "Private progress tracking",
      "Unlock skills at your pace",
      "No comparisons to others",
    ],
    gradient: "from-purple-500 to-purple-600",
  },
  {
    icon: MessageCircle,
    title: "Practice Without Real-World Risk",
    description:
      "Talk to our AI when you need help. Practice what to say, get feedback in private, and build confidence before trying anything in real life. No pressure. No audience.",
    benefits: ["Safe practice space", "Instant private feedback", "Zero social risk"],
    gradient: "from-indigo-500 to-indigo-600",
  },
  {
    icon: Trophy,
    title: "Track Wins You Actually Care About",
    description:
      "Celebrate your streaks and milestones privately. This isn't about leaderboards—it's about noticing you're showing up for yourself, even when it's hard.",
    benefits: [
      "Personal streak tracking",
      "Private achievements",
      "Progress just for you",
    ],
    gradient: "from-violet-500 to-violet-600",
  },
  {
    icon: Target,
    title: "Your Goals, Your Timeline",
    description:
      "Tell us what you're working toward—maybe it's just having one person to talk to. We'll adapt the lessons to match your life, not some generic social skills playbook.",
    benefits: [
      "Personalized for your reality",
      "Set goals that feel real",
      "Content adapts to you",
    ],
    gradient: "from-emerald-500 to-emerald-600",
  },
  {
    icon: Users,
    title: "Connect When You're Ready (Optional)",
    description:
      "When you feel ready, join others who started exactly where you are. Share progress if you want, stay private if you don't. No forced participation. No awkward icebreakers.",
    benefits: ["Join only when ready", "Optional peer support", "People who understand"],
    gradient: "from-orange-500 to-orange-600",
  },
];

const successStats = [
  { number: "1", label: "Book" },
  { number: "Small", label: "daily steps" },
  { number: "10", label: "Minutes daily" },
  { number: "Real", label: "Progress possible" },
];

export default function ThankYouPage() {
  useEffect(() => {
    // Optional: Add analytics tracking for signup completion
    console.log("User completed signup - track conversion");
  }, []);

  const handleNextStep = () => {
    window.location.href = "/creategoal";
  };

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
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
        <motion.div
          className="absolute bottom-32 left-1/4 w-40 h-40 bg-indigo-500/10 rounded-full blur-xl"
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative z-10 min-h-screen">
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
                <CheckCircle className="text-white text-lg" />
              </div>
              <h1 className="text-2xl font-bold text-white">GoalGrid</h1>
            </motion.div>
          </div>
        </header>

        {/* Main Content */}
        <main className="px-6 py-12">
          <div className="max-w-4xl mx-auto">
            {/* Welcome Section */}
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="bg-green-500/20 border border-green-500/50 rounded-2xl p-8 mb-8">
                <CheckCircle
                  className="text-green-400 text-5xl mb-4 mx-auto"
                  size={64}
                />
                <h2 className="text-4xl font-bold text-white mb-4">
                  You're In. Take a Breath.
                </h2>
                <p className="text-green-200 text-xl">
                  You just took a step that matters. Here's what happens next.
                </p>
              </div>

              {/* Success Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                {successStats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 * (index + 1) }}
                  >
                    <div className="text-2xl font-bold text-blue-400 mb-2">
                      {stat.number}
                    </div>
                    <div className="text-slate-300 text-sm">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* What's Next Section */}
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <h3 className="text-3xl font-bold text-white mb-4">
                Here's What Happens Next
              </h3>
              <p className="text-slate-300 text-lg mb-8">
                You'll see your first small mission. Read it. Try it when (or if) you feel ready. No timers. No pressure. Just you deciding your own pace.
              </p>

              <Button
                onClick={handleNextStep}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-lg"
                data-testid="button-next-step"
              >
                <span className="mr-2">See Your First Mission</span>
                <ArrowRight size={20} />
              </Button>
            </motion.div>

            {/* Detailed Features Section */}
            <motion.div
              className="mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <h3 className="text-3xl font-bold text-white mb-8 text-center">
                What You'll Find Inside
              </h3>

              <div className="grid gap-8">
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
                          className="text-white text-2xl"
                          size={28}
                        />
                      </div>

                      <div className="flex-1">
                        <h4 className="text-white font-bold text-xl mb-3">
                          {feature.title}
                        </h4>
                        <p className="text-slate-300 text-base leading-relaxed mb-4">
                          {feature.description}
                        </p>

                        <div className="flex flex-wrap gap-2">
                          {feature.benefits.map((benefit, benefitIndex) => (
                            <span
                              key={benefitIndex}
                              className="bg-blue-500/20 border border-blue-500/30 px-3 py-1 rounded-full text-blue-200 text-sm"
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
            <motion.div
              className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-white/10 rounded-2xl p-8 text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              <div className="flex justify-center space-x-1 mb-4">
                {[...Array(5)].map((_, index) => (
                  <Star
                    key={index}
                    className="text-yellow-400 fill-current"
                    size={24}
                  />
                ))}
              </div>
              <blockquote className="text-white font-medium text-lg mb-4">
                "I've been isolated for years. GoalGrid didn't magically fix everything, but it gave me something I didn't have before—a starting point that didn't feel impossible or fake."
              </blockquote>
              <cite className="text-slate-400">
                – Someone who started where you are
              </cite>
            </motion.div>

            {/* Final CTA */}
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
            >
              <p className="text-slate-300 text-lg mb-6">
                Everything you do here is private. You can go slow, take breaks, or pause anytime. This is your journey, at your speed.
              </p>

              <Button
                onClick={handleNextStep}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-lg"
                data-testid="button-final-cta"
              >
                <span className="mr-2">Take a Look Around</span>
                <ArrowRight size={20} />
              </Button>
            </motion.div>
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
                  <a
                    href="#"
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    Privacy Policy
                  </a>
                  <a
                    href="#"
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    Terms of Service
                  </a>
                  <a
                    href="#"
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    Contact Support
                  </a>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}