# MFM-FE · 미래의 나에게 짬처리 — 앱 (React Native)

레전드 미래에게 짬 처리 시키는 편지 서비스의 프론트 Repository

Expo SDK 58 · React Native 0.88 · JavaScript · Expo Router · 백엔드: `../backend` (Express + MySQL)

## 폴더 구조 (기능별)

```
src/
├─ app/                         라우트 (Expo Router: 파일 = 화면 주소). 화면 코드는 features 에 두고 여기선 연결만
│  ├─ _layout.js                폰트 로드 · 로그인 상태 · 전역 Provider
│  ├─ (auth)/                   로그인 전: login · kakao · signup
│  └─ (main)/                   로그인 후 (로그인 안 했으면 /login 으로)
│     ├─ (tabs)/                하단 탭: index(홈) · inbox · archive · notifications + 가운데 편지 쓰기 버튼
│     ├─ write.js               편지 쓰기 / 답장 쓰기
│     ├─ letter/[id].js         편지 상세
│     └─ profile.js             내 프로필
├─ features/                    기능별 묶음 (api · 화면 · 그 기능 전용 컴포넌트)
│  ├─ auth/                     카카오 로그인(WebView) · 회원가입 · 로그인 상태(AuthContext)
│  ├─ home/                     다음 공개 D-day · 카테고리별 봉인 편지
│  ├─ inbox/                    공개 예정 / 열람 가능
│  ├─ letters/                  편지 API · 쓰기 · 상세 · 받는 사람/공개일 선택
│  ├─ archive/                  보관함 (카테고리 · 검색 · 정렬)
│  ├─ notifications/            알림 · 안 읽은 수(UnreadContext, 탭 배지)
│  └─ profile/                  내 정보 · 로그아웃
└─ shared/                      여러 기능이 같이 쓰는 것
   ├─ api/                      API 호출기(client.js, RN 모듈 없음) · 앱 인스턴스(index.js)
   ├─ components/               Button · TextField · Chips · BottomSheet · ShadowBox · StateView …
   ├─ hooks/                    useApiQuery(화면 들어올 때 불러오기) · useDebounced
   ├─ storage/                  토큰 보안 저장소 (expo-secure-store)
   ├─ theme/                    색 · 폰트 · 모서리 (디자인 캔버스와 같은 값)
   ├─ utils/                    날짜(KST) · 오류 문구
   └─ config.js                 EXPO_PUBLIC_* 환경 변수
tests/contract.test.mjs         실제 백엔드와 맞물리는지 확인하는 계약 테스트
```

기능을 추가할 때: `src/features/<기능>/` 에 api·screens·components 를 만들고, `src/app/` 에 한 줄짜리 라우트 파일을 둔다.

## 실행

```bash
cd frontend
npm install
cp .env.example .env     # EXPO_PUBLIC_API_BASE_URL, EXPO_PUBLIC_KAKAO_REST_API_KEY 등
npx expo start           # QR 을 휴대폰 Expo Go 로 스캔
```

- **실제 폰에서 서버 주소**: 폰의 `localhost` 는 폰 자신이다. `EXPO_PUBLIC_API_BASE_URL` 에 PC 의 IP(같은 와이파이)를 쓴다. 예: `http://192.168.0.10:4000/api`
- **백엔드 없이 화면 작업만 하려면 (목업 모드)**: 앱 `.env` 에 `EXPO_PUBLIC_MOCK_API=true` → 로그인 화면의 "개발용 로그인"으로 가짜 데이터가 든 앱에 들어간다. "목업: 회원가입 화면 보기"로 가입 흐름도 볼 수 있다 (이메일 인증 코드 `123456`). 예시 데이터는 `src/shared/api/mockServer.js` 의 `seed()` 에서 고친다. 새로고침하면 처음 상태로 돌아간다.
- **카카오 키 없이 먼저 보고 싶으면**: 서버 `.env` 에 `DEV_LOGIN_ENABLED=true`, 앱 `.env` 에 `EXPO_PUBLIC_DEV_LOGIN=true` → 로그인 화면에 "개발용 로그인" 버튼이 생긴다. (가입 단계 인증 코드는 개발 서버 로그에 찍힘)

## 설치가 안 될 때

**`npm error ERESOLVE … react-dom@19.3.1 … react@19.3.0`**
예전 버전의 `package.json` 으로 설치하면 생긴다. Expo SDK 58 은 react 19.3.0 을 쓰는데, npm 이 웹용 react-dom 의 최신판(19.3.1)을 자동으로 넣으려다 충돌한다.
지금 `package.json` 은 react-dom 을 19.3.0 으로 고정해 해결했다. 이전에 설치를 시도했다면 남은 파일을 지우고 다시 설치한다.
```bash
rm -rf node_modules package-lock.json   # Windows PowerShell: Remove-Item -Recurse -Force node_modules, package-lock.json
npm install
```
패키지를 추가할 때는 `npm install` 대신 `npx expo install <패키지>` 를 쓴다 (SDK 와 맞는 버전으로 설치됨).
`--legacy-peer-deps` 나 `--force` 로 넘기지 않는다 (충돌을 숨길 뿐 해결하지 않음).

## 카카오 로그인

1. [Kakao Developers](https://developers.kakao.com) → 앱 → 카카오 로그인 ON
2. **Redirect URI** 에 `http://localhost:5173/oauth/kakao` (또는 원하는 주소) 등록 — 서버 `KAKAO_REDIRECT_URIS`, 앱 `EXPO_PUBLIC_KAKAO_REDIRECT_URI` 와 똑같이
3. 앱 `EXPO_PUBLIC_KAKAO_REST_API_KEY` 에 REST API 키

동작: 앱이 카카오 로그인 페이지를 WebView 로 열고, 카카오가 Redirect URI 로 보내는 순간 주소에서 `code` 를 꺼내 서버 `/api/auth/kakao` 로 보낸다. 그 주소는 실제로 열지 않으므로 웹 서버가 없어도 된다.
REST API 키는 인가 요청 주소에 원래 드러나는 값이라 앱에 넣어도 되지만, **Client Secret 은 절대 앱에 넣지 않는다** (서버 `.env` 에만).

## 확인

```bash
npm test                 # 단위 테스트 (API 호출기 · 날짜 계산)
npx expo lint            # 린트
npx expo export --platform android   # 번들이 깨지지 않는지 (기기 없이)
# 계약 테스트: 백엔드를 개발 모드(DEV_LOGIN_ENABLED=true, LOG_LEVEL=info, 로그를 파일로)로 띄운 뒤
CONTRACT_API=http://localhost:4000/api CONTRACT_LOG=/path/backend.log node --test tests/contract.test.mjs
```

## 아직 없는 것
- **친구 목록 · 프로필 편집**: 서버 API 가 없어 "친구"도 아이디로 지정한다. 프로필 화면에 준비 중 안내.
- **편지 이미지 첨부**, **푸시 알림**
