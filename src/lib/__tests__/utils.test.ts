import { cn } from '@/lib/utils';

describe('cn', () => {
  it('keeps a semantic font size next to a text color', () => {
    const merged = cn('text-foreground', 'text-heading-lg md:text-heading-xl');
    expect(merged).toContain('text-foreground');
    expect(merged).toContain('text-heading-lg');
    expect(merged).toContain('md:text-heading-xl');
  });

  it('still lets a later size replace an earlier size', () => {
    expect(cn('text-body-md', 'text-title-lg')).toBe('text-title-lg');
    expect(cn('text-sm', 'text-heading-md')).toBe('text-heading-md');
  });

  it('still lets a later color replace an earlier color', () => {
    expect(cn('text-foreground', 'text-primary')).toBe('text-primary');
  });
});
