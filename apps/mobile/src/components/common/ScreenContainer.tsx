import { ScrollView, StyleSheet, View, type ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { palette } from '@/styles/theme';

type ScreenContainerProps = ViewProps & {
  scroll?: boolean;
};

export const ScreenContainer = ({ children, scroll, style, ...props }: ScreenContainerProps) => {
  if (scroll) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={[styles.inner, style]} {...props}>
            {children}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.inner, style]} {...props}>
        {children}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.background
  },
  scrollContent: {
    flexGrow: 1
  },
  inner: {
    flex: 1,
    backgroundColor: palette.background
  }
});
