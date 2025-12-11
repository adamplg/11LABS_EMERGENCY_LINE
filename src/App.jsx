import { useState, useRef } from 'react';
import { useEmergencySession } from './hooks/useEmergencySession';
import { HeaderPanel } from './components/HeaderPanel';
import { CallPanel } from './components/CallPanel';
import { ResultPanel } from './components/ResultPanel';
import './App.css';

// Simulation options for the landing page
const SIMULATIONS = [
  {
    id: 'emergency',
    title: 'Emergency Responder',
    description: 'Handle 911 calls as a dispatcher. Extract critical info and dispatch the right units.',
    icon: '🚨',
    available: true,
  },
  {
    id: 'hostage',
    title: 'Hostage Negotiation',
    description: 'Negotiate with hostage-takers. Build rapport and secure safe outcomes.',
    icon: '🎯',
    available: false,
  },
  {
    id: 'courtroom',
    title: 'Courtroom Debate',
    description: 'Present arguments and cross-examine witnesses in high-stakes trials.',
    icon: '⚖️',
    available: false,
  },
];

function LandingPage({ onSelectSimulation }) {
  return (
    <div className="landing-page">
      <div className="landing-content">
        <div className="landing-header">
          <div className="landing-icon">🎙️</div>
          <h1 className="landing-title">High-Stakes Conversation Simulator</h1>
          <p className="landing-subtitle">Choose a simulation to begin training</p>
        </div>

        <div className="simulations-grid">
          {SIMULATIONS.map((sim) => (
            <button
              key={sim.id}
              className={`simulation-card ${sim.available ? 'available' : 'locked'}`}
              onClick={() => sim.available && onSelectSimulation(sim.id)}
              disabled={!sim.available}
            >
              <div className="sim-icon-wrapper">
                <span className="sim-icon">{sim.icon}</span>
                {!sim.available && <span className="lock-icon">🔒</span>}
              </div>
              <div className="sim-info">
                <h3 className="sim-title">{sim.title}</h3>
                <p className="sim-description">{sim.description}</p>
                {!sim.available && (
                  <span className="coming-soon-badge">Coming Soon</span>
                )}
                {sim.available && (
                  <span className="play-badge">Start Training →</span>
                )}
              </div>
            </button>
          ))}
        </div>

        <div className="landing-footer">
          <p>Powered by AI voice technology</p>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [currentScreen, setCurrentScreen] = useState('landing'); // 'landing' or 'game'

  const {
    gameState,
    currentCall,
    totalCalls,
    scores,
    averageScore,
    badge,
    startCall,
    endCall,
    submitReport,
    recordScore,
    nextCall,
    resetSession,
  } = useEmergencySession();

  const [lastResult, setLastResult] = useState(null);
  const conversationIdRef = useRef(null);

  const handleSelectSimulation = (simId) => {
    if (simId === 'emergency') {
      setCurrentScreen('game');
    }
  };

  const handleBackToLanding = () => {
    setLastResult(null);
    resetSession();
    setCurrentScreen('landing');
  };

  const handleStartCall = (elevenLabsConversationId) => {
    conversationIdRef.current = elevenLabsConversationId;
    const scenarioId = `scenario_${currentCall + 1}`;
    startCall(elevenLabsConversationId, scenarioId);
  };

  const handleEndCall = () => {
    endCall();
  };

  const handleSubmitDispatch = async (formData) => {
    submitReport();

    console.log('=== SUBMIT DISPATCH ===');
    console.log('ConversationId from ref:', conversationIdRef.current);
    console.log('FormData:', formData);

    try {
      // Call the evaluate API
      const requestBody = {
        conversationId: conversationIdRef.current,
        dispatchReport: formData,
      };
      console.log('Request body:', JSON.stringify(requestBody, null, 2));

      const response = await fetch('/.netlify/functions/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      console.log('Response status:', response.status);
      const responseText = await response.text();
      console.log('Response body:', responseText);

      if (!response.ok) {
        throw new Error(`Evaluation failed: ${response.status} - ${responseText}`);
      }

      const result = JSON.parse(responseText);
      console.log('Parsed result:', result);
      setLastResult(result);
      recordScore(result.score);
    } catch (error) {
      console.error('Evaluation error:', error);
      // Fallback to mock result if API fails
      const mockResult = {
        score: 3,
        verdict: 'mixed',
        feedback: 'Unable to evaluate at this time. Please try again.',
      };
      setLastResult(mockResult);
      recordScore(mockResult.score);
    }
  };

  const handleNextCall = () => {
    setLastResult(null);
    nextCall();
  };

  const handleRestart = () => {
    setLastResult(null);
    resetSession();
  };

  // Show landing page
  if (currentScreen === 'landing') {
    return (
      <div className="app">
        <LandingPage onSelectSimulation={handleSelectSimulation} />
      </div>
    );
  }

  // Show game
  const showCallPanel = ['idle', 'inCall', 'reportPending', 'evaluating'].includes(gameState);
  const showResultPanel = ['result', 'complete'].includes(gameState);

  return (
    <div className="app">
      <HeaderPanel
        currentCall={currentCall}
        totalCalls={totalCalls}
        gameState={gameState}
        onReset={handleRestart}
        onBackToMenu={handleBackToLanding}
      />

      <main className="main-content">
        {showCallPanel && (
          <CallPanel
            gameState={gameState}
            currentCall={currentCall}
            onStartCall={handleStartCall}
            onEndCall={handleEndCall}
            onSubmitDispatch={handleSubmitDispatch}
            isSubmitting={gameState === 'evaluating'}
          />
        )}

        {showResultPanel && lastResult && (
          <ResultPanel
            score={lastResult.score}
            verdict={lastResult.verdict}
            feedback={lastResult.feedback}
            transcript={lastResult.transcript}
            currentCall={currentCall}
            totalCalls={totalCalls}
            averageScore={averageScore}
            onNextCall={handleNextCall}
            onRestart={handleRestart}
            isComplete={gameState === 'complete'}
            badge={badge}
            onBackToMenu={handleBackToLanding}
          />
        )}

        {gameState === 'complete' && !lastResult && (
          <ResultPanel
            score={scores[scores.length - 1] || 0}
            verdict="good"
            feedback=""
            currentCall={currentCall}
            totalCalls={totalCalls}
            averageScore={averageScore}
            onNextCall={handleNextCall}
            onRestart={handleRestart}
            isComplete={true}
            badge={badge}
            onBackToMenu={handleBackToLanding}
          />
        )}
      </main>

      <footer className="footer">
        <p className="footer-text mono">
          EMERGENCY LINE v1.0 — 11Labs Hackathon 2024
        </p>
      </footer>
    </div>
  );
}

export default App;
