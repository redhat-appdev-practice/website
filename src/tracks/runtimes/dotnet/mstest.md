---
title: Create Unit Testing Project With MSTest
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
- kubernetes
- openshift
---

## Video

<iframe width="560" height="315" src="https://www.youtube.com/embed/ZfCH-FsoPl0" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## Setting Up For Unit Testing With [MSTest](https://docs.microsoft.com/en-us/dotnet/core/testing/unit-testing-with-mstest)

The stubbed project created by OpenAPI Generator has given us enough code so that we can write tests which reference the various controllers. One issue which developers often struggle with while practicing Test-Driven Development is that you cannot write a test for code which doesn't exist in strongly-typed languages, but the generated code allows us to overcome that difficulty.

1. Add a new Tests project to your solution
   ```bash
   cd <solution root>
   dotnet new mstest -o src/RedHat.TodoList.Tests
   ```
1. Change directory to the Tests project and add a reference to the project being tested
   ```bash
   cd src/RedHat.TodoList.Tests
   dotnet add reference ../RedHat.TodoList/RedHat.TodoList.csproj
   ```
1. Install the **Moq** package for mocking objects in tests
   ```bash
   dotnet add package Moq
   ```
1. From this point forward, we will attempt to write tests first and then implement our code to satisfy those tests.
