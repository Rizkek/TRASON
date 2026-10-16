import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

// The semantic font sizes from tailwind.config.js. Without them tailwind-merge reads
// "text-heading-lg" as a text color and drops it (or a real text color) when both are present.
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: [
        'display-2xl',
        'display-md',
        'display-xl',
        'display-lg',
        'heading-xl',
        'heading-lg',
        'heading-md',
        'title-lg',
        'title-md',
        'body-lg',
        'body-md',
        'body-sm',
        'label-md',
        'label-sm',
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
