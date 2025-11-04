import { useState, useEffect } from "react";

interface FirstStepsProps {
  onComplete: () => void;
}

interface Task {
  id: string;
  task: string;
  completed: boolean;
}

interface Action {
  id: number;
  title: string;
  description: string;
  instruction: string;
  tasks: Task[];
  completed: boolean;
  supportMessage: string;
  completionMessage: string;
  icon: string;
  estimatedTime: string;
}

export default function FirstSteps({ onComplete }: FirstStepsProps) {
  const [currentActionIndex, setCurrentActionIndex] = useState(0);
  const [actions, setActions] = useState<Action[]>([
    {
      id: 1,
      title: "Self-Awareness",
      description: "Understanding how you come across is the foundation of connection",
      instruction: "Pick ONE task to complete right now (check it off when done):",
      tasks: [
        {
          id: "1a",
          task: "Record yourself speaking for one minute; note tone, clarity, and filler words.",
          completed: false
        },
        {
          id: "1b",
          task: "Watch your reflection as you smile and maintain eye contact for 30 seconds.",
          completed: false
        },
        {
          id: "1c",
          task: "Write what kind of person you'd like to be socially (friendly, calm, funny, etc.).",
          completed: false
        }
      ],
      completed: false,
      supportMessage: "Nice! Self-awareness isn't about being critical—it's about understanding your starting point. You just took the first step most people skip.",
      completionMessage: "Completed self-awareness exercise",
      icon: "🪞",
      estimatedTime: "1-2 min"
    },
    {
      id: 2,
      title: "Empathy Training",
      description: "Connection starts with understanding how others feel",
      instruction: "Choose ONE empathy exercise to complete:",
      tasks: [
        {
          id: "2a",
          task: "Read a short post or comment online and guess the emotion behind it.",
          completed: false
        },
        {
          id: "2b",
          task: "Recall the last conversation you had. List what the other person might have felt.",
          completed: false
        },
        {
          id: "2c",
          task: "Write one paragraph imagining a friend's point of view about their current stress.",
          completed: false
        }
      ],
      completed: false,
      supportMessage: "Great work. When you can read emotions, conversations become less scary—you know what people actually need from you.",
      completionMessage: "Practiced reading emotions",
      icon: "💭",
      estimatedTime: "1-2 min"
    },
    {
      id: 3,
      title: "Expression Practice",
      description: "Learning to express yourself clearly and warmly",
      instruction: "Pick ONE expression exercise and do it now:",
      tasks: [
        {
          id: "3a",
          task: "Pick a random topic and talk about it aloud for 60 seconds.",
          completed: false
        },
        {
          id: "3b",
          task: "Practice giving one compliment to yourself in the mirror.",
          completed: false
        },
        {
          id: "3c",
          task: "Rewrite a past awkward text message into a warmer version.",
          completed: false
        }
      ],
      completed: false,
      supportMessage: "Perfect! Most social anxiety comes from not trusting yourself to express thoughts. You're building that trust muscle right now.",
      completionMessage: "Practiced self-expression",
      icon: "💬",
      estimatedTime: "1-2 min"
    },
    {
      id: 4,
      title: "Anxiety Regulation",
      description: "Managing nerves before and during interactions",
      instruction: "Complete ONE anxiety management technique:",
      tasks: [
        {
          id: "4a",
          task: "Before any interaction, breathe slowly for 60 seconds and relax shoulders.",
          completed: false
        },
        {
          id: "4b",
          task: "Journal the thought 'People will judge me' and counter it with three logical points.",
          completed: false
        },
        {
          id: "4c",
          task: "Visualize one positive future conversation scene in detail.",
          completed: false
        }
      ],
      completed: false,
      supportMessage: "Solid. Anxiety is normal—you're just learning to notice it without letting it run the show. That's the real skill.",
      completionMessage: "Practiced calming techniques",
      icon: "🧘",
      estimatedTime: "1-2 min"
    },
    {
      id: 5,
      title: "Gradual Exposure (Low Risk)",
      description: "Starting with small, safe social actions",
      instruction: "Choose ONE low-pressure action to take this week:",
      tasks: [
        {
          id: "5a",
          task: "Leave a short friendly comment on a public post.",
          completed: false
        },
        {
          id: "5b",
          task: "Ask one neutral question to a barista, shopkeeper, or classmate.",
          completed: false
        },
        {
          id: "5c",
          task: "Stay in a social environment for 10 minutes without using your phone.",
          completed: false
        }
      ],
      completed: false,
      supportMessage: "You did it! That was real exposure, not just theory. Every tiny action like this rewires your brain to see social situations as less threatening.",
      completionMessage: "Completed first real-world action",
      icon: "🌱",
      estimatedTime: "Commit now"
    }
  ]);

  const [showSupport, setShowSupport] = useState(false);
  const [allCompleted, setAllCompleted] = useState(false);
  const [typingText, setTypingText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const currentAction = actions[currentActionIndex];

  // Typewriter effect for support messages
  useEffect(() => {
    if (!showSupport || !currentAction) return;

    const message = currentAction.supportMessage;
    setIsTyping(true);
    setTypingText("");

    let index = 0;
    const interval = setInterval(() => {
      setTypingText(message.slice(0, index + 1));
      index++;
      if (index >= message.length) {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 20);

    return () => clearInterval(interval);
  }, [showSupport, currentAction]);

  const handleTaskToggle = (taskId: string) => {
    const updatedActions = [...actions];
    const action = updatedActions[currentActionIndex];
    const task = action.tasks.find(t => t.id === taskId);
    
    if (task) {
      task.completed = !task.completed;
      setActions(updatedActions);
    }
  };

  const handleContinue = () => {
    // Check if at least one task is completed
    const hasCompletedTask = currentAction.tasks.some(t => t.completed);
    if (!hasCompletedTask) return;

    // Mark current action as completed
    const updatedActions = [...actions];
    updatedActions[currentActionIndex].completed = true;
    setActions(updatedActions);

    // Show support message
    setShowSupport(true);

    // Move to next action after delay
    setTimeout(() => {
      if (currentActionIndex < actions.length - 1) {
        setCurrentActionIndex(currentActionIndex + 1);
        setShowSupport(false);
      } else {
        setAllCompleted(true);
      }
    }, 3500);
  };

  const completedCount = actions.filter(a => a.completed).length;
  const progressPercentage = (completedCount / actions.length) * 100;
  const hasCompletedTask = currentAction?.tasks.some(t => t.completed) || false;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-950 via-purple-900 to-purple-950 flex items-center justify-center z-50 overflow-y-auto p-4">
      {/* Animated background orbs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-20 w-[500px] h-[500px] bg-fuchsia-600/10 rounded-full blur-3xl animate-float-delayed" />
      </div>

      <div className="relative z-10 w-full max-w-3xl my-8">
        {!allCompleted ? (
          <div className="bg-gradient-to-br from-purple-900/90 via-purple-800/90 to-fuchsia-900/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-purple-400/30 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-fuchsia-600 px-6 md:px-8 py-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-3xl md:text-4xl">✨</span>
                  <div>
                    <h2 className="text-xl md:text-3xl font-bold text-white">Foundation Micro-Actions</h2>
                    <p className="text-purple-100 text-xs md:text-sm">Quick exercises to build your social foundation</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl md:text-3xl font-bold text-white">{completedCount}/{actions.length}</div>
                  <div className="text-purple-100 text-xs">done</div>
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="relative h-2 bg-purple-950/50 rounded-full overflow-hidden mt-4">
                <div
                  className="h-full bg-gradient-to-r from-white/80 via-purple-200 to-white/80 transition-all duration-500 rounded-full"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>

            {/* Content */}
            <div className="p-6 md:p-8">
              {/* Progress indicators */}
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {actions.map((action, idx) => (
                  <div
                    key={action.id}
                    className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl border transition-all duration-300 ${
                      action.completed
                        ? "bg-green-500/20 border-green-400/50 text-green-300"
                        : idx === currentActionIndex
                        ? "bg-purple-600/30 border-purple-400/50 text-white scale-105"
                        : "bg-purple-800/20 border-purple-600/30 text-purple-400"
                    }`}
                  >
                    <span className="text-lg">{action.completed ? "✓" : action.icon}</span>
                    <span className="text-xs font-medium hidden sm:inline">{idx + 1}</span>
                  </div>
                ))}
              </div>

              {/* Current Action */}
              <div className="mb-6">
                <div className="flex items-start gap-3 md:gap-4 mb-4">
                  <div className="flex-shrink-0 w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-purple-500 to-fuchsia-500 rounded-2xl flex items-center justify-center text-2xl md:text-3xl shadow-lg">
                    {currentAction.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="text-lg md:text-2xl font-bold text-white">{currentAction.title}</h3>
                      <span className="text-xs px-2 py-1 bg-purple-600/40 rounded-full text-purple-200 border border-purple-400/30">
                        ~{currentAction.estimatedTime}
                      </span>
                    </div>
                    <p className="text-purple-200 text-sm md:text-base">{currentAction.description}</p>
                  </div>
                </div>

                {/* Support Message */}
                {showSupport && (
                  <div className="bg-green-900/30 border border-green-400/30 rounded-2xl p-4 mb-4 animate-slide-in">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl flex-shrink-0">💚</span>
                      <p className="text-green-100 leading-relaxed text-sm md:text-base">
                        {typingText}
                        {isTyping && <span className="inline-block w-1 h-4 bg-green-400 ml-1 animate-pulse" />}
                      </p>
                    </div>
                  </div>
                )}

                {/* Task Selection */}
                {!showSupport && (
                  <div className="bg-purple-900/40 border border-purple-400/30 rounded-2xl p-4 md:p-6">
                    <label className="block text-purple-300 text-sm md:text-base mb-4 font-medium">
                      {currentAction.instruction}
                    </label>
                    
                    <div className="space-y-3 mb-4">
                      {currentAction.tasks.map((task) => (
                        <label
                          key={task.id}
                          className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all hover:border-purple-400/50 ${
                            task.completed
                              ? "bg-purple-600/30 border-purple-400/50"
                              : "bg-purple-950/50 border-purple-500/30"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => handleTaskToggle(task.id)}
                            className="mt-1 w-5 h-5 rounded border-2 border-purple-400/50 bg-purple-950/50 checked:bg-purple-500 checked:border-purple-400 cursor-pointer flex-shrink-0"
                          />
                          <span className="text-white text-sm md:text-base leading-relaxed flex-1">
                            {task.task}
                          </span>
                        </label>
                      ))}
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <span className="text-xs text-purple-400">
                        ✓ Check at least one to continue
                      </span>
                      <button
                        onClick={handleContinue}
                        disabled={!hasCompletedTask}
                        className="px-6 py-2 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white font-semibold rounded-xl hover:from-purple-500 hover:to-fuchsia-500 transition-all shadow-lg disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:from-purple-600 disabled:hover:to-fuchsia-600"
                      >
                        Continue
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Completed actions preview */}
              {completedCount > 0 && !showSupport && (
                <div className="mt-6">
                  <h4 className="text-sm font-semibold text-purple-300 mb-3">Completed:</h4>
                  <div className="space-y-2">
                    {actions.filter(a => a.completed).map((action) => (
                      <div
                        key={action.id}
                        className="flex items-center gap-3 px-4 py-2 bg-green-900/20 border border-green-400/30 rounded-xl"
                      >
                        <span className="text-green-400 text-xl">{action.icon}</span>
                        <span className="text-green-200 text-sm font-medium">{action.completionMessage}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          // Completion Screen
          <div className="bg-gradient-to-br from-purple-900/90 via-purple-800/90 to-fuchsia-900/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-purple-400/30 overflow-hidden animate-fade-in">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 md:px-8 py-6 text-center">
              <span className="text-5xl md:text-6xl mb-4 block animate-bounce-subtle">🎉</span>
              <h2 className="text-2xl md:text-4xl font-bold text-white mb-2">Foundation Complete!</h2>
              <p className="text-green-100 text-sm md:text-base">You've built the groundwork. Now let's put it into action.</p>
            </div>

            <div className="p-6 md:p-8">
              <div className="bg-purple-900/40 border border-purple-400/30 rounded-2xl p-4 md:p-6 mb-6">
                <h3 className="text-lg md:text-xl font-bold text-white mb-4">What you just accomplished:</h3>
                <div className="space-y-3">
                  {actions.map((action) => (
                    <div key={action.id} className="flex items-start gap-3">
                      <span className="text-xl md:text-2xl flex-shrink-0">{action.icon}</span>
                      <div>
                        <div className="text-white font-semibold text-sm md:text-base">{action.title}</div>
                        <div className="text-purple-300 text-xs md:text-sm">{action.completionMessage}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-600/20 to-fuchsia-600/20 border border-purple-400/30 rounded-2xl p-4 md:p-6 mb-6">
                <p className="text-purple-100 leading-relaxed text-center text-sm md:text-base">
                  These weren't just random exercises—each one targets a specific barrier to connection. 
                  <br />
                  <span className="text-white font-semibold">Now you're ready for the real work: your 5-day plan.</span>
                </p>
              </div>

              <button
                onClick={onComplete}
                className="w-full px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-purple-600 via-fuchsia-600 to-purple-600 text-white text-lg md:text-xl font-bold rounded-2xl hover:scale-105 transition-all shadow-2xl hover:shadow-purple-500/50"
              >
                Start Day 1 Now 🚀
              </button>
            </div>
          </div>
        )}
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
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
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

        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }

        .animate-bounce-subtle {
          animation: bounce-subtle 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}