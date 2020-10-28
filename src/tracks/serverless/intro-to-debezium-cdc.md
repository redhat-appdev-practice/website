---
title: Introduction to Debezium and CDC
initialOpenGroupIndex: -1
collapsable: true
sidebarDepth: 1
tags:
- debezium
- kafka
- mysql
- serverless
- eventing
---

# Introduction to Debezium and CDC


## Video
<iframe width="560" height="315" src="https://youtu.be/mHCYu0buPyE" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## Intro

In this lab we are going to go through the complete end-to-end setup of Debezium, Mysql, and Kafka to demonstrate CDC.

## Setup

Checkout the base project `git clone https://github.com/redhat-appdev-practice/knative-debezium.git`


## Install operators

Install Serverless Operator, strimzi operator and Knative Apache Kafka operator

`oc apply -f ./deploy/operators.yaml`

Deploy operator subscriptions

`oc apply -f ./deploy/operator-subscriptions.yaml`


## Create persistent instance of mysql

Create a mysql namespace

`oc new-project mysql`

`oc new-app mysql-persistent`


Open terminal to mysql pod and login as root:

`oc rsh $(oc get pods -o name | grep -v deploy)`

Login to mysql as root

`mysql -u root`

Execute the following sql:

```
create USER 'debezium'@'%' IDENTIFIED WITH mysql_native_password BY 'dbz'; 

GRANT SELECT, RELOAD, SHOW DATABASES, REPLICATION SLAVE, REPLICATION CLIENT  ON *.* TO 'debezium';

create database inventory;

use inventory;

CREATE TABLE IF NOT EXISTS customers (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)  ENGINE=INNODB;

INSERT INTO customers (name) VALUES ('Dale Arden'); 
```

Verify the table is created and populated;

`select * from customers;`

Close the connection to the mysql pod

## Setup kafka
Create a kafka namespace

`oc new-project kafka`

Deploy kafka

` oc apply -f ./deploy/kafka.yaml`

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

# Kafka Connect 


## Debezium mysql plugin download

Download the mysql debezium plugin from this link: [Mysql plugin](https://repo1.maven.org/maven2/io/debezium/debezium-connector-mysql/1.2.0.Final/debezium-connector-mysql-1.2.0.Final-plugin.tar.gz) and extract this archive into the ./kafka-connect/plugins folder.

`wget -c https://repo1.maven.org/maven2/io/debezium/debezium-connector-mysql/1.2.0.Final/debezium-connector-mysql-1.2.0.Final-plugin.tar.gz -O - | tar -xz -C  ./kafka-connect/plugins `


## Build the Kafka connect image

Create an environment variable QUAY_USERNAME

`export QUAY_USERNAME=yourUserName`

`podman build ./kafka-connect -t quay.io/$QUAY_USERNAME/kafka-connect-debezium:v1.0`

You will need a quay.io account to push your container image.  
Login to quay with podman:

`podman login quay.io`


`podman push quay.io/$QUAY_USERNAME/kafka-connect-debezium:v1.0`

NB: You may need to make this repository public using the Quay console.

Next we're going to create a properties file with our mysql credentials

```
cat <<EOF > debezium-mysql-credentials.properties
mysql_username: debezium
mysql_password: dbz
EOF
```

We're now going to create a secret from this properties file
```
oc -n kafka create secret generic my-sql-credentials \
  --from-file=debezium-mysql-credentials.properties
rm debezium-mysql-credentials.properties
```

Create Kafka Connect instance from our custom image.

```
cat <<EOF | oc -n kafka apply -f -
apiVersion: kafka.strimzi.io/v1beta1
kind: KafkaConnect
metadata:
  name: my-connect-cluster
  annotations:
  # use-connector-resources configures this KafkaConnect
  # to use KafkaConnector resources to avoid
  # needing to call the Connect REST API directly
    strimzi.io/use-connector-resources: "true"
spec:
  image: quay.io/${QUAY_USERNAME}/kafka-connect-debezium:v1.0 
  replicas: 1
  bootstrapServers: my-cluster-kafka-bootstrap:9093
  tls:
    trustedCertificates:
      - secretName: my-cluster-cluster-ca-cert
        certificate: ca.crt
  config:
    config.storage.replication.factor: 1
    offset.storage.replication.factor: 1
    status.storage.replication.factor: 1
    config.providers: file
    config.providers.file.class: org.apache.kafka.common.config.provider.FileConfigProvider
  externalConfiguration:
    volumes:
      - name: connector-config
        secret:
          secretName: my-sql-credentials

EOF

```

Wait for the my-connect-cluster-connect-xxxxx pod to be ready.

## create the kafka connect instance

`oc apply -f ./deploy/kafkaConnector.yaml`

## Test debezium connection

List kafka topics:

`oc  -n kafka exec my-cluster-kafka-0 -c kafka -i -t -- bin/kafka-topics.sh --bootstrap-server localhost:9092 --list`

You should see something like:

```
OpenJDK 64-Bit Server VM warning: If the number of processors is expected to increase from one, then you should configure the number of parallel GC threads appropriately using -XX:ParallelGCThreads=N
__consumer_offsets
connect-cluster-configs
connect-cluster-offsets
connect-cluster-status
inventory
inventory.inventory.customers
schema-changes.inventory
```

Monitor the inventory.inventory.customers kafka topic
 pod terminal perform the following:

```
oc rsh  -n mysql  $(oc get pods -o name -n mysql | grep -v deploy)
mysql -u root
use inventory;
update customers set name = 'Hans Zarkov' where customer_id = 1;
```
```
oc -n kafka exec my-cluster-kafka-0 -c kafka -i -t -- \
 bin/kafka-console-consumer.sh \
    --bootstrap-server localhost:9092 \
    --topic inventory.inventory.customers 
```

From the MYSQL

The kafka topic monitor should show something like:

```
{"schema":{"type":"struct","fields":[{"type":"struct","fields":[{"type":"int32","optional":false,"field":"customer_id"},{"type":"string","optional":false,"field":"name"},{"type":"string","optional":true,"name":"io.debezium.time.ZonedTimestamp","version":1,"field":"created_at"}],"optional":true,"name":"inventory.inventory.customers.Value","field":"before"},{"type":"struct","fields":[{"type":"int32","optional":false,"field":"customer_id"},{"type":"string","optional":false,"field":"name"},{"type":"string","optional":true,"name":"io.debezium.time.ZonedTimestamp","version":1,"field":"created_at"}],"optional":true,"name":"inventory.inventory.customers.Value","field":"after"},{"type":"struct","fields":[{"type":"string","optional":false,"field":"version"},{"type":"string","optional":false,"field":"connector"},{"type":"string","optional":false,"field":"name"},{"type":"int64","optional":false,"field":"ts_ms"},{"type":"string","optional":true,"name":"io.debezium.data.Enum","version":1,"parameters":{"allowed":"true,last,false"},"default":"false","field":"snapshot"},{"type":"string","optional":false,"field":"db"},{"type":"string","optional":true,"field":"table"},{"type":"int64","optional":false,"field":"server_id"},{"type":"string","optional":true,"field":"gtid"},{"type":"string","optional":false,"field":"file"},{"type":"int64","optional":false,"field":"pos"},{"type":"int32","optional":false,"field":"row"},{"type":"int64","optional":true,"field":"thread"},{"type":"string","optional":true,"field":"query"}],"optional":false,"name":"io.debezium.connector.mysql.Source","field":"source"},{"type":"string","optional":false,"field":"op"},{"type":"int64","optional":true,"field":"ts_ms"},{"type":"struct","fields":[{"type":"string","optional":false,"field":"id"},{"type":"int64","optional":false,"field":"total_order"},{"type":"int64","optional":false,"field":"data_collection_order"}],"optional":true,"field":"transaction"}],"optional":false,"name":"inventory.inventory.customers.Envelope"},"payload":{"before":{"customer_id":1,"name":"Dale Arden","created_at":"2020-07-14T17:09:05Z"},"after":{"customer_id":1,"name":"Hans Zarkov","created_at":"2020-07-14T17:09:05Z"},"source":{"version":"1.2.0.Final","connector":"mysql","name":"inventory","ts_ms":1594748682000,"snapshot":"false","db":"inventory","table":"customers","server_id":1,"gtid":null,"file":"binlog.000002","pos":1839,"row":0,"thread":654,"query":null},"op":"u","ts_ms":1594748682439,"transaction":null}}
```

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

Deploy KnativeEventingKafka in knative-eventing
 
 `oc apply -f ./deploy/knativeEventingKafka.yaml`

 Wait for the pods to be created:

 ```
oc get pods -n  knative-eventing     
NAME                                        READY     STATUS    RESTARTS   AGE
broker-controller-77c5f87cfc-45tml          1/1       Running   0          5m16s
eventing-controller-59f677db96-q542m        1/1       Running   0          5m25s
eventing-webhook-6ccdcd59d5-hmpvf           1/1       Running   0          5m25s
imc-controller-9dcc65bd-xrstj               1/1       Running   0          5m13s
imc-dispatcher-6bdddfc8bf-2fwfd             1/1       Running   0          5m13s
kafka-ch-controller-77545cdfd9-nb4hg        1/1       Running   0          40s
kafka-controller-manager-69c9c9f7fb-89n9m   1/1       Running   0          49s
kafka-webhook-586bc65d47-r9jxq              1/1       Running   0          38s
 ```

## Knative app build

You will need a quay.io account to push your container image.  
Login to quay with podman:

`podman login quay.io`

Create an environment variable QUAY_USERNAME

`export QUAY_USERNAME=yourUserName`

Build the knative app image and tag.

`podman build -t quay.io/$QUAY_USERNAME/knative-nodejs:v1.0 ./knative-app`

Push the image to quay

`podman push quay.io/$QUAY_USERNAME/knative-nodejs:v1.0`

NB: You may need to make this repository public using the Quay console.

## Deploy knative node.js sample app

`oc new-project knative-test`

Deploy the Knative event-display service using the image we pushed to your quay.io repository.

```
cat <<EOF | oc -n knative-test apply -f -
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: event-display
spec:
  template:
    spec:
      containers:
      - image: quay.io/${QUAY_USERNAME}/knative-nodejs:v1.0
     
EOF
```

Check the logs of the pod e.g.

`oc logs -f -c user-container  $(oc get pods -o name | grep event-display)`

You should see:

```

> node-knative@1.0.0 start /usr/src/app
> node index.js

App Version 1.0 listening on:  8080
```

Create the event source:

`oc apply -f ./deploy/event-source-simple.yaml`

## Final test

From the MYSQL pod terminal perform the following:
`oc rsh  -n mysql  $(oc get pods -o name -n mysql | grep -v deploy)`
```
mysql -u root
use inventory;
update customers set name = 'General Klytus' where customer_id = 1;
```

Looking at the logs of the event-display pod you should see something like:

`oc logs -f -c user-container -n knative-test  $(oc get pods -o name -n knative-test | grep event-display)`

```
CloudEvent {
  spec: Spec1 {
    payload: {
      specversion: '1.0',
      id: 'partition:0/offset:4',
      time: '2020-07-14T19:23:34.284Z',
      source: '/apis/v1/namespaces/knative-test/kafkasources/kafka-source#inventory.inventory.customers',
      type: 'dev.knative.kafka.event',
      datacontenttype: 'application/json',
      data: [Object],
      subject: 'partition:0#4',
      key: '{"schema":{"type":"struct","fields":[{"type":"int32","optional":false,"field":"customer_id"}],"optional":false,"name":"inventory.inventory.customers.Key"},"payload":{"customer_id":1}}',
      traceparent: '00-4578e0341baf85188e8da3bc2a77cfce-154508a08d6ac08f-00'
    }
  },
  formatter: JSONFormatter {},
  extensions: {
    traceparent: '00-4578e0341baf85188e8da3bc2a77cfce-154508a08d6ac08f-00',
    key: '{"schema":{"type":"struct","fields":[{"type":"int32","optional":false,"field":"customer_id"}],"optional":false,"name":"inventory.inventory.customers.Key"},"payload":{"customer_id":1}}'
  }
}
```