import { CYCLE_LENGTH } from '../../hooks/usePomodoro';
import { formatClock } from '../../utils/format';
import styles from './Timer.module.css';

const MODES = ['focus', 'short', 'long'];

const RADIUS = 140;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function Timer({
  t,
  mode,
  onModeChange,
  secondsLeft,
  totalSeconds,
  timerStyle,
  cycle,
  activeTask,
  quote,
}) {
  const clock = formatClock(secondsLeft);
  const remaining = totalSeconds > 0 ? Math.min(1, Math.max(0, secondsLeft / totalSeconds)) : 0;
  const displayedSession = Math.min(cycle + (mode === 'focus' ? 1 : 0), CYCLE_LENGTH);

  return (
    <section className={styles.timer} aria-label="Pomodoro timer">
      <div className={styles.tabs} role="tablist">
        {MODES.map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={mode === m}
            className={`${styles.tab} ${mode === m ? styles.tabActive : ''}`}
            onClick={() => onModeChange(m)}
          >
            {t(`modes.${m}`)}
            {m === 'focus' && (
              <span className={styles.count}>
                {cycle}/{CYCLE_LENGTH}
              </span>
            )}
          </button>
        ))}
      </div>

      <div
        className={styles.dots}
        role="img"
        aria-label={t('timer.session', { n: displayedSession, total: CYCLE_LENGTH })}
      >
        {Array.from({ length: CYCLE_LENGTH }, (_, i) => (
          <span key={i} className={`${styles.dot} ${i < cycle ? styles.dotOn : ''}`} />
        ))}
      </div>

      {timerStyle === 'ring' ? (
        <div className={styles.ringWrap} role="timer" aria-label={clock}>
          <svg className={styles.ringSvg} viewBox="0 0 320 320" aria-hidden="true">
            <circle className={styles.ringTrack} cx="160" cy="160" r={RADIUS} />
            <circle
              className={styles.ringProgress}
              cx="160"
              cy="160"
              r={RADIUS}
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={CIRCUMFERENCE * (1 - remaining)}
            />
          </svg>
          <span className={styles.ringTime}>{clock}</span>
        </div>
      ) : (
        <div className={styles.numbers} role="timer" aria-label={clock}>
          {clock}
        </div>
      )}

      {activeTask && (
        <div className={styles.taskPill} title={activeTask.title}>
          <span className={styles.pillDot} aria-hidden="true" />
          <span className={styles.pillText}>{activeTask.title}</span>
        </div>
      )}

      <p className={styles.quote}>{quote}</p>
    </section>
  );
}
