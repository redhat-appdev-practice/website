---
title: Distributed Tracing
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
- jaeger
- opentracing
- tracing
- kubernetes
- openshift
---

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


## [Step 8](/tracks/runtimes/dotnet/configuration.html)
## [Step 9](/tracks/runtimes/dotnet/helm-deployment.html)