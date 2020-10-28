---
title: OWASP Dependency Check
initialOpenGroupIndex: -1
collapsable: true
tags:
- owasp
- owasp top ten
- owasp top 10
- web
- security
- vulnerability
- dependency
- library
- libraries
- maven
- gradle
- java
---
# OWASP Dependency

## Video

<iframe width="560" height="315" src="https://www.youtube.com/embed/G9t-HFy4EHs" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## Intro

### What is OWASP Dependency Check

[OWASP Dependency Check](https://jeremylong.github.io/DependencyCheck/index.html/): #9 of the OWASP Top 10 is "Using Components with Known Vulnerabilities." OWASP Dependency Check was designed to help mitigate this problem by analyzing code for known vulnerabilities. Dependency Check can be used as a CLI or with a suite of plugins including Maven, Gradle, Jenkins, SonarQube and more. 

Dependency Check works by identifying CPEs (Common Platform Enumerations) for each dependency and comparing them to a list of CVEs (Common Vulnerabilities and Exposures) from third party libraries such as the National Vulnerability Database. It then creates a report that allows you to quickly go through and view the possible dependency vulnerabilities in your application. While the report does quickly and easily present a list of dependencies with known vulnerabilities it can contain false positives and vulnerabilities that are not relevant to how you are using that specific dependency. It can be difficult correctly identify the risk of the issues presented.

# Lab

## Setup
### Download Code

1. Download OpenAPI Project from github:
    ```
    git clone https://github.com/jland-redhat/rhc_openapi_todo.git
    cd rhc_openapi_todo
    git checkout owasp_dependency
    ```

## OWASP Dependency Check

1. Include the Maven plugin for OWASP Dependency Check in our project.
  - Add the following to the plugin section of the `pom.xml`
    ```
    <!-- OWASP Dependency Check -->
    <plugin>
        <groupId>org.owasp</groupId>
        <artifactId>dependency-check-maven</artifactId>
        <version>5.3.2</version>
        <executions>
            <execution>
                <goals>
                    <goal>check</goal>
                </goals>
            </execution>
        </executions>
      </plugin>
    ```
  <sub>This a basic setup of the plugin. More setup info such as failing on a specific security score can be found [here](https://jeremylong.github.io/DependencyCheck/dependency-check-maven/index.html)</sub>
  
2. Run the Dependency Check with `mvn verify`

  <sub>Note: The plugin will need to download and process multiple CVE databases on the first run, so this make take a while initially.</sub>

3. View the report
  - Open `target/dependency-check-report.html` in a browser
    - Take a look at the Summary info
    ![OWASP Depedency Check Summary](/OwaspDependencyCheckSummary.png)
    <sub>1. Name of the Dependency</sub><br />
    <sub>2. Database ID used to find the dependency. More info can be found [here](https://jeremylong.github.io/DependencyCheck/general/internals.html)</sub><br />
    <sub>3. The highest level of severity on the CVE's associated</sub><br />
    <sub>4. Number of CVE's associated</sub><br />
    <sub>5. Confidence level of the plugin that the CPE was identified correctly</sub><br />
    
    
    
4. View Dependency Detailed Information
  - Click on the `jackson-databind-2.9.5.jar` link inside the report
  ![OWASP Depedency Check Decription](/OwaspDependencyCheckDescription.png)
  <sub>1. Basic information on the dependency</sub><br />
  <sub>2. Expandable list of the evidence used to identify dependency information such as artifact and version</sub><br />
  <sub>3. The list of vulnerabilities found for the dependencies with a list of references on the issue</sub>
  
5. "Fix" the jackson-databind vulnerability
  - View the CVE `CVE-2018-1000873`
    - The description says `Fasterxml Jackson version Before 2.9.8 contains a CWE-20: Improper Input Validation...`. So a version that 2.9.8 or newer should fix our issue
    - If you take a look at the other CVE's they all reference Jackson versions that are older than 2.9.7
  - You will note in the pom that we are not specifying the `jackson-databind` depdenency. The following command shows that it is a child of `jackson-datatype-jsr310`
  ```
  mvn dependency:tree | grep -B 3 jackson-databind
  ```
  - Add the following dependency to the pom.xml's depdenencies section to override the inherited version of `jackson-databind`
  ```
  <dependency>
      <groupId>com.fasterxml.jackson.core</groupId>
      <artifactId>jackson-databind</artifactId>
      <version>2.11.1</version>
  </dependency>
  ``` 
  <sub> 2.11.1 is the latest version as of the creation of this lab. You should use the newest stable version currently out </sub>
  - Rerun `mvn verify` 
  - Open/Refresh `target/dependency-check-report.html` in a browser
    - You should note that `CVE-2018-1000873` was removed. It is also possible the entire `jackson-databind` dependency was removed if the newest version does not have another vulnerability associated with it.
  - Note that while this *may* have removed `jackson-databind` from our report it does not mean our code is functioning properly. Always validate code when modifying dependencies. 
6. Identifying False Positives
  - It is possible for this report to produce CVE's that do not match the dependency they are associated with. 
    - This is normally easily identifiable by reading the description or viewing the version information inside the linked data source
    - For example if looking at `CVE-2018-10237` under `guava-20.0.jar`
      - The description reads `Unbounded memory allocation in Google Guava 11.0 through 24.x before 24.1.1 allows` meaning this is **NOT** a false positive
      - But if our version was 24.1.2 it could mean that there was human error when recording the CVE info
7. Identifying Irrelevant Dependency Vulnerabilities 
  - Not every vulnerability is going to apply to our application and there are times when there is not a fix currently or we are unable to upgrade to a clean version of the dependency.
    - In this case it is important that there is a plan in place for documenting these known vulnerabilities.
  - View `CVE-2018-1258` for the spring framework dependency
    - Note that the description says this is only an issue when used in combination with Spring Security for authorization on methods.
      - If we are not planning on using Spring Security or not using method authorization it is possible this vulnerability is irrelevant to us.
      - **Important:** Again, if you do decide that a vulnerability should be ignore the reason should be justified and documented
8. Suppressing a CVE
  - Once it is determined a CVE does not apply to your application it can be suppressed so it does not show up on future reports.
  - Let's suppress `CVE-2018-1000632` for `dom4j-1.6.1.jar`
    - Click the `suppress` button next to the link for the CVE
    - Since this is the first item we want to suppress click the `Complete XML Doc`
    - Paste the contents into a new file named `owasp-suppressions.xml` in the project's base directory
    - Add the following to the `dependency-check-maven` plugin inside your `pom.xml`
      ```
      <configuration>
        <suppressionFile>owasp-suppressions.xml</suppressionFile>
      </configuration>
      ```
      <sub><suppressionFile> can be a local path, an absolute path, or a url location<sub>
 - Rerun `mvn verify` and validate that `CVE-2018-1000632` is no longer being recorded.
 - (Optional) Suppress some of the other CVEs on the page by adding the suppression clips to our XML document
  

# Wrap Up

We were able to use the OWASP Dependency Check to identify dependencies in our application that contain known vulnerabilities. It is very difficult to maintain even a small application with no known vulnerabilities. To punctuate this, `CVE-2020-10683` is a new vulnerability that was added while I was creating this lab. This is why it is so important to have a documentation plan on how to deal with dependencies that you are currently unable to update.

