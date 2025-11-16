// Simple event bus for cross-component communication
type EventCallback = (data?: any) => void;

class EventBus {
  private events: Map<string, EventCallback[]> = new Map();

  on(event: string, callback: EventCallback) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)!.push(callback);
  }

  off(event: string, callback: EventCallback) {
    const callbacks = this.events.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event: string, data?: any) {
    const callbacks = this.events.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  clear() {
    this.events.clear();
  }
}

export const eventBus = new EventBus();

// Event types
export const EVENTS = {
  HABIT_COMPLETED: 'habit:completed',
  HABIT_CREATED: 'habit:created',
  HABIT_UPDATED: 'habit:updated',
  HABIT_DELETED: 'habit:deleted',
  XP_GAINED: 'xp:gained',
  LEVEL_UP: 'level:up',
  FORGIVENESS_USED: 'forgiveness:used',
  MOOD_LOGGED: 'mood:logged',
  CHALLENGE_JOINED: 'challenge:joined',
  CHALLENGE_COMPLETED: 'challenge:completed',
} as const;
