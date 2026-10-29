import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LucideArrowDownLeft,
  LucideArrowRight,
  LucideArrowUpRight,
  LucideCoffee,
  LucideShoppingCart,
  LucideWallet,
} from '@lucide/angular';

@Component({
  imports: [
    RouterLink,
    LucideWallet,
    LucideArrowRight,
    LucideArrowDownLeft,
    LucideArrowUpRight,
    LucideCoffee,
    LucideShoppingCart,
  ],
  selector: 'app-hero',
  styleUrl: './hero.css',
  templateUrl: './hero.html',
})
export class Hero {}
