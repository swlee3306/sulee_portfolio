---
title: "go_crud"
summary: "API 방식을 이용한 Database 기본 CRUD 프로그램"
techTags: ["Go", "Shell", "Batchfile"]
date: 2024-11-11
thumbnail: "/images/og-default.svg"
cover: "/images/og-default.svg"
repo: "https://github.com/swlee3306/go_crud"
---

## 개요

`go_crud`는 REST API를 통해 데이터베이스의 기본 CRUD(Create, Read, Update, Delete)를 제공하는 학습/예제 프로젝트입니다. 라우팅, 환경설정, DB 액세스 계층 분리를 통해 실전과 유사한 구조를 연습할 수 있습니다.

<a class="btn" href="https://github.com/swlee3306/go_crud" target="_blank" rel="noopener">GitHub 저장소 열기 →</a>

## 주요 기능

- Create/Read/Update/Delete API 제공
- Go 모듈 기반 의존성 관리와 라우팅 유틸 정리
- 환경파일(`setting.yml`)을 통한 설정 관리

## 설치

```bash
git clone https://github.com/swlee3306/go_crud.git
cd go_crud
go mod tidy
```

DB 연결 설정(`config.yaml` 또는 설정 파일)에 DSN을 환경에 맞게 입력합니다.

## 실행

```bash
go run main.go
```

기본 엔드포인트: `http://localhost:8080`

## API 엔드포인트 예시

### Create
- Endpoint: `POST /api/v1/datastore/data/insert`
- Request Body:
```json
{
  "id": 0,
  "ip": "1.1.1.2",
  "hostname": "test7",
  "user": "tst7",
  "pwd": "12344",
  "message": "hello7"
}
```

### Read
- Endpoint: `GET /api/v1/datastore/data/search`
- Response:
```json
{ "id": 1 }
```

### Update
- Endpoint: `PUT /api/v1/datastore/data/update`
- Request Body:
```json
{
  "id": 1,
  "ip": "1.1.1.2",
  "hostname": "test7",
  "user": "tst7",
  "pwd": "12344",
  "message": "hello7"
}
```

### Delete
- Endpoint: `DELETE /api/v1/datastore/data/delete`
- Response:
```json
{ "id": 1 }
```
