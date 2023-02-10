<template>
  <div class="row drinking-session-report-wrapper">
    <div class="three columns">&nbsp;</div>
    <div class="six columns">
      <div class="align-center">
        <h2>{{ state.heading }}</h2>
      </div>

      <div>
        <p>In your last drinking session</p>
      </div>
      <div class="report-item">
        <p>You drank:</p>
        <h3 class="align-center">
          <span class="good-report">{{ sips }}</span
          >&nbsp;<span class="report-unit">time{{ sips > 1 ? "s" : "" }}</span>
        </h3>
      </div>
      <div class="report-item">
        <p>You missed:</p>
        <h3 class="align-center">
          <span class="bad-report">{{ missed }}</span
          >&nbsp;<span class="report-unit"
            >time{{ missed > 1 ? "s" : "" }}</span
          >
        </h3>
      </div>
      <div class="align-center">
        <button class="button button-secondary" @click="close">Close</button>
      </div>
    </div>
  </div>
</template>

<script>
import { reactive } from "vue";

export default {
  name: "DrinkingSessionReport",
  props: ["totalSipsTaken", "missedReminders"],
  setup(props, context) {
    const state = reactive({
      heading: "",
    });
    const close = () => {
      context.emit("close");
    };

    if (props.totalSipsTaken > props.missedReminders) {
      state.heading = "Well done!";
    } else {
      state.heading = "Do better next time 👍";
    }

    return {
      sips: props.totalSipsTaken,
      missed: props.missedReminders,
      state,
      close,
    };
  },
};
</script>

<style scoped>
.report-item {
  border: 1px solid #2effffaa;
  border-radius: 8px;
  padding: 12px 18px 44px;
  margin-bottom: 22px;
  box-shadow: 3px 3px 0px 0px #2effff;
}

.report-unit {
  font-size: 14px;
  margin-top: 17px;
}

.good-report {
  color: #0aadff;
}

.bad-report {
  color: #dc0000;
}
</style>
