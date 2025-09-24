---
title: "Hugo GitHub Pages 서브패스 링크"
date: 2025-01-15T11:00:00+09:00
summary: "GitHub Pages 서브패스 환경에서 Hugo의 relref와 relURL을 활용한 안전한 내부 링크 구현법과 자주 발생하는 문제점들을 실전 예제로 해결하는 가이드"
cover: "/images/og-default.svg"
tags: ["Hugo", "GitHub Pages", "Web Development", "Tutorial"]
description: "Hugo와 GitHub Pages를 함께 사용할 때 발생하는 서브패스 링크 문제를 relref와 relURL로 해결하는 실전 가이드입니다."
draft: false
---

## TL;DR

- **문제**: GitHub Pages 서브패스에서 내부 링크가 깨지는 현상
- **해결**: `relref`와 `relURL` 함수 활용, `relativeURLs`와 `canonifyURLs` 설정
- **결과**: 모든 환경에서 안정적인 내부 링크, SEO 친화적 URL 구조

## Context

Hugo로 정적 사이트를 구축하고 GitHub Pages에 배포할 때 가장 흔히 마주치는 문제 중 하나가 **서브패스(subpath) 환경에서의 내부 링크**입니다. 

GitHub Pages는 프로젝트 사이트의 경우 `username.github.io/repository-name/` 형태의 서브패스에서 사이트를 호스팅하는데, 이때 내부 링크가 제대로 작동하지 않는 경우가 많습니다.

### 일반적인 문제 상황

```html
<!-- ❌ 잘못된 링크 (절대 경로) -->
<a href="/projects/">프로젝트</a>
<!-- GitHub Pages에서: /projects/ → 404 에러 -->

<!-- ❌ 잘못된 링크 (상대 경로) -->
<a href="../projects/">프로젝트</a>
<!-- 복잡하고 유지보수 어려움 -->
```

## Problem

### GitHub Pages 서브패스의 특성

GitHub Pages는 두 가지 호스팅 방식을 제공합니다:

1. **User/Organization Pages**: `username.github.io` (루트 도메인)
2. **Project Pages**: `username.github.io/repository-name/` (서브패스)

대부분의 경우 Project Pages를 사용하게 되는데, 이때 모든 URL이 `/repository-name/` 접두사를 가지게 됩니다.

### 발생하는 문제들

1. **절대 경로 링크 실패**: `/projects/` → 404 에러
2. **상대 경로 복잡성**: 페이지별로 다른 상대 경로 계산 필요
3. **SEO 문제**: 깨진 링크로 인한 검색 엔진 최적화 저하
4. **개발/프로덕션 환경 차이**: 로컬에서는 정상, 배포 후 링크 깨짐

## Solution

### 1. Hugo 설정 최적화

`hugo.toml`에서 다음 설정을 활성화합니다:

```toml
# hugo.toml
baseURL = "https://username.github.io/repository-name/"
relativeURLs = true
canonifyURLs = true
```

**설정 설명:**
- `relativeURLs = true`: 상대 URL 생성 활성화
- `canonifyURLs = true`: URL 정규화로 일관성 보장

### 2. relref 함수 활용

Hugo의 `relref` 함수는 페이지 간 안전한 링크를 생성합니다:

```go
// 템플릿에서 사용
{{< relref "/projects" >}}           // /repository-name/projects/
{{< relref "/blog" >}}               // /repository-name/blog/
{{< relref "/about" >}}              // /repository-name/about/
```

**실제 사용 예제:**

```html
<!-- ✅ 올바른 링크 (relref 사용) -->
<a href="{{< relref "/projects" >}}">프로젝트</a>
<a href="{{< relref "/blog" >}}">블로그</a>
<a href="{{< relref "/contact" >}}">연락하기</a>
```

### 3. relURL 함수 활용

이미지나 정적 파일의 경우 `relURL` 함수를 사용합니다:

```go
// 이미지 링크
<img src="{{ "/images/logo.png" | relURL }}" alt="로고">

// CSS 파일
<link rel="stylesheet" href="{{ "/css/style.css" | relURL }}">

// JavaScript 파일
<script src="{{ "/js/main.js" | relURL }}"></script>
```

### 4. Shortcode 활용

자주 사용하는 링크 패턴은 shortcode로 만들어 재사용성을 높입니다:

```go
// layouts/shortcodes/link.html
{{ $url := .Get "to" }}
{{ $text := .Get "text" | default $url }}
<a href="{{ $url | relURL }}" class="btn">{{ $text }}</a>
```

**사용법:**
```html
<!-- 직접 relref 사용 -->
<a href="{{< relref "/projects" >}}" class="btn">프로젝트 보기</a>
<a href="{{< relref "/blog" >}}" class="btn">블로그</a>
```

## Before/After Examples

### Before: 문제가 있는 링크

```html
<!-- ❌ 절대 경로 사용 -->
<nav>
  <a href="/">홈</a>
  <a href="/projects/">프로젝트</a>
  <a href="/blog/">블로그</a>
  <a href="/about/">소개</a>
</nav>

<!-- ❌ 상대 경로 사용 (복잡함) -->
<nav>
  <a href="../">홈</a>
  <a href="../projects/">프로젝트</a>
  <a href="../blog/">블로그</a>
  <a href="../about/">소개</a>
</nav>
```

**결과**: GitHub Pages에서 404 에러 발생

### After: relref를 사용한 안전한 링크

```html
<!-- ✅ relref 사용 -->
<nav>
  <a href="{{< relref "/" >}}">홈</a>
  <a href="{{< relref "/projects" >}}">프로젝트</a>
  <a href="{{< relref "/blog" >}}">블로그</a>
  <a href="{{< relref "/about" >}}">소개</a>
</nav>
```

**결과**: 모든 환경에서 정상 작동

### 실제 프로젝트 적용 예제

```html
<!-- layouts/_default/baseof.html -->
<header>
  <nav class="main-nav">
    {{ range .Site.Menus.main }}
      <a href="{{ .URL | relURL }}" class="nav-link">
        {{ .Name }}
      </a>
    {{ end }}
  </nav>
</header>

<main>
  {{ block "main" . }}{{ end }}
</main>

<footer>
  <p>
    <a href="{{< relref "/" >}}">홈으로</a> | 
    <a href="{{< relref "/contact" >}}">연락하기</a>
  </p>
</footer>
```

## Common Pitfalls

### 1. 슬래시 누락

```go
// ❌ 잘못된 사용
{{< relref "projects" >}}     // 상대 경로로 해석됨

// ✅ 올바른 사용
{{< relref "/projects" >}}    // 절대 경로로 해석됨
```

### 2. 파일 확장자 포함

```go
// ❌ 잘못된 사용 (파일 확장자 포함)
{{< relref "/blog" >}}

// ✅ 올바른 사용 (확장자 제외)
{{< relref "/blog" >}}
```

### 3. 존재하지 않는 페이지 참조

```go
// ❌ 존재하지 않는 페이지
{{< relref "/contact" >}}

// ✅ 존재하는 페이지만 참조
{{< relref "/projects" >}}
```

### 4. 설정 누락

```toml
# ❌ 설정 누락
baseURL = "https://username.github.io/repository-name/"
# relativeURLs = true  # 누락!
# canonifyURLs = true # 누락!

# ✅ 올바른 설정
baseURL = "https://username.github.io/repository-name/"
relativeURLs = true
canonifyURLs = true
```

## Advanced Techniques

### 1. 조건부 링크

```go
{{ if .IsHome }}
  <a href="{{< relref "/" >}}">홈</a>
{{ else }}
  <a href="{{< relref "/" >}}">← 홈으로</a>
{{ end }}
```

### 2. 동적 메뉴 생성

```go
{{ range .Site.Menus.main }}
  <a href="{{ .URL | relURL }}" 
     class="{{ if $.IsMenuCurrent "main" . }}active{{ end }}">
    {{ .Name }}
  </a>
{{ end }}
```

### 3. 이미지 최적화

```go
{{ $image := .Resources.GetMatch "*.jpg" }}
{{ if $image }}
  <img src="{{ $image.RelPermalink }}" 
       alt="{{ .Title }}"
       loading="lazy">
{{ end }}
```

## Testing & Validation

### 로컬 테스트

```bash
# Hugo 서버 실행 (서브패스 시뮬레이션)
hugo server --baseURL="http://localhost:1313/repository-name/" --appendPort=false

# 빌드 테스트
hugo --baseURL="https://username.github.io/repository-name/"
```

### 링크 검증

```bash
# 빌드된 사이트에서 링크 검증
find public -name "*.html" -exec grep -l "href=" {} \; | head -5
```

### 자동화된 검증

```yaml
# .github/workflows/link-check.yml
name: Link Check
on: [push, pull_request]
jobs:
  link-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Build site
        run: hugo --minify
      - name: Check links
        run: |
          npx linkinator public --recurse --silent
```

## Performance Considerations

### 1. 빌드 시간 최적화

```go
// 불필요한 페이지 생성 방지
{{ if not .Draft }}
  <a href="{{ .RelPermalink }}">{{ .Title }}</a>
{{ end }}
```

### 2. 캐싱 전략

```go
// 이미지 최적화
{{ $image := .Resources.GetMatch "*.jpg" }}
{{ if $image }}
  {{ $resized := $image.Resize "800x600" }}
  <img src="{{ $resized.RelPermalink }}" alt="{{ .Title }}">
{{ end }}
```

## Further Work

### 단기 개선 계획

1. **자동 링크 검증**: CI/CD 파이프라인에 링크 체크 추가
2. **Shortcode 확장**: 더 많은 재사용 가능한 컴포넌트 개발
3. **성능 모니터링**: 링크 로딩 시간 측정 및 최적화

### 장기 비전

1. **다국어 지원**: 언어별 링크 구조 최적화
2. **PWA 통합**: 오프라인 링크 처리
3. **SEO 고도화**: 구조화된 데이터와 링크 관계 최적화

---

이 가이드를 통해 Hugo와 GitHub Pages를 함께 사용할 때 발생하는 링크 문제를 해결할 수 있습니다. 다음 포스트에서는 Go 벤치마킹과 프로파일링을 통한 성능 최적화 방법을 다루겠습니다.