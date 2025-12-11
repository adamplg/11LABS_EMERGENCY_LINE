import './CallPanel.css';

export function CallPanel({ gameState, onStartCall, onEndCall }) {
  const isIdle = gameState === 'idle';
  const isInCall = gameState === 'inCall';

  return (
    <div className="call-panel">
      {isIdle && (
        <div className="idle-state fade-in">
          <div className="instructions">
            <p className="instruction-text">
              You're an emergency dispatcher. When someone calls, listen carefully,
              stay calm, and gather the critical information: <strong>where</strong> it's
              happening, <strong>what</strong> the emergency is, and <strong>how serious</strong> it is.
            </p>
            <p className="instruction-subtext">
              After the call, you'll log your dispatch report. The AI will evaluate how well you handled it.
            </p>
          </div>

          <button className="emergency-button" onClick={onStartCall}>
            <span className="button-icon">📞</span>
            <span className="button-text">Answer Emergency Line</span>
            <span className="button-pulse"></span>
          </button>

          <div className="status-bar mono">
            <span className="status-dot waiting"></span>
            STANDING BY FOR INCOMING CALL
          </div>
        </div>
      )}

      {isInCall && (
        <div className="call-state fade-in">
          <div className="call-active-indicator">
            <div className="call-rings">
              <span className="ring ring-1"></span>
              <span className="ring ring-2"></span>
              <span className="ring ring-3"></span>
              <span className="phone-icon">📞</span>
            </div>
            <p className="call-status">Call in Progress</p>
          </div>

          {/* ElevenLabs widget placeholder */}
          <div className="call-widget-container">
            <div id="elevenlabs-widget" className="call-widget-placeholder">
              {/* TODO: ElevenLabs Conversational AI widget goes here */}
              <p className="placeholder-text mono">ELEVENLABS WIDGET</p>
            </div>
          </div>

          <button className="end-call-button" onClick={onEndCall}>
            End Call
          </button>
        </div>
      )}
    </div>
  );
}
