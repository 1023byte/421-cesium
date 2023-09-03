//Vue3 router
import { createRouter, createWebHashHistory } from "vue-router";

import cesium from "../view/cesium.vue";
import test from "../view/test.vue";

const routes = [
  {
    path: "/",
    component: cesium,
  },
  {
    path: "/1",
    component: test,
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export { router };
