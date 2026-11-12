import { Text, StyleSheet } from 'react-native';
import { colors, fonts } from '../theme';

/** variant: body | bold | display | letter | caption */
export function AppText({ variant = 'body', style, children, ...rest }) {
  return <Text style={[styles.base, styles[variant], style]} {...rest}>{children}</Text>;
}

const styles = StyleSheet.create({
  base: { color: colors.ink, fontSize: 15 },
  body: { fontFamily: fonts.body },
  bold: { fontFamily: fonts.bold },
  display: { fontFamily: fonts.display, fontSize: 24 },
  letter: { fontFamily: fonts.letter, fontSize: 16, lineHeight: 30 },
  caption: { fontFamily: fonts.body, fontSize: 12, color: colors.muted },
});
