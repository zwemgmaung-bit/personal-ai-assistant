'use client';
import { useState } from 'react';

export default function Home() {
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { 
      alert("Browser not supported. Please use Google Chrome."); 
      return; 
    }
    
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    
    recognition.onresult = async (event) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      setLoading(true);
      
      try {
        const res = await fetch('/api/assistant', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: text }),
        });
        const data = await res.json();
        
        if (data.error) {
          setResponse("Error: " + data.error);
        } else {
          setResponse(data.reply);
          speakText(data.reply);
        }
      } catch (err) {
        setResponse("Network error occurred.");
      } finally {
        setLoading(false);
      }
    };
    
    recognition.start();
  };

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <main style={{ 
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between',
      minHeight: '100vh', padding: '30px 20px', backgroundColor: '#030712', color: '#f3f4f6', fontFamily: 'monospace' 
    }}>
      <div style={{ width: '100%', maxWidth: '600px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#06b6d4', letterSpacing: '2px', marginBottom: '8px' }}>
          E.V AI ASSISTANT
        </h1>
        <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '30px' }}>Voice-Activated Personal Interface</p>
        
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
          <button 
            onClick={startListening} 
            style={{ 
              width: '120px', height: '120px', borderRadius: '50%', border: 'none', cursor: 'pointer',
              background: isListening ? '#ef4444' : 'linear-gradient(135deg, #06b6d4, #3b82f6)',
              color: '#fff', fontSize: '14px', fontWeight: 'bold',
              boxShadow: isListening ? '0 0 25px rgba(239, 68, 68, 0.6)' : '0 0 25px rgba(6, 182, 212, 0.4)',
              transition: 'all 0.3s ease'
            }}
          >
            {isListening ? 'LISTENING...' : '🎙️ TALK'}
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', textAlign: 'left' }}>
          <div style={{ padding: '15px', background: '#111827', borderRadius: '12px', border: '1px solid #1f2937' }}>
            <span style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase' }}>You said:</span>
            <p style={{ margin: '5px 0 0 0', fontSize: '15px', color: '#e5e7eb' }}>
              {transcript || 'Tap the mic and speak...'}
            </p>
          </div>

          <div style={{ padding: '15px', background: '#111827', borderRadius: '12px', border: '1px solid #06b6d433' }}>
            <span style={{ fontSize: '11px', color: '#06b6d4', textTransform: 'uppercase' }}>E.V Response:</span>
            <p style={{ margin: '5px 0 0 0', fontSize: '15px', color: '#67e8f9', lineHeight: '1.5' }}>
              {loading ? 'Processing thought...' : (response || 'Waiting for input...')}
            </p>
          </div>
        </div>
      </div>

      <footer style={{ fontSize: '11px', color: '#4b5563', marginTop: '20px' }}>
        Powered by Next.js & Gemini API
      </footer>
    </main>
  );
            }
