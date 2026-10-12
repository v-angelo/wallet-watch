import { Component } from '@angular/core';
import { LucideWallet } from '@lucide/angular';

@Component({
  imports: [LucideWallet],
  selector: 'app-footer',
  styleUrl: './footer.css',
  templateUrl: './footer.html',
})
export class Footer {
  readonly currentYear = new Date().getFullYear();
}
