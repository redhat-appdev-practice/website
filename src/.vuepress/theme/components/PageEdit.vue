<template>
  <div class="page-edit">
    <div class="floating">
      <div
         v-if="lastUpdated"
         class="last-updated"
      >
        <span class="prefix">{{ lastUpdatedText }}:</span>
        <span class="time">{{ lastUpdated }}</span>
      </div>
      <div class="copyleft">
          Copyright &#169; 2020, Red Hat Inc. - All Right Reserved
          Content Licensed Under <a href="https://creativecommons.org/licenses/by-sa/2.0/?">Creative Commons Attribution-ShareAlike 2.0</a>
      </div>
    </div>
  </div>
</template>

<script>
import isNil from 'lodash/isNil'
export default {
  name: 'PageEdit',
  computed: {
    lastUpdated () {
      return this.$page.lastUpdated
    },
    lastUpdatedText () {
      if (typeof this.$themeLocaleConfig.lastUpdated === 'string') {
        return this.$themeLocaleConfig.lastUpdated
      }
      if (typeof this.$site.themeConfig.lastUpdated === 'string') {
        return this.$site.themeConfig.lastUpdated
      }
      return 'Last Updated'
    }
  }
}
</script>

<style lang="stylus">
@require '../styles/wrapper.styl'
.page-edit
  position relative
  margin 0 auto auto 0
  @extend $wrapper
  padding-top 1rem
  padding-bottom 1rem
  overflow visible
.floating
  position absolute
  right 0
  bottom 0
  z-index 5
.last-updated
  font-size 0.9rem
  .prefix
    font-weight 500
    color lighten($textColor, 25%)
  .time
    font-weight 400
    color #767676
.copyleft
  display inline-block
  font-size 0.8rem
@media (max-width: $MQMobile)
  .page-edit
    text-align left
    position relative
  .floating
    position absolute
    right 0
    bottom 0
    z-index 5
  .last-updated
      font-size 0.8rem
  .copyleft
      font-size 0.8rem
</style>