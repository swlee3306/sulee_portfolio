---
title: "gitops-deployment-guardrails"
summary: "배포 전 Kubernetes 정책 검사와 변경 계획"
description: "배포 전 Kubernetes 정책 검사와 변경 계획"
techTags: ["Python","Kubernetes","GitOps"]
date: 2026-09-11
thumbnail: "/images/og-default.svg"
cover: "/images/og-default.svg"
repo: "https://github.com/swlee3306/gitops-deployment-guardrails"
---

## 해결하려는 문제

렌더링된 Kubernetes JSON의 위험 설정을 검사하고 두 입력의 생성·변경·삭제 계획을 비교합니다. 외부 의존성이 없고 클러스터에 접속하거나 배포하지 않습니다.

## 코드와 검증

### 설계에서 구분한 경계

| 상황 | 구현 선택 | 확인할 동작 |
| --- | --- | --- |
| 지원하지 않는 리소스 | 검사하지 못한 종류를 명시 | `uninspected`가 있으면 성공 처리하지 않음 |
| 비밀값이 있는 입력 | 정책 보고서에는 규칙과 위치만 기록 | Secret 값을 보고서에 다시 노출하지 않음 |
| 삭제를 포함한 변경 계획 | 명시적 확인을 요구 | 확인 플래그가 있어도 실제 삭제는 수행하지 않음 |

정적 검사, 변경 계획, 실제 적용을 구분해 클러스터 없이 검사 동작을 재현합니다.
구현과 테스트를 함께 읽는 [5분 설계·검증 가이드](https://github.com/swlee3306/gitops-deployment-guardrails/blob/main/docs/ENGINEERING_WALKTHROUGH.ko.md)를 제공합니다.

### 직접 확인하기

저장소를 복제한 뒤 루트에서 실행합니다. Python 3.11 이상이 필요하며 클러스터 인증은 필요 없습니다.

```sh
python3 -m guardrails check examples/safe.json
python3 -m guardrails plan --before examples/safe.json --after examples/safe.json
python3 -m unittest discover -s tests -v
```

2026-09-14 로컬 검증에서 safe 예제는 위반·미검사 항목이 없었고, 동일 파일 비교는 `unchanged`였습니다.
테스트 25개가 통과했습니다. 합성 예제는 배포용 이미지가 아니며, 이 검사는 Kubernetes 전체 스키마 검증이나 실제 클러스터 상태 비교를 대신하지 않습니다.

[코드 탐색·실행 가이드](https://github.com/swlee3306/gitops-deployment-guardrails#readme)에서 구현 범위, 실행 명령과 검증 한계를 확인할 수 있습니다. 빌드나 합성 입력 테스트 성공을 실제 운영 안정성 또는 성능 수치로 확대하지 않습니다.

[GitHub 저장소](https://github.com/swlee3306/gitops-deployment-guardrails)
