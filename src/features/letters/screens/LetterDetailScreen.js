// 편지 상세: 봉인(공개 전) / 열람(공개 후). 답장·보관·삭제, 보낸 사람은 공개 전 공개일 변경·삭제.
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { showAlert } from '../../../shared/utils/alert';
import { router, useLocalSearchParams } from 'expo-router';
import { goBack } from '../../../shared/utils/goBack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText, BottomSheet, Button, Envelope, Icon, Screen, ShadowBox, StateView } from '../../../shared/components';
import { colors } from '../../../shared/theme';
import { useApiQuery } from '../../../shared/hooks/useApiQuery';
import { dDayLabel, dDayOf, formatYmd, shortYmd } from '../../../shared/utils/date';
import { errorMessage } from '../../../shared/utils/errorMessage';
import { lettersApi } from '../api';
import { OpenDatePicker } from '../components/OpenDatePicker';
import { ActionButton, ExtraIcon, LetterHeader, LinedPaper } from '../components/LetterUI';

const dotted = (ymd) => ymd.slice(0, 10).replace(/-/g, '.');

function untilLabel(iso) {
  const k = new Date(new Date(iso).getTime() + 9 * 3600e3);
  return `${String(k.getUTCHours()).padStart(2, '0')}:${String(k.getUTCMinutes()).padStart(2, '0')}`;
}

export default function LetterDetailScreen() {
  const { id } = useLocalSearchParams();
  const { data: letter, loading, error, reload, setData } = useApiQuery(() => lettersApi.get(id), [id]);
  const [busy, setBusy] = useState('');
  const [dateSheet, setDateSheet] = useState(false);
  const [draftDate, setDraftDate] = useState(null);
  const insets = useSafeAreaInsets();
  const footerPad = { paddingHorizontal: 20, paddingTop: 12, paddingBottom: Math.max(32, insets.bottom + 12), gap: 10 };

  const act = async (key, fn) => {
    setBusy(key);
    try { await fn(); } catch (err) { showAlert('할 수 없어요', errorMessage(err)); } finally { setBusy(''); }
  };
  const confirm = (title, message, onOk) => showAlert(title, message, [{ text: '취소', style: 'cancel' }, { text: '확인', style: 'destructive', onPress: onOk }]);

  if (loading || error || !letter) {
    return <Screen><View style={{ paddingHorizontal: 20, paddingTop: 20 }}><LetterHeader title="편지" /></View><View style={{ padding: 20 }}><StateView loading={loading} error={error} onRetry={reload} /></View></Screen>;
  }

  const opened = letter.status === 'opened';
  const isRecipient = letter.role === 'recipient';

  if (!opened) {
    return (
      <Screen>
        <View style={{ paddingHorizontal: 20, paddingTop: 20 }}><LetterHeader title="봉인된 편지" /></View>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingTop: 14, gap: 16 }}>
          <ShadowBox offset={6} radius={22} style={{ marginRight: -6, marginBottom: -6 }} contentStyle={{ backgroundColor: colors.violet, paddingVertical: 32, paddingHorizontal: 22, alignItems: 'center', gap: 10 }}>
            <Envelope width={104} sealed />
            <AppText variant="display" style={{ color: colors.white, fontSize: 52, lineHeight: 60, marginTop: 6 }}>{dDayLabel(letter.dDay)}</AppText>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999, backgroundColor: colors.butter, borderWidth: 2, borderColor: colors.ink }}>
              <Icon name="clock" size={16} />
              <AppText variant="bold" style={{ fontSize: 13 }}>{formatYmd(letter.openDate)} 0시에 열려요</AppText>
            </View>
          </ShadowBox>
          <View style={{ padding: 16, borderRadius: 14, backgroundColor: colors.lavender, borderWidth: 2, borderStyle: 'dashed', borderColor: colors.violet, gap: 4 }}>
            <AppText variant="bold" style={{ fontSize: 13, color: colors.violet }}>
              {isRecipient ? `From. ${letter.recipientType === 'self' ? '나' : letter.sender.name}` : `To. ${letter.recipient.name} (@${letter.recipient.handle})`}
            </AppText>
            <AppText style={{ fontSize: 14, lineHeight: 21 }}>공개일 전에는 쓴 사람도 받는 사람도 제목과 내용을 볼 수 없어요.</AppText>
          </View>
        </ScrollView>
        {letter.role === 'sender' ? (
          <View style={footerPad}>
            <ActionButton title="공개일 바꾸기" variant="primary" icon={<Icon name="clock" size={20} color={colors.white} />}
              onPress={() => { setDraftDate(letter.openDate); setDateSheet(true); }} />
            <ActionButton title="편지 삭제" variant="danger" icon={<ExtraIcon name="trash" size={18} color={colors.danger} />} loading={busy === 'delete'}
              onPress={() => confirm('편지를 지울까요?', '공개 전 편지는 받는 사람에게서도 사라져요.', () => act('delete', async () => { await lettersApi.remove(letter.id); goBack(); }))} />
          </View>
        ) : null}
        <BottomSheet visible={dateSheet} onClose={() => setDateSheet(false)} title="공개일 바꾸기">
          {draftDate ? <OpenDatePicker value={draftDate} period="custom" onChange={(ymd) => setDraftDate(ymd)} /> : null}
          <Button title="저장" loading={busy === 'date'} onPress={() => act('date', async () => {
            const updated = await lettersApi.update(letter.id, { openDate: draftDate });
            setData(updated);
            setDateSheet(false);
          })} />
        </BottomSheet>
      </Screen>
    );
  }

  return (
    <Screen bg={colors.violet}>
      <View style={{ paddingHorizontal: 20, paddingTop: 20 }}><LetterHeader title="봉인 해제!" light /></View>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 14, paddingBottom: 12, gap: 14 }}>
        {letter.reply.available ? (
          <View style={{ alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999, backgroundColor: colors.butter, borderWidth: 2, borderColor: colors.ink }}>
            <Icon name="clock" size={16} />
            <AppText variant="bold" style={{ fontSize: 13 }}>답장은 오늘 {untilLabel(letter.reply.until)}까지 · 1번만 보낼 수 있어요</AppText>
          </View>
        ) : null}
        <View style={{ transform: [{ rotate: '-1deg' }], marginTop: 4 }}>
          <ShadowBox offset={6} radius={22} style={{ marginRight: -6, marginBottom: -6 }} contentStyle={{ backgroundColor: colors.paper }}>
            <LinedPaper />
            <View style={{ paddingTop: 22, paddingHorizontal: 22, paddingBottom: 20, gap: 10 }}>
              <AppText variant="bold" style={{ color: colors.violet, fontSize: 13, lineHeight: 20 }}>To. {letter.recipientType === 'self' ? '미래의 나' : letter.recipient.name}</AppText>
              <AppText variant="letter" style={{ fontSize: 21, lineHeight: 32, paddingRight: 56 }}>{letter.title}</AppText>
              <AppText variant="letter" style={{ fontSize: 16, lineHeight: 32 }}>{letter.content}</AppText>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <AppText style={{ fontSize: 12, lineHeight: 19, color: colors.muted }}>작성 {dotted(letter.createdAt)}{'\n'}공개 {dotted(letter.openDate)}</AppText>
                <AppText variant="letter" style={{ fontSize: 17, lineHeight: 26 }}>From. {letter.recipientType === 'self' && isRecipient ? '과거의 나' : letter.sender.name}</AppText>
              </View>
            </View>
          </ShadowBox>
          <View pointerEvents="none" style={{ position: 'absolute', top: -15, right: -17, width: 54, height: 62, borderRadius: 6, borderWidth: 2, borderColor: colors.ink, backgroundColor: colors.lavenderStrong, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '7deg' }] }}>
            <AppText variant="display" style={{ fontSize: 13, lineHeight: 14, textAlign: 'center' }}>{dDayLabel(dDayOf(letter.openDate))}{'\n'}{shortYmd(letter.openDate)}</AppText>
          </View>
        </View>
      </ScrollView>
      {isRecipient ? (
        <View style={footerPad}>
          {letter.reply.available ? (
            <ActionButton title="답장으로 짬 되돌려주기" variant="accent" icon={<ExtraIcon name="reply" size={20} />}
              onPress={() => router.push({ pathname: '/write', params: { replyTo: letter.id, replyToName: letter.recipientType === 'self' ? '과거의 나' : letter.sender.name } })} />
          ) : letter.reply.repliedLetterId ? <AppText variant="bold" style={{ color: '#E4DCFF', textAlign: 'center', fontSize: 13 }}>이 편지에는 이미 답장했어요</AppText> : null}
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <ActionButton title={letter.archivedAt ? '보관 해제' : '보관'} variant="outline" icon={<Icon name="archive" size={18} />} style={{ flex: 1 }} loading={busy === 'archive'}
              onPress={() => act('archive', async () => {
                const r = await lettersApi.setArchived(letter.id, !letter.archivedAt);
                setData((l) => ({ ...l, archivedAt: r.archivedAt }));
              })} />
            <ActionButton title="삭제" variant="danger" icon={<ExtraIcon name="trash" size={18} color={colors.danger} />} style={{ flex: 1 }} loading={busy === 'remove'}
              onPress={() => confirm('받은 편지를 지울까요?', '내 편지함에서만 사라져요.', () => act('remove', async () => { await lettersApi.removeReceived(letter.id); goBack(); }))} />
            <ActionButton title="닫기" variant="dark" style={{ flex: 1 }} onPress={() => goBack()} />
          </View>
        </View>
      ) : null}
    </Screen>
  );
}
