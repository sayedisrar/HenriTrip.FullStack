// src/app/services/guide.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

// Frontend-facing interface (what components expect - with string IDs)
export interface Guide {
  id: string;  // Changed to string to match component expectations
  title: string;
  description: string;
  days: number;
  mobility: ('car' | 'bike' | 'walking' | 'motorcycle')[];
  seasons: ('summer' | 'spring' | 'autumn' | 'winter')[];
  targetAudience: ('family' | 'solo' | 'group' | 'friends')[];
  imageUrl?: string;
}

export interface Activity {
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
}

// Backend DTO interface (what API returns - with number IDs)
interface BackendGuide {
  id: number;
  title: string;
  description: string;
  days: number;
  mobility: string;      // Comma-separated string e.g., "walking,bike"
  season: string;        // Comma-separated string e.g., "spring,summer"
  forWho: string;        // Comma-separated string e.g., "family,friends"
  activities?: Activity[];
}

@Injectable({
  providedIn: 'root'
})
export class GuideService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/guides`;

  // Helper method to transform backend data to frontend format
  private transformGuide(backendGuide: BackendGuide): Guide {
    return {
      id: backendGuide.id.toString(),  // Convert number to string for compatibility
      title: backendGuide.title,
      description: backendGuide.description,
      days: backendGuide.days,
      mobility: backendGuide.mobility?.split(',').map(m => m.trim()) as any || [],
      seasons: backendGuide.season?.split(',').map(s => s.trim()) as any || [],
      targetAudience: backendGuide.forWho?.split(',').map(a => a.trim()) as any || [],
      imageUrl: this.getImageUrl(backendGuide.title)
    };
  }

  // Helper method to get image URL based on title
  private getImageUrl(title: string): string | undefined {
    const imageMap: { [key: string]: string } = {
      'Paris': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=600',
      'Swiss Alps': 'https://images.unsplash.com/photo-1522857476834-8c4d29199d25?auto=format&fit=crop&q=80&w=600',
      'Kyoto': 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=600'
    };

    for (const [key, url] of Object.entries(imageMap)) {
      if (title.includes(key)) {
        return url;
      }
    }
    return undefined;
  }

  // Transform frontend data to backend format for creating/updating
  private transformToBackend(guideData: any): any {
    return {
      title: guideData.title,
      description: guideData.description,
      days: guideData.days,
      mobility: Array.isArray(guideData.mobility) ? guideData.mobility.join(',') : guideData.mobility,
      season: Array.isArray(guideData.seasons) ? guideData.seasons.join(',') : guideData.seasons,
      forWho: Array.isArray(guideData.targetAudience) ? guideData.targetAudience.join(',') : guideData.targetAudience
    };
  }

  // Get all guides (respects user permissions from backend)
  getGuides(): Observable<Guide[]> {
    return this.http.get<BackendGuide[]>(this.apiUrl).pipe(
      map(guides => guides.map(guide => this.transformGuide(guide)))
    );
  }

  // Get single guide by ID (accepts string, converts to number for API)
  getGuideById(id: string): Observable<Guide> {
    const numericId = parseInt(id, 10);
    return this.http.get<BackendGuide>(`${this.apiUrl}/${numericId}`).pipe(
      map(guide => this.transformGuide(guide))
    );
  }

  // Create new guide (admin only)
  addGuide(guideData: any): Observable<Guide> {
    const backendData = this.transformToBackend(guideData);
    return this.http.post<BackendGuide>(this.apiUrl, backendData).pipe(
      map(guide => this.transformGuide(guide))
    );
  }

  // Update guide (admin only) - accepts string ID
  updateGuide(id: string, guideData: any): Observable<Guide> {
    const numericId = parseInt(id, 10);
    const backendData = this.transformToBackend(guideData);
    return this.http.put<BackendGuide>(`${this.apiUrl}/${numericId}`, backendData).pipe(
      map(guide => this.transformGuide(guide))
    );
  }

  // Delete guide (admin only) - accepts string ID
  deleteGuide(id: string): Observable<any> {
    const numericId = parseInt(id, 10);
    return this.http.delete(`${this.apiUrl}/${numericId}`);
  }

  // Add activity to guide (admin only)
  addActivity(activityData: any): Observable<Activity> {
    return this.http.post<Activity>(`${this.apiUrl}/activity`, activityData);
  }

  // Update activity (admin only)
  updateActivity(activityId: number, activityData: any): Observable<Activity> {
    return this.http.put<Activity>(`${this.apiUrl}/activity/${activityId}`, activityData);
  }

  // Delete activity (admin only)
  deleteActivity(activityId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/activity/${activityId}`);
  }

  // Invite user to guide (admin only)
  inviteUserToGuide(guideId: string, userId: string): Observable<any> {
    const numericGuideId = parseInt(guideId, 10);
    return this.http.post(`${this.apiUrl}/${numericGuideId}/invite-user/${userId}`, {});
  }

  // Remove user from guide (admin only)
  removeUserFromGuide(guideId: string, userId: string): Observable<any> {
    const numericGuideId = parseInt(guideId, 10);
    return this.http.delete(`${this.apiUrl}/${numericGuideId}/remove-user/${userId}`);
  }
}


//import { Injectable, inject, signal } from '@angular/core';
//import { Observable, of } from 'rxjs';
//import { AuthService } from './auth.service';

//export interface Guide {
//  id: string;
//  title: string;
//  description: string;
//  days: number;
//  mobility: ('car' | 'bike' | 'walking' | 'motorcycle')[];
//  seasons: ('summer' | 'spring' | 'autumn' | 'winter')[];
//  targetAudience: ('family' | 'solo' | 'group' | 'friends')[];
//  imageUrl?: string;
//}

//const INITIAL_GUIDES: Guide[] = [
//  ...Array.from({length: 3}, (_, i) => ({
//      id: `guide-${i + 1}`,
//      title: ['Paris Weekend Gateway', 'Swiss Alps Adventure', 'Hidden Kyoto'][i],
//      description: ['Explore the city of lights over an amazing weekend filled with culture and food.', 'A thrilling mountain escape featuring the best hiking trails and scenic views.', 'Discover the ancient temples and quiet gardens of Japan\'s cultural heart.'][i],
//      days: [3, 5, 4][i],
//      mobility: [['walking', 'bike'], ['car', 'walking'], ['walking', 'bike']][i] as any,
//      seasons: [['spring', 'summer', 'autumn'], ['summer'], ['autumn', 'spring']][i] as any,
//      targetAudience: [['family', 'friends'], ['solo', 'group'], ['solo', 'family']][i] as any,
//      imageUrl: ['https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=600', 'https://images.unsplash.com/photo-1522857476834-8c4d29199d25?auto=format&fit=crop&q=80&w=600', 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=600'][i]
//  }))
//];

//@Injectable({
//  providedIn: 'root'
//})
//export class GuideService {
//  private auth = inject(AuthService);
//  private guides = signal<Guide[]>([]);

//  constructor() {
//    const saved = localStorage.getItem('henri_trips_guides_db');
//    if (saved) {
//      this.guides.set(JSON.parse(saved));
//    } else {
//      this.guides.set(INITIAL_GUIDES);
//      this.saveToStorage();
//    }
//  }

//  private saveToStorage() {
//    localStorage.setItem('henri_trips_guides_db', JSON.stringify(this.guides()));
//  }

//  getGuides(): Observable<Guide[]> {
//    const user = this.auth.currentUser();
//    if (!user) return of([]);

//    if (user.role === 'admin') {
//      return of(this.guides());
//    } else {
//      // Regular users only see guides they are invited to
//      const allowed = user.invitedGuideIds || [];
//      return of(this.guides().filter(g => allowed.includes(g.id)));
//    }
//  }

//  getGuideById(id: string): Observable<Guide | undefined> {
//    const user = this.auth.currentUser();
//    if (!user) return of(undefined);
    
//    if (user.role !== 'admin' && !(user.invitedGuideIds || []).includes(id)) {
//      return of(undefined);
//    }
    
//    return of(this.guides().find(g => g.id === id));
//  }

//  addGuide(guideData: Omit<Guide, 'id'>) {
//    const newGuide: Guide = {
//      ...guideData,
//      id: 'guide-' + Math.random().toString(36).substr(2, 9)
//    };
//    this.guides.update(guides => [...guides, newGuide]);
//    this.saveToStorage();
//    return newGuide;
//  }

//  updateGuide(id: string, updates: Partial<Guide>) {
//    this.guides.update(guides => guides.map(g => g.id === id ? { ...g, ...updates } : g));
//    this.saveToStorage();
//  }

//  deleteGuide(id: string) {
//    this.guides.update(guides => guides.filter(g => g.id !== id));
//    this.saveToStorage();
//  }
//}
