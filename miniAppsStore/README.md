# Mini-Apps Store

This folder stores mini-app bundles locally for faster reload and offline access.

## Folder Structure

Each mini-app is stored in its own folder, named by its unique ID:

```
miniAppsStore/
├── com.todo.mini/
│   ├── manifest.json    # Mini-app metadata and permissions
│   └── bundle.js        # The JavaScript bundle to be loaded
├── com.movie.mini/
│   ├── manifest.json
│   └── bundle.js
└── ...
```

## File Descriptions

### `manifest.json`
Contains mini-app metadata:
- `id`: Unique identifier (e.g., "com.todo.mini")
- `name`: Display name
- `icon`: URL to the app icon image
- `version`: Version number
- `requiredPermissions`: Array of required permissions
- `optionalPermissions`: Array of optional permissions
- `description`: Mini-app description

### `bundle.js`
The compiled JavaScript bundle that contains the mini-app code. This file is:
- Loaded dynamically by the Host App
- Injected into a WebView sandbox
- Communicates with the Host via `window.hostBridge`

## How Host App Loads Mini-Apps

### 1. Host fetches files:
   - `bundle.js` - The mini-app code
   - `manifest.json` - Metadata and permissions

### 2. Host injects secure bridge:
```javascript
window.hostBridge = {
  requestPermission: (...args) => { ... },
  emitEvent: (...args) => { ... }
}
```

### 3. Host loads bundle.js in React Native:
```jsx
<WebView
  ref={webviewRef}
  source={{ html: '<html><body><div id="root"></div></body></html>' }}
  injectedJavaScriptBeforeContentLoaded={bridgeScript}
  onMessage={onMessage}
/>
```

### 4. After WebView is created:
```javascript
webviewRef.current.injectJavaScript(`
  const script = document.createElement("script");
  script.src = "${bundleJsUrl}";
  document.body.appendChild(script);
`);
```

The mini-app now runs inside the WebView sandbox with secure bridge access.

