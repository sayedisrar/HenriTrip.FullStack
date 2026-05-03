import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, ToastMessage } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div *ngFor="let toast of toastService.getToasts()" 
           class="toast-message slide-in"
           [ngClass]="['toast-' + toast.type, toast.type === 'confirm' ? 'confirm' : '']"
           (click)="!isConfirmDialog(toast) && toastService.removeToast(toast.id)">
        <div *ngIf="toast.type !== 'confirm'" class="toast-icon">
          <span *ngIf="toast.type === 'success'">✓</span>
          <span *ngIf="toast.type === 'error'">✗</span>
          <span *ngIf="toast.type === 'warning'">⚠</span>
          <span *ngIf="toast.type === 'info'">ℹ</span>
        </div>
        <div class="toast-content">
          <div class="toast-title">{{ toast.title }}</div>
          <div class="toast-message-text">{{ toast.message }}</div>
          <div *ngIf="isConfirmDialog(toast)" class="toast-actions">
            <button class="btn-confirm-yes" (click)="onConfirm(toast)">
              Yes, Delete
            </button>
            <button class="btn-confirm-no" (click)="onCancel(toast)">
              Cancel
            </button>
          </div>
        </div>
        <button *ngIf="toast.type !== 'confirm'" class="toast-close" (click)="toastService.removeToast(toast.id); $event.stopPropagation()">×</button>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-width: 400px;
    }

    .toast-message {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 16px;
      border-radius: 12px;
      background: var(--surface, #1e1e2e);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
      cursor: pointer;
      transition: all 0.3s ease;
      min-width: 280px;
    }

    .toast-message.confirm {
      cursor: default;
    }

    .toast-message:hover {
      transform: translateX(-4px);
    }

    .toast-success {
      border-left: 4px solid #22c55e;
      background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(34, 197, 94, 0.05));
    }

    .toast-error {
      border-left: 4px solid #ef4444;
      background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05));
    }

    .toast-warning {
      border-left: 4px solid #f59e0b;
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(245, 158, 11, 0.05));
    }

    .toast-info {
      border-left: 4px solid #3b82f6;
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.05));
    }

    .toast-confirm {
      border-left: 4px solid #f59e0b;
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(245, 158, 11, 0.08));
    }

    .toast-icon {
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      font-size: 14px;
      font-weight: bold;
      flex-shrink: 0;
    }

    .toast-success .toast-icon {
      background: rgba(34, 197, 94, 0.2);
      color: #22c55e;
    }

    .toast-error .toast-icon {
      background: rgba(239, 68, 68, 0.2);
      color: #ef4444;
    }

    .toast-warning .toast-icon {
      background: rgba(245, 158, 11, 0.2);
      color: #f59e0b;
    }

    .toast-info .toast-icon {
      background: rgba(59, 130, 246, 0.2);
      color: #3b82f6;
    }

    .toast-content {
      flex: 1;
    }

    .toast-title {
      font-weight: 600;
      font-size: 14px;
      margin-bottom: 4px;
      color: var(--text-main);
    }

    .toast-message-text {
      font-size: 13px;
      color: var(--text-muted);
      white-space: pre-line;
      line-height: 1.4;
      margin-bottom: 12px;
    }

    .toast-actions {
      display: flex;
      gap: 8px;
      margin-top: 12px;
    }

    .btn-confirm-yes {
      flex: 1;
      padding: 8px 12px;
      background: #ef4444;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-confirm-yes:hover {
      background: #dc2626;
      transform: translateY(-1px);
    }

    .btn-confirm-no {
      flex: 1;
      padding: 8px 12px;
      background: rgba(255, 255, 255, 0.1);
      color: var(--text-main);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-confirm-no:hover {
      background: rgba(255, 255, 255, 0.15);
    }

    .toast-close {
      background: none;
      border: none;
      color: var(--text-muted);
      font-size: 20px;
      cursor: pointer;
      padding: 0;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color 0.2s;
      flex-shrink: 0;
    }

    .toast-close:hover {
      color: var(--text-main);
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(100%);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    .slide-in {
      animation: slideIn 0.3s ease forwards;
    }

    @media (max-width: 640px) {
      .toast-container {
        left: 20px;
        right: 20px;
        max-width: none;
      }
      
      .toast-message {
        width: 100%;
      }
    }
  `]
})
export class ToastComponent {
  toastService = inject(ToastService);

  isConfirmDialog(toast: ToastMessage): boolean {
    return toast.type === 'confirm';
  }

  onConfirm(toast: ToastMessage) {
    if (toast.onConfirm) {
      toast.onConfirm();
    }
    this.toastService.removeToast(toast.id);
  }

  onCancel(toast: ToastMessage) {
    if (toast.onCancel) {
      toast.onCancel();
    }
    this.toastService.removeToast(toast.id);
  }
}