# Dev Note by sw'Lee - 개인 포트폴리오

Go 백엔드 개발자 이상욱의 개인 포트폴리오 웹사이트입니다. Hugo 정적 사이트 생성기를 사용하여 구축되었으며, GitHub Pages를 통해 호스팅됩니다.

## 🚀 프로젝트 개요

이 포트폴리오는 다음과 같은 목적으로 제작되었습니다:

- **개인 브랜딩**: 개발자로서의 전문성과 경험을 보여주는 공간
- **프로젝트 소개**: 개발한 다양한 도구와 애플리케이션 소개
- **기술 블로그**: 개발 과정에서 얻은 지식과 경험 공유
- **연락처**: 잠재적 협업 기회를 위한 연락 채널 제공

## 🛠️ 기술 스택

### 핵심 기술
- **Hugo**: 정적 사이트 생성기
- **HTML/CSS/JavaScript**: 프론트엔드 구현
- **GitHub Pages**: 웹 호스팅
- **GitHub Actions**: CI/CD 파이프라인

### 주요 기능
- **반응형 디자인**: 모바일과 데스크톱 모두 지원
- **다이나믹 SVG 썸네일**: 프로젝트별 자동 생성 썸네일
- **태그 시스템**: 콘텐츠 분류 및 필터링
- **RSS 피드**: 블로그 구독 지원
- **SEO 최적화**: 검색 엔진 최적화

## 📁 프로젝트 구조

```
sulee_portfolio/
├── archetypes/          # Hugo 아키타입 템플릿
├── assets/             # 정적 자산 (이미지, 스타일)
├── content/            # 콘텐츠 마크다운 파일
│   ├── about/          # 소개 페이지
│   ├── blog/           # 블로그 포스트
│   ├── contact/        # 연락처 페이지
│   └── projects/       # 프로젝트 소개
├── layouts/            # Hugo 레이아웃 템플릿
├── public/             # 빌드된 정적 사이트
├── scripts/            # 빌드 및 배포 스크립트
├── static/             # 정적 파일
└── hugo.toml           # Hugo 설정 파일
```

## 🎨 디자인 특징

### 브랜드 아이덴티티
- **그라데이션**: 보라색(#7c3aed)에서 하늘색(#0ea5e9)으로의 그라데이션
- **타이포그래피**: 깔끔하고 읽기 쉬운 폰트 사용
- **색상 팔레트**: 모던하고 전문적인 색상 조합

### 사용자 경험
- **직관적 네비게이션**: 명확한 메뉴 구조
- **빠른 로딩**: 정적 사이트의 빠른 성능
- **접근성**: 키보드 네비게이션 및 스크린 리더 지원

## 📝 콘텐츠 관리

### 블로그 포스트
- **기술 아티클**: Go, 시스템 모니터링, DevOps 관련
- **케이스 스터디**: 실제 프로젝트 경험 공유
- **튜토리얼**: 단계별 가이드 및 팁

### 프로젝트 소개
- **APITestProgram**: API 테스트 도구
- **common-sdk**: 멀티캐스트 통신 라이브러리
- **go_crud**: CRUD API 서버
- **make-snmprec**: SNMP 데이터 수집 도구
- **system-Info-collector**: 시스템 정보 수집기
- **system-broadcast-agent**: Zeroconf 기반 에이전트

## 🚀 배포 및 호스팅

### GitHub Pages
- **자동 배포**: GitHub Actions를 통한 자동 빌드 및 배포
- **도메인**: https://swlee3306.github.io/sulee_portfolio/
- **SSL**: HTTPS 자동 적용

### CI/CD 파이프라인
```yaml
# GitHub Actions 워크플로우
- Hugo 사이트 빌드
- 정적 파일 최적화
- GitHub Pages 자동 배포
```

## 🔧 로컬 개발 환경

### 사전 요구사항
- **Hugo**: 0.100.0 이상
- **Node.js**: 16.0 이상 (선택사항)
- **Git**: 버전 관리

### 설치 및 실행
```bash
# 저장소 클론
git clone https://github.com/swlee3306/sulee_portfolio.git
cd sulee_portfolio

# Hugo 서버 실행
hugo server -D

# 브라우저에서 http://localhost:1313 접속
```

### 빌드
```bash
# 프로덕션 빌드
hugo --minify

# 빌드된 파일은 public/ 디렉토리에 생성
```

## 📊 성능 최적화

### 최적화 기법
- **정적 사이트**: 서버 사이드 렌더링 없음
- **이미지 최적화**: WebP 형식 지원
- **CSS/JS 압축**: 빌드 시 자동 압축
- **캐싱**: 브라우저 캐싱 최적화

### 성능 지표
- **Lighthouse 점수**: 90+ (모든 카테고리)
- **로딩 속도**: 1초 이내
- **접근성**: WCAG 2.1 AA 준수

## 🤝 기여 및 연락

### 연락처
- **이메일**: swlee3306@gmail.com
- **GitHub**: https://github.com/swlee3306
- **포트폴리오**: https://swlee3306.github.io/sulee_portfolio/

### 기여 방법
1. 이슈 생성 또는 기존 이슈 확인
2. 포크 후 브랜치 생성
3. 변경사항 커밋 및 푸시
4. Pull Request 생성

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 🙏 감사의 말

- **Hugo**: 훌륭한 정적 사이트 생성기
- **GitHub**: 무료 호스팅 및 CI/CD 서비스
- **오픈소스 커뮤니티**: 영감과 도구 제공

---

**Dev Note by sw'Lee** - Go 백엔드 개발자의 성장 기록과 지식 공유
