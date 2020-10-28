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
- c#a
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
1. [OPTIONAL] One Of These Kubernetes Environment To Experiment With
   * Install [Minikube](https://minikube.sigs.k8s.io/docs/start/)
     * Uses VMs to create a single node Kubernetes cluster
   * Install [KInD](https://kind.sigs.k8s.io/)
     * **K**ubneretes **In** **D**ocker

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
1. Change into the cloned directory (which will from here on be referred to as <solution root>) and generate the solution
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

## Setting Up For Unit Testing With [MSTest](https://docs.microsoft.com/en-us/dotnet/core/testing/unit-testing-with-mstest)

The stubbed project created by OpenAPI Generator has given us enough code so that we can write tests which reference the various controllers. One issue which developers often struggle with while practicing Test-Driven Development is that you cannot write a test for code which doesn't exist in strongly-typed languages, but the generated code allows us to overcome that difficulty.

1. Add a new Tests project to your solution
   ```bash
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

## Database Access/Data Persistence
1. Add the following Nuget dependencies to allow us to start creating our data access layer
   * Npgsql.EntityFrameworkCore.PostgreSQL == 3.1.4
   * Npgsql.EntityFrameworkCore.PostgreSQL.Design == 1.1.0
   * Microsoft.EntityFrameworkCore.Tools == 3.1.4
   * Microsoft.EntityFrameworkCore.Design == 3.1.4
   ```bash
   dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL --version 3.1.4
   dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL.Design --version 1.1.0
   dotnet add package Microsoft.EntityFrameworkCore.Tools --version 3.1.4
   dotnet add package Microsoft.EntityFrameworkCore.Design --version 3.1.4
   ```
1. Create a new directory called `DataAccess` under the `RedHat.TodoList` project
1. Add a new interface `ITodoContext` and class named `TodoListContext` in the `DataAccess` directory
   ```csharp
   using System;
   using System.Collections.Generic;
   using System.Linq;
   using RedHat.TodoList.Models;
   using Microsoft.EntityFrameworkCore;

   namespace RedHat.TodoList.DataAccess
   {

      public interface ITodoContext
      {
         DbSet<Todo> Todos { get; set; }
         List<Todo> GetTodos();
         Todo UpdateTodo(Guid id, Todo data);
         void Delete(Guid id);
         Todo AddTodo(Todo newTodo);
         Todo GetTodo(Guid id);
      }
      
      public partial class TodoListContext:DbContext, ITodoContext
      {
         public TodoListContext(DbContextOptions<TodoListContext> options) : base(options) { }

         public virtual DbSet<Todo> Todos { get; set; }
      }
   }
   ```
1. Create stubbed implementation for the member methods defined in the ITodoContext interface
1. Before we make changes to generated files, we need to ensure that if we run the generator again it will not overwrite our changes. Add the following to the `.openapi-generator-ignore` file in the `<solution root>` directory
   ```
   **/Program.cs
   **/Startup.cs
   **/appsettings.json
   ```
1. Next, we need to add the service to the dependency injection framework of ASP.NET by editing `Startup.cs`
   ```csharp
   // Add framework services.
   services
         .AddDbContext<TodoListContext>(opts =>
            opts.UseNpgsql(Configuration.GetConnectionString("TodoListContext")));
   // Map ITodoContext -> TodoListContext for dependency
   services
         .AddScoped<ITodoContext, TodoListContext>();
   ```
1. Add the connection string to the `appsettings.json` file
   ```json
   {
      "ConnectionStrings": {
         "TodoListContext": "User ID=tododb;Password=tododb;Server=localhost;Port=5432;Database=todo"
      },
      "Logging": {
         "LogLevel": {
            "Default": "Warning"
         }
      },
      "AllowedHosts": "*"
   }
   ```
1. Implement the CRUD operation methods inside of the `TodoListContext` class
   ```csharp
   public Todo UpdateTodo(Guid id, Todo data)
   {
      var todo = Todos.Find(id);
      if (todo == null) throw new ArgumentException($"Unable to find Todo with ID: ${id}");
      todo.Complete = data.Complete;
      todo.Description = data.Description;
      todo.Title = data.Title;
      todo.DueDate = data.DueDate;
      SaveChanges();
      return todo;
   }

   public void Delete(Guid id)
   {
      var todo = Todos.Find(id);
      if (todo == null) throw new ArgumentException($"Unable to find Todo with ID: ${id}");
      Todos.Remove(todo);
      SaveChanges();
   }

   public Todo AddTodo(Todo newTodo)
   {
      Todos.Add(newTodo);
      SaveChanges();
      return newTodo;
   }

   public Todo GetTodo(Guid id)
   {
      var todo = Todos.Find(id);
      if (todo == null) throw new ArgumentException($"Unable to find Todo with ID: ${id}");
      return todo;
   }

   public List<Todo> GetTodos()
   {
      return Todos.ToList();
   }
   ```
1. Start the database container
   ```bash
   docker-compose up tododb
   ```
1. Create the initial database schema migration and apply it
   ```bash
   cd <solution root>/src/RedHat.TodoList
   dotnet ef migrations add InitialCreate
   dotnet ef database update
   ```

## Finish Controller Implementations
1. Add a constructor to `DefaultApiControllerImpl` to inject the DbContext
   ```csharp
   private readonly ITodoContext _dbContext;

   public DefaultApiControllerImpl(ITodoContext dbContext)
   {
      _dbContext = dbContext;
   }
   ```
1. Write a Unit Test for the `GetTodo` method of the `DefaultApiControllerImpl` class
   ```csharp
   using System;
   using Microsoft.VisualStudio.TestTools.UnitTesting;
   using Moq;
   using RedHat.TodoList.ControllersImpl;
   using RedHat.TodoList.DataAccess;
   using RedHat.TodoList.Models;

   namespace RedHat.TodoList.Tests
   {
      [TestClass]
      public class TodoApiTest
      {
         private DefaultApiControllerImpl underTest;
         private Guid testId = Guid.NewGuid();
         private string testTitle = "Test Title";
         private string testDescription = "Test Description";
         private DateTime testDueDate = DateTime.Now;

         [TestInitialize]
         public void TestInit()
         {
               Todo testResult = new Todo
               {
                  Id = testId, Complete = false, Title = testTitle, Description = testDescription, DueDate = testDueDate
               };
               var mock = new Mock<ITodoContext>();
               mock.Setup(ctx => ctx.GetTodo(testId)).Returns(testResult);
               underTest = new DefaultApiControllerImpl(mock.Object);
         }
         
         [TestMethod]
         public void GetTodo()
         {
               var response = underTest.GetTodo(testId);
               Assert.AreEqual(response.Value.Id, testId);
               Assert.AreEqual(response.Value.Title, testTitle);
               Assert.AreEqual(response.Value.Description, testDescription);
               Assert.IsFalse(response.Value.Complete);
         }
      }
   }
   ```
1. Running this test will fail (as expected) because we have not yet implemented the controller method entirely. Also, we will need to Mock the DbContext for the Controller as well.
   ```
   $ dotnet test --filter "FullyQualifiedName=RedHat.TodoList.Tests.TodoApiTest.GetTodo"
   // SNIP //
   Failed GetTodo [14 ms]
   Error Message:
      Test method RedHat.TodoList.Tests.TodoApiTest.GetTodo threw exception: 
   System.NotImplementedException: The method or operation is not implemented.
   Stack Trace:
         at RedHat.TodoList.ControllerImpl.DefaultApiControllerImpl.GetTodo(Guid todoId) in /home/dphillips/Documents/RedHat/Workspace/CNAD_Enablement/dotnet-openapi-todo/src/RedHat.TodoList/ControllerImpl/DefaultApiImpl.cs:line 23
      at RedHat.TodoList.Tests.TodoApiTest.GetTodo() in /home/dphillips/Documents/RedHat/Workspace/CNAD_Enablement/dotnet-openapi-todo/src/RedHat.TodoList.Tests/TodoApiTest.cs:line 26
   ```
1. Now that we have a failing test, we can implement the Controller method and satisfy the test.
   ```csharp
   using System;
   using System.Collections.Generic;
   using RedHat.TodoList.Controllers;
   using RedHat.TodoList.DataAccess;
   using RedHat.TodoList.Models;
   using Microsoft.AspNetCore.Mvc;

   namespace RedHat.TodoList.ControllerImpl
   {
      public class DefaultApiControllerImpl: DefaultApiController
      {
         private ITodoContext dbContext;

         public DefaultApiControllerImpl(ITodoContext dbContext)
         {
               this.dbContext = dbContext;   // Inject the database context
         }

         public override ActionResult<Todo> GetTodo(Guid todoId)
         {
               return _dbContext.GetTodo(todoId); // Use the database context to implement the method
         }
      }
   }
   ```
1. Running the test should now succeed using the Mock DbContext object.
   ```
   $ dotnet test --filter "FullyQualifiedName=RedHat.TodoList.Tests.TodoApiTest.GetTodo"
      Determining projects to restore...
      Restored /home/dphillips/Documents/RedHat/Workspace/CNAD_Enablement/dotnet-openapi-todo/src/RedHat.TodoList.Tests/RedHat.TodoList.Tests.csproj (in 392 ms).
      1 of 2 projects are up-to-date for restore.
      You are using a preview version of .NET. See: https://aka.ms/dotnet-core-preview
      RedHat.TodoList -> /home/dphillips/Documents/RedHat/Workspace/CNAD_Enablement/dotnet-openapi-todo/src/RedHat.TodoList/bin/Debug/netcoreapp3.1/RedHat.TodoList.dll
      RedHat.TodoList.Tests -> /home/dphillips/Documents/RedHat/Workspace/CNAD_Enablement/dotnet-openapi-todo/src/RedHat.TodoList.Tests/bin/Debug/netcoreapp3.1/RedHat.TodoList.Tests.dll
   Test run for /home/dphillips/Documents/RedHat/Workspace/CNAD_Enablement/dotnet-openapi-todo/src/RedHat.TodoList.Tests/bin/Debug/netcoreapp3.1/RedHat.TodoList.Tests.dll (.NETCoreApp,Version=v3.1)
   Microsoft (R) Test Execution Command Line Tool Version 16.8.0
   Copyright (c) Microsoft Corporation.  All rights reserved.

   Starting test execution, please wait...
   A total of 1 test files matched the specified pattern.

   Passed!  - Failed:     0, Passed:     1, Skipped:     0, Total:     1, Duration: 102 ms - /home/dphillips/Documents/RedHat/Workspace/CNAD_Enablement/dotnet-openapi-todo/src/RedHat.TodoList.Tests/bin/Debug/netcoreapp3.1/RedHat.TodoList.Tests.dll (netcoreapp3.1)
   ```
1. Implement the remaining tests, then implement the remaining methods for the controller

## Logging Best Practices

In order to work best with log aggregators like EFK Stack or Splunk, you want to output your logs in JSON format for easier indexing.

1. Add [Serilog.AspNetCore](https://github.com/serilog/serilog-aspnetcore) to your project
   ```bash
   dotnet add package Serilog.AspNetCore
   ```
1. Configure the logger in your `Program.cs`
   ```csharp
   public static IHostBuilder CreateHostBuilder(string[] args) =>
      Host.CreateDefaultBuilder(args
            .ConfigureWebHostDefaults(webBuilder =>
            {
               webBuilder.UseStartup<Startup>()
                        .UseUrls("http://0.0.0.0:8080/");
            });
   ```
1. Enable Request Logging in your `Startup.cs`
   ```csharp
   public void Configure(IApplicationBuilder app, IHostingEnvironment env)
   {
      if (env.IsDevelopment())
      {
            app.UseDeveloperExceptionPage();
      }
      else
      {
            app.UseExceptionHandler("/Home/Error");
      }

      app.UseSerilogRequestLogging(); // <-- Add this line

      // Other app configuration
   ```
1. Initialize your logger instance in your constructor
   ```csharp
   namespace RedHat.TodoList.ControllerImpl
   {
      public class DefaultApiControllerImpl: DefaultApiController
      {
         private readonly ITodoContext _dbContext;
         private readonly ILogger<DefaultApiControllerImpl> _logger;

         public DefaultApiControllerImpl(ILogger<DefaultApiControllerImpl> logger, ITodoContext dbContext)
         {
               _logger = logger ?? throw new ArgumentNullException(nameof(logger));
               _dbContext = dbContext;
         }
   ```
   * **NOTE** - You will need to also update your Unit Test to make the signature match the updated constructor here!!!!
1. Use your logger instance wherever appropriate
   ```csharp
   public override ActionResult<Todo> GetTodo(Guid todoId)
   {
      try
      {
            return this.dbContext.GetTodo(todoId);
      }
      catch (ArgumentException ae)
      {
            _logger.LogWarning(ae, "Invalid Todo ID {todoId}", todoId);
            return new NotFoundResult();
      }
   }
   ```

## Distributed Tracing

In the Kubernetes/OpenShift world, the de-facto standard for distributed tracing through microservices is [Jaeger](https://www.jaegertracing.io/). Jaeger is available in ASP.NET applications as well.

1. Install the OpenTracing package
   ```bash
   dotnet add package OpenTracing.Contrib.NetCore
   dotnet add package Jaeger.Core
   ```
1. Enable OpenTracing in your `Startup.cs` file as follows:
   ```csharp
      public void ConfigureServices(IServiceCollection services)
      {

         // Add framework services.
         services.AddOpenTracing();
         // Adds the Jaeger Tracer.
         services.AddSingleton<ITracer>(serviceProvider =>
         {
            string serviceName = serviceProvider.GetRequiredService<IWebHostEnvironment>().ApplicationName;

            // This will log to a default localhost installation of Jaeger.
            var tracer = new Tracer.Builder(serviceName)
               .WithSampler(new ConstSampler(true))
               .Build();

            // Allows code that can't use DI to also access the tracer.
            GlobalTracer.Register(tracer);

            return tracer;
         });
   ```
1. Now, you can use Environment Variables or settings in `appsettings.json` to [configure](https://github.com/jaegertracing/jaeger-client-csharp#configuration-via-environment) where to send the tracing data

## Overriding Configuration At Runtime

ASP.NETCore provides a machanism for overriding the `appsettings.json` at runtime. This provides a simple way to "inject" our runtime configuration from a Kubernetes/OpenShift ConfigMap or Secret.

1. Modify the `Program.cs` to add an optional configuration file to be loaded
   ```csharp
   public static IHostBuilder CreateHostBuilder(string[] args) =>
      Host.CreateDefaultBuilder(args)
            .ConfigureAppConfiguration((hostingContext, config) =>
            {
               config.AddJsonFile("/tmp/config/runtimesettings.json", optional: true, reloadOnChange: false);
            })
            // SNIP - Remaining Host Builder
   ```
1. Now, when we deploy our application on OpenShift, it will look for a file in `/tmp` called `runtimesettings.json` and those settings will override any settings in our `appsettings.json`.
1. We can define our Deployment or DeploymentConfig such that we mount a ConfigMap or Secret containing that JSON configuration in that location

## Setting Up To Deploy With Helm 3

Helm helps you manage Kubernetes applications — Helm Charts help you define, install, and upgrade even the most complex Kubernetes application.

We do not have the time to completely explain creating a Helm chart for this application, and besides we want you to come back in couple of weeks when I colleague Jamie Land will be telling you ALL ABOUT Helm. In this case, we're just going to customized some values in a chart to deploy our application.

1. Ensure you are logged in to your Kubernetes or OpenShift cluster
   If you are using Minikube or KInD it should log you in on start
1. Look at the `values.yaml` file in the `<solution root>/helm` directory
   * Note the image name/repository and change it to point to where you have published your container
1. Install the application using the Helm 3 CLI
   ```bash
   helm install <identifier> ./
   ```
   * The identifier just needs to be unique, but it can be almost any random string. Best practices indicate it should be numerical and probably align with your application version.