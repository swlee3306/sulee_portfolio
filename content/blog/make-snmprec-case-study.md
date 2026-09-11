---
title: "make-snmprec: 재현 가능한 SNMP 테스트 입력"
date: 2025-09-19T15:46:30+09:00
lastmod: 2026-09-11
summary: "SNMP PDU를 테스트 레코드로 변환하는 공개 코드와 합성 예제를 소개합니다."
cover: "/images/og-default.svg"
tags: ["Go", "SNMP", "testing"]
description: "실제 구현과 향후 개선 아이디어를 구분하는 코드 탐색 안내"
draft: false
---

2026-09-11 정정: 이전 글에 제시했던 CSV 입력·정책 선택 CLI는 현재 공개 코드에서 제공하는 기능으로 확인되지 않아 실행 안내에서 제외했습니다.

## 문제

장비에 반복 접속하지 않고 네트워크 도구를 테스트하려면 재생 가능한 입력이 필요합니다. make-snmprec은 SNMP walk 결과를 OID·타입·값 형식으로 기록합니다.

## 공개 코드에서 확인할 것

main.go의 SNMP v2c walk, PDU 타입 변환, 문자열 이스케이프를 확인할 수 있습니다. 공개 샘플은 실제 장비 캡처 대신 합성 레코드 3개를 사용합니다.

## 검증과 다음 과제

Go 빌드를 확인했습니다. 실제 장비 walk와 시뮬레이터 재생을 이번 정비에서 실행한 것은 아닙니다. PDU 타입별 회귀 테스트, 오류 입력 테스트, 재생 자동화는 후속 검증 과제입니다. 측정하지 않은 생산성·성능 개선 수치는 제시하지 않습니다.

[코드와 사용 안내](https://github.com/swlee3306/make-snmprec#readme)
