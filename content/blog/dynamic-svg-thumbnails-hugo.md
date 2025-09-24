---
title: "Dynamic SVG Thumbnails with Hugo"
date: 2025-01-15T00:00:00Z
draft: false
tags: ["hugo", "svg", "thumbnails", "templates", "performance", "branding"]
summary: "ExecuteAsTemplate, brand tokens, fallbacks; visual consistency without external assets using Hugo's resource system."
---

# Dynamic SVG Thumbnails with Hugo

## TL;DR

Hugo's `ExecuteAsTemplate` allows you to generate dynamic SVG thumbnails on-the-fly with brand tokens, fallbacks, and consistent visual design. No external assets needed—just templates and Hugo's resource pipeline.

## Context

Creating consistent thumbnails for blog posts and projects can be time-consuming and maintenance-heavy. Static images require design tools, consistent sizing, and manual updates. Dynamic SVG generation solves this by creating thumbnails programmatically with your brand colors, typography, and content.

## Problem

Traditional thumbnail approaches have several limitations:
- Manual creation for each post/project
- Inconsistent visual design across thumbnails
- Large file sizes for simple graphics
- Maintenance overhead when brand changes
- No fallback for missing images

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
