import { useState, useEffect, useCallback } from 'react';
import { useConversation } from '@elevenlabs/react';
import './CallPanel.css';

// Agent IDs for different callers (cycles through based on call number)
const CALLER_AGENTS = [
  'agent_9401kc75qw0ce48bqgwthay53k49', // Caller 1
  'agent_4501kc76ak52ejgtce1rz8xgnt4g', // Caller 2
  'agent_5201kc79m6nzem2a6gs7aagsp8xn', // Caller 3
  'agent_3301kc7a8p5rek0syn7t298gxn69', // Caller 4
];

const RESPONSE_UNITS = [
  { id: 'ambulance', label: 'Ambulance', icon: '🚑' },
  { id: 'police', label: 'Police', icon: '🚔' },
  { id: 'fire', label: 'Fire Dept', icon: '🚒' },
  { id: 'animal', label: 'Animal Ctrl', icon: '🐕' },
];

const SEVERITY_LEVELS = [
  { value: 'minor', label: 'Minor' },
  { value: 'serious', label: 'Serious' },
  { value: 'critical', label: 'Critical' },
];

export function CallPanel({
  gameState,
  currentCall,
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
    callerName: '',
    address: '',
    severity: '',
    situation: '',
    units: [],
  });

  const [errors, setErrors] = useState({});
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  // ElevenLabs Conversation hook
  const conversation = useConversation({
    onConnect: () => {
      console.log('Connected to ElevenLabs');
    },
    onDisconnect: () => {
      console.log('Disconnected from ElevenLabs');
      if (isInCall) {
        onEndCall();
      }
    },
    onError: (error) => {
      console.error('ElevenLabs error:', error);
    },
    onMessage: (message) => {
      console.log('Message:', message);
    },
  });

  // Call timer
  useEffect(() => {
    let interval;
    if (isInCall) {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(interval);
  }, [isInCall]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartCall = useCallback(async () => {
    resetForm();
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      const agentId = CALLER_AGENTS[currentCall % CALLER_AGENTS.length];
      console.log('Starting ElevenLabs session with agent:', agentId, 'for call:', currentCall);
      const session = await conversation.startSession({ agentId });
      console.log('ElevenLabs session response:', session);
      const conversationId = typeof session === 'string'
        ? session
        : (session?.conversationId || session?.conversation_id || `conv_${Date.now()}`);
      console.log('Using conversationId:', conversationId);
      onStartCall(conversationId);
    } catch (error) {
      console.error('Failed to start call:', error);
      alert('Could not start call. Please allow microphone access and try again.');
    }
  }, [conversation, onStartCall, currentCall]);

  const handleEndCall = useCallback(async () => {
    try {
      await conversation.endSession();
    } catch (error) {
      console.error('Error ending session:', error);
    }
    setIsMuted(false);
    onEndCall();
  }, [conversation, onEndCall]);

  const handleMuteToggle = useCallback(async () => {
    try {
      const newMuteState = !isMuted;
      await conversation.setVolume({ inputVolume: newMuteState ? 0 : 1 });
      setIsMuted(newMuteState);
    } catch (error) {
      console.error('Error toggling mute:', error);
    }
  }, [conversation, isMuted]);

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
    if (!formData.callerName.trim()) newErrors.callerName = 'Required';
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
    setFormData({ callerName: '', address: '', severity: '', situation: '', units: [] });
    setErrors({});
  };

  const isSpeaking = conversation.isSpeaking;

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

            <h2 className="idle-title">9-1-1 Call</h2>

            <p className="idle-description">
              Listen to the caller. Stay calm. Extract the <em>location</em>,{' '}
              <em>situation</em>, and <em>severity</em>. Dispatch the right units.
            </p>

            <button className="answer-button" onClick={handleStartCall}>
              <span className="btn-dot"></span>
              Answer Incoming Call
            </button>

            <div className="status-indicator">
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
            {/* Main Content Area */}
            <div className="main-content-area">
              {/* Call Status Bar */}
              <div className="call-status-bar">
                <div className="status-left">
                  <div className={`live-badge ${!isInCall ? 'ended' : ''}`}>
                    <span className="live-dot"></span>
                    {isInCall ? 'LIVE' : 'ENDED'}
                  </div>
                  <span className="call-timer">{formatTime(callDuration)}</span>
                  <div className={`caller-status-inline ${isSpeaking ? 'speaking' : ''}`}>
                    {isSpeaking && (
                      <div className="speaking-indicator-inline">
                        <span className="wave"></span>
                        <span className="wave"></span>
                        <span className="wave"></span>
                      </div>
                    )}
                    <span>
                      {isInCall
                        ? (isSpeaking ? 'CALLER SPEAKING' : 'LISTENING')
                        : 'DISCONNECTED'}
                    </span>
                  </div>
                </div>
                {isInCall && (
                  <div className="status-right">
                    <button
                      className={`mute-btn ${isMuted ? 'muted' : ''}`}
                      onClick={handleMuteToggle}
                    >
                      {isMuted ? '🔇' : '🎤'}
                    </button>
                    <button className="end-call-btn" onClick={handleEndCall}>
                      End Call
                    </button>
                  </div>
                )}
              </div>

              {/* Dispatch Form */}
              <div className="dispatch-form-panel">
                <div className="panel-header">
                  <span className="panel-title">Dispatch Report</span>
                </div>
                <div className="form-body">
                  <div className="form-row">
                    <div className="form-field">
                      <label>Caller Name</label>
                      <input
                        type="text"
                        name="callerName"
                        placeholder="Name..."
                        value={formData.callerName}
                        onChange={handleInputChange}
                        disabled={isEvaluating}
                        className={errors.callerName ? 'error' : ''}
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
                    </div>
                  </div>

                  <div className="form-field full-width">
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

                  <div className="form-field full-width">
                    <label>Situation</label>
                    <textarea
                      name="situation"
                      placeholder="What's happening..."
                      value={formData.situation}
                      onChange={handleInputChange}
                      disabled={isEvaluating}
                      className={errors.situation ? 'error' : ''}
                      rows={2}
                    />
                  </div>

                  <div className="form-field full-width">
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
                  </div>
                </div>
              </div>

              {/* Status Row */}
              <div className="status-row">
                <div className="status-item">
                  <div className="status-label">Status</div>
                  <div className={`status-value ${!isInCall && formData.units.length > 0 ? 'responding' : ''}`}>
                    {isInCall ? 'IN PROGRESS' : formData.units.length > 0 ? 'RESPONDING' : 'PENDING'}
                  </div>
                </div>
                <div className="status-item">
                  <div className="status-label">Units</div>
                  <div className="status-value">{formData.units.length || '-'}</div>
                </div>
                <div className="status-item">
                  <div className="status-label">Duration</div>
                  <div className="status-value">{formatTime(callDuration)}</div>
                </div>
              </div>

              {/* Submit Button */}
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
                  'Submit Dispatch Report'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
