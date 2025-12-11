import { useState } from 'react';
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

  const handleStartCall = () => {
    const conversationId = `conv_${Date.now()}`;
    const scenarioId = `scenario_${currentCall + 1}`;
    startCall(conversationId, scenarioId);
  };

  const handleEndCall = () => {
    endCall();
  };

  const handleSubmitDispatch = async (formData) => {
    submitReport();

    // TODO: Replace with actual API call to /api/evaluate
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Mock evaluation result
    const mockResult = {
      score: Math.floor(Math.random() * 3) + 3,
      verdict: ['mixed', 'good', 'excellent'][Math.floor(Math.random() * 3)],
      feedback:
        'You identified the emergency type correctly and gathered most of the critical information. Consider asking more follow-up questions about the caller\'s exact location.',
    };

    setLastResult(mockResult);
    recordScore(mockResult.score);
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
