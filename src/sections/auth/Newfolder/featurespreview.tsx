import { motion } from "framer-motion";
import { Brain, TrendingUp, MessageCircle, Trophy, Star, Check } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Guided Daily Missions",
    description:
      "Start with micro-actions that feel manageable—like 'make eye contact once today' or 'say hi to a cashier.' Our AI breaks social skills into steps so small, you can't fail. No pressure. No judgment. Just progress.",
    gradient: "from-blue-500 to-blue-600",
  },
  {
    icon: TrendingUp,
    title: "Interactive Map Experience",
    description:
      "See your progress visualized like a game map. Each completed mission unlocks the next skill—from 'Being Present' to 'Starting Conversations.' You're not lost anymore. You have a path.",
    gradient: "from-purple-500 to-purple-600",
  },
  {
    icon: MessageCircle,
    title: "Role-Play & Live Support",
    description:
      "Practice in a safe space where mistakes don't matter. Ask our AI: 'What do I say when someone asks about my weekend?' Get instant feedback. Build confidence before trying it in real life.",
    gradient: "from-indigo-500 to-indigo-600",
  },
  {
    icon: Trophy,
    title: "Private Progress Tracking",
    description:
      "Track your progress privately with streaks and milestones. When you're ready, connect with others who started exactly where you are—not where you wish you were.",
    gradient: "from-violet-500 to-violet-600",
  },
];

const testimonialAvatars = [
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
  "https://images.unsplash.com/photo-1494790108755-2616b9888882?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
];

export default function FeaturePreview() {
  return (
    <div>
      <div className="text-center lg:text-left mb-8">
        <motion.h3
          className="text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          You're Not Broken.{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
            You Just Need a Different Starting Point.
          </span>
        </motion.h3>
        <motion.p
          className="text-slate-400 text-lg mb-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          AI-guided social skills for people starting from zero
        </motion.p>
        <motion.p
          className="text-slate-300 text-xl leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Start with actions so small they don't feel scary. Build real connection skills one tiny step at a time—completely private, zero pressure, 100% free.
        </motion.p>
      </div>

      {/* Reassurance Bar */}
      <motion.div
        className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-8 text-sm text-slate-300">
          <span className="flex items-center space-x-2">
            <Check size={16} className="text-green-400" />
            <span>Start completely alone</span>
          </span>
          <span className="flex items-center space-x-2">
            <Check size={16} className="text-green-400" />
            <span>No awkward group chats</span>
          </span>
          <span className="flex items-center space-x-2">
            <Check size={16} className="text-green-400" />
            <span>Practice privately first</span>
          </span>
        </div>
      </motion.div>

      {/* Feature Cards Grid */}
      <div className="grid gap-6 mb-8">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-200 hover:transform hover:scale-105"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 * (index + 4) }}
            whileHover={{ y: -5 }}
          >
            <div className="flex items-start space-x-4">
              <div
                className={`flex-shrink-0 w-12 h-12 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center`}
              >
                <feature.icon className="text-white text-lg" size={20} />
              </div>
              <div className="flex-1">
                <h4 className="text-white font-semibold text-lg mb-2">
                  {feature.title}
                </h4>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Social Proof */}
      <motion.div
        className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-white/10 rounded-xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        data-testid="testimonial-section"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex -space-x-2">
            {testimonialAvatars.map((avatar, index) => (
              <img
                key={index}
                src={avatar}
                alt={`User testimonial ${index + 1}`}
                className="w-10 h-10 rounded-full border-2 border-slate-800 object-cover"
                data-testid={`avatar-${index}`}
              />
            ))}
          </div>
          <div className="flex items-center space-x-2 text-slate-300 text-sm">
            <Star className="text-yellow-400 fill-current" size={14} />
            <span>Trusted by people who started from zero</span>
          </div>
        </div>
        <blockquote className="text-white font-medium mb-2 leading-relaxed">
          "I hadn't had a real conversation in months. GoalGrid helped me take the first step without feeling judged. Now I actually have someone to text."
        </blockquote>
        <cite className="text-slate-400 text-sm not-italic">
          – Someone who gets it
        </cite>
      </motion.div>

      {/* Final Reassurance */}
      <motion.div
        className="text-center mt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1 }}
      >
        <p className="text-slate-400 text-sm">
          No cost. No risk. Just you and a clear path forward.
        </p>
      </motion.div>
    </div>
  );
}