---
title: "ssh_commend"
summary: "여러 VM에 SSH로 접속하여 CPU/메모리/디스크 등 시스템 데이터를 수집하는 프로그램"
techTags: ["Go", "Shell"]
date: 2024-07-10
thumbnail: "/images/og-default.svg"
cover: "/images/og-default.svg"
repo: "https://github.com/swlee3306/ssh_commend"
---

## 개요

여러 VM/서버에 SSH로 병렬 접속하여 CPU/메모리/디스크 등 시스템 데이터를 수집하는 프로그램입니다. 실패 재시도, 사용자 지정 명령, DB/원격 전송 등 확장성을 고려해 구성되어 있습니다.

<a class="btn" href="https://github.com/swlee3306/ssh_commend" target="_blank" rel="noopener">GitHub 저장소 열기 →</a>

## 주요 기능

- 멀티 스레드로 여러 호스트 동시 수집
- SSH 연결 실패 시 재시도 로직
- 사용자 정의 명령으로 수집 항목 확장 가능
- 로컬 저장 또는 원격 DB로 전송 아키텍처

## 파일 구성(요약)

```
.
├── collector/collector.go              # 수집 로직 엔트리
├── internal/
│   ├── dblinker/                       # DB 연결 및 모델
│   ├── lslinker/                       # 외부 링크/메타 정의
│   ├── ssh/                            # SSH 클라이언트/명령/디스크
│   ├── sysdef/                         # 공통 상수/정의
│   └── sysenv/                         # 환경 로딩
├── utils/router/router.go              # 라우팅/유틸(있는 경우)
├── main.go                             # 메인 실행부
└── setting.yml                         # 환경설정
```

프로젝트 README에는 상세 디렉터리 트리와 구조도가 포함되어 있습니다.

## 구성도

저장소에 첨부된 구성도 이미지를 참고하세요.

## 적용 사례 / 메모

- 병렬 SSH 수집 시 커넥션 풀/타임아웃 튜닝이 중요
- 호스트별 실패 분리와 재시도 백오프 전략이 안정성에 기여
