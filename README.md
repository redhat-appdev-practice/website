# This is a [VuePress](https://vuepress.vuejs.org/) site for [Cloud-Native AppDev](https://redhat-appdev-practice.github.io).

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

### Creating New Articles

Every new article should start with some basic *frontmatter*. Frontmatter is a TOML block at the top of your markdown file which allows you to set some additional metadata about your document. 

```markdown
---
title: Behavior-Driven Development
collasable: true
tags:
- gherkin
- bdd
- behavior
- behaviour
- behavior-driven
- behaviour-driven
---

# Behavior-Driven Development  // Markdown starts here
```

The more and better your titles, tags, etc... - the better the site will index the articles.

### Adding images

Images can be placed in `src/.vuepress/public/` and everything in that directory will be relative to the web root. For example, if you place an image in `src/.vuepress/public/devtools/my-cool-image.svg`, it's relative path would be `https://<site>/devtools/my-cool-image.svg`.

## Publishing this site

This has been automated with [GitHub Actions](.github/workflows/main.yml). If you submit a pull-request against this site and that pull-request gets merged to the `trunk` branch, then the automation will compile and publish this site for you.

