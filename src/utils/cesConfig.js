import * as Cesium from "cesium";
export let viewer;

export function cesConfig(id) {
  Cesium.Ion.defaultAccessToken =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxNmQ2YWZkNC1iZWI0LTRkMzMtODk4ZS1kZWM4MjhkNmUxMmYiLCJpZCI6MTM0NjA5LCJpYXQiOjE2ODE5Njk4MDV9.rHXCnAN14gIQUTBu1B640rhRnVxfDsfaJDDPLutJAog";
  viewer = new Cesium.Viewer(id, {
    sceneModePicker: false, // 禁用场景模式切换
    baseLayerPicker: false, // 禁用基础图层切换
    geocoder: false, // 禁用地理编码器
    navigationHelpButton: false, // 禁用导航帮助按钮
    homeButton: false, // 禁用回到初始视图按钮
    animation: false, // 禁用动画小部件
    timeline: false, // 禁用时间线小部件
    fullscreenButton: false, // 禁用全屏按钮

    //开启地形深度检测
    // terrainProvider: Cesium.createWorldTerrain({
    //   requestWaterMask: true, // required for water effects
    //   requestVertexNormals: true, // required for terrain lighting
    // }),
  });

  viewer._cesiumWidget._creditContainer.style.display = "none"; // 隐藏版权信息
  viewer.scene.postProcessStages.fxaa.enabled = true; //开启抗锯齿
  viewer.scene.globe.depthTestAgainTerrain = true; //深度

  const url = "http://119.29.18.111/xctiles/Production_2_3D_TILES.json";
  const tileset = new Cesium.Cesium3DTileset({
    url: url,
    maximumScreenSpaceError: 1,
  });
  viewer.scene.primitives.add(tileset);
  tileset.readyPromise.then(function (tileset) {
    var boundingSphere = tileset.boundingSphere;
    var cartographic = Cesium.Cartographic.fromCartesian(boundingSphere.center);
    var surface = Cesium.Cartesian3.fromRadians(
      cartographic.longitude,
      cartographic.latitude,
      0.0
    );
    var offset = Cesium.Cartesian3.fromRadians(
      cartographic.longitude,
      cartographic.latitude,
      -27
    );
    var translation = Cesium.Cartesian3.subtract(
      offset,
      surface,
      new Cesium.Cartesian3()
    );
    tileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation);
  });

  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(
      121.516,
      29.88,
      800 // 最后一个参数是高度（单位：米）
    ),
    duration: 0, // 飞行时间（单位：秒）
  });
  // 香港的经纬度坐标
  // const hongKongLongitude = 114.17744867837597;
  // const hongKongLatitude = 22.27528883816501;

  // 将视图定位到香港
  // viewer.camera.flyTo({
  //   destination: Cesium.Cartesian3.fromDegrees(
  //     hongKongLongitude,
  //     hongKongLatitude,
  //     800 // 最后一个参数是高度（单位：米）
  //   ),
  //   duration: 0, // 飞行时间（单位：秒）
  // });
  //取消entity事件
  viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(
    Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK
  );
  viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(
    Cesium.ScreenSpaceEventType.LEFT_CLICK
  );

  return viewer;
}
