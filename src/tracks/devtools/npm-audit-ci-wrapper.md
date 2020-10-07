---
title: NPM Audit & CI Wrapper
initialOpenGroupIndex: -1
collapsable: true
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
# NPM Audit & CI Wrapper

For NodeJS/Yarn projects, there exists a tool within NPM to perform an Audit of the dependencies in the project. That tool, `npm audit`, is fairly effective but not very flexible or granular. For example, it cannot differentiate between dev dependencies and production dependencies. It cannot set thresholds based on severity. And up until recently, it would never return a non-zero exit status when there was a problem and as such it was not very useful in CI/CD pipelines.

Then came [npm-audit-ci-wrapper](https://github.com/infosec812/npm-audit-ci-wrapper). This tool wraps around the npm audit capability and parses the output to allow for greater flexibility and granularity. In this lab we will get to see how it can be leveraged in a CI/CD pipeline in order to break a build when an appropriate issue is found.

