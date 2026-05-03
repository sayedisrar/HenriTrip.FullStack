// src/app/core/services/guide.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}
export interface Guide {
  id: string;
  title: string;
  description: string;
  days: number;
  mobility: string[];
  seasons: string[];
  targetAudience: string[];
  imageUrl?: string;
}

interface BackendGuide {
  id: number;
  title: string;
  description: string;
  days: number;
  mobility: string;
  season: string;
  forWho: string;
  activities?: any[];
}

@Injectable({
  providedIn: 'root'
})
export class GuideService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/guides`;

  private transformGuide(backendGuide: BackendGuide): Guide {
    return {
      id: backendGuide.id.toString(),
      title: backendGuide.title,
      description: backendGuide.description,
      days: backendGuide.days,
      mobility: backendGuide.mobility?.split(',').map(m => m.trim()).filter(m => m) || [],
      seasons: backendGuide.season?.split(',').map(s => s.trim()).filter(s => s) || [],
      targetAudience: backendGuide.forWho?.split(',').map(a => a.trim()).filter(a => a) || [],
      imageUrl: this.getImageByTitle(backendGuide.title)
    };
  }

  private getImageByTitle(title: string): string {
    const titleLower = title.toLowerCase();
    
    const imageMap: { keywords: string[], url: string }[] = [
      { keywords: ['paris', 'france', 'eiffel'], url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=600' },
      { keywords: ['london', 'england', 'uk'], url: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&q=80&w=600' },
      { keywords: ['rome', 'italy', 'colosseum'], url: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&q=80&w=600' },
      { keywords: ['barcelona', 'spain'], url: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=600&auto=format' },
      { keywords: ['amsterdam', 'netherlands'], url: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?auto=format&fit=crop&q=80&w=600' },
      { keywords: ['berlin', 'germany'], url: 'https://images.unsplash.com/photo-1560969184-10fe8719e047?auto=format&fit=crop&q=80&w=600' },
      { keywords: ['beach', 'tropical'], url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=600' },
      { keywords: ['mountain', 'hike'], url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=600' }
    ];

    for (const item of imageMap) {
      for (const keyword of item.keywords) {
        if (titleLower.includes(keyword)) {
          return item.url;
        }
      }
    }

    return 'https://images.unsplash.com/photo-1542314831-c6a4d14ebb40?auto=format&fit=crop&q=80&w=600';
  }

  private transformToBackend(guideData: any): any {
    console.log('Transforming frontend data:', guideData);
    
    const backendData = {
      title: guideData.title?.trim() || '',
      description: guideData.description?.trim() || '',
      days: Number(guideData.days) || 1,
      mobility: Array.isArray(guideData.mobility) ? guideData.mobility.join(',') : (guideData.mobility || ''),
      season: Array.isArray(guideData.seasons) ? guideData.seasons.join(',') : (guideData.seasons || ''),
      forWho: Array.isArray(guideData.targetAudience) ? guideData.targetAudience.join(',') : (guideData.targetAudience || '')
    };
    
    console.log('Transformed backend data:', backendData);
    return backendData;
  }

getGuides(): Observable<Guide[]> {
  return this.http.get<ApiResponse<BackendGuide[]>>(this.apiUrl).pipe(
    map(res => res.data.map(guide => this.transformGuide(guide)))
  );
}

getGuideById(id: string): Observable<Guide> {
  const numericId = parseInt(id, 10);

  return this.http.get<ApiResponse<BackendGuide>>(`${this.apiUrl}/${numericId}`).pipe(
    map(res => this.transformGuide(res.data))
  );
}

  // FIXED: Backend returns just the ID (number), so fetch the full guide after creation
 addGuide(guideData: any): Observable<Guide> {
  const backendData = this.transformToBackend(guideData);

  console.log('Sending POST request to:', this.apiUrl);
  console.log('Request body:', JSON.stringify(backendData, null, 2));

  return this.http.post<ApiResponse<number>>(this.apiUrl, backendData).pipe(
    switchMap(response => {
      const guideId = response.data;

      console.log('Guide created with ID:', guideId);

      if (!guideId) {
        throw new Error('Invalid guide ID returned from API');
      }

      return this.getGuideById(guideId.toString());
    })
  );
}

  updateGuide(id: string, guideData: any): Observable<Guide> {
    const numericId = parseInt(id, 10);
    const backendData = this.transformToBackend(guideData);
    
    console.log(`Sending PUT request to: ${this.apiUrl}/${numericId}`);
    console.log('Request body:', JSON.stringify(backendData, null, 2));
    
    // After update, fetch the updated guide
    return this.http.put<void>(`${this.apiUrl}/${numericId}`, backendData).pipe(
      switchMap(() => this.getGuideById(id))
    );
  }

  deleteGuide(id: string): Observable<any> {
    const numericId = parseInt(id, 10);
    return this.http.delete(`${this.apiUrl}/${numericId}`);
  }
}