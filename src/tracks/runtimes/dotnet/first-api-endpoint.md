---
title: Test-Driven Development Of An API Endpoint
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

<iframe width="560" height="315" src="https://www.youtube.com/embed/OVNA4HOAGDI" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## Test-Driven Development Of An API Endpoint

Following Test-Driven Development practices, we will now implement our first API endpoint by preparing to write a test and then coding to that test.

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
