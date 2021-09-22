---
title: Add Distributed Tracing With OpenTracing
initialOpenGroupIndex: -1
collapsable: true
tags:
- java
- graalvm
- graal
- native-image
- quarkus
- panache
- openapi
- api
- rest
- openapi-generator
- contract-first
- jaeger
- tracing
- open tracing
---

## Implementing Distributed Tracing With Jaeger

1. Add the OpenTracing extension:
    ```bash
    ./mvnw quarkus:add-extensions -Dextensions=quarkus-smallrye-opentracing
    ```
1. Add the configuration to `application.properties`
    ```
    quarkus.jaeger.service-name=todoservice   
    quarkus.jaeger.sampler-type=const       ## Sampling type
    quarkus.jaeger.sampler-param=5          ## Sampling rate, in this case every fifth request is sampled
    quarkus.log.console.format=%d{HH:mm:ss} %-5p traceId=%X{traceId}, parentId=%X{parentId}, spanId=%X{spanId}, sampled=%X{sampled} [%c{2.}] (%t) %s%e%n 
    # quarkus.jaeger.endpoint=http://jaeger-collector:12345/api/traces
    ```
    * This will result in all REST requests having tracing implemented
1. Addition tracing extensions for JDBC, Kafka, and MongoDB are also availabe and you can find documentation [HERE](https://quarkus.io/guides/opentracing)