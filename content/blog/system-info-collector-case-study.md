---
title: "Case Study: system-Info-collector — 호스트 관측을 바닥부터"
date: 2025-09-19T15:58:10+09:00
summary: "CPU/메모리/디스크 수집기(system-Info-collector)를 설계/구현하며 샘플링·백오프/재시도·이중 로깅(CSV+DB)·로테이션으로 신뢰성과 운영성을 확보했습니다."
cover: "/images/sample-thumb.svg"
tags: ["Go", "observability", "reliability", "metrics"]
description: "수집 파이프라인의 기본을 단단히 만드는 방법—샘플링 전략, 실패 복원력, 로깅 운영, 성능 관점까지 정리합니다."
draft: false
---

## TL;DR
- CPU/메모리/디스크 메트릭을 안정적으로 수집하는 경량 에이전트를 만들었습니다.
- 샘플링·백오프/재시도·이중 로깅(CSV+DB)·로테이션으로 운영 신뢰성을 확보했습니다.
- 간단한 구조로 시작해 확장성·가시성을 동시에 봤습니다. 관련 프로젝트: {{< relref "/projects/system-Info-collector" >}}

## Context
관측은 문제를 빠르게 찾기 위한 최소한의 무기입니다. 과도한 복잡성 없이도, 신뢰할 수 있고 예측 가능한 수집 파이프라인이 필요했습니다. 특히 CPU 스파이크·메모리 증가·디스크 포화 같은 신호는 간헐적으로 발생하므로, 샘플링 전략과 실패 복원력이 핵심 이슈였습니다.

## Problem
- 간헐적 실패(일시적 권한/경합/디바이스 바운드)로 데이터 결손 발생
- 장기 실행 중 로깅 파일 크기/파일 핸들 누수·성능 저하 위험
- 개발/운영 환경 간 설정 일관성 부족으로 장애 시 복구 비용 증가

## Architecture (텍스트 스케치)
```
[Collector]
  ├─ Scheduler (ticker)
  ├─ Sampler (CPU/MEM/DISK providers)
  ├─ Validator (range/type)
  ├─ Sink: CSV Logger ──┐
  └─ Sink: DB Writer ───┴─> (dual logging)
      ↳ Rotator (size/time)
      ↳ Backoff/Retry (exp jitter)
```
- 모듈 경계가 분명하도록 provider/sink 인터페이스를 둠
- 실패 시 백오프/재시도로 일시 장애를 흡수(최대 대기 제한 & 지터)
- CSV와 DB에 동시에 쓰되, 실패는 서로 독립적으로 복구

## Sampling
- 고정 주기(ticker)로 충분한 경우 시작
- 버스티 상황에서 비용 높은 지표는 샘플링률을 낮춰 오버헤드 제어
- 샘플마다 타임스탬프/호스트 메타를 붙여 집계 단계에서 합류 용이

## Backoff/Retry
```go
backoff := NewExponentialBackoff(
  initial: 200 * time.Millisecond,
  max:     5 * time.Second,
  jitter:  true,
)
for attempt := 1; attempt <= maxAttempts; attempt++ {
  if err := writeSink(record); err == nil { break }
  time.Sleep(backoff.Next(attempt))
}
```
- 일시 실패는 재시도, 영구 실패는 빠르게 실패(fail-fast)하여 알림/로그에 남김
- 컨텍스트/데드라인으로 상위에서 중단이 가능하도록 설계

## Dual Logging (CSV + DB)
- CSV: 가벼움/로컬 확인·백업/리플레이 쉬움
- DB: 조회/집계/대시보드 연계 용이
- Sink를 인터페이스로 추상화하여, 둘 중 하나가 실패해도 다른 하나는 진행

## Rotation
- 파일 크기/시간 기준 로테이션(예: 100MB 또는 24h)
- 압축/보존 정책(예: 7일 보존)으로 디스크 포화 방지
- 로그 인덱싱을 고려해 파일 네이밍 규칙과 타임스탬프 포함

## Validation
- 범위/타입 검증으로 비정상 값 사전 차단
- 샘플 수준/배치 수준의 간단한 합산/분포 체크로 품질 신뢰도 확보

## Performance (간단 지표 예)
| 항목 | 값 |
|---|---|
| 평균 수집 주기 | 1s |
| 단일 노드 처리량 | ~ 수천 레코드/분 |
| 오버헤드 | CPU < 1%, 메모리 < 수 MB |

> 수치는 환경에 따라 달라지며, 벤치/프로파일로 주기적으로 점검합니다.

## CLI UX (예시)
```bash
system-Info-collector \
  --interval 1s \
  --csv ./metrics.csv \
  --db-dsn "postgres://..." \
  --retry-max 5 --retry-initial 200ms --retry-max-wait 5s
```
- 에러 메시지 표준화, 구조화 로깅(JSON)으로 분석/알림 파이프라인 연계

## Further Work
- 샘플링 적응화(부하/오차 허용 기반)
- Exporter 분리 및 원격 수집(프로메테우스·OTLP)
- 배치/스트림 파이프라인 비교 실험과 SLO 수립

관련 프로젝트 자세히 보기: {{< relref "/projects/system-Info-collector" >}}
