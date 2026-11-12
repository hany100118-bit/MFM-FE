// 편지 쓰기 (나 / 친구 / 아무나) + 답장 쓰기 (replyTo 가 있으면)
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { showAlert } from '../../../shared/utils/alert';
import { useLocalSearchParams } from 'expo-router';
import { goBack } from '../../../shared/utils/goBack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText, Icon, Screen } from '../../../shared/components';
import { colors } from '../../../shared/theme';
import { errorMessage } from '../../../shared/utils/errorMessage';
import { lettersApi } from '../api';
import { OpenDatePicker, presetYmd } from '../components/OpenDatePicker';
import { RecipientPicker } from '../components/RecipientPicker';
import { ActionButton, ExtraIcon, LetterBodyField, LetterHeader, LetterTitleField } from '../components/LetterUI';

export default function WriteScreen() {
  const params = useLocalSearchParams();
  const replyTo = typeof params.replyTo === 'string' ? params.replyTo : null;
  const [type, setType] = useState(['self', 'friend', 'anyone'].includes(params.target) ? params.target : 'self');
  const [handle, setHandle] = useState('');
  const [recipient, setRecipient] = useState(null);
  const [openDate, setOpenDate] = useState(presetYmd('1y'));
  const [period, setPeriod] = useState('1y');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const insets = useSafeAreaInsets();

  const recipientReady = replyTo || type === 'self' || recipient;
  const canSend = recipientReady && title.trim() && content.trim() && !sending;

  const send = async () => {
    setSending(true);
    try {
      const body = { title: title.trim(), content, openDate };
      if (replyTo) await lettersApi.reply(replyTo, body);
      else await lettersApi.create({ ...body, recipientType: type, recipientHandle: type === 'self' ? undefined : recipient.handle });
      showAlert('봉인했어요', `${openDate} 0시에 열려요.`, [{ text: '확인', onPress: () => goBack() }]);
    } catch (err) {
      showAlert('보내지 못했어요', errorMessage(err));
    } finally {
      setSending(false);
    }
  };

  const who = replyTo ? `${params.replyToName || '보낸 사람'}에게` : type === 'self' ? '나에게' : recipient ? `${recipient.name}에게` : '';

  const sendTitle = !replyTo && type === 'self' ? '나에게 봉인하기' : who ? `${who} 봉인하고 보내기` : '봉인하고 보내기';

  return (
    <Screen>
      <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
        <LetterHeader kind="close" title={replyTo ? '답장 쓰기' : '짬 넘기기'} />
      </View>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16, gap: 12 }} keyboardShouldPersistTaps="handled">
          {replyTo ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: 14, backgroundColor: colors.butter, borderWidth: 2, borderColor: colors.ink }}>
              <ExtraIcon name="reply" size={20} />
              <AppText variant="bold" style={{ flex: 1, fontSize: 13, lineHeight: 19 }}>{who} 답장해요 · 편지 1통에 1번만 보낼 수 있어요</AppText>
            </View>
          ) : (
            <RecipientPicker type={type} onTypeChange={(t) => { setType(t); setRecipient(null); }}
              handle={handle} onHandleChange={(v) => { setHandle(v); setRecipient(null); }}
              confirmed={recipient} onConfirmed={setRecipient} />
          )}
          <OpenDatePicker value={openDate} period={period} onChange={(ymd, p) => { setOpenDate(ymd); setPeriod(p); }} />
          <LetterTitleField label="제목" value={title} onChangeText={setTitle} maxLength={50} placeholder={who ? `${who} 보내는 편지` : '편지에 제목을 붙여 주세요'} />
          <LetterBodyField label="편지 내용" value={content} onChangeText={setContent} maxLength={1000}
            placeholder={type === 'anyone' && !replyTo ? '모르는 사람에게도 따뜻하게. 개인 정보는 적지 않는 게 좋아요.' : '미래에 넘길 짬을 적어 주세요. 다짐, 고민, 비밀… 다 괜찮아요.'} />
        </ScrollView>
        <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: Math.max(28, insets.bottom + 8), gap: 8 }}>
          <AppText variant="caption" style={{ textAlign: 'center' }}>공개 전까지 공개일 변경, 새로 쓰기, 삭제를 할 수 있어요</AppText>
          <ActionButton title={sendTitle} variant="primary" icon={<Icon name="send" size={20} color={colors.white} />} onPress={send} disabled={!canSend} loading={sending} />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
