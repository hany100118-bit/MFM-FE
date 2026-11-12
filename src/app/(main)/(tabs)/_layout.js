// 하단 탭: 홈 · 수신함 · (+ 편지 쓰기) · 보관함 · 알림. 디자인대로 남색 바와 가운데 노란 버튼을 직접 그린다.
import { Pressable, View } from 'react-native';
import { Tabs } from 'expo-router/js-tabs';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText, Icon } from '../../../shared/components';
import { colors } from '../../../shared/theme';
import { useUnread } from '../../../features/notifications/UnreadContext';

const LABELS = { index: '홈', inbox: '수신함', archive: '보관함', notifications: '알림' };
const ICONS = { index: 'home', inbox: 'mail', archive: 'archive', notifications: 'bell' };

function TabBar({ state, navigateToTab }) {
  const insets = useSafeAreaInsets();
  const { unreadCount } = useUnread();
  const items = state.routes.map((route, i) => ({ route, focused: state.index === i }));
  const renderItem = ({ route, focused }) => (
    <Pressable key={route.key} accessibilityRole="tab" accessibilityState={{ selected: focused }}
      accessibilityLabel={route.name === 'notifications' && unreadCount ? `알림, 안 읽음 ${unreadCount}개` : LABELS[route.name]}
      onPress={() => { if (!focused) navigateToTab(route.key); }}
      style={{ width: 52, height: 52, alignItems: 'center', justifyContent: 'center', gap: 3 }}>
      <Icon name={ICONS[route.name]} size={22} color={focused ? colors.butter : '#B9AEE8'} />
      <AppText variant={focused ? 'bold' : 'body'} style={{ fontSize: 11, lineHeight: 14, color: focused ? colors.butter : '#B9AEE8' }}>{LABELS[route.name]}</AppText>
      {route.name === 'notifications' && unreadCount ? (
        <View style={{ position: 'absolute', top: 2, right: 4, minWidth: 16, height: 16, borderRadius: 8, backgroundColor: colors.butter, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 }}>
          <AppText variant="bold" style={{ fontSize: 9 }}>{unreadCount > 99 ? '99+' : unreadCount}</AppText>
        </View>
      ) : null}
    </Pressable>
  );
  return (
    <View style={{ position: 'absolute', left: 16, right: 16, bottom: Math.max(insets.bottom, 20), height: 66, borderRadius: 22, backgroundColor: colors.ink, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingHorizontal: 6 }}>
      {items.slice(0, 2).map(renderItem)}
      <Pressable accessibilityRole="button" accessibilityLabel="편지 쓰기" onPress={() => router.push('/write')}
        style={{ width: 66, height: 66, marginTop: -30, borderRadius: 24, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        {/* 디자인의 box-shadow: 0 0 0 4px #F5F1FF (배경색 테두리) */}
        <View style={{ width: 58, height: 58, borderRadius: 20, backgroundColor: colors.butter, borderWidth: 3, borderColor: colors.ink, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="plus" size={26} />
        </View>
      </Pressable>
      {items.slice(2).map(renderItem)}
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="inbox" />
      <Tabs.Screen name="archive" />
      <Tabs.Screen name="notifications" />
    </Tabs>
  );
}
