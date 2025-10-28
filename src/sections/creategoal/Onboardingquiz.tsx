import { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, ArrowLeft, Check, MapPin, Users, Target, Heart, Calendar, TrendingUp, Award, Coffee, Book, Dumbbell, Briefcase, Palette, Globe, ChevronDown, ChevronUp, Plus, X, Save, Loader2, Home } from 'lucide-react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

// Firebase Configuration
const firebaseConfig = {
  // NOTE: In a real environment, __firebase_config and __initial_auth_token would be injected globally.
  // We use the provided mock data here as per the prompt's structure.
  apiKey: "AIzaSyBNCXIOAX2HUdeLvUxkTJh7DVbv8JU485s",
  authDomain: "goalgrid-c5e9c.firebaseapp.com",
  projectId: "goalgrid-c5e9c",
  storageBucket: "goalgrid-c5e9c.firebasestorage.app",
  databaseURL: "https://goalgrid-c5e9c-default-rtdb.firebaseio.com",
  messagingSenderId: "544004357501",
  appId: "1:544004357501:web:4b81a3686422b28534e014",
  measurementId: "G-BJQMLK9JJ1"
};

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

// Category Data
const PLACE_CATEGORIES = [
  {
    id: 'creative_arts',
    name: 'Creative & Arts',
    icon: '🎨',
    places: ['Art galleries', 'Pottery classes', 'Photography clubs', 'Writing workshops', 'Music venues', 'Theater groups']
  },
  {
    id: 'learning_intellect',
    name: 'Learning & Intellect',
    icon: '📚',
    places: ['Book clubs', 'Language exchanges', 'Lecture series', 'Study groups', 'Debate clubs', 'Museums']
  },
  {
    id: 'fitness_wellness',
    name: 'Fitness & Wellness',
    icon: '💪',
    places: ['Gyms', 'Yoga studios', 'Running clubs', 'Dance classes', 'Martial arts', 'Hiking groups']
  },
  {
    id: 'hobbies_recreation',
    name: 'Hobbies & Recreation',
    icon: '🎮',
    places: ['Board game cafes', 'Sports leagues', 'Maker spaces', 'Gaming lounges', 'Climbing gyms', 'Cycling clubs']
  },
  {
    id: 'professional',
    name: 'Professional Growth',
    icon: '💼',
    places: ['Co-working spaces', 'Industry meetups', 'Conferences', 'Networking events', 'Startup communities']
  },
  {
    id: 'community',
    name: 'Community & Volunteering',
    icon: '🌱',
    places: ['Community gardens', 'Volunteer organizations', 'Religious groups', 'Neighborhood associations', 'Charity events']
  },
  {
    id: 'food_social',
    name: 'Food & Social',
    icon: '🍽️',
    places: ['Cooking classes', 'Food tours', 'Wine tastings', 'Supper clubs', 'Farmers markets', 'Coffee shops']
  }
];

const VALUES = [
  'Authenticity', 'Ambition', 'Creativity', 'Adventure', 'Empathy',
  'Humor', 'Intellect', 'Spirituality', 'Health-consciousness',
  'Social justice', 'Family', 'Independence', 'Tradition', 'Innovation'
];

const OBSTACLES = [
  { id: 'social_anxiety', label: 'Social anxiety/nervousness' },
  { id: 'fear_rejection', label: 'Fear of rejection' },
  { id: 'not_knowing_say', label: 'Not knowing what to say' },
  { id: 'low_energy', label: 'Low energy/burnout' },
  { id: 'time_constraints', label: 'Time constraints' },
  { id: 'financial', label: 'Financial limitations' },
  { id: 'transportation', label: 'Transportation issues' },
  { id: 'past_negative', label: 'Past negative experiences' },
  { id: 'feeling_awkward', label: 'Feeling awkward/different' },
  { id: 'mental_health', label: 'Depression or mental health' },
  { id: 'cultural_language', label: 'Cultural/language barriers' },
  { id: 'physical_limitations', label: 'Physical disabilities or limitations' }
];

// Helper Component for Radio Buttons
const RadioGroup = ({ label, options, selected, onChange }) => (
  <div className="space-y-3">
    <label className="block text-purple-200 font-semibold">{label}</label>
    <div className="flex space-x-2">
      {options.map(option => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`flex-1 px-4 py-2 rounded-xl text-sm transition-all border ${
            selected === option.value
              ? 'bg-purple-600 border-purple-400 text-white shadow-lg'
              : 'bg-purple-900/30 border-purple-700/30 text-purple-200 hover:bg-purple-800/50'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  </div>
);

// Helper Component for Range Sliders
const ComfortRange = ({ label, value, min, max, path, updateFormData }) => (
  <div className="py-2">
    <div className="flex justify-between mb-2">
      <span className="text-purple-200">{label}</span>
      <span className="text-white font-bold">{value}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      value={value}
      onChange={(e) => updateFormData(path, parseInt(e.target.value))}
      className="w-full h-2 bg-purple-900/50 rounded-full appearance-none cursor-pointer"
    />
    <div className="flex justify-between text-xs text-purple-400 mt-1">
      <span>1 (Very Uncomfortable)</span>
      <span>{max} (Very Comfortable)</span>
    </div>
  </div>
);

export default function Onboardingquiz() { // Renamed component to App for single-file mandate
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [completed, setCompleted] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    // Phase 1: Social Baseline
    satisfactionScore: 5,
    biggestChallenges: [],
    successDefinition: '',

    // Phase 2: Social Style
    socialEnergyProfile: 'ambivert',
    idealSetting: '',
    conversationPreferences: [],
    comfortLevels: {
      smallTalk: 3,
      deepConversations: 3,
      groupDiscussions: 3,
      oneOnOne: 3,
      publicSpeaking: 3,
      online: 3
    },

    // Phase 3: Connection Approach
    connectionApproach: '',

    // Phase 4a: New Places
    newPlacesMotivation: [],
    selectedCategories: [],
    geographicPreferences: {
      neighborhoods: '',
      maxDistance: 10
    },
    availableTimes: {
      monday: [], tuesday: [], wednesday: [], thursday: [],
      friday: [], saturday: [], sunday: []
    },
    idealFirstInteraction: '',

    // Phase 4b: Existing Places
    existingPlaces: [],

    // Phase 5: Social Circle
    currentRelationships: [],
    idealFriendProfile: {
      ageRange: [25, 35],
      lifeStage: [],
      topValues: [],
      sharedInterests: [],
      interactionStyle: {
        conversationDepth: 'balanced',
        spontaneity: 'balanced',
        adventurousness: 'balanced'
      },
      connectionPurpose: []
    },

    // Phase 6: Goals
    goals: {
      quantity: {
        monthlyConversations: 5,
        monthlyContactExchanges: 3,
        monthlySecondMeetings: 2,
        monthlyNewFriendships: 1
      },
      quality: {
        nineDayVision: ''
      },
      weeklyTimeCommitment: 3,
      accountabilityPreferences: []
    },

    // Phase 7: Barriers
    barriers: {
      primaryObstacles: [],
      supportNeeds: [],
      pastSuccesses: ''
    },

    // Phase 8: App Preferences
    appPreferences: {
      motivationStyle: 'gentle_encouragement',
      notifications: {
        dailyReminders: { enabled: true, time: '09:00' },
        weeklyCheckins: { enabled: true, day: 'sunday' },
        achievementUnlocks: { enabled: true },
        streakWarnings: { enabled: true },
        opportunityAlerts: { enabled: false }
      }
    }
  });

  // Auth Effect
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Check if user has completed onboarding
        // Using a collection named 'userProfile' and a document named 'onboarding' for user-specific settings.
        const userProfileRef = doc(db, 'users', currentUser.uid, 'userProfile', 'onboarding');
        const profileDoc = await getDoc(userProfileRef);
        if (profileDoc.exists()) {
          setCompleted(true);
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Sign in failed:', error);
      // In-app message box instead of alert()
      const message = document.getElementById('message-box');
      if (message) {
        message.textContent = 'Sign in failed. Please try again.';
        message.style.display = 'block';
        setTimeout(() => message.style.display = 'none', 3000);
      }
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (path, value) => {
    setFormData(prev => {
      const keys = path.split('.');
      const newData = { ...prev };
      let current = newData;

      for (let i = 0; i < keys.length - 1; i++) {
        // Ensure nested objects exist and are cloned
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const toggleArrayItem = (path, item) => {
    let current = formData;
    const keys = path.split('.');
    for (const key of keys) {
      current = current[key];
    }
    const array = Array.isArray(current) ? current : [];
    const newArray = array.includes(item)
      ? array.filter(i => i !== item)
      : [...array, item];
    updateFormData(path, newArray);
  };

  const addExistingPlace = () => {
    const newPlace = {
      id: Date.now(),
      placeName: '',
      placeType: '',
      visitFrequency: 'weekly',
      timeSpent: '1-2h',
      currentConnectionLevel: 3,
      connectionPotential: 3,
      knownPeople: [],
      barriers: [],
      enhancementIdeas: ''
    };
    updateFormData('existingPlaces', [...formData.existingPlaces, newPlace]);
  };

  const updateExistingPlace = (id, field, value) => {
    const updated = formData.existingPlaces.map(place =>
      place.id === id ? { ...place, [field]: value } : place
    );
    updateFormData('existingPlaces', updated);
  };

  const removeExistingPlace = (id) => {
    updateFormData('existingPlaces', formData.existingPlaces.filter(p => p.id !== id));
  };

  const addRelationship = () => {
    const newRel = {
      id: Date.now(),
      name: '',
      type: 'friend',
      frequency: 'weekly',
      depth: 3,
      satisfaction: 3,
      location: '',
      lastInteraction: new Date().toISOString().slice(0, 10), // YYYY-MM-DD
      priority: 'maintain'
    };
    updateFormData('currentRelationships', [...formData.currentRelationships, newRel]);
  };

  const updateRelationship = (id, field, value) => {
    const updated = formData.currentRelationships.map(rel =>
      rel.id === id ? { ...rel, [field]: value } : rel
    );
    updateFormData('currentRelationships', updated);
  };

  const removeRelationship = (id) => {
    updateFormData('currentRelationships', formData.currentRelationships.filter(r => r.id !== id));
  };

  const saveToFirestore = async () => {
    if (!user) {
      // Show message box if not signed in
      const message = document.getElementById('message-box');
      if (message) {
        message.textContent = 'Please sign in to save your progress.';
        message.style.display = 'block';
        setTimeout(() => message.style.display = 'none', 3000);
      }
      return;
    }

    setSaving(true);
    try {
      // Use Firestore Security Rule path: /users/{userId}/userProfile/onboarding
      const userProfileRef = doc(db, 'users', user.uid, 'userProfile', 'onboarding');
      const dataToSave = {
        ...formData,
        onboardingVersion: '2.0',
        completedAt: new Date().toISOString(),
        userId: user.uid
      };

      await setDoc(userProfileRef, dataToSave);
      setCompleted(true);
    } catch (error) {
      console.error('Error saving to Firestore:', error);
      // In-app message box instead of alert()
      const message = document.getElementById('message-box');
      if (message) {
        message.textContent = 'Failed to save. Please try again.';
        message.style.display = 'block';
        setTimeout(() => message.style.display = 'none', 3000);
      }
    } finally {
      setSaving(false);
    }
  };

  const nextStep = () => {
    let next = currentStep + 1;
    // Skip conditional steps
    while (next < steps.length && steps[next].skip && steps[next].skip()) {
      next++;
    }
    if (next < steps.length) {
      setCurrentStep(next);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    let prev = currentStep - 1;
    // Skip conditional steps
    while (prev >= 0 && steps[prev].skip && steps[prev].skip()) {
      prev--;
    }
    if (prev >= 0) {
      setCurrentStep(prev);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Steps Configuration
  const steps = [
    // Step 0: Welcome
    {
      title: 'Welcome to Your Social Journey',
      subtitle: 'Let\'s design your ideal social life',
      icon: Sparkles,
      render: () => (
        <div className="text-center space-y-6">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-6">
            <Sparkles className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Your Social Life, Designed by You
          </h2>
          <p className="text-lg text-purple-200 max-w-2xl mx-auto">
            In the next 5-7 minutes, we'll create your personalized social roadmap.
            You'll discover where to connect, who to meet, and how to build meaningful relationships.
          </p>

          <div className="grid md:grid-cols-3 gap-4 mt-8">
            <div className="bg-purple-800/30 p-6 rounded-2xl border border-purple-500/30">
              <Target className="w-8 h-8 text-purple-400 mx-auto mb-3" />
              <h3 className="font-bold text-white mb-2">Set Clear Goals</h3>
              <p className="text-sm text-purple-300">Define what social success means to you</p>
            </div>
            <div className="bg-purple-800/30 p-6 rounded-2xl border border-purple-500/30">
              <MapPin className="w-8 h-8 text-purple-400 mx-auto mb-3" />
              <h3 className="font-bold text-white mb-2">Find Your Places</h3>
              <p className="text-sm text-purple-300">Discover where to meet like-minded people</p>
            </div>
            <div className="bg-purple-800/30 p-6 rounded-2xl border border-purple-500/30">
              <TrendingUp className="w-8 h-8 text-purple-400 mx-auto mb-3" />
              <h3 className="font-bold text-white mb-2">Track Progress</h3>
              <p className="text-sm text-purple-300">Get personalized weekly action plans</p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-purple-500/30">
            <p className="text-purple-400 text-sm mb-4">⏱️ Estimated time: 5-7 minutes</p>
            <button
              onClick={nextStep}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl font-bold text-lg hover:from-purple-500 hover:to-pink-500 transition-all shadow-xl inline-flex items-center gap-2"
            >
              Let's Begin <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )
    },

    // Step 1: Social Baseline
    {
      title: 'Your Social Baseline',
      subtitle: 'Understanding where you are today',
      icon: Heart,
      render: () => (
        <div className="space-y-6">
          {/* Satisfaction Score */}
          <div className="bg-purple-800/30 p-6 rounded-2xl border border-purple-500/30">
            <label className="block text-lg font-bold text-white mb-4">
              How satisfied are you with your current social life?
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={formData.satisfactionScore}
              onChange={(e) => updateFormData('satisfactionScore', parseInt(e.target.value))}
              className="w-full h-3 bg-purple-900/50 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #a855f7 0%, #a855f7 ${(formData.satisfactionScore - 1) * 11.11}%, #4c1d95 ${(formData.satisfactionScore - 1) * 11.11}%, #4c1d95 100%)`
              }}
            />
            <div className="flex justify-between text-sm text-purple-300 mt-2">
              <span>Very Lonely (1)</span>
              <span className="text-2xl font-bold text-white">{formData.satisfactionScore}</span>
              <span>Thriving (10)</span>
            </div>
          </div>

          {/* Biggest Challenges */}
          <div className="bg-purple-800/30 p-6 rounded-2xl border border-purple-500/30">
            <label className="block text-lg font-bold text-white mb-4">
              What's your biggest social challenge? (Select up to 3)
            </label>
            <div className="grid md:grid-cols-2 gap-3">
              {[
                'Making new friends',
                'Deepening existing friendships',
                'Finding like-minded people',
                'Overcoming social anxiety',
                'Finding time for connections',
                'Maintaining long-distance relationships',
                'Transitioning from online to in-person',
                'Building professional network'
              ].map(challenge => (
                <button
                  key={challenge}
                  onClick={() => {
                    if (formData.biggestChallenges.includes(challenge)) {
                      toggleArrayItem('biggestChallenges', challenge);
                    } else if (formData.biggestChallenges.length < 3) {
                      toggleArrayItem('biggestChallenges', challenge);
                    }
                  }}
                  className={`p-4 rounded-xl text-left transition-all ${
                    formData.biggestChallenges.includes(challenge)
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-2 border-purple-400'
                      : 'bg-purple-900/30 text-purple-200 border border-purple-700/30 hover:border-purple-500/50'
                  }`}
                >
                  {challenge}
                </button>
              ))}
            </div>
            <p className="text-sm text-purple-400 mt-3">
              Selected: {formData.biggestChallenges.length}/3
            </p>
          </div>

          {/* Success Definition */}
          <div className="bg-purple-800/30 p-6 rounded-2xl border border-purple-500/30">
            <label className="block text-lg font-bold text-white mb-4">
              What does social success look like for you?
            </label>
            <textarea
              value={formData.successDefinition}
              onChange={(e) => updateFormData('successDefinition', e.target.value)}
              placeholder="E.g., Having 3-5 close friends, attending social events weekly, feeling confident in conversations..."
              className="w-full px-4 py-3 bg-purple-950/50 border-2 border-purple-500/30 rounded-xl text-white placeholder-purple-400 focus:outline-none focus:border-purple-400 resize-none"
              rows={3}
            />
          </div>
        </div>
      )
    },

    // Step 2: Social Energy & Style
    {
      title: 'Your Social Style',
      subtitle: 'How do you prefer to interact?',
      icon: Users,
      render: () => (
        <div className="space-y-6">
          {/* Social Energy Profile */}
          <div className="bg-purple-800/30 p-6 rounded-2xl border border-purple-500/30">
            <label className="block text-lg font-bold text-white mb-4">
              Where do you get your social energy?
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'introvert', label: 'Introvert', emoji: '🤫' },
                { value: 'ambivert', label: 'Ambivert', emoji: '⚖️' },
                { value: 'extrovert', label: 'Extrovert', emoji: '🎉' }
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => updateFormData('socialEnergyProfile', option.value)}
                  className={`p-6 rounded-2xl text-center transition-all ${
                    formData.socialEnergyProfile === option.value
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-2 border-purple-400 scale-105'
                      : 'bg-purple-900/30 text-purple-200 border border-purple-700/30 hover:border-purple-500/50'
                  }`}
                >
                  <div className="text-4xl mb-2">{option.emoji}</div>
                  <div className="font-bold">{option.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Ideal Setting */}
          <div className="bg-purple-800/30 p-6 rounded-2xl border border-purple-500/30">
            <label className="block text-lg font-bold text-white mb-4">
              What's your ideal social setting?
            </label>
            <div className="space-y-3">
              {[
                { value: 'one_on_one', label: 'One-on-one coffee chats', icon: '☕' },
                { value: 'small_groups', label: 'Small groups (3-5 people)', icon: '👥' },
                { value: 'medium_gatherings', label: 'Medium gatherings (6-15 people)', icon: '🎉' },
                { value: 'large_events', label: 'Large events/parties', icon: '🎊' },
                { value: 'online_first', label: 'Online communities first', icon: '💻' }
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => updateFormData('idealSetting', option.value)}
                  className={`w-full p-4 rounded-xl text-left transition-all flex items-center gap-3 ${
                    formData.idealSetting === option.value
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-2 border-purple-400'
                      : 'bg-purple-900/30 text-purple-200 border border-purple-700/30 hover:border-purple-500/50'
                  }`}
                >
                  <span className="text-2xl">{option.icon}</span>
                  <div className="flex-1">
                    <div className="font-bold text-lg mb-1">{option.label}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Conversation Preferences */}
          <div className="bg-purple-800/30 p-6 rounded-2xl border border-purple-500/30">
            <label className="block text-lg font-bold text-white mb-4">
              How do you prefer to start conversations? (Select all that apply)
            </label>
            <div className="grid md:grid-cols-2 gap-3">
              {[
                'Around shared activities',
                'Through mutual friends',
                'Structured events',
                'Casual encounters',
                'Online communities first',
                'Professional/networking events'
              ].map(pref => (
                <button
                  key={pref}
                  onClick={() => toggleArrayItem('conversationPreferences', pref)}
                  className={`p-4 rounded-xl text-left transition-all ${
                    formData.conversationPreferences.includes(pref)
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-2 border-purple-400'
                      : 'bg-purple-900/30 text-purple-200 border border-purple-700/30 hover:border-purple-500/50'
                  }`}
                >
                  {pref}
                </button>
              ))}
            </div>
          </div>

          {/* Comfort Levels */}
          <div className="bg-purple-800/30 p-6 rounded-2xl border border-purple-500/30">
            <label className="block text-lg font-bold text-white mb-4">
              Rate your comfort level in these situations (1-5)
            </label>
            <div className="space-y-4">
              {[
                { key: 'smallTalk', label: 'Small talk with strangers' },
                { key: 'deepConversations', label: 'Deep conversations' },
                { key: 'groupDiscussions', label: 'Group discussions' },
                { key: 'oneOnOne', label: 'One-on-one dialogues' },
                { key: 'publicSpeaking', label: 'Public speaking' },
                { key: 'online', label: 'Text/online conversations' }
              ].map(item => (
                <ComfortRange
                  key={item.key}
                  label={item.label}
                  value={formData.comfortLevels[item.key]}
                  min={1}
                  max={5}
                  path={`comfortLevels.${item.key}`}
                  updateFormData={updateFormData}
                />
              ))}
            </div>
          </div>
        </div>
      )
    },

    // Step 3: Connection Approach
    {
      title: 'Your Connection Strategy',
      subtitle: 'New places or existing ones?',
      icon: MapPin,
      render: () => (
        <div className="space-y-6">
          <div className="bg-purple-800/30 p-6 rounded-2xl border border-purple-500/30">
            <label className="block text-lg font-bold text-white mb-4">
              How do you want to approach new connections?
            </label>
            <div className="space-y-3">
              {[
                { value: 'maximize_existing', label: 'Maximize Existing', desc: 'Deepen connections in places you already visit', icon: '🏠' },
                { value: 'explore_new', label: 'Explore New', desc: 'Discover fresh environments and people', icon: '🗺️' },
                { value: 'balanced', label: 'Balanced Approach', desc: '70% existing, 30% new', icon: '⚖️' },
                { value: 'complete_reset', label: 'Complete Reset', desc: 'Start fresh in entirely new spaces', icon: '🚀' }
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => updateFormData('connectionApproach', option.value)}
                  className={`w-full p-6 rounded-2xl text-left transition-all ${
                    formData.connectionApproach === option.value
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-2 border-purple-400'
                      : 'bg-purple-900/30 text-purple-200 border border-purple-700/30 hover:border-purple-500/50'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <span className="text-3xl">{option.icon}</span>
                    <div className="flex-1">
                      <div className="font-bold text-lg mb-1">{option.label}</div>
                      <div className="text-sm opacity-80">{option.desc}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )
    },

    // Step 4: New Places (Conditional)
    {
      title: 'Explore New Places',
      subtitle: 'Where do you want to meet people?',
      icon: Globe,
      skip: () => formData.connectionApproach === 'maximize_existing',
      render: () => (
        <div className="space-y-6">
          {/* Categories */}
          <div className="bg-purple-800/30 p-6 rounded-2xl border border-purple-500/30">
            <label className="block text-lg font-bold text-white mb-4">
              What types of places interest you?
            </label>
            <div className="space-y-4">
              {PLACE_CATEGORIES.map(category => {
                const isSelected = formData.selectedCategories.some(c => c.category === category.id);
                return (
                  <div key={category.id} className="bg-purple-900/30 rounded-xl border border-purple-700/30 overflow-hidden">
                    <button
                      onClick={() => {
                        if (isSelected) {
                          updateFormData('selectedCategories', formData.selectedCategories.filter(c => c.category !== category.id));
                        } else {
                          updateFormData('selectedCategories', [...formData.selectedCategories, { category: category.id, places: [], priority: formData.selectedCategories.length + 1 }]);
                        }
                      }}
                      className={`w-full p-4 text-left flex items-center gap-3 transition-all ${
                        isSelected ? 'bg-purple-600/30' : 'hover:bg-purple-800/30'
                      }`}
                    >
                      <span className="text-3xl">{category.icon}</span>
                      <div className="flex-1">
                        <div className="font-bold text-white">{category.name}</div>
                        <div className="text-sm text-purple-300">{category.places.join(', ')}</div>
                      </div>
                      {isSelected && <Check className="w-5 h-5 text-green-400" />}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Geographic Preferences */}
          <div className="bg-purple-800/30 p-6 rounded-2xl border border-purple-500/30">
            <label className="block text-lg font-bold text-white mb-4">
              What neighborhoods/areas are you willing to explore?
            </label>
            <input
              type="text"
              value={formData.geographicPreferences.neighborhoods}
              onChange={(e) => updateFormData('geographicPreferences.neighborhoods', e.target.value)}
              placeholder="E.g., Downtown, West End, Brooklyn..."
              className="w-full px-4 py-3 bg-purple-950/50 border-2 border-purple-500/30 rounded-xl text-white placeholder-purple-400 focus:outline-none focus:border-purple-400"
            />

            <div className="mt-4">
              <label className="block text-purple-200 mb-2">
                Distance willing to travel: {formData.geographicPreferences.maxDistance} miles
              </label>
              <input
                type="range"
                min="0"
                max="30"
                value={formData.geographicPreferences.maxDistance}
                onChange={(e) => updateFormData('geographicPreferences.maxDistance', parseInt(e.target.value))}
                className="w-full h-2 bg-purple-900/50 rounded-full appearance-none cursor-pointer"
              />
            </div>
          </div>

          {/* Available Times */}
          <div className="bg-purple-800/30 p-6 rounded-2xl border border-purple-500/30">
            <label className="block text-lg font-bold text-white mb-4">
              When are you available for social activities?
            </label>
            <div className="space-y-3">
              {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                <div key={day} className="flex items-center gap-3">
                  <div className="w-24 text-purple-200 capitalize">{day}</div>
                  <div className="flex-1 flex gap-2">
                    {['morning', 'afternoon', 'evening'].map(time => (
                      <button
                        key={time}
                        onClick={() => {
                          const current = formData.availableTimes[day] || [];
                          const updated = current.includes(time)
                            ? current.filter(t => t !== time)
                            : [...current, time];
                          updateFormData(`availableTimes.${day}`, updated);
                        }}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm transition-all ${
                          (formData.availableTimes[day] || []).includes(time)
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                            : 'bg-purple-900/30 text-purple-300 border border-purple-700/30'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ideal First Interaction */}
          <div className="bg-purple-800/30 p-6 rounded-2xl border border-purple-500/30">
            <label className="block text-lg font-bold text-white mb-4">
              How would you like to meet people in new places?
            </label>
            <div className="space-y-3">
              {[
                { value: 'structured_event', label: 'Attend a structured event/class' },
                { value: 'regular_presence', label: 'Be a regular and naturally connect over time' },
                { value: 'friend_intro', label: 'Join through a friend/introduction' },
                { value: 'icebreaker', label: 'Use an icebreaker activity' },
                { value: 'online_first', label: 'Online community first, then meet' }
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => updateFormData('idealFirstInteraction', option.value)}
                  className={`w-full p-4 rounded-xl text-left transition-all ${
                    formData.idealFirstInteraction === option.value
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-2 border-purple-400'
                      : 'bg-purple-900/30 text-purple-200 border border-purple-700/30 hover:border-purple-500/50'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )
    },

    // Step 5: Existing Places (Completed)
    {
      title: 'Your Current Places',
      subtitle: 'Where do you already spend time?',
      icon: Home,
      skip: () => formData.connectionApproach === 'explore_new' || formData.connectionApproach === 'complete_reset',
      render: () => (
        <div className="space-y-6">
          <div className="bg-purple-800/30 p-6 rounded-2xl border border-purple-500/30">
            <label className="block text-lg font-bold text-white mb-4">
              List the places you regularly visit where you could deepen connections.
            </label>

            <div className="space-y-4 mb-6">
              {formData.existingPlaces.map((place, index) => (
                <div key={place.id} className="bg-purple-900/50 p-4 rounded-xl space-y-3 border border-purple-700/50 shadow-lg">
                  <div className="flex justify-between items-center border-b border-purple-700/50 pb-2 mb-2">
                    <h3 className="text-white font-bold text-xl">Place {index + 1}</h3>
                    <button onClick={() => removeExistingPlace(place.id)} className="text-pink-400 hover:text-pink-300">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={place.placeName}
                      onChange={(e) => updateExistingPlace(place.id, 'placeName', e.target.value)}
                      placeholder="Place Name (e.g., Downtown Gym)"
                      className="w-full px-4 py-2 bg-purple-950/50 border border-purple-600/50 rounded-lg text-white placeholder-purple-400"
                    />
                    <select
                      value={place.placeType}
                      onChange={(e) => updateExistingPlace(place.id, 'placeType', e.target.value)}
                      className="w-full px-4 py-2 bg-purple-950/50 border border-purple-600/50 rounded-lg text-white placeholder-purple-400 appearance-none"
                    >
                      <option value="" disabled className="text-purple-400">Select Type</option>
                      {PLACE_CATEGORIES.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <select
                      value={place.visitFrequency}
                      onChange={(e) => updateExistingPlace(place.id, 'visitFrequency', e.target.value)}
                      className="w-full px-4 py-2 bg-purple-950/50 border border-purple-600/50 rounded-lg text-white placeholder-purple-400 appearance-none"
                    >
                      <option value="weekly">Weekly</option>
                      <option value="biweekly">Bi-weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                    <select
                      value={place.timeSpent}
                      onChange={(e) => updateExistingPlace(place.id, 'timeSpent', e.target.value)}
                      className="w-full px-4 py-2 bg-purple-950/50 border border-purple-600/50 rounded-lg text-white placeholder-purple-400 appearance-none"
                    >
                      <option value="1-2h">1-2 hours</option>
                      <option value="2-4h">2-4 hours</option>
                      <option value="4+h">4+ hours</option>
                    </select>
                  </div>

                  <ComfortRange
                    label={`Current Connection Level (1-5): ${place.currentConnectionLevel}`}
                    value={place.currentConnectionLevel}
                    min={1}
                    max={5}
                    path={`existingPlaces.${index}.currentConnectionLevel`}
                    updateFormData={(path, value) => updateExistingPlace(place.id, 'currentConnectionLevel', value)}
                  />
                  <ComfortRange
                    label={`Connection Potential (1-5): ${place.connectionPotential}`}
                    value={place.connectionPotential}
                    min={1}
                    max={5}
                    path={`existingPlaces.${index}.connectionPotential`}
                    updateFormData={(path, value) => updateExistingPlace(place.id, 'connectionPotential', value)}
                  />
                </div>
              ))}
            </div>

            <button
              onClick={addExistingPlace}
              className="w-full py-3 bg-purple-700 hover:bg-purple-600 rounded-xl text-white font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <Plus className="w-5 h-5" /> Add Existing Place
            </button>

            {formData.existingPlaces.length === 0 && (
              <p className="text-purple-400 text-sm mt-4 text-center">
                Add at least one place to maximize existing connections.
              </p>
            )}
          </div>
        </div>
      )
    },

    // Step 6: Ideal Connections (Ideal Friend Profile & Current Relationships)
    {
      title: 'Define Ideal Connections',
      subtitle: 'Who do you want to attract and what do you already have?',
      icon: Target,
      render: () => (
        <div className="space-y-6">
          {/* Ideal Friend Profile - Values */}
          <div className="bg-purple-800/30 p-6 rounded-2xl border border-purple-500/30">
            <h3 className="text-xl font-bold text-white mb-4">Ideal Friend Profile (Top Values)</h3>
            <div className="grid md:grid-cols-3 gap-3">
              {VALUES.map(value => (
                <button
                  key={value}
                  onClick={() => toggleArrayItem('idealFriendProfile.topValues', value)}
                  className={`p-3 rounded-xl text-sm transition-all text-center ${
                    formData.idealFriendProfile.topValues.includes(value)
                      ? 'bg-pink-600 text-white border-2 border-pink-400'
                      : 'bg-purple-900/30 text-purple-200 border border-purple-700/30 hover:border-purple-500/50'
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
            <p className="text-sm text-purple-400 mt-3">
              Select your top 3-5 core values in a friend.
            </p>
          </div>

          {/* Ideal Friend Profile - Interaction Style */}
          <div className="bg-purple-800/30 p-6 rounded-2xl border border-purple-500/30">
            <h3 className="text-xl font-bold text-white mb-4">Ideal Interaction Style</h3>

            <RadioGroup
              label="Conversation Depth"
              options={[
                { value: 'light', label: 'Light/Fun' },
                { value: 'balanced', label: 'Balanced' },
                { value: 'deep', label: 'Deep/Meaningful' },
              ]}
              selected={formData.idealFriendProfile.interactionStyle.conversationDepth}
              onChange={(value) => updateFormData('idealFriendProfile.interactionStyle.conversationDepth', value)}
            />
            <div className="mt-4">
              <RadioGroup
                label="Spontaneity vs. Planning"
                options={[
                  { value: 'planned', label: 'Planner' },
                  { value: 'balanced', label: 'Balanced' },
                  { value: 'spontaneous', label: 'Spontaneous' },
                ]}
                selected={formData.idealFriendProfile.interactionStyle.spontaneity}
                onChange={(value) => updateFormData('idealFriendProfile.interactionStyle.spontaneity', value)}
              />
            </div>
            <div className="mt-4">
              <RadioGroup
                label="Adventurousness"
                options={[
                  { value: 'low', label: 'Cozy/Familiar' },
                  { value: 'balanced', label: 'Mix' },
                  { value: 'high', label: 'Highly Adventurous' },
                ]}
                selected={formData.idealFriendProfile.interactionStyle.adventurousness}
                onChange={(value) => updateFormData('idealFriendProfile.interactionStyle.adventurousness', value)}
              />
            </div>
          </div>

          {/* Current Relationships Overview */}
          <div className="bg-purple-800/30 p-6 rounded-2xl border border-purple-500/30">
            <h3 className="text-xl font-bold text-white mb-4">Current Relationship Overview (Optional)</h3>
            <p className="text-sm text-purple-400 mb-4">
              List 1-3 key relationships to track maintenance and growth.
            </p>

            <div className="space-y-4 mb-6">
              {formData.currentRelationships.map((rel, index) => (
                <div key={rel.id} className="bg-purple-900/50 p-4 rounded-xl space-y-3 border border-purple-700/50 shadow-lg">
                  <div className="flex justify-between items-center border-b border-purple-700/50 pb-2 mb-2">
                    <h4 className="text-white font-bold">Connection {index + 1}: {rel.name || 'Untitled'}</h4>
                    <button onClick={() => removeRelationship(rel.id)} className="text-pink-400 hover:text-pink-300">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={rel.name}
                    onChange={(e) => updateRelationship(rel.id, 'name', e.target.value)}
                    placeholder="Connection Name"
                    className="w-full px-3 py-2 bg-purple-950/50 border border-purple-600/50 rounded-lg text-white placeholder-purple-400 text-sm"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <select
                      value={rel.type}
                      onChange={(e) => updateRelationship(rel.id, 'type', e.target.value)}
                      className="w-full px-3 py-2 bg-purple-950/50 border border-purple-600/50 rounded-lg text-white text-sm appearance-none"
                    >
                      {['friend', 'family', 'colleague', 'partner', 'mentor'].map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
                    </select>
                    <select
                      value={rel.priority}
                      onChange={(e) => updateRelationship(rel.id, 'priority', e.target.value)}
                      className="w-full px-3 py-2 bg-purple-950/50 border border-purple-600/50 rounded-lg text-white text-sm appearance-none"
                    >
                      {['maintain', 'deepen', 'invest_less'].map(p => <option key={p} value={p} className="capitalize">{p.replace('_', ' ')}</option>)}
                    </select>
                  </div>
                  <ComfortRange
                    label={`Depth (1-5): ${rel.depth}`}
                    value={rel.depth}
                    min={1}
                    max={5}
                    path={`currentRelationships.${index}.depth`}
                    updateFormData={(path, value) => updateRelationship(rel.id, 'depth', value)}
                  />
                </div>
              ))}
            </div>
            <button
              onClick={addRelationship}
              className="w-full py-3 bg-purple-700 hover:bg-purple-600 rounded-xl text-white font-bold flex items-center justify-center gap-2 transition-colors text-sm"
            >
              <Plus className="w-4 h-4" /> Add Connection
            </button>
          </div>
        </div>
      )
    },

    // Step 7: Goals & Momentum
    {
      title: 'Goals & Commitment',
      subtitle: 'Setting measurable social targets',
      icon: TrendingUp,
      render: () => (
        <div className="space-y-6">
          {/* Quantitative Goals */}
          <div className="bg-purple-800/30 p-6 rounded-2xl border border-purple-500/30">
            <h3 className="text-xl font-bold text-white mb-4">Monthly Quantitative Goals</h3>
            <p className="text-purple-400 text-sm mb-4">
              Set realistic targets to expand your network.
            </p>
            <div className="space-y-3">
              {[
                { key: 'monthlyConversations', label: 'New conversations (5+ min)' },
                { key: 'monthlyContactExchanges', label: 'New contacts/social exchanges' },
                { key: 'monthlySecondMeetings', label: 'Second meetings/dates' },
                { key: 'monthlyNewFriendships', label: 'High-potential friendships' }
              ].map(goal => (
                <div key={goal.key} className="flex items-center justify-between gap-4">
                  <label className="text-purple-200 flex-1">{goal.label}</label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={formData.goals.quantity[goal.key]}
                    onChange={(e) => updateFormData(`goals.quantity.${goal.key}`, parseInt(e.target.value) || 0)}
                    className="w-20 px-3 py-2 bg-purple-950/50 border border-purple-600/50 rounded-lg text-white text-center"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Weekly Time Commitment */}
          <div className="bg-purple-800/30 p-6 rounded-2xl border border-purple-500/30">
            <label className="block text-lg font-bold text-white mb-4">
              Weekly Time Commitment (in hours)
            </label>
            <input
              type="range"
              min="1"
              max="15"
              value={formData.goals.weeklyTimeCommitment}
              onChange={(e) => updateFormData('goals.weeklyTimeCommitment', parseInt(e.target.value))}
              className="w-full h-3 bg-purple-900/50 rounded-full appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-sm text-purple-300 mt-2">
              <span>{formData.goals.weeklyTimeCommitment} hours</span>
            </div>
          </div>

          {/* Qualitative Goals - 90 Day Vision */}
          <div className="bg-purple-800/30 p-6 rounded-2xl border border-purple-500/30">
            <h3 className="text-xl font-bold text-white mb-4">90-Day Qualitative Vision</h3>
            <label className="block text-purple-200 mb-2">
              Describe how your social life *feels* in 90 days if you succeed.
            </label>
            <textarea
              value={formData.goals.quality.nineDayVision}
              onChange={(e) => updateFormData('goals.quality.nineDayVision', e.target.value)}
              placeholder="E.g., I feel confident walking into the gym. I have a regular Friday night group. My stress is lower..."
              className="w-full px-4 py-3 bg-purple-950/50 border-2 border-purple-500/30 rounded-xl text-white placeholder-purple-400 focus:outline-none focus:border-purple-400 resize-none"
              rows={3}
            />
          </div>

          {/* Accountability Preferences */}
          <div className="bg-purple-800/30 p-6 rounded-2xl border border-purple-500/30">
            <h3 className="text-xl font-bold text-white mb-4">Accountability Preferences</h3>
            <div className="grid md:grid-cols-2 gap-3">
              {[
                'Self-tracking/Journaling',
                'Weekly check-ins with the app',
                'Reporting to a friend/mentor',
                'Public goal declaration (e.g., social media)',
                'Consequence-based accountability'
              ].map(pref => (
                <button
                  key={pref}
                  onClick={() => toggleArrayItem('goals.accountabilityPreferences', pref)}
                  className={`p-3 rounded-xl text-sm transition-all text-left ${
                    formData.goals.accountabilityPreferences.includes(pref)
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-2 border-purple-400'
                      : 'bg-purple-900/30 text-purple-200 border border-purple-700/30 hover:border-purple-500/50'
                  }`}
                >
                  {pref}
                </button>
              ))}
            </div>
          </div>
        </div>
      )
    },

    // Step 8: Barriers & Support
    {
      title: 'Barriers & Support',
      subtitle: 'Identifying roadblocks and planning solutions',
      icon: Award,
      render: () => (
        <div className="space-y-6">
          {/* Primary Obstacles */}
          <div className="bg-purple-800/30 p-6 rounded-2xl border border-purple-500/30">
            <h3 className="text-xl font-bold text-white mb-4">Primary Obstacles to Action</h3>
            <p className="text-purple-400 text-sm mb-4">
              Select the main things holding you back from making new connections.
            </p>
            <div className="grid md:grid-cols-2 gap-3">
              {OBSTACLES.map(obstacle => (
                <button
                  key={obstacle.id}
                  onClick={() => toggleArrayItem('barriers.primaryObstacles', obstacle.id)}
                  className={`p-4 rounded-xl text-left transition-all ${
                    formData.barriers.primaryObstacles.includes(obstacle.id)
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-2 border-purple-400'
                      : 'bg-purple-900/30 text-purple-200 border border-purple-700/30 hover:border-purple-500/50'
                  }`}
                >
                  {obstacle.label}
                </button>
              ))}
            </div>
          </div>

          {/* Support Needs */}
          <div className="bg-purple-800/30 p-6 rounded-2xl border border-purple-500/30">
            <h3 className="text-xl font-bold text-white mb-4">What Support Do You Need?</h3>
            <div className="grid md:grid-cols-2 gap-3">
              {[
                'Scripts/Conversation starters',
                'Challenge-based tasks (e.g., talk to 3 people)',
                'Real-time crisis support',
                'Psychoeducation on social dynamics',
                'Guided meditations/pre-social routines',
                'Detailed post-interaction analysis'
              ].map(need => (
                <button
                  key={need}
                  onClick={() => toggleArrayItem('barriers.supportNeeds', need)}
                  className={`p-4 rounded-xl text-left transition-all ${
                    formData.barriers.supportNeeds.includes(need)
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-2 border-purple-400'
                      : 'bg-purple-900/30 text-purple-200 border border-purple-700/30 hover:border-purple-500/50'
                  }`}
                >
                  {need}
                </button>
              ))}
            </div>
          </div>

          {/* Past Successes */}
          <div className="bg-purple-800/30 p-6 rounded-2xl border border-purple-500/30">
            <h3 className="text-xl font-bold text-white mb-4">Past Successes</h3>
            <label className="block text-purple-200 mb-2">
              What has worked for you socially in the past? (Even small wins)
            </label>
            <textarea
              value={formData.barriers.pastSuccesses}
              onChange={(e) => updateFormData('barriers.pastSuccesses', e.target.value)}
              placeholder="E.g., I successfully joined a book club for 6 months. I found it easiest to talk to people when I complimented their work..."
              className="w-full px-4 py-3 bg-purple-950/50 border-2 border-purple-500/30 rounded-xl text-white placeholder-purple-400 focus:outline-none focus:border-purple-400 resize-none"
              rows={3}
            />
          </div>
        </div>
      )
    },

    // Step 9: App Preferences
    {
      title: 'App Preferences',
      subtitle: 'How should the app talk to you?',
      icon: Coffee,
      render: () => (
        <div className="space-y-6">
          {/* Motivation Style */}
          <div className="bg-purple-800/30 p-6 rounded-2xl border border-purple-500/30">
            <h3 className="text-xl font-bold text-white mb-4">Motivation Style</h3>
            <RadioGroup
              label="Which tone motivates you most?"
              options={[
                { value: 'gentle_encouragement', label: 'Gentle Encouragement' },
                { value: 'data_driven', label: 'Data-Driven/Metric Focus' },
                { value: 'tough_love', label: 'Direct/Challenging' },
              ]}
              selected={formData.appPreferences.motivationStyle}
              onChange={(value) => updateFormData('appPreferences.motivationStyle', value)}
            />
          </div>

          {/* Notifications */}
          <div className="bg-purple-800/30 p-6 rounded-2xl border border-purple-500/30">
            <h3 className="text-xl font-bold text-white mb-4">Notification Settings</h3>

            {/* Daily Reminders */}
            <div className="flex justify-between items-center p-3 border-b border-purple-700/50">
              <span className="text-purple-200">Daily Reminders (Action Plan)</span>
              <input
                type="time"
                value={formData.appPreferences.notifications.dailyReminders.time}
                onChange={(e) => updateFormData('appPreferences.notifications.dailyReminders.time', e.target.value)}
                disabled={!formData.appPreferences.notifications.dailyReminders.enabled}
                className="bg-purple-950/50 border border-purple-600/50 rounded-lg text-white px-2 py-1"
              />
              <input
                type="checkbox"
                checked={formData.appPreferences.notifications.dailyReminders.enabled}
                onChange={(e) => updateFormData('appPreferences.notifications.dailyReminders.enabled', e.target.checked)}
                className="w-5 h-5 text-purple-600 bg-gray-700 rounded border-gray-600 focus:ring-purple-500"
              />
            </div>

            {/* Weekly Checkins */}
            <div className="flex justify-between items-center p-3 border-b border-purple-700/50">
              <span className="text-purple-200">Weekly Progress Check-ins</span>
              <select
                value={formData.appPreferences.notifications.weeklyCheckins.day}
                onChange={(e) => updateFormData('appPreferences.notifications.weeklyCheckins.day', e.target.value)}
                disabled={!formData.appPreferences.notifications.weeklyCheckins.enabled}
                className="bg-purple-950/50 border border-purple-600/50 rounded-lg text-white px-2 py-1"
              >
                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(d => <option key={d} value={d} className="capitalize">{d}</option>)}
              </select>
              <input
                type="checkbox"
                checked={formData.appPreferences.notifications.weeklyCheckins.enabled}
                onChange={(e) => updateFormData('appPreferences.notifications.weeklyCheckins.enabled', e.target.checked)}
                className="w-5 h-5 text-purple-600 bg-gray-700 rounded border-gray-600 focus:ring-purple-500"
              />
            </div>

            {/* Other Toggles */}
            {[
              { key: 'achievementUnlocks', label: 'Achievement unlocks/Badges' },
              { key: 'streakWarnings', label: 'Streak warnings/Reminders' },
              { key: 'opportunityAlerts', label: 'Nearby social opportunity alerts' }
            ].map(item => (
              <div key={item.key} className="flex justify-between items-center p-3 border-b border-purple-700/50 last:border-b-0">
                <span className="text-purple-200">{item.label}</span>
                <input
                  type="checkbox"
                  checked={formData.appPreferences.notifications[item.key].enabled}
                  onChange={(e) => updateFormData(`appPreferences.notifications.${item.key}.enabled`, e.target.checked)}
                  className="w-5 h-5 text-purple-600 bg-gray-700 rounded border-gray-600 focus:ring-purple-500"
                />
              </div>
            ))}
          </div>
        </div>
      )
    },

    // Step 10: Review and Complete
    {
      title: 'Review and Complete',
      subtitle: 'Almost done! Save your social roadmap.',
      icon: Check,
      render: () => (
        <div className="text-center space-y-6">
          <Check className="w-20 h-20 text-green-400 mx-auto bg-green-900/30 p-4 rounded-full mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">
            Your Personalized Social Roadmap is Ready
          </h2>
          <p className="text-lg text-purple-200 max-w-2xl mx-auto">
            Review your inputs. Once you save, we'll generate your first weekly action plan and personalized connection opportunities based on your data.
          </p>

          <div className="bg-purple-800/30 p-6 rounded-2xl border border-purple-500/30 text-left">
            <h3 className="text-2xl font-bold text-purple-300 mb-4">Key Insights Summary:</h3>
            <ul className="text-purple-200 space-y-2 text-sm">
              <li>
                <span className="font-semibold text-white">Satisfaction Score:</span> {formData.satisfactionScore}/10
              </li>
              <li>
                <span className="font-semibold text-white">Top Challenge:</span> {formData.biggestChallenges[0] || 'Not specified'}
              </li>
              <li>
                <span className="font-semibold text-white">Social Style:</span> {formData.socialEnergyProfile} / Prefers {formData.idealSetting.replace('_', ' ')}
              </li>
              <li>
                <span className="font-semibold text-white">Strategy:</span> {formData.connectionApproach.replace('_', ' ')}
              </li>
              <li>
                <span className="font-semibold text-white">Commitment:</span> {formData.goals.weeklyTimeCommitment} hours/week
              </li>
              <li>
                <span className="font-semibold text-white">Primary Obstacle:</span> {OBSTACLES.find(o => o.id === formData.barriers.primaryObstacles[0])?.label || 'None selected'}
              </li>
            </ul>
          </div>

          <div className="mt-8 pt-6 border-t border-purple-500/30">
            {user ? (
              <button
                onClick={saveToFirestore}
                disabled={saving}
                className={`px-8 py-4 w-full md:w-auto bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl font-bold text-lg text-white transition-all shadow-xl inline-flex items-center justify-center gap-2 ${
                  saving ? 'opacity-70 cursor-not-allowed' : 'hover:from-green-400 hover:to-teal-400'
                }`}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" /> Save Roadmap & Finish
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleGoogleSignIn}
                className="px-8 py-4 w-full md:w-auto bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl font-bold text-lg text-white transition-all shadow-xl inline-flex items-center justify-center gap-2 hover:from-blue-400 hover:to-indigo-400"
              >
                Sign In with Google to Save
              </button>
            )}
            <p className="text-purple-400 text-sm mt-3">
              Your data is securely saved to your private profile.
            </p>
          </div>
        </div>
      )
    }
  ];

  const currentStepData = steps[currentStep];
  const totalSteps = steps.filter(s => !s.skip || !s.skip()).length;
  const currentVisibleStepIndex = steps.filter((s, i) => i <= currentStep && (!s.skip || !s.skip())).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
        <span className="ml-3">Loading profile...</span>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-3xl w-full bg-gradient-to-br from-[#310b50] to-[#1a0033] p-8 md:p-12 rounded-3xl shadow-2xl text-center text-white space-y-6 border border-purple-600/50">
          <Check className="w-20 h-20 text-green-400 mx-auto bg-green-900/30 p-4 rounded-full mb-6" />
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
            Onboarding Complete!
          </h1>
          <p className="text-xl text-purple-200">
            Your personalized social roadmap is saved and active.
          </p>
          <p className="text-md text-purple-300">
            You can now proceed to your main dashboard to view your first weekly action plan and curated connection opportunities.
          </p>
          <button
            onClick={() => window.location.reload()} // Placeholder for navigating to dashboard
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl font-bold text-lg hover:from-purple-500 hover:to-pink-500 transition-all shadow-xl inline-flex items-center gap-2 mt-4"
          >
            Go to Dashboard <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-50 bg-gradient-to-br from-[#310b50] to-[#1a0033] text-white font-sans flex justify-center p-4 sm:p-8">
      {/* Custom Message Box for non-alert messages */}
      <div id="message-box" className="fixed top-4 right-4 bg-red-600 text-white p-3 rounded-lg shadow-xl hidden z-50"></div>

      <div className="max-w-3xl w-full">
        {/* Header and Progress Bar (Hidden on Welcome Step) */}
        {currentStep > 0 && (
          <div className="mb-8 p-4 bg-gradient-to-br from-[#310b50] to-[#1a0033] rounded-2xl shadow-xl sticky top-0 z-10 border border-purple-700/50">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center text-purple-400">
                <currentStepData.icon className="w-5 h-5 mr-2" />
                <span className="font-semibold">
                  Step {currentVisibleStepIndex} of {totalSteps}
                </span>
              </div>
              {user && (
                <div className="text-sm text-green-400 flex items-center">
                  <span className="truncate max-w-[100px]">{user.email}</span>
                  <Check className="w-4 h-4 ml-1" />
                </div>
              )}
            </div>
            <div className="w-full bg-purple-900/50 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(currentVisibleStepIndex / totalSteps) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Quiz Card */}
        <div className="bg-gradient-to-br from-[#310b50] to-[#1a0033] p-6 md:p-10 rounded-3xl shadow-2xl border border-purple-600/50">
          <header className="mb-8 text-center">
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              {currentStepData.title}
            </h1>
            <p className="text-xl text-purple-300 mt-2">{currentStepData.subtitle}</p>
          </header>

          <main>
            {currentStepData.render()}
          </main>

          {/* Navigation */}
          <footer className="flex justify-between mt-10 pt-6 border-t border-purple-700/50">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className={`px-4 py-3 rounded-xl font-semibold transition-colors flex items-center gap-2 ${
                currentStep === 0
                  ? 'text-gray-600 bg-gradient-to-br from-[#310b50] to-[#1a0033] cursor-not-allowed'
                  : 'bg-purple-700 hover:bg-purple-600 text-white'
              }`}
            >
              <ArrowLeft className="w-5 h-5" /> Back
            </button>

            {currentStep < steps.length - 1 && (
              <button
                onClick={nextStep}
                className="px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-bold hover:from-purple-500 hover:to-pink-500 transition-all flex items-center gap-2"
              >
                Next <ArrowRight className="w-5 h-5" />
              </button>
            )}
            {currentStep === steps.length - 1 && (
              <button
                onClick={saveToFirestore}
                disabled={saving}
                className={`px-6 py-3 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl font-bold text-white transition-all flex items-center gap-2 ${
                  saving ? 'opacity-70 cursor-not-allowed' : 'hover:from-green-400 hover:to-teal-400'
                }`}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    Finish & Save <Check className="w-5 h-5" />
                  </>
                )}
              </button>
            )}
          </footer>
        </div>
      </div>
    </div>
  );
}
