import { useState } from 'react';
import './CallPanel.css';

const RESPONSE_UNITS = [
  { id: 'ambulance', label: 'Ambulance', icon: '🚑' },
  { id: 'police', label: 'Police', icon: '🚔' },
  { id: 'fire', label: 'Fire Department', icon: '🚒' },
  { id: 'animal', label: 'Animal Control', icon: '🐕' },
];

const SEVERITY_LEVELS = [
  { value: 'minor', label: 'Minor' },
  { value: 'serious', label: 'Serious' },
  { value: 'critical', label: 'Critical' },
];

export function CallPanel({
  gameState,
  onStartCall,
  onEndCall,
  onSubmitDispatch,
  isSubmitting
}) {
  const isIdle = gameState === 'idle';
  const isInCall = gameState === 'inCall';
  const isReportPending = gameState === 'reportPending';
  const isEvaluating = gameState === 'evaluating';

  const [formData, setFormData] = useState({
    address: '',
    severity: '',
    situation: '',
    units: [],
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleUnitToggle = (unitId) => {
    setFormData((prev) => ({
      ...prev,
      units: prev.units.includes(unitId)
        ? prev.units.filter((u) => u !== unitId)
        : [...prev.units, unitId],
    }));
    if (errors.units) setErrors((prev) => ({ ...prev, units: null }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.address.trim()) newErrors.address = 'Required';
    if (!formData.severity) newErrors.severity = 'Required';
    if (!formData.situation.trim()) newErrors.situation = 'Required';
    if (formData.units.length === 0) newErrors.units = 'Select at least one';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSubmitDispatch(formData);
    }
  };

  const resetForm = () => {
    setFormData({ address: '', severity: '', situation: '', units: [] });
    setErrors({});
  };

  return (
    <div className="call-panel">
      {/* IDLE STATE */}
      {isIdle && (
        <div className="idle-state fade-in">
          <div className="idle-content">
            <div className="dispatch-icon">
              <span className="icon-ring"></span>
              <span className="icon-phone">📞</span>
            </div>

            <h2 className="idle-title">Emergency Dispatch Training</h2>

            <p className="idle-description">
              Listen to the caller. Stay calm. Extract the <em>location</em>,
              <em>situation</em>, and <em>severity</em>. Dispatch the right units.
            </p>

            <button className="answer-button" onClick={() => { resetForm(); onStartCall(); }}>
              <span className="btn-dot"></span>
              Answer Incoming Call
            </button>

            <div className="status-indicator mono">
              <span className="pulse-dot"></span>
              INCOMING CALL
            </div>
          </div>
        </div>
      )}

      {/* IN-CALL STATE */}
      {(isInCall || isReportPending || isEvaluating) && (
        <div className="call-state fade-in">
          <div className="call-layout">
            {/* Left: Call Info */}
            <div className="call-info-panel">
              <div className="call-header">
                <div className="live-badge">
                  <span className="live-dot"></span>
                  {isInCall ? 'LIVE CALL' : 'CALL ENDED'}
                </div>
                <span className="call-timer mono">00:00</span>
              </div>

              {/* ElevenLabs Widget Placeholder */}
              <div className="widget-area">
                <div id="elevenlabs-widget" className="widget-placeholder">
                  <div className="caller-avatar">
                    <span>👤</span>
                  </div>
                  <p className="widget-label mono">CALLER CONNECTED</p>
                </div>
              </div>

              {isInCall && (
                <button className="end-call-btn" onClick={onEndCall}>
                  End Call
                </button>
              )}
            </div>

            {/* Right: Dispatch Form */}
            <div className="dispatch-form-panel">
              <h3 className="form-title">Dispatch Report</h3>

              <div className="form-field">
                <label>Emergency Address</label>
                <input
                  type="text"
                  name="address"
                  placeholder="Street, number, city..."
                  value={formData.address}
                  onChange={handleInputChange}
                  disabled={isEvaluating}
                  className={errors.address ? 'error' : ''}
                />
              </div>

              <div className="form-field">
                <label>Severity</label>
                <div className="severity-buttons">
                  {SEVERITY_LEVELS.map((level) => (
                    <button
                      key={level.value}
                      type="button"
                      className={`severity-btn ${level.value} ${formData.severity === level.value ? 'active' : ''}`}
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, severity: level.value }));
                        if (errors.severity) setErrors((prev) => ({ ...prev, severity: null }));
                      }}
                      disabled={isEvaluating}
                    >
                      {level.label}
                    </button>
                  ))}
                </div>
                {errors.severity && <span className="error-msg">{errors.severity}</span>}
              </div>

              <div className="form-field">
                <label>Situation</label>
                <textarea
                  name="situation"
                  placeholder="What's happening..."
                  value={formData.situation}
                  onChange={handleInputChange}
                  disabled={isEvaluating}
                  className={errors.situation ? 'error' : ''}
                  rows={3}
                />
              </div>

              <div className="form-field">
                <label>Dispatch Units</label>
                <div className="units-grid">
                  {RESPONSE_UNITS.map((unit) => (
                    <button
                      key={unit.id}
                      type="button"
                      className={`unit-btn ${formData.units.includes(unit.id) ? 'active' : ''}`}
                      onClick={() => handleUnitToggle(unit.id)}
                      disabled={isEvaluating}
                    >
                      <span className="unit-icon">{unit.icon}</span>
                      <span className="unit-label">{unit.label}</span>
                      {formData.units.includes(unit.id) && <span className="unit-check">✓</span>}
                    </button>
                  ))}
                </div>
                {errors.units && <span className="error-msg">{errors.units}</span>}
              </div>

              <button
                className="submit-btn"
                onClick={handleSubmit}
                disabled={isInCall || isEvaluating}
              >
                {isEvaluating ? (
                  <>
                    <span className="spinner"></span>
                    Evaluating...
                  </>
                ) : isInCall ? (
                  'End call to submit'
                ) : (
                  'Submit Dispatch'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
