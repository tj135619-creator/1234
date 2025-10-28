import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Target, Users, BookOpen, ArrowRight } from "lucide-react";
import GoalPlannerMain from "@/components/whtsurgoal/GoalPlannerMain";
import Onboardingquiz from "./Onboardingquiz";
import { useOnboarding } from "src/contexts/OnboardingContext";
import { useNavigate } from "react-router-dom";
import { auth } from "src/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import type { User } from "firebase/auth";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/600.css";
import AvatarChooser from "./avator";



export default function CreateGoalView() {
  const [showGoalPlanner, setShowGoalPlanner] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false); // NEW STATE
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showAvatarChooser, setShowAvatarChooser] = useState(false);

  const [checkingStatus, setCheckingStatus] = useState(true);
  const { markGoalComplete, onboardingStatus } = useOnboarding();
  const navigate = useNavigate();

  const handleConfirm = async () => {
  if (!selectedAvatar) return;

  // Save to localStorage / do any local side-effects first
  try {
    localStorage.setItem('selectedAvatar', JSON.stringify(selectedAvatar));
    console.log('Selected avatar saved:', selectedAvatar);
  } catch (e) {
    console.error('Failed to save avatar:', e);
  }

  // Close modal locally
  setShowModal(false);

  // Give a micro delay so the modal state update can start (optional)
  // but not required — calling onComplete immediately is fine.
  if (typeof onComplete === 'function') {
    // small timeout avoids race with unmount in some setups
    setTimeout(() => {
      onComplete();
    }, 50);
  }
};


  // Listen to Firebase auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log('✅ User authenticated:', user.email, 'UID:', user.uid);
        setCurrentUser(user);
      } else {
        console.log('❌ No user authenticated');
        setCurrentUser(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // CHECK IF GOAL IS ALREADY COMPLETE - Redirect to root if already done
  useEffect(() => {
    if (!authLoading) {
      if (onboardingStatus?.goalCreated) {
        console.log('🚫 Goal already completed, redirecting to dashboard');
        navigate('/', { replace: true });
      } else {
        setCheckingStatus(false);
      }
    }
  }, [authLoading, onboardingStatus, navigate]);

  // --- Typewriter effect for AI card ---


  

  // Handle clicking "Start Your Journey"
  const handleStartJourney = () => {
  if (!currentUser) {
    navigate("/sign-in");
    return;
  }
  setShowAvatarChooser(true); // 👈 show avatar chooser first
};


  // Callback when quiz is completed
  const handleAvatarSelected = () => {
  console.log("🎨 Avatar selected, moving to quiz...");
  setShowAvatarChooser(false);
  setShowQuiz(true); // ✅ just go to quiz, don’t redirect yet
};


    const handleQuizComplete = async () => {
  try {
    const userId = currentUser!.uid;
    console.log(`📝 Marking goal complete for user: ${userId}`);

    await markGoalComplete();
    console.log("✅ Onboarding quiz completed");

    await new Promise(resolve => setTimeout(resolve, 500));
    navigate(`/conversation/${userId}`, { replace: true });
  } catch (error) {
    console.error("Error completing quiz:", error);
    if (currentUser?.uid) navigate(`/conversation/${currentUser.uid}`, { replace: true });
  }
};


  const handleGoalPlannerClose = () => {
    setShowGoalPlanner(false);
    if (currentUser && currentUser.uid) {
      console.log(`🚀 Redirecting to /conversation/${currentUser.uid}`);
      navigate(`/conversation/${currentUser.uid}`, { replace: true });
    } else {
      console.error("❌ No authenticated user found, redirecting to sign-in");
      navigate('/sign-in');
    }
  };

  // Show loading while checking auth AND onboarding status
  if (authLoading || checkingStatus) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Checking status...</p>
        </div>
      </div>
    );
  }

  // Show quiz if triggered
  // Show quiz if triggered
  if (showAvatarChooser) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-purple-900 to-indigo-950 flex items-center justify-center">
      <AvatarChooser onComplete={handleAvatarSelected} />
    </div>
  );
}


if (showQuiz) {
  return (
    <div className="min-h-screen w-full flex justify-center items-start pt-24 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="w-full max-w-3xl">
        <Onboardingquiz 
          onComplete={handleQuizComplete} 
          className="font-poppins rounded-lg"
        />
        {showAvatarChooser && (
  <AvatarChooser onComplete={handleAvatarSelected} />
)}

      </div>
    </div>
  );
};


  // Show Goal Planner View (optional, you can trigger it after quiz if needed)
  if (showGoalPlanner) {
    return <GoalPlannerMain onClose={handleGoalPlannerClose} />;
  }

  // Initial Landing Page
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Hero Section */}
      <section className="relative py-20 px-4 text-center">
        <motion.div
          className="relative max-w-4xl mx-auto space-y-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Badge className="mb-4 bg-blue-500/20 text-blue-200 border border-blue-500/30 rounded-xl px-3 py-1">
            <Sparkles className="w-3 h-3 mr-1" />
            AI-Powered Social Skills Coaching
          </Badge>

          <h1 className="text-5xl md:text-7xl font-black text-white leading-tight">
            Transform Your
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 block">
              Social Skills
            </span>
            with AI Coaching
          </h1>

          <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Get a personalized action plan based on proven principles from
            <span className="font-semibold text-white">
              {" "} "How to Win Friends and Influence People"
            </span>{" "}
            — powered by intelligent AI conversations.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              onClick={handleStartJourney}
              disabled={!currentUser}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg px-8 py-6 font-semibold rounded-2xl shadow-xl transition-all duration-200 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="button-start-journey"
            >
              Start Your Journey
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="text-lg px-8 py-6 rounded-2xl border-white/20 text-white bg-white/5 hover:bg-white/10 backdrop-blur-sm"
              data-testid="button-learn-more"
            >
              Learn More
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Why Our AI Approach Works
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Traditional courses tell you what to do. We create a personalized
              plan based on your specific goals and current situation.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Target,
                title: "Personalized Goal Setting",
                description:
                  "Our AI analyzes your specific challenges and creates SMART goals tailored to your social skills journey. No generic advice.",
                gradient: "from-blue-500 to-blue-600",
                delay: 0.3,
              },
              {
                icon: Users,
                title: "Avatar-Guided Coaching",
                description:
                  "Choose from three unique AI personalities that match your learning style — visionary, analytical, or resilient approaches.",
                gradient: "from-purple-500 to-purple-600",
                delay: 0.4,
              },
              {
                icon: BookOpen,
                title: "Carnegie Principles",
                description:
                  'Every plan is built on time-tested principles from the classic "How to Win Friends and Influence People" methodology.',
                gradient: "from-indigo-500 to-indigo-600",
                delay: 0.5,
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: feature.delay }}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <Card className="bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300 rounded-2xl h-full">
                  <CardHeader>
                    <div
                      className={`w-12 h-12 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-4`}
                    >
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-xl text-white">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      

      {/* CTA Section */}
      <section className="py-20 px-4">
        <motion.div
          className="max-w-4xl mx-auto text-center space-y-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <h2 className="text-4xl font-bold text-white">
            Ready to 10x Your Social Confidence?
          </h2>
          <p className="text-xl text-slate-300">
            Join thousands who have transformed their social skills with our
            AI-powered approach.
          </p>

          <Button
            size="lg"
            onClick={handleStartJourney}
            disabled={!currentUser}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-lg px-12 py-6 font-semibold rounded-2xl shadow-xl transition-all duration-200 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="button-get-started-cta"
          >
            Get Started Free
            <Sparkles className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>
      </section>

      {/* INLINE STYLES */}
      <style>{`
        .ai-card {
          width: 60vw;
          min-height: 40vh;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #fff;
          padding: 2rem;
          border-radius: 20px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          position: relative;
          z-index: 0;
        }

        .ai-card p {
          font-size: 1.2rem;
          line-height: 1.6;
          font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
        }

        @media (max-width: 768px) {
          .ai-card {
            width: 85vw;
            min-height: 30vh;
            padding: 1.5rem;
          }
          .ai-card p {
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  );
}
