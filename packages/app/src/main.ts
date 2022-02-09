import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { store, key } from "@/store";
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";
const options = {
    // You can set your default options here
};
createApp(App).use(router).use(store, key).use(Toast, options).mount("#app");
