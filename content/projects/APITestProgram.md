---
title: "APITestProgram"
summary: "오프라인/폐쇄망에서도 동작하는 경량 API 테스트 클라이언트"
techTags: ["Go", "Shell"]
date: 2024-11-13
thumbnail: "/images/og-default.svg"
cover: "/images/og-default.svg"
repo: "https://github.com/swlee3306/APITestProgram"
---

## 개요

오프라인(폐쇄망) 혹은 제한된 네트워크 환경에서도 API 테스트를 쉽게 수행할 수 있도록 만든 경량 HTTP 클라이언트입니다. 사용자는 URL, 헤더, 바디(JSON)를 선택/입력하여 GET/POST 요청을 보낼 수 있으며, 응답 헤더와 본문을 보기 좋게 출력합니다.

<a class="btn" href="https://github.com/swlee3306/APITestProgram" target="_blank" rel="noopener">GitHub 저장소 열기 →</a>

## 주요 기능

- GET과 POST 요청 지원
- 추가 헤더 입력 및 요청에 설정
- JSON 파일을 직접 지정해 POST 바디로 전송
- 미리 등록된 JSON 바디 목록을 선택해 POST 전송
- 등록된 JSON 목록에서 콘텐츠 미리보기 제공
- 응답 헤더/본문 출력, JSON pretty-print
- 종료 신호를 처리하여 안전하게 종료

## 사용 방법(요약)

1. 저장소 클론 후 실행
   ```bash
   git clone git@github.com:swlee3306/APITestProgram.git
   cd APITestProgram
   go run main.go
   ```

2. 메뉴에서 요청 방식을 선택
   - (1) GET 요청: URL 및 헤더 입력 → 전송 → 응답 출력
   - (2) POST 요청: URL, JSON 파일 경로, 헤더 입력 → 전송 → 응답 출력
   - (3) POST(등록된 body file): 사전 등록한 JSON 바디 키 선택 → URL/헤더 입력 → 전송
   - (4) json body 내용 보기: 등록된 바디 파일 내용을 터미널에 출력

등록용 JSON 파일 경로: `internal/apiRequest/jsonfiles/`

## 내부 구성(핵심 함수)

- `ApiReqRun`: 메인 루프, 사용자 입력 분기 처리
- `HandleGetRequest`: GET 요청 처리(헤더 포함)
- `HandlePostRequest`: 파일에서 JSON을 읽어 POST 요청 전송
- `handlePostRequestGetBody`: 사전 정의된 바디를 사용해 POST 요청 전송
- `GetJsonList`: 등록된 JSON 바디 목록 조회 및 선택 처리
- `ShowJsonFile`: 선택한 JSON 바디 파일 내용을 출력
- `getHeaders` / `addHeaders`: 사용자 추가 헤더 파싱 및 요청에 적용
- `printResponse`: 응답 헤더와 JSON 본문 pretty-print

## 주의 사항

- HTTPS 요청 시 인증서 검증을 무시하도록 설정되어 있으므로, 신뢰 가능한 환경에서만 사용하세요. 프로덕션에서는 반드시 적절한 인증서 검증을 적용해야 합니다.

## 배운 점 / 적용 포인트

- CLI 상호작용 구조와 요청 분기 패턴 설계
- JSON 바디 관리(파일/사전등록)로 반복 테스트 효율화
- 응답 포맷팅과 헤더/본문 분리 출력 UX

—

정식 README와 실행 예시는 저장소에서 계속 업데이트하고 있습니다.
