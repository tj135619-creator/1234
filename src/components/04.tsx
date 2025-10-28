import React, { useState } from "react";
import { motion } from "framer-motion";
import { Users, Flame, Trophy, ChevronRight, Sparkles, Star, Zap, MessageCircle, Crown } from "lucide-react";

interface Friend {
  id: string;
  name: string;
  avatar: string;
  league: string;
  streak: number;
  points: number;
  isOnline: boolean;
  friendshipLevel: number;
}

export interface CommunityTeaserProps {
  friends: Friend[];
}

const mockFriends = [
  {
    id: "1",
    name: "Sarah Chen",
    avatar: "https://i.pravatar.cc/150?img=1",
    league: "💠",
    streak: 45,
    points: 2850,
    isOnline: true,
    friendshipLevel: 5
  },
  {
    id: "2",
    name: "Alex Kumar",
    avatar: "https://i.pravatar.cc/150?img=2",
    league: "💎",
    streak: 32,
    points: 2100,
    isOnline: true,
    friendshipLevel: 4
  },
  {
    id: "3",
    name: "Emma Wilson",
    avatar: "https://i.pravatar.cc/150?img=3",
    league: "🥇",
    streak: 28,
    points: 1750,
    isOnline: false,
    friendshipLevel: 3
  },
  {
    id: "4",
    name: "Marcus Johnson",
    avatar: "https://i.pravatar.cc/150?img=4",
    league: "🥈",
    streak: 15,
    points: 980,
    isOnline: true,
    friendshipLevel: 2
  }
];

const CommunityTeaser = () => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div className="w-full min-h-screen bg-transparent p-4 md:p-8 lg:p-12 relative overflow-hidden">
      {/* Epic Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ 
            scale: [1, 1.3, 1],
            rotate: [0, 180, 360],
            x: [0, 100, 0],
            y: [0, -100, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ 
            scale: [1.3, 1, 1.3],
            rotate: [360, 180, 0],
            x: [0, -100, 0],
            y: [0, 100, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-pink-500/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ 
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"
        />
      </div>

      {/* Floating Particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [0.2, 0.8, 0.2]
          }}
          transition={{
            duration: 3 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 5
          }}
          className="absolute w-1 h-1 bg-white rounded-full"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`
          }}
        />
      ))}

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Stunning Header */}
        <motion.div 
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-12"
        >
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="inline-flex items-center gap-2 md:gap-3 mb-4 md:mb-6 px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-purple-600/40 to-pink-600/40 backdrop-blur-md rounded-full border-2 border-purple-400/50 shadow-2xl shadow-purple-500/30"
          >
            <Sparkles className="w-4 md:w-5 h-4 md:h-5 text-yellow-300 animate-pulse" />
            <span className="text-sm md:text-lg font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              Your Learning Squad
            </span>
            <Sparkles className="w-4 md:w-5 h-4 md:h-5 text-pink-300 animate-pulse" />
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 md:mb-6 leading-tight flex flex-col sm:flex-row items-center justify-center gap-2 md:gap-3"
          >
            <Users className="w-8 h-8 md:w-10 md:h-10 text-purple-400" />
            <span className="bg-gradient-to-r from-purple-200 via-pink-200 to-purple-300 bg-clip-text text-transparent">
              Friends Community
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-base md:text-lg text-purple-300 max-w-2xl mx-auto mb-6 md:mb-8 px-4"
          >
            Connect, compete, and grow together
          </motion.p>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            whileHover={{ scale: 1.05, boxShadow: "0 20px 60px rgba(168, 85, 247, 0.4)" }}
            whileTap={{ scale: 0.95 }}
            className="group px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-[length:200%_100%] hover:bg-right rounded-2xl font-bold text-lg md:text-xl text-white shadow-2xl shadow-purple-500/50 border border-purple-400/30 transition-all duration-300"
          >
            <span className="flex items-center gap-2 md:gap-3">
              Explore Full Community
              <ChevronRight className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-2 transition-transform" />
            </span>
          </motion.button>
        </motion.div>

        {/* Stats Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-12 md:mb-16"
        >
          {[
            { icon: Users, label: "Active Friends", value: "1,234", gradient: "from-purple-600 to-pink-600", iconColor: "text-purple-300" },
            { icon: Flame, label: "Total Streaks", value: "450+", gradient: "from-orange-600 to-red-600", iconColor: "text-orange-300" },
            { icon: Trophy, label: "Community XP", value: "85.2K", gradient: "from-yellow-600 to-orange-600", iconColor: "text-yellow-300" }
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.2 + idx * 0.1, type: "spring" }}
              whileHover={{ scale: 1.05, y: -8 }}
              className="relative group cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
              <div className={`relative bg-gradient-to-br ${stat.gradient} p-4 md:p-6 rounded-2xl border border-white/20 shadow-2xl backdrop-blur-sm overflow-hidden`}>
                <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/10" />
                <stat.icon className={`w-8 h-8 md:w-10 md:h-10 ${stat.iconColor} mb-2 md:mb-3 relative z-10`} />
                <p className="text-2xl md:text-4xl font-black text-white mb-1 relative z-10">{stat.value}</p>
                <p className="text-xs md:text-sm font-semibold text-white/80 relative z-10">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Your Friends Section - EPIC */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.8 }}
        >
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="p-2 md:p-3 bg-gradient-to-br from-pink-600 to-purple-600 rounded-xl shadow-lg">
                <Users className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl md:text-4xl font-black bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                  Your Friends
                </h2>
                <p className="text-purple-300 text-xs md:text-sm font-medium">
                  {mockFriends.length} amazing people in your circle
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4 md:gap-6">
            {mockFriends.map((friend, index) => (
              <motion.div
                key={friend.id}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.7 + index * 0.1, duration: 0.6 }}
                whileHover={{ scale: 1.03, y: -5 }}
                onHoverStart={() => setHoveredId(friend.id)}
                onHoverEnd={() => setHoveredId(null)}
                className="group cursor-pointer relative"
              >
                {/* Glow Effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 rounded-3xl blur-xl opacity-0 group-hover:opacity-75 transition-opacity duration-500" />
                
                <div className="relative bg-gradient-to-br from-purple-900/80 to-indigo-900/80 backdrop-blur-xl p-4 md:p-6 rounded-3xl border-2 border-purple-500/30 group-hover:border-purple-400/60 transition-all shadow-2xl overflow-hidden">
                  
                  {/* Animated Background Pattern */}
                  <motion.div
                    animate={{
                      backgroundPosition: hoveredId === friend.id ? ["0% 0%", "100% 100%"] : "0% 0%"
                    }}
                    transition={{ duration: 3, ease: "linear", repeat: hoveredId === friend.id ? Infinity : 0 }}
                    className="absolute inset-0 opacity-10"
                    style={{
                      backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)",
                      backgroundSize: "30px 30px"
                    }}
                  />

                  <div className="relative z-10 flex flex-col sm:flex-row items-start gap-4">
                    {/* Avatar with Epic Effects */}
                    <div className="relative flex-shrink-0">
                      <motion.div
                        animate={{
                          rotate: hoveredId === friend.id ? 360 : 0,
                          scale: hoveredId === friend.id ? 1.1 : 1
                        }}
                        transition={{ duration: 0.5 }}
                        className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-full blur-lg opacity-75"
                      />
                      <img
                        src={friend.avatar}
                        alt={friend.name}
                        className="relative w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border-4 border-purple-400/50 shadow-2xl"
                      />
                      {friend.isOnline && (
                        <motion.span 
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="absolute bottom-0 right-0 w-6 h-6 bg-green-400 border-4 border-purple-900 rounded-full shadow-lg shadow-green-400/50"
                        />
                      )}
                      <div className="absolute -bottom-2 -right-2 text-3xl">
                        {friend.league}
                      </div>
                    </div>

                    {/* Friend Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl md:text-2xl font-bold text-white mb-2 group-hover:text-purple-200 transition-colors">
                        {friend.name}
                      </h3>
                      
                      {/* Friendship Stars */}
                      <div className="flex items-center gap-1 mb-3">
                        {[...Array(5)].map((_, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 1.9 + index * 0.1 + idx * 0.05, type: "spring" }}
                          >
                            <Star
                              className={`w-4 h-4 ${
                                idx < friend.friendshipLevel
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-purple-700'
                              }`}
                            />
                          </motion.div>
                        ))}
                      </div>

                      {/* Stats Row */}
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-orange-600/30 to-red-600/30 rounded-xl border border-orange-500/40">
                          <Flame className="w-5 h-5 text-orange-400" />
                          <span className="font-bold text-white text-lg">{friend.streak}</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-yellow-600/30 to-orange-600/30 rounded-xl border border-yellow-500/40">
                          <Trophy className="w-5 h-5 text-yellow-400" />
                          <span className="font-bold text-white text-lg">{friend.points}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-semibold text-white text-sm shadow-lg hover:shadow-xl transition-all"
                        >
                          <MessageCircle className="w-4 h-4" />
                          Message
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl font-semibold text-white text-sm border border-white/20 backdrop-blur-sm transition-all"
                        >
                          <Zap className="w-4 h-4" />
                          Challenge
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.2, duration: 0.8 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-md rounded-full border border-purple-400/30">
            <Crown className="w-5 h-5 text-yellow-400" />
            <span className="text-purple-200 font-medium">
              Join <span className="font-bold text-white">1,234 active learners</span> in the community
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CommunityTeaser;