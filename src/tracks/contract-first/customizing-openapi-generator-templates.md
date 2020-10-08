---
title: Customizing OpenAPI Generator Templates
initialOpenGroupIndex: -1
collapsable: true
tags:
- openapi
- openapi-generator
- mustache
- spring
- springboot
- java
- template
- api
- rest
---

# OpenAPI Generator Templating

## Intro

### OpenAPI Generator Templating
OpenAPI Generator has been designed to allow for the easy extension or even creation of a NEW generator. This lab will take a look at modifying the existing templates for OpenAPI in order to extend the functionality.

### External resources
Note that while this class will take a look at updating existing templates, there is a lot more that can be done with customization that can be found [here](https://openapi-generator.tech/docs/templating). Also while no previous knowledge of OpenAPI's templating language [mustache](https://mustache.github.io/mustache.5.html) is required, it is recommend you take a couple minutes to familiarize yourself with some of the basics.

## Lab

### Setup
#### Download OpenApi Project:

1. Download OpenAPI Project from github:
```
git clone https://github.com/jland-redhat/rhc_openapi_todo.git
cd rhc_openapi_todo
git checkout openapi_templating_pre
```


### Instructions


1a. Setup JPA <sub>Optional: If you want to skip setup JPA/Controller setup, go to step 1b</sub>
  - Add Spring Data JPA and h2 database dependencies to your pom.xml:
    ```xml
      <dependency>
          <groupId>org.springframework.boot</groupId>
          <artifactId>spring-boot-starter-data-jpa</artifactId>
          <version>2.1.4.RELEASE</version>
      </dependency>
      <dependency>
          <groupId>com.h2database</groupId>
          <artifactId>h2</artifactId>
          <scope>runtime</scope>
          <version>1.4.199</version>
      </dependency>
    ```  
  - Setup up h2 in-memory db by updating `src/main/resources/application.properties` with the following:
    ```properties
    #InMemory DB Connection
    spring.datasource.url=jdbc:h2:mem:tododb
    spring.datasource.driverClassName=org.h2.Driver
    spring.datasource.username=sa
    spring.datasource.password=password
    spring.jpa.database-platform=org.hibernate.dialect.H2Dialect

    #H2 Console
    spring.h2.console.enabled=true
    spring.h2.console.path=/h2-console
    spring.h2.console.settings.web-allow-others=false
    ```
  - Create the Todo repository file `src/main/java/com/redhat/todo/repository/TodoRepository.java`
    ```java
      package com.redhat.todo.repository;

      import java.util.List;

      import com.redhat.todo.model.Todo;

      import org.springframework.data.jpa.repository.JpaRepository;
      import org.springframework.stereotype.Repository;

      @Repository
      public interface TodoRepository extends JpaRepository<Todo, Integer>{

          public List<Todo> getByCompleted(Boolean completed);
          
      }
    ```
    <sub>Spring data is automatically able to create the query based on method name, [more info](https://docs.spring.io/spring-data/jpa/docs/current/reference/html/#jpa.query-methods.query-creation)</sub>
  - Add `repository` folder to scanned directories
    - Navigate to `OpenAPI2SpringBoot`
    - Add `com.redhat.todo.repository` to `@ComponentScan`'s basePackages
      ```java
      @ComponentScan(basePackages = {"com.redhat.todo", "com.redhat.todo.api" , "com.redhat.todo.config"})
      ```
  - Add TodoRepository refrence to TodoApiController.java
    ```java
        @Override
        private TodoRepository todoRepository;
    ```
  - Implement out GET method for specific item in TodoApiController.java. 
    ```java
      @Override
      public ResponseEntity<Todo> getTodo(@ApiParam(value = "A unique identifier for a `todo`.",required=true) @PathVariable("todoId") Integer todoId) {
          return ResponseEntity.ok(todoRepository.findById(todoId)
              .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND)));
      }
    ```
    <sub><span style="color:red">Important:</span> Paramter level annotations must be copied over to the stubbed method in Java in order for your paths to function correctly</sub>

  - (Optional) Implement out the other methods. Work can be checked against completed branch [here](https://github.com/jland-redhat/rhc_openapi_todo/blob/openapi_templating_complete/src/main/java/com/redhat/todo/api/TodosApiController.java)
  - Preload data by adding a `data.sql` file to the `resources` directory with the following:
    ```sql
    DROP TABLE IF EXISTS todo;

    CREATE TABLE todo (
      id INT IDENTITY NOT NULL  PRIMARY KEY,
      name VARCHAR(250) NOT NULL,
      description VARCHAR(250) NOT NULL,
      date DATETIME NOT NULL,
      completed Boolean DEFAULT false
    );

    INSERT INTO todo (name, description, date, completed) VALUES
      ('Apicur.io', 'Create my first OpenAPI Spec', now() - INTERVAL 2 DAY, true),
      ('OpenApi Generator', 'Generate my OpenAPI Springboot App', now() - INTERVAL 1 DAY, true),
      ('OAG Templating', 'Add DB persistance to my Springboot App', now() + INTERVAL 20 MINUTE, false)
    ```
    
   
1b. Checkout the branch with jpa_setup <sub>Skip if you did step 1a</sub>
```sh
git checkout openapi_templating_jpa_setup
```
    

2. Examine pojo.mustache template file
  - Go to [openapi-generator](https://github.com/OpenAPITools/openapi-generator) github
  - Navigate to the `spring` generator inside the module's resources folder
    - `modules/openapi-generator/src/main/resources/JavaSpring
  - This folder contains all of the template files used to generate the spring code from the previous application. It is worth taking some time to look at some of the different templates
    - Note the `library` folder that contain the 3 different libraries you can set. We chose spring boot when creating our application
  - Inside the `tempalte` folder of our application you will find `pojo.mustache`. This should match up with the `pojo.mustache` in the openapi-generator repository. with some added TODO tags
3. Update `pom.xml` to use templates folder
  - Add `<templateDirectory>${project.basedir}/templates</templateDirectory>` to the configuration of the `opeanpi-generator-maven-plugin`
    <sub>Note: be sure to add this to the configuration *NOT* the configOptions</sub>
4. Update `pojo.mustache` to include custom annotations
  - In order to use custom properties inside of templates are stored in 'vendorExtensions' and should begin with `x-`. You can read more about that [here](https://swagger.io/docs/specification/openapi-extensions/)
    - Add class annotations
      - Add the following directly above `@ApiModel` annotation (~line 4)
        ```mustache
        {{#vendorExtensions.x-java-class-annotation}}
        {{{.}}}
        {{/vendorExtensions.x-java-class-annotation}}
        {{^vendorExtensions.x-java-class-annotation}}
        //TODO: x-java-class-annotation required
        {{/vendorExtensions.x-java-class-annotation}}
        ```
        - `#` specifies the start of an array and `/` is the end so the above code will loop through our `x-java-class-annotation` and print the content of of each
        - `^` specifies inverted section. meaning the TODO message will be printed if the `x-java-class-annotation` is empty or non-existing
        ::: v-pre
        - `{{{.}}}` prints the value of each of the items inside the array. Note the triple bracket was used over the double one. This prevents mustache from attempting to url encoding of the values
        :::
    - Add field annotations
      ::: v-pre
      - Add the following directly inside the `{{#vars}}` loop, above `{{#isEnum}}` (~line 13)
        ```mustache
          {{#vendorExtensions.x-java-field-annotation}}
          {{{.}}}
          {{/vendorExtensions.x-java-field-annotation}}
        ```
      :::
    - Regnerate source and validate our TODO is showing up
      - `mvn generate-sources`
5. Add our annotations to the OAS file
  - Add the following to the `todo` section inside of paths/componenets/schemas section
    ```yaml
      x-java-class-annotation:
        - "@javax.persistence.Entity"
    ```
  - Add the following field annotations to the the properties id section under the todo schema:
    ```yaml
      x-java-field-annotation:
        - "@javax.persistence.Id"
        - "@javax.persistence.GeneratedValue(strategy = javax.persistence.GenerationType.IDENTITY)"
    ```
  - Validate
    - Running the following command will output the model info used by the templates to the OpenAPIModel.json file
      ```sh
        ./print-model.sh | grep -Pzo "(?s)############ Model info ############\n(\K\[.*?\} \]\n)| jq '..|objects|.vendorExtensions//empty" > OpenAPIModel.json
      ```
      - Note: In the print-model.sh the `-DdebugModels` is the flag that outputs the model object
    - Search through the file for "@javax.persistence" and validate the custom annotations are inside the vendor extensions at the correct level
    - Note this is the data used when building the files, meaning any existing data here can be used when modifying templates
  - Regenerate And Run
    - Run `mvn generate-sources`
      - Validate annotations are showing up on `Todo.java`
    - Run `mvn spring-boot:run`
      - Validate all of endpoints work (some data should be preloaded)
   
### Wrap Up

We were able to modify the default pojo template for a spring applications to allow us to insert custom JPA annotations, and proved our annotations worked correctly by connecting our spring-boot application to an in-memory database. In the upcoming labs we will be looking at adding testing to validate that our code adheres to our contract, as well as adding security to our API. 
