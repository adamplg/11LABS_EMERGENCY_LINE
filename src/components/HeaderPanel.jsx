import './HeaderPanel.css';

export function HeaderPanel({ currentCall, totalCalls, gameState, onReset }) {
  const handleHomeClick = () => {
    if (gameState !== 'idle') {
      onReset?.();
    }
  };

  return (
    <header className="header-panel">
      <div className="header-content">
        <div className="header-left">
          <button className="logo" onClick={handleHomeClick} title="Return to home">
            <span className="logo-icon">☎</span>
            <span className="logo-text">911</span>
          </button>
        </div>

        <div className="header-center">
          <button className="title-btn" onClick={handleHomeClick} title="Return to home">
            <h1 className="title">Emergency Line</h1>
            <p className="subtitle">Take a Call. Save a Life.</p>
          </button>
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
