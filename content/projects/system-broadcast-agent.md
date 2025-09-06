---
title: "system-broadcast-agent"
summary: "Zeroconf 기반 에이전트 자동탐지/브로드캐스트 서비스"
techTags: ["Go"]
date: 2025-05-23
thumbnail: "/images/og-default.svg"
cover: "/images/og-default.svg"
repo: "https://github.com/swlee3306/system-broadcast-agent"
---

## 개요

동일 네트워크 상의 여러 Agent가 서로를 자동 탐지할 수 있도록 하는 Zeroconf(mDNS/Bonjour) 기반 서비스입니다. 각 Agent는 자신이 가진 모든 사용 가능한 IPv4 주소와 호스트명을 광고하고, `/discovery` API 호출 시 주변 에이전트를 브라우징하여 정보를 수집합니다.

<a class="btn" href="https://github.com/swlee3306/system-broadcast-agent" target="_blank" rel="noopener">GitHub 저장소 열기 →</a>

## 주요 기능

- Zeroconf(mDNS)로 서비스 자동 탐색 및 광고
- 다중 NIC 환경에서 모든 IPv4 주소 자동 등록
- `/discovery` API로 주변 Agent의 IP/호스트명 수집
- TXT 레코드 주기적 재등록(정보 갱신) 지원
- 타임아웃 쿼리(`?timeout=5`)로 탐색 시간 제어

## 파일 역할

- `main.go`: Zeroconf 등록 루프 + HTTP 서버 구동
- `zeroconf.go`: Zeroconf 등록(멀티 IP 대응)
- `discovery.go`: `/discovery` API와 브라우징 로직
- `utils.go`: 사용 가능한 IPv4 수집 유틸리티

## 사용법(요약)

```bash
go mod tidy
go run .
```

- 별도의 네트워크 구성 없이 동일 서브넷의 에이전트가 서로를 탐지
- `/discovery?timeout=5` 호출로 탐지 대기 시간을 지정
