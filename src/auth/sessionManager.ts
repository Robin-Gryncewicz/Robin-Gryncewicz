
import { v4 as uuidv4 } from 'uuid';

/**
 * Interface for session data
 */
export interface Session {
  id: string;
  userId: string;
  created: number;
  expires: number;
  data?: Record<string, any>;
}

/**
 * Session validation result
 */
export interface SessionValidationResult {
  valid: boolean;
  session?: Session;
  error?: string;
}

/**
 * SessionManager - Handles user authentication sessions
 */
export class SessionManager {
  private _sessions: Map<string, Session>;
  private readonly _sessionDuration: number;
  
  /**
   * Creates a new SessionManager instance
   * @param sessionDurationMinutes Duration of sessions in minutes (default: 60)
   */
  constructor(sessionDurationMinutes: number = 60) {
    this._sessions = new Map<string, Session>();
    this._sessionDuration = sessionDurationMinutes * 60 * 1000; // Convert to milliseconds
  }
  
  /**
   * Creates a new session for a user
   * @param userId ID of the user
   * @param data Additional data to store in the session
   * @returns The created session object
   */
  public createSession(userId: string, data?: Record<string, any>): Session {
    const now = Date.now();
    const session: Session = {
      id: uuidv4(),
      userId,
      created: now,
      expires: now + this._sessionDuration,
      data
    };
    
    this._sessions.set(session.id, session);
    return session;
  }
  
  /**
   * Validates a session by ID
   * @param sessionId The session ID to validate
   * @returns A session validation result
   */
  public validateSession(sessionId: string): SessionValidationResult {
    const session = this._sessions.get(sessionId);
    
    if (!session) {
      return { valid: false, error: 'Session not found' };
    }
    
    if (session.expires < Date.now()) {
      this._sessions.delete(sessionId);
      return { valid: false, error: 'Session expired' };
    }
    
    return { valid: true, session };
  }
  
  /**
   * Refreshes a session, extending its expiration time
   * @param sessionId The ID of the session to refresh
   * @returns A boolean indicating if the refresh was successful
   */
  public refreshSession(sessionId: string): boolean {
    const validationResult = this.validateSession(sessionId);
    
    if (!validationResult.valid) {
      return false;
    }
    
    const session = validationResult.session!;
    session.expires = Date.now() + this._sessionDuration;
    this._sessions.set(sessionId, session);
    
    return true;
  }
  
  /**
   * Terminates a session
   * @param sessionId The ID of the session to terminate
   * @returns A boolean indicating if the session was successfully terminated
   */
  public terminateSession(sessionId: string): boolean {
    if (!this._sessions.has(sessionId)) {
      return false;
    }
    
    this._sessions.delete(sessionId);
    return true;
  }
  
  /**
   * Gets a session by ID
   * @param sessionId The session ID
   * @returns The session or undefined if not found
   */
  public getSession(sessionId: string): Session | undefined {
    return this._sessions.get(sessionId);
  }
  
  /**
   * Gets all sessions for a user
   * @param userId The user ID
   * @returns Array of sessions for the user
   */
  public getUserSessions(userId: string): Session[] {
    return Array.from(this._sessions.values())
      .filter(session => session.userId === userId);
  }
  
  /**
   * Cleans up expired sessions
   * @returns Number of sessions removed
   */
  public cleanupExpiredSessions(): number {
    const now = Date.now();
    let removed = 0;
    
    for (const [id, session] of this._sessions.entries()) {
      if (session.expires < now) {
        this._sessions.delete(id);
        removed++;
      }
    }
    
    return removed;
  }
}
