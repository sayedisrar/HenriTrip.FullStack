import { ActivityResponse } from './activity.models';

export interface Guide {
  id: number;
  title: string;
  description: string;
  days: number;
  mobility: string;
  season: string;
  forWho: string;
  activities?: ActivityResponse[];
}

export interface GuideCreateRequest {
  title: string;
  description: string;
  days: number;
  mobility: string;
  season: string;
  forWho: string;
}

export interface GuideUpdateRequest extends GuideCreateRequest { }

export interface GuideResponse {
  id: number;
  title: string;
  description: string;
  days: number;
  mobility: string;
  season: string;
  forWho: string;
  activities: ActivityResponse[];
}
