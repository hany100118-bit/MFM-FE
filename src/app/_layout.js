// 앱 루트: 폰트 로드 → 로그인 상태 → 화면 묶음
import { ActivityIndicator, View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Jua_400Regular } from '@expo-google-fonts/jua/400Regular';
import { IBMPlexSansKR_400Regular } from '@expo-google-fonts/ibm-plex-sans-kr/400Regular';
import { IBMPlexSansKR_700Bold } from '@expo-google-fonts/ibm-plex-sans-kr/700Bold';
import { GowunDodum_400Regular } from '@expo-google-fonts/gowun-dodum/400Regular';
// 쓰는 굵기만 하위 경로로 가져온다 (패키지 루트에서 가져오면 모든 굵기가 앱에 들어가 용량이 커짐)
import { AuthProvider, useAuth } from '../features/auth/AuthContext';
import { UnreadProvider } from '../features/notifications/UnreadContext';
import { AppText, Button } from '../shared/components';
import { colors } from '../shared/theme';
import { errorMessage } from '../shared/utils/errorMessage';

function Gate() {
  const { status, error, retry } = useAuth();
  if (status === 'loading') {
    return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}><ActivityIndicator color={colors.violet} /></View>;
  }
  if (status === 'error') {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, padding: 24, backgroundColor: colors.bg }}>
        <AppText variant="display">잠시 연결이 안 돼요</AppText>
        <AppText style={{ textAlign: 'center' }}>{errorMessage(error)}</AppText>
        <Button title="다시 시도" onPress={retry} />
      </View>
    );
  }
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }} />;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ Jua_400Regular, IBMPlexSansKR_400Regular, IBMPlexSansKR_700Bold, GowunDodum_400Regular });
  if (!fontsLoaded) return null;
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <AuthProvider>
        <UnreadProvider>
          <Gate />
        </UnreadProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
