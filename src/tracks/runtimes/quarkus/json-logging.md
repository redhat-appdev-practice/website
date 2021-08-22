---
title: Configure JSON Logging
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
- unit testing
- testing
- junit
- mocking
- panache
- hibernate
---

## JSON Logging From Quarkus

In order to work best with log aggregators like EFK Stack or Splunk, you want to output your logs in JSON format for easier indexing.

1. Add the JSON Logging module to the Maven `pom.xml` file
    ```xml
    <dependency>
      <groupId>io.quarkus</groupId>
      <artifactId>quarkus-logging-json</artifactId>
    </dependency>
    ```
1. Add configuration settings to the `application.properties` file.
    ```
    quarkus.log.console.json=false
    %prod.quarkus.log.console.json=true
    ```
1. That's it! We are done here!