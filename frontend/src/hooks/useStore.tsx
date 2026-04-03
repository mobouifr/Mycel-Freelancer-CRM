import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';

/* ─────────────────────────────────────────────
   GLOBAL STORE — Notes, Events, Todos, Notifications
   Persists to localStorage. Replace with API
   calls when backend endpoints are ready.
───────────────────────────────────────────── */

// ── Types ────────────────────────────────────

export type EventType = 'event' | 'deadline' | 'meeting' | 'milestone' | 'follow-up';
export type EventPriority = 'low' | 'normal' | 'high';
export type TodoFlag = 'none' | 'important' | 'follow-up';
export type NoteColor = 'yellow' | 'green' | 'blue' | 'pink' | 'purple' | 'default';

export interface TodoItem {
  id: string;
  text: string;
  done: boolean;
  dueAt: string | null;
  flag: TodoFlag;
  createdAt: string;
}

export interface Note {
  id: string;
  title: string;
  body: string;
  tags: string[];
  pinned: boolean;
  color: NoteColor;
  todos: TodoItem[];
  eventId?: string;
  linkedProjectId?: string;
  linkedClientId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;           // ISO date string  (YYYY-MM-DD)
  time: string;           // HH:mm
  endDate?: string;       // ISO date string  (YYYY-MM-DD)
  endTime?: string;       // HH:mm
  timezone: string;
  description: string;
  eventType: EventType;
  priority: EventPriority;
  clientTag?: string;
  projectTag?: string;
  linkedProjectId?: string;
  linkedClientId?: string;
  reminderOffset: number; // minutes before
  recurrence: string;     // 'none' | 'daily' | 'weekly' | 'monthly'
  noteId?: string;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  isRead: boolean;
  targetType?: 'event' | 'note' | 'todo';
  targetId?: string;
  createdAt: string;
}

interface StoreState {
  notes: Note[];
  events: CalendarEvent[];
  todos: TodoItem[];
  notifications: AppNotification[];
}

interface StoreContextType extends StoreState {
  // Notes
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => Note;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  // Events
  addEvent: (event: Omit<CalendarEvent, 'id' | 'createdAt'>) => CalendarEvent;
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;
  // Todos (standalone)
  addTodo: (todo: Omit<TodoItem, 'id' | 'createdAt'>) => TodoItem;
  updateTodo: (id: string, updates: Partial<TodoItem>) => void;
  deleteTodo: (id: string) => void;
  // Notifications
  addNotification: (n: Omit<AppNotification, 'id' | 'createdAt' | 'isRead'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  dismissNotification: (id: string) => void;
  unreadCount: number;
  // Undo
  undo: () => void;
  canUndo: boolean;
}

const STORAGE_KEY = 'mycel-store';
const uid = () => crypto.randomUUID();
const now = () => new Date().toISOString();

function loadStore(): StoreState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        notes: (parsed.notes || []).map((n: Record<string, unknown>) => ({
          pinned: false,
          color: 'default' as NoteColor,
          todos: [] as TodoItem[],
          ...n,
        })) as Note[],
        events: (parsed.events || []).map((e: Record<string, unknown>) => ({
          eventType: 'event' as EventType,
          priority: 'normal' as EventPriority,
          recurrence: 'none',
          ...e,
        })) as CalendarEvent[],
        todos: (parsed.todos || []) as TodoItem[],
        notifications: (parsed.notifications || []) as AppNotification[],
      };
    }
  } catch { /* noop */ }
  return { notes: [], events: [], todos: [], notifications: [] };
}

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StoreState>(loadStore);
  const [undoStack, setUndoStack] = useState<StoreState[]>([]);

  // Persist
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const pushUndo = useCallback(() => {
    setState((s) => {
      setUndoStack((u) => [...u.slice(-9), s]); // keep last 10
      return s;
    });
  }, []);

  const undo = useCallback(() => {
    setUndoStack((stack) => {
      if (stack.length === 0) return stack;
      const prev = stack[stack.length - 1];
      setState(prev);
      return stack.slice(0, -1);
    });
  }, []);

  // ── Notes ──────────────────────────────────
  const addNote = useCallback((note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newNote: Note = { ...note, id: uid(), createdAt: now(), updatedAt: now() };
    setState((s) => ({ ...s, notes: [newNote, ...s.notes] }));
    return newNote;
  }, []);

  const updateNote = useCallback((id: string, updates: Partial<Note>) => {
    setState((s) => ({
      ...s,
      notes: s.notes.map((n) => n.id === id ? { ...n, ...updates, updatedAt: now() } : n),
    }));
  }, []);

  const deleteNote = useCallback((id: string) => {
    pushUndo();
    setState((s) => ({ ...s, notes: s.notes.filter((n) => n.id !== id) }));
  }, [pushUndo]);

  // ── Events ─────────────────────────────────
  const addEvent = useCallback((event: Omit<CalendarEvent, 'id' | 'createdAt'>) => {
    const newEvent: CalendarEvent = { ...event, id: uid(), createdAt: now() };
    setState((s) => ({ ...s, events: [newEvent, ...s.events] }));
    return newEvent;
  }, []);

  const updateEvent = useCallback((id: string, updates: Partial<CalendarEvent>) => {
    setState((s) => ({
      ...s,
      events: s.events.map((e) => e.id === id ? { ...e, ...updates } : e),
    }));
  }, []);

  const deleteEvent = useCallback((id: string) => {
    pushUndo();
    setState((s) => ({ ...s, events: s.events.filter((e) => e.id !== id) }));
  }, [pushUndo]);

  // ── Todos (standalone) ─────────────────────
  const addTodo = useCallback((todo: Omit<TodoItem, 'id' | 'createdAt'>) => {
    const newTodo: TodoItem = { ...todo, id: uid(), createdAt: now() };
    setState((s) => ({ ...s, todos: [newTodo, ...s.todos] }));
    return newTodo;
  }, []);

  const updateTodo = useCallback((id: string, updates: Partial<TodoItem>) => {
    setState((s) => ({
      ...s,
      todos: s.todos.map((t) => t.id === id ? { ...t, ...updates } : t),
    }));
  }, []);

  const deleteTodo = useCallback((id: string) => {
    pushUndo();
    setState((s) => ({ ...s, todos: s.todos.filter((t) => t.id !== id) }));
  }, [pushUndo]);

  // ── Notifications ──────────────────────────
  const addNotification = useCallback((n: Omit<AppNotification, 'id' | 'createdAt' | 'isRead'>) => {
    const newN: AppNotification = { ...n, id: uid(), createdAt: now(), isRead: false };
    setState((s) => ({ ...s, notifications: [newN, ...s.notifications].slice(0, 50) }));
  }, []);

  const markAsRead = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      notifications: s.notifications.map((n) => n.id === id ? { ...n, isRead: true } : n),
    }));
  }, []);

  const markAllAsRead = useCallback(() => {
    setState((s) => ({
      ...s,
      notifications: s.notifications.map((n) => ({ ...n, isRead: true })),
    }));
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      notifications: s.notifications.filter((n) => n.id !== id),
    }));
  }, []);

  const unreadCount = state.notifications.filter((n) => !n.isRead).length;

  return (
    <StoreContext.Provider
      value={{
        ...state,
        addNote, updateNote, deleteNote,
        addEvent, updateEvent, deleteEvent,
        addTodo, updateTodo, deleteTodo,
        addNotification, markAsRead, markAllAsRead, dismissNotification,
        unreadCount,
        undo,
        canUndo: undoStack.length > 0,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore(): StoreContextType {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
