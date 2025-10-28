
import React, { useState } from "react";
// FIX: Changing imports to simple relative paths, assuming the build system 
// cannot resolve the 'src/' alias or absolute path structure.
import ReviewConvos from "./REVIEWCONVOS/19";
import IntroToDay4 from "./INTROTODAY4/21";
import ConvoFramework from "./CONVOFRAMEWORK/22";
import SkillsForDay4 from "./SKILLSFORDAY4/23";
import Day4ActionPlan from "./DAY4ACTIONPLAN/24";
import EveningReflection from "./EVENINGREFLECTION/25";

interface Day4ContainerProps {
  onCompleteNavigator?: () => void;
}

// 1. Structure the pages array exactly like Day3Container.jsx
const pages = [
  { component: IntroToDay4, title: "Day 4 Introduction" },
  { component: ReviewConvos, title: "Review Previous Conversations" },
  { component: ConvoFramework, title: "Conversation Framework" },
  { component: SkillsForDay4, title: "Skills for Day 4" },
  { component: Day4ActionPlan, title: "Action Plan" },
  { component: EveningReflection, title: "Evening Reflection & Commit" },
];

// Renamed component from DAY4NAV to Day4Container for consistency
export default function Day4Container({ onCompleteNavigator }: Day4ContainerProps) {
  // Use currentIndex (instead of page) for consistency
  const [currentIndex, setCurrentIndex] = useState(0); 
  // NOTE: showSpotlight is currently not being used to toggle the overlay visibility in the JSX,
  // but I will preserve the state declaration.
  const [showSpotlight, setShowSpotlight] = useState(true);
  
  // Get the component to render
  const CurrentPage = pages[currentIndex].component;

  // 2. Adopted the exact nextPage logic from Day3Container
  const nextPage = () => {
    setCurrentIndex((prev) => {
      if (prev < pages.length - 1) {
        console.log(`✅ Page ${prev + 1} complete! Moving to page ${prev + 2}`);
        return prev + 1;
      }
      console.log("✅ All Day 4 pages complete! Calling onCompleteNavigator...");
      if (onCompleteNavigator) onCompleteNavigator();
      return prev;
    });
  };

  // Adopted the exact prevPage logic from Day3Container
  const prevPage = () => setCurrentIndex((prev) => Math.max(prev - 1, 0));

  // Navigation Buttons component (reusable block)
  const NavigationButtons = (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        width: "100%",
        display: "flex",
        justifyContent: "space-between",
        padding: "10px 20px",
        background: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(6px)",
        zIndex: 1000001,
      }}
    >
      <button 
        onClick={prevPage} 
        style={{ 
          padding: "12px 24px", 
          background: "#4b5563", 
          color: "white", 
          borderRadius: "8px", 
          border: "none",
          cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
          opacity: currentIndex === 0 ? 0.5 : 1,
        }}
        disabled={currentIndex === 0}
      >
        Previous
      </button>
      <button 
        onClick={nextPage} 
        style={{ 
          padding: "12px 24px", 
          background: "#059669", 
          color: "white", 
          borderRadius: "8px", 
          border: "none",
          cursor: "pointer",
        }}
      >
        {currentIndex === pages.length - 1 ? "Finish" : "Next"}
      </button>
    </div>
  );


  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        background: "black",
        margin: 0,
        padding: 0,
        overflow: "hidden",
        zIndex: 999999,
      }}
    >
      {/* This block is the primary rendering path when showSpotlight is TRUE.
        It contains the CurrentPage and the Navigation Buttons.
      */}
      {showSpotlight ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            zIndex: 1000000,
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              overflowY: "auto",
              backgroundColor: "transparent",
              padding: "20px",
              boxSizing: "border-box",
              paddingBottom: "80px" /* Add space for nav buttons */
            }}
          >
            {/* Pass onNext to the current component */}
            <CurrentPage onNext={nextPage} /> 
          </div>
          {NavigationButtons} {/* ADDED NAVIGATION BUTTONS HERE */}
        </div>
      ) : (
        /* This block is the primary rendering path when showSpotlight is FALSE.
          It already contains the CurrentPage and the Navigation Buttons (now defined via NavigationButtons variable).
        */
        <>
          <div
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              overflowY: "auto",
              backgroundColor: "transparent",
              padding: "20px",
              boxSizing: "border-box",
              paddingBottom: "80px" /* Add space for nav buttons */
            }}
          >
            {/* Pass onNext to the current component */}
            <CurrentPage onNext={nextPage} /> 
          </div>

          {NavigationButtons} {/* Replaced duplicated code with NavigationButtons */}
        </>
      )}
    </div>
  );
}
