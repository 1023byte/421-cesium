import * as Cesium from "cesium";
import { viewer } from "@/utils/cesConfig.js";
import {
  drawPoint,
  drawPolygon,
  drawDynamicPolygon,
} from "@/utils/cesiumTools.js";
import optionBox from "./optionBox.js";

import addInfoVue from "@/components/addInfo.vue";

//顶点集合
let ShapePoints = {};
//图形实体集合
let shapes = {};

//当前图形GeoJson
let currShapePoints = null;

//跟随鼠标移动点
let floatingPoint = null;

//临时点实体集合
let tempPoints = [];
let isDraw = false;
let isDrag = false;
let dragPointIdx = -1;
let handler;

setTimeout(() => {
  handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
}, 0);

export function drawStart() {
  isDraw = true;
  // LEFT_CLICK
  handler.setInputAction((click) => {
    if (isDraw) {
      //获取鼠标点击的坐标
      const ray = viewer.camera.getPickRay(click.position);
      let position = viewer.scene.globe.pick(ray, viewer.scene);

      //判断是否是第一个点
      if (!currShapePoints) {
        tempPoints.push(drawPoint(position));
        console.log("tempPoints", tempPoints);
        const feature = {
          type: "Feature",
          properties: {},
          geometry: {
            type: "Polygon",
            coordinates: [],
          },
        };
        feature.geometry.coordinates.push(position);
        const DynamicPolygon = drawDynamicPolygon(feature.geometry.coordinates);
        const shape = drawPolygon(DynamicPolygon);
        feature.properties.id = shape.id;
        ShapePoints[shape.id] = feature;
        shapes[shape.id] = shape;
        currShapePoints = feature;
        console.log("currShapePoints2", currShapePoints);
      }

      //绘制跟随鼠标移动点
      floatingPoint = drawPoint(position);
      tempPoints.push(floatingPoint);
      floatingPoint.isFloating = true;
      currShapePoints.geometry.coordinates.push(position);
      console.log("currShapePoints3", currShapePoints);
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

  //MOUSE_MOVE
  handler.setInputAction((click) => {
    if (isDraw) {
      const ray = viewer.camera.getPickRay(click.endPosition);
      let position = viewer.scene.globe.pick(ray, viewer.scene);

      if (Cesium.defined(floatingPoint)) {
        floatingPoint.position.setValue(position);
        currShapePoints.geometry.coordinates.pop();
        currShapePoints.geometry.coordinates.push(position);
      }
    }
    if (dragPointIdx >= 0) {
      console.log("dragPointIdx", dragPointIdx);
      viewer.scene.screenSpaceCameraController.enableRotate = false;
      const ray = viewer.camera.getPickRay(click.endPosition);
      let position = viewer.scene.globe.pick(ray, viewer.scene);
      tempPoints[dragPointIdx].position.setValue(position);
      currShapePoints.geometry.coordinates[dragPointIdx] = position;
    }
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

  // RIGHT_CLICK
  handler.setInputAction((click) => {
    //绘制状态下，右键删除上一个点
    if (isDraw) {
      if (tempPoints.length > 2) {
        currShapePoints.geometry.coordinates.splice(-2, 1);
        viewer.entities.remove(tempPoints.splice(-2, 1)[0]);
      }
    } else if (isDrag) {
      console.log(isDrag);
    } else {
      //非绘制、拖拽状态下，右键选中图形
      console.log("click");
      const pick = viewer.scene.pick(click.position);
      const ray = viewer.camera.getPickRay(click.position);
      let position = viewer.scene.globe.pick(ray, viewer.scene);
      if (Cesium.defined(pick?.id)) {
        currShapePoints = ShapePoints[pick.id.id];
        console.log("currShapePoints1", currShapePoints);
        //弹出选项框
        const options = {
          position: position,
          operation: [
            { name: "添加信息", callback: addInfo },
            { name: "移动点位", callback: movePoint },
            { name: "删除图形", callback: delShape },
            { name: "取消", callback: () => {} },
          ],
        };
        const optionbox = new optionBox(viewer, options);
      }
    }
  }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

  //双击
  handler.setInputAction((click) => {
    if (isDraw) {
      currShapePoints.geometry.coordinates.splice(-2);
      currShapePoints = null;
      floatingPoint = null;
      isDraw = false;
    }
    if (isDrag) isDrag = false;
    tempPoints.forEach((point) => {
      viewer.entities.remove(point);
    });
    tempPoints = [];
  }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
  // LEFT_DOWN
  handler.setInputAction((click) => {
    if (isDrag) {
      const pick = viewer.scene.pick(click.position);
      if (Cesium.defined(pick?.id)) {
        dragPointIdx = tempPoints.findIndex((e) => e.id === pick.id.id);
      }
    }
  }, Cesium.ScreenSpaceEventType.LEFT_DOWN);

  // LEFT_UP
  handler.setInputAction((click) => {
    if (isDrag) {
      dragPointIdx = -1;
      viewer.scene.screenSpaceCameraController.enableRotate = true;
    }
  }, Cesium.ScreenSpaceEventType.LEFT_UP);
}

export function drawEnd() {}

function delShape() {
  const id = currShapePoints.properties.id;
  viewer.entities.remove(shapes[id]);
  delete shapes[id];
  delete ShapePoints[id];
  currShapePoints = null;
}
function movePoint() {
  const points = currShapePoints.geometry.coordinates;
  points.forEach((point) => {
    tempPoints.push(drawPoint(point));
  });
  isDrag = true;
}
function addInfo() {
  const options = {
    element: addInfoVue,
    operation: [{ data: currShapePoints }],
  };
  const popup = new optionBox(viewer, options);
}
