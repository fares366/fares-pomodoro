import { useEffect, useState } from 'react';
import { Music, X } from 'lucide-react';
import { DEFAULT_SPOTIFY_URL } from '../../data/config';
import styles from './MusicModal.module.css';

const URL_PATTERN =
  /^https?:\/\/open\.spotify\.com\/(?:intl-[a-z]{2}\/)?(track|playlist|album|artist|episode|show)\/([A-Za-z0-9]+)/i;
const URI_PATTERN = /^spotify:(track|playlist|album|artist|episode|show):([A-Za-z0-9]+)$/i;

// Turn any Spotify share link / URI into an embeddable player URL.
export function toSpotifyEmbed(input) {
  const value = (input || '').trim();
  const match = value.match(URL_PATTERN) || value.match(URI_PATTERN);
  if (!match) return null;
  const type = match[1].toLowerCase();
  const id = match[2];
  const compact = type === 'track' || type === 'episode';
  return {
    src: `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`,
    height: compact ? 152 : 352,
  };
}

export default function MusicModal({ open, onClose, t, url, onChangeUrl }) {
  const [draft, setDraft] = useState(url);
  const [error, setError] = useState(false);

  useEffect(() => {
    setDraft(url);
  }, [url]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const embed = toSpotifyEmbed(url) || toSpotifyEmbed(DEFAULT_SPOTIFY_URL);

  const submit = (event) => {
    event.preventDefault();
    if (toSpotifyEmbed(draft)) {
      setError(false);
      onChangeUrl(draft.trim());
    } else {
      setError(true);
    }
  };

  const resetToDefault = () => {
    setError(false);
    setDraft(DEFAULT_SPOTIFY_URL);
    onChangeUrl(DEFAULT_SPOTIFY_URL);
  };

  return (
    // Stays mounted while closed so the music keeps playing.
    <section
      className={`${styles.panel} ${open ? styles.open : ''}`}
      aria-label={t('music.title')}
      aria-hidden={!open}
    >
      <div className={styles.head}>
        <h2 className={styles.title}>
          <Music size={17} />
          {t('music.title')}
        </h2>
        <button
          type="button"
          className={styles.closeBtn}
          onClick={onClose}
          aria-label={t('music.close')}
        >
          <X size={18} />
        </button>
      </div>

      <form className={styles.form} onSubmit={submit}>
        <input
          className={`${styles.input} ${error ? styles.inputError : ''}`}
          value={draft}
          onChange={(event) => {
            setDraft(event.target.value);
            setError(false);
          }}
          placeholder={t('music.placeholder')}
          aria-label={t('music.placeholder')}
          aria-invalid={error}
          spellCheck={false}
          dir="ltr"
        />
        <button type="submit" className={styles.loadBtn}>
          {t('music.load')}
        </button>
      </form>

      {error && <p className={styles.error}>{t('music.invalid')}</p>}

      <iframe
        key={embed.src}
        className={styles.player}
        title={t('music.player')}
        src={embed.src}
        width="100%"
        height={embed.height}
        frameBorder="0"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
      />

      <button type="button" className={styles.resetBtn} onClick={resetToDefault}>
        {t('music.reset')}
      </button>
    </section>
  );
}
