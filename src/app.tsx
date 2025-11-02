import { useEffect, useState } from 'react';
import { CssBaseline } from '@mui/material';
import { ThemeProvider } from 'src/theme/theme-provider';
import { usePathname } from 'src/routes/hooks';
import Joyride, { CallBackProps, STATUS } from 'react-joyride';
import { useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

// ----------------------------------------------------------------------

type AppProps = {
  children: React.ReactNode;
};

function useScrollToTop() {
  const pathname = usePathname();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);
  return null;
}

export default function App({ children }: AppProps) {
  useScrollToTop();

  const pathname = usePathname();
  const navigate = useNavigate();
  const [run, setRun] = useState(false);
  const [steps, setSteps] = useState<any[]>([]);
  const [onboardingDone, setOnboardingDone] = useState(false);

  // AUTH STATE MANAGEMENT
  const [user, loading, error] = useAuthState(auth);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  const routesOrder = ['/', '/products', '/blog', '/profile'];

  const stepsByPage: Record<string, any[]> = {
    '/': [{ target: '#dashboardHeader', placement: 'bottom', content: 'Welcome to your dashboard.' }],
    '/products': [{ target: '#productHeader', placement: 'bottom', content: 'Here are your lessons to improve daily.' }],
    '/blog': [{ target: '#blogHeader', placement: 'bottom', content: 'Track your growth and insights here.' }],
    '/profile': [{ target: '#profileHeader', placement: 'bottom', content: 'Manage your progress and details here.' }],
  };

  const pageExplanations: Record<string, { title: string; description: string }> = {
    '/': {
      title: '📊 Dashboard Overview',
      description: 'This is your central hub where you can see your progress, daily goals, and quick insights. Start your journey here every day!'
    },
    '/products': {
      title: '👥 Community & Lessons',
      description: 'Connect with others and access daily lessons designed to help you grow. Each lesson brings you closer to your goals!'
    },
    '/blog': {
      title: '✓ Action Tracker',
      description: 'Track your completed tasks, monitor your growth over time, and celebrate your achievements. Your progress journal lives here!'
    },
    '/profile': {
      title: '👤 Your Profile',
      description: 'Manage your personal information, view your statistics, and customize your experience. Make this space truly yours!'
    }
  };

  // GLOBAL AUTH INITIALIZATION
  useEffect(() => {
    const initializeAuth = async () => {
      if (loading) return;

      if (user) {
        console.log('🔐 Auth State - User Logged In:', {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL
        });

        try {
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);

          let currentUserData;

          if (!userSnap.exists()) {
            // Create new user document
            const newUserData = {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName || 'User',
              photoURL: user.photoURL || null,
              guidedOnboarding: false, // ✅ NEW: Track onboarding status
              createdAt: new Date().toISOString(),
              lastLogin: new Date().toISOString(),
            };
            await setDoc(userRef, newUserData);
            setUserData(newUserData);
            currentUserData = newUserData;
            setOnboardingDone(false); // ✅ NEW: Start onboarding for new users
            console.log('✅ New user document created');
          } else {
            // Update existing user
            const existingData = userSnap.data();
            await setDoc(userRef, {
              lastLogin: new Date().toISOString(),
            }, { merge: true });
            setUserData(existingData);
            currentUserData = existingData;
            
            // ✅ NEW: Set onboarding status from Firestore
            setOnboardingDone(existingData.guidedOnboarding || false);
            console.log('✅ Existing user loaded:', existingData);
            console.log('📋 Onboarding status:', existingData.guidedOnboarding);
          }

          // Store auth info in localStorage for quick access across pages
          localStorage.setItem('goalgrid_auth', JSON.stringify({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            isAuthenticated: true,
            lastSync: Date.now()
          }));

          // Store user data separately
          localStorage.setItem('goalgrid_user_data', JSON.stringify(currentUserData));

        } catch (error) {
          console.error('❌ Error initializing auth:', error);
        }
      } else {
        console.log('🔓 Auth State - No User Logged In');
        // Clear localStorage when logged out
        localStorage.removeItem('goalgrid_auth');
        localStorage.removeItem('goalgrid_user_data');
        setUserData(null);
        setOnboardingDone(false);
      }

      setAuthInitialized(true);
    };

    initializeAuth();
  }, [user, loading]);

  // Listen for auth state changes globally
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        console.log('🔄 Auth State Changed - User:', currentUser.email);
        
        // Broadcast auth change to all tabs/windows
        localStorage.setItem('auth_change', Date.now().toString());
        window.dispatchEvent(new CustomEvent('authStateChanged', { 
          detail: { user: currentUser, isAuthenticated: true } 
        }));
      } else {
        console.log('🔄 Auth State Changed - User logged out');
        window.dispatchEvent(new CustomEvent('authStateChanged', { 
          detail: { user: null, isAuthenticated: false } 
        }));
      }
    });

    return () => unsubscribe();
  }, []);

  // ✅ FIXED: ONBOARDING TOUR LOGIC - Now checks onboardingDone
  useEffect(() => {
    // ✅ Don't run if onboarding is already done
    if (onboardingDone) {
      console.log('✅ Onboarding already completed, skipping');
      setRun(false);
      return;
    }

    // ✅ Don't run if user is not loaded yet
    if (!user || !authInitialized) {
      console.log('⏳ Waiting for user auth to initialize');
      return;
    }

    console.log('🔍 ONBOARDING CHECK:', { pathname, onboardingDone, run });
    
    const newSteps = stepsByPage[pathname] || [
      { target: 'body', placement: 'center', content: 'No specific tour found for this page.' },
    ];
    
    console.log('📝 Steps set:', newSteps);
    setSteps(newSteps);
    setRun(true);

    const timer = setTimeout(() => {
      console.log('⏰ Timer fired!');
      const currentIndex = routesOrder.indexOf(pathname);
      console.log('📍 Current index:', currentIndex, 'Path:', pathname);
      
      if (currentIndex !== -1 && currentIndex < routesOrder.length - 1) {
        const nextPath = routesOrder[currentIndex + 1];
        console.log('➡️ Next path:', nextPath);
        
        window.dispatchEvent(new CustomEvent('openNav', { detail: nextPath }));
        console.log('📢 Dispatched openNav event');

        setTimeout(() => {
          console.log('🚀 Navigating to:', nextPath);
          navigate(nextPath + '?onboarding=true');
        }, 4000);
      } else {
        console.log('✅ Onboarding complete! Saving to Firestore...');
        
        // ✅ NEW: Save to Firestore
        if (user) {
          const userRef = doc(db, 'users', user.uid);
          setDoc(userRef, {
            guidedOnboarding: true,
            onboardingCompletedAt: new Date().toISOString()
          }, { merge: true })
            .then(() => {
              console.log('✅ Onboarding status saved to Firestore');
            })
            .catch((error) => {
              console.error('❌ Error saving onboarding status:', error);
            });
        }
        
        window.dispatchEvent(new CustomEvent('onboardingComplete'));
        setOnboardingDone(true);
        setRun(false);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [pathname, onboardingDone, user, authInitialized]); // ✅ Added dependencies

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      console.log('🛑 User finished or skipped onboarding');
      
      // ✅ NEW: Save to Firestore when user skips/finishes
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        setDoc(userRef, {
          guidedOnboarding: true,
          onboardingCompletedAt: new Date().toISOString(),
          onboardingSkipped: status === STATUS.SKIPPED
        }, { merge: true })
          .then(() => {
            console.log('✅ Onboarding status saved to Firestore (user action)');
          })
          .catch((error) => {
            console.error('❌ Error saving onboarding status:', error);
          });
      }
      
      setOnboardingDone(true);
      setRun(false);
    }
  };

  const currentExplanation = pageExplanations[pathname];

  // Show loading screen while auth is initializing
  if (loading || !authInitialized) {
    return (
      <ThemeProvider>
        <CssBaseline />
        <div
          style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #240046 0%, #2d0066 50%, #330066 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                border: '4px solid rgba(168, 85, 247, 0.3)',
                borderTop: '4px solid #a855f7',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 16px',
              }}
            />
            <style>
              {`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}
            </style>
            <p style={{ color: 'white', fontSize: '18px', fontWeight: '500' }}>
              Initializing GoalGrid...
            </p>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <CssBaseline />
      
      {/* Debug Panel - Remove in production */}
      

      <Joyride
        steps={steps}
        run={!onboardingDone && run}
        continuous
        showSkipButton
        scrollToFirstStep
        disableOverlayClose
        spotlightClicks
        callback={handleJoyrideCallback}
        styles={{
          options: {
            primaryColor: '#2563eb',
            zIndex: 9999,
          },
        }}
      />

      {/* EXPLANATION BOX - ONLY SHOWS DURING ONBOARDING */}
      {!onboardingDone && currentExplanation && (
        <>
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.7)',
              zIndex: 10001,
              pointerEvents: 'none',
            }}
          />
          
          <div
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 10002,
              background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
              padding: '32px',
              borderRadius: '16px',
              maxWidth: '500px',
              width: '90%',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              animation: 'fadeInScale 0.5s ease-out',
            }}
          >
            <style>
              {`
                @keyframes fadeInScale {
                  from {
                    opacity: 0;
                    transform: translate(-50%, -50%) scale(0.9);
                  }
                  to {
                    opacity: 1;
                    transform: translate(-50%, -50%) scale(1);
                  }
                }
              `}
            </style>
            <h2
              style={{
                color: 'white',
                fontSize: '28px',
                fontWeight: 'bold',
                marginBottom: '16px',
                textAlign: 'center',
              }}
            >
              {currentExplanation.title}
            </h2>
            <p
              style={{
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '18px',
                lineHeight: '1.6',
                textAlign: 'center',
                margin: 0,
              }}
            >
              {currentExplanation.description}
            </p>
            <div
              style={{
                marginTop: '24px',
                textAlign: 'center',
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '14px',
              }}
            >
              Auto-advancing in 5 seconds...
            </div>
          </div>
        </>
      )}

      <div
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #240046 0%, #2d0066 50%, #330066 100%)',
        }}
      >
        {children}
      </div>
    </ThemeProvider>
  );
}