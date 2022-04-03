<template>
  <section>
    <NavBar/>
    <router-view/>
  </section>
</template>

<script lang="ts" setup>
import NavBar from '@/components/NavBar.vue'
</script>

<style>
nav {
  padding: 30px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
}

nav a.router-link-exact-active {
  color: #42b983;
}
</style>
