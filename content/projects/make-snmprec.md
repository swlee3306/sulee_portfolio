---
title: "make-snmprec"
summary: "SNMP walk 결과를 반복 가능한 테스트 입력으로 변환하는 Go 도구"
description: "SNMP PDU를 .snmprec 레코드로 변환"
techTags: ["Go", "SNMP", "Testing"]
date: 2025-06-24
lastmod: 2026-09-11
thumbnail: "/images/og-default.svg"
cover: "/images/og-default.svg"
repo: "https://github.com/swlee3306/make-snmprec"
---

## 문제와 접근

실제 장비에 계속 의존하지 않고 네트워크 도구를 테스트하기 위해 SNMP walk 결과를 OID·타입·값 레코드로 변환합니다. 공개 main.go에서 SNMP v2c 연결, PDU 타입 처리와 문자열 이스케이프를 살펴볼 수 있습니다.

## 실행과 제한

[README](https://github.com/swlee3306/make-snmprec#readme)의 소스 빌드 절차를 사용하고, 연결하기 전에 main.go의 실제 플래그를 확인해 주세요. 저장소에 남아 있는 기존 실행 파일은 현재 소스와 일치한다고 보장하지 않습니다.

실제 장비 walk와 시뮬레이터 재생은 별도 검증이 필요합니다. 반드시 허가된 테스트 장비와 테스트용 community를 사용하고 실제 장비 정보가 포함된 캡처를 공개하지 마세요.
