---
title: "system-metrics-agent"
summary: "호스트 메트릭 수집 도구"
description: "호스트 메트릭 수집 도구"
techTags: ["Go"]
date: 2025-01-01
lastmod: 2026-09-11
thumbnail: "/images/og-default.svg"
cover: "/images/og-default.svg"
repo: "https://github.com/swlee3306/system-metrics-agent"
---

## 구현과 검증 범위

진입점에서 수집·exporter·web 연결을 살펴보는 Go 프로젝트입니다. 별도의 인증·알림 패키지가 기본 실행 경로에 모두 연결되었다고 주장하지 않습니다. 빌드는 확인했지만 자동 테스트와 실서비스 운영 검증은 별도 과제입니다.

## 살펴보기

실제 실행 명령과 제한 사항은 [최신 README](https://github.com/swlee3306/system-metrics-agent#readme)를 기준으로 확인해 주세요. 공개 코드로 확인할 수 없는 운영 성과나 성능 수치는 제시하지 않습니다.
