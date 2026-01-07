 import React, { useState, useEffect , useRef } from 'react';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, doc, getDoc, getDocs, setDoc } from "firebase/firestore";
import { db  } from "./firebase"; // adjust path if different
import { getStoredAuth, isAuthenticated } from '@/utils/auth';

// Remove this line:
// import { useRouter } from 'next/router';

// Instead, use:


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
import SocialCityMap from 'src/components/actionmap';
import { Capacitor } from '@capacitor/core';
import Communityfeed from "src/sections/product/view/Communityfeed"
import QuickActionsGrid from 'src/components/quickboard';
import App from "src/sections/user/view/module1"



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
  const [user, loading, authError] = useAuthState(auth);
  const [testDay, setTestDay] = useState(null);
  const todayRef = useRef<HTMLDivElement>(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const [isHubOpen, setIsHubOpen] = useState(false);
  const [showTip, setShowTip] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);
  
  // NEW: User signup analysis state
  const [userSignupStatus, setUserSignupStatus] = useState({
    isNewUser: false,
    hasCompletedOnboarding: false,
    hasPlan: false,
    hasCompletedAnyDay: false,
    accountAge: null as number | null,
    totalInteractions: 0,
    isFullySetup: false
  });



  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data === "Navigate to Timeline" && mapRef.current) {
        setShowTip(true);
        mapRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
        setHighlight(true);
        setTimeout(() => setHighlight(false), 2000);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // NEW: Comprehensive user signup analysis


  // REPLACE the existing userSignupStatus useEffect with this:
useEffect(() => {
  const analyzeUserStatus = async () => {
    if (!user) return;

    try {
      // Get user document
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      // Get plan document
      const planRef = doc(db, `users/${user.uid}/datedcourses`, 'social_skills');
      const planSnap = await getDoc(planRef);

      // Get all completed days
      const completedDaysRef = collection(db, `users/${user.uid}/completedDays`);
      const completedDaysSnap = await getDocs(completedDaysRef);

      // Calculate account age
      const createdAt = userSnap.exists() 
        ? new Date(userSnap.data().createdAt).getTime()
        : new Date().getTime();
      const accountAgeInDays = Math.floor((Date.now() - createdAt) / (1000 * 60 * 60 * 24));

      // Analyze signup status
      const signupStatus = {
        isNewUser: !userSnap.exists() || accountAgeInDays < 1,
        hasCompletedOnboarding: userSnap.exists() && userSnap.data().onboardingDone === true,
        hasPlan: planSnap.exists(),
        hasCompletedAnyDay: !completedDaysSnap.empty,
        accountAge: accountAgeInDays,
        totalInteractions: completedDaysSnap.size,
        isFullySetup: userSnap.exists() && 
                      userSnap.data().onboardingDone === true && 
                      planSnap.exists()
      };

      setUserSignupStatus(signupStatus);

      // Show onboarding if needed
      if (userSnap.exists() && !userSnap.data().onboardingDone) {
        setShowOnboarding(true);
      }

    } catch (error) {
      console.error('❌ Error analyzing user status:', error);
    }
  };

  analyzeUserStatus();
}, [user]);

  useEffect(() => {
    if (!user) return;
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
  }, [user]);





  const handleFinish = async () => {
    if (user) {
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, { onboardingDone: true }, { merge: true });
    }
    setShowOnboarding(false);
  };

  const handleStartLesson = (lesson) => {
  console.log('📥 ========== RECEIVED in handleStartLesson ==========');
  console.log('Full lesson object:', JSON.stringify(lesson, null, 2));
  console.log('lesson.dayNumber:', lesson.dayNumber);
  console.log('lesson.day:', lesson.day);
  console.log('lesson.index:', lesson.index);
  
  // Use the explicit dayNumber that was passed
  const dayNumber = lesson.dayNumber || lesson.day || (lesson.index + 1) || 1;
  const lessonIndex = parseInt(dayNumber) - 1;
  
  console.log('✅ Calculated dayNumber:', dayNumber);
  console.log('✅ Calculated lessonIndex:', lessonIndex);
  
  const dataToStore = {
    lessonIndex: lessonIndex,
    dayNumber: dayNumber,
    timestamp: Date.now()
  };
  
  console.log('💾 Storing in sessionStorage:', dataToStore);
  sessionStorage.setItem('autoOpenLesson', JSON.stringify(dataToStore));
  
  // Verify it was stored
  const stored = sessionStorage.getItem('autoOpenLesson');
  console.log('✅ Verified stored data:', stored);
  
  // Alert before redirect
  alert(`Redirecting to Day ${dayNumber} (Index: ${lessonIndex})\n\nCheck console logs now!`);
  
  setTimeout(() => {
    console.log('🚀 Navigating to /user...');
    window.location.href = `/user`;
  }, 3000);
};




/*
const handleStartTrial = async () => {
  try {
    await PurchasePlugin.startTrialPurchase({
      sku: "your_trial_sku", // replace with your actual SKU
    });
    console.log("✅ Trial started");
  } catch (err) {
    console.error("❌ Error starting trial:", err);
  }
};
*/







  if (isHubOpen) {
    return (
      <div className="fixed inset-0 z-[1000] overflow-y-auto bg-gradient-to-br from-purple-950 via-purple-900 to-indigo-950">
        <IRLConnectionsHub onClose={() => setIsHubOpen(false)} />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-950 to-indigo-950 text-white text-xl">
        Loading...
      </div>
    );
  }

  if (!user) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-950 via-purple-900 to-indigo-950 px-6">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-10 text-center shadow-xl animate-fadeIn">
        <h1 className="text-4xl font-extrabold text-white mb-4">Welcome to GoalGrid</h1>
        <p className="text-purple-200 mb-8 text-lg">
          Sign in to start your journey toward better connections and personal growth.
        </p>

        <button
          onClick={signInWithGoogle}
          className="w-full mb-4 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-full shadow-2xl hover:scale-105 hover:shadow-pink-400/50 transition-transform duration-300"
        >
          Sign in with Google
        </button>

        <button
          onClick={() => (window.location.href = "/sign-in")}
          className="w-full px-6 py-3 bg-white/20 text-white font-semibold rounded-full shadow-inner hover:bg-white/30 transition-colors duration-300"
        >
          First Time User? Sign Up
        </button>

        <p className="mt-6 text-purple-300 text-sm">
          I promise to never sell your data. Hope this helps you as much as it helped me !
        </p>
      </div>
    </div>
  );
}


  return (
    <>
      {/* Debug Panel - Remove in production */}
    

      {/* No Plan Found Overlay */}
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

      {/* Onboarding Overlay */}
      {showOnboarding && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-md sm:max-w-lg md:max-w-xl rounded-3xl overflow-y-auto bg-gradient-to-br from-purple-900 to-indigo-900 text-white shadow-2xl p-6 sm:p-8">
            <OnboardingOverlay onFinish={handleFinish} />
          </div>
        </div>
      )}

      {/* Main Dashboard Content */}
      <DashboardContent maxWidth={false}>
  <div className="min-h-screen">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <img
              src={selectedAvatar}
              alt="Avatar"
              className="w-16 h-16 rounded-full ring-4 ring-white/20 shadow-lg backdrop-blur-sm"
            />
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
                Welcome back, {user?.displayName || 'User'}!
              </h1>
              <p className="text-white/80 mt-1 drop-shadow">Let's continue your journey</p>
            </div>
          </div>
        </div>
        
        
        {/* Quick Actions */}
        <QuickActionsGrid />
       {/* <App /> */}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        
        {/* Left Column - Primary Content */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Today's Lesson - Hero Card */}
          <div className="tour-today-action-card" id="resume-lesson">
            <TodayLessonHero 
              onStartLesson={handleStartLesson} 
              activeDay={testDay}
            />
          </div>

          

          {/* Daily Tasks */}
          <div className="tour-today-action-card" id="daily-tasks">
            <TodayActionCard />
          </div>

          {/* Community Feed */}
          <div className="tour-friends-community">
            <Communityfeed />
          </div>
        </div>

        {/* Right Column - Secondary Content */}
        <div className="space-y-6">
          
          {/* Progress Map */}
          <div className="tour-duolingo-progress-map" ref={mapRef}>
            <div className="sticky top-6">
              {showTip && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
                  <div className="bg-gradient-to-br from-purple-900 to-indigo-900 text-white rounded-3xl shadow-2xl p-8 max-w-lg mx-4 text-center border border-purple-500/40 animate-fadeIn">
                    <h2 className="text-2xl font-bold mb-4">Your 5-Day Plan</h2>
                    <p className="text-base mb-3">
                      This section helps you preview your next 5 days – each day's focus,
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
                id="progress"
                className={`transition-all duration-700 rounded-2xl overflow-hidden ${
                  highlight
                    ? "ring-4 ring-purple-500/70 shadow-[0_0_40px_rgba(168,85,247,0.6)] scale-[1.02]"
                    : ""
                }`}
              >
                <DuolingoProgressMap />
              </div>
            </div>
          </div>

          {/* Mini Task Tracker */}
          <div className="tour-mini-task-tracker">
            <MiniTaskTracker />
          </div>
        </div>
      </div>

    </div>
  </div>
</DashboardContent>
    </>
  );
};