import { useCallback } from 'react';
import { useStore } from './useStore';
import type { CalendarEvent, Note, TodoItem } from './useStore';

/**
 * Wraps store CRUD to auto-emit notifications with deep-link metadata.
 * Every create/update/delete on events, notes, or todos fires a notification.
 */
export default function useNotifications() {
  const store = useStore();

  const createEvent = useCallback(
    (event: Omit<CalendarEvent, 'id' | 'createdAt'>) => {
      const created = store.addEvent(event);
      store.addNotification({
        type: 'success',
        title: 'Event created',
        message: `"${created.title}" on ${created.date}`,
        targetType: 'event',
        targetId: created.id,
      });
      return created;
    },
    [store],
  );

  const editEvent = useCallback(
    (id: string, updates: Partial<CalendarEvent>) => {
      store.updateEvent(id, updates);
      store.addNotification({
        type: 'info',
        title: 'Event updated',
        message: updates.title ? `"${updates.title}" updated` : 'Event updated',
        targetType: 'event',
        targetId: id,
      });
    },
    [store],
  );

  const removeEvent = useCallback(
    (id: string, title?: string) => {
      store.deleteEvent(id);
      store.addNotification({
        type: 'warning',
        title: 'Event deleted',
        message: title ? `"${title}" removed` : 'Event removed',
      });
    },
    [store],
  );

  const createNote = useCallback(
    (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
      const created = store.addNote(note);
      store.addNotification({
        type: 'success',
        title: 'Note created',
        message: `"${created.title || 'Untitled'}"`,
        targetType: 'note',
        targetId: created.id,
      });
      return created;
    },
    [store],
  );

  const editNote = useCallback(
    (id: string, updates: Partial<Note>) => {
      store.updateNote(id, updates);
      store.addNotification({
        type: 'info',
        title: 'Note updated',
        message: updates.title ? `"${updates.title}" updated` : 'Note updated',
        targetType: 'note',
        targetId: id,
      });
    },
    [store],
  );

  const removeNote = useCallback(
    (id: string, title?: string) => {
      store.deleteNote(id);
      store.addNotification({
        type: 'warning',
        title: 'Note deleted',
        message: title ? `"${title}" removed` : 'Note removed',
      });
    },
    [store],
  );

  const createTodo = useCallback(
    (todo: Omit<TodoItem, 'id' | 'createdAt'>) => {
      const created = store.addTodo(todo);
      store.addNotification({
        type: 'success',
        title: 'Todo created',
        message: `"${created.text}"`,
        targetType: 'todo',
        targetId: created.id,
      });
      return created;
    },
    [store],
  );

  const editTodo = useCallback(
    (id: string, updates: Partial<TodoItem>) => {
      store.updateTodo(id, updates);
      if (updates.done !== undefined) {
        store.addNotification({
          type: updates.done ? 'success' : 'info',
          title: updates.done ? 'Todo completed' : 'Todo reopened',
          message: updates.text || 'Todo status changed',
          targetType: 'todo',
          targetId: id,
        });
      }
    },
    [store],
  );

  const removeTodo = useCallback(
    (id: string, text?: string) => {
      store.deleteTodo(id);
      store.addNotification({
        type: 'warning',
        title: 'Todo deleted',
        message: text ? `"${text}" removed` : 'Todo removed',
      });
    },
    [store],
  );

  return {
    ...store,
    createEvent, editEvent, removeEvent,
    createNote, editNote, removeNote,
    createTodo, editTodo, removeTodo,
  };
}
