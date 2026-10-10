import { Injectable, signal } from '@angular/core';

type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly currentTheme = signal<Theme>('light');

  readonly theme = this.currentTheme.asReadonly();

  private readonly htmlElement = document.documentElement;

  constructor() {
    const savedTheme = localStorage.getItem('walletwatch-theme') as Theme | null;

    if (savedTheme === 'light' || savedTheme === 'dark') {
      this.setTheme(savedTheme);
    } else {
      this.setTheme('light');
    }
  }

  setTheme(theme: Theme): void {
    this.currentTheme.set(theme);

    this.htmlElement.classList.toggle('dark', theme === 'dark');

    localStorage.setItem('walletwatch-theme', theme);
  }

  toggleTheme(): void {
    this.setTheme(this.currentTheme() === 'light' ? 'dark' : 'light');
  }
}
