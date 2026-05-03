//src\app\core\services\toast.service.ts
import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: number;
  type: 'success' | 'error' | 'warning' | 'info' | 'confirm';
  title: string;
  message: string;
  duration?: number;
  onConfirm?: () => void;
  onCancel?: () => void;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toasts = signal<ToastMessage[]>([]);
  private nextId = 0;
  
  // Get all toasts (readonly)
  readonly getToasts = this.toasts.asReadonly();

  showSuccess(message: string, title: string = 'Success', duration: number = 3000) {
    this.addToast({ type: 'success', title, message, duration });
  }

  showError(message: string, title: string = 'Error', duration: number = 5000) {
    this.addToast({ type: 'error', title, message, duration });
  }

  showWarning(message: string, title: string = 'Warning', duration: number = 4000) {
    this.addToast({ type: 'warning', title, message, duration });
  }

  showInfo(message: string, title: string = 'Info', duration: number = 3000) {
    this.addToast({ type: 'info', title, message, duration });
  }

  showConfirm(message: string, title: string = 'Confirm'): Promise<boolean> {
    return new Promise((resolve) => {
      this.addToast({
        type: 'confirm',
        title,
        message,
        duration: 0,
        onConfirm: () => resolve(true),
        onCancel: () => resolve(false)
      });
    });
  }

  // For validation errors from backend
  showValidationErrors(errors: any, defaultMessage?: string) {
    if (errors && typeof errors === 'object') {
      const messages: string[] = [];
      
      // Handle different error formats
      if (errors.errors) {
        // ASP.NET validation format
        Object.values(errors.errors).forEach((err: any) => {
          if (Array.isArray(err)) {
            messages.push(...err);
          } else if (typeof err === 'string') {
            messages.push(err);
          }
        });
      } else if (errors.message) {
        messages.push(errors.message);
      } else if (typeof errors === 'string') {
        messages.push(errors);
      }
      
      if (messages.length > 0) {
        this.showError(messages.join('\n'), 'Validation Failed', 6000);
      } else {
        this.showError(defaultMessage || 'An error occurred', 'Error');
      }
    } else {
      this.showError(defaultMessage || 'An error occurred', 'Error');
    }
  }

  private addToast(toast: Omit<ToastMessage, 'id'>) {
    const id = this.nextId++;
    const newToast: ToastMessage = { ...toast, id };
    
    this.toasts.update(current => [...current, newToast]);
    
    // Auto remove after duration
    if (toast.duration && toast.duration > 0) {
      setTimeout(() => {
        this.removeToast(id);
      }, toast.duration);
    }
  }

  removeToast(id: number) {
    this.toasts.update(current => current.filter(t => t.id !== id));
  }

  clearAll() {
    this.toasts.set([]);
  }
}