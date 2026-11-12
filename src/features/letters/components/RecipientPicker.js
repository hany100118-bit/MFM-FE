// 받는 사람: 나 / 친구 / 아무나. 친구·아무나는 아이디로 찾는다.
// (서버에 친구 목록 API 가 아직 없어 "친구"도 아이디로 지정한다. 친구 API 가 생기면 목록 선택으로 바꾼다.)
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { AppText, Avatar, Icon } from '../../../shared/components';
import { useAuth } from '../../auth/AuthContext';
import { FieldLabel, HandleField } from './LetterUI';
import { colors } from '../../../shared/theme';
import { errorMessage } from '../../../shared/utils/errorMessage';
import { RECIPIENT_TYPES } from '../constants';
import { lettersApi } from '../api';

export function RecipientPicker({ type, onTypeChange, handle, onHandleChange, confirmed, onConfirmed }) {
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const check = async () => {
    setChecking(true);
    setError('');
    try {
      const r = await lettersApi.lookupUser(handle.trim());
      if (r.exists) onConfirmed(r.user);
      else setError('그 아이디를 찾을 수 없어요.');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setChecking(false);
    }
  };

  return (
    <View style={{ gap: 12 }}>
      <View style={{ gap: 8 }}>
        <FieldLabel>누구에게 넘길까요?</FieldLabel>
        <View accessibilityRole="radiogroup" style={{ flexDirection: 'row', gap: 8 }}>
          {RECIPIENT_TYPES.map((t) => {
            const on = t.id === type;
            return (
              <View key={t.id} style={{ flex: 1 }}>
                {on ? <View style={{ position: 'absolute', top: 4, left: 4, right: -4, bottom: -4, borderRadius: 16, backgroundColor: colors.ink }} /> : null}
                <Pressable accessibilityRole="radio" accessibilityState={{ checked: on }} onPress={() => onTypeChange(t.id)}
                  style={{ height: 64, borderWidth: 2, borderColor: colors.ink, borderRadius: 16, alignItems: 'center', justifyContent: 'center', gap: 2, backgroundColor: on ? colors.violet : colors.white }}>
                  <AppText variant="display" style={{ fontSize: 21, lineHeight: 26, color: on ? colors.white : colors.ink }}>{t.label}</AppText>
                  <AppText style={{ fontSize: 11, lineHeight: 15, color: on ? colors.white : colors.ink }}>{t.sub}</AppText>
                </Pressable>
              </View>
            );
          })}
        </View>
      </View>
      {type === 'self' ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14, backgroundColor: colors.lavender, borderWidth: 2, borderStyle: 'dashed', borderColor: colors.violet }}>
          <Avatar name={user?.name || '나'} size={44} />
          <AppText style={{ flex: 1, fontSize: 14, lineHeight: 21 }}>미래의 나에게 보내요.{'\n'}공개일까지는 쓴 나도 제목과 내용을 못 봐요!</AppText>
        </View>
      ) : (
        <View style={{ gap: 8 }}>
          <HandleField label={type === 'friend' ? '친구 아이디' : '받는 사람 아이디'} sub={type === 'friend' ? undefined : '모르는 사람에게'}
            value={handle} onChangeText={(v) => { onHandleChange(v); setError(''); }} error={error || undefined}
            onConfirm={check} confirmLoading={checking} confirmDisabled={!handle.trim()} />
          {confirmed ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Icon name="check" size={16} color={colors.violetDark} />
              <AppText variant="bold" style={{ color: colors.violetDark, fontSize: 13 }}>{confirmed.name} (@{confirmed.handle})님에게 보내요</AppText>
            </View>
          ) : null}
        </View>
      )}
    </View>
  );
}
