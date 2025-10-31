import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Outlet, RouterProvider, createBrowserRouter, useLocation } from 'react-router-dom';
import App from './app';
import MobileNav from './MobileNav';
import { routesSection } from './routes/sections';
import { ErrorBoundary } from './routes/components';
import { OnboardingProvider } from './contexts/OnboardingContext';

// ----------------------------------------------------------------------

const AppLayout = () => {
  const location = useLocation();
  const pathsToHideNav = ['/conversation', '/creategoal', '/signin'];
  const isNavHidden = pathsToHideNav.includes(location.pathname.toLowerCase());

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener('resize', handleResize);

    // Prevent pinch-to-zoom
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 1) e.preventDefault(); // block multi-touch
    };
    document.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  // Force viewport scaling to 1
  useEffect(() => {
    let viewport = document.querySelector("meta[name=viewport]");
    if (!viewport) {
      viewport = document.createElement("meta");
      viewport.setAttribute("name", "viewport");
      document.head.appendChild(viewport);
    }
    viewport.setAttribute(
      "content",
      "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
    );
  }, []);

  const mobileWidthStyle: React.CSSProperties = isMobile
    ? {
        overflowX: 'hidden',             // clip horizontal overflow
        width: '100%',                    // use full width
        maxWidth: 'min(420px, 100vw)',   // cap at 420px or viewport width
      }
    : {};

  const contentStyle: React.CSSProperties = isNavHidden
    ? {}
    : { paddingBottom: '0px', marginTop: '0px' };

  return (
    <App>
      <div style={mobileWidthStyle}>
        <div style={contentStyle}>
          <Outlet />
        </div>
      </div>
      {/* {!isNavHidden && <MobileNav />} */}
    </App>
  );
};

// ----------------------------------------------------------------------

const router = createBrowserRouter([
  {
    Component: AppLayout,
    errorElement: <ErrorBoundary />,
    children: routesSection,
  },
]);

const root = createRoot(document.getElementById('root')!);

root.render(
  <StrictMode>
    <OnboardingProvider>
      <RouterProvider router={router} />
    </OnboardingProvider>
  </StrictMode>
);
