import type { CategoryJoin } from '@/types/database';

export function resolveCategory(
  categories: CategoryJoin | CategoryJoin[] | null | undefined
): CategoryJoin | null {
  if (!categories) return null;
  if (Array.isArray(categories)) return categories[0] ?? null;
  return categories;
}
