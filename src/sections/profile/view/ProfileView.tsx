import { useState, useEffect } from "react";
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../../firebase';
import { socialSkillsServices } from './firebase-services';
import GoogleSignIn from '../../../components/auth/GoogleSignIn';
import SocialOnboardingQuiz from './SocialOnboardingQuiz';
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

// Archetype definitions
const ARCHETYPES = {
  observer: {
    name: 'Observer',
    icon: '👁️',
    traits: ['Thoughtful', 'Analytical', 'Cautious']
  },
  connector: {
    name: 'Connector',
    icon: '🤝',
    traits: ['Social', 'Engaging', 'Empathetic']
  },
  supporter: {
    name: 'Supporter',
    icon: '💚',
    traits: ['Caring', 'Loyal', 'Encouraging']
  },
  influencer: {
    name: 'Influencer',
    icon: '⭐',
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
    opacity: Math.random() * 0.6 + 0.3,
    color: ['rgba(192, 132, 252, 0.7)', 'rgba(233, 121, 249, 0.6)', 'rgba(240, 171, 252, 0.5)'][i % 3],
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
          stroke="rgba(255,255,255,0.15)"
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
          style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
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
const GlassCard = ({ children }) => (
  <div style={{
    background: 'rgba(107, 33, 168, 0.25)',
    backdropFilter: 'blur(20px)',
    border: '2px solid rgba(192, 132, 252, 0.4)',
    borderRadius: '2rem',
    padding: '2rem',
    boxShadow: '0 10px 40px rgba(192, 132, 252, 0.3)',
    transition: 'all 0.3s ease',
  }}>
    {children}
  </div>
);

const BubbleProgress = ({ trait }) => {
  const Icon = TRAIT_ICONS[trait.trait] || Sparkles;
  const growth = trait.future - trait.current;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
      <CircularProgress value={trait.current} color="#e879f9" size={112} strokeWidth={8}>
        <Icon style={{ width: 32, height: 32, color: "#f0abfc" }} />
      </CircularProgress>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#f5f3ff', textShadow: '0 0 6px #e879f9', margin: 0 }}>
          {trait.trait}
        </p>
        <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f0abfc', textShadow: '0 0 8px #e879f9', margin: '0.25rem 0' }}>
          {trait.current}%
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
          <ArrowUpRight style={{ width: 16, height: 16, color: '#c084fc' }} />
          <span style={{ fontSize: '0.75rem', color: '#c084fc', fontWeight: '600' }}>+{growth}%</span>
        </div>
      </div>
    </div>
  );
};

const FutureBubbleProgress = ({ trait }) => {
  const Icon = TRAIT_ICONS[trait.trait] || Sparkles;
  const growth = trait.future - trait.current;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
      <CircularProgress value={trait.future} color="#c084fc" size={112} strokeWidth={8}>
        <Icon style={{ width: 32, height: 32, color: "#e9d5ff" }} />
      </CircularProgress>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#f5f3ff', textShadow: '0 0 6px #c084fc', margin: 0 }}>
          {trait.trait}
        </p>
        <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#e9d5ff', textShadow: '0 0 8px #c084fc', margin: '0.25rem 0' }}>
          {trait.future}%
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
          <Sparkles style={{ width: 16, height: 16, color: '#c084fc' }} />
          <span style={{ fontSize: '0.75rem', color: '#c084fc', fontWeight: '600' }}>+{growth}%</span>
        </div>
      </div>
    </div>
  );
};

const SkillBubbleBar = ({ skill }) => {
  const percentage = (skill.xp / skill.maxXp) * 100;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#f5f3ff', textShadow: '0 0 4px #e879f9' }}>
          {skill.name}
        </span>
        <span style={{ fontSize: '0.75rem', color: '#e9d5ff' }}>
          {skill.xp} / {skill.maxXp} XP
        </span>
      </div>
      <div style={{ position: 'relative', height: '1.25rem', background: 'rgba(107, 33, 168, 0.3)', borderRadius: '9999px', overflow: 'hidden', border: '1px solid rgba(192, 132, 252, 0.4)' }}>
        <div
          style={{
            height: '100%',
            width: `${percentage}%`,
            background: `linear-gradient(90deg, ${skill.color}, ${skill.color}dd)`,
            boxShadow: `0 0 20px ${skill.color}`,
            borderRadius: '9999px',
            transition: 'width 1.5s ease-out',
          }}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <span style={{ color: skill.color, fontWeight: 'bold', textShadow: `0 0 6px ${skill.color}` }}>
          Level {skill.level}
        </span>
        <span style={{ color: '#e9d5ff', fontWeight: '600' }}>
          {Math.round(percentage)}%
        </span>
      </div>
    </div>
  );
};

const MiniTrendChart = ({ data, color }) => {
  const chartData = data.map((value, index) => ({ name: index, value }));

  return (
    <ResponsiveContainer width="100%" height={50}>
      <AreaChart data={chartData}>
        <defs>
          <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.7} />
            <stop offset="100%" stopColor={color} stopOpacity={0.2} />
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
        background: 'rgba(107, 33, 168, 0.3)',
        backdropFilter: 'blur(16px)',
        borderRadius: '1.5rem',
        padding: '1rem',
        border: '2px solid rgba(192, 132, 252, 0.5)',
        minWidth: '100px',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.3s',
        transform: isHovered ? 'scale(1.05)' : 'scale(1)',
        boxShadow: isHovered ? `0 0 25px ${color}` : 'none',
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
          background: `${color}40`,
          border: `2px solid ${color}`,
        }}
      >
        <Icon style={{ width: 24, height: 24, color }} />
      </div>
      <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color, textShadow: `0 0 8px ${color}` }}>
        {value}
      </span>
      <span style={{ fontSize: '0.75rem', color: '#f0abfc', textAlign: 'center' }}>{label}</span>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function ProfileView() {
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
  const [hoveredMood, setHoveredMood] = useState(null);
  const [user, setUser] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const [totalXp, setTotalXp] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [totalActions, setTotalActions] = useState(0);
  const [showOnboardingOverlay, setShowOnboardingOverlay] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(!currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user?.uid) {
      checkOnboardingStatus();
    }
  }, [user]);

  const checkOnboardingStatus = async () => {
    if (!user?.uid) return;
    
    try {
      setCheckingOnboarding(true);
      const completed = await socialSkillsServices.onboarding.hasCompletedOnboarding(user.uid);
      
      if (!completed) {
        setShowOnboarding(true);
        setLoading(false);
      } else {
        await loadAllData();
      }
    } catch (error) {
      console.error('Error checking onboarding:', error);
      setShowOnboarding(true);
      setLoading(false);
    } finally {
      setCheckingOnboarding(false);
    }
  };

  const loadAllData = async () => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

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

      const traitsArray = Object.entries(traitsData)
        .filter(([key]) => key !== 'updatedAt')
        .map(([key, value]) => ({
          trait: key.charAt(0).toUpperCase() + key.slice(1),
          ...value
        }));

      setTraits(traitsArray);
      setSkills(skillsData);
      setActions(actionsData);
      setChallenges(challengesData);
      setMilestones(milestonesData);
      setCurrentArchetype(archetypeData.current || 'observer');
      setFutureArchetype(archetypeData.future || 'connector');
      setFrequencyData(frequencyData);
      setTimelineEvents(timelineData);

      const calculatedTotalXp = skillsData.reduce((sum, skill) => sum + (skill.xp || 0), 0);
      const calculatedStreak = actionsData.length > 0 ? 12 : 0;
      
      setTotalXp(calculatedTotalXp);
      setTotalActions(actionsData.length);
      setCurrentStreak(calculatedStreak);

    } catch (error) {
      console.error('Error loading data:', error);
      setTraits([]);
      setSkills([]);
      setActions([]);
      setChallenges([]);
      setMilestones([]);
      setFrequencyData([]);
      setTimelineEvents([]);
      setCurrentArchetype('observer');
      setFutureArchetype('connector');
      alert('Failed to load your data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const handleChallengeComplete = async (challengeId) => {
    if (!user?.uid) return;
    
    try {
      await socialSkillsServices.challenges.completeChallenge(user.uid, challengeId);
      const updatedChallenges = await socialSkillsServices.challenges.getChallenges(user.uid);
      setChallenges(updatedChallenges);
    } catch (error) {
      console.error('Error completing challenge:', error);
      alert('Failed to complete challenge');
    }
  };

  const handleOnboardingComplete = async (profileData) => {
    try {
      setLoading(true);
      await socialSkillsServices.onboarding.saveOnboardingResults(user.uid, profileData);
      setShowOnboarding(false);
      await loadAllData();
      
      setTimeout(() => {
        window.location.href = '/';
      }, 5000);
    } catch (error) {
      console.error('Error completing onboarding:', error);
      alert('Failed to save your profile. Please try again.');
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #6b21a8, #7c3aed, #5b21b6)', 
        color: '#fff', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '2rem' 
      }}>
        <div style={{ 
          textAlign: 'center',
          maxWidth: '400px',
          background: 'rgba(107, 33, 168, 0.3)',
          backdropFilter: 'blur(20px)',
          border: '2px solid rgba(192, 132, 252, 0.5)',
          borderRadius: '2rem',
          padding: '3rem 2rem',
          boxShadow: '0 10px 40px rgba(192, 132, 252, 0.4)',
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem', textShadow: '0 0 15px #e879f9' }}>🔒</div>
          <h2 style={{ 
            fontSize: '1.75rem', 
            color: '#f5f3ff', 
            marginBottom: '0.5rem',
            fontWeight: 'bold',
            textShadow: '0 0 8px #e879f9'
          }}>
            Welcome to Social Growth Journey
          </h2>
          <p style={{ 
            fontSize: '1rem', 
            color: '#e9d5ff',
            marginBottom: '2rem',
            textShadow: '0 0 6px #c084fc'
          }}>
            Sign in to track your social skills transformation
          </p>
          <GoogleSignIn />
        </div>
      </div>
    );
  }

  if (checkingOnboarding) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #6b21a8, #7c3aed, #5b21b6)', 
        color: '#fff', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div style={{ 
          textAlign: 'center',
          background: 'rgba(107, 33, 168, 0.3)',
          backdropFilter: 'blur(20px)',
          border: '2px solid rgba(192, 132, 252, 0.4)',
          borderRadius: '2rem',
          padding: '2rem',
          boxShadow: '0 10px 40px rgba(192, 132, 252, 0.3)',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem', textShadow: '0 0 10px #e879f9' }}>🔍</div>
          <p style={{ fontSize: '1.5rem', color: '#e9d5ff', textShadow: '0 0 6px #c084fc' }}>Checking your profile...</p>
        </div>
      </div>
    );
  }

  if (showOnboarding) {
    return <SocialOnboardingQuiz onComplete={handleOnboardingComplete} />;
  }

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #6b21a8, #7c3aed, #5b21b6)', 
        color: '#fff', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div style={{ 
          textAlign: 'center',
          background: 'rgba(107, 33, 168, 0.3)',
          backdropFilter: 'blur(20px)',
          border: '2px solid rgba(192, 132, 252, 0.4)',
          borderRadius: '2rem',
          padding: '2rem',
          boxShadow: '0 10px 40px rgba(192, 132, 252, 0.3)',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem', textShadow: '0 0 10px #e879f9' }}>⏳</div>
          <p style={{ fontSize: '1.5rem', color: '#e9d5ff', textShadow: '0 0 6px #c084fc' }}>Loading your journey...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      color: '#fff',
      overflowX: 'hidden',
      paddingBottom: '2rem',
      position: 'relative',
      background: 'linear-gradient(135deg, rgba(107, 33, 168, 0.7), rgba(124, 58, 237, 0.6), rgba(91, 33, 182, 0.5))',
      backdropFilter: 'blur(30px)',
      WebkitBackdropFilter: 'blur(30px)',
      boxShadow: 'inset 0 0 150px rgba(255,255,255,0.08)'
    }}>
      <ParticleBackground />

      {/* Header */}
      <header style={{
        borderBottom: '2px solid rgba(192, 132, 252, 0.3)',
        background: 'rgba(107, 33, 168, 0.5)',
        backdropFilter: 'blur(25px)',
        WebkitBackdropFilter: 'blur(25px)',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        borderRadius: '0 0 1.5rem 1.5rem',
        boxShadow: '0 8px 32px rgba(192, 132, 252, 0.4)',
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
              background: 'rgba(192, 132, 252, 0.35)', 
              backdropFilter: 'blur(12px)', 
              WebkitBackdropFilter: 'blur(12px)',
              borderRadius: '9999px', 
              border: '1px solid rgba(233, 121, 249, 0.4)',
              boxShadow: '0 4px 20px rgba(233, 121, 249, 0.4)',
            }}>
              <Sparkles style={{ width: 16, height: 16, color: '#f0abfc' }} />
              <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#f5f3ff', textShadow: '0 0 8px #e879f9' }}>
                Social Skills Mastery Platform
              </span>
            </div>
            
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: 'bold',
              background: 'linear-gradient(90deg, #f5f3ff, #e879f9, #f0abfc)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              margin: 0,
              marginBottom: '0.5rem',
              textShadow: '0 0 10px #e879f9',
            }}>
              Social Growth Journey
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#e9d5ff', margin: '0.25rem 0 0 0', textShadow: '0 0 6px #c084fc' }}>
              Track your transformation and unlock your potential
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <StatBubble icon={Flame} value={currentStreak} label="Streak" color="#f0abfc" />
            <StatBubble icon={Zap} value={totalXp.toLocaleString()} label="XP" color="#e879f9" />
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
        
        {/* Welcome Overlay */}
        {showOnboardingOverlay && ReactDOM.createPortal(
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
            <div className="bg-gradient-to-br from-purple-900/95 to-indigo-900/95 backdrop-blur-xl p-6 md:p-8 rounded-3xl border-2 border-purple-500/50 shadow-2xl max-w-md w-full">
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

        {/* Empty state */}
        {traits.length === 0 && skills.length === 0 && actions.length === 0 && (
          <GlassCard>
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem', textShadow: '0 0 12px #e879f9' }}>🌱</div>
              <h2 style={{ fontSize: '1.5rem', color: '#e879f9', marginBottom: '1rem', textShadow: '0 0 6px #c084fc' }}>
                Start Your Journey
              </h2>
              <p style={{ color: '#f5f3ff', marginBottom: '2rem' }}>
                Your social skills profile is empty. Start tracking your progress to see your growth!
              </p>
              <button
                onClick={loadAllData}
                style={{
                  padding: '1rem 2rem',
                  background: 'linear-gradient(90deg, #c084fc, #e879f9)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '1rem',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 4px 20px rgba(192, 132, 252, 0.5)',
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

        {/* SECTION 1: Current vs Future Self */}
        {traits.length > 0 && (
          <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {/* Current Self */}
            <GlassCard>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#e879f9', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                      <Users style={{ width: 24, height: 24, color: '#e879f9' }} />
                      Current Self
                    </h2>
                    <p style={{ fontSize: '0.875rem', color: '#f5f3ff', margin: '0.25rem 0 0 0' }}>
                      Where you are today
                    </p>
                  </div>
                  <div style={{ fontSize: '3rem', textShadow: '0 0 12px #e879f9' }}>
                    {ARCHETYPES[currentArchetype]?.icon || '👁️'}
                  </div>
                </div>

                <div style={{ background: 'rgba(192, 132, 252, 0.2)', borderRadius: '1.5rem', padding: '1rem', border: '2px solid rgba(192, 132, 252, 0.5)', boxShadow: '0 4px 25px rgba(192,132,252,0.3)' }}>
                  <p style={{ fontSize: '0.875rem', lineHeight: '1.6', margin: 0, color: '#f5f3ff' }}>
                    <strong style={{ color: '#f0abfc' }}>Personality:</strong>{" "}
                    You're consistent but shy in new groups. You prefer one-on-one conversations and excel at listening.
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.75rem' }}>
                    {ARCHETYPES[currentArchetype]?.traits.map((trait) => (
                      <span
                        key={trait}
                        style={{
                          padding: '0.375rem 0.75rem',
                          background: 'rgba(233, 121, 249, 0.35)',
                          color: '#f5f3ff',
                          fontSize: '0.75rem',
                          borderRadius: '9999px',
                          border: '2px solid rgba(240, 171, 252, 0.5)',
                          fontWeight: '600',
                          textShadow: '0 0 4px #e879f9',
                        }}
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f5f3ff', margin: '0 0 1.5rem 0' }}>
                    <TrendingUp style={{ width: 20, height: 20, color: '#e879f9' }} />
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
                    <div style={{ background: 'rgba(233, 121, 249, 0.2)', borderRadius: '1rem', padding: '1rem', border: '2px solid rgba(240, 171, 252, 0.5)', boxShadow: '0 4px 20px rgba(233,121,249,0.3)' }}>
                      <Award style={{ width: 24, height: 24, color: '#f0abfc', marginBottom: '0.5rem' }} />
                      <p style={{ fontSize: '0.75rem', color: '#f5f3ff', margin: 0 }}>Strongest</p>
                      <p style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#f0abfc', marginTop: '0.25rem' }}>
                        {traits.reduce((max, t) => t.current > max.current ? t : max, traits[0])?.trait || 'N/A'}
                      </p>
                      <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#f0abfc', margin: 0 }}>
                        {traits.reduce((max, t) => t.current > max.current ? t : max, traits[0])?.current || 0}%
                      </p>
                    </div>
                    <div style={{ background: 'rgba(192, 132, 252, 0.2)', borderRadius: '1rem', padding: '1rem', border: '2px solid rgba(233, 121, 249, 0.5)', boxShadow: '0 4px 20px rgba(192,132,252,0.3)' }}>
                      <Target style={{ width: 24, height: 24, color: '#e879f9', marginBottom: '0.5rem' }} />
                      <p style={{ fontSize: '0.75rem', color: '#f5f3ff', margin: 0 }}>Focus Area</p>
                      <p style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#e879f9', marginTop: '0.25rem' }}>
                        {traits.reduce((min, t) => t.current < min.current ? t : min, traits[0])?.trait || 'N/A'}
                      </p>
                      <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#e879f9', margin: 0 }}>
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
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#c084fc', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                      <Sparkles style={{ width: 24, height: 24, color: '#c084fc' }} />
                      Future Self
                    </h2>
                    <p style={{ fontSize: '0.875rem', color: '#f5f3ff', marginTop: '0.25rem', margin: '0.25rem 0 0 0' }}>
                      Your transformation
                    </p>
                  </div>
                  <div style={{ fontSize: '3rem' }}>
                    {ARCHETYPES[futureArchetype]?.icon || '🤝'}
                  </div>
                </div>

                <div style={{ background: 'rgba(192, 132, 252, 0.2)', borderRadius: '1.5rem', padding: '1rem', border: '2px solid rgba(233, 121, 249, 0.5)' }}>
                  <p style={{ fontSize: '0.875rem', lineHeight: '1.6', margin: 0, color: '#f5f3ff' }}>
                    <strong style={{ color: '#e9d5ff' }}>Projection:</strong> Based on your streak and XP, you're becoming a natural connector. You'll confidently start conversations and build meaningful relationships.
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.75rem' }}>
                    {ARCHETYPES[futureArchetype]?.traits.map((trait) => (
                      <span
                        key={trait}
                        style={{
                          padding: '0.375rem 0.75rem',
                          background: 'rgba(192, 132, 252, 0.35)',
                          color: '#f5f3ff',
                          fontSize: '0.75rem',
                          borderRadius: '9999px',
                          border: '2px solid rgba(233, 121, 249, 0.5)',
                          fontWeight: '600',
                        }}
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 1.5rem 0', color: '#f5f3ff' }}>
                    <ArrowRight style={{ width: 20, height: 20, color: '#c084fc' }} />
                    Projected Growth
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '1.5rem' }}>
                    {traits.map((trait, idx) => (
                      <FutureBubbleProgress key={idx} trait={trait} />
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <p style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#f5f3ff', margin: 0 }}>
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
                        background: 'rgba(192, 132, 252, 0.2)',
                        padding: '0.75rem',
                        borderRadius: '1rem',
                        border: '2px solid rgba(233, 121, 249, 0.5)',
                        color: '#f5f3ff',
                      }}
                    >
                      <CheckCircle style={{ width: 16, height: 16, color: '#e879f9', marginTop: '0.125rem', flexShrink: 0 }} />
                      <span>{habit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>
          </section>
        )}

        {/* SECTION 2: Skill Progression */}
        {skills.length > 0 && (
          <section>
            
          </section>
        )}

        {/* SECTION 3: Challenges */}
        {challenges.length > 0 && (
          <section>
            <GlassCard>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#e879f9', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                    <Target style={{ width: 24, height: 24 }} />
                    Active Challenges
                  </h2>
                  <p style={{ fontSize: '0.875rem', color: '#f5f3ff', marginTop: '0.25rem', margin: '0.25rem 0 0 0' }}>
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
                        borderColor: challenge.completed ? '#f0abfc' : 'rgba(233, 121, 249, 0.4)',
                        background: challenge.completed ? 'rgba(240, 171, 252, 0.25)' : 'rgba(192, 132, 252, 0.2)',
                        transition: 'all 0.3s',
                        cursor: challenge.completed ? 'default' : 'pointer',
                        boxShadow: '0 4px 15px rgba(192, 132, 252, 0.2)',
                      }}
                      onMouseEnter={(e) => {
                        if (!challenge.completed) {
                          e.currentTarget.style.transform = 'translateY(-3px)';
                          e.currentTarget.style.borderColor = '#f0abfc';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!challenge.completed) {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.borderColor = 'rgba(233, 121, 249, 0.4)';
                        }
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                        <div style={{ fontSize: '2.5rem' }}>{challenge.badge}</div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Zap style={{ width: 16, height: 16, color: '#e879f9' }} />
                            <span style={{ fontSize: '1rem', fontWeight: 'bold', color: '#e879f9' }}>
                              +{challenge.xp}
                            </span>
                          </div>
                          {challenge.streak > 0 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                              <Flame style={{ width: 12, height: 12, color: '#f0abfc' }} />
                              <span style={{ fontSize: '0.75rem', color: '#f0abfc', fontWeight: '600' }}>
                                {challenge.streak} days
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <p style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.75rem', color: '#f5f3ff' }}>
                        {challenge.title}
                      </p>

                      {challenge.target && (
                        <div style={{ marginBottom: '0.75rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#e9d5ff', marginBottom: '0.25rem' }}>
                            <span>Progress</span>
                            <span>{challenge.progress || 0} / {challenge.target}</span>
                          </div>
                          <div style={{ height: '8px', background: 'rgba(192, 132, 252, 0.3)', borderRadius: '9999px', overflow: 'hidden' }}>
                            <div
                              style={{
                                height: '100%',
                                width: `${Math.min(((challenge.progress || 0) / challenge.target) * 100, 100)}%`,
                                background: 'linear-gradient(90deg, #e879f9, #f0abfc)',
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
                          background: challenge.completed ? 'rgba(240, 171, 252, 0.4)' : 'linear-gradient(90deg, #c084fc, #e879f9)',
                          color: '#fff',
                          border: 'none',
                          opacity: challenge.completed ? 0.7 : 1,
                          boxShadow: challenge.completed ? 'none' : '0 4px 12px rgba(233, 121, 249, 0.4)',
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

        {/* SECTION 4: Reflection */}
        <section>
          <GlassCard>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f0abfc', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                  <Heart style={{ width: 24, height: 24 }} />
                  Weekly Reflection
                </h2>
                <p style={{ fontSize: '0.875rem', color: '#f5f3ff', marginTop: '0.25rem', margin: '0.25rem 0 0 0' }}>
                  How do you feel about your progress?
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                {[
                  { mood: "amazing", emoji: "🤩", label: "Amazing!", color: "#f0abfc" },
                  { mood: "good", emoji: "😊", label: "Good", color: "#e879f9" },
                  { mood: "okay", emoji: "😐", label: "Okay", color: "#c084fc" },
                  { mood: "struggling", emoji: "😔", label: "Struggling", color: "#e9d5ff" },
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
                        borderColor: reflectionMood === mood ? color : (isHovered && reflectionMood !== mood ? `${color}80` : 'rgba(233, 121, 249, 0.4)'),
                        background: reflectionMood === mood ? `${color}30` : 'rgba(192, 132, 252, 0.2)',
                        minWidth: '90px',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        transform: reflectionMood === mood ? 'scale(1.05)' : (isHovered ? 'scale(1.1)' : 'scale(1)'),
                        boxShadow: isHovered || reflectionMood === mood ? `0 6px 15px ${color}50` : '0 2px 8px rgba(192, 132, 252, 0.2)',
                      }}
                    >
                      <div style={{ fontSize: '2.5rem' }}>{emoji}</div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#f5f3ff' }}>{label}</span>
                    </button>
                  );
                })}
              </div>

              {reflectionMood && (
                <div
                  style={{
                    background: 'rgba(233, 121, 249, 0.2)',
                    padding: '1rem',
                    borderRadius: '1.5rem',
                    border: '2px solid rgba(240, 171, 252, 0.5)',
                  }}
                >
                  <p style={{ fontSize: '0.875rem', margin: 0, color: '#f5f3ff' }}>
                    <strong style={{ color: '#f0abfc' }}>
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
        borderTop: '2px solid rgba(192, 132, 252, 0.4)',
        background: 'rgba(107, 33, 168, 0.6)',
        backdropFilter: 'blur(12px)',
        marginTop: '3rem',
        borderRadius: '1.5rem 1.5rem 0 0',
        position: 'relative',
        zIndex: 10,
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem', textAlign: 'center' }}>
          <p style={{ fontSize: '0.875rem', color: '#e9d5ff', margin: 0 }}>
            Keep growing, keep connecting. Your future self will thank you.
          </p>
        </div>
      </footer>
    </div>
  );
}