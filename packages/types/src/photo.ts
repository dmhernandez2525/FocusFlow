import { UUID, ISODateString, URL, Timestamps, S3Location } from './common';

export type PhotoProcessingStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type PhotoOrientation = 'portrait' | 'landscape' | 'square';

export interface PhotoDimensions {
  width: number;
  height: number;
  aspect_ratio: number;
}

export interface PhotoCloudFrontURLs {
  thumbnail: URL;   // 400px wide
  preview: URL;     // 1600px wide
  watermarked: URL; // 2400px wide with watermark
  full: URL;        // 4000px wide
  original?: URL;   // Original resolution
}

export interface PhotoMetadata {
  camera_make?: string;
  camera_model?: string;
  lens?: string;
  focal_length?: number;
  aperture?: number;
  shutter_speed?: string;
  iso?: number;
  exposure_compensation?: number;
  flash?: boolean;
  white_balance?: string;
  date_taken?: ISODateString;
  gps_latitude?: number;
  gps_longitude?: number;
  gps_altitude?: number;
  software?: string;
  copyright?: string;
  artist?: string;
}

export interface Photo extends Timestamps {
  id: UUID;
  gallery_id: UUID;
  photographer_id: UUID;
  original_filename: string;
  display_name?: string;
  s3_key: string;
  s3_bucket: string;
  cloudfront_urls: PhotoCloudFrontURLs;
  file_size_bytes: number;
  mime_type: string;
  width: number;
  height: number;
  orientation: PhotoOrientation;
  aspect_ratio: number;
  metadata: PhotoMetadata;
  ai_tags: string[];
  manual_tags: string[];
  faces_detected: number;
  dominant_colors: string[];
  blur_score?: number;  // 0-1, lower is sharper
  quality_score?: number; // 0-1, higher is better
  client_selected: boolean;
  client_favorited: boolean;
  photographer_pick: boolean;
  display_order?: number;
  edit_version: number;
  original_photo_id?: UUID;
  processing_status: PhotoProcessingStatus;
  processing_error?: string;
  view_count: number;
  download_count: number;
  is_hidden: boolean;
}

export interface PhotoUploadRequest {
  gallery_id: UUID;
  files: File[] | FileList;
  auto_process?: boolean;
  apply_watermark?: boolean;
  preserve_metadata?: boolean;
}

export interface PhotoEditRequest {
  photo_id: UUID;
  adjustments: PhotoAdjustments;
  create_new_version?: boolean;
}

export interface PhotoAdjustments {
  brightness?: number;      // -100 to 100
  contrast?: number;        // -100 to 100
  saturation?: number;      // -100 to 100
  temperature?: number;     // -100 to 100
  tint?: number;           // -100 to 100
  highlights?: number;      // -100 to 100
  shadows?: number;         // -100 to 100
  whites?: number;          // -100 to 100
  blacks?: number;          // -100 to 100
  clarity?: number;         // 0 to 100
  vibrance?: number;        // -100 to 100
  exposure?: number;        // -5 to 5
  gamma?: number;          // 0.1 to 10
  hue?: number;            // -180 to 180
  sepia?: number;          // 0 to 100
  grain?: number;          // 0 to 100
  vignette?: number;       // 0 to 100
  sharpen?: number;        // 0 to 100
  blur?: number;           // 0 to 20
  crop?: PhotoCrop;
  rotate?: number;         // 0, 90, 180, 270
}

export interface PhotoCrop {
  x: number;      // Start X coordinate (0-1)
  y: number;      // Start Y coordinate (0-1)
  width: number;  // Width (0-1)
  height: number; // Height (0-1)
}

export interface PhotoSelection {
  gallery_id: UUID;
  photo_ids: UUID[];
  selection_type: 'favorites' | 'final' | 'prints';
  notes?: string;
  created_at: ISODateString;
}

export interface PhotoComment {
  id: UUID;
  photo_id: UUID;
  author_name: string;
  author_email?: string;
  content: string;
  x_position?: number; // For positioned comments (0-1)
  y_position?: number; // For positioned comments (0-1)
  created_at: ISODateString;
}

export interface PhotoDownloadRequest {
  photo_ids: UUID[];
  size: 'thumbnail' | 'preview' | 'full' | 'original';
  format?: 'jpg' | 'png' | 'webp';
  quality?: number; // 1-100
  include_metadata?: boolean;
}

export interface PhotoBulkOperation {
  photo_ids: UUID[];
  operation: 'delete' | 'hide' | 'unhide' | 'tag' | 'untag' | 'move' | 'copy' | 'watermark' | 'resize';
  parameters?: Record<string, unknown>;
}