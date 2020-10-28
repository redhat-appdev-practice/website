---
title: OWASP Zed Attack Proxy & ZAP HUD
initialOpenGroupIndex: -1
collapsable: true
tags:
- owasp
- owasp top ten
- owasp top 10
- web
- security
- vulnerability
- penetration
- pentesting
- pen testing
- zed attack proxy
- zap
- zap hud
- hud
- devsecops
- secdevops
- continuous integration
- continuous compliance
- continuous security
---
# OWASP and ZAP HUD

## Videos

<iframe width="560" height="315" src="https://www.youtube.com/embed/n679JqovhBQ" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## Intro

### What is OWASP

[OWASP \(Open Web Application Security Project\)](https://owasp.org/) Foundation is a nonprofit organization that works to improve security of software. OWASP includes training, tools, and communities centered around the practice of security on the web, with Chapters located all around the world. 

The most well know OWASP project is the [OWASP Top Ten](https://owasp.org/www-project-top-ten/). This consists of a broad consensus of the top 10 most critical security risk to web applications. It is worth taking some time to read through this page. 

### What is ZAP/ZAP HUD

[ZAP \(ZED ATTACK PROXY\)](https://www.zaproxy.org/) is an OWASP Flagship project and DAST (Dynamic Application Security Testing) Tool. Designed to be both powerful and easy to learn, it provides an easy way to find vulnerabilities in your applications and can be used with any web application even during the development process 

### What is Juice Shop

[Juice Shop](https://owasp.org/www-project-juice-shop/) is a modern example of an insecure web application that includes every vunerablility on the OWASP Top Ten List. We will be using it to show some of the capabilities of ZAP, but it is an interesting project to explore if you want to learn more about web security.


# Lab

## Setup
### Install ZAP

1. ZAP Proxy 2.9.0 can be installed with one of the multiple installers or docker images found [here](https://www.zaproxy.org/download/) 

### Install Juice Shop

1. Juice Shop can be installed and run locally with instructions found [here](https://github.com/bkimminich/juice-shop#setup) or with the docker image
	```
	podman run  -d -p 3000:3000 bkimminich/juice-shop
	```
2. Validate you are able to hit Juice shop on http:localhost:3000/

## ZAP Proxy

A quick overview of ZAP Proxy

Dig Deeper: This is going to be a very high level overview of ZAP Proxy. If you want to learn more about ZAP there is a great series of videos from one of the project heads that goes into much more detail on [All Day DevOp](https://www.alldaydevops.com/zap-in-ten).

### ZAP Desktop Application

1. Open ZAP Application
2. Choose `No, I do not want to persist this session at this moment in time`
    - Generally you would want to choose one of the `yes` options so you have a record of your actions.
2. Click Automated Scan
![ZapAutoScan](/ZapAutoScan.png)
3. Set "URL to Attack" to `http://localhost:3000`
4. Check "Use Traditional Spider"
	  - Traditional Spider just follows links as discovered in the application.
	  - Ajax Spider runs a browser instance and clicks on different buttons; slower than Traditional Spider but tends to work better on Javascript applications
5. Click `Attack`
![ZAPScanAttack](/ZAPScanAttack.png)
  <sub>1. Context: How you are connecting through ZAP. Allows for filtering of pages and alerts as well as modifying authentication </sub><br />
  <sub>2. Sites: The different sites you have visited with all of the calls made to that site underneath in a tree-based structure. Looks like there is an FTP server in the tree hmm...</sub><br />
  <sub>3. Spider: History of the passive crawl through the site used to discover the different calls</sub><br />
  <sub>4. Active Scan: History of the active "attacks" made by ZAP</sub><br />
  <sub>5. Alerts: The issues that ZAP found while attacking the web page</sub>

6. Open Alerts tab, expand an alert, and double click a specific request.
    - Time some time to view info about the alert. ZAP Includes:
	    - Basic information such as risk, confidence level, etc... of the issue is being correctly reported
	    - The "Evidence" used to determine the issue
	    - A Description of the issue
	    - A possible solution
	    - A url(s) to an external reference for more information about  issue
    - Take a look at the frame where the `Quick Start` tab was originally. Note that the frame now contains a `Request` and `Response` tab that shows the request/reponse info  

The ZAP desktop application has a ton more features, if you would like to learn more please check out the [videos](https://www.alldaydevops.com/zap-in-ten) I mentioned earlier

### ZAP HUD

1. Go to the `Quick Start` tab and hit the Back button in the top left hand corner of the frame
2. Hit `Manual Explore`
3. Set "URL to Expore" to `http://localhost:3000`
4. Check the `Enable Hud` checkbox
5. Click `Launch Browser`(should not matter which browser you choose)
6. Should see the `Welcome to  the ZAP HUD` popup.
	  - `Take the HUD Tutorial` takes about 15 minutes to complete and give a great overview of the features
	  - Click `Continue to your target`
7. Take some time to look through the buttons on the left and right of the screen if you did not complete the tutorial
    - Some High Level Notes:
      - These buttons are genearlly showing the same info seen in the Desktop App, but are accessable in the browser
      - Buttons on the left side of the sceen genearlly show information about the current page you are on
      - Buttons on the right side of the screen genearlly show information at a site level
8. `Add Scope` button (Target button on the left hand side)
9. Enable `Notifications` (Lightbulb Button left hand side)
10. Enable `Attack Mode` (Crosshairs Button right hand side)
11. Find `SQL Injection` attack
    - Register to the Juice Bar application
	    - Account -> Login
	    - Click `Not yest a customer`
		    - Fill in info -> `Register`
	    - Login with Registered information
    - Login with an invalid Username/Password (i.e. test/test)
	    - There should be a popup on the bottom right with `SQL Injection` and the `Site Alerts High` (Red Flag on the right hand side) should have incremented from 0 to 1
		    - Note: It may take a minute and a couple tries.
12. View `SQL Injection` attack
    - Click the Red Flag Button
    - Click `SQL Injection` warning
    - Take some time to read through the "Other Info", "Solution", and "Refrence" material
13. View Login Request/Response
    - Enable Breakpoints (Green circle button on the left hand side)
    - Click Login button again
    - View HTTP Message Popup
	    - What url are we requesting?
		    - `http://localhost:3000/rest/user/whoami`
	    - Note that all the values inside the Request are editable
    - Click `Step`
	    - View the response value and Identify the Status code.
    - Keep stepping through the request until you get to `POST http://localhost:3000/rest/user/login`
      - Depending on how much time you spent on the `whoami` request you may get a lot of WebSocket requests. It may be easier to `Continue` and hit the breakpoint again 
      - Modify the body of the request to use the email and password you registered earlier in the lab
    - Break points can be used to view and capture any interactions inside your web applictions. Break points allows you to step through and modify those interactions
      - This functionality can also be used in tandem with testing suites like Selinum help with the creation of integration testing.
		
14. Use a `SQL Injection` attack
  - Login using email `' or 1=1--` and any password you want
  - Your account user is now `admin@juice.sh.op`. Congratulations you are now an admin user

![ZAPHud](/ZAPHud.png)
	
### Expore ZAP (Optional)

This was a high level introduction to what ZAP can do, but it is a very powerful tool that takes time to master. Here are some resources that you can use if you want to further explore ZAP's capablities
  - ZAP Hud Tutorial
	  - The best way to get introduced to the basics of ZAP is by restarting the Manual Scan and clicking the `Tutorial` button in the popup. It will run you through all the basics of the ZAP HUD
  - [All Day Devops Video Series](https://www.alldaydevops.com/zap-in-ten) 
	  - As mentioned before, this is a series of 10 to 15 minute videos introducing you to the different concepts of ZAP
  - [Documentation](https://www.zaproxy.org/docs/)
	
	
### Explore Juice Store (Optional)

If you are interested in learning more about web security the Juice Store app is a great way to learn. Not only does it have practical examples but it is fun. It even has a built in scoreboard for tracking your progress, and you have already completed a couple challenges. If you are interested in continuing to play around with Juice Store I would recommend trying to find the scoreboard next.

More information about Juice Shop as well as helpful hints to solving some of the challenges can be found [here](https://bkimminich.gitbooks.io/pwning-owasp-juice-shop/)

![JuiceStoreScoreBoard](/JuiceStoreScoreBoard.png)

### Clean Up

1. Stop Juice Shop container
  - Find Keycloak's container id with `podman ps`
  ```
  CONTAINER ID  IMAGE                                   COMMAND    CREATED         STATUS             PORTS                   NAMES
  7426abc50a12  docker.io/bkimminich/juice-shop:latest  npm start  15 minutes ago  Up 15 minutes ago  0.0.0.0:3000->3000/tcp  elastic_moore

  ```
  - Kill container with `podman kill 7426abc50a12`

# Wrap Up

We learned about the OWASP Foundation as well as ZAP, a tool that can be used to help us find security flaws within our application. Although we did not dive too deeply into ZAP, hopefully the knowledge of what it is and what it is capable of will allow you start using it to validate the security of your current and future applications.  

