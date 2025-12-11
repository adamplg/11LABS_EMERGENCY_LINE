import './HeaderPanel.css';

export function HeaderPanel({ currentCall, totalCalls, gameState }) {
  return (
    <header className="header-panel">
      <div className="header-content">
        <div className="header-left">
          <div className="logo">
            <span className="logo-icon">☎</span>
            <span className="logo-text">911</span>
          </div>
        </div>

        <div className="header-center">
          <h1 className="title">Emergency Line</h1>
          <p className="subtitle">Take a Call. Save a Life.</p>
        </div>

        <div className="header-right">
          {gameState !== 'idle' && gameState !== 'complete' && (
            <div className="call-counter mono">
              CALL {currentCall + 1} / {totalCalls}
            </div>
          )}
          {gameState === 'inCall' && (
            <div className="live-indicator">
              <span className="live-dot"></span>
              <span className="live-text">LIVE</span>
            </div>
          )}
        </div>
      </div>

      <div className="header-bar"></div>
    </header>
  );
}
