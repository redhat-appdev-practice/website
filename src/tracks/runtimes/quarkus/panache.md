---
title: Add Panache, Hibernate, and Database Drivers
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

# Hibernate, Panache, and Database Access

The Panache extensions to Hibernate and JPA used by Quarkus give us extensive flexibility in being able to quickly and efficiently create
Data Access Object, Repositories, or ActiveRecord style database integrations. For this tutorial, we will leverage the [Repository pattern](https://quarkus.io/guides/hibernate-orm-panache#solution-2-using-the-repository-pattern) capability
within Quarkus to allow for simple integration with a PostgreSQL database.

1. Add the H2 & PostgreSQL Database extensions to Quarkus using the Maven plugin
    ```bash
    $ ./mvnw quarkus:list-extensions | grep -i jdbc
    [INFO] Elytron Security JDBC                              quarkus-elytron-security-jdbc
    [INFO] JDBC Driver - DB2                                  quarkus-jdbc-db2
    [INFO] JDBC Driver - Derby                                quarkus-jdbc-derby
    [INFO] JDBC Driver - H2                                   quarkus-jdbc-h2
    [INFO] JDBC Driver - MariaDB                              quarkus-jdbc-mariadb
    [INFO] JDBC Driver - Microsoft SQL Server                 quarkus-jdbc-mssql
    [INFO] JDBC Driver - MySQL                                quarkus-jdbc-mysql
    [INFO] JDBC Driver - Oracle                               quarkus-jdbc-oracle
    [INFO] JDBC Driver - PostgreSQL                           quarkus-jdbc-postgresql
    [INFO] Camel JDBC                                         camel-quarkus-jdbc
    $ ./mvnw quarkus:add-extensions -Dextensions=quarkus-jdbc-postgresql,quarkus-jdbc-h2
    // SNIP
    [INFO] --- quarkus-maven-plugin:2.0.0.Final:add-extensions (default-cli) @ quarkus-todo ---
    [INFO] [SUCCESS] ✅  Extension io.quarkus:quarkus-jdbc-postgresql has been installed
    [INFO] [SUCCESS] ✅  Extension io.quarkus:quarkus-jdbc-h2 has been installed
    [INFO] ------------------------------------------------------------------------
    // SNIP
    ```
1. Add data source configurations for the PostgreSQL and H2 databases in `src/main/resources/application.properties`
    ```
    %test.quarkus.datasource.db-kind = h2
    %test.quarkus.datasource.jdbc.url = jdbc:h2:mem:todos;MODE=PostgreSQL;
    %test.quarkus.datasource.password=
    %test.quarkus.datasource.username=SA
    %test.quarkus.datasource.jdbc.driver=org.h2.Driver
    %test.quarkus.hibernate-orm.database.generation=drop-and-create

    quarkus.datasource.jdbc.url=jdbc:postgresql://localhost:5432/hibernate_orm_test
    quarkus.datasource.db-kind = postgresql
    quarkus.datasource.jdbc=true
    quarkus.datasource.jdbc.driver=org.postgresql.Driver
    quarkus.datasource.username=${TODODB_USER:tododb}
    quarkus.datasource.password=${TODODB_PASS:tododb}
    ```
1. Create a new package under `src/main/java` called `com.redhat.runtimes.data`
1. Create a new Java class in that package called `TodosRepository.java`
    ```java
    package com.redhat.runtimes.data;

    import com.redhat.runtimes.models.Todo;
    import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;

    import javax.enterprise.context.ApplicationScoped;
    import java.util.UUID;

    @ApplicationScoped
    public class TodosRepository implements PanacheRepositoryBase<Todo, UUID> {
    }
    ```
    * This repository indicates that it handles `Todo` entities and uses a `UUID` as the primary key.
      ::: tip
      If you primary key is a `Long` you could instead just extend `PanacheRepository<Entity>`
      :::
    * By extending `PanacheRepository` or `PanacheRepositoryBase` we automatically get typical [CRUD methods](https://en.wikipedia.org/wiki/Create,_read,_update_and_delete) for our Entity type. Some examples are:
      * `findById`
      * `listAll`
      * `deleteById`
      * `persist`
      * `update`
1. Create a test class under `src/test/java` and write a test for a method which returns paginated results
    ```java
    package com.redhat.runtimes.data;

    import io.quarkus.panache.common.Sort;
    import io.quarkus.test.junit.QuarkusTest;
    import org.junit.jupiter.api.Test;

    import javax.inject.Inject;

    import static org.junit.jupiter.api.Assertions.*;

    @QuarkusTest
    class TodosRepositoryTest {

        @Inject
        TodosRepository underTest;

        @Test
        void getTodosPaginated() {
            var result = underTest.getTodosPaginated("id", Sort.Direction.Ascending, 25, 1);
            assertEquals(0, result.size(), "Without staged data, an empty list is expected");
        }
    }
    ```
1. Add a new method to the repository for handling paginated data
    ```java
    public List<Todo> getTodosPaginated(String sortKey, Sort.Direction sortOrder, int pageSize, int pageOffset) {
		PanacheQuery<Todo> todos = this.findAll(Sort.by(sortKey).direction(sortOrder));
		return todos.page(pageOffset, pageSize).stream().collect(Collectors.toList());
	}
    ```
1. Run your tests to ensure that the implementation is correct
    ```
    ./mvnw test
    ```
