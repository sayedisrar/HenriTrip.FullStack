// src/app/core/services/user.service.ts
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap, catchError, throwError, of, forkJoin, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface BackendUser {
  id: string;
  email: string;
  userName: string;
  roles: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  invitedGuideIds: string[];
}

// DTO for updating user - includes password separately
export interface UpdateUserRequest {
  email?: string;
  name?: string;
  role?: string;
  password?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/auth`;
  private guidesApiUrl = `${environment.apiUrl}/guides`;

  users = signal<User[]>([]);

  constructor() {
    this.loadUsers();
  }

  // Returns the current users array
  getUsers(): User[] {
    return this.users();
  }

  // Load users from backend with their guide counts
  loadUsers(): void {
    this.getAllUsers().subscribe({
      next: (users) => {
        // After getting users, fetch guide invitations for each user
        this.loadGuideCountsForUsers(users);
      },
      error: (error) => console.error('Failed to load users:', error)
    });
  }

  // Load guide counts for all users
  private loadGuideCountsForUsers(users: User[]): void {
    const usersWithGuidesPromises = users.map(user =>
      this.getUserInvitedGuides(user.id).pipe(
        map(guideIds => ({
          ...user,
          invitedGuideIds: guideIds
        })),
        catchError(() => of({ ...user, invitedGuideIds: [] }))
      )
    );

    forkJoin(usersWithGuidesPromises).subscribe({
      next: (usersWithGuides) => {
        this.users.set(usersWithGuides);
      },
      error: (error) => {
        console.error('Failed to load guide counts:', error);
        // Fallback: set users without guide counts
        this.users.set(users);
      }
    });
  }

  // Get all users from API (basic info only)
  getAllUsers(): Observable<User[]> {
    return this.http.get<BackendUser[]>(`${this.apiUrl}/users`).pipe(
      map(backendUsers => backendUsers.map(backendUser => this.transformToUser(backendUser))),
      catchError(this.handleError<User[]>('getAllUsers', []))
    );
  }

  // Get single user by ID from API
  getUserByIdFromApi(id: string): Observable<User> {
    return this.http.get<BackendUser>(`${this.apiUrl}/users/${id}`).pipe(
      map(backendUser => this.transformToUser(backendUser)),
      catchError(this.handleError<User>('getUserByIdFromApi'))
    );
  }

  // Get user by ID from signal (sync)
  getUserById(id: string): User | undefined {
    return this.users().find(u => u.id === id);
  }

  // Get user with their invited guides
  getUserWithInvites(id: string): Observable<User> {
    return forkJoin({
      user: this.getUserByIdFromApi(id),
      invites: this.getUserInvitedGuides(id)
    }).pipe(
      map(result => ({
        ...result.user,
        invitedGuideIds: result.invites
      })),
      catchError(this.handleError<User>('getUserWithInvites'))
    );
  }

  // Get user's invited guide IDs from database
  getUserInvitedGuides(userId: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.guidesApiUrl}/user/${userId}/invited-guides`).pipe(
      catchError(this.handleError<string[]>('getUserInvitedGuides', []))
    );
  }

  // Update all guide invitations for a user (replace all)
  updateUserGuideInvitations(userId: string, guideIds: string[]): Observable<any> {
    return this.getUserInvitedGuides(userId).pipe(
      switchMap(currentInvites => {
        const currentSet = new Set(currentInvites);
        const newSet = new Set(guideIds);

        const toAdd = guideIds.filter(id => !currentSet.has(id));
        const toRemove = currentInvites.filter(id => !newSet.has(id));

        const addRequests = toAdd.map(guideId =>
          this.inviteUserToGuide(userId, guideId)
        );
        const removeRequests = toRemove.map(guideId =>
          this.removeUserFromGuide(userId, guideId)
        );

        if (addRequests.length === 0 && removeRequests.length === 0) {
          return of({ message: 'No changes to guide invitations' });
        }

        return forkJoin([...addRequests, ...removeRequests]);
      }),
      catchError(this.handleError<any>('updateUserGuideInvitations'))
    );
  }

  // Create new user (admin only)
  addUser(userData: { email: string; password: string; role: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/create-user`, userData).pipe(
      tap(() => this.refreshUsers()),
      catchError(this.handleError<any>('addUser'))
    );
  }

  // Update user (admin only) - accepts separate password field
  updateUser(id: string, updates: Partial<User>, newPassword?: string): Observable<User> {
    const updateData: UpdateUserRequest = {};

    if (updates.email) {
      updateData.email = updates.email;
    }

    if (updates.name) {
      updateData.name = updates.name;
    }

    if (updates.role) {
      updateData.role = updates.role === 'admin' ? 'Admin' : 'User';
    }

    if (newPassword) {
      updateData.password = newPassword;
    }

    return this.http.put<BackendUser>(`${this.apiUrl}/users/${id}`, updateData).pipe(
      map(backendUser => this.transformToUser(backendUser)),
      tap(() => this.refreshUsers()),
      catchError(this.handleError<User>('updateUser'))
    );
  }

  // Update just the user's role
  updateUserRole(id: string, role: 'admin' | 'user'): Observable<User> {
    return this.updateUser(id, { role: role });
  }

  // Update just the user's email
  updateUserEmail(id: string, email: string): Observable<User> {
    return this.updateUser(id, { email: email });
  }

  // Update user's password (admin only)
  updateUserPassword(id: string, password: string): Observable<User> {
    return this.updateUser(id, {}, password);
  }

  // Delete user (admin only)
  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete-user/${id}`).pipe(
      tap(() => this.refreshUsers()),
      catchError(this.handleError<any>('deleteUser'))
    );
  }

  // Invite user to a single guide (admin only)
  inviteUserToGuide(userId: string, guideId: string): Observable<any> {
    const numericGuideId = parseInt(guideId, 10);
    return this.http.post(`${this.guidesApiUrl}/${numericGuideId}/invite-user/${userId}`, {}).pipe(
      catchError(this.handleError<any>('inviteUserToGuide'))
    );
  }

  // Remove user from a single guide (admin only)
  removeUserFromGuide(userId: string, guideId: string): Observable<any> {
    const numericGuideId = parseInt(guideId, 10);
    return this.http.delete(`${this.guidesApiUrl}/${numericGuideId}/remove-user/${userId}`).pipe(
      catchError(this.handleError<any>('removeUserFromGuide'))
    );
  }

  // Get users for a specific guide
  getUsersByGuideId(guideId: string): Observable<User[]> {
    return this.http.get<BackendUser[]>(`${this.guidesApiUrl}/${guideId}/users`).pipe(
      map(backendUsers => backendUsers.map(backendUser => this.transformToUser(backendUser))),
      catchError(this.handleError<User[]>('getUsersByGuideId', []))
    );
  }

  // Refresh users list (reload from API)
  refreshUsers(): void {
    this.loadUsers();
  }

  // Helper: Transform backend user to frontend user
  private transformToUser(backendUser: BackendUser, invitedGuideIds: string[] = []): User {
    return {
      id: backendUser.id,
      name: backendUser.userName || backendUser.email.split('@')[0],
      email: backendUser.email,
      role: backendUser.roles?.includes('Admin') ? 'admin' : 'user',
      invitedGuideIds: invitedGuideIds
    };
  }
 
  // Error handler
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed:`, error);

      let errorMessage = 'An error occurred';
      if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (error.error?.errors) {
        const errors = Object.values(error.error.errors).flat();
        errorMessage = errors.join(', ');
      } else if (error.message) {
        errorMessage = error.message;
      }

      if (result !== undefined) {
        return of(result as T);
      }
      return throwError(() => new Error(errorMessage));
    };
  }
}
