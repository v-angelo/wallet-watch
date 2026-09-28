import { Component } from '@angular/core';

import { LucideSparkles, LucideShield, LucideGlobe, LucideRocket } from '@lucide/angular';

type HighlightIcon = 'sparkles' | 'shield' | 'globe' | 'rocket';

interface Highlight {
  title: string;
  description: string;
  icon: HighlightIcon;
}

@Component({
  selector: 'app-about',
  imports: [LucideSparkles, LucideShield, LucideGlobe, LucideRocket],
  templateUrl: './about.html',
  styleUrl: './about.css',
})
export class About {
  readonly highlights: Highlight[] = [
    {
      title: 'Simple by Design',
      description:
        'A clean and intuitive experience that helps you focus on your finances without unnecessary complexity.',
      icon: 'sparkles',
    },
    {
      title: 'Financial Awareness',
      description:
        'Gain a better understanding of your spending habits and make more informed financial decisions.',
      icon: 'shield',
    },
    {
      title: 'Global Ready',
      description:
        'Track your finances using the currency that works best for you, wherever you are.',
      icon: 'globe',
    },
    {
      title: 'Build Better Habits',
      description:
        'Develop healthier financial routines through consistent tracking and goal-oriented planning.',
      icon: 'rocket',
    },
  ];
}
