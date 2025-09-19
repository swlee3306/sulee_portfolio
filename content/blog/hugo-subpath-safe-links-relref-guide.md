---
title: "Hugo+GitHub Pages: 서브패스에서도 안전한 내부 링크(relref/relURL)"
date: 2025-09-19T16:08:10+09:00
summary: "GitHub Pages 프로젝트 사이트(`/user/repo/`)에서 루트 슬래시 링크가 깨지는 문제를 relref/relURL로 해결하는 실전 가이드입니다."
cover: "/images/sample-thumb.svg"
tags: ["Hugo", "GitHub Pages", "links", "SEO"]
description: "baseURL/relativeURLs/canonifyURLs와 함께 relref/relURL를 적용해 서브패스에서도 안전하게 내부 링크를 유지하는 방법을 다룹니다."
draft: false
---

## TL;DR
- GitHub Pages 프로젝트 사이트(`https://user.github.io/repo/`)는 사이트 루트가 `/repo/`입니다.
- `href="/about/"` 같은 루트 슬래시 링크는 프로덕션에서 `/repo/`를 무시해 404를 유발할 수 있습니다.
- Hugo의 `{{< relref >}}` 또는 `| relURL`를 사용하면 서브패스에서도 안전하게 내부 링크가 동작합니다.

## 문제 배경
프로젝트 사이트(리포지토리 사이트)는 사용자/조직 사이트와 달리 서브패스(`/repo/`) 아래에 호스팅됩니다. 이때 정적 파일/페이지의 경로 계산이 루트(`/`)와 어긋나면서 내부 링크가 무너집니다.

예: 아래 링크는 로컬에선 보이지만, 배포 후 `/about/`로 가리켜 404가 납니다.
```html
<a href="/about/">About</a>
```

## 설정 점검
`hugo.toml`에서 다음을 확인합니다(예시):
```toml
baseURL = "https://user.github.io/repo/"
relativeURLs = true
canonifyURLs = true
```
- `baseURL`: 반드시 실제 배포 주소(`/repo/` 포함)로 설정
- `relativeURLs=true`: 템플릿/콘텐츠의 상대 링크 보조
- `canonifyURLs=true`: 절대 URL 정규화 보조

## 해결: relref / relURL
안전한 내부 링크는 아래 두 가지가 핵심입니다.

### 1) relref (문서 참조 기반)
콘텐츠 파일 경로를 기준으로 내부 문서에 안전하게 링크합니다.
```md
{{< relref "/projects" >}}
{{< relref "/contact" >}}
```
- 장점: 콘텐츠 이동/리네임에도 안정적(해당 문서 존재 여부 체크)
- 사용처: 콘텐츠 간 링크(목록/상세/소개 등)

### 2) relURL (상대 URL 변환)
정적 경로를 Hugo가 사이트 설정에 맞는 상대/절대 경로로 변환합니다.
```html
<a href="{{ "files/resume.pdf" | relURL }}">이력서</a>
<img src="{{ .Params.thumbnail | relURL }}" alt="..." />
```
- 장점: 정적 파일/이미지 경로에 간단히 적용
- 사용처: 이미지/파일/에셋 링크

## Before / After
Before(루트 슬래시 링크):
```md
<a class="btn" href="/projects/">프로젝트</a>
```
After(relref):
```md
<a class="btn" href="{{< relref "/projects" >}}">프로젝트</a>
```
Before(정적 파일 직접 경로):
```html
<a class="btn" href="/files/resume.pdf">이력서</a>
```
After(relURL):
```html
<a class="btn" href="{{ "files/resume.pdf" | relURL }}">이력서</a>
```

## 체크리스트
- [ ] baseURL이 실제 배포 주소(`/repo/`)인지 확인
- [ ] 루트 슬래시(`/...`) 내부 링크를 relref/relURL로 치환
- [ ] 템플릿의 이미지/스크립트/스타일 경로도 `| relURL` 사용
- [ ] RSS/canonical/og:image 등 메타 URL은 `absURL`로 절대경로 보장

## 디버깅 팁
- 배포 후 개발자 도구에서 링크의 실제 href를 확인
- 404가 나면 앞에 `/repo/`가 누락되지 않았는지 체크
- Hugo의 링크 체크(lint)나 CI 스크립트로 자동 검증 고려

## 결론
서브패스 환경에서 내부 링크의 신뢰성은 작은 설정과 습관에서 좌우됩니다. `relref`/`relURL`를 기본으로 삼으면 이식성과 안정성이 크게 개선됩니다.
