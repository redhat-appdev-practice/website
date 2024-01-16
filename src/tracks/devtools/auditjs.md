---
title: AuditJS
tags:
- javascript
- node
- nodejs
- npm
- npm-audit
- ci-cd
- continuous integration
- security
- vulnerability
- cve
- cwe
- dependency
- library
- libraries
---
# AuditJS For Analyzing Dependency Vulnerabilities

For NodeJS/Yarn projects, there exists a tool within NPM to perform an Audit of the dependencies in the project. That tool, `npm audit`, is fairly effective but not very flexible or granular. For example, it cannot differentiate between dev dependencies and production dependencies. It cannot set thresholds based on severity. And up until recently, it would never return a non-zero exit status when there was a problem and as such it was not very useful in CI/CD pipelines.

Then came [audit.js](https://github.com/sonatype-nexus-community/auditjs#readme). This tool leverages [Sonatype](https://www.sonatype.com/)'s security scanning capabilities to analyze your dependencies for vulnerabilities. This allows for greater flexibility and granularity. In this lab we will get to see how it can be leveraged in a CI/CD pipeline in order to break a build when an appropriate issue is found.

## Create A New NodeJS Project Using 

We will start off by creating a new [Node](https://nodejs.org/) application and adding some dependencies.

```bash
mkdir vulnerable-project
cd vulnerable-project
npm init
```

## Add Some Dependencies

Edit the `package.json` file and add the following lines:

```bash
npm install -D jest@26.1.0
npm install -d jquery@3.0.0
```

::: warning NOTE
We have intentionally installed older versions of these libraries in order to show vulnerabilities
:::

## Add The Audit Command

Edit the `package.json` file and add the following script:

```json
  "scripts": {
      "audit": "npx auditjs ossi",
      "auditAll": "npx auditjs ossi --dev"
  }
```

Here's an explanation of what is intended with these parameters:

* `ossi` indicates that the tool will use the public OSSI Nexus repository for vulnerability information
    * Another option is to user your own Nexus iQ server with the option `iq` and parameters to point to your server
* `--dev` tells the tool to analyze the `devDependencies` as well as the regular dependencies

## Run The Audit

```bash
npm run audit

> vulnerable-project@1.0.0 audit /home/dphillips/tmp/ngtest/vulnerable-project
> npx auditjs ossi

 ________   ___  ___   ________   ___   _________       ___   ________      
|\   __  \ |\  \|\  \ |\   ___ \ |\  \ |\___   ___\    |\  \ |\   ____\     
\ \  \|\  \\ \  \\\  \\ \  \_|\ \\ \  \\|___ \  \_|    \ \  \\ \  \___|_    
 \ \   __  \\ \  \\\  \\ \  \ \\ \\ \  \    \ \  \   __ \ \  \\ \_____  \   
  \ \  \ \  \\ \  \\\  \\ \  \_\\ \\ \  \    \ \  \ |\  \\_\  \\|____|\  \  
   \ \__\ \__\\ \_______\\ \_______\\ \__\    \ \__\\ \________\ ____\_\  \ 
    \|__|\|__| \|_______| \|_______| \|__|     \|__| \|________||\_________\
                                                                \|_________|
                                                                            
                                                                            
  _      _                       _   _              
 /_)    /_`_  _  _ _/_   _  _   (/  /_`_._  _   _/ _
/_)/_/ ._//_// //_|/ /_//_//_' (_X /  ///_'/ //_/_\ 
   _/                _//                            

  AuditJS version: 4.0.24

✔ Starting application
✔ Getting coordinates for Sonatype OSS Index
✔ Auditing your application with Sonatype OSS Index
✔ Submitting coordinates to Sonatype OSS Index
✔ Reticulating splines
✔ Removing whitelisted vulnerabilities

  Sonabot here, beep boop beep boop, here are your Sonatype OSS Index results:
  Total dependencies audited: 1

--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
[1/1] - pkg:npm/jquery@3.0.0 - 4 vulnerabilities found!

  Vulnerability Title:  [CVE-2019-11358]  Improper Neutralization of Input During Web Page Generation ("Cross-site Scripting")
  ID:  11b6563a-ead6-4040-83e5-455f36519d1b
  Description:  jQuery before 3.4.0, as used in Drupal, Backdrop CMS, and other products, mishandles jQuery.extend(true, {}, ...) because of Object.prototype pollution. If an unsanitized source object contained an enumerable __proto__ property, it could extend the native Object.prototype.
  CVSS Score:  6.1
  CVSS Vector:  CVSS:3.0/AV:N/AC:L/PR:N/UI:R/S:C/C:L/I:L/A:N
  CVE:  CVE-2019-11358
  Reference:  https://ossindex.sonatype.org/vulnerability/11b6563a-ead6-4040-83e5-455f36519d1b?component-type=npm&component-name=jquery&utm_source=auditjs&utm_medium=integration&utm_content=4.0.24
  
  Vulnerability Title:  [CVE-2020-11023] In jQuery versions greater than or equal to 1.0.3 and before 3.5.0, passing HTML...
  ID:  4dc10b07-91de-4bd1-8f56-00d718a467a3
  Description:  In jQuery versions greater than or equal to 1.0.3 and before 3.5.0, passing HTML containing <option> elements from untrusted sources - even after sanitizing it - to one of jQuery's DOM manipulation methods (i.e. .html(), .append(), and others) may execute untrusted code. This problem is patched in jQuery 3.5.0.
  CVSS Score:  6.1
  CVSS Vector:  CVSS:3.0/AV:N/AC:L/PR:N/UI:R/S:C/C:L/I:L/A:N
  CVE:  CVE-2020-11023
  Reference:  https://ossindex.sonatype.org/vulnerability/4dc10b07-91de-4bd1-8f56-00d718a467a3?component-type=npm&component-name=jquery&utm_source=auditjs&utm_medium=integration&utm_content=4.0.24
  
  Vulnerability Title:  CWE-79: Improper Neutralization of Input During Web Page Generation ('Cross-site Scripting')
  ID:  ccbcd22c-ecdd-42c3-b76a-73eacbc40d98
  Description:  The software does not neutralize or incorrectly neutralizes user-controllable input before it is placed in output that is used as a web page that is served to other users.
  CVSS Score:  6.1
  CVSS Vector:  CVSS:3.0/AV:N/AC:L/PR:N/UI:R/S:C/C:L/I:L/A:N
  Reference:  https://ossindex.sonatype.org/vulnerability/ccbcd22c-ecdd-42c3-b76a-73eacbc40d98?component-type=npm&component-name=jquery&utm_source=auditjs&utm_medium=integration&utm_content=4.0.24
  
  Vulnerability Title:  [CVE-2020-11022] In jQuery versions greater than or equal to 1.2 and before 3.5.0, passing HTML f...
  ID:  7ea698d9-d38b-4f6f-9a39-79b72d4fe248
  Description:  In jQuery versions greater than or equal to 1.2 and before 3.5.0, passing HTML from untrusted sources - even after sanitizing it - to one of jQuery's DOM manipulation methods (i.e. .html(), .append(), and others) may execute untrusted code. This problem is patched in jQuery 3.5.0.
  CVSS Score:  6.1
  CVSS Vector:  CVSS:3.0/AV:N/AC:L/PR:N/UI:R/S:C/C:L/I:L/A:N
  CVE:  CVE-2020-11022
  Reference:  https://ossindex.sonatype.org/vulnerability/7ea698d9-d38b-4f6f-9a39-79b72d4fe248?component-type=npm&component-name=jquery&utm_source=auditjs&utm_medium=integration&utm_content=4.0.24
  
--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
npm ERR! code ELIFECYCLE
npm ERR! errno 1
npm ERR! vulnerable-project@1.0.0 audit: `npx auditjs ossi`
npm ERR! Exit status 1
npm ERR! 
npm ERR! Failed at the vulnerable-project@1.0.0 audit script.
npm ERR! This is probably not a problem with npm. There is likely additional logging output above.

npm ERR! A complete log of this run can be found in:
npm ERR!     /home/dphillips/.npm/_logs/2021-07-13T14_49_09_554Z-debug.log

```

::: warning NOTE
The `audit` target only analyzed the `jquery` dependency and found several known CVEs/CWEs. Running the command `npm run auditAll` would have also
analyzed the `jest` depenency and it's transitive dependencies as well.
:::

## Fix The Vulnerability

Change your `package.json` to use the latest version of `jquery` and run `npm run audit` again:

```bash
# npm run audit

> vulnerable-project@1.0.0 audit /home/dphillips/tmp/ngtest/vulnerable-project
> npx auditjs ossi

 ________   ___  ___   ________   ___   _________       ___   ________      
|\   __  \ |\  \|\  \ |\   ___ \ |\  \ |\___   ___\    |\  \ |\   ____\     
\ \  \|\  \\ \  \\\  \\ \  \_|\ \\ \  \\|___ \  \_|    \ \  \\ \  \___|_    
 \ \   __  \\ \  \\\  \\ \  \ \\ \\ \  \    \ \  \   __ \ \  \\ \_____  \   
  \ \  \ \  \\ \  \\\  \\ \  \_\\ \\ \  \    \ \  \ |\  \\_\  \\|____|\  \  
   \ \__\ \__\\ \_______\\ \_______\\ \__\    \ \__\\ \________\ ____\_\  \ 
    \|__|\|__| \|_______| \|_______| \|__|     \|__| \|________||\_________\
                                                                \|_________|
                                                                            
                                                                            
  _      _                       _   _              
 /_)    /_`_  _  _ _/_   _  _   (/  /_`_._  _   _/ _
/_)/_/ ._//_// //_|/ /_//_//_' (_X /  ///_'/ //_/_\ 
   _/                _//                            

  AuditJS version: 4.0.24

✔ Starting application
✔ Getting coordinates for Sonatype OSS Index
✔ Auditing your application with Sonatype OSS Index
✔ Submitting coordinates to Sonatype OSS Index
✔ Reticulating splines
✔ Removing whitelisted vulnerabilities

  Sonabot here, beep boop beep boop, here are your Sonatype OSS Index results:
  Total dependencies audited: 1

------------------------------------------------------------------------
[1/1] - pkg:npm/jquery@3.6.0 - No vulnerabilities found!
------------------------------------------------------------------------
```

## Finished!

We have now mitigated some known vulnerabilities in our NodeJS application and we can implement this in our CI/CD/DevOps Pipelines!