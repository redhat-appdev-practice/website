---
title: Generate a new Quarkus application using OpenAPI Generator
initialOpenGroupIndex: -1
collapsable: true
tags:
- java
- graalvm
- graal
- native-image
- quarkus
- panache
- openapi
- api
- rest
- openapi-generator
- contract-first
- unit testing
- testing
- junit
- mocking
- panache
- hibernate
---

## Bootstrapping A Project Using OpenAPI Generator

In order to simplify adopting a Contract-First API Development approach, we have created a series of [Maven Archetypes](https://maven.apache.org/guides/introduction/introduction-to-archetypes.html) which make initializing new projects extremely quick and simple. These archetypes are already published to [Maven Central](https://search.maven.org/search?q=g:com.redhat.consulting%20a:openapi*archetype)

1. Download the [OpenAPI](https://swagger.io/specification/) specification file for our example project from <a href="https://raw.githubusercontent.com/redhat-appdev-practice/todo-api/trunk/openapi.yml" target="_blank">HERE</a>
1. Use Maven to create a new project using the [Quarkus Archetype](https://github.com/redhat-appdev-practice/openapi-quarkus-archetype) and the downloaded OpenAPI Specification
    ```bash
    mvn archetype:generate -B -DarchetypeGroupId=com.redhat.consulting \
                           -DarchetypeArtifactId=openapi-quarkus-archetype \
                           -DarchetypeVersion=1.0.5 \
                           -Dpackage=com.redhat.runtimes \
                           -DgroupId=com.redhat.runtimes.quarkus \
                           -DartifactId=quarkus-todo \
                           -Dversion=0.0.1-SNAPSHOT \
                           -Dinteractive=false \
                           -Dquarkus_orm_selection=hibernate-orm \
                           -Dopenapi_app_contract_uri=/path/to/openapi.yml
    ```
    ::: tip
    This will create a new Maven project in the current directory under `quarkus-todo`
    :::
1. Make a note of the directory structure in the generated project
    ```
    $ tree -a
    .
    ├── .dockerignore
    ├── .mvn
    │   └── wrapper
    │       ├── MavenWrapperDownloader.java
    │       ├── maven-wrapper.jar
    │       └── maven-wrapper.properties
    ├── mvnw
    ├── mvnw.cmd
    ├── .openapi-generator-ignore
    ├── pom.xml
    ├── README.md
    ├── src
    │   ├── gen
    │   │   └── java
    │   │       └── com
    │   │           └── redhat
    │   │               └── runtimes
    │   │                   ├── api
    │   │                   │   ├── TodosApi.java
    │   │                   │   └── UserApi.java
    │   │                   └── models
    │   │                       ├── Todo.java
    │   │                       └── User.java
    │   └── main
    │       ├── docker
    │       │   ├── Dockerfile.jvm
    │       │   ├── Dockerfile.legacy-jar
    │       │   ├── Dockerfile.native
    │       │   └── Dockerfile.native-distroless
    │       └── resources
    │           ├── application.properties
    │           └── openapi.yml
    ├── target
    │   └── classes
    └── templates
        ├── pojo.mustache
        └── README.md
    ```
    * `src/gen/java` - This is the directory where the OpenAPI Generator Maven Plugin creates the classes from the OpenAPI Specification file
    * `src/main/docker` - These are Dockerfiles for creating Quarkus containers for deployment
    * `src/main/resources` - This is where the application metadata is kept
    * `templates` - This is where the Maven SCM Plugin clones the custom Quarkus OpenAPI Generator template files
    * `.openapi-generator-ignore` - Tells OpenAPI Generator not to generate files/patterns listed inside. This prevents the Maven POM from being overwritten
1. Inside of the `pom.xml`, review the plugins and their attachments to the Maven lifecycle
   * `build-helper-maven-plugin` is attached to the `generate-sources` phase to ensure that Maven includes the `src/gen/java` sources in the build path
   * `maven-scm-plugin` is attached to the `initialize` phase to clone the customer OpenAPI Generator template files
   * `maven-clean-plugin` is configured to delete the generated sources
   * `openapi-generator-maven-plugin` is attached to the `generate-sources` phase to generate our stubbed JAX-RS Server and Models
   * `formatter-maven-plugin` is attached to the `process-sources` phase to format and clean-up the generated code
   * `kubernetes-maven-plugin` and `openshift-maven-plugin` from Eclipse JKube - Used to deploy the application to Kubernetes/OpenShift
1. Create the subdirectory `src/main/java` as we will be creating our implementations in there starting with the next segement