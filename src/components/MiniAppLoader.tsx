import React from 'react';
import { MiniAppManifest } from '../types/miniApp';
import WebViewContainer from './WebViewContainer';

interface MiniAppLoaderProps {
  manifest: MiniAppManifest;
  onClose?: () => void;
  onPermissionRequest?: (permission: string) => Promise<boolean>;
  onEvent?: (eventName: string, data: any) => void;
}

export default function MiniAppLoader({
  manifest,
  onPermissionRequest,
  onEvent,
}: MiniAppLoaderProps) {
  return (
    <WebViewContainer
      manifest={manifest}
      onPermissionRequest={onPermissionRequest}
      onEvent={onEvent}
    />
  );
}

