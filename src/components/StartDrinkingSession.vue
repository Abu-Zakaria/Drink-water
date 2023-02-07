<template>
  <div name="start_drinking_session">
    <h2 id="start_session_heading" class="align-center" v-if="state.stage == 1">
      Start your drinking session
    </h2>
    <h2
      id="running_session_heading"
      v-else-if="state.stage == 2"
      class="animate__animated animate__fadeIn"
    >
      You will be reminded
    </h2>
    <div v-if="state.stage == 1" class="align-center">
      <button
        id="start_session_btn"
        :class="[
          {
            'button button-primary start-button animate__animated': true,
          },
          {
            animate__backOutUp: state.sessionStatus == 'started',
          },
        ]"
        @click="startSession"
      >
        Start
      </button>
    </div>
    <div v-if="state.stage == 2" class="">
      <p class="animate__animated animate__fadeIn">
        Next reminder to drink water: {{ state.next_reminder_diff }}
      </p>
      <p class="animate__animated animate__fadeIn">
        Now go back to work/study!
      </p>

      <p>You've missed {{ state.missedReminders }} reminders.</p>
      <p>You've drank {{ state.totalSipsTaken }} times.</p>
    </div>
    <div v-if="state.stage == 3">
      <p>Well Done</p>
    </div>

    <div v-if="state.sessionStatus == 'pending'">
      <button
        class="button button-primary"
        @click="tookASip"
        :disabled="
          state.tookSipBtnStatus == 'done' || state.tookSipBtnStatus == 'missed'
        "
        v-if="state.tookSipBtnStatus"
      >
        <span v-if="state.tookSipBtnStatus == 'pending'">
          Yes, I've take a sip. ({{ state.timeoutForDrink }})
        </span>
        <span v-else-if="state.tookSipBtnStatus == 'done'">
          Well Done! 👍
        </span>
        <span v-else-if="state.tookSipBtnStatus == 'missed'">
          You missed! 💀
        </span>
      </button>
    </div>
  </div>
</template>

<script>
import { reactive } from "vue";
import moment from "moment";

export default {
  name: "StartDrinkingSession",
  props: [],
  setup() {
    const state = reactive({
      sessionStatus: "stopped",
      stage: 1,
      perSipDelay: 1,
      totalSipsTaken: Number(
        window.localStorage.getItem("total_sips_taken") ?? 0
      ),
      startingTime:
        Number(window.localStorage.getItem("starting_time")) ?? null,
      missedReminders: null,
      confirmedReminders: null,
      timestampCursor: null,
      next_reminder_diff: null,
      timeoutForDrink: 30,
      tookSipBtnStatus: null,
    });

    state.totalSipsRequired = 60 / state.perSipDelay;
    state.endingTime = state.startingTime
      ? Number(state.startingTime) + 60 * 60
      : null;

    const startSession = () => {
      state.sessionStatus = "started";

      setTimeout(() => {
        state.stage = 2;

        checkForStatus();
      }, 400);

      window.localStorage.setItem(
        "starting_time",
        Number(moment().format("X"))
      );
      state.startingTime = Number(moment().format("X"));
      const next_reminder = moment().add(state.perSipDelay, "minute");
      window.localStorage.setItem(
        "next_reminder",
        Number(next_reminder.format("X"))
      );
    };

    const checkForStatus = () => {
      const next_reminder = window.localStorage.getItem("next_reminder");
      const now = moment();

      if (state.endingTime && Number(now.format("X")) > state.endingTime) {
        state.sessionStatus = "finished";
        state.stage = 3;
        showSessionReport();
        return;
      }

      if (state.startingTime && next_reminder) {
        state.sessionStatus = "started";
        state.stage = 2;

        setInterval(() => {
          if (state.sessionStatus == "started") checkForCurrentReminder();
        }, 1000);
      }
    };

    const checkForCurrentReminder = () => {
      const now_ts = moment().format("X");
      const reminder_passed = Math.floor(
        (now_ts - state.startingTime) / (state.perSipDelay * 60)
      );

      const next_reminder = window.localStorage.getItem("next_reminder");

      if (!state.timestampCursor) {
        state.timestampCursor = now_ts;
      }

      if (Math.floor(Math.abs(state.timestampCursor - next_reminder)) < 2) {
        remindUserToDrink();

        state.timestampCursor = now_ts + 3;
        return;
      }

      if (now_ts > next_reminder && next_reminder < state.timestampCursor) {
        const new_next_reminder =
          state.startingTime + (reminder_passed + 1) * state.perSipDelay * 60;

        window.localStorage.setItem("next_reminder", Number(new_next_reminder));
      }

      state.missedReminders = reminder_passed - state.totalSipsTaken;
      state.confirmedReminders = reminder_passed - state.missedReminders;

      state.timestampCursor = now_ts;

      state.next_reminder_diff =
        Number(window.localStorage.getItem("next_reminder")) -
        state.timestampCursor;
    };

    let reminderTimer = null;

    const remindUserToDrink = () => {
      state.sessionStatus = "pending";
      state.tookSipBtnStatus = "pending";

      reminderTimer = setInterval(() => {
        if (state.timeoutForDrink-- <= 0) {
          state.tookSipBtnStatus = "missed";
          resetReminderTimer();
        }
      }, 1000);
    };

    const resetReminderTimer = () => {
      clearInterval(reminderTimer);

      state.timeoutForDrink = 30;
      state.timestampCursor = null;

      setTimeout(() => {
        state.sessionStatus = "started";
        state.tookSipBtnStatus = null;
      }, 3000);
    };

    const showSessionReport = () => {};

    const tookASip = () => {
      state.tookSipBtnStatus = "done";

      if (!window.localStorage.getItem("total_sips_taken")) {
        window.localStorage.setItem("total_sips_taken", 0);
      }

      state.totalSipsTaken = Number(
        window.localStorage.getItem("total_sips_taken")
      );
      window.localStorage.setItem("total_sips_taken", ++state.totalSipsTaken);

      resetReminderTimer();
    };

    checkForStatus();

    return {
      state,
      startSession,
      tookASip,
    };
  },
};
</script>

<style>
.start-button {
  border-radius: 50%;
  height: 122px;
  width: 130px;
  font-size: 22px;
  box-shadow: 0 0px 0px 0px rgb(15 31 39);
  transition: all 0.4s;
  border-color: #ffffff55 !important;
}

.start-button:hover {
  box-shadow: 0 2px 3px 5px rgb(15 31 39);
}

#start_session_heading {
  z-index: 3;
}

#start_session_btn {
  z-index: 2;
}
</style>