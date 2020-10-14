---
title: OpenAPI Generator
initialOpenGroupIndex: -1
collapsable: true
sidebarDepth: 1
tags:
- openapi
- openapi-generator
- rest
- api
- java
- spring
- springboot
- javascript
- typescript
- axios
---

# OpenAPI Generator

## Intro

### What is OpenAPI Generator?
An open source project used to generate applications based on OpenAPI v2.0/v3.0 documents. With support for over 40 different languages it can be used to create both the client and server applications based on the same OpenAPI Specification (OAS) file, helping to prevent any drift between your API specification and your code. OpenAPI Generator is even able to generate HTML documentation based on your OAS.

### What is Contract-First Development?
The practice of having a clearly defined API at the outset of a project. An important aspect of contract-first development is an agreement with your team that any updates to the contract happen *before* any updates to the code.

## Lab

### Setup
#### Install OpenAPI Generator
Instructions for installation of OpenAPI Generator can be found here: https://openapi-generator.tech/docs/installation

#### Download OpenAPI Specification File
You can get your OpenAPI Specification using one of the following options:
a. Use your own OAS file.
b. Download the demo application file [here](https://github.com/jland-redhat/rhc_openapi_todo/tree/todo_base).
c. Retrieve your OAS file from [Apicurio Studio](https://studio.apicur.io/) created in the previous lab. See below.

If you completed the previous lab you should be able to follow the lab by downloading that OAS file. Here are the instructions for retrieving your OAS file off of Apicurio.
1. Navigate to the APIs dashboard [here](https://studio.apicur.io/apis).
2. Choose the API you want to download.
3. Select "Download" in the dropdown menu.
   ![apicurio](/apicurio.png)

### View OpenAPI Generator Documentation (Optional)

1. Go to the [OpenAPI Generator Webpage](https://openapi-generator.tech/).
2. Click the "Generators" button.
3. Take some time to view the different generators, following the links to get more information.

### Instructions

1. Generate Spring Boot Application:
   - Run the command below, note replace todo.yaml with a path to your file.
   ```sh
   openapi-generator generate \
        -g spring \
        --library spring-boot \
        -i todo.yaml \
        -o ${PWD} \
        -p groupId=com.redhat \
        -p artifactId=todo \
        -p artifactVersion=1.0.0-SNAPSHOT \
        \
        -p basePackage=com.redhat.todo \
        -p configPackage=com.redhat.todo.config \
        -p apiPackage=com.redhat.todo.api \
        -p modelPackage=com.redhat.todo.model \
        \
        -p sourceFolder=src/main/gen \
        \
        -p dateLibrary=java8 \
        -p java8=true
   ```
   **Note:** We are using the *sourceFolder* parameter to change where OpenAPI Generator places the generated Java code. By placing it in `src/main/gen` instead of `src/main/java` we are indicating that this code is created by the generator and should be treated as immutable.
   
   - Open the code in an IDE of your choice and take some time to look around the code. Take note that we are currently generating all the files related to the application inside of the `src/main/gen` folder.
2. Add the `src/main/gen` to your source directories:
   - Add the following plugin to your `pom.xml`:
    ```xml
    <plugin>
        <groupId>org.codehaus.mojo</groupId>
        <artifactId>build-helper-maven-plugin</artifactId>
        <version>3.1.0</version>
        <executions>
            <execution>
                <phase>generate-sources</phase>
                <goals>
                    <goal>add-source</goal>
                </goals>
                <configuration>
                    <sources>src/main/gen</sources>
                </configuration>
            </execution>
        </executions>
    </plugin>
    ```
   - Validate you can run the application:
      - Run `mvn spring-boot:run`
      - Navigate to http://localhost:8080/swagger-ui.html
3. View the code inside `src/main/gen/com/redhat/todo`:
   - View the `api/TodosApi.java`:
      - The interface created from the *paths* inside of your OAS file.
      - Contains all of your path's Swagger annotations.
      - There is also a basic implementation of each of your path methods returning a *503 Not Implemented*. You may have noticed this if you attempted this in the previous step.
   - View the `api/TodosApiController.java`:
      - Currently there is very little besides the `@RequestMapping` annotation inside of this controller.
      - This will be where we implement the methods of the *TodosApi* interface.
   - View `model/Todo.java`:
      - The POJO object represented by the *schema* section of your OAS file.
4. Implement the *TodosApiController*:
   - Create a `src/main/java` source folder – this is the folder we will be putting all the code we plan on modifying.
   - Move `TodosApiController.java` from the `src/main/gen` folder to the same package inside the `src/main/java` folder.
   - Stub the `getTodo` method by adding the following code:
     ```java
     @Override
     public ResponseEntity<Todo> getTodo(String todoId) {
         Todo response = new Todo();
         response.setName("Stubbed Todo Item");
         response.setDescription("Stubbed Todo Description");
         response.setCompleted(false);
         response.setDate(OffsetDateTime.now().plusDays(1));
         return ResponseEntity.ok(response);
     }
     ``` 
     **Note:** we are returning a `200` response code. This is compliant with our OAS specification. Currently we don't have any validation on which response code we are returning but it is best practice to follow what is specified by your OpenAPI document. And in the future we will be looking at [Schemathesis](https://github.com/schemathesis/schemathesis) which will run test to validate that all expected response codes are returned.
   - Prevent the regeneration of the `TodosApisController.java`:
      - In order to prevent files that you add to your `src/main/java` from being recreated in `src/main/gen` they need to be added to your `.openapi-generator-ignore` file.
      - Add the following lines to prevent any `*Controller.java` files from being added, as well as preventing us from overriding our `pom.xml`:
      ```regex
      **/*Controller.java
      pom.xml
      ```
   - Validate the endpoint:
      - Run `mvn spring-boot:run`
      - Navigate to http://localhost:8080/swagger-ui.html
      - Validate `GET /todos/{todoId}` returns 200 stubbed data.
   - (Optional) Stub out other endpoints – remember that the response codes should match your OAS document.
5. Regenerate code on Maven builds:
   - Add the following Maven plugin to your `pom.xml`:
        ```xml
        <plugin>
            <groupId>org.openapitools</groupId>
            <artifactId>openapi-generator-maven-plugin</artifactId>
            <version>4.3.1</version>
            <executions>
                <execution>
                    <phase>generate-sources</phase>
                    <goals>
                        <goal>generate</goal>
                    </goals>
                    <configuration>
                        <generatorName>spring</generatorName>
                        <inputSpec>https://raw.githubusercontent.com/jland-redhat/rhc_openapi_todo/todo_enhanced/todo.yaml</inputSpec>
                        <library>spring-boot</library>
                        <output>${project.basedir}</output>
                        <configOptions>
                            <serializableModel>true</serializableModel>
                            <artifactId>${project.artifactId}</artifactId>
                            <groupId>${project.groupId}</groupId>
                            <version>${project.version}</version>
                            <dateLibrary>java8</dateLibrary>
                            <sourceFolder>src/main/gen</sourceFolder>
                            <basePackage>com.redhat.todo</basePackage>
                            <invokerPackage>com.redhat.todo</invokerPackage>
                            <configPackage>com.redhat.todo.config</configPackage>
                            <modelPackage>com.redhat.todo.model</modelPackage>
                            <apiPackage>com.redhat.todo.api</apiPackage>
                        </configOptions>
                    </configuration>
                </execution>
            </executions>
        </plugin>
        ```
     **Warning:** If you did not add `pom.xml` to your `.openapi-generator-ignore` file the next build will override your `pom.xml` and you will need to add back the previous plugin.
     
     - Explore the new OAS file being pulled from GitHub:
        - Note the new `user` schema as well as the new paths associated with the new user object.
     - Validate that `TodosApisController.java` has been deleted from your `src/main/gen` folder and regenerate your files with `mvn generate-sources`.
     - Validate `api/UsersApi.java` and `model/User.java` are generated and the `*Controller.java` are not being generated.

### Wrap-up

At this point we have created a stubbed out application. You should be able to check in your application with the single `TodosApisController.java` source file and if another developer pulls it down, all of the other files needed to run the server will be generated automatically every time before the compile phase of the Maven lifecycle. As a bonus assignment you can modify the `inputSpec` parameter for your *openapi-generator-maven-plugin* to point back to your local file and see how changes in the OAS affect the code.

Hopefully, this showed how easy it is to go from one of these specification documents to an up and running application.
