---
title: Configuration
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

<iframe width="560" height="315" src="https://www.youtube.com/embed/byHM2L3Wyak" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## Overriding Configuration At Runtime

ASP.NETCore provides a machanism for overriding the `appsettings.json` at runtime. This provides a simple way to "inject" our runtime configuration from a Kubernetes/OpenShift ConfigMap or Secret.

1. Modify the `Program.cs` to add an optional configuration file to be loaded
   ```csharp
   public static IHostBuilder CreateHostBuilder(string[] args) =>
      Host.CreateDefaultBuilder(args)
            .UseSerilog()
            .ConfigureAppConfiguration((hostingContext, config) =>
            {
               config.AddJsonFile("/tmp/config/runtimesettings.json", optional: true, reloadOnChange: false);
            })
            // SNIP - Remaining Host Builder
   ```
1. Now, when we deploy our application on OpenShift, it will look for a file in `/tmp/config` called `runtimesettings.json` and those settings will override any settings in our `appsettings.json`.
1. We can define our Deployment or DeploymentConfig such that we mount a ConfigMap or Secret containing that JSON configuration in that location
