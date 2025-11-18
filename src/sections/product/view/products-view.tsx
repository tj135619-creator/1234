import React, { useState, useEffect , Fragment } from 'react';
import GroupGrid from './GroupGrid';
import { Users, Trophy, Target, MessageCircle, Bell, Search, Filter, TrendingUp, Award, Flame, Crown, Star, Zap, Calendar, Clock, Share2, BarChart3, Gift, Heart, ThumbsUp, Send, X, Plus, ChevronRight, Sparkles, CheckCircle, Edit3, Trash2, LogOut, Settings, UserPlus, UserMinus, Loader, AlertCircle } from 'lucide-react';
import SocialCityMap from 'src/components/actionmap'
import IRLConnectionsHub from './irlconnections'
import IRLConnectionsValueHero from './HerosectionIRL'

import { useNavigate } from 'react-router-dom';
import CommunityStories from './Communitystories';
// ADD THIS:
import { ActionGroupFeed } from './ActionGroupFeed';

import { OnboardingExplanation } from 'src/onboarding/reusableonboarding';


// ============================================
// FIREBASE IMPORTS (Replace with actual Firebase SDK in production)
// ============================================





// ============================================
// FIREBASE IMPORTS
// ============================================
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from './firebaseConfig';
import { initializeNewUser } from './initializeUser';
import { 
  authService,
  userService,
  friendshipService,
  groupService,
  challengeService,
  notificationService,
  activityService,
  leaderboardService,
  leagueService,
  achievementService
} from './friendsService';
import AuthModal from './AuthModal';

// ============================================
// FIREBASE SIMULATION FOR DEMO
// ============================================

// Authentication helpers
const signUpUser = async (email, password, name, username) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Initialize user in Firestore
    await initializeNewUser(user.uid, {
      email,
      name,
      username,
    });
    
    return user;
  } catch (error) {
    console.error('Error signing up:', error);
    throw error;
  }
};

const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error logging out:', error);
    throw error;
  }
};


// Create FirebaseService object for compatibility
const FirebaseService = {
  auth: authService,
  user: userService,
  friendship: friendshipService,
  group: groupService,
  challenge: challengeService,
  notification: notificationService,
  activity: activityService,
  leaderboard: leaderboardService,
  league: leagueService,
  achievement: achievementService
};

// ============================================
// CONSTANTS
// ============================================

const LEAGUES = {
  BRONZE: { name: 'Bronze', color: '#cd7f32', gradient: 'linear-gradient(135deg, #cd7f32 0%, #d4a574 100%)', min: 0 },
  SILVER: { name: 'Silver', color: '#c0c0c0', gradient: 'linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 100%)', min: 500 },
  GOLD: { name: 'Gold', color: '#ffd700', gradient: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)', min: 1000 },
  PLATINUM: { name: 'Platinum', color: '#e5e4e2', gradient: 'linear-gradient(135deg, #e5e4e2 0%, #f5f5f5 100%)', min: 2000 },
  DIAMOND: { name: 'Diamond', color: '#b9f2ff', gradient: 'linear-gradient(135deg, #b9f2ff 0%, #d4f1ff 100%)', min: 5000 },
};




const MOOD_OPTIONS = [
  { emoji: '🚀', label: 'Motivated', color: '#9333ea' },
  { emoji: '🎯', label: 'Focused', color: '#7c3aed' },
  { emoji: '💪', label: 'Strong', color: '#8b5cf6' },
  { emoji: '🧠', label: 'Learning', color: '#a78bfa' },
  { emoji: '😊', label: 'Happy', color: '#c084fc' },
  { emoji: '🔥', label: 'On Fire', color: '#d946ef' },
];

const MOTIVATIONAL_QUOTES = [
  "Every conversation is a chance to grow.",
  "Small actions create powerful momentum.",
  "You're building skills that last a lifetime.",
  "Consistency beats perfection every time.",
  "Today's efforts are tomorrow's achievements.",
  "Learning never stops, neither should you.",
];


const POST_TEMPLATES = [
  {
    type: 'PRACTICE_REPORT',
    icon: '🎯',
    title: 'Practice Report',
    color: 'from-purple-600 to-indigo-600',
    fields: [
      { name: 'skill', label: 'Skill Practiced', placeholder: 'e.g., Active Listening', type: 'text' },
      { name: 'situation', label: 'Situation/Context', placeholder: 'Describe where and when', type: 'textarea' },
      { name: 'wentWell', label: 'What Went Well', placeholder: 'Your wins and breakthroughs', type: 'textarea' },
      { name: 'challenging', label: 'What Was Challenging', placeholder: 'Areas for improvement', type: 'textarea' },
      { name: 'feedback', label: 'Feedback Needed', placeholder: 'What specific help do you need?', type: 'textarea' },
    ]
  },
  {
    type: 'SUCCESS_STORY',
    icon: '🏆',
    title: 'Success Story',
    color: 'from-yellow-600 to-orange-600',
    fields: [
      { name: 'breakthrough', label: 'The Breakthrough', placeholder: 'What happened?', type: 'textarea' },
      { name: 'journey', label: 'How You Got There', placeholder: 'Your learning journey', type: 'textarea' },
      { name: 'advice', label: 'Advice for Others', placeholder: 'What would you tell someone starting out?', type: 'textarea' },
    ]
  },
  {
    type: 'QUESTION',
    icon: '❓',
    title: 'Question',
    color: 'from-blue-600 to-cyan-600',
    fields: [
      { name: 'situation', label: 'The Situation', placeholder: 'What happened?', type: 'textarea' },
      { name: 'tried', label: 'What You Tried', placeholder: 'What have you already attempted?', type: 'textarea' },
      { name: 'help', label: 'What You Need Help With', placeholder: 'Be specific about what you need', type: 'textarea' },
    ]
  },
  {
    type: 'RESOURCE_SHARE',
    icon: '📚',
    title: 'Resource Share',
    color: 'from-green-600 to-emerald-600',
    fields: [
      { name: 'resourceType', label: 'Resource Type', placeholder: 'Article, Video, Book, etc.', type: 'text' },
      { name: 'link', label: 'Link (optional)', placeholder: 'https://...', type: 'text' },
      { name: 'why', label: 'Why It\'s Helpful', placeholder: 'What makes this valuable?', type: 'textarea' },
      { name: 'takeaway', label: 'Key Takeaway', placeholder: 'Main lesson or insight', type: 'textarea' },
    ]
  },
];

// ============================================
// UTILITY FUNCTIONS
// ============================================

const getWeeklyData = () => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days.map((day) => ({
    day,
    actions: 0 // Will be populated from Firebase
  }));
};

// ============================================
// PARTICLE BACKGROUND
// ============================================

const ParticleBackground = () => {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    size: Math.random() * 6 + 2,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 25 + 15,
    delay: Math.random() * 8,
    opacity: Math.random() * 0.5 + 0.2,
    color: i % 3 === 0 ? 'rgba(168, 85, 247, 0.5)' : i % 3 === 1 ? 'rgba(192, 132, 252, 0.4)' : 'rgba(147, 51, 234, 0.45)',
  }));

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
      {particles.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            borderRadius: '50%',
            background: p.color,
            animation: `float ${p.duration}s infinite ease-in-out ${p.delay}s`,
            boxShadow: `0 0 ${p.size * 4}px ${p.color}`,
            opacity: p.opacity,
          }}
        />
      ))}
    </div>
  );
};

// ============================================
// LOADING SPINNER
// ============================================

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <Loader className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
      <p className="text-purple-200 text-lg">Loading Purple Hub...</p>
    </div>
  </div>
);

// ============================================
// ERROR STATE
// ============================================

const ErrorState = ({ message, onRetry }) => (
  <div className="flex items-center justify-center min-h-screen px-4">
    <div className="bg-red-900/20 border-2 border-red-500/50 rounded-2xl p-8 max-w-md text-center">
      <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-red-200 mb-2">Oops! Something went wrong</h2>
      <p className="text-red-300 mb-6">{message}</p>
      <button
        onClick={onRetry}
        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-bold hover:scale-105 transition-transform"
      >
        Try Again
      </button>
    </div>
  </div>
);

// ============================================
// EMPTY STATE
// ============================================

const EmptyState = ({ icon: Icon, title, description, actionLabel, onAction }) => (
  <div className="text-center py-12">
    <div className="w-20 h-20 bg-purple-800/30 rounded-full flex items-center justify-center mx-auto mb-4">
      <Icon className="w-10 h-10 text-purple-400" />
    </div>
    <h3 className="text-xl font-bold text-purple-100 mb-2">{title}</h3>
    <p className="text-purple-300 mb-6 max-w-md mx-auto">{description}</p>
    {onAction && (
      <button
        onClick={onAction}
        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-bold hover:scale-105 transition-transform"
      >
        {actionLabel}
      </button>
    )}
  </div>
);

// ============================================
// FLOATING ACTION BUTTON
// ============================================

const MobileFloatingButton = ({ onClick }) => (
  <button
    onClick={onClick}
    className="md:hidden fixed bottom-24 right-6 w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-2xl z-50 active:scale-95 transition-transform"
    style={{ touchAction: 'manipulation' }}
  >
    <Plus size={28} className="text-white" />
  </button>
);

// ============================================
// MAIN COMPONENT
// ============================================

export default  function ProductsView() {
  // ============================================
  // STATE MANAGEMENT
  // ============================================

 
const [mapExpanded, setMapExpanded] = useState(true);
const [showChallengeModal, setShowChallengeModal] = useState(false);
const [selectedChallengeUser, setSelectedChallengeUser] = useState(null);
const [selectedChallengeTemplate, setSelectedChallengeTemplate] = useState(null);
const [showActionGroupsModal, setShowActionGroupsModal] = useState(false);
const [challengeTemplates, setChallengeTemplates] = useState([]);
const [userChallenges, setUserChallenges] = useState([]);
const [loadingChallengeTemplates, setLoadingChallengeTemplates] = useState(false);
const [isHubOpen, setIsHubOpen] = useState(false);
const [showDiscoverModal, setShowDiscoverModal] = useState(false);
const [allUsers, setAllUsers] = useState([]);
const [loadingAllUsers, setLoadingAllUsers] = useState(false);
const [discoverFilters, setDiscoverFilters] = useState({ league: 'ALL', sortBy: 'xp' });
const [sentRequestIds, setSentRequestIds] = useState([]);

const [discoverPage, setDiscoverPage] = useState(0);

const [hasMoreUsers, setHasMoreUsers] = useState(true);
const [lastUserDoc, setLastUserDoc] = useState(null);
const USERS_PER_PAGE = 20;
  
  // Auth & User State
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();


 //FRIENDS
 const [showAuthModal, setShowAuthModal] = useState(false);
const [isAuthChecking, setIsAuthChecking] = useState(true);
  
  // UI State
  const [selectedTab, setSelectedTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [selectedMood, setSelectedMood] = useState(null);
  const [showMoodSelector, setShowMoodSelector] = useState(false);
  const [sortOption, setSortOption] = useState('rank');
  const [showPostModal, setShowPostModal] = useState(false);
  const [newPost, setNewPost] = useState('');
  const [dailyQuote, setDailyQuote] = useState('');
  const [isMobile, setIsMobile] = useState(false);

    const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [newGroupData, setNewGroupData] = useState({
    name: '',
    description: '',
    category: 'Learning',
    icon: '📚'
  });
  const [creatingGroup, setCreatingGroup] = useState(false);
  
  // Group Invite Modal State
  const [showGroupInviteModal, setShowGroupInviteModal] = useState(false);
  const [selectedFriendForInvite, setSelectedFriendForInvite] = useState(null);
  
  // Data State
  const [friends, setFriends] = useState([]);
  const [groups, setGroups] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activities, setActivities] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [weeklyData, setWeeklyData] = useState(getWeeklyData());
  const [achievements, setAchievements] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  
  // Loading States
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [loadingChallenges, setLoadingChallenges] = useState(false);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
// Friend Search State
  const [showFriendSearchModal, setShowFriendSearchModal] = useState(false);
  const [friendSearchQuery, setFriendSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchingUsers, setSearchingUsers] = useState(false);

  // Group Detail State
const [selectedGroup, setSelectedGroup] = useState(null);
const [groupPosts, setGroupPosts] = useState([]);
const [loadingGroupPosts, setLoadingGroupPosts] = useState(false);
const [showPostTemplateSelector, setShowPostTemplateSelector] = useState(false);
const [selectedPostTemplate, setSelectedPostTemplate] = useState(null);
const [newPostData, setNewPostData] = useState({
  type: 'PRACTICE_REPORT',
  content: {},
});
const [showCommentInput, setShowCommentInput] = useState(null); // postId or null
const [newComment, setNewComment] = useState('');

// ONBOARDING FLOATING BOX
const [showOnboardingOverlay, setShowOnboardingOverlay] = useState(true);
  
  // ============================================
  // FIREBASE INITIALIZATION
  // ============================================
  
// ============================================
  // FIREBASE INITIALIZATION
  // ============================================
  
// ============================================
  // FIREBASE INITIALIZATION
  // ============================================
// ============================================
  // FIREBASE INITIALIZATION
  // ============================================
  
// ============================================
  // FIREBASE INITIALIZATION
  // ============================================
  
useEffect(() => {
  let isMounted = true;
  let unsubscribe = null;
  let hasLoadedData = false; // Prevent multiple data loads
  
  console.log('🚀 Initializing auth listener...');
  
  const initializeApp = async () => {
    try {
      if (!isMounted) return;
      
      setLoading(true);
      setIsAuthChecking(true);
      
      // Listen to auth state changes
      unsubscribe = onAuthStateChanged(auth, async (user) => {
        console.log('🔐 Auth state changed:', user ? `User: ${user.uid}` : 'No user');
        
        if (!isMounted) {
          console.log('⚠️ Component unmounted, skipping auth update');
          return;
        }
        
        if (user) {
          console.log('✅ User authenticated:', user.uid);
          setCurrentUser(user);
          
          // Only load data once per auth session
          if (!hasLoadedData) {
            hasLoadedData = true;
            console.log('📊 Loading user data for first time...');
            
            try {
              // Load user profile
              const profile = await FirebaseService.user.getUserComplete(user.uid);
              
              if (!isMounted) {
                console.log('⚠️ Component unmounted during profile load');
                return;
              }
              
              // Ensure stats object exists with defaults
              if (!profile.stats) {
                profile.stats = {
                  totalXP: 0,
                  weeklyXP: 0,
                  monthlyXP: 0,
                  streak: 0,
                  tasksCompleted: 0,
                  friendsCount: 0,
                  level: 1
                };
              }
              
              console.log('👤 Profile loaded:', profile.name);
              setUserProfile(profile);
              
              // Load initial data
              console.log('📥 Loading all app data...');
              await loadAllData(user.uid);
              console.log('✅ All data loaded successfully');
            } catch (err) {
              console.error('❌ Error loading user data:', err);
              if (isMounted) {
                setError('Failed to load user data. Please try refreshing.');
              }
            }
          } else {
            console.log('ℹ️ Data already loaded, skipping reload');
          }
        } else {
          console.log('❌ No user authenticated');
          hasLoadedData = false; // Reset for next login
          if (isMounted) {
            setCurrentUser(null);
            setUserProfile(null);
            setShowAuthModal(true);
          }
        }
        
        if (isMounted) {
          setLoading(false);
          setIsAuthChecking(false);
          console.log('🏁 Auth initialization complete');
        }
      });
      
    } catch (err) {
      console.error('💥 Initialization error:', err);
      if (isMounted) {
        setError('Failed to initialize app. Please refresh the page.');
        setLoading(false);
        setIsAuthChecking(false);
      }
    }
  };
  
  initializeApp();
  
  // Cleanup function
  return () => {
    console.log('🧹 Cleaning up auth listener');
    isMounted = false;
    if (unsubscribe) {
      unsubscribe();
    }
  };
}, []);
  
  
  // ============================================
  // DATA LOADING FUNCTIONS
  // ============================================
  
  const loadAllData = async (userId) => {
  try {
    // ⚡ PHASE 1: Load ONLY critical data
    await Promise.all([
      loadFriends(userId),
      loadNotifications(userId),
      loadGroups()
    ]);
    
    // ⚡ PHASE 2: Load secondary data after 500ms
    setTimeout(() => {
      Promise.all([
        loadChallenges(userId),
        loadActivities(userId),
      ]);
    }, 500);
    
    // Groups, Leaderboard, Achievements load when tabs are clicked!
    
  } catch (err) {
    console.error('Error loading data:', err);
    setError('Failed to load some data. Please try refreshing.');
  }
};

  
  const loadFriends = async (userId) => {
    try {
      setLoadingFriends(true);
      const friendsList = await FirebaseService.user.getFriends(userId);
      setFriends(friendsList);
      
      // Load pending friend requests
      const requests = await FirebaseService.friendship.getPendingRequests(userId);
      setPendingRequests(requests);
    } catch (err) {
      console.error('Error loading friends:', err);
    } finally {
      setLoadingFriends(false);
    }
  };
  
  const loadGroups = async () => {
    try {
      setLoadingGroups(true);
      const groupsList = await FirebaseService.group.getAllGroups();
      setGroups(groupsList);
    } catch (err) {
      console.error('Error loading groups:', err);
    } finally {
      setLoadingGroups(false);
    }
  };
  
const loadChallenges = async (userId) => {
  try {
    setLoadingChallenges(true);

    
    // Load both community challenges and friend challenges
    const [communityChallenges, friendChallenges] = await Promise.all([
      FirebaseService.challenge.getUserChallenges(userId),
      FirebaseService.challenge.getUserFriendChallenges(userId)
    ]);
    
    // Combine and sort by date
    const allChallenges = [
      ...communityChallenges.map(c => ({ ...c, challengeType: 'community' })),
      ...friendChallenges.map(c => ({ ...c, challengeType: 'friend' }))
    ];
    
    setChallenges(allChallenges);
    setUserChallenges(friendChallenges);
  } catch (err) {
    console.error('Error loading challenges:', err);
  } finally {
    setLoadingChallenges(false);
  }
};
  
  const loadNotifications = async (userId) => {
    try {
      const notifsList = await FirebaseService.notification.getUserNotifications(userId);
      setNotifications(notifsList);
      
      // Set up real-time listener
      const unsubscribe = FirebaseService.notification.listenToNotifications(userId, (newNotifs) => {
        setNotifications(newNotifs);
      });
      
      return unsubscribe;
    } catch (err) {
      console.error('Error loading notifications:', err);
    }
  };
  
  const loadActivities = async (userId) => {
    try {
      const activitiesList = await FirebaseService.activity.getFriendsActivities(userId, 50);
      setActivities(activitiesList);
    } catch (err) {
      console.error('Error loading activities:', err);
    }
  };
  
  const loadLeaderboard = async () => {
    try {
      setLoadingLeaderboard(true);
      const leaderboardData = await FirebaseService.leaderboard.getWeeklyLeaderboard(100);
      setLeaderboard(leaderboardData);
    } catch (err) {
      console.error('Error loading leaderboard:', err);
    } finally {
      setLoadingLeaderboard(false);
    }
  };
  
  const loadAchievements = async (userId) => {
    try {
      const achievementsList = await FirebaseService.achievement.getUserAchievements(userId);
      setAchievements(achievementsList);
    } catch (err) {
      console.error('Error loading achievements:', err);
    }
  };

  // Add this new function:
const loadTabData = async (tabIndex) => {
  const userId = currentUser?.uid;
  if (!userId) return;

  switch (tabIndex) {
    case 1: // Leaderboard tab
      if (leaderboard.length === 0) {
        console.log('🏆 Loading leaderboard...');
        await loadLeaderboard();
      }
      break;

    case 2: // Groups tab
      if (groups.length === 0) {
        console.log('👥 Loading groups...');
        await loadGroups();
      }
      break;
  }
};


// Update your tab click handler:
const handleTabClick = async (idx) => {
  setSelectedTab(idx);
  await loadTabData(idx);  // ⚡ Load data when tab is clicked
};
  
  // ============================================
  // ACTION HANDLERS
  // ============================================

const handleLogin = async (email, password) => {
  await loginUser(email, password);
  setShowAuthModal(false);
};

const handleSignup = async (email, password, name, username) => {
  await signUpUser(email, password, name, username);
  setShowAuthModal(false);
};

const handleLogout = async () => {
  if (!confirm('Are you sure you want to log out?')) return;
  
  await logoutUser();
  setShowAuthModal(true);
};
  
  const handleSendFriendRequest = async (toUserId) => {
    if (!currentUser) return;
    
    try {
      await FirebaseService.friendship.sendRequest(currentUser.uid, toUserId);
      alert('Friend request sent!');
    } catch (err) {
      console.error('Error sending friend request:', err);
      alert('Failed to send friend request. Please try again.');
    }
  };
  
  const handleAcceptFriendRequest = async (requestId) => {
    if (!currentUser) return;
    
    try {
      await FirebaseService.friendship.acceptRequest(requestId);
      await loadFriends(currentUser.uid);
      alert('Friend request accepted!');
    } catch (err) {
      console.error('Error accepting friend request:', err);
      alert('Failed to accept friend request. Please try again.');
    }
  };
  
  const handleRemoveFriend = async (friendId) => {
    if (!currentUser) return;
    
    if (!confirm('Are you sure you want to remove this friend?')) return;
    
    try {
      await FirebaseService.friendship.removeFriend(currentUser.uid, friendId);
      await loadFriends(currentUser.uid);
      setSelectedFriend(null);
      alert('Friend removed.');
    } catch (err) {
      console.error('Error removing friend:', err);
      alert('Failed to remove friend. Please try again.');
    }
  };
  
  const handleJoinGroup = async (groupId) => {
    if (!currentUser) return;
    
    try {
      await FirebaseService.group.joinGroup(groupId, currentUser.uid);
      await loadGroups();
      alert('Successfully joined group!');
    } catch (err) {
      console.error('Error joining group:', err);
      alert('Failed to join group. Please try again.');
    }
  };
  
  const handleLeaveGroup = async (groupId) => {
    if (!currentUser) return;
    
    if (!confirm('Are you sure you want to leave this group?')) return;
    
    try {
      await FirebaseService.group.leaveGroup(groupId, currentUser.uid);
      await loadGroups();
      alert('Left group.');
    } catch (err) {
      console.error('Error leaving group:', err);
      alert('Failed to leave group. Please try again.');
    }
  };
  
  const handleCreatePost = async (groupId) => {
    if (!currentUser || !newPost.trim()) return;
    
    try {
      await FirebaseService.group.createPost(groupId, currentUser.uid, newPost);
      setNewPost('');
      setShowPostModal(false);
      alert('Post created successfully!');
      
      // Reload group posts
      await loadGroups();
    } catch (err) {
      console.error('Error creating post:', err);
      alert('Failed to create post. Please try again.');
    }
  };
  
  const handleReaction = async (groupId, postId, reactionType) => {
    if (!currentUser) return;
    
    try {
      await FirebaseService.group.addReaction(groupId, postId, reactionType);
      
      // Update local state optimistically
      setGroups(prev => prev.map(group => {
        if (group.id === groupId) {
          return {
            ...group,
            posts: group.posts.map(post => {
              if (post.id === postId) {
                return {
                  ...post,
                  reactions: {
                    ...post.reactions,
                    [reactionType]: (post.reactions[reactionType] || 0) + 1,
                  },
                };
              }
              return post;
            }),
          };
        }
        return group;
      }));
    } catch (err) {
      console.error('Error adding reaction:', err);
    }
  };
  
  const handleJoinChallenge = async (challengeId) => {
    if (!currentUser) return;
    
    try {
      await FirebaseService.challenge.joinChallenge(challengeId, currentUser.uid);
      await loadChallenges(currentUser.uid);
      alert('Challenge joined!');
    } catch (err) {
      console.error('Error joining challenge:', err);
      alert('Failed to join challenge. Please try again.');
    }
  };
  
  const handleMarkNotificationRead = async (notificationId) => {
    if (!currentUser) return;
    
    try {
      await FirebaseService.notification.markAsRead(currentUser.uid, notificationId);
      
      // Update local state
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };
  
  const handleMarkAllNotificationsRead = async () => {
    if (!currentUser) return;
    
    try {
      await FirebaseService.notification.markAllAsRead(currentUser.uid);
      
      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };
  
  const handleUpdateMood = async (mood) => {
    if (!currentUser) return;
    
    try {
      await FirebaseService.user.updateUser(currentUser.uid, { mood: mood.emoji });
      setUserProfile(prev => ({ ...prev, mood: mood.emoji }));
      setShowMoodSelector(false);
      setSelectedMood(mood);
    } catch (err) {
      console.error('Error updating mood:', err);
      alert('Failed to update mood. Please try again.');
    }
  };


  const handleLoadAllUsers = async (loadMore = false) => {
  if (!currentUser) return;
  
  try {
    setLoadingAllUsers(true);
    
    // ✅ Load ONLY 20 users at a time with cursor
    const result = await FirebaseService.user.getAllUsers(
      USERS_PER_PAGE, 
      loadMore ? lastUserDoc : null
    );
    
    if (loadMore) {
      setAllUsers(prev => [...prev, ...result.users]);
    } else {
      setAllUsers(result.users);
    }
    
    setLastUserDoc(result.lastDoc);
    setHasMoreUsers(result.hasMore);
    
  } catch (err) {
    console.error('Error loading users:', err);
    alert('Failed to load users');
  } finally {
    setLoadingAllUsers(false);
  }
};


  // Friend Search Handlers
  const handleSearchUsers = async (query) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      return;
    }
    
    try {
      setSearchingUsers(true);
      const results = await FirebaseService.user.searchUsers(query.toLowerCase(), 20);
      
      const friendIds = friends.map(f => f.id);
      const filteredResults = results.filter(
        user => user.id !== currentUser.uid && !friendIds.includes(user.id)
      );
      
      setSearchResults(filteredResults);
    } catch (err) {
      console.error('Error searching users:', err);
      alert('Failed to search users. Please try again.');
    } finally {
      setSearchingUsers(false);
    }
  };
  
  const handleOpenFriendSearch = () => {
    setShowFriendSearchModal(true);
    setFriendSearchQuery('');
    setSearchResults([]);
  };
  
// Open challenge modal for a friend
const handleOpenChallengeModal = (friend) => {
  setSelectedChallengeUser(friend);
  setSelectedChallengeTemplate(null);
  setShowChallengeModal(true);
};

const handleCloseFriendSearch = () => {
  setShowFriendSearchModal(false);
  setFriendSearchQuery('');
  setSearchResults([]);
};

// Send friend challenge
const handleSendChallenge = async () => {
  if (!currentUser || !selectedChallengeUser || !selectedChallengeTemplate) {
    alert('Please select a challenge template');
    return;
  }
  
  try {
    await FirebaseService.challenge.createFriendChallenge(
      currentUser.uid,
      selectedChallengeUser.id,
      selectedChallengeTemplate
    );
    
    alert(`Challenge sent to ${selectedChallengeUser.name}!`);
    
    // ✅ Close both modals
    setShowChallengeModal(false);
    setSelectedChallengeUser(null);
    setSelectedChallengeTemplate(null);
    setSelectedFriend(null); // ✅ Also close the profile modal
    
    // Reload challenges
    await loadChallenges(currentUser.uid);
  } catch (err) {
    console.error('Error sending challenge:', err);
    alert('Failed to send challenge. Please try again.');
  }
};
// Accept friend challenge
const handleAcceptChallenge = async (challengeId) => {
  if (!currentUser) return;
  
  console.log('🔍 Frontend: Accepting challenge');
  console.log('   - Received challengeId:', challengeId);
  console.log('   - Type:', typeof challengeId);
  console.log('   - Length:', challengeId?.length);
  
  // ✅ Validate it's a Firestore ID (20 characters, alphanumeric)
  const isFirestoreId = /^[a-zA-Z0-9]{20}$/.test(challengeId);
  console.log('   - Is Firestore ID format?', isFirestoreId);
  
  if (!isFirestoreId) {
    alert(`❌ Invalid challenge ID format: "${challengeId}". This looks like a template ID, not a Firestore document ID.`);
    return;
  }
  
  try {
    await FirebaseService.challenge.acceptChallenge(challengeId, currentUser.uid);
    alert('Challenge accepted!');
    await loadChallenges(currentUser.uid);
  } catch (err) {
    console.error('Error accepting challenge:', err);
    alert('Failed to accept challenge. Please try again.');
  }
};

// Decline friend challenge
const handleDeclineChallenge = async (challengeId) => {
  if (!currentUser) return;
  
  if (!confirm('Are you sure you want to decline this challenge?')) return;
  
  try {
    await FirebaseService.challenge.declineChallenge(challengeId, currentUser.uid);
    alert('Challenge declined.');
    await loadChallenges(currentUser.uid);
  } catch (err) {
    console.error('Error declining challenge:', err);
    alert('Failed to decline challenge. Please try again.');
  }
};

const handleAcceptGroupInvite = async (inviteId) => {
    if (!currentUser) return;
    
    try {
      const groupId = await FirebaseService.group.acceptGroupInvite(inviteId);
      alert('Group invite accepted!');
      
      // Reload groups and notifications
      await Promise.all([
        loadGroups(),
        loadNotifications(currentUser.uid)
      ]);
      
      // Optionally switch to groups tab
      setSelectedTab(3);
    } catch (err) {
      console.error('Error accepting group invite:', err);
      alert(err.message || 'Failed to accept invite. Please try again.');
    }
  };
  
  // Decline group invite
  const handleDeclineGroupInvite = async (inviteId) => {
    if (!currentUser) return;
    
    if (!confirm('Are you sure you want to decline this group invite?')) return;
    
    try {
      await FirebaseService.group.declineGroupInvite(inviteId);
      alert('Group invite declined.');
      
      // Mark notification as read
      await loadNotifications(currentUser.uid);
    } catch (err) {
      console.error('Error declining group invite:', err);
      alert('Failed to decline invite. Please try again.');
    }
  };

 const handleCreateGroup = async () => {
    if (!currentUser) return;
    
    // Validate inputs
    if (!newGroupData.name.trim()) {
      alert('Please enter a group name');
      return;
    }
    
    if (!newGroupData.description.trim()) {
      alert('Please enter a group description');
      return;
    }
    
    try {
      setCreatingGroup(true);
      
      const groupId = await FirebaseService.group.createGroup(currentUser.uid, {
        name: newGroupData.name.trim(),
        description: newGroupData.description.trim(),
        category: newGroupData.category,
        icon: newGroupData.icon,
        members: 1,
        activeNow: 0,
        posts: []
      });
      
      alert('Group created successfully!');
      
      // Reset form
      setNewGroupData({
        name: '',
        description: '',
        category: 'Learning',
        icon: '📚'
      });
      
      setShowCreateGroupModal(false);
      
      // Reload groups
      await loadGroups();
      
    } catch (err) {
      console.error('Error creating group:', err);
      alert('Failed to create group. Please try again.');
    } finally {
      setCreatingGroup(false);
    }
  };

  // Handle invite friend to group
  const handleInviteFriendToGroup = async (friendId, groupId) => {
    if (!currentUser) return;
    
    try {
      await FirebaseService.group.inviteToGroup(groupId, currentUser.uid, friendId);
      alert('Group invite sent!');
      setShowGroupInviteModal(false);
    } catch (err) {
      console.error('Error inviting to group:', err);
      alert(err.message || 'Failed to send invite. Please try again.');
    }
  };

  // Group Detail Handlers
const handleOpenGroupDetail = async (group) => {
  setSelectedGroup(group);
  setLoadingGroupPosts(true);
  
  try {
    // Load all posts for this group
    const posts = await FirebaseService.group.getGroupPosts(group.id);
    setGroupPosts(posts);
  } catch (err) {
    console.error('Error loading group posts:', err);
    alert('Failed to load group posts');
  } finally {
    setLoadingGroupPosts(false);
  }
};

const handleCloseGroupDetail = () => {
  setSelectedGroup(null);
  setGroupPosts([]);
  setShowPostTemplateSelector(false);
  setSelectedPostTemplate(null);
  setNewPostData({ type: 'PRACTICE_REPORT', content: {} });
};

const handleSelectPostTemplate = (template) => {
  setSelectedPostTemplate(template);
  setShowPostTemplateSelector(false);
  setNewPostData({
    type: template.type,
    content: {}
  });
};

const handleCreateStructuredPost = async () => {
  if (!currentUser || !selectedGroup || !selectedPostTemplate) return;
  
  // Validate that all fields are filled
  const allFieldsFilled = selectedPostTemplate.fields.every(
    field => newPostData.content[field.name]?.trim()
  );
  
  if (!allFieldsFilled) {
    alert('Please fill in all fields');
    return;
  }
  
  try {
    await FirebaseService.group.createStructuredPost(
      selectedGroup.id,
      currentUser.uid,
      {
        type: newPostData.type,
        content: newPostData.content,
        template: selectedPostTemplate,
      }
    );
    
    alert('Post created successfully!');
    
    // Reset and reload
    setSelectedPostTemplate(null);
    setNewPostData({ type: 'PRACTICE_REPORT', content: {} });
    await handleOpenGroupDetail(selectedGroup);
    
  } catch (err) {
    console.error('Error creating structured post:', err);
    alert('Failed to create post. Please try again.');
  }
};

const handleAddComment = async (postId) => {
  if (!currentUser || !newComment.trim()) return;
  
  try {
    await FirebaseService.group.addComment(
      selectedGroup.id,
      postId,
      currentUser.uid,
      newComment.trim()
    );
    
    setNewComment('');
    setShowCommentInput(null);
    
    // Reload posts
    await handleOpenGroupDetail(selectedGroup);
    
  } catch (err) {
    console.error('Error adding comment:', err);
    alert('Failed to add comment');
  }
};

const handleReactToPost = async (postId, reactionType) => {
  if (!currentUser) return;
  
  try {
    await FirebaseService.group.addReaction(selectedGroup.id, postId, reactionType);
    
    // Update local state optimistically
    setGroupPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          reactions: {
            ...post.reactions,
            [reactionType]: (post.reactions[reactionType] || 0) + 1,
          },
        };
      }
      return post;
    }));
  } catch (err) {
    console.error('Error adding reaction:', err);
  }
};

  
  // ============================================
  // EFFECTS
  // ============================================
  
 
  

  // Add this useEffect after your other useEffects
useEffect(() => {
  if (currentUser) {
    loadChallengeTemplates();
  }
}, [currentUser]);

const loadChallengeTemplates = async () => {
  try {
    setLoadingChallengeTemplates(true);
    const templates = FirebaseService.challenge.getChallengeTemplates();
    setChallengeTemplates(templates);
  } catch (err) {
    console.error('Error loading challenge templates:', err);
  } finally {
    setLoadingChallengeTemplates(false);
  }
};

  // ============================================
  // COMPUTED VALUES
  // ============================================
  
  const filteredFriends = friends
    .filter(f => f.name?.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortOption === 'rank') return (a.rank || 0) - (b.rank || 0);
      if (sortOption === 'xp') return (b.weeklyXP || 0) - (a.weeklyXP || 0);
      if (sortOption === 'streak') return (b.streak || 0) - (a.streak || 0);
      return 0;
    });
  
  const unreadCount = notifications.filter(n => !n.read).length;
  const maxWeeklyActions = Math.max(...weeklyData.map(d => d.actions), 1);
  
  // ============================================
  // RENDER FUNCTIONS
  // ============================================
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-950 via-purple-900 to-indigo-950 text-white">
        <LoadingSpinner />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-950 via-purple-900 to-indigo-950 text-white">
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      </div>
    );
  }
  
  if (!currentUser || !userProfile) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-purple-900 to-indigo-950 text-white flex items-center justify-center">
      <ParticleBackground />
      {showAuthModal && !isAuthChecking && (
        <AuthModal
          onClose={() => {
            if (!currentUser) {
              alert('Please sign in to continue');
            } else {
              setShowAuthModal(false);
            }
          }}
          onLogin={handleLogin}
          onSignup={handleSignup}
        />
      )}
      {!showAuthModal && (
        <ErrorState 
          message="Please log in to access Purple Learning Hub" 
          onRetry={() => setShowAuthModal(true)} 
        />
      )}
    </div>
  );
}

// NEW: Conditional rendering block for the full-screen Hub overlay
  if (isHubOpen) {
    return (
      <div className="fixed inset-0 z-[1000] overflow-y-auto bg-gradient-to-br from-purple-950 via-purple-900 to-indigo-950">
        {/* The Hub Component */}
        <IRLConnectionsHub onClose={() => setIsHubOpen(false)} />
        
        {/* External Close Button */}
        <button
          onClick={() => setIsHubOpen(false)}
          className="absolute top-4 right-4 z-[1001] p-3 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg transition-all"
        >
          <Users className="w-6 h-6" /> {/* Using the Users icon for now, you might prefer an X */}
        </button>
      </div>
    );
  }

  
  return (
  <div>
      <style>{`
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-20px); }
  }
  
  * {
    -webkit-tap-highlight-color: transparent;
  }
  
  html, body {
    overscroll-behavior: none;
    -webkit-overflow-scrolling: touch;
  }
  
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  
  /* ONLY the modal content boxes (not the dark overlay background) */
  .modal-content-white {
    background: linear-gradient(to bottom right, 
      rgba(250, 250, 250, 0.98), 
      rgba(245, 245, 245, 0.98)) !important;
    backdrop-filter: blur(30px) !important;
  }
  
  /* Text colors inside white modals */
  .modal-content-white .text-white,
  .modal-content-white .text-purple-100,
  .modal-content-white .text-purple-200 {
    color: #1f1f1f !important;
  }
  
  .modal-content-white .text-purple-300,
  .modal-content-white .text-purple-400 {
    color: #4a4a4a !important;
  }
  
  /* Inputs inside white modals */
  .modal-content-white input:not([type="checkbox"]):not([type="radio"]),
  .modal-content-white textarea,
  .modal-content-white select {
    background-color: rgba(255, 255, 255, 0.7) !important;
    color: #1f1f1f !important;
    border-color: rgba(150, 150, 150, 0.4) !important;
  }
  
  .modal-content-white input::placeholder,
  .modal-content-white textarea::placeholder {
    color: #888 !important;
  }
  
  /* Nested sections inside white modals */
  .modal-content-white [class*="bg-purple-950"],
  .modal-content-white [class*="bg-purple-900"] {
    background-color: rgba(240, 240, 240, 0.8) !important;
  }
`}</style>

      <div className="min-h-screen bg-gradient-to-br from-purple-950 via-purple-900 to-indigo-950 text-white relative overflow-x-hidden">
        {!isMobile && <ParticleBackground />}
        
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 md:py-8 relative z-10 pb-32 md:pb-12">
          
          <header className="mb-6 md:mb-8 text-center">
            <div className="inline-flex items-center gap-2 mb-2 md:mb-3 px-3 md:px-4 py-1.5 md:py-2 bg-purple-800/40 backdrop-blur-sm rounded-full border border-purple-500/30">
              <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-purple-300" />
              <span className="text-xs md:text-sm font-medium text-purple-200">Social Skills Mastery Platform</span>
            </div>
            
            <h1 id="productHeader" className="text-3xl md:text-5xl lg:text-6xl font-bold mb-3 md:mb-4 bg-gradient-to-r from-purple-200 via-pink-200 to-purple-300 bg-clip-text text-transparent px-4">
              Community 
            </h1>
            
            <p className="text-purple-200 text-sm md:text-lg lg:text-xl max-w-2xl mx-auto mb-3 md:mb-4 px-4">
              Transform your skills through community, track progress, and unlock your potential
            </p>
            
            <CommunityStories 
              userId={currentUser?.uid} 
              userName={userProfile?.name}
              userAvatar={userProfile?.avatar}
            />

            <div className="flex items-center justify-center gap-2 text-purple-300 italic px-4">
              <Sparkles className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
              <p className="text-xs md:text-sm">{dailyQuote}</p>
              <Sparkles className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
            </div>

            <div className="mb-12">
              <SocialCityMap />
            </div>
          </header>

          {/* 🔥 MOBILE-OPTIMIZED HERO STATS SECTION */}
          <div className="mb-6 bg-gradient-to-br from-purple-900/60 to-indigo-900/60 backdrop-blur-sm rounded-2xl border-2 border-purple-500/30 p-6">
            {/* User Quick Stats */}
            <div className="flex items-center gap-4 mb-6">
              <img
                src={userProfile?.avatar}
                alt={userProfile?.name}
                className="w-16 h-16 rounded-full border-4 border-purple-500/50"
              />
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white">{userProfile?.name}</h3>
                <p className="text-sm text-purple-300">@{userProfile?.username}</p>
                <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-bold ${
                  userProfile?.league === 'GOLD' ? 'bg-yellow-500/20 text-yellow-400' :
                  userProfile?.league === 'SILVER' ? 'bg-gray-400/20 text-gray-300' :
                  userProfile?.league === 'DIAMOND' ? 'bg-blue-400/20 text-blue-300' :
                  userProfile?.league === 'PLATINUM' ? 'bg-gray-300/20 text-gray-200' :
                  'bg-orange-500/20 text-orange-400'
                }`}>
                  {LEAGUES[userProfile?.league]?.name || 'Bronze'} League
                </span>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-purple-950/40 p-3 rounded-xl text-center">
                <div className="text-2xl font-bold text-yellow-400">{userProfile?.stats?.totalXP || 0}</div>
                <div className="text-xs text-purple-300">Total XP</div>
              </div>
              <div className="bg-purple-950/40 p-3 rounded-xl text-center">
                <div className="text-2xl font-bold text-orange-400 flex items-center justify-center gap-1">
                  <Flame size={16} />
                  {userProfile?.stats?.streak || 0}
                </div>
                <div className="text-xs text-purple-300">Streak</div>
              </div>
              <div className="bg-purple-950/40 p-3 rounded-xl text-center">
                <div className="text-2xl font-bold text-pink-400">{userProfile?.stats?.friendsCount || 0}</div>
                <div className="text-xs text-purple-300">Friends</div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleOpenFriendSearch}
                className="px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-bold hover:scale-105 transition-transform flex items-center justify-center gap-2 text-sm"
                style={{ touchAction: 'manipulation' }}
              >
                <Search size={16} />
                Find Friends
              </button>
              <button
                onClick={() => {
                  setShowDiscoverModal(true);
                  handleLoadAllUsers();
                }}
                className="px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl font-bold hover:scale-105 transition-transform flex items-center justify-center gap-2 text-sm"
                style={{ touchAction: 'manipulation' }}
              >
                <Users size={16} />
                Discover
              </button>
            </div>
          </div>

          {/* 🔥 CLEAN SEARCH + NOTIFICATIONS BAR */}
          <div className="mb-6">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search friends, groups..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-purple-900/40 border-2 border-purple-500/30 rounded-xl text-white placeholder-purple-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 backdrop-blur-sm transition-all text-sm"
                />
              </div>
              
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative px-4 py-3 bg-purple-900/40 border-2 border-purple-500/30 rounded-xl text-white font-semibold hover:border-purple-400 transition-all flex items-center justify-center flex-shrink-0"
                style={{ touchAction: 'manipulation' }}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="mt-4 p-4 md:p-6 bg-purple-900/40 backdrop-blur-sm rounded-xl md:rounded-2xl border border-purple-500/30 max-h-80 overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-base md:text-lg font-bold text-purple-100">Notifications</h4>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllNotificationsRead}
                      className="text-xs text-purple-400 hover:text-purple-200 underline"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                
                {notifications.length === 0 ? (
                  <EmptyState 
                    icon={Bell}
                    title="No Notifications"
                    description="You're all caught up!"
                  />
                ) : (
                  <div className="space-y-2">
                    {notifications.map(notif => (
                      <div
                        key={notif.id}
                        className={`p-3 md:p-4 rounded-xl transition-all min-h-[56px] ${
                          notif.read ? 'bg-purple-950/20' : 'bg-purple-800/30'
                        } ${(notif.type === 'friend' && notif.message.includes('sent you a friend request')) || (notif.type === 'challenge' && notif.message.includes('challenged you')) ? '' : 'cursor-pointer active:bg-purple-800/50'}`}
                        onClick={() => {
                          if (!((notif.type === 'friend' && notif.message.includes('sent you a friend request')) || (notif.type === 'challenge' && notif.message.includes('challenged you')))) {
                            handleMarkNotificationRead(notif.id);
                          }
                        }}
                        style={{ touchAction: 'manipulation' }}
                      >
                        <div className="flex gap-3">
                          <div className="text-xl md:text-2xl flex-shrink-0">{notif.icon}</div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs md:text-sm ${notif.read ? 'text-purple-300' : 'text-purple-100 font-semibold'}`}>
                              {notif.message}
                            </p>
                            <span className="text-xs text-purple-400">
                              {notif.createdAt ? new Date(notif.createdAt.seconds * 1000).toLocaleString() : 'Just now'}
                            </span>
                            
                            {/* Friend Request Action Buttons */}
                            {notif.type === 'friend' && notif.message.includes('sent you a friend request') && !notif.read && (
                              <div className="flex gap-2 mt-3">
                                <button
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    const request = pendingRequests.find(r => r.fromUserId === notif.relatedId);
                                    if (request) {
                                      await handleAcceptFriendRequest(request.id);
                                      await handleMarkNotificationRead(notif.id);
                                    } else {
                                      alert('Friend request not found');
                                    }
                                  }}
                                  className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1"
                                  style={{ touchAction: 'manipulation' }}
                                >
                                  <CheckCircle size={14} />
                                  Accept
                                </button>
                                <button
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    const request = pendingRequests.find(r => r.fromUserId === notif.relatedId);
                                    if (request) {
                                      await handleRejectFriendRequest(request.id);
                                      await handleMarkNotificationRead(notif.id);
                                    } else {
                                      alert('Friend request not found');
                                    }
                                  }}
                                  className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1"
                                  style={{ touchAction: 'manipulation' }}
                                >
                                  <X size={14} />
                                  Reject
                                </button>
                              </div>
                            )}

		{/* Challenge Request Action Buttons */}
{notif.type === 'challenge' && notif.message.includes('challenged you') && !notif.read && (
  <div className="flex gap-2 mt-3">
    <button
      onClick={async (e) => {
        e.stopPropagation();
        console.log('DEBUG: Challenge notification relatedId:', notif.relatedId);  // ✅ Debug log
        if (notif.relatedId && typeof notif.relatedId === 'string' && notif.relatedId.length === 20) {
          await handleAcceptChallenge(notif.relatedId);
          await handleMarkNotificationRead(notif.id);
        } else {
          alert(`❌ Invalid challenge ID in notification: ${notif.relatedId}`);
          console.error('Invalid relatedId:', notif.relatedId);
        }
      }}
      className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1"
      style={{ touchAction: 'manipulation' }}
    >
      <CheckCircle size={14} />
      Accept
    </button>

    <button
      onClick={async (e) => {
        e.stopPropagation();
        if (notif.relatedId) {
          await handleDeclineChallenge(notif.relatedId);
          await handleMarkNotificationRead(notif.id);
        } else {
          alert('Challenge not found');
        }
      }}
      className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1"
      style={{ touchAction: 'manipulation' }}
    >
      <X size={14} />
      Decline
    </button>
  </div>
)}

{/* Group Invite Action Buttons */}
{notif.type === 'group' && notif.message.includes('invited you') && !notif.read && (
  <div className="flex gap-2 mt-3">
    <button
      onClick={async (e) => {
        e.stopPropagation();
        console.log('🔍 Accepting group invite, relatedId:', notif.relatedId);
        
        if (!notif.relatedId) {
          alert('❌ Invalid group invite');
          console.error('Missing relatedId in notification:', notif);
          return;
        }
        
        try {
          await handleAcceptGroupInvite(notif.relatedId);
          await handleMarkNotificationRead(notif.id);
        } catch (err) {
          console.error('❌ Error accepting invite:', err);
          alert(err.message || 'Failed to accept group invite');
        }
      }}
      className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1"
      style={{ touchAction: 'manipulation' }}
    >
      <CheckCircle size={14} />
      Accept
    </button>
    <button
      onClick={async (e) => {
        e.stopPropagation();
        console.log('🔍 Declining group invite, relatedId:', notif.relatedId);
        
        if (!notif.relatedId) {
          alert('❌ Invalid group invite');
          return;
        }
        
        try {
          await handleDeclineGroupInvite(notif.relatedId);
          await handleMarkNotificationRead(notif.id);
        } catch (err) {
          console.error('❌ Error declining invite:', err);
          alert('Failed to decline group invite');
        }
      }}
      className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1"
      style={{ touchAction: 'manipulation' }}
    >
      <X size={14} />
      Decline
    </button>
  </div>
)}

{/* Show "Invite handled" status if already actioned */}
{notif.type === 'group' && notif.message.includes('invited you') && notif.read && (
  <div className="mt-2 text-xs text-purple-400 italic">
    Invite handled
  </div>
)}


{/* Challenge Request Action Buttons */}
{notif.type === 'challenge' && notif.message.includes('challenged you') && !notif.read && (
  <div className="flex gap-2 mt-3">
    <button
      onClick={async (e) => {
        e.stopPropagation();
        console.log('DEBUG: Challenge notification relatedId:', notif.relatedId);
        if (notif.relatedId && typeof notif.relatedId === 'string' && notif.relatedId.length === 20) {
          await handleAcceptChallenge(notif.relatedId);
          await handleMarkNotificationRead(notif.id);
        } else {
          alert(`❌ Invalid challenge ID in notification: ${notif.relatedId}`);
          console.error('Invalid relatedId:', notif.relatedId);
        }
      }}
      className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1"
      style={{ touchAction: 'manipulation' }}
    >
      <CheckCircle size={14} />
      Accept
    </button>

    <button
      onClick={async (e) => {
        e.stopPropagation();
        if (notif.relatedId) {
          await handleDeclineChallenge(notif.relatedId);
          await handleMarkNotificationRead(notif.id);
        } else {
          alert('Challenge not found');
        }
      }}
      className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1"
      style={{ touchAction: 'manipulation' }}
    >
      <X size={14} />
      Decline
    </button>
  </div>
)}

{/* 🆕 ADD GROUP INVITE ACTION BUTTONS BELOW 👇 */}





                
                {/* Show "Accepted" or "Rejected" status if already actioned */}
                {notif.type === 'friend' && notif.message.includes('sent you a friend request') && notif.read && (
                  <div className="mt-2 text-xs text-purple-400 italic">
                    Request handled
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
)}
</div>
        
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide sticky top-0 z-20 bg-gradient-to-br backdrop-blur-xl pt-4 -mx-4 px-4 md:mx-0 md:px-0">
  {[
    { icon: <Users size={16} />, label: 'Friends', count: friends.length },
    { icon: <Trophy size={16} />, label: 'Leaderboard', count: null },
    { icon: <MessageCircle size={16} />, label: 'Leaderboard', count: groups.length },
  ].map((tab, idx) => (
    <button
      key={idx}
      onClick={() => handleTabClick(idx)}
      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap flex-shrink-0 text-sm ${
        selectedTab === idx
          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
          : 'bg-purple-900/40 text-purple-300 border border-purple-700/30 active:bg-purple-800/50'
      }`}
      style={{ touchAction: 'manipulation' }}
    >
      {tab.icon}
      <span>{tab.label}</span>
      {tab.count !== null && (
        <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${
          selectedTab === idx ? 'bg-white/20' : 'bg-purple-800/50'
        }`}>
          {tab.count}
        </span>
      )}
    </button>
            ))}
          </div>

          {selectedTab === 0 && (
            <div>
              <div className="flex justify-between items-center mb-4 md:mb-6">
                <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-transparent">
                  Your Friends
                </h2>
                  <button 
    onClick={handleOpenFriendSearch}
    className="px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-bold hover:scale-105 transition-transform flex items-center gap-2 min-h-[48px] text-sm md:text-base"
  >
    <Search size={18} />
    <span className="hidden sm:inline">Search</span>
  </button>
  <button 
    onClick={() => {
      setShowDiscoverModal(true);
      handleLoadAllUsers();
    }}
    className="px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl font-bold hover:scale-105 transition-transform flex items-center gap-2 min-h-[48px] text-sm md:text-base"
  >
    <Users size={18} />
    <span className="hidden sm:inline">Discover</span>
  </button>
              </div>

              {loadingFriends ? (
                <div className="text-center py-12">
                  <Loader className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
                  <p className="text-purple-200">Loading friends...</p>
                </div>
              ) : filteredFriends.length === 0 ? (
                <EmptyState 
                  icon={Users}
                  title="No Friends Yet"
                  description="Start building your squad by adding friends to learn and grow together!"
                  actionLabel="Find Friends"
                  onAction={handleOpenFriendSearch}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {filteredFriends.map(friend => (
                    <div
                      key={friend.id}
                      onClick={() => setSelectedFriend(friend)}
                      className="bg-gradient-to-br from-purple-900/60 to-indigo-900/60 backdrop-blur-sm p-4 md:p-6 rounded-xl md:rounded-2xl border-2 border-purple-500/30 hover:border-purple-400/50 transition-all cursor-pointer active:scale-98 md:hover:-translate-y-3 md:hover:shadow-2xl md:hover:shadow-purple-500/50"
                      style={{ touchAction: 'manipulation' }}
                    >
                      <div className="flex items-center gap-3 md:gap-4 mb-4">
                        <div className="relative">
                          <img
                            src={friend.avatar}
                            alt={friend.name}
                            className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-purple-500/50"
                          />
                          {friend.isOnline && (
                            <div className="absolute bottom-0 right-0 w-4 h-4 md:w-5 md:h-5 bg-green-500 rounded-full border-2 border-purple-900 animate-pulse" />
                          )}
                          <div className="absolute -top-2 -left-2 text-2xl md:text-3xl">{friend.mood}</div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg md:text-xl text-white truncate">{friend.name}</h3>
                          <p className="text-xs md:text-sm text-purple-300 truncate">{friend.username}</p>
                          <span className={`inline-block mt-1 px-2 md:px-3 py-0.5 md:py-1 rounded-full text-xs font-bold ${
                            friend.league === 'GOLD' ? 'bg-yellow-500/20 text-yellow-400' :
                            friend.league === 'SILVER' ? 'bg-gray-400/20 text-gray-300' :
                            friend.league === 'DIAMOND' ? 'bg-blue-400/20 text-blue-300' :
                            friend.league === 'PLATINUM' ? 'bg-gray-300/20 text-gray-200' :
                            'bg-orange-500/20 text-orange-400'
                          }`}>
                            {LEAGUES[friend.league]?.name || 'Bronze'}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs md:text-sm text-purple-200 mb-4 italic line-clamp-2">"{friend.status}"</p>

                      <div className="grid grid-cols-3 gap-2 md:gap-3 mb-4 p-3 md:p-4 bg-purple-950/40 rounded-xl">
                        <div className="text-center">
                          <div className="text-xl md:text-2xl font-bold text-yellow-400">{friend.weeklyXP || friend.XP}</div>
                          <div className="text-xs text-purple-300">Week XP</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl md:text-2xl font-bold text-orange-400 flex items-center justify-center gap-1">
                            <Flame size={16} />
                            {friend.streak}</div>
                          <div className="text-xs text-purple-300">Streak</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl md:text-2xl font-bold text-pink-400 flex items-center justify-center gap-1">
                            <Crown size={16} />
                            {friend.crowns}
                          </div>
                          <div className="text-xs text-purple-300">Crowns</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
  <button 
    className="px-2 md:px-3 py-2.5 md:py-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl font-bold hover:scale-105 transition-transform flex items-center justify-center gap-1 min-h-[44px] text-xs md:text-sm"
    onClick={(e) => {
      e.stopPropagation();
      alert('Messaging feature - implement with FirebaseService.messaging');
    }}
    style={{ touchAction: 'manipulation' }}
    title="Send Message"
  >
    <MessageCircle size={14} />
    <span className="hidden sm:inline">Message</span>
  </button>
  
  <button 
    className="px-2 md:px-3 py-2.5 md:py-3 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl font-bold hover:scale-105 transition-transform flex items-center justify-center gap-1 min-h-[44px] text-xs md:text-sm"
    onClick={(e) => {
      e.stopPropagation();
      setSelectedFriendForInvite(friend);
      setShowGroupInviteModal(true);
    }}
    style={{ touchAction: 'manipulation' }}
    title="Invite to Group"
  >
    <Users size={14} />
    <span className="hidden sm:inline">Invite</span>
  </button>
</div>                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          
          
          {selectedTab === 2 && (
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-transparent flex items-center gap-2 md:gap-3">
                <Trophy size={28} />
                Weekly Leaderboard
              </h2>

              {loadingLeaderboard ? (
                <div className="text-center py-12">
                  <Loader className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
                  <p className="text-purple-200">Loading leaderboard...</p>
                </div>
              ) : leaderboard.length === 0 ? (
                <EmptyState 
                  icon={Trophy}
                  title="Leaderboard Coming Soon"
                  description="Compete with others and climb to the top!"
                />
              ) : (
                <>
                  
                  <div className="md:hidden space-y-3 mb-6">
                    {leaderboard.slice(0, 3).map((user, index) => {
                      const medals = ['🥇', '🥈', '🥉'];
                      const gradients = [
                        'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
                        'linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 100%)',
                        'linear-gradient(135deg, #cd7f32 0%, #d4a574 100%)',
                      ];

                      return (
                        <div
                          key={user.userId}
                          style={{ background: gradients[index] }}
                          className="rounded-2xl p-4 relative overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-white/20 backdrop-blur-sm" />
                          <div className="relative z-10 flex items-center gap-4">
                            <div className="text-5xl">{medals[index]}</div>
                            <div className="relative flex-shrink-0">
                              <img
                                src={user.avatar}
                                alt={user.name}
                                className="w-16 h-16 rounded-full border-4 border-white"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-white text-lg truncate">{user.name}</h3>
                              <p className="text-sm text-white/90 truncate">{user.username}</p>
                            </div>
                            <div className="bg-white/30 rounded-xl px-3 py-2 text-center flex-shrink-0">
                              <div className="text-xl font-bold text-white">{user.weeklyXP}</div>
                              <div className="text-xs text-white/90 font-semibold">XP</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="hidden md:grid grid-cols-3 gap-4 max-w-3xl mx-auto mb-8">
                    {leaderboard.slice(0, 3).map((user, index) => {
                      const order = [1, 0, 2];
                      const heights = ['180px', '220px', '160px'];
                      const medals = ['🥈', '🥇', '🥉'];
                      const gradients = [
                        'linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 100%)',
                        'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
                        'linear-gradient(135deg, #cd7f32 0%, #d4a574 100%)',
                      ];

                      return (
                        <div
                          key={user.userId}
                          style={{ order: order[index] }}
                          className="flex flex-col items-center"
                        >
                          <div className="mb-4 relative">
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className={`rounded-full border-4 ${
                                index === 0 ? 'w-24 h-24 border-yellow-400' : 'w-20 h-20 border-gray-400'
                              }`}
                            />
                            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-4xl">
                              {medals[index]}
                            </div>
                          </div>

                          <div
                            style={{
                              height: heights[index],
                              background: gradients[index],
                            }}
                            className="w-full rounded-t-2xl p-4 flex flex-col items-center justify-center relative overflow-hidden"
                          >
                            <div className="absolute inset-0 bg-white/20 backdrop-blur-sm" />
                            <div className="relative z-10 text-center">
                              <h3 className="font-bold text-white text-lg mb-1 truncate max-w-full px-2">{user.name}</h3>
                              <p className="text-sm text-white/90 mb-3 truncate max-w-full px-2">{user.username}</p>
                              <div className="bg-white/30 rounded-xl px-4 py-2 mb-2">
                                <div className="text-2xl font-bold text-white">{user.weeklyXP}</div>
                                <div className="text-xs text-white/90 font-semibold">Weekly XP</div>
                              </div>
                              <div className="flex gap-2 justify-center">
                                <div className="bg-white/20 rounded-lg px-2 py-1">
                                  <div className="text-sm font-bold text-white">{user.streak}</div>
                                  <div className="text-xs text-white/80">Streak</div>
                                </div>
                                <div className="bg-white/20 rounded-lg px-2 py-1">
                                  <div className="text-sm font-bold text-white">{user.crowns}</div>
                                  <div className="text-xs text-white/80">Crowns</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  
                  <div className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 backdrop-blur-sm p-4 md:p-6 rounded-xl md:rounded-2xl border border-purple-500/30">
                    <h3 className="text-lg md:text-xl font-bold mb-4 text-purple-100 flex items-center gap-2">
                      <BarChart3 size={20} />
                      Full Rankings
                    </h3>
                    
                    <div className="space-y-3">
                      {leaderboard.map((user, index) => (
                        <div
                          key={user.userId}
                          className="flex items-center gap-2 md:gap-4 p-3 md:p-4 bg-purple-950/30 rounded-xl border border-purple-700/30 hover:border-purple-500/50 transition-all cursor-pointer active:scale-98"
                          style={{ touchAction: 'manipulation' }}
                          onClick={() => {
                            // Find friend in friends list
                            const friend = friends.find(f => f.id === user.userId);
                            if (friend) setSelectedFriend(friend);
                          }}
                        >
                          <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold text-sm md:text-lg flex-shrink-0 ${
                            index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white' :
                            index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-white' :
                            index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white' :
                            'bg-purple-800/50 text-purple-300'
                          }`}>
                            #{index + 1}
                          </div>
                          
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-12 h-12 md:w-14 md:h-14 rounded-full border-2 border-purple-500/50 flex-shrink-0"
                          />
                          
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-white text-sm md:text-lg truncate">{user.name}</h3>
                            <p className="text-xs md:text-sm text-purple-300 truncate">{user.username}</p>
                          </div>
                          
                          <div className="text-center px-2 md:px-4 py-1 md:py-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl flex-shrink-0">
                            <div className="text-lg md:text-2xl font-bold text-yellow-400">{user.weeklyXP}</div>
                            <div className="text-xs text-yellow-300 hidden sm:block">XP</div>
                          </div>

                          <div className="hidden sm:flex gap-2 flex-shrink-0">
                            <span className="px-3 py-2 bg-orange-500/20 text-orange-400 rounded-lg text-sm font-bold flex items-center gap-1">
                              <Flame size={14} />
                              {user.streak}
                            </span>
                            <span className={`px-3 py-2 rounded-lg text-sm font-bold ${
                              user.league === 'GOLD' ? 'bg-yellow-500/20 text-yellow-400' :
                              user.league === 'SILVER' ? 'bg-gray-400/20 text-gray-300' :
                              user.league === 'DIAMOND' ? 'bg-blue-400/20 text-blue-300' :
                              user.league === 'PLATINUM' ? 'bg-gray-300/20 text-gray-200' :
                              'bg-orange-500/20 text-orange-400'
                            }`}>
                              {LEAGUES[user.league]?.name || 'Bronze'}
                            </span>
                          </div>

                          <ChevronRight className="w-5 h-5 text-purple-400 flex-shrink-0" />
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          
          {selectedTab === 3 && (
            <div>
              <div className="flex justify-between items-center mb-4 md:mb-6">
                <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-transparent flex items-center gap-2 md:gap-3">
                  <MessageCircle size={28} />
                  Communities
                </h2>
                <button 
  onClick={() => setShowCreateGroupModal(true)}
  className="px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-bold hover:scale-105 transition-transform flex items-center gap-2 min-h-[48px] text-sm md:text-base"
>
                  <Plus size={18} />
                  <span className="hidden sm:inline">Create</span>
                </button>
              </div>

              {loadingGroups ? (
                <div className="text-center py-12">
                  <Loader className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
                  <p className="text-purple-200">Loading groups...</p>
                </div>
              ) : groups.length === 0 ? (
                <EmptyState 
                  icon={MessageCircle}
                  title="No Groups Yet"
                  description="Join communities to learn, share, and grow with like-minded people!"
                  actionLabel="Browse Groups"
                  onAction={() => alert('Browse all groups feature')}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {groups.map(group => (
                    <div
                      key={group.id}
                      onClick={() => navigate(`/groups/${group.id}`)}
                      className="bg-gradient-to-br from-purple-900/60 to-indigo-900/60 backdrop-blur-sm rounded-xl md:rounded-2xl border-2 border-purple-500/30 hover:border-purple-400/50 transition-all overflow-hidden active:scale-98 md:hover:-translate-y-3 md:hover:shadow-2xl md:hover:shadow-purple-500/50 cursor-pointer"
		      
                      style={{ touchAction: 'manipulation' }}
                    >
                      
                      <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 md:p-6 text-center relative overflow-hidden">
                        <div className="absolute -top-10 -right-10 text-8xl md:text-9xl opacity-10">{group.icon}</div>
                        <div className="relative z-10">
                          <div className="text-5xl md:text-6xl mb-2 md:mb-3">{group.icon}</div>
                          <h3 className="font-bold text-xl md:text-2xl text-white mb-2">{group.name}</h3>
                          <p className="text-xs md:text-sm text-purple-100">{group.description}</p>
                        </div>
                      </div>
                      
                      
                      <div className="p-4 md:p-6">
                        <div className="flex items-center justify-between mb-4 text-xs md:text-sm">
                          <span className="text-purple-300 flex items-center gap-2">
                            <Users size={14} />
                            {group.members} members
                          </span>
                          <span className="text-green-400 flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                            {group.activeNow} online
                          </span>
                        </div>
                        
                        <span className="inline-block px-3 py-1 bg-purple-800/50 rounded-full text-xs text-purple-200 font-semibold mb-4">
                          {group.category}
                        </span>

                        
                        {group.posts && group.posts.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-xs font-bold text-purple-300 mb-2 flex items-center gap-2">
                              <MessageCircle size={12} />
                              Recent Posts
                            </h4>
                            {group.posts.slice(0, 1).map(post => (
                              <div key={post.id} className="p-3 bg-purple-950/30 rounded-xl border border-purple-700/30">
                                <div className="flex gap-2 mb-2">
                                  <img src={post.user.avatar} alt={post.user.name} className="w-8 h-8 rounded-full flex-shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <h5 className="text-sm font-bold text-white truncate">{post.user.name}</h5>
                                    <span className="text-xs text-purple-400">{post.timestamp}</span>
                                  </div>
                                </div>
                                <p className="text-xs md:text-sm text-purple-200 mb-2 line-clamp-2">{post.content.substring(0, 80)}...</p>
                                <div className="flex gap-3">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleReaction(group.id, post.id, 'fire');
                                    }}
                                    className="text-xs flex items-center gap-1 text-purple-300 hover:text-orange-400 transition-colors min-h-[32px]"
                                    style={{ touchAction: 'manipulation' }}
                                  >
                                    🔥 {post.reactions.fire}
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleReaction(group.id, post.id, 'heart');
                                    }}
                                    className="text-xs flex items-center gap-1 text-purple-300 hover:text-pink-400 transition-colors min-h-[32px]"
                                    style={{ touchAction: 'manipulation' }}
                                  >
                                    ❤️ {post.reactions.heart}
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        <div className="flex gap-2">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowPostModal(true);
                            }}
                            className="flex-1 px-3 md:px-4 py-2.5 md:py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-bold hover:scale-105 transition-transform flex items-center justify-center gap-2 min-h-[44px] text-sm"
                            style={{ touchAction: 'manipulation' }}
                          >
                            <Send size={14} />
                            Post
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleJoinGroup(group.id);
                            }}
                            className="flex-1 px-3 md:px-4 py-2.5 md:py-3 bg-purple-800/50 border-2 border-purple-500/50 rounded-xl font-bold hover:bg-purple-700/50 transition-all flex items-center justify-center gap-2 min-h-[44px] text-sm"
                            style={{ touchAction: 'manipulation' }}
                          >
                            <UserPlus size={14} />
                            Join
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

       {showOnboardingOverlay && (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
    <div className="bg-gradient-to-br from-purple-900/95 to-indigo-900/95 backdrop-blur-xl p-6 md:p-8 rounded-3xl border-2 border-purple-500/50 shadow-2xl max-w-md w-full animate-scale-in">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
          <Users className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Welcome to Community! 🌟</h2>
        <p className="text-purple-200 text-sm md:text-base">Connect, share, and grow together with fellow achievers</p>
      </div>

      <div className="space-y-4 mb-6">
        <div className="flex items-start gap-3 p-4 bg-purple-950/50 rounded-xl border border-purple-500/30">
          <MessageCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-white text-sm mb-1">Share Your Journey</h3>
            <p className="text-purple-300 text-xs">Post updates, wins, and inspire others with your progress</p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 bg-purple-950/50 rounded-xl border border-purple-500/30">
          <Users className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-white text-sm mb-1">See Community Activity</h3>
            <p className="text-purple-300 text-xs">Discover what others are achieving and stay motivated</p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 bg-purple-950/50 rounded-xl border border-purple-500/30">
          <Heart className="w-5 h-5 text-pink-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-white text-sm mb-1">Support & Celebrate</h3>
            <p className="text-purple-300 text-xs">React, comment, and celebrate wins together as a community</p>
          </div>
        </div>
      </div>

      <button
        onClick={() => setShowOnboardingOverlay(false)}
        className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl font-bold text-white transition-all shadow-xl"
      >
        Let's Connect! 🤝
      </button>
    </div>
  </div>
)}

        
        {showPostModal && (
          <div
            onClick={() => setShowPostModal(false)}
            className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-end md:items-center justify-center z-[1000] p-0 md:p-4"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="modal-content-white bg-gradient-to-br from-purple-900 to-indigo-900 backdrop-blur-xl rounded-3xl w-full max-w-5xl border-2 border-purple-500/50 shadow-2xl my-4"
            >
              <div className="p-6 md:p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-transparent">
                    Create New Post
                  </h3>
                  <button
                    onClick={() => setShowPostModal(false)}
                    className="w-12 h-12 rounded-full bg-red-500/20 hover:bg-red-500 active:bg-red-600 text-red-400 hover:text-white transition-all flex items-center justify-center min-h-[48px]"
                    style={{ touchAction: 'manipulation' }}
                  >
                    <X size={20} />
                  </button>
                </div>

                <textarea
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  placeholder="Share your learning journey, achievements, or thoughts..."
                  className="w-full min-h-[180px] md:min-h-[200px] p-4 bg-purple-950/50 border-2 border-purple-500/30 rounded-2xl text-white placeholder-purple-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 mb-4 resize-none text-sm md:text-base"
                />

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      if (groups.length > 0) {
                        handleCreatePost(groups[0].id);
                      } else {
                        alert('Please select a group first');
                      }
                    }}
                    className="flex-1 px-6 py-3 md:py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-bold hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-h-[48px]"
                    disabled={!newPost.trim()}
                    style={{ touchAction: 'manipulation' }}
                  >
                    <Send size={20} />
                    Publish Post
                  </button>
                  <button
                    onClick={() => {
                      setNewPost('');
                      setShowPostModal(false);
                    }}
                    className="px-6 py-3 md:py-4 bg-purple-800/50 border-2 border-purple-500/50 rounded-xl font-bold hover:bg-purple-700/50 active:bg-purple-600/50 transition-all min-h-[48px]"
                    style={{ touchAction: 'manipulation' }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        
        {selectedFriend && (
          <div
            onClick={() => setSelectedFriend(null)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-end md:items-center justify-center z-[1000] p-0 md:p-4"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="modal-content-white bg-gradient-to-br from-purple-900 to-indigo-900 backdrop-blur-xl rounded-3xl w-full max-w-5xl border-2 border-purple-500/50 shadow-2xl my-4"
            >
              <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 p-6 md:p-12 text-center relative overflow-hidden z-10">
                <button
                  onClick={() => setSelectedFriend(null)}
                  className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/20 hover:bg-red-500 active:bg-red-600 text-white transition-all flex items-center justify-center z-20 min-h-[48px]"
                  style={{ touchAction: 'manipulation' }}
                >
                  <X size={24} />
                </button>

                <div className="absolute -top-20 -right-20 text-[150px] md:text-[200px] opacity-10">{selectedFriend.mood}</div>
                
                <div className="relative z-10">
                  <div className="relative inline-block mb-4">
                    <img
                      src={selectedFriend.avatar}
                      alt={selectedFriend.name}
                      className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white"
                    />
                    {selectedFriend.isOnline && (
                      <div className="absolute bottom-2 right-2 w-6 h-6 md:w-8 md:h-8 bg-green-500 rounded-full border-4 border-white animate-pulse" />
                    )}
                    <div className="absolute -top-4 -left-4 text-4xl md:text-5xl">{selectedFriend.mood}</div>
                  </div>

                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">{selectedFriend.name}</h2>
                  <p className="text-purple-200 text-base md:text-lg mb-2">{selectedFriend.username}</p>
                  <p className="text-purple-100 italic mt-2 text-sm md:text-base">"{selectedFriend.bio}"</p>
                  
                  <div 
                    className="inline-block mt-4 px-4 md:px-6 py-2 rounded-full text-sm font-bold text-white"
                    style={{ background: LEAGUES[selectedFriend.league]?.gradient || LEAGUES.BRONZE.gradient }}
                  >
                    {LEAGUES[selectedFriend.league]?.name || 'Bronze'} League
                  </div>
                </div>
              </div>

              
              <div className="p-4 md:p-8">
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
                  <div className="bg-purple-950/40 p-3 md:p-4 rounded-xl text-center border border-purple-700/30">
                    <div className="text-2xl md:text-3xl font-bold text-yellow-400 mb-1">{selectedFriend.totalXP}</div>
                    <div className="text-xs text-purple-300">Total XP</div>
                  </div>
                  <div className="bg-purple-950/40 p-3 md:p-4 rounded-xl text-center border border-purple-700/30">
                    <div className="text-2xl md:text-3xl font-bold text-orange-400 mb-1 flex items-center justify-center gap-1">
                      <Flame size={20} />
                      {selectedFriend.streak}
                    </div>
                    <div className="text-xs text-purple-300">Day Streak</div>
                  </div>
                  <div className="bg-purple-950/40 p-3 md:p-4 rounded-xl text-center border border-purple-700/30">
                    <div className="text-2xl md:text-3xl font-bold text-pink-400 mb-1 flex items-center justify-center gap-1">
                      <Crown size={20} />
                      {selectedFriend.crowns}
                    </div>
                    <div className="text-xs text-purple-300">Crowns</div>
                  </div>
                  <div className="bg-purple-950/40 p-3 md:p-4 rounded-xl text-center border border-purple-700/30">
                    <div className="text-2xl md:text-3xl font-bold text-green-400 mb-1">#{selectedFriend.rank}</div>
                    <div className="text-xs text-purple-300">Global Rank</div>
                  </div>
                </div>

                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button 
                    className="px-6 py-3 md:py-4 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl font-bold hover:scale-105 active:scale-95 transition-transform flex items-center justify-center gap-2 text-white min-h-[48px]"
                    style={{ touchAction: 'manipulation' }}
                    onClick={() => alert('Messaging feature')}
                  >
                    <MessageCircle size={20} />
                    Send Message
                  </button>
                  

<button 
  className="px-6 py-3 md:py-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl font-bold hover:scale-105 active:scale-95 transition-transform flex items-center justify-center gap-2 text-white min-h-[48px]"
  style={{ touchAction: 'manipulation' }}
  onClick={() => {
    setSelectedFriendForInvite(selectedFriend);
    setShowGroupInviteModal(true);
  }}
>
  <Users size={20} />
  Invite to Group
</button>


                  <button 
                    className="px-6 py-3 md:py-4 bg-purple-800/50 border-2 border-purple-500/50 rounded-xl font-bold hover:bg-purple-700/50 active:bg-purple-600/50 transition-all flex items-center justify-center gap-2 text-white min-h-[48px]"
                    style={{ touchAction: 'manipulation' }}
                    onClick={() => alert('Share profile feature')}
                  >
                    <Share2 size={20} />
                    Share Profile
                  </button>
                  <button 
                    className="px-6 py-3 md:py-4 bg-red-500/20 border-2 border-red-500/50 rounded-xl font-bold hover:bg-red-500/30 active:bg-red-500/40 transition-all flex items-center justify-center gap-2 text-red-400 min-h-[48px]"
                    style={{ touchAction: 'manipulation' }}
                    onClick={() => handleRemoveFriend(selectedFriend.id)}
                  >
                    <UserMinus size={20} />
                    Unfriend
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}





{showFriendSearchModal && (
  <div
    onClick={handleCloseFriendSearch}
    className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-end md:items-center justify-center z-[1000] p-0 md:p-4"
  >
    <div
      onClick={(e) => e.stopPropagation()}
      className="modal-content-white bg-gradient-to-br from-purple-900 to-indigo-900 backdrop-blur-xl rounded-3xl w-full max-w-5xl border-2 border-purple-500/50 shadow-2xl my-4"
    >
      <div className="p-6 md:p-8">
        
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-transparent">
            Find Friends
          </h3>
          <button
            onClick={handleCloseFriendSearch}
            className="w-12 h-12 rounded-full bg-red-500/20 hover:bg-red-500 active:bg-red-600 text-red-400 hover:text-white transition-all flex items-center justify-center min-h-[48px]"
            style={{ touchAction: 'manipulation' }}
          >
            <X size={20} />
          </button>
        </div>

      
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name or username..."
              value={friendSearchQuery}
              onChange={(e) => {
                setFriendSearchQuery(e.target.value);
                handleSearchUsers(e.target.value);
              }}
              className="w-full pl-12 pr-4 py-4 bg-purple-950/70 border-2 border-purple-500/30 rounded-xl text-white placeholder-purple-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20"
              autoFocus
            />
          </div>
          <p className="text-xs text-purple-400 mt-2">
            Type at least 2 characters to search
          </p>
        </div>

        
        <div className="space-y-3">
          {searchingUsers ? (
            <div className="text-center py-8">
              <Loader className="w-10 h-10 text-purple-400 animate-spin mx-auto mb-3" />
              <p className="text-purple-200">Searching users...</p>
            </div>
          ) : friendSearchQuery.length < 2 ? (
            <div className="text-center py-8">
              <Search className="w-16 h-16 text-purple-400/50 mx-auto mb-3" />
              <p className="text-purple-300">Start typing to find friends</p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-16 h-16 text-purple-400/50 mx-auto mb-3" />
              <p className="text-purple-300">No users found</p>
              <p className="text-sm text-purple-400 mt-1">Try a different search term</p>
            </div>
          ) : (
            searchResults.map(user => (
              <div
                key={user.id}
                className="flex items-center gap-4 p-4 bg-purple-950/50 rounded-xl border border-purple-700/30 hover:border-purple-500/50 transition-all"
              >
                <div className="relative flex-shrink-0">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-16 h-16 rounded-full border-2 border-purple-500/50"
                  />
                  {user.isOnline && (
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-purple-900" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-lg text-white truncate">{user.name}</h4>
                  <p className="text-sm text-purple-300 truncate">{user.username}</p>
                  <p className="text-xs text-purple-400 mt-1 truncate">{user.bio}</p>
                  
                  <div className="flex gap-2 mt-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      user.league === 'DIAMOND' ? 'bg-blue-400/20 text-blue-300' :
                      user.league === 'PLATINUM' ? 'bg-gray-300/20 text-gray-200' :
                      user.league === 'GOLD' ? 'bg-yellow-500/20 text-yellow-400' :
                      user.league === 'SILVER' ? 'bg-gray-400/20 text-gray-300' :
                      'bg-orange-500/20 text-orange-400'
                    }`}>
                      {user.league}
                    </span>
                    <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs font-bold flex items-center gap-1">
                      <Trophy size={12} />
                      {user.stats.totalXP} XP
                    </span>
                    <span className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs font-bold flex items-center gap-1">
                      <Flame size={12} />
                      {user.stats.streak}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    handleSendFriendRequest(user.id);
                    handleCloseFriendSearch();
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-bold hover:scale-105 active:scale-95 transition-transform flex items-center gap-2 min-h-[44px] text-sm flex-shrink-0"
                  style={{ touchAction: 'manipulation' }}
                >
                  <UserPlus size={16} />
                  Add
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  </div>
)}

{/* Discover People Modal */}
{/* Discover People Modal */}
{/* Discover People Modal */}
{showDiscoverModal && (
  <div className="fixed inset-0 z-[1000] bg-gradient-to-br from-purple-950 via-purple-900 to-indigo-950">
    {/* Full-Screen Content Container */}
    <div className="w-full h-full overflow-y-auto">
      {/* Header - Sticky at top */}
      <div className="sticky top-0 z-10 bg-gradient-to-r from-purple-900/95 via-purple-800/95 to-indigo-900/95 backdrop-blur-lg border-b border-purple-500/30 shadow-lg">
        <div className="max-w-7xl mx-auto p-6 md:p-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-transparent">
                🌟 Discover People
              </h3>
              <p className="text-purple-300 text-sm mt-1">
                Connect with {allUsers.length} amazing learners
              </p>
            </div>
            <button
              onClick={() => setShowDiscoverModal(false)}
              className="w-14 h-14 rounded-full bg-red-500/20 hover:bg-red-500 active:bg-red-600 text-red-400 hover:text-white transition-all flex items-center justify-center shadow-lg"
              style={{ touchAction: 'manipulation' }}
            >
              <X size={24} />
            </button>
          </div>

          {/* Filters */}
          <div className="flex gap-3 flex-wrap">
            <select
              value={discoverFilters.league}
              onChange={(e) => setDiscoverFilters({ ...discoverFilters, league: e.target.value })}
              className="px-4 py-3 bg-purple-950/70 border-2 border-purple-500/30 rounded-xl text-white text-sm font-semibold focus:outline-none focus:border-purple-400 backdrop-blur-sm"
            >
              <option value="ALL">All Leagues</option>
              <option value="BRONZE">Bronze</option>
              <option value="SILVER">Silver</option>
              <option value="GOLD">Gold</option>
              <option value="PLATINUM">Platinum</option>
              <option value="DIAMOND">Diamond</option>
            </select>

            <select
              value={discoverFilters.sortBy}
              onChange={(e) => setDiscoverFilters({ ...discoverFilters, sortBy: e.target.value })}
              className="px-4 py-3 bg-purple-950/70 border-2 border-purple-500/30 rounded-xl text-white text-sm font-semibold focus:outline-none focus:border-purple-400 backdrop-blur-sm"
            >
              <option value="xp">Highest XP</option>
              <option value="streak">Longest Streak</option>
              <option value="recent">Recently Joined</option>
            </select>

            <button
              onClick={handleLoadAllUsers}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg transition-all hover:scale-105"
              style={{ touchAction: 'manipulation' }}
            >
              <Loader className={loadingAllUsers ? 'animate-spin' : ''} size={16} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Users Grid - Scrollable Content */}
      {/* Users Grid - Scrollable Content */}
<div className="max-w-7xl mx-auto p-6 md:p-8">
  {loadingAllUsers && allUsers.length === 0 ? (
    <div className="text-center py-20">
      <Loader className="w-16 h-16 text-purple-400 animate-spin mx-auto mb-4" />
      <p className="text-purple-200 text-xl">Loading users...</p>
    </div>
  ) : allUsers.length === 0 ? (
    <div className="text-center py-20">
      <Users className="w-20 h-20 text-purple-400/50 mx-auto mb-4" />
      <p className="text-purple-300 text-xl">No users found</p>
    </div>
  ) : (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {allUsers
          .filter(user => 
            discoverFilters.league === 'ALL' || user.league === discoverFilters.league
          )
          .map(user => (
            <div
              key={user.id}
              className="bg-gradient-to-br from-purple-900/60 to-indigo-900/60 backdrop-blur-sm p-5 rounded-2xl border-2 border-purple-500/30 hover:border-purple-400/50 transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-500/20"
            >
              {/* User Card */}
              <div className="flex items-center gap-3 mb-4">
                <div className="relative">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-16 h-16 rounded-full border-2 border-purple-500/50"
                  />
                  {user.isOnline && (
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-purple-900 animate-pulse" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-white truncate text-lg">{user.name}</h4>
                  <p className="text-sm text-purple-300 truncate">{user.username}</p>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                    user.league === 'GOLD' ? 'bg-yellow-500/20 text-yellow-400' :
                    user.league === 'SILVER' ? 'bg-gray-400/20 text-gray-300' :
                    user.league === 'DIAMOND' ? 'bg-blue-400/20 text-blue-300' :
                    user.league === 'PLATINUM' ? 'bg-gray-300/20 text-gray-200' :
                    'bg-orange-500/20 text-orange-400'
                  }`}>
                    {user.league || 'Bronze'}
                  </span>
                </div>
              </div>

              <p className="text-xs text-purple-200 mb-4 line-clamp-2 italic min-h-[32px]">"{user.bio || 'No bio yet'}"</p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 mb-4 p-3 bg-purple-950/40 rounded-xl">
                <div className="text-center">
                  <div className="text-lg font-bold text-yellow-400">{user.stats?.totalXP || 0}</div>
                  <div className="text-xs text-purple-300">XP</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-400 flex items-center justify-center gap-1">
                    <Flame size={14} />
                    {user.stats?.streak || 0}
                  </div>
                  <div className="text-xs text-purple-300">Streak</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-pink-400">{user.stats?.friendsCount || 0}</div>
                  <div className="text-xs text-purple-300">Friends</div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={async () => {
                  if (sentRequestIds.includes(user.id)) {
                    alert('Friend request already sent to this user!');
                    return;
                  }
                  
                  try {
                    await handleSendFriendRequest(user.id);
                    setSentRequestIds(prev => [...prev, user.id]);
                    setTimeout(() => {
                      setAllUsers(prev => prev.filter(u => u.id !== user.id));
                    }, 1000);
                  } catch (error) {
                    console.error('Failed to send friend request:', error);
                    alert('Failed to send friend request. Please try again.');
                  }
                }}
                disabled={sentRequestIds.includes(user.id)}
                className={`w-full px-4 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-sm shadow-lg ${
                  sentRequestIds.includes(user.id)
                    ? 'bg-green-600/50 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:scale-105'
                }`}
                style={{ touchAction: 'manipulation' }}
              >
                {sentRequestIds.includes(user.id) ? (
                  <>
                    <CheckCircle size={16} />
                    Request Sent ✓
                  </>
                ) : (
                  <>
                    <UserPlus size={16} />
                    Add Friend
                  </>
                )}
              </button>
            </div>
          ))}
      </div>

      {/* ✅ REDDIT-STYLE LOAD MORE BUTTON */}
      {hasMoreUsers && (
        <div className="flex flex-col items-center mt-8 gap-4">
          <button
            onClick={() => handleLoadAllUsers(true)}
            disabled={loadingAllUsers}
            className="px-10 py-4 bg-gradient-to-r from-purple-600 to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold hover:scale-105 transition-all flex items-center gap-3 shadow-lg text-lg"
            style={{ touchAction: 'manipulation' }}
          >
            {loadingAllUsers ? (
              <>
                <Loader className="w-6 h-6 animate-spin" />
                Loading more users...
              </>
            ) : (
              <>
                <ChevronRight className="w-6 h-6" />
                Load More Users
                <ChevronRight className="w-6 h-6" />
              </>
            )}
          </button>
          
          {/* User count indicator */}
          <p className="text-purple-300 text-sm">
            Showing {allUsers.filter(user => 
              discoverFilters.league === 'ALL' || user.league === discoverFilters.league
            ).length} users
          </p>
        </div>
      )}

      {/* End of results message */}
      {!hasMoreUsers && allUsers.length > 0 && (
        <div className="text-center mt-8 py-6 bg-purple-950/30 rounded-xl border border-purple-700/30">
          <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
          <p className="text-purple-200 font-semibold">You've seen all available users!</p>
          <p className="text-purple-400 text-sm mt-1">Check back later for new members</p>
        </div>
      )}
    </>
  )}
  </div>
    </div>
  </div>


)}


  




{/* Challenge Modal */}
{showChallengeModal && selectedChallengeUser && (
  <div
    onClick={() => setShowChallengeModal(false)}
    className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-end md:items-center justify-center z-[1000] p-0 md:p-4"
  >
    <div
      onClick={(e) => e.stopPropagation()}
      className="modal-content-white bg-gradient-to-br from-purple-900 to-indigo-900 backdrop-blur-xl rounded-3xl w-full max-w-5xl border-2 border-purple-500/50 shadow-2xl my-4"
    >
      <div className="p-6 md:p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-transparent">
              Challenge Friend
            </h3>
            <p className="text-purple-300 text-sm mt-1">
              Challenge <strong>{selectedChallengeUser.name}</strong> to compete!
            </p>
          </div>
          <button
            onClick={() => setShowChallengeModal(false)}
            className="w-12 h-12 rounded-full bg-red-500/20 hover:bg-red-500 active:bg-red-600 text-red-400 hover:text-white transition-all flex items-center justify-center min-h-[48px]"
            style={{ touchAction: 'manipulation' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Challenge Templates */}
        <div className="space-y-4">
          <h4 className="text-lg font-bold text-purple-100 mb-3">Choose a Challenge:</h4>
          
          {loadingChallengeTemplates ? (
            <div className="text-center py-8">
              <Loader className="w-10 h-10 text-purple-400 animate-spin mx-auto mb-3" />
              <p className="text-purple-200">Loading challenges...</p>
            </div>
          ) : challengeTemplates.length === 0 ? (
            <p className="text-center text-purple-300 py-8">No challenge templates available</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {challengeTemplates.map((template) => (
                <div
                  key={template.id}
                  onClick={() => setSelectedChallengeTemplate(template)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedChallengeTemplate?.id === template.id
                      ? 'border-purple-400 bg-purple-800/50'
                      : 'border-purple-700/30 bg-purple-950/30 hover:border-purple-500/50'
                  }`}
                  style={{ touchAction: 'manipulation' }}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">{template.icon}</div>
                    <div className="flex-1">
                      <h5 className="font-bold text-white mb-1">{template.title}</h5>
                      <p className="text-sm text-purple-300 mb-2">{template.description}</p>
                      <div className="flex gap-2 flex-wrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          template.difficulty === 'EASY' ? 'bg-green-500/20 text-green-400' :
                          template.difficulty === 'HARD' ? 'bg-red-500/20 text-red-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {template.difficulty}
                        </span>
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-bold">
                          {template.duration} days
                        </span>
                        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-bold">
                          +{template.reward.xp} XP
                        </span>
                      </div>
                    </div>
                    {selectedChallengeTemplate?.id === template.id && (
                      <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Send Button */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSendChallenge}
            disabled={!selectedChallengeTemplate}
            className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-bold hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-h-[48px]"
            style={{ touchAction: 'manipulation' }}
          >
            <Trophy size={20} />
            Send Challenge
          </button>
          <button
            onClick={() => setShowChallengeModal(false)}
            className="px-6 py-4 bg-purple-800/50 border-2 border-purple-500/50 rounded-xl font-bold hover:bg-purple-700/50 active:bg-purple-600/50 transition-all min-h-[48px]"
            style={{ touchAction: 'manipulation' }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
)}

{showCreateGroupModal && (
  <div
    onClick={() => !creatingGroup && setShowCreateGroupModal(false)}
    className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-end md:items-center justify-center z-[1000] p-0 md:p-4"
  >
    <div
      onClick={(e) => e.stopPropagation()}
      className="modal-content-white bg-gradient-to-br from-purple-900 to-indigo-900 backdrop-blur-xl rounded-3xl w-full max-w-5xl border-2 border-purple-500/50 shadow-2xl my-4"
    >
      <div className="p-6 md:p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-transparent">
            Create New Group
          </h3>
          <button
            onClick={() => !creatingGroup && setShowCreateGroupModal(false)}
            disabled={creatingGroup}
            className="w-12 h-12 rounded-full bg-red-500/20 hover:bg-red-500 active:bg-red-600 text-red-400 hover:text-white transition-all flex items-center justify-center min-h-[48px] disabled:opacity-50"
            style={{ touchAction: 'manipulation' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Group Name */}
          <div>
            <label className="block text-sm font-semibold text-purple-200 mb-2">
              Group Name *
            </label>
            <input
              type="text"
              value={newGroupData.name}
              onChange={(e) => setNewGroupData({ ...newGroupData, name: e.target.value })}
              placeholder="e.g., Communication Masters"
              className="w-full px-4 py-3 bg-purple-950/50 border-2 border-purple-500/30 rounded-xl text-white placeholder-purple-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20"
              maxLength={50}
              disabled={creatingGroup}
            />
            <p className="text-xs text-purple-400 mt-1">{newGroupData.name.length}/50</p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-purple-200 mb-2">
              Description *
            </label>
            <textarea
              value={newGroupData.description}
              onChange={(e) => setNewGroupData({ ...newGroupData, description: e.target.value })}
              placeholder="What is this group about?"
              className="w-full px-4 py-3 bg-purple-950/50 border-2 border-purple-500/30 rounded-xl text-white placeholder-purple-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 resize-none"
              rows={4}
              maxLength={200}
              disabled={creatingGroup}
            />
            <p className="text-xs text-purple-400 mt-1">{newGroupData.description.length}/200</p>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-purple-200 mb-2">
              Category
            </label>
            <select
              value={newGroupData.category}
              onChange={(e) => setNewGroupData({ ...newGroupData, category: e.target.value })}
              className="w-full px-4 py-3 bg-purple-950/50 border-2 border-purple-500/30 rounded-xl text-white focus:outline-none focus:border-purple-400 cursor-pointer"
              disabled={creatingGroup}
            >
              <option value="Learning">Learning</option>
              <option value="Communication">Communication</option>
              <option value="Social Skills">Social Skills</option>
              <option value="Career">Career</option>
              <option value="Hobbies">Hobbies</option>
              <option value="Support">Support</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Icon Selector */}
          <div>
            <label className="block text-sm font-semibold text-purple-200 mb-2">
              Group Icon
            </label>
            <div className="grid grid-cols-6 md:grid-cols-8 gap-2">
              {['📚', '🎯', '💬', '🚀', '🎨', '💡', '🎓', '🌟', '⚡', '🔥', '💪', '🧠', '👥', '🎵', '🎮', '⚽'].map(icon => (
                <button
                  key={icon}
                  onClick={() => setNewGroupData({ ...newGroupData, icon })}
                  className={`text-3xl p-3 rounded-xl transition-all ${
                    newGroupData.icon === icon
                      ? 'bg-purple-600 scale-110'
                      : 'bg-purple-950/50 hover:bg-purple-800/50'
                  }`}
                  disabled={creatingGroup}
                  style={{ touchAction: 'manipulation' }}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleCreateGroup}
            disabled={creatingGroup || !newGroupData.name.trim() || !newGroupData.description.trim()}
            className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-bold hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-h-[48px]"
            style={{ touchAction: 'manipulation' }}
          >
            {creatingGroup ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus size={20} />
                Create Group
              </>
            )}
          </button>
          <button
            onClick={() => {
              setNewGroupData({
                name: '',
                description: '',
                category: 'Learning',
                icon: '📚'
              });
              setShowCreateGroupModal(false);
            }}
            disabled={creatingGroup}
            className="px-6 py-4 bg-purple-800/50 border-2 border-purple-500/50 rounded-xl font-bold hover:bg-purple-700/50 active:bg-purple-600/50 transition-all min-h-[48px] disabled:opacity-50"
            style={{ touchAction: 'manipulation' }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
)}

{/* Group Invite Modal */}
{showGroupInviteModal && selectedFriendForInvite && (
  <div
    onClick={() => setShowGroupInviteModal(false)}
    className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-end md:items-center justify-center z-[1000] p-0 md:p-4"
  >
    <div
      onClick={(e) => e.stopPropagation()}
      className="modal-content-white bg-gradient-to-br from-purple-900 to-indigo-900 backdrop-blur-xl rounded-3xl w-full max-w-5xl border-2 border-purple-500/50 shadow-2xl my-4"
    >
      <div className="p-6 md:p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-transparent">
              Invite to Group
            </h3>
            <p className="text-purple-300 text-sm mt-1">
              Invite <strong>{selectedFriendForInvite.name}</strong> to a group
            </p>
          </div>
          <button
            onClick={() => setShowGroupInviteModal(false)}
            className="w-12 h-12 rounded-full bg-red-500/20 hover:bg-red-500 active:bg-red-600 text-red-400 hover:text-white transition-all flex items-center justify-center min-h-[48px]"
            style={{ touchAction: 'manipulation' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Groups List */}
        <div className="space-y-3">
          {groups.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-16 h-16 text-purple-400/50 mx-auto mb-3" />
              <p className="text-purple-300">You haven't created any groups yet</p>
              <button
                onClick={() => {
                  setShowGroupInviteModal(false);
                  setShowCreateGroupModal(true);
                }}
                className="mt-4 px-4 py-2 bg-purple-600 rounded-lg text-sm font-bold hover:bg-purple-500 transition-colors"
              >
                Create Your First Group
              </button>
            </div>
          ) : (
            groups.map(group => (
              <div
                key={group.id}
                className="flex items-center gap-4 p-4 bg-purple-950/50 rounded-xl border border-purple-700/30 hover:border-purple-500/50 transition-all"
              >
                <div className="text-4xl">{group.icon}</div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-white truncate">{group.name}</h4>
                  <p className="text-sm text-purple-300 truncate">{group.description}</p>
                  <span className="text-xs text-purple-400">{group.members} members</span>
                </div>
                <button
                  onClick={() => handleInviteFriendToGroup(selectedFriendForInvite.id, group.id)}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-bold hover:scale-105 active:scale-95 transition-transform flex items-center gap-2 text-sm flex-shrink-0"
                  style={{ touchAction: 'manipulation' }}
                >
                  <UserPlus size={16} />
                  Invite
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  </div>
)}

{/* Group Detail Modal */}
{selectedGroup && (
  <div
    onClick={handleCloseGroupDetail}
    className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center z-[1000] p-0 md:p-4 overflow-y-auto"
  >
    <div
      onClick={(e) => e.stopPropagation()}
      className="modal-content-white bg-gradient-to-br from-purple-900 to-indigo-900 backdrop-blur-xl rounded-3xl w-full max-w-5xl border-2 border-purple-500/50 shadow-2xl my-4"
    >
      {/* Group Header */}
      <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 p-6 md:p-8 relative overflow-hidden z-10 rounded-t-3xl">
        <button
          onClick={handleCloseGroupDetail}
          className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/20 hover:bg-red-500 text-white transition-all flex items-center justify-center"
        >
          <X size={24} />
        </button>
        
        <div className="flex items-center gap-4">
          <div className="text-6xl">{selectedGroup.icon}</div>
          <div className="flex-1">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">{selectedGroup.name}</h2>
            <p className="text-purple-100 mb-3">{selectedGroup.description}</p>
            <div className="flex gap-4 text-sm">
              <span className="text-white/90 flex items-center gap-2">
                <Users size={16} />
                {selectedGroup.members} members
              </span>
              <span className="text-green-300 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse" />
                {selectedGroup.activeNow} online
              </span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-white/90 font-semibold">
                {selectedGroup.category}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Group Content */}
      <div className="p-6 md:p-8 max-h-[70vh] overflow-y-auto">
        {/* Create Post Section */}
        <div className="mb-6">
          <button
            onClick={() => setShowPostTemplateSelector(!showPostTemplateSelector)}
            className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-bold hover:scale-105 transition-transform flex items-center justify-center gap-2"
          >
            <Plus size={20} />
            Share Your Experience
          </button>
          
          {/* Post Template Selector */}
          {showPostTemplateSelector && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              {POST_TEMPLATES.map(template => (
                <button
                  key={template.type}
                  onClick={() => handleSelectPostTemplate(template)}
                  className={`p-4 rounded-xl border-2 border-purple-500/30 hover:border-purple-400 transition-all text-left bg-gradient-to-r ${template.color} bg-opacity-10`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">{template.icon}</span>
                    <h4 className="font-bold text-white text-lg">{template.title}</h4>
                  </div>
                  <p className="text-sm text-purple-200">{template.fields.length} fields to fill</p>
                </button>
              ))}
            </div>
          )}
          
          {/* Post Creation Form */}
          {selectedPostTemplate && (
            <div className="mt-4 p-6 bg-purple-950/50 rounded-xl border-2 border-purple-500/30">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{selectedPostTemplate.icon}</span>
                  <h3 className="text-xl font-bold text-white">{selectedPostTemplate.title}</h3>
                </div>
                <button
                  onClick={() => {
                    setSelectedPostTemplate(null);
                    setNewPostData({ type: 'PRACTICE_REPORT', content: {} });
                  }}
                  className="text-purple-400 hover:text-red-400"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                {selectedPostTemplate.fields.map(field => (
                  <div key={field.name}>
                    <label className="block text-sm font-semibold text-purple-200 mb-2">
                      {field.label}
                    </label>
                    {field.type === 'textarea' ? (
                      <textarea
                        value={newPostData.content[field.name] || ''}
                        onChange={(e) => setNewPostData({
                          ...newPostData,
                          content: { ...newPostData.content, [field.name]: e.target.value }
                        })}
                        placeholder={field.placeholder}
                        className="w-full px-4 py-3 bg-purple-900/50 border-2 border-purple-500/30 rounded-xl text-white placeholder-purple-400 focus:outline-none focus:border-purple-400 resize-none"
                        rows={3}
                      />
                    ) : (
                      <input
                        type="text"
                        value={newPostData.content[field.name] || ''}
                        onChange={(e) => setNewPostData({
                          ...newPostData,
                          content: { ...newPostData.content, [field.name]: e.target.value }
                        })}
                        placeholder={field.placeholder}
                        className="w-full px-4 py-3 bg-purple-900/50 border-2 border-purple-500/30 rounded-xl text-white placeholder-purple-400 focus:outline-none focus:border-purple-400"
                      />
                    )}
                  </div>
                ))}
              </div>
              
              <button
                onClick={handleCreateStructuredPost}
                className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl font-bold hover:scale-105 transition-transform"
              >
                Post to Group
              </button>
            </div>
          )}
        </div>

        {/* Posts Feed */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-purple-100 flex items-center gap-2">
            <MessageCircle size={20} />
            Group Feed
          </h3>
          
          {loadingGroupPosts ? (
            <div className="text-center py-12">
              <Loader className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
              <p className="text-purple-200">Loading posts...</p>
            </div>
          ) : groupPosts.length === 0 ? (
            <EmptyState 
              icon={MessageCircle}
              title="No Posts Yet"
              description="Be the first to share your experience in this group!"
            />
          ) : (
            groupPosts.map(post => (
              <div key={post.id} className="p-4 md:p-6 bg-purple-950/30 rounded-xl border border-purple-700/30">
                {/* Post Header */}
                <div className="flex gap-3 mb-4">
                  <img 
                    src={post.user?.avatar || post.author?.avatar} 
                    alt={post.user?.name || post.author?.name}
                    className="w-12 h-12 rounded-full border-2 border-purple-500/50"
                  />
                  <div className="flex-1">
                    <h4 className="font-bold text-white">{post.user?.name || post.author?.name}</h4>
                    <span className="text-xs text-purple-400">
                      {post.createdAt ? new Date(post.createdAt.seconds * 1000).toLocaleString() : 'Just now'}
                    </span>
                  </div>
                  {post.template && (
                    <span className={`px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${post.template.color} text-white`}>
                      {post.template.icon} {post.template.title}
                    </span>
                  )}
                </div>

                {/* Post Content */}
                {post.type === 'STRUCTURED' && post.structuredContent ? (
                  <div className="space-y-3 mb-4">
                    {Object.entries(post.structuredContent).map(([key, value]) => {
                      const field = post.template?.fields.find(f => f.name === key);
                      return (
                        <div key={key} className="bg-purple-900/30 p-3 rounded-lg">
                          <h5 className="text-sm font-bold text-purple-300 mb-1">
                            {field?.label || key}
                          </h5>
                          <p className="text-white">{value}</p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-white mb-4">{post.content}</p>
                )}

                {/* Reactions */}
                <div className="flex gap-4 mb-3 pb-3 border-b border-purple-700/30">
                  <button
                    onClick={() => handleReactToPost(post.id, 'helpful')}
                    className="flex items-center gap-2 text-sm text-purple-300 hover:text-green-400 transition-colors"
                  >
                    <ThumbsUp size={16} />
                    <span>{post.reactions?.helpful || 0} Helpful</span>
                  </button>
                  <button
                    onClick={() => handleReactToPost(post.id, 'inspiring')}
                    className="flex items-center gap-2 text-sm text-purple-300 hover:text-yellow-400 transition-colors"
                  >
                    <Star size={16} />
                    <span>{post.reactions?.inspiring || 0} Inspiring</span>
                  </button>
                  <button
                    onClick={() => handleReactToPost(post.id, 'relatable')}
                    className="flex items-center gap-2 text-sm text-purple-300 hover:text-blue-400 transition-colors"
                  >
                    <Heart size={16} />
                    <span>{post.reactions?.relatable || 0} Relatable</span>
                  </button>
                </div>

                {/* Comments */}
                <div className="space-y-3">
                  {post.comments && post.comments.length > 0 && (
                    <div className="space-y-2">
                      {post.comments.map((comment, idx) => (
                        <div key={idx} className="flex gap-2 bg-purple-900/20 p-3 rounded-lg">
                          <img 
                            src={comment.user?.avatar} 
                            alt={comment.user?.name}
                            className="w-8 h-8 rounded-full"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-white text-sm">{comment.user?.name}</span>
                              <span className="text-xs text-purple-400">
                                {comment.createdAt ? new Date(comment.createdAt.seconds * 1000).toLocaleTimeString() : 'Just now'}
                              </span>
                            </div>
                            <p className="text-sm text-purple-100">{comment.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Add Comment */}
                  {showCommentInput === post.id ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Write a comment..."
                        className="flex-1 px-4 py-2 bg-purple-900/50 border-2 border-purple-500/30 rounded-xl text-white placeholder-purple-400 focus:outline-none focus:border-purple-400"
                        autoFocus
                      />
                      <button
                        onClick={() => handleAddComment(post.id)}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-xl font-bold"
                      >
                        <Send size={16} />
                      </button>
                      <button
                        onClick={() => {
                          setShowCommentInput(null);
                          setNewComment('');
                        }}
                        className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-xl font-bold"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowCommentInput(post.id)}
                      className="text-sm text-purple-400 hover:text-purple-200 font-semibold"
                    >
                      💬 Add a comment
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  </div>
)}

{showAuthModal && !isAuthChecking && (
  <AuthModal
    onClose={() => {
      if (!currentUser) {
        alert('Please sign in to continue');
      } else {
        setShowAuthModal(false);
      }
    }}
    onLogin={handleLogin}
    onSignup={handleSignup}
  />
)}

  	

        
        <MobileFloatingButton onClick={() => setShowPostModal(true)} />
      </div>
  </div>

  

  );
}