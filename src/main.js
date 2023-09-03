import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";

import { router } from "./router/router.js";
//vconsole
import VConsole from "vconsole";
const vConsole = new VConsole();
createApp(App).use(router).mount("#app");
