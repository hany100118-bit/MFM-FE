// 로그인 후 화면 묶음. 로그인 안 했으면 로그인(또는 가입 중이면 가입) 화면으로.
import { Redirect, Stack } from 'expo-router';
import { useAuth } from '../../features/auth/AuthContext';
import { colors } from '../../shared/theme';

export default function MainLayout() {
  const { status } = useAuth();
  if (status === 'signupRequired') return <Redirect href="/signup" />;
  if (status !== 'signedIn') return <Redirect href="/login" />;
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }} />;
}
