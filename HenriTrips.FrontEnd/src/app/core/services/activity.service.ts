import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface Activity {
  id: string;
  guideId: string;
  dayNumber: number;
  order: number;
  title: string;
  description: string;
  category: 'museum' | 'castle' | 'activity' | 'park' | 'cave';
  address?: string;
  phone?: string;
  openingHours?: string;
  website?: string;
}

const INITIAL_ACTIVITIES: Activity[] = [
  // Paris Guide Activities
  {
    id: 'act-1', guideId: 'guide-1', dayNumber: 1, order: 1,
    title: 'Louvre Museum', description: 'Visit the world\'s largest art museum.',
    category: 'museum', address: 'Rue de Rivoli, 75001 Paris', website: 'https://louvre.fr'
  },
  {
    id: 'act-2', guideId: 'guide-1', dayNumber: 1, order: 2,
    title: 'Eiffel Tower Tour', description: 'Climb the iconic tower..',
    category: 'activity', address: 'Champ de Mars, 5 Ave Anatole France'
  },
  {
    id: 'act-3', guideId: 'guide-1', dayNumber: 2, order: 1,
    title: 'Versailles Palace', description: 'Explore the grand royal chateau.',
    category: 'castle', address: 'Place d\'Armes, 78000 Versailles'
  },
  // Swiss Alps Activities
  {
    id: 'act-4', guideId: 'guide-2', dayNumber: 1, order: 1,
    title: 'Matterhorn Hike', description: 'Beginner friendly hike near Matterhorn.',
    category: 'park', address: 'Zermatt, Switzerland'
  },
  // Kyoto Activities
  {
    id: 'act-5', guideId: 'guide-3', dayNumber: 1, order: 1,
    title: 'Nijo Castle', description: 'Tour the historical samurai castle.',
    category: 'castle', address: '541 Nijo-jo-cho, Nakagyo Ward, Kyoto'
  }
];

@Injectable({
  providedIn: 'root'
})
export class ActivityService {
  private activities = signal<Activity[]>([]);

  constructor() {
    const saved = localStorage.getItem('henri_trips_activities_db');
    if (saved) {
      this.activities.set(JSON.parse(saved));
    } else {
      this.activities.set(INITIAL_ACTIVITIES);
      this.saveToStorage();
    }
  }

  private saveToStorage() {
    localStorage.setItem('henri_trips_activities_db', JSON.stringify(this.activities()));
  }

  getActivitiesForGuide(guideId: string): Observable<Activity[]> {
    return of(this.activities()
      .filter(a => a.guideId === guideId)
      .sort((a, b) => a.dayNumber - b.dayNumber || a.order - b.order)
    );
  }

  addActivity(activityData: Omit<Activity, 'id'>) {
    const newActivity: Activity = {
      ...activityData,
      id: 'act-' + Math.random().toString(36).substr(2, 9)
    };
    this.activities.update(acts => [...acts, newActivity]);
    this.saveToStorage();
    return newActivity;
  }

  updateActivity(id: string, updates: Partial<Activity>) {
    this.activities.update(acts => acts.map(a => a.id === id ? { ...a, ...updates } : a));
    this.saveToStorage();
  }

  deleteActivity(id: string) {
    this.activities.update(acts => acts.filter(a => a.id !== id));
    this.saveToStorage();
  }
}
