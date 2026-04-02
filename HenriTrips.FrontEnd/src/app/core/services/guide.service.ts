import { Injectable, inject, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AuthService } from './auth.service';

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

const INITIAL_GUIDES: Guide[] = [
  ...Array.from({length: 3}, (_, i) => ({
      id: `guide-${i + 1}`,
      title: ['Paris Weekend Gateway', 'Swiss Alps Adventure', 'Hidden Kyoto'][i],
      description: ['Explore the city of lights over an amazing weekend filled with culture and food.', 'A thrilling mountain escape featuring the best hiking trails and scenic views.', 'Discover the ancient temples and quiet gardens of Japan\'s cultural heart.'][i],
      days: [3, 5, 4][i],
      mobility: [['walking', 'bike'], ['car', 'walking'], ['walking', 'bike']][i] as any,
      seasons: [['spring', 'summer', 'autumn'], ['summer'], ['autumn', 'spring']][i] as any,
      targetAudience: [['family', 'friends'], ['solo', 'group'], ['solo', 'family']][i] as any,
      imageUrl: ['https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=600', 'https://images.unsplash.com/photo-1522857476834-8c4d29199d25?auto=format&fit=crop&q=80&w=600', 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=600'][i]
  }))
];

@Injectable({
  providedIn: 'root'
})
export class GuideService {
  private auth = inject(AuthService);
  private guides = signal<Guide[]>([]);

  constructor() {
    const saved = localStorage.getItem('henri_trips_guides_db');
    if (saved) {
      this.guides.set(JSON.parse(saved));
    } else {
      this.guides.set(INITIAL_GUIDES);
      this.saveToStorage();
    }
  }

  private saveToStorage() {
    localStorage.setItem('henri_trips_guides_db', JSON.stringify(this.guides()));
  }

  getGuides(): Observable<Guide[]> {
    const user = this.auth.currentUser();
    if (!user) return of([]);

    if (user.role === 'admin') {
      return of(this.guides());
    } else {
      // Regular users only see guides they are invited to
      const allowed = user.invitedGuideIds || [];
      return of(this.guides().filter(g => allowed.includes(g.id)));
    }
  }

  getGuideById(id: string): Observable<Guide | undefined> {
    const user = this.auth.currentUser();
    if (!user) return of(undefined);
    
    if (user.role !== 'admin' && !(user.invitedGuideIds || []).includes(id)) {
      return of(undefined);
    }
    
    return of(this.guides().find(g => g.id === id));
  }

  addGuide(guideData: Omit<Guide, 'id'>) {
    const newGuide: Guide = {
      ...guideData,
      id: 'guide-' + Math.random().toString(36).substr(2, 9)
    };
    this.guides.update(guides => [...guides, newGuide]);
    this.saveToStorage();
    return newGuide;
  }

  updateGuide(id: string, updates: Partial<Guide>) {
    this.guides.update(guides => guides.map(g => g.id === id ? { ...g, ...updates } : g));
    this.saveToStorage();
  }

  deleteGuide(id: string) {
    this.guides.update(guides => guides.filter(g => g.id !== id));
    this.saveToStorage();
  }
}
