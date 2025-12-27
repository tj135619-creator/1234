import React, { useEffect, useState, useRef } from "react";
import { Send, User, Bot, Loader2, CheckCircle, Download, Sparkles, Calendar, MapPin, Target, Zap } from "lucide-react";

const API_BASE = "https://pythonbackend-74es.onrender.com";

const getApiKeys = async () => {
  return ["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"];
};

export default function AIBRAINPhaseFlow({ onComplete }) {
  const [userId, setUserId] = useState(() => {
  const stored = localStorage.getItem("user_id");
  if (stored) return stored;
  return `user_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
});

  const [phase, setPhase] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [planGenerated, setPlanGenerated] = useState(false);
  const [courseId, setCourseId] = useState(null);
  const [taskOverview, setTaskOverview] = useState(null);

  const [touchpointInput, setTouchpointInput] = useState("");
  const [stressPeakInput, setStressPeakInput] = useState("");
  
  // ✅ FIXED: Phase 1 data structure matches backend expectations
  const [phase1Data, setPhase1Data] = useState({
    main_problem: "",
    where_happens: "",
    how_feels: "",
    impact: ""
  });

  // ✅ FIXED: Phase 2 data structure matches backend expectations
  const [phase2Data, setPhase2Data] = useState({
    skill_assessment: {
      eye_contact: "",
      small_talk: "",
      reading_cues: "",
      active_listening: "",
      humor: ""
    },
    past_attempts: "",
    biggest_struggle: ""
  });

  // ✅ FIXED: Phase 3 data structure matches backend expectations
  const [phase3Data, setPhase3Data] = useState({
    practice_locations: ["", "", ""],
    available_times: "",
    commitment_level: 5,
    top_anxiety: "",
    support_system: ""
  });

  // ✅ FIXED: Phase 4 data structure matches backend expectations
  // At the top of your component where you initialize phase4Data state:
const [phase4Data, setPhase4Data] = useState({
  weekly_schedule: {
    monday: { morning: "", afternoon: "", evening: "", energy: "", stress: "" },
    tuesday: { morning: "", afternoon: "", evening: "", energy: "", stress: "" },
    wednesday: { morning: "", afternoon: "", evening: "", energy: "", stress: "" },
    thursday: { morning: "", afternoon: "", evening: "", energy: "", stress: "" },
    friday: { morning: "", afternoon: "", evening: "", energy: "", stress: "" },
    saturday: { morning: "", afternoon: "", evening: "", energy: "", stress: "" },
    sunday: { morning: "", afternoon: "", evening: "", energy: "", stress: "" }
  },
  existing_social_touchpoints: [],
  stress_peaks: [],
  // NEW FIELDS FOR MULTI-STEP FORM:
  energy_peak: "",
  stressed_days: [],
  morning_routine: "",
  lunch_routine: "",
  evening_routine: "",
  work_touchpoints: [],
  regular_social: "",
  hardest_time: ""
});

const [phase4Step, setPhase4Step] = useState(1); // ✅ ADD THIS LINE


  const messagesEndRef = useRef(null);

  useEffect(() => {
    initSession();
  }, []);

  useEffect(() => {
  localStorage.setItem("user_id", userId);
}, [userId]);

  const initSession = async (customSessionId = null) => {
    setLoading(true);
    setErrorText(null);
    
    const idToUse = customSessionId || userId;
    
    try {
      console.log("🔄 Initializing session:", idToUse);
      
      const res = await fetch(`${API_BASE}/init-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          user_id: idToUse
        })
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`HTTP ${res.status} — ${txt}`);
      }

      const data = await res.json();
      console.log("✅ Session initialized:", data);
      
      // ✅ Verify session was created
      if (!data.success) {
        throw new Error("Session initialization failed");
      }
      
      setPhase(data.phase || 1);
      
      if (data.message) {
        pushBotMessage(data.message);
      }
    } catch (err) {
      console.error("❌ Init error:", err);
      setErrorText(String(err?.message || err));
      pushBotMessage(`⚠️ Init error: ${String(err?.message || err)}`);
    } finally {
      setLoading(false);
    }
  };


  const restartSession = () => {
  const newId = `user_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  console.log("🔄 Restarting with new session:", newId);
  setUserId(newId);
  setPhase(1);
  setMessages([]);
  setPlanGenerated(false);
  setCourseId(null);
  setTaskOverview(null);
  setErrorText(null);
  
  // Reset all phase data
  setPhase1Data({
    main_problem: "",
    where_happens: "",
    how_feels: "",
    impact: ""
  });
  
  setPhase2Data({
    skill_assessment: {
      eye_contact: "",
      small_talk: "",
      reading_cues: "",
      active_listening: "",
      humor: ""
    },
    past_attempts: "",
    biggest_struggle: ""
  });
  
  setPhase3Data({
    practice_locations: ["", "", ""],
    available_times: "",
    commitment_level: 5,
    top_anxiety: "",
    support_system: ""
  });
  
  setPhase4Data({
    weekly_schedule: {
      monday: { morning: "", afternoon: "", evening: "", energy: "", stress: "" },
      tuesday: { morning: "", afternoon: "", evening: "", energy: "", stress: "" },
      wednesday: { morning: "", afternoon: "", evening: "", energy: "", stress: "" },
      thursday: { morning: "", afternoon: "", evening: "", energy: "", stress: "" },
      friday: { morning: "", afternoon: "", evening: "", energy: "", stress: "" },
      saturday: { morning: "", afternoon: "", evening: "", energy: "", stress: "" },
      sunday: { morning: "", afternoon: "", evening: "", energy: "", stress: "" }
    },
    existing_social_touchpoints: [],
    stress_peaks: [],
    energy_peak: "",
    stressed_days: [],
    morning_routine: "",
    lunch_routine: "",
    evening_routine: "",
    work_touchpoints: [],
    regular_social: "",
    hardest_time: ""
  });
  
  initSession(newId);
};

  function pushBotMessage(text) {
    setMessages(prev => [...prev, { 
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`, 
      role: "assistant", 
      content: text, 
      timestamp: Date.now() 
    }]);
  }

  function pushUserMessage(text) {
    setMessages(prev => [...prev, { 
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`, 
      role: "user", 
      content: text, 
      timestamp: Date.now() 
    }]);
  }

 const submitPhase1 = async (e) => {
  e?.preventDefault?.();
  setLoading(true);
  setErrorText(null);
  
  try {
    // ✅ FORCE SESSION CHECK BEFORE SUBMITTING
    console.log("🔍 Checking session before Phase 1 submit...");
    
    const initRes = await fetch(`${API_BASE}/init-session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        user_id: userId
      })
    });

    if (!initRes.ok) {
      const txt = await initRes.text();
      throw new Error(`Session init failed: ${txt}`);
    }

    const initData = await initRes.json();
    console.log("✅ Session confirmed:", initData);

    // Now submit the phase data
    const apiKeys = await getApiKeys();
    const apiKey = apiKeys[apiKeys.length - 1];

    const submissionSummary = `Problem: ${phase1Data.main_problem}\nWhere: ${phase1Data.where_happens}\nFeeling: ${phase1Data.how_feels}\nImpact: ${phase1Data.impact}`;
    pushUserMessage(submissionSummary);

    console.log("📤 Submitting Phase 1:", phase1Data);

    const res = await fetch(`${API_BASE}/submit-phase-data`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        phase: 1,
        form_data: phase1Data,
        api_key: apiKey
      })
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`HTTP ${res.status} — ${txt}`);
    }

    const data = await res.json();
    console.log("✅ Phase 1 response:", data);
    
    if (data.response) {
      pushBotMessage(data.response);
    }
    
    if (data.ready_for_next_phase && data.phase) {
      console.log(`✅ Advancing to phase ${data.phase}`);
      setPhase(data.phase);
    }
  } catch (err) {
    console.error("❌ Submit error:", err);
    setErrorText(String(err?.message || err));
    pushBotMessage(`⚠️ Submit error: ${String(err?.message || err)}`);
  } finally {
    setLoading(false);
  }
};

const submitPhase2 = async (e) => {
  e?.preventDefault?.();
  setLoading(true);
  setErrorText(null);
  
  try {
    // ✅ FORCE SESSION CHECK BEFORE SUBMITTING
    console.log("🔍 Checking session before Phase 2 submit...");
    
    const initRes = await fetch(`${API_BASE}/init-session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        user_id: userId
      })
    });

    if (!initRes.ok) {
      const txt = await initRes.text();
      throw new Error(`Session init failed: ${txt}`);
    }

    const initData = await initRes.json();
    console.log("✅ Session confirmed:", initData);

    // Now submit the phase data
    const apiKeys = await getApiKeys();
    const apiKey = apiKeys[apiKeys.length - 1];

    const submissionSummary = `Past attempts: ${phase2Data.past_attempts}\nSkills: Eye contact=${phase2Data.skill_assessment.eye_contact}, Small talk=${phase2Data.skill_assessment.small_talk}\nStruggle: ${phase2Data.biggest_struggle}`;
    pushUserMessage(submissionSummary);

    console.log("📤 Submitting Phase 2:", phase2Data);

    const res = await fetch(`${API_BASE}/submit-phase-data`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        phase: 2,
        form_data: phase2Data,
        api_key: apiKey
      })
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`HTTP ${res.status} — ${txt}`);
    }

    const data = await res.json();
    console.log("✅ Phase 2 response:", data);
    
    if (data.response) {
      pushBotMessage(data.response);
    }
    
    if (data.ready_for_next_phase) {
      setPhase(data.phase || 3);
    }
  } catch (err) {
    console.error("❌ Submit error:", err);
    setErrorText(String(err?.message || err));
    pushBotMessage(`⚠️ Submit error: ${String(err?.message || err)}`);
  } finally {
    setLoading(false);
  }
};

const submitPhase3 = async (e) => {
  e?.preventDefault?.();
  setLoading(true);
  setErrorText(null);
  
  try {
    // ✅ FORCE SESSION CHECK BEFORE SUBMITTING
    console.log("🔍 Checking session before Phase 3 submit...");
    
    const initRes = await fetch(`${API_BASE}/init-session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        user_id: userId
      })
    });

    if (!initRes.ok) {
      const txt = await initRes.text();
      throw new Error(`Session init failed: ${txt}`);
    }

    const initData = await initRes.json();
    console.log("✅ Session confirmed:", initData);

    // Now submit the phase data
    const apiKeys = await getApiKeys();
    const apiKey = apiKeys[apiKeys.length - 1];

    const locationsList = phase3Data.practice_locations.filter(l => l.trim());
    const submissionSummary = `Locations: ${locationsList.join(", ")}\nTimes: ${phase3Data.available_times}\nCommitment: ${phase3Data.commitment_level}/10\nTop anxiety: ${phase3Data.top_anxiety}`;
    pushUserMessage(submissionSummary);

    console.log("📤 Submitting Phase 3:", phase3Data);

    const res = await fetch(`${API_BASE}/submit-phase-data`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        phase: 3,
        form_data: phase3Data,
        api_key: apiKey
      })
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`HTTP ${res.status} — ${txt}`);
    }

    const data = await res.json();
    console.log("✅ Phase 3 response:", data);
    
    if (data.response) {
      pushBotMessage(data.response);
    }
    
    if (data.ready_for_next_phase) {
      setPhase(data.phase || 4);
    }
  } catch (err) {
    console.error("❌ Submit error:", err);
    setErrorText(String(err?.message || err));
    pushBotMessage(`⚠️ Submit error: ${String(err?.message || err)}`);
  } finally {
    setLoading(false);
  }
};

const submitPhase4 = async (e) => {
  e?.preventDefault?.();
  setLoading(true);
  setErrorText(null);
  
  try {
    // ✅ FORCE SESSION CHECK BEFORE SUBMITTING
    console.log("🔍 Checking session before Phase 4 submit...");
    
    const initRes = await fetch(`${API_BASE}/init-session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        user_id: userId
      })
    });

    if (!initRes.ok) {
      const txt = await initRes.text();
      throw new Error(`Session init failed: ${txt}`);
    }

    const initData = await initRes.json();
    console.log("✅ Session confirmed:", initData);

    // Now submit the phase data
    const apiKeys = await getApiKeys();
    const apiKey = apiKeys[apiKeys.length - 1];

    const submissionSummary = `Schedule: Detailed weekly breakdown\nSocial touchpoints: ${phase4Data.existing_social_touchpoints.join(", ")}\nStress peaks: ${phase4Data.stress_peaks.join(", ")}`;
    pushUserMessage(submissionSummary);

    console.log("📤 Submitting Phase 4:", phase4Data);
    console.log("🆔 User ID being sent:", userId);

    const res = await fetch(`${API_BASE}/submit-phase-data`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        phase: 4,
        form_data: phase4Data,
        api_key: apiKey
      })
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`HTTP ${res.status} — ${txt}`);
    }

    const data = await res.json();
    console.log("✅ Phase 4 response:", data);
    
    if (data.response) {
      pushBotMessage(data.response);
    }
    
    if (data.ready_for_next_phase) {
      setPhase(data.phase || 5);
      pushBotMessage("Ready for confirmation. Review everything and let me know if it looks good or if you want to change anything.");
    }
  } catch (err) {
    console.error("❌ Submit error:", err);
    setErrorText(String(err?.message || err));
    pushBotMessage(`⚠️ Submit error: ${String(err?.message || err)}`);
  } finally {
    setLoading(false);
  }
};

const sendChatMessage = async () => {
  if (!inputMessage.trim() || isLoadingChat) return;
  
  pushUserMessage(inputMessage);
  const messageToSend = inputMessage;
  setInputMessage("");
  setIsLoadingChat(true);

  try {
    // ✅ FORCE SESSION CHECK BEFORE SENDING CHAT
    console.log("🔍 Checking session before chat message...");
    
    const initRes = await fetch(`${API_BASE}/init-session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        user_id: userId
      })
    });

    if (!initRes.ok) {
      const txt = await initRes.text();
      throw new Error(`Session init failed: ${txt}`);
    }

    const initData = await initRes.json();
    console.log("✅ Session confirmed:", initData);

    // Now send the chat message
    const apiKeys = await getApiKeys();
    const apiKey = apiKeys[apiKeys.length - 1];

    const res = await fetch(`${API_BASE}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        user_id: userId,
        message: messageToSend, 
        api_key: apiKey 
      })
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`HTTP ${res.status} — ${txt}`);
    }

    const data = await res.json();
    const botResp = data.response || data.message || JSON.stringify(data);
    pushBotMessage(botResp);

    if (data.plan_generated || data.phase >= 6 || data.complete) {
      setPlanGenerated(true);
      setCourseId(data.course_id);
      setTaskOverview(data.task_overview);
      setPhase(6);
    }
  } catch (err) {
    console.error("❌ Chat error:", err);
    setErrorText(String(err?.message || err));
    pushBotMessage(`⚠️ Chat error: ${String(err?.message || err)}`);
  } finally {
    setIsLoadingChat(false);
  }
};


const handleExportSession = () => {
  try {
    const exportData = {
      user_id: userId,  // ✅ Changed from session_id
      timestamp: new Date().toISOString(),
      messages,
      currentPhase: phase,
      courseId,
      taskOverview
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `session-${userId}.json`;  // ✅ Changed filename
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    pushBotMessage("✅ Session exported.");
  } catch (err) {
    console.error("export err", err);
    pushBotMessage(`⚠️ Export failed: ${String(err)}`);
  }
};

  useEffect(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), [messages]);

  const renderPhase1Form = () => (
  <form onSubmit={submitPhase1} className="space-y-6">
    <div>
      <label className="block text-base font-medium mb-3">What's hardest for you?</label>
      <div className="space-y-2">
        {[
          "I don't know what to say",
          "I freeze when people talk to me",
          "I can't keep conversations going",
          "I avoid talking to people"
        ].map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setPhase1Data({ ...phase1Data, main_problem: option })}
            className={`w-full p-3 rounded-xl text-left transition ${
              phase1Data.main_problem === option
                ? 'bg-purple-600 border-2 border-purple-400'
                : 'bg-white/10 border border-white/20 hover:bg-white/20'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>

    <div>
      <label className="block text-base font-medium mb-3">Where does this happen?</label>
      <input
        type="text"
        value={phase1Data.where_happens}
        onChange={(e) => setPhase1Data({ ...phase1Data, where_happens: e.target.value })}
        placeholder="Work, school, gym..."
        className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400"
        required
      />
    </div>

    <div>
      <label className="block text-base font-medium mb-3">How does this feel?</label>
      <div className="space-y-2">
        {[
          "Anxious and stressed",
          "Embarrassed and ashamed",
          "Frustrated and angry",
          "Lonely and isolated"
        ].map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setPhase1Data({ ...phase1Data, how_feels: option })}
            className={`w-full p-3 rounded-xl text-left transition ${
              phase1Data.how_feels === option
                ? 'bg-purple-600 border-2 border-purple-400'
                : 'bg-white/10 border border-white/20 hover:bg-white/20'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>

    <div>
      <label className="block text-base font-medium mb-3">What has this cost you?</label>
      <div className="space-y-2">
        {[
          "Missing out on friendships",
          "Feeling left out at work/school",
          "Avoiding social events",
          "Feeling invisible"
        ].map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setPhase1Data({ ...phase1Data, impact: option })}
            className={`w-full p-3 rounded-xl text-left transition ${
              phase1Data.impact === option
                ? 'bg-purple-600 border-2 border-purple-400'
                : 'bg-white/10 border border-white/20 hover:bg-white/20'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>

    <button
      type="submit"
      className="w-full py-4 bg-purple-600 rounded-xl font-semibold hover:bg-purple-700 transition text-lg"
      disabled={loading || !phase1Data.main_problem || !phase1Data.where_happens || !phase1Data.how_feels || !phase1Data.impact}
    >
      {loading ? "..." : "Next"}
    </button>
  </form>
);

const renderPhase2Form = () => (
  <form onSubmit={submitPhase2} className="space-y-6">
    <div>
      <label className="block text-base font-medium mb-3">What have you tried before?</label>
      <div className="space-y-2">
        {[
          "Nothing, this is my first time",
          "Watched videos or read articles",
          "Tried therapy or counseling",
          "Tried but nothing worked"
        ].map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setPhase2Data({ ...phase2Data, past_attempts: option })}
            className={`w-full p-3 rounded-xl text-left transition ${
              phase2Data.past_attempts === option
                ? 'bg-purple-600 border-2 border-purple-400'
                : 'bg-white/10 border border-white/20 hover:bg-white/20'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>

    <div>
      <label className="block text-base font-medium mb-3">Rate yourself (1 = terrible, 5 = good)</label>
      <div className="space-y-3">
        {[
          { key: "eye_contact", label: "Making eye contact" },
          { key: "small_talk", label: "Small talk" },
          { key: "reading_cues", label: "Reading body language" }
        ].map(({ key, label }) => (
          <div key={key} className="bg-white/5 p-3 rounded-lg">
            <div className="text-sm mb-2">{label}</div>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setPhase2Data({ 
                    ...phase2Data, 
                    skill_assessment: { ...phase2Data.skill_assessment, [key]: n } 
                  })}
                  className={`flex-1 py-2 rounded-lg font-semibold transition ${
                    phase2Data.skill_assessment[key] === n 
                      ? 'bg-purple-600' 
                      : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>

    <div>
      <label className="block text-base font-medium mb-3">What's your biggest struggle?</label>
      <div className="space-y-2">
        {[
          "Starting conversations",
          "Keeping conversations going",
          "Making eye contact",
          "Not feeling awkward"
        ].map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setPhase2Data({ ...phase2Data, biggest_struggle: option })}
            className={`w-full p-3 rounded-xl text-left transition ${
              phase2Data.biggest_struggle === option
                ? 'bg-purple-600 border-2 border-purple-400'
                : 'bg-white/10 border border-white/20 hover:bg-white/20'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>

    <button
      type="submit"
      className="w-full py-4 bg-purple-600 rounded-xl font-semibold hover:bg-purple-700 transition text-lg"
      disabled={loading || !phase2Data.past_attempts || !phase2Data.biggest_struggle || 
                Object.keys(phase2Data.skill_assessment).length < 3}
    >
      {loading ? "..." : "Next"}
    </button>
  </form>
);

const renderPhase3Form = () => (
  <form onSubmit={submitPhase3} className="space-y-6">
    <div>
      <label className="block text-base font-medium mb-3">Where do you go regularly? (Pick 2)</label>
      <p className="text-sm text-gray-400 mb-3">Places where you see the same people</p>
      {[0, 1].map((idx) => (
        <input
          key={idx}
          type="text"
          value={phase3Data.practice_locations[idx] || ''}
          onChange={(e) => {
            const newLocs = [...phase3Data.practice_locations];
            newLocs[idx] = e.target.value;
            setPhase3Data({ ...phase3Data, practice_locations: newLocs });
          }}
          placeholder={idx === 0 ? "E.g., Coffee shop" : "E.g., Gym"}
          className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 mb-2"
          required
        />
      ))}
    </div>

    <div>
      <label className="block text-base font-medium mb-3">When can you practice for 5 minutes?</label>
      <div className="space-y-2">
        {[
          "Mornings (before work/school)",
          "Lunch break",
          "After work/school",
          "Weekends"
        ].map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setPhase3Data({ ...phase3Data, available_times: option })}
            className={`w-full p-3 rounded-xl text-left transition ${
              phase3Data.available_times === option
                ? 'bg-purple-600 border-2 border-purple-400'
                : 'bg-white/10 border border-white/20 hover:bg-white/20'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>

    <div>
      <label className="block text-base font-medium mb-3">How committed are you? (1-10)</label>
      <input
        type="range"
        min="1"
        max="10"
        value={phase3Data.commitment_level}
        onChange={(e) => setPhase3Data({ ...phase3Data, commitment_level: parseInt(e.target.value) })}
        className="w-full"
      />
      <div className="text-center text-3xl font-bold mt-2">{phase3Data.commitment_level}/10</div>
    </div>

    <div>
      <label className="block text-base font-medium mb-3">What scares you most?</label>
      <div className="space-y-2">
        {[
          "People will think I'm weird",
          "I'll say something stupid",
          "I'll freeze up completely",
          "People will reject me"
        ].map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setPhase3Data({ ...phase3Data, top_anxiety: option })}
            className={`w-full p-3 rounded-xl text-left transition ${
              phase3Data.top_anxiety === option
                ? 'bg-purple-600 border-2 border-purple-400'
                : 'bg-white/10 border border-white/20 hover:bg-white/20'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>

    <div>
      <label className="block text-base font-medium mb-3">Do you have anyone supporting you?</label>
      <input
        type="text"
        value={phase3Data.support_system}
        onChange={(e) => setPhase3Data({ ...phase3Data, support_system: e.target.value })}
        placeholder="Friend, partner, family... or just say 'no one'"
        className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400"
      />
    </div>

    <button
      type="submit"
      className="w-full py-4 bg-purple-600 rounded-xl font-semibold hover:bg-purple-700 transition text-lg"
      disabled={loading || !phase3Data.practice_locations[0] || !phase3Data.practice_locations[1] || 
                !phase3Data.available_times || !phase3Data.top_anxiety}
    >
      {loading ? "..." : "Next"}
    </button>
  </form>
);

const renderPhase4Form = () => {
  const totalSteps = 3;

  // Step 1: Energy & Stress Patterns
  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="text-sm text-gray-400 mb-2">Step 1 of {totalSteps}</div>
        <h3 className="text-xl font-bold">When do you have energy?</h3>
        <p className="text-sm text-gray-400 mt-2">This helps us schedule practice at the right times</p>
      </div>

      <div>
        <label className="block text-base font-medium mb-3">What time of day are you most energized?</label>
        <div className="space-y-2">
          {[
            { value: "morning", label: "Morning (6am-12pm)", icon: "🌅" },
            { value: "afternoon", label: "Afternoon (12pm-6pm)", icon: "☀️" },
            { value: "evening", label: "Evening (6pm-10pm)", icon: "🌆" }
          ].map(({ value, label, icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setPhase4Data({
                ...phase4Data,
                energy_peak: value
              })}
              className={`w-full p-4 rounded-xl text-left transition flex items-center gap-3 ${
                phase4Data.energy_peak === value
                  ? 'bg-purple-600 border-2 border-purple-400'
                  : 'bg-white/10 border border-white/20 hover:bg-white/20'
              }`}
            >
              <span className="text-2xl">{icon}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-base font-medium mb-3">Which days are you most stressed?</label>
        <p className="text-sm text-gray-400 mb-3">Select all that apply</p>
        <div className="grid grid-cols-2 gap-2">
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
            const isSelected = phase4Data.stressed_days?.includes(day) || false;
            return (
              <button
                key={day}
                type="button"
                onClick={() => {
                  const current = phase4Data.stressed_days || [];
                  const updated = isSelected
                    ? current.filter(d => d !== day)
                    : [...current, day];
                  setPhase4Data({
                    ...phase4Data,
                    stressed_days: updated
                  });
                }}
                className={`p-3 rounded-lg transition ${
                  isSelected
                    ? 'bg-red-600 border-2 border-red-400'
                    : 'bg-white/10 border border-white/20 hover:bg-white/20'
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        onClick={() => setPhase4Step(2)}
        disabled={!phase4Data.energy_peak || !phase4Data.stressed_days?.length}
        className="w-full py-4 bg-purple-600 rounded-xl font-semibold hover:bg-purple-700 transition text-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
  );

  // Step 2: Your Routine
  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="text-sm text-gray-400 mb-2">Step 2 of {totalSteps}</div>
        <h3 className="text-xl font-bold">Your typical day</h3>
        <p className="text-sm text-gray-400 mt-2">Where do you already go regularly?</p>
      </div>

      <div>
        <label className="block text-base font-medium mb-3">Morning routine</label>
        <div className="space-y-2">
          {[
            "Coffee shop on commute",
            "Gym before work",
            "Breakfast spot",
            "Walk/commute",
            "None - go straight to work/school"
          ].map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setPhase4Data({
                ...phase4Data,
                morning_routine: option
              })}
              className={`w-full p-3 rounded-xl text-left transition ${
                phase4Data.morning_routine === option
                  ? 'bg-purple-600 border-2 border-purple-400'
                  : 'bg-white/10 border border-white/20 hover:bg-white/20'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-base font-medium mb-3">Lunch time</label>
        <div className="space-y-2">
          {[
            "Cafeteria/food court with coworkers",
            "Grab food alone outside",
            "Eat at desk",
            "Gym during lunch",
            "No real lunch break"
          ].map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setPhase4Data({
                ...phase4Data,
                lunch_routine: option
              })}
              className={`w-full p-3 rounded-xl text-left transition ${
                phase4Data.lunch_routine === option
                  ? 'bg-purple-600 border-2 border-purple-400'
                  : 'bg-white/10 border border-white/20 hover:bg-white/20'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-base font-medium mb-3">After work/school</label>
        <div className="space-y-2">
          {[
            "Gym/fitness",
            "Grocery shopping",
            "Coffee shop or cafe",
            "Straight home",
            "Varies day to day"
          ].map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setPhase4Data({
                ...phase4Data,
                evening_routine: option
              })}
              className={`w-full p-3 rounded-xl text-left transition ${
                phase4Data.evening_routine === option
                  ? 'bg-purple-600 border-2 border-purple-400'
                  : 'bg-white/10 border border-white/20 hover:bg-white/20'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setPhase4Step(1)}
          className="flex-1 py-4 bg-white/10 rounded-xl font-semibold hover:bg-white/20 transition"
        >
          Back
        </button>
        <button
          type="button"
          onClick={() => setPhase4Step(3)}
          disabled={!phase4Data.morning_routine || !phase4Data.lunch_routine || !phase4Data.evening_routine}
          className="flex-1 py-4 bg-purple-600 rounded-xl font-semibold hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );

  // Step 3: Social Touchpoints
  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="text-sm text-gray-400 mb-2">Step 3 of {totalSteps}</div>
        <h3 className="text-xl font-bold">Where do you see people?</h3>
        <p className="text-sm text-gray-400 mt-2">Times you're already around others</p>
      </div>

      <div>
        <label className="block text-base font-medium mb-3">At work/school, when do you interact?</label>
        <div className="space-y-2">
          {[
            "Morning standup or team meeting",
            "Lunch break with coworkers",
            "Hallway/break room encounters",
            "End of day check-ins",
            "I mostly work alone"
          ].map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                const current = phase4Data.work_touchpoints || [];
                const isSelected = current.includes(option);
                const updated = isSelected
                  ? current.filter(t => t !== option)
                  : [...current, option];
                setPhase4Data({
                  ...phase4Data,
                  work_touchpoints: updated
                });
              }}
              className={`w-full p-3 rounded-xl text-left transition ${
                phase4Data.work_touchpoints?.includes(option)
                  ? 'bg-purple-600 border-2 border-purple-400'
                  : 'bg-white/10 border border-white/20 hover:bg-white/20'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                  phase4Data.work_touchpoints?.includes(option)
                    ? 'border-purple-300 bg-purple-500'
                    : 'border-white/40'
                }`}>
                  {phase4Data.work_touchpoints?.includes(option) && '✓'}
                </div>
                {option}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-base font-medium mb-3">Do you have any regular social events?</label>
        <p className="text-sm text-gray-400 mb-3">Weekly classes, meetups, sports, etc.</p>
        <div className="space-y-2">
          {[
            "Yes - weekly class or group",
            "Yes - casual weekly hangout",
            "Sometimes - monthly events",
            "No regular social events"
          ].map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setPhase4Data({
                ...phase4Data,
                regular_social: option
              })}
              className={`w-full p-3 rounded-xl text-left transition ${
                phase4Data.regular_social === option
                  ? 'bg-purple-600 border-2 border-purple-400'
                  : 'bg-white/10 border border-white/20 hover:bg-white/20'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-base font-medium mb-3">Hardest time of week for you?</label>
        <input
          type="text"
          value={phase4Data.hardest_time || ""}
          onChange={(e) => setPhase4Data({
            ...phase4Data,
            hardest_time: e.target.value
          })}
          placeholder="E.g., Monday mornings, Friday afternoons..."
          className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400"
        />
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setPhase4Step(2)}
          className="flex-1 py-4 bg-white/10 rounded-xl font-semibold hover:bg-white/20 transition"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={loading || !phase4Data.work_touchpoints?.length || !phase4Data.regular_social}
          className="flex-1 py-4 bg-green-600 rounded-xl font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "..." : "Create My Plan"}
        </button>
      </div>
    </div>
  );

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      // Transform the collected data to match backend expectations
      const transformedData = {
        weekly_schedule: {
          // Convert collected data into expected format
          monday: {
            morning: phase4Data.morning_routine,
            afternoon: phase4Data.lunch_routine,
            evening: phase4Data.evening_routine,
            energy: phase4Data.energy_peak === 'morning' ? 'high' : 'medium',
            stress: phase4Data.stressed_days?.includes('Monday') ? 'high' : 'low'
          },
          // Repeat for other days with similar logic
          tuesday: {
            morning: phase4Data.morning_routine,
            afternoon: phase4Data.lunch_routine,
            evening: phase4Data.evening_routine,
            energy: phase4Data.energy_peak === 'afternoon' ? 'high' : 'medium',
            stress: phase4Data.stressed_days?.includes('Tuesday') ? 'high' : 'low'
          },
          wednesday: {
            morning: phase4Data.morning_routine,
            afternoon: phase4Data.lunch_routine,
            evening: phase4Data.evening_routine,
            energy: phase4Data.energy_peak === 'morning' ? 'high' : 'medium',
            stress: phase4Data.stressed_days?.includes('Wednesday') ? 'high' : 'low'
          },
          thursday: {
            morning: phase4Data.morning_routine,
            afternoon: phase4Data.lunch_routine,
            evening: phase4Data.evening_routine,
            energy: phase4Data.energy_peak === 'afternoon' ? 'high' : 'medium',
            stress: phase4Data.stressed_days?.includes('Thursday') ? 'high' : 'low'
          },
          friday: {
            morning: phase4Data.morning_routine,
            afternoon: phase4Data.lunch_routine,
            evening: phase4Data.evening_routine,
            energy: phase4Data.energy_peak === 'evening' ? 'high' : 'medium',
            stress: phase4Data.stressed_days?.includes('Friday') ? 'high' : 'low'
          },
          saturday: {
            morning: phase4Data.morning_routine,
            afternoon: phase4Data.lunch_routine,
            evening: phase4Data.evening_routine,
            energy: phase4Data.energy_peak === 'morning' ? 'high' : 'medium',
            stress: phase4Data.stressed_days?.includes('Saturday') ? 'high' : 'low'
          },
          sunday: {
            morning: phase4Data.morning_routine,
            afternoon: phase4Data.lunch_routine,
            evening: phase4Data.evening_routine,
            energy: phase4Data.energy_peak === 'evening' ? 'high' : 'medium',
            stress: phase4Data.stressed_days?.includes('Sunday') ? 'high' : 'low'
          }
        },
        existing_social_touchpoints: phase4Data.work_touchpoints || [],
        stress_peaks: [phase4Data.hardest_time].filter(Boolean)
      };
      
      submitPhase4({
  ...phase4Data,
  weekly_schedule: transformedData.weekly_schedule,
  existing_social_touchpoints: transformedData.existing_social_touchpoints,
  stress_peaks: transformedData.stress_peaks
});
    }} className="max-w-2xl mx-auto">
      {phase4Step === 1 && renderStep1()}
   {phase4Step === 2 && renderStep2()}
   {phase4Step === 3 && renderStep3()}
    </form>
  );
};


  const renderPlanSummary = () => {
    if (!taskOverview) return null;

    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 backdrop-blur-xl border border-white/20 p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="w-8 h-8 text-green-400" />
            <h2 className="text-2xl font-bold">Your 5-Day Plan is Ready! 🎉</h2>
          </div>
          
          <div className="space-y-3">
            {taskOverview.days?.slice(0, 5).map((day, idx) => (
              <div key={idx} className="bg-white/10 p-4 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center font-bold">
                    {day.day}
                  </div>
                  <h3 className="font-semibold">{day.title}</h3>
                </div>
                {day.tasks?.map((task, tidx) => (
                  <p key={tidx} className="text-sm text-gray-300 ml-11">{task.description}</p>
                ))}
              </div>
            ))}
          </div>

          <button
            onClick={() => onComplete?.()}
            className="w-full mt-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition"
          >
            Next Step
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-purple-950 to-pink-950 text-white">
      <div className="flex items-center justify-between p-4 bg-black/40 backdrop-blur-md border-b border-white/20 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg">Jordan</h1>
            <p className="text-xs text-gray-300">Your AI Coach — Phase {phase}</p>
          </div>
        </div>
        <p className="text-xs text-gray-400">{messages.length} messages</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <div className="max-w-3xl mx-auto space-y-3">
          {messages.map(msg => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${msg.role === 'user' ? 'bg-gray-700' : 'bg-gradient-to-br from-purple-500 to-pink-500'}`}>
                {msg.role === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
              </div>
              <div className="flex-1">
                <div className={`${msg.role === 'user' ? 'bg-white/10' : 'bg-white/5'} backdrop-blur-xl border border-white/10 p-3 rounded-2xl`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
            </div>
          ))}

          {isLoadingChat && (
            <div className="flex gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              </div>
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-3 rounded-2xl">
                <span>Jordan is thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {phase === 1 && (
          <div className="max-w-2xl mx-auto bg-white/5 p-6 rounded-2xl border border-white/10 mt-4">
            <h2 className="font-semibold text-xl mb-4 flex items-center gap-2">
              <Target className="w-6 h-6" />
              Phase 1: What's the Problem?
            </h2>
            {errorText && <pre className="text-xs p-2 bg-red-900/40 rounded mb-4 whitespace-pre-wrap">{errorText}</pre>}
            {renderPhase1Form()}
          </div>
        )}

        {phase === 2 && (
          <div className="max-w-2xl mx-auto bg-white/5 p-6 rounded-2xl border border-white/10 mt-4">
            <h2 className="font-semibold text-xl mb-4 flex items-center gap-2">
              <Zap className="w-6 h-6" />
              Phase 2: Skills Assessment
            </h2>
            {errorText && <pre className="text-xs p-2 bg-red-900/40 rounded mb-4 whitespace-pre-wrap">{errorText}</pre>}
            {renderPhase2Form()}
          </div>
        )}

        {phase === 3 && (
          <div className="max-w-2xl mx-auto bg-white/5 p-6 rounded-2xl border border-white/10 mt-4">
            <h2 className="font-semibold text-xl mb-4 flex items-center gap-2">
              <MapPin className="w-6 h-6" />
              Phase 3: Logistics & Commitment
            </h2>
            {errorText && <pre className="text-xs p-2 bg-red-900/40 rounded mb-4 whitespace-pre-wrap">{errorText}</pre>}
            {renderPhase3Form()}
          </div>
        )}

        {phase === 4 && (
          <div className="max-w-2xl mx-auto bg-white/5 p-6 rounded-2xl border border-white/10 mt-4">
            <h2 className="font-semibold text-xl mb-4 flex items-center gap-2">
              <Calendar className="w-6 h-6" />
              Phase 4: Schedule Optimization
            </h2>
            {errorText && <pre className="text-xs p-2 bg-red-900/40 rounded mb-4 whitespace-pre-wrap">{errorText}</pre>}
            {renderPhase4Form()}
          </div>
        )}

        {phase === 5 && !planGenerated && (
          <div className="max-w-2xl mx-auto bg-white/5 p-6 rounded-2xl border border-white/10 mt-4">
            <h2 className="font-semibold text-xl mb-4">Phase 5: Confirmation</h2>
            <p className="text-sm text-gray-300">Review the summary above and confirm with Jordan, or ask for changes.</p>
          </div>
        )}

        {phase === 6 && planGenerated && renderPlanSummary()}
      </div>

      <div className="p-4 bg-black/40 backdrop-blur-md border-t border-white/20">
        {phase >= 5 ? (
          <div>
            <div className="mb-3 flex gap-2">
              <button 
                onClick={handleExportSession} 
                className="py-2 px-4 bg-white/10 rounded-xl hover:bg-white/20 transition flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export Session
              </button>
              {planGenerated && (
                <button 
                  onClick={() => onComplete?.()} 
                  className="py-2 px-4 bg-green-600 rounded-xl hover:bg-green-700 transition flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Next Step !
                </button>
              )}
            </div>

            <div className="flex gap-2">
              <textarea
                value={inputMessage}
                onChange={e => setInputMessage(e.target.value)}
                onKeyPress={e => { 
                  if (e.key === 'Enter' && !e.shiftKey) { 
                    e.preventDefault(); 
                    sendChatMessage(); 
                  } 
                }}
                placeholder="Type a message to Jordan..."
                className="flex-1 p-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none resize-none"
                rows={1}
              />
              <button 
                onClick={sendChatMessage} 
                disabled={!inputMessage.trim() || isLoadingChat} 
                className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl disabled:opacity-40 hover:from-purple-600 hover:to-pink-600 transition"
              >
                <Send className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2 justify-between items-center">
            <div className="text-xs text-gray-300">Phase {phase} of 4 — Frontend forms</div>
            <div className="flex gap-2">
              <button 
                onClick={restartSession} 
                className="px-3 py-2 bg-white/10 rounded-xl hover:bg-white/20 transition"
              >
                Restart Session
              </button>
              <button 
                onClick={handleExportSession} 
                className="px-3 py-2 bg-white/10 rounded-xl hover:bg-white/20 transition flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}