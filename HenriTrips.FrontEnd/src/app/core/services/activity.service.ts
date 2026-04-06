import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Activity {
  id: number;
  guideId: number;
  title: string;
  description: string;
  category: 'museum' | 'park' | 'restaurant' | 'beach' | 'other';
  address: string;
  phone: string;
  openingHours: string;
  website: string;
  order: number;
  day: number;
}

export interface ActivityCreateRequest {
  title: string;
  description: string;
  category: string;
  address: string;
  phone: string;
  openingHours: string;
  website: string;
  order: number;
  day: number;
  guideId: number;
}

export interface ActivityUpdateRequest {
  title?: string;
  description?: string;
  category?: string;
  address?: string;
  phone?: string;
  openingHours?: string;
  website?: string;
  order?: number;
  day?: number;
}

interface BackendActivity {
  id: number;
  title: string;
  description: string;
  categoryCategory: number;
  address: string;
  phone: string;
  schedule: string;
  website: string;
  order: number;
  day: number;
  guideId: number;
}

@Injectable({
  providedIn: 'root'
})
export class ActivityService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/guides`;

  // Map category string to number for backend
  private categoryToNumber(category: string): number {
    const map: Record<string, number> = {
      'museum': 0,
      'park': 1,
      'restaurant': 2,
      'beach': 3,
      'other': 4
    };
    return map[category] ?? 2;
  }

  // Map category number to string for frontend - FIXED
  private numberToCategory(num: number): 'museum' | 'park' | 'restaurant' | 'beach' | 'other' {
    const map: Record<number, any> = {
      0: 'museum',
      1: 'park',
      2: 'restaurant',
      3: 'beach',
      4: 'other'
    };
    return map[num] || 'restaurant';
  }

  getActivitiesForGuide(guideId: string): Observable<Activity[]> {
    const numericGuideId = parseInt(guideId, 10);
    return this.http.get<BackendActivity[]>(`${this.apiUrl}/${numericGuideId}/activities`).pipe(
      map(activities => activities.map(a => ({
        id: a.id,
        guideId: a.guideId,
        title: a.title,
        description: a.description,
        category: this.numberToCategory(a.categoryCategory),
        address: a.address || '',
        phone: a.phone || '',
        openingHours: a.schedule || '',
        website: a.website || '',
        order: a.order,
        day: a.day
      })))
    );
  }

  addActivity(activityData: ActivityCreateRequest): Observable<Activity> {
    const payload = {
      title: activityData.title,
      description: activityData.description,
      categoryCategory: this.categoryToNumber(activityData.category),
      address: activityData.address || '',
      phone: activityData.phone || '',
      schedule: activityData.openingHours || '',
      website: activityData.website || '',
      order: activityData.order,
      day: activityData.day,
      guideId: activityData.guideId
    };
    console.log('Sending to backend:', payload);
    return this.http.post<BackendActivity>(`${this.apiUrl}/activity`, payload).pipe(
      map(a => ({
        id: a.id,
        guideId: a.guideId,
        title: a.title,
        description: a.description,
        category: this.numberToCategory(a.categoryCategory),
        address: a.address || '',
        phone: a.phone || '',
        openingHours: a.schedule || '',
        website: a.website || '',
        order: a.order,
        day: a.day
      }))
    );
  }

  updateActivity(activityId: number, activityData: ActivityUpdateRequest): Observable<Activity> {
    const payload: any = {};
    if (activityData.title !== undefined) payload.title = activityData.title;
    if (activityData.description !== undefined) payload.description = activityData.description;
    if (activityData.category !== undefined) payload.categoryCategory = this.categoryToNumber(activityData.category);
    if (activityData.address !== undefined) payload.address = activityData.address;
    if (activityData.phone !== undefined) payload.phone = activityData.phone;
    if (activityData.openingHours !== undefined) payload.schedule = activityData.openingHours;
    if (activityData.website !== undefined) payload.website = activityData.website;
    if (activityData.order !== undefined) payload.order = activityData.order;
    if (activityData.day !== undefined) payload.day = activityData.day;

    console.log('Updating backend with:', payload);
    return this.http.put<BackendActivity>(`${this.apiUrl}/activity/${activityId}`, payload).pipe(
      map(a => ({
        id: a.id,
        guideId: a.guideId,
        title: a.title,
        description: a.description,
        category: this.numberToCategory(a.categoryCategory),
        address: a.address || '',
        phone: a.phone || '',
        openingHours: a.schedule || '',
        website: a.website || '',
        order: a.order,
        day: a.day
      }))
    );
  }

  deleteActivity(activityId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/activity/${activityId}`);
  }
}
