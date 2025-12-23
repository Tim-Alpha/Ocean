import { API_CONFIG } from '../constants/api';

export interface PresenceRequest {
  place_id: number;
  session_status: 'active' | 'graced' | 'expired';
  time_since_entry: string;
}

export interface PresenceResponse {
  status: string;
  message?: string;
}

/**
 * Updates user presence at a place
 * This is called in the background and doesn't block the UI
 * @param placeId - The place ID (will be converted to number)
 * @param authToken - The authentication token for the user
 * @param sessionStatus - The session status (defaults to 'active')
 * @param timeSinceEntry - Time since entry in seconds (defaults to '0')
 */
export const updatePresence = async (
  placeId: string | number,
  authToken: string | null,
  sessionStatus: 'active' | 'graced' | 'expired' = 'active',
  timeSinceEntry: string = '0'
): Promise<PresenceResponse | null> => {
  if (!authToken) {
    console.warn('Cannot update presence: authentication token is missing');
    return null;
  }

  // Convert placeId to number
  const placeIdNumber = typeof placeId === 'string' ? parseInt(placeId, 10) : placeId;
  
  if (isNaN(placeIdNumber)) {
    console.warn(`Cannot update presence: invalid place_id "${placeId}"`);
    return null;
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Flic-Token': authToken,
  };

  const payload: PresenceRequest = {
    place_id: placeIdNumber,
    session_status: sessionStatus,
    time_since_entry: timeSinceEntry,
  };

  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/presence`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn(
        `Failed to update presence: ${response.status} ${errorText}`
      );
      return null;
    }

    const data: PresenceResponse = await response.json();
    return data;
  } catch (error) {
    // Silently handle errors - this is a background operation
    console.warn('Error updating presence:', error);
    return null;
  }
};

