---
title: Knative Eventing
sidebarDepth: 1
tags:
- kafka
- serverless
- eventing
---

# Knative Eventing

## Videos 
<iframe width="560" height="315" src="https://www.youtube.com/embed/WYHoApOv9jw" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

<iframe width="560" height="315" src="https://www.youtube.com/embed/VDqD9KrAOBA" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

<iframe width="560" height="315" src="https://www.youtube.com/embed/DOnmk4INh-c" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## Setup

Checkout the base project `git clone https://github.com/redhat-appdev-practice/knative-eventing.git`

# Knative Eventing

Knative consists of two components: Serving and Eventing. 

With Serving you have dynamic autoscaling based on HTTP traffic load, including scaling down to zero pods. 
Eventing introduces the ability to scale up Knative services from sources other than HTTP. For example, messages arriving in an Apache Kafka topic can cause autoscaling of your Knative service to handle those messages. 

There are two terms we will use when we discuss Knative Eventing:

* Sinks
* Eventing Sources

**Sinks:**  A sink is an event receiving service.  So once we have a Knative service deployed we can use this as a sink.

**Eventing sources:** Knative eventing sources are responsible for connecting to and retrieving events from a system.  

For the purposes of this enablement we will demonstrate the following event sources:
	
* **Ping source** - The PingSource fires events based on a given Cron schedule.
* **Container source** - The ContainerSource will instantiate container image(s) that can generate events.  The ContainerSource will inject environment variables $K_SINK and $K_CE_OVERRIDES into the pod.  The application running in the container will use the $K_SINK environment variable as the destination to send the cloud event. K_CE_OVERRIDES are be used to override CloudEvents properties on the CloudEvent to be emitted.
* **API server source** - fires a new event each time a Kubernetes resource is created, updated or deleted.
* **SinkBinding** - SinkBinding is similar to container source, they can both achieve the same end result, a container running and emitting events to a destination defined by $K_SINK.  The difference is SinkBinding is based on the object creating the pod, e.g. deployment, cronJob, statefulSet etc. any kubernetes object which defines a PodTemplateSpec
* **Kafka** - allows you to emit events from Kafka topics
* TODO - Camel-K - allows to generate events from any of the 300+ components provided by Apache camel


## Usage patterns

There are 3 usage patterns for Knative Eventing:

* Source to Sink
* Channels and subscriptions
* Brokers and triggers

### Source to Sink

Source to Sink is the simplest way to get started with Knative eventing.  There is no queuing of channels, and the sink is a single Knative service.

### Channels and Subscriptions

With Channels and Subscriptions, channels provide the ability to support multiple sinks (knative services) and persistence of messages e.g. to kafka.  

### Brokers and triggers

Brokers and Triggers add filtering of events to channels.  Subscribers register an interest in a particular type of message (based on attributes of the cloudEvent object.  A trigger is applied to the broker to filter out these events and forward to the registered subscribers.

# Step by step demonstration

## Install operators

Install Serverless Operator, strimzi operator and Knative Apache Kafka operator

`oc apply -f ./deploy/operator-subscriptions.yaml`

## Install knative eventing and serving

Create knative-serving project

`oc new-project knative-serving`

Install knative-serving

`oc apply -f ./deploy/knative-serving.yaml`

Wait for the pods to be created:

```
activator-55785f7d8d-cdtss          1/1       Running   0          37s
activator-55785f7d8d-hvmg8          1/1       Running   0          52s
autoscaler-cd7dbf4cd-bftr8          1/1       Running   1          51s
autoscaler-hpa-85558f5fcd-hpndr     1/1       Running   0          41s
autoscaler-hpa-85558f5fcd-ktrpq     1/1       Running   0          41s
controller-d9d95cb5b-jphzb          1/1       Running   0          46s
controller-d9d95cb5b-nmhf4          1/1       Running   0          38s
kn-cli-downloads-66fb7cd989-g7qhd   1/1       Running   0          57s
webhook-7c466c66d5-tnpnt            1/1       Running   0          49s
```

Create knative-eventing project

`oc new-project knative-eventing`

Install  knative eventing

`oc apply -f ./deploy/knative-eventing.yaml`

Wait for pods to be created:

```
broker-controller-77c5f87cfc-45tml     1/1       Running   0          14s
eventing-controller-59f677db96-q542m   1/1       Running   0          23s
eventing-webhook-6ccdcd59d5-hmpvf      1/1       Running   0          23s
imc-controller-9dcc65bd-xrstj          1/1       Running   0          11s
imc-dispatcher-6bdddfc8bf-2fwfd        1/1       Running   0          11s
```

Create knative-test project

`oc new-project knative-test`

## Build and deploy simple knative service

This service is a simple node.js app using the CloudEvents [javascript sdk](https://www.npmjs.com/package/cloudevents) from the CNCF foundation .  The code is pretty simple, it just creates a CloudEvents object from the post data and outputs this to the logs.

```
const app = require('express')();
const {Receiver} = require("cloudevents");
const bodyParser = require('body-parser')
app.use(bodyParser.json())

app.post('/', (req, res) => {
  try {

    let myevent = Receiver.accept(req.headers, req.body);
    console.log('CloudEvent Object received. \n');
    console.log('Version: ', myevent.specversion, ' \n');
    console.log('Type: ', myevent.type, ' \n');
    console.log('Data: ', myevent.data, ' \n');
    res.status(201).send("Event Accepted");

  } catch(err) {
    console.error('Error', err);
    res.status(415)
          .header("Content-Type", "application/json")
          .send(JSON.stringify(err));
  }
});
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log('App Version 1.0 listening on: ', port);
});
```

First we're going to build this image and push it to the cluster image registry using S2I:

`oc new-build nodejs:12~https://github.com/deewhyweb/knative-eventing.git --context-dir=/samples/knative-service`

Watch the build logs:

`oc logs -f  -n knative-test  $(oc get pods -o name -n knative-test | grep build)`

Once the image is pushed successfully, and the build is complete we can delete the build pod:

`oc delete pod --field-selector=status.phase==Succeeded -n knative-test`

Next we're going to deploy the Knative service using this image we've just built.

`oc apply -f ./deploy/event-display-nodejs.yaml`

Monitor the logs of the node.js Knative service:

`oc logs -f -c user-container -n knative-test  $(oc get pods -o name -n knative-test | grep event-display)` 

Test the Knative service with a sample CloudEvent post

```
curl $(oc get ksvc event-display-nodejs -o custom-columns=url:status.url --no-headers) -w "\n" -X POST \
    -H "content-type: application/json"  \
    -H "ce-specversion: 1.0"  \
    -H "ce-source: curl-command"  \
    -H "ce-type: curl.demo"  \
    -H "ce-id: 123-abc"  \
    -d '{"name":"Dale Arden"}' 
```

You should see the following returned from the call:

```
Event Accepted
```

## Create simple cron source knative eventing example

Now that we have a Knative service running which will parse CloudEvents, we can start creating some example Event Sources, starting with a simple ping source.  To do this we can use the sources.knative.dev/PingSource a CRD which is created by default with Knative Eventing.

```
apiVersion: sources.knative.dev
kind: PingSource
metadata:
  name: eventinghello-Ping-source
spec:
  schedule: "*/2 * * * *"
  jsonData: '{"name": "General Klytus"}'
  sink:
    ref:
      apiVersion: serving.knative.dev/v1alpha1
      kind: Service
      name: event-display-nodejs
```

Every two minutes the eventinghello-Ping-source ping source will create an event which it will emit to the sink, in this case event-display-nodejs. To deploy this event source, run:

`oc apply -f ./deploy/eventinghello-source.yaml`

You can monitor this by running

`oc get pods -w`

When then event-display-nodejs-xxxx pod is created, montitor the logs with:

`oc logs -f -c user-container -n knative-test  $(oc get pods -o name -n knative-test | grep event-display)` 

To remove the ping source eventing example, run:

`oc delete -f ./deploy/eventinghello-source.yaml`

## Container Source example

The container event source allows us to emit events from any OpenShift container.  In this example we're using the CLoudEvents SDK from CNCF to create and emit a CloudEvents compatible event.  The key thing to note here is the use of the "K_SINK" environment variable as the url to emit events.  This environment variable is injected into the pod by the ContainerSource. 

```
const { CloudEvent, Emitter } = require("cloudevents");
const emitter = new Emitter({
  url: process.env.K_SINK, // we get the url for the emitter from the K_SINK environment variable which is injected by the knative container source
});
var cron = require("node-cron");

const emitEvent = () => {
  console.log("About to emit event");
  const event = new CloudEvent({
    type: "dev.knative.container.event",
    source:
      "/apis/v1/namespaces/knative-test/cronjobsources/eventinghello-container-source",
    data: {
      name: "Hans Zarkov",
    },
  });
  emitter
    .send(event)
    .then((response) => {
      // handle the response
      console.log("Response:", response);
    })
    .catch(console.error);
};

cron.schedule("*/2 * * * *", () => {
  emitEvent();
});
```

To build this container image, we'll again use S2I and push the image to the OpenShift registry

`oc new-build nodejs:12~https://github.com/deewhyweb/knative-eventing.git --context-dir=/samples/container-source --to="container-source" --name="container-source"`

Once the image is built, we can delete the completed pod:

`oc delete pod --field-selector=status.phase==Succeeded -n knative-test`

Next we will deploy the ContainerSource object which will create the pod and inject the K_SINK environment variable to enable events to be emitted.

```
apiVersion: sources.knative.dev/v1alpha2
kind: ContainerSource
metadata:
  name: test-container-source
spec:
  template:
    spec:
      containers:
        - image: image-registry.openshift-image-registry.svc:5000/knative-test/container-source:latest
          name: container-source
          env:
            - name: POD_NAME
              value: "mypod"
            - name: POD_NAMESPACE
              value: "knative-test"
  sink:
    ref:
      apiVersion: serving.knative.dev/v1
      kind: Service
      name: event-display-nodejs
```

To create this object, run:

`oc apply -f ./deploy/eventing-container-source.yaml`


Run `oc get sources` to view the list of Knative Eventing sources, you should see something like:
```
NAME                READY     REASON    SINK                                                         AGE
test-container-source   True                http://event-display-nodejs.knative-test.svc.cluster.local   7s
```

Key thing here is the SINK url, this is the same url which is injected into the container source pod as K_SINK.
Also ensure you see "True" under the READY column.  If you don't run `oc describe ContainerSource test-container-source` to view events

When then event-display-nodejs-xxxx pod is created, montitor the logs with:

`oc logs -f -c user-container -n knative-test  $(oc get pods -o name -n knative-test | grep event-display)` 

To remove the container source eventing example, run:

`oc delete -f ./deploy/eventing-container-source.yaml`

## Sink Binding example

For the sink binding example we can use the same container as we did for the container source example, the end result is the same, the difference being the sinkBinding object is applied to the pods parent, in this case a deployment object. i.e.

```
apiVersion: apps/v1
kind: Deployment
metadata:
  name: sink-binding-deployment
  labels:
    app: sink-binding
spec:
  replicas: 1
  selector:
    matchLabels:
      app: sink-binding
  template:
    metadata:
      labels:
        app: sink-binding
    spec:
      containers:
      - name: container-source
        image: image-registry.openshift-image-registry.svc:5000/knative-test/container-source:latest
        ports:
        - containerPort: 8080

```

The SinkBinding object is described with the following yaml.  Any deployment objects which match the label `app: sink-binding` will be deployed with the K_SINK environment variable injected into the pod.

```
apiVersion: sources.knative.dev/v1alpha2
kind: SinkBinding
metadata:
  name: test-sink-binding
spec:
  subject:
    apiVersion: apps/v1
    kind: Deployment
    selector:
      matchLabels:
        app: sink-binding
  sink:
    ref:
      apiVersion: serving.knative.dev/v1
      kind: Service
      name: event-display-nodejs
  ceOverrides:
    extensions:
      sink: bound
```

To deploy the SinkBinding object, run:

`oc apply -f ./deploy/eventing-sinkBinding.yaml`

Running `oc get sources` will show:

```
NAME                READY     REASON    SINK                                                         AGE
test-sink-binding   True                http://event-display-nodejs.knative-test.svc.cluster.local   7s
```

Once the SinkBinding source is in place, we can create the sink-binding-deployment.  When this object is created, the sinkBinding source will detect the new object with the matching label and inject the K_SINK env variable into the pod.

`oc apply -f ./deploy/sinkBinding-deployment.yaml`

When the event-display pod spins up monitor the event-display pod with: 

`oc logs -f -c user-container -n knative-test  $(oc get pods -o name -n knative-test | grep event-display)` 

To remove the container source eventing example, run:

`oc delete -f ./deploy/eventing-sinkBinding.yaml`

`oc delete -f ./deploy/sinkBinding-deployment.yaml`

## Kafka Event source example

First thing we need to do is setup a kafka namespace and deploy a Kafka cluster using the strimzi operator

Create a kafka namespace

`oc new-project kafka`

Deploy kafka

`oc apply -f ./deploy/kafka.yaml`

Wait until the kafka cluster is ready, you should see something like:

```
my-cluster-entity-operator-59db855bfd-gnsfq   3/3       Running   0          36s
my-cluster-kafka-0                            2/2       Running   0          70s
my-cluster-kafka-1                            2/2       Running   0          70s
my-cluster-kafka-2                            2/2       Running   0          70s
my-cluster-zookeeper-0                        1/1       Running   0          102s
my-cluster-zookeeper-1                        1/1       Running   0          102s
my-cluster-zookeeper-2                        1/1       Running   0          102s
```

Once Kafka is up and running we'll deploy the Kafka knative eventing component

`oc apply -f ./deploy/knativeEventingKafka.yaml`

Create a kafka topic "my-topic"

`oc apply -f ./deploy/kafka-topic.yaml`

Once this topic is created we should be able to list the topics using

`oc  -n kafka exec my-cluster-kafka-0 -c kafka -i -t -- bin/kafka-topics.sh --bootstrap-server localhost:9092 --list`

```
__consumer_offsets
my-topic
```

Next we'll deploy the kafka event source using the KafkaSource object. Key things to note here are
* The topics listed are my-topic
* The sink is configured as event-display-nodejs


```
apiVersion: sources.knative.dev/v1alpha1
kind: KafkaSource
metadata:
  name: kafka-source
spec:
  consumerGroup: knative-group
  bootstrapServers: 
  - my-cluster-kafka-bootstrap.kafka:9092 
  topics: 
  - my-topic
  sink:
    ref:
      apiVersion: serving.knative.dev/v1
      kind: Service
      name: event-display-nodejs
```

To create this event source run: 

`oc project knative-test`

`oc apply -f ./deploy/event-source-kafka.yaml`

Once this event source is created we can now test creating some messages in the my-topic topic

`oc  -n kafka exec my-cluster-kafka-0 -c kafka -i -t -- bin/kafka-console-producer.sh --bootstrap-server localhost:9092 --topic my-topic` 

Enter some json e.g.

`{"msg":"hi"}`

When the event-display pod spins up monitor the event-display pod with: 

`oc logs -f -c user-container -n knative-test  $(oc get pods -o name -n knative-test | grep event-display)` 

To remove the kafka source eventing example, run:

`oc delete -f ./deploy/event-source-kafka.yaml`


<!-- # Camel-k Event source example

install the camel event source

`oc apply -f ./deploy/camel.yaml`

Deploy the camel time source

`oc apply -f ./deploy/source_timer.yaml` -->

## API server source example

Our final event source example is the Kubernetes api source, this will create events based on kubernetes events e.g pods created / deleted.

First thing we'll do is create a service account in knative-test namespace with permissions to get, list, and watch api events.

`oc apply -f ./deploy/apiserversource-sa.yaml`

Next we'll deploy the apiserversource knative source, key things here are:

* serviceAccountName: set to events-sa, the service account we just created with permissions to get, list, and watch api events in this namespace
* The sink pointing to event-display-nodejs

```
apiVersion: sources.knative.dev/v1alpha2
kind: ApiServerSource
metadata:
 name: testevents
spec:
 serviceAccountName: events-sa
 mode: Resource
 resources:
   - apiVersion: v1
     kind: Event
 sink:
   ref:
     apiVersion: serving.knative.dev/v1
     kind: Service
     name: event-display-nodejs 
```

To create this object, run: 

`oc apply -f ./deploy/apiserversource.yaml`

Now we can test by creating some kubernetes events

Create a pod:

`oc -n knative-test run busybox --image=busybox --restart=Never -- ls`

Delete a pod:

`oc -n knative-test delete pod busybox`

Monitor the event display logs

`oc logs -f -c user-container -n knative-test  $(oc get pods -o name -n knative-test | grep event-display)`

Expect to see something like:

```
CloudEvent Object received. 

Version:  1.0  

Type:  dev.knative.apiserver.resource.add  

Data:  {
  apiVersion: 'v1',
  count: 1,
  eventTime: null,
  firstTimestamp: '2020-08-26T15:07:40Z',
  involvedObject: {
    apiVersion: 'v1',
    fieldPath: 'spec.containers{busybox}',
    kind: 'Pod',
    name: 'busybox',
    namespace: 'knative-test',
    resourceVersion: '2200402',
    uid: '0ec22f40-310b-4443-abb6-907d39e99bd6'
  },
  kind: 'Event',
  lastTimestamp: '2020-08-26T15:07:40Z',
  message: 'Started container busybox',
  metadata: {
    creationTimestamp: '2020-08-26T15:07:40Z',
    name: 'busybox.162ed9dcc744020d',
    namespace: 'knative-test',
    resourceVersion: '2200427',
    selfLink: '/api/v1/namespaces/knative-test/events/busybox.162ed9dcc744020d',
    uid: '553e232e-a317-4fed-91fa-ab32deb2fc9c'
  },
  reason: 'Started',
  reportingComponent: '',
  reportingInstance: '',
  source: { component: 'kubelet', host: 'ip-10-0-141-82.ec2.internal' },
  type: 'Normal'
}  
```

To delete this object, run: 

`oc delete -f ./deploy/apiserversource.yaml`

## Channels and Subscriptions

All the examples we've gone through so far are examples of the "Source to Sink" pattern, i.e. the Knative Event Source is connected directly to the Knative Service (Sink).  Next we'll demonstrate how to setup an Eventing Channel.
<!-- 
curl -L "https://github.com/knative/eventing-contrib/\
releases/download/v0.14.1/kafka-channel.yaml" \
 | sed 's/REPLACE_WITH_CLUSTER_URL/my-cluster-kafka-bootstrap.kafka:9092/' \
 | oc apply --filename - -->

First thing we need to do is to setup the config-kafka config map in the knative-eventing namespace

```
apiVersion: v1
kind: ConfigMap
metadata:
  name: config-kafka
  namespace: knative-eventing
data:
  # Broker URL. Replace this with the URLs for your kafka cluster,
  # which is in the format of my-cluster-kafka-bootstrap.my-kafka-namespace:9092.
  bootstrapServers: my-cluster-kafka-bootstrap.kafka:9092
```

To update this config map run `oc apply -f ./deploy/channels/kafka-config.yaml`

Next we configure kafka as the default Knative Channel for the knative-test namespace.

To do this we create a config map in the knative-eventing namespace.  As you can see below in the namespaceDefaults section we're defining a KafkaChannel for the knative-test namespace.

```
apiVersion: v1
kind: ConfigMap
metadata:
  name: default-ch-webhook
  namespace: knative-eventing
data:
  default-ch-config: |
    clusterDefault:
      apiVersion: messaging.knative.dev/v1
      kind: InMemoryChannel
    namespaceDefaults:
      knative-test:
        apiVersion: messaging.knative.dev/v1alpha1
        kind: KafkaChannel
        spec:
          numPartitions: 2
          replicationFactor: 1
```

To update this config map run:

`oc apply -f ./deploy/channels/default-kafka-channel.yaml`

Next we'll setup a channel in the knative-test namespace.  To do this we will create a Channel object with the following configuration.

```
apiVersion: messaging.knative.dev/v1beta1 
kind: Channel
metadata:
  name: my-events-channel
  namespace: knative-test 
spec: {}
```

To apply create this channel run:

`oc apply -f ./deploy/channels/channel.yaml`

Running `oc get channel` will now "confusingly" show two channels listed, both should show READY=true

```
oc get channel     
NAME                READY     REASON    URL                                                                  AGE
my-events-channel   True                http://my-events-channel-kn-channel.knative-test.svc.cluster.local   24m

NAME                READY     REASON    URL                                                                  AGE
my-events-channel   True                http://my-events-channel-kn-channel.knative-test.svc.cluster.local   24m
```

The reason for this apparent duplication is the channel creation automatically created a KafkaChannel, running `oc describe channel` will show both channels and their relationship.

We should now be able to see the channel we created listed in the kafka topics

oc  -n kafka exec my-cluster-kafka-0 -c kafka -i -t -- bin/kafka-topics.sh --bootstrap-server localhost:9092 --list

```
__consumer_offsets
knative-messaging-kafka.knative-test.my-events-channnel
my-topic
```

Now we can create a PingSource using this channel as a sink.  

```
apiVersion: sources.knative.dev/v1alpha2
kind: PingSource
metadata:
  name: eventinghello-cronjob-source-channel
spec:
  schedule: "*/2 * * * *"
  jsonData: '{"name": "Hans Zarkov"}'
  sink:
    ref:
      apiVersion: messaging.knative.dev/v1beta1 
      kind: Channel
      name: my-events-channel

```

`oc apply -f ./deploy/channels/eventinghello-source-ch.yaml`

Running `oc get pingsource` should show:

```
NAME                                   READY     REASON    SINK                                                                 AGE
eventinghello-cronjob-source-channel   True                http://my-events-channel-kn-channel.knative-test.svc.cluster.local   27m
```

Ensure this record shows READY=true, if it doesn't run `oc describe pingsource eventinghello-cronjob-source-channel` to view the events.

Next, create two Knative Services:

`oc apply -f ./deploy/channels/event-display-channel1.yaml`

`oc apply -f ./deploy/channels/event-display-channel2.yaml`

Finally create subscriptions for these services to the channel

```
apiVersion: messaging.knative.dev/v1alpha1 
kind: Subscription
metadata:
  name: channel-subscription-1
spec:
  channel:
    apiVersion: messaging.knative.dev/v1beta1 
    kind: Channel
    name: my-events-channel
  subscriber: 
    ref:
      apiVersion: serving.knative.dev/v1alpha1 
      kind: Service
      name: event-display-channel-1
```

`oc apply -f ./deploy/channels/channel-1-subscription.yaml`

`oc apply -f ./deploy/channels/channel-2-subscription.yaml`

We can now wait for the pingSource to fire the event, invoking the service.  Looking at the logs of the service you should see:

```
App Version 1.0 listening on:  8080
Received body
{ name: 'Hans Zarkov' }
{"id":"3fd0a8a0-401b-44f3-8e3d-97d87a52d5fa","type":"dev.knative.sources.ping","source":"/apis/v1/namespaces/knative-test/pingsources/eventinghello-cronjob-source-channel","specversion":"1.0","datacontenttype":"application/json","knativehistory":"my-events-channel-kn-channel.knative-test.svc.cluster.local","time":"2020-08-27T18:00:00.000Z","data":{"name":"Hans Zarkov"}}
CloudEvent Object received. 

Version:  1.0  

Type:  dev.knative.sources.ping  

Data:  { name: 'Hans Zarkov' }  
```

To remove this channel and subscriptions

`oc delete -f ./deploy/channels/channel-1-subscription.yaml`

`oc delete -f ./deploy/channels/channel-2-subscription.yaml`

`oc delete -f ./deploy/channels/event-display-channel1.yaml`

`oc delete -f ./deploy/channels/event-display-channel2.yaml`

`oc delete -f ./deploy/channels/eventinghello-source-ch.yaml`

`oc delete -f ./deploy/channels/channel.yaml`



# Brokers and triggers

Brokers are similar to channels but also add the ability to add triggers and filters to route messages based on header data.

`oc apply -f ./deploy/broker/broker.yaml`

To check the status of the broker run `oc get brokers`

```
NAME      READY     REASON    URL                                                                             AGE
default   True                http://broker-ingress.knative-eventing.svc.cluster.local/knative-test/default   24m
```

If you don't see True in the READY column, run `oc describe broker default` to check the events.

Next we will deploy two Knative services event-display-broker-1 and event-display-broker-2

`oc apply -f ./deploy/broker/event-display-broker-1.yaml`

`oc apply -f ./deploy/broker/event-display-broker-2.yaml`

Once these are deployed we can deploy some triggers.  We're going to deploy two triggers, one to filter messages from **dev.knative.sources.ping** and the other to filter messages from **dev.knative.container.event**

The format of these triggers are as follows:

```
apiVersion: eventing.knative.dev/v1beta1
kind: Trigger
metadata:
  name: my-service-trigger-1
  namespace: knative-test
spec:
  broker: default
  filter:
    attributes:
      type: dev.knative.sources.ping
  subscriber:
    ref:
      apiVersion: serving.knative.dev/v1beta1
      kind: Service
      name: event-display-broker-1
```

```
apiVersion: eventing.knative.dev/v1beta1
kind: Trigger
metadata:
  name: my-service-trigger-2
  namespace: knative-test
spec:
  broker: default
  filter:
    attributes:
      type: dev.knative.container.event
  subscriber:
    ref:
      apiVersion: serving.knative.dev/v1beta1
      kind: Service
      name: event-display-broker-2
```

To create these run:

`oc apply -f ./deploy/broker/trigger-1.yaml`

`oc apply -f ./deploy/broker/trigger-2.yaml`

Running `oc get triggers` should show:

```
NAME                   READY     REASON    BROKER    SUBSCRIBER_URI   AGE
my-service-trigger-1   True                default                    8m13s
my-service-trigger-2   True                default                    8m18s
```

Again, if you don't see True in the READY column check the trigger with `oc describe trigger trigger-name` to check the events.

Once the triggers are deployed we can now deploy to Event sources, a ping source and container source.  Both of these are configured with their Sink pointing to the broker.

```
apiVersion: sources.knative.dev/v1alpha2
kind: PingSource
metadata:
  name: test-ping-source
spec:
  schedule: "*/1 * * * *"
  jsonData: '{"message": "Hello world!"}'
  sink:
    ref:
      # Deliver events to Broker.
      apiVersion: eventing.knative.dev/v1beta1
      kind: Broker
      name: default
```

```
apiVersion: sources.knative.dev/v1alpha2
kind: ContainerSource
metadata:
  name: broker-container-source
spec:
  template:
    spec:
      containers:
        - image: image-registry.openshift-image-registry.svc:5000/knative-test/container-source:latest
          name: container-source
          env:
            - name: POD_NAME
              value: "mypod"
            - name: POD_NAMESPACE
              value: "knative-test"
  sink:
    ref:
      # Deliver events to Broker.
      apiVersion: eventing.knative.dev/v1beta1
      kind: Broker
      name: default
```

To deploy these run:

`oc apply -f ./deploy/broker/ping-source.yaml`

`oc apply -f ./deploy/broker/container-source.yaml`

Running `oc get sources` should show:

```
NAME               READY     REASON    SINK                                                                            AGE
test-ping-source   True                http://broker-ingress.knative-eventing.svc.cluster.local/knative-test/default   22m

NAME                                  READY     REASON    SINK                                                                            AGE
broker-container-source-sinkbinding   True                http://broker-ingress.knative-eventing.svc.cluster.local/knative-test/default   13m

NAME                      READY     REASON    SINK                                                                            AGE
broker-container-source   True                http://broker-ingress.knative-eventing.svc.cluster.local/knative-test/default   13m
```

After a while you should see both versions of the event-display-broker being invoked.

```
NAME                                                       READY     STATUS    RESTARTS   AGE
broker-container-source-deployment-7485f95565-xl4pd        1/1       Running   0          4m54s
event-display-broker-1-2g6qd-deployment-7f7889499d-mmw5g   2/2       Running   0          93s
event-display-broker-2-qtnpw-deployment-5c8df4dc95-7qlpg   2/2       Running   0          33s
```

To delete this broker:


`oc delete -f ./deploy/broker/container-source.yaml`

`oc delete -f ./deploy/broker/ping-source.yaml`

`oc delete -f ./deploy/broker/trigger-1.yaml`

`oc delete -f ./deploy/broker/trigger-2.yaml`

`oc delete -f ./deploy/broker/event-display-broker-1.yaml`

`oc delete -f ./deploy/broker/event-display-broker-2.yaml`

`oc delete -f ./deploy/broker/broker.yaml`