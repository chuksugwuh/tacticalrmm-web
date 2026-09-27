<template>
  <q-layout view="lHh LpR lFf">
    <q-header class="app-header">
      <q-banner
        v-if="needRefresh"
        inline-actions
        class="bg-red text-white text-center"
      >
        You are viewing an outdated version of this page.
        <q-btn
          color="dark"
          icon="refresh"
          label="Refresh"
          @click="$store.dispatch('reload')"
        />
      </q-banner>
      <q-banner
        v-if="!hosted && tokenExpired"
        inline-actions
        class="bg-yellow text-black text-center"
      >
        <q-icon size="xl" name="warning" />
        <span
          ><br />Your license is currently inactive, usually due to a payment
          issue.<br /><br />To restore access, please update your payment
          method.<br /><br />
          If you’ve intentionally cancelled your sponsorship, you can remove
          your license key to stop seeing this message.<br /><br />
          If you need help, please contact our support team at
          <a
            href="https://support.amidaware.com"
            target="_blank"
            rel="noopener"
            class="text-primary"
            >https://support.amidaware.com</a
          ><br /><br
        /></span>
        <q-btn
          color="dark"
          icon="refresh"
          label="Refresh"
          @click="$store.dispatch('reload')"
        />
      </q-banner>
      <q-toolbar>
        <q-btn
          dense
          flat
          round
          class="app-icon-btn q-mr-xs"
          :icon="panelIcon"
          @click="toggleNav"
        >
          <q-tooltip>{{
            $q.screen.lt.md
              ? "Menu"
              : miniNav
                ? "Expand sidebar"
                : "Collapse sidebar"
          }}</q-tooltip>
        </q-btn>

        <!-- breadcrumb -->
        <nav class="app-crumbs">
          <router-link
            v-if="$route.name !== 'Dashboard'"
            :to="{ name: 'Dashboard' }"
            class="app-crumbs__link"
            >Dashboard</router-link
          >
          <span v-else class="app-crumbs__link">Dashboard</span>
          <template v-for="crumb in crumbs" :key="crumb">
            <q-icon name="chevron_right" size="14px" class="app-crumbs__sep" />
            <span class="app-crumbs__link">{{ crumb }}</span>
          </template>
        </nav>

        <q-btn
          v-if="$route.name === 'Dashboard'"
          dense
          flat
          round
          size="sm"
          class="app-icon-btn q-ml-xs"
          icon="refresh"
          @click="$store.dispatch('refreshDashboard')"
        >
          <q-tooltip>Refresh</q-tooltip>
        </q-btn>

        <!-- update check -->
        <q-chip
          v-if="updateAvailable"
          class="app-header-chip"
          :color="dash_warning_color"
          text-color="black"
          icon="update"
          dense
          ><a :href="latestReleaseURL" target="_blank"
            >v{{ latestTRMMVersion }} available</a
          ></q-chip
        >
        <!-- cert expiring soon check -->
        <q-chip
          v-if="daysUntilCertExpires <= 15"
          class="app-header-chip"
          dense
          :color="dash_negative_color"
          text-color="white"
          icon="warning"
          >SSL certificate expires in {{ daysUntilCertExpires }} days</q-chip
        >

        <q-space />

        <!-- agent status -->
        <div class="app-stat-group q-mr-xs">
          <div class="app-stat">
            <span class="app-dot app-dot--online" />
            <span class="app-stat__num">{{
              serverCount +
              workstationCount -
              serverOfflineCount -
              workstationOfflineCount
            }}</span>
            <span class="app-stat__label gt-sm">Online</span>
          </div>
          <div class="app-stat">
            <span class="app-dot app-dot--offline" />
            <span class="app-stat__num">{{
              serverOfflineCount + workstationOfflineCount
            }}</span>
            <span class="app-stat__label gt-sm">Offline</span>
          </div>
          <div class="app-stat">
            <q-icon name="devices" size="15px" color="primary" />
            <span class="app-stat__num">{{
              serverCount + workstationCount
            }}</span>
            <span class="app-stat__label gt-sm">Agents</span>
          </div>
          <q-tooltip :delay="600" anchor="bottom middle" self="top middle"
            >Agent Count</q-tooltip
          >
          <q-menu>
            <q-list dense style="min-width: 200px">
              <q-item-label header>Servers</q-item-label>
              <q-item>
                <q-item-section avatar>
                  <q-icon name="dns" size="sm" color="primary" />
                </q-item-section>
                <q-item-section no-wrap>
                  <q-item-label>Total: {{ serverCount }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section avatar>
                  <q-icon
                    name="power_off"
                    size="sm"
                    :color="dash_negative_color"
                  />
                </q-item-section>
                <q-item-section no-wrap>
                  <q-item-label>Offline: {{ serverOfflineCount }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item-label header>Workstations</q-item-label>
              <q-item>
                <q-item-section avatar>
                  <q-icon name="computer" size="sm" color="primary" />
                </q-item-section>
                <q-item-section no-wrap>
                  <q-item-label>Total: {{ workstationCount }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section avatar>
                  <q-icon
                    name="power_off"
                    size="sm"
                    :color="dash_negative_color"
                  />
                </q-item-section>
                <q-item-section no-wrap>
                  <q-item-label
                    >Offline: {{ workstationOfflineCount }}</q-item-label
                  >
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </div>

        <!-- web terminal button -->
        <q-btn
          v-if="!hosted"
          dense
          flat
          round
          class="app-icon-btn"
          icon="terminal"
          @click="openWebTerm"
        >
          <q-tooltip>Web Terminal</q-tooltip>
        </q-btn>

        <!-- dark mode toggle -->
        <q-btn
          dense
          flat
          round
          class="app-icon-btn"
          :icon="darkMode ? 'light_mode' : 'dark_mode'"
          @click="darkMode = !darkMode"
        >
          <q-tooltip>{{
            darkMode ? "Switch to light mode" : "Switch to dark mode"
          }}</q-tooltip>
        </q-btn>

        <AlertsIcon />

        <q-btn-dropdown
          flat
          no-caps
          dense
          dropdown-icon="expand_more"
          class="app-user-btn q-ml-xs"
        >
          <template v-slot:label>
            <div class="row items-center no-wrap q-gutter-x-sm">
              <div class="app-avatar">{{ initials }}</div>
              <div class="gt-xs app-user-text">
                <div class="app-user-text__name">{{ displayName || "" }}</div>
                <div class="app-user-text__sub">{{ username || "" }}</div>
              </div>
            </div>
          </template>
          <q-list dense style="min-width: 180px">
            <q-item
              clickable
              v-ripple
              @click="showUserPreferences"
              v-close-popup
            >
              <q-item-section avatar>
                <q-icon name="tune" size="xs" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Preferences</q-item-label>
              </q-item-section>
            </q-item>
            <q-item clickable>
              <q-item-section avatar>
                <q-icon name="person" size="xs" />
              </q-item-section>
              <q-item-section>Account</q-item-section>
              <q-item-section side>
                <q-icon name="keyboard_arrow_right" />
              </q-item-section>

              <q-menu anchor="top end" self="top start">
                <q-list dense>
                  <q-item
                    clickable
                    v-ripple
                    @click="resetPassword"
                    v-close-popup
                  >
                    <q-item-section>
                      <q-item-label>Reset Password</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item clickable v-ripple @click="reset2FA" v-close-popup>
                    <q-item-section>
                      <q-item-label>Reset 2FA</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-item>
            <q-separator class="q-my-xs" />
            <q-item to="/expired" exact>
              <q-item-section avatar>
                <q-icon name="logout" size="xs" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Logout</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </q-toolbar>
    </q-header>
    <q-drawer
      v-model="drawer"
      show-if-above
      :width="252"
      :mini="miniNav && !$q.screen.lt.md"
      :mini-width="68"
      :breakpoint="1023"
      class="app-drawer"
    >
      <FileBar />
    </q-drawer>
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>
<script setup lang="ts">
// composition imports
import { computed, onMounted, onBeforeUnmount, ref } from "vue";
import { useQuasar } from "quasar";
import { useRoute } from "vue-router";
import { useStore } from "vuex";
import { useDashboardStore } from "@/stores/dashboard";
import { useAuthStore } from "@/stores/auth";
import { storeToRefs } from "pinia";
import { resetTwoFactor } from "@/api/accounts";
import { notifyError, notifySuccess } from "@/utils/notify";
import axios from "axios";

// webtermn
import { checkWebTermPerms, openWebTerminal } from "@/api/core";

// ui imports
import AlertsIcon from "@/components/AlertsIcon.vue";
import FileBar from "@/components/FileBar.vue";
import { navIcon } from "@/utils/iconMap";
import UserPreferences from "@/components/modals/coresettings/UserPreferences.vue";
import ResetPass from "@/components/accounts/ResetPass.vue";

const store = useStore();
const $q = useQuasar();

const {
  serverCount,
  serverOfflineCount,
  workstationCount,
  workstationOfflineCount,
  daysUntilCertExpires,
} = storeToRefs(useDashboardStore());

const { displayName, username } = storeToRefs(useAuthStore());
const route = useRoute();
const drawer = ref(false);
const panelIcon = navIcon("panel");

// collapsed sidebar is remembered per browser
const miniNav = ref(false);
try {
  miniNav.value = localStorage.getItem("cd_nav_mini") === "1";
} catch {}

function toggleNav() {
  if ($q.screen.lt.md) {
    drawer.value = !drawer.value;
    return;
  }
  miniNav.value = !miniNav.value;
  try {
    localStorage.setItem("cd_nav_mini", miniNav.value ? "1" : "0");
  } catch {}
}

// breadcrumb trail: selected client / site, or the agent page
const crumbs = computed(() => {
  if (route.name === "Agent") return ["Agent details"];
  const selected = store.state.selectedTree;
  if (!selected) return ["All clients"];
  for (const client of store.state.tree) {
    if (client.raw === selected) return [client.label];
    for (const site of client.children || []) {
      if (site.raw === selected) return [client.label, site.label];
    }
  }
  return [];
});

const initials = computed(() => {
  const name = (displayName.value || "").trim();
  if (!name) return "?";
  const parts = name.split(/[\s._-]+/).filter(Boolean);
  return parts
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");
});

const darkMode = computed({
  get: () => {
    return $q.dark.isActive;
  },
  set: (value) => {
    axios.patch("/accounts/users/ui/", { dark_mode: value });
    $q.dark.set(value);
  },
});

const currentTRMMVersion = computed(() => store.state.currentTRMMVersion);
const latestTRMMVersion = computed(() => store.state.latestTRMMVersion);
const needRefresh = computed(() => store.state.needrefresh);
const hosted = computed(() => store.state.hosted);
const tokenExpired = computed(() => store.state.tokenExpired);
const dash_warning_color = computed(() => store.state.dash_warning_color);
const dash_negative_color = computed(() => store.state.dash_negative_color);

const latestReleaseURL = computed(() => {
  return latestTRMMVersion.value
    ? `https://github.com/amidaware/tacticalrmm/releases/tag/v${latestTRMMVersion.value}`
    : "";
});

function showUserPreferences() {
  $q.dialog({
    component: UserPreferences,
  }).onOk(() => store.dispatch("getDashInfo"));
}

function resetPassword() {
  $q.dialog({
    component: ResetPass,
  });
}

function reset2FA() {
  $q.dialog({
    title: "Reset 2FA",
    message: "Are you sure you would like to reset your 2FA token?",
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      const ret = await resetTwoFactor();
      notifySuccess(ret, 3000);
    } catch {}
  });
}

async function openWebTerm() {
  try {
    const { message, status } = await checkWebTermPerms();
    if (status === 412) {
      notifyError(message);
    } else {
      openWebTerminal();
    }
  } catch (e) {
    console.error(e);
  }
}

const updateAvailable = computed(() => {
  if (
    latestTRMMVersion.value === "error" ||
    hosted.value ||
    currentTRMMVersion.value?.includes("-dev")
  )
    return false;
  return currentTRMMVersion.value !== latestTRMMVersion.value;
});

const poll = ref(null);

function livePoll() {
  poll.value = setInterval(
    () => {
      store.dispatch("checkVer");
      store.dispatch("getDashInfo", false);
    },
    60 * 4 * 1000,
  );
}

onMounted(() => {
  store.dispatch("getDashInfo");
  store.dispatch("checkVer");
  livePoll();
});

onBeforeUnmount(() => {
  clearInterval(poll.value);
});
</script>
