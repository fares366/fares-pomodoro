import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Pause, Play, Square, X } from 'lucide-react';
import styles from './PipTimer.module.css';

const PIP_WIDTH = 360;
const PIP_HEIGHT = 104;

// Copy every stylesheet (CSS Modules, variables, fonts) into the PiP window.
function copyStyles(targetWindow) {
  Array.from(document.styleSheets).forEach((sheet) => {
    try {
      const css = Array.from(sheet.cssRules)
        .map((rule) => rule.cssText)
        .join('\n');
      const style = targetWindow.document.createElement('style');
      style.textContent = css;
      targetWindow.document.head.appendChild(style);
    } catch {
      // Cross-origin sheet (e.g. Google Fonts): link it instead.
      if (sheet.href) {
        const link = targetWindow.document.createElement('link');
        link.rel = 'stylesheet';
        link.href = sheet.href;
        targetWindow.document.head.appendChild(link);
      }
    }
  });
}

function MiniTimer({ t, running, timeText, modeLabel, onToggle, onReset, onClose }) {
  return (
    <div className={styles.mini}>
      <button
        type="button"
        className={styles.playBtn}
        onClick={onToggle}
        aria-label={running ? t('pip.pause') : t('pip.play')}
      >
        {running ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" />}
      </button>

      <div className={styles.info}>
        <span className={styles.time}>{timeText}</span>
        <span className={styles.mode}>
          <span className={styles.modeDot} aria-hidden="true" />
          {modeLabel}
        </span>
      </div>

      <button
        type="button"
        className={styles.stopBtn}
        onClick={onReset}
        aria-label={t('pip.stop')}
        title={t('pip.stop')}
      >
        <Square size={17} fill="currentColor" />
      </button>

      {onClose && (
        <button
          type="button"
          className={styles.closeBtn}
          onClick={onClose}
          aria-label={t('pip.close')}
          title={t('pip.close')}
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}

/**
 * Picture-in-Picture mini timer.
 * 1) Uses window.documentPictureInPicture when supported (floats above other apps).
 * 2) Otherwise falls back to a draggable in-app floating mini-player.
 */
export default function PipTimer({
  open,
  onClose,
  t,
  running,
  timeText,
  modeLabel,
  onToggle,
  onReset,
  accent,
  dir,
  lang,
}) {
  const [pipWindow, setPipWindow] = useState(null);
  const [pipFailed, setPipFailed] = useState(false);

  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const supported = typeof window !== 'undefined' && 'documentPictureInPicture' in window;
  const useFallback = open && (!supported || pipFailed);

  // Open / close the real Document PiP window.
  useEffect(() => {
    if (!open || !supported) return undefined;

    let cancelled = false;
    let win = null;

    (async () => {
      try {
        win = await window.documentPictureInPicture.requestWindow({
          width: PIP_WIDTH,
          height: PIP_HEIGHT,
        });
        if (cancelled) {
          win.close();
          return;
        }
        copyStyles(win);
        win.document.documentElement.dir = dir;
        win.document.documentElement.lang = lang;
        win.document.body.className = styles.pipBody;
        win.addEventListener('pagehide', () => {
          setPipWindow(null);
          onCloseRef.current();
        });
        setPipWindow(win);
        setPipFailed(false);
      } catch {
        if (!cancelled) setPipFailed(true); // e.g. no user activation -> use fallback
      }
    })();

    return () => {
      cancelled = true;
      if (win && !win.closed) win.close();
      setPipWindow(null);
      setPipFailed(false);
    };
    // dir/lang are applied below in their own effect so they don't reopen the window
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, supported]);

  // Keep the PiP window's accent color + direction in sync.
  useEffect(() => {
    if (!pipWindow || pipWindow.closed) return;
    pipWindow.document.body.style.setProperty('--accent-color', accent);
    pipWindow.document.documentElement.dir = dir;
    pipWindow.document.documentElement.lang = lang;
  }, [pipWindow, accent, dir, lang]);

  // ----- Draggable fallback -----
  const floatRef = useRef(null);
  const offset = useRef({ x: 0, y: 0 });
  const drag = useRef(null);

  const onPointerDown = useCallback((event) => {
    if (event.target.closest('button')) return;
    const el = floatRef.current;
    if (!el) return;
    drag.current = {
      startX: event.clientX,
      startY: event.clientY,
      originX: offset.current.x,
      originY: offset.current.y,
      rect: el.getBoundingClientRect(),
    };
    el.setPointerCapture(event.pointerId);
  }, []);

  const onPointerMove = useCallback((event) => {
    const d = drag.current;
    const el = floatRef.current;
    if (!d || !el) return;
    let dx = event.clientX - d.startX;
    let dy = event.clientY - d.startY;
    // keep the mini-player inside the viewport
    dx = Math.min(Math.max(dx, -d.rect.left), window.innerWidth - d.rect.right);
    dy = Math.min(Math.max(dy, -d.rect.top), window.innerHeight - d.rect.bottom);
    offset.current = { x: d.originX + dx, y: d.originY + dy };
    el.style.setProperty('--drag-x', `${offset.current.x}px`);
    el.style.setProperty('--drag-y', `${offset.current.y}px`);
  }, []);

  const onPointerUp = useCallback(() => {
    drag.current = null;
  }, []);

  const content = (withClose) => (
    <MiniTimer
      t={t}
      running={running}
      timeText={timeText}
      modeLabel={modeLabel}
      onToggle={onToggle}
      onReset={onReset}
      onClose={withClose ? onClose : undefined}
    />
  );

  if (pipWindow && !pipWindow.closed) {
    return createPortal(<div className={styles.pipRoot}>{content(false)}</div>, pipWindow.document.body);
  }

  if (useFallback) {
    return (
      <div
        ref={floatRef}
        className={styles.floating}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        title={t('pip.drag')}
      >
        <div className={styles.pipRoot}>{content(true)}</div>
      </div>
    );
  }

  return null;
}
