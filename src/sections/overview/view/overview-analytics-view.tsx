import React, { useState, useEffect , useRef } from 'react';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, doc, getDoc, getDocs, setDoc } from "firebase/firestore";
import { db  } from "./firebase"; // adjust path if different

// Remove this line:
// import { useRouter } from 'next/router';

// Instead, use:
const router = {
  push: (url: string) => {
    window.location.href = url;
  }
};


import { auth, signInWithGoogle, logOut  } from '../../../firebase';
import { 
  Sparkles, Zap, Heart, Share2, ChevronLeft, ChevronRight, Users,
  X
} from 'lucide-react';
import Avatar01 from 'src/AVATORS/01.svg';
import Avatar02 from 'src/AVATORS/02.svg';
import Avatar03 from 'src/AVATORS/03.svg';
import AvatarChooser from './avator';
import  LiveCoach from './BUDDYCHAT'
import IRLConnectionsHub from './irlconnections'
import IRLConnectionsValueHero from './HerosectionIRL'
import EnhancedTaskHub from './liveactionsupport'
import HeroSection from './HerosectionLive';
import OnboardingOverlay from "./OnboardingOverlay"; // adjust path if needed


const avatars = [Avatar01, Avatar02, Avatar03];


import { DashboardContent } from 'src/layouts/dashboard';
import TodayActionCard from 'src/components/01';
import DuolingoProgressMap from 'src/components/02';
import GoalGridChatbot from 'src/components/03';
import FriendsCommunity from "src/components/04";
import TodayLessonHero from 'src/components/05';
import MiniTaskTracker from 'src/components/tasktrackersmall';
import { runStyledOverviewTour } from './joyride'; // adjust path if needed
import EyeContactTrainer from 'src/components/07';
import Day1Navigator from "src/components/DAY_01/MAINNAVIGATOR";


const randomIndex = Math.floor(Math.random() * avatars.length);
const selectedAvatar = avatars[randomIndex];


export function OverviewAnalyticsView() {
  const mapRef = useRef<HTMLDivElement>(null); 
  const [highlight, setHighlight] = useState(false);
   const [user, loading, authError] = useAuthState(auth); // rename error to authError
  const [testDay, setTestDay] = useState(null);
  const todayRef = useRef<HTMLDivElement>(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const [isHubOpen, setIsHubOpen] = useState(false);
  const [showTip, setShowTip] = useState(false); // initially hidden
  const [showOnboarding, setShowOnboarding] = useState(false);
   // Fallback timeout if loading never resolves
  const [authReady, setAuthReady] = useState(false);

  const [showTooltip, setShowTooltip] = useState(true);



  

  useEffect(() => {
    const timer = setTimeout(() => setAuthReady(true), 3000);
    return () => clearTimeout(timer);
  }, []);

useEffect(() => {
  const handleMessage = (event: MessageEvent) => {
    // Listen for message from onboarding
    if (event.data === "Navigate to Timeline" && mapRef.current) {
      // Show the tooltip
      setShowTip(true);

      // Scroll into view
      mapRef.current.scrollIntoView({ behavior: "smooth", block: "center" });

      // Trigger highlight animation
      setHighlight(true);
      setTimeout(() => setHighlight(false), 2000); // Highlight lasts 2 seconds
    }
  };

  window.addEventListener("message", handleMessage);
  return () => window.removeEventListener("message", handleMessage);
}, []);

useEffect(() => {
  const checkOnboarding = async () => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);

    if (!snap.exists()) {
      await setDoc(userRef, {
        email: user.email,
        onboardingDone: false,
        createdAt: new Date().toISOString(),
      });
      setShowOnboarding(true);
    } else if (!snap.data().onboardingDone) {
      setShowOnboarding(true);
    }
  };
  checkOnboarding();
}, [user]);

 
useEffect(() => {
  if (!user) return; // early return if not logged in
  const checkDatedCourses = async () => {
    console.log('Checking for social_skills document...');
    console.log('User ID:', user.uid);
    const docRef = doc(db, `users/${user.uid}/datedcourses`, 'social_skills');
    const docSnap = await getDoc(docRef);
    console.log('Document exists:', docSnap.exists());
    if (!docSnap.exists()) {
      console.log('social_skills document not found - showing overlay');
      setShowOverlay(true);
      setTimeout(() => {
        console.log('Redirecting to conversation page...');
        window.location.href = `/conversation/${user.uid}`;
      }, 3000);
    } else {
      console.log('social_skills document found:', docSnap.data());
    }
  };
  checkDatedCourses();
}, [user]); // only depend on `user`

  


  const handleFinish = async () => {
  if (user) {
    const userRef = doc(db, "users", user.uid);
    await setDoc(userRef, { onboardingDone: true }, { merge: true });
  }
  setShowOnboarding(false);
};


  

  const handleStartLesson = (lesson) => {
    console.log('Starting lesson:', lesson);
  };

  // NEW: Conditional rendering block for the full-screen Hub overlay
if (isHubOpen) {
    return (
      <div className="fixed inset-0 z-[1000] overflow-y-auto bg-gradient-to-br from-purple-950 via-purple-900 to-indigo-950">
        {/* The Hub Component */}
        <IRLConnectionsHub onClose={() => setIsHubOpen(false)} />
        
        {/* External Close Button */}
        {/*<button
          onClick={() => setIsHubOpen(false)}
          className="absolute top-4 right-4 z-[1001] p-3 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg transition-all"
        >
          <X className="w-6 h-6" />
        </button>*/}
      </div>
    );
  }

  // ======= SIGN-IN GATE =======
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-950 to-indigo-950 text-white text-xl">
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-950 via-purple-900 to-indigo-950 text-center px-6">
        <h1 className="text-3xl font-bold text-white mb-6">Welcome to GoalGrid</h1>
        <p className="text-purple-200 mb-8 max-w-md">
          Sign in to start your journey toward better connections and personal growth.
        </p>
        <button
          onClick={signInWithGoogle}
          className="px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-full shadow-2xl hover:scale-105 transition-all border-2 border-white/40"
        >
          Sign in with Google
        </button>
      </div>
    );
  }
  // ======= END SIGN-IN GATE =======

  if (isHubOpen) {
    return (
      <div className="fixed inset-0 z-[1000] overflow-y-auto bg-gradient-to-br from-purple-950 via-purple-900 to-indigo-950">
        <IRLConnectionsHub onClose={() => setIsHubOpen(false)} />
      </div>
    );
  }
  
    return (
    <>
      {/* 1. No Plan Found Overlay */}
      {showOverlay && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/90 text-white p-6 text-center">
          <h1 className="text-4xl font-bold mb-4">No Plan Found</h1>
          <p className="text-lg mb-6">Go create your plan to get started!</p>
          <button
            className="px-6 py-3 bg-purple-600 rounded-lg hover:bg-purple-700 transition"
            onClick={() => window.location.href = `/conversation/${user.uid}`}
          >
            Create Your Plan
          </button>
        </div>
      )}

      {/* 2. Onboarding Overlay */}
      {showOnboarding && (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
    <div className="w-full max-w-md sm:max-w-lg md:max-w-xl rounded-3xl overflow-y-auto bg-gradient-to-br from-purple-900 to-indigo-900 text-white shadow-2xl p-6 sm:p-8">
      <OnboardingOverlay onFinish={handleFinish} />
    </div>
  </div>
)}


      {/* 3. Main Dashboard Content */}
      <DashboardContent maxWidth="xl">
        <div className="min-h-screen flex justify-center">
          <div className="w-full max-w-6xl px-6 md:px-10 lg:px-16 py-6 md:py-10 space-y-12">

            {/* Welcome Header */}
            <div className="text-center overview-welcome-header">
              {/* Removed redundant and empty <Grid item> block */}
              <div className="flex flex-col items-center space-y-4">
                <img
                  src={selectedAvatar}
                  alt="Avatar"
                  style={{ width: 120, height: 120, borderRadius: '50%' }}
                />
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-purple-100 text-center">
                  Welcome, {user?.displayName || 'User'}!
                </h1>
              </div>
              <p className="text-base md:text-lg text-purple-200">Let’s continue your journey.</p>
            </div>

            {/* Lesson + Transformation */}
            <div className="space-y-12">
              <div className="today-lesson-hero">
                <div ref={todayRef} className="relative">
  <TodayActionCard />
  

</div>

              </div>
            </div>

            {/* Components Grid */}
            <Grid container spacing={6} justifyContent="center" className="components-grid">

              <Grid item xs={12} md={6} lg={4} className="tour-today-action-card">
                
                {/* --- Control Buttons (For easy testing) --- 
                <div className="flex gap-4 p-4 bg-slate-800 rounded-lg mb-6">
                  <button 
                    onClick={() => setTestDay(1)}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Show Day 1
                  </button>
                  <button 
                    onClick={() => setTestDay(2)}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Show Day 2
                  </button>
                  <button 
                    onClick={() => setTestDay(3)}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Show Day 3
                  </button>
                  <button 
                    onClick={() => setTestDay(4)}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Show Day 4
                  </button>
                  <button 
                    onClick={() => setTestDay(5)}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Show Day 5
                  </button>
                  <button 
                    onClick={() => setTestDay(null)}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    Show Real Data (null)
                  </button>
                </div>
                */}

                {/* --- Pass the activeDay Prop --- */}
                <TodayLessonHero 
                  onStartLesson={handleStartLesson} 
                  activeDay={testDay}
                />
              </Grid>


              <Grid item xs={12} md={6} lg={4} className="tour-duolingo-progress-map">
                <div ref={mapRef} className="relative">
                  {showTip && (
                    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
                      <div className="bg-gradient-to-br from-purple-900 to-indigo-900 text-white rounded-3xl shadow-2xl p-8 max-w-lg text-center border border-purple-500/40 animate-fadeIn">
                        <h2 className="text-2xl font-bold mb-4">Your 5-Day Plan</h2>
                        <p className="text-base mb-3">
                          This section helps you preview your next 5 days — each day’s focus,
                          lessons, and challenges appear here.
                        </p>
                        <p className="text-base mb-6">
                          Explore it at your own pace. You can always come back here to track
                          progress or restart your plan.
                        </p>
                        <button
  onClick={() => {
    setShowTip(false);
    todayRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }}
  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl font-semibold text-white transition-all"
>
  Got it, what's next?
</button>
                      </div>
                    </div>
                  )}

                  <div
                    className={`transition-all duration-700 rounded-2xl p-2 ${
                      highlight
                        ? "ring-8 ring-purple-500/70 shadow-[0_0_40px_rgba(168,85,247,0.8)] scale-105"
                        : ""
                    }`}
                  >
                    <DuolingoProgressMap />
                  </div>
                </div>

              </Grid>
              
              <Grid item xs={12} md={6} lg={4} className="tour-mini-task-tracker">
                <MiniTaskTracker /> {/* <-- Mini Task Tracker integrated */}
              </Grid>
              
              <Grid item xs={12} md={6} lg={4} className="tour-goalgrid-chatbot">
                <HeroSection/>
              </Grid>

              <Grid item xs={12} className="tour-friends-community">
                <FriendsCommunity />
              </Grid>
              
            </Grid>

            {/* IRL Connections Button */}
            <button
              onClick={() => setIsHubOpen(true)}
              className="fixed bottom-6 right-6 z-50 w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-2xl hover:scale-105 transition-all duration-300 transform active:scale-95 border-4 border-white/50"
              title="Open IRL Connections Hub"
            >
              <Users className="w-8 h-8" />
            </button>


            <IRLConnectionsValueHero onOpenHub={() => setIsHubOpen(true)} />
          </div>
        </div>

      
      </DashboardContent>

      
    </>
  );
};