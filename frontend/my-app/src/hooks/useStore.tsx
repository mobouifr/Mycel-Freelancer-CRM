import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';

/* ─────────────────────────────────────────────
   GLOBAL STORE — Notes, Events, Notifications
   Persists to localStorage. Replace with API
   calls when backend endpoints are ready.
───────────────────────────────────────────── */

// ── Types ────────────────────────────────────
export interface Note {
  id: string;
  title: string;
  body: string;          // plain text (basic rich-text in future)
  tags: string[];
  eventId?: string;      // optional link to event
  createdAt: string;
  updatedAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;          // ISO date string
  time: string;          // HH:mm
  timezone: string;
  description: string;
  clientTag?: string;
  projectTag?: string;
  reminderOffset: number; // minutes before
  noteId?: string;        // linked note
  createdAt: string;
}

export interface AppNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface StoreState {
  notes: Note[];
  events: CalendarEvent[];
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
    if (raw) return JSON.parse(raw);
  } catch { /* noop */ }
  return { notes: [], events: [], notifications: [] };
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
