import { defineConfig } from 'vitepress'
import { tabsMarkdownPlugin } from 'vitepress-plugin-tabs'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Cloud-Native AppDev",
  description: "Cloud-Native Application Development tutorials, tricks, tips, and methods.",
  markdown: {
    config(md) {
      md.use(tabsMarkdownPlugin)
    }
  },
  ignoreDeadLinks: 'localhostLinks',
  head: [
    ['link', { rel: "apple-touch-icon", sizes: "180x180", href: "/Icon.svg"}],
    ['link', { rel: "icon", type: "image/svg+xml", sizes: "32x32", href: "/Icon.svg"}],
    ['link', { rel: "icon", type: "image/svg+xml", sizes: "16x16", href: "/Icon.svg"}],
    ['link', { rel: "shortcut icon", href: "/Icon.svg"}],
    ['link', {rel: "shortcut icon", type: "image/png", href: "/favicon.png"}],
    ['link', {rel: "stylesheet", type: "text/css", href:"/player/asciinema-player.css"}],
    ['script', {src: "/player/asciinema-player.js"}],
    ['meta', { name: "viewport", property: "viewport", content: "width=device-width, initial-scale=0.9"}],
    ['script', {src: 'https://www.googletagmanager.com/gtag/js?id=G-2P1GY1ZQ3B'}],
    ['script', {}, "window.dataLayer = window.dataLayer || [];\nfunction gtag(){dataLayer.push(arguments);}\ngtag('js', new Date());\ngtag('config', 'G-2P1GY1ZQ3B');"]
  ],
  themeConfig: {
    lastUpdated: {
      text: 'Updated at',
      formatOptions: {
        dateStyle: 'full',
        timeStyle: 'medium'
      }
    },
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Tracks', link: '/tracks/' },
      { text: 'Links', link: '/links/' }
    ],

    aside: false,

    logo: '/Icon.svg',
    logoLink: '/',

    sidebar: [
      {
        text: 'Links',
        items: [
          { text: 'Links We Like', link: '/links/' },
        ]
      },
      {
        text: 'Tracks',
        link: '/tracks/',
        items: [
          {
            text: 'Contract-First',
            link: '/tracks/contract-first/',
            collapsed: true,
            items: [
              {text: 'Introduction to OpenAPI with Apicurio', link: '/tracks/contract-first/introduction-to-openapi-and-apicurio'},
              {text: 'OpenAPI Generator', link: '/tracks/contract-first/openapi-generator'},
              {text: 'OpenAPI Generator Templating', link: '/tracks/contract-first/customizing-openapi-generator-templates'},
              {text: 'OpenAPI Testing with Schemathesis', link: '/tracks/contract-first/automated-testing-with-schemathesis'},
              {text: 'OpenAPI Security', link: '/tracks/contract-first/security-with-openapi'},
              {text: 'Applying Contract-First Development To UI/UX', link: '/tracks/contract-first/contract-first-for-ui-development'}
            ]
          },
          {
            text: 'Behavior-Driven Development',
            link: '/tracks/bdd/',
          },
          {
            text: 'Cloud-Native Runtimes',
            link: '/tracks/runtimes/',
            collapsed: true,
            items: [
              {
                text: 'Quarkus',
                link: '/tracks/runtimes/quarkus/',
                collapsed: true,
                items: [
                  {text: 'Getting Started', link: '/tracks/runtimes/quarkus/'},
                  {text: 'Bootstrapping A Project Using OpenAPI Generator', link: '/tracks/runtimes/quarkus/bootstrap'},
                  {text: 'JUnit Testing', link: '/tracks/runtimes/quarkus/junit'},
                  {text: 'Add Hibernate, Panache, and Database Drivers', link: '/tracks/runtimes/quarkus/panache'},
                  {text: 'Implement an API Endpoint', link: '/tracks/runtimes/quarkus/first-api-endpoint'},
                  {text: 'Configure JSON Logging', link: '/tracks/runtimes/quarkus/json-logging'},
                  {text: 'Add Distributed Tracing With OpenTracing', link: '/tracks/runtimes/quarkus/distributed-tracing'},
                  {text: 'Utilize Cloud-Native Configuration', link: '/tracks/runtimes/quarkus/configuration'},
                  {text: 'Deploy To Kubernetes With Helm', link: '/tracks/runtimes/quarkus/helm-deployment'}
                ]
              },
              // {
              //   text: 'Vert.x',
              //   link: '/tracks/runtimes/vertx/',
              //   collapsed: true,
              //   items: [
              //     {text: '', link: '/tracks/runtimes/vertx/'},
              //     {text: '', link: '/tracks/runtimes/vertx/bootstrap'},
              //     {text: '', link: '/tracks/runtimes/vertx/async-coordination'},
              //     {text: '', link: '/tracks/runtimes/vertx/testing'},
              //     {text: '', link: '/tracks/runtimes/vertx/hibernate-reactive'},
              //     {text: '', link: '/tracks/runtimes/vertx/jooq-vertx'},
              //     {text: '', link: '/tracks/runtimes/vertx/first-api-endpoint'},
              //     {text: '', link: '/tracks/runtimes/vertx/json-logging'},
              //     {text: '', link: '/tracks/runtimes/vertx/distributed-tracing'},
              //     {text: '', link: '/tracks/runtimes/vertx/configuration'},
              //     {text: '', link: '/tracks/runtimes/vertx/clustering'},
              //     {text: '', link: '/tracks/runtimes/vertx/helm-deployment'}
              //   ]
              // },
              {
                text: 'ASP.NET',
                link: '/tracks/runtimes/dotnet/',
                collapsed: true,
                items: [
                  {text: 'Getting Started', link: '/tracks/runtimes/dotnet/'},
                  {text: 'Bootstrapping A Project Using OpenAPI Generator', link: '/tracks/runtimes/dotnet/bootstrap'},
                  {text: 'Unit Testing', link: '/tracks/runtimes/dotnet/mstest'},
                  {text: 'EntityFrameworkCore For Data Access', link: '/tracks/runtimes/dotnet/entityframework'},
                  {text: 'Test-Driven Development Of An API Endpoint', link: '/tracks/runtimes/dotnet/first-api-endpoint'},
                  {text: 'Configure JSON Logging', link: '/tracks/runtimes/dotnet/json-logging'},
                  {text: 'Add Distributed Tracing With OpenTracing', link: '/tracks/runtimes/dotnet/distributed-tracing'},
                  {text: 'Utilize Cloud-Native Configuration', link: '/tracks/runtimes/dotnet/configuration'},
                  {text: 'Deploy To Kubernetes With Helm', link: '/tracks/runtimes/dotnet/helm-deployment'}
                ]
              }
            ]
          },
          {
            text: 'DevOps Tools',
            link: '/tracks/devops/',
            collapsed: true,
            items: [
              {text: 'Tekton Task', link: '/tracks/devops/tekton-task'},
              {text: 'Tekton Pipeline', link: '/tracks/devops/tekton-pipelines.md'}
            ]
          },
          {
            text: 'Developer Tools',
            link: '/tracks/devtools/',
            collapsed: true,
            items: [
              {text: 'Leveraging Compose Files For Efficient Local Development', link: '/tracks/devtools/compose-files-for-local-dev'},
              {text: 'OWASP Dependency Check', link: '/tracks/devtools/owasp-dependency-check'},
              {text: 'OWASP Zed Attack Proxy & ZAP HUD', link: '/tracks/devtools/owasp-zap-hud'},
              {text: 'AuditJS For Analyzing Dependency Vulnerabilities', link: '/tracks/devtools/auditjs'},
              {text: 'Introduction to Helm', link: '/tracks/devtools/helm-intro'},
              {text: 'Maven Archetypes', link: '/tracks/devtools/maven-archetypes'}
            ]
          },          {
            text: 'Serverless',
            link: '/tracks/serverless/',
            collapsed: true,
            items: [
              {text: 'Overview of the Serverless Landscape', link: '/tracks/serverless/overview-of-serverless-landscape'},
              {text: 'Introduction to Debezium and CDC', link: '/tracks/serverless/intro-to-debezium-cdc'},
              {text: 'Serverless Cloud Native Runtimes', link: '/tracks/serverless/serverless-cloud-native-runtimes'},
              {text: 'Serverless Deployments', link: '/tracks/serverless/serverless-deployments'},
              {text: 'Knative Eventing', link: '/tracks/serverless/knative-eventing'},
            ]
          }
        ]
      }
    ],
    externalLinkIcon: true,

    socialLinks: [
      { icon: 'github', link: 'https://github.com/redhat-appdev-practice/' },
      { icon: 'youtube', link: 'https://www.youtube.com/channel/UCU-S0JPd2cXjUmW-hPZdzqA' },
    ]
  }
})
