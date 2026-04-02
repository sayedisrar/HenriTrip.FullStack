import { Injectable, signal } from '@angular/core';

export interface User {
  id: string;
  name: string;
  role: 'admin' | 'user';
  invitedGuideIds: string[];
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  // Mock data representing the "database" of users
  private initialUsers: User[] = [
    { id: 'admin1', name: 'Admin User', role: 'admin', invitedGuideIds: [] },
    { id: 'user1', name: 'Regular User', role: 'user', invitedGuideIds: ['guide-1'] }
  ];

  users = signal<User[]>([]);

  constructor() {
    const saved = localStorage.getItem('henri_trips_users_db');
    if (saved) {
      this.users.set(JSON.parse(saved));
    } else {
      this.users.set(this.initialUsers);
      this.saveToStorage();
    }
  }

  private saveToStorage() {
    localStorage.setItem('henri_trips_users_db', JSON.stringify(this.users()));
  }

  getUsers(): User[] {
    return this.users();
  }

  getUserById(id: string): User | undefined {
    return this.users().find(u => u.id === id);
  }

  addUser(user: Omit<User, 'id'>) {
    const newUser: User = {
      ...user,
      id: 'usr-' + Math.random().toString(36).substr(2, 9)
    };
    this.users.update(users => [...users, newUser]);
    this.saveToStorage();
    return newUser;
  }

  updateUser(id: string, updates: Partial<User>) {
    this.users.update(users => users.map(u => u.id === id ? { ...u, ...updates } : u));
    this.saveToStorage();
  }

  deleteUser(id: string) {
    this.users.update(users => users.filter(u => u.id !== id));
    this.saveToStorage();
  }
}
