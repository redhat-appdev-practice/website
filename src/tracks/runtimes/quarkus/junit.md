---
title: Configure Maven For JUnit Testing
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

# JUnit Testing

The stubbed project created by OpenAPI Generator has given us enough code so that we can write tests which reference the various controllers. One issue which developers often struggle with while practicing Test-Driven Development is that you cannot write a test for code which doesn't exist in strongly-typed languages, but the generated code allows us to overcome that difficulty.

This tutorial will be using JUnit 5 and the Jupyter API to write tests and we will leverage CDI for dependency injection.

### Setting Up For JUnit 5 Testing For Quarkus

1. Ensure that the `src/test/java` subdirectory exists in your project
1. Create a new java package `com.redhat.runtimes.api` inside of the `src/test/java` directory
1. That's it! The rest was already configured for us by the Archetype
