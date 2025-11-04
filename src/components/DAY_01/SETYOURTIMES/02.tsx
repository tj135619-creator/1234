import React, { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc, updateDoc , getDoc } from 'firebase/firestore';
import { db } from './firebase.js'; // or wherever your Firebase config is
import {ArrowRight,   // ✅ Added
  ArrowLeft , Clock, Coffee, Moon, Sun, Sunrise, CheckCircle, Target, Users, Brain, Heart, MessageCircle, Eye, Award, Plus, X, Play, Star, Sparkles, Trophy, Flame, Edit2, Calendar } from 'lucide-react';
import { auth } from './firebase.js';

  export  const InlineAnalogClock = ({ value, onChange, onConfirm, onCancel }) => {
  const [hours, minutes] = (value || '09:00').split(':').map(Number);
  const [selectedHour, setSelectedHour] = useState(hours);
  const [selectedMinute, setSelectedMinute] = useState(minutes);
  const [mode, setMode] = useState('hours');

  const handleClockClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const x = e.clientX - rect.left - centerX;
    const y = e.clientY - rect.top - centerY;
    
    const angle = Math.atan2(y, x) * (180 / Math.PI) + 90;
    const normalizedAngle = angle < 0 ? angle + 360 : angle;
    
    if (mode === 'hours') {
      const hour = Math.round(normalizedAngle / 30) % 12;
      setSelectedHour(hour === 0 ? 12 : hour);
      setMode('minutes');
    } else {
      const minute = Math.round(normalizedAngle / 6) % 60;
      setSelectedMinute(minute);
    }
  };

  const handleConfirm = () => {
    const formattedTime = `${selectedHour.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}`;
    onChange(formattedTime);
    onConfirm();
  };

  useEffect(() => {
    const formattedTime = `${selectedHour.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}`;
    onChange(formattedTime);
  }, [selectedHour, selectedMinute]);

  const hourAngle = ((selectedHour % 12) * 30) - 90;
  const minuteAngle = (selectedMinute * 6) - 90;

  return (
    <div className="bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-xl rounded-2xl p-6 border-2 border-white/30 mb-4 animate-slideDown">
      <div id="page-top-anchor" style={{ height: "1px", visibility: "hidden" }} />
      <div className="text-center mb-4">
        <h3 className="text-xl font-bold text-white mb-1">Set Time</h3>
        <p className="text-white/70 text-sm">Click to select {mode === 'hours' ? 'hour' : 'minute'}</p>
      </div>

      {/* Digital Display */}
      <div className="bg-white/20 rounded-xl p-3 mb-4 text-center">
        <div className="text-4xl font-bold text-white font-mono">
          {selectedHour.toString().padStart(2, '0')}:{selectedMinute.toString().padStart(2, '0')}
        </div>
      </div>

      {/* 3D Analog Clock */}
      <div className="relative mb-4">
        <div 
          onClick={handleClockClick}
          className="relative w-56 h-56 mx-auto bg-gradient-to-br from-white/20 to-white/5 rounded-full border-4 border-white/30 shadow-2xl cursor-pointer hover:border-white/50 transition-all"
          style={{
            boxShadow: '0 20px 60px rgba(0,0,0,0.3), inset 0 0 20px rgba(255,255,255,0.1)'
          }}
        >
          {/* Clock Numbers */}
          {[...Array(12)].map((_, i) => {
            const angle = (i * 30) - 90;
            const x = Math.cos(angle * Math.PI / 180) * 85;
            const y = Math.sin(angle * Math.PI / 180) * 85;
            return (
              <div
                key={i}
                className="absolute text-white font-bold text-base"
                style={{
                  left: `calc(50% + ${x}px - 10px)`,
                  top: `calc(50% + ${y}px - 10px)`,
                  width: '20px',
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {i === 0 ? 12 : i}
              </div>
            );
          })}

          {/* Center Dot */}
          <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2 z-20 shadow-lg" />

          {/* Hour Hand */}
          {mode === 'hours' && (
            <div
              className="absolute top-1/2 left-1/2 origin-left"
              style={{
                width: '60px',
                height: '6px',
                backgroundColor: '#60a5fa',
                transform: `rotate(${hourAngle}deg) translateY(-50%)`,
                borderRadius: '3px',
                boxShadow: '0 2px 8px rgba(96, 165, 250, 0.6)',
                transition: 'transform 0.3s ease'
              }}
            />
          )}

          {/* Minute Hand */}
          {mode === 'minutes' && (
            <div
              className="absolute top-1/2 left-1/2 origin-left"
              style={{
                width: '80px',
                height: '4px',
                backgroundColor: '#34d399',
                transform: `rotate(${minuteAngle}deg) translateY(-50%)`,
                borderRadius: '2px',
                boxShadow: '0 2px 8px rgba(52, 211, 153, 0.6)',
                transition: 'transform 0.3s ease'
              }}
            />
          )}

          {/* Clock Ticks */}
          {[...Array(60)].map((_, i) => {
            const angle = (i * 6) - 90;
            const isHourTick = i % 5 === 0;
            const length = isHourTick ? 12 : 6;
            const width = isHourTick ? 2 : 1;
            return (
              <div
                key={i}
                className="absolute top-1/2 left-1/2 origin-left"
                style={{
                  width: `${length}px`,
                  height: `${width}px`,
                  backgroundColor: 'rgba(255,255,255,0.3)',
                  transform: `rotate(${angle}deg) translateX(95px) translateY(-50%)`,
                  borderRadius: '2px'
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setMode('hours')}
          className={`flex-1 py-2 rounded-lg font-bold transition-all text-sm ${
            mode === 'hours'
              ? 'bg-blue-500 text-white'
              : 'bg-white/10 text-white/70'
          }`}
        >
          Hours
        </button>
        <button
          onClick={() => setMode('minutes')}
          className={`flex-1 py-2 rounded-lg font-bold transition-all text-sm ${
            mode === 'minutes'
              ? 'bg-emerald-500 text-white'
              : 'bg-white/10 text-white/70'
          }`}
        >
          Minutes
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2 bg-white/10 text-white rounded-lg font-bold border border-white/30 hover:bg-white/20 transition-all text-sm"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-bold hover:from-blue-600 hover:to-purple-600 transition-all flex items-center justify-center gap-2 text-sm"
        >
          <CheckCircle className="w-4 h-4" />
          Confirm
        </button>
      </div>
    </div>
  );
};

export default function SetYourTimes02({ onComplete }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [phase, setPhase] = useState('welcome');
  const [showClockPicker, setShowClockPicker] = useState(false);
  const [clockPickerTaskId, setClockPickerTaskId] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(0);
    const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [planningPhase, setPlanningPhase] = useState('intro'); // 'intro', 'setTime', 'summary'
  const [userProfile, setUserProfile] = useState({
    socialCircle: '',
    dailyInteractions: '',
    comfort: '',
    todayGoal: ''
  });
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(1);
  
  
  const userId = auth.currentUser?.uid;// From your Firestore screenshot
  const datedCourseId = 'social_skills'; 

  // Update for nested collection
  const datedCourseDocRef = doc(db, 'users', userId, 'datedcourses', datedCourseId);

 // Fetch and process only Day 1 tasks from Firestore (social_skills)
// Fetch and process only Day 1 tasks from Firestore (social_skills)
// Fetch and process only Day 1 tasks from Firestore (social_skills)
useEffect(() => {
  console.log('🔥 Firestore useEffect started in SetYourTimes02');

  if (!userId) {
    console.warn('⚠️ No userId found, skipping Firestore listener.');
    return;
  }

  const path = `users/${userId}/datedcourses/social_skills`;
  console.log('📄 Fetching Firestore path ONCE:', path);

  const datedCourseDocRef = doc(db, 'users', userId, 'datedcourses', 'social_skills');

  // ✅ USE getDoc() INSTEAD OF onSnapshot() - Fetches ONCE, no continuous listening
  const fetchTasks = async () => {
    try {
      const docSnap = await getDoc(datedCourseDocRef);
      
      console.log('📡 Data fetched (one-time).');
      console.log('➡️ Document exists:', docSnap.exists());

      if (!docSnap.exists()) {
        console.warn('❌ No document found at:', path);
        return;
      }

      const data = docSnap.data();
      console.log('📦 Firestore document data:', data);

      const overview = data.task_overview;
      if (!overview || !overview.days || !Array.isArray(overview.days)) {
        console.warn('⚠️ No valid task_overview.days array.');
        return;
      }

      console.log(`📅 Found ${overview.days.length} total days in task_overview.`);
      const day1 = overview.days[0];

      if (!day1 || !Array.isArray(day1.tasks)) {
        console.warn('⚠️ No tasks found in Day 1.');
        return;
      }

      console.log('🗓️ Processing Day 1:', day1);

      const day1Tasks = day1.tasks.map((task, i) => {
        const title = task.title || `Unnamed Task ${i + 1}`;
        const description = task.description || 'No description available';

        console.log(`🧠 Day 1 → Task ${i + 1}:`, { title, description, ...task });

        return {
          id: `day1_task_${i}`,
          title,
          description,
          location: task.location || 'Not specified',
          comfortLevel: task.comfortLevel || 'unknown',
          estimatedTime: task.estimatedTime || 'unspecified',
          xp: task.xp || 0,
          type: task.type || 'friend',
          scheduled_time: task.scheduled_time || new Date().toISOString(),
          time_of_day: task.time_of_day || 'morning',
          done: task.done || false,
        };
      });

      console.log(`✅ Processed ${day1Tasks.length} tasks from Day 1.`);
      setTasks(day1Tasks);
      console.log('🧭 Updated state with Day 1 tasks:', day1Tasks);
      
    } catch (error) {
      console.error('🔥 Firestore fetch error:', error);
    }
  };

  fetchTasks();

  console.log('👂 One-time fetch initiated.');

  // ✅ No cleanup needed since we're not using onSnapshot
}, [userId]);



  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Save updates to Firestore whenever relevant state changes
  useEffect(() => {
    setDoc(datedCourseDocRef, { userProfile, tasks, xp, streak }, { merge: true });
  }, [userProfile, tasks, xp, streak]);

  const handleQuestionAnswer = (questionId, value) => {
    setUserProfile(prev => ({ ...prev, [questionId]: value }));
  };

  const transformFirestoreTasks = (firestoreData, date) => {
  const lessonData = firestoreData?.lessons_by_date?.[date];
  if (!lessonData?.tasks) return [];

  return lessonData.tasks.map((task, index) => ({
    id: `task-${date}-${index}`,
    name: task.task.replace(/\*\*/g, ''), // Remove ** markdown
    duration: 10, // Default duration
    color: 'bg-blue-500', // Default color
    icon: CheckCircle, // Default icon
    description: task.task.replace(/\*\*/g, ''),
    xp: 50, // Default XP
    time: `${9 + index}:00`, // Auto-generate times (9:00, 10:00, etc.)
    completed: task.done
  }));
};

  const nextQuestion = () => {
    if (questionIndex < questions.length - 1) {
      setQuestionIndex(prev => prev + 1);
    } else {
      updateDoc(datedCourseDocRef, { userProfile });
      setPhase('planning');
    }
  };
  /*
  const generateSuggestedTasks = () => {
    const socialCircle = userProfile.socialCircle || 'none';
    const taskList = taskTemplates[socialCircle] || taskTemplates.none;

    const generatedTasks = taskList.map(task => ({
      ...task,
      id: `${task.id}-${Date.now()}`,
      time: task.suggestedTime,
      completed: false
    }));

    setTasks(generatedTasks);
    updateDoc(datedCourseDocRef, { tasks: generatedTasks }); // save immediately
  };*/

  const toggleTaskComplete = async (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const updatedTasks = tasks.map(t =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    setTasks(updatedTasks);

    const xpChange = task.completed ? -task.xp : task.xp;
    setXp(prev => Math.max(0, prev + xpChange));

    await updateDoc(datedCourseDocRef, { tasks: updatedTasks, xp: xp + xpChange });
  };

  const updateTaskTime = async (taskId, newTime) => {
    const updatedTasks = tasks.map(t =>
      t.id === taskId ? { ...t, time: newTime } : t
    );
    setTasks(updatedTasks);
    setEditingTask(null);
    await updateDoc(datedCourseDocRef, { tasks: updatedTasks });
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

    const handleConfirm = () => {
  console.log('Locations confirmed and saved. Advancing to the next step.');
  
  if (typeof onComplete === 'function') {
    onComplete(); // safely calls parent
  }
};


  const questions = [
    {
      id: 'socialCircle',
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
      question: "Who do you interact with most often?",
      type: 'single',
      options: [
        { value: 'coworkers', label: 'Coworkers/Colleagues', icon: Users, desc: 'Office or work environment' },
        { value: 'family', label: 'Family Members', icon: Heart, desc: 'Close family at home' },
        { value: 'friends', label: 'Friends & Acquaintances', icon: MessageCircle, desc: 'Social groups and friends' },
        { value: 'strangers', label: 'Strangers/Public', icon: Eye, desc: 'New people, public settings' },
        { value: 'none', label: 'Minimal Interaction', icon: Moon, desc: 'I prefer limited contact' }
      ]
    },
    {
      id: 'dailyInteractions',
      icon: Clock,
      color: 'from-purple-500 to-pink-500',
      question: "How many conversations do you have daily?",
      type: 'single',
      options: [
        { value: 'none', label: '0-2 conversations', desc: 'I mostly keep to myself' },
        { value: 'few', label: '3-5 conversations', desc: 'Brief, necessary interactions' },
        { value: 'moderate', label: '6-10 conversations', desc: 'Regular social engagement' },
        { value: 'many', label: '10+ conversations', desc: 'Very social throughout day' }
      ]
    },
    {
      id: 'comfort',
      icon: Heart,
      color: 'from-rose-500 to-orange-500',
      question: "How comfortable are you in social situations?",
      type: 'single',
      options: [
        { value: 'anxious', label: 'Very Anxious', desc: 'Social situations stress me out' },
        { value: 'uncomfortable', label: 'Somewhat Uncomfortable', desc: 'I can manage but it\'s challenging' },
        { value: 'neutral', label: 'Neutral/Okay', desc: 'Neither comfortable nor anxious' },
        { value: 'comfortable', label: 'Pretty Comfortable', desc: 'I enjoy most social interactions' }
      ]
    },
    {
      id: 'todayGoal',
      icon: Target,
      color: 'from-emerald-500 to-teal-500',
      question: "What's your main focus for today?",
      type: 'single',
      options: [
        { value: 'start', label: 'Starting Conversations', icon: MessageCircle, desc: 'Breaking the ice with others' },
        { value: 'maintain', label: 'Maintaining Conversations', icon: Brain, desc: 'Keeping conversations flowing' },
        { value: 'confidence', label: 'Building Confidence', icon: Sparkles, desc: 'Feeling more self-assured' }
      ]
    }
  ];

 
  /*
  const taskTemplates = {
    coworkers: [
      { 
        id: 'morning-greeting', 
        name: 'Morning Office Greeting', 
        duration: 5, 
        color: 'bg-blue-500', 
        icon: Sun, 
        description: 'Greet 3 colleagues with eye contact and a smile',
        xp: 50,
        suggestedTime: '09:00'
      },
      { 
        id: 'lunch-chat', 
        name: 'Lunch Connection', 
        duration: 15, 
        color: 'bg-purple-500', 
        icon: Coffee, 
        description: 'Have a casual conversation during lunch break',
        xp: 100,
        suggestedTime: '13:00'
      },
      { 
        id: 'work-question', 
        name: 'Ask a Work Question', 
        duration: 10, 
        color: 'bg-emerald-500', 
        icon: MessageCircle, 
        description: 'Initiate a work-related conversation with a colleague',
        xp: 75,
        suggestedTime: '15:30'
      }
    ],
    family: [
      { 
        id: 'morning-connection', 
        name: 'Morning Family Check-in', 
        duration: 10, 
        color: 'bg-rose-500', 
        icon: Heart, 
        description: 'Have a meaningful conversation with a family member',
        xp: 50,
        suggestedTime: '08:00'
      },
      { 
        id: 'active-listening', 
        name: 'Practice Active Listening', 
        duration: 15, 
        color: 'bg-purple-500', 
        icon: Brain, 
        description: 'Listen attentively during family discussion',
        xp: 100,
        suggestedTime: '18:00'
      },
      { 
        id: 'dinner-conversation', 
        name: 'Dinner Table Talk', 
        duration: 20, 
        color: 'bg-amber-500', 
        icon: Coffee, 
        description: 'Lead or actively participate in dinner conversation',
        xp: 75,
        suggestedTime: '19:30'
      }
    ],
    none: [
      { 
        id: 'one-smile', 
        name: 'Smile at One Person', 
        duration: 2, 
        color: 'bg-yellow-500', 
        icon: Sun, 
        description: 'Make eye contact and smile at someone today',
        xp: 50,
        suggestedTime: '10:00'
      },
      { 
        id: 'small-exchange', 
        name: 'Brief Exchange', 
        duration: 5, 
        color: 'bg-blue-500', 
        icon: MessageCircle, 
        description: 'Say "thank you" or brief pleasantry to cashier/staff',
        xp: 75,
        suggestedTime: '14:00'
      },
      { 
        id: 'self-reflection', 
        name: 'Social Reflection', 
        duration: 10, 
        color: 'bg-purple-500', 
        icon: Brain, 
        description: 'Reflect on one social moment from your day',
        xp: 100,
        suggestedTime: '21:00'
      }
    ],
    friends: [
      { 
        id: 'initiate-chat', 
        name: 'Start a Conversation', 
        duration: 10, 
        color: 'bg-cyan-500', 
        icon: MessageCircle, 
        description: 'Reach out to a friend or start talking to someone',
        xp: 75,
        suggestedTime: '11:00'
      },
      { 
        id: 'group-participation', 
        name: 'Join Group Discussion', 
        duration: 20, 
        color: 'bg-purple-500', 
        icon: Users, 
        description: 'Contribute to a group conversation',
        xp: 100,
        suggestedTime: '16:00'
      },
      { 
        id: 'follow-up', 
        name: 'Follow Up', 
        duration: 15, 
        color: 'bg-emerald-500', 
        icon: Heart, 
        description: 'Send a message or continue a previous conversation',
        xp: 50,
        suggestedTime: '20:00'
      }
    ],
    strangers: [
      { 
        id: 'eye-contact', 
        name: 'Eye Contact Practice', 
        duration: 5, 
        color: 'bg-blue-500', 
        icon: Eye, 
        description: 'Maintain eye contact with 5 people in public',
        xp: 75,
        suggestedTime: '10:30'
      },
      { 
        id: 'casual-comment', 
        name: 'Make a Casual Comment', 
        duration: 5, 
        color: 'bg-amber-500', 
        icon: MessageCircle, 
        description: 'Make a friendly observation to a stranger',
        xp: 100,
        suggestedTime: '14:30'
      },
      { 
        id: 'ask-question', 
        name: 'Ask for Help/Info', 
        duration: 10, 
        color: 'bg-purple-500', 
        icon: Brain, 
        description: 'Ask someone for directions or recommendation',
        xp: 50,
        suggestedTime: '17:00'
      }
    ]
  };*/

  

 



  const CircularClock = () => {
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();

    return (
      <div className="relative w-48 h-48 sm:w-64 sm:h-64 mx-auto">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
          <defs>
            <linearGradient id="clockGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="50%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>
          
          <circle cx="100" cy="100" r="85" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="6" />
          
          <circle
            cx="100"
            cy="100"
            r="85"
            fill="none"
            stroke="url(#clockGradient)"
            strokeWidth="8"
            strokeDasharray={`${(hours * 15 + minutes * 0.25) * Math.PI * 85 / 180} ${2 * Math.PI * 85}`}
            strokeLinecap="round"
          />
        </svg>
        
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold text-white">
              {hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}
            </div>
            <div className="text-sm sm:text-base text-white/70 mt-1">
              {hours < 12 ? 'Morning' : hours < 18 ? 'Afternoon' : 'Evening'}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderWelcome = () => (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6">
      <div className="text-center max-w-2xl">
        <div className="mb-6 sm:mb-8">
          <CircularClock />
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-3 sm:mb-4">
          Social Skills Quest
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl text-white/80 mb-6 sm:mb-8 px-4">
          Plan your social interactions with precise timing
        </p>
        <div className="flex flex-wrap gap-3 sm:gap-4 justify-center mb-8 sm:mb-12 px-4">
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl border border-white/20">
            <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
            <span className="font-semibold text-white text-sm sm:text-base">Set Times</span>
          </div>
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl border border-white/20">
            <Star className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
            <span className="font-semibold text-white text-sm sm:text-base">Earn XP</span>
          </div>
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl border border-white/20">
            <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
            <span className="font-semibold text-white text-sm sm:text-base">Track Progress</span>
          </div>
        </div>
        <button
          onClick={() => setPhase('questions')}
          className="px-8 sm:px-12 py-4 sm:py-6 bg-white/20 backdrop-blur-sm text-white rounded-xl sm:rounded-2xl font-bold text-lg sm:text-xl border-2 border-white/30 hover:bg-white/30 transform hover:scale-105 transition-all inline-flex items-center gap-2 sm:gap-3"
        >
          <Play className="w-5 h-5 sm:w-6 sm:h-6" />
          Start Planning
        </button>
        {/* Inline Next Button */}
      
      </div>
    </div>
  );

  const renderQuestions = () => {
    const currentQ = questions[questionIndex];
    const Icon = currentQ.icon;
    const canProceed = userProfile[currentQ.id];

    return (
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6">
        <div className="max-w-2xl w-full">
          <div className="mb-6 sm:mb-8">
            <div className="flex justify-between items-center mb-3 sm:mb-4">
              {questions.map((q, i) => (
                <div key={i} className="flex items-center flex-1">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-sm sm:text-base transition-all ${
                    i < questionIndex 
                      ? 'bg-emerald-500 text-white' 
                      : i === questionIndex 
                        ? 'bg-white text-purple-600' 
                        : 'bg-white/20 text-white/60'
                  }`}>
                    {i < questionIndex ? <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" /> : i + 1}
                  </div>
                  {i < questions.length - 1 && (
                    <div className={`flex-1 h-1 sm:h-2 mx-1 sm:mx-2 rounded-full ${
                      i < questionIndex ? 'bg-emerald-500' : 'bg-white/20'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="text-center">
              <span className="text-white/80 text-sm sm:text-base">Question {questionIndex + 1} of {questions.length}</span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 border border-white/20">
            <div className={`inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br ${currentQ.color} rounded-2xl mb-4 sm:mb-6`}>
              <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            </div>
            
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-6 sm:mb-8">{currentQ.question}</h2>

            <div className="space-y-3 sm:space-y-4">
              {currentQ.options.map((option) => {
                const OptionIcon = option.icon;
                const isSelected = userProfile[currentQ.id] === option.value;

                return (
                  <button
                    key={option.value}
                    onClick={() => handleQuestionAnswer(currentQ.id, option.value)}
                    className={`w-full p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border-2 transition-all text-left ${
                      isSelected
                        ? 'bg-white/20 border-white text-white'
                        : 'bg-white/5 border-white/20 hover:border-white/40 text-white/90'
                    }`}
                  >
                    <div className="flex items-start gap-3 sm:gap-4">
                      {OptionIcon && (
                        <OptionIcon className={`w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 mt-1 ${isSelected ? 'text-white' : 'text-white/70'}`} />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-base sm:text-lg mb-1">
                          {option.label}
                        </div>
                        {option.desc && (
                          <div className={`text-xs sm:text-sm ${isSelected ? 'text-white/90' : 'text-white/60'}`}>
                            {option.desc}
                          </div>
                        )}
                      </div>
                      {isSelected && <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white flex-shrink-0" />}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-3 sm:gap-4 mt-6 sm:mt-8">
              {questionIndex > 0 && (
                <button
                  onClick={() => setQuestionIndex(questionIndex - 1)}
                  className="px-6 sm:px-8 py-3 sm:py-4 bg-white/10 text-white border border-white/30 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base hover:bg-white/20 transition-all"
                >
                  Back
                </button>
              )}
              <button
                onClick={nextQuestion}
                disabled={!canProceed}
                className="flex-1 px-6 sm:px-8 py-3 sm:py-4 bg-white/20 text-white rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base border-2 border-white/30 hover:bg-white/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {questionIndex === questions.length - 1 ? '📅 Create My Schedule' : 'Continue →'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

 const renderPlanning = () => {
  const completedCount = tasks.filter(t => t.done).length;
  const level = Math.floor(xp / 200) + 1;
  const xpInLevel = xp % 200;
  
  const displayTasks = tasks.map((task, index) => ({
    ...task,
    index,
    time: task.time || `${String(9 + index).padStart(2, '0')}:00`,
    color: task.color || 'bg-blue-500',
    icon: task.icon || CheckCircle,
    duration: task.duration || 10,
    xp: task.xp || 50,
    displayName: task.task?.replace(/\*\*/g, '') || task.title || 'Unnamed Task',
    description: task.description || task.task?.replace(/\*\*/g, '') || task.title || 'No description available'
  }));

  // ✅ ADD THIS SAFETY CHECK
  if (displayTasks.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-white text-xl mb-4">Loading tasks...</div>
          <div className="animate-spin w-12 h-12 border-4 border-white/20 border-t-white rounded-full mx-auto" />
        </div>
      </div>
    );
  }

  const currentTask = displayTasks[currentTaskIndex];
  
  // ✅ ADD THIS CHECK TOO
  if (!currentTask) {
    setCurrentTaskIndex(0);
    return null;
  }
  
  const isLastTask = currentTaskIndex === displayTasks.length - 1;
  const TaskIcon = currentTask?.icon || CheckCircle;
  
  // ... rest of the function

  // Task Introduction Page
  if (planningPhase === 'intro') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6">
        <div className="max-w-2xl w-full">
          {/* Progress Indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {displayTasks.map((_, idx) => (
              <div
                key={idx}
                className={`h-2 rounded-full transition-all duration-500 ${
                  idx < currentTaskIndex 
                    ? 'w-12 bg-emerald-500' 
                    : idx === currentTaskIndex
                      ? 'w-16 bg-gradient-to-r from-purple-500 to-pink-500'
                      : 'w-8 bg-white/20'
                }`}
              />
            ))}
          </div>

          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full border border-white/20 mb-4">
              <span className="text-white/70 text-sm">Task {currentTaskIndex + 1} of {displayTasks.length}</span>
            </div>
          </div>

          {/* Task Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 mb-8 animate-slide-in">
            <div className="flex items-center justify-center mb-6">
              <div className={`${currentTask.color} w-20 h-20 rounded-2xl flex items-center justify-center shadow-2xl`}>
                <TaskIcon className="w-10 h-10 text-white" />
              </div>
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
  {currentTask.displayName}
</h2>
<p className="text-white/90 text-center text-base mb-6 px-4">
  {currentTask.description || currentTask.displayName}
</p>

            <div className="flex items-center justify-center gap-6 mb-6">
              <div className="text-center">
                <div className="text-white/70 text-sm mb-1">Duration</div>
                <div className="text-2xl font-bold text-white">{currentTask.duration} min</div>
              </div>
              <div className="w-px h-12 bg-white/20" />
              <div className="text-center">
                <div className="text-white/70 text-sm mb-1">Reward</div>
                <div className="text-2xl font-bold text-yellow-400 flex items-center gap-1">
                  <Star className="w-5 h-5" />
                  +{currentTask.xp}
                </div>
              </div>
            </div>

            <p className="text-white/80 text-center text-lg leading-relaxed">
  {currentTask.description || currentTask.displayName}
</p>
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-4">
            {currentTaskIndex > 0 && (
              <button
                onClick={() => setCurrentTaskIndex(currentTaskIndex - 1)}
                className="px-6 py-4 bg-white/10 text-white rounded-xl font-bold border border-white/30 hover:bg-white/20 transition-all flex items-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                Previous
              </button>
            )}
            <button
              onClick={() => setPlanningPhase('setTime')}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:from-purple-500 hover:to-pink-500 transition-all flex items-center justify-center gap-2"
            >
              <Clock className="w-5 h-5" />
              Set Time
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Time Setting Page
  if (planningPhase === 'setTime') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6">
        <div className="max-w-2xl w-full">
          {/* Progress Indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {displayTasks.map((_, idx) => (
              <div
                key={idx}
                className={`h-2 rounded-full transition-all duration-500 ${
                  idx < currentTaskIndex 
                    ? 'w-12 bg-emerald-500' 
                    : idx === currentTaskIndex
                      ? 'w-16 bg-gradient-to-r from-purple-500 to-pink-500'
                      : 'w-8 bg-white/20'
                }`}
              />
            ))}
          </div>

          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-white mb-2">When will you do this?</h3>
            <p className="text-white/70">Choose the best time for: {currentTask.displayName}</p>
            <p className="text-white/60 text-sm mt-2 px-4">{currentTask.description || currentTask.displayName}</p>
          </div>

          {/* Clock Picker */}
          <InlineAnalogClock
            value={currentTask.time}
            onChange={(newTime) => {
              const updatedTasks = tasks.map(t =>
                t.index === currentTask.index ? { ...t, time: newTime } : t
              );
              setTasks(updatedTasks);
            }}
            onConfirm={() => {
              if (isLastTask) {
                setPlanningPhase('summary');
              } else {
                setCurrentTaskIndex(currentTaskIndex + 1);
                setPlanningPhase('intro');
              }
            }}
            onCancel={() => setPlanningPhase('intro')}
          />

          {/* Quick Time Suggestions */}
          <div className="mt-6">
            <p className="text-white/70 text-sm text-center mb-3">Quick suggestions:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {['09:00', '12:00', '15:00', '18:00', '20:00'].map(time => (
                <button
                  key={time}
                  onClick={() => {
                    const updatedTasks = tasks.map(t =>
                      t.index === currentTask.index ? { ...t, time } : t
                    );
                    setTasks(updatedTasks);
                  }}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-all text-sm font-semibold"
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Summary Page (All tasks configured)
  const sortedTasks = [...displayTasks].sort((a, b) => {
    const timeA = a.time || '00:00';
    const timeB = b.time || '00:00';
    return timeA.localeCompare(timeB);
  });

  return (
    <div className="min-h-screen p-4 sm:p-6">
      <div className="max-w-4xl mx-auto py-4 sm:py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full mb-4 animate-bounce-slow">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2">
            🎉 Schedule Complete!
          </h2>
          <p className="text-base sm:text-lg text-white/70">Your daily plan is ready</p>
        </div>

        {/* XP Progress Card */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-white/20 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white/70 text-xs sm:text-sm mb-1">Level {level}</div>
              <div className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
                <Star className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
                {xp} XP
              </div>
            </div>
            <div className="text-right">
              <div className="text-white/70 text-xs sm:text-sm mb-1">Progress</div>
              <div className="text-2xl sm:text-3xl font-bold text-white">{xpInLevel}/200</div>
            </div>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2 mt-3">
            <div 
              className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(xpInLevel / 200) * 100}%` }}
            />
          </div>
        </div>

        {/* Task List */}
        <div className="space-y-3 sm:space-y-4 mb-6">
          {sortedTasks.map((task, idx) => {
            const TaskIcon = task.icon || CheckCircle;
            return (
              <div
                key={task.index}
                className="bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-5 border-2 border-white/20 transition-all hover:border-white/40 animate-slide-in"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                    <span className="font-bold text-white text-base sm:text-lg min-w-[60px]">{task.time}</span>
                  </div>
                  
                  <div className={`${task.color} w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <TaskIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
  <h3 className="font-bold text-white text-base sm:text-lg">{task.displayName}</h3>
  <p className="text-white/70 text-xs sm:text-sm mb-1">{task.description || task.displayName}</p>
  <div className="text-xs sm:text-sm text-white/60">{task.duration} minutes • +{task.xp} XP</div>
</div>

                  <button
                    onClick={() => {
                      setCurrentTaskIndex(task.index);
                      setPlanningPhase('setTime');
                    }}
                    className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-all flex items-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span className="hidden sm:inline text-sm">Edit</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pro Tip */}
        <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-white/20 mb-6">
          <div className="flex items-start gap-3">
            <Calendar className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-white text-base sm:text-lg mb-1">💡 Pro Tip</h3>
              <p className="text-white/80 text-sm sm:text-base">You can edit any task time by clicking the "Edit" button. Schedule tasks during times when you naturally interact with others!</p>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <button
            onClick={() => {
              setCurrentTaskIndex(0);
              setPlanningPhase('intro');
            }}
            className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white/10 text-white rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base border border-white/30 hover:bg-white/20 transition-all"
          >
            ← Review Tasks
          </button>
          <button
            onClick={() => setPhase('summary')}
            className="flex-1 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base hover:from-purple-500 hover:to-pink-500 transition-all flex items-center justify-center gap-2"
          >
            <Trophy className="w-5 h-5" />
            Complete Schedule
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .animate-slide-in {
          animation: slide-in 0.5s ease-out backwards;
        }

        .animate-bounce-slow {
          animation: bounce-slow 2s infinite;
        }
      `}</style>
    </div>
  );
};

  const renderSummary = () => {
    const completedCount = tasks.filter(t => t.completed).length;
    const totalTime = tasks.filter(t => t.completed).reduce((sum, t) => sum + t.duration, 0);
    const level = Math.floor(xp / 200) + 1;
    const sortedTasks = [...tasks].sort((a, b) => {
  const timeA = a.time || '00:00';
  const timeB = b.time || '00:00';
  return timeA.localeCompare(timeB);
});

    return (
      <div className="min-h-screen p-4 sm:p-6">
        <div className="max-w-3xl mx-auto py-6 sm:py-12">
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-4 sm:mb-6 animate-bounce-slow">
              <Trophy className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white" />
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2 sm:mb-3">Quest Complete!</h2>
            <p className="text-base sm:text-lg md:text-xl text-white/70">Here's your daily breakdown</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
            <div className="bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20 text-center">
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-1 sm:mb-2">{completedCount}/{tasks.length}</div>
              <div className="text-xs sm:text-sm text-white/70 font-medium">Tasks Done</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20 text-center">
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-yellow-400 mb-1 sm:mb-2">{xp}</div>
              <div className="text-xs sm:text-sm text-white/70 font-medium">XP Earned</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20 text-center col-span-2 sm:col-span-1">
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-emerald-400 mb-1 sm:mb-2">{totalTime}m</div>
              <div className="text-xs sm:text-sm text-white/70 font-medium">Practice Time</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-md rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 border border-white/20 mb-6 sm:mb-8">
            <div className="text-center mb-6 sm:mb-8">
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">Level Progress</h3>
              <p className="text-white/70 text-sm sm:text-base">Keep going to reach the next level!</p>
            </div>
            
            <div className="flex justify-center mb-6 sm:mb-8">
              <div className="relative w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
                  <circle cx="100" cy="100" r="80" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="16" />
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke="url(#levelGradient)"
                    strokeWidth="16"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 80 * (completedCount / (tasks.length || 1))} ${2 * Math.PI * 80}`}
                  />
                  <defs>
                    <linearGradient id="levelGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#fbbf24" />
                      <stop offset="100%" stopColor="#f97316" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-1">
                      {tasks.length > 0 ? Math.round(completedCount / tasks.length * 100) : 0}%
                    </div>
                    <div className="text-sm sm:text-base text-white/70">Complete</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center gap-2 sm:gap-3 bg-white/10 px-4 sm:px-6 py-2 sm:py-3 rounded-full border border-white/20">
                <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
                <span className="text-lg sm:text-xl md:text-2xl font-bold text-white">Level {level}</span>
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-white/20 mb-6 sm:mb-8">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
              <Calendar className="w-6 h-6 sm:w-7 sm:h-7 text-blue-400" />
              Today's Schedule
            </h3>
            <div className="space-y-3 sm:space-y-4">
              {sortedTasks.map(task => {
                const TaskIcon = task.icon || CheckCircle;
                return (
                  <div
                    key={task.id}
                    className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl border-2 transition-all ${
                      task.completed 
                        ? 'bg-emerald-500/20 border-emerald-400' 
                        : 'bg-white/5 border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                      <span className="font-bold text-white text-base sm:text-lg">{task.time}</span>
                    </div>
                    <div className={`${task.color} w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <TaskIcon className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-white text-sm sm:text-base md:text-lg">{task.title}</div>
                      <div className="text-xs sm:text-sm text-white/70">{task.duration} minutes • +{task.xp} XP</div>
                    </div>
                    {task.completed ? (
                      <div className="flex items-center gap-1 sm:gap-2 text-emerald-400 font-bold text-xs sm:text-sm flex-shrink-0">
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="hidden sm:inline">Done!</span>
                      </div>
                    ) : (
                      <div className="text-white/40 font-medium text-xs sm:text-sm flex-shrink-0">Pending</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {completedCount > 0 && (
            <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-white/20 mb-6 sm:mb-8">
              <div className="flex items-start gap-3 sm:gap-4">
                <Flame className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-orange-400 flex-shrink-0 mt-1" />
                <div>
                  <div className="font-bold text-white text-lg sm:text-xl mb-1 sm:mb-2">🔥 {streak} Day Streak!</div>
                  <div className="text-white/80 text-sm sm:text-base">You're building incredible momentum. Keep your schedule tomorrow to maintain your streak!</div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-white/20 mb-6 sm:mb-8">
            <div className="flex items-start gap-3 sm:gap-4">
              <Brain className="w-6 h-6 sm:w-7 sm:h-7 text-blue-400 flex-shrink-0 mt-1" />
              <div>
                <div className="font-bold text-white text-base sm:text-lg mb-2">📊 Daily Insights</div>
                <div className="space-y-2 text-sm sm:text-base text-white/80">
                  {completedCount === tasks.length && (
                    <p>🎉 Perfect day! You completed all scheduled tasks on time.</p>
                  )}
                  {completedCount > 0 && completedCount < tasks.length && (
                    <p>💪 Good effort! Try to stick to your scheduled times tomorrow.</p>
                  )}
                  {completedCount === 0 && (
                    <p>🎯 Tomorrow is a new day! Set reminders for your scheduled times.</p>
                  )}
                  <p>⏰ Most productive time: {sortedTasks.find(t => t.completed)?.time || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              onClick={() => setPhase('planning')}
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white/10 text-white rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base border border-white/30 hover:bg-white/20 transition-all"
            >
              Edit Schedule
            </button>
            <button
  onClick={() => {
    // Reset task-related state
    setTasks([]);
    setCompletedTasks([]);
    setXp(0);
    setUserProfile({
      socialCircle: '',
      dailyInteractions: '',
      comfort: '',
      todayGoal: ''
    });

    // Increment streak
    setStreak(prev => prev + 1);

    // Advance question index instead of resetting
    setQuestionIndex(prev => prev + 1);

    // Call parent handler to confirm and advance step
    handleConfirm();
  }}
  className="flex-1 px-6 sm:px-8 py-3 sm:py-4 bg-white/20 text-white rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base border-2 border-white/30 hover:bg-white/30 transition-all flex items-center justify-center gap-2"
>
  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
  Next
</button>

          </div>
        </div>
      </div>
    );
  };

  return (
  <div className="min-h-screen text-white bg-gradient-to-br from-purple-950 via-purple-900 to-indigo-950 relative overflow-x-hidden">
    {/* Background overlay pattern */}
    <div className="absolute inset-0 opacity-30 pointer-events-none">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 40% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)',
        }}
      />
    </div>

    {/* Content */}
    <div className="relative z-10">
      {phase === 'welcome' && renderWelcome()}
      {phase === 'questions' && renderQuestions()}
      {phase === 'planning' && renderPlanning()}
      {phase === 'summary' && renderSummary()}
    </div>

    <style jsx>{`
      @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
      }

      @keyframes slideDown {
        from {
          opacity: 0;
          transform: translateY(-20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .animate-bounce-slow {
        animation: bounce 2s infinite;
      }

      .animate-slideDown {
        animation: slideDown 0.3s ease-out;
      }
    `}</style>
  </div>
);
}
