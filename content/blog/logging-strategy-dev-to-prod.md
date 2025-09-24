---
title: "Logging strategy that scales from dev to prod"
date: 2025-01-15T00:00:00Z
draft: false
tags: ["logging", "observability", "devops", "go", "opensearch", "elk"]
categories: ["Backend", "DevOps"]
description: "A comprehensive guide to building a logging strategy that scales from development to production, covering structured logging, rotation, and centralized collection with OpenSearch/ELK."
---

## TL;DR

Building a robust logging strategy requires structured logging, proper level management, rotation policies, and centralized collection. This guide covers everything from JSON schema design to OpenSearch integration, with practical examples and performance considerations for Go applications.

## Context

In modern distributed systems, logging is more than just debugging output—it's a critical component of observability. As applications scale from development to production, logging strategies must evolve to handle increased volume, complexity, and operational requirements.

## The Problem

Most applications start with simple `fmt.Println` or basic logging, but this approach breaks down in production:

- **Unstructured logs** are hard to parse and search
- **Inconsistent log levels** make filtering difficult
- **No rotation strategy** leads to disk space issues
- **Missing context** makes debugging distributed systems nearly impossible
- **Performance impact** from synchronous logging

## Logging Schema

### Structured JSON Logging

The foundation of scalable logging is structured data. Here's a recommended schema:

```json
{
  "timestamp": "2025-01-15T10:30:45.123Z",
  "level": "INFO",
  "service": "user-service",
  "version": "1.2.3",
  "trace_id": "abc123-def456",
  "span_id": "def456-ghi789",
  "message": "User login successful",
  "user_id": "user_123",
  "ip_address": "192.168.1.100",
  "duration_ms": 45,
  "metadata": {
    "request_id": "req_789",
    "session_id": "sess_456"
  }
}
```

### Go Implementation

```go
package main

import (
    "encoding/json"
    "log"
    "os"
    "time"
)

type LogEntry struct {
    Timestamp string                 `json:"timestamp"`
    Level     string                 `json:"level"`
    Service   string                 `json:"service"`
    Version   string                 `json:"version"`
    TraceID   string                 `json:"trace_id,omitempty"`
    SpanID    string                 `json:"span_id,omitempty"`
    Message   string                 `json:"message"`
    UserID    string                 `json:"user_id,omitempty"`
    IPAddress string                 `json:"ip_address,omitempty"`
    Duration  int64                  `json:"duration_ms,omitempty"`
    Metadata  map[string]interface{} `json:"metadata,omitempty"`
}

type Logger struct {
    service string
    version string
}

func NewLogger(service, version string) *Logger {
    return &Logger{
        service: service,
        version: version,
    }
}

func (l *Logger) Info(message string, fields map[string]interface{}) {
    l.log("INFO", message, fields)
}

func (l *Logger) Error(message string, err error, fields map[string]interface{}) {
    if fields == nil {
        fields = make(map[string]interface{})
    }
    fields["error"] = err.Error()
    l.log("ERROR", message, fields)
}

func (l *Logger) log(level, message string, fields map[string]interface{}) {
    entry := LogEntry{
        Timestamp: time.Now().UTC().Format(time.RFC3339Nano),
        Level:     level,
        Service:   l.service,
        Version:   l.version,
        Message:   message,
        Metadata:  fields,
    }
    
    json.NewEncoder(os.Stdout).Encode(entry)
}
```

## Log Levels Strategy

### Development vs Production

**Development:**
- `DEBUG`: Detailed execution flow
- `INFO`: General application flow
- `WARN`: Potential issues
- `ERROR`: Actual errors

**Production:**
- `INFO`: Key business events
- `WARN`: Issues that don't break functionality
- `ERROR`: Errors that need attention
- `FATAL`: System-breaking errors

### Level Configuration

```go
type LogLevel int

const (
    DEBUG LogLevel = iota
    INFO
    WARN
    ERROR
    FATAL
)

func (l *Logger) shouldLog(level LogLevel) bool {
    envLevel := os.Getenv("LOG_LEVEL")
    switch envLevel {
    case "DEBUG":
        return level >= DEBUG
    case "INFO":
        return level >= INFO
    case "WARN":
        return level >= WARN
    case "ERROR":
        return level >= ERROR
    case "FATAL":
        return level >= FATAL
    default:
        return level >= INFO
    }
}
```

## Log Rotation

### File-based Rotation

```go
package main

import (
    "log"
    "os"
    "path/filepath"
    "time"
)

type RotatingLogger struct {
    filename string
    maxSize  int64
    maxAge   time.Duration
    file     *os.File
}

func NewRotatingLogger(filename string, maxSize int64, maxAge time.Duration) *RotatingLogger {
    return &RotatingLogger{
        filename: filename,
        maxSize:  maxSize,
        maxAge:   maxAge,
    }
}

func (rl *RotatingLogger) Write(p []byte) (n int, err error) {
    if rl.shouldRotate() {
        rl.rotate()
    }
    return rl.file.Write(p)
}

func (rl *RotatingLogger) shouldRotate() bool {
    if rl.file == nil {
        return true
    }
    
    stat, err := rl.file.Stat()
    if err != nil {
        return true
    }
    
    return stat.Size() > rl.maxSize
}

func (rl *RotatingLogger) rotate() error {
    if rl.file != nil {
        rl.file.Close()
    }
    
    // Move current file to timestamped backup
    timestamp := time.Now().Format("2006-01-02-15-04-05")
    backupName := rl.filename + "." + timestamp
    
    if _, err := os.Stat(rl.filename); err == nil {
        os.Rename(rl.filename, backupName)
    }
    
    // Create new file
    file, err := os.OpenFile(rl.filename, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0644)
    if err != nil {
        return err
    }
    
    rl.file = file
    return nil
}
```

## Shipping to OpenSearch/ELK

### Filebeat Configuration

```yaml
# filebeat.yml
filebeat.inputs:
- type: log
  enabled: true
  paths:
    - /var/log/app/*.log
  fields:
    service: user-service
    environment: production
  fields_under_root: true
  json.keys_under_root: true
  json.add_error_key: true

output.elasticsearch:
  hosts: ["opensearch:9200"]
  index: "logs-%{+yyyy.MM.dd}"

processors:
- add_host_metadata:
    when.not.contains.tags: forwarded
- add_cloud_metadata: ~
```

### Logstash Pipeline

```ruby
# logstash.conf
input {
  beats {
    port => 5044
  }
}

filter {
  if [fields][service] {
    mutate {
      add_field => { "service" => "%{[fields][service]}" }
    }
  }
  
  if [fields][environment] {
    mutate {
      add_field => { "environment" => "%{[fields][environment]}" }
    }
  }
  
  date {
    match => [ "timestamp", "ISO8601" ]
  }
}

output {
  opensearch {
    hosts => ["opensearch:9200"]
    index => "logs-%{+YYYY.MM.dd}"
  }
}
```

## Performance Considerations

### Asynchronous Logging

```go
package main

import (
    "sync"
    "time"
)

type AsyncLogger struct {
    entries chan LogEntry
    wg      sync.WaitGroup
    done    chan struct{}
}

func NewAsyncLogger(bufferSize int) *AsyncLogger {
    al := &AsyncLogger{
        entries: make(chan LogEntry, bufferSize),
        done:    make(chan struct{}),
    }
    
    al.wg.Add(1)
    go al.worker()
    
    return al
}

func (al *AsyncLogger) worker() {
    defer al.wg.Done()
    
    for {
        select {
        case entry := <-al.entries:
            al.writeEntry(entry)
        case <-al.done:
            // Flush remaining entries
            for {
                select {
                case entry := <-al.entries:
                    al.writeEntry(entry)
                default:
                    return
                }
            }
        }
    }
}

func (al *AsyncLogger) Log(entry LogEntry) {
    select {
    case al.entries <- entry:
    default:
        // Buffer full, drop log entry
        // In production, consider alerting
    }
}

func (al *AsyncLogger) writeEntry(entry LogEntry) {
    // Implementation for writing log entry
    // This would typically write to file or send to log collector
}

func (al *AsyncLogger) Close() {
    close(al.done)
    al.wg.Wait()
}
```

### Memory Management

```go
// Log entry pooling to reduce GC pressure
var entryPool = sync.Pool{
    New: func() interface{} {
        return &LogEntry{
            Metadata: make(map[string]interface{}),
        }
    },
}

func (l *Logger) getEntry() *LogEntry {
    entry := entryPool.Get().(*LogEntry)
    entry.reset()
    return entry
}

func (l *Logger) putEntry(entry *LogEntry) {
    entryPool.Put(entry)
}

func (e *LogEntry) reset() {
    e.Timestamp = ""
    e.Level = ""
    e.Service = ""
    e.Version = ""
    e.TraceID = ""
    e.SpanID = ""
    e.Message = ""
    e.UserID = ""
    e.IPAddress = ""
    e.Duration = 0
    
    // Clear metadata map
    for k := range e.Metadata {
        delete(e.Metadata, k)
    }
}
```

## Best Practices

### 1. Sensitive Data Masking

```go
func maskSensitiveData(data map[string]interface{}) map[string]interface{} {
    sensitive := []string{"password", "token", "secret", "key"}
    masked := make(map[string]interface{})
    
    for k, v := range data {
        if contains(sensitive, strings.ToLower(k)) {
            masked[k] = "***MASKED***"
        } else {
            masked[k] = v
        }
    }
    
    return masked
}

func contains(slice []string, item string) bool {
    for _, s := range slice {
        if s == item {
            return true
        }
    }
    return false
}
```

### 2. Context Propagation

```go
func (c *Context) WithTraceID(traceID string) *Context {
    return &Context{
        traceID: traceID,
        spanID:  generateSpanID(),
        logger:  c.logger.WithFields(map[string]interface{}{
            "trace_id": traceID,
            "span_id":  c.spanID,
        }),
    }
}
```

### 3. Structured Error Logging

```go
func (l *Logger) LogError(err error, context map[string]interface{}) {
    entry := l.getEntry()
    defer l.putEntry(entry)
    
    entry.Level = "ERROR"
    entry.Message = err.Error()
    entry.Metadata = context
    entry.Metadata["error_type"] = reflect.TypeOf(err).String()
    
    l.log("ERROR", entry.Message, entry.Metadata)
}
```

## Monitoring and Alerting

### OpenSearch Dashboards

Create dashboards to monitor:
- Error rates by service
- Response time percentiles
- Log volume trends
- Critical error patterns

### Alert Rules

```yaml
# alerting rules
- alert: HighErrorRate
  expr: rate(logs{level="ERROR"}[5m]) > 0.1
  for: 2m
  labels:
    severity: warning
  annotations:
    summary: "High error rate detected"

- alert: LogVolumeSpike
  expr: rate(logs[5m]) > 1000
  for: 1m
  labels:
    severity: critical
  annotations:
    summary: "Log volume spike detected"
```

## Further Work

- **Distributed Tracing**: Integrate with Jaeger or Zipkin
- **Metrics Integration**: Combine logs with Prometheus metrics
- **AI-powered Analysis**: Implement anomaly detection
- **Automated Remediation**: Self-healing based on log patterns
- **Compliance**: GDPR/PCI-DSS compliant logging

## Conclusion

A well-designed logging strategy is essential for maintaining observability in production systems. By implementing structured logging, proper rotation, and centralized collection, you can build a foundation for effective debugging, monitoring, and alerting.

The key is to start simple and evolve your logging strategy as your system grows, always keeping performance and operational requirements in mind.
