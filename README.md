# This is a VuePress site for [Cloud-Native AppDev](https://redhat-appdev-practice.github.io).

## Prerequisites
* NodeJS >= 12
* NPM >= 6
* Git
* A Modern Browser
* (OPTIONAL) An editor with support for Markdown

## Run this site locally in Dev mode:

* Clone this repository
* Change to the `src` directory
* Run `npx vuepress dev --no-cache`

### Add new track to sidebar navigation

* Open the `src/.vuepress/config.js` file
* Locate the `sidebar` key under `themeConfig`
* Locate `children` key beneath `Tracks`
* Duplicate and modify one of the existing *tracks* and add the appropriate links as *children*.
  ```javascript
          {
            title: 'My New Track',
            path: '/tracks/my-new-track/',
            collapsable: true,
            sidebarDepth: -1,
            initialOpenGroupIndex: -1,
            children: [
              '/tracks/my-new-track/article-one',
              '/tracks/my-new-track/article-two'
            ]
          },
  ```

### Add a new article to an existing track

* Open the `src/.vuepress/config.js` file
* Locate the `sidebar` key under `themeConfig`
* Locate `children` key beneath `Tracks`
* Locate the child for the track you wish to expand
* Add a new entry to the `children` therein
  ```javascript
          {
            title: 'Developer Tools',
            path: '/tracks/devtools/',
            collapsable: true,
            sidebarDepth: -1,
            initialOpenGroupIndex: -1,
            children: [
              '/tracks/devtools/owasp-dependency-check',
              '/tracks/devtools/owasp-zap-hud',
              '/tracks/devtools/npm-audit-ci-wrapper',
              '/tracks/devtools/my-new-devtool-article'  // <== Like this!
            ]
          }
  ```

## Publish this site

This has been automated with [GitHub Actions](.github/workflows/main.yml). If you submit a pull-request against this site and that pull-request gets merged to the `trunk` branch, then the automation will compile and publish this site for you.

