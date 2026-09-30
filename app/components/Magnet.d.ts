import type { ReactElement, ReactNode } from 'react';

type MagnetProps = {
  children: ReactNode;
  padding?: number;
  disabled?: boolean;
  magnetStrength?: number;
  activeTransition?: string;
  inactiveTransition?: string;
  wrapperClassName?: string;
  innerClassName?: string;
};

declare const Magnet: (props: MagnetProps) => ReactElement;

export default Magnet;
