import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Outlet, RouterProvider, createBrowserRouter, useLocation } from 'react-router-dom';
import App from './app';
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
    // Add Poppins font globally
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    document.body.style.fontFamily = "'Poppins', sans-serif";

    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener('resize', handleResize);

    // Prevent pinch-to-zoom
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 1) e.preventDefault();
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
    viewport.setAttribute("content", "width=device-width, initial-scale=1");
  }, []);

  const wrapperStyle: React.CSSProperties = {
    overflowX: 'hidden',
    width: '100%',
    maxWidth: 'none',        // allow full width on large screens
    padding: isMobile ? '0 10px' : '0 40px', // responsive padding
  };

  const contentStyle: React.CSSProperties = {
    margin: '0 auto',        // center content
    maxWidth: '1400px',      // optional max width for readability on large screens
    paddingBottom: '0px',
    marginTop: '0px',
  };

  return (
    <App>
      <div style={wrapperStyle}>
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