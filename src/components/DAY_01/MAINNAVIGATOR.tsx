import { useState, forwardRef, useImperativeHandle } from "react";
import FindAPlace01 from "src/components/DAY_01/FINDAPLACE/01";
import SetYourTimes02 from "src/components/DAY_01/SETYOURTIMES/02";
import HelpWithAnxiety03 from "src/components/DAY_01/HELPWITHTHEIRANXIETY/03";
import SkillNavigator from "src/components/DAY_01/SKELETAL COMPONENTS/navigator";
import YouAreNotAlone from "src/components/DAY_01/YOUARENOTALONE/youarenotalone";

const Day1Navigator = forwardRef(({ onCompleteNavigator }, ref) => {
  const [pageIndex, setPageIndex] = useState(0);
  const [showSpotlight, setShowSpotlight] = useState(true);

  const nextPage = () => {
    setPageIndex((prev) => Math.min(prev + 1, pages.length - 1));
  };

  const prevPage = () => {
    setPageIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleSkillNavigatorComplete = () => {
    console.log("✅ Day1Navigator handleSkillNavigatorComplete fired");
    if (onCompleteNavigator) onCompleteNavigator();
    else console.log("⚠️ onCompleteNavigator is undefined!");
  };

  const pages = [
    <YouAreNotAlone key="youarenotalone" onComplete={nextPage} />,
    <FindAPlace01 key="find" onComplete={nextPage} />,
    <SetYourTimes02 key="times" onComplete={nextPage} />,
    <HelpWithAnxiety03 key="anxiety" onComplete={nextPage} />,
    <SkillNavigator key="skills" onComplete={handleSkillNavigatorComplete} />,
  ];

  useImperativeHandle(ref, () => ({
    nextPage,
    isLastPage: pageIndex === pages.length - 1,
  }));

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
      {showSpotlight ? (
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
            style={{
              width: "100%",
              height: "100%",
              overflowY: "auto",
              backgroundColor: "transparent",
              padding: "20px",
              boxSizing: "border-box",
            }}
          >
            {pages[pageIndex]}
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
            {pages[pageIndex]}
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
            <button
              onClick={prevPage}
              disabled={pageIndex === 0}
              style={{
                padding: "12px 24px",
                background: "rgba(255,255,255,0.1)",
                color: "white",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              ← Previous
            </button>
            <button
              onClick={nextPage}
              disabled={pageIndex === pages.length - 1}
              style={{
                padding: "12px 24px",
                background: "rgba(147,51,234,0.8)",
                color: "white",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              Next →
            </button>
          </div>
        </>
      )}
    </div>
  );
});

export default Day1Navigator;
