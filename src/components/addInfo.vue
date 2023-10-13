<template>
  <div>123</div>
</template>

<script setup>
const props = defineProps({
  data: {
    type: Object,
    default: () => {},
  },
});
console.log(props.data);
</script>

<style lang="scss" scoped></style>
