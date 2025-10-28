import React, { useState } from "react";
import { MORNINGPREP } from "src/components/DAY_02/MORNINGPREP/01";
import REVIEWSKILLS from "src/components/DAY_02/REVIEWSKILLS/02";
import MAPTODAYSPLAN from "src/components/DAY_02/MAPTODAYSPLAN/03";
import { CONVOPREP } from "src/components/DAY_02/CONVOPREP/04";
import PHYSICALENVPREP from "src/components/DAY_02/PHYSICALENVPREP/05";
import TrackingInteractions from "src/components/DAY_02/TRACKINGINTERACTIONS/06";

interface Day2ContainerProps {
  onComplete?: () => void;
  onCompleteNavigator?: () => void;
}

const pages = [
  { component: MORNINGPREP, title: "Morning Prep" },
  { component: REVIEWSKILLS, title: "Review Skills" },
  { component: CONVOPREP, title: "Conversation Prep" },
  { component: MAPTODAYSPLAN, title: "Map Today's Plan" },
  { component: PHYSICALENVPREP, title: "Physical & Env Prep" },
  { component: TrackingInteractions, title: "Tracking Interactions" },
];

export default function Day2Container({ onComplete, onCompleteNavigator }: Day2ContainerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showSpotlight, setShowSpotlight] = useState(true);
  const CurrentPage = pages[currentIndex].component;

  const nextPage = () => {
    setCurrentIndex((prev) => {
      if (prev < pages.length - 1) return prev + 1;
      if (onComplete) onComplete();
      if (onCompleteNavigator) onCompleteNavigator();
      return prev;
    });
  };

  const prevPage = () => setCurrentIndex((prev) => Math.max(prev - 1, 0));

  const handleLastPageCompletion = () => {
    console.log("✅ Last Page (TrackingInteractions) complete! Triggering Day 2 finish.");
    if (onCompleteNavigator) onCompleteNavigator();
  };

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
            <CurrentPage
              onNext={nextPage}
              onCompleteNavigator={currentIndex === pages.length - 1 ? handleLastPageCompletion : undefined}
            />
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
            <CurrentPage
              onNext={nextPage}
              onCompleteNavigator={currentIndex === pages.length - 1 ? handleLastPageCompletion : undefined}
            />
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
