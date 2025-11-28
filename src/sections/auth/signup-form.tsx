import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  AlertTriangle, Eye, EyeOff, Loader2, CheckCircle, Brain, TrendingUp, MessageCircle, Trophy, Target, Users, Zap
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, getAuth, getRedirectResult } from "firebase/auth";
import { doc, setDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { firestore } from "@/sections/creategoal/ConversationFlow";

import { getApiKeys } from "@/backend/apikeys";

const signupSchema = z.object({
  email: z.string().email("Oops! That email doesn't look right"),
  password: z.string().min(6, "Password needs to be at least 6 characters"),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine(val => val === true, "You gotta agree to our rules"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormData = z.infer<typeof signupSchema>;

const detailedFeatures = [
  {
    icon: Brain,
    title: "Daily Tiny Missions",
    description: "We suggest easy social challenges every day. Start small, like saying hi to 3 people, then go bigger at your own pace.",
    benefits: ["Made just for you", "Backed by psychology", "Step-by-step confidence boost"],
    gradient: "from-blue-500 to-blue-600",
  },
  {
    icon: TrendingUp,
    title: "Progress Map",
    description: "Watch your social skills grow on a game-like map. Unlock new skills and see milestones as you go.",
    benefits: ["Visual progress", "New skills unlock", "Gamified fun"],
    gradient: "from-purple-500 to-purple-600",
  },
  {
    icon: MessageCircle,
    title: "AI Conversation Help",
    description: "Need a quick chat practice? Get instant feedback before real conversations so you feel confident.",
    benefits: ["Role-play practice", "Instant tips", "Boost confidence"],
    gradient: "from-indigo-500 to-indigo-600",
  },
  {
    icon: Trophy,
    title: "Streaks & Badges",
    description: "Keep your streaks, earn badges, and celebrate every small win along your social journey.",
    benefits: ["Daily motivation", "Earn badges", "Celebrate wins"],
    gradient: "from-violet-500 to-violet-600",
  },
  {
    icon: Target,
    title: "Your Goals, Your Way",
    description: "Set personal social goals and get lesson plans that actually fit what you want to improve.",
    benefits: ["Custom plans", "Adaptive content", "Focus on what matters"],
    gradient: "from-emerald-500 to-emerald-600",
  },
  {
    icon: Users,
    title: "Community Challenges",
    description: "Join short challenges, share progress, and get support. Accountability makes it way easier to stick with it.",
    benefits: ["Peer support", "Shared experiences", "Group motivation"],
    gradient: "from-orange-500 to-orange-600",
  },
];

interface SignupFormProps {
  onSignupSuccess?: () => void;
}

export function SignupForm({ onSignupSuccess }: SignupFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [featureStep, setFeatureStep] = useState(0);


   const [userName, setUserName] = useState("");
   const [planGenerated, setPlanGenerated] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [localLoading, setLocalLoading] = useState(false);
    const [answers, setAnswers] = useState({}); // or [] depending on type
  
  const [successfulDays, setSuccessfulDays] = useState(0);
  const [planPreview, setPlanPreview] = useState<any>(null);
  
    const auth = getAuth();
  const userId = auth.currentUser?.uid || "user_trial";
  const messagesEndRef = useRef<HTMLDivElement>(null);
  



  const { toast } = useToast();

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/creategoal';

  const authInstance = getAuth();

  useEffect(() => {
    getRedirectResult(authInstance)
      .then(async (result) => {
        if (!result?.user) return;
        const user = result.user;
        const isNewUser = user.metadata.creationTime === user.metadata.lastSignInTime;
        await saveUserSession(user.uid, user.email!, isNewUser);

        if (returnUrl === '/creategoal') {
          setShowSuccess(true);
          setTimeout(() => { setShowThankYou(true); onSignupSuccess?.(); }, 1500);
        } else {
          navigate(returnUrl, { replace: true });
        }
      })
      .catch(() => setAuthError("Google signup failed. Try again."))
      .finally(() => setIsGoogleLoading(false));
  }, []);

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: "", password: "", confirmPassword: "", acceptTerms: false },
  });

  const saveUserSession = async (userId: string, email: string, isNewUser: boolean = true) => {
    try {
      await setDoc(doc(firestore, "users", userId), {
        email,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        planCreated: false,
      }, { merge: true });
    } catch (error) {
      console.error("Error saving user:", error);
    }
  };

  const MOCK_PLAN = {
    // Structure to mimic the expected successful overview response
    overview: {
      days: [
        { day: 1, title: "Understand Fundamentals", task: "Read and summarize 3 key articles on social skills." },
        { day: 2, title: "Active Listening Practice", task: "Engage in a 15-minute conversation focusing only on listening and asking follow-up questions." },
        { day: 3, title: "Body Language Awareness", task: "Spend 30 minutes observing non-verbal cues in public or from a video." },
        { day: 4, title: "Initiate Small Talk", task: "Start a brief, friendly conversation with a stranger (e.g., barista, neighbor)." },
        { day: 5, title: "Reflection & Planning", task: "Journal about the week's experiences and set one social goal for next week." },
      ]
    },
    success: true,
  };
  
  
    const GENERATION_STEPS = [
  { icon: "🔍", text: "Analyzing your goal..." },
  { icon: "📊", text: "Finding similar success patterns..." },
  { icon: "✍️", text: "Customizing Day 1: Foundation..." },
  { icon: "✍️", text: "Customizing Day 2: Momentum..." },
  { icon: "✍️", text: "Customizing Day 3: Breakthrough..." },
  { icon: "✍️", text: "Customizing Day 4: Refinement..." },
  { icon: "✍️", text: "Customizing Day 5: Commitment..." },
  { icon: "✅", text: "Finalizing your personalized plan..." },
  ];
  
    
  
  
  
    const markPlanAsCreated = async () => {
    try {
    if (!auth.currentUser) {
    console.error("❌ No authenticated user found");
    return;
    }
    const userRef = doc(firestore, "users", auth.currentUser.uid);
    await updateDoc(userRef, {
    planCreated: true,
    planCreatedAt: serverTimestamp(),
    });
    console.log("✅ planCreated set to true");
    } catch (error) {
    console.error("❌ Error marking plan as created:", error);
    }
    };
  
    const handleGeneratePlan = async () => {
      console.log("🚀 Starting 5-day task overview generation...");
      setIsGeneratingPlan(true);
      setCurrentStep(0);
    
      const userMessages = messages.filter((m) => m.role === "user");
      const userAnswers = Object.values(answers);
      const goalName =
        (userMessages[0]?.content && userMessages[0].content.trim()) ||
        (userAnswers[0] && userAnswers[0].toString().trim()) ||
        "social skills";
    
      const joinDate = new Date().toISOString().split('T')[0];
      const payload = {
        user_id: userId,
        goal_name: goalName,
        user_answers: userAnswers,
        join_date: joinDate,
      };
    
      // Simulate step-by-step progress
      const progressInterval = setInterval(() => {
        setCurrentStep(prev => {
          if (prev < GENERATION_STEPS.length) return prev + 1;
          return prev;
        });
      }, 1200);
    
      let data: any = null;
      let success = false;
      let useMockPlan = false;
    
      try {
        // Fetch API keys from Firebase
        const apiKeys = await getApiKeys();
        
        if (apiKeys.length === 0) {
          console.warn("⚠️ No API keys available. Using mock plan.");
          data = MOCK_PLAN;
          success = true;
          useMockPlan = true;
        } else {
          // --- API KEY LOOP ---
          for (let i = 0; i < apiKeys.length; i++) {
            const apiKey = apiKeys[i];
    
            try {
              const resp = await fetch(
                "https://pythonbackend-74es.onrender.com/create-task-overview",
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${apiKey}`,
                  },
                  body: JSON.stringify(payload),
                }
              );
    
              try {
                data = await resp.json();
              } catch (jsonErr) {
                const rawText = await resp.text();
                console.warn(`Invalid JSON with key ${i + 1}:`, rawText);
                continue;
              }
    
              if (!resp.ok || !data.success || !data.overview) {
                console.warn(`API key ${i + 1} failed or invalid response`, data);
                continue;
              }
    
              success = true;
              console.log("✅ Task overview received:", data.overview);
              break;
    
            } catch (err) {
              console.warn(`Request failed with key ${i + 1}:`, err);
            }
          }
          // --- END API KEY LOOP ---
    
          // Fallback to mock plan if all keys failed
          if (!success) {
            console.warn("⚠️ All API keys failed. Falling back to mock plan.");
            data = MOCK_PLAN;
            success = true;
            useMockPlan = true;
          }
        }
    
        const overviewToSave = data.overview;
    
        // Save to Firebase
        const courseId = "social_skills";
        const userPlanRef = doc(firestore, "users", userId, "datedcourses", courseId);
    
        await setDoc(userPlanRef, {
          task_overview: overviewToSave,
          goal_name: goalName,
          user_id: userId,
          course_id: courseId,
          generated_at: serverTimestamp(),
          created_at: serverTimestamp(),
          is_mock_plan: useMockPlan,
        });
    
        console.log(`✅ 5-day task overview saved to Firebase (Mock: ${useMockPlan})`);
    
        setSuccessfulDays(5);
        setCurrentStep(GENERATION_STEPS.length);
        await markPlanAsCreated();
    
        setPlanPreview({
          days: overviewToSave.days || [
            { day: 1, title: "Build Foundation", task: "Start with 15min daily practice" },
            { day: 2, title: "Gain Momentum", task: "Increase to 30min, track progress" },
            { day: 3, title: "Push Boundaries", task: "Try one challenging scenario" },
            { day: 4, title: "Reflect & Adjust", task: "Review what's working" },
            { day: 5, title: "Commit Long-term", task: "Set up sustainable routine" },
          ]
        });
    
        console.log("🎉 Your 5-day plan is ready!");
    
      } catch (err: any) {
        console.error("🔥 handleGeneratePlan error:", err);
        
      } finally {
        clearInterval(progressInterval);
        setIsGeneratingPlan(false);
      }
    };

  const handleGoogleSignup = async () => {
    setIsGoogleLoading(true);
    setAuthError(null);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(authInstance, provider);
      if (!result.user) throw new Error("No user returned");
      const user = result.user;
      const isNewUser = user.metadata.creationTime === user.metadata.lastSignInTime;
      await saveUserSession(user.uid, user.email!, isNewUser);
      toast({ title: "Hey, you're in!", description: "Account created successfully!" });
      if (returnUrl === '/creategoal') {
        setShowSuccess(true);
        setTimeout(() => { setShowThankYou(true); onSignupSuccess?.(); }, 1500);
      } else navigate(returnUrl, { replace: true });
    } catch (error: any) {
      setAuthError(error.code === 'auth/popup-closed-by-user' ? "You closed the popup. Try again." : "Google signup failed. Try again.");
    } finally { setIsGoogleLoading(false); }
  };

  const handleEmailSignup = async (data: SignupFormData) => {
    setIsSubmitting(true);
    setAuthError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(authInstance, data.email, data.password);
      await saveUserSession(userCredential.user.uid, userCredential.user.email!, true);
      toast({ title: "Hey, you're in!", description: "Account created successfully!" });
      if (returnUrl === '/creategoal') {
        setShowSuccess(true);
        setTimeout(() => { setShowThankYou(true); onSignupSuccess?.(); }, 1500);
      } else navigate(returnUrl, { replace: true });
    } catch (error: any) {
      const messages: Record<string, string> = {
        "auth/email-already-in-use": "This email's taken. Try signing in.",
        "auth/invalid-email": "Email format looks off.",
        "auth/weak-password": "Password's too weak.",
        "auth/network-request-failed": "Network issue. Try again.",
      };
      setAuthError(messages[error.code] || "Signup failed. Try again.");
    } finally { setIsSubmitting(false); }
  };

  const handleNextStep = () => navigate(returnUrl, { replace: true });
  const nextFeature = () => setFeatureStep((s) => Math.min(s + 1, detailedFeatures.length - 1));
  const prevFeature = () => setFeatureStep((s) => Math.max(s - 1, 0));

  const handleNextFeature = () => {
  nextFeature(); // move to next feature

  if (!planGenerated) {
    handleGeneratePlan(userId, messages, answers); // trigger plan generation
    setPlanGenerated(true); // ensure it runs only once
  }
};

  // Success page
  if (showSuccess && !showThankYou) {
    return (
      <div className="flex items-center justify-center p-4">
        <motion.div 
          className="bg-green-500/10 backdrop-blur-sm border border-green-500/30 rounded-2xl p-8 shadow-2xl max-w-md w-full"
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ duration: 0.5 }}
        >
          <div className="text-center">
            <CheckCircle className="text-green-400 mx-auto mb-4" size={64} />
            <h3 className="text-green-200 font-semibold text-2xl mb-2">You're in!</h3>
            <p className="text-green-300 text-lg">Loading your social skills playground…</p>
          </div>
        </motion.div>
      </div>
    );
  }

  // Thank you page with feature walkthrough
  if (showThankYou) {
    return (
      <div className="max-w-3xl mx-auto text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8 }}
        >
          <div className="bg-green-500/10 backdrop-blur-sm border border-green-500/30 rounded-2xl p-8 mb-8">
            <CheckCircle className="text-green-400 mx-auto mb-6" size={64} />
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">You're in!</h2>
            <p className="text-green-200 text-xl">Let's start leveling up your social skills</p>
          </div>

          {/* Feature walkthrough */}
          <AnimatePresence mode="wait">
            <motion.div 
              key={featureStep} 
              initial={{ opacity: 0, x: 50 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: -50 }} 
              transition={{ duration: 0.4 }}
            >
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 mb-6">
                <div className="flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-6">
                  <div className={`flex-shrink-0 w-16 h-16 bg-gradient-to-br ${detailedFeatures[featureStep].gradient} rounded-2xl flex items-center justify-center`}>
                    {(() => {
                      const FeatureIcon = detailedFeatures[featureStep].icon;
                      return <FeatureIcon size={32} className="text-white" />;
                    })()}
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="text-white font-bold text-2xl mb-3">
                      {detailedFeatures[featureStep].title}
                    </h4>
                    <p className="text-slate-300 text-lg mb-4">
                      {detailedFeatures[featureStep].description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {detailedFeatures[featureStep].benefits.map((b, i) => (
                        <span key={i} className="bg-blue-500/20 px-3 py-1.5 rounded-full text-blue-200 text-sm flex items-center gap-1">
                          <Zap className="w-4 h-4" /> {b}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                  {detailedFeatures.map((_, i) => (
                    <div
                      key={i}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        i === featureStep ? 'bg-blue-500 w-8' : 'bg-white/20 w-2'
                      }`}
                    />
                  ))}
                </div>
                
                <div className="flex space-x-3">
                  {featureStep > 0 && (
                    <Button 
                      onClick={prevFeature}
                      variant="ghost"
                      className="text-slate-400 hover:text-white hover:bg-white/10"
                    >
                      Back
                    </Button>
                  )}
                  {featureStep < detailedFeatures.length - 1 ? (
  <Button
    onClick={handleNextFeature}
    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-6 py-3 rounded-xl"
  >
    Next
  </Button>
) : (
  <Button
    onClick={handleNextStep}
    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-6 py-3 rounded-xl"
  >
    Start Your Journey
  </Button>
)}


                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    );
  }

  // Main signup form - REDESIGNED TO MATCH YOUR AESTHETIC
  return (
    <div className="max-w-md mx-auto w-full">
      <motion.div 
        className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 shadow-2xl"
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }}
      >
        {authError && (
          <motion.div 
            className="bg-red-500/10 backdrop-blur-sm border border-red-500/30 rounded-xl p-4 mb-6 flex items-start space-x-3" 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }}
          >
            <AlertTriangle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
            <p className="text-red-200 text-sm">{authError}</p>
          </motion.div>
        )}

        <Button 
          onClick={handleGoogleSignup} 
          disabled={isGoogleLoading || isSubmitting} 
          className="w-full bg-white hover:bg-gray-100 text-gray-900 font-semibold py-4 rounded-xl transition-all duration-200 mb-6 text-lg"
        >
          {isGoogleLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Jumping in...
            </>
          ) : (
            <>Jump in with Google</>
          )}
        </Button>

        <div className="relative mb-6">
          <div className="w-full border-t border-white/20"></div>
          <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 bg-slate-900 px-4 text-slate-400 text-sm">
            Or with email
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleEmailSignup)} className="space-y-5">
            <FormField 
              control={form.control} 
              name="email" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white text-base font-medium">Email</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="you@example.com" 
                      className="bg-white/10 border-white/20 text-white placeholder:text-slate-400 rounded-xl px-4 py-3 text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50" 
                      disabled={isSubmitting || isGoogleLoading} 
                    />
                  </FormControl>
                  <FormMessage className="text-red-300" />
                </FormItem>
              )} 
            />

            <FormField 
              control={form.control} 
              name="password" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white text-base font-medium">Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        {...field} 
                        type={showPassword ? "text" : "password"} 
                        placeholder="••••••••" 
                        className="bg-white/10 border-white/20 text-white placeholder:text-slate-400 rounded-xl px-4 py-3 pr-12 text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50" 
                        disabled={isSubmitting || isGoogleLoading} 
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)} 
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-300" />
                </FormItem>
              )} 
            />

            <FormField 
              control={form.control} 
              name="confirmPassword" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white text-base font-medium">Confirm Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        {...field} 
                        type={showConfirmPassword ? "text" : "password"} 
                        placeholder="••••••••" 
                        className="bg-white/10 border-white/20 text-white placeholder:text-slate-400 rounded-xl px-4 py-3 pr-12 text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50" 
                        disabled={isSubmitting || isGoogleLoading} 
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-300" />
                </FormItem>
              )} 
            />

            <FormField 
              control={form.control} 
              name="acceptTerms" 
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-2">
                  <FormControl>
                    <Checkbox 
                      checked={field.value} 
                      onCheckedChange={field.onChange} 
                      disabled={isSubmitting || isGoogleLoading} 
                      className="border-white/30 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 mt-1" 
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-slate-300 text-sm font-normal cursor-pointer">
                      Yep, I'm cool with the{" "}
                      <a href="/terms" className="text-blue-400 hover:text-blue-300 underline">
                        rules
                      </a>
                    </FormLabel>
                    <FormMessage className="text-red-300" />
                  </div>
                </FormItem>
              )} 
            />

            <Button 
              type="submit" 
              disabled={isSubmitting || isGoogleLoading} 
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-lg mt-6"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Setting you up...
                </>
              ) : (
                "Let's Go!"
              )}
            </Button>
          </form>
        </Form>

        <p className="text-center text-slate-400 text-sm mt-6">
          Already have an account?{" "}
          <a href="/sign-in" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
            Sign in
          </a>
        </p>
      </motion.div>
    </div>
  );
}