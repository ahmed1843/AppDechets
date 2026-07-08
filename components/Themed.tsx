/**
 * Palette de couleurs unique (pas de mode clair/sombre séparé).
 * Voir constants/Design.ts pour la palette complète.
 */

import { Text as DefaultText, View as DefaultView } from 'react-native';

import { Colors } from '@/constants/Design';

type ThemeProps = {
  lightColor?: string;
  darkColor?: string;
};

export type TextProps = ThemeProps & DefaultText['props'];
export type ViewProps = ThemeProps & DefaultView['props'];

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors
) {
  // Palette unique : on ignore le light/dark du système,
  // mais on garde la possibilité de forcer une couleur via props.
  const colorFromProps = props.light ?? props.dark;

  if (colorFromProps) {
    return colorFromProps;
  }
  return Colors[colorName];
}

export function Text(props: TextProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text' as keyof typeof Colors);

  return <DefaultText style={[{ color }, style]} {...otherProps} />;
}

export function View(props: ViewProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  return <DefaultView style={[{ backgroundColor }, style]} {...otherProps} />;
}