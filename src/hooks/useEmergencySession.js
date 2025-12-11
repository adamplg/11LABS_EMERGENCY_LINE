import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'emergencyGameState';
const TOTAL_CALLS = 5;

const initialState = {
  currentCall: 0,
  totalCalls: TOTAL_CALLS,
  scores: [],
  scenariosUsed: [],
  lastConversationId: null,
  gameState: 'idle', // idle | inCall | reportPending | evaluating | result | complete
};

export function useEmergencySession() {
  const [session, setSession] = useState(() => {
    // Load from sessionStorage on init
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load session:', e);
    }
    return initialState;
  });

  // Persist to sessionStorage on every change
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch (e) {
      console.error('Failed to save session:', e);
    }
  }, [session]);

  // State transitions
  const startCall = useCallback((conversationId, scenarioId) => {
    setSession((prev) => ({
      ...prev,
      gameState: 'inCall',
      lastConversationId: conversationId,
      scenariosUsed: [...prev.scenariosUsed, scenarioId],
    }));
  }, []);

  const endCall = useCallback(() => {
    setSession((prev) => ({
      ...prev,
      gameState: 'reportPending',
    }));
  }, []);

  const submitReport = useCallback(() => {
    setSession((prev) => ({
      ...prev,
      gameState: 'evaluating',
    }));
  }, []);

  const recordScore = useCallback((score) => {
    setSession((prev) => {
      const newScores = [...prev.scores, score];
      const newCurrentCall = prev.currentCall + 1;
      const isComplete = newCurrentCall >= prev.totalCalls;

      return {
        ...prev,
        scores: newScores,
        currentCall: newCurrentCall,
        gameState: isComplete ? 'complete' : 'result',
      };
    });
  }, []);

  const nextCall = useCallback(() => {
    setSession((prev) => ({
      ...prev,
      gameState: 'idle',
      lastConversationId: null,
    }));
  }, []);

  const resetSession = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY);
    setSession(initialState);
  }, []);

  // Computed values
  const averageScore = session.scores.length > 0
    ? session.scores.reduce((a, b) => a + b, 0) / session.scores.length
    : 0;

  const getBadge = () => {
    if (session.scores.length === 0) return null;
    if (averageScore >= 4) return { label: 'Pro Dispatcher', color: 'success' };
    if (averageScore >= 2.5) return { label: 'Solid Dispatcher', color: 'warning' };
    return { label: 'Rookie Dispatcher', color: 'alert' };
  };

  return {
    // State
    ...session,
    averageScore,
    badge: getBadge(),

    // Actions
    startCall,
    endCall,
    submitReport,
    recordScore,
    nextCall,
    resetSession,
  };
}
