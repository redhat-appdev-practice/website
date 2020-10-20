---
title: Automated API Testing With Schemathesis
initialOpenGroupIndex: -1
collapsable: true
sidebarDepth: 1
tags:
- schemathesis
- openapi
- api
- rest
- testing
- test
- specification
---

# OpenApi Testing with Schemathesis

## Video
<iframe width="560" height="315" src="https://youtu.be/4r7OC-lBKMg" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## Intro
In this lab we are going to look at testing our application using test cases that are generated using the
OAS(OpenAPI Spec). To accomplish this task we will be using a tool called Schemathesis.

Schemathesis is a tool for testing your web applications built with an Open API specifications.
It reads the application schema and generates test cases which will ensure that your application is compliant with its
 schema.
The nice thing about Schemathesis is that The application being test could be written in any language, the only thing
you need is a valid API schema in a supported format. For more information on Schemathesis, you can check out the
project page [here](https://github.com/kiwicom/schemathesis).

## Setup
### Project Base
We'll be using the Todo project that we created at the beginning of the series to test with. If you need a new copy
of the project follow these steps:
1. Clone the project: `https://github.com/redhat-appdev-practice/schemathesis-lab.git`
2. Generate the sources and make sure that the application runs without issue: `mvn spring-boot:run`

### Install Schemathesis
1. The first thing we're going to do is set up a virtual environment for our python packages:
`pip install --user virtualenv`
2. Create a new virtual environment in your project folder: `python -m venv myvenv`
3. Activate your new virtual environment: `source myvenv/bin/activate`
4. Install Schemathesis: `pip install schemathesis`

## Run the tests
1. Ensure that the application is running (the tests will be run against the running application): `mvn spring-boot:run`
2. In our project we are using an OAS that is in a remote repo, Scemathesis allows you to run tests against both local
remote schemas.
    - For local: `schemathesis run todo.yaml --base-url http://localhost:8080`
    - For remote: `schemathesis run https://raw.githubusercontent.com/redhat-appdev-practice/schemathesis-lab/master/todo.yaml --base-url http://localhost:8080`

        <sub>Note: there should be failures for both of these runs</sub>

## Fix the tests
1. In order to fix the failing tests we need to stub out each of the endpoints that are declared in our OAS
2. Add the following to the TodosApiController:
    ```java

    @Override
    public ResponseEntity<Void> createTodo( Todo todo, Boolean completed) {
        return new ResponseEntity<>(HttpStatus.valueOf(200);

    }

    @Override
    public ResponseEntity<Void> deleteTodo(String todoId) {
        return new ResponseEntity<>(HttpStatus.valueOf(200);

    }

    @Override
    public ResponseEntity<List<Todo>> getTodos( Boolean completed) {

        return new ResponseEntity<>(HttpStatus.valueOf(200);

    }

    @Override
    public ResponseEntity<Void> updateTodo(String todoId, Todo todo) {
        return new ResponseEntity<>(HttpStatus.valueOf(200);

    }
    ```
3. Rerun the tests: `schemathesis run todo.yaml --base-url http://localhost:8080`
4. By default Schemathesis only tests that the response code is less than 500, but there are more options for test cases.  
   Run `schemthesis run --help` to see more testing options, specifically the --checks option.
5. Rerun the tests using all available checks: `schemathesis run todo.yaml --checks all --base-url http://localhost:8080`
6. Update the TodosApiController methods to conform to the OAS:
   ```java
   
    @Override
    public ResponseEntity<Void> createTodo(@Valid Todo todo, @Valid Boolean completed) {
        return new ResponseEntity<>(HttpStatus.valueOf(201));
    }

    @Override
    public ResponseEntity<Void> deleteTodo(String todoId) {
        return new ResponseEntity<>(HttpStatus.valueOf(204));
    }

    @Override
    public ResponseEntity<List<Todo>> getTodos(@Valid Boolean completed) {
        return ResponseEntity.status(200).body(new ArrayList<Todo>() );
    }

    @Override
    public ResponseEntity<Void> updateTodo(String todoId, Todo todo) {
        return new ResponseEntity<>(HttpStatus.valueOf(202));
    }
    ```
7. Run the tests one final time: `schemathesis run todo.yaml --checks all --base-url http://localhost:8080`

## Extra Testing
1. Schemathesis offers added functionality if you want to test a specific part of your application.
2. Create python file test.py:
    ```python
    # test.py
    import schemathesis

    schema = schemathesis.from_path('./todo.yaml')
    schema.base_url = 'http://localhost:8080'

    @schema.parametrize()
    def test_time(case):
        response = case.call()
        assert response.elapsed.total_seconds() < 1
    ```
 3. This is an example to check that all endpoints execute in under a second
