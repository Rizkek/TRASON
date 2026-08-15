export type InsightModule = 'finance' | 'career' | 'vitality' | 'goals';

export type InsightType = 'attention' | 'progress' | 'change' | 'pattern';

export type InsightPriority = 'high' | 'medium' | 'low';

export interface InsightCandidate {
  id: string;
  module: InsightModule;
  type: InsightType;
  priority: InsightPriority;

  title: string;
  description: string;

  evidence?: {
    metric?: string;
    comparison?: string;
    period?: string;
  };

  action?: {
    label: string;
    href: string;
  };
}
