<template>
  <div class="install-wrapper" v-if="state.installed === false">
    <p>
      Get a better experience. &nbsp;
      <span class="install-btn" @click="runInstall()">Install Now</span>
    </p>
  </div>
</template>

<script>
import { reactive } from "vue";

export default {
  name: "InstallComponent",
  setup() {
    const state = reactive({
      installed: null,
      defferedPrompt: null,
    });

    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();

      state.defferedPrompt = e;

      setTimeout(() => {
        checkInstallStatus();
      }, 2000);
    });

    const checkInstallStatus = () => {
      if (window.matchMedia("(display-mode: standalone)").matches) {
        state.installed = true;
        return;
      }
      state.installed = false;
    };

    const runInstall = async () => {
      state.defferedPrompt.prompt();

      const { outcome } = await state.defferedPrompt.userChoice;

      if (outcome == "accepted") {
        state.installed = true;
      }
    };

    return {
      state,
      runInstall,
    };
  },
};
</script>

<style scoped>
.install-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: #f2d541;
  padding: 8px 24px;
  text-align: center;
}

.install-wrapper p {
  margin-bottom: 0 !important;
  color: #00293d;
  font-weight: bold;
}

.install-btn {
  cursor: pointer;
  border: 1px solid #0aadff;
  padding: 4px 14px;
  background: #0aadff;
  color: white;
  border-radius: 8px;
}
</style>
