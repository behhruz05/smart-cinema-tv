import { ApiResponse } from './search';

export interface TvCategory {
  id: string;
  name: string;
  slug: string;
}

export interface TvChannel {
  id: string;
  name: string;
  slug: string;
  logo_url: string;
  category_id: string;
  order_number: number;
  status: string;
  flussonic_stream_name?: string;
}

export interface TvProgram {
  id: string;
  channel_id: string;
  title: string;
  description: string;
  starts_at: string;
  ends_at: string;
}

export interface TvChannelDetail extends TvChannel {
  flussonic_stream_name?: string;
  category?: TvCategory;
  current_program: TvProgram | null;
}

export interface TvChannelsPayload {
  items: TvChannel[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export type TvCategoriesResponse = ApiResponse<TvCategory[]>;
export type TvChannelsResponse = ApiResponse<TvChannelsPayload>;
export type TvChannelDetailResponse = ApiResponse<TvChannelDetail>;
export type TvProgramResponse = ApiResponse<TvProgram>;
export type TvProgramsResponse = ApiResponse<TvProgram[]>;
