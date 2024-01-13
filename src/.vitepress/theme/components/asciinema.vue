<template>
  <div ref="player"></div>
</template>
<script>
import { nextTick } from 'vue';

export default {
  name: "asciinema-player",
  props: {
    src: String,
    cols: Number,
    rows: Number,
    title: String,
    author: String,
    authorUrl: String,
    authorImgUrl: String,
    idleTimeLimit: {
      type: Number,
      default: 2
    },
    preload: Boolean,
    autoplay: Boolean,
    fontSize: {
      type: Number,
      default: 12
    },
    speed: {
      type: Number,
      default: 1,
      validator(value) {
        return value > 0;
      }
    },
    startAt: String,
    theme: {
      type: String,
      required: true,
      validator(value) {
        return (
            [
              "asciinema",
              "tango",
              "solarized-dark",
              "solarized-light",
              "monokai"
            ].indexOf(value) != -1
        );
      }
    }
  },
  data() {
    return {
      player: null,
      timeout: null
    };
  },
  watch: {
    src(newValue, oldValue) {
      if (newValue && oldValue !== newValue) {
        this.destoryInstance();
      }
      this.createPlayer();
    }
  },
  methods: {
    awaitAsciinema() {
      this.$data.timeout = window.setInterval(this.createPlayer, 250);
    },
    pause() {
      if (this.player) {
        this.player.pause();
      }
    },
    play() {
      if (this.player) {
        this.player.play();
      }
    },
    createPlayer() {
      if (window?.asciinema === undefined || window?.asciinema === null) {
        return;
      } else {
        window.clearInterval(this.$data.timeout);
      }
      let data = this.src;
      if (
          this.src &&
          !this.src.endsWith(".json") &&
          !this.src.endsWith(".cast")
      ) {
        data =
            "data:application/json;base64," + Buffer.from(this.src).toString('base64')
      }

      this.player = window.asciinema.player.js.CreatePlayer(
          this.$refs.player,
          data,
          {
            width: this.cols,
            height: this.rows,
            loop: false,
            "font-size": this.fontSize,
            title: this.title,
            author: this.author,
            "author-img-url": this.authorImgUrl,
            "author-url": this.authorUrl,
            theme: this.theme,
            "idle-time-limit": this.idleTimeLimit,
            startAt: this.startAt,
            poster: this.poster,
            speed: this.speed,
            autoPlay: this.autoplay,
            preload: this.preload
          }
      );
    },
    destoryInstance() {
      window.asciinema.player.js.UnmountPlayer(this.$refs.player);
      this.player = null;
    }
  },
  beforeDestroy() {
    this.destoryInstance();
  },
  mounted() {
    this.awaitAsciinema();
  }
};
</script>
