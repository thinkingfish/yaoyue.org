<script setup>
// Base-aware <img>: prepends Vite's BASE_URL so public assets resolve under
// any deploy base (e.g. /talks/caching/). Pass src WITHOUT a leading slash.
// Using a component (not <img src="/x">) avoids Slidev compiling the path into
// a static import, which fails Vite's server.fs.allow check at build time.
defineProps({ src: { type: String, required: true } })
const base = import.meta.env.BASE_URL
</script>

<template>
  <img :src="base + src" />
</template>
