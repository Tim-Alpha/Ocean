export interface MiniApp {
  id: number;
  app_id: string;
  display_name: string;
  entry_url: string;
  app_logo_url: string;
  age_range: string;
  qualifying: boolean;
  host_app_bundle_id: string;
  version: string;
  is_default: boolean;
  status: string;
  creator_id: number;
  project_id: number;
  category_id: number | null;
  categories: string;
  is_login_required: boolean;
  login_webhook_url: string;
  created_at: string;
  updated_at: string;
}

export interface MiniAppsResponse {
  status: string;
  message: string;
  page: number;
  page_size: number;
  max_page_size: number;
  data: MiniApp[];
}
