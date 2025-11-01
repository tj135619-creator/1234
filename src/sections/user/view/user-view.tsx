import { useState, useEffect , useRef  } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Sparkles, Trophy, CheckCircle, Lock, Play, ChevronRight,
  Star, Flame, TrendingUp, Target, Zap, Brain, ArrowLeft, Calendar,
  Clock, Crown, Shield, ArrowRight, Heart, Feather, TriangleAlert,
  Loader2, AlertCircle, MapPin, Navigation, LogOut, Users, Award, 
  Gift, Volume2, VolumeX, Eye, Lightbulb, MessageCircle, Timer, Check,CheckCircle2, X
} from 'lucide-react';
import { auth, db } from '../../../firebase.js'; // ← Add db here
import { onAuthStateChanged } from 'firebase/auth'; // ← Remove collection from here
import { doc, updateDoc, collection, getDocs   } from 'firebase/firestore'; // ← Add this line
import GoogleSignIn from './GoogleSignIn';
import ActionSchedulerPage from './ActionSchedulerPage'; // Adjust path as needed
import { Bell } from "lucide-react";


import {getDoc } from "firebase/firestore";

import Day1Navigator from "src/components/DAY_01/MAINNAVIGATOR";
import Day2Navigator from "src/components/DAY_02/Day2Navigator";
import Day3Navigator from "src/components/DAY_03/Day3Navigator";
import Day4Navigator from "src/components/DAY_04/Day4Navigator";

import IRLConnectionsHub from './irlconnections'
import IRLConnectionsValueHero from './HerosectionIRL'
import { useRouter } from 'next/router';
import  FindAPlace01 from "src/components/DAY_01/FINDAPLACE/01";




// Import your services
import {
fetchUserLessons,
getUserStats,
type Lesson,
type Task
} from '../../../services/lessonService';

export default function App() {
const [user, setUser] = useState(null);
const [authLoading, setAuthLoading] = useState(true);
const [currentView, setCurrentView] = useState('timeline');
const [selectedLesson, setSelectedLesson] = useState(null);
const [currentSubpage, setCurrentSubpage] = useState(0);
const [journalEntry, setJournalEntry] = useState('');
const [tasks, setTasks] = useState([]);
const [lessons, setLessons] = useState([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
const [showObstaclesPage, setShowObstaclesPage] = useState(false);
const [userConcern, setUserConcern] = useState('');
const [aiConversation, setAiConversation] = useState([]);
const [isHubOpen, setIsHubOpen] = useState(false);
const [isAiThinking, setIsAiThinking] = useState(false);
const [selectedDayNumber, setSelectedDayNumber] = useState(1);
const [loadingProgress, setLoadingProgress] = useState(0);
const [userStats, setUserStats] = useState({
completedLessons: 0,
totalLessons: 0,
xpEarned: 0,
streak: 0,
timeInvested: '0h'
});

const subpageTypes = [ 'intro','chaku',  'reflection', 'complete'];

const ROUTER_COMPONENTS: React.FC<NavigatorProps>[] = [
  /*Day1Navigator as React.FC<NavigatorProps>, */
  /*Day2Navigator as React.FC<NavigatorProps>, */
  /* Day3Navigator as React.FC<NavigatorProps>, */
  Day4Navigator as React.FC<NavigatorProps>,
]
//                                                                                                                      ↑ ADD THIS// Add Quiz Subpage Component
const QuizSubpage = ({ lesson, onNext }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);

  // This will come from Firestore - example structure
  const quiz = lesson.quiz || {
    questions: [
      {
        question: "What's the main concept from today's lesson?",
        options: ["Option A", "Option B", "Option C", "Option D"],
        correctIndex: 0,
        explanation: "This is correct because..."
      }
    ]
  };

  const handleAnswerSelect = (index) => {
    if (showFeedback) return; // Prevent changing answer after submission
    setSelectedAnswer(index);
  };

  // NEW: Conditional rendering block for the full-screen Hub overlay
  

  const handleSubmitAnswer = () => {
    const correct = selectedAnswer === quiz.questions[currentQuestion].correctIndex;
    setIsCorrect(correct);
    setShowFeedback(true);
    if (correct) setScore(score + 1);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setIsCorrect(null);
      setShowFeedback(false);
    } else {
      setQuizComplete(true);
    }
  };

  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

  if (quizComplete) {
    const percentage = Math.round((score / quiz.questions.length) * 100);
    const passed = percentage >= 70;

    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-4xl mx-auto px-4"
      >
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center ${
              passed ? 'bg-green-500/20' : 'bg-orange-500/20'
            }`}
          >
            {passed ? (
              <CheckCircle className="w-12 h-12 text-green-400" />
            ) : (
              <Brain className="w-12 h-12 text-orange-400" />
            )}
          </motion.div>

          <h2 className="text-4xl font-bold text-white mb-4">
            {passed ? "Great Job!" : "Keep Learning!"}
          </h2>
          
          <div className="bg-slate-700/30 rounded-xl p-6 mb-6">
            <p className="text-6xl font-bold text-purple-400 mb-2">{percentage}%</p>
            <p className="text-slate-300 text-lg">
              You got {score} out of {quiz.questions.length} correct
            </p>
          </div>

          {passed ? (
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-6">
              <p className="text-green-300">
                ✨ Excellent! You've proven you understand the material. Ready to move forward!
              </p>
            </div>
          ) : (
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 mb-6">
              <p className="text-orange-300">
                💡 Good effort! You can continue, but consider reviewing the lesson later.
              </p>
            </div>
          )}

          <button
            onClick={onNext}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-medium"
          >
            Continue Journey <ArrowRight className="inline ml-2 w-5 h-5" />
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="w-full max-w-4xl mx-auto px-4"
    >
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Brain className="w-8 h-8 text-purple-400" />
            <h2 className="text-4xl font-bold text-white">Knowledge Check</h2>
          </div>
          <p className="text-slate-400">Test your understanding of today's lesson</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-slate-300 font-medium">
              Question {currentQuestion + 1} of {quiz.questions.length}
            </span>
            <span className="text-purple-400 font-bold">{Math.round(progress)}%</span>
          </div>
          <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Question */}
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-slate-700/30 rounded-xl p-6 mb-6"
        >
          <h3 className="text-2xl font-semibold text-white mb-6">
            {quiz.questions[currentQuestion].question}
          </h3>

          {/* Answer Options */}
          <div className="space-y-3">
            {quiz.questions[currentQuestion].options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrectAnswer = index === quiz.questions[currentQuestion].correctIndex;
              
              let bgColor = 'bg-slate-600/30 hover:bg-slate-600/50';
              let borderColor = 'border-slate-500/50';
              
              if (showFeedback) {
                if (isCorrectAnswer) {
                  bgColor = 'bg-green-500/20';
                  borderColor = 'border-green-500/50';
                } else if (isSelected && !isCorrectAnswer) {
                  bgColor = 'bg-red-500/20';
                  borderColor = 'border-red-500/50';
                }
              } else if (isSelected) {
                bgColor = 'bg-purple-500/20';
                borderColor = 'border-purple-500/50';
              }

              return (
                <motion.button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={showFeedback}
                  whileHover={!showFeedback ? { scale: 1.02 } : {}}
                  whileTap={!showFeedback ? { scale: 0.98 } : {}}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${bgColor} ${borderColor} ${
                    showFeedback ? 'cursor-not-allowed' : 'cursor-pointer'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                      showFeedback && isCorrectAnswer
                        ? 'bg-green-500 border-green-500'
                        : showFeedback && isSelected && !isCorrectAnswer
                        ? 'bg-red-500 border-red-500'
                        : isSelected
                        ? 'bg-purple-500 border-purple-500'
                        : 'border-slate-400'
                    }`}>
                      {showFeedback && isCorrectAnswer && (
                        <CheckCircle className="w-5 h-5 text-white" />
                      )}
                      {showFeedback && isSelected && !isCorrectAnswer && (
                        <AlertCircle className="w-5 h-5 text-white" />
                      )}
                      {!showFeedback && (
                        <span className={isSelected ? 'text-white font-bold' : 'text-slate-400'}>
                          {String.fromCharCode(65 + index)}
                        </span>
                      )}
                    </div>
                    <span className="text-slate-200 text-lg">{option}</span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Feedback */}
        {showFeedback && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl p-6 mb-6 ${
              isCorrect 
                ? 'bg-green-500/10 border border-green-500/30' 
                : 'bg-orange-500/10 border border-orange-500/30'
            }`}
          >
            <div className="flex items-start gap-3">
              {isCorrect ? (
                <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
              ) : (
                <Brain className="w-6 h-6 text-orange-400 flex-shrink-0 mt-1" />
              )}
              <div>
                <h4 className={`font-bold text-lg mb-2 ${isCorrect ? 'text-green-300' : 'text-orange-300'}`}>
                  {isCorrect ? "Correct! 🎉" : "Not quite..."}
                </h4>
                <p className="text-slate-300">
                  {quiz.questions[currentQuestion].explanation}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          {!showFeedback ? (
            <button
              onClick={handleSubmitAnswer}
              disabled={selectedAnswer === null}
              className={`px-8 py-3 rounded-xl font-medium transition-all ${
                selectedAnswer !== null
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white'
                  : 'bg-slate-700 text-slate-500 cursor-not-allowed'
              }`}
            >
              Submit Answer
            </button>
          ) : (
            <button
              onClick={handleNextQuestion}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-medium"
            >
              {currentQuestion < quiz.questions.length - 1 ? (
                <>Next Question <ChevronRight className="inline ml-2 w-5 h-5" /></>
              ) : (
                <>See Results <Trophy className="inline ml-2 w-5 h-5" /></>
              )}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Update renderSubpage function to include quiz
function renderSubpage(lesson, tasks, toggleTask, journalEntry, setJournalEntry, onNext, onComplete, onBackToTimeline, type, loadUserData) {
  const subpages = {
    intro: <IntroSubpage lesson={lesson} onNext={onNext} />,
    chaku: <ChakuSubpage lesson={lesson} currentDayNumber={selectedDayNumber} onNext={onNext} loadUserData={loadUserData} />,
    //motivation: <MotivationSubpage lesson={lesson} onNext={onNext} />,
    //lesson: <LessonSubpage lesson={lesson} onNext={onNext} />,
    //quiz: <QuizSubpage lesson={lesson} onNext={onNext} />,
    //why: <WhySubpage lesson={lesson} onNext={onNext} />,
    //quote: <QuoteSubpage lesson={lesson} onNext={onNext} />,
    //consequences: <ConsequencesSubpage lesson={lesson} onNext={onNext} />,
    //tasks: <TasksSubpage tasks={tasks} toggleTask={toggleTask} onNext={onNext} />,
    //scheduler: <ActionSchedulerPage tasks={tasks} onComplete={(scheduledTasks) => {
      //console.log('Scheduled tasks:', scheduledTasks);
      //onNext();
    //}} onBack={() => {/* handle back */}} />,
    //obstacles: <ObstaclesPage tasks={tasks} onNext={onNext} />,
    reflection: <ReflectionSubpage journalEntry={journalEntry} setJournalEntry={setJournalEntry} onComplete={onComplete} />,
    complete: <CompletionSubpage lesson={lesson} onBackToTimeline={onBackToTimeline} />
  };
  return subpages[type];
}


// Auth state listener
// Auth state listener
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
    setUser(currentUser);
    setAuthLoading(false);

    if (currentUser) {
      console.log('✅ User authenticated:', currentUser.email);
      loadUserData(); // ONLY call here
    } else {
      console.log('👤 No user authenticated');
    }
  });

  return () => unsubscribe();
}, []); // Remove loadUserData() call from here - DON'T CALL IT TWICE!

const loadUserData = async () => {
try {
console.log('🔄 Starting to load user data...');
    console.log('👤 Current User UID:', auth.currentUser?.uid);
    console.log('📧 Current User Email:', auth.currentUser?.email);

setLoading(true);
setError(null);

const progressInterval = setInterval(() => {
setLoadingProgress(prev => (prev >= 90 ? prev : prev + 10));
}, 200);

const [lessonsData, stats] = await Promise.all([
fetchUserLessons(auth.currentUser.uid),
getUserStats(auth.currentUser.uid)
]);

console.log('📚 Fetched Lessons:', lessonsData);
console.log('📊 User Stats:', stats);

setLessons(lessonsData);
setUserStats(stats);

clearInterval(progressInterval);
setLoadingProgress(100);

setTimeout(() => setLoading(false), 500);
} catch (err) {
console.error('❌ Error loading data:', err);
setError('Failed to load lessons. Please try again.');
setLoading(false);
}
};

const handleSignOut = async () => {
try {
await auth.signOut();
console.log('✅ Signed out successfully');
} catch (error) {
console.error('❌ Sign out error:', error);
}
};

const handleSelectLesson = (lesson, index) => {
//if (index > 0 && !lessons[index - 1].completed) {
//console.log('🔒 Lesson locked');
//return;
//}
setSelectedLesson(lesson); 
  setCurrentSubpage(0);
  // SET THE NEW STATE VARIABLE
  setSelectedDayNumber(index + 1); 

  setCurrentView('lesson');
};

// Add this helper function at the top of your component
const saveCurrentProgress = async (lessonId, subpageIndex) => {
  if (!auth.currentUser) return;
  
  try {
    const coursesRef = collection(db, 'users', auth.currentUser.uid, 'datedcourses');
    const coursesSnapshot = await getDocs(coursesRef);
    
    if (!coursesSnapshot.empty) {
      const firstCourseDoc = coursesSnapshot.docs[0];
      const courseDocRef = doc(db, 'users', auth.currentUser.uid, 'datedcourses', firstCourseDoc.id);
      
      await updateDoc(courseDocRef, {
        active_lesson_progress: {
          lessonId: lessonId,
          currentSubpage: subpageIndex,
          lastUpdated: new Date().toISOString()
        }
      });
    }
  } catch (error) {
    console.error('Error saving progress:', error);
  }
};

// Update handleNextSubpage
const handleNextSubpage = async () => {
  if (currentSubpage < subpageTypes.length - 1) {
    const newSubpage = currentSubpage + 1;
    setCurrentSubpage(newSubpage);
    await saveCurrentProgress(selectedLesson.id, newSubpage);
  }
};

// Update handlePreviousSubpage
const handlePreviousSubpage = async () => {
  if (currentSubpage > 0) {
    const newSubpage = currentSubpage - 1;
    setCurrentSubpage(newSubpage);
    await saveCurrentProgress(selectedLesson.id, newSubpage);
  } else {
    setCurrentView('timeline');
  }
};

const handleCompleteLesson = async () => {
  if (!selectedLesson || !auth.currentUser) return;
  
  try {
    // Lessons are auto-completed when all tasks are done
    // Just reload data to reflect completion status
    await loadUserData();
    
    // Return to timeline
    setCurrentView('timeline');
    
  } catch (err) {
    console.error('❌ Error:', err);
    alert('Failed to complete lesson. Please try again.');
  }
};

const handleSubmitConcern = async () => {
  if (!userConcern.trim()) return;
  
  // Add user message to conversation
  const userMessage = { type: 'user', text: userConcern.trim() };
  setAiConversation([...aiConversation, userMessage]);
  setIsAiThinking(true);
  
  try {
    // YOUR AI ENDPOINT HERE
    const response = await fetch('YOUR_AI_ENDPOINT_URL', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: userConcern.trim(),
        context: `The user scheduled tasks and has a concern about following through. Help them overcome this obstacle with tough love and practical advice. Their concern: "${userConcern.trim()}"`,
        // Add any other params your endpoint needs
      })
    });
    
    const data = await response.json();
    const aiMessage = { type: 'ai', text: data.response }; // Adjust based on your API response
    
    setAiConversation(prev => [...prev, aiMessage]);
  } catch (error) {
    console.error('AI Error:', error);
    setAiConversation(prev => [...prev, { 
      type: 'ai', 
      text: 'Sorry, I had trouble connecting. But here\'s what I know: whatever concern you have, it\'s valid but not a reason to quit. The key is to start anyway.' 
    }]);
  } finally {
    setUserConcern('');
    setIsAiThinking(false);
  }
};

const handleProceedToCommitment = () => {
  setShowObstaclesPage(false);
  setShowCommitment(true);
};



const toggleTask = async (index) => {
  if (!selectedLesson || !auth.currentUser) return;
  try {
    const newStatus = !tasks[index].done;
    const updated = [...tasks];
    updated[index].done = newStatus;
    setTasks(updated);
    
    // Pass userId, date, taskIndex, done
    await updateTaskStatus(
      auth.currentUser.uid,  // ✅ userId
      selectedLesson.date,    // ✅ date (not id!)
      index,                  // ✅ taskIndex
      newStatus               // ✅ done status
    );
  } catch (err) {
    console.error('❌ Error:', err);
    const reverted = [...tasks];
    reverted[index].done = !reverted[index].done;
    setTasks(reverted);
  }
};



// Show auth loading
if (authLoading) {
return (
<div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/30 to-slate-900 flex items-center justify-center">
<Loader2 className="w-12 h-12 text-purple-400 animate-spin" />
</div>
);
}

// Show login page if not authenticated
if (!user) {
return <LoginPage />;
}

// Show loading state
if (loading) {
return (
<div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white flex items-center justify-center">
<motion.div className="max-w-md w-full text-center px-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
<motion.div className="w-20 h-20 mx-auto mb-8 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center" animate={{ rotate: 360, scale: [1, 1.1, 1] }} transition={{ rotate: { duration: 2, repeat: Infinity, ease: "linear" }, scale: { duration: 2, repeat: Infinity } }}>
<Sparkles className="text-white w-10 h-10" />
</motion.div>
<motion.h2 className="text-3xl font-bold mb-4" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}>
Loading Your Journey
</motion.h2>
<div className="w-full bg-slate-700 rounded-full h-3 mb-6 overflow-hidden">
<motion.div className="h-full bg-gradient-to-r from-blue-400 to-purple-500 rounded-full" initial={{ width: 0 }} animate={{ width: `${loadingProgress}%` }} />
</div>
</motion.div>
</div>
);
}

// Show error state
if (error) {
return (
<div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white flex items-center justify-center">
<div className="max-w-md w-full text-center px-4">
<AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
<h2 className="text-2xl font-bold mb-2">Oops! Something went wrong</h2>
<p className="text-slate-400 mb-6">{error}</p>
<button onClick={loadUserData} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg">
Try Again
</button>
</div>
</div>
);
}

// Lesson view
if (currentView === 'lesson' && selectedLesson) {
const overallProgress = ((currentSubpage + 1) / subpageTypes.length) * 100;

return (
<motion.div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 text-slate-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
<header className="relative z-20 bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50">
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
<div className="flex items-center justify-between mb-4">
<button onClick={handlePreviousSubpage} className="flex items-center gap-2 text-slate-300 hover:text-white">
<ArrowLeft className="w-5 h-5" />
<span className="text-sm">Back</span>
</button>
<div className="flex items-center space-x-3">
<div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
<Target className="text-white" />
</div>
<div>
<h1 className="text-xl font-bold">{selectedLesson.title}</h1>
<p className="text-sm text-slate-400">Step {currentSubpage + 1} of {subpageTypes.length}</p>
</div>
</div>
<button onClick={handleSignOut} className="flex items-center gap-2 text-slate-400 hover:text-white">
<LogOut className="w-4 h-4" />
</button>
</div>
<div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/50">
<div className="flex justify-between items-center mb-2">
<span className="text-xs font-medium text-slate-300">{Math.round(overallProgress)}% Complete</span>
<div className="flex space-x-1">
{subpageTypes.map((_, i) => (
<div key={i} className={`w-2 h-2 rounded-full ${i <= currentSubpage ? 'bg-purple-400' : 'bg-slate-600'}`} />
))}
</div>
</div>
<div className="h-3 bg-slate-700/80 rounded-full overflow-hidden">
<motion.div initial={{ width: 0 }} animate={{ width: `${overallProgress}%` }} className="h-full bg-gradient-to-r from-purple-500 to-cyan-400" />
</div>
</div>
</div>
</header>
<main className="flex items-center justify-center p-4 min-h-[calc(100vh-180px)]">
{renderSubpage(selectedLesson, tasks, toggleTask, journalEntry, setJournalEntry, handleNextSubpage, handleCompleteLesson, () => setCurrentView('timeline'), subpageTypes[currentSubpage], loadUserData)}
</main>
</motion.div>
);
}

// Timeline view
return (
<TimelineView
user={user}
lessons={lessons}
userStats={userStats}
handleSelectLesson={handleSelectLesson}
handleSignOut={handleSignOut}
isHubOpen={isHubOpen}
setIsHubOpen={setIsHubOpen}
/>
);
}

// Login Page Component
function LoginPage() {
return (
<div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/30 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
<div className="absolute inset-0">
{[...Array(20)].map((_, i) => (
<motion.div
key={i}
className="absolute w-2 h-2 bg-purple-400/20 rounded-full"
initial={{ x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000), y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000) }}
animate={{ y: [null, Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000)], opacity: [0, 1, 0] }}
transition={{ duration: Math.random() * 5 + 5, repeat: Infinity, ease: "linear" }}
/>
))}
</div>

<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative max-w-md w-full">
<div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-slate-700/50 p-8 shadow-2xl">
<motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }} className="flex justify-center mb-6">
<div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/50">
<Sparkles className="w-10 h-10 text-white" />
</div>
</motion.div>

<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-center mb-8">
<h1 className="text-4xl font-bold text-white mb-2">Welcome Back</h1>
<p className="text-slate-400">Continue your learning journey</p>
</motion.div>

<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="grid grid-cols-3 gap-3 mb-8">
<div className="bg-gradient-to-br from-purple-800/40 to-purple-900/40 p-4 rounded-xl text-center border border-purple-500/30">
<Trophy className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
<p className="text-xs text-purple-300 font-medium">Earn XP</p>
</div>
<div className="bg-gradient-to-br from-blue-800/40 to-blue-900/40 p-4 rounded-xl text-center border border-blue-500/30">
<Target className="w-6 h-6 text-blue-400 mx-auto mb-2" />
<p className="text-xs text-blue-300 font-medium">Track Goals</p>
</div>
<div className="bg-gradient-to-br from-green-800/40 to-green-900/40 p-4 rounded-xl text-center border border-green-500/30">
<Zap className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
<p className="text-xs text-green-300 font-medium">Level Up</p>
</div>
</motion.div>

<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
<GoogleSignIn />
</motion.div>

<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="text-center mt-6">
<p className="text-xs text-slate-500">
By signing in, you agree to our{' '}
<a href="#" className="text-purple-400 hover:text-purple-300">Terms</a>
{' '}and{' '}
<a href="#" className="text-purple-400 hover:text-purple-300">Privacy Policy</a>
</p>
</motion.div>
</div>
</motion.div>
</div>
);
}

// Timeline View Component
function TimelineView({ user, lessons, userStats, handleSelectLesson, handleSignOut, isHubOpen, setIsHubOpen}) {

// 1. 🛑 IMMEDIATE EARLY RETURN FOR THE HUB 🛑
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
          <X className="w-6 h-6" /> 
        </button>
      </div>
    );
  }

return (
<motion.div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 text-slate-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
<header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div className="flex items-center justify-between">
      {/* Left: Title */}
      <div>
        <h1 className="text-2xl font-bold text-white">Your Learning Journey</h1>
        <p className="text-sm text-slate-400">5-Day Transformation Path</p>
      </div>

      {/* Right: Streak & Sign Out */}
      <div className="flex items-center gap-6">
        

        {/* Sign Out Button */}
        <button 
          onClick={handleSignOut} 
          className="flex items-center gap-2 bg-slate-700/50 hover:bg-slate-700 px-4 py-2 rounded-lg transition-colors"
        >
          <img src={user.photoURL} alt="" className="w-6 h-6 rounded-full" />
          <LogOut className="w-4 h-4 text-slate-400" />
        </button>
      </div>
    </div>
  </div>
</header>

<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
<StatsCard icon={<Trophy className="w-6 h-6 text-yellow-400" />} value={`${userStats.completedLessons}/${userStats.totalLessons}`} label="Lessons completed" color="purple" />

<StatsCard icon={<Flame className="w-6 h-6 text-orange-400" />} value={userStats.streak} label="Days in a row" color="green" />
<StatsCard icon={<Clock className="w-6 h-6 text-blue-400" />} value={userStats.timeInvested} label="Invested" color="pink" />
</div>

<div className="relative">
<h2 className="text-3xl font-bold text-white mb-8 text-center flex items-center justify-center gap-3">
<MapPin className="w-8 h-8 text-purple-400" />
Your 5-Day Journey
</h2>




{lessons.length === 0 ? (
<div className="text-center py-12">
<BookOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
<p className="text-slate-400 text-lg">No lessons available yet</p>
</div>
) : (
<div className="relative">
<div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 via-blue-500 to-purple-500 transform -translate-x-1/2 hidden md:block" />
<div className="space-y-12">
{lessons.map((lesson, index) => (
<LessonCard 
    key={lesson.id} 
    lesson={lesson} 
    index={index} 
    lessons={lessons} 
    handleSelectLesson={handleSelectLesson} 
    // --- UPDATED PROP HERE ---
    displayDayNumber={index + 1} // Passes 1 for the first card, 2 for the second, up to 5
/>
))}
</div>
</div>
)}
</div>
</div>
</motion.div>
);
}

// Helper Components
function StatsCard({ icon, value, label, color }) {
return (
<div className={`bg-gradient-to-br from-${color}-800/60 to-${color}-900/60 backdrop-blur-sm p-6 rounded-2xl border border-${color}-500/30`}>
<div className="flex items-center justify-between mb-2">
{icon}
<span className={`text-${color}-300 text-sm font-medium`}>Progress</span>
</div>
<p className="text-3xl font-bold text-white">{value}</p>
<p className={`text-${color}-300 text-xs mt-1`}>{label}</p>
</div>
);
}

function LessonCard({ lesson, index, lessons, handleSelectLesson , displayDayNumber }) {
const isLocked = false;
const isLeft = index % 2 === 0;

return (
<motion.div initial={{ opacity: 0, x: isLeft ? -100 : 100 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.15 }} className={`relative flex items-center ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'} flex-col`}>
<div className="absolute left-1/2 transform -translate-x-1/2 z-10 hidden md:block">
<motion.div animate={lesson.completed ? { scale: [1, 1.2, 1] } : {}} transition={{ duration: 2, repeat: Infinity }} className={`w-8 h-8 rounded-full border-4 ${lesson.completed ? 'bg-green-500 border-green-300' : isLocked ? 'bg-slate-700 border-slate-600' : 'bg-blue-500 border-blue-300'} flex items-center justify-center`}>
{lesson.completed ? <CheckCircle className="w-4 h-4 text-white" /> : isLocked ? <Lock className="w-4 h-4 text-slate-400" /> : <div className="w-2 h-2 bg-white rounded-full" />}
</motion.div>
</div>

<div className={`w-full md:w-5/12 ${isLeft ? 'md:pr-12' : 'md:pl-12'}`}>
<motion.div whileHover={!isLocked ? { scale: 1.03, y: -5 } : {}} className={`relative group bg-gradient-to-br ${lesson.completed ? 'from-green-800/40 to-green-900/40 border-green-500/40' : isLocked ? 'from-slate-800/40 to-slate-900/40 border-slate-700/40 opacity-60' : 'from-purple-800/40 to-blue-900/40 border-purple-500/40 hover:border-purple-400/60'} backdrop-blur-sm rounded-2xl border-2 p-6 transition-all cursor-pointer`} onClick={() => !isLocked && handleSelectLesson(lesson, index)}>
<div className="absolute -top-3 -right-3">
<div className={`px-4 py-2 rounded-xl font-bold text-sm ${lesson.completed ? 'bg-green-500 text-white' : isLocked ? 'bg-slate-700 text-slate-400' : 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'}`}>
Day {index + 1}
</div>
</div>

<div className="flex items-center gap-2 text-slate-400 text-sm mb-3">
<Calendar className="w-4 h-4" />
<span>{new Date(lesson.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
</div>

<div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-4 ${lesson.completed ? 'bg-green-500/20' : isLocked ? 'bg-slate-700/20' : 'bg-gradient-to-br from-purple-500/20 to-blue-500/20'}`}>
{lesson.completed ? <Trophy className="w-8 h-8 text-green-400" /> : isLocked ? <Lock className="w-8 h-8 text-slate-400" /> : <BookOpen className="w-8 h-8 text-purple-400" />}
</div>

<h3 className="text-2xl font-bold text-white mb-2">{lesson.title}</h3>
<p className="text-slate-300 text-sm mb-4 line-clamp-3">{lesson.summary}</p>

<div className="flex items-center justify-between mb-4">
<div className="flex items-center gap-4 text-xs text-slate-400">
<div className="flex items-center gap-1">
<Clock className="w-3 h-3" />
<span>{lesson.duration}</span>
</div>
<div className="flex items-center gap-1">
<Zap className="w-3 h-3" />
<span>+{lesson.xp} XP</span>
</div>
</div>
</div>

{lesson.completed ? (
<div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg border border-green-500/30">
<div className="flex items-center gap-2 text-green-400">
<CheckCircle className="w-5 h-5" />
<span className="text-sm font-medium">Completed!</span>
</div>
</div>
) : isLocked ? (
<div className="flex items-center gap-2 p-3 bg-slate-700/30 rounded-lg border border-slate-600/30">
<Lock className="w-5 h-5 text-slate-500" />
<span className="text-sm text-slate-500">Complete Day {index} first</span>
</div>
) : (
<button className="w-full flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-lg text-white font-medium">
<Play className="w-5 h-5" />
<span>Start Lesson</span>
</button>
)}
</motion.div>
</div>
</motion.div>
);
}



// Subpage components (simplified versions - include your full implementations)
const IntroSubpage = ({ lesson, onNext }) => {
  const [timeOnPage, setTimeOnPage] = useState(0);
  const [showUrgency, setShowUrgency] = useState(false);
  const [showCommitment, setShowCommitment] = useState(false);
  const [commitmentChecks, setCommitmentChecks] = useState({
    time: false,
    space: false,
    action: false,
    commit: false
  });
  const [showPreview, setShowPreview] = useState(false);
  const [musicEnabled, setMusicEnabled] = useState(false);
  const [liveCount, setLiveCount] = useState(47);
  const [recentCompletion, setRecentCompletion] = useState('Sarah');
  const [minutesAgo, setMinutesAgo] = useState(2);
  const [hoveredStage, setHoveredStage] = useState(null);
  const [countdownSeconds, setCountdownSeconds] = useState(300);

  // Timer effects
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeOnPage(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Show urgency after 10 seconds
  useEffect(() => {
    if (timeOnPage === 10) {
      setShowUrgency(true);
    }
  }, [timeOnPage]);

  // Countdown timer
  useEffect(() => {
    const countdown = setInterval(() => {
      setCountdownSeconds(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);
    return () => clearInterval(countdown);
  }, []);

  // Live counter animation
  useEffect(() => {
    const liveInterval = setInterval(() => {
      setLiveCount(prev => prev + Math.floor(Math.random() * 3));
      setMinutesAgo(Math.floor(Math.random() * 5) + 1);
      const names = ['Sarah', 'Mike', 'Jessica', 'David', 'Emma', 'James'];
      setRecentCompletion(names[Math.floor(Math.random() * names.length)]);
    }, 8000);
    return () => clearInterval(liveInterval);
  }, []);

  const allCommitmentsChecked = Object.values(commitmentChecks).every(v => v);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const journeyStages = [
    { icon: Heart, label: 'Motivation', time: '2 min', color: 'text-pink-400' },
    { icon: BookOpen, label: 'Deep Lesson', time: '3 min', color: 'text-blue-400' },
    { icon: Brain, label: 'Knowledge Check', time: '3 min', color: 'text-purple-400' },
    { icon: Lightbulb, label: 'The Why', time: '2 min', color: 'text-yellow-400' },
    { icon: Feather, label: 'Wisdom Quote', time: '1 min', color: 'text-cyan-400' },
    { icon: TriangleAlert, label: 'Consequences', time: '2 min', color: 'text-orange-400' },
    { icon: Target, label: 'Action Steps', time: '2 min', color: 'text-green-400' },
    { icon: Calendar, label: 'Scheduling', time: '3 min', color: 'text-indigo-400' },
    { icon: Shield, label: 'Break Obstacles', time: '3 min', color: 'text-red-400' },
    { icon: BookOpen, label: 'Reflection', time: '2 min', color: 'text-teal-400' }
  ];

  const handleStartChallenge = () => {
    if (!allCommitmentsChecked) {
      setShowCommitment(true);
    } else {
      onNext();
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="w-full min-h-screen px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 py-4 sm:py-6 md:py-8"
    >
      {/* Music Toggle - Responsive positioning */}
      <div className="fixed top-3 right-3 sm:top-4 sm:right-4 z-50">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setMusicEnabled(!musicEnabled)}
          className="bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-full p-2 sm:p-3 text-slate-300 hover:text-white transition-colors"
        >
          {musicEnabled ? <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" /> : <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" />}
        </motion.button>
      </div>

      {/* Urgency Popup - Mobile optimized */}
      <AnimatePresence>
        {showUrgency && !showCommitment && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-16 sm:top-20 left-3 right-3 sm:left-1/2 sm:right-auto sm:transform sm:-translate-x-1/2 z-40 max-w-md mx-auto"
          >
            <div className="bg-orange-500 text-white px-4 py-3 sm:px-6 sm:py-4 rounded-xl shadow-2xl flex items-center gap-2 sm:gap-3">
              <Timer className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm sm:text-base">⏰ Every second counts!</p>
                <p className="text-xs sm:text-sm">Others are already 2 minutes in</p>
              </div>
              <button onClick={() => setShowUrgency(false)} className="flex-shrink-0">
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Commitment Modal - Mobile optimized */}
      <AnimatePresence>
        {showCommitment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4"
            onClick={() => setShowCommitment(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-800 rounded-2xl p-5 sm:p-6 md:p-8 max-w-lg w-full border-2 border-purple-500/50 max-h-[90vh] overflow-y-auto"
            >
              <div className="text-center mb-4 sm:mb-6">
                <Crown className="w-12 h-12 sm:w-16 sm:h-16 text-yellow-400 mx-auto mb-3 sm:mb-4" />
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">Set Yourself Up for Success</h3>
                <p className="text-sm sm:text-base text-slate-400">Half-hearted starts lead to incomplete lessons.</p>
              </div>

              <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                {[
                  { key: 'time', label: 'I have 15 uninterrupted minutes', icon: Clock },
                  { key: 'space', label: "I'm in a quiet space", icon: Eye },
                  { key: 'action', label: "I'm ready to take action", icon: Zap },
                  { key: 'commit', label: 'I commit to completing this today', icon: Heart }
                ].map(({ key, label, icon: Icon }) => (
                  <motion.button
                    key={key}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setCommitmentChecks(prev => ({ ...prev, [key]: !prev[key] }))}
                    className={`w-full flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border-2 transition-all ${
                      commitmentChecks[key]
                        ? 'bg-green-500/20 border-green-500'
                        : 'bg-slate-700/30 border-slate-600 hover:border-slate-500'
                    }`}
                  >
                    <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      commitmentChecks[key] ? 'bg-green-500 border-green-500' : 'border-slate-500'
                    }`}>
                      {commitmentChecks[key] && <Check className="w-4 h-4 sm:w-5 sm:h-5 text-white" />}
                    </div>
                    <Icon className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 ${commitmentChecks[key] ? 'text-green-400' : 'text-slate-400'}`} />
                    <span className={`flex-1 text-left text-sm sm:text-base ${commitmentChecks[key] ? 'text-white' : 'text-slate-300'}`}>
                      {label}
                    </span>
                  </motion.button>
                ))}
              </div>

              <button
                onClick={() => {
                  if (allCommitmentsChecked) {
                    setShowCommitment(false);
                    onNext();
                  }
                }}
                disabled={!allCommitmentsChecked}
                className={`w-full py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg transition-all ${
                  allCommitmentsChecked
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white'
                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                }`}
              >
                {allCommitmentsChecked ? "LET'S GO! 🚀" : 'Check all boxes to continue'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content - Responsive max-width */}
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Hero Section - Mobile first */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360, scale: [1, 1.2, 1] }}
            transition={{ rotate: { duration: 20, repeat: Infinity, ease: "linear" }, scale: { duration: 2, repeat: Infinity } }}
            className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto mb-4 sm:mb-6 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/50"
          >
            <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white" />
          </motion.div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold bg-gradient-to-r from-purple-200 via-blue-300 to-purple-200 bg-clip-text text-transparent mb-3 sm:mb-4 px-2">
            {lesson.title}
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl text-slate-400 mb-4 sm:mb-6 max-w-2xl mx-auto px-4">{lesson.summary}</p>

          {/* Countdown Timer - Responsive */}
          <motion.div
            animate={{ scale: countdownSeconds < 60 ? [1, 1.1, 1] : 1 }}
            transition={{ duration: 1, repeat: countdownSeconds < 60 ? Infinity : 0 }}
            className={`inline-flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 rounded-full ${
              countdownSeconds < 60 ? 'bg-red-500/20 border-red-500' : 'bg-purple-500/20 border-purple-500'
            } border-2 mb-4 sm:mb-6`}
          >
            <Timer className={`w-4 h-4 sm:w-5 sm:h-5 ${countdownSeconds < 60 ? 'text-red-400' : 'text-purple-400'}`} />
            <span className={`font-bold text-xs sm:text-sm md:text-base ${countdownSeconds < 60 ? 'text-red-300' : 'text-purple-300'}`}>
              Start within {formatTime(countdownSeconds)}
            </span>
          </motion.div>
        </motion.div>

        {/* Social Proof Section - Mobile stacked, desktop grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4"
        >
          <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-green-500/30">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
              <motion.span
                key={liveCount}
                initial={{ scale: 1.5, color: '#22c55e' }}
                animate={{ scale: 1, color: '#86efac' }}
                className="text-2xl sm:text-3xl font-bold text-green-300"
              >
                {liveCount}
              </motion.span>
            </div>
            <p className="text-green-200 text-xs sm:text-sm">people completed this today</p>
          </div>

          <div className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-blue-500/30">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
              <span className="text-2xl sm:text-3xl font-bold text-blue-300">94%</span>
            </div>
            <p className="text-blue-200 text-xs sm:text-sm">say this changed their perspective</p>
          </div>

          <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-purple-500/30">
            <div className="flex items-center gap-3 mb-2">
              <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
              <span className="text-xs sm:text-sm text-purple-200">
                <motion.span
                  key={recentCompletion}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="font-bold"
                >
                  {recentCompletion}
                </motion.span> just finished
              </span>
            </div>
            <p className="text-purple-200 text-xs sm:text-sm">{minutesAgo} min ago</p>
          </div>
        </motion.div>

        {/* Journey Preview Section - Different structure for mobile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-4 sm:p-6 md:p-8 border border-slate-700/50"
        >
          <div className="text-center mb-4 sm:mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Your 23-Minute Journey</h2>
            <p className="text-sm sm:text-base text-slate-400">Here's exactly what awaits you</p>
          </div>

          {/* Mobile: Single column, Desktop: 2 columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
            {journeyStages.map((stage, index) => {
              const Icon = stage.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                  onMouseEnter={() => setHoveredStage(index)}
                  onMouseLeave={() => setHoveredStage(null)}
                  className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    hoveredStage === index
                      ? 'bg-slate-700/50 border-purple-500 scale-105'
                      : 'bg-slate-700/20 border-slate-600'
                  }`}
                >
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-slate-800/50 flex items-center justify-center flex-shrink-0 ${
                    hoveredStage === index ? 'animate-pulse' : ''
                  }`}>
                    <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${stage.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm sm:text-base truncate">{stage.label}</p>
                    <p className="text-slate-400 text-xs sm:text-sm">{stage.time}</p>
                  </div>
                  {hoveredStage === index && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="hidden sm:block"
                    >
                      <Eye className="w-5 h-5 text-purple-400" />
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Progress Path Visualization - Responsive */}
          <div className="relative py-6 sm:py-8 hidden sm:block">
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-green-500 transform -translate-y-1/2" />
            <div className="flex justify-between relative">
              {['START', '25%', '50%', '75%', 'DONE'].map((label, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  className="flex flex-col items-center"
                >
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center mb-2 border-4 border-slate-900">
                    {i === 4 ? <Crown className="w-3 h-3 sm:w-4 sm:h-4 text-white" /> : <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full" />}
                  </div>
                  <span className="text-xs font-bold text-slate-400">{label}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Mobile progress bar - simpler version */}
          <div className="block sm:hidden">
            <div className="flex items-center gap-2 text-slate-400 text-xs">
              <div className="flex-1 h-2 bg-gradient-to-r from-purple-500 via-blue-500 to-green-500 rounded-full" />
              <Crown className="w-4 h-4 text-yellow-400" />
            </div>
            <div className="flex justify-between mt-2 text-xs text-slate-400">
              <span>START</span>
              <span>COMPLETE</span>
            </div>
          </div>
        </motion.div>

        {/* Rewards Section - Responsive grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-yellow-900/30 to-orange-900/30 backdrop-blur-sm rounded-2xl p-5 sm:p-6 md:p-8 border border-yellow-500/30"
        >
          <div className="text-center mb-4 sm:mb-6">
            <Gift className="w-10 h-10 sm:w-12 sm:h-12 text-yellow-400 mx-auto mb-3" />
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">What You'll Earn</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="bg-slate-800/50 rounded-xl p-4 sm:p-6 text-center border border-yellow-500/30"
            >
              
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05, rotate: -5 }}
              className="bg-slate-800/50 rounded-xl p-4 sm:p-6 text-center border border-purple-500/30"
            >
              <Award className="w-10 h-10 sm:w-12 sm:h-12 text-purple-400 mx-auto mb-3" />
              <p className="text-lg sm:text-xl font-bold text-purple-300 mb-1">Wisdom Badge</p>
              <p className="text-slate-400 text-xs sm:text-sm">Rare Achievement</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="bg-slate-800/50 rounded-xl p-4 sm:p-6 text-center border border-blue-500/30"
            >
              <Brain className="w-10 h-10 sm:w-12 sm:h-12 text-blue-400 mx-auto mb-3" />
              <p className="text-lg sm:text-xl font-bold text-blue-300 mb-1">New Insight</p>
              <p className="text-slate-400 text-xs sm:text-sm">Life-Changing</p>
            </motion.div>
          </div>
        </motion.div>

        {/* Comparison Split - Mobile stacked */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6"
        >
          {/* Left - Skip */}
          <div className="bg-gradient-to-br from-red-900/30 to-slate-900/30 backdrop-blur-sm rounded-2xl p-5 sm:p-6 md:p-8 border-2 border-red-500/50">
            <X className="w-10 h-10 sm:w-12 sm:h-12 text-red-400 mb-4" />
            <h3 className="text-xl sm:text-2xl font-bold text-red-300 mb-4">If You Skip This...</h3>
            <ul className="space-y-2 sm:space-y-3 text-slate-300 text-sm sm:text-base">
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-1">•</span>
                <span>Stay stuck in old patterns</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-1">•</span>
                <span>Miss crucial insights that could save you years</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-1">•</span>
                <span>Watch others grow while you stand still</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-1">•</span>
                <span>Regret not starting when you had the chance</span>
              </li>
            </ul>
          </div>

          {/* Right - Complete */}
          <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 backdrop-blur-sm rounded-2xl p-5 sm:p-6 md:p-8 border-2 border-green-500/50">
            <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-green-400 mb-4" />
            <h3 className="text-xl sm:text-2xl font-bold text-green-300 mb-4">After Completing This...</h3>
            <ul className="space-y-2 sm:space-y-3 text-slate-300 text-sm sm:text-base">
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">✓</span>
                <span>Gain powerful perspective shift</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">✓</span>
                <span>Unlock actionable strategies you can use today</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">✓</span>
                <span>Move significantly closer to your goals</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">✓</span>
                <span>Feel proud of your commitment to growth</span>
              </li>
            </ul>
          </div>
        </motion.div>

        {/* CTA Section - Mobile optimized */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center pb-6"
        >
          <div className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 backdrop-blur-sm rounded-2xl p-6 sm:p-8 md:p-12 border-2 border-purple-500/50">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">🎯 TODAY'S CHALLENGE</h2>
            <p className="text-base sm:text-lg md:text-xl text-slate-300 mb-4 sm:mb-6 px-2">
              Can you complete all 10 stages without skipping?<br className="hidden sm:block" />
              <span className="block sm:inline"> Most people quit at stage 9 (Obstacles).</span>
            </p>
            <p className="text-xl sm:text-2xl font-bold text-purple-300 mb-6 sm:mb-8">Are you different?</p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStartChallenge}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 sm:px-12 py-4 sm:py-5 rounded-xl font-bold text-lg sm:text-xl shadow-lg shadow-purple-500/50 transition-all w-full sm:w-auto"
            >
              ACCEPT CHALLENGE <ArrowRight className="inline ml-2 w-5 h-5 sm:w-6 sm:h-6" />
            </motion.button>

            <p className="text-slate-500 text-xs sm:text-sm mt-4">
              You'll finish by {new Date(Date.now() + 23 * 60000).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Floating particles background effect - Responsive */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 sm:w-2 sm:h-2 bg-purple-400/20 rounded-full"
            initial={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000)
            }}
            animate={{
              y: [null, Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000)],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>
    </motion.div>
  );
};

const DAY_NAVIGATORS = [Day1Navigator, Day2Navigator, Day3Navigator, Day4Navigator];

// ASSUMPTION: The component that renders ChakuSubpage now passes a
// prop like 'currentDayNumber' based on the timeline index (index + 1).
const ChakuSubpage = ({ lesson: userData, currentDayNumber, onNext, loadUserData }) => {

  // We use the passed prop directly. Fallback to 1 if it's missing (though it shouldn't be).
  const dayNumber = currentDayNumber || 1; 
  const [showCelebration, setShowCelebration] = useState(false);

  // --- Map Day Number to Navigator with Fallback Logic ---
  
  // Renamed to avoid shadowing the global constant
  const DAY_NAVIGATORS_LIST = [ 
    Day1Navigator, 
    Day2Navigator, 
    Day3Navigator, 
    Day4Navigator
  ];


  
  // The number of available navigators (4)
  const availableNavigatorsCount = DAY_NAVIGATORS_LIST.length; 
  
  let navigatorIndex;

  if (dayNumber > availableNavigatorsCount) {
    // If Day 5 or later (since Day 4 is the last unique one)
    // We force the index to the last available one (Day4Navigator at index 3)
    navigatorIndex = availableNavigatorsCount - 1; // Forces index to 3
  } else if (dayNumber >= 1) {
    // For Day 1, Day 2, Day 3, and Day 4
    navigatorIndex = dayNumber - 1; 
  } else {
    // Fallback if dayNumber is 0 or negative (shouldn't happen with the default)
    navigatorIndex = 0; 
  }

  // Get the correct navigator. This will be Day4Navigator for Day 4, Day 5, etc.
  const CurrentNavigator = DAY_NAVIGATORS_LIST[navigatorIndex];

const handleRouterComplete = async () => {
  console.log('🎯 Router Complete Called!');
  console.log('📅 User Data:', userData);
  console.log('👤 Current User:', auth.currentUser?.uid);
  
  // Mark the current day's lesson as complete in Firestore
  if (auth.currentUser && userData?.day) {
    try {
      // Find the social_skills document
      const socialSkillsDocRef = doc(db, 'users', auth.currentUser.uid, 'datedcourses', 'social_skills');
      const socialSkillsDoc = await getDoc(socialSkillsDocRef);
      
      if (socialSkillsDoc.exists()) {
        const courseData = socialSkillsDoc.data();
        console.log('📖 Course data:', courseData);
        
        // Update the specific day in task_overview.days
        const updatedDays = courseData.task_overview?.days?.map(day => {
          console.log('🔍 Checking day:', day.day, 'vs', userData.day);
          if (day.day === userData.day) {
            console.log('✅ Found matching day! Marking complete');
            // ADD the completed field since it doesn't exist
            return { ...day, completed: true };
          }
          return day;
        }) || [];
        
        console.log('📝 Updated days:', updatedDays);
        
        // Update Firestore with the new days array
        await updateDoc(socialSkillsDocRef, {
          'task_overview.days': updatedDays
        });
        
        console.log('✅ Day marked as complete in Firestore');
      } else {
        console.log('⚠️ social_skills document not found');
      }
    } catch (error) {
      console.error('❌ Error marking lesson complete:', error);
    }
  } else {
    console.log('⚠️ Missing auth or userData.day');
  }
  
  setShowCelebration(true);
};

const handleCelebrationComplete = async () => {
  setShowCelebration(false);
  // Reload user data to reflect completion status
  if (loadUserData) {
    await loadUserData();
  }
  onNext(); // This will move to 'reflection' subpage
};

  // If the calculated index led to an invalid navigator
  if (!CurrentNavigator) {
    // Error block 
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-slate-900 text-white">
        <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
        <h2 className="text-2xl font-bold mb-4">
          No Content Available for Day {dayNumber}
        </h2>
        <button
          onClick={onNext}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl"
        >
          Skip to Next Section →
        </button>
      </div>
    );
  }

  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);


  // Celebration Page
if (showCelebration) {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      className="w-full min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4"
    >
      <div className="max-w-4xl w-full text-center">
        {/* Fireworks/Confetti Effect */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 rounded-full"
              style={{
                background: ['#fbbf24', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7'][i % 5],
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
                x: [0, (Math.random() - 0.5) * 200],
                y: [0, (Math.random() - 0.5) * 200]
              }}
              transition={{
                duration: 2,
                delay: i * 0.02,
                repeat: Infinity,
                repeatDelay: 3
              }}
            />
          ))}
        </div>

        {/* Trophy Animation */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", duration: 1, bounce: 0.5 }}
          className="mb-8"
        >
          <div className="w-32 h-32 mx-auto bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl shadow-yellow-500/50">
            <Trophy className="w-16 h-16 text-white" />
          </div>
        </motion.div>

        {/* Main Message */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-yellow-200 via-orange-200 to-pink-200 bg-clip-text text-transparent mb-4">
            Day {dayNumber} Complete! 🎉
          </h1>
          <p className="text-xl md:text-2xl text-purple-200 mb-8">
            You've crushed today's lesson!
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mb-12"
        >
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <Zap className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <p className="text-3xl font-bold text-white">+{userData?.xp || 100}</p>
            <p className="text-purple-200 text-sm">XP Earned</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <Flame className="w-8 h-8 text-orange-400 mx-auto mb-2" />
            <p className="text-3xl font-bold text-white">{dayNumber}</p>
            <p className="text-purple-200 text-sm">Day Streak</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <Star className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <p className="text-3xl font-bold text-white">100%</p>
            <p className="text-purple-200 text-sm">Completed</p>
          </div>
        </motion.div>

        {/* Motivational Quote */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-sm rounded-2xl p-8 border border-purple-400/30 mb-8 max-w-2xl mx-auto"
        >
          <Sparkles className="w-8 h-8 text-yellow-400 mx-auto mb-4" />
          <p className="text-xl text-purple-100 italic mb-2">
            "Every day you don't give up is a day you win."
          </p>
          <p className="text-purple-300 text-sm">Keep going. You're building something incredible.</p>
        </motion.div>

        {/* CTA Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleCelebrationComplete}
          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold text-xl px-12 py-5 rounded-2xl shadow-2xl shadow-green-500/50 transition-all"
        >
          Continue Journey <ArrowRight className="inline ml-3 w-6 h-6" />
        </motion.button>

        {/* Skip Option */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          onClick={handleCelebrationComplete}
          className="mt-6 text-purple-300 hover:text-white transition-colors text-sm"
        >
          Skip celebration →
        </motion.button>
      </div>
    </motion.div>
  );
}


  // --- Standard Render ---

  return (
    <div className="w-full min-h-screen bg-slate-900 text-white">
      {/* Optional: Show which day this is */}
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">{dayNumber}</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                Day {dayNumber} Experience
              </h3>
              <p className="text-sm text-slate-400">
                Interactive Journey 
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Render the day-specific navigator */}
      <CurrentNavigator 
        key={dayNumber}
        lessonContent={userData} // Pass all data for the navigator to use
        onCompleteNavigator={handleRouterComplete} 
      />
    </div>
  );
};


const MotivationSubpage = ({ lesson, onNext }: any) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-4xl mx-auto px-4">
    <div className="bg-gradient-to-br from-purple-700/30 to-blue-500/30 p-8 rounded-3xl border border-blue-600/40 backdrop-blur-md">
      <div className="text-center mb-8">
        <motion.div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center" animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 3, repeat: Infinity }}>
          <Heart className="text-white w-10 h-10" />
        </motion.div>
        <h2 className="text-4xl font-bold text-white mb-2">Why This Matters</h2>
      </div>
      <div className="bg-slate-800/50 rounded-2xl p-6 mb-6">
        <p className="text-slate-200 text-lg leading-relaxed">{lesson.motivation}</p>
      </div>
      <div className="text-center">
        <button onClick={onNext} className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl">
          I'm Ready <ArrowRight className="inline ml-2 w-5 h-5" />
        </button>
      </div>
    </div>
  </motion.div>
);

const LessonSubpage = ({ lesson, onNext, apiEndpoint }: any) => {
  const [showGuide, setShowGuide] = useState(false);
  const [stage, setStage] = useState<'intro' | 'questions' | 'contrast' | 'synthesis'>('intro');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [contrastWorking, setContrastWorking] = useState('');
  const [contrastNotWorking, setContrastNotWorking] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiQuestions, setAiQuestions] = useState<string[]>([]);
  const [synthesis, setSynthesis] = useState('');

  const startGuide = async () => {
    setShowGuide(true);
    setIsLoading(true);
    
    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Based on this lesson: "${lesson.lesson}", generate 3 thoughtful Socratic questions to help someone apply this to their specific situation. Return as JSON array of strings.`,
          lesson: lesson.lesson
        })
      });
      
      const data = await response.json();
      setAiQuestions(data.questions || [
        "What specific situation in your life does this lesson remind you of?",
        "If you could change one thing about how you handle this, what would it be?",
        "What would success look like for you in 30 days?"
      ]);
    } catch (error) {
      setAiQuestions([
        "What specific situation in your life does this lesson remind you of?",
        "If you could change one thing about how you handle this, what would it be?",
        "What would success look like for you in 30 days?"
      ]);
    }
    
    setIsLoading(false);
  };

  const handleFlipToAnswer = () => {
    setIsFlipped(true);
  };

  const handleSubmitAnswer = async () => {
    if (!currentAnswer.trim()) return;
    
    const newAnswers = [...answers, currentAnswer];
    setAnswers(newAnswers);
    setCurrentAnswer('');
    setIsFlipped(false);

    if (currentQuestion < aiQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setStage('contrast');
    }
  };

  const handleContrastSubmit = async () => {
    if (!contrastWorking.trim() || !contrastNotWorking.trim()) return;
    
    setIsLoading(true);
    setStage('synthesis');

    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Based on the lesson: "${lesson.lesson}", the user's answers: ${answers.join('. ')}, what's working: "${contrastWorking}", and what's not working: "${contrastNotWorking}", create a personalized action plan with 3 specific steps and one key insight.`,
          lesson: lesson.lesson,
          answers: answers,
          working: contrastWorking,
          notWorking: contrastNotWorking
        })
      });
      
      const data = await response.json();
      setSynthesis(data.synthesis || "Your unique path forward combines what's already working with targeted improvements. Focus on building momentum from your strengths while addressing the gaps you've identified.");
    } catch (error) {
      setSynthesis("Your unique path forward combines what's already working with targeted improvements. Focus on building momentum from your strengths while addressing the gaps you've identified.");
    }
    
    setIsLoading(false);
  };

  const closeGuide = () => {
    setShowGuide(false);
    setStage('intro');
    setCurrentQuestion(0);
    setAnswers([]);
    setIsFlipped(false);
    setCurrentAnswer('');
    setContrastWorking('');
    setContrastNotWorking('');
    setSynthesis('');
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="w-full max-w-4xl mx-auto px-4 py-8"
    >
      {!showGuide ? (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-slate-700/50">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-50 mb-4">Today's Lesson</h2>
            <div className="w-20 h-1 bg-gradient-to-r from-purple-500 to-blue-500 mx-auto rounded-full"></div>
          </div>
          
          <div className="prose prose-invert prose-lg max-w-none mb-8">
            <p className="text-slate-300 leading-relaxed text-base md:text-lg">{lesson.lesson}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <button 
              onClick={startGuide}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              Let's Explore This Together
            </button>
            
            <button 
              onClick={onNext}
              className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
            >
              Continue
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full">
          <button
            onClick={closeGuide}
            className="mb-4 flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
            Back to Lesson
          </button>

          {stage === 'intro' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 md:p-12 border border-slate-700/50 text-center"
            >
              <Sparkles className="w-16 h-16 mx-auto mb-6 text-purple-400" />
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Let's Make This Real For You
              </h3>
              <p className="text-slate-300 text-lg mb-8">
                I'll ask you a few thoughtful questions to understand your unique situation
              </p>
              <button
                onClick={() => setStage('questions')}
                disabled={isLoading}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 rounded-xl font-medium text-lg transition-all transform hover:scale-105 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 inline mr-2 animate-spin" />
                    Preparing...
                  </>
                ) : (
                  <>
                    Begin Journey
                    <ArrowRight className="w-5 h-5 inline ml-2" />
                  </>
                )}
              </button>
            </motion.div>
          )}

          {stage === 'questions' && (
            <div style={{ perspective: '1000px' }}>
              <motion.div
                className="relative w-full"
                style={{ minHeight: '400px' }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentQuestion}
                    initial={{ rotateY: 90, opacity: 0 }}
                    animate={{ rotateY: 0, opacity: 1 }}
                    exit={{ rotateY: -90, opacity: 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full"
                  >
                    {!isFlipped ? (
                      <div className="w-full bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700/50 p-8 md:p-12">
                        <div className="mb-6">
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-purple-400 text-sm font-medium">
                              Question {currentQuestion + 1} of {aiQuestions.length}
                            </span>
                            <div className="flex gap-2">
                              {aiQuestions.map((_, idx) => (
                                <div
                                  key={idx}
                                  className={`h-2 w-2 rounded-full ${
                                    idx <= currentQuestion ? 'bg-purple-500' : 'bg-slate-600'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <h3 className="text-2xl md:text-3xl font-bold text-white leading-relaxed">
                            {aiQuestions[currentQuestion]}
                          </h3>
                        </div>

                        <button
                          onClick={handleFlipToAnswer}
                          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-4 rounded-xl font-medium transition-all transform hover:scale-105 mt-8"
                        >
                          Share My Thoughts
                          <ArrowRight className="w-5 h-5 inline ml-2" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-full bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700/50 p-8 md:p-12">
                        <div className="mb-4">
                          <label className="text-purple-400 text-sm font-medium block mb-2">
                            Your Thoughts
                          </label>
                          <textarea
                            value={currentAnswer}
                            onChange={(e) => setCurrentAnswer(e.target.value)}
                            placeholder="Take your time... there's no right answer, only your truth."
                            className="w-full bg-slate-900/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[200px] resize-none"
                            autoFocus
                          />
                        </div>

                        <div className="flex gap-3">
                          <button
                            onClick={() => setIsFlipped(false)}
                            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-xl font-medium transition-all"
                          >
                            Back
                          </button>
                          <button
                            onClick={handleSubmitAnswer}
                            disabled={!currentAnswer.trim()}
                            className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {currentQuestion < aiQuestions.length - 1 ? 'Next Question' : 'Continue'}
                            <ArrowRight className="w-4 h-4 inline ml-2" />
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            </div>
          )}

          {stage === 'contrast' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 md:p-12 border border-slate-700/50"
            >
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-6 text-center">
                Let's Find The Gap
              </h3>
              <p className="text-slate-300 text-center mb-8">
                Understanding what's working and what's not will reveal your path forward
              </p>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <label className="text-emerald-400 font-medium">What's Working</label>
                  </div>
                  <textarea
                    value={contrastWorking}
                    onChange={(e) => setContrastWorking(e.target.value)}
                    placeholder="What's going well? What are you proud of?"
                    className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[150px] resize-none"
                  />
                </div>

                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    <label className="text-amber-400 font-medium">What Needs Attention</label>
                  </div>
                  <textarea
                    value={contrastNotWorking}
                    onChange={(e) => setContrastNotWorking(e.target.value)}
                    placeholder="What's challenging? What would you like to improve?"
                    className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 min-h-[150px] resize-none"
                  />
                </div>
              </div>

              <button
                onClick={handleContrastSubmit}
                disabled={!contrastWorking.trim() || !contrastNotWorking.trim()}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-4 rounded-xl font-medium transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reveal My Path Forward
                <ArrowRight className="w-5 h-5 inline ml-2" />
              </button>
            </motion.div>
          )}

          {stage === 'synthesis' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-purple-900/50 via-slate-800 to-blue-900/50 rounded-2xl p-8 md:p-12 border border-purple-500/30"
            >
              {isLoading ? (
                <div className="text-center py-12">
                  <Loader2 className="w-12 h-12 mx-auto mb-4 text-purple-400 animate-spin" />
                  <p className="text-slate-300">Crafting your personalized insights...</p>
                </div>
              ) : (
                <>
                  <div className="text-center mb-8">
                    <Sparkles className="w-12 h-12 mx-auto mb-4 text-purple-400" />
                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                      Your Personalized Path
                    </h3>
                    <div className="w-20 h-1 bg-gradient-to-r from-purple-500 to-blue-500 mx-auto rounded-full"></div>
                  </div>

                  <div className="bg-slate-900/50 rounded-xl p-6 mb-6">
                    <p className="text-slate-200 leading-relaxed text-lg whitespace-pre-line">
                      {synthesis}
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <button
                      onClick={closeGuide}
                      className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-xl font-medium transition-all"
                    >
                      Close
                    </button>
                    <button
                      onClick={onNext}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all"
                    >
                      Continue to Next
                      <ChevronRight className="w-4 h-4 inline ml-2" />
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </div>
      )}
    </motion.div>
  );
};

const WhySubpage = ({ lesson, onNext }: any) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-4xl mx-auto px-4">
    <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 p-10 rounded-3xl border border-green-600/30 backdrop-blur-sm">
      <h2 className="text-4xl font-bold text-slate-50 mb-6">The Deeper Why</h2>
      <p className="text-slate-300 text-lg leading-relaxed">{lesson.why}</p>
      <div className="text-center mt-8">
        <button onClick={onNext} className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg">
          Next <ChevronRight className="inline ml-2 w-4 h-4" />
        </button>
      </div>
    </div>
  </motion.div>
);

const QuoteSubpage = ({ lesson, onNext }: any) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-4xl mx-auto px-4 text-center">
    <div className="relative">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
        className="mb-8"
      >
        <Feather className="w-16 h-16 mx-auto text-purple-400 mb-6" />
      </motion.div>
      <div className="relative bg-gradient-to-br from-purple-900/40 to-blue-900/40 backdrop-blur-sm p-12 rounded-3xl border border-purple-500/30">
        <div className="absolute -top-6 -left-6 text-purple-500/20 text-9xl font-serif">"</div>
        <div className="absolute -bottom-6 -right-6 text-purple-500/20 text-9xl font-serif">"</div>
        <p className="text-3xl md:text-4xl font-light text-slate-100 italic leading-relaxed relative z-10">
          {lesson.quote}
        </p>
      </div>
      <motion.button
        onClick={onNext}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="mt-8 bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl font-medium"
      >
        Continue <ChevronRight className="inline ml-2 w-4 h-4" />
      </motion.button>
    </div>
  </motion.div>
);

const ConsequencesSubpage = ({ lesson, onNext }: any) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-5xl mx-auto px-4">
    <div className="text-center mb-8">
      <h2 className="text-4xl font-bold text-white mb-2">The Choice Is Yours</h2>
      <p className="text-slate-400">Every action has consequences. Choose wisely.</p>
    </div>

    <div className="grid md:grid-cols-2 gap-6">
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 backdrop-blur-sm p-8 rounded-2xl border border-green-500/30"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-green-400" />
          </div>
          <h3 className="text-2xl font-bold text-green-400">If You Take Action</h3>
        </div>
        <p className="text-slate-200 text-lg leading-relaxed">
          {lesson.consequences.positive}
        </p>
        <div className="mt-6 flex items-center gap-2 text-green-400">
          <Trophy className="w-5 h-5" />
          <span className="text-sm font-medium">The path to growth</span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-br from-red-900/40 to-orange-900/40 backdrop-blur-sm p-8 rounded-2xl border border-red-500/30"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
            <TriangleAlert className="w-6 h-6 text-red-400" />
          </div>
          <h3 className="text-2xl font-bold text-red-400">If You Stay Still</h3>
        </div>
        <p className="text-slate-200 text-lg leading-relaxed">
          {lesson.consequences.negative}
        </p>
        <div className="mt-6 flex items-center gap-2 text-red-400">
          <Shield className="w-5 h-5" />
          <span className="text-sm font-medium">The comfort zone trap</span>
        </div>
      </motion.div>
    </div>

    <div className="text-center mt-8">
      <button
        onClick={onNext}
        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-medium"
      >
        I Choose Growth <ArrowRight className="inline ml-2 w-5 h-5" />
      </button>
    </div>
  </motion.div>
);

const TasksSubpage = ({ tasks, toggleTask, onNext }: any) => {
  const completedCount = tasks.filter((t: any) => t.done).length;
  const allCompleted = completedCount === tasks.length;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-4xl mx-auto px-4">
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Target className="w-8 h-8 text-blue-400" />
            <h2 className="text-4xl font-bold text-white">Your Action Steps</h2>
          </div>
          <p className="text-slate-400">Complete these tasks to master today's lesson</p>
          <div className="mt-4">
            <div className="inline-flex items-center gap-2 bg-slate-700/50 px-4 py-2 rounded-full">
              <span className="text-sm text-slate-300">{completedCount} of {tasks.length} completed</span>
            </div>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          {tasks.map((task: any, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-slate-700/30 backdrop-blur-sm p-6 rounded-xl border ${
                task.done ? 'border-green-500/50 bg-green-500/5' : 'border-slate-600/50'
              } cursor-pointer hover:border-blue-500/50 transition-all`}
              onClick={() => toggleTask(index)}
            >
              <div className="flex items-start gap-4">
                <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  task.done ? 'bg-green-500 border-green-500' : 'border-slate-500'
                }`}>
                  {task.done && <CheckCircle className="w-4 h-4 text-white" />}
                </div>
                <div className="flex-1">
                  <p className={`text-lg ${task.done ? 'text-slate-400 line-through' : 'text-slate-200'}`}>
                    {task.task}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <button
            onClick={onNext}
            disabled={!allCompleted}
            className={`px-8 py-3 rounded-xl font-medium transition-all ${
              allCompleted
                ? 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white'
                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
            }`}
          >
            {allCompleted ? (
              <>Continue to Reflection <ArrowRight className="inline ml-2 w-5 h-5" /></>
            ) : (
              <>Complete All Tasks First</>
            )}
          </button>
          {!allCompleted && (
            <p className="text-slate-500 text-sm mt-2">Tap tasks to mark them complete</p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Add this BEFORE the ReflectionSubpage component


const ActionSchedulerPage = ({ tasks, onComplete, onBack }) => {
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [scheduledTasks, setScheduledTasks] = useState([]);
  const [selectedTime, setSelectedTime] = useState({ hour: 3, minute: 0, period: 'PM' });
  const [selectedDay, setSelectedDay] = useState('today');
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderTime, setReminderTime] = useState('15min');
  const [location, setLocation] = useState('');
  const [showCommitment, setShowCommitment] = useState(false);
  const [commitmentText, setCommitmentText] = useState('');
  const [isRotating, setIsRotating] = useState(false);

  // Clock hand angles
  const hourAngle = ((selectedTime.hour % 12) * 30) + (selectedTime.minute * 0.5);
  const minuteAngle = selectedTime.minute * 6;

  const dayOptions = [
    { value: 'today', label: 'Today', date: new Date() },
    { value: 'tomorrow', label: 'Tomorrow', date: new Date(Date.now() + 86400000) },
    { value: 'this_week', label: 'This Week', date: new Date(Date.now() + 259200000) }
  ];

  const reminderOptions = [
    { value: '15min', label: '15 min before' },
    { value: '1hour', label: '1 hour before' },
    { value: 'morning', label: 'Morning of' }
  ];

  const currentTask = tasks[currentTaskIndex];

  // Analytics tracking
  const trackEvent = (eventName, properties = {}) => {
    console.log('📊 Analytics:', eventName, properties);
  };

  const handleTimeChange = (type, value) => {
    setIsRotating(true);
    setTimeout(() => setIsRotating(false), 300);

    if (type === 'hour') {
      setSelectedTime(prev => ({ ...prev, hour: value }));
    } else if (type === 'minute') {
      setSelectedTime(prev => ({ ...prev, minute: value }));
    } else if (type === 'period') {
      setSelectedTime(prev => ({ ...prev, period: value }));
    }
  };

  const getScheduledDateTime = () => {
    const dayOption = dayOptions.find(d => d.value === selectedDay);
    const date = new Date(dayOption.date);
    
    let hour = selectedTime.hour;
    if (selectedTime.period === 'PM' && hour !== 12) hour += 12;
    if (selectedTime.period === 'AM' && hour === 12) hour = 0;
    
    date.setHours(hour, selectedTime.minute, 0, 0);
    return date;
  };

  const handleScheduleTask = () => {
    const scheduledDateTime = getScheduledDateTime();
    
    const scheduled = {
      task: currentTask,
      time: selectedTime,
      day: selectedDay,
      dateTime: scheduledDateTime,
      reminder: reminderEnabled ? reminderTime : null,
      location: location || null
    };

    setScheduledTasks([...scheduledTasks, scheduled]);
    trackEvent('task_scheduled', { task_index: currentTaskIndex });

    if (currentTaskIndex < tasks.length - 1) {
      setCurrentTaskIndex(currentTaskIndex + 1);
      setLocation('');
    } else {
      setShowCommitment(true);
    }
  };

  const addToCalendar = (scheduled) => {
    const startTime = new Date(scheduled.dateTime).toISOString().replace(/-|:|\.\d+/g, '');
    const endTime = new Date(scheduled.dateTime.getTime() + 30 * 60000).toISOString().replace(/-|:|\.\d+/g, '');
    
    const googleCalendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent('Action: ' + scheduled.task.task)}&dates=${startTime}/${endTime}&details=${encodeURIComponent('Task from your learning journey')}&location=${encodeURIComponent(scheduled.location || '')}`;

    window.open(googleCalendarUrl, '_blank');
  };

  const handleFinalCommitment = () => {
    if (commitmentText.toUpperCase() === 'I COMMIT') {
      trackEvent('commitment_completed', { total_tasks: scheduledTasks.length });
      onComplete(scheduledTasks);
    }
  };

  if (showCommitment) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-4xl mx-auto px-4">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-3xl p-8 border border-slate-700/50">
          <div className="text-center mb-8">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }} className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-white" />
            </motion.div>
            <h2 className="text-4xl font-bold text-white mb-2">Your Commitment Contract</h2>
            <p className="text-slate-400">Make it official</p>
          </div>

          <div className="bg-slate-700/30 rounded-2xl p-6 mb-6 space-y-4">
            <h3 className="text-xl font-bold text-white mb-4">You've scheduled:</h3>
            {scheduledTasks.map((scheduled, index) => (
              <motion.div key={index} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} className="bg-slate-800/50 rounded-xl p-4 border border-slate-600">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-slate-200 font-medium mb-2">{scheduled.task.task}</p>
                    <div className="flex flex-wrap gap-3 text-sm text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {dayOptions.find(d => d.value === scheduled.day)?.label}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {scheduled.time.hour}:{scheduled.time.minute.toString().padStart(2, '0')} {scheduled.time.period}
                      </span>
                      {scheduled.reminder && (
                        <span className="flex items-center gap-1 text-green-400">
                          <Bell className="w-4 h-4" />
                          {reminderOptions.find(r => r.value === scheduled.reminder)?.label}
                        </span>
                      )}
                    </div>
                  </div>
                  <button onClick={() => addToCalendar(scheduled)} className="ml-4 text-purple-400 hover:text-purple-300 transition-colors" title="Add to Calendar">
                    <Calendar className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 rounded-2xl p-6 border border-purple-500/30 mb-6">
            <p className="text-slate-200 text-lg mb-4 text-center">
              "I commit to completing these actions at the scheduled times."
            </p>
            <div className="mb-4">
              <label className="block text-slate-300 mb-2">Type "I COMMIT" to confirm:</label>
              <input type="text" value={commitmentText} onChange={(e) => setCommitmentText(e.target.value)} placeholder="I COMMIT" className="w-full bg-slate-900/50 border border-slate-600 rounded-xl p-4 text-slate-200 text-center text-xl font-bold uppercase placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors" />
            </div>
          </div>

          <div className="text-center">
            <button onClick={handleFinalCommitment} disabled={commitmentText.toUpperCase() !== 'I COMMIT'} className={`px-8 py-4 rounded-xl font-bold text-lg transition-all ${commitmentText.toUpperCase() === 'I COMMIT' ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white' : 'bg-slate-700 text-slate-500 cursor-not-allowed'}`}>
              Lock In My Commitment <ArrowRight className="inline ml-2 w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-5xl mx-auto px-4">
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-3xl p-8 border border-slate-700/50">
        <div className="text-center mb-8">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }} className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Clock className="w-10 h-10 text-white" />
          </motion.div>
          <h2 className="text-4xl font-bold text-white mb-2">When Will You Take Action?</h2>
          <p className="text-slate-400 mb-4">The difference between wanting and doing? A specific time.</p>
          <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 rounded-full px-4 py-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-purple-300 text-sm font-medium">Task {currentTaskIndex + 1} of {tasks.length}</span>
          </div>
        </div>

        <motion.div key={currentTaskIndex} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-2xl p-6 border border-blue-500/30 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Target className="w-5 h-5 text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-white mb-2">{currentTask.task}</h3>
              <p className="text-slate-400 text-sm">Schedule exactly when you'll do this</p>
            </div>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-bold text-white mb-4 text-center">Select Time</h3>
            
            <div className="relative w-80 h-80 mx-auto mb-6">
              <motion.div animate={isRotating ? { rotate: [0, 5, -5, 0] } : {}} transition={{ duration: 0.3 }} className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-800 rounded-full shadow-2xl border-8 border-slate-600" style={{ boxShadow: 'inset 0 0 60px rgba(0,0,0,0.5), 0 20px 40px rgba(0,0,0,0.7)' }}>
                <div className="absolute inset-0 rounded-full opacity-10" style={{ background: 'repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)' }} />
                
                <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-slate-900 rounded-full transform -translate-x-1/2 -translate-y-1/2 z-20 shadow-lg" />

                {[...Array(12)].map((_, i) => {
                  const angle = (i * 30) - 90;
                  const isMainHour = i % 3 === 0;
                  return (
                    <div key={i} className="absolute top-1/2 left-1/2" style={{ transform: `rotate(${angle + 90}deg) translateY(-140px)`, transformOrigin: '0 0' }}>
                      <div className={`${isMainHour ? 'w-1 h-6 bg-slate-300' : 'w-0.5 h-3 bg-slate-400'} mx-auto`} />
                      {isMainHour && (
                        <div className="text-slate-300 text-xl font-bold mt-2 text-center" style={{ transform: `rotate(${-angle - 90}deg)` }}>
                          {i === 0 ? 12 : i}
                        </div>
                      )}
                    </div>
                  );
                })}

                <motion.div animate={{ rotate: hourAngle }} transition={{ type: "spring", stiffness: 100 }} className="absolute top-1/2 left-1/2 origin-bottom" style={{ width: '8px', height: '80px', marginLeft: '-4px', marginTop: '-80px' }}>
                  <div className="w-full h-full bg-gradient-to-b from-slate-300 to-slate-400 rounded-full shadow-lg" />
                </motion.div>

                <motion.div animate={{ rotate: minuteAngle }} transition={{ type: "spring", stiffness: 100 }} className="absolute top-1/2 left-1/2 origin-bottom" style={{ width: '6px', height: '110px', marginLeft: '-3px', marginTop: '-110px' }}>
                  <div className="w-full h-full bg-gradient-to-b from-blue-400 to-blue-500 rounded-full shadow-lg" />
                </motion.div>
              </motion.div>
            </div>

            <div className="bg-slate-700/30 rounded-xl p-4 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 text-xs mb-2">Hour</label>
                  <select value={selectedTime.hour} onChange={(e) => handleTimeChange('hour', Number(e.target.value))} className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-white text-center font-bold focus:outline-none focus:border-blue-500">
                    {[...Array(12)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 text-xs mb-2">Minute</label>
                  <select value={selectedTime.minute} onChange={(e) => handleTimeChange('minute', Number(e.target.value))} className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-white text-center font-bold focus:outline-none focus:border-blue-500">
                    {[0, 15, 30, 45].map((min) => (
                      <option key={min} value={min}>{min.toString().padStart(2, '0')}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 text-xs mb-2">Period</label>
                  <select value={selectedTime.period} onChange={(e) => handleTimeChange('period', e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-white text-center font-bold focus:outline-none focus:border-blue-500">
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-3">Choose Day</h3>
              <div className="grid grid-cols-3 gap-3">
                {dayOptions.map((day) => (
                  <motion.button key={day.value} onClick={() => setSelectedDay(day.value)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className={`p-4 rounded-xl border-2 transition-all ${selectedDay === day.value ? 'bg-blue-500/20 border-blue-500' : 'bg-slate-700/30 border-slate-600'}`}>
                    <Calendar className={`w-6 h-6 mx-auto mb-2 ${selectedDay === day.value ? 'text-blue-400' : 'text-slate-400'}`} />
                    <p className={`text-sm font-medium ${selectedDay === day.value ? 'text-blue-300' : 'text-slate-300'}`}>{day.label}</p>
                  </motion.button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-bold text-white">Reminder</h3>
                <button onClick={() => setReminderEnabled(!reminderEnabled)} className={`p-2 rounded-lg transition-colors ${reminderEnabled ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'}`}>
                  {reminderEnabled ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
                </button>
              </div>
              
              {reminderEnabled && (
                <div className="space-y-2">
                  {reminderOptions.map((option) => (
                    <button key={option.value} onClick={() => setReminderTime(option.value)} className={`w-full text-left p-3 rounded-lg border transition-all ${reminderTime === option.value ? 'bg-green-500/20 border-green-500 text-green-300' : 'bg-slate-700/30 border-slate-600 text-slate-300'}`}>
                      <div className="flex items-center gap-2">
                        {reminderTime === option.value && <Check className="w-4 h-4" />}
                        <span className="text-sm font-medium">{option.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 className="text-xl font-bold text-white mb-3">Location (Optional)</h3>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g., Coffee shop, Gym..." className="w-full bg-slate-700/30 border border-slate-600 rounded-xl pl-10 pr-4 py-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500" />
              </div>
            </div>

            <button onClick={handleScheduleTask} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-all">
              Schedule This Task <ArrowRight className="inline ml-2 w-5 h-5" />
            </button>

            {scheduledTasks.length > 0 && (
              <div className="bg-slate-700/30 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-300 text-sm font-medium">Progress</span>
                  <span className="text-purple-400 text-sm font-bold">{scheduledTasks.length}/{tasks.length}</span>
                </div>
                <div className="h-2 bg-slate-600 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${(scheduledTasks.length / tasks.length) * 100}%` }} className="h-full bg-gradient-to-r from-blue-500 to-purple-500" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const ObstaclesPage = ({ onNext, tasks }) => {
  // Safety check
  if (!tasks || tasks.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 text-center">
        <div className="bg-slate-800/50 rounded-2xl p-8">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">No Tasks Found</h3>
          <p className="text-slate-400 mb-6">There are no tasks to work through.</p>
          <button
            onClick={onNext}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl"
          >
            Continue Anyway <ArrowRight className="inline ml-2 w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [taskConversations, setTaskConversations] = useState({}); // {taskIndex: [{type: 'user'/'ai', text: '...'}]}
  const [userConcern, setUserConcern] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [showBreakAnimation, setShowBreakAnimation] = useState(false);
  const [brokenTasks, setBrokenTasks] = useState(new Set()); // Track which tasks are broken free
  const chatEndRef = useRef(null);

  const currentTask = tasks[currentTaskIndex];
  const currentConversation = taskConversations[currentTaskIndex] || [];
  const hasConversation = currentConversation.length > 0;
  const isTaskBroken = brokenTasks.has(currentTaskIndex);
  const allTasksAddressed = brokenTasks.size === tasks.length;

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentConversation, isAiThinking]);

  const handleSubmitConcern = async () => {
    if (!userConcern.trim()) return;
    
    // Add user message to conversation
    const newMessage = { type: 'user', text: userConcern.trim(), timestamp: Date.now() };
    const updatedConversations = {
      ...taskConversations,
      [currentTaskIndex]: [...currentConversation, newMessage]
    };
    setTaskConversations(updatedConversations);
    setUserConcern('');
    setIsAiThinking(true);

    try {
      // REPLACE WITH YOUR AI ENDPOINT
      const response = await fetch('YOUR_AI_ENDPOINT_URL', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: newMessage.text,
          task: currentTask.task,
          conversationHistory: currentConversation,
          context: `The user is working on this task: "${currentTask.task}". They have a concern. Help them overcome it with tough love, practical advice, and motivation. Previous conversation: ${JSON.stringify(currentConversation.slice(-4))}`,
        })
      });
      
      const data = await response.json();
      
      // Add AI response to conversation
      const aiMessage = { type: 'ai', text: data.response, timestamp: Date.now() };
      setTaskConversations(prev => ({
        ...prev,
        [currentTaskIndex]: [...(prev[currentTaskIndex] || []), aiMessage]
      }));
      
    } catch (error) {
      console.error('AI Error:', error);
      const aiMessage = { 
        type: 'ai', 
        text: "I hear your concern. Here's the truth: obstacles are just tests of commitment. The fact you're thinking about this shows you care. Now let's push through anyway. You're stronger than this doubt.",
        timestamp: Date.now()
      };
      setTaskConversations(prev => ({
        ...prev,
        [currentTaskIndex]: [...(prev[currentTaskIndex] || []), aiMessage]
      }));
    } finally {
      setIsAiThinking(false);
    }
  };

  const handleBreakFree = () => {
    setShowBreakAnimation(true);
    
    setTimeout(() => {
      setBrokenTasks(prev => new Set([...prev, currentTaskIndex]));
      setShowBreakAnimation(false);
      
      // Move to next task if available
      if (currentTaskIndex < tasks.length - 1) {
        setTimeout(() => {
          setCurrentTaskIndex(currentTaskIndex + 1);
        }, 1000);
      }
    }, 2000);
  };

  const handleSkipTask = () => {
    // Mark as broken without any conversation
    const skipMessage = {
      [currentTaskIndex]: [
        { type: 'user', text: "No concerns - I'm ready!", timestamp: Date.now() },
        { type: 'ai', text: "That's the spirit! Confidence is your superpower. Let's do this! 💪", timestamp: Date.now() }
      ]
    };
    setTaskConversations(prev => ({ ...prev, ...skipMessage }));
    setBrokenTasks(prev => new Set([...prev, currentTaskIndex]));
    
    if (currentTaskIndex < tasks.length - 1) {
      setTimeout(() => {
        setCurrentTaskIndex(currentTaskIndex + 1);
      }, 500);
    }
  };

  const handleGoToTask = (index) => {
    if (!showBreakAnimation && !isAiThinking) {
      setCurrentTaskIndex(index);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="w-full max-w-6xl mx-auto px-4"
    >
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-3xl p-8 border border-slate-700/50">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.1 }}
            className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/50"
          >
            <Shield className="w-12 h-12 text-white" />
          </motion.div>
          <h2 className="text-5xl font-bold text-white mb-3">Break Free From Doubt</h2>
          <p className="text-slate-400 text-lg mb-4">Every concern is a cage. Let's shatter them together.</p>
          
          {/* Progress Indicator */}
          <div className="flex items-center justify-center gap-3 mb-6">
            {tasks.map((_, index) => {
              const isCurrent = index === currentTaskIndex;
              const isBroken = brokenTasks.has(index);
              const hasChat = taskConversations[index]?.length > 0;
              
              return (
                <motion.button
                  key={index}
                  onClick={() => handleGoToTask(index)}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.1 }}
                  disabled={showBreakAnimation || isAiThinking}
                  className={`relative w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all ${
                    isBroken 
                      ? 'bg-green-500 text-white shadow-lg shadow-green-500/50 cursor-pointer' 
                      : isCurrent 
                      ? 'bg-orange-500 text-white ring-4 ring-orange-300 scale-110' 
                      : hasChat
                      ? 'bg-blue-500 text-white cursor-pointer'
                      : 'bg-slate-700 text-slate-400 cursor-pointer'
                  }`}
                >
                  {isBroken ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </motion.button>
              );
            })}
          </div>
          
          <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 rounded-full px-5 py-2">
            <Target className="w-4 h-4 text-purple-400" />
            <span className="text-purple-300 text-sm font-medium">
              Task {currentTaskIndex + 1} of {tasks.length}
            </span>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Left Side - Current Task & Cage */}
          <div>
            <motion.div
              key={currentTaskIndex}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-2xl p-6 border border-blue-500/30 mb-6"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Target className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">{currentTask.task}</h3>
                  <p className="text-slate-400">Talk through any doubts or concerns</p>
                </div>
              </div>
            </motion.div>

            {/* The Cage */}
            {!isTaskBroken ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative"
              >
                <div className={`bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 border-4 relative overflow-hidden shadow-2xl ${
                  hasConversation ? 'border-orange-500 shadow-orange-500/20' : 'border-slate-600'
                }`}>
                  {/* Animated Cage Bars */}
                  <div className="absolute inset-0 flex justify-around pointer-events-none">
                    {[...Array(8)].map((_, i) => (
                      <motion.div
                        key={i}
                        animate={showBreakAnimation ? {
                          x: [0, Math.random() * 100 - 50],
                          y: [0, Math.random() * 100 - 50],
                          rotate: [0, Math.random() * 180 - 90],
                          opacity: [1, 0]
                        } : {}}
                        transition={{ duration: 0.8, delay: i * 0.1 }}
                        className={`w-2 h-full ${hasConversation ? 'bg-gradient-to-b from-orange-500 to-red-500' : 'bg-slate-600/50'}`}
                        style={hasConversation ? { boxShadow: '0 0 20px rgba(249, 115, 22, 0.5)' } : {}}
                      />
                    ))}
                  </div>

                  {/* Lock at Top */}
                  {hasConversation && (
                    <motion.div
                      animate={showBreakAnimation ? {
                        y: -100,
                        rotate: 360,
                        scale: 0,
                        opacity: 0
                      } : {}}
                      transition={{ duration: 1 }}
                      className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20"
                    >
                      <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/50">
                        <Lock className="w-8 h-8 text-white" />
                      </div>
                    </motion.div>
                  )}

                  <div className="relative z-10">
                    {/* Conversation Area */}
                    {hasConversation && (
                      <div className={`bg-slate-900/70 rounded-xl p-4 mb-4 max-h-[400px] overflow-y-auto ${hasConversation ? 'pt-12' : ''}`}>
                        <div className="space-y-4">
                          {currentConversation.map((message, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                              <div className={`max-w-[85%] rounded-2xl p-4 ${
                                message.type === 'user' 
                                  ? 'bg-orange-600 text-white' 
                                  : 'bg-slate-700/80 text-slate-200 border border-slate-600'
                              }`}>
                                {message.type === 'ai' && (
                                  <div className="flex items-center gap-2 mb-2">
                                    <Brain className="w-4 h-4 text-purple-400" />
                                    <span className="text-purple-400 font-semibold text-xs">AI Coach</span>
                                  </div>
                                )}
                                <p className="text-sm leading-relaxed whitespace-pre-line">{message.text}</p>
                              </div>
                            </motion.div>
                          ))}
                          
                          {isAiThinking && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="flex justify-start"
                            >
                              <div className="bg-slate-700/80 rounded-2xl p-4 border border-slate-600">
                                <div className="flex items-center gap-2">
                                  <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                                  <span className="text-slate-400 text-sm">AI is thinking...</span>
                                </div>
                              </div>
                            </motion.div>
                          )}
                          
                          <div ref={chatEndRef} />
                        </div>
                      </div>
                    )}

                    {/* Empty State */}
                    {!hasConversation && (
                      <div className="text-center py-8 mb-4">
                        <Lock className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                        <p className="text-slate-400 text-lg mb-2">This cage is empty...</p>
                        <p className="text-slate-500 text-sm">Share your doubts. Let's break them together.</p>
                      </div>
                    )}

                    {/* Input Area */}
                    {!showBreakAnimation && (
                      <div className="bg-slate-800/70 rounded-xl p-4">
                        <textarea
                          value={userConcern}
                          onChange={(e) => setUserConcern(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSubmitConcern();
                            }
                          }}
                          placeholder="Type your concern here... (Press Enter to send)"
                          className="w-full h-24 bg-slate-900/50 border-2 border-slate-600 rounded-xl p-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors resize-none text-sm"
                          disabled={isAiThinking}
                        />

                        <div className="flex gap-3 mt-3">
                          <button
                            onClick={handleSubmitConcern}
                            disabled={!userConcern.trim() || isAiThinking}
                            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all text-sm ${
                              userConcern.trim() && !isAiThinking
                                ? 'bg-orange-600 hover:bg-orange-700 text-white'
                                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                            }`}
                          >
                            {isAiThinking ? 'Sending...' : 'Send Message'}
                          </button>
                          
                          {!hasConversation && (
                            <button
                              onClick={handleSkipTask}
                              className="px-4 py-2 rounded-lg font-medium bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-sm"
                            >
                              No Concerns 💪
                            </button>
                          )}
                        </div>

                        {hasConversation && !isAiThinking && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-4 pt-4 border-t border-slate-700"
                          >
                            <p className="text-slate-400 text-xs mb-3 text-center">
                              Feel confident? Ready to move forward?
                            </p>
                            <button
                              onClick={handleBreakFree}
                              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-green-500/50 transition-all"
                            >
                              💥 BREAK FREE! 💥
                            </button>
                          </motion.div>
                        )}
                      </div>
                    )}

                    {/* Break Animation Overlay */}
                    {showBreakAnimation && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 flex items-center justify-center z-30 bg-slate-900/50 backdrop-blur-sm rounded-xl"
                      >
                        <motion.div
                          animate={{
                            scale: [0, 3, 0],
                            rotate: [0, 180, 360],
                            opacity: [1, 1, 0]
                          }}
                          transition={{ duration: 2 }}
                          className="text-9xl"
                        >
                          💥
                        </motion.div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              // Broken Cage - Freedom
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative"
              >
                <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 rounded-2xl p-8 border-4 border-green-500 relative overflow-hidden">
                  {/* Broken Bars */}
                  <div className="absolute inset-0 flex justify-around pointer-events-none opacity-20">
                    {[...Array(8)].map((_, i) => (
                      <div
                        key={i}
                        className="w-2 h-full bg-slate-600"
                        style={{
                          transform: `rotate(${Math.random() * 30 - 15}deg) translateY(${Math.random() * 20}px)`
                        }}
                      />
                    ))}
                  </div>

                  <div className="relative z-10 text-center">
                    <motion.div
                      animate={{
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center"
                    >
                      <CheckCircle className="w-12 h-12 text-white" />
                    </motion.div>

                    <h3 className="text-4xl font-bold text-green-400 mb-4">FREEDOM! ✨</h3>
                    <p className="text-green-200 text-lg mb-2">
                      You conquered this task!
                    </p>
                    <p className="text-slate-400 text-sm mb-6">
                      {currentConversation.filter(m => m.type === 'user').length} concerns addressed
                    </p>

                    {currentTaskIndex < tasks.length - 1 ? (
                      <button
                        onClick={() => setCurrentTaskIndex(currentTaskIndex + 1)}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-medium"
                      >
                        Next Task <ArrowRight className="inline ml-2 w-5 h-5" />
                      </button>
                    ) : (
                      <p className="text-green-300">Click another task or continue below!</p>
                    )}
                  </div>

                  {/* Confetti Effect */}
                  <div className="absolute inset-0 pointer-events-none">
                    {[...Array(30)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{
                          x: '50%',
                          y: '50%',
                          scale: 0,
                          opacity: 1
                        }}
                        animate={{
                          x: `${Math.random() * 100}%`,
                          y: `${Math.random() * 100}%`,
                          scale: [0, 1, 0],
                          opacity: [1, 1, 0]
                        }}
                        transition={{
                          duration: 2,
                          delay: i * 0.05,
                          ease: "easeOut"
                        }}
                        className="absolute w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: ['#22c55e', '#10b981', '#fbbf24', '#f59e0b'][i % 4]
                        }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Side - All Tasks Overview */}
          <div>
            <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Crown className="w-7 h-7 text-yellow-400" />
              Your Journey
            </h3>
            
            <div className="space-y-4">
              {tasks.map((task, index) => {
                const taskChat = taskConversations[index] || [];
                const isCurrent = index === currentTaskIndex;
                const isBroken = brokenTasks.has(index);
                const hasChat = taskChat.length > 0;
                const messageCount = taskChat.filter(m => m.type === 'user').length;
                
                return (
                  <motion.button
                    key={index}
                    onClick={() => handleGoToTask(index)}
                    disabled={showBreakAnimation || isAiThinking}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    className={`w-full text-left rounded-xl p-5 border-2 transition-all ${
                      isBroken
                        ? 'bg-green-900/20 border-green-500/50'
                        : isCurrent
                        ? 'bg-orange-900/20 border-orange-500 ring-2 ring-orange-400'
                        : hasChat
                        ? 'bg-blue-900/20 border-blue-500/50'
                        : 'bg-slate-800/30 border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isBroken
                          ? 'bg-green-500'
                          : isCurrent
                          ? 'bg-orange-500'
                          : hasChat
                          ? 'bg-blue-500'
                          : 'bg-slate-700'
                      }`}>
                        {isBroken ? (
                          <CheckCircle className="w-6 h-6 text-white" />
                        ) : (
                          <span className="text-white font-bold">{index + 1}</span>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-semibold mb-2 ${
                          isBroken ? 'text-green-300' : isCurrent ? 'text-orange-300' : hasChat ? 'text-blue-300' : 'text-slate-400'
                        }`}>
                          {task.task}
                        </h4>
                        
                        {hasChat && (
                          <div className="flex items-center gap-2 text-xs">
                            <span className={`${isBroken ? 'text-green-400' : 'text-blue-400'}`}>
                              💬 {messageCount} {messageCount === 1 ? 'message' : 'messages'}
                            </span>
                          </div>
                        )}
                        
                        {isBroken && (
                          <div className="flex items-center gap-2 text-green-400 text-sm mt-1">
                            <Flame className="w-4 h-4" />
                            <span className="font-medium">Conquered!</span>
                          </div>
                        )}
                        
                        {!hasChat && !isCurrent && (
                          <p className="text-slate-600 text-sm">Waiting...</p>
                        )}
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Stats */}
            <div className="mt-6 bg-slate-800/50 rounded-xl p-5 border border-slate-700">
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-400 font-medium">Progress</span>
                <span className="text-2xl font-bold text-white">
                  {brokenTasks.size}/{tasks.length}
                </span>
              </div>
              <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(brokenTasks.size / tasks.length) * 100}%` }}
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                  transition={{ duration: 0.5 }}
                />
              </div>
              
              <div className="mt-4 pt-4 border-t border-slate-700 space-y-2 text-sm">
                <div className="flex justify-between text-slate-400">
                  <span>Total Messages:</span>
                  <span className="text-white font-medium">
                    {Object.values(taskConversations).reduce((sum, conv) => sum + conv.filter(m => m.type === 'user').length, 0)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Tasks with Doubts:</span>
                  <span className="text-white font-medium">
                    {Object.keys(taskConversations).length}/{tasks.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Action */}
        {allTasksAddressed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-2xl p-8 border border-purple-500/50 mb-6">
              <h3 className="text-3xl font-bold text-white mb-3">🎉 All Cages Broken! 🎉</h3>
              <p className="text-slate-300 text-lg mb-4">
                You've faced every doubt and shattered every barrier. Nothing can stop you now.
              </p>
              <div className="flex items-center justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-purple-400" />
                  <span className="text-purple-300">Protected</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  <span className="text-yellow-300">Energized</span>
                </div>
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-yellow-400" />
                  <span className="text-yellow-300">Unstoppable</span>
                </div>
              </div>
            </div>

            <button
              onClick={onNext}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold text-lg px-12 py-4 rounded-xl shadow-lg shadow-purple-500/50 transition-all"
            >
              Continue Your Journey <ArrowRight className="inline ml-2 w-6 h-6" />
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

const ReflectionSubpage = ({ journalEntry, setJournalEntry, onComplete }: any) => {
  const [localEntry, setLocalEntry] = useState(journalEntry);
  const canComplete = localEntry.trim().length > 20;

  const handleComplete = () => {
    setJournalEntry(localEntry);
    onComplete();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-4xl mx-auto px-4">
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Brain className="w-8 h-8 text-purple-400" />
            <h2 className="text-4xl font-bold text-white">Reflect & Integrate</h2>
          </div>
          <p className="text-slate-400">Write down your thoughts and insights from today's lesson</p>
        </div>

        <div className="mb-6">
          <textarea
            value={localEntry}
            onChange={(e) => setLocalEntry(e.target.value)}
            placeholder="What did you learn? How will you apply this? What surprised you?..."
            className="w-full h-64 bg-slate-900/50 border border-slate-600 rounded-xl p-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors resize-none"
          />
          <div className="flex justify-between items-center mt-2 px-2">
            <span className="text-slate-500 text-sm">
              {localEntry.length} characters
            </span>
            <span className="text-slate-500 text-sm">
              {canComplete ? '✓ Ready to complete' : 'Write at least 20 characters'}
            </span>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={handleComplete}
            disabled={!canComplete}
            className={`px-8 py-3 rounded-xl font-medium transition-all ${
              canComplete
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white'
                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
            }`}
          >
            Complete Lesson <CheckCircle className="inline ml-2 w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const CompletionSubpage = ({ lesson, onBackToTimeline }: any) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-4xl mx-auto px-4 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
        className="mb-8"
      >
        <div className="w-32 h-32 mx-auto bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mb-6 animate-pulse">
          <Trophy className="w-16 h-16 text-white" />
        </div>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-yellow-200 via-orange-200 to-yellow-300 bg-clip-text text-transparent mb-4"
      >
        Lesson Complete!
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-2xl text-slate-300 mb-8"
      >
        You've earned <span className="text-yellow-400 font-bold">+{lesson.xp} XP</span>
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50 mb-8"
      >
        <h3 className="text-2xl font-bold text-white mb-4">What's Next?</h3>
        <p className="text-slate-300 text-lg mb-6">
          You've taken the first step. Now it's time to put this into practice in the real world.
        </p>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-slate-700/30 p-4 rounded-xl">
            <Star className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <p className="text-slate-300 text-sm">Keep your streak alive</p>
          </div>
          <div className="bg-slate-700/30 p-4 rounded-xl">
            <Flame className="w-8 h-8 text-orange-400 mx-auto mb-2" />
            <p className="text-slate-300 text-sm">Practice daily</p>
          </div>
          <div className="bg-slate-700/30 p-4 rounded-xl">
            <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-slate-300 text-sm">Track your progress</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="flex gap-4 justify-center"
      >
        <button
          onClick={onBackToTimeline}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-medium"
        >
          Back to Journey <Navigation className="inline ml-2 w-5 h-5" />
        </button>
      </motion.div>

      <div className="fixed inset-0 pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-yellow-400 rounded-full"
            initial={{
              x: typeof window !== 'undefined' ? window.innerWidth / 2 : 0,
              y: typeof window !== 'undefined' ? window.innerHeight / 2 : 0,
              scale: 0
            }}
            animate={{
              x: typeof window !== 'undefined' ? Math.random() * window.innerWidth : 0,
              y: typeof window !== 'undefined' ? Math.random() * window.innerHeight : 0,
              scale: [0, 1, 0],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 2,
              delay: i * 0.02,
              ease: "easeOut"
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}