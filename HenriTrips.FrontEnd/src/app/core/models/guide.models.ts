// src/app/core/models/guide.models.ts
export interface GuideRequest {
  title: string;
  description: string;
  numberOfDays: number;
  mobility: 'Car' | 'Bike' | 'Walk' | 'Motorcycle';
  season: 'Summer' | 'Spring' | 'Autumn' | 'Winter';
  groupType: 'Family' | 'Alone' | 'Group' | 'Friends';
}

export interface GuideResponse {
  id: number;
  title: string;
  description: string;
  numberOfDays: number;
  mobility: string;
  season: string;
  groupType: string;
  activities?: ActivityResponse[];
}

export interface ActivityRequest {
  title: string;
  description: string;
  category: 'Museum' | 'Castle' | 'Activity' | 'Park' | 'Cave';
  address: string;
  phone: string;
  openingHours: string;
  website: string;
  dayNumber: number;
  visitOrder: number;
}

export interface ActivityResponse extends ActivityRequest {
  id: number;
  guideId: number;
}
