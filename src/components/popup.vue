<template>
  <div class="popup">
    <p>123</p>
    <div>123</div>
  </div>
</template>

<script>
export default {
  props: ["popupContent"],
};
</script>

<style scoped>
.popup {
  position: absolute;
  background-color: white;
  padding: 10px;
  border: 1px solid #ccc;
  z-index: 1000;
}
</style>
