import { clsx } from 'clsx';

/** Combine des classes Tailwind proprement */
export function cn(...inputs) {
  return clsx(inputs);
}
