import { handleQueryError, logError } from '../apiErrors';

export interface MutationOptions {
  onSuccess?: () => void | Promise<any>;
  onError?: (err: any) => void | Promise<any>;
  throwOnError?: boolean;
}

export async function executeMutation<T>(
  promise: Promise<T>,
  context: string,
  options: MutationOptions & { throwOnError: false }
): Promise<T | null>;

export async function executeMutation<T>(
  promise: Promise<T>,
  context: string,
  options?: Omit<MutationOptions, 'throwOnError'> | (MutationOptions & { throwOnError?: true })
): Promise<T>;

export async function executeMutation<T>(
  promise: Promise<T>,
  context: string,
  options?: MutationOptions
): Promise<T | null> {
  try {
    const res = await promise;
    if (options?.onSuccess) await options.onSuccess();
    return res;
  } catch (err) {
    logError(err, context);
    if (options?.onError) await options.onError(err);
    if (options?.throwOnError === false) return null;
    throw handleQueryError(err);
  }
}
