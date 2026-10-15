import { mutate as globalMutate } from 'swr';

/**
 * Revalidates every cache entry a write can affect, once. String keys are exact; array keys in a pattern
 * stand for "every cached key whose first element is `resource`" (e.g. ['transactions', '*'] covers all
 * date ranges). Call it instead of also calling the hook's own `mutate()`, which would fetch the same key twice.
 */
export const invalidateKeys = (keys: readonly (string | readonly unknown[])[], resource: string) =>
  Promise.all(
    keys.map((k) =>
      typeof k === 'string'
        ? globalMutate(k)
        : globalMutate((key) => Array.isArray(key) && key[0] === resource, undefined, { revalidate: true })
    )
  );
