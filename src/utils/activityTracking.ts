import { API_CONFIG } from '../constants/api';

export interface ActivityTrackingResponse {
  status: string;
  message: string;
  access_token: string;
}

export type ActivityAction = 'OPEN' | 'CLOSE';

/**
 * Tracks user activity for a mini app
 * @param appId - The mini app ID (e.g., "song.gpt")
 * @param action - The action type: "OPEN" or "CLOSE"
 * @param authToken - The authentication token for the user
 * @returns Promise with the activity tracking response containing access_token
 */
export const trackMiniAppActivity = async (
  appId: string,
  action: ActivityAction,
  authToken: string | null
): Promise<ActivityTrackingResponse> => {
  if (!authToken) {
    throw new Error('Authentication token is required for activity tracking');
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Flic-Token': authToken,
  };

  const response = await fetch(
    `${API_CONFIG.BASE_URL}/miniapps/activity/track`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({
        app_id: appId,
        action,
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to track activity: ${response.status} ${errorText}`
    );
  }

  const data: ActivityTrackingResponse = await response.json();

  if (data.status !== 'success') {
    throw new Error(data.message || 'Failed to track activity');
  }

  return data;
};

