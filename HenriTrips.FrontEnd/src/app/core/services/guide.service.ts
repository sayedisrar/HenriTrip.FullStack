// src/app/services/guide.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

// Frontend-facing interface (what components expect - with string IDs)
export interface Guide {
  id: string;
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
  mobility: string;
  season: string;
  forWho: string;
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
      id: backendGuide.id.toString(),
      title: backendGuide.title,
      description: backendGuide.description,
      days: backendGuide.days,
      mobility: backendGuide.mobility?.split(',').map(m => m.trim()) as any || [],
      seasons: backendGuide.season?.split(',').map(s => s.trim()) as any || [],
      targetAudience: backendGuide.forWho?.split(',').map(a => a.trim()) as any || [],
      imageUrl: this.getImageByTitle(backendGuide.title)
    };
  }

  // FIXED: Case-insensitive image mapping
  private getImageByTitle(title: string): string {
    // If no title, return default immediately
    if (!title) {
      return 'https://images.unsplash.com/photo-1542314831-c6a4d14ebb40?auto=format&fit=crop&q=80&w=600';
    }

    const titleLower = title.toLowerCase();

    // Define keyword mappings for specific destinations
    const imageMap: { keywords: string[], url: string }[] = [
      { keywords: ['paris', 'france', 'eiffel'], url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=600' },
      { keywords: ['london', 'england', 'uk', 'britain'], url: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&q=80&w=600' },
      { keywords: ['rome', 'italy', 'colosseum'], url: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&q=80&w=600' },
      { keywords: ['barcelona', 'spain', 'gaudi'], url: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=600&auto=format' },
      { keywords: ['amsterdam', 'netherlands', 'holland'], url: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?auto=format&fit=crop&q=80&w=600' },
      { keywords: ['berlin', 'germany'], url: 'https://images.unsplash.com/photo-1560969184-10fe8719e047?auto=format&fit=crop&q=80&w=600' },
      { keywords: ['madrid', 'spain'], url: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&q=80&w=600' },
      { keywords: ['lisbon', 'portugal'], url: 'https://images.unsplash.com/photo-1513407030348-c983a97b98d8?auto=format&fit=crop&q=80&w=600' },
      { keywords: ['prague', 'czech'], url: 'https://images.unsplash.com/photo-1541849546-216549ae216d?auto=format&fit=crop&q=80&w=600' },
      { keywords: ['vienna', 'austria'], url: 'https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?auto=format&fit=crop&q=80&w=600' },
      { keywords: ['budapest', 'hungary'], url: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=600&auto=format' },
      { keywords: ['dubai', 'uae'], url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&q=80&w=600' },
      { keywords: ['tokyo', 'japan'], url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80&w=600' },
      { keywords: ['new york', 'nyc', 'manhattan'], url: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&q=80&w=600' },
      { keywords: ['swiss alps', 'switzerland'], url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&auto=format' },
      { keywords: ['kyoto', 'japan'], url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=600' },
      { keywords: ['istanbul', 'turkey'], url: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&q=80&w=600' },
      { keywords: ['cairo', 'egypt', 'pyramids'], url: 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&q=80&w=600' },
      { keywords: ['morocco', 'marrakech'], url: 'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?auto=format&fit=crop&q=80&w=600' },
      { keywords: ['india', 'mumbai', 'delhi'], url: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&q=80&w=600' },
      { keywords: ['bangkok', 'thailand'], url: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=600&auto=format' },
      { keywords: ['australia', 'sydney'], url: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&q=80&w=600' },
      { keywords: ['brazil', 'rio'], url: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&q=80&w=600' },
      { keywords: ['south africa', 'cape town'], url: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&q=80&w=600' },
      { keywords: ['beach', 'tropical', 'paradise'], url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=600' },
      { keywords: ['mountain', 'hike', 'trek'], url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=600' }
    ];

    // Check for matches
    for (const item of imageMap) {
      for (const keyword of item.keywords) {
        if (titleLower.includes(keyword)) {
          return item.url;
        }
      }
    }

    // Default fallback image for any unmapped title (including afghanistan)
    return 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600&auto=format';
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

//// src/app/services/guide.service.ts
//import { Injectable, inject } from '@angular/core';
//import { HttpClient } from '@angular/common/http';
//import { Observable, map } from 'rxjs';
//import { environment } from '../../../environments/environment';

//// Frontend-facing interface (what components expect - with string IDs)
//export interface Guide {
//  id: string;  // Changed to string to match component expectations
//  title: string;
//  description: string;
//  days: number;
//  mobility: ('car' | 'bike' | 'walking' | 'motorcycle')[];
//  seasons: ('summer' | 'spring' | 'autumn' | 'winter')[];
//  targetAudience: ('family' | 'solo' | 'group' | 'friends')[];
//  imageUrl?: string;
//}

//export interface Activity {
//  id: number;
//  title: string;
//  description: string;
//  categoryCategory: number;
//  address: string;
//  phone: string;
//  schedule: string;
//  website: string;
//  order: number;
//  day: number;
//}

//// Backend DTO interface (what API returns - with number IDs)
//interface BackendGuide {
//  id: number;
//  title: string;
//  description: string;
//  days: number;
//  mobility: string;      // Comma-separated string e.g., "walking,bike"
//  season: string;        // Comma-separated string e.g., "spring,summer"
//  forWho: string;        // Comma-separated string e.g., "family,friends"
//  activities?: Activity[];
//}

//@Injectable({
//  providedIn: 'root'
//})
//export class GuideService {
//  private http = inject(HttpClient);
//  private apiUrl = `${environment.apiUrl}/guides`;

//  // Helper method to transform backend data to frontend format
//    private transformGuide(backendGuide: BackendGuide): Guide {
//    return {
//      id: backendGuide.id.toString(),
//      title: backendGuide.title,
//      description: backendGuide.description,
//      days: backendGuide.days,
//      mobility: backendGuide.mobility?.split(',').map(m => m.trim()) as any || [],
//      seasons: backendGuide.season?.split(',').map(s => s.trim()) as any || [],
//      targetAudience: backendGuide.forWho?.split(',').map(a => a.trim()) as any || [],
//      imageUrl: this.getImageByTitle(backendGuide.title)
//    };
//  }

//  // Add this method
//  private getImageByTitle(title: string): string {
//    const imageMap: { [key: string]: string } = {
//      'Paris': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=600',
//      'London': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&q=80&w=600',
//      'Rome': 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&q=80&w=600',
//      'Barcelona': 'https://images.unsplash.com/photo-1583422409517-2895a77ef9a7?auto=format&fit=crop&q=80&w=600'
//    };

//    for (const [key, url] of Object.entries(imageMap)) {
//      if (title.includes(key)) {
//        return url;
//      }
//    }

//    // Default fallback image
//    return 'https://images.unsplash.com/photo-1542314831-c6a4d14ebb40?auto=format&fit=crop&q=80&w=600';
//  }


//  // Helper method to get image URL based on title
//  private getImageUrl(title: string): string | undefined {
//    const imageMap: { [key: string]: string } = {
//      'Paris': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=600',
//      'Swiss Alps': 'https://images.unsplash.com/photo-1522857476834-8c4d29199d25?auto=format&fit=crop&q=80&w=600',
//      'Kyoto': 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=600'
//    };

//    for (const [key, url] of Object.entries(imageMap)) {
//      if (title.includes(key)) {
//        return url;
//      }
//    }
//    return undefined;
//  }

//  // Transform frontend data to backend format for creating/updating
//  private transformToBackend(guideData: any): any {
//    return {
//      title: guideData.title,
//      description: guideData.description,
//      days: guideData.days,
//      mobility: Array.isArray(guideData.mobility) ? guideData.mobility.join(',') : guideData.mobility,
//      season: Array.isArray(guideData.seasons) ? guideData.seasons.join(',') : guideData.seasons,
//      forWho: Array.isArray(guideData.targetAudience) ? guideData.targetAudience.join(',') : guideData.targetAudience
//    };
//  }

//  // Get all guides (respects user permissions from backend)
//  getGuides(): Observable<Guide[]> {
//    return this.http.get<BackendGuide[]>(this.apiUrl).pipe(
//      map(guides => guides.map(guide => this.transformGuide(guide)))
//    );
//  }

//  // Get single guide by ID (accepts string, converts to number for API)
//  getGuideById(id: string): Observable<Guide> {
//    const numericId = parseInt(id, 10);
//    return this.http.get<BackendGuide>(`${this.apiUrl}/${numericId}`).pipe(
//      map(guide => this.transformGuide(guide))
//    );
//  }

//  // Create new guide (admin only)
//  addGuide(guideData: any): Observable<Guide> {
//    const backendData = this.transformToBackend(guideData);
//    return this.http.post<BackendGuide>(this.apiUrl, backendData).pipe(
//      map(guide => this.transformGuide(guide))
//    );
//  }

//  // Update guide (admin only) - accepts string ID
//  updateGuide(id: string, guideData: any): Observable<Guide> {
//    const numericId = parseInt(id, 10);
//    const backendData = this.transformToBackend(guideData);
//    return this.http.put<BackendGuide>(`${this.apiUrl}/${numericId}`, backendData).pipe(
//      map(guide => this.transformGuide(guide))
//    );
//  }

//  // Delete guide (admin only) - accepts string ID
//  deleteGuide(id: string): Observable<any> {
//    const numericId = parseInt(id, 10);
//    return this.http.delete(`${this.apiUrl}/${numericId}`);
//  }

//  // Add activity to guide (admin only)
//  addActivity(activityData: any): Observable<Activity> {
//    return this.http.post<Activity>(`${this.apiUrl}/activity`, activityData);
//  }

//  // Update activity (admin only)
//  updateActivity(activityId: number, activityData: any): Observable<Activity> {
//    return this.http.put<Activity>(`${this.apiUrl}/activity/${activityId}`, activityData);
//  }

//  // Delete activity (admin only)
//  deleteActivity(activityId: number): Observable<any> {
//    return this.http.delete(`${this.apiUrl}/activity/${activityId}`);
//  }

//  // Invite user to guide (admin only)
//  inviteUserToGuide(guideId: string, userId: string): Observable<any> {
//    const numericGuideId = parseInt(guideId, 10);
//    return this.http.post(`${this.apiUrl}/${numericGuideId}/invite-user/${userId}`, {});
//  }

//  // Remove user from guide (admin only)
//  removeUserFromGuide(guideId: string, userId: string): Observable<any> {
//    const numericGuideId = parseInt(guideId, 10);
//    return this.http.delete(`${this.apiUrl}/${numericGuideId}/remove-user/${userId}`);
//  }
//}
