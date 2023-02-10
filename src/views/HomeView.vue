<template>
  <div class="home container">
    <div class="row">
      <InstallComponent />
      <StartDrinkingSession />
    </div>
  </div>
</template>

<script>
import StartDrinkingSession from "@/components/StartDrinkingSession";
import InstallComponent from "@/components/InstallComponent";

export default {
  name: "HomeView",
  components: {
    StartDrinkingSession,
    InstallComponent,
  },
};
</script>

<style scoped>
.home {
  margin-top: 64px;
}
</style>
