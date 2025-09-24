---
title: "Go 네트워킹 팁: 타임아웃, 백오프, 멱등성"
date: 2025-01-15T00:00:00Z
draft: false
tags: ["go", "networking", "reliability", "timeouts", "backoff", "idempotency"]
categories: ["Backend", "Go"]
description: "안정적인 분산 시스템 구축을 위한 필수 Go 네트워킹 패턴: 타임아웃, 지수 백오프, 멱등성, 서킷 브레이커를 실제 예제와 함께 다룹니다."
---

## TL;DR

Go에서 안정적인 네트워크 애플리케이션을 구축하려면 적절한 타임아웃 처리, 지능적인 재시도 전략, 멱등성 연산이 필요합니다. 이 가이드는 컨텍스트/데드라인, 지수 백오프, 서킷 브레이커에 대한 필수 패턴을 실제 예제와 함께 다룹니다.

## 배경

Go에서 네트워크 프로그래밍은 고유한 도전 과제를 제시합니다: 연결이 실패할 수 있고, 서비스가 일시적으로 사용 불가능할 수 있으며, 네트워크 분할이 연쇄 실패를 일으킬 수 있습니다. 적절한 안정성 패턴 없이는 애플리케이션이 취약하고 예측 불가능해집니다.

## 문제점

Go 애플리케이션에서 흔한 네트워킹 문제들:

- **타임아웃 없음**은 연결이 멈추고 리소스 누수를 야기합니다
- **단순한 재시도**는 실패하는 서비스를 압도할 수 있습니다
- **비멱등성 연산**은 재시도 시 데이터 손상을 일으킵니다
- **서킷 브레이커 없음**은 연쇄 실패를 허용합니다
- **부적절한 에러 처리**는 디버깅을 거의 불가능하게 만듭니다

## 타임아웃 전략

### 데드라인과 함께하는 컨텍스트

Go 네트워킹에서 가장 중요한 패턴은 타임아웃과 함께 `context.Context`를 사용하는 것입니다:

```go
package main

import (
    "context"
    "fmt"
    "net/http"
    "time"
)

func makeRequest(ctx context.Context, url string) (*http.Response, error) {
    // 타임아웃이 있는 새로운 컨텍스트 생성
    ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
    defer cancel()
    
    req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
    if err != nil {
        return nil, err
    }
    
    client := &http.Client{
        Timeout: 10 * time.Second, // 클라이언트 레벨 타임아웃
    }
    
    return client.Do(req)
}

func main() {
    ctx := context.Background()
    
    // 3초 타임아웃으로 요청
    ctx, cancel := context.WithTimeout(ctx, 3*time.Second)
    defer cancel()
    
    resp, err := makeRequest(ctx, "https://api.example.com/data")
    if err != nil {
        fmt.Printf("요청 실패: %v\n", err)
        return
    }
    defer resp.Body.Close()
    
    fmt.Println("요청 성공")
}
```

### 다중 타임아웃 레이어

```go
type TimeoutConfig struct {
    ConnectTimeout   time.Duration
    ReadTimeout     time.Duration
    WriteTimeout    time.Duration
    TotalTimeout    time.Duration
}

func NewHTTPClient(config TimeoutConfig) *http.Client {
    transport := &http.Transport{
        DialContext: (&net.Dialer{
            Timeout: config.ConnectTimeout,
        }).DialContext,
        TLSHandshakeTimeout: config.ConnectTimeout,
        ResponseHeaderTimeout: config.ReadTimeout,
    }
    
    return &http.Client{
        Transport: transport,
        Timeout:   config.TotalTimeout,
    }
}

// 사용법
client := NewHTTPClient(TimeoutConfig{
    ConnectTimeout: 2 * time.Second,
    ReadTimeout:    5 * time.Second,
    WriteTimeout:   2 * time.Second,
    TotalTimeout:   10 * time.Second,
})
```

## 백오프 패턴

### 지수 백오프

```go
package main

import (
    "context"
    "fmt"
    "log"
    "math"
    "math/rand"
    "net"
    "net/http"
    "sync"
    "time"
)

type BackoffConfig struct {
    InitialDelay time.Duration
    MaxDelay     time.Duration
    Multiplier   float64
    Jitter       bool
}

type RetryableFunc func() error

func ExponentialBackoff(ctx context.Context, config BackoffConfig, fn RetryableFunc) error {
    delay := config.InitialDelay
    attempt := 0
    
    for {
        err := fn()
        if err == nil {
            return nil
        }
        
        attempt++
        
        // 컨텍스트가 취소되었는지 확인
        select {
        case <-ctx.Done():
            return ctx.Err()
        default:
        }
        
        // 다음 지연 시간 계산
        nextDelay := time.Duration(float64(delay) * math.Pow(config.Multiplier, float64(attempt)))
        if nextDelay > config.MaxDelay {
            nextDelay = config.MaxDelay
        }
        
        // 썬더링 허드 방지를 위한 지터 추가
        if config.Jitter {
            jitter := time.Duration(rand.Float64() * float64(nextDelay) * 0.1)
            nextDelay += jitter
        }
        
        fmt.Printf("시도 %d 실패, %v 후 재시도: %v\n", attempt, nextDelay, err)
        
        select {
        case <-time.After(nextDelay):
            delay = nextDelay
        case <-ctx.Done():
            return ctx.Err()
        }
    }
}

// Usage
func main() {
    ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
    defer cancel()
    
    config := BackoffConfig{
        InitialDelay: 100 * time.Millisecond,
        MaxDelay:     5 * time.Second,
        Multiplier:   2.0,
        Jitter:       true,
    }
    
    err := ExponentialBackoff(ctx, config, func() error {
        // 여기에 네트워크 연산을 넣으세요
        return fmt.Errorf("일시적 실패")
    })
    
    if err != nil {
        fmt.Printf("모든 재시도 실패: %v\n", err)
    }
}
```

### 선형 백오프

```go
func LinearBackoff(ctx context.Context, config BackoffConfig, fn RetryableFunc) error {
    delay := config.InitialDelay
    attempt := 0
    
    for {
        err := fn()
        if err == nil {
            return nil
        }
        
        attempt++
        
        select {
        case <-ctx.Done():
            return ctx.Err()
        default:
        }
        
        // 선형 증가
        nextDelay := time.Duration(float64(delay) * float64(attempt))
        if nextDelay > config.MaxDelay {
            nextDelay = config.MaxDelay
        }
        
        fmt.Printf("시도 %d 실패, %v 후 재시도: %v\n", attempt, nextDelay, err)
        
        select {
        case <-time.After(nextDelay):
            delay = nextDelay
        case <-ctx.Done():
            return ctx.Err()
        }
    }
}
```

## 멱등성

### 멱등성 연산

```go
package main

import (
    "crypto/md5"
    "encoding/hex"
    "fmt"
    "time"
)

type IdempotentKey string

type IdempotentOperation struct {
    Key       IdempotentKey
    Result    interface{}
    Timestamp time.Time
    TTL       time.Duration
}

type IdempotencyStore interface {
    Get(key IdempotentKey) (*IdempotentOperation, bool)
    Set(key IdempotentKey, op *IdempotentOperation) error
}

type InMemoryStore struct {
    operations map[IdempotentKey]*IdempotentOperation
}

func NewInMemoryStore() *InMemoryStore {
    return &InMemoryStore{
        operations: make(map[IdempotentKey]*IdempotentOperation),
    }
}

func (s *InMemoryStore) Get(key IdempotentKey) (*IdempotentOperation, bool) {
    op, exists := s.operations[key]
    if !exists {
        return nil, false
    }
    
    // TTL 확인
    if time.Since(op.Timestamp) > op.TTL {
        delete(s.operations, key)
        return nil, false
    }
    
    return op, true
}

func (s *InMemoryStore) Set(key IdempotentKey, op *IdempotentOperation) error {
    s.operations[key] = op
    return nil
}

// 요청에서 멱등성 키 생성
func GenerateIdempotentKey(userID, operation string, params map[string]interface{}) IdempotentKey {
    data := fmt.Sprintf("%s:%s:%v", userID, operation, params)
    hash := md5.Sum([]byte(data))
    return IdempotentKey(hex.EncodeToString(hash[:]))
}

// 멱등성 연산 래퍼
func ExecuteIdempotent(store IdempotencyStore, key IdempotentKey, operation func() (interface{}, error), ttl time.Duration) (interface{}, error) {
    // 연산이 이미 실행되었는지 확인
    if existing, exists := store.Get(key); exists {
        return existing.Result, nil
    }
    
    // 연산 실행
    result, err := operation()
    if err != nil {
        return nil, err
    }
    
    // 결과 저장
    op := &IdempotentOperation{
        Key:       key,
        Result:    result,
        Timestamp: time.Now(),
        TTL:       ttl,
    }
    
    store.Set(key, op)
    return result, nil
}

// 사용 예제
func main() {
    store := NewInMemoryStore()
    
    // 결제 연산 시뮬레이션
    key := GenerateIdempotentKey("user123", "payment", map[string]interface{}{
        "amount": 100,
        "currency": "USD",
    })
    
    result, err := ExecuteIdempotent(store, key, func() (interface{}, error) {
        // 결제 처리 시뮬레이션
        time.Sleep(100 * time.Millisecond)
        return "payment_success_123", nil
    }, 5*time.Minute)
    
    if err != nil {
        fmt.Printf("결제 실패: %v\n", err)
        return
    }
    
    fmt.Printf("결제 결과: %v\n", result)
    
    // 같은 연산 재시도 - 캐시된 결과 반환해야 함
    result2, err := ExecuteIdempotent(store, key, func() (interface{}, error) {
        return "payment_success_456", nil
    }, 5*time.Minute)
    
    fmt.Printf("재시도 결과: %v\n", result2) // 첫 번째 결과와 같아야 함
}
```

## 서킷 브레이커 기초

### 간단한 서킷 브레이커

```go
package main

import (
    "context"
    "fmt"
    "sync"
    "time"
)

type CircuitState int

const (
    StateClosed CircuitState = iota
    StateOpen
    StateHalfOpen
)

type CircuitBreaker struct {
    maxFailures   int
    timeout       time.Duration
    state         CircuitState
    failures      int
    lastFailTime  time.Time
    mutex         sync.RWMutex
}

func NewCircuitBreaker(maxFailures int, timeout time.Duration) *CircuitBreaker {
    return &CircuitBreaker{
        maxFailures: maxFailures,
        timeout:     timeout,
        state:       StateClosed,
    }
}

func (cb *CircuitBreaker) Execute(ctx context.Context, operation func() error) error {
    cb.mutex.Lock()
    defer cb.mutex.Unlock()
    
    // 서킷이 열려있는지 확인
    if cb.state == StateOpen {
        if time.Since(cb.lastFailTime) < cb.timeout {
            return fmt.Errorf("서킷 브레이커가 열려있음")
        }
        // 반열림 상태로 이동
        cb.state = StateHalfOpen
    }
    
    // 연산 실행
    err := operation()
    
    if err != nil {
        cb.failures++
        cb.lastFailTime = time.Now()
        
        if cb.failures >= cb.maxFailures {
            cb.state = StateOpen
        }
        return err
    }
    
    // 성공 - 실패 횟수 초기화하고 서킷 닫기
    cb.failures = 0
    cb.state = StateClosed
    return nil
}

func (cb *CircuitBreaker) State() CircuitState {
    cb.mutex.RLock()
    defer cb.mutex.RUnlock()
    return cb.state
}

// 사용법
func main() {
    cb := NewCircuitBreaker(3, 5*time.Second)
    
    for i := 0; i < 10; i++ {
        err := cb.Execute(context.Background(), func() error {
            // 네트워크 연산 시뮬레이션
            if i < 5 {
                return fmt.Errorf("네트워크 오류")
            }
            return nil
        })
        
        if err != nil {
            fmt.Printf("시도 %d 실패: %v (상태: %v)\n", i+1, err, cb.State())
        } else {
            fmt.Printf("시도 %d 성공 (상태: %v)\n", i+1, cb.State())
        }
        
        time.Sleep(1 * time.Second)
    }
}
```

## 에러 처리

### 네트워크 에러 분류

```go
package main

import (
    "context"
    "errors"
    "fmt"
    "log"
    "net"
    "net/http"
    "time"
)

type NetworkError struct {
    Type    string
    Message string
    Retryable bool
}

func (e NetworkError) Error() string {
    return fmt.Sprintf("%s: %s", e.Type, e.Message)
}

func ClassifyError(err error) NetworkError {
    if err == nil {
        return NetworkError{}
    }
    
    // 컨텍스트 에러
    if errors.Is(err, context.DeadlineExceeded) {
        return NetworkError{
            Type:      "timeout",
            Message:   "연산 타임아웃",
            Retryable: true,
        }
    }
    
    if errors.Is(err, context.Canceled) {
        return NetworkError{
            Type:      "cancelled",
            Message:   "연산이 취소됨",
            Retryable: false,
        }
    }
    
    // 네트워크 에러
    var netErr net.Error
    if errors.As(err, &netErr) {
        if netErr.Timeout() {
            return NetworkError{
                Type:      "timeout",
                Message:   "네트워크 타임아웃",
                Retryable: true,
            }
        }
        
        if netErr.Temporary() {
            return NetworkError{
                Type:      "temporary",
                Message:   "일시적 네트워크 에러",
                Retryable: true,
            }
        }
    }
    
    // HTTP 에러
    var httpErr *http.Response
    if errors.As(err, &httpErr) {
        switch httpErr.StatusCode {
        case 429: // Too Many Requests
            return NetworkError{
                Type:      "rate_limited",
                Message:   "속도 제한",
                Retryable: true,
            }
        case 502, 503, 504: // Server errors
            return NetworkError{
                Type:      "server_error",
                Message:   "서버 에러",
                Retryable: true,
            }
        case 400, 401, 403, 404: // Client errors
            return NetworkError{
                Type:      "client_error",
                Message:   "클라이언트 에러",
                Retryable: false,
            }
        }
    }
    
    // 기본적으로 재시도 가능
    return NetworkError{
        Type:      "unknown",
        Message:   err.Error(),
        Retryable: true,
    }
}

// 에러 분류와 함께 재시도
func RetryWithClassification(ctx context.Context, operation func() error, maxRetries int) error {
    for attempt := 0; attempt < maxRetries; attempt++ {
        err := operation()
        if err == nil {
            return nil
        }
        
        networkErr := ClassifyError(err)
        if !networkErr.Retryable {
            return fmt.Errorf("재시도 불가능한 에러: %w", err)
        }
        
        if attempt == maxRetries-1 {
            return fmt.Errorf("최대 재시도 횟수 초과: %w", err)
        }
        
        // 재시도 전 대기
        select {
        case <-time.After(time.Duration(attempt+1) * time.Second):
        case <-ctx.Done():
            return ctx.Err()
        }
    }
    
    return nil
}
```

## 모범 사례

### 1. 항상 컨텍스트 사용

```go
func NetworkOperation(ctx context.Context, url string) error {
    // 항상 호출 체인을 통해 컨텍스트 전달
    req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
    if err != nil {
        return err
    }
    
    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        return err
    }
    defer resp.Body.Close()
    
    return nil
}
```

### 2. 우아한 종료 구현

```go
func GracefulShutdown(server *http.Server, timeout time.Duration) {
    ctx, cancel := context.WithTimeout(context.Background(), timeout)
    defer cancel()
    
    if err := server.Shutdown(ctx); err != nil {
        log.Printf("서버 종료 에러: %v", err)
    }
}
```

### 3. 모니터링과 로깅

```go
type NetworkMetrics struct {
    RequestCount    int64
    ErrorCount      int64
    TimeoutCount    int64
    AverageLatency  time.Duration
}

func (m *NetworkMetrics) RecordRequest(duration time.Duration, err error) {
    m.RequestCount++
    if err != nil {
        m.ErrorCount++
        if errors.Is(err, context.DeadlineExceeded) {
            m.TimeoutCount++
        }
    }
    
    // 평균 지연 시간 업데이트
    m.AverageLatency = (m.AverageLatency + duration) / 2
}
```

## 추가 작업

- **서비스 메시 통합**: Istio/Linkerd 패턴
- **고급 서킷 브레이커**: Hystrix 스타일 구현
- **로드 밸런싱**: 클라이언트 사이드 로드 밸런싱 전략
- **연결 풀링**: 효율적인 연결 관리
- **관측 가능성**: 분산 추적 및 메트릭

## 결론

Go에서 안정적인 네트워크 프로그래밍은 이러한 기본 패턴들을 이해하는 것이 필요합니다. 적절한 타임아웃, 지능적인 재시도 전략, 멱등성 연산을 구현함으로써 네트워크 실패를 우아하게 처리하는 견고한 분산 시스템을 구축할 수 있습니다.

핵심은 이러한 기본 패턴들로 시작하여 시스템의 요구사항이 더 복잡해짐에 따라 접근 방식을 발전시키는 것입니다.
