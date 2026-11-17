import { LANGUAGES } from '../../data/config';
import styles from './Header.module.css';

export default function Header({ lang, onLangChange, t }) {
  return (
    <header className={styles.header}>
      <h1 className={styles.brand}>FARES POMODORO</h1>

      <div className={styles.langPill} role="group" aria-label={t('language.label')}>
        {LANGUAGES.map(({ code, label }, index) => (
          <span key={code} className={styles.langItem}>
            {index > 0 && <span className={styles.divider} aria-hidden="true" />}
            <button
              type="button"
              className={`${styles.langBtn} ${lang === code ? styles.langActive : ''}`}
              aria-pressed={lang === code}
              onClick={() => onLangChange(code)}
            >
              {label}
            </button>
          </span>
        ))}
      </div>
    </header>
  );
}
