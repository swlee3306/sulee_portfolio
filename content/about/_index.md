---
title: "About"
description: "소개 페이지"
---

안녕하세요. 실사용 환경에서 확장 가능하고 관측 가능한 데이터 수집/백엔드 시스템을 만드는 개발자 이상욱입니다. 현재 오케스트로(Platform Service Dev 1)에서 클라우드 빌링·미터링, 하드웨어/스토리지 수집, K8s·OpenStack 기반 데이터 파이프라인 구축 업무를 수행하고 있습니다(총 경력 약 4년 8개월). Go를 중심으로 신뢰성과 성능, 자동화와 운영 편의성을 중시합니다.

## 기술 스택
- 언어: Go(주), Shell Script, C/C++(검증 경험)
- 플랫폼/인프라: Kubernetes(K8s), OpenStack, Linux, Cloud
- 수집/관측: SNMP, IPMI, Logstash, OpenSearch, MariaDB, NetApp 스토리지
- 웹/네트워킹: API, Nginx
- 도구: Docker, Ansible Tower, Postman, Bitbucket, GitHub Actions, Hugo

## 작업 하이라이트
- 클라우드 빌링/미터링 데이터 수집 Collector (2024.08–2024.10)
  - 상품별 맞춤 일별 데이터 수집 기능 설계/구현, 빌링 측정 데이터 협의 및 제공 담당
  - 운영 환경에서 정확한 집계와 안정성을 목표로 파이프라인 구조 설계
- 하드웨어/네트워크 장비 수집 Collector (2024.08–2024.10)
  - IPMI·SNMP 기반 서버·스위치·스토리지 상태·메트릭 수집, 물리 토폴로지 연계
  - Kubernetes 상 수집 워크로드 운용(kubernetes-collector 등), 운영 자동화
- 한국신용정보원 메트릭 수집 자동화 (2024.04–2024.07)
  - VM(CPU/Memory/Disk/Network) 에이전트 자동 설치 프로그램 개발, 배포 간소화
  - NetApp 스토리지 메트릭 수집 및 데이터 적재(Logstash/OpenSearch/MariaDB)
- 스토리지/에이전트 관련 추가 경험 (2023.05–2023.12)
  - NetApp 수집 API 연동, 데이터 유효성 검사/오류 처리, InfluxDB·PostgreSQL 저장 설계
  - Ansible Tower를 활용한 자동 설치/운영, K8s 기반 수집 환경 표준화

자세한 프로젝트 목록과 코드는 `Projects` 페이지에서 확인하실 수 있습니다. 공개 가능한 샘플/학습 프로젝트로는 `make-snmprec`, `system-Info-collector`, `APITestProgram` 등이 있습니다.

## 관심사와 가치
- 운영 환경에 강한 도구와 서비스: 실패에 강하고 관측 가능한 시스템
- 단순함과 자동화: 반복 업무의 자동화, 간결하고 이해 가능한 코드
- 성능과 품질: 벤치마크, 로깅, 테스트를 통한 지속적 개선

이력서는 PDF로 다운로드하실 수 있습니다.

<div class="btn-group" style="display:flex; gap:10px; flex-wrap:wrap; margin-top:8px;">
  <a class="btn" href="/projects/">Projects 보러 가기</a>
  <a class="btn" href="https://github.com/swlee3306" target="_blank" rel="noopener">GitHub 프로필</a>
  <a class="btn" href="mailto:swlee3306@gmail.com">이메일 보내기</a>
  <!-- 이력서 파일이 준비되면 아래 링크를 실제 파일 경로로 교체하세요 (예: /files/resume.pdf) -->
  <a class="btn" href="/files/resume.pdf" target="_blank" rel="noopener" aria-label="이력서 PDF 다운로드">이력서 다운로드 (PDF)</a>
</div>
