import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
  dismissing?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private nextId = 0;

  readonly toasts = signal<Toast[]>([]);

  show(message: string, type: ToastType = 'info', duration = 2000): void {
    const id = this.nextId++;

    this.toasts.update((toasts) => [...toasts, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, duration);
    }
  }

  success(message: string, duration = 2000): void {
    this.show(message, 'success', duration);
  }

  error(message: string, duration = 2000): void {
    this.show(message, 'error', duration);
  }

  info(message: string, duration = 2000): void {
    this.show(message, 'info', duration);
  }

  warning(message: string, duration = 2000): void {
    this.show(message, 'warning', duration);
  }

  remove(id: number): void {
    const toast = this.toasts().find((item) => item.id === id);

    if (!toast || toast.dismissing) return;

    // start the exit animation
    this.toasts.update((toasts) =>
      toasts.map((item) => (item.id === id ? { ...item, dismissing: true } : item)),
    );

    // remove after the animation finishes
    setTimeout(() => {
      this.toasts.update((toasts) => toasts.filter((item) => item.id !== id));
    }, 200);
  }

  clear(): void {
    this.toasts.set([]);
  }
}
