import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConnectionService {
  isOnline = signal<boolean>(navigator.onLine);
  wasOffline = signal<boolean>(false);

  constructor() {
    window.addEventListener('online', () => {
      this.isOnline.set(true);
      this.wasOffline.set(true);
      setTimeout(() => this.wasOffline.set(false), 3000);
    });

    window.addEventListener('offline', () => {
      this.isOnline.set(false);
    });
  }
}
