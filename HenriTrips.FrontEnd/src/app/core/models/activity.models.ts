export enum ActivityCategory {
  Museum = 0,
  Park = 1,
  Restaurant = 2,
  Beach = 3,
  Other = 4
}

export interface ActivityResponse {
  id: number;
  title: string;
  description: string;
  categoryCategory: ActivityCategory;
  address: string;
  phone: string;
  schedule: string;
  website: string;
  order: number;
  day: number;
}

export interface ActivityCreateRequest {
  title: string;
  description: string;
  categoryCategory: ActivityCategory;
  address: string;
  phone: string;
  schedule: string;
  website: string;
  order: number;
  day: number;
  guideId: number;
}
