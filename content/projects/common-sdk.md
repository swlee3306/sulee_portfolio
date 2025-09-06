---
title: "common-sdk"
summary: "프로젝트 공통 유틸/SDK 모음(로깅·설정·HTTP·에러 처리)"
description: "프로젝트 공통 유틸/SDK 모음(로깅·설정·HTTP·에러 처리)"
techTags: ["Go"]
date: 2025-05-30
thumbnail: "/images/sample-thumb.svg"
cover: "/images/sample-thumb.svg"
repo: "https://github.com/swlee3306/common-sdk"
---

## 개요

프로젝트 간 공통으로 재사용되는 유틸리티/SDK 모음입니다. 로깅, 설정 로딩, HTTP 클라이언트, 에러 처리, 간단한 헬퍼 등을 패키지화하여 개발 생산성을 높입니다.

<a class="btn" href="https://github.com/swlee3306/common-sdk" target="_blank" rel="noopener">GitHub 저장소 열기 →</a>

## 구성(예상)

- 로깅 래퍼: 구조화 로그, 레벨 필터링
- 설정 로더: `.yml/.env` 등 환경 의존 설정 로딩
- HTTP 클라이언트: 공통 헤더/타임아웃/리트라이 전략
- 에러/응답 유틸: 표준화된 에러 타입/응답 포맷

## 사용 아이디어(초안)

```go
import (
    "github.com/swlee3306/common-sdk/logx"
    "github.com/swlee3306/common-sdk/conf"
)

func main() {
    cfg := conf.Load("setting.yml")
    logger := logx.New(cfg.LogLevel)
    logger.Info("start")
}
```

README가 없어 현재는 모듈 구성/패키지 경로가 변동될 수 있습니다. 실제 코드를 기준으로 문서를 보강할 예정입니다.
