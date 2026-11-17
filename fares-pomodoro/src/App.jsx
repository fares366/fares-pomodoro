import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import Header from './components/Header/Header';
import Sidebar from './components/Sidebar/Sidebar';
import AestheticsDrawer from './components/AestheticsDrawer/AestheticsDrawer';
import AmbientEffect from './components/AmbientEffect/AmbientEffect';
import Timer from './components/Timer/Timer';
import BottomDock from './components/BottomDock/BottomDock';
import PipTimer from './components/PipTimer/PipTimer';
import TaskDrawer from './components/TaskDrawer/TaskDrawer';
import MusicModal from './components/MusicModal/MusicModal';
import SettingsModal from './components/SettingsModal/SettingsModal';

import {
  DEFAULT_AESTHETICS,
  DEFAULT_SETTINGS,
  DEFAULT_SPOTIFY_URL,
  LANGUAGES,
  WALLPAPERS,
} from './data/config';
import { QUOTES } from './data/quotes';
import { createTranslator } from './data/translations';
import { useLocalStorage } from './hooks/useLocalStorage';
import { usePomodoro } from './hooks/usePomodoro';
import { dateKey, formatClock, makeId, yesterdayKey } from './utils/format';
import { fileToResizedDataUrl } from './utils/image';

import styles from './App.module.css';

export default function App() {
  // ------------------------------------------------------------------
  // Persisted state (all in localStorage)
  // ------------------------------------------------------------------
  const [lang, setLang] = useLocalStorage('lang', 'en');
  const [settingsRaw, setSettings] = useLocalStorage('settings', DEFAULT_SETTINGS);
  const [aestheticsRaw, setAesthetics] = useLocalStorage('aesthetics', DEFAULT_AESTHETICS);
  const [customPhoto, setCustomPhoto] = useLocalStorage('custom-photo', null);
  const [tasks, setTasks] = useLocalStorage('tasks', []);
  const [activeTaskId, setActiveTaskId] = useLocalStorage('active-task', null);
  const [spotifyUrl, setSpotifyUrl] = useLocalStorage('spotify-url', DEFAULT_SPOTIFY_URL);
  const [stats, setStats] = useLocalStorage('stats', { focusMinutes: 0, sessions: 0 });
  const [streakRaw, setStreak] = useLocalStorage('streak', { count: 0, lastDate: null });

  const settings = useMemo(() => ({ ...DEFAULT_SETTINGS, ...settingsRaw }), [settingsRaw]);
  const aesthetics = useMemo(() => ({ ...DEFAULT_AESTHETICS, ...aestheticsRaw }), [aestheticsRaw]);

  // ------------------------------------------------------------------
  // UI state
  // ------------------------------------------------------------------
  const [aestheticsOpen, setAestheticsOpen] = useState(false);
  const [tasksOpen, setTasksOpen] = useState(false);
  const [musicOpen, setMusicOpen] = useState(false);
  const [musicMounted, setMusicMounted] = useState(false); // lazy-load the Spotify iframe
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [pipOpen, setPipOpen] = useState(false);

  // ------------------------------------------------------------------
  // Language
  // ------------------------------------------------------------------
  const currentLang = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];
  const dir = currentLang.dir;
  const t = useMemo(() => createTranslator(currentLang.code), [currentLang.code]);

  useEffect(() => {
    document.documentElement.lang = currentLang.code;
    document.documentElement.dir = dir;
  }, [currentLang.code, dir]);

  // ------------------------------------------------------------------
  // Streak + stats
  // ------------------------------------------------------------------
  const streak = useMemo(() => {
    const { count, lastDate } = streakRaw;
    return lastDate === dateKey() || lastDate === yesterdayKey() ? count : 0;
  }, [streakRaw]);

  const handleFocusComplete = useCallback(
    (minutes) => {
      setStats((s) => ({ focusMinutes: s.focusMinutes + minutes, sessions: s.sessions + 1 }));
      setStreak((s) => {
        const today = dateKey();
        if (s.lastDate === today) return s.count > 0 ? s : { count: 1, lastDate: today };
        if (s.lastDate === yesterdayKey()) return { count: s.count + 1, lastDate: today };
        return { count: 1, lastDate: today };
      });
    },
    [setStats, setStreak],
  );

  // ------------------------------------------------------------------
  // Task time tracking (runs while a focus session is ticking)
  // ------------------------------------------------------------------
  const activeTaskIdRef = useRef(activeTaskId);
  activeTaskIdRef.current = activeTaskId;

  const handleElapsed = useCallback(
    (seconds) => {
      const id = activeTaskIdRef.current;
      if (!id || seconds <= 0) return;
      setTasks((prev) =>
        prev.map((task) =>
          task.id === id && !task.done ? { ...task, seconds: task.seconds + seconds } : task,
        ),
      );
    },
    [setTasks],
  );

  // ------------------------------------------------------------------
  // Timer engine
  // ------------------------------------------------------------------
  const { mode, secondsLeft, totalSeconds, running, cycle, toggle, reset, switchMode } =
    usePomodoro({ settings, onFocusComplete: handleFocusComplete, onElapsed: handleElapsed });

  const clock = formatClock(secondsLeft);
  const modeLabel = t(`modes.${mode}`);
  const hasProgress = !running && secondsLeft < totalSeconds;

  useEffect(() => {
    document.title = running ? `${clock} · ${modeLabel} — FARES POMODORO` : 'FARES POMODORO';
  }, [running, clock, modeLabel]);

  // ------------------------------------------------------------------
  // Motivational quote (new one on every mode change)
  // ------------------------------------------------------------------
  const [quoteIndex, setQuoteIndex] = useState(() => Math.floor(Math.random() * QUOTES.length));
  const firstMode = useRef(true);
  useEffect(() => {
    if (firstMode.current) {
      firstMode.current = false;
      return;
    }
    setQuoteIndex((current) => {
      const next = Math.floor(Math.random() * (QUOTES.length - 1));
      return next >= current ? next + 1 : next; // never repeat the same quote
    });
  }, [mode]);
  const quote = QUOTES[quoteIndex][currentLang.code] || QUOTES[quoteIndex].en;

  // ------------------------------------------------------------------
  // Aesthetics
  // ------------------------------------------------------------------
  const updateAesthetics = useCallback(
    (partial) => setAesthetics((prev) => ({ ...DEFAULT_AESTHETICS, ...prev, ...partial })),
    [setAesthetics],
  );

  const effectiveWallpaper =
    aesthetics.wallpaper === 'custom' && !customPhoto
      ? DEFAULT_AESTHETICS.wallpaper
      : aesthetics.wallpaper;

  const bgImage = useMemo(() => {
    if (effectiveWallpaper === 'custom' && customPhoto) return `url("${customPhoto}")`;
    const found = WALLPAPERS.find((w) => w.id === effectiveWallpaper) || WALLPAPERS[3];
    return found.css;
  }, [effectiveWallpaper, customPhoto]);

  const handlePhotoUpload = useCallback(
    async (file) => {
      try {
        const dataUrl = await fileToResizedDataUrl(file);
        setCustomPhoto(dataUrl);
        updateAesthetics({ wallpaper: 'custom' });
      } catch {
        /* not an image / unreadable — ignore */
      }
    },
    [setCustomPhoto, updateAesthetics],
  );

  const handlePhotoRemove = useCallback(() => {
    setCustomPhoto(null);
    if (aesthetics.wallpaper === 'custom') updateAesthetics({ wallpaper: DEFAULT_AESTHETICS.wallpaper });
  }, [aesthetics.wallpaper, setCustomPhoto, updateAesthetics]);

  // ------------------------------------------------------------------
  // Tasks
  // ------------------------------------------------------------------
  const activeTask = tasks.find((task) => task.id === activeTaskId && !task.done) || null;

  const addTask = useCallback(
    (title) => {
      const task = { id: makeId(), title, done: false, seconds: 0 };
      setTasks((prev) => [...prev, task]);
      setActiveTaskId((current) => current ?? task.id);
    },
    [setTasks, setActiveTaskId],
  );

  const selectTask = useCallback(
    (id) => setActiveTaskId((current) => (current === id ? null : id)),
    [setActiveTaskId],
  );

  const toggleTaskDone = useCallback(
    (id) => {
      const target = tasks.find((task) => task.id === id);
      if (!target) return;
      setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, done: !task.done } : task)));
      if (!target.done) setActiveTaskId((current) => (current === id ? null : current));
    },
    [tasks, setTasks, setActiveTaskId],
  );

  const deleteTask = useCallback(
    (id) => {
      setTasks((prev) => prev.filter((task) => task.id !== id));
      setActiveTaskId((current) => (current === id ? null : current));
    },
    [setTasks, setActiveTaskId],
  );

  const deleteClosedTasks = useCallback(
    () => setTasks((prev) => prev.filter((task) => !task.done)),
    [setTasks],
  );

  // ------------------------------------------------------------------
  // Misc handlers
  // ------------------------------------------------------------------
  const updateSettings = useCallback(
    (partial) => setSettings((prev) => ({ ...DEFAULT_SETTINGS, ...prev, ...partial })),
    [setSettings],
  );

  const toggleMusic = useCallback(() => {
    setMusicMounted(true);
    setMusicOpen((open) => !open);
  }, []);

  const closeMusic = useCallback(() => setMusicOpen(false), []);
  const closeSettings = useCallback(() => setSettingsOpen(false), []);
  const closePip = useCallback(() => setPipOpen(false), []);

  // The only inline style: dynamic CSS custom properties on the root container.
  const rootVars = { '--accent-color': aesthetics.accent, '--bg-image': bgImage };

  return (
    <div className={styles.root} style={rootVars} dir={dir} lang={currentLang.code}>
      <AmbientEffect effect={aesthetics.ambient} />

      <Header lang={currentLang.code} onLangChange={setLang} t={t} />

      <Sidebar
        t={t}
        stats={stats}
        streak={streak}
        aestheticsOpen={aestheticsOpen}
        onToggleAesthetics={() => setAestheticsOpen((open) => !open)}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      <AestheticsDrawer
        open={aestheticsOpen}
        onClose={() => setAestheticsOpen(false)}
        t={t}
        aesthetics={aesthetics}
        wallpaper={effectiveWallpaper}
        customPhoto={customPhoto}
        onChange={updateAesthetics}
        onUploadPhoto={handlePhotoUpload}
        onRemovePhoto={handlePhotoRemove}
      />

      <main className={styles.main}>
        <Timer
          t={t}
          mode={mode}
          onModeChange={switchMode}
          secondsLeft={secondsLeft}
          totalSeconds={totalSeconds}
          timerStyle={aesthetics.timerStyle}
          cycle={cycle}
          activeTask={activeTask}
          quote={quote}
        />
      </main>

      <TaskDrawer
        open={tasksOpen}
        onClose={() => setTasksOpen(false)}
        t={t}
        tasks={tasks}
        activeTaskId={activeTaskId}
        onSelect={selectTask}
        onToggleDone={toggleTaskDone}
        onAdd={addTask}
        onDelete={deleteTask}
        onDeleteClosed={deleteClosedTasks}
      />

      {musicMounted && (
        <MusicModal
          open={musicOpen}
          onClose={closeMusic}
          t={t}
          url={spotifyUrl}
          onChangeUrl={setSpotifyUrl}
        />
      )}

      <BottomDock
        t={t}
        running={running}
        hasProgress={hasProgress}
        onToggle={toggle}
        onReset={reset}
        musicOpen={musicOpen}
        onToggleMusic={toggleMusic}
        pipOpen={pipOpen}
        onTogglePip={() => setPipOpen((open) => !open)}
        tasksOpen={tasksOpen}
        onToggleTasks={() => setTasksOpen((open) => !open)}
      />

      <PipTimer
        open={pipOpen}
        onClose={closePip}
        t={t}
        running={running}
        timeText={clock}
        modeLabel={modeLabel}
        onToggle={toggle}
        onReset={reset}
        accent={aesthetics.accent}
        dir={dir}
        lang={currentLang.code}
      />

      <SettingsModal
        open={settingsOpen}
        onClose={closeSettings}
        t={t}
        settings={settings}
        onChange={updateSettings}
      />
    </div>
  );
}
