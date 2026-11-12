// 받은 편지 분류 (홈·보관함 탭). from 은 서버 쿼리 값.
export const CATEGORIES = [
  { id: 'all', label: '전체', from: undefined },
  { id: 'self', label: '나에게서', from: 'self' },
  { id: 'friend', label: '친구에게서', from: 'friend' },
  { id: 'anyone', label: '모르는 사람', from: 'anyone' },
  { id: 'reply', label: '답장함', from: 'reply' },
];

export const RECIPIENT_TYPES = [
  { id: 'self', label: '나', sub: '미래의 나에게' },
  { id: 'friend', label: '친구', sub: '아는 사람에게' },
  { id: 'anyone', label: '아무나', sub: '모르는 사람에게' },
];

export const TILE_COLORS = ['#EDE6FF', '#FFD966', '#CBBEFF'];
