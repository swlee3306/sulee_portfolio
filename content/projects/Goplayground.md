---
title: "Goplayground"
summary: "Go 언어 학습과 연습을 위한 다양한 예제 모음"
techTags: ["Go"]
date: 2024-02-26
thumbnail: "/images/og-default.svg"
cover: "/images/og-default.svg"
repo: "https://github.com/swlee3306/Goplayground"
---

## 개요

Go 언어 실습을 위한 예제 모음입니다. 기본 문법부터 패키지 사용, HTTP 서버, DB 연동, 테스트, 동시성(고루틴/채널)까지 학습 범위를 단계적으로 확장합니다.

<a class="btn" href="https://github.com/swlee3306/Goplayground" target="_blank" rel="noopener">GitHub 저장소 열기 →</a>

## 학습 목표

- Go 기본 문법과 표준 라이브러리 익히기
- 외부 패키지 도입과 모듈 관리
- 단위 테스트 및 간단한 벤치마크
- 고루틴/채널을 활용한 동시성 기초

## 예제 영역

- CLI 유틸리티, 문자열/파일 처리
- 간단한 HTTP 서버/핸들러
- 간단한 DB 연동 예제(드라이버 연결, CRUD 스케치)

## 사용 방법

```bash
git clone git@github.com:swlee3306/Goplayground.git
cd Goplayground
go run ./...
```

예제별 디렉터리에서 `go run` 또는 `go test`로 실행/검증합니다.
