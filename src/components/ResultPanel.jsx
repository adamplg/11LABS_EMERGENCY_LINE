import './ResultPanel.css';

const VERDICT_CONFIG = {
  excellent: { label: 'Excellent', color: 'success', icon: '✓' },
  good: { label: 'Good', color: 'success', icon: '✓' },
  mixed: { label: 'Mixed', color: 'warning', icon: '⚠' },
  poor: { label: 'Poor', color: 'alert', icon: '✗' },
  fail: { label: 'Fail', color: 'alert', icon: '✗' },
};

export function ResultPanel({
  score,
  verdict,
  feedback,
  transcript,
  currentCall,
  totalCalls,
  averageScore,
  onNextCall,
  onRestart,
  isComplete,
  badge,
}) {
  const verdictInfo = VERDICT_CONFIG[verdict] || VERDICT_CONFIG.mixed;

  return (
    <div className="result-panel slide-up">
      {!isComplete ? (
        // Single call result
        <>
          <div className="result-header">
            <h2 className="result-title">Call Assessment</h2>
          </div>

          <div className="score-display">
            <div className={`score-circle ${verdictInfo.color}`}>
              <span className="score-number">{score}</span>
              <span className="score-max">/ 5</span>
            </div>
            <div className={`verdict-badge ${verdictInfo.color}`}>
              <span className="verdict-icon">{verdictInfo.icon}</span>
              <span className="verdict-label">{verdictInfo.label}</span>
            </div>
          </div>

          <div className="feedback-box">
            <p className="feedback-text">{feedback}</p>
          </div>

          {/* Call Transcript */}
          {transcript && transcript.length > 0 && (
            <div className="transcript-section">
              <h3 className="transcript-title">Call Transcript</h3>
              <div className="transcript-box">
                {transcript.map((msg, index) => (
                  <div
                    key={index}
                    className={`transcript-message ${msg.role === 'Caller' ? 'caller' : 'dispatcher'}`}
                  >
                    <span className="message-role">{msg.role}</span>
                    <span className="message-text">{msg.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="progress-info mono">
            <span>Call {currentCall} of {totalCalls} completed</span>
            <span className="divider">|</span>
            <span>Average: {averageScore.toFixed(1)}</span>
          </div>

          <button className="next-button" onClick={onNextCall}>
            Take Next Call
            <span className="button-arrow">→</span>
          </button>
        </>
      ) : (
        // Final summary
        <>
          <div className="result-header">
            <h2 className="result-title">Training Complete</h2>
          </div>

          <div className={`badge-display ${badge?.color}`}>
            <span className="badge-label">{badge?.label}</span>
          </div>

          <div className="final-score-display">
            <div className="final-score">
              <span className="final-score-label">Final Average</span>
              <span className="final-score-number">{averageScore.toFixed(1)}</span>
              <span className="final-score-max">/ 5</span>
            </div>
          </div>

          <div className="summary-text">
            <p>You completed {totalCalls} emergency calls.</p>
            <p>
              {averageScore >= 4
                ? "Outstanding work. You demonstrated excellent emergency response skills."
                : averageScore >= 2.5
                ? "Solid performance. With more practice, you'll be even better."
                : "Keep practicing. Emergency dispatch requires quick thinking and calm communication."}
            </p>
          </div>

          <button className="restart-button" onClick={onRestart}>
            Restart Training
          </button>
        </>
      )}
    </div>
  );
}
