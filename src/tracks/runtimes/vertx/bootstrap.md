---
title: Generate a new Vert.x application using OpenAPI Generator
initialOpenGroupIndex: -1
collapsable: true
tags:
- java
- graalvm
- graal
- native-image
- vertx
- reactive
- openapi
- api
- rest
- openapi-generator
- contract-first
- unit testing
- testing
- junit
- vertx-unit
- mocking
- hibernate
- jooq
- maven
- archetype
---

## Bootstrapping A Project Using OpenAPI Generator

1. In order to most effectively use OpenAPI and Contract-First methods, we will need to create a Maven Multi-module project. There will be a parent POM and two or three child projects depending on the database technologies you choose to use.
   * Main Vert.x Application Project (TodoApp)
   * Database Entities (Useful for Hibernate Reactive and generated from OpenAPI Contract)
   * [jOOQ](http://www.jooq.org/) query DSL (Generated from entities) (Optional)
1. 