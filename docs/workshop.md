# Team Chat · 100분 협업 실습

총 120분 중 **100분은 실습, 20분은 인사·질문·인증·네트워크·배포 지연 여유**로 둔다. 시작할 때 모두 사전 배포된 같은 채팅방에 이름을 입력하고 실제로 대화한다. 그 앱의 작은 UI 변경 하나를 Issue → 브랜치 → PR → 동료 리뷰 → merge → 웹 확인까지 끝낸다. 공유 채팅 서버·저장은 사전 구현하며, release·hotfix·Production 역반영은 후속 과정이다.

- 저장소: [eun8ang/teamChat](https://github.com/eun8ang/teamChat)
- 화면 자료: [큰 용어 화면](presenter.html) · [16:9 흐름도](git-flow.svg)
- 상세 준비·확장 과제: [전체 계획서](../git-github-workshop-plan.md)

## 교육 전 준비

진행자는 `main`·`develop`, 참가자 Write 권한, 작성자 외 1명 승인, required check `workshop-ci`, merge commit 허용을 확인한다. **교육 전에 공유 채팅 backend·저장·Vercel 배포를 완성**하고 Production 입장 URL을 준비한다. 두 브라우저가 서로 다른 이름으로 같은 방에 들어가 메시지를 주고받고, 새로고침과 UI 재배포 뒤에도 기록이 남는지 검증한다. 서버 구축·DB 설정은 100분 수업에 추가하지 않는다.

Production 관객방은 같은 backend와 안정된 데이터 prefix를 계속 사용한다. develop Preview·로컬 실습은 별도 prefix로 분리한다. 같은 backend를 쓰더라도 실습 메시지가 Production에 섞이지 않아야 한다. Preview 접근권한을 주고 첫 PR부터 배포까지 걸리는 시간을 측정한다. 실제 서버 변수명·연결 방법은 README를 따른다. 로컬 파일만으로 공유 채팅·원격 설정·배포가 완료된 것으로 보지 않는다.

참가자는 D-1에 Git·Node 24, GitHub 인증·초대 수락, 사용할 AI 도구를 확인하고 `npm ci`와 로컬 앱 실행까지 마친다. `git config user.name`, `git config user.email`이 비어 있다면 저장소 안에서 본인 값으로 설정한다. 진행자는 두 명씩 리뷰 짝을 정하고 **서로 다른 주 수정 파일**을 배정한다.

`npm run present` 후 `http://127.0.0.1:4173`을 열거나 `docs/presenter.html`을 브라우저로 직접 열고 전체 화면에서 글자 크기와 흐름도를 확인한다. 터미널·에디터·GitHub 화면도 확대한다. 자료는 외부 폰트·CDN 없이 로컬에서 열린다.

## 시간표

| 경과 | 용어 화면 | 함께 할 일 | 확인 |
| --- | --- | --- | --- |
| 00–10분 | Flow | 같은 Production 방에 이름 입력·입장·인사, 전체 흐름 | 서로의 실제 메시지 확인 |
| 10–20분 | Clone | clone, develop 전환, 앱 실행 | origin·현재 브랜치·localhost |
| 20–30분 | Branching / Checkout | Issue·담당자, 최신 develop에서 분기 | Issue 번호와 feature 브랜치 |
| 30–55분 | Commit & Push | AI와 작은 변경, diff·검증, commit·push | 작은 변경이 원격에 있음 |
| 55–80분 | PR / Review PR / Merge | develop PR·짝 리뷰·CI·승인·merge | 동료 승인과 merged PR |
| 80–95분 | Resolve merge conflicts | 독립된 임시 저장소에서 충돌 해결 | 두 요구사항을 보존한 commit |
| 95–100분 | Deploy | Actions URL·SHA, 같은 Preview에서 대화·새로고침·제출 | UI 변경과 공유 대화 확인 |

배포는 PR 머지 직후 시작해 충돌 실습 중 기다린다. 다음 PR은 최신 develop 반영·CI·재승인 여부를 확인한 뒤 순서대로 머지한다. 20분 여유는 새 필수 과제를 넣는 데 사용하지 않는다.

## 시작 10분: 같은 채팅방에서 먼저 대화

1. 진행자가 공유한 **사전 배포 Production URL**을 각자 기기에서 연다.
2. 표시 이름을 입력해 같은 방에 입장하고 한 문장씩 보낸다.
3. 다른 참가자의 이름과 메시지가 내 화면에 도착하는지 확인한다.
4. 새로고침해 이미 보낸 메시지가 남아 있는지 확인하고, 이 앱을 함께 개선한다는 목표를 설명한다.

배포 URL·backend 연결은 교육 전에 준비한다. UI를 배포할 때도 기존 Production backend와 prefix를 유지해 같은 방의 대화가 이어지게 한다. 이후 기능 검증은 짝이 같은 **develop Preview 실습방**에서 수행한다.

## 1. Clone — 공유 저장소를 내 컴퓨터로

```bash
git clone https://github.com/eun8ang/teamChat.git
cd teamChat
git remote -v
git status
git fetch origin
git switch develop
git pull --ff-only origin develop
npm ci
npm run dev
```

이미 clone한 참가자는 다시 복제하지 않고 해당 폴더에서 `git status`부터 확인한다. 자동 추적이 안 되어 `git switch develop`이 실패하면 `git switch --track origin/develop`을 쓴다. `http://localhost:3000`을 연다. 로컬 서버의 저장 환경은 README의 개발 안내를 따르며 Production 관객방과 분리한다. 개발 서버 터미널은 유지하고 나머지 명령은 새 터미널에서 실행한다.

## 2. Branching / Checkout — 최신 develop에서 내 작업 시작

Issue에는 목적, 수정할 파일, 수용 기준 2~3개, 확인 방법, 본인 담당 지정을 넣는다. 기존 앱을 먼저 보고 **아직 하지 않은 작은 개선**을 고른다. 아래 `12`는 실제 Issue 번호로 바꾼다.

```bash
git status
git switch develop
git pull --ff-only origin develop
git switch -c feature/12-chat-title
git branch --show-current
```

- **Branching:** 독립된 작업 이력을 만든다. `git branch <이름>`은 만들기만 한다.
- **Checkout:** 현재 작업할 브랜치를 바꾼다. 이 교육은 `git switch <이름>`을 사용한다.
- **`git switch -c`:** 브랜치를 만들고 바로 그 브랜치로 이동한다.

예시 한 명만 `src/config/chat.ts`의 제목을 바꾼다. 다른 참가자는 헤더 안내 문구, 말풍선 스타일, 이모지 버튼의 접근성, 메시지 수 표시 문구처럼 **별도 파일의 작은 수용 기준**을 맡는다. 이미 작동하는 기능 전체를 새로 구현하는 티켓으로 배정하지 않는다. 같은 파일을 만지는 PR은 진행자가 순서를 정한다. 사전 구현된 서버 API·저장·동기화 계약과 Production 데이터 prefix는 UI 티켓에서 변경하지 않는다.

## 3. AI와 구현 → Commit & Push

AI에 Issue 본문과 다음 범위를 준다.

```text
README.md, CONTRIBUTING.md, AGENTS.md, package.json과 관련 파일을 읽어라.
현재 브랜치와 Issue 수용 기준을 확인하고 필요한 최소 변경을 구현하라.
관련 없는 리팩터링·의존성·CI 변경은 하지 마라.
이미 동작하는 공유 채팅 API·저장·동기화와 환경별 데이터 분리를 유지하라.
실제로 실행한 검증과 미실행 검증을 구분해 보고하라.
변경 이유와 남은 한계를 설명하라. push·승인·merge는 사람이 수행한다.
```

작성자가 diff를 읽고 실행·화면 검증을 한다. 아래는 제목 변경 예시다. 실제 바꾼 파일과 관련 테스트만 stage한다.

```bash
git status
git diff
npm run lint
npm run typecheck
npm run test:ci
npm run build
git diff --check
git add src/config/chat.ts
git diff --staged
git commit -m "feat: update workshop chat title (#12)"
git push -u origin feature/12-chat-title
```

Commit은 로컬 기록이고 Push는 원격 반영이다. 검증 실패는 같은 브랜치에서 고친다. `pull --ff-only`가 실패하면 상태와 분기 이력을 확인한다.

## 4. PR → Review PR → Merge

1. GitHub에서 **base=`develop`**, compare=`feature/12-chat-title`로 PR을 만든다.
2. 본문에 `Refs #12`, 변경 이유, 수용 기준별 결과, 실제 실행한 검사·화면 확인을 쓴다. 기본 브랜치가 main이므로 develop PR에서는 자동 Issue 종료를 기대하지 않는다.
3. 짝을 Reviewer로 지정한다. 리뷰어는 Issue·Files changed·CI를 읽고 필요한 동작을 로컬에서 확인한다.
4. AI에는 Issue·diff·CI 결과를 함께 주고 근거 있는 결함·경계 조건을 찾게 한다. 최종 리뷰 판단은 사람이 한다.
5. 질문은 **Comment**, 머지 전 수정이 필요한 결함은 **Request changes**, 검토 완료는 **Approve**로 제출한다. 작성자는 자기 PR을 승인하지 않는다.
6. 수정은 같은 브랜치에 commit·push한다. CI·변경된 diff·필요한 재승인을 확인한다.
7. 승인·`workshop-ci` 성공·충돌 없음·최신 base를 확인하고 **Create a merge commit**으로 머지한다.

**Approve는 리뷰 결과, Merge는 코드 통합이다.** Resolve conversation은 리뷰 대화를 닫는 기능이며 파일 충돌 해결과 별개다. 작성자는 무엇을, 왜 바꿨고, 무엇을 확인했는지 설명한다.

## 5. Resolve merge conflicts — 두 요구를 모두 보존

### 15분 로컬 실습

teamChat 폴더에서 실행한다. 스크립트는 OS 임시 폴더에 별도 Git 저장소를 만들고, 충돌을 재현한 뒤 **실습 폴더로 이동할 `cd` 명령**을 출력한다.

```bash
npm run workshop:conflict
```

출력된 경로로 이동한다. 이 실습은 `feature/title-emoji`의 `💬 Team Chat`을 lab의 `main`에 합친 뒤, `feature/title-room`에 main을 merge한 상태다. 파일 `src/config/chat.ts`에 충돌 표시가 있다.

```text
  <<<<<<< HEAD
export const CHAT_TITLE = "Team Chat · 실습방";
  =======
export const CHAT_TITLE = "💬 Team Chat";
  >>>>>>> main
```

HEAD는 현재 room 브랜치, incoming main은 이모지를 추가한 쪽이다. 한쪽 코드를 무조건 선택하거나 상수를 두 번 선언하지 말고 **양쪽 의도**를 합친다.

```ts
export const CHAT_TITLE = "💬 Team Chat · 실습방";
```

파일을 저장한 뒤 다음을 실행한다.

```bash
git status
git diff --check
git add src/config/chat.ts
git diff --staged
git commit -m "fix: preserve emoji and room title"
git status
git log --oneline --graph --all -8
```

충돌 표시가 없고, 💬와 실습방이 모두 있으며, merge commit과 깨끗한 작업 트리가 있으면 완료다. 임시 저장소에는 remote가 없으므로 push하지 않는다. 팀 앱 확인을 위해 원래 teamChat 폴더로 돌아간다.

### 실제 PR이 충돌했다면

실제 저장소에서는 **내 feature에 최신 develop을 합친다**. 위 임시 실습의 main은 교육용 기준 브랜치이고, 아래 명령의 대상은 `origin/develop`이다.

```bash
git status
# 먼저 미커밋 변경을 정리한 뒤 실행한다.
git fetch origin
git switch feature/12-chat-title
git merge origin/develop
# 충돌 파일을 편집 → git add <파일> → 검사 → git commit → git push
```

해결 후 CI와 동료 검토를 다시 확인한다. 병합을 중단하려면 `git merge --abort`를 사용한다.

## 6. Deploy — 이번 변경이 웹에 있는지 확인

1. `develop`에 합쳐진 마지막 묶음 커밋의 **push** Actions 실행을 연다.
2. CI와 deploy 성공을 확인하고 Summary의 **Open deployment**를 연다.
3. 화면 footer의 SHA와 해당 배포 실행 SHA를 비교한다. PR 검사 SHA와 혼동하지 않는다.
4. 이번 Issue의 수용 기준을 웹에서 다시 수행한다. 짝도 **같은 Preview URL**에 다른 이름으로 입장해 서로 메시지를 보내고, 새로고침 뒤에도 기록이 남는지 확인한다.
5. Production 관객방의 기존 기록은 별도로 유지되는지 확인하고 결과를 기록한다. UI 재배포를 이유로 기존 방의 저장소·prefix를 바꾸지 않는다.

이 구성은 feature PR 자동 Preview 대신 **develop 통합 Preview**를 만든다. PR 머지·Issue 종료·배포 성공·웹 동작 확인은 서로 다른 상태다. 서비스 장애나 접근 실패는 실제 상태로 기록하고 이전 배포를 새 결과로 제출하지 않는다.

```text
Issue / 내 merged PR:
내가 리뷰한 PR:
충돌 해결 commit 또는 설명:
Actions 실행 / Preview URL / 배포 SHA:
웹에서 확인한 수용 기준 / 짝과의 실제 대화 / 새로고침 후 기록 유지:
미완료·미검증 항목:
```

## 진행자 전환·지연 대응

- 화면 키: `←` / `→` / `Space` 이전·다음, `G` 흐름도, `F` 전체 화면, `Home` 처음, `End` 마지막. 클릭 가능한 이전·다음 버튼도 있다.
- 시작 전: Production 관객방·develop 실습방의 데이터 분리, 실제 상호 전송·기록 저장·UI 재배포 후 연속성을 검증한다.
- 55분: 구현이 크면 범위를 줄이고 작은 PR부터 올린다. 리뷰는 짝별로 동시에 진행한다.
- 80분: 실제 공용 PR 충돌은 준비된 대표 사례로 설명하고 모두 임시 저장소에서 해결한다.
- 인증 문제: 보조 진행자가 지원하고 필요하면 짝 환경에서 공동 참여한다. 개인 완주와 공동 참여는 구분해 기록한다.
- CI·배포 대기: 충돌 실습과 겹쳐 기다린다. 여유 20분을 쓰되 전체 120분 안에 종료한다.
- 공유 대화 실패: 같은 URL·방·데이터 prefix·backend 연결을 확인한다. 한 브라우저에서 전송 버튼이 작동한 것만으로 공유 대화 성공으로 기록하지 않는다.
- 후속 과정: `develop → release/* → main → Production`, sync PR로 develop 역반영, `main → hotfix/* → main`은 [상세 계획서 10절](../git-github-workshop-plan.md#10-선택-시연확장-과정-release와-hotfix)을 따른다.
