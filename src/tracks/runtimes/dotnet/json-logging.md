---
title: JSON Logging And Request Logs
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
            .UseSerilog()
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
   public class TodoListContext : DbContext, ITodoContext
   {
      private readonly ILogger<TodoListContext> _logger;

      public TodoListContext(ILogger<TodoListContext> logger, DbContextOptions<TodoListContext> options) :
         base(options)
      {
         _logger = logger;
      }
   ```
   * **NOTE** - You will need to also update your Unit Test to make the signature match the updated constructor here!!!!
1. Use your logger instance wherever appropriate
   ```csharp
   public Todo UpdateTodo(Guid id, Todo data)
   {
      var todo = Todos.Find(id);
      if (todo == null)
      {
            var ae = new ArgumentException($"Unable to find Todo with ID: ${id}");
            _logger.LogWarning(ae, "Unable to find Todo with Id {id}", id);
            throw ae;
      }
      todo.Complete = data.Complete;
      todo.Description = data.Description;
      todo.Title = data.Title;
      todo.DueDate = data.DueDate;
      SaveChanges();
      return todo;
   }
   ```

## [Step 7](/tracks/runtimes/dotnet/distributed-tracing.html)
## [Step 8](/tracks/runtimes/dotnet/configuration.html)
## [Step 9](/tracks/runtimes/dotnet/helm-deployment.html)