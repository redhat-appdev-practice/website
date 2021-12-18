# This is a [VuePress](https://vuepress.vuejs.org/) site for [Cloud-Native AppDev](https://appdev.consulting.redhat.com/).

## Hacktoberfest Participants

If you would like to submit a pull against this repository and have it count toward Hacktoberfest, please be aware that this is what we are looking for:

* Improvements to one of the existing track pages:
  * Better or more idomatic workflow (Subjective and at the discretion of our team to decide if wanted)
  * Fixes to spelling
  * Updated or improved tooling
* New track pages which align with our [Journey Map](https://lucid.app/documents/embeddedchart/74fe4c6a-a778-4b96-961a-2af86a36326e)

In order to avoid wasting your time and ours, it is recommended that you submit an issue describing your contribution first.

**Thank you! And happy hacking!!**

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

### Adding asciinema recordings/playback

[ASCIInema](https://asciinema.org/) is a great tool for recording command-line screencasts which remain "just text" and as such have the following benefits:

* You can copy and paste content from the cast
* It's more accessible to people with visual impairment
* It's lighter than a video stream

1. Add your `cast` file to the `src/.vuepress/public/casts` folder
1. Add the **asciinema** component to your page
   ```asciidoc
   <asciinema :src="$withBase('/casts/my-recording.cast')" cols=120 rows=30 />
   ```

## Publishing this site

### Test Locally

Run and validate there are no errors:
`yarn install: yarn build`

Run:
```
docker build -t cloudnative-local:latest .
docker run  -p 127.0.0.1:80:8080/tcp cloudnative-local:latest
```

Validate locally against `127.0.0.1`

This has been automated with [GitHub Actions](.github/workflows/containerize.yml). If you submit a pull-request against this site and that pull-request gets merged to the `trunk` branch, then the automation will compile and publish this site for you.

If you do not see your changes after a few minutes verify the [build](https://github.com/redhat-appdev-practice/redhat-appdev-practice.github.io/actions) was successful


## Known Issues

Any `{{ }}` must be escaped, see the helm-intro project or [here](https://vuepress.vuejs.org/guide/using-vue.html#escaping)
