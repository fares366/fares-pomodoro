import { useEffect, useRef, useState } from 'react';
import { Flame, Palette, Settings, Trophy } from 'lucide-react';
import { formatMinutes } from '../../utils/format';
import styles from './Sidebar.module.css';

export default function Sidebar({
  t,
  stats,
  streak,
  aestheticsOpen,
  onToggleAesthetics,
  onOpenSettings,
}) {
  const [popover, setPopover] = useState(null); // 'stats' | 'streak' | null
  const rootRef = useRef(null);

  useEffect(() => {
    if (!popover) return undefined;
    const onDown = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) setPopover(null);
    };
    const onKey = (event) => {
      if (event.key === 'Escape') setPopover(null);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [popover]);

  const togglePopover = (name) => setPopover((current) => (current === name ? null : name));

  return (
    <nav className={styles.sidebar} ref={rootRef} aria-label="Main">
      <div className={styles.item}>
        <button
          type="button"
          className={`${styles.btn} ${popover === 'stats' ? styles.active : ''}`}
          onClick={() => togglePopover('stats')}
          aria-label={t('nav.stats')}
          aria-expanded={popover === 'stats'}
          title={t('nav.stats')}
        >
          <Trophy size={21} />
        </button>
        {popover === 'stats' && (
          <div className={styles.popover} role="dialog" aria-label={t('stats.title')}>
            <h3 className={styles.popTitle}>{t('stats.title')}</h3>
            <dl className={styles.statList}>
              <div className={styles.statRow}>
                <dt>{t('stats.focusTime')}</dt>
                <dd>{formatMinutes(stats.focusMinutes)}</dd>
              </div>
              <div className={styles.statRow}>
                <dt>{t('stats.sessions')}</dt>
                <dd>{stats.sessions}</dd>
              </div>
            </dl>
          </div>
        )}
      </div>

      <div className={styles.item}>
        <button
          type="button"
          className={`${styles.btn} ${popover === 'streak' ? styles.active : ''}`}
          onClick={() => togglePopover('streak')}
          aria-label={`${t('nav.streak')}: ${streak}`}
          aria-expanded={popover === 'streak'}
          title={t('nav.streak')}
        >
          <Flame size={21} />
          <span className={styles.badge}>{streak}</span>
        </button>
        {popover === 'streak' && (
          <div className={styles.popover} role="dialog" aria-label={t('streak.title')}>
            <h3 className={styles.popTitle}>{t('streak.title')}</h3>
            <p className={styles.streakValue}>{t('streak.label', { n: streak })}</p>
            <p className={styles.hint}>{t('streak.hint')}</p>
          </div>
        )}
      </div>

      <div className={styles.item}>
        <button
          type="button"
          className={`${styles.btn} ${aestheticsOpen ? styles.active : ''}`}
          onClick={() => {
            setPopover(null);
            onToggleAesthetics();
          }}
          aria-label={t('nav.aesthetics')}
          aria-pressed={aestheticsOpen}
          title={t('nav.aesthetics')}
        >
          <Palette size={21} />
        </button>
      </div>

      <div className={styles.item}>
        <button
          type="button"
          className={styles.btn}
          onClick={() => {
            setPopover(null);
            onOpenSettings();
          }}
          aria-label={t('nav.settings')}
          title={t('nav.settings')}
        >
          <Settings size={21} />
        </button>
      </div>
    </nav>
  );
}
