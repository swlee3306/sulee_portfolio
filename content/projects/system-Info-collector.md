---
title: "system-Info-collector"
summary: "시스템 정보 수집 및 REST API·메트릭 노출 에이전트"
techTags: ["Go", "Shell"]
date: 2025-04-02
thumbnail: "/images/og-default.svg"
cover: "/images/og-default.svg"
repo: "https://github.com/swlee3306/system-Info-collector"
---

## 개요

CPU, 메모리, 디스크, 네트워크 등 시스템 정보를 수집하여 REST API로 제공하는 경량 에이전트입니다. Prometheus 메트릭과 헬스체크 엔드포인트도 포함되어 시스템 모니터링과 상태 점검에 유용합니다.

<a class="btn" href="https://github.com/swlee3306/system-Info-collector" target="_blank" rel="noopener">GitHub 저장소 열기 →</a>

## 주요 기능

1) CPU 정보: `processor`, `cpus`, `Vendor ID`, `threads_per_core`, `cores_per_socket`, `socket` 등 기본 스펙 제공

2) 메모리 정보: `state`, `total_online`, `total_offline`, `memory_block_size`

3) 디스크 정보: 파일 시스템 정보를 통합 정리(중복 제거, 주요 마운트 `/boot`, `/home`, `/efi` 등 유지)

4) 네트워크 인터페이스 정보 유지(필요 시 송수신/연결 상태 확장 가능)

5) API 제공 및 보조 기능
- REST API로 수집 데이터 제공
- SSH 공개키 등록 스크립트 제공(운영 서버 접근 간소화)

6) 메트릭/헬스체크
- `/metrics` Prometheus 지표 제공
- `/health` 간단한 상태 확인(JSON: `{"status":"ok"}`)

## 설치 및 실행(요약)

사전 요구 사항: Ubuntu 20.04+, Go 1.19+, 관리자 권한(자원 접근)

```bash
git clone https://github.com/swlee3306/system-Info-collector.git
cd system-Info-collector

# ARM64 기본 (x86 빌드 시 GOARCH=amd64 지정)
cd script/arm/
./build.sh

# 서비스 등록/배포 스크립트(서버 접속 정보 변경 필요)
./service-active.sh

# 서비스 제거
./service-deactive.sh
```

필수 환경 변수/설정: 스크립트 내 `SERVER_USER`, `SERVER_IP`, `SERVER_PORT`, `TARGET_DIR`, `SERVICE_NAME`, `SERVICE_FILE` 값을 환경에 맞게 수정

## 주요 엔드포인트

- `GET http://{server-ip}:8080/api/v1.0/cpuinfo` — CPU 정보 조회
- `GET http://{server-ip}:9090/metrics` — Prometheus 메트릭
- `GET http://{server-ip}:9090/health` — 헬스 체크

## 적용 포인트

- 시스템 스펙 수집을 정규화하여 API/메트릭으로 노출
- 운영 편의성: systemd 서비스 스크립트로 배포 및 관리 간소화
