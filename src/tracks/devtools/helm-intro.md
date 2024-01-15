---
title: Helm Intro
tags:
- helm
- cloud
- openshift
- golang
- infrastructure
- ci-cd
- continuous integration
- automation
---
::: v-pre
# Introduction to Helm


## Videos 
<iframe width="560" height="315" src="https://www.youtube.com/embed/2jEPTw_UJPk" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>


## What is Helm?

[Helm](https://helm.sh) is a Kubernetes package manager that is quickly becoming one of the go-to methods for infrastructure-as-code in the cloud. Helm uses a templating language based on Golang in order to deploy and track user created templates known as "Charts" using the Kubernetes API. In this lab we are going to look at some of the basic concepts of creating and deploying a Helm chart.

## Lab

## Prerequisites

* OpenShift 3.11+ Cluster
	* [CodeReady Containers](https://developers.redhat.com/products/codeready-containers/getting-started/) can be used locally if you do not have access to a lab environment

### Installing Helm:

It is recommended that you install the Helm CLI that is packaged with the OpenShift version you are using. This can be found on your instance by hitting the `?` in the top right and choosing `Command Line Tools`. 

![Helm Install](/devtools/helm_intro/download.png)

Helm can also be installed directly from [here](https://helm.sh/docs/intro/install).

### Creating a Helm Chart

In order to create a basic Helm chart we can simply run the command `helm create example`. This will create a Helm chart inside a local `example` directory.

Now if we navigate inside of `example` and run `tree` we should see the following structure:

```
├── charts
├── Chart.yaml
├── templates
│   ├── deployment.yaml
│   ├── _helpers.tpl
│   ├── hpa.yaml
│   ├── ingress.yaml
│   ├── NOTES.txt
│   ├── serviceaccount.yaml
│   ├── service.yaml
│   └── tests
│       └── test-connection.yaml
└── values.yaml
```

Best practices when creating a Helm chart is to break each Kubernetes resource you are trying to deploy into it's own file and give it a name based on the resources's type. So as you can probably guess by the file names, when deployed this chart will create a `Deployment` with a `HorizontalPodScaler` and a `ServiceAccount`. We will expose the `Deployment` using a `Service` and `Ingress` controller. Under normal circumstances this is a good starting point for creating a new chart. For the purposes of this lab we want to keep our chart extremely simple, so we are going to remove all of our template files and clear our `values.yaml`.

To do this:
* Remove all the files in our template folder with `rm -r templates/*`
* Clear our values.yaml file with `rm values.yaml && touch values.yaml`

Now, let's replace the files we removed with a new deployment template file named `deployment.yaml`. In order to create this file we can take advantage of the OpenShift UI or use the `Deployment` provided below.

Using the OpenShift UI: 
* On the `Administrator` tab navigate to `Workloads` -> `Deployments`
* Click the `Create Deployment` button
* Remove the `namespace` line from the provided yaml
* Copy the provided yaml into `templates/deployment.yaml`

![OpenShift Deployment](/devtools/helm_intro/deployment.png)

Using the Provided Deployment config:
* Copy the following Deployment config

#### **`templates/deployment.yaml`**
```
apiVersion: apps/v1
kind: Deployment
metadata:
  name: example
spec:
  selector:
    matchLabels:
      app: hello-openshift
  replicas: 3
  template:
    metadata:
      labels:
        app: hello-openshift
    spec:
      containers:
        - name: hello-openshift
          image: openshift/hello-openshift
          ports:
            - containerPort: 8080
```


Next, let's add some basic [templating](https://helm.sh/docs/chart_template_guide/) to our Helm chart. 

* Replace `replicas: 3` with `replicas: {{ $.Values.replicaCount }}` inside of our `templates/deployment.yaml`
* Add `replicaCount: 3` to the `values.yaml` file.\
<sub>Note: We will go further into depth on templating later in our lab</sub>

Finally, let's deploy our chart. Validate that you are inside of the `example` directory. Make sure you are logged into your cluster with `oc login` then run:
```
helm install test-release .
```

You should see something similar to the following. If so, congrats you have just created and deployed a Helm chart!
```
NAME: test-release
LAST DEPLOYED: Mon Jan  4 11:39:41 2021
NAMESPACE: test-project
STATUS: deployed
REVISION: 1
TEST SUITE: None
```

### View our Helm Chart

Now that we have created a Helm chart and deployed it to our Kubernetes Cluster, let's take a closer look at the chart itself.

First our `Chart.yaml` file:
```
apiVersion: v2
name: example
description: A Helm chart for Kubernetes

# A chart can be either an 'application' or a 'library' chart.
#
# Application charts are a collection of templates that can be packaged into versioned archives
# to be deployed.
#
# Library charts provide useful utilities or functions for the chart developer. They're included as
# a dependency of application charts to inject those utilities and functions into the rendering
# pipeline. Library charts do not define any templates and therefore cannot be deployed.
type: application

# This is the chart version. This version number should be incremented each time you make changes
# to the chart and its templates, including the app version.
# Versions are expected to follow Semantic Versioning (https://semver.org/)
version: 0.1.0

# This is the version number of the application being deployed. This version number should be
# incremented each time you make changes to the application. Versions are not expected to
# follow Semantic Versioning. They should reflect the version the application is using.
appVersion: 1.16.0

```

* The `apiVersion` version should always be set to `v2` when using Helm 3.
* The `name` and `description` are used to identify and describe your chart.
* The `type` that is used for most Helm charts is `application`. But you can read more about `library` charts [here](https://helm.sh/docs/topics/library_charts/).
* The `version` field is used to identify the current version of your chart and also used when creating [dependencies](https://helm.sh/docs/helm/helm_dependency/#helm) between charts. It should incremented be every time you make any change to your chart.
* The `appVersion` is less defined and is used to represent the version of the underlying application the chart is deploying, i.e. a chart that deploys Apache httpd 2.4.x could also have an appVersion of 2.4.x.
* The Chart.yaml can also contain a [dependencies](https://helm.sh/docs/helm/helm_dependency/#helm) section which specifies other Helm charts that will be deployed with this chart. This is something we will go over in more detail in future labs.

If we run the command `helm list` you should see the Helm version and naming information of our chart 

```
NAME        	NAMESPACE   	REVISION	UPDATED                               	STATUS  	CHART        	APP VERSION
test-release	test-project	1       	2021-01-04 11:39:41.51673257 -0500 EST	deployed	example-0.1.0	1.16.0     
```

Next, let's look at our templates, currently we only have `deployment.yaml`. As you may remember, in order to create this template we simply copied a Kubernetes resource from our OpenShift UI into our deployment.yaml. This is because when we do a Helm install it simply takes the post processed files inside of your templates directory and runs them against the Kubernetes API. This effectively means if you can run `kubectl apply` or `oc apply` against a file then it can be used as a valid Helm template file. 

While using static template files in Helm is a perfectly valid and a great starting point, you'll probably want to add some templating to allow more reusability in your chart. In the rest of this section we will take a look at some how to do some basic templating. In addition, Helm contains hundreds of [template functions](https://helm.sh/docs/chart_template_guide/function_list/). We recommend skimming over them so that you have an idea of Helm's capabilities as you create your future charts. We especially recommend taking some time to look at the [flow control functions](https://helm.sh/docs/chart_template_guide/control_structures/) as these tend to be the functions that are the most used.

In our chart we modified our deployment's replicas to have the value `{{ $.Values.replicaCount }}`. While it may be pretty obvious what this is doing, let's break it down to make sure we understand exactly what is going on.
* `{{ }}` denotes this is a templatized value
* `$` specifies we want to start at the root context. You can think of `$` as pre-pending `/` to a cd command.
  * Note you may also see other charts just using `.` rather than `$.`. Most of the time these are functionally equivalent, unless using functions that change the current context such as [with and range](https://helm.sh/docs/chart_template_guide/control_structures/)
* `Values` is a [Built-in object](https://helm.sh/docs/chart_template_guide/builtin_objects/#helm) specifying all values passed into our `values.yaml` file or by the user
* `replicaCount` is the key inside our passed in values that we want to extract

Finally, let's take a quick look at our `values.yaml` file, which currently just holds `replicaCount`. This will set the desired number of pods we want in our deployment. In a more general sense the `values.yaml` is where we will store our default templated values. When first exploring a new chart, the `values.yaml` and the README.md is a good place to start in order to understand how to use a chart.


### Using a Helm Chart

At this point we have built and deployed a very basic Helm chart and have taken a closer look at the different components. In this section we are going to see how to actually consume these charts.

Firstly, we mentioned briefly in the intro that Helm is a package manager. It is worth noting that while you may never need to to create and deploy your own Helm repository, there are a ton of charts already in existence. This means there is probably already a chart that meets your requirements so try not to reinvent the wheel.


#### Finding and Downloading Existing Charts

First, let's take a look at what charts we have available by default:
```
helm search repo
```
<sub>If you are not seeing any charts, your Helm distribution may not have come with the default repository installed. Do not worry we will be installing a new repo in the next few steps.</sub>  

Here you should see a huge list of charts for all sorts of databases, webservers, etc.
You may also notice that most of the Helm charts included inside of the default repository are "DEPRECATED." we have found the bitnami repository contains a lot of charts that are well documented for most of your basic installations.

In order to add our new repository just run the following command:
```
helm repo add bitnami https://charts.bitnami.com/bitnami
```

Now if we want to find a chart for deploying a basic nginx server we can use:
```
helm search repo nginx
```

This existing Helm chart can be deployed by running `helm install nginx-release bitnami/nginx` and viewed on the cluster. Feel free to explore the deployment and once you are done you can remove the chart with `helm uninstall nginx-release`. Another useful command to know is `helm pull --untar bitnami/nginx`, which will pull down a local version of the chart for you to inspect.


#### Modifying Default Values

Since we have already installed our Helm chart earlier in this lesson, let's take a quick look at what we have actually deployed using the OpenShift UI.

* Navigate to the `Developer Tab` 
* Open `More` -> `Helm`
* Should see the following screen with basic release information

![OpenShift Deployment](/devtools/helm_intro/releases.png)

If we click inside of our `test-release` link you can find more details, including the resources associated with the Helm release. Navigating to the resources tab you will see there is just a single deployment, and it currently it has 3 pods associated with it.

![Helm Release](/devtools/helm_intro/details.png)

Since we templatized the number of pods lets try to modify that value. 

##### User Input - CLI

In order to update the replica count from the CLI we just need to use `--set key=value` option and, since our chart has already been deployed, we are going to use `helm upgrade` instead of `helm install`.

Run the following command:
```
helm upgrade test-release . --set replicaCount=1
```

![Helm Release](/devtools/helm_intro/values_cli.png)

You should pretty quickly see your pod count reduced from `3 of 3` to `1 of 1`. You will also notice the `revision` number on your release page changed from 1 to 2. The Helm release is incremented every time you `upgrade` an existing release.

##### User Input - File

While modifying templated values from the CLI is convenient from a developer perspective we will probably want to have a dedicated set of values for each of our different environments. Let's create a set of values for our "production" environment.

Create `values-prod.yaml` with the following line:
```
replicaCount: 6
```

Now to deploy using our new "production" configuration:
```
helm upgrade test-release . -f values-prod.yaml
```

And we should see the pod count increased to `6 of 6`

![Helm Release](/devtools/helm_intro/values_file.png)

### Expanding our Chart

For this final section let's expand the chart to actually expose our deployment. Add the following `service` and `route` inside of your `templates` directory:

#### **`service.yaml`**
```
kind: Service
apiVersion: v1
metadata:
  name: example
spec:
  ports:
    - protocol: TCP
      port: 8080
      targetPort: 8080
  selector:
    app: hello-openshift
```


#### **`route.yaml`**
```
kind: Route
apiVersion: route.openshift.io/v1
metadata:
  name: example
spec:
  to:
    kind: Service
    name: example
    weight: 100
  port:
    targetPort: 8080
  wildcardPolicy: None
```

And for fun let's add the `RESPONSE` environment variable as the templated value `response` to our pods so that we can modify what is shown on our webpage. 

The new `deployment.yaml` should look like:


#### **`deployment.yaml`**
```
apiVersion: apps/v1
kind: Deployment
metadata:
  name: example
spec:
  selector:
    matchLabels:
      app: hello-openshift
  replicas: 3
  template:
    metadata:
      labels:
        app: hello-openshift
    spec:
      containers:
        - name: hello-openshift
          image: openshift/hello-openshift
          ports:
            - containerPort: 8080
          env:
            - name: RESPONSE
              value: {{ $.Values.response }}
```

Finally add the following line to our `values.yaml`:
```
response: "Hello Helm"
```

Now, let's hit our endpoint by getting the url from the OpenShift UI, or you can run the command  `oc get route example --template='{{ .spec.host }}'`. When you run it inside of your browser you should see our `Hello Helm` webpage!

### Extra Credit

Add the following lines to your `values.yaml`, then update your `deployment.yaml` to use the templatized probes inside `deployment.spec.template.spec.containers`


#### **`value.yaml`**
```
health:
  readinessProbe:
    httpGet:
    path: /healthz
    port: 8080
    initialDelaySeconds: 15
    timeoutSeconds: 1
  livenessProbe:
    httpGet:
    path: /healthz
    port: 8080
    initialDelaySeconds: 15
    timeoutSeconds: 1
```

Hints:
* `toYaml` function converts a map value into its yaml representation, including indentation.
* [indent](https://helm.sh/docs/chart_template_guide/function_list/#indent) indents every line of a string a specified number of spaces.
* A basic understanding of [pipelines](https://helm.sh/docs/chart_template_guide/functions_and_pipelines/#helm) is required.
* helm template --debug test-release .` is a useful command for figuring out issues with your chart.

[Solution](https://github.com/redhat-appdev-practice/helm-intro-lab)

<sub>If you found that challenge to easy do it again but just using the `range` function</sub>

## Wrap Up

This lab focused primarily on the fundamentals of creating and using a Helm chart. Obviously, there is a lot more you can learn and do with Helm but hopefully this helped you get started. We are planning to create another lab to cover more advance topics such as dependencies and template helper files. Until then the official [documentation](https://helm.sh/docs/) is great for answering specific questions.
:::