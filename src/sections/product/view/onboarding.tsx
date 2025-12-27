import React, { useState } from "react";
import {
  ChevronRight,
  X,
  Users,
  Trophy,
  Target,
  MessageCircle,
  Star,
  CheckCircle
} from "lucide-react";

interface OnboardingTrailerProps {
  onComplete: () => void;
  onSkip: () => void;
}

const OnboardingTrailer: React.FC<OnboardingTrailerProps> = ({
  onComplete,
  onSkip
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      icon: Users,
      image: "src/sections/product/view/days.png",
      title: "Welcome to Your Social Skills Journey",
      description:
        "Connect with others, build meaningful relationships, and grow together in a supportive community.",
      color: "from-purple-600 to-indigo-600",
      features: [
        "Join action groups with like-minded people",
        "Practice real-world social skills",
        "Get feedback and support from peers"
      ]
    },
    {
      icon: Target,
      image: "src/sections/product/view/days.png",
      title: "Set Goals & Track Progress",
      description:
        "Transform your social abilities with structured challenges and measurable growth.",
      color: "from-indigo-600 to-blue-600",
      features: [
        "Complete daily and weekly challenges",
        "Track your improvement over time",
        "Earn points and climb the leaderboards"
      ]
    },
    {
      icon: MessageCircle,
      image: "src/sections/product/view/days.png",
      title: "Share & Learn Together",
      description:
        "Post your experiences, ask questions, and celebrate wins with your community.",
      color: "from-blue-600 to-cyan-600",
      features: [
        "Share practice reports",
        "Get feedback from others",
        "Discover helpful tips"
      ]
    },
    {
      icon: Trophy,
      image: "/images/onboarding/achievements.png",
      title: "Compete & Achieve",
      description:
        "Rise through leagues, earn achievements, and become your best self.",
      color: "from-cyan-600 to-purple-600",
      features: [
        "Climb from Bronze to Diamond",
        "Unlock exclusive badges",
        "Join real-world meetups"
      ]
    }
  ];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) setCurrentSlide(currentSlide - 1);
  };

  const slide = slides[currentSlide];
  const Icon = slide.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-gradient-to-br from-purple-950 via-purple-900 to-indigo-950 rounded-3xl border border-purple-500/30 shadow-2xl flex flex-col">


        {/* Skip */}
        <button
          onClick={onSkip}
          className="absolute top-4 right-4 text-purple-300 hover:text-white"
        >
          <X size={22} />
        </button>

        <div className="p-8 md:p-12 overflow-y-auto flex-1">


          {/* Icon */}
          <div
            className={`w-20 h-20 mb-6 rounded-2xl flex items-center justify-center bg-gradient-to-br ${slide.color}`}
          >
            <Icon size={40} className="text-white" />
          </div>

          {/* Image */}
          <div className="w-full mb-6 flex justify-center">
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full max-w-md rounded-xl shadow-xl object-cover"
            />
          </div>

          {/* Title */}
          <h2 className="text-3xl font-bold text-white mb-4">
            {slide.title}
          </h2>

          {/* Description */}
          <p className="text-purple-200 mb-6">
            {slide.description}
          </p>

          {/* Features */}
          <div className="space-y-3 mb-8">
            {slide.features.map((feature, i) => (
              <div key={i} className="flex items-start gap-3">
                <CheckCircle className="text-green-400 mt-0.5" size={18} />
                <p className="text-purple-100">{feature}</p>
              </div>
            ))}
          </div>

          {/* Progress */}
          <div className="flex justify-center gap-2 mb-6">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`h-2 rounded-full transition-all ${
                  i === currentSlide
                    ? "w-8 bg-purple-400"
                    : "w-2 bg-purple-700"
                }`}
              />
            ))}
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            {currentSlide > 0 && (
              <button
                onClick={prevSlide}
                className="flex-1 py-3 bg-purple-800/50 rounded-xl text-white"
              >
                Back
              </button>
            )}

            <button
              onClick={nextSlide}
              className={`flex-1 py-3 rounded-xl text-white font-bold bg-gradient-to-r ${slide.color} flex items-center justify-center gap-2`}
            >
              {currentSlide === slides.length - 1 ? (
                <>
                  Get Started <Star size={18} />
                </>
              ) : (
                <>
                  Next <ChevronRight size={18} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingTrailer;
