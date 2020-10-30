---
title: Configure Data Access Layer With EntityFramework
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