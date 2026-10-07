import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Toast } from './shared/toast/toast';
import { AuthService } from './core/services/auth.service';

@Component({
  imports: [RouterOutlet, Toast],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('wallet-watch');

  private authService = inject(AuthService);

  constructor() {
    this.authService.initializeAuth();
  }
}
