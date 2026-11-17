import { ListTodo, Music, Pause, PictureInPicture2, Play, Square } from 'lucide-react';
import styles from './BottomDock.module.css';

export default function BottomDock({
  t,
  running,
  hasProgress, // timer has been started and paused mid-way
  onToggle,
  onReset,
  musicOpen,
  onToggleMusic,
  pipOpen,
  onTogglePip,
  tasksOpen,
  onToggleTasks,
}) {
  const primaryLabel = running ? t('timer.pause') : hasProgress ? t('timer.resume') : t('timer.start');

  return (
    <div className={styles.dock}>
      <div className={styles.bar} role="toolbar" aria-label="Timer controls">
        <button
          type="button"
          className={`${styles.iconBtn} ${musicOpen ? styles.iconActive : ''}`}
          onClick={onToggleMusic}
          aria-label={t('dock.music')}
          aria-pressed={musicOpen}
          title={t('dock.music')}
        >
          <Music size={21} />
        </button>

        <button
          type="button"
          className={styles.iconBtn}
          onClick={onReset}
          aria-label={t('timer.reset')}
          title={t('timer.reset')}
        >
          <Square size={19} />
        </button>

        <button type="button" className={styles.primary} onClick={onToggle}>
          {running ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
          <span>{primaryLabel}</span>
        </button>

        <button
          type="button"
          className={`${styles.iconBtn} ${pipOpen ? styles.iconActive : ''}`}
          onClick={onTogglePip}
          aria-label={t('dock.pip')}
          aria-pressed={pipOpen}
          title={t('dock.pip')}
        >
          <PictureInPicture2 size={21} />
        </button>

        <button
          type="button"
          className={`${styles.iconBtn} ${tasksOpen ? styles.iconActive : ''}`}
          onClick={onToggleTasks}
          aria-label={t('dock.tasks')}
          aria-pressed={tasksOpen}
          title={t('dock.tasks')}
        >
          <ListTodo size={21} />
        </button>
      </div>
    </div>
  );
}
