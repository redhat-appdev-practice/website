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
1. From this point forward, we will attempt to write tests first and then implement our code to satisfy those tests.

## Database Access/Data Persistence
1. Add the following Nuget dependencies to allow us to start creating our data access layer
   * Npgsql.EntityFrameworkCore.PostgreSQL == 3.1.4
   * Npgsql.EntityFrameworkCore.PostgreSQL.Design == 1.1.0
   * Microsoft.EntityFrameworkCore.Tools == 3.1.4
1. Create a new directory called `DataAccess` under the `Com.Redhat.TodoList` project
1. Add a new interface `ITodoContext` and class named `TodoListContext` in the `DataAccess` directory
   ```csharp
   using Com.RedHat.TodoList.Models;
   using Microsoft.EntityFrameworkCore;

   namespace Com.RedHat.TodoList.DataAccess
   {
      public interface ITodoContext
      {
         public ImmutableList<Todo> GetTodos();
         public Todo UpdateTodo(Guid id, Todo data);
         public void Delete(Guid id);
         public Todo AddTodo(Todo newTodo);
         public Todo GetTodo(Guid id);
      }

      public class TodoListContext:DbContext, ITodoContext
      {
         public TodoListContext(DbContextOptions<TodoListContext> options) : base(options) { }

         public DbSet<Todo> Todos { get; set; }
      }
   }
   ```
1. Next, we need to add the service to the dependency injection framework of ASP.NET by editing `Startup.cs`
   ```csharp
   // At the end of the ConfigureServices method
   services
      .AddEntityFrameworkNpgsql().AddDbContext<TodoListContext>(opt =>
         opt.UseNpgsql(Configuration.GetConnectionString("TodoListContext")));
   ```
1. Add the connection string to the `appsettings.json` file
   ```json
   {
      "ConnectionStrings": {
         "TodoListContext": "User ID=postgresql;Password=postgresql;Server=localhost;Port=5432;Database=todolist"
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
         var updating = this.Todos.Find(id);
         updating.Complete = data.Complete;
         updating.Description = data.Description;
         updating.Title = data.Title;
         updating.DueDate = data.DueDate;
         this.SaveChanges();
         return updating;
      }
      
      public void Delete(Guid id)
      {
         this.Todos.Remove(this.Todos.Find(id));
         this.SaveChanges();
      }

      public Todo AddTodo(Todo newTodo)
      {
         this.Todos.Add(newTodo);
         this.SaveChanges();
         return newTodo;
      }
      
      public Todo GetTodo(Guid id)
      {
         return this.Todos.Find(id);
      }
   ```

## Finish Controller Implementations
1. Write a Unit Test for the `GetTodo` method of the `DefaultApiControllerImpl` class
   ```csharp
   using System;
   using Com.RedHat.TodoList.ControllerImpl;
   using Com.RedHat.TodoList.DataAccess;
   using Com.RedHat.TodoList.Models;
   using Microsoft.VisualStudio.TestTools.UnitTesting;
   using Moq;

   namespace Com.RedHat.TodoList.Tests
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
   $ dotnet test --filter "FullyQualifiedName=Com.RedHat.TodoList.Tests.TodoApiTest.GetTodo"
   // SNIP //
   Failed GetTodo [14 ms]
   Error Message:
      Test method Com.RedHat.TodoList.Tests.TodoApiTest.GetTodo threw exception: 
   System.NotImplementedException: The method or operation is not implemented.
   Stack Trace:
         at Com.RedHat.TodoList.ControllerImpl.DefaultApiControllerImpl.GetTodo(Guid todoId) in /home/dphillips/Documents/RedHat/Workspace/CNAD_Enablement/dotnet-openapi-todo/src/Com.RedHat.TodoList/ControllerImpl/DefaultApiImpl.cs:line 23
      at Com.RedHat.TodoList.Tests.TodoApiTest.GetTodo() in /home/dphillips/Documents/RedHat/Workspace/CNAD_Enablement/dotnet-openapi-todo/src/Com.RedHat.TodoList.Tests/TodoApiTest.cs:line 26
   ```
1. Now that we have a failing test, we can implement the Controller method and satisfy the test.
   ```csharp
   using System;
   using System.Collections.Generic;
   using Com.RedHat.TodoList.Controllers;
   using Com.RedHat.TodoList.DataAccess;
   using Com.RedHat.TodoList.Models;
   using Microsoft.AspNetCore.Mvc;

   namespace Com.RedHat.TodoList.ControllerImpl
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
               return this.dbContext.GetTodo(todoId); // Use the database context to implement the method
         }
      }
   }
   ```
1. Running the test should now succeed using the Mock DbContext object.
   ```
   $ dotnet test --filter "FullyQualifiedName=Com.RedHat.TodoList.Tests.TodoApiTest.GetTodo"
      Determining projects to restore...
      Restored /home/dphillips/Documents/RedHat/Workspace/CNAD_Enablement/dotnet-openapi-todo/src/Com.RedHat.TodoList.Tests/Com.RedHat.TodoList.Tests.csproj (in 392 ms).
      1 of 2 projects are up-to-date for restore.
      You are using a preview version of .NET. See: https://aka.ms/dotnet-core-preview
      Com.RedHat.TodoList -> /home/dphillips/Documents/RedHat/Workspace/CNAD_Enablement/dotnet-openapi-todo/src/Com.RedHat.TodoList/bin/Debug/netcoreapp3.1/Com.RedHat.TodoList.dll
      Com.RedHat.TodoList.Tests -> /home/dphillips/Documents/RedHat/Workspace/CNAD_Enablement/dotnet-openapi-todo/src/Com.RedHat.TodoList.Tests/bin/Debug/netcoreapp3.1/Com.RedHat.TodoList.Tests.dll
   Test run for /home/dphillips/Documents/RedHat/Workspace/CNAD_Enablement/dotnet-openapi-todo/src/Com.RedHat.TodoList.Tests/bin/Debug/netcoreapp3.1/Com.RedHat.TodoList.Tests.dll (.NETCoreApp,Version=v3.1)
   Microsoft (R) Test Execution Command Line Tool Version 16.8.0
   Copyright (c) Microsoft Corporation.  All rights reserved.

   Starting test execution, please wait...
   A total of 1 test files matched the specified pattern.

   Passed!  - Failed:     0, Passed:     1, Skipped:     0, Total:     1, Duration: 102 ms - /home/dphillips/Documents/RedHat/Workspace/CNAD_Enablement/dotnet-openapi-todo/src/Com.RedHat.TodoList.Tests/bin/Debug/netcoreapp3.1/Com.RedHat.TodoList.Tests.dll (netcoreapp3.1)
   ```
1. Implement the remaining tests, then implement the remaining methods for the controller

## Implementing Feature Flags
1. It is often desireable to test out new features with a small sample before making them available to your complete user population. Microsoft has made available [some libraries](https://docs.microsoft.com/en-us/azure/azure-app-configuration/use-feature-flags-dotnet-core#set-up-feature-management) to make this easier.
1. Start off by adding a `FeatureFlags` key to your `appsettings.json` file:
   ```json

   ```

## Logging Best Practices

Logging in ASP.NET applications can be accomplished by modifying the `Program.cs` file. In a containerized and Kubernetes environment, those logs should be output to STDOUT/STDERR via the Console logger.

1. Edit the `<root>/.openapi-generator-ignore` to ignore the `Program.cs` file so that our manual changes will not be overwritten each time we re-generate code from the OpenAPI Specification. Append the following line to the ignore file.
   ```
   **/Program.cs
   ```
1. Edit the `Program.cs` file to read as follows:
   ```csharp
   public static IHostBuilder CreateHostBuilder(string[] args) =>
      Host.CreateDefaultBuilder(args)
            .ConfigureLogging((hostingContext, logging) =>
            {
               logging.ClearProviders();
               logging.AddConsole(options => options.IncludeScopes = true);
               logging.AddDebug();
            })
            .ConfigureWebHostDefaults(webBuilder =>
            {
               webBuilder.UseStartup<Startup>()
                        .UseUrls("http://0.0.0.0:8080/");
            });
   ```
1. Add the `Program.cs` file to version control
   ```bash
   git add src/Com.RedHat.TodoList/Program.cs
   git commit src/Com.RedHat.TodoList/Program.cs -m 'Added logging configuration'
   ```
1. Configure your logging levels in the `appsettings.json` file:
   ```json
   {
      "Logging": {
         "Debug": {
            "LogLevel": {
               "Default": "Information"
            }
         },
         "Console": {
            "IncludeScopes": true,
            "LogLevel": {
               "Microsoft": "Warning", // Only output Warning or Higher levels for Packages starting with Microsoft
               "Npgsql": "Warning",    // Only output Warning or Higher levels for Packages starting with Npgsql
               "Default": "Information"
            }
         },
         "LogLevel": {
            "Default": "Debug"
         }
      }
      // SNIP . . . 
   }
   ```
1. Instantiate the Logger instance in your constructors:
   ```csharp
   private readonly ILogger _logger;

   public MyConstructor(ILoggerFactory logger)
   {
      _logger = logger.CreateLogger("MyClass");
   }
   ```
1. Then you can use your logger anywhere in that class
   ```csharp
   _logger.LogInformation("My informational message about {err}", err);
   _logger.LogWarning("My Warning Message");
   ```
### JSON Logging

In order to work best with log aggregators like EFK Stack or Splunk, you might want to output your logs in JSON format for easier indexing.

1. Add [Serilog](https://github.com/serilog/serilog-aspnetcore) to your project
   ```bash
   dotnet add package Serilog.AspNetCore
   ```
1. Configure the logger in your `Program.cs`
   ```csharp
   public static IHostBuilder CreateHostBuilder(string[] args) =>
      Host.CreateDefaultBuilder(args)
            .UseSerilog((hostingContext, services, loggerConfiguration) => loggerConfiguration
               .ReadFrom.Configuration(hostingContext.Configuration)
               .Enrich.FromLogContext()
               .WriteTo.Console(new RenderedCompactJsonFormatter()))
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
   namespace Com.RedHat.TodoList.ControllerImpl
   {
      public class DefaultApiControllerImpl: DefaultApiController
      {
         private ITodoContext dbContext;
         private readonly ILogger<DefaultApiControllerImpl> _logger;

         public DefaultApiControllerImpl(ILogger<DefaultApiControllerImpl> logger, ITodoContext dbContext)
         {
               _logger = logger ?? throw new ArgumentNullException(nameof(logger));
               this.dbContext = dbContext;
         }
   ```
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
   dotnet add package OpenTracing.Contrib.NetCore Jaeger.Core
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