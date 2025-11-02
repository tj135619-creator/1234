

import { useState, useEffect, useMemo } from 'react';
import { Sparkles, Trophy, Flame, TrendingUp, Calendar, Target, Award, CheckCircle, Star, Plus, Trash2, Edit3, BarChart3, Zap, Heart, MessageCircle, Users, Gift, LogOut, User, Loader2, ChevronDown, ChevronUp, Clock } from 'lucide-react';

// Firebase imports
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, query, orderBy, onSnapshot, doc, setDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from 'firebase/auth';


import { useSearchParams } from 'react-router-dom';



// ============================================================================
// FIREBASE CONFIGURATION
// ============================================================================

const firebaseConfig = {
  apiKey: "AIzaSyBNCXIOAX2HUdeLvUxkTJh7DVbv8JU485s",
  authDomain: "goalgrid-c5e9c.firebaseapp.com",
  projectId: "goalgrid-c5e9c",
  storageBucket: "goalgrid-c5e9c.firebasestorage.app",
  databaseURL: "https://goalgrid-c5e9c-default-rtdb.firebaseio.com",
  messagingSenderId: "544004357501",
  appId: "1:544004357501:web:4b81a3686422b28534e014",
  measurementId: "G-BJQMLK9JJ1"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

// ============================================================================
// CONSTANTS & PREDEFINED DATA
// ============================================================================

const PREDEFINED_ACTIONS = [
  { label: 'Compliment Someone', difficulty: 'easy', benefit: 'Builds rapport & spreads positivity', category: 'Connection' },
  { label: 'Practice Small Talk', difficulty: 'easy', benefit: 'Improves everyday social fluency', category: 'Communication' },
  { label: 'Help a Colleague', difficulty: 'easy', benefit: 'Builds goodwill & team trust', category: 'Collaboration' },
  { label: 'Send Thank You Message', difficulty: 'easy', benefit: 'Strengthens relationships', category: 'Gratitude' },
  { label: 'Active Listening Practice', difficulty: 'easy', benefit: 'Enhances understanding & empathy', category: 'Communication' },
  
  { label: 'Initiate Conversation', difficulty: 'medium', benefit: 'Builds confidence & social momentum', category: 'Initiative' },
  { label: 'Join Group Activity', difficulty: 'medium', benefit: 'Expands social circle & comfort zone', category: 'Collaboration' },
  { label: 'Reconnect with Old Friend', difficulty: 'medium', benefit: 'Maintains valuable relationships', category: 'Connection' },
  { label: 'Public Speaking Moment', difficulty: 'medium', benefit: 'Overcomes fear & builds presence', category: 'Leadership' },
  { label: 'Network with Stranger', difficulty: 'medium', benefit: 'Opens new opportunities', category: 'Initiative' },
  
  { label: 'Ask for Honest Feedback', difficulty: 'hard', benefit: 'Accelerates self-awareness & growth', category: 'Development' },
  { label: 'Share Vulnerable Story', difficulty: 'hard', benefit: 'Deepens authentic connection', category: 'Connection' },
  { label: 'Give Constructive Criticism', difficulty: 'hard', benefit: 'Builds trust through honesty', category: 'Leadership' },
  { label: 'Invite Someone New Out', difficulty: 'hard', benefit: 'Expands network courageously', category: 'Initiative' },
  { label: 'Resolve a Conflict', difficulty: 'hard', benefit: 'Strengthens emotional intelligence', category: 'Development' },
];

const DIFFICULTY_CONFIG = {
  easy: { xp: 10, color: '#a78bfa', label: 'Easy', icon: '🌱' },
  medium: { xp: 25, color: '#c084fc', label: 'Medium', icon: '🔥' },
  hard: { xp: 50, color: '#e879f9', label: 'Hard', icon: '💎' },
};

const ACHIEVEMENTS = [
  { id: 'first_step', title: 'First Step', description: 'Complete your first action', icon: '🌟', threshold: 1 },
  { id: 'getting_started', title: 'Getting Started', description: 'Complete 5 actions', icon: '✨', threshold: 5 },
  { id: 'momentum_builder', title: 'Momentum Builder', description: 'Complete 10 actions', icon: '🚀', threshold: 10 },
  { id: 'social_warrior', title: 'Social Warrior', description: 'Complete 25 actions', icon: '⚡', threshold: 25 },
  { id: 'legendary', title: 'Legendary', description: 'Complete 50 actions', icon: '👑', threshold: 50 },
  { id: 'streak_master', title: 'Streak Master', description: 'Maintain a 7-day streak', icon: '🔥', threshold: 7 },
  { id: 'xp_hunter', title: 'XP Hunter', description: 'Earn 500 XP', icon: '💰', threshold: 500 },
];

const MOTIVATIONAL_QUOTES = [
  "Every conversation is a chance to grow.",
  "Small actions create powerful momentum.",
  "You're building skills that last a lifetime.",
  "Consistency beats perfection every time.",
  "Your comfort zone is expanding!",
  "Social skills are learnable, not innate.",
  "Each interaction is practice, not performance.",
  "Progress, not perfection, is the goal.",
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const calculateStreak = (actions) => {
  if (actions.length === 0) return 0;
  
  const validActions = actions.filter(a => a.timestamp && !isNaN(a.timestamp) && a.timestamp > 0);
  if (validActions.length === 0) return 0;
  
  const sortedActions = [...validActions].sort((a, b) => b.timestamp - a.timestamp);
  const today = new Date().setHours(0, 0, 0, 0);
  const oneDayMs = 24 * 60 * 60 * 1000;
  
  let streak = 0;
  let currentDate = today;
  
  for (const action of sortedActions) {
    const actionDate = new Date(action.timestamp).setHours(0, 0, 0, 0);
    const diffDays = Math.floor((currentDate - actionDate) / oneDayMs);
    
    if (diffDays === 0 || diffDays === 1) {
      if (diffDays === 1) streak++;
      currentDate = actionDate;
    } else {
      break;
    }
  }
  
  return streak;
};

const getWeeklyData = (actions) => {
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const today = new Date();
  const weekData = [];
  
  const validActions = actions.filter(a => a.timestamp && !isNaN(a.timestamp) && a.timestamp > 0);
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);
    
    const count = validActions.filter(a => 
      a.timestamp >= date.getTime() && a.timestamp < nextDate.getTime()
    ).length;
    
    weekData.push({
      day: days[date.getDay()],
      actions: count,
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    });
  }
  
  return weekData;
};

const getTodayActions = (actions) => {
  const today = new Date().setHours(0, 0, 0, 0);
  const tomorrow = today + 24 * 60 * 60 * 1000;
  
  return actions.filter(a => 
    a.timestamp >= today && a.timestamp < tomorrow
  ).sort((a, b) => b.timestamp - a.timestamp);
};

const calculateStats = (actions) => {
  const totalActions = actions.reduce((sum, a) => sum + (a.count || 1), 0);
  const totalXP = actions.reduce((sum, a) => {
    const difficulty = a.difficulty || 'medium';
    const difficultyConfig = DIFFICULTY_CONFIG[difficulty];
    if (!difficultyConfig) return sum;
    return sum + (difficultyConfig.xp * (a.count || 1));
  }, 0);
  const currentStreak = calculateStreak(actions);
  
  const weekData = getWeeklyData(actions);
  const weeklyTotal = weekData.reduce((sum, d) => sum + d.actions, 0);
  const weeklyAverage = parseFloat((weeklyTotal / 7).toFixed(1));
  
  const actionsWithReflections = actions.filter(a => a.reflection && a.reflection.trim().length > 0).length;
  const completionRate = actions.length > 0 ? Math.round((actionsWithReflections / actions.length) * 100) : 0;
  
  const sortedByTimestamp = [...actions].sort((a, b) => b.timestamp - a.timestamp);
  let longestStreak = 0;
  let tempStreak = 0;
  let lastDate = null;
  
  for (const action of sortedByTimestamp) {
    if (!action.timestamp || isNaN(action.timestamp) || action.timestamp <= 0) continue;
    
    const actionDate = new Date(action.timestamp).setHours(0, 0, 0, 0);
    if (lastDate === null) {
      tempStreak = 1;
    } else {
      const diffDays = Math.floor((lastDate - actionDate) / (24 * 60 * 60 * 1000));
      if (diffDays === 1) {
        tempStreak++;
      } else if (diffDays > 1) {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    lastDate = actionDate;
  }
  longestStreak = Math.max(longestStreak, tempStreak);
  
  return {
    totalActions,
    totalXP,
    currentStreak,
    longestStreak,
    weeklyAverage,
    completionRate
  };
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function SocialSkillsTracker() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actions, setActions] = useState([]);
  const [customAction, setCustomAction] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('medium');
  const [showConfetti, setShowConfetti] = useState(false);
  const [notification, setNotification] = useState(null);
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [editingAction, setEditingAction] = useState(null);
  const [dailyQuote, setDailyQuote] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [showAllAchievements, setShowAllAchievements] = useState(false);
  const [dailyGoal, setDailyGoal] = useState(3);
  const [showQuickActions, setShowQuickActions] = useState(false);
const [showOnboardingOverlay, setShowOnboardingOverlay] = useState(true);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const stats = useMemo(() => calculateStats(actions), [actions]);
  const todayActions = useMemo(() => getTodayActions(actions), [actions]);
  const todayXP = useMemo(() => 
    todayActions.reduce((sum, a) => sum + DIFFICULTY_CONFIG[a.difficulty].xp, 0),
    [todayActions]
  );

  const achievements = useMemo(() => {
    return ACHIEVEMENTS.map(achievement => {
      let progress = 0;
      let unlocked = false;

      switch (achievement.id) {
        case 'first_step':
        case 'getting_started':
        case 'momentum_builder':
        case 'social_warrior':
        case 'legendary':
          progress = stats.totalActions;
          unlocked = stats.totalActions >= achievement.threshold;
          break;
        case 'streak_master':
          progress = stats.currentStreak;
          unlocked = stats.currentStreak >= achievement.threshold;
          break;
        case 'xp_hunter':
          progress = stats.totalXP;
          unlocked = stats.totalXP >= achievement.threshold;
          break;
      }

      return {
        ...achievement,
        progress,
        unlocked
      };
    });
  }, [stats]);

  const nextAchievements = useMemo(() => {
    return achievements.filter(a => !a.unlocked).slice(0, 3);
  }, [achievements]);

  // ============================================================================
  // FIREBASE AUTHENTICATION
  // ============================================================================

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setLoading(false);
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // ============================================================================
  // GOOGLE SIGN IN
  // ============================================================================

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
      showNotification(`Welcome, ${result.user.displayName || 'User'}! 🎉`);
    } catch (error) {
      console.error('Google sign in failed:', error);
      showNotification('Sign in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // FIREBASE DATA SYNC
  // ============================================================================

  useEffect(() => {
    if (!user) return;

    const actionsCollection = collection(db, 'users', user.uid, 'actions');
    const q = query(actionsCollection, orderBy('timestamp', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const actionsArray = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          label: data.label || 'Untitled Action',
          difficulty: data.difficulty || 'medium',
          benefit: data.benefit || '',
          count: data.count || 1,
          stars: data.stars || 0,
          reflection: data.reflection || '',
          timestamp: data.timestamp || Date.now(),
          category: data.category || 'Custom'
        };
      });
      setActions(actionsArray);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    const quoteIndex = new Date().getDate() % MOTIVATIONAL_QUOTES.length;
    setDailyQuote(MOTIVATIONAL_QUOTES[quoteIndex]);
  }, []);

  // ============================================================================
  // FIREBASE OPERATIONS
  // ============================================================================

  const saveActionToFirebase = async (action) => {
    if (!user) return;
    const actionsCollection = collection(db, 'users', user.uid, 'actions');
    const newDoc = doc(actionsCollection);
    await setDoc(newDoc, action);
  };

  const updateActionInFirebase = async (actionId, updates) => {
    if (!user) return;
    const actionDoc = doc(db, 'users', user.uid, 'actions', actionId);
    await updateDoc(actionDoc, updates);
  };

  const deleteActionFromFirestore = async (actionId) => {
    if (!user) return;
    const actionDoc = doc(db, 'users', user.uid, 'actions', actionId);
    await deleteDoc(actionDoc);
  };

  // ============================================================================
  // UI HELPER FUNCTIONS
  // ============================================================================

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const triggerConfetti = () => {
    setShowConfetti(true);
    setTimeout(() => {
      setShowConfetti(false);
    }, 3000);
  };

  // ============================================================================
  // ACTION HANDLERS
  // ============================================================================

  const logPredefinedAction = async (actionTemplate) => {
    const existingAction = actions.find(a => a.label === actionTemplate.label);
    
    if (existingAction) {
      try {
        await updateActionInFirebase(existingAction.id, {
          count: existingAction.count + 1,
          timestamp: Date.now()
        });
        
        const xpGained = DIFFICULTY_CONFIG[actionTemplate.difficulty].xp;
        showNotification(`+${xpGained} XP! ${actionTemplate.label}`);
        setShowQuickActions(false);
      } catch (error) {
        console.error('Failed to update existing action:', error);
      }
    } else {
      const newAction = {
        label: actionTemplate.label,
        difficulty: actionTemplate.difficulty,
        benefit: actionTemplate.benefit,
        category: actionTemplate.category,
        count: 1,
        stars: 0,
        reflection: '',
        timestamp: Date.now()
      };
      
      try {
        await saveActionToFirebase(newAction);
        
        const xpGained = DIFFICULTY_CONFIG[actionTemplate.difficulty].xp;
        showNotification(`🎉 +${xpGained} XP! ${actionTemplate.label}`);
        setShowQuickActions(false);
      } catch (error) {
        console.error('Failed to create new action:', error);
      }
    }

    const newTotalActions = actions.length + (existingAction ? 0 : 1);
    if (newTotalActions % 10 === 0) {
      triggerConfetti();
    }
  };

  const logCustomAction = async () => {
    if (!customAction.trim()) return;
    await saveActionToFirebase({
      label: customAction,
      difficulty: selectedDifficulty,
      benefit: 'Custom social action',
      category: 'Custom',
      count: 1,
      stars: 0,
      reflection: '',
      timestamp: Date.now()
    });
    
    const xpGained = DIFFICULTY_CONFIG[selectedDifficulty].xp;
    showNotification(`🎉 +${xpGained} XP! ${customAction}`);
    setCustomAction('');
  };

  const updateReflection = async (id, reflection) => {
    await updateActionInFirebase(id, { reflection });
  };

  const updateRating = async (id, stars) => {
    await updateActionInFirebase(id, { stars });
  };

  const deleteAction = async (id) => {
    await deleteActionFromFirestore(id);
  };

  const handleSignOut = async () => {
    if (!user) return;
    await signOut(auth);
    setUser(null);
    setActions([]);
  };

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (loading ) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-purple-900 to-indigo-950 text-white flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-16 h-16 text-purple-400 animate-spin mx-auto mb-4" />
        <p className="text-xl text-purple-200">Loading...</p>
      </div>
    </div>
  );
}

  // ============================================================================
  // SIGN IN PAGE - ALIGNED WITH OVERVIEW STYLE
  // ============================================================================

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-950 via-purple-900 to-indigo-950 text-white flex items-center justify-center p-4 md:p-6">
        <div className="max-w-md w-full">
          <div className="text-center mb-8 md:mb-12">
            <div className="inline-flex items-center gap-2 mb-4 md:mb-6 px-4 py-2 bg-purple-800/40 backdrop-blur-sm rounded-full border border-purple-500/30">
              <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-purple-300" />
              <span className="text-xs md:text-sm font-medium text-purple-200">Social Skills Tracker</span>
            </div>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4 bg-gradient-to-r from-purple-200 via-pink-200 to-purple-300 bg-clip-text text-transparent">
              Action Tracker Pro
            </h1>
            
            <p className="text-base md:text-lg text-purple-200 mb-8">
              Transform your social skills through deliberate practice.
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 backdrop-blur-md p-6 md:p-8 rounded-3xl border-2 border-purple-500/30 shadow-2xl">
            <h2 className="text-xl md:text-2xl font-bold text-white mb-2 text-center">Welcome!</h2>
            <p className="text-purple-300 text-center mb-6 text-sm md:text-base">Sign in to start tracking</p>
            
            <button
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-3 px-6 py-3 md:py-4 bg-white hover:bg-gray-50 text-gray-800 font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl"
            >
              <svg className="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </button>
          </div>

          <div className="mt-6 md:mt-8 text-center">
            <p className="text-purple-400 text-xs md:text-sm italic">
              "{dailyQuote}"
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDER MAIN APP - ALIGNED WITH OVERVIEW STYLE
  // ============================================================================

  const filteredActions = filterDifficulty === 'all' 
    ? actions 
    : actions.filter(a => a.difficulty === filterDifficulty);

  const weeklyChartData = getWeeklyData(actions);
  const maxWeeklyActions = Math.max(...weeklyChartData.map(d => d.actions), 1);
  const goalProgress = (todayActions.length / dailyGoal) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-purple-900 to-indigo-950 text-white pb-20">
       
        {/* ONBOARDING FLOATING BOX */}
    {showOnboardingOverlay && (
      <div className="fixed bottom-6 right-6 z-[100] animate-slide-in-right">
        <div className="bg-gradient-to-br from-purple-900/95 to-indigo-900/95 backdrop-blur-xl p-5 md:p-6 rounded-2xl border-2 border-purple-500/50 shadow-2xl max-w-sm w-full relative">
          {/* Close button */}
          <button
            onClick={() => setShowOnboardingOverlay(false)}
            className="absolute top-3 right-3 p-1.5 hover:bg-purple-800/50 rounded-lg transition-all"
          >
            <svg className="w-5 h-5 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="mb-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white">Quick Guide 💡</h3>
            </div>
            <p className="text-purple-200 text-sm">Learn how to use Action Tracker</p>
          </div>

          <div className="space-y-3 mb-4">
            <div className="flex items-start gap-2 text-sm">
              <Target className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
              <p className="text-purple-300">Log actions to earn XP and level up</p>
            </div>

            <div className="flex items-start gap-2 text-sm">
              <Flame className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
              <p className="text-purple-300">Build daily streaks for consistency</p>
            </div>

            <div className="flex items-start gap-2 text-sm">
              <Trophy className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
              <p className="text-purple-300">Unlock achievements as you progress</p>
            </div>
          </div>

          <button
            onClick={() => setShowOnboardingOverlay(false)}
            className="w-full px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl font-semibold text-white text-sm transition-all shadow-lg"
          >
            Got it! 🚀
          </button>
        </div>
      </div>
    )}

      
      {/* HEADER - ALIGNED WITH OVERVIEW STYLE */}
      <div className="sticky top-0 z-50 bg-gradient-to-r from-purple-900/95 via-purple-800/95 to-indigo-900/95 backdrop-blur-md border-b-2 border-purple-500/30 shadow-2xl">
        <div className="px-4 md:px-6 lg:px-10 py-3 md:py-4">
          <div className="flex items-center justify-between gap-3">
            
            {/* User Info */}
            <div  className="flex items-center gap-2 md:gap-3">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-purple-400 shadow-lg" />
              ) : (
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-purple-700 flex items-center justify-center border-2 border-purple-400">
                  <User className="w-4 h-4 md:w-5 md:h-5" />
                </div>
              )}
              <div className="hidden sm:block">
                <p id="blogHeader" className="text-sm md:text-base font-bold text-purple-100">{user?.displayName || 'User'}</p>
                <p className="text-xs text-purple-300">Level {Math.floor(stats.totalXP / 100) + 1}</p>
              </div>
            </div>

            {/* Stats Pills */}
            <div className="flex items-center gap-2 md:gap-3">
              <div className="flex items-center gap-1.5 md:gap-2 px-2.5 md:px-3 py-1.5 md:py-2 bg-orange-500/20 rounded-full border border-orange-400/30">
                <Flame className="w-3.5 h-3.5 md:w-4 md:h-4 text-orange-400" />
                <span className="text-xs md:text-sm font-bold text-orange-100">{stats.currentStreak}</span>
              </div>

              <div className="flex items-center gap-1.5 md:gap-2 px-2.5 md:px-3 py-1.5 md:py-2 bg-green-500/20 rounded-full border border-green-400/30">
                <Target className="w-3.5 h-3.5 md:w-4 md:h-4 text-green-400" />
                <span className="text-xs md:text-sm font-bold text-green-100">{todayActions.length}/{dailyGoal}</span>
              </div>

              <div className="hidden sm:flex items-center gap-1.5 md:gap-2 px-2.5 md:px-3 py-1.5 md:py-2 bg-purple-500/20 rounded-full border border-purple-400/30">
                <Trophy className="w-3.5 h-3.5 md:w-4 md:h-4 text-purple-400" />
                <span className="text-xs md:text-sm font-bold text-purple-100">{todayXP} XP</span>
              </div>
            </div>

            {/* Sign Out */}
            <button
              onClick={handleSignOut}
              className="p-2 md:p-2.5 bg-purple-800/40 hover:bg-purple-700/40 rounded-xl border border-purple-500/30 transition-all shadow-lg"
            >
              <LogOut className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-6 lg:p-10 max-w-6xl mx-auto">
        
        {/* WELCOME HEADER */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-purple-100 mb-2">
            Welcome back, {user?.displayName?.split(' ')[0] || 'User'}!
          </h1>
          <p className="text-sm md:text-base text-purple-200 italic">"{dailyQuote}"</p>
        </div>

        {/* HERO - LOG ACTION - ALIGNED WITH OVERVIEW STYLE */}
        <div className="mb-6 md:mb-8">
          <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 backdrop-blur-md rounded-3xl border-2 border-purple-500/30 shadow-2xl p-5 md:p-6 lg:p-8">
            <div className="flex items-center gap-3 md:gap-4 mb-5 md:mb-6">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-xl">
                <Target className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-purple-100 mb-1">Log Your Action</h2>
                <p className="text-xs md:text-sm text-purple-300">What did you accomplish today?</p>
              </div>
            </div>

            {/* Custom Action Input */}
            <div className="space-y-3 md:space-y-4">
              <input
                type="text"
                value={customAction}
                onChange={(e) => setCustomAction(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && logCustomAction()}
                placeholder="What social action did you take?"
                className="w-full px-4 md:px-5 py-3 md:py-4 bg-purple-950/50 border-2 border-purple-500/30 rounded-2xl text-white placeholder-purple-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 text-sm md:text-base transition-all"
              />
              
              <div className="flex gap-2 md:gap-3">
                {['easy', 'medium', 'hard'].map(diff => (
                  <button
                    key={diff}
                    onClick={() => setSelectedDifficulty(diff)}
                    className={`flex-1 px-3 md:px-4 py-3 md:py-4 rounded-xl md:rounded-2xl font-semibold text-sm md:text-base transition-all shadow-lg ${
                      selectedDifficulty === diff
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white scale-105 border-2 border-purple-400/50'
                        : 'bg-purple-950/50 text-purple-300 border-2 border-purple-700/30 hover:border-purple-600/50'
                    }`}
                  >
                    <div className="text-xl md:text-2xl mb-1">{DIFFICULTY_CONFIG[diff].icon}</div>
                    <div className="text-xs md:text-sm">{DIFFICULTY_CONFIG[diff].label}</div>
                  </button>
                ))}
              </div>

              <button
                onClick={logCustomAction}
                disabled={!customAction.trim()}
                className="w-full px-4 md:px-6 py-3 md:py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl font-bold text-sm md:text-base hover:from-purple-500 hover:to-pink-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5 md:w-6 md:h-6" />
                Log Action (+{DIFFICULTY_CONFIG[selectedDifficulty].xp} XP)
              </button>

              <button
                onClick={() => setShowQuickActions(!showQuickActions)}
                className="w-full py-3 md:py-4 bg-purple-950/30 rounded-2xl border-2 border-purple-500/20 hover:border-purple-400/50 transition-all flex items-center justify-center gap-2 text-purple-300 text-sm md:text-base font-medium"
              >
                {showQuickActions ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                {showQuickActions ? 'Hide' : 'Show'} Quick Actions
              </button>

              {showQuickActions && (
                <div className="grid grid-cols-1 gap-3 pt-2">
                  {PREDEFINED_ACTIONS.map((action, idx) => (
                    <button
                      key={idx}
                      onClick={() => logPredefinedAction(action)}
                      className="p-4 md:p-5 bg-gradient-to-br from-purple-800/40 to-indigo-800/40 backdrop-blur-sm rounded-2xl border-2 border-purple-500/20 hover:border-purple-400/50 transition-all text-left shadow-lg hover:shadow-xl hover:scale-[1.02]"
                    >
                      <div className="flex items-center gap-3 md:gap-4">
                        <span className="text-3xl md:text-4xl">{DIFFICULTY_CONFIG[action.difficulty].icon}</span>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-white text-sm md:text-base mb-1">{action.label}</h4>
                          <p className="text-xs md:text-sm text-purple-400">+{DIFFICULTY_CONFIG[action.difficulty].xp} XP • {action.category}</p>
                          <p className="text-xs text-purple-500 mt-1">{action.benefit}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* TODAY'S PROGRESS - ALIGNED STYLE */}
        <div className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 backdrop-blur-md p-5 md:p-6 rounded-3xl border-2 border-purple-500/30 mb-6 md:mb-8 shadow-2xl">
          <div className="flex items-center justify-between mb-4 md:mb-5">
            <div className="flex items-center gap-2 md:gap-3">
              <Target className="w-5 h-5 md:w-6 md:h-6 text-purple-400" />
              <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-purple-100">Today's Progress</h2>
            </div>
            <div className="text-right">
              <p className="text-2xl md:text-3xl font-bold text-white">{todayActions.length}/{dailyGoal}</p>
              <p className="text-xs md:text-sm text-purple-300">actions</p>
            </div>
          </div>

          <div className="mb-4 md:mb-5">
            <div className="h-3 md:h-4 bg-purple-950/50 rounded-full overflow-hidden border border-purple-700/30">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500 shadow-lg"
                style={{ width: `${Math.min(goalProgress, 100)}%` }}
              />
            </div>
            <p className="text-xs md:text-sm text-purple-300 mt-2 text-right font-medium">{Math.round(goalProgress)}% complete</p>
          </div>

          {todayActions.length === 0 ? (
            <div className="text-center py-6 md:py-8 text-purple-400 bg-purple-950/30 rounded-2xl border border-purple-700/30">
              <p className="text-sm md:text-base font-medium">No actions logged today yet.</p>
              <p className="text-xs md:text-sm mt-2">Start with a quick action above! 🚀</p>
            </div>
          ) : (
            <div className="space-y-2 md:space-y-3">
              {todayActions.slice(0, 3).map((action) => {
                const timeAgo = Math.floor((Date.now() - action.timestamp) / 60000);
                const timeStr = timeAgo < 1 ? 'Just now' : timeAgo < 60 ? `${timeAgo}m ago` : `${Math.floor(timeAgo / 60)}h ago`;
                
                return (
                  <div key={action.id} className="flex items-center gap-3 p-3 md:p-4 bg-purple-950/30 rounded-xl md:rounded-2xl border border-purple-700/30 hover:border-purple-600/50 transition-all">
                    <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-green-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm md:text-base font-bold text-white truncate">{action.label}</p>
                      <p className="text-xs md:text-sm text-purple-400">+{DIFFICULTY_CONFIG[action.difficulty].xp} XP • {timeStr}</p>
                    </div>
                    <span className="text-xl md:text-2xl">{DIFFICULTY_CONFIG[action.difficulty].icon}</span>
                  </div>
                );
              })}
              {todayActions.length > 3 && (
                <p className="text-xs md:text-sm text-purple-400 text-center pt-2">+{todayActions.length - 3} more actions today</p>
              )}
            </div>
          )}
        </div>

        {/* STATS GRID - ALIGNED STYLE */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6 mb-6 md:mb-8">
          <div className="bg-gradient-to-br from-purple-800/60 to-purple-900/60 backdrop-blur-sm p-4 md:p-5 rounded-2xl md:rounded-3xl border-2 border-purple-500/30 shadow-xl">
            <div className="flex items-center gap-2 md:gap-3 mb-2">
              <Trophy className="w-5 h-5 md:w-6 md:h-6 text-yellow-400" />
              <span className="text-purple-300 text-xs md:text-sm font-medium">Total XP</span>
            </div>
            <p className="text-3xl md:text-4xl font-bold text-white mb-1">{stats.totalXP}</p>
            <p className="text-purple-400 text-xs md:text-sm">Level {Math.floor(stats.totalXP / 100) + 1}</p>
          </div>

          <div className="bg-gradient-to-br from-pink-800/60 to-purple-900/60 backdrop-blur-sm p-4 md:p-5 rounded-2xl md:rounded-3xl border-2 border-pink-500/30 shadow-xl">
            <div className="flex items-center gap-2 md:gap-3 mb-2">
              <Flame className="w-5 h-5 md:w-6 md:h-6 text-orange-400" />
              <span className="text-purple-300 text-xs md:text-sm font-medium">Streak</span>
            </div>
            <p className="text-3xl md:text-4xl font-bold text-white mb-1">{stats.currentStreak}</p>
            <p className="text-purple-400 text-xs md:text-sm">Best: {stats.longestStreak} days</p>
          </div>

          <div className="bg-gradient-to-br from-indigo-800/60 to-purple-900/60 backdrop-blur-sm p-4 md:p-5 rounded-2xl md:rounded-3xl border-2 border-indigo-500/30 shadow-xl">
            <div className="flex items-center gap-2 md:gap-3 mb-2">
              <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-green-400" />
              <span className="text-purple-300 text-xs md:text-sm font-medium">Actions</span>
            </div>
            <p className="text-3xl md:text-4xl font-bold text-white mb-1">{stats.totalActions}</p>
            <p className="text-purple-400 text-xs md:text-sm">Total completed</p>
          </div>

          <div className="bg-gradient-to-br from-purple-800/60 to-indigo-900/60 backdrop-blur-sm p-4 md:p-5 rounded-2xl md:rounded-3xl border-2 border-purple-500/30 shadow-xl">
            <div className="flex items-center gap-2 md:gap-3 mb-2">
              <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-emerald-400" />
              <span className="text-purple-300 text-xs md:text-sm font-medium">Average</span>
            </div>
            <p className="text-3xl md:text-4xl font-bold text-white mb-1">{stats.weeklyAverage}</p>
            <p className="text-purple-400 text-xs md:text-sm">Per day</p>
          </div>
        </div>

        {/* WEEKLY CHART - ALIGNED STYLE */}
        <div className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 backdrop-blur-md p-5 md:p-6 rounded-3xl border-2 border-purple-500/30 mb-6 md:mb-8 shadow-2xl">
          <div className="flex items-center gap-2 md:gap-3 mb-5 md:mb-6">
            <BarChart3 className="w-5 h-5 md:w-6 md:h-6 text-purple-400" />
            <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-purple-100">Weekly Activity</h2>
          </div>
          
          <div className="flex items-end justify-between gap-2 md:gap-3 h-32 md:h-40">
            {weeklyChartData.map((day, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-purple-950/50 rounded-t-xl relative overflow-hidden border border-purple-700/30" style={{ height: '100%' }}>
                  <div 
                    className="absolute bottom-0 w-full bg-gradient-to-t from-purple-500 to-pink-500 rounded-t-xl transition-all duration-500 shadow-lg"
                    style={{ height: `${(day.actions / maxWeeklyActions) * 100}%` }}
                  />
                  {day.actions > 0 && (
                    <span className="absolute top-1 left-1/2 -translate-x-1/2 text-xs md:text-sm font-bold text-white drop-shadow">
                      {day.actions}
                    </span>
                  )}
                </div>
                <p className="text-xs md:text-sm font-bold text-purple-200">{day.day}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ACHIEVEMENTS - ALIGNED STYLE */}
        <div className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 backdrop-blur-md p-5 md:p-6 rounded-3xl border-2 border-purple-500/30 mb-6 md:mb-8 shadow-2xl">
          <div className="flex items-center justify-between mb-5 md:mb-6">
            <div className="flex items-center gap-2 md:gap-3">
              <Award className="w-5 h-5 md:w-6 md:h-6 text-yellow-400" />
              <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-purple-100">Achievements</h2>
            </div>
            <button
              onClick={() => setShowAllAchievements(!showAllAchievements)}
              className="text-xs md:text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1 font-medium"
            >
              {showAllAchievements ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {showAllAchievements ? 'Show Less' : 'View All'}
            </button>
          </div>
          
          <div className="grid grid-cols-3 lg:grid-cols-3 gap-3 md:gap-4">
            {(showAllAchievements ? achievements : nextAchievements).map(achievement => (
              <div 
                key={achievement.id}
                className={`p-4 md:p-5 rounded-2xl border-2 text-center transition-all ${
                  achievement.unlocked 
                    ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/50 shadow-xl scale-105' 
                    : 'bg-purple-950/40 border-purple-700/30 opacity-80 hover:opacity-100'
                }`}
              >
                <div className="text-3xl md:text-4xl mb-2">{achievement.icon}</div>
                <p className="text-xs md:text-sm font-bold text-purple-100 mb-1 leading-tight">{achievement.title}</p>
                <p className="text-xs md:text-sm text-purple-300 mb-2">{achievement.progress}/{achievement.threshold}</p>
                {!achievement.unlocked && (
                  <div className="mt-2 md:mt-3 h-2 bg-purple-900/50 rounded-full overflow-hidden border border-purple-700/30">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                      style={{ width: `${(achievement.progress / achievement.threshold) * 100}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ACTION HISTORY - ALIGNED STYLE */}
        <div className="mb-6 md:mb-8">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="w-full flex items-center justify-between p-4 md:p-5 bg-gradient-to-br from-purple-900/50 to-indigo-900/50 backdrop-blur-md rounded-3xl border-2 border-purple-500/30 hover:border-purple-400/50 transition-all shadow-2xl"
          >
            <div className="flex items-center gap-2 md:gap-3">
              <Calendar className="w-5 h-5 md:w-6 md:h-6 text-purple-400" />
              <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-purple-100">Action History</h2>
              <span className="text-xs md:text-sm text-purple-400 font-medium">({filteredActions.length})</span>
            </div>
            {showHistory ? <ChevronUp className="w-5 h-5 md:w-6 md:h-6 text-purple-400" /> : <ChevronDown className="w-5 h-5 md:w-6 md:h-6 text-purple-400" />}
          </button>

          {showHistory && (
            <div className="mt-4 md:mt-6 space-y-4 md:space-y-6">
              <select
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
                className="w-full px-4 md:px-5 py-3 md:py-4 bg-purple-900/60 border-2 border-purple-500/30 rounded-2xl text-white text-sm md:text-base focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20"
              >
                <option value="all">All Difficulties</option>
                <option value="easy">🌱 Easy Actions</option>
                <option value="medium">🔥 Medium Actions</option>
                <option value="hard">💎 Hard Actions</option>
              </select>

              {filteredActions.length === 0 ? (
                <div className="text-center py-12 md:py-16 bg-purple-900/20 rounded-3xl border-2 border-purple-500/20">
                  <Target className="w-16 h-16 md:w-20 md:h-20 text-purple-500/50 mx-auto mb-4" />
                  <p className="text-purple-300 text-base md:text-lg mb-2 font-medium">No actions yet</p>
                  <p className="text-purple-400 text-sm md:text-base">Log your first action above to get started!</p>
                </div>
              ) : (
                <div className="space-y-3 md:space-y-4">
                  {filteredActions.map((action) => (
                    <div
                      key={action.id}
                      className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 backdrop-blur-md p-4 md:p-6 rounded-3xl border-2 border-purple-500/30 shadow-xl hover:shadow-2xl transition-all"
                    >
                      <div className="flex items-start justify-between mb-3 md:mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 md:gap-3 mb-2">
                            <span className="text-2xl md:text-3xl">{DIFFICULTY_CONFIG[action.difficulty].icon}</span>
                            <div>
                              <h3 className="font-bold text-white text-base md:text-lg">
                                {action.label}
                                {action.count > 1 && (
                                  <span className="ml-2 text-xs md:text-sm px-2 py-1 bg-purple-700/50 rounded-full border border-purple-500/30">
                                    ×{action.count}
                                  </span>
                                )}
                              </h3>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 md:gap-3 text-xs md:text-sm text-purple-400 mb-3 flex-wrap">
                            <span className="px-2 md:px-3 py-1 bg-purple-800/50 rounded-full border border-purple-700/30">{action.category}</span>
                            <span className="font-bold">+{DIFFICULTY_CONFIG[action.difficulty].xp * action.count} XP</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 md:w-4 md:h-4" />
                              {new Date(action.timestamp).toLocaleDateString()}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 mb-3 md:mb-4">
                            {[1, 2, 3, 4, 5].map(star => (
                              <button
                                key={star}
                                onClick={() => updateRating(action.id, star)}
                                className="transition-transform active:scale-90"
                              >
                                <Star
                                  className={`w-4 h-4 md:w-5 md:h-5 ${
                                    star <= action.stars
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-purple-700'
                                  }`}
                                />
                              </button>
                            ))}
                          </div>

                          {editingAction === action.id ? (
                            <div className="mt-3">
                              <textarea
                                value={action.reflection}
                                onChange={(e) => updateReflection(action.id, e.target.value)}
                                placeholder="How did it go? What did you learn?"
                                className="w-full px-4 md:px-5 py-3 md:py-4 bg-purple-950/50 border-2 border-purple-500/30 rounded-2xl text-white text-sm md:text-base placeholder-purple-400 focus:outline-none focus:border-purple-400 resize-none"
                                rows={3}
                              />
                              <button
                                onClick={() => setEditingAction(null)}
                                className="mt-3 px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl text-sm md:text-base font-bold transition-all shadow-lg"
                              >
                                Save Reflection
                              </button>
                            </div>
                          ) : (
                            <div className="mt-3">
                              {action.reflection ? (
                                <div 
                                  onClick={() => setEditingAction(action.id)}
                                  className="p-3 md:p-4 bg-purple-950/30 rounded-xl md:rounded-2xl border-2 border-purple-700/30 cursor-pointer hover:border-purple-600/50 transition-all"
                                >
                                  <p className="text-xs md:text-sm text-purple-200">{action.reflection}</p>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setEditingAction(action.id)}
                                  className="text-xs md:text-sm text-purple-400 hover:text-purple-300 flex items-center gap-2 font-medium"
                                >
                                  <MessageCircle className="w-4 h-4 md:w-5 md:h-5" />
                                  Add reflection...
                                </button>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2 ml-3">
                          <button
                            onClick={() => setEditingAction(editingAction === action.id ? null : action.id)}
                            className="p-2 md:p-2.5 hover:bg-purple-800/50 rounded-xl transition-colors"
                          >
                            <Edit3 className="w-4 h-4 md:w-5 md:h-5 text-purple-400" />
                          </button>
                          <button
                            onClick={() => deleteAction(action.id)}
                            className="p-2 md:p-2.5 hover:bg-red-900/50 rounded-xl transition-colors"
                          >
                            <Trash2 className="w-4 h-4 md:w-5 md:h-5 text-red-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* INSIGHTS - ALIGNED STYLE */}
        <div className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 backdrop-blur-md p-5 md:p-6 rounded-3xl border-2 border-purple-500/30 mb-6 md:mb-8 shadow-2xl">
          <div className="flex items-center gap-2 md:gap-3 mb-5 md:mb-6">
            <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-purple-400" />
            <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-purple-100">Insights</h2>
          </div>

          <div className="space-y-4 md:space-y-6">
            <div className="p-4 md:p-5 bg-purple-950/30 rounded-2xl border border-purple-700/30">
              <div className="flex items-center gap-2 md:gap-3 mb-3">
                <Heart className="w-5 h-5 md:w-6 md:h-6 text-pink-400" />
                <h3 className="font-bold text-purple-100 text-sm md:text-base">Reflection Rate</h3>
              </div>
              <div className="flex items-end gap-3 mb-3">
                <p className="text-3xl md:text-4xl font-bold text-white">{stats.completionRate}%</p>
                <p className="text-xs md:text-sm text-purple-300 mb-1">with reflections</p>
              </div>
              <div className="h-3 md:h-4 bg-purple-900/50 rounded-full overflow-hidden border border-purple-700/30">
                <div 
                  className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-500 shadow-lg"
                  style={{ width: `${stats.completionRate}%` }}
                />
              </div>
            </div>

            <div className="p-4 md:p-5 bg-purple-950/30 rounded-2xl border border-purple-700/30">
              <div className="flex items-center gap-2 md:gap-3 mb-3">
                <Users className="w-5 h-5 md:w-6 md:h-6 text-blue-400" />
                <h3 className="font-bold text-purple-100 text-sm md:text-base">Top Category</h3>
              </div>
              <p className="text-3xl md:text-4xl font-bold text-white mb-2">
                {(() => {
                  if (actions.length === 0) return 'None yet';
                  const categoryCount = actions.reduce((acc, action) => {
                    acc[action.category] = (acc[action.category] || 0) + 1;
                    return acc;
                  }, {});
                  const entries = Object.entries(categoryCount);
                  const sorted = entries.sort((a, b) => b[1] - a[1]);
                  return sorted[0]?.[0] || 'None';
                })()}
              </p>
              <p className="text-xs md:text-sm text-purple-300 mt-1">Your focus area</p>
            </div>
          </div>
        </div>

        {/* FOOTER - ALIGNED STYLE */}
        <div className="text-center py-6 md:py-8 border-t-2 border-purple-500/20">
          <div className="flex items-center justify-center gap-4 md:gap-6 text-purple-300 text-xs md:text-sm flex-wrap">
            <div className="flex items-center gap-2">
              <Gift className="w-4 h-4 md:w-5 md:h-5" />
              <span className="font-medium">{achievements.filter(a => a.unlocked).length}/{achievements.length} achievements</span>
            </div>
            <span className="text-purple-500">•</span>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 md:w-5 md:h-5" />
              <span className="font-medium">Level {Math.floor(stats.totalXP / 100) + 1}</span>
            </div>
            <span className="text-purple-500">•</span>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 md:w-5 md:h-5" />
              <span className="font-medium">{stats.totalXP} Total XP</span>
            </div>
          </div>
        </div>

        {/* CONFETTI ANIMATION */}
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
            <div className="text-8xl md:text-9xl animate-bounce">🎉</div>
          </div>
        )}

        {/* NOTIFICATION - ALIGNED STYLE */}
        {notification && (
          <div className="fixed bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-md bg-gradient-to-r from-purple-600 to-pink-600 text-white px-5 md:px-6 py-4 rounded-2xl shadow-2xl animate-slide-up border-2 border-purple-400/50 backdrop-blur-sm z-50 text-sm md:text-base">
            <p className="font-bold text-center">{notification}</p>
          </div>
        )}
      </div>

      {/* ONBOARDING OVERLAY */}
{showOnboardingOverlay && (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
    <div className="bg-gradient-to-br from-purple-900/95 to-indigo-900/95 backdrop-blur-xl p-6 md:p-8 rounded-3xl border-2 border-purple-500/50 shadow-2xl max-w-md w-full animate-scale-in">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Welcome to Action Tracker! 🎉</h2>
        <p className="text-purple-200 text-sm md:text-base">Track your social skills journey and watch yourself grow</p>
      </div>

      <div className="space-y-4 mb-6">
        <div className="flex items-start gap-3 p-4 bg-purple-950/50 rounded-xl border border-purple-500/30">
          <Target className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-white text-sm mb-1">Log Your Actions</h3>
            <p className="text-purple-300 text-xs">Track every social interaction and earn XP</p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 bg-purple-950/50 rounded-xl border border-purple-500/30">
          <Flame className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-white text-sm mb-1">Build Streaks</h3>
            <p className="text-purple-300 text-xs">Stay consistent and watch your streak grow</p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 bg-purple-950/50 rounded-xl border border-purple-500/30">
          <Trophy className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-white text-sm mb-1">Unlock Achievements</h3>
            <p className="text-purple-300 text-xs">Complete challenges and earn badges</p>
          </div>
        </div>
      </div>

      <button
        onClick={() => setShowOnboardingOverlay(false)}
        className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl font-bold text-white transition-all shadow-xl"
      >
        Get Started! 🚀
      </button>
    </div>
  </div>
)}



      <style>{`
        @keyframes slide-up {
          from {
            transform: translateY(100px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }

        html {
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch;
        }

        button, a, input, select, textarea {
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
        }

        button {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }

        button:focus-visible,
        input:focus-visible,
        select:focus-visible,
        textarea:focus-visible {
          outline: 2px solid #a78bfa;
          outline-offset: 2px;
        }

        * {
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </div>
  );
}
