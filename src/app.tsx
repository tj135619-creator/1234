import { useEffect, useState } from 'react';
import { CssBaseline } from '@mui/material';
import { ThemeProvider } from 'src/theme/theme-provider';
import { usePathname } from 'src/routes/hooks';
import { useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import BottomNav from './MobileNav';
import mixpanel from 'mixpanel-browser';

type AppProps = {
  children: React.ReactNode;
};

function useScrollToTop() {
  const pathname = usePathname();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);
}

export default function App({ children }: AppProps) {
  useScrollToTop();

  const pathname = usePathname();
  const navigate = useNavigate();

  const [user, loading] = useAuthState(auth);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  // Mixpanel init
  useEffect(() => {
    mixpanel.init('3f57bf9b5f5d11792f52742c157e9004', {
      autocapture: true,
      record_sessions_percent: 100,
    });
  }, []);

  // Track page views
  useEffect(() => {
    if (!loading && authInitialized) {
      if (user) {
        mixpanel.identify(user.uid);
        mixpanel.people.set({
          $email: user.email,
          $name: user.displayName || 'User',
          uid: user.uid,
        });
      }

      mixpanel.track('Page View', {
        page: pathname,
        uid: user?.uid,
      });
    }
  }, [pathname, loading, authInitialized]);

  // Auth init
  useEffect(() => {
    const init = async () => {
      if (loading) return;

      if (user) {
        const ref = doc(db, 'users', user.uid);
        const snap = await getDoc(ref);

        let data;

        if (!snap.exists()) {
          data = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || 'User',
            createdAt: new Date().toISOString(),
          };
          await setDoc(ref, data);
        } else {
          data = snap.data();
          await setDoc(ref, { lastLogin: new Date().toISOString() }, { merge: true });
        }

        localStorage.setItem('goalgrid_auth', JSON.stringify(data));
        setUserData(data);
      } else {
        localStorage.clear();
        setUserData(null);
      }

      setAuthInitialized(true);
    };

    init();
  }, [user, loading]);

  // Loading screen
  if (loading || !authInitialized) {
    return (
      <ThemeProvider>
        <CssBaseline />
        <div
          style={{
            height: '100vh',
            width: '100vw',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #240046, #330066)',
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              border: '4px solid rgba(168,85,247,0.3)',
              borderTop: '4px solid #a855f7',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
          />
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <CssBaseline />

      {/* Root container */}
      <div
        style={{
          height: '100vh',
          width: '100vw',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(135deg, #240046, #330066)',
        }}
      >
        {/* Scrollable content */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            maxWidth: '100vw',
            boxSizing: 'border-box',
          }}
        >
          {children}
        </div>

        {/* Bottom Nav */}
        <div
          style={{
            flexShrink: 0,
            width: '100%',
            overflow: 'hidden',
          }}
        >
          <BottomNav />
        </div>
      </div>
    </ThemeProvider>
  );
}
