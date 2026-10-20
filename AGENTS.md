# Team Chat Lab 작업 안내

- 이 프로젝트는 100분 Git 협업 실습용 Next.js App Router·TypeScript 공유 채팅 서비스다. 청중은 미리 배포된 같은 방에 접속해 대화하고 UI를 함께 개선한다.
- 공유 메시지는 Redis에 저장한다. 서버 인스턴스 메모리나 브라우저 상태만으로 공용 채팅을 구현하지 않는다. 별도 요청 없이 유료 플랜·유료 API를 추가하지 않는다.
- Production·Preview·개인 로컬의 CHAT_ROOM_PREFIX를 구분한다. UI 배포로 운영 채팅 기록을 초기화하거나 prefix를 바꾸지 않는다.
- Redis 인증정보는 서버에서만 사용하며 NEXT_PUBLIC 환경변수나 클라이언트 코드에 넣지 않는다.
- 실습 티켓의 컴포넌트에 집중하고 공통 타입·hook·page 조립 변경은 최소화한다.
- `src/config/chat.ts`의 `CHAT_TITLE`은 충돌 실습의 기준이다. 초기값은 `Team Chat`이다.
- 비밀값은 코드·문서·커밋에 넣지 않는다. `.env*`, `.vercel`, 빌드 산출물과 의존성 폴더는 Git에서 제외한다.
- Node.js 24와 `npm ci`를 사용한다. 변경 후 `npm run check`를 실행하고 미실행 검사는 명확히 기록한다.
- 참가자 기능 브랜치는 최신 `develop`에서 만들고 PR base는 `develop`으로 둔다.
- 작성자가 자신의 변경을 설명하고 다른 사람이 리뷰한다. AI의 의견만으로 사람의 승인을 대신하지 않는다.
- 외부 작업은 사용자가 승인한 범위에서 수행한다. 사용자의 명시적 지시가 이 안내보다 우선한다.
