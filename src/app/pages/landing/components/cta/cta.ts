import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { LucideArrowRight, LucideShieldCheck, LucideSparkles } from '@lucide/angular';

import { ScrollAnimateDirective } from '../../../../core/directives/scroll-animate.directive';

@Component({
  selector: 'app-cta',
  standalone: true,
  imports: [
    RouterLink,
    LucideArrowRight,
    LucideShieldCheck,
    LucideSparkles,
    ScrollAnimateDirective,
  ],
  templateUrl: './cta.html',
})
export class Cta {}
