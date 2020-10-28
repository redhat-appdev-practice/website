---
title: Serverless Cloud Native Runtimes
initialOpenGroupIndex: -1
collapsable: true
sidebarDepth: 1
tags:
- serverless
- node.js
- camel
- quarkus
- vert.x
- .net
---

# Serverless Cloud Native Runtimes

## Videos 
<iframe width="560" height="315" src="https://www.youtube.com/embed/zaj3iKFDD4M" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## Setup

Checkout the base project `git clone https://github.com/redhat-appdev-practice/polyglot-knative.git`

## Overview

The purpose of this repository is to give simple examples of Knative serving applications in a range of common languages and frameworks, primarily supported as "Red Hat Cloud Native Runtimes".  The languages / frameworks covered are:

* Node.js
* C#
* Quarkus
* Vert.x
* Spring Boot
* Camel-k

The intention is to use OpenShift S2I tools where possible to perform builds, reducing the need to install specific local tooling e.g. podman, maven.

## OpenShift Environment setup

Install Serverless and Camel-k Operators

Deploy operator subscriptions

`oc apply -f ./deploy/operator-subscriptions.yaml`


Create knative-serving project

`oc new-project knative-serving`

Install knative-serving

`oc apply -f ./deploy/knative-serving.yaml`

It can take some time for Knative serving to be fully installed, you could see some pod restarts, eventually you should see:

```
oc get pods
activator-6c4754ff4-bsvrf           1/1       Running   1          58s
activator-6c4754ff4-dzz4d           1/1       Running   0          43s
autoscaler-7b4c46bbb7-dztqf         1/1       Running   0          57s
autoscaler-hpa-7f8b568cd-7vkhz      1/1       Running   0          47s
autoscaler-hpa-7f8b568cd-qjv69      1/1       Running   0          47s
controller-f4cc995d-jh2fw           1/1       Running   0          47s
controller-f4cc995d-tnqnh           1/1       Running   0          53s
kn-cli-downloads-564559968d-sn6kw   1/1       Running   0          63s
webhook-774d975d98-xhfql            1/1       Running   0          55s
```

Create knative-test project

`oc new-project knative-test`

## Node.js

Build node.js app image

`oc new-build nodejs:12~https://github.com/deewhyweb/polyglot-knative.git --context-dir=/samples/node`

Watch the build logs:

`oc logs -f  -n knative-test  $(oc get pods -o name -n knative-test | grep build)`

Once the image is pushed successfully, and the build is complete we can delete the build pod:

`oc delete pod --field-selector=status.phase==Succeeded -n knative-test`

Deploy the Knative service

`oc apply -f ./deploy/event-display-nodejs.yaml`

Monitor the logs of the node.js Knative service:

`oc logs -f -c user-container -n knative-test  $(oc get pods -o name -n knative-test | grep event-display)` 

Test the Knative service

`curl $(oc get ksvc event-display-nodejs -o custom-columns=url:status.url --no-headers)  -w  "%{time_starttransfer}\n"`


## C#

Build .NET app image

`oc new-build dotnet:3.1~https://github.com/deewhyweb/polyglot-knative.git --context-dir=/samples/csharp  --to="csharp" --name="csharp"`

Watch the build logs:

`oc logs -f  -n knative-test  $(oc get pods -o name -n knative-test | grep build)`

Once the image is pushed successfully, and the build is complete we can delete the build pod:

`oc delete pod --field-selector=status.phase==Succeeded -n knative-test`

Deploy the Knative service

`oc apply -f ./deploy/event-display-csharp.yaml`

Test the Knative service

`curl  $(oc get ksvc event-display-csharp -o custom-columns=url:status.url --no-headers)  -w  "%{time_starttransfer}\n"`

## Quarkus

For the Quarkus build we need to create a modified build config (and an image stream) to allow more resources to the build.  

Create image stream

`oc apply -f ./deploy/is-quarkus-quickstart-native.yaml`

Create the quarkus build config

`oc apply -f ./deploy/quarkus-build-config.yaml`

Watch the build logs:

`oc logs -f  -n knative-test  $(oc get pods -o name -n knative-test | grep build)`

Once the image is pushed successfully, and the build is complete we can delete the build pod:

`oc delete pod --field-selector=status.phase==Succeeded -n knative-test`

Deploy the Knative service

`oc apply -f ./deploy/event-display-quarkus.yaml`

Test the Knative service

`curl $(oc get ksvc event-display-quarkus -o custom-columns=url:status.url --no-headers)  -w  "%{time_starttransfer}\n"`

## vert.x

Create vert.x image stream

`oc apply -f ./deploy/is-vertx.yaml`

Build vert.x image

`oc apply -f ./deploy/vertx-build-config.yaml`

Watch the build logs:

`oc logs -f  -n knative-test  $(oc get pods -o name -n knative-test | grep build)`

Once the image is pushed successfully, and the build is complete we can delete the build pod:

`oc delete pod --field-selector=status.phase==Succeeded -n knative-test`

Deploy the Knative service

`oc apply -f ./deploy/event-display-vertx.yaml`

Test the Knative service

`curl $(oc get ksvc event-display-vertx -o custom-columns=url:status.url --no-headers) -w  "%{time_starttransfer}\n"`

 ## Spring Boot

 Build the Spring Boot app image

 `oc new-build openjdk-8-rhel8:1.1~https://github.com/deewhyweb/polyglot-knative.git --context-dir=/samples/spring  --to="spring" --name="spring"`

 Watch the build logs:

`oc logs -f  -n knative-test  $(oc get pods -o name -n knative-test | grep build)`

Once the image is pushed successfully, and the build is complete we can delete the build pod:

`oc delete pod --field-selector=status.phase==Succeeded -n knative-test`

Deploy the Knative service

`oc apply -f ./deploy/event-display-spring.yaml`

Test the Knative service

`curl $(oc get ksvc event-display-spring -o custom-columns=url:status.url --no-headers) -w  "%{time_starttransfer}\n"`

## Camel-k


Install the Kamel CLI from https://github.com/apache/camel-k/releases

Deploy and configure the Camel-k integration

`kamel run ./samples/Camel-k/Sample.java --name event-display-camel --dependency camel-undertow --env CAMEL_SETBODY="Response received from POD : \\{\\{env:HOSTNAME\\}\\}"`

The camel CLI will create the image build, and create the Knative service from the image.  Run the following commands to watch the progress.



```
oc get it
NAME      PHASE          KIT                        REPLICAS
event-display-camel    Building Kit   kit-bslepn11l893qqtt713g 

```

Wait for the integration to be ready:

```
oc get it
NAME      PHASE     KIT                        REPLICAS
event-display-camel    Running   kit-bslepn11l893qqtt713g   0

```

Once the integration is ready watch the deployment which will create the Knative service.

```
oc get pods
NAME                                       READY     STATUS              RESTARTS   AGE
camel-k-kit-bslepn11l893qqtt713g-1-build   0/1       Completed           0          63s
camel-k-kit-bslepn11l893qqtt713g-builder   0/1       Completed           0          2m19s
event-display-camel-wnnsf-deployment-84744bfbdd-xpdw5   0/2       ContainerCreating   0          6s

oc get deployment
NAME                      READY     UP-TO-DATE   AVAILABLE   AGE
event-display-camel-wnnsf-deployment   0/1       1            0           9s

oc get ksvc      
NAME      URL                                                                             LATESTCREATED   LATESTREADY    READY     REASON
event-display-camel    http://event-display-camel-camelknative.apps.xxx.yourcluster.com   event-display-camel-wnnsf    event-display-camel-wnnsf   Unknown   

```

Once the Knative service is created, test the Knative service

`curl $(oc get ksvc event-display-camel -o custom-columns=url:status.url --no-headers)/test -w  "\n%{time_starttransfer}\n"`

