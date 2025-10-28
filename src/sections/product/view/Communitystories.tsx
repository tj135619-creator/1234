import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Flame, Target, Users, TrendingUp } from 'lucide-react';

const CommunityStories = ({ userId, userName, userAvatar }) => {
  const [stories, setStories] = useState([
    {
      storyID: '1',
      userID: 'user1',
      username: 'Alex Chen',
      avatar: '👤',
      action: 'Sincere Interest Technique',
      description: 'Spoke to 3 strangers today',
      details: 'Asked open-ended questions about their day and listened actively without interrupting',
      category: 'Conversation Starter',
      difficulty: 'Medium',
      duration: '15 min',
      location: 'Coffee Shop',
      emotion: 'Confident',
      timestamp: Date.now() - 3600000,
      seenBy: [],
      reactions: { fire: 5, clap: 3 },
      anonymousFlag: false,
      streak: 7
    },
    {
      storyID: '2',
      userID: null,
      username: 'Anonymous',
      avatar: '🎭',
      action: 'First Approach',
      description: 'Started conversation at coffee shop',
      details: 'Used a simple opener about the book they were reading. Heart was racing but managed to keep calm tone',
      category: 'Cold Approach',
      difficulty: 'Hard',
      duration: '5 min',
      location: 'Local Cafe',
      emotion: 'Nervous but proud',
      timestamp: Date.now() - 7200000,
      seenBy: ['currentUser'],
      reactions: { fire: 12, clap: 8 },
      anonymousFlag: true,
      streak: 3
    },
    {
      storyID: '3',
      userID: 'user3',
      username: 'Jordan M',
      avatar: '👨',
      action: 'Pivot Method',
      description: 'Networking event - 2 connections',
      details: 'Successfully transitioned from small talk to deeper topics using shared interests as bridges',
      category: 'Networking',
      difficulty: 'Medium',
      duration: '45 min',
      location: 'Tech Meetup',
      emotion: 'Energized',
      timestamp: Date.now() - 10800000,
      seenBy: [],
      reactions: { fire: 8, clap: 6 },
      anonymousFlag: false,
      streak: 14
    },
    {
      storyID: '4',
      userID: 'user4',
      username: 'Sam Rivera',
      avatar: '👩',
      action: 'Eye Contact Mastery',
      description: 'Maintained eye contact entire conversation',
      details: 'Practiced the 3-second rule and broke eye contact naturally. Felt more present and connected',
      category: 'Body Language',
      difficulty: 'Easy',
      duration: '10 min',
      location: 'Gym',
      emotion: 'Accomplished',
      timestamp: Date.now() - 14400000,
      seenBy: ['currentUser'],
      reactions: { fire: 15, clap: 10 },
      anonymousFlag: false,
      streak: 21
    },
    {
      storyID: '5',
      userID: 'user5',
      username: 'Taylor Swift',
      avatar: '🧑',
      action: 'Group Conversation',
      description: 'Joined group discussion at party',
      details: 'Waited for natural pause, added value to conversation with relevant story, got positive feedback',
      category: 'Group Dynamics',
      difficulty: 'Hard',
      duration: '30 min',
      location: 'House Party',
      emotion: 'Thrilled',
      timestamp: Date.now() - 18000000,
      seenBy: [],
      reactions: { fire: 7, clap: 9 },
      anonymousFlag: false,
      streak: 5
    },
    {
      storyID: '6',
      userID: null,
      username: 'Anonymous',
      avatar: '🎭',
      action: 'Rejection Practice',
      description: 'Asked for discount, got rejected gracefully',
      details: 'Used Jia Jiang\'s rejection therapy method. Stayed calm, smiled, and thanked them anyway',
      category: 'Comfort Zone',
      difficulty: 'Hard',
      duration: '2 min',
      location: 'Retail Store',
      emotion: 'Liberated',
      timestamp: Date.now() - 21600000,
      seenBy: ['currentUser'],
      reactions: { fire: 20, clap: 15 },
      anonymousFlag: true,
      streak: 1
    }
  ]);

  const [currentStoryIndex, setCurrentStoryIndex] = useState(null);
  const [currentUser] = useState(userId || 'currentUser');
  const [progress, setProgress] = useState(0);

  const handleStoryClick = (index) => {
    setCurrentStoryIndex(index);
    setProgress(0);
    markAsSeen(index);
  };

  const markAsSeen = (index) => {
    setStories(prev => {
      const updated = [...prev];
      if (!updated[index].seenBy.includes(currentUser)) {
        updated[index].seenBy = [...updated[index].seenBy, currentUser];
      }
      return updated;
    });
  };

  const handleReaction = (type) => {
    if (currentStoryIndex === null) return;
    setStories(prev => {
      const updated = [...prev];
      updated[currentStoryIndex].reactions[type] = (updated[currentStoryIndex].reactions[type] || 0) + 1;
      return updated;
    });
  };

  const nextStory = () => {
    if (currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1);
      setProgress(0);
      markAsSeen(currentStoryIndex + 1);
    } else {
      setCurrentStoryIndex(null);
    }
  };

  const prevStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
      setProgress(0);
    }
  };

  const getTimeAgo = (timestamp) => {
    const diff = Date.now() - timestamp;
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor(diff / 60000);
    if (hours > 0) return `${hours}h ago`;
    return `${minutes}m ago`;
  };

  const isStorySeen = (story) => {
    return story.seenBy.includes(currentUser);
  };

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'Easy': return 'text-green-400';
      case 'Medium': return 'text-yellow-400';
      case 'Hard': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  // Auto-progress timer
  useEffect(() => {
    if (currentStoryIndex === null) return;

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          nextStory();
          return 0;
        }
        return prev + 1;
      });
    }, 50);

    return () => clearInterval(timer);
  }, [currentStoryIndex]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (currentStoryIndex === null) return;
      if (e.key === 'ArrowLeft') prevStory();
      if (e.key === 'ArrowRight') nextStory();
      if (e.key === 'Escape') setCurrentStoryIndex(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStoryIndex]);

  return (
    <>
      {/* Stories Feed - Horizontal Scroll */}
      <div className="w-full">
        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
          {stories.map((story, index) => (
            <div
              key={story.storyID}
              onClick={() => handleStoryClick(index)}
              className="flex-shrink-0 cursor-pointer group"
            >
              <div className="relative">
                {/* Ring */}
                <div className={`w-20 h-20 rounded-full p-[3px] ${
                  isStorySeen(story)
                    ? 'bg-gray-700'
                    : 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600'
                } group-hover:scale-105 transition-transform`}>
                  {/* Avatar */}
                  <div className="w-full h-full rounded-full bg-gray-900 border-2 border-black flex items-center justify-center text-3xl">
                    {story.avatar}
                  </div>
                </div>
                
                {/* Streak Badge */}
                {story.streak > 0 && (
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-gradient-to-br from-orange-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg border-2 border-black">
                    <span className="text-xs font-bold text-white">{story.streak}</span>
                  </div>
                )}
              </div>
              <p className="text-xs text-center mt-2 text-white font-normal max-w-[80px] truncate">
                {story.username}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Story Viewer Modal */}
      {currentStoryIndex !== null && (
        <div className="fixed inset-0 bg-black z-[9999] flex items-center justify-center">
          <div className="relative w-full max-w-md h-full md:h-[90vh] bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
            {/* Progress Bars */}
            <div className="absolute top-0 left-0 right-0 flex gap-1 p-2 z-10">
              {stories.map((_, idx) => (
                <div key={idx} className="flex-1 h-0.5 bg-white bg-opacity-30 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-white transition-all ${
                      idx < currentStoryIndex ? 'w-full' :
                      idx === currentStoryIndex ? `w-[${progress}%]` : 'w-0'
                    }`}
                    style={idx === currentStoryIndex ? { width: `${progress}%` } : {}}
                  />
                </div>
              ))}
            </div>

            {/* Header */}
            <div className="absolute top-3 left-0 right-0 flex items-center justify-between px-4 z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-2xl border-2 border-white">
                  {stories[currentStoryIndex].avatar}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{stories[currentStoryIndex].username}</p>
                  <p className="text-white text-xs opacity-70">
                    {getTimeAgo(stories[currentStoryIndex].timestamp)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCurrentStoryIndex(null)}
                className="w-9 h-9 rounded-full bg-black bg-opacity-50 flex items-center justify-center hover:bg-opacity-70 backdrop-blur-sm"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Story Content - Data Card */}
            <div className="h-full flex items-center justify-center px-6 py-20">
              <div className="w-full space-y-6">
                {/* Main Action Title */}
                <div className="text-center">
                  <div className="inline-block px-4 py-1.5 bg-white bg-opacity-10 backdrop-blur-md rounded-full mb-4">
                    <span className="text-xs text-white opacity-90">{stories[currentStoryIndex].category}</span>
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-2">
                    {stories[currentStoryIndex].action}
                  </h2>
                  <p className="text-xl text-white opacity-90">
                    {stories[currentStoryIndex].description}
                  </p>
                </div>

                {/* Details Card */}
                <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 space-y-4 border border-white border-opacity-20">
                  <div>
                    <p className="text-white text-sm leading-relaxed">
                      {stories[currentStoryIndex].details}
                    </p>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white border-opacity-20">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-blue-400" />
                      <div>
                        <p className="text-xs text-white opacity-60">Difficulty</p>
                        <p className={`text-sm font-semibold ${getDifficultyColor(stories[currentStoryIndex].difficulty)}`}>
                          {stories[currentStoryIndex].difficulty}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-400" />
                      <div>
                        <p className="text-xs text-white opacity-60">Duration</p>
                        <p className="text-sm font-semibold text-white">
                          {stories[currentStoryIndex].duration}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-purple-400" />
                      <div>
                        <p className="text-xs text-white opacity-60">Location</p>
                        <p className="text-sm font-semibold text-white">
                          {stories[currentStoryIndex].location}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Flame className="w-4 h-4 text-orange-400" />
                      <div>
                        <p className="text-xs text-white opacity-60">Feeling</p>
                        <p className="text-sm font-semibold text-white">
                          {stories[currentStoryIndex].emotion}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Streak Display */}
                  {stories[currentStoryIndex].streak > 0 && (
                    <div className="pt-4 border-t border-white border-opacity-20">
                      <div className="flex items-center justify-center gap-2">
                        <Flame className="w-5 h-5 text-orange-500" />
                        <span className="text-white font-bold text-lg">
                          {stories[currentStoryIndex].streak} Day Streak!
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Navigation Areas (Tap left/right) */}
            <div className="absolute inset-0 flex z-0">
              <div
                className="w-1/3 h-full cursor-pointer"
                onClick={prevStory}
              />
              <div className="w-1/3 h-full" />
              <div
                className="w-1/3 h-full cursor-pointer"
                onClick={nextStory}
              />
            </div>

            {/* Navigation Buttons */}
            {currentStoryIndex > 0 && (
              <button
                onClick={prevStory}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 rounded-full bg-black bg-opacity-50 flex items-center justify-center hover:bg-opacity-70 z-20 backdrop-blur-sm"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
            )}
            {currentStoryIndex < stories.length - 1 && (
              <button
                onClick={nextStory}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 rounded-full bg-black bg-opacity-50 flex items-center justify-center hover:bg-opacity-70 z-20 backdrop-blur-sm"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            )}

            {/* Reaction Bar */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black to-transparent z-10">
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => handleReaction('fire')}
                  className="flex items-center gap-2 px-8 py-3.5 bg-white bg-opacity-15 backdrop-blur-md rounded-full hover:bg-opacity-25 transition-all border border-white border-opacity-20"
                >
                  <span className="text-2xl">🔥</span>
                  <span className="text-white font-bold text-lg">
                    {stories[currentStoryIndex].reactions.fire}
                  </span>
                </button>
                <button
                  onClick={() => handleReaction('clap')}
                  className="flex items-center gap-2 px-8 py-3.5 bg-white bg-opacity-15 backdrop-blur-md rounded-full hover:bg-opacity-25 transition-all border border-white border-opacity-20"
                >
                  <span className="text-2xl">👏</span>
                  <span className="text-white font-bold text-lg">
                    {stories[currentStoryIndex].reactions.clap}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  );
};

export default CommunityStories;