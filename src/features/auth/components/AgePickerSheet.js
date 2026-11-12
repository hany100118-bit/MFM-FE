import { useMemo } from 'react';
import { FlatList, Pressable } from 'react-native';
import { AppText, BottomSheet, Button } from '../../../shared/components';
import { colors } from '../../../shared/theme';

const AGES = Array.from({ length: 86 }, (_, i) => i + 14); // 14~99세
const ROW = 44;

/** 나이를 세로 목록에서 고르는 시트 (직접 입력도 가능하도록 입력칸과 함께 쓴다) */
export function AgePickerSheet({ visible, value, onChange, onClose }) {
  const index = useMemo(() => Math.max(0, AGES.indexOf(Number(value) || 25)), [value]);
  return (
    <BottomSheet visible={visible} onClose={onClose} title="나이 선택">
      <FlatList
        data={AGES}
        keyExtractor={(n) => String(n)}
        style={{ height: 264, backgroundColor: colors.white, borderWidth: 2, borderColor: colors.ink, borderRadius: 16 }}
        contentContainerStyle={{ padding: 6 }}
        initialScrollIndex={Math.max(0, index - 2)}
        getItemLayout={(_, i) => ({ length: ROW, offset: ROW * i + 6, index: i })}
        renderItem={({ item }) => {
          const on = String(item) === String(value);
          return (
            <Pressable accessibilityRole="button" accessibilityState={{ selected: on }} onPress={() => onChange(String(item))}
              style={{ height: ROW, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? colors.violet : 'transparent' }}>
              <AppText variant={on ? 'bold' : 'body'} style={{ fontSize: 16, color: on ? colors.white : colors.ink }}>{item}세</AppText>
            </Pressable>
          );
        }}
      />
      <Button title={value ? `${value}세로 선택` : '선택 완료'} onPress={onClose} />
    </BottomSheet>
  );
}
