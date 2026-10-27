import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideWallet } from '@lucide/angular';

@Component({
  imports: [RouterLink, LucideWallet],
  selector: 'app-pnf',
  styleUrl: './pnf.css',
  templateUrl: './pnf.html',
})
export class Pnf {}
