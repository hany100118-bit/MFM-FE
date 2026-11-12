// 로그인 전 화면 묶음. 이미 로그인했으면 홈으로.
import { Redirect, Stack } from 'expo-router';
import { useAuth } from '../../features/auth/AuthContext';

export default function AuthLayout() {
  const { status } = useAuth();
  if (status === 'signedIn') return <Redirect href="/" />;
  return <Stack screenOptions={{ headerShown: false }} />;
}
