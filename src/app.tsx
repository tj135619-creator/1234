import { useEffect, useState } from 'react';
import { CssBaseline } from '@mui/material';
import { ThemeProvider } from 'src/theme/theme-provider';
import { usePathname } from 'src/routes/hooks';
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

  // AUTH STATE MANAGEMENT
  const [user, loading] = useAuthState(auth);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  // GLOBAL AUTH INITIALIZATION
  useEffect(() => {
    const initializeAuth = async () => {
      if (loading) return;

      if (user) {
        try {
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);

          let currentUserData;

          if (!userSnap.exists()) {
            const newUserData = {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName || 'User',
              photoURL: user.photoURL || null,
              createdAt: new Date().toISOString(),
              lastLogin: new Date().toISOString(),
            };
            await setDoc(userRef, newUserData);
            setUserData(newUserData);
            currentUserData = newUserData;
          } else {
            const existingData = userSnap.data();
            await setDoc(
              userRef,
              { lastLogin: new Date().toISOString() },
              { merge: true }
            );
            setUserData(existingData);
            currentUserData = existingData;
          }

          // Store quick auth info
          localStorage.setItem(
            'goalgrid_auth',
            JSON.stringify({
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL,
              isAuthenticated: true,
              lastSync: Date.now(),
            })
          );

          // Store user data separately
          localStorage.setItem('goalgrid_user_data', JSON.stringify(currentUserData));
        } catch (error) {
          console.error('Error initializing auth:', error);
        }
      } else {
        localStorage.removeItem('goalgrid_auth');
        localStorage.removeItem('goalgrid_user_data');
        setUserData(null);
      }

      setAuthInitialized(true);
    };

    initializeAuth();
  }, [user, loading]);

  // Listen for auth changes globally
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        localStorage.setItem('auth_change', Date.now().toString());
        window.dispatchEvent(
          new CustomEvent('authStateChanged', {
            detail: { user: currentUser, isAuthenticated: true },
          })
        );
      } else {
        window.dispatchEvent(
          new CustomEvent('authStateChanged', {
            detail: { user: null, isAuthenticated: false },
          })
        );
      }
    });

    return () => unsubscribe();
  }, []);

  // LOADING SCREEN
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
