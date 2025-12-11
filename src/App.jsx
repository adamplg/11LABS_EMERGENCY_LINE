import { useState } from 'react';
import { useEmergencySession } from './hooks/useEmergencySession';
import { HeaderPanel } from './components/HeaderPanel';
import { CallPanel } from './components/CallPanel';
import { DispatchFormPanel } from './components/DispatchFormPanel';
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

  // Handler for starting a call
  const handleStartCall = () => {
    // Generate a simple conversation ID for now
    const conversationId = `conv_${Date.now()}`;
    const scenarioId = `scenario_${currentCall + 1}`;
    startCall(conversationId, scenarioId);
  };

  // Handler for ending a call
  const handleEndCall = () => {
    endCall();
  };

  // Handler for submitting dispatch report
  const handleSubmitReport = async (formData) => {
    submitReport();

    // TODO: Replace with actual API call to /api/evaluate
    // For now, simulate a response after a delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Mock evaluation result
    const mockResult = {
      score: Math.floor(Math.random() * 3) + 3, // Random 3-5 for demo
      verdict: ['mixed', 'good', 'excellent'][Math.floor(Math.random() * 3)],
      feedback:
        'You identified the emergency type correctly and gathered most of the critical information. Consider asking more follow-up questions about the caller\'s exact location.',
    };

    setLastResult(mockResult);
    recordScore(mockResult.score);
  };

  // Handler for next call
  const handleNextCall = () => {
    setLastResult(null);
    nextCall();
  };

  // Handler for restart
  const handleRestart = () => {
    setLastResult(null);
    resetSession();
  };

  return (
    <div className="app">
      <HeaderPanel
        currentCall={currentCall}
        totalCalls={totalCalls}
        gameState={gameState}
      />

      <main className="main-content">
        {/* Idle or In Call State */}
        {(gameState === 'idle' || gameState === 'inCall') && (
          <CallPanel
            gameState={gameState}
            onStartCall={handleStartCall}
            onEndCall={handleEndCall}
          />
        )}

        {/* Report Form State */}
        {(gameState === 'reportPending' || gameState === 'evaluating') && (
          <DispatchFormPanel
            onSubmit={handleSubmitReport}
            isSubmitting={gameState === 'evaluating'}
          />
        )}

        {/* Result State */}
        {(gameState === 'result' || gameState === 'complete') && lastResult && (
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

        {/* Complete state without lastResult (edge case / fresh load) */}
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
