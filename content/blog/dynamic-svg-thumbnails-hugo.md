---
title: "Hugo 동적 SVG 썸네일"
date: 2025-01-15T00:00:00Z
draft: false
tags: ["hugo", "svg", "thumbnails", "templates", "performance", "branding"]
summary: "ExecuteAsTemplate, 브랜드 토큰, 폴백 시스템을 활용한 Hugo 리소스 시스템으로 외부 에셋 없이 시각적 일관성 확보"
---

# Hugo 동적 SVG 썸네일

## TL;DR

- **목표**: 외부 에셋 없이 브랜드 일관성을 유지하는 동적 썸네일 생성
- **핵심**: ExecuteAsTemplate, 브랜드 토큰, 폴백 시스템, 성능 최적화
- **결과**: 유지보수 비용 절감, 시각적 일관성, 자동화된 썸네일 생성

## Context

블로그 포스트와 프로젝트를 위한 일관된 썸네일을 만드는 것은 시간이 많이 걸리고 유지보수가 부담스러울 수 있습니다. 정적 이미지는 디자인 도구, 일관된 크기 조정, 수동 업데이트가 필요합니다. 동적 SVG 생성은 브랜드 색상, 타이포그래피, 콘텐츠를 사용하여 프로그래밍 방식으로 썸네일을 생성하여 이 문제를 해결합니다.

## Problem

전통적인 썸네일 접근 방식에는 여러 제한사항이 있습니다:
- 각 포스트/프로젝트마다 수동 생성
- 썸네일 간 일관성 없는 시각적 디자인
- 간단한 그래픽에도 큰 파일 크기
- 브랜드 변경 시 유지보수 오버헤드
- 누락된 이미지에 대한 폴백 부재

## ExecuteAsTemplate Basics

Hugo's `ExecuteAsTemplate` processes template files with your site's context, generating unique resources for each page.

### Basic Implementation

```hugo
{{ $tpl := resources.Get "images/project-thumb-template.svg" | resources.ExecuteAsTemplate (printf "gen/thumbs/%s.svg" $key) . }}
<img src="{{ $tpl.Permalink }}" alt="{{ .Title }} thumbnail" />
```

### Template Structure

Create `assets/images/project-thumb-template.svg`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<svg width="640" height="360" viewBox="0 0 640 360" xmlns="http://www.w3.org/2000/svg">
  {{/* Brand parameters with safe fallbacks */}}
  {{ $gStart := or .Site.Params.gradientStart "#7c3aed" }}
  {{ $gEnd := or .Site.Params.gradientEnd "#0ea5e9" }}
  {{ $titleColor := or .Site.Params.titleColor "#ffffff" }}
  
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="{{ $gStart }}" />
      <stop offset="100%" stop-color="{{ $gEnd }}" />
    </linearGradient>
  </defs>
  
  <rect width="640" height="360" fill="url(#g)"/>
  <rect x="16" y="16" width="608" height="328" rx="14" fill="rgba(0,0,0,0.18)" />
  
  <text x="32" y="192" font-family="system-ui" font-size="38" font-weight="800" fill="{{ $titleColor }}">
    {{ .Title }}
  </text>
</svg>
```

## Brand Tokens System

Implement a flexible brand token system for consistent theming:

### Site Configuration

```toml
# hugo.toml
[params]
  gradientStart = "#7c3aed"
  gradientEnd = "#0ea5e9"
  titleColor = "#ffffff"
  subtitleColor = "#e2e8f0"
  thumbTitleSize = "38"
  thumbSubtitleSize = "16"
  brand = "Dev Note by sw'Lee"
```

### Template Variables

```xml
{{/* Safe fallbacks for all brand parameters */}}
{{ $gStart := or .Site.Params.gradientStart "#7c3aed" }}
{{ $gEnd := or .Site.Params.gradientEnd "#0ea5e9" }}
{{ $titleColor := or .Site.Params.titleColor "#ffffff" }}
{{ $subtitleColor := or .Site.Params.subtitleColor "#e2e8f0" }}
{{ $titleSize := or .Site.Params.thumbTitleSize "38" }}
{{ $subtitleSize := or .Site.Params.thumbSubtitleSize "16" }}
{{ $titleY := or .Site.Params.thumbTitleY "192" }}
{{ $subtitleY := or .Site.Params.thumbSubtitleY "230" }}
```

## Fallback System

Implement intelligent fallback logic for missing thumbnails:

### Layout Implementation

```hugo
{{/* Check if dynamic thumbnail is needed */}}
{{ $thumb := .Params.thumbnail }}
{{ $needsDynamic := or (not $thumb) (eq $thumb "/images/og-default.svg") }}

{{ if $needsDynamic }}
  {{/* Generate unique key for caching */}}
  {{ $key := md5 .Permalink }}
  {{ $tpl := resources.Get "images/project-thumb-template.svg" | resources.ExecuteAsTemplate (printf "gen/thumbs/%s.svg" $key) . }}
  <img class="thumb" src="{{ $tpl.Permalink }}" alt="{{ .Title }} thumbnail" />
{{ else }}
  {{/* Use existing thumbnail */}}
  <img class="thumb" src="{{ $thumb | relURL }}" alt="{{ .Title }} thumbnail" />
{{ end }}
```

### Multiple Fallback Levels

```hugo
{{/* Priority: cover > thumbnail > dynamic SVG */}}
{{ $cover := .Params.cover }}
{{ $thumb := cond (ne $cover "") $cover .Params.thumbnail }}
{{ $isPlaceholder := or (eq $thumb "/images/og-default.svg") (eq $thumb "/images/sample-thumb.svg") }}
{{ $needsDynamic := or (not $thumb) $isPlaceholder }}
```

## Performance Optimization

### Caching Strategy

```hugo
{{/* Use content-based keys for efficient caching */}}
{{ $key := md5 .Permalink }}
{{ $tpl := resources.Get "images/project-thumb-template.svg" | resources.ExecuteAsTemplate (printf "gen/thumbs/%s.svg" $key) . }}
```

### Resource Pipeline

```hugo
{{/* Leverage Hugo's resource pipeline for optimization */}}
{{ $svg := resources.Get "images/project-thumb-template.svg" }}
{{ $processed := $svg | resources.ExecuteAsTemplate (printf "gen/thumbs/%s.svg" $key) . }}
{{ $minified := $processed | resources.Minify }}
```

### Lazy Loading

```html
<img class="thumb" 
     src="{{ $tpl.Permalink }}" 
     alt="{{ .Title }} thumbnail" 
     loading="lazy" 
     decoding="async" 
     width="640" 
     height="360" />
```

## Advanced Features

### Responsive Sizing

```hugo
{{/* Generate multiple sizes for responsive images */}}
{{ $svg := resources.Get "images/project-thumb-template.svg" }}
{{ $thumb640 := $svg | resources.ExecuteAsTemplate (printf "gen/thumbs/%s-640.svg" $key) . }}
{{ $thumb960 := $svg | resources.ExecuteAsTemplate (printf "gen/thumbs/%s-960.svg" $key) . }}
{{ $thumb1200 := $svg | resources.ExecuteAsTemplate (printf "gen/thumbs/%s-1200.svg" $key) . }}
```

### Content-Aware Theming

```xml
{{/* Adjust colors based on content type */}}
{{ $isBlog := eq .Section "blog" }}
{{ $isProject := eq .Section "projects" }}
{{ $accentColor := cond $isBlog "#3b82f6" "#7c3aed" }}
```

### Dynamic Typography

```xml
{{/* Adjust text size based on title length */}}
{{ $titleLength := len .Title }}
{{ $fontSize := cond (gt $titleLength 30) "32" "38" }}
<text x="32" y="192" font-size="{{ $fontSize }}" font-weight="800">
  {{ .Title }}
</text>
```

## Implementation Examples

### Blog Post Thumbnails

```hugo
{{/* In layouts/blog/single.html */}}
{{ $needsDynamic := or (not $media) (eq $media "/images/og-default.svg") }}
{{ if $needsDynamic }}
  {{ $tpl := resources.Get "images/project-thumb-template.svg" | resources.ExecuteAsTemplate (printf "gen/thumbs/%s.svg" (.Title | urlize)) . }}
  <img class="cover" src="{{ $tpl.Permalink }}" alt="{{ .Title }} cover" />
{{ end }}
```

### Project Cards

```hugo
{{/* In layouts/projects/list.html */}}
{{ $needsDynamic := or (not $thumb) (eq $thumb "/images/og-default.svg") }}
{{ if $needsDynamic }}
  {{ $key := md5 .Permalink }}
  {{ $tpl := resources.Get "images/project-thumb-template.svg" | resources.ExecuteAsTemplate (printf "gen/thumbs/%s.svg" $key) . }}
  <img class="thumb" src="{{ $tpl.Permalink }}" alt="{{ .Title }} thumbnail" />
{{ end }}
```

## Common Pitfalls

1. **Template Syntax**: Use Hugo template syntax, not Go templates
2. **Resource Paths**: Ensure template files are in `assets/` directory
3. **Caching**: Use consistent keys to avoid unnecessary regeneration
4. **Fallbacks**: Always provide safe fallback values
5. **Performance**: Don't generate thumbnails for every page load

## Best Practices

- Use semantic naming for generated files
- Implement proper fallback chains
- Cache generated resources effectively
- Test with various content lengths
- Consider accessibility with proper alt text
- Monitor build performance with large sites

## Further Work

- Implement content-aware color schemes
- Add support for custom fonts
- Create thumbnail preview system
- Build automated testing for generated thumbnails
- Consider WebP conversion for better performance

## Conclusion

Dynamic SVG thumbnails with Hugo provide a powerful, maintainable solution for consistent visual branding. By leveraging `ExecuteAsTemplate`, brand tokens, and intelligent fallbacks, you can create professional-looking thumbnails without external design tools.

The key is starting simple with basic templates and gradually adding complexity. Focus on performance through caching and lazy loading, and always provide fallbacks for edge cases. This approach scales well and keeps your site's visual identity consistent across all content.
