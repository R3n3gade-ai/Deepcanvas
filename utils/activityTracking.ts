import { User } from 'firebase/auth';
import { serverTimestamp } from 'firebase/firestore';
import firestoreService from './firestoreService';

export const ACTIVITIES_COLLECTION = 'activities';

export interface ActivityLog {
  id: string;
  timestamp: string; // ISO string format of date
  timestampRaw?: any; // Firestore Timestamp
  type: 'create' | 'update' | 'delete' | 'view';
  documentRef: string; // ID of the affected document
  collectionName: string; // Collection the document belongs to
  userId: string; // User ID who performed the action
  userName: string; // Display name of the user
  details?: Record<string, any>; // Additional context
}

/**
 * Log activity to Firestore
 */
export const logActivity = async (
  user: User, 
  type: ActivityLog['type'],
  collectionName: string,
  documentRef: string,
  details?: Record<string, any>
): Promise<string> => {
  try {
    if (!user) {
      console.error('Cannot log activity: No authenticated user');
      return '';
    }

    const activity: Omit<ActivityLog, 'id'> = {
      timestamp: new Date().toISOString(),
      timestampRaw: serverTimestamp(),
      type,
      documentRef,
      collectionName,
      userId: user.uid,
      userName: user.displayName || user.email || 'Unknown User',
      details
    };

    const activityId = await firestoreService.addDocument(ACTIVITIES_COLLECTION, activity);
    console.log(`Activity logged: ${type} on ${collectionName}/${documentRef}`);
    return activityId;
  } catch (error) {
    console.error('Error logging activity:', error);
    return '';
  }
};

/**
 * Helper to log a creation activity
 */
export const logCreateActivity = (user: User, collectionName: string, documentRef: string, details?: Record<string, any>) => {
  return logActivity(user, 'create', collectionName, documentRef, details);
};

/**
 * Helper to log an update activity
 */
export const logUpdateActivity = (user: User, collectionName: string, documentRef: string, details?: Record<string, any>) => {
  return logActivity(user, 'update', collectionName, documentRef, details);
};

/**
 * Helper to log a delete activity
 */
export const logDeleteActivity = (user: User, collectionName: string, documentRef: string, details?: Record<string, any>) => {
  return logActivity(user, 'delete', collectionName, documentRef, details);
};

/**
 * Helper to log a view activity
 */
export const logViewActivity = (user: User, collectionName: string, documentRef: string, details?: Record<string, any>) => {
  return logActivity(user, 'view', collectionName, documentRef, details);
};