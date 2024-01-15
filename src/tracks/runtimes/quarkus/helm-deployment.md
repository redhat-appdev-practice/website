---
title: Deploy Your Quarkus App To Kubernetes With Helm
tags:
- java
- graalvm
- graal
- native-image
- quarkus
- panache
- openapi
- api
- rest
- openapi-generator
- contract-first
- helm
- kubernetes
- openshift
- containers
- docker
- podman
---

# Setting Up To Deploy With Helm 3

Helm helps you manage Kubernetes applications — Helm Charts help you define, install, and upgrade even the most complex Kubernetes application.

We do not have the time to completely explain creating a Helm chart for this application, and besides we want you to check out my colleague Jamie Land telling you [about Helm](/tracks/devtools/helm-intro.html). In this case, our Quarkus setup will be using [Eclipse JKube](https://www.eclipse.org/jkube/docs/) to create our Helm chart for us:

1. Open the Maven `pom.xml` and locate the Eclipse JKube plugin (Either `kubernetes-maven-plugin` or `openshift-maven-plugin` depending on your target)
1. Add some customizations to the plugin config so allow for overriding the application configuration
    ```xml
    <configuration>
      <enricher>
        <config>
          <jkube-openshift-route> <!-- Used for OpenShift Routes -->
            <generateRoute>true</generateRoute>
            <tlsInsecureEdgeTerminationPolicy>Redirect</tlsInsecureEdgeTerminationPolicy>
            <tlsTermination>edge</tlsTermination>
          </jkube-openshift-route>
        </config>
      </enricher>
      <resources>
        <ingress> <!-- Used for Kubernetes Ingress -->
          <ingressTlsConfigs>
            <ingressTlsConfig>
               <hosts>
                 <host>foo.bar.com</host>
               </hosts>
               <secretName>testsecret-tls</secretName>
            </ingressTlsConfig>
          </ingressTlsConfigs>
          <ingressRules>
            <ingressRule>
              <host>foo.bar.com</host>
              <paths>
                <path>
                  <pathType>Prefix</pathType>
                  <path>/foo</path>
                  <serviceName>service1</serviceName>
                  <servicePort>8080</servicePort>
                </path>
              </paths>
            </ingressRule>
          </ingressRules>
        </ingress>
      </resources>
      <helm>
        <chart>todoapp</chart>
        <keywords>quarkus,todo,postgresql,rest,api,openapi</keywords>
      </helm>
    </configuration>
    ```
1. Create the directory `src/main/jkube` where we can add additional Kubernetes/OpenShift resources
1. Add a **ConfigMap** to contain our application settings:
    ```yaml
    data:
      application.yaml: |
        mp:
          openapi:
            scan:
              disable: 'true'
        quarkus:
          datasource:
            db-kind :  postgresql
              username: ${TODODB_USER:tododb}
              password: ${TODODB_PASS:tododb}
              jdbc:
                driver: org.postgresql.Driver
                url: ${TODODB_URL:jdbc:postgresql://localhost:5432/hibernate_orm_test}
        log:
          console:
            json: 'true'
        oidc:
          auth-sever-url: https://oidc.example.c
    ```
    ::: tip
    Notice that you do **NOT** need to add a metadata header to the configmap. JKube will do that based on your configuration
    :::
1. Add a **Deployment** for our Database pod to `src/main/jkube/postgresql-deployment.yml`
    ```yaml
    metadata:
      annotations:
        configmap.jkube.io/update-on-change: ${project.artifactId}
    spec:
      template:
        spec:
          volumes:
            - name: config
              configMap:
                name: ${project.artifactId}
                items:
                - key: application.yaml
                  path: application.yaml
          containers:
            - volumeMounts:
              - name: config
                mountPath: /deployments/config
            - env:
              - name: JAVA_OPTS
                value: '-Dquarkus.config.locations=/deployments/config'
              - name: TODODB_USER
                value: tododb
              - name: TODODB_PASS
                value: tododb
              - name: TODODB_URL
                value: 'jdbc:postgresql://tododb:5432/todo'
    ```
1. Generate the Helm chart
    ```bash
    ./mvnw oc:resource oc:helm    ### For OpenShift
    ./mvnw k8s:resource k8s:helm  ### For Kubernetes
    ```
1. The Helm chart will be created in `target/jkube/helm/todoapp` and can be run from there.
