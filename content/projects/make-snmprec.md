---
title: "make-snmprec"
summary: "snmp 를 이용한 데이터 수집을 통해 시뮬레이션용(.snmprec) 파일로 변환 하는 프로그램"
techTags: ["Go"]
date: 2025-06-24
thumbnail: "/images/og-default.svg"
cover: "/images/og-default.svg"
repo: "https://github.com/swlee3306/make-snmprec"
---

## 개요

SNMP 장비로부터 데이터를 수집하여 시뮬레이터에서 사용할 수 있는 `.snmprec` 포맷으로 변환하는 도구입니다. 테스트/개발 환경에서 실제 장비 없이도 SNMP 응답을 재현할 수 있도록 도와줍니다.

<a class="btn" href="https://github.com/swlee3306/make-snmprec" target="_blank" rel="noopener">GitHub 저장소 열기 →</a>

## .snmprec 이란?

`.snmprec`는 Net-SNMP의 `snmpsimd.py` 등 시뮬레이터에서 사용되는 레코드 파일 형식입니다. OID와 값, 타입을 라인 단위로 기록해 시뮬레이터가 동일한 응답을 재현할 수 있게 합니다.

## 기능(예상)

- 지정된 대상 장비/커뮤니티/버전으로 SNMP Walk 수행
- 수집된 OID-값을 `.snmprec` 포맷으로 직렬화
- 샘플/필터링 옵션(특정 OID 트리만 포함 등)

## 사용 아이디어(초안)

```bash
# 대상 장비에서 walk → .snmprec 생성
make-snmprec \
  --target 192.168.0.10 \
  --community public \
  --version 2c \
  --out device.snmprec

# 시뮬레이터에서 device.snmprec 사용
snmpsimd.py --data-dir=./ --agent-udpv4-endpoint=127.0.0.1:1161
```

프로젝트 README 미존재로 상세 사용법은 추후 보강 예정입니다.
