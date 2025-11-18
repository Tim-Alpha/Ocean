export interface MiniAppFile {
  name: string;
  url: string;
}

export interface MiniAppManifest {
  id: string;
  name: string;
  icon: string;
  version: string;
  requiredPermissions: string[];
  optionalPermissions: string[];
  description: string;
  files: MiniAppFile[];
}

export interface StoreApiResponse {
  apps: MiniAppManifest[];
  count: number;
}

