import { useState } from "react";
import { Check, Sparkles, ArrowRight } from "lucide-react";

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
  const progress = ((currentTaskIndex + (showFeedback ? 1 : 0)) / tasks.length) * 100;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-950 via-purple-900 to-indigo-950 flex items-center justify-center z-50 p-4 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-3xl animate-pulse-slower"></div>
      </div>

      <div className="w-full max-w-3xl relative z-10">
        {/* Header with Icon */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-fuchsia-500 rounded-2xl mb-4 shadow-lg">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Your first actions
          </h2>
          <p className="text-purple-300 text-lg">
            Complete these to build your foundation
          </p>
        </div>

        {/* Main Task Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-8 md:p-10 mb-6 animate-slide-up">
          {/* Task Number Badge */}
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-purple-600/20 backdrop-blur-sm rounded-full border border-purple-400/30">
            <span className="text-sm font-medium text-purple-300">
              Task {currentTaskIndex + 1} of {tasks.length}
            </span>
          </div>

          {/* Task Question */}
          <div className="mb-8">
            <p className="text-white text-xl md:text-2xl leading-relaxed font-medium">
              {currentTask.question}
            </p>
          </div>

          {/* Action Section */}
          {!showFeedback ? (
            <button
              onClick={handleCompleteTask}
              className="group w-full flex items-center justify-between p-6 bg-gradient-to-r from-purple-600/80 to-fuchsia-600/80 hover:from-purple-600 hover:to-fuchsia-600 rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl border border-purple-400/30"
            >
              <span className="text-white font-semibold text-lg">Mark as done</span>
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-all">
                <Check className="w-5 h-5 text-white" />
              </div>
            </button>
          ) : (
            <div className="space-y-6 animate-fade-in">
              {/* Feedback Box */}
              <div className="p-6 bg-gradient-to-br from-green-900/40 to-emerald-900/40 border border-green-400/30 rounded-2xl backdrop-blur-sm">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-1">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-green-100 text-base md:text-lg leading-relaxed flex-1">
                    {currentTask.feedback}
                  </p>
                </div>
              </div>

              {/* Next Button */}
              <button
                onClick={handleNext}
                className="group w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-semibold text-lg rounded-2xl transition-all duration-300 hover:scale-[1.02] shadow-lg hover:shadow-xl"
              >
                <span>{currentTaskIndex < tasks.length - 1 ? "Next task" : "Finish"}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="space-y-3 animate-fade-in">
          <div className="h-2 bg-purple-950/50 rounded-full overflow-hidden backdrop-blur-sm border border-purple-500/20">
            <div
              className="h-full bg-gradient-to-r from-purple-500 via-fuchsia-500 to-purple-500 transition-all duration-700 ease-out rounded-full shadow-lg"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          {/* Task Dots */}
          <div className="flex justify-center gap-2">
            {tasks.map((task, index) => (
              <div
                key={task.id}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index < currentTaskIndex || (index === currentTaskIndex && showFeedback)
                    ? "bg-purple-400 w-8"
                    : index === currentTaskIndex
                    ? "bg-purple-500 w-3 h-3"
                    : "bg-purple-800"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.1); }
        }

        @keyframes pulse-slower {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.15); }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }

        .animate-slide-up {
          animation: slide-up 0.8s ease-out forwards;
        }

        .animate-pulse-slow {
          animation: pulse-slow 8s ease-in-out infinite;
        }

        .animate-pulse-slower {
          animation: pulse-slower 10s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}