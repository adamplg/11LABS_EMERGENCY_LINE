import './HeaderPanel.css';

export function HeaderPanel({ currentCall, totalCalls, gameState, onReset, onBackToMenu }) {
  const handleHomeClick = () => {
    if (gameState !== 'idle') {
      onReset?.();
    }
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getCurrentDate = () => {
    const now = new Date();
    return now.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <header className="header-panel">
      <div className="header-content">
        <div className="header-left">
          {onBackToMenu && (
            <button className="back-btn" onClick={onBackToMenu} title="Back to simulations">
              ← Menu
            </button>
          )}
          <button className="logo" onClick={handleHomeClick} title="Return to home">
            <div className="logo-badge">
              <span className="logo-icon">☎</span>
            </div>
            <div className="logo-info">
              <span className="logo-text">911 DISPATCH</span>
              <span className="logo-sub">TRAINING CONSOLE</span>
            </div>
          </button>
        </div>

        <div className="header-center">
          <button className="title-btn" onClick={handleHomeClick} title="Return to home">
            <h1 className="title">EMERGENCY LINE</h1>
            <p className="subtitle">TAKE A CALL — SAVE A LIFE</p>
          </button>
        </div>

        <div className="header-right">
          <div className="header-stats mono">
            <div className="stat-item">
              <span className="stat-label">DATE</span>
              <span className="stat-value">{getCurrentDate()}</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-label">TIME</span>
              <span className="stat-value">{getCurrentTime()}</span>
            </div>
          </div>

          {gameState !== 'idle' && gameState !== 'complete' && (
            <div className="call-counter mono">
              <span className="counter-label">CALL</span>
              <span className="counter-value">{currentCall + 1}/{totalCalls}</span>
            </div>
          )}

          {gameState === 'inCall' && (
            <div className="live-indicator">
              <span className="live-dot"></span>
              <span className="live-text">ACTIVE</span>
            </div>
          )}
        </div>
      </div>

      <div className="header-bar"></div>
    </header>
  );
}
