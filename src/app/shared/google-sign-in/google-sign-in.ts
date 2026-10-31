import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  NgZone,
  OnDestroy,
  signal,
  ViewChild,
} from '@angular/core';

import { Router } from '@angular/router';

import { finalize } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { environment } from '../../../environments/environment';
import { ThemeService } from '../../core/services/theme.service';

// shared script loader: prevents duplicate script loading
let googleScriptPromise: Promise<void> | null = null;

function loadGoogleScript(): Promise<void> {
  if (window.google?.accounts?.id) {
    return Promise.resolve();
  }

  if (googleScriptPromise) {
    return googleScriptPromise;
  }

  googleScriptPromise = new Promise<void>((resolve, reject) => {
    let script = document.getElementById('google-identity-script') as HTMLScriptElement | null;

    const onLoad = () => {
      if (window.google?.accounts?.id) {
        resolve();
      } else {
        reject(new Error('Google Identity Services failed to initialize.'));
      }
    };

    const onError = () => {
      reject(new Error('Failed to load Google Identity Services.'));
    };

    if (script) {
      script.addEventListener('load', onLoad, { once: true });
      script.addEventListener('error', onError, { once: true });
      return;
    }

    script = document.createElement('script');
    script.id = 'google-identity-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;

    script.addEventListener('load', onLoad, { once: true });
    script.addEventListener('error', onError, { once: true });

    document.head.appendChild(script);
  }).catch((error: unknown) => {
    // allow retrying if the script fails to load
    googleScriptPromise = null;
    throw error;
  });

  return googleScriptPromise;
}

@Component({
  selector: 'app-google-sign-in',
  imports: [],
  templateUrl: './google-sign-in.html',
})
export class GoogleSignIn implements AfterViewInit, OnDestroy {
  @ViewChild('googleButton')
  googleButton!: ElementRef<HTMLDivElement>;

  private authService = inject(AuthService);
  private themeService = inject(ThemeService);
  private toast = inject(ToastService);

  private router = inject(Router);
  private ngZone = inject(NgZone);

  isLoading = signal(false);

  private observer!: MutationObserver;

  ngAfterViewInit(): void {
    this.initializeGoogleSignIn();

    this.observer = new MutationObserver(() => {
      this.renderGoogleButton();
    });

    this.observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  private async initializeGoogleSignIn(): Promise<void> {
    try {
      await loadGoogleScript();

      const google = window.google?.accounts.id;

      if (!google) {
        throw new Error('Google Sign-In is unavailable.');
      }

      google.initialize({
        client_id: environment.googleClientId,

        callback: (response) => {
          this.ngZone.run(() => {
            this.handleGoogleLogin(response.credential);
          });
        },
      });

      this.renderGoogleButton();
    } catch (error) {
      console.error('Google initialization error:', error);

      this.toast.error('Unable to load Google Sign-In. Please try again.');
    }
  }

  private renderGoogleButton(): void {
    const google = window.google?.accounts.id;

    if (!google || !this.googleButton) return;

    // check current theme
    const isDark = document.documentElement.classList.contains('dark');

    google.renderButton(this.googleButton.nativeElement, {
      theme: isDark ? 'filled_black' : 'outline',
      size: 'large',
      width: 260,
      text: 'continue_with',
      shape: 'rectangular',
    });
  }

  private handleGoogleLogin(credential: string): void {
    if (!credential || this.isLoading()) return;

    this.isLoading.set(true);

    this.authService
      .googleLoginAPI(credential)
      .pipe(
        finalize(() => {
          this.isLoading.set(false);
        }),
      )
      .subscribe({
        next: (response) => {
          this.authService.setUser(response.data);

          this.toast.success(response.message);

          this.router.navigate(['/dashboard']);
        },

        error: (error) => {
          console.error('Google login error:', error);

          this.toast.error(error.error?.message ?? 'Google authentication failed.');
        },
      });
  }
}
