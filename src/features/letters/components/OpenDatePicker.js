// 공개일 선택: 빠른 기간(1개월·100일·6개월·1년) + 달력에서 직접 고르기. 내일부터 10년 안.
import { useState } from 'react';
import { Platform, View } from 'react-native';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { AppText, BottomSheet, Button, Chip } from '../../../shared/components';
import { colors } from '../../../shared/theme';
import { FieldLabel } from './LetterUI';
import { PERIODS, addPeriod, dDayLabel, dDayOf, formatYmd, maxOpenDate, minOpenDate, todayKstDate, toYmd } from '../../../shared/utils/date';

/** 달력에서 고른 Date(기기 현지 날짜) → 'YYYY-MM-DD' */
const localYmd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const ymdToLocalDate = (ymd) => new Date(Number(ymd.slice(0, 4)), Number(ymd.slice(5, 7)) - 1, Number(ymd.slice(8, 10)));

export function presetYmd(periodId) {
  const p = PERIODS.find((x) => x.id === periodId);
  return toYmd(addPeriod(todayKstDate(), p));
}

export function OpenDatePicker({ value, period, onChange }) {
  const [iosOpen, setIosOpen] = useState(false);
  const min = ymdToLocalDate(toYmd(minOpenDate()));
  const max = ymdToLocalDate(toYmd(maxOpenDate()));

  const pickFromCalendar = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: ymdToLocalDate(value), mode: 'date', minimumDate: min, maximumDate: max,
        onChange: (event, date) => { if (event.type === 'set' && date) onChange(localYmd(date), 'custom'); },
      });
    } else {
      setIosOpen(true);
    }
  };

  return (
    <View style={{ gap: 8 }}>
      <FieldLabel sub="내일부터 10년 안">언제 열어볼까요?</FieldLabel>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <View style={{ flex: 1, height: 46, borderWidth: 2, borderColor: colors.ink, borderRadius: 12, backgroundColor: colors.white, justifyContent: 'center', paddingHorizontal: 14 }}>
          <AppText variant="bold" style={{ fontSize: 15 }}>{formatYmd(value)}</AppText>
        </View>
        <View style={{ height: 46, paddingHorizontal: 12, borderWidth: 2, borderColor: colors.ink, borderRadius: 12, backgroundColor: colors.butter, justifyContent: 'center' }}>
          <AppText variant="display" style={{ fontSize: 18, lineHeight: 22 }}>{dDayLabel(dDayOf(value))}</AppText>
        </View>
      </View>
      <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
        {PERIODS.map((p) => <Chip key={p.id} label={p.label} selected={period === p.id} onPress={() => onChange(presetYmd(p.id), p.id)} />)}
        <Chip label="달력에서" selected={period === 'custom'} onPress={pickFromCalendar} />
      </View>
      {Platform.OS === 'ios' ? (
        <BottomSheet visible={iosOpen} onClose={() => setIosOpen(false)} title="공개일 고르기">
          <DateTimePicker value={ymdToLocalDate(value)} mode="date" display="inline" minimumDate={min} maximumDate={max} locale="ko-KR"
            onChange={(event, date) => { if (date) onChange(localYmd(date), 'custom'); }} />
          <Button title="선택 완료" onPress={() => setIosOpen(false)} />
        </BottomSheet>
      ) : null}
    </View>
  );
}
