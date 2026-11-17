import styles from './AmbientEffect.module.css';

// Purely decorative CSS overlay. effect: 'none' | 'rain' | 'embers' | 'glow'
export default function AmbientEffect({ effect }) {
  if (!effect || effect === 'none') return null;
  return (
    <div className={styles.wrap} aria-hidden="true">
      <div className={`${styles.layer} ${styles[effect]}`} />
    </div>
  );
}
