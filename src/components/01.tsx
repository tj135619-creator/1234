
import { useState, useEffect, useMemo } from "react";
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import {
  Trophy, Flame, Sparkles, RefreshCw, Check, ChevronLeft, ChevronRight,
  Zap, Target, Award, Clock, TrendingUp, Lock, CheckCircle2,
  AlertCircle, Lightbulb, RotateCcw, Play, Pause, Heart, MessageCircle,
  Calendar, X
} from "lucide-react";
import Confetti from "react-confetti";

// Firebase imports
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, updateDoc, collection, query, limit, getDocs } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

// ============ FIREBASE CONFIG ============
const firebaseConfig = {
  apiKey: "AIzaSyBNCXIOAX2HUdeLvUxkTJh7DVbv8JU485s",
  authDomain: "goalgrid-c5e9c.firebaseapp.com",
  projectId: "goalgrid-c5e9c",
  storageBucket: "goalgrid-c5e9c.firebasestorage.app",
  messagingSenderId: "544004357501",
  appId: "1:544004357501:web:4b81a3686422b28534e014",
  measurementId: "G-BJQMLK9JJ1"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// ============ INTERFACES ============

// A type for the fixed set of difficulty levels
type Difficulty = 'easy' | 'medium' | 'hard' | 'default';

// Interface for a single Task object
interface Task {
  task: string;
  done: boolean;
  difficulty: Difficulty;
  timeSpent: number;
  notes: string;
  // Add other properties if they exist in your data (like 'description' from task_overview)
}

// Interface for a single Lesson/Day object
interface Lesson {
  id: string;
  date: string;
  title: string;
  dayNumber: number;
  unlocked: boolean;
  motivationalQuote: string;
  summary: string;
  xpPerTask: number;
  tasks: Task[];
}

// Interface for the lessons_by_date structure from Firestore
interface FirestoreLesson {
  title?: string;
  quote?: string;
  motivation?: string;
  summary?: string;
  tasks: Record<string, any> | Task[] | undefined; // Flexible for the old format
}

// Interface for the overall lessons_by_date data structure
interface LessonsByDate {
  [date: string]: FirestoreLesson;
}

// ============ HELPER FUNCTIONS ============



const getDifficultyColor = (difficulty: Difficulty) => {
  switch (difficulty) {
    case 'easy': return 'from-green-500 to-emerald-500';
    case 'medium': return 'from-yellow-500 to-orange-500';
    case 'hard': return 'from-red-500 to-pink-500';
    default: return 'from-purple-500 to-pink-500';
  }
};

const getDifficultyXPMultiplier = (difficulty: Difficulty) => {
  switch (difficulty) {
    case 'easy': return 1;
    case 'medium': return 1.5;
    case 'hard': return 2;
    default: return 1;
  }
};

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const determineDifficulty = (taskText: string): Difficulty => {
  const lowerTask = taskText.toLowerCase();
  if (lowerTask.includes('review') || lowerTask.includes('reflect') || lowerTask.includes('schedule') || lowerTask.includes('take a few minutes')) {
    return 'easy';
  } else if (lowerTask.includes('practice') || lowerTask.includes('connect') || lowerTask.includes('reach out') || lowerTask.includes('write')) {
    return 'medium';
  } else {
    return 'hard';
  }
};

const OnboardingScreen = ({ onDismiss }) => {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-purple-950 via-indigo-950 to-purple-900 flex items-center justify-center p-4 md:p-8 overflow-hidden rounded-[3rem] md:rounded-[4rem]">
      {/* Color layer */}
      

      <div className="max-w-xl w-full relative z-10">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center justify-center gap-3 mb-6">
            <motion.div
              animate={{ 
                rotate: [0, 360],
                scale: [1, 1.2, 1]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Sparkles className="w-12 h-12 text-yellow-300" />
            </motion.div>
          </div>
          
          <motion.h1 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-purple-200 via-pink-200 to-purple-300 bg-clip-text text-transparent leading-tight"
          >
            Welcome! 👋
          </motion.h1>
          
          <motion.p 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-2xl text-purple-200 mb-4 font-semibold leading-relaxed"
          >
            This is where you start your day
          </motion.p>
          
          <motion.p 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-purple-300/80 leading-relaxed"
          >
            Let's make today amazing together
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="relative bg-gradient-to-br from-blue-900/60 via-cyan-900/50 to-blue-900/60 backdrop-blur-xl border-2 border-blue-400/50 rounded-3xl p-8 mb-8 shadow-2xl shadow-blue-500/30 overflow-hidden group hover:border-blue-300/70 transition-all duration-300"
        >
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-gradient-to-br from-blue-500/40 to-cyan-500/40 p-4 rounded-2xl border border-blue-400/30 shadow-lg">
                <Sparkles className="w-10 h-10 text-blue-200" />
              </div>
              <h3 className="text-2xl md:text-3xl font-black text-white leading-tight">
                Get Live Action Support
              </h3>
            </div>
            <p className="text-blue-50 text-lg md:text-xl leading-relaxed font-medium">
              Click the <span className="inline-flex items-center gap-1 font-black text-blue-200 bg-blue-500/30 px-3 py-1 rounded-full border border-blue-400/40">🤖 AI Coach</span> button on any task to get personalized, real-time guidance that adapts to your needs.
            </p>
          </div>
          
          {/* Decorative corner accents */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-blue-400/20 to-transparent rounded-bl-3xl"></div>
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-cyan-400/20 to-transparent rounded-tr-3xl"></div>
        </motion.div>

        <motion.button
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          onClick={onDismiss}
          className="relative w-full py-6 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:via-pink-500 hover:to-purple-500 rounded-3xl font-black text-white text-2xl shadow-2xl shadow-purple-500/60 transition-all border-2 border-purple-400/50 hover:border-purple-300/70 overflow-hidden group"
          style={{
            backgroundSize: '200% 100%',
            animation: 'gradient-shift 3s ease infinite'
          }}
        >
          {/* Button shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
          
          <span className="relative z-10 flex items-center justify-center gap-3">
            Let's Go! 🚀
          </span>
        </motion.button>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-purple-300/60 text-sm mt-6 font-medium"
        >
          Your journey to growth starts now
        </motion.p>
      </div>

      <style>{`
        @keyframes gradient-shift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
    </div>
  );
};

export default function TodayActionCard() {
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [openRegenDialog, setOpenRegenDialog] = useState(false);
  const [regenInstructions, setRegenInstructions] = useState("");
  const [activeTimer, setActiveTimer] = useState(null);
  const [loadingLiveSupport, setLoadingLiveSupport] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [expandedTaskNote, setExpandedTaskNote] = useState(null);
  const [taskNotes, setTaskNotes] = useState({});
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [dayTasks, setDayTasks] = useState<Lesson[]>([]);

  const [hoveredTask, setHoveredTask] = useState(null);
  
  // Firestore specific state
  const [loading, setLoading] = useState(true);
  const [firestoreDocId, setFirestoreDocId] = useState(null);
  const [userId, setUserId] = useState(null);
  const [error, setError] = useState(null);

  // Check if first time user
  

  useEffect(() => {
  const hasSeenThisSession = sessionStorage.getItem('hasSeenOnboarding');
  if (!hasSeenThisSession && dayTasks.length > 0) {
    setTimeout(() => setShowOnboarding(true), 2000);
  }
}, [dayTasks]);



const handleDismissOnboarding = () => {
  sessionStorage.setItem('hasSeenOnboarding', 'true');  // Remember this session
  setShowOnboarding(false);
};

  // ============ AUTH LISTENER ============
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
        setError("Please log in to view your tasks");
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // ============ FETCH FROM FIRESTORE ============
  // ============ FETCH FROM FIRESTORE ============
useEffect(() => {
  if (!userId) return;

  const fetchTasksFromFirestore = async () => {
    try {
      setLoading(true);
      setError(null);

      // Directly access the social_skills document
      const docRef = doc(db, `users/${userId}/datedcourses`, 'social_skills');
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        setError("No social_skills course found. Please create a course first.");
        setLoading(false);
        return;
      }

      const data = docSnap.data();
      setFirestoreDocId('social_skills');

      // ONLY handle task_overview format
      if (!data.task_overview || !data.task_overview.days) {
        setError("No task_overview found in social_skills course.");
        setLoading(false);
        return;
      }

      console.log("✅ Reading from task_overview format in social_skills doc");
      const transformedTasks = transformTaskOverview(data.task_overview.days);
      
      setDayTasks(transformedTasks);

      // Find today's index or last unlocked day
      const today = new Date().toISOString().split("T")[0];
      const todayIndex = transformedTasks.findIndex(day => day.date === today);
      
      if (todayIndex >= 0) {
        setCurrentDayIndex(todayIndex);
      } else {
        const lastUnlockedIndex = transformedTasks.reduce((lastIdx, day, idx) => 
          day.unlocked ? idx : lastIdx, 0
        );
        setCurrentDayIndex(lastUnlockedIndex);
      }

      setLoading(false);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setError(`Error loading tasks: ${err.message}`);
      setLoading(false);
    }
  };

  fetchTasksFromFirestore();
}, [userId]);

// ============ TRANSFORM task_overview.days FORMAT ============
const transformTaskOverview = (days: any[]): Lesson[] => {
  return days.map((day: any, index: number): Lesson => {
    // Check if previous day is complete for unlocking
    const prevDayComplete = index === 0 || (
      days[index - 1].tasks.every(t => t.done === true)
    );
    
    const tasksArray = day.tasks.map((task: any, taskIdx: number): Task => ({
      task: task.description,
      done: task.done || false,
      difficulty: determineDifficultyFromDay(day.day),
      timeSpent: task.timeSpent || 0,
      notes: task.notes || ''
    }));
    
    return {
      id: `day${day.day}`,
      date: day.date,
      title: day.title,
      dayNumber: day.day,
      unlocked: prevDayComplete,
      motivationalQuote: `Day ${day.day} - ${day.title}`,
      summary: day.summary,
      xpPerTask: 20,
      tasks: tasksArray
    };
  });
};


// ============ NEW: Helper function for difficulty ============
const determineDifficultyFromDay = (dayNumber: number): Difficulty => {
  if (dayNumber === 1) return 'easy';
  if (dayNumber === 2 || dayNumber === 3) return 'medium';
  return 'hard';
};

// ============ TRANSFORM FIRESTORE DATA ============
const transformFirestoreData = (lessonsByDate: LessonsByDate): Lesson[] => {
  const sortedDates = Object.keys(lessonsByDate).sort();
  
  return sortedDates.map((date: string, index: number): Lesson => {
    const lesson = lessonsByDate[date];
    
    const getTasksArray = (tasks: any[]): Task[] => {
      if (!tasks) return [];
      if (Array.isArray(tasks)) {
        return tasks;
      }
      return Object.values(tasks);
    };
    
    const prevDayTasks = index > 0 ? getTasksArray(lessonsByDate[sortedDates[index - 1]].tasks) : [];
    const isUnlocked = index === 0 || prevDayTasks.every(t => t && t.done);
    
    const rawTasks = getTasksArray(lesson.tasks);
    const tasksArray = rawTasks.map(task => {
      if (!task || !task.task) {
        console.warn('Invalid task found:', task);
        return null;
      }
      
      return {
        task: task.task,
        done: task.done || false,
        difficulty: task.difficulty || determineDifficulty(task.task),
        timeSpent: task.timeSpent || 0,
        notes: task.notes || ''
      };
    }).filter(Boolean);
    
    return {
      id: `day${index + 1}`,
      date: date,
      title: lesson.title || "Daily Challenge",
      dayNumber: index + 1,
      unlocked: isUnlocked,
      motivationalQuote: lesson.quote || lesson.motivation || "",
      summary: lesson.summary || "",
      xpPerTask: 20,
      tasks: tasksArray
    };
  });
};


  // ============ UPDATE FIRESTORE ============
  // ============ UPDATE FIRESTORE ============
const updateFirestore = async (updatedDayTasks: Lesson[]) => {
  if (!userId || !firestoreDocId) return;

  try {
    const docRef = doc(db, `users/${userId}/datedcourses`, firestoreDocId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      console.error("Document not found");
      return;
    }

    const data = docSnap.data();

    // Update task_overview format if it exists
    if (data.task_overview && data.task_overview.days) {
      console.log("📝 Updating task_overview format");
      
      const updatedOverview = {
        ...data.task_overview,
        days: data.task_overview.days.map((day, dayIdx) => {
          const matchingDay = updatedDayTasks.find(d => d.date === day.date);
          if (!matchingDay) return day;
          
          return {
            ...day,
            tasks: day.tasks.map((task, taskIdx) => ({
              ...task,
              done: matchingDay.tasks[taskIdx]?.done || false,
              timeSpent: matchingDay.tasks[taskIdx]?.timeSpent || 0,
              notes: matchingDay.tasks[taskIdx]?.notes || ''
            }))
          };
        })
      };

      await updateDoc(docRef, {
        task_overview: updatedOverview
      });
    }
    // Fallback: Update lessons_by_date format
    else if (data.lessons_by_date) {
      console.log("📝 Updating lessons_by_date format");
      
      const updatedLessons = {};
      updatedDayTasks.forEach(day => {
        updatedLessons[day.date] = {
          title: day.title,
          quote: day.motivationalQuote,
          summary: day.summary,
          tasks: day.tasks.map(t => ({
            task: t.task,
            done: t.done,
            difficulty: t.difficulty,
            timeSpent: t.timeSpent,
            notes: t.notes
          }))
        };
      });

      await updateDoc(docRef, {
        lessons_by_date: updatedLessons
      });
    }
  } catch (err) {
    console.error("Error updating Firestore:", err);
    throw err;
  }
};

  // Timer effect with cleanup
  useEffect(() => {
    let interval;
    if (activeTimer !== null) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTimer]);

  // Calculate stats with proper memoization
  const stats = useMemo(() => {
    let totalXP = 0;
    let totalDaysCompleted = 0;
    let totalTimeSpent = 0;
    let currentStreak = 0;
    let taskCount = 0;

    const sortedDays = [...dayTasks].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const today = new Date().setHours(0, 0, 0, 0);

    for (let i = sortedDays.length - 1; i >= 0; i--) {
      const day = sortedDays[i];
      const dayDate = new Date(day.date).setHours(0, 0, 0, 0);
      
      if (dayDate > today) continue;
      
      const completedTasks = day.tasks.filter((t) => t.done).length;
      const totalTasks = day.tasks.length;
      const isDayComplete = completedTasks === totalTasks && totalTasks > 0;
      
      const expectedDate = today - (currentStreak * 86400000);
      
      if (dayDate === expectedDate && isDayComplete) {
        currentStreak++;
      } else if (currentStreak > 0) {
        break;
      }
    }

    for (const day of sortedDays) {
      const completedTasks = day.tasks.filter((t) => t.done).length;
      const totalTasks = day.tasks.length;
      
      if (completedTasks === totalTasks && totalTasks > 0) {
        totalDaysCompleted++;
      }

      day.tasks.forEach((task) => {
        if (task.done) {
          const xp = day.xpPerTask * getDifficultyXPMultiplier(task.difficulty);
          totalXP += xp;
          taskCount++;
          if (task.timeSpent) totalTimeSpent += task.timeSpent;
        }
      });
    }

    return {
      totalXP,
      totalDaysCompleted,
      currentStreak,
      averageTaskTime: taskCount > 0 ? Math.round(totalTimeSpent / taskCount) : 0,
      totalTimeSpent,
    };
  }, [dayTasks]);

  // Check if first time user






const handleTaskClick = (taskObj: Task, taskIndex: number) => {
  setSelectedTask({ task: taskObj, index: taskIndex });
  setShowTaskModal(true);
};

const handleGetLiveSupport = async (taskObj: Task, taskIndex: number) => {
  try {
    setLoadingLiveSupport(true);
    
    const response = await fetch('https://one23-u2ck.onrender.com/live-action-support', {  // Removed double slash
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer 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'
      },
      body: JSON.stringify({
        task_name: taskObj.task,
        user_id: userId,
        category: "General Social",
        difficulty: taskObj.difficulty || "Medium",
        user_context: {
          anxiety_level: "moderate",
          experience: "beginner",
          specific_challenges: []
        }
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Server error:', data);
      throw new Error(data.error || 'Failed to get live support');
    }

    if (data.success && data.task) {
      window.location.href = `/connections?task=${encodeURIComponent(JSON.stringify(data.task))}`;
    } else {
      throw new Error('Invalid response from server');
    }
    
  } catch (error) {
    console.error('Error getting live support:', error);
    alert(`Failed to get live support: ${error.message}`);
  } finally {
    setLoadingLiveSupport(false);
  }
};


  const handleDayChange = (index: number) => {
    if (index < 0 || index >= dayTasks.length) return;
    const targetDay = dayTasks[index];
    if (!targetDay.unlocked) return;
    
    setCurrentTaskIndex(0);
    
    if (activeTimer !== null) {
      setDayTasks((prev) =>
        prev.map((day, idx) => {
          if (idx !== currentDayIndex) return day;
          const newTasks = [...day.tasks];
          newTasks[activeTimer] = {
            ...newTasks[activeTimer],
            timeSpent: (newTasks[activeTimer].timeSpent || 0) + timerSeconds,
          };
          return { ...day, tasks: newTasks };
        })
      );
      setActiveTimer(null);
      setTimerSeconds(0);
    }
    
    setCurrentDayIndex(index);
  };

  const handleTaskToggle = async (dayDate: string, taskIndex: number) => {
  if (!userId || !firestoreDocId) return;

  const currentDay = dayTasks.find((d) => d.date === dayDate);
  if (!currentDay || !currentDay.tasks || taskIndex == null) return;
  
  const task = currentDay.tasks[taskIndex];
  const wasCompleted = task.done;
  const currentCompletedCount = currentDay.tasks.filter((t) => t.done).length;
  const newDoneStatus = !wasCompleted;

  let timeToSave = task.timeSpent || 0;
  if (activeTimer === taskIndex && newDoneStatus) {
    timeToSave += timerSeconds;
  }

  // Update local state
  const updatedDayTasks = dayTasks.map((day) => {
    if (day.date !== dayDate) return day;
    const newTasks = [...day.tasks];
    newTasks[taskIndex] = { 
      ...newTasks[taskIndex], 
      done: newDoneStatus,
      timeSpent: newDoneStatus && activeTimer === taskIndex ? timeToSave : newTasks[taskIndex].timeSpent
    };
    return { ...day, tasks: newTasks };
  });

  setDayTasks(updatedDayTasks);

  if (activeTimer === taskIndex) {
    setActiveTimer(null);
    setTimerSeconds(0);
  }

  try {
    // Save to Firestore
    await updateFirestore(updatedDayTasks);

    // Check for day completion
    if (newDoneStatus && currentCompletedCount + 1 === currentDay.tasks.length) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
      
      // Unlock next day
      const currentIdx = updatedDayTasks.findIndex(d => d.date === dayDate);
      const nextDayIndex = currentIdx + 1;
      if (nextDayIndex < updatedDayTasks.length) {
        const unlockedDayTasks = updatedDayTasks.map((day, idx) => 
          idx === nextDayIndex ? { ...day, unlocked: true } : day
        );
        setDayTasks(unlockedDayTasks);
      }
    }
  } catch (err) {
    console.error("Error updating task:", err);
    // Revert on error
    setDayTasks(dayTasks);
  }
};

  const handleStartTimer = async (taskIndex: number) => {
  if (activeTimer === taskIndex) {
    // Stop timer and save
    const timeToSave = timerSeconds;
    
    const updatedDayTasks = dayTasks.map((day, idx) => {
      if (idx !== currentDayIndex) return day;
      const newTasks = [...day.tasks];
      newTasks[taskIndex] = {
        ...newTasks[taskIndex],
        timeSpent: (newTasks[taskIndex].timeSpent || 0) + timeToSave,
      };
      return { ...day, tasks: newTasks };
    });

    setDayTasks(updatedDayTasks);

    try {
      await updateFirestore(updatedDayTasks);
    } catch (err) {
      console.error("Error saving timer:", err);
    }

    setActiveTimer(null);
    setTimerSeconds(0);
  } else {
    // Save previous timer if exists
    if (activeTimer !== null) {
      const prevTimeToSave = timerSeconds;
      
      const updatedDayTasks = dayTasks.map((day, idx) => {
        if (idx !== currentDayIndex) return day;
        const newTasks = [...day.tasks];
        newTasks[activeTimer] = {
          ...newTasks[activeTimer],
          timeSpent: (newTasks[activeTimer].timeSpent || 0) + prevTimeToSave,
        };
        return { ...day, tasks: newTasks };
      });
      
      setDayTasks(updatedDayTasks);
      await updateFirestore(updatedDayTasks);
    }
    
    // Start new timer
    setActiveTimer(taskIndex);
    setTimerSeconds(dayTasks[currentDayIndex].tasks[taskIndex].timeSpent || 0);
  }
};

  const handleResetDay = async () => {
  if (!userId || !firestoreDocId) return;
  
  const currentDay = dayTasks[currentDayIndex];
  if (!confirm(`Reset all tasks for "${currentDay.title}"?`)) return;

  const updatedDayTasks = dayTasks.map((day, idx) => {
    if (idx !== currentDayIndex) return day;
    return {
      ...day,
      tasks: day.tasks.map((t) => ({ ...t, done: false, timeSpent: 0, notes: '' })),
    };
  });

  setDayTasks(updatedDayTasks);
  setActiveTimer(null);
  setTimerSeconds(0);
  setTaskNotes({});

  try {
    await updateFirestore(updatedDayTasks);
  } catch (err) {
    console.error("Error resetting day:", err);
  }
};

  const handleRegenerateTasks = () => {
    alert("AI Regeneration coming soon! This will use AI to create personalized tasks based on your instructions.");
    setOpenRegenDialog(false);
    setRegenInstructions("");
  };

  const handleAddNote = async (taskIndex: number) => {
  if (!userId || !firestoreDocId) return;

  const note = taskNotes[taskIndex] || '';
  
  const updatedDayTasks = dayTasks.map((day, idx) => {
    if (idx !== currentDayIndex) return day;
    const newTasks = [...day.tasks];
    newTasks[taskIndex] = { ...newTasks[taskIndex], notes: note };
    return { ...day, tasks: newTasks };
  });

  setDayTasks(updatedDayTasks);

  try {
    await updateFirestore(updatedDayTasks);
  } catch (err) {
    console.error("Error updating note:", err);
  }

  setExpandedTaskNote(null);
  setTaskNotes(prev => {
    const newNotes = {...prev};
    delete newNotes[taskIndex];
    return newNotes;
  });
};

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-white text-2xl font-semibold">Loading your tasks...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center p-4">
        <div className="bg-red-900/30 border-2 border-red-500/50 rounded-2xl p-8 max-w-md text-center">
          <AlertCircle className="w-20 h-20 text-red-400 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">Error</h2>
          <p className="text-red-200 text-lg">{error}</p>
        </div>
      </div>
    );
  }

  // No tasks state
  if (dayTasks.length === 0) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center p-4">
        <div className="bg-purple-900/30 border-2 border-purple-500/50 rounded-2xl p-8 max-w-md text-center">
          <Lightbulb className="w-20 h-20 text-purple-400 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">No Tasks Found</h2>
          <p className="text-purple-200 text-lg">Create your first course to get started!</p>
        </div>
      </div>
    );
  }

  if (showOnboarding) {
  return <OnboardingScreen onDismiss={handleDismissOnboarding} />;
}

  const currentDay = dayTasks[currentDayIndex];
  const completedTasks = currentDay.tasks.filter((t) => t.done).length;
  const totalTasks = currentDay.tasks.length;
  const totalXpEarned = currentDay.tasks.reduce((sum, task) => {
    if (task.done) {
      return sum + (currentDay.xpPerTask * getDifficultyXPMultiplier(task.difficulty));
    }
    return sum;
  }, 0);
  const progressPercent = (completedTasks / totalTasks) * 100;
  const isAllCompleted = completedTasks === totalTasks;
  const canAccessDay = currentDay.unlocked;
  const date = new Date(currentDay.date).toLocaleDateString("en-US", { 
    weekday: "long", 
    month: "long", 
    day: "numeric" 
  });

  return (
    <div className="relative min-h-screen h-full bg-transparent p-2 sm:p-3 md:p-4">

       {showOnboarding && <OnboardingOverlay onDismiss={handleDismissOnboarding} />}

      

        <div className="w-full">
        {showConfetti && <Confetti recycle={false} numberOfPieces={500} />}

        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-3 md:mb-4"
        >
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="inline-flex items-center gap-2 md:gap-3 mb-2 md:mb-3 px-4 md:px-5 py-2 md:py-2.5 bg-gradient-to-r from-purple-600/40 to-pink-600/40 backdrop-blur-md rounded-full border-2 border-purple-400/50 shadow-2xl shadow-purple-500/30"
          >
            <Sparkles className="w-5 md:w-6 h-5 md:h-6 text-yellow-300 animate-pulse" />
            <span className="text-base md:text-lg font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              Your Learning Squad
            </span>
            <Sparkles className="w-5 md:w-6 h-5 md:h-6 text-pink-300 animate-pulse" />
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 md:mb-6 leading-tight flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Users className="w-8 h-8 md:w-10 md:h-10 text-purple-400" />
            <span className="bg-gradient-to-r from-purple-200 via-pink-200 to-purple-300 bg-clip-text text-transparent">
              Your Today's Tasks
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-base md:text-lg text-purple-300 w-full mx-auto mb-3 md:mb-4 px-4"
          >
            Check off your daily tasks and keep making progress!
          </motion.p>
        </motion.div>

        <div className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 backdrop-blur-sm rounded-2xl border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-purple-500/20">
          
          {/* Header Section */}
<div className="bg-gradient-to-br from-purple-800/60 to-pink-900/60 backdrop-blur-sm p-4 sm:p-5 border-b border-purple-500/30">
  <div className="flex flex-col lg:flex-row justify-between gap-4">
    <div className="flex-1">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-3">
        <div className="flex items-center gap-3">
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
            {currentDay.title}
          </h3>
        </div>
        <span className="px-3 py-1.5 bg-purple-900/50 rounded-full text-purple-200 text-base font-medium w-fit">
          Day {currentDay.dayNumber}
        </span>
      </div>
    </div>

    <div className="flex sm:flex-col items-center sm:items-end gap-3 justify-between sm:justify-start">
      <div className="flex flex-col items-end gap-2">
        <p className="text-purple-200 text-base font-medium">
          {completedTasks}/{totalTasks} Tasks
        </p>
      </div>
    </div>
  </div>
</div>


          {/* Progress Bar */}
          <div className="relative h-4 bg-purple-950/50">
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-r-lg transition-all duration-500 shadow-lg shadow-purple-500/50"
              style={{ width: `${progressPercent}%` }}
            />
            {progressPercent > 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-white drop-shadow-lg">
                  {Math.round(progressPercent)}%
                </span>
              </div>
            )}
          </div>

          <div className="p-3 sm:p-4">
            {/* Summary */}
            

            {/* Day Navigation */}
            <div className="flex items-center justify-between mb-5 gap-2 sm:gap-3">
  <button
    onClick={() => handleDayChange(currentDayIndex - 1)}
    disabled={currentDayIndex === 0}
    className="flex items-center justify-center gap-1 min-w-[36px] h-9 px-2 bg-purple-900/50 border border-purple-500/30 rounded-lg text-white text-sm font-semibold hover:bg-purple-800/50 hover:border-purple-400/50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
  >
    <ChevronLeft className="w-4 h-4" />
    <span className="hidden lg:inline">Prev</span>
  </button>

  <div className="flex gap-2 sm:gap-3 overflow-x-auto flex-1 max-w-none px-1 scrollbar-hide">
    {dayTasks.map((day, idx) => (
      <button
        key={idx}
        onClick={() => handleDayChange(idx)}
        disabled={!day.unlocked}
        className={`relative flex-shrink-0 transition-all ${
          idx === currentDayIndex
            ? "w-12 h-12"
            : "w-9 h-9"
        }`}
      >
        {idx === currentDayIndex ? (
          <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/50 flex items-center justify-center">
            <span className="text-white font-bold text-base">{day.dayNumber}</span>
          </div>
        ) : (
          <div className={`w-full h-full rounded-full transition-all ${
            day.unlocked
              ? "bg-purple-500/50 hover:bg-purple-400/70 hover:scale-125 cursor-pointer"
              : "bg-purple-900/30 cursor-not-allowed"
          }`}>
            {!day.unlocked && (
              <Lock className="w-4 h-4 text-purple-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            )}
          </div>
        )}
      </button>
    ))}
  </div>

  <button
    onClick={() => handleDayChange(currentDayIndex + 1)}
    disabled={currentDayIndex === dayTasks.length - 1 || !dayTasks[currentDayIndex + 1]?.unlocked}
    className="flex items-center justify-center gap-1 min-w-[36px] h-9 px-2 bg-purple-900/50 border border-purple-500/30 rounded-lg text-white text-sm font-semibold hover:bg-purple-800/50 hover:border-purple-400/50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
  >
    <span className="hidden lg:inline">Next</span>
    <ChevronRight className="w-4 h-4" />
  </button>
</div>

            {/* Locked Day Message */}
            {!canAccessDay && (
              <div className="mb-6 p-6 bg-purple-950/50 border-2 border-purple-500/30 rounded-xl text-center">
                <Lock className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                <h4 className="text-2xl font-bold text-white mb-3">Day Locked</h4>
                <p className="text-purple-300 text-lg">
                  Complete all tasks from previous days to unlock this challenge!
                </p>
              </div>
            )}

            {/* Tasks */}
            {/* Tasks - One at a Time */}
{/* Tasks - One at a Time */}
{canAccessDay && currentDay.tasks.length > 0 && (
  <div className="mb-6">
    {/* Task Counter - SMALLER */}
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-900/40 backdrop-blur-sm rounded-full border border-purple-500/30">
        <Target className="w-4 h-4 text-purple-300" />
        <span className="text-white font-semibold text-sm">
          Task {currentTaskIndex + 1}/{currentDay.tasks.length}
        </span>
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={() => setCurrentTaskIndex(Math.max(0, currentTaskIndex - 1))}
          disabled={currentTaskIndex === 0}
          className="flex items-center gap-1 px-2 py-1.5 bg-purple-900/50 border border-purple-500/30 rounded-lg text-white text-sm font-semibold hover:bg-purple-800/50 hover:scale-105 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Prev</span>
        </button>
        <button
          onClick={() => setCurrentTaskIndex(Math.min(currentDay.tasks.length - 1, currentTaskIndex + 1))}
          disabled={currentTaskIndex === currentDay.tasks.length - 1}
          className="flex items-center gap-1 px-2 py-1.5 bg-purple-900/50 border border-purple-500/30 rounded-lg text-white text-sm font-semibold hover:bg-purple-800/50 hover:scale-105 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>

    {/* SPOTLIGHT TASK DISPLAY */}
{(() => {
  const taskObj = currentDay.tasks[currentTaskIndex];
  const index = currentTaskIndex;
  const isTimerActive = activeTimer === index;
  const taskTime = taskObj.timeSpent || 0;
  const displayTime = isTimerActive ? timerSeconds : taskTime;

  return (
    <div className="relative">
      {/* Spotlight glow effect */}
      <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-purple-500/20 blur-2xl rounded-3xl animate-pulse" />
      
      <div
        onMouseEnter={() => setHoveredTask(index)}
        onMouseLeave={() => setHoveredTask(null)}
        className={`relative group p-6 sm:p-8 rounded-2xl border-3 transition-all duration-500 ${
          taskObj.done
            ? "bg-gradient-to-br from-green-900/50 to-emerald-900/50 border-green-400/70 shadow-2xl shadow-green-500/40"
            : "bg-gradient-to-br from-purple-900/60 via-indigo-900/50 to-purple-900/60 border-purple-400/60 hover:border-pink-400/70 shadow-2xl shadow-purple-500/30 hover:shadow-pink-500/40"
        }`}
      >
        {/* Animated border shimmer */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />


        {/* Task Header with Scrollable Text */}
        <div className="flex items-start gap-4 mb-6">
          <button
  onClick={(e) => {
    e.stopPropagation();
    handleTaskToggle(currentDay.date, index);
  }}
  className={`min-w-[28px] w-7 h-7 rounded-md flex items-center justify-center transition-all flex-shrink-0 border-2 ${
    taskObj.done
      ? "bg-green-500 border-green-400"
      : "bg-transparent border-purple-400 hover:border-purple-300"
  }`}
>
  {taskObj.done && <Check className="w-5 h-5 text-white" />}
</button>
          
          <div className="flex-1 min-w-0">
            {/* SCROLLABLE TASK TEXT */}
  {/* SCROLLABLE TASK TEXT */}
  <div className="max-h-32 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-purple-500 scrollbar-track-purple-900/20">
    <p
      className={`font-semibold text-white text-base sm:text-lg leading-relaxed transition-all break-words ${
        taskObj.done ? "line-through opacity-60" : ""
      }`}
    >
      {taskObj.task}
    </p>
  </div>
            
            {/* Task spotlight badge */}
            {!taskObj.done && (
              <div className="flex items-center gap-2 mt-3">
                <div className="flex items-center gap-1 px-3 py-1.5 bg-yellow-500/20 border border-yellow-400/50 rounded-full animate-pulse">
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  <span className="text-yellow-200 text-sm font-bold">Current Focus</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* AI COACH AS MAJOR BUTTON */}
        <div className="mb-5">
          
        </div>

        {/* Secondary Action Buttons */}
        

        {/* Task Meta Info */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          {taskObj.difficulty && (
            <span className={`px-4 py-2 rounded-full text-sm font-black text-white bg-gradient-to-r ${getDifficultyColor(taskObj.difficulty)} shadow-lg`}>
              {taskObj.difficulty.toUpperCase()}
            </span>
          )}
          
          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/40 rounded-full shadow-lg">
            <Zap className="w-5 h-5 text-yellow-300" />
            <span className="text-white font-black text-base">
              {Math.round(currentDay.xpPerTask * getDifficultyXPMultiplier(taskObj.difficulty))} XP
            </span>
          </div>

          {displayTime > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-purple-800/50 border border-purple-500/40 rounded-full shadow-lg">
              <Clock className="w-5 h-5 text-purple-300" />
              <span className="text-white font-bold text-base">{formatTime(displayTime)}</span>
            </div>
          )}
        </div>

        {/* Task Notes Display - SCROLLABLE */}
        {taskObj.notes && (
          <div className="mt-4 p-4 bg-purple-950/50 border-2 border-purple-600/40 rounded-xl shadow-inner max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-500 scrollbar-track-purple-900/20">
            <div className="flex items-start gap-2 mb-2">
              <MessageCircle className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
              <span className="text-purple-300 font-bold text-sm">Your Notes:</span>
            </div>
            <p className="text-purple-100 text-base leading-relaxed pl-7">{taskObj.notes}</p>
          </div>
        )}

        {/* Add Note Section */}
        {expandedTaskNote === index && (
          <div className="mt-4 p-4 bg-purple-950/50 border-2 border-purple-500/40 rounded-xl" onClick={(e) => e.stopPropagation()}>
            <textarea
              value={taskNotes[index] || taskObj.notes || ''}
              onChange={(e) => setTaskNotes({ ...taskNotes, [index]: e.target.value })}
              placeholder="Add reflection, learnings, or notes..."
              className="w-full px-4 py-3 bg-purple-900/50 border-2 border-purple-500/40 rounded-lg text-white text-base placeholder-purple-300 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-400/30 resize-none"
              rows={4}
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => handleAddNote(index)}
                className="flex-1 px-5 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-lg text-base font-bold transition-all text-white shadow-lg hover:scale-105"
              >
                Save Note
              </button>
              <button
                onClick={() => {
                  setExpandedTaskNote(null);
                  setTaskNotes(prev => {
                    const newNotes = {...prev};
                    delete newNotes[index];
                    return newNotes;
                  });
                }}
                className="flex-1 px-5 py-3 bg-purple-900/60 hover:bg-purple-800/60 rounded-lg text-base font-bold transition-all text-white border-2 border-purple-500/40 hover:scale-105"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <button
  onClick={(e) => {
    e.stopPropagation();
    handleGetLiveSupport(taskObj, index);
  }}
  disabled={loadingLiveSupport}
  className="w-full flex items-center justify-center gap-3 px-8 py-5 bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 hover:from-pink-500 hover:via-purple-500 hover:to-pink-500 rounded-2xl text-white text-xl font-black shadow-2xl shadow-purple-500/60 hover:shadow-purple-500/80 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
  style={{
    backgroundSize: '200% 100%',
    animation: 'gradient-shift 3s ease infinite'
  }}
>
  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
  <span className="relative z-10 flex items-center gap-3">
    {loadingLiveSupport ? (
      <>
        <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
        Loading AI Coach...
      </>
    ) : (
      <>
        <Sparkles className="w-6 h-6" />
        Start your task now!
        <Sparkles className="w-6 h-6" />
      </>
    )}
  </span>
</button>
      </div>
    </div>
  );
})()}
  </div>
)}

            {/* Actions */}
            {canAccessDay && (
              <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3">
               

                

                {isAllCompleted && (
                  <div className="flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl font-bold text-white text-base shadow-lg shadow-yellow-500/30 animate-pulse">
                    <Award className="w-6 h-6" />
                    🎉 Day Complete!
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

{/* Stats Modal */}
        {showStatsModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowStatsModal(false)}>
            <div className="bg-gradient-to-br from-purple-900 to-indigo-900 border-2 border-purple-500/30 rounded-2xl p-5 sm:p-6 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-7 h-7 text-purple-400" />
                  <h3 className="text-2xl sm:text-3xl font-bold text-white">Your Progress</h3>
                </div>
                <button
                  onClick={() => setShowStatsModal(false)}
                  className="p-2 hover:bg-purple-800/50 rounded-lg transition-colors"
                >
                  <X className="w-7 h-7 text-white" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-5">
                <div className="p-4 bg-purple-950/30 rounded-xl border border-purple-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="w-6 h-6 text-yellow-400" />
                    <span className="text-purple-300 text-base">Total XP</span>
                  </div>
                  <p className="text-3xl sm:text-4xl font-bold text-white">{stats.totalXP}</p>
                </div>

                <div className="p-4 bg-purple-950/30 rounded-xl border border-purple-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-6 h-6 text-green-400" />
                    <span className="text-purple-300 text-base">Days Done</span>
                  </div>
                  <p className="text-3xl sm:text-4xl font-bold text-white">{stats.totalDaysCompleted}</p>
                </div>

                <div className="p-4 bg-purple-950/30 rounded-xl border border-purple-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Flame className="w-6 h-6 text-orange-400" />
                    <span className="text-purple-300 text-base">Streak</span>
                  </div>
                  <p className="text-3xl sm:text-4xl font-bold text-white">{stats.currentStreak}</p>
                </div>

                <div className="p-4 bg-purple-950/30 rounded-xl border border-purple-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-6 h-6 text-blue-400" />
                    <span className="text-purple-300 text-base">Avg Time</span>
                  </div>
                  <p className="text-3xl sm:text-4xl font-bold text-white">{formatTime(stats.averageTaskTime)}</p>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-purple-900/40 to-pink-900/40 rounded-xl border border-purple-500/20 mb-4">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-6 h-6 text-purple-400" />
                  <h4 className="text-xl font-bold text-white">Daily Progress</h4>
                </div>
                <div className="space-y-3">
                  {dayTasks.map((day, idx) => {
                    const completed = day.tasks.filter(t => t.done).length;
                    const total = day.tasks.length;
                    const percent = (completed / total) * 100;
                    
                    return (
                      <div key={idx} className="flex items-center gap-3">
                        <span className="text-purple-300 text-base font-medium w-20">Day {day.dayNumber}</span>
                        <div className="flex-1 h-7 bg-purple-950/50 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 flex items-center justify-end pr-3"
                            style={{ width: `${percent}%` }}
                          >
                            {percent > 20 && (
                              <span className="text-sm font-bold text-white">{completed}/{total}</span>
                            )}
                          </div>
                        </div>
                        {day.unlocked ? (
                          percent === 100 ? (
                            <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0" />
                          ) : (
                            <AlertCircle className="w-6 h-6 text-yellow-400 flex-shrink-0" />
                          )
                        ) : (
                          <Lock className="w-6 h-6 text-purple-500 flex-shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-4">
                {/* Pro Tip! */}
                <div className="p-4 bg-gradient-to-r from-blue-900/40 to-cyan-900/40 rounded-xl border border-blue-500/30">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-6 h-6 text-blue-400" />
                    <span className="text-blue-200 text-base font-semibold">Pro Tip!</span>
                  </div>
                  <p className="text-white text-sm leading-relaxed">
                    Use <span className="font-bold text-blue-300">🤖 AI Coach</span> to get personalized guidance and earn <span className="font-bold text-yellow-300">2x XP</span> on your tasks!
                  </p>
                </div>
                
                {/* Keep Going! - MISSING WRAPPER ADDED HERE */}
                <div className="p-4 bg-purple-950/30 rounded-xl border border-purple-500/20">
                  <div className="flex items-center gap-2 mb-3">
                    <Heart className="w-6 h-6 text-pink-400" />
                    <span className="text-purple-300 text-base font-semibold">Keep Going!</span>
                  </div>
                  <p className="text-white text-base leading-relaxed">
                    You're building incredible social skills. Every small action compounds into lasting confidence. 
                    {stats.currentStreak > 0 && ` Your ${stats.currentStreak}-day streak shows real commitment!`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        

        {/* AI Regeneration Dialog */}
        {openRegenDialog && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setOpenRegenDialog(false)}>
            <div className="bg-gradient-to-br from-purple-900 to-indigo-900 border-2 border-purple-500/30 rounded-2xl p-5 sm:p-6 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="w-7 h-7 text-yellow-400" />
                <h3 className="text-2xl font-bold text-white">Regenerate Tasks</h3>
              </div>
              
              <p className="text-purple-200 text-base mb-4 leading-relaxed">
                Give instructions to customize your tasks (e.g., "Make them easier", "Add more detail", "Focus on public speaking")
              </p>
              
              <textarea
                value={regenInstructions}
                onChange={(e) => setRegenInstructions(e.target.value)}
                placeholder="e.g., Make these tasks more specific and actionable"
                rows={3}
                className="w-full px-4 py-3 bg-purple-950/50 border border-purple-500/30 rounded-xl text-white text-base placeholder-purple-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 resize-none mb-4"
              />
              
              <div className="flex gap-3">
                <button
                  onClick={() => setOpenRegenDialog(false)}
                  className="flex-1 px-5 py-3 bg-purple-900/50 border border-purple-500/30 rounded-xl text-white text-base font-semibold hover:bg-purple-800/50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRegenerateTasks}
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-bold text-white text-base shadow-lg hover:shadow-xl transition-all"
                >
                  <RefreshCw className="w-5 h-5" />
                  Regenerate
                </button>
              </div>
            </div>
          </div>
        )}

        
      </div>
      
      <style jsx>{`
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  
  @keyframes scaleIn {
    from {
      transform: scale(0.9);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }
  
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out;
  }
  
  .animate-scaleIn {
    animation: scaleIn 0.3s ease-out;
  }
`}</style>
    </div>
  );
};
