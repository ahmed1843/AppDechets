declare module 'lucide-react-native' {
  import { FC } from 'react';
    import { SvgProps } from 'react-native-svg';
  export interface IconProps extends SvgProps {
    color?: string;
    size?: number | string;
    strokeWidth?: number;
  }
  export type Icon = FC<IconProps>;
  export const ArrowLeft: Icon;
  export const Navigation: Icon;
  export const ZoomIn: Icon;
  export const ZoomOut: Icon;
  export const Bell: Icon;
  export const Clock: Icon;
  export const MapPin: Icon;
  // Ajoute ici les autres icônes que tu utilises si besoin
}
