// https://vitepress.dev/guide/custom-theme
import { h } from 'vue'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import './style.css'
import { enhanceAppWithTabs } from 'vitepress-plugin-tabs/client'
import AsciinemaPlayer from './components/asciinema.vue';

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      // https://vitepress.dev/guide/extending-default-theme#layout-slots
    })
  },
  enhanceApp({ app, router, siteData }) {
    enhanceAppWithTabs(app),
    app.component('AsciinemaPlayer', AsciinemaPlayer)
    // ...
  }
} satisfies Theme
