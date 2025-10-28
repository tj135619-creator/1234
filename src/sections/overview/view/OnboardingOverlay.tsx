import React, { useState, useEffect } from "react";

interface Props {
  onFinish: () => void;
}

const onboardingSteps = [
  {
    title: "Welcome to GoalGrid",
    content:
      "Discover the power of tracking goals, building relationships, and interacting with the community.",
    img: "https://goalgrid.wpcomstaging.com/wp-content/uploads/2025/10/Screenshot-2025-10-24-024321.png",
  },
  {
    title: "Community Features",
    content:
      "Join groups, collaborate on goals, and celebrate achievements together.",
    img: "https://goalgrid.wpcomstaging.com/wp-content/uploads/2025/10/Screenshot-2025-10-24-022105.png",
  },
  {
    title: "Live Action Support",
    content:
      "Get real-time guidance from mentors or AI coaches whenever you need it.",
    img: "https://goalgrid.wpcomstaging.com/wp-content/uploads/2025/10/Screenshot-2025-10-24-022246.png",
  },
  {
    title: "Track Relationships",
    content:
      "Log and monitor all interactions systematically to improve your network.",
    img: "https://goalgrid.wpcomstaging.com/wp-content/uploads/2025/10/Screenshot-2025-10-24-023643.png",
  },
  {
    title: "Get Started",
    content:
      "You are ready! Click Finish to dive into your dashboard and start achieving your goals.",
    img: "https://goalgrid.wpcomstaging.com/wp-content/uploads/2025/10/Screenshot-2025-10-24-022105.png",
  },
];

const OnboardingOverlay: React.FC<Props> = ({ onFinish }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [fade, setFade] = useState(true);

  // Disable pinch/zoom
  useEffect(() => {
    const preventZoom = (e: TouchEvent) => {
      if (e.touches.length > 1) e.preventDefault();
    };
    document.addEventListener("touchmove", preventZoom, { passive: false });
    return () => {
      document.removeEventListener("touchmove", preventZoom);
    };
  }, []);

  const nextStep = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setFade(false);
      setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
        setFade(true);
      }, 200);
    } else {
      window.postMessage("Navigate to Timeline", "*");
      onFinish();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setFade(false);
      setTimeout(() => {
        setCurrentStep((prev) => prev - 1);
        setFade(true);
      }, 200);
    }
  };

  useEffect(() => {
  // Prevent pinch zoom and set fixed viewport scaling
  const meta = document.createElement("meta");
  meta.name = "viewport";
  meta.content =
    "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no";
  document.head.appendChild(meta);

  const preventPinch = (e: TouchEvent) => {
    if (e.touches.length > 1) e.preventDefault();
  };

  document.addEventListener("touchmove", preventPinch, { passive: false });
  document.addEventListener("gesturestart", (e) => e.preventDefault());
  document.addEventListener("gesturechange", (e) => e.preventDefault());
  document.addEventListener("gestureend", (e) => e.preventDefault());

  return () => {
    document.removeEventListener("touchmove", preventPinch);
    document.removeEventListener("gesturestart", (e) => e.preventDefault());
    document.removeEventListener("gesturechange", (e) => e.preventDefault());
    document.removeEventListener("gestureend", (e) => e.preventDefault());
  };
}, []);


  const step = onboardingSteps[currentStep];

  return (
    <div className="fixed top-0 left-0 w-full h-full z-[9999] bg-gradient-to-br from-purple-950 via-purple-800 to-purple-600 flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-purple-900/40 backdrop-blur-md"></div>

      <div
        className={`relative z-10 bg-white/10 backdrop-blur-2xl rounded-3xl shadow-[0_0_60px_rgba(0,0,0,0.6)] w-[95%] max-w-3xl mx-auto p-6 sm:p-10 text-white flex flex-col sm:flex-row items-center gap-6 sm:gap-10 transition-opacity duration-300 ${
          fade ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Text Section */}
        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-2xl sm:text-4xl font-extrabold mb-4 sm:mb-6">
            {step.title}
          </h1>
          <p className="text-base sm:text-lg leading-relaxed mb-6 sm:mb-8 text-gray-100">
            {step.content}
          </p>

          <div className="flex flex-col sm:flex-row justify-center sm:justify-between gap-4">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="px-6 py-2 bg-white/20 text-white rounded-lg disabled:opacity-40 hover:bg-white/30 transition"
            >
              Previous
            </button>
            <button
              onClick={nextStep}
              className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-400 text-white rounded-lg hover:opacity-90 transition"
            >
              {currentStep === onboardingSteps.length - 1 ? "Finish" : "Next"}
            </button>
          </div>
        </div>

        {/* Phone Mockup */}
        <div className="flex-1 flex justify-center">
          <div className="relative w-[60vw] max-w-[260px] aspect-[260/520] bg-black rounded-[2.5rem] p-2 sm:p-3 shadow-[0_0_40px_rgba(0,0,0,0.6)] border-[3px] border-gray-700">
            <div className="w-full h-full bg-white rounded-[2rem] overflow-hidden flex items-center justify-center">
              <img
                src={step.img}
                alt={step.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-black rounded-b-xl mt-1"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingOverlay;
