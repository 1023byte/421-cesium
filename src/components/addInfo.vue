<template>
  <div>123{{ data }}</div>
</template>

<script setup>
const props = defineProps({
  data: {
    type: Object,
    default: () => {},
  },
});
console.log("data", props.data);
</script>

<style lang="scss" scoped></style>
