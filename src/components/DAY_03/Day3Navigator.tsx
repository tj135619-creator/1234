import React, { useState } from "react";
import WELCOME from "src/components/DAY_03/WELCOMEOBJ/11";
import REVIEWCONV from "src/components/DAY_03/REVIEWCONVOS/12";
import REFLECTSKILLS from "src/components/DAY_03/REFLECTONSKILLS/13";
import PATTERNSMISTAKES from "src/components/DAY_03/IDENITIFYPATTERNS/14";
import PLANLOCATIONS from "src/components/DAY_03/PLANLOCATIONS/15";
import CONVFRAME from "src/components/DAY_03/CONVFRAMEWORK/19";
import MICROGOALS from "src/components/DAY_03/MICROGOALS/16";
import ANXIETYREDUCTION from "src/components/DAY_03/ANXIETYREDUCTION/17";
import MENTALPREP from "./MENTALPREP/17";
import COMMIT from "src/components/DAY_03/COMMITMENT/18";

interface Day3ContainerProps {
  onCompleteNavigator?: () => void;
}

const pages = [
  { component: WELCOME, title: "Welcome & Objective" },
  { component: REVIEWCONV, title: "Review Conversations" },
  { component: CONVFRAME, title: "Conversation Framework" },
  { component: MENTALPREP, title: "Mental Preparation" },
  { component: REFLECTSKILLS, title: "Reflect Micro-Skills" },
  { component: PATTERNSMISTAKES, title: "Identify Patterns & Mistakes" },
  { component: PLANLOCATIONS, title: "Plan Locations" },
  { component: MICROGOALS, title: "Set Micro-Goals" },
  { component: ANXIETYREDUCTION, title: "Anxiety Reduction" },
  { component: COMMIT, title: "Reflection & Commitment" },
];

export default function Day3Container({ onCompleteNavigator }: Day3ContainerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showSpotlight, setShowSpotlight] = useState(true);
  const CurrentPage = pages[currentIndex].component;

  const nextPage = () => {
    setCurrentIndex((prev) => {
      if (prev < pages.length - 1) {
        console.log(`✅ Page ${prev + 1} complete! Moving to page ${prev + 2}`);
        return prev + 1;
      }
      console.log("✅ All Day 3 pages complete! Calling onCompleteNavigator...");
      if (onCompleteNavigator) onCompleteNavigator();
      return prev;
    });
  };

  const prevPage = () => setCurrentIndex((prev) => Math.max(prev - 1, 0));

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
            }}
          >
            <CurrentPage onNext={nextPage} onComplete={nextPage} />
          </div>
        </div>
      ) : (
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
            }}
          >
            <CurrentPage onNext={nextPage} onComplete={nextPage} />
          </div>

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
            <button onClick={prevPage} style={{ padding: "12px 24px" }}>
              Previous
            </button>
            <button onClick={nextPage} style={{ padding: "12px 24px" }}>
              {currentIndex === pages.length - 1 ? "Finish" : "Next"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
