---
title: Generate a new Quarkus application using OpenAPI Generator
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

## Bootstrapping A Project Using OpenAPI Generator

In order to simplify adopting a Contract-First API Development approach, we have created a series of [Maven Archetypes](https://maven.apache.org/guides/introduction/introduction-to-archetypes.html) which make initializing new projects extremely quick and simple. These archetypes are already published to [Maven Central](https://search.maven.org/search?q=g:com.redhat.consulting%20a:openapi*archetype)

1. Download the [OpenAPI](https://swagger.io/specification/) specification file for our example project from <a href="https://raw.githubusercontent.com/redhat-appdev-practice/todo-api/trunk/openapi.yml" target="_blank">HERE</a>
1. Use Maven to create a new project using the [Quarkus Archetype](https://github.com/redhat-appdev-practice/openapi-quarkus-archetype) and the downloaded OpenAPI Specification
    ```bash
    mvn archetype:generate -B -DarchetypeGroupId=com.redhat.consulting \
                           -DarchetypeArtifactId=openapi-quarkus-archetype \
                           -DarchetypeVersion=1.0.5 \
                           -Dpackage=com.redhat.runtimes \
                           -DgroupId=com.redhat.runtimes.quarkus \
                           -DartifactId=quarkus-todo \
                           -Dversion=0.0.1-SNAPSHOT \
                           -Dinteractive=false \
                           -Dquarkus_orm_selection=hibernate-orm \
                           -Dopenapi_app_contract_uri=/path/to/openapi.yml
    ```
    ::: info
    
    :::