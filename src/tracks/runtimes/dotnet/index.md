---
title: Getting Started - Pre-requisistes
initialOpenGroupIndex: -1
collapsable: true
tags:
- dotnet
- .net
- aspdotnet
- asp.net
- csharp
- c#
- openapi
- api
- rest
- openapi-generator
- contract-first
- unit testing
- testing
- mstest
- mocking
- moq
- entityframework
- entityframeworkcores
---

## Video

<iframe width="560" height="315" src="https://www.youtube.com/embed/NsEDyHdysK0" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## Preparing Your Development Environment

1. Install the [.NET CLI](https://dotnet.microsoft.com/download)
   * Red Hat Enterprise Linux: 
      ```
      yum install dotnet-sdk-3.1
      ```
   * Fedora: 
      ```
      dnf install dotnet-sdk-3.1
      ```
   * Debian/Ubuntu: 
      ```
      apt install dotnet-sdk-3.1
      ```
1. Install EntityFramework Tools For .NETCore
   ```
   dotnet tool install --global dotnet-ef
   ```
1. Install [Docker](https://www.docker.com/)
1. Install [docker-compose](https://docs.docker.com/compose/)
1. Install your preferred IDE for C#/.NET development
   * [Visual Studio Code](https://code.visualstudio.com/)
   * [JetBrains Rider](https://www.jetbrains.com/rider/)
   * [Visual Studio](https://visualstudio.microsoft.com/)
1. Install [OpenAPI Generator](https://openapi-generator.tech/) Version 5.0.0 (Currently in Beta as of Oct. 2020)
   * `npm install -g @openapitools/openapi-generator-cli@cli-5.0.0-beta2`
1. **[OPTIONAL]** A Kubernetes Environment To Experiment With
   * Install [Minikube](https://minikube.sigs.k8s.io/docs/start/)
     * Uses VMs or Docker to create a single node Kubernetes cluster


