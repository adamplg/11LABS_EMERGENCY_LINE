import { useState } from 'react';
import './DispatchFormPanel.css';

const UNITS = [
  { value: '', label: 'Select unit to dispatch...' },
  { value: 'ambulance', label: '🚑 Ambulance - Medical Emergency' },
  { value: 'police', label: '🚔 Police - Crime / Safety' },
  { value: 'fire', label: '🚒 Fire Department - Fire / Rescue' },
  { value: 'multiple', label: '🚨 Multiple Units' },
];

const SEVERITY_LEVELS = [
  { value: '', label: 'Assess severity...' },
  { value: 'minor', label: 'Minor - Non-life-threatening' },
  { value: 'serious', label: 'Serious - Urgent attention needed' },
  { value: 'critical', label: 'Critical - Life-threatening' },
];

export function DispatchFormPanel({ onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState({
    address: '',
    severity: '',
    situation: '',
    unit: '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    if (!formData.severity) {
      newErrors.severity = 'Select a severity level';
    }
    if (!formData.situation.trim()) {
      newErrors.situation = 'Describe the situation';
    }
    if (!formData.unit) {
      newErrors.unit = 'Select a unit to dispatch';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="dispatch-form-panel slide-up">
      <div className="form-header">
        <h2 className="form-title">Dispatch Report</h2>
        <p className="form-subtitle">
          Based on the call, log the emergency details below.
        </p>
      </div>

      <form className="dispatch-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="address">Emergency Address</label>
          <input
            type="text"
            id="address"
            name="address"
            placeholder="Street name, number, city"
            value={formData.address}
            onChange={handleChange}
            disabled={isSubmitting}
            className={errors.address ? 'error' : ''}
          />
          {errors.address && <span className="error-text">{errors.address}</span>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="severity">Severity Level</label>
            <select
              id="severity"
              name="severity"
              value={formData.severity}
              onChange={handleChange}
              disabled={isSubmitting}
              className={errors.severity ? 'error' : ''}
            >
              {SEVERITY_LEVELS.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
            {errors.severity && <span className="error-text">{errors.severity}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="unit">Unit to Dispatch</label>
            <select
              id="unit"
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              disabled={isSubmitting}
              className={errors.unit ? 'error' : ''}
            >
              {UNITS.map((unit) => (
                <option key={unit.value} value={unit.value}>
                  {unit.label}
                </option>
              ))}
            </select>
            {errors.unit && <span className="error-text">{errors.unit}</span>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="situation">Situation Description</label>
          <textarea
            id="situation"
            name="situation"
            placeholder="Describe what's happening based on what the caller told you..."
            value={formData.situation}
            onChange={handleChange}
            disabled={isSubmitting}
            className={errors.situation ? 'error' : ''}
            rows={4}
          />
          {errors.situation && <span className="error-text">{errors.situation}</span>}
        </div>

        <button
          type="submit"
          className="submit-button"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="spinner"></span>
              Assessing Response...
            </>
          ) : (
            'Submit Dispatch Report'
          )}
        </button>
      </form>
    </div>
  );
}
