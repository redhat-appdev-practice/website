---
title: Getting Started - Pre-requisistes
initialOpenGroupIndex: -1
collapsable: true
tags:
- java
- jdk
- vertx
- rx
- rxjava
- rest
- jooq
- streaming
- webapi
- postgresql
- cloud-native
- cloudnative
- appdev
- application development
- containers
- kubernetes
- openshift
- helm
- openapi
- openapi generator
- contract-first
- contract
- swagger
---

## Overview
In this track we will show you how to leveral Contract-First development with [Eclipse Vert.x](https://vertx.io/) to quickly and efficiently create high quality cloud-native applications.

## Preparing Your Development Environment

1. Install the [Java Development Kit 11](https://openjdk.java.net/)
   * Red Hat Enterprise Linux: 
      ```
      yum install java-11-openjdk-headless
      ```
   * Fedora: 
      ```
      dnf install java-11-openjdk-headless
      ```
   * Debian/Ubuntu: 
      ```
      apt install openjdk-11-jdk-headless
      ```
1. Install [Apache Maven](https://maven.apache.org/)
   * Red Hat Enterprise Linux: 
      ```
      yum install maven
      ```
   * Fedora: 
      ```
      dnf install maven
      ```
   * Debian/Ubuntu: 
      ```
      apt install maven
      ```
1. Install [Docker](https://www.docker.com/)
1. Install [docker-compose](https://docs.docker.com/compose/)
1. Install your preferred IDE for Java development
   * [Visual Studio Code](https://code.visualstudio.com/)
   * [JetBrains IDEA](https://www.jetbrains.com/IDEA/)
   * [Apache NetBeans](https://netbeans.apache.org/)
   * [Eclipse](https://www.eclipse.org/eclipseide/)
1. Install [OpenAPI Generator](https://openapi-generator.tech/) Version 5.0.0 (Currently in Beta as of Oct. 2020)
   * `npm install -g @openapitools/openapi-generator-cli@cli-5.0.0-beta2`
1. **[OPTIONAL]** A Kubernetes Environment To Experiment With
   * Install [Minikube](https://minikube.sigs.k8s.io/docs/start/)
     * Uses VMs or Docker to create a single node Kubernetes cluster