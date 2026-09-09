import { AppIcon } from './AppIcon';

/** Q tile + "Qeued" wordmark, as used in every header. */
export const Logo = ({ size = 32 }: { size?: number }) => (
  <span className="flex items-center gap-2 text-lg font-semibold">
    <AppIcon size={size} />
    Qeued
  </span>
);
