import { useState, useRef } from 'react';
import { useEmergencySession } from './hooks/useEmergencySession';
import { HeaderPanel } from './components/HeaderPanel';
import { CallPanel } from './components/CallPanel';
import { ResultPanel } from './components/ResultPanel';
import './App.css';

function App() {
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

    try {
      // Call the evaluate API
      const response = await fetch('/.netlify/functions/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: conversationIdRef.current,
          dispatchReport: formData,
        }),
      });

      if (!response.ok) {
        throw new Error('Evaluation failed');
      }

      const result = await response.json();
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

  const showCallPanel = ['idle', 'inCall', 'reportPending', 'evaluating'].includes(gameState);
  const showResultPanel = ['result', 'complete'].includes(gameState);

  return (
    <div className="app">
      <HeaderPanel
        currentCall={currentCall}
        totalCalls={totalCalls}
        gameState={gameState}
        onReset={handleRestart}
      />

      <main className="main-content">
        {showCallPanel && (
          <CallPanel
            gameState={gameState}
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
