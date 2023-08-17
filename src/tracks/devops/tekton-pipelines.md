---
title: Tekton Pipelines
initialOpenGroupIndex: -1
collapsable: true
tags:
- tekton
- devops
- ci
- cd
- ci/cd
- deployment
- build
- pipeline
---

# Tekton Pipeline

## Video


## Intro

### Pipelines

In the previous lab we gave an introduction to Tekton and created at Tekton Task. In this lab we are going to string together a series of pre created task in order to create a full [Tekton Pipeline](https://tekton.dev/docs/pipelines/pipelines) that builds a Quarkus Java application, creates a Container Image, and deploys that image.

# Lab

## Prerequisites

* **OpenShift Cluster 4.X** with [Openshift Pipeline](https://docs.openshift.com/container-platform/4.13/cicd/pipelines/installing-pipelines.html) installed

### Optional

* [tkn cli](https://tekton.dev/docs/cli/)
  * If using the CLI with Openshift it is highly recommended you download the tkn cli through the Openshift console to insure you have the correct version. Cli can be found under `'?' -> Command Line Tools`

## Clone Example Application

First lets clone our example application:

```sh
git clone https://github.com/redhat-appdev-practice/tekton-lab
```

This repo contains a basic Quarkus application that you are welcome to explore but the files we care about live under the `.infra` folder, which contains two subfolders. The *chart* folder which contains a helm chart we will use to deploy our application. And the *pipeline* folder which contains our pipeline related Kubernetes objects.

::: details
These task are mostly simplified versions of the `ClusterTask` included with Openshift Pipelines.

One thing you may notice that was not covered in the previous lab is the use of `env:` to convert task parameters into environment variables. This is a best practice that makes it much easier to test scripts outside of your Kubernetes Cluster.
:::

## Kubernetes Setup

Now lets create our `pipeline-example` namespace or reuse that namespace from the previous lab.

And lets upload our custom task into our pipeline environment, from inside of the newly clone repository run

```sh
oc apply -f .infra/pipleline/task/
```

## Creating our Pipeline

Lets create our pipeline!

:::tip
In the video I ues the Openshift UI to build out the pipeline. I highly recommend checking it out as the UI vastly simplifies the inital creation of a pipeline.
:::

### One Two Step

To start with lets create a two step pipeline. Step 1 will clone our code. Step two will deploy a simple helm chart stored inside of that code.

In order to install this task copy the following code into a `pipeline.yml` file then run either `oc apply -f pipeline.yml` or `kubctl apply -f pipeline.yml`

```yaml
apiVersion: tekton.dev/v1beta1
kind: Pipeline
metadata:
  name: example-pipeline
spec:
  params:
    - description: Repository Url
      name: repo-url
      type: string
  tasks:
    - name: git-clone-task
      params:
        - name: repo-url
          value: $(params.repo-url)
      taskRef:
        kind: Task
        name: git-clone-task
      workspaces:
        - name: output
          workspace: source-repo
    - name: helm-deploy
      params:
        - name: image-name
          value: example-deploy
        - name: image-tag
          value: $(tasks.git-clone-task.results.commit)
      runAfter:
        - git-clone-task
      taskRef:
        kind: Task
        name: helm-deploy
      workspaces:
        - name: source
          workspace: source-repo
  workspaces:
    - name: source-repo
```

If the apply worked, and you navigate to `Pipelines -> Pipeline` there should be a pipeline named `example-pipeline` that looks like this

![example pipeline](/devops/simple-example-pipeline.png)

Now lets break this pipeline down

### Params

Similar to to our Tekton `Task` pipelines have a parameters section allowing different input on each pipeline run

### Workspaces

One more workspaces are defined at the `Pipeline` level and created during the `PipelineRun`. You will also notice the workspace is assigned inside of each of our steps `Task`:

``` yaml
- name: git-clone-task
  ...
  workspaces:
    - name: output
      workspace: source-repo
- name: helm-deploy
  ...
  workspaces:
    - name: source
      workspace: source-repo
```

This is how we are able to pass our source code between our `git-clone` and `helm-deploy` task.

### Steps

Finally we have the steps to make up our pipeline:

```yaml
- name: helm-deploy
  params:
    - name: image-name
      value: example-deploy
    - name: image-tag
      value: $(tasks.git-clone-task.results.commit)
  runAfter:
    - git-clone-task
  taskRef:
    kind: Task
    name: helm-deploy
  workspaces:
    - name: source
      workspace: source-repo
  ```

Each step can consist of:

* `name` used to identify the step's goal
* `taskRef` specifying the task you want to use (or a [taskSpec](https://tekton.dev/docs/pipelines/taskruns/#specifying-the-target-task))
* `runAfter` to specify that step's dependent task (if there is no run after task it will be run first)
* `params` parameters passed into the task
* `workspace` assigns the pipeline level workspace(s) to the task level workspace(s)

:::tip Note
The order in which the steps run in are determined by the steps in `runAfter`, **not** the order in which the steps are listed.
:::

## Running Our Pipeline

:::warning Important
Before running the pipeline the `pipeline-scc` account may need additional permissions.

This can be given with an admin account running: `oc patch scc pipelines-scc --type merge -p '{"allowedCapabilities":["SETFCAP"]}'`
:::

The pipeline can be run using the Openshift UI or through the `tkn pipeline start example-pipeline`. Regardless of the method it requires two values, the **repo-url** which can be set to `https://github.com/redhat-appdev-practice/tekton-lab.git` and the **workspace**, explained below.

In order for us to pass the code between our two task we need to use persistent storage in our workspace.

The easiest way to do this is by creating a `PersistentVolumeClaim` and running the pipeline using that claim. **BUT** this can cause future issues. For one multiple pipelines using the same `PVC` could conflict with one another. But the bigger problem is that a `PVC` is associated with a specific node, meaning that every task using that `PVC` will be force to run on that node which could cause major performance issues or even overload a node.

Another option offered by Tekton is a [VolumeClaimTemplate](https://tekton.dev/docs/pipelines/workspaces/#volumeclaimtemplate) (note this option is not present in the `tkn cli` currently but can be used by creating the `PipelineRun` later in this lab). `VolumeClaimTemplates` create a new `PVC` and bind it to each `PipelineRun` based on a given spec. This does require either a `PV` exist that matches each newly created `PipelineRun.workspace.volumeClaimTemplate` spec or the cluster is setup for [dynamic provisioning](https://docs.openshift.com/container-platform/4.12/storage/dynamic-provisioning.html).

Regardless of the route you choose create a workspace with at least 1 GB of memory and start the pipeline:

![Start Simple Pipeline](/devops/start-simple-pipeline.png)

If run successfully you should see a newly created `Deployment` and `ImageStream`! Although the pod in that Deployment will be getting an `ImagePullBackOff` error, which we will fix in the next section.

::: details Automated Cleanup
The `PVCs` created by VolumeClaimTemplates will stay as long as the `PipelineRun` objects exist. The Openshift Pipeline Operator includes a configuration option that allows for [the cleanup of taskruns and pipelineruns for a certain time period and/or number of resources](https://docs.openshift.com/container-platform/4.12/cicd/pipelines/customizing-configurations-in-the-tektonconfig-cr.html#default-pruner-configuration_customizing-configurations-in-the-tektonconfig-cr). It is recommended that you setup this auto-pruning
:::

## Expanding The Pipeline

In order to complete the pipeline we need to add the two task for building and deploying an image to our `ImageStream`. Since these steps are note dependent on our `helm-deploy` step to run we will allow for them to run in parallel by connecting them directly to our `git-clone-task`. Add the following steps to our `example-pipeline`

```yaml
    - name: maven-build
      runAfter:
        - git-clone-task
      taskRef:
        kind: Task
        name: maven-build
      workspaces:
        - name: source
          workspace: source-repo
    - name: build-and-push
      params:
        - name: image-name
          value: example-deploy
        - name: image-tag
          value: $(tasks.git-clone-task.results.commit)
        - name: namespace
          # It is important this match the namespace you deployed your pipeline in
          value: pipeline-example 
      runAfter:
        - maven-build
      taskRef:
        kind: Task
        name: build-and-push-to-openshift-registry
      workspaces:
        - name: source
          workspace: source-repo
```

<sub>Make sure to modify the `namespace` parameter in the `build-and-push` step if you did not deploy to pipeline-example</sub>

:::tip
The [example repo](https://github.com/redhat-appdev-practice/tekton-lab) cloned at the start of the lab contain the completed pipeline under `.infra/pipeline` if you are having trouble
:::

Now restart your pipeline! If using the Openshift UI this can be done by navigating to the example-pipeline and choosing `Action -> Start last Run`. Or the following `PipelineRun` can be applied to the namespace

```yaml
apiVersion: tekton.dev/v1beta1
kind: PipelineRun
metadata:
  generateName: example-pipeline-
spec:
  params:
    - name: repo-url
      value: 'https://github.com/redhat-appdev-practice/tekton-lab.git'
  pipelineRef:
    name: example-pipeline
  workspaces:
    - name: source-repo
      persistentVolumeClaim:
        claimName: example-workspace # Existing PVC
  # The following is how you would specify a VolumeClaimTemplate
  # workspaces:
  #   - name: source-repo
  #     volumeClaimTemplate:
  #       metadata:
  #         creationTimestamp: null
  #       spec:
  #         accessModes:
  #           - ReadWriteOnce
  #         resources:
  #           requests:
  #             storage: 1Gi
  #         # storageClassName: gp3-csi (Change to the correct Storage Class Name)
  #         volumeMode: Filesystem
```

Once your pipeline has successfully run congratulations we will have built our Java code, created a Container Image from the Jar, and Deployed that container onto our openshift environment.

To validate the Deployment should be up (you may need to delete the pod in order to trigger an image repull) and the application should be accessible at `echo http://$(oc get route/example-deployment -o jsonpath={.spec.host})`

## Conditional Task

One last useful trick to know in Tekton is the use of the `when` condition on task. This allows us to conditionally run a task based on either user input or the results of a preceding task. For example on a "production" run of the pipeline above we may want to include a conditional task for deploying our image to an external image repository.

In we are going to give a simple example of integrating a conditional task. In your example pipeline add a new task and set the `when` condition so that the task only runs when `$(params.run-conditional)` contains the value `true`:

```yaml
    - name: conditional-task
      runAfter:
        - git-clone-task
      taskRef:
        kind: Task
        name: conditional-task
      when:
        - input: $(params.run-conditional)
          operator: in
          values:
            - 'true'
```

Now rerun the pipeline with/without the `run-conditional` parameter set to `true`.

You will notice in the Openshift UI that when the parameter is not set you see `>>` on the task indicating that the `conditional-task` step was skipped.

![/devops/conditional-task]

# Extra Credit

Tekton Pipelines have many more features we do not have time to cover in this lab. One of which is the use of `finally` to create task that always run. For extra credit add a cleanup task to remove our helm deployment upon completions of the pipeline.

# Wrap Up

In this lab we created a slightly simplified version of a pipeline that might be used in a real environment. This pipeline can be easily expanded to include different types of testing and integrations into other devops products such a security scanners. In a future lab we will look into setting up integration hooks so pipelines can be automatically kicked off from non-manual sources such as a Git server.
