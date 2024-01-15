---
title: Implement Cloud-Native Configuration
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

# Cloud-Native Configuration

As you have likely already noticed in previous parts of this track, Quarkus is often configured using a [Properties file](https://docs.oracle.com/javase/tutorial/essential/environment/properties.html). This is quite convenient, but we also need to be able to configure in a cloud-native way which may comply with a 12-factor application concept of **configuration from the environment**

1. First, we will include support for YAML configuration files by adding a dependency to the Maven `pom.xml`
    ```xml
    <dependency>
        <groupId>io.quarkus</groupId>
        <artifactId>quarkus-config-yaml</artifactId>
    </dependency>
    ```
1. Next, we will convert our Properties file to YAML:
    ```yaml
    mp:
        openapi:
            scan:
                disable: 'true'

    '%test':
        quarkus:
            datasource:
                db-kind: h2
                password: ''
                username: SA
                jdbc:
                    url: 'jdbc:h2:mem:todos;MODE=PostgreSQL;'
                    driver: org.h2.Driver
            hibernate-orm:
                database:
                    generation: drop-and-create
            oidc:
                enabled: 'false'

    quarkus:
        datasource:
            db-kind :  postgresql
            username: ${TODODB_USER:tododb}
            password: ${TODODB_PASS:tododb}
            jdbc:
                driver: org.postgresql.Driver
                url: jdbc:postgresql://localhost:5432/hibernate_orm_test
        log:
            console:
            json: 'false'
        oidc:
            auth-sever-url: https://oidc.example.com/auth/realm/client

    '%prod':
        quarkus:
            log:
                console:
                    json: 'true'
    ```
1. We can now choose to substitute environment variables
    ```
    username: ${TODODB_USER: defaultValue}
    ```
1. Or we can override the configuration file at runtime:
    ```
    /path/to/quarkus/executable -Dquarkus.config.locations=/path/to/config.yaml
    ```
