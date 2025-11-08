import { useState, useEffect } from "react";

interface FirstStepsProps {
  onComplete: () => void;
}

interface Task {
  id: number;
  question: string;
  feedback: string;
  completed: boolean;
}

export default function FirstSteps({ onComplete }: FirstStepsProps) {
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 1,
      question: "Record yourself speaking for 30 seconds about anything. Notice your tone, clarity, and pace.",
      feedback: "This helps you observe how you naturally express yourself, which is the foundation of effective communication.",
      completed: false,
    },
    {
      id: 2,
      question: "Write down a social situation that made you nervous recently. Note exactly what you felt.",
      feedback: "Reflecting on your feelings makes you aware of triggers and patterns, a key step in managing social anxiety.",
      completed: false,
    },
    {
      id: 3,
      question: "Imagine someone you admire. Write a short paragraph describing how they might handle a casual conversation.",
      feedback: "This strengthens empathy and helps you model positive social behaviors in your own interactions.",
      completed: false,
    },
    {
      id: 4,
      question: "Spend 2 minutes in a public place (or mentally visualize one) and silently observe how people interact.",
      feedback: "Observing others helps you learn social cues and the rhythm of natural conversations without pressure.",
      completed: false,
    },
    {
      id: 5,
      question: "Write a short note to yourself: one social skill you want to improve and one small step you can take this week.",
      feedback: "This makes your growth actionable. Small, intentional steps are how confident social habits are built.",
      completed: false,
    },
  ]);

  const [showFeedback, setShowFeedback] = useState(false);

  const handleCompleteTask = () => {
    const updatedTasks = [...tasks];
    updatedTasks[currentTaskIndex].completed = true;
    setTasks(updatedTasks);
    setShowFeedback(true);
  };

  const handleNext = () => {
    setShowFeedback(false);
    if (currentTaskIndex < tasks.length - 1) {
      setCurrentTaskIndex(currentTaskIndex + 1);
    } else {
      onComplete();
    }
  };

  const currentTask = tasks[currentTaskIndex];

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-950 via-purple-900 to-purple-950 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="w-full max-w-2xl relative">
        {/* Card */}
        <div className="relative bg-gradient-to-br from-purple-800/90 via-purple-900/90 to-fuchsia-900/90 rounded-3xl shadow-2xl border border-purple-400/30 p-8 overflow-hidden">
          {/* Background Orbs */}
          <div className="absolute top-[-100px] left-[-100px] w-72 h-72 bg-purple-600/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-[-120px] right-[-120px] w-96 h-96 bg-fuchsia-600/20 rounded-full blur-3xl animate-float-delayed"></div>

          {/* Header */}
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 text-center drop-shadow-lg">
            Your first actions
          </h2>

          {/* Task Card */}
          <div className="bg-purple-700/80 border border-purple-400/30 rounded-2xl shadow-lg p-6 mb-6 relative hover:scale-[1.02] transition-transform duration-300">
            <p className="text-white text-lg md:text-xl mb-4">{currentTask.question}</p>

            {!showFeedback ? (
              <label className="flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={currentTask.completed}
                  onChange={handleCompleteTask}
                  className="hidden peer"
                />
                <div className="w-6 h-6 rounded-full border-2 border-purple-400/50 flex-shrink-0 flex items-center justify-center mr-3 transition-all duration-300 peer-checked:bg-gradient-to-r peer-checked:from-purple-600 peer-checked:to-fuchsia-600">
                  <svg
                    className="w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={3}
                    viewBox="0 0 24 24"
                  >
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-white font-medium text-base md:text-lg">
                  Mark as done
                </span>
              </label>
            ) : (
              <div className="space-y-4">
                <div className="p-5 bg-green-900/50 border border-green-400/40 rounded-2xl shadow-inner text-green-100 text-base md:text-lg animate-slide-in">
                  {currentTask.feedback}
                </div>
                <button
                  onClick={handleNext}
                  className="w-full py-3 md:py-4 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white font-bold rounded-xl shadow-lg hover:scale-105 transition-transform duration-300"
                >
                  Next
                </button>
              </div>
            )}
          </div>

          {/* Progress */}
          <div className="mt-6 h-3 bg-purple-950/50 rounded-full overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-white/80 via-purple-200 to-white/80 transition-all duration-500 rounded-full"
              style={{ width: `${((currentTaskIndex + (showFeedback ? 1 : 0)) / tasks.length) * 100}%` }}
            />
          </div>
          <div className="mt-2 text-xs md:text-sm text-center text-purple-300">
            Task {currentTaskIndex + 1} of {tasks.length}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(20px); }
        }

        @keyframes slide-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }

        .animate-slide-in {
          animation: slide-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
