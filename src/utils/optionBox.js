import { Cartesian3, SceneTransforms } from "cesium";
import { createApp } from "vue";
//根据数据创建弹窗div
// export function optionsBox(viewer, options) {
//   //创建div
//   console.log("options", options);
//   const optionsBox = document.createElement("div");
//   optionsBox.style.position = "absolute";
//   optionsBox.style.top = "50%";
//   optionsBox.style.left = "50%";
//   optionsBox.style.width = "100px";
//   optionsBox.style.height = "100px";
//   optionsBox.style.zIndex = "999";
//   optionsBox.style.backgroundColor = "rgba(0,0,0,0.5)";
//   // options.forEach((option) => {
//   //   const btn = document.createElement("div");
//   //   btn.style.width = "100px";
//   //   btn.style.height = "30px";
//   //   btn.style.userSelect = "none";
//   //   btn.style.color = "#fff";
//   //   btn.style.cursor = "pointer";
//   //   btn.innerText = option.name;
//   //   btn.onclick = option.callback;
//   //   optionsBox.appendChild(btn);
//   // });

//   viewer.scene.postRender.addEventListener(updatePosition);
//   //添加Viewer.scene.canvas的兄弟节点
//   viewer.scene.canvas.parentNode.appendChild(optionsBox);
// }

// function updatePosition() {
//   const position = SceneTransforms.wgs84ToWindowCoordinates(
//     viewer.scene,
//     Cartesian3.fromDegrees(116.3, 39.9)
//   );
//   // optionsBox.style.top = position.y + "px";
//   // optionsBox.style.left = position.x + "px";
// }
let instance = null;
export default class optionBox {
  constructor(viewer, options) {
    if (instance) {
      instance.setPosition(options.position);
      return instance;
    }
    this.viewer = viewer;
    this.position = options.position;
    this.operation = options.operation;

    if (options.element) {
      const parent = document.createElement("div");
      this.viewer.scene.canvas.parentNode.appendChild(parent);
      const VueConstructor = createApp(options.element).mount(parent);
      VueConstructor.component.props = options.operation;
      console.log("VueConstructor", VueConstructor);
      // VueConstructor.setData({ operation: this.operation });
    } else {
      this.element = this.createElement();
      this.viewer.scene.postRender.addEventListener(this.updatePosition);
      this.viewer.scene.canvas.parentNode.appendChild(this.element);
    }

    instance = this;
  }
  setPosition = (position) => {
    this.position = position;
  };
  updatePosition = () => {
    if (!this.position) return;
    const position = SceneTransforms.wgs84ToWindowCoordinates(
      this.viewer.scene,
      this.position
    );
    this.element.style.top = position.y + "px";
    this.element.style.left = position.x + "px";
  };
  destroy() {
    this.viewer.scene.postRender.removeEventListener(this.updatePosition);
    this.viewer.scene.canvas.parentNode.removeChild(this.element);
    instance = null;
  }
  createElement() {
    const element = document.createElement("div");
    element.style.position = "absolute";
    element.style.top = "50%";
    element.style.left = "50%";
    element.style.width = "100px";
    element.style.zIndex = "999";
    element.style.backgroundColor = "rgba(0,0,0,0.5)";
    this.operation.forEach((option) => {
      const btn = document.createElement("div");
      btn.style.width = "100px";
      btn.style.height = "30px";
      btn.style.lineHeight = "30px";
      btn.style.textAlign = "center";
      btn.style.userSelect = "none";
      btn.style.color = "#fff";
      btn.style.cursor = "pointer";
      btn.innerText = option.name;
      btn.onclick = () => {
        this.destroy();
        option.callback();
      };
      element.appendChild(btn);
    });
    return element;
  }
}
