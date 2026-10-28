import { useEffect, type RefObject } from 'react';

/**
 * Moves focus to the first field marked `aria-invalid` after a failed submit, so keyboard
 * and screen-reader users land on the problem instead of staying on the submit button.
 * Increment `attempt` on every submit that produced validation errors.
 */
export function useFocusFirstInvalid(formRef: RefObject<HTMLFormElement | null>, attempt: number) {
  useEffect(() => {
    if (attempt === 0) return;
    formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [formRef, attempt]);
}
