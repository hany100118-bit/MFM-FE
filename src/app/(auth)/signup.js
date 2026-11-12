import { Redirect } from 'expo-router';
import { useAuth } from '../../features/auth/AuthContext';
import SignupScreen from '../../features/auth/screens/SignupScreen';

/** 카카오 인증(가입 토큰) 없이 들어오면 로그인으로 */
export default function SignupRoute() {
  const { status } = useAuth();
  if (status !== 'signupRequired') return <Redirect href="/login" />;
  return <SignupScreen />;
}
