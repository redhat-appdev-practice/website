---
title: Tekton Intro
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
- task
---

# Tekton Into (Part 1 Task)

## Video

<!-- <iframe width="560" height="315" src="https://www.youtube.com/embed/G9t-HFy4EHs" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe> -->

## Intro

### What is Tekton

Tekton is a Kubernetes native CI/CD solution. What that means from a practical sense is that with Tekton you can build out our CI/CD Pipelines, then deploy and run them directly on a Kubernetes cluster using our our Kubernetes resources.

In the background Tekton is just orchestrating a series of Kubernetes Pods to run in a particular order. That order in which the pods run are generally determined by a [Pipline](https://tekton.dev/docs/pipelines/pipelines/) CRD, and the specification of those Pods (i.e. what script to run and what container to run on) is determined by a [Task](https://tekton.dev/docs/pipelines/tasks/) CRD. Even the running pipeline/task themselves are captured with the [PipelineRun](https://tekton.dev/docs/pipelines/pipelineruns/) and [TaskRun](https://tekton.dev/docs/pipelines/taskruns/).

Don't worry to much if the previous paragraph did not totally make sense we will walk through how exactly these pipelines work in the lab.

# Lab

## Prerequisites

* **OpenShift Cluster 4.X** with [Openshift Pipeline](https://docs.openshift.com/container-platform/4.13/cicd/pipelines/installing-pipelines.html) installed

### Optional

* [tkn cli](https://tekton.dev/docs/cli/)
  * If using the CLI with Openshift it is highly recommended you download the `tkn cli` through the Openshift console to insure you have the correct version. Cli can be found under `'?' -> Command Line Tools`

::: tip Note
This lab was written using Openshift 4.11 but you should be able to follow most of it using base Kubernetes with Tekton Pipelines installed as well.
:::

## Create a task

First lets create a basic [Tekton Task](https://tekton.dev/docs/pipelines/tasks/), the task below will download code from a git repository. In order to install this task copy the following code into a `task.yml` file then run either `oc apply -f task.yml` or `kubctl apply -f task.yml`

```yaml
apiVersion: tekton.dev/v1beta1
kind: Task
metadata:
  name: git-clone-task
spec:
  params:
    - name: repo-url
      description: The URL of the Git repository to clone.
      type: string
    - name: destination-path
      description: The local destination path for the cloned repository.
      type: string
      default: '.'
  results:
    - description: The precise commit SHA that was fetched by this Task.
      name: commit
  steps:
    - name: git-clone
      image: alpine/git
      script: |
        # Clone Git Repo into `output` workspace
        git clone $(inputs.params.repo-url) $(workspaces.output.path)/${inputs.destination-path}
        cd $(workspaces.output.path)

        #Save Git Commit's Short Sha and push it to the results
        RESULT_SHA="$(git rev-parse HEAD)"
        printf "%s" "${RESULT_SHA}" > "$(results.commit.path)"

        # Just so we print out a fun finish message 
        git checkout first-task-run
        cat hello-world.txt
  workspaces:
    - description: The git repo will be cloned onto the Volume Backing this Workspace.
      name: output
```

Now that we have created our Tekton Task lets break it down:

### Params

[Params](https://tekton.dev/docs/pipelines/tasks/#specifying-parameters) section contains a set of parameters that can be passed into our task. In this case our task is asking for a git repository with the `git-repo` param and a destination folder with the `destination-path` param, which will default to '.' if not provided

These parameters can be referred to inside of the `script` block using the notation `$(inputs.params.<PARAMETER NAME>)` (i.e. `$(inputs.params.repo-url)`)

### Results

[Results](https://tekton.dev/docs/pipelines/tasks/#emitting-results) enable us to pass information that can be viewed by our users, or used in the pipeline's future task.

Copying values to the file specified with the expression `$(results.<RESULT NAME>.path)`, is how we store our results.

### Steps

[Steps](https://tekton.dev/docs/pipelines/tasks/#defining-steps) refer to an array of container images, each of which executing a command or script.

The most basic `step` contains a:

* `name` describing what the step does
* `image` describing the container in which the step is run
* `script`/`command` describing what you are attempting to get that task to do.

::: tip
`Steps` can also contain other information about the pod such as resource request and limits.
:::

### Workspace

[Workspaces](https://tekton.dev/docs/pipelines/tasks/#specifying-workspaces) allow us to connect a volume to our task. When running a pipeline this will allow us to transfer large amounts of data (for instance an entire git repository) from one task to another.

`Workspaces` can contain a custom `mountPath` for the pod but if not included the path can be retrieve with the expression `$(workspaces.output.path)`, which is where we clone our repository in the example above.

:::tip Recommended
It is recommended that a `task` contain only a **single** writable workspace. Using folder structures to save multiple pieces of data if required.
:::

:::details
More info about the different variables inside of tekton task and pipelines can be found [here](https://tekton.dev/docs/pipelines/variables/)
:::

## Run Task

And finally lets run our task. As mentioned in the intro a running task is also done using a Kubernetes CRD called a `TaskRun`. So to start running our task copy the following code into a `task-run.yml` file then run either `oc apply -f task-run.yml` or `kubctl apply -f task-run.yml`

```yaml
apiVersion: tekton.dev/v1beta1
kind: TaskRun
metadata:
  generateName: git-clone-task-run-
spec:
  taskRef:
    name: git-clone-task
  params:
    - name: repo-url
      value: https://github.com/redhat-appdev-practice/tekton-lab.git
  workspaces:
    - name: output
      emptyDir: {}
```

:::tip
Task can also be started with `tkn cli` using the command `tkn task start git-clone-task -p repo-url=https://github.com/redhat-appdev-practice/tekton-lab.git -w name=output,emptyDir= --showlog`
:::

The `TaskRun` above uses references our task using the `taskRef` spec and passes in an example git repo using our parameters and an empty directory to be used for our workspace.

It also uses the the `generateName` in order to append a random alphanumeric code to the end, which allows us to deploy multiple times with the same yaml. 

::: important
Normally you would want to connect a `PCV` to the workspace instead of an empty directory. Otherwise anything saved in that workspace will be lost once the `task` is completed.
::

### Viewing Task Run Information

The task information can be viewed by either using the Openshift UI, or the `tkn` cli.

#### Openshift UI

The Openshift 


#### tkn Cli

Use the  `tkn taskrun list` command to get the `TaskRun` name and then use the `tkn taskrun details <TASK NAME>` to get info about the task and `tkn taskrun log <TASK NAME>` to get log information.

Note that regardless of which method you choose you can give information about the task including if it was successful, input params, log information, and even the result info as seen below.

# Wrap Up

In this lab 