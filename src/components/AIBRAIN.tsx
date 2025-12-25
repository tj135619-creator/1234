import React, { useEffect, useState, useRef } from "react";
import { Send, User, Bot, Loader2, CheckCircle, Download, Sparkles, Calendar, MapPin, Target, Zap } from "lucide-react";

const API_BASE = "https://pythonbackend-74es.onrender.com";

const getApiKeys = async () => {
  return ["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"];
};

export default function AIBRAINPhaseFlow({ onComplete }) {
  const [sessionId, setSessionId] = useState(() => {
    return localStorage.getItem("session_id") ||
      `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
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
    stress_peaks: []
  });

  const messagesEndRef = useRef(null);

  useEffect(() => {
    initSession();
  }, []);

  useEffect(() => {
    localStorage.setItem("session_id", sessionId);
  }, [sessionId]);

  const initSession = async (customSessionId = null) => {
    setLoading(true);
    setErrorText(null);
    
    const idToUse = customSessionId || sessionId;
    
    try {
      console.log("🔄 Initializing session:", idToUse);
      
      const res = await fetch(`${API_BASE}/init-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          session_id: idToUse, 
          user_id: "anonymous" 
        })
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`HTTP ${res.status} — ${txt}`);
      }

      const data = await res.json();
      console.log("✅ Session initialized. Phase:", data.phase);
      
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
    const newId = `session_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
    console.log("🔄 Restarting with new session:", newId);
    
    setSessionId(newId);
    localStorage.setItem("session_id", newId);
    setMessages([]);
    setPhase(1);
    setPlanGenerated(false);
    
    setPhase1Data({ main_problem: "", where_happens: "", how_feels: "", impact: "" });
    setPhase2Data({ skill_assessment: { eye_contact: "", small_talk: "", reading_cues: "", active_listening: "", humor: "" }, past_attempts: "", biggest_struggle: "" });
    setPhase3Data({ practice_locations: ["", "", ""], available_times: "", commitment_level: 5, top_anxiety: "", support_system: "" });
    setPhase4Data({ weekly_schedule: { monday: {}, tuesday: {}, wednesday: {}, thursday: {}, friday: {}, saturday: {}, sunday: {} }, existing_social_touchpoints: [], stress_peaks: [] });
    
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
      const apiKeys = await getApiKeys();
      const apiKey = apiKeys[apiKeys.length - 1];

      const submissionSummary = `Problem: ${phase1Data.main_problem}\nWhere: ${phase1Data.where_happens}\nFeeling: ${phase1Data.how_feels}\nImpact: ${phase1Data.impact}`;
      pushUserMessage(submissionSummary);

      console.log("📤 Submitting Phase 1:", phase1Data);

      const res = await fetch(`${API_BASE}/submit-phase-data`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
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
      const apiKeys = await getApiKeys();
      const apiKey = apiKeys[apiKeys.length - 1];

      const submissionSummary = `Past attempts: ${phase2Data.past_attempts}\nSkills: Eye contact=${phase2Data.skill_assessment.eye_contact}, Small talk=${phase2Data.skill_assessment.small_talk}\nStruggle: ${phase2Data.biggest_struggle}`;
      pushUserMessage(submissionSummary);

      console.log("📤 Submitting Phase 2:", phase2Data);

      const res = await fetch(`${API_BASE}/submit-phase-data`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
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
          session_id: sessionId,
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
      const apiKeys = await getApiKeys();
      const apiKey = apiKeys[apiKeys.length - 1];

      const submissionSummary = `Schedule: Detailed weekly breakdown\nSocial touchpoints: ${phase4Data.existing_social_touchpoints.join(", ")}\nStress peaks: ${phase4Data.stress_peaks.join(", ")}`;
      pushUserMessage(submissionSummary);

      console.log("📤 Submitting Phase 4:", phase4Data);

      const res = await fetch(`${API_BASE}/submit-phase-data`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
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
      const apiKeys = await getApiKeys();
      const apiKey = apiKeys[apiKeys.length - 1];

      const res = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          session_id: sessionId, 
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
        session_id: sessionId,
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
      a.download = `session-${sessionId}.json`;
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
    <form onSubmit={submitPhase1} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">What's your main social challenge?</label>
        <textarea
          value={phase1Data.main_problem}
          onChange={(e) => setPhase1Data({ ...phase1Data, main_problem: e.target.value })}
          placeholder="E.g., I freeze up when trying to start conversations at work"
          className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400"
          rows={3}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Where does this happen most?</label>
        <input
          type="text"
          value={phase1Data.where_happens}
          onChange={(e) => setPhase1Data({ ...phase1Data, where_happens: e.target.value })}
          placeholder="E.g., Team meetings, networking events, coffee shops"
          className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">How does this make you feel?</label>
        <input
          type="text"
          value={phase1Data.how_feels}
          onChange={(e) => setPhase1Data({ ...phase1Data, how_feels: e.target.value })}
          placeholder="E.g., Anxious, embarrassed, frustrated"
          className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">What has this cost you?</label>
        <textarea
          value={phase1Data.impact}
          onChange={(e) => setPhase1Data({ ...phase1Data, impact: e.target.value })}
          placeholder="E.g., Missing promotion opportunities, feeling isolated"
          className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400"
          rows={4}
          required
        />
      </div>

      <button
        type="submit"
        className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition"
        disabled={loading}
      >
        {loading ? "Submitting..." : "Submit Phase 1"}
      </button>
    </form>
  );

  const renderPhase2Form = () => (
    <form onSubmit={submitPhase2} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">What have you tried before?</label>
        <textarea
          value={phase2Data.past_attempts}
          onChange={(e) => setPhase2Data({ ...phase2Data, past_attempts: e.target.value })}
          placeholder="E.g., Tried a public speaking course, read books on conversation"
          className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400"
          rows={3}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Rate your confidence (1-5):</label>
        <div className="space-y-3">
          {[
            { key: "eye_contact", label: "Eye Contact" },
            { key: "small_talk", label: "Small Talk" },
            { key: "reading_cues", label: "Reading Social Cues" },
            { key: "active_listening", label: "Active Listening" },
            { key: "humor", label: "Using Humor" }
          ].map(({ key, label }) => (
            <div key={key}>
              <div className="text-sm mb-1">{label}</div>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setPhase2Data({ ...phase2Data, skill_assessment: { ...phase2Data.skill_assessment, [key]: n } })}
                    className={`flex-1 py-2 rounded-lg ${phase2Data.skill_assessment[key] === n ? 'bg-purple-600' : 'bg-white/10'}`}
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
        <label className="block text-sm font-medium mb-2">Describe your biggest struggle:</label>
        <textarea
          value={phase2Data.biggest_struggle}
          onChange={(e) => setPhase2Data({ ...phase2Data, biggest_struggle: e.target.value })}
          placeholder="E.g., Starting conversations with strangers"
          className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400"
          rows={4}
          required
        />
      </div>

      <button
        type="submit"
        className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition"
        disabled={loading}
      >
        {loading ? "Submitting..." : "Submit Phase 2"}
      </button>
    </form>
  );

  const renderPhase3Form = () => (
    <form onSubmit={submitPhase3} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">List 2-3 places you go regularly:</label>
        {phase3Data.practice_locations.map((loc, idx) => (
          <input
            key={idx}
            value={loc}
            onChange={(e) => {
              const newLocs = [...phase3Data.practice_locations];
              newLocs[idx] = e.target.value;
              setPhase3Data({ ...phase3Data, practice_locations: newLocs });
            }}
            placeholder={idx === 0 ? "E.g., Morning coffee shop on commute" : idx === 1 ? "E.g., Gym after work" : "Optional..."}
            className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 mb-2"
            required={idx < 2}
          />
        ))}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">When are you available to practice?</label>
        <input
          type="text"
          value={phase3Data.available_times}
          onChange={(e) => setPhase3Data({ ...phase3Data, available_times: e.target.value })}
          placeholder="E.g., Weekday mornings 8-9am, evenings 6-7pm"
          className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Commitment level (1-10):</label>
        <input
          type="range"
          min="1"
          max="10"
          value={phase3Data.commitment_level}
          onChange={(e) => setPhase3Data({ ...phase3Data, commitment_level: parseInt(e.target.value) })}
          className="w-full"
        />
        <div className="text-center text-2xl font-bold">{phase3Data.commitment_level}/10</div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">What are you most worried about?</label>
        <input
          type="text"
          value={phase3Data.top_anxiety}
          onChange={(e) => setPhase3Data({ ...phase3Data, top_anxiety: e.target.value })}
          placeholder="E.g., Fear of being judged or rejected"
          className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Who supports you? (optional)</label>
        <input
          type="text"
          value={phase3Data.support_system}
          onChange={(e) => setPhase3Data({ ...phase3Data, support_system: e.target.value })}
          placeholder="E.g., Partner is supportive, one close friend"
          className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400"
        />
      </div>

      <button
        type="submit"
        className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition"
        disabled={loading}
      >
        {loading ? "Submitting..." : "Submit Phase 3"}
      </button>
    </form>
  );

  const renderPhase4Form = () => {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    
    return (
      <form onSubmit={submitPhase4} className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
        <div>
          <label className="block text-sm font-medium mb-2">Your Weekly Schedule</label>
          <p className="text-xs text-gray-400 mb-3">Fill in your typical schedule for each day</p>
          
          {days.map(day => (
            <div key={day} className="mb-4 p-3 bg-white/5 rounded-lg">
              <h4 className="font-semibold mb-2 capitalize">{day}</h4>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Morning activities"
                  value={phase4Data.weekly_schedule[day]?.morning || ""}
                  onChange={(e) => setPhase4Data({
                    ...phase4Data,
                    weekly_schedule: {
                      ...phase4Data.weekly_schedule,
                      [day]: { ...phase4Data.weekly_schedule[day], morning: e.target.value }
                    }
                  })}
                  className="p-2 text-sm rounded bg-white/10 border border-white/20 text-white placeholder-gray-400"
                />
                <input
                  type="text"
                  placeholder="Afternoon activities"
                  value={phase4Data.weekly_schedule[day]?.afternoon || ""}
                  onChange={(e) => setPhase4Data({
                    ...phase4Data,
                    weekly_schedule: {
                      ...phase4Data.weekly_schedule,
                      [day]: { ...phase4Data.weekly_schedule[day], afternoon: e.target.value }
                    }
                  })}
                  className="p-2 text-sm rounded bg-white/10 border border-white/20 text-white placeholder-gray-400"
                />
                <input
                  type="text"
                  placeholder="Evening activities"
                  value={phase4Data.weekly_schedule[day]?.evening || ""}
                  onChange={(e) => setPhase4Data({
                    ...phase4Data,
                    weekly_schedule: {
                      ...phase4Data.weekly_schedule,
                      [day]: { ...phase4Data.weekly_schedule[day], evening: e.target.value }
                    }
                  })}
                  className="p-2 text-sm rounded bg-white/10 border border-white/20 text-white placeholder-gray-400"
                />
                <select
                  value={phase4Data.weekly_schedule[day]?.energy || ""}
                  onChange={(e) => setPhase4Data({
                    ...phase4Data,
                    weekly_schedule: {
                      ...phase4Data.weekly_schedule,
                      [day]: { ...phase4Data.weekly_schedule[day], energy: e.target.value }
                    }
                  })}
                  className="p-2 text-sm rounded bg-white/10 border border-white/20 text-white"
                >
                  <option value="">Energy level...</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                <select
                  value={phase4Data.weekly_schedule[day]?.stress || ""}
                  onChange={(e) => setPhase4Data({
                    ...phase4Data,
                    weekly_schedule: {
                      ...phase4Data.weekly_schedule,
                      [day]: { ...phase4Data.weekly_schedule[day], stress: e.target.value }
                    }
                  })}
                  className="p-2 text-sm rounded bg-white/10 border border-white/20 text-white"
                >
                  <option value="">Stress level...</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
          ))}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Existing social touchpoints</label>
          <p className="text-xs text-gray-400 mb-2">E.g., "Daily standup at 10am", "Friday team lunch"</p>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={touchpointInput}
              onChange={(e) => setTouchpointInput(e.target.value)}
              placeholder="Add a social touchpoint..."
              className="flex-1 p-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (touchpointInput.trim()) {
                    setPhase4Data({
                      ...phase4Data,
                      existing_social_touchpoints: [...phase4Data.existing_social_touchpoints, touchpointInput.trim()]
                    });
                    setTouchpointInput("");
                  }
                }
              }}
            />
            <button
              type="button"
              onClick={() => {
                if (touchpointInput.trim()) {
                  setPhase4Data({
                    ...phase4Data,
                    existing_social_touchpoints: [...phase4Data.existing_social_touchpoints, touchpointInput.trim()]
                  });
                  setTouchpointInput("");
                }
              }}
              className="px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {phase4Data.existing_social_touchpoints.map((tp, idx) => (
              <span key={idx} className="px-3 py-1 bg-white/10 rounded-full text-sm flex items-center gap-2">
                {tp}
                <button
                  type="button"
                  onClick={() => setPhase4Data({
                    ...phase4Data,
                    existing_social_touchpoints: phase4Data.existing_social_touchpoints.filter((_, i) => i !== idx)
                  })}
                  className="text-red-400 hover:text-red-300"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Stress peaks</label>
          <p className="text-xs text-gray-400 mb-2">E.g., "Monday mornings (catching up)", "Thursday afternoons (deadline crunch)"</p>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={stressPeakInput}
              onChange={(e) => setStressPeakInput(e.target.value)}
              placeholder="Add a stress peak..."
              className="flex-1 p-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (stressPeakInput.trim()) {
                    setPhase4Data({
                      ...phase4Data,
                      stress_peaks: [...phase4Data.stress_peaks, stressPeakInput.trim()]
                    });
                    setStressPeakInput("");
                  }
                }
              }}
            />
            <button
              type="button"
              onClick={() => {
                if (stressPeakInput.trim()) {
                  setPhase4Data({
                    ...phase4Data,
                    stress_peaks: [...phase4Data.stress_peaks, stressPeakInput.trim()]
                  });
                  setStressPeakInput("");
                }
              }}
              className="px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {phase4Data.stress_peaks.map((sp, idx) => (
              <span key={idx} className="px-3 py-1 bg-white/10 rounded-full text-sm flex items-center gap-2">
                {sp}
                <button
                  type="button"
                  onClick={() => setPhase4Data({
                    ...phase4Data,
                    stress_peaks: phase4Data.stress_peaks.filter((_, i) => i !== idx)
                  })}
                  className="text-red-400 hover:text-red-300"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition"
          disabled={loading}
        >
          {loading ? "Submitting..." : "Submit Phase 4"}
        </button>
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
            View Full Dashboard
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
                  View Dashboard
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