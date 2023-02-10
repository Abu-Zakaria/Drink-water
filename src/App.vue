<template>
  <div class="animate__animated animate__fadeIn">
    <router-view />
  </div>
</template>

<style>
@import url("@/assets/css/skeleton.css");
@import url("@/assets/css/custom.css");

body {
  background: #00293d;
  color: #dfdfdf;
}

#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

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
