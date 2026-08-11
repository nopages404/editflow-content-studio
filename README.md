# EDITFLOW

One idea. Every channel.

콘텐츠 기획부터 플랫폼별 변환까지 이어지는 AI 콘텐츠 자동화 스튜디오입니다.

## Core flow

1. IDEA — 주제 기반 콘텐츠 아이디어 생성 및 편집
2. KEYWORDS — 메인, 연관, 롱테일 키워드와 검색 의도 설계
3. MASTER — 모든 채널의 원본이 되는 Master Content 작성
4. DISTRIBUTE — 12개 플랫폼 형식으로 동시 변환

## Supported platforms

- Naver Blog
- Tistory
- Google Blogger
- WordPress
- Medium
- Instagram
- Facebook
- Threads
- LinkedIn
- Remember
- X
- Pinterest

## Run locally

정적 웹앱이므로 별도의 빌드 과정이 필요하지 않습니다.

```bash
python3 -m http.server 4173
```

브라우저에서 `http://localhost:4173`을 여세요.

## Storage and AI

- 프로젝트와 Brand Profile은 브라우저 `localStorage`에 자동 저장됩니다.
- 현재 AI 생성은 `MockAIService`로 동작합니다.
- 실제 AI API 연결 시 `AIService` 구현만 교체할 수 있도록 분리되어 있습니다.

