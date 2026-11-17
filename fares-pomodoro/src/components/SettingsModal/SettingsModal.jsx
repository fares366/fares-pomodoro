import { useEffect, useState } from 'react';
import { Minus, Plus, X } from 'lucide-react';
import styles from './SettingsModal.module.css';

const MIN_MINUTES = 1;
const MAX_MINUTES = 180;

const clamp = (n) => Math.min(MAX_MINUTES, Math.max(MIN_MINUTES, n));

function DurationField({ id, label, unit, value, onCommit, t }) {
  const [draft, setDraft] = useState(String(value));

  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  const commit = (raw) => {
    const parsed = parseInt(raw, 10);
    const next = clamp(Number.isNaN(parsed) ? value : parsed);
    setDraft(String(next));
    if (next !== value) onCommit(next);
  };

  return (
    <div className={styles.field}>
      <label className={styles.fieldLabel} htmlFor={id}>
        {label}
      </label>
      <div className={styles.stepper}>
        <button
          type="button"
          className={styles.stepBtn}
          onClick={() => commit(String(value - 1))}
          aria-label={`${t('settings.decrease')} ${label}`}
          disabled={value <= MIN_MINUTES}
        >
          <Minus size={16} />
        </button>
        <input
          id={id}
          className={styles.numberInput}
          inputMode="numeric"
          value={draft}
          onChange={(event) => setDraft(event.target.value.replace(/\D/g, '').slice(0, 3))}
          onBlur={() => commit(draft)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') event.currentTarget.blur();
          }}
        />
        <button
          type="button"
          className={styles.stepBtn}
          onClick={() => commit(String(value + 1))}
          aria-label={`${t('settings.increase')} ${label}`}
          disabled={value >= MAX_MINUTES}
        >
          <Plus size={16} />
        </button>
        <span className={styles.unit}>{unit}</span>
      </div>
    </div>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <div className={styles.toggleRow}>
      <span className={styles.toggleLabel}>{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        className={`${styles.switch} ${checked ? styles.switchOn : ''}`}
        onClick={() => onChange(!checked)}
      >
        <span className={styles.thumb} />
      </button>
    </div>
  );
}

export default function SettingsModal({ open, onClose, t, settings, onChange }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className={styles.backdrop} onMouseDown={onClose}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-label={t('settings.title')}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className={styles.head}>
          <h2 className={styles.title}>{t('settings.title')}</h2>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label={t('settings.close')}
          >
            <X size={18} />
          </button>
        </div>

        <section className={styles.section}>
          <h3 className={styles.label}>{t('settings.durations')}</h3>
          <DurationField
            id="dur-focus"
            label={t('settings.focus')}
            unit={t('settings.minutes')}
            value={settings.focus}
            onCommit={(focus) => onChange({ focus })}
            t={t}
          />
          <DurationField
            id="dur-short"
            label={t('settings.short')}
            unit={t('settings.minutes')}
            value={settings.short}
            onCommit={(short) => onChange({ short })}
            t={t}
          />
          <DurationField
            id="dur-long"
            label={t('settings.long')}
            unit={t('settings.minutes')}
            value={settings.long}
            onCommit={(long) => onChange({ long })}
            t={t}
          />
        </section>

        <section className={styles.section}>
          <h3 className={styles.label}>{t('settings.automation')}</h3>
          <Toggle
            label={t('settings.autoBreaks')}
            checked={settings.autoStartBreaks}
            onChange={(autoStartBreaks) => onChange({ autoStartBreaks })}
          />
          <Toggle
            label={t('settings.autoFocus')}
            checked={settings.autoStartFocus}
            onChange={(autoStartFocus) => onChange({ autoStartFocus })}
          />
        </section>

        <button type="button" className={styles.doneBtn} onClick={onClose}>
          {t('settings.done')}
        </button>
      </div>
    </div>
  );
}
