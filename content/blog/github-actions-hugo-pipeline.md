---
title: "Hugo GitHub Actions 파이프라인"
date: 2025-01-15T00:00:00Z
draft: false
tags: ["github-actions", "hugo", "ci-cd", "deployment", "automation", "performance"]
summary: "워크플로우 기본, 캐시, 빌드 플래그, 아티팩트 팁을 활용한 Hugo 사이트의 제로 다운타임 배포 파이프라인"
---

# Hugo GitHub Actions 파이프라인

## TL;DR

- **목표**: Hugo 사이트의 자동화된 빌드, 테스트, 배포 파이프라인 구축
- **핵심**: 워크플로우 최적화, 캐싱 전략, 아티팩트 관리, 제로 다운타임 배포
- **결과**: 배포 시간 단축, 일관된 빌드 환경, 자동화된 품질 관리

## Context

Hugo와 같은 정적 사이트 생성기는 자동화된 CI/CD 파이프라인으로부터 큰 이익을 얻습니다. GitHub Actions는 외부 서비스 없이 캐싱, 빌드 최적화, 배포 자동화를 제공하며 GitHub Pages와의 원활한 통합을 제공합니다.

## Problem

수동 배포 프로세스에는 여러 제한사항이 있습니다:
- 시간이 많이 걸리는 수동 빌드 및 배포
- 일관성 없는 빌드 환경
- 자동화된 테스팅이나 검증 부재
- 캐싱 부족으로 인한 느린 빌드
- Pull Request를 위한 프리뷰 배포 부재
- 배포 프로세스에서의 인간적 오류 위험

## Workflow Basics

### Basic Hugo GitHub Actions Workflow

```yaml
name: Deploy Hugo site to GitHub Pages

on:
  push:
    branches: [ main, master ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Hugo
        uses: peaceiris/actions-hugo@v2
        with:
          hugo-version: '0.125.7'
          extended: true

      - name: Build
        env:
          BASE_URL: https://${{ github.repository_owner }}.github.io/${{ github.event.repository.name }}/
        run: |
          echo "Using baseURL=$BASE_URL"
          hugo --minify --baseURL "$BASE_URL"

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./public

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Setup Pages
        uses: actions/configure-pages@v5
        with:
          enablement: true
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

## Cache Optimization

### Hugo Module Caching

```yaml
- name: Cache Hugo modules
  uses: actions/cache@v4
  with:
    path: |
      ~/.cache/hugo
      resources/_gen
    key: ${{ runner.os }}-hugo-${{ hashFiles('**/go.sum') }}
    restore-keys: |
      ${{ runner.os }}-hugo-

- name: Cache Hugo build
  uses: actions/cache@v4
  with:
    path: |
      public
      resources/_gen
    key: ${{ runner.os }}-hugo-${{ hashFiles('**/*.md', '**/*.html', '**/*.toml') }}
    restore-keys: |
      ${{ runner.os }}-hugo-
```

### Node.js Dependencies Caching

```yaml
- name: Cache Node modules
  uses: actions/cache@v4
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-
```

## Build Flags and Optimization

### Advanced Hugo Build Configuration

```yaml
- name: Build with optimization
  env:
    HUGO_ENV: production
    BASE_URL: https://${{ github.repository_owner }}.github.io/${{ github.event.repository.name }}/
  run: |
    hugo \
      --minify \
      --baseURL "$BASE_URL" \
      --buildDrafts=false \
      --buildFuture=false \
      --buildExpired=false \
      --cleanDestinationDir \
      --gc
```

### Environment-Specific Builds

```yaml
- name: Build for environment
  env:
    BASE_URL: ${{ github.event_name == 'pull_request' && format('https://{0}-{1}.github.io/{2}/', github.event.pull_request.head.repo.owner.login, github.event.pull_request.number, github.event.repository.name) || format('https://{0}.github.io/{1}/', github.repository_owner, github.event.repository.name) }}
  run: |
    echo "Building for: $BASE_URL"
    hugo --minify --baseURL "$BASE_URL"
```

## Artifact Management

### Optimized Artifact Upload

```yaml
- name: Upload artifact with compression
  uses: actions/upload-pages-artifact@v3
  with:
    path: ./public
    retention-days: 30
    compression-level: 6
```

### Multi-Environment Artifacts

```yaml
- name: Upload production artifact
  if: github.ref == 'refs/heads/main'
  uses: actions/upload-pages-artifact@v3
  with:
    path: ./public
    name: production-site

- name: Upload preview artifact
  if: github.event_name == 'pull_request'
  uses: actions/upload-pages-artifact@v3
  with:
    path: ./public
    name: preview-${{ github.event.pull_request.number }}
```

## Performance Tips

### Parallel Build Steps

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Hugo
        uses: actions/setup-hugo@v2
        with:
          hugo-version: '0.125.7'
          extended: true

      - name: Build site
        run: hugo --minify --baseURL "$BASE_URL"

      - name: Optimize images
        run: |
          find public -name "*.jpg" -o -name "*.png" | head -10 | xargs -I {} convert {} -quality 85 -strip {}

      - name: Generate sitemap
        run: hugo --baseURL "$BASE_URL" --disableKinds=page,section,taxonomy,taxonomyTerm
```

### Build Matrix for Multiple Hugo Versions

```yaml
strategy:
  matrix:
    hugo-version: ['0.120.0', '0.125.7', '0.130.0']
    include:
      - hugo-version: '0.125.7'
        extended: true
```

## Advanced Workflow Features

### Pull Request Previews

```yaml
name: Preview Hugo site

on:
  pull_request:
    branches: [ main ]

jobs:
  preview:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Hugo
        uses: actions/setup-hugo@v2
        with:
          hugo-version: '0.125.7'
          extended: true

      - name: Build preview
        env:
          BASE_URL: https://${{ github.event.pull_request.number }}.preview.example.com/
        run: hugo --minify --baseURL "$BASE_URL"

      - name: Deploy to preview
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./public
          destination_dir: preview/pr-${{ github.event.pull_request.number }}
```

### Automated Testing

```yaml
- name: Test site build
  run: |
    hugo --buildDrafts --buildFuture
    if [ $? -ne 0 ]; then
      echo "Build failed"
      exit 1
    fi

- name: Validate HTML
  run: |
    npx html-validate public/**/*.html

- name: Check for broken links
  run: |
    npx linkinator public --recurse --silent
```

### Security Scanning

```yaml
- name: Security scan
  uses: github/super-linter@v4
  env:
    DEFAULT_BRANCH: main
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    VALIDATE_ALL_CODEBASE: false
    VALIDATE_MARKDOWN: true
    VALIDATE_YAML: true
```

## Zero-Downtime Deployment

### Blue-Green Deployment Strategy

```yaml
- name: Deploy to staging
  if: github.ref != 'refs/heads/main'
  run: |
    hugo --baseURL "https://staging.example.com/"
    # Deploy to staging environment

- name: Deploy to production
  if: github.ref == 'refs/heads/main'
  run: |
    hugo --baseURL "https://example.com/"
    # Deploy to production environment
```

### Health Checks

```yaml
- name: Health check
  run: |
    curl -f https://${{ github.repository_owner }}.github.io/${{ github.event.repository.name }}/ || exit 1
    echo "Site is healthy"
```

## Monitoring and Alerts

### Build Notifications

```yaml
- name: Notify on success
  if: success()
  uses: 8398a7/action-slack@v3
  with:
    status: success
    text: "Hugo site deployed successfully!"

- name: Notify on failure
  if: failure()
  uses: 8398a7/action-slack@v3
  with:
    status: failure
    text: "Hugo site deployment failed!"
```

### Performance Monitoring

```yaml
- name: Lighthouse CI
  uses: treosh/lighthouse-ci-action@v10
  with:
    configPath: './lighthouserc.json'
    uploadArtifacts: true
    temporaryPublicStorage: true
```

## Common Pitfalls

1. **Missing Permissions**: Ensure proper GitHub Pages permissions
2. **Base URL Issues**: Always use correct baseURL for GitHub Pages
3. **Cache Invalidation**: Clear cache when Hugo version changes
4. **Artifact Size**: Monitor artifact size limits
5. **Build Timeouts**: Optimize build steps to avoid timeouts

## Best Practices

- Use specific Hugo versions for reproducible builds
- Implement proper caching strategies
- Add automated testing and validation
- Monitor build performance and optimize
- Use environment-specific configurations
- Implement proper error handling and notifications

## Further Work

- Implement advanced caching strategies
- Add automated performance testing
- Create custom deployment strategies
- Integrate with external monitoring services
- Add automated security scanning
- Implement A/B testing capabilities

## Conclusion

GitHub Actions provides a robust foundation for Hugo site deployment with excellent caching, build optimization, and deployment automation. By implementing proper caching strategies, build flags, and artifact management, you can achieve fast, reliable deployments with zero downtime.

The key is starting with a basic workflow and gradually adding optimization features. Focus on caching for performance, proper build flags for optimization, and monitoring for reliability. This approach scales well and keeps your deployment process efficient and maintainable.
