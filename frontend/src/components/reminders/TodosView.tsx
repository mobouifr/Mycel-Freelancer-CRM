import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useNotifications from '../../hooks/useNotifications';
import TodoItem from './TodoItem';
import type { TodoFlag } from '../../hooks/useStore';
import { useTheme } from '../../hooks/useTheme';

type SortBy = 'newest' | 'dueDate' | 'flag';
type FilterBy = 'all' | 'active' | 'done' | 'important' | 'follow-up';

export default function TodosView() {
  const { t } = useTranslation();
  const { todos, createTodo, editTodo, removeTodo } = useNotifications();
  const { mode } = useTheme();
  const [newText, setNewText] = useState('');
  const [newDue, setNewDue] = useState('');
  const [newFlag, setNewFlag] = useState<TodoFlag>('none');
  const [sortBy, setSortBy] = useState<SortBy>('newest');
  const [filterBy, setFilterBy] = useState<FilterBy>('all');

  const handleCreate = () => {
    if (!newText.trim()) return;
    createTodo({
      text: newText.trim(),
      done: false,
      dueAt: newDue || null,
      flag: newFlag,
    });
    setNewText('');
    setNewDue('');
    setNewFlag('none');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleCreate();
  };

  const filtered = todos.filter((t) => {
    if (filterBy === 'active') return !t.done;
    if (filterBy === 'done') return t.done;
    if (filterBy === 'important') return t.flag === 'important';
    if (filterBy === 'follow-up') return t.flag === 'follow-up';
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'dueDate') {
      if (!a.dueAt && !b.dueAt) return 0;
      if (!a.dueAt) return 1;
      if (!b.dueAt) return -1;
      return a.dueAt.localeCompare(b.dueAt);
    }
    if (sortBy === 'flag') {
      const order: Record<TodoFlag, number> = { important: 0, 'follow-up': 1, none: 2 };
      return order[a.flag] - order[b.flag];
    }
    return b.createdAt.localeCompare(a.createdAt);
  });

  const doneCount = todos.filter((t) => t.done).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
        <span style={{
          fontFamily: 'var(--font-m)', fontSize: 10, color: 'var(--text-dim)',
          letterSpacing: '.1em', textTransform: 'uppercase',
        }}>
          {t('todos.title', { done: doneCount, total: todos.length })}
        </span>
        <div style={{ display: 'flex', gap: 6 }}>
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value as FilterBy)}
            style={selectStyle}
          >
            <option value="all">{t('todos.all')}</option>
            <option value="active">{t('todos.active')}</option>
            <option value="done">{t('todos.done')}</option>
            <option value="important">{t('todos.important')}</option>
            <option value="follow-up">{t('todos.follow_up')}</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            style={selectStyle}
          >
            <option value="newest">{t('todos.newest')}</option>
            <option value="dueDate">{t('todos.due_date')}</option>
            <option value="flag">{t('todos.flag')}</option>
          </select>
        </div>
      </div>

      {/* Add todo */}
      <div style={{
        display: 'flex', gap: 6, alignItems: 'center',
        background: 'var(--surface-2)', border: '1px solid var(--border)',
        borderRadius: 6, padding: '4px 6px',
      }}>
        <input
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('todos.add_placeholder')}
          style={{
            flex: 1, background: 'transparent', border: 'none',
            color: 'var(--text)', fontFamily: 'var(--font-m)', fontSize: 11,
            outline: 'none', padding: '4px 4px',
          }}
        />
        <input
          type="date"
          value={newDue}
          onChange={(e) => setNewDue(e.target.value)}
          style={{
            background: 'transparent', border: 'none',
            color: 'var(--text-dim)', fontFamily: 'var(--font-m)', fontSize: 9,
            outline: 'none', width: 24, cursor: 'pointer', colorScheme: mode,
          }}
          title={t('todos.set_due_date')}
        />
        <select
          value={newFlag}
          onChange={(e) => setNewFlag(e.target.value as TodoFlag)}
          style={{
            background: 'transparent', border: 'none',
            color: 'var(--text-dim)', fontFamily: 'var(--font-m)', fontSize: 9,
            outline: 'none', cursor: 'pointer', width: 20, padding: 0, colorScheme: mode,
          }}
          title={t('todos.set_flag')}
        >
          <option value="none">○</option>
          <option value="important">!</option>
          <option value="follow-up">↩</option>
        </select>
        <button
          onClick={handleCreate}
          style={{
            background: 'var(--accent)', border: 'none', borderRadius: 4,
            padding: '4px 10px', color: 'var(--bg)',
            fontFamily: 'var(--font-m)', fontSize: 9, fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {t('common.add')}
        </button>
      </div>

      {/* Todo list */}
      {sorted.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '16px 0',
          fontFamily: 'var(--font-m)', fontSize: 11, color: 'var(--text-dim)',
        }}>
          {filterBy === 'all' ? t('todos.no_todos') : t('todos.no_filtered', { filter: filterBy })}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {sorted.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={(id) => editTodo(id, { done: !todo.done })}
              onUpdate={editTodo}
              onDelete={(id) => removeTodo(id, todo.text)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

const selectStyle: React.CSSProperties = {
  background: 'var(--bg2)', border: '1px solid var(--border)',
  borderRadius: 4, padding: '2px 6px',
  color: 'var(--text-dim)', fontFamily: 'var(--font-m)', fontSize: 9,
  cursor: 'pointer', outline: 'none',
};
