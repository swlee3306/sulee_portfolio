---
title: "make-snmprec 케이스 스터디"
date: 2025-09-19T15:46:30+09:00
summary: "운영 환경에 가까운 SNMP 시뮬레이션 데이터를 재현하는 도구를 설계/구현하며, 데이터 모델·엣지 케이스·검증·CLI UX를 통해 신뢰성과 생산성을 동시에 높였습니다."
cover: "/images/sample-thumb.svg"
tags: ["Go", "SNMP", "observability", "testing"]
description: "SNMP 기반 시뮬레이션 데이터(.snmprec)를 안정적으로 생성하기 위한 설계/구현 기록과 의사결정 근거를 공유합니다."
draft: false
---

## TL;DR
- 실환경에 가까운 SNMP 데이터를 재현할 수 있는 `.snmprec` 생성 도구를 만들었습니다.
- 데이터 모델·엣지 케이스·검증 로직·CLI UX를 단단히 하여 반복 재현성과 신뢰성을 확보했습니다.
- 결과적으로 테스트 효율이 올라가고, 장애 재현 속도가 단축되었습니다. 관련 프로젝트: {{< relref "/projects/make-snmprec" >}}

## Context
운영 환경에서 SNMP 기반 시스템을 테스트할 때, 현실적인 샘플 데이터가 부족하면 검증이 취약해집니다. 특정 장비/벤더에 특화된 MIB/OID, 불규칙한 값 분포, 엣지 케이스(누락/형 불일치 등)를 아우르는 시뮬레이션 데이터가 필요했습니다.

## Problem
- 신뢰 가능한 `.snmprec`를 일관되게 생성하기 어렵다
- 장치/벤더별 MIB/OID 차이와 자료 결손
- 잘못된 값/형/범위를 초기에 잡아내지 못해 추적 비용 증가

## Approach
Go 기반 CLI로 입력→정규화→검증→출력 파이프라인을 만들었습니다.
- 단순성: 단일 바이너리/명령으로 실행
- 재현성: 동일 입력에 대해 동일 출력 보장
- 관측성: 구조화 로깅과 에러 메시지 표준화

## Data Model
```txt
record := {
  oid: string     // 예: 1.3.6.1.2.1.1.1.0
  type: string    // 예: OctetString, Integer, Gauge32
  value: string   // 예: "Linux x86_64 ..."
}
```
입력 스키마는 CSV/JSON 모두를 지원하도록 설계할 수 있습니다. 핵심은 OID/타입/값의 일관성과 유효 범위를 사전에 강제하는 것입니다.

예시 입력(CSV):
```csv
oid,type,value
1.3.6.1.2.1.1.1.0,OctetString,"Linux x86_64 (5.10)"
1.3.6.1.2.1.25.3.3.1.2.0,Integer,7
```
예시 출력(.snmprec 스니펫):
```txt
.1.3.6.1.2.1.1.1.0|4|Linux x86_64 (5.10)
.1.3.6.1.2.1.25.3.3.1.2.0|2|7
```

## Edge Cases
- 잘못된 OID 포맷: 정규표현식 및 파서로 선제 차단
- 타입 불일치: 타입 테이블(Integer=2, OctetString=4 등)과 값 파싱 검증
- 범위 초과/누락 값: 기본값/보정 규칙 제공, 정책(무시/경고/실패) 선택 가능

## Validation
- 입력 스키마 검증: 필수 필드/형식
- 샘플 검증: 변환된 레코드 수/타입 분포/특정 OID 존재 여부 체크
- 스모크 테스트: 최소 샘플로 end-to-end 생성/검증 CI 가능성 열어두기

## CLI UX
```bash
make-snmprec \
  --input input.csv \
  --output out.snmprec \
  --on-error fail   # ignore|warn|fail
```
- 에러 메시지 예: `invalid OID at line 12: 1.3.6..1` (문맥 제공)
- 구조화 로그(JSON) 옵션으로 파이프라인 결합 용이

## Results
- 재현성: 동일 입력 → 동일 출력 보장
- 생산성: 시뮬레이션 데이터 작성/수정/검증이 CLI로 일원화
- 품질: 엣지 케이스 사전 차단으로 문제 재현/진단 속도 향상

## Further Work
- MIB 기반 타입 유추/보조 검증
- 표본 분포 기반의 값 생성(현실성 향상)
- 프로필(벤더/장치군) 프리셋

관련 프로젝트 자세히 보기: {{< relref "/projects/make-snmprec" >}}
