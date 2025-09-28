import { UUID, ISODateString, URL, Timestamps } from './common';

export interface GalleryTheme {
  template: 'classic' | 'modern' | 'minimal' | 'elegant' | 'bold';
  primary_color: string;
  secondary_color: string;
  background_color: string;
  font_family?: string;
  layout: 'grid' | 'masonry' | 'carousel' | 'justified';
  show_logo: boolean;
  show_photographer_info: boolean;
  custom_css?: string;
}

export interface GalleryWatermarkSettings {
  enabled: boolean;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  opacity: number; // 0-100
  size: 'small' | 'medium' | 'large';
  logo_url?: URL;
  text?: string;
}

export interface GallerySEOSettings {
  title: string;
  description: string;
  keywords: string[];
  og_image_url?: URL;
  canonical_url?: URL;
}

export interface GalleryAnalytics {
  total_views: number;
  unique_visitors: number;
  total_downloads: number;
  total_favorites: number;
  average_time_spent_seconds: number;
  top_photos: UUID[];
  traffic_sources: TrafficSource[];
  device_breakdown: DeviceBreakdown;
}

export interface TrafficSource {
  source: string;
  count: number;
  percentage: number;
}

export interface DeviceBreakdown {
  desktop: number;
  mobile: number;
  tablet: number;
}

export interface Gallery extends Timestamps {
  id: UUID;
  session_id: UUID;
  photographer_id: UUID;
  name: string;
  slug?: string;
  access_code?: string;
  password_hash?: string;
  is_public: boolean;
  is_downloadable: boolean;
  allow_comments: boolean;
  allow_favorites: boolean;
  download_limit?: number;
  downloads_used: number;
  expiry_date?: ISODateString;
  watermark_enabled: boolean;
  watermark_settings: GalleryWatermarkSettings;
  theme_settings: GalleryTheme;
  cover_photo_id?: UUID;
  seo_settings: GallerySEOSettings;
  analytics: GalleryAnalytics;
  view_count: number;
  unique_visitor_count: number;
  last_viewed_at?: ISODateString;
  published_at?: ISODateString;
  is_archived: boolean;
  music_url?: URL;
  slideshow_enabled: boolean;
  slideshow_interval_seconds?: number;
  client_selection_enabled: boolean;
  client_selection_limit?: number;
  print_store_enabled: boolean;
  social_sharing_enabled: boolean;
  download_pin?: string;
  custom_message?: string;
}

export interface GalleryAccess {
  id: UUID;
  gallery_id: UUID;
  email?: string;
  access_token: string;
  first_accessed_at?: ISODateString;
  last_accessed_at?: ISODateString;
  view_count: number;
  download_count: number;
  ip_address?: string;
  user_agent?: string;
}

export interface GalleryComment {
  id: UUID;
  gallery_id: UUID;
  photo_id?: UUID;
  author_name: string;
  author_email?: string;
  content: string;
  is_approved: boolean;
  is_pinned: boolean;
  parent_comment_id?: UUID; // For replies
  created_at: ISODateString;
}

export interface GalleryShare {
  id: UUID;
  gallery_id: UUID;
  shared_by: string;
  shared_to_email?: string;
  shared_via: 'email' | 'link' | 'social';
  social_platform?: 'facebook' | 'instagram' | 'twitter' | 'pinterest';
  access_token?: string;
  message?: string;
  clicked: boolean;
  clicked_at?: ISODateString;
  created_at: ISODateString;
}