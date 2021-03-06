---
title: Contract-First With UI Development
initialOpenGroupIndex: -1
collapsable: true
sidebarDepth: 1
tags:
- contract-first
- openapi
- openapi-generator
- fakeit
- api
- rest
- vuejs
- vue
- angular
- prism
- automation
- cloud-native
- spa
- single-page app
- javascript
- typescript
---
# Applying Contract-First Development To UI/UX


:::: tabs cache-lifetime="10" :options="{ useUrlFragment: false }"

::: tab "Angular + Prism"

## Video

<iframe width="560" height="315" src="https://www.youtube.com/embed/RcpmtPmNS2M" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

In most of the other segments we have focused on applying contracts to the creation of the API server or the backend. I would like to state that I feel that is far **more** important to apply contracts to the development of a UI. Why? Generally, user interfaces are what stakeholders need to see in order to determine product-market fit. In other words, if they cannot see and interact with the user interface, they cannot tell if the application we are developing solves the problem it is meant to solve. In my experience, that means that showing a UI which is at least somewhat functional is far more important that a completed or functional backend/API.

Some may ask "Without a backend, how can I tell if my UI is functional?" That's the key goal of this segment. Showing you how you can build, test, and validate a UI and the associated user experience without having an API at all. By leveraging tools available via Contract-First techniques.

[[toc]]

## Prerequisites

* NodeJS >= 12.x
* NPM >= 6.14.x
* Java JRE >= 1.8.x
* An IDE, preferably one with support for TypeScript
* Ruby >= 2.6.x
* Gem (Ruby Gem) >= 3.0.x
* Git

## Setting Up

We're going to start with the beginnings of a user interface created using [Angular 11](https://angular.io/) & [Angular Material](https://material.angular.io/). The choice of the framework/toolkit for the UI is not really important. What is important is the workflow of how we implement the UI, update the API Spec, interface with the API, and do development using a Mock API server.

### Install The Tools
* prism - A Mock API server which generates "fake" responses based on the definitions in an OpenAPI Specification
  * `npm install -g @stoplight/prism-cli`
* Angular CLI - The CLI tool for creating and building Angular applications
  * `npm install -g @angular/cli`
* OpenAPI Generator CLI - A CLI tool for generating code from an OpenAPI Specification file
  * `npm install -g @openapitools/openapi-generator-cli`

### Clone The Repo

```
git clone https://github.com/redhat-appdev-practice/angular-material-prism-openapi.git
cd angular-material-prism-openapi
```

## Developing An Angular UI Using Contract-First Tooling

### Set up our build environment
1. Open the source directory in your favorite IDE
1. Open the `openapi.yml` file in the root of the project. You will notice that there is currently only a single operation defined for a "health check" endpoint.
1. In a terminal, run `npm i` to install the required dependencies
1. You may note, if you are familiar with Angular, that routing and a Material navigation component have already been created and configured. The example project also already has 2 stubbed components for the Todo List and for creating a New Todo item.
1. Add *npm-watch* as a "dev" dependency. We will use it to "watch" for changes to files and restart certain tools.
   * `yarn add -D npm-watch`
1. Add new "script"s to the `package.json` file as shown:
   ```json
   "watch": "npm-watch",
   "prism": "prism mock -d --cors openapi.yml",
   "openapi": "rm -f src/sdk; mkdir src/sdk; openapi-generator-cli generate -g typescript-angular -i openapi.yml -o src/sdk/",
   ```
1. Add a new "watch" section to your `package.json` after the "scripts" section.
   ```json
   "watch": {
       "openapi": "openapi.yml",
       "prism": {
           "patterns": ["openapi.yml"],
           "inherit": true
       },
       "start": "yarn.lock"
   },
   ```
   * This is allows us to (re)start components automatically as needed while we develop
   * Each time the OpenAPI Spec file changes, the Angular Services will be regenerated and the Prism mock server will be updated. The Angular Dev server will only restart if we change our underlying libraries.
1. Start all of our tooling using the command `npm run watch`
   * Prism will start a Mock API server on port 4010
   * OpenAPI Generate will output a set of Angular Services based on the contents of the `openapi.yml` file
   * Angular dev server will start running on port 4200

### Create Models In The API Specification

Before we can start using the API to perform CRUD operations, we need to know the data types we will be operating on. In our imaginary situation, we need a **Todo** model. We can add this model to the `openapi.yml` file in a new section as shown:

```yaml
components:
  schemas:
    NewTodo:
      type: object
      properties:
        title:
          type: string
          maxLength: 255
        description:
          type: string
        id:
          type: string
          format: uuid
```

If we add this to the bottom of our `openapi.yml` file and save the file, we should see the `openapi-generator-cli` regenerate our code under `src/sdk/model` and we'll now see a `newTodo.ts` file. That models is perfect for when we **POST** a new todo item to our API. Let's create another model for all other use cases.

```yaml
    Todo:
      type: object
      required:
      - id
      allOf:
      - $ref: '#/components/schemas/NewTodo'
```

This will define a new Model called **Todo**, which inherits all of the properties of **NewTodo**, but also sets an extra constraint which requires the `id` field to be set.

### Define CRUD Operations In The OpenAPI Specification File

Now that we have the models defined, we can use those models to define API CRUD operations:

#### Get All Todos

```yaml
paths:
  /todos:
    get:
      description: Get all todos
      operationId: getAllTodos
      tags:
        - todos
      responses:
        '200':
          description: 'OK'
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Todo'
```

#### Add New Todo

```yaml
    post:
      description: 'Add new Todo'
      operationId: addNewTodo
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/NewTodo'
      responses:
        '200':
          description: 'OK'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Todo'
```

#### Get Todo By ID

```yaml
  /todo/{id}:
    parameters:
    - in: path
        name: id
        required: true
        schema:
        type: string
        format: uuid
    get:
      operationId: getTodoById
      tags:
        - todos
      responses:
        '200':
          description: 'OK'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Todo'
```

#### Delete Todo By Id

Place this just after the `get` operation defined above an at the same indentation level

```yaml
    delete:
      operationId: deleteTodoById
      tags:
        - todos
      responses:
        '204':
          description: 'No content'
```

#### Update Todo By Id

```yaml
    put:
      operationId: updateTodoById
      tags:
        - todos
      responses:
        '200':
          description: 'OK'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Todo'
```

### Add The Generated Angular Services In Our TodoListComponent

1. Open `src/app/todo-list/todo-list.component.ts`
1. Import `HttpClient`, `Todo`, `TodosService`, and the `Configuration` types.
   ```typescript
   import { HttpClient } from '@angular/common/http';
   import { Configuration } from 'src/sdk';
   import { TodosService } from '../../sdk/api/todo.service.ts';
   import { Todo } from '../../sdk/model/todo';
   ```
1. Add new fields and constants to the `TodoListComponent` class as follows:
   ```typescript
   export class TodoListComponent implements OnInit {

     API_BASE_URL = 'http://localhost:4010';

     todoService: TodosService;

     todos: Todo[] = [];

     // SNIP....
   ```
1. Instantiate/Create the todoService in the constructor, then configure it to update the Todo list
   ```typescript
   constructor(private httpClient: HttpClient) {
     this.todoService = new TodosService(httpClient, this.API_BASE_URL, new Configuration({
       basePath: this.API_BASE_URL
     }));
     this.todoService.getAllTodos().subscribe({
       next: todos => this.todos = todos,
       complete: () => console.log('End of todos observable'),
       error: err => console.error(err)
     });
   }
   ```

### Use The Todos Array In The HTML Template

We now will have a component which will load our Mock Todos from our Mock API automatically when it is loaded. We can then implement HTML Template code which will take advantage of that.

1. Install the Angular Flex Layout module
   * `ng add @angular/flex-layout`
1. Add FlexLayoutModule to `src/app/app.modules.ts`
   ```typescript
   import { FlexLayoutModule } from '@angular/flex-layout';

   // SNIP

   @NgModule({
   declarations: [
     // SNIP
   ],
   imports: [
     // SNIP
     FlexLayoutModule
   ],
   ```
1. Open the file `src/app/todo-list/todos-list.component.html`
1. Add the following structure:
   ```html
   <div>
     <div fxLayout="row" fxLayoutAlign="start start">
       <div class="header" fxFlex="25%">Title</div>
       <div class="header" fxFlex="75%">Description</div>
     </div>
     <div *ngFor="let todo of todos" fxLayout="row" fxLayoutAlign="start start">
       <div fxFlex="25%">{{ todo.title }}</div>
       <div fxFlex="75%">{{ todo.description }}</div>
     </div>
   </div>
   ```
1. Open the file `src/app/todo-list/todos-list.component.css`
1. Add the following to implement our FlexBox arrangement:
   ```css
   .header {
     background-color: #EAEAEA;
     border-left: 1px solid #6A6A6A;
     color: black;
     font-size: 2rem;
     text-align: center;
     height: 2.4rem;
     padding: 0.3rem;
   }
   ```
1. View the updated page and you should see something like:
   ![Rendered Angular Grid With Prism Data](/angular-prism-rendered-table.png)

:::

::: tab "VueJS + FakeIt" id="first-tab"
## Video

<iframe width="560" height="315" src="https://www.youtube.com/embed/RcpmtPmNS2M" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

In most of the other segments we have focused on applying contracts to the creation of the API server or the backend. I would like to state that I feel that is far **more** important to apply contracts to the development of a UI. Why? Generally, user interfaces are what stakeholders need to see in order to determine product-market fit. In other words, if they cannot see and interact with the user interface, they cannot tell if the application we are developing solves the problem it is meant to solve. In my experience, that means that showing a UI which is at least somewhat functional is far more important that a completed or functional backend/API.

Some may ask "Without a backend, how can I tell if my UI is functional?" That's the key goal of this segment. Showing you how you can build, test, and validate a UI and the associated user experience without having an API at all. By leveraging tools available via Contract-First techniques.

[[toc]]

## Prerequisites

* NodeJS >= 12.x
* NPM >= 6.14.x
* Java JRE >= 1.8.x
* An IDE, preferably one with support for TypeScript
* Ruby >= 2.6.x
* Gem (Ruby Gem) >= 3.0.x
* Git

## Setting Up

We're going to start with the beginnings of a user interface created using [VueJS](https://vuejs.org/) and [Quasar Framework](https://quasar.dev). The choice of the framework/toolkit for the UI is not really important. What is important is the workflow of how we implement the UI, update the API Spec,
interface with the API, and do development using a Mock API server.

### Install The Tools

* fakeit - A Ruby Mock API Server which generates "fake" responses based on the definitions in an OpenAPI Specification
  * `gem install fakeit` - On some systems, this may need to be prefaced with `sudo`
* Quasar - A framework built on top of VueJS to allow for rapid cross-platform UI implementation
  * `npm install @quasar/cli` - On some systems, this may need to be prefaced with `sudo`

### Clone the repository

```
git clone git@github.com:redhat-appdev-practice/contract-first-ui.git
cd contract-first-ui
```

## Developing A VueJS UI Using Contract-First Tooling

### Set up our build environment
1. Open the source directory in your IDE
1. Open the `openapi.yml` file in the root of the source directory
   * Note that the `NewTodo` type has 3 fields defined: `id`, `title`, `complete`
1. In a terminal, run `npm install` to download the project dependencies. This may take a few minutes.
1. In another terminal session, start the `fakeit` Mock API server
   * `fakeit --spec openapi.yml --port 7080`
1. In another terminal session, let's install some additional dev dependencies
   * `npm install --save-dev @openapitools/openapi-generator-cli npm-watch`
1. Open the `package.json` and let's create 2 new entries in the `scripts` block:
    ```json
    "build:client": "openapi-generator generate -i openapi.yml -g typescript-axios -o src/apiClient",
    "watch": "npm-watch",
    ```
   * The first script will use OpenAPI Generator to generate an API Client SDK using TypeScript and [Axios](https://github.com/axios/axios)
   * The second script will use `npm-watch` as configured next.
1. Add a new `watch` block to the `package.json`
    ```json
    "watch": {
        "build:client": "openapi.yml"
    }
    ```
   * This will watch for changes in the `openapi.yml` and automatically run the `build:client` script when it changes.
1. In a free terminal, start the watch for the API Client SDK:
    `npm run watch`
1. In another free terminal, start the UI in dev mode
   * `quasar dev`
   * This will launch the Quasar/Vue app in "dev" mode, meaning that it will automatically reload in the browser every time we make a change in the code.

### Add The API Client SDK to the Quasar Application
1. Let's connect our API client to our running application. In your IDE, open the file `src/boot/axios.ts`
   * Remove the existing code, and add the following: 
     ```typescript
     import Vue from 'vue';
     import { TodosApi } from '../apiClient/index';

     // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
     Vue.prototype.$api = { todos: new TodosApi() };
     ```
   * This snippet will force Quasar to attach our API SDK to the Vue components in our application, this it will be accessible everywhere in our application

### Demonstrate How To Mock The API For Unit Tests
1. Let's write a unit test for our `MainLayout` component where we verify that we can use the API Client to retrieve Todos from our API server
   * `test/jest/__tests__/MainLayout.spec.ts`
        ```typescript
        /* eslint-disable */
        /**
        * @jest-environment jsdom
        */

        import { shallowMount, createLocalVue } from '@vue/test-utils';
        import { jest, expect } from '@jest/globals';
        import * as All from 'quasar';

        // @ts-ignore
        import MainLayout from 'src/layouts/MainLayout.vue';
        import { Vue } from 'vue-property-decorator';
        import VueRouter from 'vue-router';

        const { Quasar } = All;

        const components = Object.keys(All).reduce((object, key) => {
            // @ts-ignore
        const val = All[key]
            if (val && val.component && val.component.name != null) {
                // @ts-ignore
            object[key] = val
            }
            return object
        }, {});

        describe('MainLayout', () => {

            const localVue = createLocalVue();
            localVue.use(Quasar, { components });
            localVue.use(VueRouter);

            it('attempts to load Todo items when mounted', async () => {
                // Mock the `getTodos` method from the API Client SDK
                const mockGetTodos = jest.fn();
                const mockStoreCommit = jest.fn();
                const mockLoadingShow = jest.fn();
                const mockLoadingHide = jest.fn();

                // Tell the mock to return an empty list when invoked
                mockGetTodos.mockResolvedValue({ data: [] });

                // Create the `mocks` object to be passed to `shallowMount` with our mocked API method
                const mocks = {
                    '$q': {
                        loading: {
                            show: mockLoadingShow,
                            hide: mockLoadingHide
                        }
                    },
                    '$api': {
                        todos: {
                            getTodos: mockGetTodos
                        }
                    },
                    '$store': {
                        commit: mockStoreCommit
                    }
                };
                const wrapper = shallowMount(MainLayout, { localVue, mocks })
                await Vue.nextTick();

                expect(mockGetTodos).toHaveBeenCalled();
                expect(mockStoreCommit).toHaveBeenCalled();
                expect(mockLoadingShow).toHaveBeenCalled();
                expect(mockLoadingHide).toHaveBeenCalled();
            })
        })
        ```
   * Running this test will fail because we have not implemented the API client in our component yet, so let's do that.
1. Implement the `mounted` method in the `MainLayout` component
    ```typescript
    import { Vue, Component } from 'vue-property-decorator';
    import { AxiosError, AxiosResponse } from 'axios';

    @Component
    export default class MainLayout extends Vue {
        mounted() {
            this.$q.loading.show(); // Show loading indicator
            this.$api.todos.getTodos()
                .then(this.loadTodosOnMount)
                .catch(this.handleApiError);
        }

        loadTodosOnMount(response: AxiosResponse) {
            this.$q.loading.hide(); // Hide loading indicator
            this.$store.commit('app/loadTodos', response.data);  // Store the loaded Todos in the global Vuex state
        }

        handleApiError(err: AxiosError) {
            this.$q.loading.hide(); // Hide loading indicator
            this.$q.notify({  // Notify the user of the error using a snackbar
                type: 'warning',
                message: `Error loading data from server: ${err.message}`
            });
        }
    }
    ```
   * And now, running our test will pass!
   * **NOTE:** When you save the `MainLayout.vue` file, in your browser you should immediately see data show up in the grid as well!

### Actual Contract-First UI Development
1. In your browser, load the app (http://localhost:8080)
1. In your IDE, load `src/pages/Index.vue`
1. Note that if you reload the page and monitor the Developer tools in your browser, you should see a request to http://localhost:7080/todos
   * This is the `mounted` method on the `MainLayout` page executing.
   * The data retrieved is stored in Vuex and then rendered by `Index.vue` as a list of Todo items as shown below

   ![Todo App With Random Data](/TodoListAppRandomData.png)
1. At this point, assume that one or more of our stakeholders has seen this application and decided that we need to add some fields to our Todo
   * We need to add a long `description` field
   * We need to add a due date
1. Open the `openapi.yml` file and add those new fields to the `NewTodo` schema
    ```yaml
    components:
    schemas:
        NewTodo:
        title: NewTodo
        description: A Todo list item
        required:
            - title
        type: object
        properties:
            id:
                format: uuid
                type: string
            title:
                type: string
            description:
                type: string
            complete:
                type: boolean
            dueDate:
                type: string
                format: date
    ```
   * When we save the API Spec, our `watch`ers should automatically rebuild our Client SDK and those fields will
     be available in our IDE. 
   * Also, our `fakeit` Mock API Server will have loaded the changed API Spec and will now return those new fields when we request Todo items
1. Let's add the `description` field to our UI by way of an `expansion-item` component in `Index.vue`.
   * Replace the `<q-item>&#123;&#123; todo.title }}</q-item>` with:
    ```html
        <q-expansion-item
            header-style="width=100%;"
            v-if="todo.description"
            dense
            :label="todo.title"
          >
            <q-card v-if="todo.description" style="background-color: inherit;">
              <q-card-section>&#123;&#123; todo.description }}</q-card-section>
            </q-card>
          </q-expansion-item>
          <q-item v-else>&#123;&#123; todo.title }}</q-item>
    ```
   * As soon as you save that change, you should immediately see the page reload and the expansion item will be visible.
     * **NOTE:** You *MAY* need to reload the page manually for the new data from the API to be displayed
     ![Todo App With Description Added](/TodoListWithDescriptionAdded.png)
1. Now, add the `dueDate` to `Index.vue`.
   * Add a `filter` to the `Index.vue` component
    ```typescript
    @Component({
    computed: {
        ...mapState(['app'])
    },
    filters: {
        daysRemaining: function(dueDate) {
        if (dueDate === undefined || dueDate === null || dueDate == '') {
            return '';
        }
        const dueDate = new Date(dueDate);
        const today = new Date();
        dueDate.setHours(0, 0, 0);
        today.setHours(0,0,0);
        const millisInSecond = 1000;
        const secondsInMinute = 60;
        const minutesPerHour = 60;
        const hoursPerDay = 24;
        const toDaysConversion = millisInSecond*secondsInMinute*minutesPerHour*hoursPerDay;
        const differenceInDays = Math.round((dueDate-today)/toDaysConversion);
        if (differenceInDays<0) {
            return `${Math.abs(differenceInDays)} days ago`;
        } else if (differenceInDays == 0) {
            return 'Today';
        } else {
            return `${differenceInDays} days`
        }
        }
    }
    })
    ```
   * Add a new column to the display grid with a heading of `Due`
    ```html
    <div class="row header-title">
      <div class="action-buttons col-1">&nbsp;</div>
      <div class="col-grow">Title</div>
      <div class="narrow centered col-1">Due</div>
      <div class="narrow centered col-1">
        <q-icon name="check" />
      </div>
    </div>
    ```
   * Add the due date display just above the `div` for the `q-checkbox`
    ```html
    <div class="narrow centered col-1">
        <q-icon name="done"
        v-if="isOverdue(todo.dueDate)"
        class="text-red"
        style="font-size: 1.5rem;"
        />
        &#123;&#123; todo.dueDate | daysRemaining }}
    </div>
    <div class="narrow centered col-1">
        <q-checkbox @input="toggleComplete(todo)" :value="todo.complete" />
    </div>
    ```
   * Add the `isOverdue` method to the Component Class
    ```typescript
    /**
     * Check the dueDate versus the current date to see if an item is overdue.
     */
    isOverdue(dueDate: string) {
        const parsedDueDate = new Date(dueDate).setHours(0,0,0);
        const currentDate = new Date().setHours(0,0,0);
        return (parsedDueDate-currentDate) < 0;
    }
    ```
   * Save the file and you should see the new column displayed
   ![Todo List With Due Date Added](/TodoAppWithDueDateAdded.png)

## Key Takeaways

At this point, I hope that it's obvious how quickly your UI can evolve and still be assured that it will work with an API developed using Contract-First approaches. The key takeaways here are:
* Always use the openapi-generator to build your Client SDK and never store that Client SDK in source control.
* Your OpenAPI Spec should be the "source of truth"
* Use tools like `fakeit` to allow you to shorten feedback cycles
* Mock the Client SDK when you implement unit tests

### Extra Credit
1. See if you can implement the 2 new fields in the `EditTodo` component!
:::
::::