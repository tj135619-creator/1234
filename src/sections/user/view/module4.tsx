import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, ArrowRight, ArrowLeft, CheckCircle, 
  AlertTriangle, Lightbulb, Target, Zap, Eye,
  TrendingUp, Users, Smile, Brain, Activity, X
} from 'lucide-react';

export default function TALKFrameworkNavigator({ lessonContent, onBackToTimeline, onCompleteNavigator }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [diagnosisData, setDiagnosisData] = useState({});
  const [userProfile, setUserProfile] = useState(null);
  const [weakestComponent, setWeakestComponent] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentStep]);

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      if (onCompleteNavigator) {
        await onCompleteNavigator();
      }
      if (onBackToTimeline) {
        await onBackToTimeline();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const steps = [
    {
      id: 'intro',
      component: IntroStep
    },
    {
      id: 'diagnosis',
      component: DiagnosisStep
    },
    {
      id: 'mirror',
      component: MirrorStep
    },
    {
      id: 'talk_intro',
      component: TALKIntroStep
    },
    {
      id: 'deep_dive',
      component: DeepDiveStep
    },
    {
      id: 'reframe',
      component: ReframeStep
    },
    {
      id: 'experiments',
      component: ExperimentsStep
    },
    {
      id: 'reflection',
      component: ReflectionStep
    }
  ];

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 text-white">
      <div className="fixed top-0 left-0 right-0 z-50 bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-6 h-6 text-purple-400" />
              <span className="font-semibold">TALK Framework</span>
            </div>
            <span className="text-sm text-slate-400">
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>

      <div className="pt-24 pb-12 px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <CurrentStepComponent
              onNext={handleNext}
              onBack={handleBack}
              diagnosisData={diagnosisData}
              setDiagnosisData={setDiagnosisData}
              userProfile={userProfile}
              setUserProfile={setUserProfile}
              weakestComponent={weakestComponent}
              setWeakestComponent={setWeakestComponent}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-slate-800/80 backdrop-blur-sm border-t border-slate-700/50 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
              currentStep === 0
                ? 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                : 'bg-slate-700 hover:bg-slate-600 text-white'
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex gap-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all ${
                  index === currentStep
                    ? 'w-8 bg-purple-500'
                    : index < currentStep
                    ? 'w-2 bg-green-500'
                    : 'w-2 bg-slate-600'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="flex items-center gap-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 text-lg font-semibold rounded-2xl transition-all -mt-6"
          >
            {currentStep === steps.length - 1 ? 'Complete' : ''}
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}

function IntroStep({ onNext }) {
  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", duration: 0.8 }}
        className="text-center mb-8"
      >
        <div className="w-32 h-32 mx-auto bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center shadow-2xl shadow-purple-500/50 mb-6">
          <MessageSquare className="w-16 h-16 text-white" />
        </div>
      </motion.div>

      <h1 className="text-5xl font-bold text-center mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
        The TALK Framework
      </h1>

      <p className="text-xl text-slate-300 text-center mb-12 max-w-2xl mx-auto">
        A practical structure for better conversations. Not confidence theater.
      </p>

      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50 mb-8">
        <h3 className="text-2xl font-bold mb-6 text-center">What This Is Not</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            "Generic advice about 'being yourself'",
            "Scripts to memorize",
            "Personality transformation",
            "Fake positivity"
          ].map((item, index) => (
            <div key={index} className="flex items-center gap-3 text-slate-300">
              <X className="w-5 h-5 text-red-400 flex-shrink-0" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-2xl p-8 border border-purple-500/30">
        <h3 className="text-2xl font-bold mb-6 text-center">What This Is</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            "A diagnostic lens for what's actually wrong",
            "Micro-adjustments you can test immediately",
            "Pattern recognition tools",
            "Behavioral clarity"
          ].map((item, index) => (
            <div key={index} className="flex items-center gap-3 text-slate-300">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="text-center text-slate-400 mt-8">
        You're not broken. You're stuck in a pattern.
      </p>
    </div>
  );
}

function DiagnosisStep({ onNext, diagnosisData, setDiagnosisData, setUserProfile, setWeakestComponent }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});

  const questions = [
    {
      id: 'struggle_context',
      question: "Where do conversations drain you fastest?",
      options: [
        { value: 'one_on_one', label: 'One-on-one with strangers', weight: { topics: 2, asking: 3 } },
        { value: 'groups', label: 'Group settings', weight: { levity: 3, kindness: 2 } },
        { value: 'work', label: 'Professional contexts', weight: { levity: 2, topics: 3 } },
        { value: 'dating', label: 'Dating or romantic contexts', weight: { asking: 3, levity: 2 } },
        { value: 'texting', label: 'Text conversations', weight: { topics: 2, kindness: 2 } }
      ]
    },
    {
      id: 'what_goes_wrong',
      question: "When conversations stall, what usually happens next?",
      options: [
        { value: 'silence', label: 'Awkward silence. I panic.', weight: { topics: 3, levity: 2 } },
        { value: 'exit', label: 'I find an excuse to leave', weight: { kindness: 2, levity: 3 } },
        { value: 'interview', label: 'I ask more questions but it feels like an interview', weight: { asking: 3, levity: 2 } },
        { value: 'monologue', label: 'They talk, I listen, but I feel invisible', weight: { topics: 2, asking: 3 } },
        { value: 'overthink', label: 'I overthink what to say and say nothing', weight: { topics: 3, kindness: 2 } }
      ]
    },
    {
      id: 'self_perception',
      question: "What do you think the problem is?",
      options: [
        { value: 'boring', label: 'I have nothing interesting to say', weight: { topics: 3, levity: 1 } },
        { value: 'awkward', label: 'I am just awkward', weight: { levity: 3, asking: 2 } },
        { value: 'timing', label: 'My timing is always off', weight: { asking: 2, kindness: 3 } },
        { value: 'invisible', label: 'People dont notice or remember me', weight: { topics: 2, kindness: 3 } },
        { value: 'exhausting', label: 'Conversations feel like work', weight: { asking: 2, levity: 3 } }
      ]
    },
    {
      id: 'response_pattern',
      question: "How do you usually respond when someone shares something personal?",
      options: [
        { value: 'advice', label: 'I try to give advice or solutions', weight: { kindness: 3, asking: 2 } },
        { value: 'redirect', label: 'I redirect to something lighter', weight: { levity: 2, kindness: 3 } },
        { value: 'relate', label: 'I share my own similar experience', weight: { topics: 2, asking: 2 } },
        { value: 'freeze', label: 'I freeze and say something generic', weight: { kindness: 3, levity: 2 } },
        { value: 'ask_more', label: 'I ask follow-up questions', weight: { asking: 1, kindness: 1 } }
      ]
    },
    {
      id: 'energy_shift',
      question: "What makes a conversation suddenly feel easier for you?",
      options: [
        { value: 'shared_thing', label: 'Finding something we both know or care about', weight: { topics: 1, asking: 2 } },
        { value: 'they_laugh', label: 'When they laugh at something I said', weight: { levity: 1, topics: 2 } },
        { value: 'they_ask', label: 'When they ask me questions', weight: { topics: 2, kindness: 2 } },
        { value: 'informal', label: 'When the vibe becomes less formal', weight: { levity: 1, kindness: 2 } },
        { value: 'validation', label: 'When they validate what I said', weight: { kindness: 1, topics: 2 } }
      ]
    }
  ];

  const handleAnswer = (value, weight) => {
    const newAnswers = { ...answers, [questions[currentQuestion].id]: { value, weight } };
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setTimeout(() => setCurrentQuestion(currentQuestion + 1), 300);
    } else {
      calculateProfile(newAnswers);
    }
  };

  const calculateProfile = (allAnswers) => {
    const scores = { topics: 0, asking: 0, levity: 0, kindness: 0 };
    
    Object.values(allAnswers).forEach(answer => {
      Object.entries(answer.weight).forEach(([component, weight]) => {
        scores[component] += weight;
      });
    });

    const weakest = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
    
    setDiagnosisData(allAnswers);
    setWeakestComponent(weakest);
    setUserProfile({
      scores,
      weakest,
      answers: allAnswers
    });
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-4xl font-bold text-center mb-4">Situational Diagnosis</h2>
      <p className="text-slate-400 text-center mb-8">
        No labels. Just patterns.
      </p>

      <div className="mb-8">
        <div className="flex justify-between text-sm text-slate-400 mb-2">
          <span>Question {currentQuestion + 1} of {questions.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50 mb-6">
            <h3 className="text-2xl font-semibold mb-6">{questions[currentQuestion].question}</h3>
            
            <div className="space-y-3">
              {questions[currentQuestion].options.map((option, index) => (
                <motion.button
                  key={index}
                  onClick={() => handleAnswer(option.value, option.weight)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="w-full text-left p-4 rounded-xl bg-slate-700/30 hover:bg-slate-700/50 border border-slate-600/50 hover:border-purple-500/50 transition-all"
                >
                  <span className="text-slate-200">{option.label}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function MirrorStep({ userProfile, onNext }) {
  if (!userProfile) return null;

  const profiles = {
    topics: {
      diagnosis: "You don't lack things to say. You exit conversations too early because you think your topics aren't interesting enough.",
      pattern: "You're underestimating how much people want concrete, human topics. You're probably avoiding the specific in favor of the vague.",
      icon: <Target className="w-12 h-12" />
    },
    asking: {
      diagnosis: "You're over-investing in asking questions. Conversations feel polite but flat because you're disappearing behind your curiosity.",
      pattern: "You're treating conversations like interviews. You ask, they answer, you ask again. No one knows what you think or feel.",
      icon: <MessageSquare className="w-12 h-12" />
    },
    levity: {
      diagnosis: "You freeze when you're unsure how much space you're allowed to take. Conversations feel like performance reviews.",
      pattern: "You're treating every exchange like it has stakes. You need permission to relax, but no one's going to give it to you.",
      icon: <Smile className="w-12 h-12" />
    },
    kindness: {
      diagnosis: "You respond literally instead of generously. People don't feel worse around you, but they don't feel seen either.",
      pattern: "You're solving problems instead of acknowledging feelings. You're efficient but not warm.",
      icon: <Users className="w-12 h-12" />
    }
  };

  const profile = profiles[userProfile.weakest];

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-4xl font-bold text-center mb-8">What's Actually Happening</h2>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 rounded-2xl p-8 border border-purple-500/30 mb-8"
      >
        <div className="flex items-start gap-6 mb-6">
          <div className="p-4 bg-purple-500/20 rounded-xl text-purple-400">
            {profile.icon}
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold mb-4 text-purple-400">Your Pattern</h3>
            <p className="text-xl text-slate-200 leading-relaxed mb-4">
              {profile.diagnosis}
            </p>
            <p className="text-lg text-slate-300 leading-relaxed">
              {profile.pattern}
            </p>
          </div>
        </div>
      </motion.div>

      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-3">
          <Eye className="w-6 h-6 text-blue-400" />
          What This Means
        </h3>
        <p className="text-slate-300 leading-relaxed">
          This isn't about confidence. It's about what you're prioritizing in the moment. 
          You're already doing some things well. But you're blind to what's missing.
        </p>
      </div>

      <p className="text-center text-slate-400 mt-8">
        Now let's fix it.
      </p>
    </div>
  );
}

function TALKIntroStep({ weakestComponent, onNext }) {
  const components = {
    topics: {
      letter: 'T',
      name: 'Topics',
      problem: 'Using vague or status-heavy topics',
      solution: 'Concrete, shared, human topics',
      color: 'from-blue-600 to-cyan-600'
    },
    asking: {
      letter: 'A',
      name: 'Asking',
      problem: 'Asking too many new questions',
      solution: 'Open-ended follow-ups',
      color: 'from-purple-600 to-pink-600'
    },
    levity: {
      letter: 'L',
      name: 'Levity',
      problem: 'Treating conversations like exams',
      solution: 'Light humor and self-awareness',
      color: 'from-yellow-600 to-orange-600'
    },
    kindness: {
      letter: 'K',
      name: 'Kindness',
      problem: 'Responding literally, not generously',
      solution: 'Validate feelings, not just facts',
      color: 'from-green-600 to-emerald-600'
    }
  };

  const focused = components[weakestComponent];

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-4xl font-bold text-center mb-6">The TALK Framework</h2>
      <p className="text-xl text-slate-300 text-center mb-12">
        Four components. You're underusing one.
      </p>

      <div className="grid md:grid-cols-2 gap-4 mb-12">
        {Object.entries(components).map(([key, comp]) => (
          <motion.div
            key={key}
            initial={{ opacity: 0.3 }}
            animate={{ 
              opacity: key === weakestComponent ? 1 : 0.4,
              scale: key === weakestComponent ? 1.05 : 1
            }}
            className={`rounded-xl p-6 border ${
              key === weakestComponent 
                ? 'bg-gradient-to-r ' + comp.color + ' border-white/30' 
                : 'bg-slate-800/50 border-slate-700/50'
            }`}
          >
            <div className="text-4xl font-bold mb-2">{comp.letter}</div>
            <div className="text-xl font-semibold mb-1">{comp.name}</div>
          </motion.div>
        ))}
      </div>

      <div className={`bg-gradient-to-r ${focused.color} rounded-2xl p-8 text-white`}>
        <h3 className="text-3xl font-bold mb-6">Your Weakest Component: {focused.name}</h3>
        
        <div className="space-y-4">
          <div className="bg-black/20 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="w-6 h-6" />
              <span className="font-semibold text-lg">What you're doing</span>
            </div>
            <p className="text-white/90">{focused.problem}</p>
          </div>

          <div className="bg-white/20 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Lightbulb className="w-6 h-6" />
              <span className="font-semibold text-lg">What to do instead</span>
            </div>
            <p className="text-white/90">{focused.solution}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DeepDiveStep({ weakestComponent, diagnosisData, onNext }) {
  const deepDives = {
    topics: {
      mistake: "You think your topics are boring, so you default to abstract questions or small talk that goes nowhere.",
      why_it_backfires: "Vague topics create vague responses. 'How's work?' gets 'Fine.' But 'What's been unexpectedly annoying this week?' starts a real conversation.",
      examples: [
        {
          context: "At work",
          bad: '"How was your weekend?"',
          good: '"What\'s something you\'re oddly excited about right now?"',
          why: "Concrete and unexpected. Gives them something specific to grab onto."
        },
        {
          context: "With friends",
          bad: '"What\'s new?"',
          good: '"What\'s been taking up way more mental space than it should?"',
          why: "Human and relatable. Opens the door to real thoughts."
        },
        {
          context: "On dates",
          bad: '"What do you do for fun?"',
          good: '"What\'s something you do that people would find surprisingly boring?"',
          why: "Playful and disarming. Creates permission to be real."
        }
      ]
    },
    asking: {
      mistake: "You keep asking new questions instead of following up. It feels like you're collecting data, not connecting.",
      why_it_backfires: "People feel interviewed, not seen. You're signaling curiosity but not investment. They answer because they're polite, not because they want to.",
      examples: [
        {
          context: "At work",
          bad: '"What do you do?" → They answer → "Where are you from?"',
          good: '"What do you do?" → They answer → "What part of that actually energizes you?"',
          why: "Follow-up shows you're listening, not just filling air."
        },
        {
          context: "With strangers",
          bad: '"Do you travel much?" → "What\'s your favorite place?"',
          good: '"Do you travel much?" → They mention a place → "What made that place stick with you?"',
          why: "You're exploring their answer, not moving to the next topic."
        },
        {
          context: "On dates",
          bad: '"What do you do?" → "Do you like it?" → "Where did you grow up?"',
          good: '"What do you do?" → "How did you end up in that?" → Let them talk',
          why: "Depth over breadth. One thread explored beats five threads skimmed."
        }
      ]
    },
    levity: {
      mistake: "You treat every conversation like it has consequences. You're scanning for mistakes instead of connecting.",
      why_it_backfires: "When you're tense, they're tense. Levity isn't about being funny—it's about reducing social risk. People relax when you signal that imperfection is allowed.",
      examples: [
        {
          context: "When you misspeak",
          bad: "Apologize and move on awkwardly",
          good: '"Okay that came out way weirder than I meant. Let me try again."',
          why: "Self-awareness without self-flagellation. Shows you're human."
        },
        {
          context: "When there's a pause",
          bad: "Panic and ask a random question",
          good: '"I just realized I have no idea where I was going with that."',
          why: "Acknowledging the moment makes it less awkward, not more."
        },
        {
          context: "When they say something serious",
          bad: "Get overly earnest or stay silent",
          good: '"That sounds exhausting. How are you not just screaming into a pillow daily?"',
          why: "Light touch validates without making it heavy. Gives them room to respond how they want."
        }
      ]
    },
    kindness: {
      mistake: "You respond to what people say, not how they feel. You're efficient but not warm.",
      why_it_backfires: "People don't always want solutions. They want to feel heard. When you jump to fixing or advising, you're skipping the step where they feel safe.",
      examples: [
        {
          context: "They share a problem",
          bad: '"Have you tried [solution]?"',
          good: '"That sounds exhausting. How are you even dealing with it?"',
          why: "Acknowledge the feeling first. Solutions come later, if they ask."
        },
        {
          context: "They share excitement",
          bad: '"That\'s cool."',
          good: '"Okay I need to hear more about this. What made you realize you wanted to do it?"',
          why: "Match their energy. Show their excitement matters to you."
        },
        {
          context: "They're venting",
          bad: '"I\'m sure it\'ll work out."',
          good: '"That sounds like a nightmare. What part is the worst?"',
          why: "Don't minimize. Let them fully express it before shifting."
        }
      ]
    }
  };

  const dive = deepDives[weakestComponent];

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-4xl font-bold text-center mb-8">What You're Actually Doing Wrong</h2>

      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50 mb-8">
        <h3 className="text-2xl font-bold mb-4 text-red-400">The Mistake</h3>
        <p className="text-slate-200 text-lg leading-relaxed">{dive.mistake}</p>
      </div>

      <div className="bg-gradient-to-r from-red-900/30 to-orange-900/30 rounded-2xl p-8 border border-red-500/30 mb-12">
        <h3 className="text-2xl font-bold mb-4 text-orange-400">Why It Backfires</h3>
        <p className="text-slate-200 text-lg leading-relaxed">{dive.why_it_backfires}</p>
      </div>

      <h3 className="text-3xl font-bold mb-6 text-center">Situation-Specific Fixes</h3>

      <div className="space-y-6">
        {dive.examples.map((example, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-slate-800/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-slate-700/50"
          >
            <div className="bg-purple-900/30 px-6 py-4 border-b border-slate-700/50">
              <h4 className="text-xl font-bold text-purple-400">{example.context}</h4>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="bg-red-900/20 rounded-xl p-4 border border-red-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <X className="w-5 h-5 text-red-400" />
                  <span className="font-semibold text-red-400">Don't</span>
                </div>
                <p className="text-slate-300">{example.bad}</p>
              </div>

              <div className="bg-green-900/20 rounded-xl p-4 border border-green-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="font-semibold text-green-400">Do</span>
                </div>
                <p className="text-slate-300">{example.good}</p>
              </div>

              <div className="bg-blue-900/20 rounded-xl p-4 border border-blue-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-5 h-5 text-blue-400" />
                  <span className="font-semibold text-blue-400">Why</span>
                </div>
                <p className="text-slate-300">{example.why}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function ReframeStep({ weakestComponent, onNext }) {
  const reframes = {
    topics: {
      old: "I have nothing interesting to say",
      new: "I exit conversations too early",
      explanation: "You have topics. You're just abandoning them before they develop. The problem isn't your content—it's your commitment to the thread.",
      icon: <Target className="w-12 h-12" />
    },
    asking: {
      old: "I'm a good listener",
      new: "I disappear behind my questions",
      explanation: "Listening is important. But when you only ask and never share, people don't know you. You're not connecting—you're conducting research.",
      icon: <MessageSquare className="w-12 h-12" />
    },
    levity: {
      old: "I'm awkward",
      new: "I don't signal safety",
      explanation: "Awkwardness isn't a personality trait. It's what happens when you treat every moment like it has stakes. You need to show imperfection is allowed.",
      icon: <Smile className="w-12 h-12" />
    },
    kindness: {
      old: "I'm helpful",
      new: "I respond to words, not people",
      explanation: "Giving advice isn't the same as making someone feel seen. You're solving when you should be acknowledging. Facts without feelings = cold.",
      icon: <Users className="w-12 h-12" />
    }
  };

  const reframe = reframes[weakestComponent];

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-4xl font-bold text-center mb-8">Reframe Your Self-Story</h2>

      <p className="text-xl text-slate-300 text-center mb-12">
        The story you tell yourself is keeping you stuck.
      </p>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-red-900/30 rounded-2xl p-8 border border-red-500/30"
        >
          <div className="flex items-center gap-3 mb-4">
            <X className="w-8 h-8 text-red-400" />
            <h3 className="text-2xl font-bold text-red-400">Old Story</h3>
          </div>
          <p className="text-2xl font-semibold text-slate-200 mb-4">"{reframe.old}"</p>
          <p className="text-slate-400">This reduces shame but removes responsibility. It makes you passive.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-green-900/30 rounded-2xl p-8 border border-green-500/30"
        >
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="w-8 h-8 text-green-400" />
            <h3 className="text-2xl font-bold text-green-400">New Story</h3>
          </div>
          <p className="text-2xl font-semibold text-slate-200 mb-4">"{reframe.new}"</p>
          <p className="text-slate-400">This is behavioral. It gives you something to change.</p>
        </motion.div>
      </div>

      <div className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 rounded-2xl p-8 border border-purple-500/30">
        <div className="flex items-start gap-6">
          <div className="p-4 bg-purple-500/20 rounded-xl text-purple-400">
            {reframe.icon}
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-4">What This Means</h3>
            <p className="text-slate-200 text-lg leading-relaxed">{reframe.explanation}</p>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <p className="text-slate-300 text-lg">
          You're not broken. You're executing a pattern that doesn't work. 
          <br />
          <span className="text-purple-400 font-semibold">Change the pattern.</span>
        </p>
      </div>
    </div>
  );
}

function ExperimentsStep({ weakestComponent, onNext }) {
  const experiments = {
    topics: [
      {
        situation: "Next conversation with a coworker",
        action: "Instead of 'How was your weekend?', ask 'What's been unexpectedly annoying this week?'",
        notice: "Notice if their response is longer and more specific. Don't judge quality—just notice length and detail.",
        icon: <Activity className="w-6 h-6" />
      },
      {
        situation: "When someone asks you a generic question",
        action: "Give a concrete, specific answer instead of 'good' or 'fine'. Example: 'I've been weirdly obsessed with trying to perfect scrambled eggs.'",
        notice: "Notice if they ask a follow-up. Notice if the conversation continues or dies.",
        icon: <Brain className="w-6 h-6" />
      },
      {
        situation: "In a group setting",
        action: "When someone mentions something vague ('I'm tired'), ask 'What kind of tired? Like physically exhausted or mentally done?'",
        notice: "Notice if they seem relieved someone asked. Notice if others lean in.",
        icon: <Users className="w-6 h-6" />
      }
    ],
    asking: [
      {
        situation: "Next one-on-one conversation",
        action: "Ask one question, then ask only follow-ups for 3 minutes. Don't introduce new topics.",
        notice: "Notice when they relax. Notice when you feel uncomfortable staying on one thread.",
        icon: <Activity className="w-6 h-6" />
      },
      {
        situation: "When someone answers your question",
        action: "Pick one word from their answer and ask about it. Example: They say 'I went hiking.' You say: 'Where do you usually hike?'",
        notice: "Notice if the conversation feels deeper. Notice if they start asking you questions back.",
        icon: <Brain className="w-6 h-6" />
      },
      {
        situation: "When you're about to ask a new question",
        action: "Share something about yourself related to their last answer first. Then ask.",
        notice: "Notice if they seem more interested. Notice if the dynamic shifts from interview to exchange.",
        icon: <MessageSquare className="w-6 h-6" />
      }
    ],
    levity: [
      {
        situation: "Next time there's an awkward pause",
        action: "Say 'Well that was a smooth transition' or 'I just forgot what I was saying' with a light tone.",
        notice: "Notice if they laugh or relax. Notice if the conversation continues more easily after.",
        icon: <Smile className="w-6 h-6" />
      },
      {
        situation: "When you say something that lands weird",
        action: "Acknowledge it: 'That sounded better in my head.' Then move on.",
        notice: "Notice if they seem relieved. Notice if you feel less pressure after acknowledging it.",
        icon: <Activity className="w-6 h-6" />
      },
      {
        situation: "In any conversation that feels tense",
        action: "Make one self-aware observation. Example: 'I'm realizing this sounds way more dramatic than it felt at the time.'",
        notice: "Notice if the vibe shifts. Notice if they start being more casual too.",
        icon: <Brain className="w-6 h-6" />
      }
    ],
    kindness: [
      {
        situation: "When someone shares a problem",
        action: "Say 'That sounds [exhausting/frustrating/complicated]. How are you handling it?' Don't offer advice unless asked.",
        notice: "Notice if they keep talking. Notice if they seem more open.",
        icon: <Users className="w-6 h-6" />
      },
      {
        situation: "When someone shares excitement",
        action: "Match their energy. Say 'That's awesome! What made you decide to do it?' and lean in physically.",
        notice: "Notice if they get more animated. Notice how long they talk.",
        icon: <TrendingUp className="w-6 h-6" />
      },
      {
        situation: "When someone is venting",
        action: "Don't minimize. Ask 'What part is the worst?' and let them go deeper before offering perspective.",
        notice: "Notice when they relax. Notice if they thank you even though you didn't 'help'.",
        icon: <Activity className="w-6 h-6" />
      }
    ]
  };

  const userExperiments = experiments[weakestComponent];

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-4xl font-bold text-center mb-6">Your Micro-Experiments</h2>
      
      <p className="text-xl text-slate-300 text-center mb-12">
        Three tiny actions to test in the next 48 hours. Don't judge results—just notice what changes.
      </p>

      <div className="space-y-6">
        {userExperiments.map((exp, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-slate-800/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-slate-700/50"
          >
            <div className="bg-gradient-to-r from-purple-900/40 to-pink-900/40 px-6 py-4 border-b border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
                  {exp.icon}
                </div>
                <h3 className="text-xl font-bold">Experiment {index + 1}</h3>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <div className="text-sm font-semibold text-purple-400 mb-2">SITUATION</div>
                <p className="text-slate-200 text-lg">{exp.situation}</p>
              </div>

              <div>
                <div className="text-sm font-semibold text-blue-400 mb-2">WHAT TO DO</div>
                <p className="text-slate-200 text-lg">{exp.action}</p>
              </div>

              <div>
                <div className="text-sm font-semibold text-green-400 mb-2">WHAT TO NOTICE</div>
                <p className="text-slate-300">{exp.notice}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 bg-gradient-to-r from-yellow-900/30 to-orange-900/30 rounded-2xl p-6 border border-yellow-500/30">
        <div className="flex items-start gap-4">
          <Zap className="w-8 h-8 text-yellow-400 flex-shrink-0" />
          <div>
            <h3 className="text-xl font-bold mb-2 text-yellow-400">Critical Point</h3>
            <p className="text-slate-300 text-lg">
              These aren't about succeeding. They're about gathering data. 
              You're testing what changes when you adjust one variable. 
              <span className="text-white font-semibold"> Notice. Don't judge.</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReflectionStep({ onNext }) {
  const [reflection, setReflection] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    setSubmitted(true);
    // Simulate API call
    try {
      await fetch('https://backend.com/api/reflections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reflection, timestamp: new Date() })
      });
    } catch (error) {
      console.log('Reflection saved locally');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", duration: 0.8 }}
        className="text-center mb-8"
      >
        <div className="w-32 h-32 mx-auto bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center shadow-2xl shadow-purple-500/50 mb-6">
          <Brain className="w-16 h-16 text-white" />
        </div>
      </motion.div>

      <h2 className="text-5xl font-bold text-center mb-6">Final Reflection</h2>
      
      <p className="text-xl text-slate-300 text-center mb-12">
        One question. Your answer matters more than you think.
      </p>

      <div className="bg-gradient-to-r from-purple-900/40 to-pink-900/40 rounded-2xl p-8 border border-purple-500/30 mb-8">
        <h3 className="text-2xl font-bold mb-6 text-purple-400">
          After you run your experiments, come back and answer:
        </h3>
        
        <p className="text-xl text-slate-200 mb-6">
          "What changed in the other person when you adjusted your pattern?"
        </p>

        {!submitted ? (
          <div className="space-y-4">
            <textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="Write what you noticed. Not what you hoped would happen—what actually changed in them."
              className="w-full h-40 bg-slate-800/50 border border-slate-600 rounded-xl p-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors resize-none"
            />
            
            <button
              onClick={handleSubmit}
              disabled={reflection.trim().length < 20}
              className={`w-full py-4 rounded-xl font-semibold text-lg transition-all ${
                reflection.trim().length < 20
                  ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
              }`}
            >
              Submit Reflection
            </button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-green-900/30 rounded-xl p-6 border border-green-500/30"
          >
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <p className="text-green-400 text-center font-semibold text-xl mb-2">Reflection Saved</p>
            <p className="text-slate-300 text-center">
              Come back to this after your experiments. Pattern recognition is the skill.
            </p>
          </motion.div>
        )}
      </div>

      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50 mb-8">
        <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
          <Eye className="w-8 h-8 text-blue-400" />
          Why This Matters
        </h3>
        <p className="text-slate-300 text-lg leading-relaxed mb-4">
          Most people focus on what they said. You need to focus on what happened in response.
        </p>
        <p className="text-slate-300 text-lg leading-relaxed">
          When you start noticing patterns in how others react to your adjustments, 
          you stop needing scripts. <span className="text-purple-400 font-semibold">You start responding to the moment.</span>
        </p>
      </div>

      <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 rounded-2xl p-8 border border-blue-500/30 text-center">
        <h3 className="text-3xl font-bold mb-4">You're Done With Theory</h3>
        <p className="text-xl text-slate-300 mb-6">
          You know exactly what you're doing wrong, why it happens, and what to try next.
        </p>
        <p className="text-lg text-slate-400 mb-8">
          The only thing left is action. Go test your experiments. Come back with data.
        </p>
        
        <button
          onClick={onNext}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-12 py-4 rounded-xl font-bold text-xl transition-all shadow-lg"
        >
          Complete Module
        </button>
      </div>
    </div>
  );
}