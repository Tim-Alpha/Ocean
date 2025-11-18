# Ocean Host App Setup

## Overview

Ocean is a Host App that loads and runs mini-apps from a remote API. Each mini-app runs in a secure WebView sandbox with a bridge for communication.

## Development Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Start the API Server

Make sure your mini-app store API is running at:
```
http://localhost:9010/api/v1/store/apps
```

The API should return a JSON response in this format:
```json
{
  "apps": [
    {
      "id": "com.todo.mini",
      "name": "Todo MiniApp",
      "icon": "https://assets.socialverseapp.com/todo.png",
      "version": "1.0.0",
      "requiredPermissions": [],
      "optionalPermissions": ["storage"],
      "description": "A simple todo app...",
      "files": [
        {
          "name": "bundle.js",
          "url": "https://assets.socialverseapp.com/bundle.js"
        },
        {
          "name": "manifest.json",
          "url": "https://assets.socialverseapp.com/manifest.json"
        }
      ]
    }
  ],
  "count": 1
}
```

### 3. Start the Expo App

```bash
npm start
```

Then press:
- `a` for Android
- `i` for iOS
- `w` for web

**Note for Android**:
- **Android Emulator**: Automatically uses `10.0.2.2:9010` (maps to host machine's localhost)
- **Physical Android Device**: Currently uses `10.0.2.2:9010` (emulator IP). For physical devices, you may need to:
  1. Find your computer's IP address: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
  2. Update `getApiBaseUrl()` in `src/utils/miniAppLoader.ts` to use your IP: `http://YOUR_IP:9010`
  3. Ensure your device and computer are on the same network

## How It Works

1. **API Fetch**: The app fetches all available mini-apps from the API endpoint
2. **Mini-App Discovery**: Displays all mini-apps from the API response
3. **Bundle Loading**: Loads `bundle.js` from the URL provided in the API response
4. **Bridge Injection**: Injects `window.hostBridge` for secure communication
5. **Sandbox Execution**: Mini-app runs isolated in the WebView

## Production Setup

For production, update the API URL in `src/utils/miniAppLoader.ts`:
- Replace `http://localhost:9010` with your production API server URL
- Ensure CORS is properly configured
- Use HTTPS for security

## API Response Structure

Each mini-app in the API response must include:
- `id`: Unique identifier
- `name`: Display name
- `icon`: URL to the app icon
- `version`: Version number
- `requiredPermissions`: Array of required permissions
- `optionalPermissions`: Array of optional permissions
- `description`: App description
- `files`: Array of file objects with `name` and `url` properties
  - Must include a file with `name: "bundle.js"`
  - Optionally include `name: "manifest.json"`

