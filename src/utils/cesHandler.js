import * as Cesium from "cesium";
import { viewer } from "@/utils/cesConfig.js";
import {
  drawPoint,
  drawPolygon,
  drawDynamicPolygon,
} from "@/utils/cesiumTools.js";
//图形对象集合
let shapes = [];
//图形顶点集合
let ShapePoints = [];
//拖拽点集合
let dragPoints = [];
let tempShape = null;
let tempShapePoints = [];

let floatingPoint;

let isDraw = false;
let isDrag = false;
let pickedPoint = null;

let handler;
let idx = -1;
let data = {};
export function drawStart() {
  isDraw = true;
  handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

  // LEFT_CLICK
  handler.setInputAction((click) => {
    if (isDraw) {
      // 获取鼠标点击位置的坐标
      const ray = viewer.camera.getPickRay(click.position);
      let position = viewer.scene.globe.pick(ray, viewer.scene);
      const pickedObject = viewer.scene.pick(click.position);
      //点击到图形上,排除动态顶点
      const isEntity =
        pickedObject?.id instanceof Cesium.Entity &&
        !pickedObject?.id.isFloating;

      //3dtile模型的坐标
      // let tilePosition = viewer.scene.pickPosition(click.position);

      // if (tilePosition) {
      //   const temp = Cesium.Cartographic.fromCartesian(tilePosition);
      //   // 转换为Cartesian3坐标
      //   tilePosition =
      //     viewer.scene.globe.ellipsoid.cartographicToCartesian(temp);
      // }

      // 鼠标点击位置有坐标
      if (Cesium.defined(position) && !isEntity) {
        //绘制新图形
        if (!tempShape) {
          idx = ShapePoints.length;
          ShapePoints.push([]);
          dragPoints.forEach((e) => viewer.entities.remove(e));
          dragPoints = [];
          //写入自定义data
          data.id = prompt("输入编号");
          if (data.id == null) return;

          //绘制跟随鼠标移动点
          floatingPoint = drawPoint(position);
          floatingPoint.isFloating = true;
          ShapePoints[idx].push(position);

          //绘制动态多边形
          const DynamicPolygon = drawDynamicPolygon(ShapePoints[idx]);
          const shape = drawPolygon(DynamicPolygon);
          tempShape = shape;
          shapes.push(shape);
        }
        //绘制图形的后续点击
        const dragPoint = drawPoint(position);
        dragPoint.dragIdx = ShapePoints[idx].length - 1;
        dragPoints.push(dragPoint);
        ShapePoints[idx].push(position);
      }

      //点击到图形上

      if (isEntity && dragPoints.length == 0) {
        //渲染选中的图形的顶点
        const points = pickedObject.id.polygon.hierarchy.getValue().positions;
        points.forEach((e, idx) => {
          const dragPoint = drawPoint(e);
          dragPoint.dragIdx = idx;
          dragPoints.push(dragPoint);
        });
      }
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

  //MOUSE_MOVE
  handler.setInputAction((click) => {
    if (isDraw) {
      const ray = viewer.camera.getPickRay(click.endPosition);
      let position = viewer.scene.globe.pick(ray, viewer.scene);

      //存在floatingPoint正在绘制图形
      if (Cesium.defined(floatingPoint) && Cesium.defined(position)) {
        //3dtile模型的坐标
        // let tilePosition = viewer.scene.pickPosition(click.endPosition);
        // if (tilePosition) {
        //   const temp = Cesium.Cartographic.fromCartesian(tilePosition);
        //   temp.height += 0.1;
        //   // 转换为Cartesian3坐标
        //   tilePosition =
        //     viewer.scene.globe.ellipsoid.cartographicToCartesian(temp);
        // }
        // 鼠标点击位置有坐标

        floatingPoint.position.setValue(position);
        ShapePoints[idx].pop();
        ShapePoints[idx].push(position);
      }

      //拖拽
      if (isDrag && Cesium.defined(pickedPoint)) {
        pickedPoint.position.setValue(position);
        ShapePoints[idx][pickedPoint.dragIdx] = position;
        viewer.scene.screenSpaceCameraController.enableRotate = false;
      }
    }
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

  // RIGHT_CLICK
  handler.setInputAction((click) => {
    if (isDraw) {
      viewer.entities.remove(floatingPoint);
      floatingPoint = undefined;

      //如果点击到图形上，弹出删除选择框
      const pickedObject = viewer.scene.pick(click.position);
      if (Cesium.defined(pickedObject) && !tempShape) {
        const id = pickedObject.id.id;
        const isDelete = confirm("是否删除该图形");
        if (isDelete) {
          viewer.entities.remove(pickedObject.id);
          //计算删除的图形的索引
          const delIdx = shapes.findIndex((e) => e.id === id);
          shapes.splice(delIdx, 1);
          ShapePoints.splice(delIdx, 1);

          console.log("del ", shapes, idx);
        }
      }

      //图形构成的点数大于2，绘制完成并写入数据
      if (tempShape && ShapePoints[idx].length > 3) {
        ShapePoints[idx].pop();
        const center = Cesium.BoundingSphere.fromPoints(tempShapePoints).center;
        data.center = center;

        shapes[idx].data = data;
        tempShape = null;
      }
      //绘制完成后删除定位点
      dragPoints.forEach((e) => viewer.entities.remove(e));
      dragPoints = [];
    }
  }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

  // LEFT_DOWN
  handler.setInputAction((click) => {
    const pickedObject = viewer.scene.pick(click.position);
    //是否点击到拖拽点
    if (Cesium.defined(pickedObject) && pickedObject.id?.dragIdx > -1) {
      pickedPoint = pickedObject.id;
      isDrag = true;
    }
  }, Cesium.ScreenSpaceEventType.LEFT_DOWN);

  // LEFT_UP
  handler.setInputAction((click) => {
    if (isDrag) {
      isDrag = false;
      pickedPoint = null;
      viewer.scene.screenSpaceCameraController.enableRotate = true;
    }
  }, Cesium.ScreenSpaceEventType.LEFT_UP);
}

export function drawEnd() {
  isDraw = false;

  return shapes;
}
