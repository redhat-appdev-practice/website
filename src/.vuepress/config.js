module.exports = {
  title: 'Cloud-Native AppDev',
  description: 'Cloud-Native Application Development tutorials, tricks, tips, and methods.',
  plugins: [
    'tabs'
  ],
  head: [
    ['link', { rel: "apple-touch-icon", sizes: "180x180", href: "/Icon.svg"}],
    ['link', { rel: "icon", type: "image/svg+xml", sizes: "32x32", href: "/Icon.svg"}],
    ['link', { rel: "icon", type: "image/svg+xml", sizes: "16x16", href: "/Icon.svg"}],
    ['link', { rel: "shortcut icon", href: "/Icon.svg"}],
  ],
  themeConfig: {
    logo: '/Icon.svg',
    nextLinks: false,
    prevLinks: false,
    lastUpdated: true,
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Tracks', link: '/tracks/' },
      { text: 'YouTube', link: 'https://www.youtube.com/channel/UCU-S0JPd2cXjUmW-hPZdzqA' },
      { text: 'Links', link: '/links/'} /**,
      { text: 'Blog', link: '/blog/' },
      { text: 'Podcasts', link: '/podcasts/' } */
    ],
    displayAllHeaders: false,
    sidebar: [
      {
        title: 'Links We Like',
        sidebarDepth: -1,
        collapsable: false,
        path: '/links/'
      },
      {
        title: 'Tracks',
        path: '/tracks/',
        sidebarDepth: -1,
        collapsable: false,
        initialOpenGroupIndex: 0,
        children: [
          {
            title: 'Contract-First',
            path: '/tracks/contract-first/',
            initialOpenGroupIndex: 1,
            sidebarDepth: 0,
            children: [
              '/tracks/contract-first/introduction-to-openapi-and-apicurio',
              '/tracks/contract-first/openapi-generator',
              '/tracks/contract-first/customizing-openapi-generator-templates',
              '/tracks/contract-first/automated-testing-with-schemathesis',
              '/tracks/contract-first/security-with-openapi',
              '/tracks/contract-first/contract-first-for-ui-development'
            ]
          },
          {
            title: 'Behavior-Driven Development',
            sidebarDepth: 0,
            path: '/tracks/bdd/',
          },
          {
            title: 'Cloud-Native Runtimes',
            path: '/tracks/runtimes/',
            collapsable: true,
            sidebarDepth: -1,
            children: [
              {
                title: 'ASP.NET',
                path: '/tracks/runtimes/dotnet/',
                collapsable: true,
                sidebarDepth: 0,
                children: [
                  '/tracks/runtimes/dotnet/',
                  '/tracks/runtimes/dotnet/bootstrap',
                  '/tracks/runtimes/dotnet/mstest',
                  '/tracks/runtimes/dotnet/entityframework',
                  '/tracks/runtimes/dotnet/first-api-endpoint',
                  '/tracks/runtimes/dotnet/json-logging',
                  '/tracks/runtimes/dotnet/distributed-tracing',
                  '/tracks/runtimes/dotnet/configuration',
                  '/tracks/runtimes/dotnet/helm-deployment'
                ]
              }
            ]
          },
          {
            title: 'Developer Tools',
            sidebarDepth: 0,
            path: '/tracks/devtools/',
            children: [
              '/tracks/devtools/compose-files-for-local-dev',
              '/tracks/devtools/owasp-dependency-check',
              '/tracks/devtools/owasp-zap-hud',
              '/tracks/devtools/npm-audit-ci-wrapper',
              '/tracks/devtools/helm-intro',
              '/tracks/devtools/maven-archetypes'
            ]
          },          {
            title: 'Serverless',
            initialOpenGroupIndex: 1,
            sidebarDepth: 0,
            path: '/tracks/serverless/',
            children: [
              '/tracks/serverless/overview-of-serverless-landscape',
              '/tracks/serverless/intro-to-debezium-cdc',
              '/tracks/serverless/serverless-cloud-native-runtimes',
              '/tracks/serverless/serverless-deployments',
              '/tracks/serverless/knative-eventing',
            ]
          }
        ]
      }
    ]
  }
}
