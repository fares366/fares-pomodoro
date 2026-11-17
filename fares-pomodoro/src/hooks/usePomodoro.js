import { useCallback, useEffect, useRef, useState } from 'react';
import { playChime, unlockAudio } from '../utils/chime';

export const CYCLE_LENGTH = 4; // focus sessions before a long break

/**
 * Core Pomodoro engine.
 * - Uses timestamps (not tick counting) so it stays accurate in background tabs.
 * - onFocusComplete(minutes) fires when a focus session finishes.
 * - onElapsed(seconds) fires while a focus session runs (task time tracking).
 */
export function usePomodoro({ settings, onFocusComplete, onElapsed }) {
  const [mode, setMode] = useState('focus');
  const [secondsLeft, setSecondsLeft] = useState(settings.focus * 60);
  const [running, setRunning] = useState(false);
  const [runId, setRunId] = useState(0);
  const [cycle, setCycle] = useState(0);

  const modeRef = useRef(mode);
  const cycleRef = useRef(cycle);
  const runningRef = useRef(running);
  const secondsRef = useRef(secondsLeft);
  const settingsRef = useRef(settings);
  const onFocusCompleteRef = useRef(onFocusComplete);
  const onElapsedRef = useRef(onElapsed);

  modeRef.current = mode;
  cycleRef.current = cycle;
  runningRef.current = running;
  settingsRef.current = settings;
  onFocusCompleteRef.current = onFocusComplete;
  onElapsedRef.current = onElapsed;

  const applySeconds = useCallback((value) => {
    secondsRef.current = value;
    setSecondsLeft(value);
  }, []);

  const complete = useCallback(() => {
    playChime();
    const s = settingsRef.current;
    const finished = modeRef.current;
    let next = 'focus';

    if (finished === 'focus') {
      const nextCycle = Math.min(cycleRef.current + 1, CYCLE_LENGTH);
      cycleRef.current = nextCycle;
      setCycle(nextCycle);
      onFocusCompleteRef.current?.(s.focus);
      next = nextCycle >= CYCLE_LENGTH ? 'long' : 'short';
    } else if (finished === 'long') {
      cycleRef.current = 0;
      setCycle(0);
    }

    modeRef.current = next;
    setMode(next);
    applySeconds(s[next] * 60);

    const autoStart = next === 'focus' ? s.autoStartFocus : s.autoStartBreaks;
    if (autoStart) {
      setRunning(true);
      setRunId((id) => id + 1); // restart the interval effect
    } else {
      setRunning(false);
    }
  }, [applySeconds]);

  // The ticking loop.
  useEffect(() => {
    if (!running) return undefined;
    const endAt = Date.now() + secondsRef.current * 1000;

    const id = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
      const previous = secondsRef.current;
      if (remaining !== previous) {
        secondsRef.current = remaining;
        setSecondsLeft(remaining);
        if (modeRef.current === 'focus') {
          onElapsedRef.current?.(previous - remaining);
        }
      }
      if (remaining === 0) {
        clearInterval(id);
        complete();
      }
    }, 250);

    return () => clearInterval(id);
  }, [running, runId, complete]);

  const toggle = useCallback(() => {
    if (runningRef.current) {
      setRunning(false);
    } else {
      unlockAudio();
      setRunning(true);
      setRunId((id) => id + 1);
    }
  }, []);

  const reset = useCallback(() => {
    setRunning(false);
    applySeconds(settingsRef.current[modeRef.current] * 60);
  }, [applySeconds]);

  const switchMode = useCallback(
    (next) => {
      setRunning(false);
      modeRef.current = next;
      setMode(next);
      applySeconds(settingsRef.current[next] * 60);
    },
    [applySeconds],
  );

  // If the user edits the current mode's duration while idle, reflect it.
  const totalSeconds = settings[mode] * 60;
  useEffect(() => {
    if (!runningRef.current) applySeconds(totalSeconds);
  }, [totalSeconds, applySeconds]);

  return { mode, secondsLeft, totalSeconds, running, cycle, toggle, reset, switchMode };
}
