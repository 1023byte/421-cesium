<template>
  <div id="cesiumContainer"></div>

  <div class="toolbar">
    <button @click="startButton">开始绘制</button>
    <button @click="endButton">保存绘制</button>
  </div>
</template>

<script setup>
import * as Cesium from "cesium";
import { onMounted, ref } from "vue";

import {
  drawPolygon,
  drawPolygonLine,
  drawLabel,
  drawIcon,
  newCartesians,
} from "@/utils/cesiumTools.js";
import { cesConfig } from "@/utils/cesConfig.js";
import { drawStart, drawEnd } from "@/utils/cesHandler.js";
import PopupComponent from "@/components/Popup.vue";
let viewer = null;
let postRenderListener = null;
const popupRef = ref(null);
onMounted(() => {
  viewer = cesConfig("cesiumContainer");

  // 给定的经纬度坐标数组
  var t = {
    id: 233,
    center: {
      x: -2418692.2027910277,
      y: 5386970.758914841,
      z: 2402541.1329112556,
    },
    coordinates: [
      {
        x: -2418378.2916031093,
        y: 5387096.458121978,
        z: 2402575.0627663033,
      },
      {
        x: -2418489.002706979,
        y: 5387061.6078657145,
        z: 2402541.985203348,
      },
      {
        x: -2418426.8729700297,
        y: 5387010.56709662,
        z: 2402717.7800945863,
      },
      {
        x: -2418309.334796696,
        y: 5387072.912423384,
        z: 2402696.4454776174,
      },
    ],
  };

  let shapeData = localStorage.getItem("shapeData");
  if (shapeData) {
    shapeData = JSON.parse(shapeData);
    shapeData.forEach((item) => {
      drawPolygon(newCartesians(item.points), item.data);
    });
  }
  //绘制区域
  drawPolygon(newCartesians(t.coordinates), t.id);
  //绘制边框
  drawPolygonLine(newCartesians(t.coordinates), t.id);
  //绘标签
  drawLabel(newCartesians(t.center), t.id);
  //绘制图表
  drawIcon(newCartesians(t.center), ["r", "y", "g", "y", "g", "y"]);

  //   const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
  //   handler.setInputAction((click) => {
  //     //获取图形的属性
  //   }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

  //   viewer.screenSpaceEventHandler.setInputAction((click) => {
  //     const pickedObject = viewer.scene.pick(click.position);
  //     if (Cesium.defined(pickedObject) && pickedObject.id) {
  //       //获取坐标
  //       const ray = viewer.camera.getPickRay(click.position);
  //       let position = viewer.scene.globe.pick(ray, viewer.scene);
  //       postRenderListener = () => {
  //         const popupPosition =
  //           viewer.scene.cartesianToCanvasCoordinates(position);
  //         console.log(popupPosition);
  //       };
  //       viewer.scene.postRender.addEventListener(postRenderListener);
  //     }
  //   }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
  //   viewer.screenSpaceEventHandler.setInputAction((click) => {
  //     if (postRenderListener) {
  //       viewer.scene.postRender.removeEventListener(postRenderListener);
  //       postRenderListener = null;

  //       console.log("移除");
  //     }
  //   }, Cesium.ScreenSpaceEventType.LEFT_UP);
});

function startButton() {
  drawStart();
  console.log("绘制模式");
}
function endButton() {
  drawEnd();
  console.log("结束绘制");
}
</script>

<style>
html,
body,
#cesiumContainer {
  width: 100%;
  height: 100%;
}
</style>
