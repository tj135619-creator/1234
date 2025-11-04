import { useState, useEffect } from "react";
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../../firebase';
import { socialSkillsServices } from './firebase-services';
import GoogleSignIn from '../../../components/auth/GoogleSignIn';
import SocialOnboardingQuiz from './SocialOnboardingQuiz';
import { OnboardingExplanation } from 'src/onboarding/reusableonboarding';
import ReactDOM from 'react-dom';



import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Area,
  AreaChart,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  Award,
  Target,
  Zap,
  Star,
  MessageCircle,
  Users,
  User,
  Heart,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Trophy,
  Flame,
  Calendar,
  BarChart3,
  Activity,
  ArrowUpRight,
} from "lucide-react";

// Icon mapping for traits
const TRAIT_ICONS = {
  Conversation: MessageCircle,
  Listening: Heart,
  Confidence: Zap,
  Networking: Users,
  Empathy: Sparkles
};

// Archetype definitions (static UI data)
const ARCHETYPES = {
  observer: {
    name: 'Observer',
    icon: '👁️',
    color: '#a855f7',
    traits: ['Thoughtful', 'Analytical', 'Cautious']
  },
  connector: {
    name: 'Connector',
    icon: '🤝',
    color: '#c084fc',
    traits: ['Social', 'Engaging', 'Empathetic']
  },
  supporter: {
    name: 'Supporter',
    icon: '💚',
    color: '#9333ea',
    traits: ['Caring', 'Loyal', 'Encouraging']
  },
  influencer: {
    name: 'Influencer',
    icon: '⭐',
    color: '#d946ef',
    traits: ['Charismatic', 'Confident', 'Inspiring']
  }
};

// ============================================================================
// PARTICLE BACKGROUND
// ============================================================================
const ParticleBackground = () => {
  const particles = Array.from({ length: 50 }, (_, i) => ({
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
    <>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
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
    </>
  );
};

// ============================================================================
// CIRCULAR PROGRESS COMPONENT
// ============================================================================
const CircularProgress = ({ value, color, size = 112, strokeWidth = 8, children }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 1.5s ease-out'
          }}
        />
      </svg>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {children}
      </div>
    </div>
  );
};

// ============================================================================
// STYLED COMPONENTS
// ============================================================================
// ---------------- GlassCard ----------------
const GlassCard = ({ children }) => (
  <div style={{
    background: 'rgba(30, 10, 50, 0.3)', // deep purple glass
    backdropFilter: 'blur(16px)',
    border: '2px solid rgba(107, 45, 140, 0.5)', // soft purple-gloss border
    borderRadius: '2rem',
    padding: '2rem',
    boxShadow: '0 10px 40px rgba(107, 45, 140, 0.6)', // glowing purple shadow
    transition: 'all 0.3s ease',
  }}>
    {children}
  </div>
);

// ---------------- BubbleProgress ----------------
const BubbleProgress = ({ trait }) => {
  const Icon = TRAIT_ICONS[trait.trait] || Sparkles;
  const growth = trait.future - trait.current;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
      <CircularProgress value={trait.current} color="#8a3cbc" size={112} strokeWidth={8}>
        <Icon style={{ width: 32, height: 32, color: "#b164ff" }} />
      </CircularProgress>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#e0d7f0', textShadow: '0 0 4px #b164ff', margin: 0 }}>
          {trait.trait}
        </p>
        <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#b164ff', textShadow: '0 0 6px #b164ff', margin: '0.25rem 0' }}>
          {trait.current}%
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
          <ArrowUpRight style={{ width: 16, height: 16, color: '#8a3cbc' }} />
          <span style={{ fontSize: '0.75rem', color: '#8a3cbc', fontWeight: '600' }}>+{growth}%</span>
        </div>
      </div>
    </div>
  );
};

// ---------------- FutureBubbleProgress ----------------
const FutureBubbleProgress = ({ trait }) => {
  const Icon = TRAIT_ICONS[trait.trait] || Sparkles;
  const growth = trait.future - trait.current;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
      <CircularProgress value={trait.future} color="#6b2d8c" size={112} strokeWidth={8}>
        <Icon style={{ width: 32, height: 32, color: "#b164ff" }} />
      </CircularProgress>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#e0d7f0', textShadow: '0 0 4px #b164ff', margin: 0 }}>
          {trait.trait}
        </p>
        <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#b164ff', textShadow: '0 0 6px #b164ff', margin: '0.25rem 0' }}>
          {trait.future}%
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
          <Sparkles style={{ width: 16, height: 16, color: '#8a3cbc' }} />
          <span style={{ fontSize: '0.75rem', color: '#8a3cbc', fontWeight: '600' }}>+{growth}%</span>
        </div>
      </div>
    </div>
  );
};

// ---------------- SkillBubbleBar ----------------
const SkillBubbleBar = ({ skill }) => {
  const percentage = (skill.xp / skill.maxXp) * 100;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#e0d7f0', textShadow: '0 0 3px #b164ff' }}>
          {skill.name}
        </span>
        <span style={{ fontSize: '0.75rem', color: '#a67acc' }}>
          {skill.xp} / {skill.maxXp} XP
        </span>
      </div>
      <div style={{ position: 'relative', height: '1.25rem', background: 'rgba(48, 25, 52, 0.3)', borderRadius: '9999px', overflow: 'hidden', border: '1px solid rgba(107, 45, 140, 0.4)' }}>
        <div
          style={{
            height: '100%',
            width: `${percentage}%`,
            background: `linear-gradient(90deg, ${skill.color}, ${skill.color}bb)`,
            boxShadow: `0 0 15px ${skill.color}`,
            borderRadius: '9999px',
            transition: 'width 1.5s ease-out',
          }}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <span style={{ color: skill.color, fontWeight: 'bold', textShadow: `0 0 4px ${skill.color}` }}>
          Level {skill.level}
        </span>
        <span style={{ color: '#a67acc', fontWeight: '600' }}>
          {Math.round(percentage)}%
        </span>
      </div>
    </div>
  );
};

// ---------------- MiniTrendChart ----------------
const MiniTrendChart = ({ data, color }) => {
  const chartData = data.map((value, index) => ({ name: index, value }));

  return (
    <ResponsiveContainer width="100%" height={50}>
      <AreaChart data={chartData}>
        <defs>
          <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.6} />
            <stop offset="100%" stopColor={color} stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={3}
          fill={`url(#gradient-${color})`}
          animationDuration={1200}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

// ---------------- Confetti ----------------
const Confetti = () => {
  const particles = Array.from({ length: 40 });
  return (
    <>
      <style>{`
        @keyframes fall {
          0% { transform: translateY(-20px) rotate(0deg) scale(0); }
          100% { transform: translateY(100vh) rotate(720deg) scale(1); }
        }
      `}</style>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 50 }}>
        {particles.map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: ['#8a3cbc', '#b164ff', '#9b59b6', '#7d3c98', '#6f2c91'][Math.floor(Math.random() * 5)],
              left: `${Math.random() * 100}%`,
              animation: `fall ${Math.random() * 2 + 2}s linear ${Math.random() * 0.5}s forwards`,
            }}
          />
        ))}
      </div>
    </>
  );
};

// ---------------- StatBubble ----------------
const StatBubble = ({ icon: Icon, value, label, color }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.5rem',
        background: 'rgba(30, 10, 50, 0.35)',
        backdropFilter: 'blur(14px)',
        borderRadius: '1.5rem',
        padding: '1rem',
        border: '2px solid rgba(107, 45, 140, 0.5)',
        minWidth: '100px',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.3s',
        transform: isHovered ? 'scale(1.05)' : 'scale(1)',
        boxShadow: isHovered ? `0 0 20px ${color}` : 'none',
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `${color}30`,
          border: `2px solid ${color}`,
        }}
      >
        <Icon style={{ width: 24, height: 24, color }} />
      </div>
      <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color, textShadow: `0 0 6px ${color}` }}>
        {value}
      </span>
      <span style={{ fontSize: '0.75rem', color: '#b164ff', textAlign: 'center' }}>{label}</span>
    </div>
  );
};


// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function ProfileView() {
  console.log('🎨 ProfileView component rendered');
  const [loading, setLoading] = useState(true);
  const [traits, setTraits] = useState([]);
  const [skills, setSkills] = useState([]);
  const [actions, setActions] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [frequencyData, setFrequencyData] = useState([]);
  const [timelineEvents, setTimelineEvents] = useState([]);

  const [currentArchetype, setCurrentArchetype] = useState("observer");
  const [futureArchetype, setFutureArchetype] = useState("connector");
  const [reflectionMood, setReflectionMood] = useState(null);
  const [reflectionText, setReflectionText] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [hoveredMood, setHoveredMood] = useState(null);
const [user, setUser] = useState(null); // ADD THIS

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

  // Stats from user data
  const [totalXp, setTotalXp] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [totalActions, setTotalActions] = useState(0);
  const [showOnboardingOverlay, setShowOnboardingOverlay] = useState(true)

// Listen for auth state changes
// Listen for auth state changes
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
    console.log('🔄 Auth state changed:', currentUser?.email || 'No user');
    setUser(currentUser);
    setLoading(!currentUser); // Set loading false if no user
  });

  return () => unsubscribe();
}, []);



// Load data when user changes
useEffect(() => {
  if (user?.uid) {
    checkOnboardingStatus();
  }
}, [user]);

// Check if user has completed onboarding
// Check if user has completed onboarding
const checkOnboardingStatus = async () => {
  if (!user?.uid) {
    console.log('❌ No user UID, cannot check onboarding');
    return;
  }
  
  try {
    setCheckingOnboarding(true);
    console.log('🔍 Checking onboarding status for:', user.uid);
    
    const completed = await socialSkillsServices.onboarding.hasCompletedOnboarding(user.uid);
    console.log('📋 Onboarding completed:', completed);
    
    if (!completed) {
      console.log('🎯 Showing onboarding quiz');
      setShowOnboarding(true);
      setLoading(false);
    } else {
      console.log('✅ Onboarding already completed, loading data');
      await loadAllData();
    }
  } catch (error) {
    console.error('❌ Error checking onboarding:', error);
    console.error('Error details:', error.message);
    
    // On error, show onboarding to be safe (better UX than showing empty dashboard)
    setShowOnboarding(true);
    setLoading(false);
  } finally {
    setCheckingOnboarding(false);
    console.log('✅ Onboarding check completed');
  }
};

// Load all user data from Firebase
const loadAllData = async () => {
  console.log('🔍 loadAllData called');
  console.log('👤 User UID:', user?.uid);
  
  if (!user?.uid) {
    console.log('❌ No user UID found, stopping');
    setLoading(false);
    return;
  }

  try {
    setLoading(true);
    console.log('⏳ Loading data from Firebase...');

    const [
      traitsData,
      skillsData,
      actionsData,
      challengesData,
      milestonesData,
      archetypeData,
      frequencyData,
      timelineData
    ] = await Promise.all([
      socialSkillsServices.traits.getTraits(user.uid),
      socialSkillsServices.skills.getSkills(user.uid),
      socialSkillsServices.actions.getActions(user.uid),
      socialSkillsServices.challenges.getChallenges(user.uid),
      socialSkillsServices.milestones.getMilestones(user.uid),
      socialSkillsServices.archetypes.getUserArchetype(user.uid),
      socialSkillsServices.actions.getActionFrequency(user.uid),
      socialSkillsServices.timeline.getTimelineEvents(user.uid)
    ]);

    console.log('📊 Raw Data Received:');
    console.log('  - traitsData:', traitsData);
    console.log('  - skillsData:', skillsData);
    console.log('  - actionsData:', actionsData);
    console.log('  - challengesData:', challengesData);
    console.log('  - milestonesData:', milestonesData);
    console.log('  - archetypeData:', archetypeData);
    console.log('  - frequencyData:', frequencyData);
    console.log('  - timelineData:', timelineData);

    // Convert traits object to array with icon components
    const traitsArray = Object.entries(traitsData)
      .filter(([key]) => key !== 'updatedAt')
      .map(([key, value]) => ({
        trait: key.charAt(0).toUpperCase() + key.slice(1),
        ...value
      }));

    console.log('✅ Processed traitsArray:', traitsArray);

    // Update all state
    setTraits(traitsArray);
    setSkills(skillsData);
    setActions(actionsData);
    setChallenges(challengesData);
    setMilestones(milestonesData);
    setCurrentArchetype(archetypeData.current || 'observer');
    setFutureArchetype(archetypeData.future || 'connector');
    setFrequencyData(frequencyData);
    setTimelineEvents(timelineData);

    console.log('📝 State Updated:');
    console.log('  - traits length:', traitsArray.length);
    console.log('  - skills length:', skillsData.length);
    console.log('  - actions length:', actionsData.length);
    console.log('  - challenges length:', challengesData.length);
    console.log('  - milestones length:', milestonesData.length);

    // Calculate totals from data
    const calculatedTotalXp = skillsData.reduce((sum, skill) => sum + (skill.xp || 0), 0);
    const calculatedStreak = actionsData.length > 0 ? 12 : 0; // You can calculate real streak later
    
    setTotalXp(calculatedTotalXp);
    setTotalActions(actionsData.length);
    setCurrentStreak(calculatedStreak);

    console.log('💯 Calculated Stats:');
    console.log('  - Total XP:', calculatedTotalXp);
    console.log('  - Total Actions:', actionsData.length);
    console.log('  - Current Streak:', calculatedStreak);

  } catch (error) {
    console.error('❌ Error loading data:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    
    // Set empty arrays on error so UI doesn't crash
    setTraits([]);
    setSkills([]);
    setActions([]);
    setChallenges([]);
    setMilestones([]);
    setFrequencyData([]);
    setTimelineEvents([]);
    
    // Set safe defaults for archetypes
    setCurrentArchetype('observer');
    setFutureArchetype('connector');
    
    // Show user-friendly error
    alert('Failed to load your data. Please refresh the page or contact support if the issue persists.');
  } finally {
    setLoading(false);
    console.log('✅ loadAllData completed');
  }
};

const handleChallengeComplete = async (challengeId) => {
  if (!user?.uid) return;
  
  try {
    await socialSkillsServices.challenges.completeChallenge(user.uid, challengeId);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
    
    // Reload challenges
    const updatedChallenges = await socialSkillsServices.challenges.getChallenges(user.uid);
    setChallenges(updatedChallenges);
  } catch (error) {
    console.error('Error completing challenge:', error);
    alert('Failed to complete challenge');
  }
};

const handleReflectionSubmit = async () => {
  if (!user?.uid) return;
  
  if (!reflectionMood) {
    alert('Please select a mood first');
    return;
  }

  try {
    await socialSkillsServices.reflections.createReflection(user.uid, {
      mood: reflectionMood,
      text: reflectionText
    });
    
    alert('Reflection saved!');
    setReflectionMood(null);
    setReflectionText('');
  } catch (error) {
    console.error('Error saving reflection:', error);
    alert('Failed to save reflection');
  }
};

const handleOnboardingComplete = async (profileData) => {
  try {
    setLoading(true);
    await socialSkillsServices.onboarding.saveOnboardingResults(user.uid, profileData);
    setShowOnboarding(false);
    await loadAllData();
    
    // Redirect to dashboard after 5 seconds
    setTimeout(() => {
      window.location.href = '/';
    }, 5000);
  } catch (error) {
    console.error('Error completing onboarding:', error);
    alert('Failed to save your profile. Please try again.');
    setLoading(false);
  }
};

// 1. FIRST: Check if user is logged in
if (!user) {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #1a0a2e, #2e0c4f, #3a0d5c)', 
      color: '#fff', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '2rem' 
    }}>
      <div style={{ 
        textAlign: 'center',
        maxWidth: '400px',
        background: 'rgba(48, 25, 52, 0.3)',
        backdropFilter: 'blur(16px)',
        border: '2px solid rgba(107, 45, 140, 0.5)',
        borderRadius: '2rem',
        padding: '3rem 2rem',
        boxShadow: '0 10px 40px rgba(107, 45, 140, 0.6)',
        transition: 'all 0.3s ease',
      }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem', textShadow: '0 0 10px #b164ff' }}>🔒</div>
        <h2 style={{ 
          fontSize: '1.75rem', 
          color: '#e0d7f0', 
          marginBottom: '0.5rem',
          fontWeight: 'bold',
          textShadow: '0 0 6px #b164ff'
        }}>
          Welcome to Social Growth Journey
        </h2>
        <p style={{ 
          fontSize: '1rem', 
          color: '#b164ff',
          marginBottom: '2rem',
          textShadow: '0 0 4px #8a3cbc'
        }}>
          Sign in to track your social skills transformation
        </p>
        
        {/* Google Sign-In Button */}
        <GoogleSignIn />
      </div>
    </div>
  );
}

// 2. THEN: Check if we're checking onboarding status
if (checkingOnboarding) {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #1a0a2e, #2e0c4f, #3a0d5c)', 
      color: '#fff', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center' 
    }}>
      <div style={{ 
        textAlign: 'center',
        background: 'rgba(48, 25, 52, 0.25)',
        backdropFilter: 'blur(14px)',
        border: '2px solid rgba(107, 45, 140, 0.4)',
        borderRadius: '2rem',
        padding: '2rem',
        boxShadow: '0 8px 32px rgba(107, 45, 140, 0.5)',
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem', textShadow: '0 0 8px #b164ff' }}>🔍</div>
        <p style={{ fontSize: '1.5rem', color: '#b164ff', textShadow: '0 0 4px #8a3cbc' }}>Checking your profile...</p>
      </div>
    </div>
  );
}

// 3. THEN: Show onboarding if needed
if (showOnboarding) {
  return <SocialOnboardingQuiz onComplete={handleOnboardingComplete} />;
}

// 4. THEN: Show loading while data loads
if (loading) {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #1a0a2e, #2e0c4f, #3a0d5c)', 
      color: '#fff', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center' 
    }}>
      <div style={{ 
        textAlign: 'center',
        background: 'rgba(48, 25, 52, 0.25)',
        backdropFilter: 'blur(14px)',
        border: '2px solid rgba(107, 45, 140, 0.4)',
        borderRadius: '2rem',
        padding: '2rem',
        boxShadow: '0 8px 32px rgba(107, 45, 140, 0.5)',
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem', textShadow: '0 0 8px #b164ff' }}>⏳</div>
        <p style={{ fontSize: '1.5rem', color: '#b164ff', textShadow: '0 0 4px #8a3cbc' }}>Loading your journey...</p>
      </div>
    </div>
  );
}

// 5. FINALLY: Show the dashboard
return (
  
 <div style={{ 
    minHeight: '100vh',
    color: '#fff',
    overflowX: 'hidden',
    paddingBottom: '2rem',
    position: 'relative',
    // GLASSY GRADIENT BACKGROUND
    background: 'linear-gradient(135deg, rgba(79, 33, 136, 0.6), rgba(126, 58, 175, 0.5), rgba(72, 25, 95, 0.4))',
    backdropFilter: 'blur(25px)',
    WebkitBackdropFilter: 'blur(25px)', // Safari
    boxShadow: 'inset 0 0 150px rgba(255,255,255,0.05)'
}}>
 
 
    

    <ParticleBackground />
    {showConfetti && <Confetti />}

    {/* Header */}
    <header style={{
      borderBottom: '2px solid rgba(168,85,247,0.2)',
      background: 'rgba(72, 25, 95, 0.45)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      position: 'sticky',
      top: 0,
      zIndex: 40,
      borderRadius: '0 0 1.5rem 1.5rem',
      boxShadow: '0 8px 32px rgba(107,45,140,0.35)',
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '1.5rem', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '1rem', 
        position: 'relative', 
        zIndex: 10 
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            marginBottom: '0.75rem', 
            padding: '0.5rem 1rem', 
            background: 'rgba(126, 58, 175, 0.45)', 
            backdropFilter: 'blur(10px)', 
            WebkitBackdropFilter: 'blur(10px)',
            borderRadius: '9999px', 
            border: '1px solid rgba(168, 85, 247, 0.3)',
            boxShadow: '0 4px 15px rgba(168,85,247,0.35)',
          }}>
            <Sparkles style={{ width: 16, height: 16, color: '#c084fc' }} />
            <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#e0d7f0', textShadow: '0 0 6px #b164ff' }}>
              Social Skills Mastery Platform
            </span>
          </div>
        

          
          
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            background: 'linear-gradient(90deg, #e0d7f0, #b164ff, #f0abfc)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            margin: 0,
            marginBottom: '0.5rem',
            textShadow: '0 0 6px #b164ff',
            
          }}>
            Social Growth Journey
          </h1>
          <p  style={{ fontSize: '0.875rem', color: '#b164ff', margin: '0.25rem 0 0 0', textShadow: '0 0 4px #8a3cbc' }}>
            Track your transformation and unlock your potential
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <StatBubble icon={Flame} value={currentStreak} label="Streak" color="#d946ef" />
          <StatBubble icon={Zap} value={totalXp.toLocaleString()} label="XP" color="#a855f7" />
          <StatBubble icon={Trophy} value={totalActions} label="Actions" color="#c084fc" />
        </div>
      </div>
    </header>

    <div style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '2rem 1rem', 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '2rem', 
      position: 'relative', 
      zIndex: 10 
    }}>
      
      {/* Empty state if no data */}
      {traits.length === 0 && skills.length === 0 && actions.length === 0 && (
        <GlassCard>
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem', textShadow: '0 0 8px #b164ff' }}>🌱</div>
            <h2 style={{ fontSize: '1.5rem', color: '#b164ff', marginBottom: '1rem', textShadow: '0 0 4px #8a3cbc' }}>
              Start Your Journey
            </h2>
            <p style={{ color: '#e0d7f0', marginBottom: '2rem' }}>
              Your social skills profile is empty. Start tracking your progress to see your growth!
            </p>
            <button
              onClick={loadAllData}
              style={{
                padding: '1rem 2rem',
                background: 'linear-gradient(90deg, #a855f7, #c084fc)',
                color: '#fff',
                border: 'none',
                borderRadius: '1rem',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(168,85,247,0.4)',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              Refresh Data
            </button>
          </div>
        </GlassCard>
      )}

      {showOnboardingOverlay && ReactDOM.createPortal(
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fade-in">
    <div className="bg-gradient-to-br from-purple-900/95 to-indigo-900/95 backdrop-blur-xl p-6 md:p-8 rounded-3xl border-2 border-purple-500/50 shadow-2xl max-w-md w-full animate-scale-in">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
          <User className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Welcome to Your Profile! ✨</h2>
        <p className="text-purple-200 text-sm md:text-base">Showcase your journey and track your progress</p>
      </div>
      <div className="space-y-4 mb-6">
        <div className="flex items-start gap-3 p-4 bg-purple-950/50 rounded-xl border border-purple-500/30">
          <Target className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-white text-sm mb-1">Track Your Goals</h3>
            <p className="text-purple-300 text-xs">Monitor your progress and celebrate milestones</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-4 bg-purple-950/50 rounded-xl border border-purple-500/30">
          <Activity className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-white text-sm mb-1">View Your Stats</h3>
            <p className="text-purple-300 text-xs">See your activity, achievements, and growth over time</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-4 bg-purple-950/50 rounded-xl border border-purple-500/30">
          <Star className="w-5 h-5 text-pink-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-white text-sm mb-1">Customize Your Space</h3>
            <p className="text-purple-300 text-xs">Personalize your profile and make it uniquely yours</p>
          </div>
        </div>
      </div>
      <button
        onClick={() => setShowOnboardingOverlay(false)}
        className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl font-bold text-white transition-all shadow-xl"
      >
        Explore My Profile! 🚀
      </button>
    </div>
  </div>,
  document.body
)}


      {/* SECTION 1: CURRENT VS FUTURE SELF */}
      {traits.length > 0 && (
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {/* Current Self */}
          <GlassCard>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#b164ff', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                    <Users style={{ width: 24, height: 24, color: '#b164ff' }} />
                    Current Self
                  </h2>
                  <p style={{ fontSize: '0.875rem', color: '#e0d7f0', margin: '0.25rem 0 0 0' }}>
                    Where you are today
                  </p>
                </div>
                <div style={{ fontSize: '3rem', textShadow: '0 0 8px #b164ff' }}>
                  {ARCHETYPES[currentArchetype]?.icon || '👁️'}
                </div>
              </div>

              <div style={{ background: 'rgba(107, 45, 140, 0.15)', borderRadius: '1.5rem', padding: '1rem', border: '2px solid rgba(107, 45, 140, 0.4)', boxShadow: '0 4px 20px rgba(107,45,140,0.2)' }}>
                <p style={{ fontSize: '0.875rem', lineHeight: '1.6', margin: 0, color: '#e0d7f0' }}>
                  <strong style={{ color: '#b164ff' }}>Personality:</strong>{" "}
                  You're consistent but shy in new groups. You prefer one-on-one conversations and excel at listening.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.75rem' }}>
                  {ARCHETYPES[currentArchetype]?.traits.map((trait) => (
                    <span
                      key={trait}
                      style={{
                        padding: '0.375rem 0.75rem',
                        background: 'rgba(168, 85, 247, 0.3)',
                        color: '#e0d7f0',
                        fontSize: '0.75rem',
                        borderRadius: '9999px',
                        border: '2px solid rgba(168, 85, 247, 0.5)',
                        fontWeight: '600',
                        textShadow: '0 0 3px #b164ff',
                      }}
                    >
                      {trait}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3  id="profileHeader" style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#e0d7f0' }}>
                  <TrendingUp style={{ width: 20, height: 20, color: '#b164ff' }} />
                  Your Skills Today
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '1.5rem' }}>
                  {traits.map((trait, idx) => (
                    <BubbleProgress key={idx} trait={trait} />
                  ))}
                </div>
              </div>

              {traits.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                  <div style={{ background: 'rgba(192, 132, 252, 0.15)', borderRadius: '1rem', padding: '1rem', border: '2px solid rgba(192, 132, 252, 0.4)', boxShadow: '0 4px 15px rgba(192,132,252,0.2)' }}>
                    <Award style={{ width: 24, height: 24, color: '#c084fc', marginBottom: '0.5rem' }} />
                    <p style={{ fontSize: '0.75rem', color: '#e0d7f0', margin: 0 }}>Strongest</p>
                    <p style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#c084fc', marginTop: '0.25rem' }}>
                      {traits.reduce((max, t) => t.current > max.current ? t : max, traits[0])?.trait || 'N/A'}
                    </p>
                    <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#c084fc', margin: 0 }}>
                      {traits.reduce((max, t) => t.current > max.current ? t : max, traits[0])?.current || 0}%
                    </p>
                  </div>
                  <div style={{ background: 'rgba(217, 70, 239, 0.15)', borderRadius: '1rem', padding: '1rem', border: '2px solid rgba(217, 70, 239, 0.4)', boxShadow: '0 4px 15px rgba(217,70,239,0.2)' }}>
                    <Target style={{ width: 24, height: 24, color: '#d946ef', marginBottom: '0.5rem' }} />
                    <p style={{ fontSize: '0.75rem', color: '#e0d7f0', margin: 0 }}>Focus Area</p>
                    <p style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#d946ef', marginTop: '0.25rem' }}>
                      {traits.reduce((min, t) => t.current < min.current ? t : min, traits[0])?.trait || 'N/A'}
                    </p>
                    <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#d946ef', margin: 0 }}>
                      {traits.reduce((min, t) => t.current < min.current ? t : min, traits[0])?.current || 0}%
                    </p>
                  </div>
                </div>
              )}
            </div>
          </GlassCard>
      

            {/* Future Self */}
<GlassCard>
  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#a78bfa', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
          <Sparkles style={{ width: 24, height: 24, color: '#a78bfa' }} />
          Future Self
        </h2>
        <p style={{ fontSize: '0.875rem', color: '#ede9fe', marginTop: '0.25rem', margin: '0.25rem 0 0 0' }}>
          Your transformation
        </p>
      </div>
      <div style={{ fontSize: '3rem' }}>
        {ARCHETYPES[futureArchetype]?.icon || '🤝'}
      </div>
    </div>

    <div style={{ background: 'rgba(167,139,250,0.15)', borderRadius: '1.5rem', padding: '1rem', border: '2px solid rgba(167,139,250,0.4)' }}>
      <p style={{ fontSize: '0.875rem', lineHeight: '1.6', margin: 0, color: '#ede9fe' }}>
        <strong style={{ color: '#a78bfa' }}>Projection:</strong> Based on your streak and XP, you're becoming a natural connector. You'll confidently start conversations and build meaningful relationships.
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.75rem' }}>
        {ARCHETYPES[futureArchetype]?.traits.map((trait) => (
          <span
            key={trait}
            style={{
              padding: '0.375rem 0.75rem',
              background: 'rgba(167,139,250,0.3)',
              color: '#f5f3ff',
              fontSize: '0.75rem',
              borderRadius: '9999px',
              border: '2px solid rgba(167,139,250,0.5)',
              fontWeight: '600',
            }}
          >
            {trait}
          </span>
        ))}
      </div>
    </div>

    <div>
      <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 1.5rem 0', color: '#ede9fe' }}>
        <ArrowRight style={{ width: 20, height: 20, color: '#a78bfa' }} />
        Projected Growth
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '1.5rem' }}>
        {traits.map((trait, idx) => (
          <FutureBubbleProgress key={idx} trait={trait} />
        ))}
      </div>
    </div>

    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <p style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#ede9fe', margin: 0 }}>
        Suggested New Habits
      </p>
      {[
        "Start 1 conversation daily with someone new",
        "Practice assertiveness in groups",
        "Join a social hobby or club",
      ].map((habit, idx) => (
        <div
          key={idx}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.5rem',
            fontSize: '0.875rem',
            background: 'rgba(167,139,250,0.15)',
            padding: '0.75rem',
            borderRadius: '1rem',
            border: '2px solid rgba(167,139,250,0.4)',
            color: '#ede9fe',
          }}
        >
          <CheckCircle style={{ width: 16, height: 16, color: '#a78bfa', marginTop: '0.125rem', flexShrink: 0 }} />
          <span>{habit}</span>
        </div>
      ))}
    </div>
  </div>
</GlassCard>

          </section>
        )}

	{/* SECTION 2: SOCIAL TRAIT PROGRESSION */}
{skills.length > 0 && (
  <section>
    <GlassCard>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#a78bfa', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <Activity style={{ width: 24, height: 24, color: '#a78bfa' }} />
            Skill Progression
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#ede9fe', marginTop: '0.25rem', margin: '0.25rem 0 0 0' }}>
            Track your XP and levels
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {skills.map((skill, idx) => (
            <div
              key={skill.id || idx}
              style={{
                background: 'rgba(167,139,250,0.15)',
                borderRadius: '1.5rem',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                border: '2px solid rgba(167,139,250,0.3)',
                transition: 'border-color 0.3s, transform 0.3s',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(167,139,250,0.6)';
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(167,139,250,0.3)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <SkillBubbleBar skill={skill} />
              {skill.trend && skill.trend.length > 0 && (
                <div>
                  <p style={{ fontSize: '0.75rem', color: '#c4b5fd', marginBottom: '0.5rem', margin: '0 0 0.5rem 0' }}>
                    Weekly Progress
                  </p>
                  <MiniTrendChart data={skill.trend} color={skill.color} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  </section>
)}
	{/* SECTION 3: GROWTH MILESTONES */}
{milestones.length > 0 && (
  <section>
    <GlassCard>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#a78bfa', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <TrendingUp style={{ width: 24, height: 24, color: '#a78bfa' }} />
            Growth Milestones
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#ede9fe', marginTop: '0.25rem', margin: '0.25rem 0 0 0' }}>
            From Beginner to Advanced
          </p>
        </div>

        <div style={{ position: 'relative', padding: '1.5rem 0' }}>
          <div style={{
            position: 'absolute',
            top: '50%',
            left: 0,
            right: 0,
            height: '8px',
            background: 'linear-gradient(90deg, #a78bfa, #c4b5fd, #d8b4fe)',
            borderRadius: '9999px',
            transform: 'translateY(-50%)',
          }} />
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            {milestones.map((milestone) => (
              <div
                key={milestone.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem',
                  zIndex: 10,
                  flex: '1 1 auto',
                  minWidth: '120px',
                }}
              >
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '4px solid',
                    borderColor: milestone.completed ? '#a78bfa' : 'rgba(167,139,250,0.3)',
                    background: milestone.completed ? '#a78bfa' : 'rgba(167,139,250,0.2)',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    boxShadow: milestone.completed ? '0 0 20px rgba(167,139,250,0.5)' : 'none',
                  }}
                >
                  {milestone.completed ? (
                    <CheckCircle style={{ width: 32, height: 32, color: '#5b21b6' }} />
                  ) : (
                    <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'rgba(192, 132, 252, 0.5)' }} />
                  )}
                </div>
                <div style={{
                  textAlign: 'center',
                  background: 'rgba(167,139,250,0.2)',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '1rem',
                  border: '2px solid rgba(167,139,250,0.3)',
                  minWidth: '100px',
                }}>
                  <p style={{ fontSize: '0.75rem', fontWeight: 'bold', margin: 0, color: '#ede9fe' }}>
                    {milestone.name}
                  </p>
                  <p style={{ fontSize: '0.7rem', color: '#c4b5fd', margin: 0 }}>
                    {milestone.date}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '2rem' }}>
          <div style={{ textAlign: 'center', background: 'rgba(167,139,250,0.15)', padding: '1.5rem', borderRadius: '1.5rem', border: '2px solid rgba(167,139,250,0.4)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🌱</div>
            <p style={{ fontSize: '1rem', fontWeight: 'bold', color: '#a78bfa', margin: 0 }}>Beginner</p>
            <p style={{ fontSize: '0.75rem', color: '#ede9fe', marginTop: '0.25rem', margin: '0.25rem 0 0 0' }}>0-2000 XP</p>
          </div>
          <div style={{ textAlign: 'center', background: 'rgba(192, 132, 252, 0.2)', padding: '1.5rem', borderRadius: '1.5rem', border: '2px solid rgba(192, 132, 252, 0.5)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🚀</div>
            <p style={{ fontSize: '1rem', fontWeight: 'bold', color: '#c4b5fd', margin: 0 }}>Intermediate</p>
            <p style={{ fontSize: '0.75rem', color: '#ede9fe', marginTop: '0.25rem', margin: '0.25rem 0 0 0' }}>
              2000-5000 XP
            </p>
            {totalXp >= 2000 && totalXp < 5000 && (
              <div style={{ marginTop: '0.5rem', padding: '0.375rem 0.75rem', background: 'rgba(167,139,250,0.3)', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 'bold', color: '#ede9fe' }}>
                YOU ARE HERE
              </div>
            )}
          </div>
          <div style={{ textAlign: 'center', background: 'rgba(167,139,250,0.15)', padding: '1.5rem', borderRadius: '1.5rem', border: '2px solid rgba(167,139,250,0.3)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🏆</div>
            <p style={{ fontSize: '1rem', fontWeight: 'bold', color: '#ede9fe', margin: 0 }}>Advanced</p>
            <p style={{ fontSize: '0.75rem', color: '#c4b5fd', marginTop: '0.25rem', margin: '0.25rem 0 0 0' }}>5000+ XP</p>
          </div>
        </div>
      </div>
    </GlassCard>
  </section>
)}	{/* SECTION 4: ACTION ANALYSIS */}
{(frequencyData.length > 0 || actions.length > 0) && (
  <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
    {/* Action Frequency Chart */}
    {frequencyData.length > 0 && (
      <GlassCard>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#a78bfa', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
              <BarChart3 style={{ width: 20, height: 20, color: '#a78bfa' }} />
              Action Frequency
            </h2>
            <p style={{ fontSize: '0.75rem', color: '#ede9fe', marginTop: '0.25rem', margin: '0.25rem 0 0 0' }}>
              Most impactful this month
            </p>
          </div>

          <div style={{ height: '256px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={frequencyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(167,139,250,0.2)" />
                <XAxis
                  dataKey="action"
                  tick={{ fill: '#c4b5fd', fontSize: 10 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fill: '#c4b5fd', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(88, 28, 135, 0.9)',
                    border: '2px solid rgba(167,139,250,0.5)',
                    borderRadius: '1rem',
                    fontSize: '12px',
                    color: '#ede9fe',
                  }}
                />
                <Bar
                  dataKey="count"
                  fill="#a78bfa"
                  radius={[15, 15, 0, 0]}
                  animationDuration={1200}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{ background: 'rgba(167,139,250,0.15)', padding: '1rem', borderRadius: '1rem', border: '2px solid rgba(167,139,250,0.4)' }}>
            <p style={{ fontSize: '0.875rem', margin: 0, color: '#ede9fe' }}>
              <strong style={{ color: '#c4b5fd' }}>Insight:</strong> You've logged{" "}
              <span style={{ color: '#c4b5fd', fontWeight: 'bold' }}>{actions.length} actions</span> this month - great progress!
            </p>
          </div>
        </div>
      </GlassCard>
    )}

    {/* Recent Actions */}
    {actions.length > 0 && (
      <GlassCard>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#c4b5fd', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
              <Calendar style={{ width: 20, height: 20, color: '#c4b5fd' }} />
              Recent Actions
            </h2>
            <p style={{ fontSize: '0.75rem', color: '#ede9fe', marginTop: '0.25rem', margin: '0.25rem 0 0 0' }}>
              Latest social wins
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '320px', overflowY: 'auto', paddingRight: '0.5rem' }}>
            {actions.map((action) => (
              <div
                key={action.id}
                style={{
                  background: 'rgba(167,139,250,0.15)',
                  padding: '0.75rem',
                  borderRadius: '1rem',
                  border: '2px solid rgba(167,139,250,0.3)',
                  transition: 'border-color 0.3s, transform 0.2s',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(167,139,250,0.6)';
                  e.currentTarget.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(167,139,250,0.3)';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '0.875rem', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0, color: '#ede9fe' }}>
                      {action.action}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.75rem', color: '#c4b5fd' }}>
                        {action.date?.toDate ? action.date.toDate().toLocaleDateString() : action.date}
                      </span>
                      <span style={{ fontSize: '0.75rem', padding: '0.125rem 0.5rem', background: 'rgba(167,139,250,0.3)', color: '#c4b5fd', borderRadius: '9999px' }}>
                        {action.skill}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem', flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Zap style={{ width: 12, height: 12, color: '#a78bfa' }} />
                      <span style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#a78bfa' }}>
                        +{action.xp}
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        padding: '0.125rem 0.5rem',
                        borderRadius: '9999px',
                        fontWeight: '600',
                        background: action.difficulty === "Hard" ? 'rgba(192,132,252,0.3)' : action.difficulty === "Medium" ? 'rgba(167,139,250,0.3)' : 'rgba(192,132,252,0.2)',
                        color: action.difficulty === "Hard" ? '#e9d5ff' : action.difficulty === "Medium" ? '#c4b5fd' : '#ede9fe',
                      }}
                    >
                      {action.difficulty}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </GlassCard>
    )}
  </section>
)}

{/* SECTION 5: SOCIAL ARCHETYPE */}
<section>
  <GlassCard>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#a78bfa', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
          <Star style={{ width: 24, height: 24, color: '#a78bfa' }} />
          Your Archetype
        </h2>
        <p style={{ fontSize: '0.875rem', color: '#ede9fe', marginTop: '0.25rem', margin: '0.25rem 0 0 0' }}>
          Evolving social personality
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3.75rem', marginBottom: '1rem' }}>
            {ARCHETYPES[currentArchetype]?.icon || '👁️'}
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#c4b5fd', margin: 0 }}>
            {ARCHETYPES[currentArchetype]?.name || 'Observer'}
          </h3>
          <p style={{ fontSize: '0.75rem', color: '#ede9fe', marginTop: '0.25rem', margin: '0.25rem 0 0 0' }}>
            Current Type
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
          <ArrowRight style={{ width: 32, height: 32, color: '#c4b5fd' }} />
          <div style={{ fontSize: '0.75rem', color: '#c4b5fd' }}>
            Evolving
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3.75rem', marginBottom: '1rem' }}>
            {ARCHETYPES[futureArchetype]?.icon || '🤝'}
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#c4b5fd', margin: 0 }}>
            {ARCHETYPES[futureArchetype]?.name || 'Connector'}
          </h3>
          <p style={{ fontSize: '0.75rem', color: '#ede9fe', marginTop: '0.25rem', margin: '0.25rem 0 0 0' }}>
            Future Type
          </p>
        </div>
      </div>

      <div style={{ background: 'rgba(167,139,250,0.15)', padding: '1.5rem', borderRadius: '1.5rem', border: '2px solid rgba(167,139,250,0.4)' }}>
        <p style={{ fontSize: '0.875rem', lineHeight: '1.6', margin: 0, color: '#ede9fe' }}>
          <strong style={{ color: '#a78bfa' }}>Evolution Path:</strong> As an {ARCHETYPES[currentArchetype]?.name || 'Observer'}, you're {ARCHETYPES[currentArchetype]?.traits.join(', ').toLowerCase()}. You're transforming into a {ARCHETYPES[futureArchetype]?.name || 'Connector'} - someone who brings people together naturally!
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '0.75rem' }}>
        {Object.entries(ARCHETYPES).map(([key, archetype]) => (
          <div
            key={key}
            onClick={() => setCurrentArchetype(key)}
            style={{
              padding: '1rem',
              borderRadius: '1rem',
              border: '2px solid',
              borderColor: currentArchetype === key ? '#a78bfa' : 'rgba(167,139,250,0.3)',
              background: currentArchetype === key ? 'rgba(167,139,250,0.2)' : 'rgba(167,139,250,0.15)',
              cursor: 'pointer',
              transition: 'all 0.3s',
              transform: currentArchetype === key ? 'scale(1.05)' : 'scale(1)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{archetype.icon}</div>
            <p style={{ fontSize: '0.75rem', fontWeight: 'bold', margin: 0, color: currentArchetype === key ? '#ede9fe' : '#ede9fe' }}>{archetype.name}</p>
          </div>
        ))}
      </div>
    </div>
  </GlassCard>
</section>


       {/* SECTION 6: CHALLENGES */}
{challenges.length > 0 && (
  <section>
    <GlassCard>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#a855f7', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <Target style={{ width: 24, height: 24 }} />
            Active Challenges
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#e9d5ff', marginTop: '0.25rem' }}>
            Complete to level up faster
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          {challenges.map((challenge) => (
            <div
              key={challenge.id}
              style={{
                padding: '1.25rem',
                borderRadius: '1.5rem',
                border: '2px solid',
                borderColor: challenge.completed ? '#c084fc' : 'rgba(168, 85, 247, 0.3)',
                background: challenge.completed ? 'rgba(192, 132, 252, 0.2)' : 'rgba(139, 92, 246, 0.15)',
                transition: 'all 0.3s',
                cursor: challenge.completed ? 'default' : 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              }}
              onMouseEnter={(e) => {
                if (!challenge.completed) {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.borderColor = '#d946ef';
                }
              }}
              onMouseLeave={(e) => {
                if (!challenge.completed) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.3)';
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{ fontSize: '2.5rem' }}>{challenge.badge}</div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Zap style={{ width: 16, height: 16, color: '#a855f7' }} />
                    <span style={{ fontSize: '1rem', fontWeight: 'bold', color: '#a855f7' }}>
                      +{challenge.xp}
                    </span>
                  </div>
                  {challenge.streak > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                      <Flame style={{ width: 12, height: 12, color: '#d946ef' }} />
                      <span style={{ fontSize: '0.75rem', color: '#d946ef', fontWeight: '600' }}>
                        {challenge.streak} days
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <p style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.75rem', color: '#e9d5ff' }}>
                {challenge.title}
              </p>

              {challenge.target && (
                <div style={{ marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#c084fc', marginBottom: '0.25rem' }}>
                    <span>Progress</span>
                    <span>{challenge.progress || 0} / {challenge.target}</span>
                  </div>
                  <div style={{ height: '8px', background: 'rgba(168, 85, 247, 0.2)', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${Math.min(((challenge.progress || 0) / challenge.target) * 100, 100)}%`,
                        background: 'linear-gradient(90deg, #a855f7, #c084fc)',
                        borderRadius: '9999px',
                        transition: 'width 0.5s ease-out',
                      }}
                    />
                  </div>
                </div>
              )}

              <button
                onClick={() => handleChallengeComplete(challenge.id)}
                disabled={challenge.completed}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '1rem',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  transition: 'all 0.3s',
                  cursor: challenge.completed ? 'default' : 'pointer',
                  background: challenge.completed ? 'rgba(192, 132, 252, 0.3)' : 'linear-gradient(90deg, #a855f7, #c084fc)',
                  color: '#fff',
                  border: 'none',
                  opacity: challenge.completed ? 0.6 : 1,
                  boxShadow: challenge.completed ? 'none' : '0 4px 8px rgba(168,85,247,0.3)',
                }}
              >
                {challenge.completed ? "✓ Completed" : "Mark Complete"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  </section>
)}

{/* SECTION 7: TIMELINE */}
{timelineEvents.length > 0 && (
  <section>
    <GlassCard>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#c084fc', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <Sparkles style={{ width: 24, height: 24 }} />
            Your Story
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#e9d5ff', marginTop: '0.25rem' }}>
            The narrative of your transformation
          </p>
        </div>

        <div style={{ position: 'relative' }}>
          <div style={{
            position: 'absolute',
            left: '2rem',
            top: 0,
            bottom: 0,
            width: '6px',
            background: 'linear-gradient(180deg, #a855f7, #c084fc, #d946ef)',
            borderRadius: '9999px',
          }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingLeft: '5rem' }}>
            {timelineEvents.map((event) => (
              <div key={event.id} style={{ position: 'relative', transition: 'all 0.3s' }}>
                <div
                  style={{
                    position: 'absolute',
                    left: '-3.75rem',
                    top: '0.5rem',
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    border: '4px solid rgba(88, 28, 135, 0.8)',
                    background: event.color,
                    boxShadow: `0 0 20px ${event.color}80`,
                    transition: 'transform 0.3s',
                  }}
                >
                  {event.icon}
                </div>
                <div
                  style={{
                    background: 'rgba(139, 92, 246, 0.15)',
                    padding: '1rem',
                    borderRadius: '1rem',
                    border: '2px solid rgba(168, 85, 247, 0.3)',
                    transition: 'all 0.3s',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(4px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}
                >
                  <h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: event.color, margin: '0 0 0.5rem 0' }}>
                    {event.stage}
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: '#e9d5ff', margin: 0 }}>
                    {event.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </GlassCard>
  </section>
)}

{/* SECTION 8: BENCHMARKS */}
<section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
  {[
    {
      icon: '📊',
      title: 'vs. Average',
      value: '+28%',
      color: '#c084fc',
      progress: 78,
      subtitle: 'Ahead of most learners',
      gradient: 'linear-gradient(90deg, #c084fc, #a855f7)',
    },
    {
      icon: '📈',
      title: 'vs. Last Month',
      value: '+45%',
      color: '#a855f7',
      progress: 100,
      subtitle: 'Growth accelerating',
      gradient: 'linear-gradient(90deg, #a855f7, #d946ef)',
    },
    {
      icon: '🎯',
      title: 'Percentile',
      value: 'Top 15%',
      color: '#d946ef',
      progress: 85,
      subtitle: 'Among all users',
      gradient: 'linear-gradient(90deg, #d946ef, #c084fc)',
    },
  ].map((bench, idx) => (
    <GlassCard key={idx}>
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ fontSize: '3rem' }}>{bench.icon}</div>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: bench.color, margin: 0 }}>{bench.title}</h3>
        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: bench.color }}>{bench.value}</div>
        <p style={{ fontSize: '0.75rem', color: '#e9d5ff', margin: 0 }}>{bench.subtitle}</p>
        <div style={{ height: '12px', background: 'rgba(168, 85, 247, 0.2)', borderRadius: '9999px', overflow: 'hidden', border: '1px solid rgba(168, 85, 247, 0.3)' }}>
          <div
            style={{
              height: '100%',
              width: `${bench.progress}%`,
              background: bench.gradient,
              borderRadius: '9999px',
              transition: 'width 1s ease-out',
            }}
          />
        </div>
      </div>
    </GlassCard>
  ))}
</section>


        {/* SECTION 9: REFLECTION */}
  <section>
    <GlassCard>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#e879f9', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <Heart style={{ width: 24, height: 24 }} />
            Weekly Reflection
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#e9d5ff', marginTop: '0.25rem' }}>
            How do you feel about your progress?
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          {[
            { mood: "amazing", emoji: "🤩", label: "Amazing!", color: "#c084fc" },
            { mood: "good", emoji: "😊", label: "Good", color: "#a855f7" },
            { mood: "okay", emoji: "😐", label: "Okay", color: "#9333ea" },
            { mood: "struggling", emoji: "😔", label: "Struggling", color: "#d946ef" },
          ].map(({ mood, emoji, label, color }) => {
            const isHovered = hoveredMood === mood;
            
            return (
              <button
                key={mood}
                onClick={() => setReflectionMood(mood)}
                onMouseEnter={() => setHoveredMood(mood)}
                onMouseLeave={() => setHoveredMood(null)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '1rem',
                  borderRadius: '1.5rem',
                  border: '2px solid',
                  borderColor: reflectionMood === mood ? color : (isHovered && reflectionMood !== mood ? `${color}80` : 'rgba(168, 85, 247, 0.3)'),
                  background: reflectionMood === mood ? `${color}20` : 'rgba(139, 92, 246, 0.15)',
                  minWidth: '90px',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  transform: reflectionMood === mood ? 'scale(1.05)' : (isHovered ? 'scale(1.1)' : 'scale(1)'),
                  boxShadow: isHovered || reflectionMood === mood ? `0 6px 12px ${color}40` : '0 2px 6px rgba(0,0,0,0.05)',
                }}
              >
                <div style={{ fontSize: '2.5rem' }}>{emoji}</div>
                <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#e9d5ff' }}>{label}</span>
              </button>
            );
          })}
        </div>
                          

              {reflectionMood && (
                <div
                  style={{
                    background: 'rgba(168, 85, 247, 0.15)',
                    padding: '1rem',
                    borderRadius: '1.5rem',
                    border: '2px solid rgba(168, 85, 247, 0.4)',
                  }}
                >
                  <p style={{ fontSize: '0.875rem', margin: 0, color: '#e9d5ff' }}>
                    <strong style={{ color: '#c084fc' }}>
                      Based on your reflection:
                    </strong>{" "}
                    {reflectionMood === "amazing"
                      ? "You're on fire! Keep this momentum!"
                      : reflectionMood === "good"
                        ? "Great progress! Try one harder challenge."
                        : reflectionMood === "okay"
                          ? "Steady progress is still progress. Keep going!"
                          : "It's okay to have tough weeks. Let's adjust your goals."}
                  </p>
                </div>
              )}
            </div>
          </GlassCard>
        </section>
      </div>

      {/* Footer */}
      <footer style={{
        borderTop: '2px solid rgba(168, 85, 247, 0.3)',
        background: 'rgba(88, 28, 135, 0.6)',
        backdropFilter: 'blur(10px)',
        marginTop: '3rem',
        borderRadius: '1.5rem 1.5rem 0 0',
        position: 'relative',
        zIndex: 10,
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem', textAlign: 'center' }}>
          <p style={{ fontSize: '0.875rem', color: '#c084fc', margin: 0 }}>
            Keep growing, keep connecting. Your future self will thank you.
          </p>
        </div>
      </footer>

      <style>{`
        /* Brighten Purple Shades */
        
        /* Main background gradient - more vibrant */
        body, [style*="background: linear-gradient(to bottom right, #581c87, #6b21a8, #4c1d95)"] {
          background: linear-gradient(to bottom right, #6b21a8, #7c3aed, #5b21b6) !important;
        }

        /* Glass card backgrounds - brighter */
        [style*="background: rgba(139, 92, 246, 0.1)"] {
          background: rgba(139, 92, 246, 0.2) !important;
        }

        [style*="background: rgba(139, 92, 246, 0.15)"] {
          background: rgba(139, 92, 246, 0.25) !important;
        }

        /* Border colors - more vibrant */
        [style*="border: 2px solid rgba(168, 85, 247, 0.3)"],
        [style*="border: '2px solid rgba(168, 85, 247, 0.3)'"] {
          border-color: rgba(168, 85, 247, 0.5) !important;
        }

        [style*="border: 2px solid rgba(168, 85, 247, 0.4)"],
        [style*="border: '2px solid rgba(168, 85, 247, 0.4)'"] {
          border-color: rgba(168, 85, 247, 0.6) !important;
        }

        /* Progress bar fills - brighter gradient */
        [style*="background: linear-gradient(90deg, #a855f7"],
        [style*="background: 'linear-gradient(90deg, #a855f7"] {
          background: linear-gradient(90deg, #c084fc, #e879f9) !important;
        }

        /* Text colors - brighter */
        [style*="color: #c084fc"],
        [style*="color: '#c084fc'"] {
          color: #e9d5ff !important;
        }

        [style*="color: #a855f7"],
        [style*="color: '#a855f7'"] {
          color: #c084fc !important;
        }

        /* Shadow effects - more glow */
        [style*="boxShadow: '0 8px 32px rgba(147, 51, 234, 0.3)'"] {
          box-shadow: 0 8px 32px rgba(168, 85, 247, 0.5) !important;
        }

        /* Header background - brighter */
        header[style*="background: rgba(88, 28, 135, 0.6)"] {
          background: rgba(107, 33, 168, 0.7) !important;
        }

        /* Circular progress colors - more vibrant */
        circle[stroke*="#a855f7"] {
          stroke: #c084fc !important;
        }

        circle[stroke*="#c084fc"] {
          stroke: #e879f9 !important;
        }

        circle[stroke*="#d946ef"] {
          stroke: #f0abfc !important;
        }

        /* Button gradients - brighter */
        [style*="background: linear-gradient(90deg, #a855f7, #c084fc)"] {
          background: linear-gradient(90deg, #c084fc, #e879f9) !important;
        }

        /* Icon colors - more vibrant */
        svg[style*="color: #a855f7"],
        svg[style*="color: '#a855f7'"] {
          color: #c084fc !important;
        }

        svg[style*="color: #c084fc"],
        svg[style*="color: '#c084fc'"] {
          color: #e879f9 !important;
        }

        /* Scrollbar styling */
        *::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        *::-webkit-scrollbar-track {
          background: rgba(139, 92, 246, 0.1);
          border-radius: 10px;
        }

        *::-webkit-scrollbar-thumb {
          background: rgba(168, 85, 247, 0.5);
          border-radius: 10px;
        }

        *::-webkit-scrollbar-thumb:hover {
          background: rgba(168, 85, 247, 0.7);
        }
      `}</style>
    </div>
  );
}