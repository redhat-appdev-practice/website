---
title: .NET/C# Single-Page Applications With EntityFramework and ASP.NET
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
- xUnit
- nUnit
---

## Preparing Your Development Environment

1. Install the .NET CLI
   * Red Hat Enterprise Linux: `yum install dotnet-sdk-3.1`
   * Fedora: `dnf install dotnet-sdk-3.1`
   * Debian/Ubuntu: `apt install dotnet-sdk-3.1`
1. Install [Docker](https://www.docker.com/) or [Podman](https://podman.io/)
1. Install [docker-compose](https://docs.docker.com/compose/) or [podman-compose](https://github.com/containers/podman-compose)
1. Install your preferred IDE for C#/.NET development
   * [Visual Studio Code](https://code.visualstudio.com/)
   * [JetBrains Rider](https://www.jetbrains.com/rider/)
   * [Visual Studio](https://visualstudio.microsoft.com/)
1. Install [OpenAPI Generator](https://openapi-generator.tech/) Version 5.0.0 (Currently in Beta as of Oct. 2020)
   * `npm install -g @openapitools/openapi-generator-cli@cli-5.0.0-beta2`

## Bootstrapping A Project Using OpenAPI Generator

1. Save **[THIS](/support_docs/todo_openapi.yaml)** OpenAPI Specification somewhere you will be able to easily access it from the command-line
1. Clone our customized ASP.NET Templates from GitHub:
   ```bash
   git clone https://github.com/redhat-appdev-practice/openapi-generator-aspnetcore3-templates.git
   ```
1. Using OpenAPI Generator, create a new .NET/WebAPI Project
   ```bash
   openapi-generator generate -g aspnetcore \
      -t /path/to/openapi-generator-aspnetcore3-templates \
      --additional-properties aspnetCoreVersion=3.1 \
      --additional-properties classModifier=abstract \
      --additional-properties operationModifier=abstract \
      --additional-properties packageName=Com.RedHat.TodoList \
      --additional-properties packageTitle=TodoList \
      --additional-properties useFrameworkReference=true \
      -i todo_openapi.yaml \
      -o /path/to/solution
   ```
1. Add generated classes to `.gitignore`
   ```
   src/Com.RedHat.TodoList/Controllers/**
   src/Com.RedHat.TodoList/Attributes/**
   src/Com.RedHat.TodoList/Authentication/**
   src/Com.RedHat.TodoList/Converters/**
   src/Com.RedHat.TodoList/Filters/**
   src/Com.RedHat.TodoList/Models/**
   src/Com.RedHat.TodoList/OpenApi/**
   src/Com.RedHat.TodoList/wwwroot/**
   ```
   * The code created by OpenAPI Generator should never be added to source control. It is meant to be re-generated at build time, every time. Some files, such as `Startup.cs` or `Program.cs` will probably end up being modified by us, the developers, and as such should be added to the `.openapi-generator-ignore` and never re-generated.
1. Open the newly created project in your IDE
1. Run a restore on the project
   ```bash
   dotnet restore
   ```
1. Create a new directory under the `Com.RedHat.TodoList` project called `ControllerImpl`
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

        public override ActionResult DeleteTodo(long todoId)
        {
            throw new System.NotImplementedException();
        }

        public override ActionResult<Todo> GetTodo(long todoId)
        {
            throw new System.NotImplementedException();
        }

        public override ActionResult<List<Todo>> Gettodos()
        {
            throw new System.NotImplementedException();
        }

        public override ActionResult UpdateTodo(long todoId, Todo todo)
        {
            throw new System.NotImplementedException();
        }
     }
     ```
2. At this point, you can build and run the service and see the Swagger/OpenAPI Docs
   ```bash
   cd src/Com.RedHat.TodoList
   dotnet run
   ```
   * Open A Browser and point it to http://localhost:8080/
   * You should see the Swagger/OpenAPI Documentation, but any attempt to use the API should return a `NotImplementedException`.

## Setting Up For Unit Testing With [MSTest](https://docs.microsoft.com/en-us/dotnet/core/testing/unit-testing-with-mstest)

The stubbed project created by OpenAPI Generator has given us enough code so that we can write tests which reference the various controllers. One issue which developers often struggle with while practicing Test-Driven Development is that you cannot write a test for code which doesn't exist in strongly-typed languages, but the generated code allows us to overcome that difficulty.

1. Add a new Tests project to your solution
   ```bash
   dotnet new mstest -o src/Com.Redhat.TodoList.Tests
   ```
1. Change directory to the Tests project and add a reference to the project being tested
   ```bash
   cd src/Com.Redhat.TodoList.Tests
   dotnet add reference ../Com.Redhat.TodoList/Com.Redhat.TodoList.csproj
   ```
1. Add TestHost package
   ```bash
   dotnet add package Microsoft.AspNetCore.TestHost
   ```
2. You can now create your first test as `src/Com.RedHat.Todo.Tests/Controllers/DefaultApiTests.cs`
   ```csharp
   using Microsoft.VisualStudio.TestTools.UnitTesting;
   using Com.RedHat.Todo.Controllers.DefaultApi;

   namespace Com.RedHat.Todo.Tests.Controllers
   {
      [TestClass]
      public class DefaultApiTests
      {
         private TestServer _server;
         private HttpClient _client;

         public DefaultApiTests()
         {
            _server = new TestServer(new WebHostBuilder()
                           .UseStartup<Startup>());
            _client = _server.CreateClient();
         }

         [TestMethod]
         public async Task GetTodo()
         {
            var response = await _client.GetAsync("/api/v1/todos");
            response.EnsureSuccessStatusCode();

            var result = await response.Content.ReadAsStringAsync();
            var todos = JsonConvert.DeserializeObject<List<Todo>>(result);

            Assert.AreEqual(5, todos.length());
         }
      }
   }
   ```

## Configuration Settings



## Database Access/Data Persistence



## Secure Coding Practices



## Implementing Feature Flags



## Logging Best Practices



## Distributed Tracing


