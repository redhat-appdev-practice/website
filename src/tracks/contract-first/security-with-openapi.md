---
title: Security with OpenAPI
sidebarDepth: 1
author: James Land
tags:
- openapi
- oauth2
- oidc
- openid
- security
- authorization
- authentication
- access control
- auth
- rest
- api
- specification
---

# OpenAPI Security

## Video
<iframe width="560" height="315" src="https://www.youtube.com/embed/UgjNOqfsGiQ" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## Intro

### Security in OpenAPI

OpenAPI supports multiple types of authentications and authorzations schemes specified with the "security scheme" componenent. This lab will run through a basic overview of each of those schemes and implement the OpenID Connect scheme using the SpringBoot application created in previous labs and KeyCloak. 

## Security Schemes

In OpenAPI 3.0 secuirty schemes are how we define the way in which we want to restrict user's allowed to access our applicaiton based on some sort of authentication. They are defined at the at the "componenet" level (similar to our data schemas) using the "secuirtySchemes" field and a specification can have a single or mulitple security schemes defined. Currently OpenAPI 3.0 supports four main "types" of secuirty schemes. Below is a very brief overview of each of these supported type, but more detailed information can be found in the OpenAPI documentation [here](https://swagger.io/docs/specification/authentication/)

Types of securitySchemes:

  - [HTTP](https://swagger.io/docs/specification/authentication/): Uses the value in the *Authorization* header
    - "scheme":
      - [Basic](https://en.wikipedia.org/wiki/Basic_access_authentication)
        - Authentication requiring a username and password using base64 encryption
        - Format: `Authorization: Basic base64(username:password)`
        - Least secure type of security. Base64 is easily decoded and should only buse used with HTTPS/SSL
          - This really holds true for all secure connections over HTTP
      - [Bearer](https://en.wikipedia.org/wiki/OAuth) 
        - Authentication that uses a token generated from logging into another server
        - Format: `Authorization: Bearer <TOKEN>`
        - Can be part of an oAuth 2 flow but does not have to be
      - [Digest](https://en.wikipedia.org/wiki/Digest_access_authentication)
        - Authentication in which the initial call to the server return 401 Unauthorized, with a nonce(random number) used in a follow-up call with an MD5 hash including that value
      - Any other schema defined by [RFC 7235](https://tools.ietf.org/html/rfc7235) and [HTTP Authentication Scheme Registry](https://www.iana.org/assignments/http-authschemes/http-authschemes.xhtml)
      
    Example:
    ```yaml
    securitySchemes:
      my_http_security_schema:
          scheme: basic
          type: http
    ```
      
  - [API Keys](https://swagger.io/docs/specification/authentication/api-keys/): A flexible way in which you can specify the key you want to use for authentication
    - "in":
      - header
      - query
      - cookie
      
    Example:
    ```yaml
    securitySchemes:
      my_api_security_schema:
          type: apiKey
          name: key
          in: header
    ```
  - [oAuth 2](https://swagger.io/docs/specification/authentication/oauth2/): An api protocol that gives api client limited access to user's data on a separte web server
    - Uses a flow based approache which involves retrieving user info from a seprate resource server after the user allows client api access to some or all of that user's data
    - Flows:
      - Authorization Code: Most common type of flow, used for most server side applications.
        - General Flow:
          - *User* request to login to *Client Application*
          - *Client Application* redirects *User* to *Authorization Server*
          - *Authorization Server* request *User* login and give permissions specified in scope to the *Client Application*
          - Validate credentials and redirect *User* to *Client Application* with a short lived *Authorization Code*
          - *Client Application* uses *Authorization Code* to retrieve *Access Token*
          - *Access Token* Used to retireve data about the *User* from the *Resource Server* 
            - *Access Token* can come an differnt forms such as JWT and can contain more than just the data used to access the *Resource Server*
      - Implicit: Just retrieves *Access Code* rather than token. Used for client side application or anywhere you would not want to store the token data. 
        - Flow similar to the "Authorization Code Flow" flow above, but without retrieving the token
      - Password Flow: Used for first party application which requiure user to enter credentials on *Client Application*
        - Flow similar to "Authorization Code Flow", only client credentials are passed in with redirect to *Authorization Server*
      - Client Credentials Flow: Flow used form machine-to-machine communication
        - Flow normally allows for storing of secret in *Client Application* allowing for direct connection to the *Resource Server*
    - authorizationUrl: *Authorization Server*
    - tokenUrl: *Resource Server*
    - refreshUrl: Optional field that can be used to refresh *Access Token*
    - scopes: The *User* data that the *Client Application* is requesting access to
    
    Example:
    ```
      securitySchemes:
      my_oAuth_security_schema:
        type: oauth2
        flows:
          implicit:
            authorizationUrl: https://api.example.com/oauth2/authorize
            scopes:
              read_acces: read data
              write_access: modify data
    ```
  - [OpenId Connect](https://swagger.io/docs/specification/authentication/openid-connect-discovery/): An identitiy layer built on top of the oAuth 2 flow:
    - "openIdConnectUrl"
      - Discovery endpoint at ".well-known/openid-configuration" that describes the configuration of the oAuth flow
    - Response includes an ID Token which contains user information.

    ```
      securitySchemes:
      my_oAuth_security_schema:
        openIdConnectUrl: 'http://api.example.com/.well-known/openid-configuration'
        type: openIdConnect
    ```
  
## Security Requirements

In the OpenAPI spec security requirements described by the "security" are how we connect one or multiple of our security scheme to either specific endpoint or the entire applicaiton. If security schemes are the "how", then security requirements are the "where".

To apply our security reqiurements to all of our endpoints at a global level then we would just add the `security` tag at the application level as follows:
  ```yaml
  security:
    -
      my_oAuth_security_schema:
        - read
        - write
  ```
  
Security requirements can also be applied at an operation level as follows:
```yaml
get:
    operationId: getTodos
    summary: List All todos
    ...
    security:
        -
            todo-security: []
```

# Lab

## Setup
### Get Keycloak Container

1. Pull  Keycloak Container from quay.io 
```java
podman pull quay.io/keycloak/keycloak
```

### Get code

2. Download OpenAPI Project from github:
```
git clone https://github.com/jland-redhat/rhc_openapi_todo.git
cd rhc_openapi_todo
git checkout security
```

## Instructions

### Update OpenAPI Spec

First we need to add our security scheme changes to the OpenAPI Specification document.

1. Add an OpenAPI Connect Security Scheme
    - Add the following at the "component" level
    ```yaml
    securitySchemes:
        todo-security:
            openIdConnectUrl: 'http://localhost:8081/auth'
            type: openIdConnect
    ```
    - Add global Security Requirements
      - Add the following at the application level
      ```yaml
      security:
        -
          todo-security: []
      ```
      <sub>Note: we do not include scope information here. This is because it will be defined in our OpenId Connect configuration</sub>
2. Regenerate Source code and validate
    - Run `mvn generate-sources`
    - View `gen/com/redhat/todo/TodosApi.java`
    - Validate ApiOperation annotation contains `authorizations = {@Authorization(value = "todo-security")`
      - Note: Authorizaion annotations will be different once OpenAPI Generator switches from OpenAPI 2 to OpenAPI 3 annotations

### Setup Security Realm

Now lets set up the Keycloak secuirity realm. This will serve as the *authorization* and *resource* server for our application to authenticate against. The realm will use the OpenId Connect protocol.

1. Start your Keycloak server on port 8081
  ```sh
  podman run -d -p 8081:8080 -e KEYCLOAK_USER=admin -e KEYCLOAK_PASSWORD=admin -e DB_VENDOR=H2  quay.io/keycloak/keycloak
  ```
2. Validate your Keyclaok server is up by navigating to `http://localhost:8081/` in a browser
    - It may take a minute for the container to start completly
3.  Login to keycloak
    - Click the "Administration Console" link
    - Default Login for Keycloak
      - Username: admin
      - password: admin 
    - Should now be on the "Master" realm settings
   ![KeyCloak](/keycloak.png)
4. Create todoRealm
    - "Select realm" -> "Add Realm"
      - Name: todoRealm
      - Click Create
5. Create Client. The *Authorization Server* used to connect to KeyCloak
    - "Clients" -> "Create"
      - Name: openid-login-client
      - Client Protocol "openid-connect"
      - Click Create
    - Update client to allow for redirects from our localhost client application
      - Valid Redirect URLs: http://localhost:8080/*
      - Click save
6. Create Roles
    - Create "read_access" and "write_access" roles
      - Roles -> Add Role
        - Role Name: read_access
        - Click Create
        - Repeat for write_access
7. Create Test User
    - Users -> Add User
      - Username: todo-user
      - Email: forthenorth@thewall.org
      - First Name: Jon
      - Last Name: Snow
      - Email Verified: On
      - Click Save
    - Add Roles
      - Role Mapping tab
        - Select "read_access" and "write_access" from the Available Roles
          - Optional: Just add read access and come back and add write_access after TODO: Add specific step
        - Add selected
    - Add Credentials
      - Credentials Tab
        - Password/Password Confirmation: password
        - Temporary: Off
        - Click Reset Password
        - Confirm
        
### Code Walkthrough

The changes made in order to allow the spring-boot application to connect to keycloak have already been made. But lets quickly walk through them. If you would like to find out more information about this dependency or how to hook it up to spring security [here](https://www.baeldung.com/spring-boot-keycloak) is a link to a tutorial for doing just that.

1.  Inside the `pom.xml` we added the following dependency
    ```xml
    <!--Keycloak Dependency-->
    <dependency>
        <groupId>org.keycloak</groupId>
        <artifactId>keycloak-spring-boot-starter</artifactId>
        <version>10.0.1</version>
    </dependency>
    </dependencies>
    ```
2. View properties to connect to keycloak
    - Basic properties for connecting to the realm:
      ```properties
      #Keycloak Properties
      keycloak.auth-server-url=http://localhost:8081/auth
      keycloak.realm=todoRealm
      #Client
      keycloak.resource=openid-login-client
      keycloak.public-client=true
      ```
  - The keycloak starter library can take advantage of spring-boot's auto-configuration feature to set security on specific endpoint based on the `security-constraints` properties
      - Allow a user with the `read_access` role to use all GET methods under todos
        ```properties
        #Authorized Roles
        keycloak.security-constraints[0].authRoles[0]=read_access
        #Authorized Paths
        keycloak.security-constraints[0].securityCollections[0].patterns[0]=/v1/todos
        keycloak.security-constraints[0].securityCollections[0].patterns[1]=/v1/todos/*
        #Authorized Operations
        keycloak.security-constraints[0].securityCollections[0].methods[0]=GET
        ```
      - Allow a user with the `write_access` role use all methods under todos
        ```properties
        #Authorized Roles
        keycloak.security-constraints[2].authRoles[0]=write_access
        #Authorized Paths
        keycloak.security-constraints[2].securityCollections[0].patterns[0]=/v1/todos
        keycloak.security-constraints[2].securityCollections[0].patterns[1]=/v1/todos/*
        #Authorized Operations
        keycloak.security-constraints[2].securityCollections[0].methods[0]=GET
        keycloak.security-constraints[2].securityCollections[0].methods[1]=PUT
        keycloak.security-constraints[2].securityCollections[0].methods[2]=POST
        keycloak.security-constraints[2].securityCollections[0].methods[3]=DELETE
        ```
3. Created `OpenApiController.java`
    - Note the `getUserDetails()` method. This was created to demonstrate the Identity Layer built on top of the oAuth2 flow.
  
<sub>In the video I mentioned the "super" role was required and I would explain more in the lab. When securing endpoint/methods in using the keycloak starter library any endpoint whose pattern and method are not explicity covered by the properties are not secured. Meaning in the example above if we did not include the "write_access" role then all PUT/POST/DELETE methods would not authroize against keycloak</sub>

### Validate oAuth 

Validate 

1. Start spring-boot application
  ```sh
  mvn spring-boot:run
  ```
2. Navigate to `localhost:8080/swagger-ui.html`
3. Validate an open padlock symbol appears on all of the endpoints you have secured
4. Attempt to hit the `/todos` endpoint through the swagger page
    - Will return a "TypeError: Failed to fetch" error
    - SwaggerUI for OpenAPI 2.0 currently can not do redirect to the authorization page directly through the UI.
5. Start oAuth 2.0 flow
    - Navigate to `http://localhost:8080/v1/todos` in a new window
      - Should be forwarded to KeyCloak login page
      - Note you are now on "localhost:8081"
      - Login page should be for the "TODOREALM"
    - Login to keycloak
      - user:todo-user
      - password: password  
    - Should be redirected to back to "localhost:8080" with a set of results
6. Explore the swagger-ui's todos endpoints
    - Executing any of the GET endpoints on the swagger ui should return a 200
      - The *authorization token* is now being stored by the application on the backend.
      - Note: If you followed the optional task above and did not include the "write_access" then all non-GET methods will return a 403
        - Return back to the KeyCloak server's todo-user config page
        - Add the "write_access" role from the roles tab
        - Refresh your *authorization token*
          - Restart spring-boot application
          - Navigate to "http://localhost:8080/v1/todos" in a new browser window
        - Validate the POST endpoint no longer returns a 403
7. Expore OpeniD Connect's Identity Layer
    - Run the "/user/details" endpoint in the OpenAPI controller
      ```json
      {
        "exp": 1592311027,
        "iat": 1592310727,
        "auth_time": 1592309991,
        "jti": "06fba00f-390a-4fd3-bd01-a3cd9a9ff450",
        "iss": "http://localhost:8081/auth/realms/todoRealm",
        "aud": "openid-login-client",
        "sub": "7f2387cb-4773-4478-9715-50f2826be1dd",
        "typ": "ID",
        "azp": "openid-login-client",
        "session_state": "7b2f6b84-df0d-499d-9544-cd1b9561296c",
        "name": "Jon Snow",
        "given_name": "Jon",
        "family_name": "Snow",
        "preferred_username": "todo-user",
        "email": "forthenorth@thewall.org",
        "email_verified": true,
        "acr": "0"
      }
      ```
        - Contains information about the token
          - **iss**: Issuer
          - **exp**: Token Expiration date
          - **iat**: Issued at
        - Contains the OpenID Connect "Identity Layer" infomration about the user 
          - **given_name**: First Name
          - **family_name**: Last Name
          - **email**: Email
    - More information about the different values can be found [here](https://www.iana.org/assignments/jwt/jwt.xhtml)


### Clean Up

1. Stop your KeyCloak container
  - Find Keycloak's container id with `podman ps`
  ```
  CONTAINER ID  IMAGE                             COMMAND     CREATED       STATUS           PORTS                   NAMES
  4202c7f0a9e0  quay.io/keycloak/keycloak:latest  -b 0.0.0.0  17 hours ago  Up 17 hours ago  0.0.0.0:8081->8080/tcp  amazing_lamport 
  ```
  - Kill container with `podman kill 4202c7f0a9e0`

# Wrap Up

We explored the different types of http security avalible in OpenAPI. And set up our spring-boot application with security by connecting to a Keycloak server using the OpenID Connect protocal. And were able to validate our application as well as explore the Identity Layer that OpenID Connect adds on to the normal oAuth 2 flow.
