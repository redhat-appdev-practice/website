---
title: Generate A New ASP.NETCore WebAPI Using OpenAPI Generator
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

## Bootstrapping A Project Using OpenAPI Generator

1. Save **[THIS](/support_docs/todo_openapi.yaml)** OpenAPI Specification somewhere you will be able to easily access it from the command-line
1. Clone our starter repository from GitHub:
   ```bash
   git clone --recursive https://github.com/redhat-appdev-practice/runtimes-dotnet-ef6-openapi.git
   ```
   * This starter repo will have:
     * OpenAPI Specification for our Todo API
     * A script to launch OpenAPI Generator
     * Customized Generator Templates for ASP.NETCore 3.1 Development
1. Change into the cloned directory (which will from here on be referred to as &lt;solution root&gt;) and generate the solution
   ```bash
   ./generate.sh
   ```
1. Add some of the generated classes to `.gitignore`
   ```
   **/Controllers/**
   **/Attributes/**
   **/Authentication/**
   **/Converters/**
   **/Filters/**
   **/Models/**
   **/OpenApi/**
   **/wwwroot/**
   ```
   * The code created by OpenAPI Generator should never be added to source control. It is meant to be re-generated at *build time*, **every time**. Some files, such as `Startup.cs` or `Program.cs` will probably end up being modified by us, the developers, and as such should be added to the `.openapi-generator-ignore` and never re-generated.
1. Open the newly created project in your IDE
1. Run a restore on the project
   ```bash
   dotnet restore
   ```
1. Create a new directory under the `RedHat.TodoList` project called `ControllersImpl`
   * This is where our implementation code which extends the abstract generated code will live.
1. Create a new class which extends the `DefaultApiController` class and name it `DefaultApiControllerImpl`
   * In your IDE, ensure that the new class stubs out the required abstract methods as shown below:
     ```csharp
     public class DefaultApiControllerImpl: DefaultApiController
     {
        public override ActionResult CreateTodo(Todo todo)
        {
            throw new System.NotImplementedException();
        }

        public override ActionResult DeleteTodo(Guid todoId)
        {
            throw new System.NotImplementedException();
        }

        public override ActionResult<Todo> GetTodo(Guid todoId)
        {
            throw new System.NotImplementedException();
        }

        public override ActionResult<List<Todo>> Gettodos()
        {
            throw new System.NotImplementedException();
        }

        public override ActionResult UpdateTodo(Guid todoId, Todo todo)
        {
            throw new System.NotImplementedException();
        }
     }
     ```
2. At this point, you can build and run the service and see the Swagger/OpenAPI Docs
   ```bash
   cd src/RedHat.TodoList
   dotnet run
   ```
   * Open A Browser and point it to http://localhost:8080/
   * You should see the Swagger/OpenAPI Documentation, but any attempt to use the API should return a `NotImplementedException`.
