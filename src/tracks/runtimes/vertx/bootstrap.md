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
---

## Bootstrapping A Project Using OpenAPI Generator

1. In order to most effectively use OpenAPI and Contract-First methods, we will need to create a Maven Multi-module project. There will be a parent POM and two or three child projects depending on the database technologies you choose to use.
   * Main Vert.x Application Project (TodoApp)
   * Database Entities (Useful for Hibernate Reactive and generated from OpenAPI Contract)
   * [jOOQ](http://www.jooq.org/) query DSL (Generated from entities) (Optional)
1. Create the parent project using Maven Archetypes
   * In the directory where you would like to create the project, run 
   ```bash
   mvn archetype:generate \
       -DgroupId=com.redhat.consulting.runtimes.vertx \
       -DartifactId=todo \
       -DarchetypeArtifactId=maven-archetype-quickstart \
       -DarchetypeVersion=1.4 \
       -DinteractiveMode=false
   ```
   * Delete the `src` directory in this new project
   * Edit the `pom.xml` and remove the *dependencies* section
   * Edit the `pom.xml` and remove the *build* section
   * Edit the `pom.xml` and add an empty *modules* section
   * Edit the `pom.xml` and add `<packaging>pom</packaging>` after the version
1. Use the [Vert.x Starter](https://start.vertx.io/) to generate a new Maven Vert.x Project
   * ![Vert.x Starter Form](/vertx_starter_form_selections.png)
   * Choose the following dependencies:
     * Web API Contract
     * Reactive PostgreSQL client
     * Vert.x Health Check
     * Infinispan Cluster Manager
     * OAuth2
     * Tracing using OpenTracing
     * Vert.x Config
   * Click on "Generate Project"
   * Download and extract the project as a subdirectory named `todo-app` inside of the parent project created earlier
1. In the *parent* project directory we created at the end of step 1 above, add the new module to the `pom.xml`
   ```xml
   <modules>
     <module>todo-app</module>
   </modules>
   ```
1. Edit the `pom.xml` in the `todo-app` module to make it refer to the parent project
   ```xml
   <parent>
     <groupId>com.redhat.consulting.runtimes.vertx</groupId>
     <artifactId>todo</artifactId>
     <version>1.0.0-SNAPSHOT</version>
     <relativePath>../</relativePath>
   </parent>
   <artifactId>todo-app</artifactId>
   <version>1.0.0-SNAPSHOT</version>
   ```
