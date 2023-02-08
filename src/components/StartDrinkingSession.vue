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
      <p>You've drank {{ state.totalSipsTaken }} times</p>
    </div>
    <div v-if="state.stage == 3">
      <div class="align-center">
        <h2>Well Done</h2>
      </div>

      <div class="align-center">
        <p>In your last drinking session</p>
      </div>
      <div>
        <h3 class="align-center">You drank {{ state.totalSipsTaken }} times</h3>
        <h3 class="align-center">
          You missed {{ state.missedReminders }} times
        </h3>
      </div>
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
      missedReminders: Number(
        window.localStorage.getItem("missed_reminders") ?? 0
      ),
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

    const showNotification = () => {
      const options = {
        body: "klajsdkls",
        icon: "/img/logo.png",
        vibrate: [200, 100, 50, 10, 50],
        actions: [
          {
            action: "took-a-sip",
            title: "Took a sip",
            type: "button",
          },
        ],
      };
      const title = "Time to take a sip";

      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(title, options);

        // self.addEventListener("notificationclick", (event) => {
        //   console.log("e", event);
        //   clearAllNotifications();
        // });

        setTimeout(() => {
          registration.getNotifications().then((notifications) => {
            notifications.forEach((notification) => {
              notification.onclick = () => {
                console.log("Mon bhulay re");
              };
              notification.addEventListener("click", () => {
                console.log("JJJ");
              });
              notification.addEventListener("onclick", () => {
                console.log("KKK");
              });
            });
          });
        }, 2000);

        self.addEventListener("notificationclick", (event) => {
          console.log("E", event);
          alert("QWE");
        });

        setTimeout(() => {
          clearAllNotifications();
        }, 29000);

        // registration.getNotifications().then((notification) => {});
      });

      window.addEventListener("notificationclick", (e) => {
        console.log("QWE");
        if (!e.action) return;

        switch (e.action) {
          case "took-a-sip":
            console.log("WQEEW");
            tookASip();
            break;
        }
      });
    };

    const clearAllNotifications = () => {
      navigator.serviceWorker.ready.then((registration) => {
        registration.getNotifications().then((notifications) => {
          notifications.forEach((notification) => {
            notification.close();
          });
        });
      });
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
