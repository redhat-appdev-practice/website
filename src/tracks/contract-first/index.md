---
title: Contract-First API Development
collapsable: true
tags:
- api
- openapi
- contract-first
- rest
- cloud-native
---

# Contract-First Development

You’re adopting “DevOps” and “Microservices” because of the promise of delivering value faster to your users/customers. But you are not seeing the gains you want to see. You’ve got CI/CD/Pipelines/Tests/Microservices/etc… But you are still getting bogged down with teams being dependent on the progress of each other. Service A isn’t done, so service B cannot work on integration. The UI requires access to ALL of the services, so it has to wait until the end to be integrated, and integration takes WEEKS because of back-and-forth issues between the frontend and backend and between different dependent services. This is NOT how this is supposed to work!

Many of us are familiar with writing code which other people interface with. In C & C++ we provide header files to tell other people what our code can do for them. In Java it might be an Interface definition. This works great for compile-time guarantees, but what do you do when you are writing services which work over the network or over the web?

If you have ever written an API or service which is consumed by others, even inside of your own team, this should be obvious. Every time you make a change to your service, those external and internal users are going to be annoyed because you just broke a BUNCH of their code. Take that annoyance and then consider what happens where there are multiple (perhaps multitudes of) services and worse yet when those APIs are consumed in the public by your customers. Add into that all of the complexities of operating a distributed system and you have a recipe for disaster.
