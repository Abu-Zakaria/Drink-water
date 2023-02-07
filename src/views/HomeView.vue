<template>
  <div class="home container">
    <div class="row">
      <StartDrinkingSession />
    </div>
  </div>
</template>

<script>
import StartDrinkingSession from "@/components/StartDrinkingSession";

export default {
  name: "HomeView",
  components: {
    StartDrinkingSession,
  },
};
</script>
