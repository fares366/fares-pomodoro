import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Plus, Search, Trash2, X } from 'lucide-react';
import { formatTracked } from '../../utils/format';
import styles from './TaskDrawer.module.css';

export default function TaskDrawer({
  open,
  onClose,
  t,
  tasks,
  activeTaskId,
  onSelect,
  onToggleDone,
  onAdd,
  onDelete,
  onDeleteClosed,
}) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState('');
  const [closedOpen, setClosedOpen] = useState(true);
  const addRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    if (adding) addRef.current?.focus();
  }, [adding]);

  useEffect(() => {
    if (searching) searchRef.current?.focus();
  }, [searching]);

  const total = tasks.length;
  const doneCount = tasks.filter((task) => task.done).length;

  const { active, closed } = useMemo(() => {
    const q = query.trim().toLowerCase();
    const visible = q ? tasks.filter((task) => task.title.toLowerCase().includes(q)) : tasks;
    return {
      active: visible.filter((task) => !task.done),
      closed: visible.filter((task) => task.done),
    };
  }, [tasks, query]);

  const submit = () => {
    const title = draft.trim();
    if (title) onAdd(title);
    setDraft('');
    setAdding(false);
  };

  const cancelAdd = () => {
    setDraft('');
    setAdding(false);
  };

  const toggleSearch = () => {
    setSearching((value) => {
      if (value) setQuery('');
      return !value;
    });
  };

  return (
    <aside
      className={`${styles.drawer} ${open ? styles.open : ''}`}
      aria-label={t('tasks.title')}
      aria-hidden={!open}
    >
      <div className={styles.head}>
        <h2 className={styles.title}>{t('tasks.title')}</h2>
        <div className={styles.headActions}>
          <button
            type="button"
            className={`${styles.iconBtn} ${searching ? styles.iconActive : ''}`}
            onClick={toggleSearch}
            aria-label={t('tasks.search')}
            aria-pressed={searching}
            title={t('tasks.search')}
          >
            <Search size={18} />
          </button>
          <button
            type="button"
            className={styles.iconBtn}
            onClick={onClose}
            aria-label={t('tasks.close')}
            title={t('tasks.close')}
          >
            <X size={19} />
          </button>
        </div>
      </div>

      {searching && (
        <div className={styles.searchWrap}>
          <Search size={15} className={styles.searchIcon} aria-hidden="true" />
          <input
            ref={searchRef}
            className={styles.searchInput}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('tasks.searchPlaceholder')}
            aria-label={t('tasks.search')}
          />
        </div>
      )}

      <div className={styles.progressRow}>
        <progress
          className={styles.progress}
          value={doneCount}
          max={Math.max(total, 1)}
          aria-label={t('tasks.progress')}
        />
        <span className={styles.progressCount}>
          {doneCount}/{total}
        </span>
      </div>

      <div className={styles.scroll}>
        {adding ? (
          <div className={styles.addForm}>
            <input
              ref={addRef}
              className={styles.addInput}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') submit();
                if (event.key === 'Escape') cancelAdd();
              }}
              placeholder={t('tasks.placeholder')}
              maxLength={120}
              aria-label={t('tasks.placeholder')}
            />
            <div className={styles.addActions}>
              <button type="button" className={styles.ghostBtn} onClick={cancelAdd}>
                {t('tasks.cancel')}
              </button>
              <button type="button" className={styles.solidBtn} onClick={submit}>
                {t('tasks.save')}
              </button>
            </div>
          </div>
        ) : (
          <button type="button" className={styles.addBtn} onClick={() => setAdding(true)}>
            <Plus size={17} />
            {t('tasks.add')}
          </button>
        )}

        {total === 0 && <p className={styles.empty}>{t('tasks.empty')}</p>}
        {total > 0 && active.length === 0 && closed.length === 0 && (
          <p className={styles.empty}>{t('tasks.noMatches')}</p>
        )}

        <ul className={styles.list}>
          {active.map((task) => {
            const selected = task.id === activeTaskId;
            return (
              <li key={task.id} className={`${styles.row} ${selected ? styles.rowSelected : ''}`}>
                <button
                  type="button"
                  className={styles.circle}
                  onClick={() => onToggleDone(task.id)}
                  aria-label={t('tasks.complete')}
                  title={t('tasks.complete')}
                >
                  <Check size={13} strokeWidth={3.5} />
                </button>
                <button
                  type="button"
                  className={styles.rowMain}
                  onClick={() => onSelect(task.id)}
                  aria-pressed={selected}
                  title={t('tasks.select')}
                >
                  <span className={styles.rowTitle}>{task.title}</span>
                </button>
                <span className={`${styles.time} ${selected ? styles.timeActive : ''}`}>
                  {formatTracked(task.seconds)}
                </span>
                <button
                  type="button"
                  className={styles.trash}
                  onClick={() => onDelete(task.id)}
                  aria-label={t('tasks.delete')}
                  title={t('tasks.delete')}
                >
                  <Trash2 size={15} />
                </button>
              </li>
            );
          })}
        </ul>

        {closed.length > 0 && (
          <div className={styles.closedBlock}>
            <div className={styles.closedHead}>
              <button
                type="button"
                className={styles.closedToggle}
                onClick={() => setClosedOpen((value) => !value)}
                aria-expanded={closedOpen}
              >
                <ChevronDown
                  size={15}
                  className={`${styles.chevron} ${closedOpen ? '' : styles.chevronClosed}`}
                />
                {t('tasks.closed')} • {closed.length}
              </button>
              <button type="button" className={styles.deleteAll} onClick={onDeleteClosed}>
                {t('tasks.deleteAll')}
              </button>
            </div>

            {closedOpen && (
              <ul className={styles.list}>
                {closed.map((task) => (
                  <li key={task.id} className={`${styles.row} ${styles.rowClosed}`}>
                    <button
                      type="button"
                      className={`${styles.circle} ${styles.circleDone}`}
                      onClick={() => onToggleDone(task.id)}
                      aria-label={t('tasks.reopen')}
                      title={t('tasks.reopen')}
                    >
                      <Check size={13} strokeWidth={3.5} />
                    </button>
                    <span className={`${styles.rowMain} ${styles.rowMainStatic}`}>
                      <span className={styles.rowTitle}>{task.title}</span>
                    </span>
                    <span className={styles.time}>{formatTracked(task.seconds)}</span>
                    <button
                      type="button"
                      className={styles.trash}
                      onClick={() => onDelete(task.id)}
                      aria-label={t('tasks.delete')}
                      title={t('tasks.delete')}
                    >
                      <Trash2 size={15} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
