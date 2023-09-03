import * as Cesium from "cesium";
import { viewer } from "@/utils/cesConfig.js";

// 转笛卡尔坐标
export function ToCartesians(coordinates) {
  return coordinates.map((coord) =>
    Cesium.Cartesian3.fromDegrees(coord[0], coord[1])
  );
}

//笛卡尔坐标
export function newCartesians(coordinates) {
  if (Array.isArray(coordinates)) {
    return coordinates.map(
      (coord) => new Cesium.Cartesian3(coord.x, coord.y, coord.z)
    );
  } else if (typeof coordinates === "object") {
    return new Cesium.Cartesian3(coordinates.x, coordinates.y, coordinates.z);
  } else {
    throw new Error("Invalid coordinates type");
  }
}

//绘制点
export function drawPoint(position) {
  const pointEntity = viewer.entities.add({
    position: position,
    point: {
      color: Cesium.Color.RED,
      pixelSize: 6,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    },
  });

  return pointEntity;
}

//绘制多边形
export function drawPolygon(position, data) {
  const polygonEntity = viewer.entities.add({
    data: data,
    polygon: {
      hierarchy: position,
      material: new Cesium.ColorMaterialProperty(
        Cesium.Color.WHITE.withAlpha(0.5)
      ),
      outline: true,
      outlineColor: Cesium.Color.BLACK,
      outlineWidth: 3,
    },
  });
  return polygonEntity;
}

//绘制多边形边框
export function drawPolygonLine(position) {
  //缺口补齐
  if (position.length >= 2 && position[0] !== position[position.length - 1])
    position.push(position[0]);

  return viewer.entities.add({
    polyline: {
      positions: position,
      material: Cesium.Color.RED.withAlpha(0.5),
      width: 2,
    },
  });
}

//绘制标签
export function drawLabel(position, data) {
  return viewer.entities.add({
    position: position,
    label: {
      text: data.toString(),
      fillColor: Cesium.Color.RED,
      outlineColor: Cesium.Color.WHITE,
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      font: "18px sans-serif",
      pixelOffset: new Cesium.Cartesian2(0, -10),
    },
  });
}

//绘制图标
export function drawIcon(position, data) {
  const iconEntitys = [];
  const iconSize = 16;
  const iconOffset = (data.length / 2 - 0.5) * iconSize;
  data.forEach((item, idx) => {
    const url = `../assets/icon_${item}.png`;
    iconEntitys.push(
      viewer.entities.add({
        position: position,
        billboard: {
          image: new URL(url, import.meta.url).href, // 图标图片的路径
          width: iconSize,
          height: iconSize,
          pixelOffset: new Cesium.Cartesian2(
            idx * iconSize - iconOffset,
            -iconSize * 2
          ),
        },
      })
    );
  });

  return iconEntitys;
}

//绘制动态图形
export function drawDynamicPolygon(position) {
  return new Cesium.CallbackProperty(() => {
    return new Cesium.PolygonHierarchy(position);
  }, false);
}
