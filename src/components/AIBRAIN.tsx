import { useState, useEffect, useRef } from 'react';
import { Send, User, Bot, Loader2, CheckCircle, Download, Sparkles } from 'lucide-react';
import { getApiKeys } from "src/backend/apikeys";

export default function AIChatInterface({ onComplete }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [phaseComplete, setPhaseComplete] = useState(false);
  const [structuredData, setStructuredData] = useState({});
  const [showDataPreview, setShowDataPreview] = useState(false);
  const [sessionId] = useState(`session_${Date.now()}`);
  const messagesEndRef = useRef(null);

  const API_BASE = "https://pythonbackend-74es.onrender.com";

  useEffect(() => {
    initializeSession();
  }, []);

  const initializeSession = async () => {
    setIsLoading(true);
    try {
      const apiKeys = await getApiKeys();
      const apiKey = apiKeys[apiKeys.length - 1];

      const response = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          api_key: apiKey,
          message: ""
        })
      });

      const data = await response.json();
      setMessages([{ id: Date.now(), role: 'assistant', content: data.response, timestamp: Date.now() }]);
    } catch (error) {
      console.error('Initialization error:', error);
      setMessages([{ id: Date.now(), role: 'assistant', content: '⚠️ Could not connect to server.', timestamp: Date.now() }]);
    }
    setIsLoading(false);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;
    const userMsg = { id: Date.now(), role: 'user', content: inputMessage, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    const userInput = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    try {
      const apiKeys = await getApiKeys();
      const apiKey = apiKeys[apiKeys.length - 1];

      const response = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, api_key: apiKey, message: userInput })
      });

      const data = await response.json();

      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', content: data.response, timestamp: Date.now() }]);

      if (data.phase_complete) {
        setPhaseComplete(true);
        if (data.structured_data) {
          setStructuredData(data.structured_data);
          setShowDataPreview(true);
        }
      }
    } catch (error) {
      console.error('Send error:', error);
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', content: '⚠️ Error sending message.', timestamp: Date.now() }]);
    }

    setIsLoading(false);
  };

  const handleExportSession = async () => {
    try {
      const response = await fetch(`${API_BASE}/export/${sessionId}`);
      const data = await response.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `session-${sessionId}.json`;
      a.click();
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => scrollToBottom(), [messages]);

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-purple-950 to-pink-950 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/40 backdrop-blur-md border-b border-white/20 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg">Jordan</h1>
            <p className="text-xs text-gray-300">Your AI Coach</p>
          </div>
        </div>
        <p className="text-xs text-gray-400">{messages.length} messages</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map(msg => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${
              msg.role === 'user' ? 'bg-gray-700' : 'bg-gradient-to-br from-purple-500 to-pink-500'
            }`}>
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
        {isLoading && (
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

      {/* Input Area */}
      <div className="p-4 bg-black/40 backdrop-blur-md border-t border-white/20">
        {phaseComplete && (
          <div className="mb-3 flex flex-col gap-2">
            <button onClick={onComplete} className="w-full py-2 bg-green-500 rounded-xl flex items-center justify-center gap-2 font-bold">
              <CheckCircle className="w-5 h-5" /> View Complete Plan
            </button>
            <button onClick={handleExportSession} className="w-full py-2 bg-white/10 border border-white/20 rounded-xl flex items-center justify-center gap-2 font-semibold text-sm">
              <Download className="w-4 h-4" /> Download Session Data
            </button>
          </div>
        )}

        <div className="flex gap-2">
          <textarea
            value={inputMessage}
            onChange={e => setInputMessage(e.target.value)}
            onKeyPress={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
            placeholder="Type a message..."
            className="flex-1 p-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/20 resize-none"
            rows={1}
          />
          <button onClick={handleSendMessage} disabled={!inputMessage.trim() || isLoading} className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl disabled:opacity-40">
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
