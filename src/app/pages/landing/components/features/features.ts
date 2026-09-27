import { Component } from '@angular/core';

import { LucideWallet, LucideChartPie, LucideTarget, LucideTrendingUp } from '@lucide/angular';

type FeatureIcon = 'wallet' | 'chart' | 'target' | 'trending';

interface Feature {
  title: string;
  description: string;
  icon: FeatureIcon;
}

@Component({
  selector: 'app-features',
  imports: [LucideWallet, LucideChartPie, LucideTarget, LucideTrendingUp],
  templateUrl: './features.html',
  styleUrl: './features.css',
})
export class Features {
  readonly features: Feature[] = [
    {
      title: 'Expense Tracking',
      description: 'Record daily transactions and understand exactly where your money is going.',
      icon: 'wallet',
    },
    {
      title: 'Budget Planning',
      description: 'Create monthly budgets and stay on top of your spending goals.',
      icon: 'chart',
    },
    {
      title: 'Savings Goals',
      description: 'Set financial targets and monitor progress toward your goals.',
      icon: 'target',
    },
    {
      title: 'Financial Insights',
      description: 'Visualize trends and make smarter decisions with meaningful analytics.',
      icon: 'trending',
    },
  ];
}
