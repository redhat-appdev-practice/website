---
title: Generate A New ASP.NETCore WebAPI Using OpenAPI Generator
initialOpenGroupIndex: -1
collapsable: true
tags:
- java
- jdk
- vertx
- rx
- rxjava
- rest
- jooq
- streaming
- webapi
- postgresql
- cloud-native
- cloudnative
- appdev
- application development
- containers
- kubernetes
- openshift
- helm
- openapi
- openapi generator
- contract-first
- contract
- swagger
---

## Bootstrapping A Project Using OpenAPI Generator

1. Clone our starter repository from GitHub:
   ```bash
   git clone --recursive https://github.com/redhat-appdev-practice/runtimes-dotnet-ef6-openapi.git
   ```
   * This starter repo will have:
     * OpenAPI Specification for our Todo API (`todo_openapi.yaml`)
     * A script to launch OpenAPI Generator (`generate.sh`)
     * A Compose file to launching all of the components together locally (`docker-compose.yaml`)
     * A Helm Chart for deploying the application to OpenShift or another Kubernetes platform (`helm`)
1. The API Specification we are using is for a TodoList application and the API Docs can be seen [HERE](https://studio-ws.apicur.io/sharing/811c0087-c112-4afe-ae97-da45ac1aef4d)
1. Change into the cloned directory (which will from here on be referred to as &lt;solution root&gt;) and generate the solution
   ```bash
   ./generate.sh
   ```
1. Add some of the generated classes to `.gitignore`
   ```
   src/gen/**/*
   ```
   * The code created by OpenAPI Generator should never be added to source control. It is meant to be re-generated at *build time*, **every time**. Some files, such as `pom.xml` or `DefaultApiImpl.java` will probably end up being modified by us, the developers, and as such should be added to the `.openapi-generator-ignore` and never re-generated.
1. Open the newly created project in your IDE
1. Add the following line to the `<properties>` section of the `pom.xml` file:
   ```xml
   <vertx.verticle>com.redhat.cnd.todo.MainVerticle</vertx.verticle>
   ```
1. Enable the Vert.x Maven Plugin
   ```bash
   mvn io.reactiverse:vertx-maven-plugin::setup
   ```
1. Add the `build-helper-maven-plugin` and configure it to use our generated code
   ```xml
   <build>
      <plugins>
         <plugin>
            <groupId>org.codehaus.mojo</groupId>
            <artifactId>build-helper-maven-plugin</artifactId>
            <version>3.2.0</version>
            <executions>
               <execution>
                  <id>add-generated-sources</id>
                  <goals>
                     <goal>add-source</goal>
                  </goals>
                  <configuration>
                     <sources>
                        <source>src/gen/java</source>
                     </sources>
                  </configuration>
               </execution>
            </executions>
         </plugin>
         // ... SNIP
1. Run a Maven build
   ```
   mvn clean package vertx:run
   ```
1. Using `curl` or a tool like [Postman](https://www.postman.com/), you can now make requests to the API and see that those endpoints return "Not Implemented" Exceptions.