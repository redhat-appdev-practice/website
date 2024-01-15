---
title: Generate a new Vert.x application using OpenAPI Generator
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
## Preparing Your Development Environment

1. Install the [.NET CLI](https://dotnet.microsoft.com/download)
   * Red Hat Enterprise Linux: 
      ```
      yum install java-11-openjdk-headless maven
      ```
   * Fedora: 
      ```
      dnf install java-11-openjdk-headless maven
      ```
   * Debian/Ubuntu: 
      ```
      apt install openjdk-11-jdk-headless maven
      ```
1. Install [Docker](https://www.docker.com/)
1. Install [docker-compose](https://docs.docker.com/compose/)
1. Install your preferred IDE for Java development
   * [Visual Studio Code](https://code.visualstudio.com/)
   * [JetBrains IntelliJ](https://www.jetbrains.com/idea/download/)
   * [NetBeans](https://netbeans.apache.org/)
   * [CodeReady Studio/Eclipse](https://developers.redhat.com/products/codeready-studio/download)
1. Install [OpenAPI Generator](https://openapi-generator.tech/) Version 5.1.1
   * `npm install -g @openapitools/openapi-generator-cli`
1. **[OPTIONAL]** A Kubernetes Environment To Experiment With
   * Install [Minikube](https://minikube.sigs.k8s.io/docs/start/)
     * Uses VMs or Docker to create a single node Kubernetes cluster