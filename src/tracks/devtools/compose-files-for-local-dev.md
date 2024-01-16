---
title: Leveraging Compose Files For Efficient Local Development
tags:
- docker
- podman
- compose
- docker-compose
- bootstrap
- microservice
- microservices
- pod
- oauth
- oauth2
- openid
- oidc
- keycloak
- sso
- onboarding
---

# Efficient Local Full-Stack Development Using Docker/Podman Compose

## Video

<iframe width="560" height="315" src="https://www.youtube.com/embed/EkUGbqNPMdc" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

- [Efficient Local Full-Stack Development Using Docker/Podman Compose](#efficient-local-full-stack-development-using-dockerpodman-compose)
  - [Introduction](#introduction)
  - [Pre-Requisites For This Lab](#pre-requisites-for-this-lab)
  - [Installing podman-compose (OPTIONAL)](#installing-podman-compose-optional)
  - [Our Example Stack](#our-example-stack)
  - [Getting Started](#getting-started)
  - [The Basics Of A *Compose* File](#the-basics-of-a-compose-file)
  - [Scripting The Startup](#scripting-the-startup)
  - [OS Compatibility](#os-compatibility)
  - [It's Your Turn!](#its-your-turn)
  - [*Compose* Engine Feature Differences](#compose-engine-feature-differences)
  - [Additional Operations With *Compose* Tools](#additional-operations-with-compose-tools)

## Introduction

For some aspects of building a multi-component or microservices application, it is very useful to have the entire suite of components running in your local development environment to ensure everything integrates as expected. Traditionally, developers may have created complex shell scripts, created Vagrant recipes, or used automation tools like Ansible to achieve this. In this Lab, we will demonstrate an approach which we feel is well aligned with Cloud Native Application Development, and that is the use of **Compose** files.

If you are experienced with Docker container engine, you may already be familiar with a tool called [docker-compose](https://docs.docker.com/compose/). What you may not be aware of is that there is a similar tool for [Podman](https://podman.io/) and it is aptly called [podman-compose](https://github.com/containers/podman-compose). Our experience in using these tools has been that it is an efficient way to shorten feedback cycles while doing development by avoiding the delays of: git commits, pull requests, merges, CI/CD pipelines, and finally deployment to a Dev/Test environment. Those things are still needed and desireable, but shortening feedback cycles means we want other tools in our belts to further reduce overhead before we can confirm functionality and feature fit.

## Pre-Requisites For This Lab

* **EITHER**
  * [Docker](https://www.docker.com/get-started)+[Docker Compose](https://docs.docker.com/compose/install/)
    * On **MacOS/Windows**, ensure that your Docker Machine VM has 4 cores and >=6GB of RAM allocated
    * *IF* you are using `docker`, you **SHOULD** ensure that your user is authorized to execute docker commands.
      * Be aware, giving unprivileged users permissions to the Docker Engine running as root opens a path to [bypass OS security](https://docs.docker.com/engine/security/security/#docker-daemon-attack-surface)!
  * [Podman](https://podman.io/getting-started/)+[Podman Compose](https://github.com/containers/podman-compose)
    * **MUST** be properly configured for [rootless](https://github.com/containers/libpod/blob/master/docs/tutorials/rootless_tutorial.md)

## Installing podman-compose (OPTIONAL)

`podman-compose` can be installed via some package managers on Linux (e.g. dnf install podman-compose). It can also be installed using [pip](https://pypi.org/project/pip/). If you install it using `pip`, you may want to install it in an isolated [virtualenv](https://docs.python-guide.org/dev/virtualenvs/).

### Installing `podman-compose` With `pip`

* OPTIONAL: Create a new virtualenv: `virtualenv compose`
* Install `podman-compose`: `pip install podman-compose`

#### *IF* you use a virtual environment, you **MUST** ensure that you activate that virtualenv every time you want to use `podman-compose`

## Our Example Stack

![Application Stack Diagram](/Multi-Container_Application_Stack.svg)

## Getting Started

There is a [comprehensive reference](https://docs.docker.com/compose/compose-file/) for `compose` files. We will demonstrate how to craft a *Compose* file which can be used with both `docker-compose` and `podman-compose`. There are certain features of Docker Engine which are not compatible directly with Podman and the inverse is also true, and this lab will highlight those mismatches so they can be avoided.

## The Basics Of A *Compose* File

* A Compose file starts like almost any other YAML file, with 3 hyphens (`---`).
* We then specify the Compose file version.
* Next we start to define Services within the Compose file.
  ```yaml
  ---
  version: "3.8"
  services:
    tododb:
      image: docker.io/postgres:latest
    keycloak:
      image: docker.io/jboss/keycloak:10.0.2
    todoapi:
      image: docker.io/maven:3.6.3
    todoui:
      image: node:lts
    oauth2-proxy:
      image: quay.io/oauth2-proxy/oauth2-proxy:latest
  ```
* Each service is keyed on it's name
* Each service specifies either the URI for a container image *OR* a `Dockerfile` to build
  * *IF* you build from a `Dockerfile`, by default the container image will be named the same as the *Service*
* Now, we need to add more information about how to configure those services
  ```yaml
  # ...SNIP
  services:
    tododb:
      image: docker.io/postgres:latest
      environment:
        POSTGRES_USER: tododb
        POSTGRES_PASSWORD: tododb
        POSTGRES_DB: todos
    todoapi:
      image: docker.io/maven:3.6.3
      environment:
        MAVEN_CONFIG: /tmp/.m2
      command:
      - mvn
      - clean
      - compile
      - spring-boot:run
      - '-Dspring-boot.run.profiles=compose'
      - '-Dmaven.repo.local=/tmp/.m2/repository'
      - '-Dspring-boot.run.jvmArguments="-Xrunjdwp:transport=dt_socket,server=y,suspend=n,address=*:5005"'
      user: ${CONTAINER_UID:-1000}
      volumes:
      - ${TODO_API_SERVICE:-../todoapi}:/workspace${CONTAINER_VOLUME_OPTIONS}
      - ${HOME}/.m2/repository:/tmp/.m2/repository${CONTAINER_VOLUME_OPTIONS}
      working_dir: /workspace
      ports:
      - 9080:9080    ## HOST_PORT:CONTAINER_PORT
      - 5005:5005    ## HOST_PORT:CONTAINER_PORT
  # ...SNIP
  ```
* You will notice above that we have defined more of the configuration for both the database service and the API service
  * In the data, we define environment variables to set the DB user/password/database name
  * In the API service we configure:
    * An environment variable to tell Maven where to cache JAR files
    * The command *and it's parameters* to be run inside of the container
    * The **UID** with which the container will run as (defaulting to 1000 if not set)
    * Some volumes:
      * We mount the source code for the API service inside the container as `/workspace`
      * We mount the Maven local repository inside of the container as `/tmp/.m2/repository` so that we keep the Maven artifacts cached between container restarts
    * The default working directory in which we will run commands inside of the container
    * And finally the ports from the API Service we wish to expose to outside of our container
      * Port 9080 for the HTTP interface to the API
      * Port 5005 for the Java remote debugger
* Depending on the services you will use for your application, you will have to configure each service appropriately, but we recommend that you use environment variables as appropriate to keep this flexible for your fellow developers
  ```yaml
  --- # The completed Compose file
  version: "3.8"
  services:
    tododb:
      image: docker.io/postgres:latest
      environment:
        POSTGRES_USER: tododb
        POSTGRES_PASSWORD: tododb
        POSTGRES_DB: todos
    todoapi:
      image: docker.io/maven:3.6.3
      environment:
        MAVEN_CONFIG: /tmp/.m2
      command:
      - mvn
      - clean
      - compile
      - spring-boot:run
      - '-Dspring-boot.run.profiles=compose'
      - '-Dmaven.repo.local=/tmp/.m2/repository'
      - '-Dspring-boot.run.jvmArguments="-Xrunjdwp:transport=dt_socket,server=y,suspend=n,address=*:5005"'
      user: ${CONTAINER_UID:-1000}
      volumes:
      - ${API_SERVICE:-../api}:/workspace
      - ${HOME}/.m2/repository:/tmp/.m2/repository
      working_dir: /workspace
      ports:
      - 9080:9080    ## HOST_PORT:CONTAINER_PORT
      - 5005:5005    ## HOST_PORT:CONTAINER_PORT
    keycloak:
      image: docker.io/jboss/keycloak:10.0.2
      ports:
      - "8080:8080"    ## HOST_PORT:CONTAINER_PORT
      command:
      - '-Dkeycloak.profile.feature.upload_scripts=enabled'
      - '-b'
      - '0.0.0.0'
      environment:
        JAVA_OPTS: '-Dorg.jboss.logmanager.nocolor=true'
        KEYCLOAK_USER: admin
        KEYCLOAK_PASSWORD: admin123
        KEYCLOAK_IMPORT: /tmp/keycloak/realm.json
        DB_VENDOR: h2
      volumes:
      - ./keycloak:/tmp/keycloak${CONTAINER_VOLUME_OPTIONS}
    todoui:
      build:
        context: ./
        dockerfile: Dockerfile.npm_plus_java_jre
      image: npm_plus_jre
      command:
      - npm
      - run
      - compose
      user: ${CONTAINER_UID:-1000}
      volumes:
      - ${UI_SERVICE:-../ui}:/workspace${CONTAINER_VOLUME_OPTIONS}
      working_dir: /workspace
      ports:
      - "3000:3000"    ## HOST_PORT:CONTAINER_PORT
    oauth2-proxy:   # https://oauth2-proxy.github.io/oauth2-proxy/auth-configuration#keycloak-auth-provider
      image: quay.io/oauth2-proxy/oauth2-proxy:latest
      ports:
      - "4180:4180"    ## HOST_PORT:CONTAINER_PORT
      restart: on-failure
      environment:
        OAUTH2_PROXY_PROVIDER: "oidc"
        OAUTH2_PROXY_OIDC_ISSUER_URL: "http://keycloak:8080/auth/realms/TodoApp"
        OAUTH2_PROXY_HTTP_ADDRESS: "0.0.0.0:4180"
        OAUTH2_PROXY_PASS_ACCESS_TOKEN: "false"
        OAUTH2_PROXY_PASS_AUTHORIZATION_HEADER: "true"
        OAUTH2_PROXY_SET_AUTHORIZATION_HEADER: "true"
        OAUTH2_PROXY_SSL_INSECURE_SKIP_VERIFY: "true"
        OAUTH2_PROXY_WHITELIST_DOMAIN: "*"
        OAUTH2_PROXY_COOKIE_DOMAINS: "*"
        OAUTH2_PROXY_COOKIE_SECURE: "false"
        OAUTH2_PROXY_INSECURE_OIDC_ALLOW_UNVERIFIED_EMAIL: "true"
        OAUTH2_PROXY_SKIP_PROVIDER_BUTTON: "true"
        OAUTH2_PROXY_UPSTREAMS: "http://todoui:3000/,http://todoapi:9080/api/v1/"
        OAUTH2_PROXY_COOKIE_SECRET: "fksdZJWUhzlfGw3Ve6POYc2jmjZogjCZ"
        OAUTH2_PROXY_CLIENT_ID: "oauth2-proxy"
        OAUTH2_PROXY_CLIENT_SECRET: "a21c6961-368c-46ad-9cb9-8a0fac72b308"
        OAUTH2_PROXY_EMAIL_DOMAINS: "*"
        OAUTH2_PROXY_REDIRECT_URL: "http://keycloak:4180/oauth2/callback"
        OAUTH2_PROXY_SKIP_AUTH_PREFLIGHT: "true"
        OAUTH2_PROXY_SKIP_AUTH_REGEX: "favicon.ico"
  ```
* There is a lot going on here, so let's talk through some of the new features we are seeing
  * You'll notice that in the `oauth2-proxy` config, we have used a key `restart: on-failure`. This **ONLY** works in `docker-compose` for now and it tells Docker to restart that container automatically when it fails.
    * This container will often fail the first few times until Keycloak is fully running because it needs to request the OpenID Connect configuration from the Keycloak server
  * Additionally, note that we are mounting a volume intended to provide a REALM configuration for Keycloak, then we are passing environment variables to tell Keycloak to load that REALM on startup

## Scripting The Startup

In order to make this *Compose* file work consistently between `docker-compose` and `podman-compose` we need to set different values for some of the environment variables. This is due in large part to the ways that these two different tools work under Linux, Windows, and MacOS X. For example, when using `podman-compose` you set the container *UID* to `0` because podman will use UID/GID mapping to map the `root` UID to your user account's UID. Another example is that in `podman` we may need to account for SELinux constraints, and so we set the `CONTAINER_VOLUME_OPTIONS` to add `:Z` to the end of the volume mount configuration to interface properly with SELinux. When running on Windows or MacOS (and to a lesser extent on Linux) the layers of abstraction for the filesystem in the container can cause performance problems for disk intensive activities, and for that reason we also use the `,delegated` option with our `CONTAINER_VOLUME_OPTIONS` so that disk activity (Read and write) are cached inside of the container. Also for Windows/MacOS, when you have an application which uses natively compiled modules (like node-sass or GoLang or C/C++) then you need to separate your compiled objects for the Host OS from the compiled objects for the container because they are incompatible.

Let's look at an example script which would start this stack using the *Compose* file and environment variables.
```bash
#!/bin/bash

export CONTAINER_UID=${UID:-1000}

## These bind mount options improve performance for applications running
## inside of the container and accessing external files/directories
## Also, `:Z` makes everything work correctly with SELinux
export CONTAINER_VOLUME_OPTIONS=":Z,delegated"

## By default, use the `node_modules` directory directly from the frontend (The default for Linux hosts)
export CONTAINER_NODE_MODULES="${UI_SERVICE:-../ui}/node_modules"

## Detect which Host OS this is running on (If OSTYPE does not exist, we're likely on Windows)
export HOST_OS=${OSTYPE:-windows_nt}

## OS Customizations Via Environment Variables
if [[ "${HOST_OS}" = linux* ]]; then
    ## Linux host, or it should be!
    printf "Detected LINUX host:\n"
fi

if [[ "${HOST_OS}" = windows*  ]]; then
    ## Windows, we believe...
    printf "Detected WINDOWS host:\n"
    ## Use a different directory for node_modules inside the container to avoid
    ## issues with modules compiled natively for Windows
    export CONTAINER_NODE_MODULES="./container_node_modules"
fi

if [[ "${HOST_OS}" = darwin* ]]; then
    ## MacOS, or something is VERY weird...
    printf "Detected DARWIN/MacOS host:\n"
    ## Use a different directory for node_modules inside the container to avoid
    ## issues with modules compiled natively for MacOS
    export CONTAINER_NODE_MODULES="./container_node_modules"
fi

## Check for existing Maven .m2 directory and create it if it does not exist
## This allows for caching of Maven artifacts outside of the container
if ! [[ -d ${HOME}/.m2/repository ]]; then
    mkdir -p ${HOME}/.m2/repository
fi

## Attempt to detect which container engine we should be using.
## By default, if docker is present it will be preferred
which docker-compose >> /dev/null
if [ $? -ne 0 ]; then
    which podman-compose >> /dev/null
    if [ $? -ne 0 ]; then
        printf "Docker/Podman Compose is not currently installed or is not in your PATH. Go HERE to install docker compose: https://docs.docker.com/compose/install/ or here for podman compose: https://github.com/containers/podman-compose\n\n"
    else
        ENGINE=podman
    fi
fi

printf "This script expects that you have the Todo API service and the React Todo UI checked out locally in the directory\n"
printf "just above this directory.\n\n"
printf "You can override the location where these source repositories are located using the following environment variables:\n"
printf "      API_SERVICE\n"
printf "      UI_SERVICE\n\n"

## Check to see if the UI and API source directories exist
if [ -e "${UI_SERVICE:-../ui}" ] && [ -e "${API_SERVICE:-../api}" ]; then

    ## Determine if we are using docker-compose or podman-compose
    if [ "${ENGINE}" = "podman" ]; then
        ## Use UID==0 for Podman and relay on UID/GID mapping to keep permissions aligned with our local shell
        export CONTAINER_UID=0

        ## Podman does not support the `delegated` bind mount option
        ## so it gets removed here
        export CONTAINER_VOLUME_OPTIONS=":Z"

    fi
    ## Setting EXTRA_COMPOSE_OPTIONS to `-d` will run the containers in the background and detach from the terminal
    ${ENGINE:-docker}-compose up${EXTRA_COMPOSE_OPTIONS:""}
fi

printf "In a few minutes, the following services will be available:\n"
printf "\thttp://localhost:9080/ - Todo API Without OAuth Proxy\n"
printf "\thttp://localhost:3000/ - React Todo UI Without OAuth Proxy\n"
printf "\thttp://localhost:4180/ - Todo API AND Todo UI WITH OAuth Proxy\n"
printf "\thttp://localhost:8080/ - KeyCloak with admin:admin123 and some example users\n"
printf "\tjdb://localhost:5005/ - Java Remote Debugger Port\n"
```

We believe you should be able to use this script as a starting point to start up any
application stack using *Compose* files with either `podman` or `docker`. Take a few minutes to read through and make note of the in-line comments to better understand the logic in the script.

## OS Compatibility

Different developers use different operating systems, and we are *all for* choice and preference. As such, we have tested this approach on Linux, MacOS (even Catalina), and Windows 10. This **CAN** work on all of these operating systems. You may find limitations to work around and we would love it if you provide us feedback should you run across an edge case we haven't accounted for.

## It's Your Turn!

Let's take what you have learned so far and apply it to our example application stack.

* Change to a directory where you want to store the source code for the API service, the UI, and the *Compose* project.
* Clone the Todo API with the following command:
  ```
  git clone https://github.com/redhat-appdev-practice/todo-api.git api;
  ```
* Clone the Todo UI with the following command:
  ```
  git clone https://github.com/redhat-appdev-practice/todo-ui.git ui;
  ```
* Create the *Compose* project directory
  ```
  mkdir bootstrap
  cd bootstrap
  ```
* Create the *Compose* file as `docker-compose.yml` in the `bootstrap` directory
* Create the launch script as `localdev.sh` in the `bootstrap` directory
* Make the launch script executable using `chmod 755 localdev.sh`
* Create the `keycloak` directory under `bootstrap` using `mkdir keycloak`
* Download the [REALM](supporting_files/realm.json) file into the `keycloak` directory
* Run the launch script using `./localdev.sh`
  * **NOTE:** if you are using `podman` and `podman-compose`, you may need to manually *start* the `oauth2-proxy` container once Keycloak is fully operational
    * `podman start bootstrap_oauth2-proxy_1`
* If everything went well, you should see the container images being pulled down locally and then the services will be launched.
* Now that everything is running, create an entry in your `/etc/hosts` file which points `127.0.0.1` to the name `keycloak` so that the OAuth2 service names will align
* Open a web browser and browse to http://keycloak:4180/
* You should be redirected to login via Keycloak, try the username and password of `jqconsultant`

## *Compose* Engine Feature Differences

There are some limitations which have to be considered if you wish to remain compatible with both `docker-compose` and `podman-compose`.

* `podman` and `podman-compose` do not support `restart` policies *YET*
  * The current plan from the CRI-O team is that podman v2 will have a Docker compatible API which will then support almost all `docker-compose` features
* You cannot use any specialized [networks](https://docs.docker.com/compose/compose-file/#network-configuration-reference) in your *Compose* file
* You should use the newest version of `podman-compose` as possible for greatest compatibility
* `podman-compose` starts all of the containers in a single [Pod](https://kubernetes.io/docs/concepts/workloads/pods/pod/#what-is-a-pod), which means that all of the containers use a shared network namespace (e.g. the same set of port bindings), but `docker-compose` does not and would allow you to use the same listening port over in different containers
* `podman` on Red Hat Enterprise Linux<sup style="font-size: 0.6em;">&copy;</sup>, Fedora<sup style="font-size: 0.6em;">&copy;</sup>, CentOS<sup style="font-size: 0.6em;">&copy;</sup>, and perhaps other distributions of Linux use SELinux to limit privileges even to the `root` user, and thus you may need [special volume mount options](https://docs.docker.com/storage/bind-mounts/#configure-the-selinux-label) (e.g. `:Z`) appended to make them work properly
* `podman-compose` does not support starting individual containers *YET*

## Additional Operations With *Compose* Tools

* Restart a single container:
  * Podman: `podman restart <container name>`
  * Docker: `docker-compose restart <service name>`
* Stop all containers:
  * Podman: `podman-compose [stop/down]`
  * Docker: `docker-compose [stop/down]`
* Delete all *Compose* containers after stopping:
  * Podman: `podman pod rm <pod name>` - Where the pod name is usually the name of the directory the *Compose* file was run from.
  * Docker: `docker-compose rm [-f]`
* Start a single container which has exited/crashed
  * Podman: `podman start <container name>`
  * Docker: `docker-compose start <service name>`
