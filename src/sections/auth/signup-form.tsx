import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { 
  AlertTriangle, 
  Eye, 
  EyeOff, 
  Loader2, 
  CheckCircle,
  ArrowRight,
  Brain,
  TrendingUp,
  MessageCircle,
  Trophy,
  Target,
  Users,
  Zap,
  Star
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { firestore } from "@/sections/creategoal/ConversationFlow";
import { auth } from 'src/lib/firebase';
import { getAuth } from 'firebase/auth';
import {  useEffect } from "react";
import { getRedirectResult, signInWithRedirect } from "firebase/auth";

const signupSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine(val => val === true, "Please accept the Terms of Service and Privacy Policy"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type SignupFormData = z.infer<typeof signupSchema>;

const detailedFeatures = [
  {
    icon: Brain,
    title: "AI-Powered Daily Missions",
    description: "Every day, our AI creates personalized challenges based on Dale Carnegie's principles. Start with simple tasks like 'smile at 3 people' and progress to 'lead a team discussion.'",
    benefits: ["Personalized to your skill level", "Based on proven psychology", "Gradual confidence building"],
    gradient: "from-blue-500 to-blue-600",
  },
  {
    icon: TrendingUp,
    title: "Interactive Progress Map",
    description: "Unlock skill nodes on a game-like map as you complete missions. Watch your social skills tree grow with visual progress tracking and achievement milestones.",
    benefits: ["Visual progress tracking", "Unlock new skill areas", "Gamified learning path"],
    gradient: "from-purple-500 to-purple-600",
  },
  {
    icon: MessageCircle,
    title: "Real-Time AI Coaching",
    description: "Get live support when you need it most. Practice conversations, get feedback on your approach, and build confidence before important social interactions.",
    benefits: ["Role-play practice", "Instant feedback", "Confidence building"],
    gradient: "from-indigo-500 to-indigo-600",
  },
  {
    icon: Trophy,
    title: "Achievement & Streak System",
    description: "Maintain daily streaks, earn badges, and celebrate milestones. Turn social skills development into an engaging game with rewards for consistency.",
    benefits: ["Daily streak motivation", "Achievement badges", "Progress celebrations"],
    gradient: "from-violet-500 to-violet-600",
  },
  {
    icon: Target,
    title: "Goal-Driven Learning",
    description: "Set your personal social goals and receive customized lesson plans. Whether it's networking, dating confidence, or leadership skills - we adapt to your needs.",
    benefits: ["Personalized learning paths", "Custom goal setting", "Adaptive content"],
    gradient: "from-emerald-500 to-emerald-600",
  },
  {
    icon: Users,
    title: "Community Challenges",
    description: "Join 5-day challenges with other learners, share progress, and get supportive feedback. Build accountability through community connection.",
    benefits: ["Group accountability", "Peer support", "Shared experiences"],
    gradient: "from-orange-500 to-orange-600",
  },
];

const successStats = [
  { number: "1", label: "Book" },
  { number: "30+", label: "actionable techniques" },
  { number: "10-15", label: "Minutes per day" },
  { number: "94%", label: "Users report improvement" },
];

interface SignupFormProps {
  onSignupSuccess?: () => void;
}



export function SignupForm({ onSignupSuccess }: SignupFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const { toast } = useToast();
  
  // Get navigation and search params
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/creategoal';

  const authInstance = getAuth();

  useEffect(() => {
    getRedirectResult(authInstance)
      .then(async (result) => {
        if (!result || !result.user) return;

        const user = result.user;
        const isNewUser = user.metadata.creationTime === user.metadata.lastSignInTime;
        await saveUserSession(user.uid, user.email!, isNewUser);

        if (returnUrl === '/creategoal') {
          setShowSuccess(true);
          setTimeout(() => {
            setShowThankYou(true);
            onSignupSuccess?.();
          }, 1500);
        } else {
          navigate(returnUrl, { replace: true });
        }
      })
      .catch((error) => {
        console.error("❌ Redirect result error:", error);
        setAuthError("Google signup failed. Please try again.");
      })
      .finally(() => setIsGoogleLoading(false));
  }, []);

  const googleProvider = new GoogleAuthProvider();

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  });

  const saveUserSession = async (userId: string, email: string, isNewUser: boolean = true) => {
    try {
      const userRef = doc(firestore, "users", userId);
      await setDoc(userRef, {
        email,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        planCreated: false, // ✅ Initialize planCreated as false for new users
      }, { merge: true }); // Use merge to not overwrite existing data
      
      console.log("✅ User saved to Firestore");
    } catch (error) {
      console.error("❌ Error saving user to Firestore:", error);
    }
  };

  // Add this above your SignupForm component
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

    toast({
      title: "Welcome to GoalGrid!",
      description: "Account created successfully!",
    });

    if (returnUrl === '/creategoal') {
      setShowSuccess(true);
      setTimeout(() => {
        setShowThankYou(true);
        onSignupSuccess?.();
      }, 1500);
    } else {
      navigate(returnUrl, { replace: true });
    }
  } catch (error: any) {
    console.error("❌ Google signup error:", error);

    let errorMessage = "Google signup failed. Please try again.";

    if (error.code === 'auth/popup-closed-by-user') {
      errorMessage = "You closed the signup popup. Click below to retry.";
    } else if (error.code === 'auth/network-request-failed') {
      errorMessage = "Network error. Check your connection and try again.";
    }

    setAuthError(errorMessage);
    toast({
      title: "Google signup failed",
      description: errorMessage,
      variant: "destructive",
    });
  } finally {
    setIsGoogleLoading(false); // always reset loading state
  }
};





  const handleEmailSignup = async (data: SignupFormData) => {
    setIsSubmitting(true);
    setAuthError(null);

    try {
      console.log("📧 Attempting email signup with:", data.email);
      
      const userCredential = await createUserWithEmailAndPassword(
        authInstance,
        data.email,
        data.password
      );
      
      const user = userCredential.user;
      console.log("✅ Email signup successful:", user.email);

      await saveUserSession(user.uid, user.email!, true);

      toast({
        title: "Welcome to GoalGrid!",
        description: "Account created successfully!",
      });
      
      // If going to creategoal, show thank you page
      // If going to creategoal, show thank you page
if (returnUrl === '/creategoal') {
  setShowSuccess(true);
  setTimeout(() => {
    setShowThankYou(true);
    onSignupSuccess?.();
  }, 1500);
} else {
  // Otherwise redirect directly to the return URL
  console.log(`🔄 Redirecting to: ${returnUrl}`);
  navigate(returnUrl, { replace: true });
}

} catch (error: any) {
  console.error("❌ Signup error:", error);

  let errorMessage = "An unexpected error occurred. Please try again.";

  if (error.code === "auth/popup-closed-by-user") {
    errorMessage = "You closed the signup popup. Click below to retry.";
    toast({
      title: "Signup cancelled",
      description: errorMessage,
      variant: "destructive",
    });
    setShowRetry(true);
    return;
  } else if (error.code === "auth/email-already-in-use") {
    errorMessage = "This email is already registered. Please sign in instead.";
  } else if (error.code === "auth/invalid-email") {
    errorMessage = "Invalid email address format.";
  } else if (error.code === "auth/weak-password") {
    errorMessage = "Password is too weak. Please use a stronger password.";
  } else if (error.code === "auth/network-request-failed") {
    errorMessage = "Network error. Please check your connection and try again.";
  }

  setAuthError(errorMessage);
  toast({
    title: "Signup failed",
    description: errorMessage,
    variant: "destructive",
  });
} finally {
  setIsSubmitting(false);
}
  };

  const handleNextStep = () => {
    console.log(`🔄 Navigating to: ${returnUrl}`);
    navigate(returnUrl, { replace: true });
  };

  // Success screen
  if (showSuccess && !showThankYou) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4">
        <motion.div 
          className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 md:p-8 shadow-2xl max-w-md w-full"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center">
            <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-6 mb-6">
              <CheckCircle className="text-green-400 mx-auto mb-3" size={48} />
              <h3 className="text-green-200 font-semibold text-lg mb-2">Welcome to GoalGrid!</h3>
              <p className="text-green-300 text-sm">Loading your personalized experience...</p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Thank you page (full onboarding experience)
  if (showThankYou) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-8 md:mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="bg-green-500/20 border border-green-500/50 rounded-2xl p-6 md:p-8 mb-6 md:mb-8">
              <CheckCircle className="text-green-400 mx-auto mb-4" size={64} />
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Welcome to GoalGrid!</h2>
              <p className="text-green-200 text-lg md:text-xl">Your social skills journey starts now</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
              {successStats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 md:p-6 text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * (index + 1) }}
                >
                  <div className="text-xl md:text-2xl font-bold text-blue-400 mb-2">{stat.number}</div>
                  <div className="text-slate-300 text-xs md:text-sm">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="text-center mb-8 md:mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">What's Coming Next?</h3>
            <p className="text-slate-300 text-base md:text-lg mb-6 md:mb-8 px-4">
              You're about to set your first social skills goal and receive your personalized learning path
            </p>

            <Button
              onClick={handleNextStep}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 md:py-4 px-6 md:px-8 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-base md:text-lg"
            >
              <span className="mr-2">Set Your First Goal</span>
              <ArrowRight size={20} />
            </Button>
          </motion.div>

          <motion.div
            className="mb-8 md:mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-6 md:mb-8 text-center px-4">
              Your Complete Social Skills Toolkit
            </h3>

            <div className="grid gap-4 md:gap-8">
              {detailedFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 md:p-8 hover:bg-white/10 transition-all duration-200"
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * (index + 1) }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-6">
                    <div className={`flex-shrink-0 w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center`}>
                      <feature.icon className="text-white" size={24} />
                    </div>

                    <div className="flex-1">
                      <h4 className="text-white font-bold text-lg md:text-xl mb-2 md:mb-3">{feature.title}</h4>
                      <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-3 md:mb-4">{feature.description}</p>

                      <div className="flex flex-wrap gap-2">
                        {feature.benefits.map((benefit, benefitIndex) => (
                          <span
                            key={benefitIndex}
                            className="bg-blue-500/20 border border-blue-500/30 px-2 md:px-3 py-1 rounded-full text-blue-200 text-xs md:text-sm"
                          >
                            <Zap className="inline w-3 h-3 mr-1" />
                            {benefit}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-white/10 rounded-2xl p-6 md:p-8 text-center mb-8 md:mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            <div className="flex justify-center space-x-1 mb-4">
              {[...Array(5)].map((_, index) => (
                <Star key={index} className="text-yellow-400 fill-current" size={20} />
              ))}
            </div>
            <blockquote className="text-white font-medium text-base md:text-lg mb-4 px-4">
              "I went from avoiding eye contact to confidently leading meetings at work. GoalGrid broke down social skills into achievable daily steps that actually work."
            </blockquote>
            <cite className="text-slate-400 text-sm md:text-base">– Sarah M., Product Manager</cite>
          </motion.div>

          <motion.div
            className="text-center pb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
          >
            <Button
              onClick={handleNextStep}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <span className="mr-2">Start Your Journey</span>
              <ArrowRight size={20} />
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  // Main signup form
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      <motion.div
        className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 md:p-8 shadow-2xl max-w-md w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Create Your Account</h2>
          <p className="text-slate-300 text-sm md:text-base">Start your social skills journey today</p>
        </div>

        {authError && (
          <motion.div
            className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6 flex items-start space-x-3"
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
          className="w-full bg-white hover:bg-gray-100 text-gray-900 font-semibold py-3 rounded-lg transition-colors duration-200 mb-4"
        >
          {isGoogleLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing up with Google...
            </>
          ) : (
            <>
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </>
          )}
        </Button>

        

        <div className="relative mb-4">
          
            <div className="w-full border-t border-white/20"></div>
          
          <div className="relative flex justify-center text-sm">
            
           
            <span className="px-4 bg-transparent text-slate-300 my-2">Or continue with email</span>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleEmailSignup)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="you@example.com"
                      className="bg-white/10 border-white/20 text-white placeholder:text-slate-400"
                      disabled={isSubmitting || isGoogleLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="bg-white/10 border-white/20 text-white placeholder:text-slate-400 pr-10"
                        disabled={isSubmitting || isGoogleLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Confirm Password</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      placeholder="••••••••"
                      className="bg-white/10 border-white/20 text-white placeholder:text-slate-400"
                      disabled={isSubmitting || isGoogleLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="acceptTerms"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isSubmitting || isGoogleLoading}
                      className="border-white/20"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm text-slate-300">
                      I agree to the{" "}
                      <a href="/terms" className="text-blue-400 hover:underline">
                        Terms of Service
                      </a>{" "}
                      and{" "}
                      <a href="/privacy" className="text-blue-400 hover:underline">
                        Privacy Policy
                      </a>
                    </FormLabel>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={isSubmitting || isGoogleLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-lg transition-all duration-200"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>
        </Form>

        <p className="text-center text-slate-300 text-sm mt-6">
          Already have an account?{" "}
          <a href="/sign-in" className="text-blue-400 hover:underline font-semibold">
            Sign in
          </a>
        </p>
      </motion.div>
    </div>
  );
}