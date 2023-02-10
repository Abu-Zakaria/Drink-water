<template>
  <div name="start_drinking_session">
    <h2
      id="start_session_heading"
      class="text-center animate__animated"
      v-if="state.stage == 1"
      :class="{ animate__fadeOut: state.sessionStatus == 'started' }"
    >
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
      <p>You've drank {{ state.totalSipsTaken }} times</p>
    </div>
    <div v-if="state.stage == 3">
      <DrinkingSessionReport
        :totalSipsTaken="
          Math.floor(state.totalSipsRequired - state.missedReminders)
        "
        :missedReminders="state.missedReminders"
        @close="onReportClose"
      />
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
import DrinkingSessionReport from "./DrinkingSessionReport.vue";

export default {
  name: "StartDrinkingSession",
  props: [],
  components: {
    DrinkingSessionReport,
  },
  setup() {
    const state = reactive({
      sessionStatus: "stopped",
      stage: 1,
      perSipDelay: 0.2, // minute
      totalSipsPerSessions: 3,
      sessionLength: null, // seconds
      totalSipsTaken: Number(
        window.localStorage.getItem("total_sips_taken") ?? 0
      ),
      startingTime:
        Number(window.localStorage.getItem("starting_time")) ?? null,
      missedReminders: Number(
        window.localStorage.getItem("missed_reminders") ?? 0
      ),
      timestampCursor: null,
      next_reminder_diff: null,
      timeoutForDrink: 4, // seconds
      tookSipBtnStatus: null,
      startClickSound: new Audio(
        require("@/assets/sounds/start-button-clicked.mp3")
      ),
      notificationSound: new Audio(
        require("@/assets/sounds/notification-sound.mp3")
      ),
      defaults: {
        timeoutForDrink: 4,
      },
    });
    state.sessionLength = state.totalSipsPerSessions * state.perSipDelay * 60;

    state.totalSipsRequired = state.sessionLength / (state.perSipDelay * 60);

    const channel = new BroadcastChannel("drink-water");

    channel.onmessage = (message) => {
      if (message.data.action == "took-sip") {
        tookASip();
      } else if (message.data.action == "clear-notifications") {
        clearAllNotifications();
      }
    };

    const startSession = () => {
      state.sessionStatus = "started";
      state.startClickSound.play();

      setTimeout(() => {
        state.stage = 2;

        const now = Number(moment().format("X"));
        window.localStorage.setItem("starting_time", now);
        state.startingTime = now;
        const next_reminder = moment().add(state.perSipDelay, "minute");

        window.localStorage.setItem(
          "next_reminder",
          Number(next_reminder.format("X"))
        );

        refreshEndingTime();
      }, 1000);
    };

    const checkForStatus = () => {
      if (state.tookSipBtnStatus == "pending") return;
      const now = moment();

      if (state.endingTime && Number(now.format("X")) > state.endingTime) {
        state.sessionStatus = "finished";
        state.stage = 3;
        return;
      }
      if (state.stage == 1) return;

      const next_reminder = window.localStorage.getItem("next_reminder");

      if (state.startingTime && next_reminder) {
        checkForCurrentReminder();
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

      setMissedReminder(reminder_passed - state.totalSipsTaken);

      state.timestampCursor = now_ts;

      state.next_reminder_diff =
        Number(window.localStorage.getItem("next_reminder")) -
        state.timestampCursor;
    };

    const setMissedReminder = (times) => {
      state.missedReminders = times;
      window.localStorage.setItem("missed_reminders", state.missedReminders);
    };

    let reminderTimer = null;

    const remindUserToDrink = () => {
      state.sessionStatus = "pending";
      state.tookSipBtnStatus = "pending";

      reminderTimer = setInterval(() => {
        if (state.timeoutForDrink-- <= 0) {
          state.tookSipBtnStatus = "missed";
          setMissedReminder(++state.missedReminders);
          resetReminderTimer();
        }
      }, 1000);

      Notification.requestPermission().then((result) => {
        if (result == "granted") {
          showNotification();
        }
      });
    };

    const resetReminderTimer = () => {
      clearInterval(reminderTimer);

      state.timeoutForDrink = state.defaults.timeoutForDrink;
      state.timestampCursor = null;

      setTimeout(() => {
        state.sessionStatus = "started";
        state.tookSipBtnStatus = null;
      }, 3000);
    };

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

      clearAllNotifications();
    };

    const showNotification = () => {
      state.notificationSound.play();
      channel.postMessage({
        action: "show-notification",
      });

      setTimeout(() => {
        clearAllNotifications();
      }, 29900);
    };

    const clearAllNotifications = () => {
      channel.postMessage({
        action: "clear-notifications",
      });
    };

    const onReportClose = () => {
      window.localStorage.clear();
      window.location.href = "/";
    };

    const refreshEndingTime = () => {
      state.endingTime = state.startingTime
        ? Number(state.startingTime) + state.sessionLength
        : null;
    };

    refreshEndingTime();

    checkForStatus();

    setInterval(() => {
      checkForStatus();
    }, 1000);

    return {
      state,
      startSession,
      tookASip,
      onReportClose,
    };
  },
};
</script>

<style>
.start-button {
  border-radius: 50%;
  height: 172px;
  width: 180px;
  font-size: 22px;
  box-shadow: 0 0px 0px 0px rgb(15 31 39);
  transition: all 0.4s;
  border-color: #00ffff !important;
  font-weight: normal;
}

.start-button:hover {
  box-shadow: 0 0px 0px 15px rgb(13 172 254 / 24%);
}

.start-button:focus {
  box-shadow: 0 0px 0px 15px rgba(13 172 254 / 45%);
}

/* #start_session_heading,
#running_session_heading {
  z-index: 3;
  margin-top: 48px;
} */

#start_session_btn {
  z-index: 2;
}
</style>
