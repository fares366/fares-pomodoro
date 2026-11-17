import { useRef } from 'react';
import { Check, ChevronRight, Trash2, X } from 'lucide-react';
import { ACCENT_COLORS, AMBIENT_OPTIONS, WALLPAPERS } from '../../data/config';
import styles from './AestheticsDrawer.module.css';

function SelectedBadge() {
  return (
    <span className={styles.check} aria-hidden="true">
      <Check size={12} strokeWidth={3.5} />
    </span>
  );
}

export default function AestheticsDrawer({
  open,
  onClose,
  t,
  aesthetics,
  wallpaper, // effective wallpaper id (may be 'custom')
  customPhoto,
  onChange,
  onUploadPhoto,
  onRemovePhoto,
}) {
  const fileRef = useRef(null);

  const handleFile = (event) => {
    const file = event.target.files && event.target.files[0];
    if (file) onUploadPhoto(file);
    event.target.value = ''; // allow re-selecting the same file
  };

  return (
    <aside
      className={`${styles.drawer} ${open ? styles.open : ''}`}
      aria-label={t('aesthetics.title')}
      aria-hidden={!open}
    >
      <div className={styles.head}>
        <h2 className={styles.title}>{t('aesthetics.title')}</h2>
        <button
          type="button"
          className={styles.closeBtn}
          onClick={onClose}
          aria-label={t('aesthetics.close')}
        >
          <X size={18} />
        </button>
      </div>

      <div className={styles.body}>
        {/* 1. Timer style */}
        <section className={styles.section}>
          <h3 className={styles.label}>{t('aesthetics.timerStyle')}</h3>
          <div className={styles.styleRow}>
            <button
              type="button"
              className={`${styles.card} ${aesthetics.timerStyle === 'ring' ? styles.selected : ''}`}
              aria-pressed={aesthetics.timerStyle === 'ring'}
              onClick={() => onChange({ timerStyle: 'ring' })}
            >
              <span className={styles.preview}>
                <svg className={styles.miniRing} viewBox="0 0 64 64" aria-hidden="true">
                  <circle className={styles.miniTrack} cx="32" cy="32" r="26" />
                  <circle
                    className={styles.miniProgress}
                    cx="32"
                    cy="32"
                    r="26"
                    strokeDasharray="163.4"
                    strokeDashoffset="48"
                  />
                </svg>
                <span className={styles.miniTime}>25:00</span>
              </span>
              <span className={styles.cardLabel}>{t('aesthetics.ring')}</span>
              {aesthetics.timerStyle === 'ring' && <SelectedBadge />}
            </button>

            <button
              type="button"
              className={`${styles.card} ${aesthetics.timerStyle === 'numbers' ? styles.selected : ''}`}
              aria-pressed={aesthetics.timerStyle === 'numbers'}
              onClick={() => onChange({ timerStyle: 'numbers' })}
            >
              <span className={styles.preview}>
                <span className={styles.bigNumbers}>25:00</span>
              </span>
              <span className={styles.cardLabel}>{t('aesthetics.numbers')}</span>
              {aesthetics.timerStyle === 'numbers' && <SelectedBadge />}
            </button>
          </div>
        </section>

        {/* 2. Background */}
        <section className={styles.section}>
          <h3 className={styles.label}>{t('aesthetics.background')}</h3>
          <div className={styles.grid}>
            {WALLPAPERS.map(({ id }) => {
              const selected = wallpaper === id;
              return (
                <button
                  key={id}
                  type="button"
                  className={`${styles.thumb} ${styles[`thumb_${id}`]} ${selected ? styles.selected : ''}`}
                  aria-pressed={selected}
                  onClick={() => onChange({ wallpaper: id })}
                >
                  <span className={styles.thumbLabel}>{t(`aesthetics.wallpapers.${id}`)}</span>
                  {selected && <SelectedBadge />}
                </button>
              );
            })}
          </div>

          <div className={styles.photosHead}>
            <h3 className={styles.label}>{t('aesthetics.yourPhotos')}</h3>
            <button type="button" className={styles.newBtn} onClick={() => fileRef.current?.click()}>
              {t('aesthetics.newPhoto')}
              <ChevronRight size={15} className={styles.chev} />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className={styles.hiddenInput}
              onChange={handleFile}
              tabIndex={-1}
              aria-hidden="true"
            />
          </div>

          {customPhoto && (
            <div className={styles.photoRow}>
              <button
                type="button"
                className={`${styles.thumb} ${styles.photoThumb} ${wallpaper === 'custom' ? styles.selected : ''}`}
                aria-pressed={wallpaper === 'custom'}
                onClick={() => onChange({ wallpaper: 'custom' })}
              >
                <img className={styles.photoImg} src={customPhoto} alt="" />
                <span className={styles.thumbLabel}>{t('aesthetics.myPhoto')}</span>
                {wallpaper === 'custom' && <SelectedBadge />}
              </button>
              <button
                type="button"
                className={styles.removeBtn}
                onClick={onRemovePhoto}
                aria-label={t('aesthetics.removePhoto')}
                title={t('aesthetics.removePhoto')}
              >
                <Trash2 size={17} />
              </button>
            </div>
          )}
        </section>

        {/* 3. Accent color */}
        <section className={styles.section}>
          <h3 className={styles.label}>{t('aesthetics.accent')}</h3>
          <div className={styles.swatches}>
            {ACCENT_COLORS.map(({ id, value }) => {
              const selected = aesthetics.accent.toLowerCase() === value.toLowerCase();
              return (
                <button
                  key={id}
                  type="button"
                  className={`${styles.swatch} ${selected ? styles.swatchSelected : ''}`}
                  aria-label={t(`colors.${id}`)}
                  aria-pressed={selected}
                  title={t(`colors.${id}`)}
                  onClick={() => onChange({ accent: value })}
                >
                  <svg viewBox="0 0 32 32" aria-hidden="true">
                    <circle cx="16" cy="16" r="13" fill={value} />
                  </svg>
                  {selected && <Check className={styles.swatchCheck} size={16} strokeWidth={3.5} />}
                </button>
              );
            })}
          </div>
        </section>

        {/* 4. Ambient effect */}
        <section className={styles.section}>
          <h3 className={styles.label}>{t('aesthetics.ambient')}</h3>
          <div className={styles.segment} role="group" aria-label={t('aesthetics.ambient')}>
            {AMBIENT_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                className={`${styles.segBtn} ${aesthetics.ambient === option ? styles.segActive : ''}`}
                aria-pressed={aesthetics.ambient === option}
                onClick={() => onChange({ ambient: option })}
              >
                {t(`aesthetics.ambientOptions.${option}`)}
              </button>
            ))}
          </div>
        </section>
      </div>
    </aside>
  );
}
