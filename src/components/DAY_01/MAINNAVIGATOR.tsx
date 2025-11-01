import { useState, forwardRef, useImperativeHandle, useRef, useEffect } from "react";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db, auth } from "./firebase";
import FindAPlace01 from "src/components/DAY_01/FINDAPLACE/01";
import SetYourTimes02 from "src/components/DAY_01/SETYOURTIMES/02";
import HelpWithAnxiety03 from "src/components/DAY_01/HELPWITHTHEIRANXIETY/03";
import YouAreNotAlone from "src/components/DAY_01/YOUARENOTALONE/youarenotalone";
// Import all skill components
import EyeContactTrainer from "src/components/DAY_01/SKELETAL COMPONENTS/01";
import OpenBodyLanguage from "src/components/DAY_01/SKELETAL COMPONENTS/01";
import SmileWarmUp from "src/components/DAY_01/SKELETAL COMPONENTS/02";
import VoiceToneControl from "src/components/DAY_01/SKELETAL COMPONENTS/03";
import ApproachOpener from "src/components/DAY_01/SKELETAL COMPONENTS/04";
import ActiveListening from "src/components/DAY_01/SKELETAL COMPONENTS/05";
import GenuineAppreciation from "src/components/DAY_01/SKELETAL COMPONENTS/06";
import HandleSilence from "src/components/DAY_01/SKELETAL COMPONENTS/07";

const Day1Navigator = forwardRef(({ onCompleteNavigator }, ref) => {
  const [pageIndex, setPageIndex] = useState(0);
  const [showSpotlight, setShowSpotlight] = useState(true);
  const [isLoadingProgress, setIsLoadingProgress] = useState(true);
  const scrollContainerRef = useRef(null);
  const hasLoadedInitialProgress = useRef(false);

  // ✅ LOAD SAVED PROGRESS ON MOUNT
  useEffect(() => {
    const loadProgress = async () => {
      if (!auth.currentUser) {
        console.warn("⚠️ No user logged in, starting from page 0");
        setIsLoadingProgress(false);
        hasLoadedInitialProgress.current = true;
        return;
      }

      const uid = auth.currentUser.uid;
      
      try {
        const progressDocRef = doc(db, "users", uid, "progress", "day1_navigator");
        const progressSnap = await getDoc(progressDocRef);

        if (progressSnap.exists()) {
          const savedPageIndex = progressSnap.data().pageIndex || 0;
          console.log("✅ Loaded saved progress: Page", savedPageIndex);
          setPageIndex(savedPageIndex);
        } else {
          console.log("ℹ️ No saved progress found, starting fresh");
        }
      } catch (error) {
        console.error("🔥 Error loading progress:", error);
      } finally {
        setIsLoadingProgress(false);
        hasLoadedInitialProgress.current = true;
      }
    };

    loadProgress();
  }, []);

  // ✅ SAVE PROGRESS WHENEVER pageIndex CHANGES
  useEffect(() => {
    const saveProgress = async () => {
      if (!auth.currentUser) return;
      if (!hasLoadedInitialProgress.current) return;

      const uid = auth.currentUser.uid;

      try {
        const progressDocRef = doc(db, "users", uid, "progress", "day1_navigator");
        await setDoc(progressDocRef, {
          pageIndex,
          lastUpdated: new Date().toISOString(),
          course: "social_skills",
          day: 1
        }, { merge: true });

        console.log("💾 Progress saved: Page", pageIndex);
      } catch (error) {
        console.error("🔥 Error saving progress:", error);
      }
    };

    saveProgress();
  }, [pageIndex]);

  // Disable parent page scroll when component mounts
  useEffect(() => {
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    
    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
    };
  }, []);

  // Scroll to top when page changes
  useEffect(() => {
    const scrollToTop = () => {
      const anchor = document.getElementById('page-top-anchor');
      if (anchor) {
        anchor.scrollIntoView({ behavior: 'instant', block: 'start' });
      }
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
      }
      window.scrollTo(0, 0);
    };

    scrollToTop();
    requestAnimationFrame(scrollToTop);
  }, [pageIndex]);

  const nextPage = () => {
    setPageIndex((prev) => Math.min(prev + 1, pages.length - 1));
  };

  const prevPage = () => {
    setPageIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleComplete = () => {
    console.log("✅ Day1Navigator complete - all pages finished");
    if (onCompleteNavigator) onCompleteNavigator();
    else console.log("⚠️ onCompleteNavigator is undefined!");
  };

  const handleQuit = () => {
    if (window.confirm("Your progress has been saved. Come back anytime to continue!")) {
      if (onCompleteNavigator) onCompleteNavigator();
    }
  };

  // All pages in order - intro pages followed by all skill pages
  const pages = [
    <YouAreNotAlone key="youarenotalone" onComplete={nextPage} />,
    <FindAPlace01 key="find" onComplete={nextPage} />,
    <SetYourTimes02 key="times" onComplete={nextPage} />,
    <HelpWithAnxiety03 key="anxiety" onComplete={nextPage} />,
    // All skill pages integrated here
    <EyeContactTrainer key="eye-contact" onNext={nextPage} />,
    <OpenBodyLanguage key="body-language" onNext={nextPage} />,
    <SmileWarmUp key="smile" onNext={nextPage} />,
    <VoiceToneControl key="voice" onNext={nextPage} />,
    <ApproachOpener key="approach" onNext={nextPage} />,
    <ActiveListening key="listening" onNext={nextPage} />,
    <GenuineAppreciation key="appreciation" onNext={nextPage} />,
    <HandleSilence key="silence" onNext={handleComplete} />, // Last page calls handleComplete
  ];

  const pageNames = [
    "You Are Not Alone",
    "Find A Place",
    "Set Your Times",
    "Help With Anxiety",
    "Eye Contact Trainer",
    "Open Body Language",
    "Smile Warm-Up",
    "Voice Tone Control",
    "Approach Opener",
    "Active Listening",
    "Genuine Appreciation",
    "Handling Silence"
  ];

  useImperativeHandle(ref, () => ({
    nextPage,
    isLastPage: pageIndex === pages.length - 1,
  }));

  // ✅ LOADING SCREEN
  if (isLoadingProgress) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          width: "100vw",
          height: "100vh",
          background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)",
          overflow: "hidden",
          zIndex: 999999,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: "20px",
        }}
      >
        <div style={{
          width: "60px",
          height: "60px",
          border: "4px solid rgba(168, 85, 247, 0.3)",
          borderTop: "4px solid #a855f7",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }} />
        <p style={{ color: "white", fontSize: "18px", fontWeight: "600" }}>Loading your progress...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        background: "black",
        overflow: "hidden",
        zIndex: 999999,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Top Navigation Bar */}
      <div
        style={{
          position: "fixed",
          top: "20px",
          left: "20px",
          right: "20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          zIndex: 1000002,
        }}
      >
        {/* Left side buttons */}
        <div style={{ display: "flex", gap: "12px" }}>
          {/* Quit Button */}
          <button
            onClick={handleQuit}
            style={{
              padding: "12px 24px",
              background: "rgba(255,255,255,0.1)",
              color: "white",
              borderRadius: "8px",
              cursor: "pointer",
              border: "1px solid rgba(255,255,255,0.2)",
              backdropFilter: "blur(6px)",
              fontSize: "14px",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.1)";
            }}
          >
            ✕ Save & Quit
          </button>

          {/* Next Step Button */}
          <button
            onClick={nextPage}
            disabled={pageIndex === pages.length - 1}
            style={{
              padding: "12px 24px",
              background: pageIndex === pages.length - 1 ? "rgba(168, 85, 247, 0.3)" : "rgba(168, 85, 247, 0.8)",
              color: "white",
              borderRadius: "8px",
              cursor: pageIndex === pages.length - 1 ? "not-allowed" : "pointer",
              border: "1px solid rgba(168, 85, 247, 0.4)",
              backdropFilter: "blur(6px)",
              fontSize: "14px",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.3s ease",
              opacity: pageIndex === pages.length - 1 ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              if (pageIndex !== pages.length - 1) {
                e.currentTarget.style.background = "rgba(168, 85, 247, 1)";
              }
            }}
            onMouseLeave={(e) => {
              if (pageIndex !== pages.length - 1) {
                e.currentTarget.style.background = "rgba(168, 85, 247, 0.8)";
              }
            }}
          >
            Next Step →
          </button>
        </div>

        {/* Progress Indicator - Right side */}
        <div
          style={{
            padding: "12px 24px",
            background: "rgba(168, 85, 247, 0.2)",
            color: "white",
            borderRadius: "8px",
            border: "1px solid rgba(168, 85, 247, 0.4)",
            backdropFilter: "blur(6px)",
            fontSize: "14px",
            fontWeight: "600",
          }}
        >
          Step {pageIndex + 1} of {pages.length}
        </div>
      </div>

      {/* Main Content Area */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.85)",
          zIndex: 1000000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <div
          ref={scrollContainerRef}
          style={{
            width: "100%",
            height: "100%",
            overflowY: "auto",
            overflowX: "hidden",
            backgroundColor: "transparent",
            padding: "80px 20px 20px 20px", // Extra top padding for nav bar
            boxSizing: "border-box",
          }}
        >
          <div id="page-top-anchor" />
          {pages[pageIndex]}
        </div>
      </div>

      {/* Bottom Progress Bar */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          height: "4px",
          background: "rgba(75, 85, 99, 0.5)",
          zIndex: 1000001,
        }}
      >
        <div
          style={{
            height: "100%",
            background: "linear-gradient(90deg, #a855f7, #ec4899)",
            width: `${((pageIndex + 1) / pages.length) * 100}%`,
            transition: "width 0.3s ease",
          }}
        />
      </div>

      {/* Current Page Name Indicator */}
      <div
        style={{
          position: "fixed",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          padding: "8px 16px",
          background: "rgba(0, 0, 0, 0.6)",
          backdropFilter: "blur(8px)",
          borderRadius: "20px",
          border: "1px solid rgba(168, 85, 247, 0.3)",
          color: "rgba(255, 255, 255, 0.9)",
          fontSize: "12px",
          fontWeight: "500",
          zIndex: 1000001,
        }}
      >
        {pageNames[pageIndex]}
      </div>
    </div>
  );
});

export default Day1Navigator;