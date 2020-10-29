---
title: Deploying The Application With Helm 3
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
- helm
- kubernetes
---

## Setting Up To Deploy With Helm 3

Helm helps you manage Kubernetes applications — Helm Charts help you define, install, and upgrade even the most complex Kubernetes application.

We do not have the time to completely explain creating a Helm chart for this application, and besides we want you to come back in couple of weeks when I colleague Jamie Land will be telling you ALL ABOUT Helm. In this case, we're just going to customized some values in a chart to deploy our application.

1. Ensure you are logged in to your Kubernetes or OpenShift cluster
   If you are using Minikube or KInD it should log you in on start
1. Ensure you are currently associated with a namespace where you can deploy resources (kubectl use &lt;namespace&gt; or oc project &lt;namespace&gt;)
1. Look at the `values.yaml` file in the `<solution root>/helm` directory
   * Note the image name/repository and change it to point to where you have published your container
1. Install the application using the Helm 3 CLI
   ```bash
   helm install <identifier> ./
   ```
   * The identifier just needs to be unique, but it can be almost any random string. Best practices indicate it should be numerical and probably align with your application version.
1. Take a look at your namespace and you should see the ASP.NET application running and the PostgreSQL StatefulSet running as well.

**NOTE**: Something to be aware of is that when you deploy your application, the database may not have been initialized. You will need to manually initialize the database using your schema migrations or some other mechanism. Here's how one **COULD** do it in OpenShift:

```bash
cd <solution root>/src/RedHat.TodoList
oc port-forward pod/<db pod> 5432  // Forwards the PostgreSQL port from the cluster to this local machine
```

### In another terminal, because the port-forward has to remain running
```bash
dotnet ef database update
```