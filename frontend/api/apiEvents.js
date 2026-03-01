/**
 * Simple Event Emitter for API-related Events
 * 
 * This module provides a pub/sub (publish/subscribe) pattern to communicate
 * between the API client (axios interceptors) and React components/context.
 * 
 * Why we need this:
 * - The API client (client.js) is a plain JavaScript module, not a React component
 * - We need a way to notify React components when server errors occur
 * - Using an event emitter decouples the API layer from the React layer
 * 
 * Flow:
 * 1. API client detects network error - server is unreachable
 * 2. API client calls apiEvents.emit(SERVER_ERROR)
 * 3. AppContext (which subscribed via apiEvents.on()) receives the event
 * 4. AppContext updates isBackendServerReachable state
 * 5. ServerErrorBanner component shows the error message to the user
 */

/**
 * Storage for event listeners
 * Structure: { eventName: [callback1, callback2, ...] }
 */
const listeners = {};

/**
 * Available API event types
 * @readonly
 * @enum {string}
 */
export const API_EVENTS = {
  /** Emitted when network error - server is not reachable */
  SERVER_ERROR: 'SERVER_ERROR',
  /** Emitted when a successful response is received (server is back online) */
  SERVER_RECOVERED: 'SERVER_RECOVERED',
};

/**
 * Event emitter object with subscribe (on) and publish (emit) methods
 */
export const apiEvents = {
  /**
   * Subscribe to an event
   * 
   * @param {string} event - Event name from API_EVENTS
   * @param {Function} callback - Function to call when event is emitted
   * @returns {Function} Unsubscribe function - call this in useEffect cleanup
   * 
   * @example
   * // In a React component or context:
   * useEffect(() => {
   *   const unsubscribe = apiEvents.on(API_EVENTS.SERVER_ERROR, (data) => {
   *     console.log('Server error:', data);
   *     setIsBackendServerReachable(false);
   *   });
   *   
   *   // Cleanup: unsubscribe when component unmounts
   *   return () => unsubscribe();
   * }, []);
   */
  on(event, callback) {
    // Initialize array for this event type if it doesn't exist
    if (!listeners[event]) {
      listeners[event] = [];
    }
    // Add callback to the list of listeners for this event
    listeners[event].push(callback);
    
    // Return unsubscribe function for cleanup
    return () => {
      listeners[event] = listeners[event].filter(cb => cb !== callback);
    };
  },

  /**
   * Emit an event to all subscribers
   * 
   * @param {string} event - Event name from API_EVENTS
   * @param {any} [data] - Optional data to pass to callbacks
   * 
   * @example
   * // In the API client interceptor:
   * apiEvents.emit(API_EVENTS.SERVER_ERROR, {
   *   isNetworkError: true,
   *   status: 503,
   *   message: 'Server unavailable'
   * });
   */
  emit(event, data) {
    // Only proceed if there are listeners for this event
    if (listeners[event]) {
      // Call each registered callback with the event data
      listeners[event].forEach(callback => callback(data));
    }
  },
};

export default apiEvents;
