---
title: Behavior-Driven Development
collasable: true
tags:
- gherkin
- bdd
- behavior
- behaviour
- behavior-driven
- behaviour-driven
---
# Behavior Driven Development

## Video
<iframe width="560" height="315" src="https://www.youtube.com/embed/ZhDSNBoTYJc" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## Intro
In this lab we are going to look at what it takes to add test scenarios to your project to support
Behavior Driven Development(BDD). We will be using the Cucumber library to accomplish this, for more onformation
on that check it out [here](https://cucumber.io/).

## Setup
1. Checkout the base project `git clone https://github.com/redhat-appdev-practice/bdd-lab.git`
2. Navigate to the project `cd bdd-lab`
3. Checkout the starter branch `git checkout starter-branch`

## Inspect the tests
1. Take a look at our feature file, `src/test/resources/com/redhat/todo/todo.feature`
   ![Feature File Screenshot](https://github.com/redhat-appdev-practice/bdd-lab/blob/main/assets/feature.PNG?raw=true)
    - Here you can see our scenarios that are defined in the Gherkin format
    - The tests take the Given,When,Then format
2. Take a look at the class that implements the human readable steps `src/test/java/com/redhat/todo/StepDefsSpring.java`
   ![Step definitions screenshot](https://github.com/redhat-appdev-practice/bdd-lab/blob/main/assets/stepDefs.PNG?raw=true)

## Test a New Behavior
1. To test a new behavior, the first step will be to add the new scenario to our todo.feature file:
    ```gherkin
    Scenario: A Todo can be deleted using it's ID
        Given a todo object exists with an id of 1
        When I delete the todo object with an id of 1
        And I get a todo object with an id of 1
        Then I should get a response of 404
    ```
1. Rerun the tests `mvn clean test`
    - we expect this to fail
    - the output from the test command will include code snippets to implement missing steps
1. Implement the steps, add the following to StepDefsSpring.java:
    ```java
    @Given("a todo object exists with an id of {int}")
        public void an_object_exists(Integer id){
            ResponseEntity<Todo> checkTodo = todoService.getTodo(id);
            Assert.assertNotNull(checkTodo.getBody());
        }

        @When("I delete the todo object with an id of {int}")
        public void delete_with_id(Integer id){
            try {
                ResponseEntity responseEntity = todoService.deleteTodo(id);
                response = responseEntity.getStatusCode().value();
            }
            catch(ResponseStatusException e){
                response = e.getStatus().value();
            }
        }

        @When("I get a todo object with an id of {int}")
        public void get_with_id(Integer id){
            try {
                ResponseEntity responseEntity = todoService.getTodo(id);
                response = responseEntity.getStatusCode().value();

            }
            catch(ResponseStatusException e){
                response = e.getStatus().value();
            }

        }
    ```
1. Run the tests one more time `mvn clean test`
