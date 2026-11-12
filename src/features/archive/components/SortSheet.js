import { Pressable } from 'react-native';
import { AppText, BottomSheet } from '../../../shared/components';
import { colors } from '../../../shared/theme';

export const SORTS = [
  { id: 'saved', label: '최근 보관한 순', short: '보관순', hint: '방금 보관한 편지가 위로' },
  { id: 'newest', label: '공개일 최신 순', short: '최신순', hint: '최근에 열린 편지가 위로' },
  { id: 'oldest', label: '공개일 오래된 순', short: '오래된순', hint: '오래된 추억부터' },
  { id: 'sender', label: '보낸 사람 이름 순', short: '이름순', hint: '가나다 순서' },
];

export function SortSheet({ visible, value, onChange, onClose }) {
  return (
    <BottomSheet visible={visible} onClose={onClose} title="정렬 기준">
      {SORTS.map((s) => {
        const on = s.id === value;
        return (
          <Pressable key={s.id} accessibilityRole="radio" accessibilityState={{ checked: on }} onPress={() => { onChange(s.id); onClose(); }}
            style={{ height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, borderWidth: 2, borderColor: colors.ink, borderRadius: 14, backgroundColor: on ? colors.violet : colors.white }}>
            <AppText variant="bold" style={{ color: on ? colors.white : colors.ink }}>{s.label}</AppText>
            <AppText style={{ fontSize: 12, color: on ? colors.white : colors.muted }}>{s.hint}</AppText>
          </Pressable>
        );
      })}
    </BottomSheet>
  );
}
