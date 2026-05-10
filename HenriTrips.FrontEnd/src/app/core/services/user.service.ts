// src/app/core/services/user.service.ts
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap, catchError, throwError, of, forkJoin, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/auth.models';


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
  guideIds?: number[];
}

// DTO for creating user
export interface CreateUserRequest {
  email: string;
  password: string;
  role: string;
  guideIds?: number[];  // Optional array of guide IDs
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/Auth`;
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
    console.log('Calling API: GET', `${this.apiUrl}/users`);
    
    return this.http.get<{ success: boolean; data: BackendUser[] }>(`${this.apiUrl}/users`).pipe(
      tap(response => console.log('Raw API response:', response)),
      map(response => {
        // Extract the data array from the wrapped response
        const backendUsers = response.data || [];
        return backendUsers.map(backendUser => this.transformToUser(backendUser));
      }),
      tap(users => console.log('Transformed users:', users)),
      catchError((error) => {
        console.error('API Error:', error);
        return of([]);
      })
    );
  }

  // Get single user by ID from API
// Get single user by ID from API
getUserByIdFromApi(id: string): Observable<User> {
  console.log('🔵 Getting user by ID from API:', id);
  
  return this.http.get<ApiResponse<BackendUser>>(`${this.apiUrl}/users/${id}`).pipe(
    map(response => {
      console.log('🔵 getUserByIdFromApi response:', response);
      if (response.success && response.data) {
        return this.transformToUser(response.data);
      }
      throw new Error('User not found');
    }),
    catchError((error) => {
      console.error('🔴 Failed to get user:', error);
      return throwError(() => error);
    })
  );
}

  // Get user by ID from signal (sync)
  getUserById(id: string): User | undefined {
    return this.users().find(u => u.id === id);
  }

 // Get user's invited guide IDs from database
getUserInvitedGuides(userId: string): Observable<string[]> {
  console.log('🔵 Calling getUserInvitedGuides for userId:', userId);
  
  // Call the Auth endpoint
  return this.http.get<ApiResponse<string[]>>(`${this.apiUrl}/users/${userId}/invited-guides`).pipe(
    map(response => {
      console.log('🔵 getUserInvitedGuides raw response:', response);
      
      // Handle wrapped ApiResponse
      if (response && response.success && response.data) {
        // Convert numbers to strings
        const guideIds = response.data.map(id => id.toString());
        console.log('🔵 Guide IDs found:', guideIds);
        return guideIds;
      }
      
      console.log('🔵 No guide IDs found, returning empty array');
      return [];
    }),
    catchError((error) => {
      console.error('🔴 Failed to get user invited guides:', error);
      return of([]);
    })
  );
}

// Get user with their invited guides
getUserWithInvites(id: string): Observable<User> {
  console.log('🔵 Getting user with invites for ID:', id);
  
  return forkJoin({
    user: this.getUserByIdFromApi(id),
    invites: this.getUserInvitedGuides(id)
  }).pipe(
    map(result => {
      console.log('🔵 User data:', result.user);
      console.log('🔵 Invited guides from API:', result.invites);
      
      return {
        ...result.user,
        invitedGuideIds: result.invites || []
      };
    }),
    catchError((error) => {
      console.error('🔴 Error in getUserWithInvites:', error);
      return throwError(() => error);
    })
  );
}


 

  // Update all guide invitations for a user (replace all)
  updateUserGuideInvitations(userId: string, guideIds: string[]): Observable<any> {
    console.log('=== UPDATE GUIDE INVITATIONS ===');
    console.log('User ID:', userId);
    console.log('New guide IDs to save:', guideIds);
    
    return this.getUserInvitedGuides(userId).pipe(
      switchMap(currentInvites => {
        console.log('Current invites from database:', currentInvites);
        
        const currentSet = new Set(currentInvites);
        const newSet = new Set(guideIds);

        const toAdd = guideIds.filter(id => !currentSet.has(id));
        const toRemove = currentInvites.filter(id => !newSet.has(id));
        
        console.log('Guides to ADD:', toAdd);
        console.log('Guides to REMOVE:', toRemove);

        const addRequests = toAdd.map(guideId =>
          this.inviteUserToGuide(userId, guideId)
        );
        const removeRequests = toRemove.map(guideId =>
          this.removeUserFromGuide(userId, guideId)
        );

        if (addRequests.length === 0 && removeRequests.length === 0) {
          console.log('No changes needed');
          return of({ message: 'No changes to guide invitations' });
        }

        return forkJoin([...addRequests, ...removeRequests]);
      }),
      tap(() => console.log('Guide invitations update completed')),
      catchError(this.handleError<any>('updateUserGuideInvitations'))
    );
  }

  // Create new user (admin only) - UPDATED to accept guideIds array
 // Create new user (admin only) - UPDATED to accept guideIds array
addUser(userData: CreateUserRequest): Observable<any> {
  const payload: any = {
    email: userData.email,
    password: userData.password,
    role: userData.role
  };
  
  // Only add guideIds if array has items (NOT if empty)
  if (userData.guideIds && userData.guideIds.length > 0) {
    payload.guideIds = userData.guideIds;
  }
  // DO NOT send guideIds at all if empty or undefined
  
  console.log('Creating user with payload:', payload);
  
  return this.http.post<{ success: boolean; data: { userId: string; message: string } }>(`${this.apiUrl}/create-user`, payload).pipe(
    tap(() => this.refreshUsers()),
    catchError(this.handleError<any>('addUser'))
  );
}
 
// Update user (admin only)
updateUser(id: string, updates: Partial<User>, newPassword?: string, guideIds?: number[]): Observable<User> {
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

  // Add guideIds if provided
  if (guideIds && guideIds.length > 0) {
    updateData.guideIds = guideIds;
  } else if (guideIds && guideIds.length === 0) {
    // Send empty array to clear all guide assignments
    updateData.guideIds = [];
  }

  console.log('Updating user with payload:', updateData);

  // The API returns: { success: true, data: null, message: 'User updated successfully' }
  return this.http.put<{ success: boolean; data: null; message?: string }>(`${this.apiUrl}/users/${id}`, updateData).pipe(
    map(response => {
      console.log('Update user response:', response);
      if (response.success) {
        // Return the updated user data (fetch fresh data)
        // Since backend returns null, we need to fetch the updated user
        return this.getUserWithInvites(id);
      }
      throw new Error(response.message || 'Update failed');
    }),
    switchMap(userObservable => userObservable), // Flatten the observable
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
    return this.http.post(`${this.guidesApiUrl}/${numericGuideId}/invite/${userId}`, {}).pipe(
      catchError(this.handleError<any>('inviteUserToGuide'))
    );
  }

  // Remove user from a single guide (admin only)
  removeUserFromGuide(userId: string, guideId: string): Observable<any> {
    const numericGuideId = parseInt(guideId, 10);
    console.log(`Calling DELETE: ${this.guidesApiUrl}/${numericGuideId}/remove-user/${userId}`);
    return this.http.delete(`${this.guidesApiUrl}/${numericGuideId}/remove-user/${userId}`).pipe(
      tap(() => console.log(`Successfully removed user ${userId} from guide ${guideId}`)),
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
    // Add null checks to prevent undefined errors
    const email = backendUser?.email || '';
    const userName = backendUser?.userName || email.split('@')[0] || 'User';
    
    return {
      id: backendUser?.id || '',
      name: userName,
      email: email,
      role: backendUser?.roles?.includes('Admin') ? 'admin' : 'user',
      invitedGuideIds: invitedGuideIds || []
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