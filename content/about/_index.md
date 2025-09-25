---
title: "About"
description: "소개 페이지"
---

안녕하세요. 운영 환경에서 확장성과 관측성을 갖춘 데이터 수집/백엔드 시스템을 설계·구현하는 개발자 이상욱입니다. 오케스트로(Platform Service Dev 1)에서 K8s·OpenStack 기반의 수집 파이프라인, 클라우드 빌링/미터링, 하드웨어/스토리지(신뢰성 메트릭) 수집을 담당하고 있습니다(총 5년 3개월). Go를 중심으로 성능, 안정성, 운영 자동화를 우선합니다.

## 기술 스택
- 언어: Go(주), Shell Script, C/C++(검증 경험)
- 플랫폼/인프라: Kubernetes(K8s), OpenStack, Linux, Cloud
- 수집/관측: SNMP, IPMI, Logstash, OpenSearch, MariaDB, InfluxDB, NetApp 스토리지, Prometheus prompb
- 웹/네트워킹: REST API, Nginx, Gin(Web)
- 데이터/미들웨어: GORM(ORM), Redis(Pub/Sub), CSV 로깅/로테이션
- 도구: Docker, Ansible Tower, Postman, Bitbucket, GitHub Actions, Hugo

## 작업 하이라이트
- 클라우드 빌링/미터링 수집 파이프라인 (2024.08–2024.10)
  - 상품별 일별 집계를 위한 Collector 설계/구현, 빌링 측정 데이터 협의/제공
  - 운영 안정성과 집계 정확도에 초점, 장애·재시도·오류 처리 플로우 정립
- 하드웨어/네트워크 수집(서버·스위치·스토리지) (2024.08–2024.10)
  - IPMI·SNMP 기반 상태/메트릭 수집, 물리 토폴로지 연계
  - Kubernetes 워크로드 운영(kubernetes-collector 등), 배포/스케일 자동화
- 한국신용정보원 메트릭 수집 자동화 (2024.04–2024.07)
  - VM(CPU/Memory/Disk/Network) 에이전트 자동 설치 도구 개발로 배포·운영 단순화
  - NetApp 스토리지 수집 + Logstash/OpenSearch/MariaDB 적재 파이프라인 구성
- 스토리지/에이전트 운영 고도화 (2023.05–2023.12)
  - NetApp API 연동, 데이터 유효성 검사/에러 핸들링, InfluxDB·PostgreSQL 설계
  - Ansible Tower 자동 설치, K8s 기반 수집 환경 표준화

### 하드웨어/네트워크 수집 고도화 (2025)
- 서버/스위치/스토리지 관측 강화
  - IPMI 기반 호스트 FRU·전원·기본 메타/메트릭 수집 파이프라인 정비
  - 스위치 수집 고도화: 모델/온도/CPU·MEM, 인터페이스·ARP·VLAN·LLDP, 포트 사용량(누적→분당 delta) 계산
  - 포트↔NIC 매핑(PortToNic) 주기 수집으로 물리/논리 토폴로지 해석 정확도 향상
- 클라우드/인프라 연계
  - OpenStack API 연동: 네트워크/서브넷/서버 상세 수집 및 VM-네트워크 매핑(tb: cb_network_vlan, cb_vm_network_vlan)
  - 전역 설정(DB 테이블) → 모듈별 런타임 설정 주입으로 운영 일관성 확보
- 신뢰성/운영 자동화
  - 장애/재시도·백오프·에러 핸들링 플로우 표준화, 수집 데이터 유효성 검사 강화
  - Redis Pub/Sub 기반 정책·캐시 갱신 및 재연결 루틴, 모듈 온/오프 환경변수 제어
  - K8s 워크로드로 Collector 운영(배포/스케일 자동화), Docker 이미지로 표준 패키징
- 데이터 파이프라인/가시화
  - Logstash→OpenSearch·MariaDB 적재, CSV·DB 이중 로그 수집/로테이션 및 웹 뷰 제공
  - Prometheus prompb 메시지 추출/퍼블리시 경로 구성으로 모니터링 연계성 확보

자세한 프로젝트 목록과 코드는 {{< relref "/projects" >}}에서 확인하실 수 있습니다. 공개 가능한 샘플/학습 프로젝트로는 `make-snmprec`, `system-Info-collector`, `APITestProgram` 등이 있습니다.

## 관심사와 가치
- 운영 환경에 강한 도구와 서비스: 실패에 강하고 관측 가능한 시스템
- 단순함과 자동화: 반복 업무의 자동화, 간결하고 이해 가능한 코드
- 성능과 품질: 벤치마크, 로깅, 테스트를 통한 지속적 개선

이력서는 요청 시 제공해 드립니다(개인정보 보호를 위해 다운로드 버튼은 임시 비활성화되었습니다).

<div class="btn-group" style="display:flex; gap:10px; flex-wrap:wrap; margin-top:8px;">
  <a class="btn" href="{{< relref "/projects" >}}">프로젝트 보러 가기</a>
  <a class="btn" href="https://github.com/swlee3306" target="_blank" rel="noopener">GitHub 프로필</a>
  <a class="btn" href="mailto:swlee3306@gmail.com">이메일 보내기</a>
  <!-- 이력서 다운로드 버튼(임시 비활성화)
  <a class="btn" href="{{ "files/resume.pdf" | relURL }}" target="_blank" rel="noopener" aria-label="이력서 PDF 다운로드">이력서 다운로드 (PDF)</a>
  -->
</div>
