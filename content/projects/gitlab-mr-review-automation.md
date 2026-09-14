---
title: "gitlab-mr-review-automation"
summary: "중복·재시도·커밋 변경을 다루는 리뷰 워크플로"
description: "중복·재시도·커밋 변경을 다루는 리뷰 워크플로"
techTags: ["Python","GitLab","SQLite"]
date: 2026-09-11
thumbnail: "/images/og-default.svg"
cover: "/images/og-default.svg"
repo: "https://github.com/swlee3306/gitlab-mr-review-automation"
---

## 해결하려는 문제

GitLab MR을 읽기 전용으로 가져오거나 합성 입력으로 동작을 재현합니다. 로컬의 결정적 리뷰어를 사용하며 실제 AI 리뷰나 자동 댓글 게시를 제공한다고 주장하지 않습니다.

## 코드와 검증

### 설계에서 다룬 실패 상황

| 상황 | 구현 선택 | 확인할 동작 |
| --- | --- | --- |
| 같은 이벤트가 다시 도착 | SQLite에 처리 상태 저장 | 두 번째 요청은 `duplicate` |
| 리뷰 중 커밋이 변경 | 리뷰 전후 head SHA 확인 | 오래된 커밋의 결과를 유효한 리뷰로 처리하지 않음 |
| 만료된 작업자가 늦게 완료 | 재할당된 작업의 완료 권한 구분 | 이전 작업자가 새 작업을 완료하지 못함 |

상태 저장과 reviewer 호출 경계를 분리해 실패 상황을 재현할 수 있도록 구성했습니다.
구현과 테스트를 함께 읽는 [5분 설계·검증 가이드](https://github.com/swlee3306/gitlab-mr-review-automation/blob/main/docs/ENGINEERING_WALKTHROUGH.ko.md)를 제공합니다.

### 직접 확인하기

저장소를 복제한 뒤 루트에서 실행합니다. Python 3.11 이상이 필요하며, 데모에는 토큰과 외부 계정이 필요 없습니다.

```sh
python3 -m reviewflow demo
python3 -m unittest discover -s tests -v
```

2026-09-14 로컬 검증에서 데모는 `completed` → `duplicate`를 반환했고 테스트 31개가 통과했습니다.
이는 공개 구현의 재현 결과이며 LLM 정확도, 운영 처리량, 전사 도입 실적을 의미하지 않습니다.

[코드 탐색·실행 가이드](https://github.com/swlee3306/gitlab-mr-review-automation#readme)에서 구현 범위, 실행 명령과 검증 한계를 확인할 수 있습니다. 빌드나 합성 입력 테스트 성공을 실제 운영 안정성 또는 성능 수치로 확대하지 않습니다.

[GitHub 저장소](https://github.com/swlee3306/gitlab-mr-review-automation)
