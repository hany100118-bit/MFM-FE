// 회원가입: 아이디(중복확인) · 이름 · 나이(직접 입력 또는 목록) · 성별 · 약관(전체 동의)
import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { showAlert } from '../../../shared/utils/alert';
import { router } from 'expo-router';
import { AppText, Button, Header, KakaoIcon, Screen, TextField } from '../../../shared/components';
import { colors } from '../../../shared/theme';
import { errorMessage } from '../../../shared/utils/errorMessage';
import { useAuth } from '../AuthContext';
import { authApi } from '../api';
import { AgePickerSheet } from '../components/AgePickerSheet';
import { AgreeRow, FieldButton, InnerChevronButton, LinedSegmented } from '../components/SignupParts';

const HANDLE_RE = /^[a-z0-9_]{3,20}$/;
const GENDERS = [{ id: 'female', label: '여성' }, { id: 'male', label: '남성' }, { id: 'undisclosed', label: '비공개' }];
const PLACEHOLDER = '#757575'; // 디자인(브라우저 기본) 입력칸 안내 글자색
const AGREEMENTS = [
  { key: 'terms', label: '서비스 이용약관 동의', required: true },
  { key: 'privacy', label: '개인정보 수집 및 이용 동의', required: true },
  { key: 'notification', label: '편지 도착 알림 받기', required: false },
];

export default function SignupScreen() {
  const { signupToken, completeSignup, cancelSignup } = useAuth();
  const [form, setForm] = useState({ handle: '', name: '', age: '', gender: '' });
  const [handleState, setHandleState] = useState({ checked: false, available: false, message: '' });
  const [agree, setAgree] = useState({ terms: false, privacy: false, notification: false });
  const [ageOpen, setAgeOpen] = useState(false);
  const [busy, setBusy] = useState('');
  const insets = useSafeAreaInsets();

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));
  const allAgreed = AGREEMENTS.every((a) => agree[a.key]);

  const canSubmit = useMemo(() => (
    handleState.available && form.name.trim() && Number(form.age) >= 1 && form.gender && agree.terms && agree.privacy
  ), [handleState.available, form, agree]);

  const run = async (key, fn) => {
    setBusy(key);
    try { await fn(); } catch (err) { showAlert('확인해 주세요', errorMessage(err)); } finally { setBusy(''); }
  };

  const checkHandle = () => run('handle', async () => {
    const h = form.handle.trim().toLowerCase();
    if (!HANDLE_RE.test(h)) return setHandleState({ checked: true, available: false, message: '영문 소문자, 숫자, _ 로 3~20자예요.' });
    const r = await authApi.checkHandle(h, signupToken);
    setHandleState({ checked: true, available: r.available, message: r.available ? '사용할 수 있는 아이디예요' : '이미 사용 중인 아이디예요' });
  });

  const submit = () => run('submit', async () => {
    await completeSignup({
      handle: form.handle.trim().toLowerCase(),
      name: form.name.trim(),
      age: Number(form.age),
      gender: form.gender,
      agreements: { terms: agree.terms, privacy: agree.privacy, notification: agree.notification },
    });
    router.replace('/');
  });

  return (
    <Screen>
      <View style={{ paddingTop: 20, paddingHorizontal: 14 }}>
        <Header title="회원가입" onBack={() => { cancelSignup(); router.replace('/login'); }}
          right={<AppText variant="bold" style={{ color: colors.violet, fontSize: 13, width: 34, textAlign: 'right' }}>2/2</AppText>} />
      </View>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 14, paddingBottom: 20, gap: 14 }} keyboardShouldPersistTaps="handled">
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.kakao, borderWidth: 2, borderColor: colors.ink, alignItems: 'center', justifyContent: 'center' }}>
              <KakaoIcon size={20} />
            </View>
            <AppText variant="display" accessibilityRole="header" style={{ fontSize: 24, lineHeight: 31, flexShrink: 1 }}>카카오 연결 완료!{'\n'}몇 가지만 더 알려주세요</AppText>
          </View>

          <View style={{ gap: 10 }}>
            <TextField label="아이디" sublabel="· 편지와 친구 추가에 쓰여요" prefix="@" value={form.handle} autoCapitalize="none" autoCorrect={false}
              onChangeText={(v) => { set('handle')(v); setHandleState({ checked: false, available: false, message: '' }); }}
              placeholder="영문 소문자, 숫자, _ 3~20자" placeholderTextColor={PLACEHOLDER}
              hint={handleState.checked ? undefined : '중복확인을 해야 가입할 수 있어요'}
              error={handleState.checked && !handleState.available ? handleState.message : undefined}
              right={<FieldButton title="중복확인" loading={busy === 'handle'} onPress={checkHandle} />} />
            {handleState.available ? <AppText variant="bold" style={{ color: colors.violetDark, fontSize: 12, marginTop: -4 }}>✓ {handleState.message}</AppText> : null}

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TextField label="이름" value={form.name} onChangeText={set('name')} placeholder="이름" placeholderTextColor={PLACEHOLDER} maxLength={30} showCount={false} style={{ flex: 1, minWidth: 0 }} />
              <TextField label="나이" value={form.age} keyboardType="number-pad" maxLength={3} showCount={false} placeholder="직접 입력" placeholderTextColor={PLACEHOLDER} style={{ width: 132 }}
                onChangeText={(v) => set('age')(v.replace(/\D/g, ''))}
                trailing={<InnerChevronButton accessibilityLabel="목록에서 나이 고르기" onPress={() => setAgeOpen(true)} />} />
            </View>

            <View style={{ gap: 6 }}>
              <AppText variant="bold" style={{ fontSize: 13 }}>성별</AppText>
              <LinedSegmented items={GENDERS} value={form.gender} onChange={set('gender')} />
            </View>


            <View style={{ backgroundColor: colors.white, borderWidth: 2, borderColor: colors.ink, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 14, gap: 6 }}>
              <AgreeRow big checked={allAgreed} label="전체 동의" note="(선택 항목 포함)" onPress={() => {
                const next = !allAgreed;
                setAgree({ terms: next, privacy: next, notification: next });
              }} />
              <View style={{ borderTopWidth: 2, borderStyle: 'dashed', borderColor: colors.line, marginVertical: 2 }} />
              {AGREEMENTS.map((a) => (
                <AgreeRow key={a.key} checked={agree[a.key]} tag={a.required ? '(필수)' : '(선택)'} tagColor={a.required ? colors.violet : colors.muted} label={a.label}
                  onPress={() => setAgree((s) => ({ ...s, [a.key]: !s[a.key] }))} />
              ))}
            </View>
          </View>
        </ScrollView>
        {/* 디자인: 하단 32px 위에 고정된 시작 버튼 (그림자 4px 은 바깥으로) */}
        <View style={{ paddingLeft: 24, paddingRight: 20, paddingTop: 8, paddingBottom: 28 + insets.bottom }}>
          <Button title="짬처리 시작하기" onPress={submit} disabled={!canSubmit} loading={busy === 'submit'} />
        </View>
      </KeyboardAvoidingView>
      <AgePickerSheet visible={ageOpen} value={form.age} onChange={set('age')} onClose={() => setAgeOpen(false)} />
    </Screen>
  );
}
