---
title: Maven Archetypes
initialOpenGroupIndex: -1
collapsable: true
tags:
- maven
- mvn
- groovy
- archetype
- bootstrap
- tooling
- java
---

# Maven Archetypes

[Apache Maven](https://maven.apache.org), the venerable project management tool, provides a lot of functionality which 
can lead to situations where developers are intimidated by it's nearly endless configuration. It's not uncommon to 
talk to development teams that avoid ever modifying anything in their `pom.xml` beyond the dependencies list. This
tutorial will show you how you can leverage [Maven Archetypes](https://maven.apache.org/guides/introduction/introduction-to-archetypes.html) to simplify bootstrapping projects with the features that you use and the
development standards you wish to enforce.

## What is an Archetype?

From the Maven web site:

> In short, Archetype is a Maven project templating toolkit. An archetype is defined as an original pattern or model from which 
> all other things of the same kind are made. The name fits as we are trying to provide a system that provides a consistent means 
> of generating Maven projects. Archetype will help authors create Maven project templates for users, and provides users with the 
> means to generate parameterized versions of those project templates.
> 
> Using archetypes provides a great way to enable developers quickly in a way consistent with best practices employed by your project or 
> organization. Within the Maven project, we use archetypes to try and get our users up and running as quickly as possible by providing a sample 
> project that demonstrates many of the features of Maven, while introducing new users to the best practices employed by Maven. In a matter of 
> seconds, a new user can have a working Maven project to use as a jumping board for investigating more of the features in Maven. We have also 
> tried to make the Archetype mechanism additive, and by that we mean allowing portions of a project to be captured in an archetype so that pieces 
> or aspects of a project can be added to existing projects. A good example of this is the Maven site archetype. If, for example, you have used 
> the quick start archetype to generate a working project, you can then quickly create a site for that project by using the site archetype within 
> that existing project. You can do anything like this with archetypes.

## Sounds Complicated!

Actually, you can create an archetype very quickly and easily with a single command! Maven provide the ability to create an Archetype
from an existing Maven project by running `mvn archetype:create-from-project`. It will analyze your project `pom.xml` and all of the source code
files and do a pretty good job of creating a working archetype, though you will likely want to customize and clean up your archetypes. 

Let's say you have a project which is for SpringBoot. Sure, you can use [Spring Initializr](https://start.spring.io/) and that will give you the
basics, but perhaps your organization has other standards they would like to include? Imagine that you could bootstrap a Spring app with the normal
capabilities, but you could also include things like dependency analysis, container packaging, static code analysis, unit and integration testing, 
and much more with a single command? With a custom archetype you can do this pretty simply.

## Getting Started

Start with a Maven project generated using the [OpenShift Launcher](https://launch.openshift.io/)

1. Click on **Start**
   ![OpenShift Launcher](/mvn-archetype-launcher-step-01.png)
1. Click on **Deploy an Example Application**
   ![OpenShift Launcher](/mvn-archetype-launcher-step-02.png)
1. Click **Select an Example**
   ![OpenShift Launcher](/mvn-archetype-launcher-step-03.png)
1. Select **REST API Level 0** and choose the **SpringBoot** runtime
   ![OpenShift Launcher](/mvn-archetype-launcher-step-04.png)
1. Click **Save**
1. Click **Download** and extract the ZIP file of your example project
   ![OpenShift Launcher](/mvn-archetype-launcher-step-05.png)

## Reviewing The Generated Project

1. Open the generated project in your favorite IDE/Editor. Our examples here will show using [VSCode](https://code.visualstudio.com/)
1. Open the `pom.xml` file and review the following sections:
   * The `parent` POM points to SnowDrop, which is the Red Hat supported distribution of SpringBoot
   * The `groupId`, `artifactId`, and `version` are generated with values that you might like to change for your organization
   ![OpenShift Launcher](/mvn-archetype-pom-step-06.png)
1. Lower in the `pom.xml`, in the `plugins` section, note the following plugins are installed and configured
   * Spring Boot plugin
   * Maven Failsafe Integration Testing
   * Fabric8 Kubernetes Tooling (Deprecated, we will replace it with JKube in a later step)
   ![OpenShift Launcher](/mvn-archetype-pom-step-07.png)
1. Make a note that it already has [Maven Wrapper](https://github.com/takari/maven-wrapper)<br />
   ![OpenShift Launcher](/mvn-archetype-pom-step-08.png)
1. Note that the application has some simple REST endpoints defined<br />
   ![OpenShift Launcher](/mvn-archetype-pom-step-09.png)

## Customizing The Project

1. Delete the Fabric8 plugin from the `pom.xml`
1. Add the [Eclipse JKube Plugin](https://www.eclipse.org/jkube/docs/kubernetes-maven-plugin)
   ```xml
   <plugin>
     <groupId>org.eclipse.jkube</groupId>
     <artifactId>kubernetes-maven-plugin</artifactId>
     <version>1.3.0</version>
   </plugin>
   ```
1. Delete the `src/main/fabric8` subdirectory from the project
1. Add the [SonarQube Scanner For Maven](https://docs.sonarqube.org/latest/analysis/scan/sonarscanner-for-maven/)
   ```xml
   <plugin>
     <groupId>org.sonarsource.scanner.maven</groupId>
     <artifactId>sonar-maven-plugin</artifactId>
     <version>3.7.0.1746</version>
   </plugin>
   ```
1. Add the [PITest](http://pitest.org/) Mutation Coverage Plugin
   ```xml
   <plugin>
     <groupId>org.pitest</groupId>
     <artifactId>pitest-maven</artifactId>
     <version>1.6.7</version>
     <configuration>
       <targetClasses>
         <param>dev.snowdrop.example*</param>
       </targetClasses>
       <targetTests>
         <param>dev.snowdrop.example*</param>
       </targetTests>
       <withHistory>true</withHistory>
       <mutationThreshold>60</mutationThreshold>
     </configuration>
   </plugin>
   ```
1. Add some dependencies that we want to use in all/most of our projects
   ```xml
   <dependency>
     <groupId>org.projectlombok</groupId>
     <artifactId>lombok</artifactId>
     <version>1.18.20</version>
   </dependency>
   <dependency>
     <groupId>org.mapstruct</groupId>
     <artifactId>mapstruct-jdk8</artifactId>
     <version>1.3.0.Beta2</version> 
   </dependency>
   ```

## Convert Our Project To An Archetype

1. From the root of our example project, run the command `mvn archetype:create-from-project`
1. Copy the contents of the `target/generated-sources/archetype` to a new directory, this is your new archetype!
1. In the new archetype directory, edit the `pom.xml` and change the project info as follows:
   ```xml
   <groupId>com.redhat.runtimes</groupId>
   <artifactId>springboot-archetype</artifactId>
   <version>1.0.0</version>
   <packaging>maven-archetype</packaging>
   
   <name>springboot-archetype</name>
   ```

## Trying Out The Generated Archetype

1. From the root of the Archetype directory, run `mvn install`
1. Change to a directory where you would like to generate a new project
1. Generated a new project using the Archetype
   ```bash
   mvn archetype:generate -DarchetypeGroupId=com.redhat.runtimes -DarchetypeArtifactId=springboot-archetype -DarchetypeVersion=1.0.0
   ```
1. Fill in the prompted information
   ![OpenShift Launcher](/mvn-archetype-uncustomized-test-10.png)
1. Open the newly generated project and note that:
   * It *tried* to update the Java code to be in the package you filled in
   * It did not move the test classes to the correct package
   * It updated the generated `pom.xml` to use the correct `groupId`, `artifactId`, and `version`
   * It **FAILED** to update the PITest Maven Plugin to use the correct packages
   ![OpenShift Launcher](/mvn-archetype-uncustomized-test-11.png)
1. Delete the generated application

## Improve The Archetype

1. Open the Archetype project in your favorite IDE/Editor
1. Open the `archetype-metadata.xml` file
   ![OpenShift Launcher](/mvn-archetype-customize-step-12.png)
1. Note that there are a number of `<fileSet>` objects with different attributes and elements. Each fileset represents a directory and set of patterns for files to be managed by the archetype.
1. Note that some `fileSet` elements have attributes like `packaged` and `filtered`
   * `packaged` fileSets can have their directory name converted to a package heirarchy, for example in the case of Java source files
   * `filtered` fileSets allow for [Velocity](https://velocity.apache.org/) templating and substitution
1. Let's change the fileSet for the `*.java` files so that it will not exclude the `ExampleApplication.java` class
   * Remove the `<excludes>` section from that `<fileSet>`.
   * Remove the following `<fileSet>` which covers that formerly excluded file
   ![OpenShift Launcher](/mvn-archetype-customize-step-13.png)
1. Let's fix the packaging for the `src/test/java` files
   * Find the `<fileSet>` for the `src/test/java` directory which includes the `**/*.java` files
   * On the `<fileSet>` element, add the attribute `packaged="true"`
   * Also, move the Java source files in `src/main/resources/archetype-resources/src/test/java/dev/snowdrop/example` to `src/main/resources/archetype-resources/src/test/java`
   ![OpenShift Launcher](/mvn-archetype-customize-step-14.png)
1. Now we will remove the IDE/Editor specific items from the Archetype
   * Find the `<fileSet>` for the `.settings` directory (if it exists) and delete it
   * Find the `<fileSet>` for the `.project` and `.classpath` (if it exists) files and delete it
   * Find the `<fileSet>` for the `.vscode` or `.idea` directories (if they exist) and delete them
   * Delete the directories/files indicated above from the `src/main/resources/archetype-resources` directory
   ![OpenShift Launcher](/mvn-archetype-customize-step-15.png)
1. Ignore/remove the Maven Wrapper JAR file
   * Find the `<fileSet>` for the `.mvn/wrapper` directory and including the `**/*.jar` files, delete it.
   * Delete the file `src/main/resources/archetype-resources/.mvn/wrapper/maven-wrapper.jar`
   ![OpenShift Launcher](/mvn-archetype-customize-step-16.png)
1. Next, we will fix the package names used in the PITest Maven Plugin
   * Open the `src/main/resources/archetype-resources/pom.xml`
   * Locate the PITest Maven Plugin section
   * Replace `dev.snowdrop.example` with `${package}`
   ![OpenShift Launcher](/mvn-archetype-customize-step-17.png)
     * The `${package}` value is provided from the prompts we saw when we ran our archetype the first time. Those properties are **ALWAYS** in the form of `[A-Za-z0-9_]+`. You cannot use dotted properties for Archetype Velocity templates
1. Perhaps we would like to allow the developer to choose to enable or disable PITest when creating a new project
   * In the `src/main/resources/archetype-resources/pom.xml`, change the PITest plugin as shown
    ```xml
    #if($enable_pitest == "true")
    <plugin>
        <groupId>org.pitest</groupId>
        <artifactId>pitest-maven</artifactId>
        <version>1.6.7</version>
        <configuration>
            <targetClasses>
            <param>${package}*</param>
            </targetClasses>
            <targetTests>
            <param>${package}*</param>
            </targetTests>
            <withHistory>true</withHistory>
            <mutationThreshold>60</mutationThreshold>
        </configuration>
    </plugin>
    #end
    ```
   * In the `src/main/resources/META-INF/maven/archetype-metadata.xml` file, add the new property as a `<requiredProperty>`
    ```xml
    <requiredProperties>
        <requiredProperty key="enable_pitest">
            <defaultValue>true</defaultValue>
        </requiredProperty>
    </requiredProperties>
    ```
    * Add the new `enable_pitest` property to the `src/test/resources/projects/basic/archetype.properties` file
      ```
      #Wed Jul 07 08:16:04 EDT 2021
      package=it.pkg
      groupId=archetype.it
      artifactId=basic
      version=0.1-SNAPSHOT
      enable_pitest=true
      ```

## Create A Test Project With Our Customized Archetype

1. In the archetype root directory, run `mvn install`
1. Change to a directory where you would like to create the project and run:
    ```bash
    mvn archetype:generate -DarchetypeGroupId=com.redhat.runtimes \
                           -DarchetypeArtifactId=springboot-archetype \
                           -DarchetypeVersion=1.0.0 \
                           -DgroupId=com.redhat.runtimes.springboot \
                           -DartifactId=springboot-from-archetype \
                           -Dversion=1.0.0-SNAPSHOT \
                           -Dpackage=com.redhat.runtimes.springboot \
                           -Denable_pitest=true \
                           -DinteractiveMode=false
    ```
   * This will generate a project while disabling interactive mode, so we have to pass the required properties on the command-line
1. Open the generated project and note the differences after our changes
1. Both the `src/main/java` and `src/test/java` classes are in their proper package directories
   ![OpenShift Launcher](/mvn-archetype-customized-test-18.png)
1. The package pattern in the PITest plugin configuration is corrected:
   ![OpenShift Launcher](/mvn-archetype-customized-test-19.png)
1. Delete the example project generated above

## Going To The Next Level

Velocity templates and variables combined with the `archetype-metadata.xml` configurations is quite powerful
for simple customization and allows you to accomplish quite a bit, but what if you need to customize even further? Maven archetypes have you covered with the capability to add a [Groovy](https://groovy.apache.org) script as a post-processing step when you generate a new project from an Archetype. Let's imagine that we would like to be able to add a list of additional dependencies to our generated `pom.xml`. We could do this by adding the following Groovy script to our archetype.

```groovy
import java.nio.file.Path
import java.nio.file.Paths
import groovy.xml.XmlParser

Properties properties = request.properties

def additionalDependencies = "${properties?.additionalDependencies}"

if (additionalDependencies.length() > 0) {
  String[] dependencies = "${properties.additionalDependencies}".split(',')

  Path pomFile = Paths.get(request.outputDirectory, request.artifactId, 'pom.xml')

  def sb = new StringBuilder();

  Scanner sc
  try {
    sc = new Scanner(pomFile)
    String currentLine = ''
    String lastLine = ''
    while(sc.hasNext()){
      lastLine = currentLine
      currentLine = sc.nextLine()
      if (currentLine.trim().length()==0) {
        continue
      }
      sb.append(currentLine).append("\n")
      if(lastLine.contains("</dependencyManagement>") && currentLine.contains("<dependencies>")) {
        for (def dep: dependencies) {
          String[] depInfo = dep.split(':')
          String scopeVal = 'compile'
          if (depInfo.length > 3) {
            scopeVal = depInfo[3]
          }
          sb.append('    <dependency>').append('\n')
          sb.append("      <groupId>${depInfo[0]}</groupId>").append('\n')
          sb.append("      <artifactId>${depInfo[1]}</artifactId>").append('\n')
          sb.append("      <version>${depInfo[2]}</version>").append('\n')
          sb.append("      <scope>${scopeVal}</scope>").append('\n')
          sb.append('    </dependency>').append('\n')
        }
      }
    }
  } finally {
    sc.close()
  }

  // Empty the parent pom file
//  PrintWriter pw = new PrintWriter(pomFile.toFile())
  PrintWriter pw = new PrintWriter(System.err)
  pw.close()

  // Write the modified parent pom
  PrintWriter writer = new PrintWriter(pomFile.toFile())
  writer.write(sb.toString())
  writer.close()
}
```

And now we need to enable that new `additionalDependencies` property by modifying the `src/main/resources/META-INF/maven/archetype-metadata.xml` as follows:
   ![OpenShift Launcher](/mvn-archetype-groovy-customize-step-20.png)

Anything that we can do with Groovy scripting can be manipulated in this script, so the ability to customize our archetype is nearly limitless.

## Test Out Our Superpowered Archetype

1. In the archetype root directory, run `mvn install`
1. Change to a directory where you would like to create the project and run:
    ```bash
    mvn archetype:generate -DarchetypeGroupId=com.redhat.runtimes \
                           -DarchetypeArtifactId=springboot-archetype \
                           -DarchetypeVersion=1.0.0 \
                           -DgroupId=com.redhat.runtimes.springboot \
                           -DartifactId=springboot-from-archetype \
                           -Dversion=1.0.0-SNAPSHOT \
                           -Dpackage=com.redhat.runtimes.springboot \
                           -DadditionalDependencies=org.slf4j:slf4j-api:1.7.31,org.apache.logging.log4j:log4j-to-slf4j:2.14.1 \
                           -Denable_pitest=true \
                           -DinteractiveMode=false
    ```
   * This will generate a project while disabling interactive mode, so we have to pass the required properties on the command-line
1. Check the `pom.xml` file and see that at the top of the `<dependencies>` section, you should see:
    ```xml
    <dependency>
      <groupId>org.slf4j</groupId>
      <artifactId>slf4j-api</artifactId>
      <version>1.7.31</version>
      <scope>compile</scope>
    </dependency>
    <dependency>
      <groupId>org.apache.logging.log4j</groupId>
      <artifactId>log4j-to-slf4j</artifactId>
      <version>2.14.1</version>
      <scope>runtime</scope>
    </dependency>
    ```

## Summary

We hope that you have found this informative and that it inspires you to create time-saving shortcuts for you and the teams that you work with going forward.