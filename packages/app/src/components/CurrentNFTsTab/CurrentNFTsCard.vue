<template>
  <div class="current-nft-slider">
    <carousel :settings="settings" :breakpoints="breakpoints">
      <slide v-for="slide in 10" :key="slide">
        <div class="carousel__item">
          <CurrentNFTsSlide />
        </div>
      </slide>

      <template #addons>
        <navigation />
      </template>
    </carousel>
  </div>
</template>

<script>
// If you are using PurgeCSS, make sure to whitelist the carousel CSS classes
import "vue3-carousel/dist/carousel.css";
import { Carousel, Slide, Navigation } from "vue3-carousel";
import CurrentNFTsSlide from "@/components/CurrentNFTsTab/CurrentNFTsSlide.vue";

export default {
  name: "App",
  components: {
    Carousel,
    Slide,
    Navigation,
    CurrentNFTsSlide,
  },
  setup() {
    return {
      settings: {
        itemsToShow: 1,
        snapAlign: "center",
      },
      breakpoints: {
        700: {
          itemsToShow: 1,
          snapAlign: "center",
        },
        1024: {
          itemsToShow: 2,
          snapAlign: "start",
        },
      },
    };
  },
};
</script>
<style>
.current-nft-slider {
  margin: 50px 0 0 0;
}
.current-nft-slider .carousel__item {
  min-height: 200px;
  width: 100%;
  font-size: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.current-nft-slider .carousel__slide {
  padding: 25px;
}
.current-nft-slider .carousel__prev {
  left: 25px;
}
.current-nft-slider .carousel__next {
  right: 25px;
}
.current-nft-slider .carousel__prev,
.current-nft-slider .carousel__next {
  box-sizing: content-box;
  background-color: #ffa000;
  width: 100px;
  height: 100px;
  border-radius: 50%;
}
.carousel__icon {
  display: none;
}
.current-nft-slider .carousel__prev:after {
  content: "";
  position: absolute;
  background: url("../../assets/ArrowSVG.svg");
  height: 30px;
  width: 30px;
  background-repeat: no-repeat;
  transform: rotate(180deg);
  left: 31px;
  top: 36px;
}
.current-nft-slider .carousel__next:after {
  content: "";
  position: absolute;
  background: url("../../assets/ArrowSVG.svg");
  height: 30px;
  width: 30px;
  background-repeat: no-repeat;
  right: 31px;
  top: 36px;
}
</style>
