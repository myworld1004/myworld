# 엑스포 부스 노트

2026 스마트 건설·안전·AI 엑스포(킨텍스 제1전시장 3·4홀, 2026. 11. 25.–27.)에서
스마트홈 관점으로 부스를 기록하고 팀과 공유하기 위해 만든 웹앱입니다.

- 실행 위치: claude.ai Artifact (`https://claude.ai/artifact/FCruASF3DuwTrWn6sndjJ1`, 공유된 사람만 열 수 있음)
- 이 폴더는 Artifact 소스의 백업입니다.

## 파일

| 파일 | 내용 |
|---|---|
| `index.html` | 앱 전체 소스. Artifact로 게시하는 형식이라 `<html>`/`<head>` 없이 `<title>`부터 시작합니다. |
| `exhibitors.json` | 가이드맵(2026.11.20판) 참가기업 리스트 202곳: 부스 번호, 전시 구역, 국문·영문 업체명. `index.html`의 `EXH`와 같은 데이터입니다. |

## 이 소스는 claude.ai 안에서만 동작합니다

저장·사진·AI 기능은 claude.ai Artifact 런타임(`window.claude.use(...)`)이 제공합니다.
일반 웹서버에 그대로 올리면 화면만 뜨고 저장과 AI는 동작하지 않습니다.

게시할 때 선언하는 capabilities:

```json
{"db": {}, "user": {"scopes": ["profile"]}, "assets": {"upload": "interact"},
 "sample": {"images": true}, "downloads": true, "dictation": {}}
```

## 주요 기능

- 부스 기록: 사진, 업체명·부스·분야, 특징, 스마트홈 관련성·적용 포인트, 관심도, 연락처, 메모
- AI 자동 입력: 간판·패널 사진을 읽고 가이드맵 명단과 대조해 업체·부스·구역 연결
- 원탭 기록과 이어 찍기(한 업체 사진을 한 기록에 모으고, 나중에 업체를 알아내면 기존 기록에 자동으로 합침)
- 사진 한꺼번에 정리(찍은 순서로 업체별 분류), 명함 촬영, 음성 메모
- 가이드맵 참가업체 보기, AI 스마트홈 동선 추천(팀 공유)
- 중복 기록 합치기, 오프라인 임시 저장 대기열(IndexedDB, 기기별)
- 내보내기: PowerPoint(표지·한 장 요약·업체별, 내용 많으면 2장), Word, Excel(요약 시트 포함), Markdown
- 백업: 기록 JSON, 사진 포함 ZIP, JSON 백업 불러오기

## 데이터 구조

- `booths/{id}`: 부스 기록 한 건 (`company`, `booth`, `zone`, `enName`, `categories[]`, `products`, `features[]`,
  `relevance`(상/중/하), `smPoint`, `contact`, `memo`, `interest`(0–5), `imageIds[]`, `cardImageId`, `needsReview`, `createdAt`, `updatedAt`, `authorId`)
- `meta/route`: AI 동선 추천 결과 (`items[{b, score, why}]`)
- 사진은 Artifact asset store에 저장되고 `/_blob/<id>`로 열립니다.
