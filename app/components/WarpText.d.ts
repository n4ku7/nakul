import type { CSSProperties, ReactElement } from 'react';

type WarpTextProps = {
  text?: string;
  color?: string;
  warpStrength?: number;
  warpScale?: number;
  speed?: number;
  pointerInfluence?: number;
  pointerStrength?: number;
  refraction?: number;
  ripple?: boolean;
  fontSize?: string | number;
  fontWeight?: string | number;
  fontFamily?: string;
  letterSpacing?: string | number;
  lineHeight?: string | number;
  textAlign?: 'left' | 'center';
  className?: string;
  style?: CSSProperties;
};

declare const WarpText: (props: WarpTextProps) => ReactElement;

export default WarpText;
