import type { ReactElement } from 'react';

type TargetCursorProps = {
  targetSelector?: string;
  spinDuration?: number;
  hideDefaultCursor?: boolean;
  hoverDuration?: number;
  parallaxOn?: boolean;
  cursorColor?: string;
  cursorColorOnTarget?: string;
};

declare const TargetCursor: (props: TargetCursorProps) => ReactElement | null;

export default TargetCursor;
