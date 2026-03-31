import type { TodoItem as TodoItemType, TodoFlag } from '../../hooks/useStore';
import { useTheme } from '../../hooks/useTheme';

const FLAG_LABELS: Record<TodoFlag, { label: string; color: string }> = {
  none:        { label: '', color: 'transparent' },
  important:   { label: '!', color: 'var(--danger)' },
  'follow-up': { label: '↩', color: 'var(--cal-follow-up)' },
};

interface TodoItemProps {
  todo: TodoItemType;
  onToggle: (id: string) => void;
  onUpdate: (id: string, updates: Partial<TodoItemType>) => void;
  onDelete: (id: string) => void;
}

export default function TodoItem({ todo, onToggle, onUpdate, onDelete }: TodoItemProps) {
  const { mode } = useTheme();
  const flag = FLAG_LABELS[todo.flag] || FLAG_LABELS.none;
  const isOverdue = todo.dueAt && !todo.done && new Date(todo.dueAt) < new Date();

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '7px 10px', borderRadius: 6,
      background: todo.done ? 'transparent' : 'var(--surface-2)',
      border: '1px solid var(--border)',
      transition: 'background .12s',
    }}>
      {/* Checkbox */}
      <input
        type="checkbox"
        checked={todo.done}
        onChange={() => onToggle(todo.id)}
        style={{ accentColor: 'var(--accent)', cursor: 'pointer', flexShrink: 0 }}
        aria-label={`Mark "${todo.text}" as ${todo.done ? 'undone' : 'done'}`}
      />

      {/* Flag indicator */}
      {todo.flag !== 'none' && (
        <span style={{
          width: 16, height: 16, borderRadius: '50%',
          background: flag.color, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          fontSize: 9, color: '#fff', fontWeight: 700, flexShrink: 0,
        }}>
          {flag.label}
        </span>
      )}

      {/* Text */}
      <span style={{
        fontFamily: 'var(--font-m)', fontSize: 11,
        color: todo.done ? 'var(--text-dim)' : 'var(--text)',
        textDecoration: todo.done ? 'line-through' : 'none',
        flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {todo.text}
      </span>

      {/* Due date */}
      {todo.dueAt && (
        <span style={{
          fontFamily: 'var(--font-m)', fontSize: 9, flexShrink: 0,
          color: isOverdue ? 'var(--danger)' : 'var(--text-dim)',
        }}>
          {new Date(todo.dueAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
      )}

      {/* Flag picker */}
      <select
        value={todo.flag}
        onChange={(e) => onUpdate(todo.id, { flag: e.target.value as TodoFlag })}
        style={{
          background: 'transparent', border: 'none', color: 'var(--text-dim)',
          fontFamily: 'var(--font-m)', fontSize: 9, cursor: 'pointer',
          outline: 'none', width: 20, padding: 0, flexShrink: 0,
          colorScheme: mode,
        }}
        title="Set flag"
      >
        <option value="none">○</option>
        <option value="important">!</option>
        <option value="follow-up">↩</option>
      </select>

      {/* Delete */}
      <button
        onClick={() => onDelete(todo.id)}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--text-dim)', fontSize: 10, padding: 0,
          transition: 'color .12s', flexShrink: 0,
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--danger)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-dim)'; }}
        aria-label="Delete todo"
      >
        ✕
      </button>
    </div>
  );
}
