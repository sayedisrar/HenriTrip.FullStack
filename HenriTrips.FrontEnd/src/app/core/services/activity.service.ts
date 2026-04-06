// \app\core\services\activity.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Activity {
  id: number;
  guideId: number;
  title: string;
  description: string;
  category: 'museum' | 'castle' | 'activity' | 'park' | 'cave';
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
      'activity': 2,
      'castle': 4,
      'cave': 4
    };
    return map[category] ?? 2;
  }

  // Map category number to string for frontend - FIXED
  // FIX THIS in activity.service.ts (around line 50-60)
  private numberToCategory(num: number): 'museum' | 'castle' | 'activity' | 'park' | 'cave' {
    const map: Record<number, 'museum' | 'castle' | 'activity' | 'park' | 'cave'> = {
      0: 'museum',
      1: 'park',
      2: 'activity',
      3: 'activity',  // Add this for Beach (category 3)
      4: 'castle'     // Castle/Cave as 'castle'
    };
    return map[num] || 'activity';
  }

  getActivitiesForGuide(guideId: string): Observable<Activity[]> {
    const numericGuideId = parseInt(guideId, 10);
    return this.http.get<BackendActivity[]>(`${this.apiUrl}/${numericGuideId}/activities`).pipe(
      map(activities => activities.map(a => ({
        id: a.id,
        guideId: a.guideId,
        title: a.title,
        description: a.description,
        category: this.numberToCategory(a.categoryCategory),  // ← THIS LINE IS CRITICAL
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

//// \app\core\services\activity.service.ts
//import { Injectable, inject } from '@angular/core';
//import { HttpClient } from '@angular/common/http';
//import { Observable, map } from 'rxjs';
//import { environment } from '../../../environments/environment';

//export interface Activity {
//  id: number;
//  guideId: number;
//  title: string;
//  description: string;
//  category: 'museum' | 'castle' | 'activity' | 'park' | 'cave';
//  address: string;
//  phone: string;
//  openingHours: string;
//  website: string;
//  order: number;
//  day: number;
//}

//export interface ActivityCreateRequest {
//  title: string;
//  description: string;
//  category: string;
//  address: string;
//  phone: string;
//  openingHours: string;
//  website: string;
//  order: number;
//  day: number;
//  guideId: number;
//}

//export interface ActivityUpdateRequest {
//  title?: string;
//  description?: string;
//  category?: string;
//  address?: string;
//  phone?: string;
//  openingHours?: string;
//  website?: string;
//  order?: number;
//  day?: number;
//}

//// Backend activity response interface (matches your DTO)
//interface BackendActivity {
//  id: number;
//  title: string;
//  description: string;
//  categoryCategory: number;  // Enum value as number (0, 1, 2, 3, 4)
//  address: string;
//  phone: string;
//  schedule: string;
//  website: string;
//  order: number;
//  day: number;
//  guideId: number;
//}

//@Injectable({
//  providedIn: 'root'
//})
//export class ActivityService {
//  private http = inject(HttpClient);
//  private apiUrl = `${environment.apiUrl}/guides`;

//  /**
//   * Map backend activity (with schedule) to frontend activity (with openingHours)
//   */
//  private mapToFrontend(backend: BackendActivity): Activity {
//    return {
//      id: backend.id,
//      guideId: backend.guideId,
//      title: backend.title,
//      description: backend.description,
//      category: this.mapCategoryNumberToString(backend.categoryCategory),
//      address: backend.address || '',
//      phone: backend.phone || '',
//      openingHours: backend.schedule || '',
//      website: backend.website || '',
//      order: backend.order,
//      day: backend.day
//    };
//  }

//  /**
//   * Map category number to string (for frontend display)
//   */
//  private mapCategoryNumberToString(categoryNumber: number): 'museum' | 'castle' | 'activity' | 'park' | 'cave' {
//    const mapping: Record<number, 'museum' | 'castle' | 'activity' | 'park' | 'cave'> = {
//      0: 'museum',
//      1: 'park',
//      2: 'activity',
//      3: 'activity',
//      4: 'castle'
//    };
//    return mapping[categoryNumber] || 'activity';
//  }

//  /**
//   * Map category string to number (for backend API) - CRITICAL FIX
//   * Backend expects: 0=Museum, 1=Park, 2=Restaurant/Activity, 3=Beach, 4=Other/Castle
//   */
//  private mapCategoryStringToNumber(category: string): number {
//    const mapping: Record<string, number> = {
//      'museum': 0,
//      'park': 1,
//      'activity': 2,
//      'castle': 4,
//      'cave': 4
//    };
//    return mapping[category] ?? 2; // Default to 2 (activity)
//  }

//  /**
//   * Create backend DTO from frontend data
//   */
//  private createBackendDto(data: {
//    title: string;
//    description: string;
//    category: string;
//    address: string;
//    phone: string;
//    openingHours: string;
//    website: string;
//    order: number;
//    day: number;
//    guideId?: number;
//  }): any {
//    return {
//      title: data.title,
//      description: data.description,
//      categoryCategory: this.mapCategoryStringToNumber(data.category), // Convert string to number!
//      address: data.address || '',
//      phone: data.phone || '',
//      schedule: data.openingHours || '', // Map openingHours to schedule
//      website: data.website || '',
//      order: data.order,
//      day: data.day,
//      guideId: data.guideId
//    };
//  }

//  /**
//   * Get all activities for a specific guide
//   */
//  getActivitiesForGuide(guideId: string): Observable<Activity[]> {
//    const numericGuideId = parseInt(guideId, 10);
//    return this.http.get<BackendActivity[]>(`${this.apiUrl}/${numericGuideId}/activities`).pipe(
//      map(activities => (activities || []).map(a => this.mapToFrontend(a)))
//    );
//  }

//  /**
//   * Get activities for a specific guide and day
//   */
//  getActivitiesByDay(guideId: string, day: number): Observable<Activity[]> {
//    const numericGuideId = parseInt(guideId, 10);
//    return this.http.get<BackendActivity[]>(`${this.apiUrl}/${numericGuideId}/activities/day/${day}`).pipe(
//      map(activities => (activities || []).map(a => this.mapToFrontend(a)))
//    );
//  }

//  /**
//   * Create a new activity (Admin only)
//   */
//  addActivity(activityData: ActivityCreateRequest): Observable<Activity> {
//    const backendData = this.createBackendDto(activityData);
//    console.log('Sending to backend:', backendData); // Debug log
//    return this.http.post<BackendActivity>(`${this.apiUrl}/activity`, backendData).pipe(
//      map(activity => this.mapToFrontend(activity))
//    );
//  }

//  /**
//   * Update an existing activity (Admin only)
//   */
//  updateActivity(activityId: number, activityData: ActivityUpdateRequest): Observable<Activity> {
//    // For update, we need to get the existing guideId or pass partial data
//    const backendData: any = {};

//    if (activityData.title !== undefined) backendData.title = activityData.title;
//    if (activityData.description !== undefined) backendData.description = activityData.description;
//    if (activityData.category !== undefined) backendData.categoryCategory = this.mapCategoryStringToNumber(activityData.category);
//    if (activityData.address !== undefined) backendData.address = activityData.address;
//    if (activityData.phone !== undefined) backendData.phone = activityData.phone;
//    if (activityData.openingHours !== undefined) backendData.schedule = activityData.openingHours;
//    if (activityData.website !== undefined) backendData.website = activityData.website;
//    if (activityData.order !== undefined) backendData.order = activityData.order;
//    if (activityData.day !== undefined) backendData.day = activityData.day;

//    console.log('Updating backend with:', backendData); // Debug log
//    return this.http.put<BackendActivity>(`${this.apiUrl}/activity/${activityId}`, backendData).pipe(
//      map(activity => this.mapToFrontend(activity))
//    );
//  }

//  /**
//   * Delete an activity (Admin only)
//   */
//  deleteActivity(activityId: number): Observable<void> {
//    return this.http.delete<void>(`${this.apiUrl}/activity/${activityId}`);
//  }

//  /**
//   * Reorder activities within a day (Admin only)
//   */
//  reorderActivities(guideId: string, day: number, activityIds: number[]): Observable<void> {
//    const numericGuideId = parseInt(guideId, 10);
//    return this.http.post<void>(`${this.apiUrl}/${numericGuideId}/days/${day}/reorder`, { activityIds });
//  }
//}
