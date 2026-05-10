import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of, catchError, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface Activity {
  id: number;
  guideId: number;
  title: string;
  description: string;
  category: number;
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
  category: number;
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
  category?: number;
  address?: string;
  phone?: string;
  openingHours?: string;
  website?: string;
  order?: number;
  day?: number;
  guideId?: number;
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
  private apiUrl = `${environment.apiUrl}`;

  getActivitiesForGuide(guideId: string): Observable<Activity[]> {
    const numericGuideId = parseInt(guideId, 10);

    return this.http
      .get<ApiResponse<BackendActivity[]>>(`${this.apiUrl}/activities/guide/${numericGuideId}`)
      .pipe(
        map(res => {
          console.log('Activities API response:', res);
          if (!res.success || !res.data) {
            return [];
          }
          return res.data.map(a => ({
            id: a.id,
            guideId: a.guideId,
            title: a.title,
            description: a.description,
            category: a.categoryCategory,
            address: a.address || '',
            phone: a.phone || '',
            openingHours: a.schedule || '',
            website: a.website || '',
            order: a.order,
            day: a.day
          }));
        }),
        catchError((error) => {
          console.error('Failed to load activities:', error);
          return of([]);
        })
      );
  }

  addActivity(activityData: ActivityCreateRequest): Observable<Activity> {
    const payload = {
      title: activityData.title,
      description: activityData.description,
      categoryCategory: activityData.category,
      address: activityData.address || '',
      phone: activityData.phone || '',
      schedule: activityData.openingHours || '',
      website: activityData.website || '',
      order: activityData.order,
      day: activityData.day,
      guideId: activityData.guideId
    };

    console.log('Sending to backend POST /api/activities:', payload);

    return this.http
      .post<ApiResponse<number>>(`${this.apiUrl}/activities`, payload)
      .pipe(
        map(res => {
          console.log('Create activity response:', res);
          const id = res.data;

          if (!id) {
            throw new Error('Invalid activity ID from API');
          }

          // return constructed activity so UI continues to work
          return {
            id: id,
            guideId: payload.guideId,
            title: payload.title,
            description: payload.description,
            category: payload.categoryCategory,
            address: payload.address,
            phone: payload.phone,
            openingHours: payload.schedule,
            website: payload.website,
            order: payload.order,
            day: payload.day
          };
        }),
        catchError((error) => {
          console.error('Create activity failed:', error);
          throw error;
        })
      );
  }

  updateActivity(activityId: number, activityData: ActivityUpdateRequest): Observable<boolean> {
    const payload: any = {};
    
    if (activityData.title !== undefined) payload.title = activityData.title;
    if (activityData.description !== undefined) payload.description = activityData.description;
    if (activityData.category !== undefined) payload.categoryCategory = activityData.category;
    if (activityData.address !== undefined) payload.address = activityData.address;
    if (activityData.phone !== undefined) payload.phone = activityData.phone;
    if (activityData.openingHours !== undefined) payload.schedule = activityData.openingHours;
    if (activityData.website !== undefined) payload.website = activityData.website;
    if (activityData.order !== undefined) payload.order = activityData.order;
    if (activityData.day !== undefined) payload.day = activityData.day;
    if (activityData.guideId !== undefined) payload.guideId = activityData.guideId;

    console.log('Updating backend PUT /api/activities/' + activityId + ':', payload);
    
    return this.http
      .put<ApiResponse<void>>(`${this.apiUrl}/activities/${activityId}`, payload)
      .pipe(
        map((res) => {
          console.log('Update activity response:', res);
          return true;
        }),
        catchError((error) => {
          console.error('Update failed:', error);
          return of(false);
        })
      );
  }

  deleteActivity(activityId: number): Observable<boolean> {
    console.log('Deleting activity:', activityId);
    
    return this.http
      .delete<ApiResponse<void>>(`${this.apiUrl}/activities/${activityId}`)
      .pipe(
        map((res) => {
          console.log('Delete activity response:', res);
          return true;
        }),
        catchError((error) => {
          console.error('Delete failed:', error);
          return of(false);
        })
      );
  }
}