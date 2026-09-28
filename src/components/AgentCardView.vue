<template>
  <div ref="root" class="app-cardview" :class="{ 'is-resizing': resizing }">
    <!-- cards -->
    <div ref="scrollArea" class="app-cardview__cards scroll-y">
      <div class="app-cardview__bar">
        <div class="app-cardview__count">
          <b>{{ sorted.length }}</b>
          {{ sorted.length === 1 ? "agent" : "agents" }}
          <span v-if="search && sorted.length !== agents.length">
            · filtered from {{ agents.length }}</span
          >
        </div>
        <q-btn
          flat
          dense
          no-caps
          size="sm"
          class="app-cardview__sort"
          :icon="icons.sort"
          :label="`Sort: ${sortLabel}`"
        >
          <q-menu auto-close>
            <q-list dense style="min-width: 190px">
              <q-item
                v-for="opt in sortOptions"
                :key="opt.value"
                clickable
                :active="sortBy === opt.value"
                @click="sortBy = opt.value"
              >
                <q-item-section>{{ opt.label }}</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </div>

      <div v-if="agentTableLoading && agents.length === 0" class="app-cardview__empty">
        <q-spinner size="28px" color="primary" />
      </div>
      <div v-else-if="sorted.length === 0" class="app-cardview__empty">
        No agents
      </div>

      <q-infinite-scroll
        v-else
        :offset="400"
        :disable="shown >= sorted.length"
        @load="loadMore"
      >
        <div class="app-cardview__grid">
          <div
            v-for="agent in displayed"
            :key="agent.agent_id"
            :data-agent="agent.agent_id"
            class="app-acard"
            :class="{
              'app-acard--selected': agent.agent_id === selectedRow,
            }"
            tabindex="0"
            role="button"
            @click="select(agent)"
            @keydown.enter="select(agent)"
            @dblclick="doubleClicked(agent)"
            @contextmenu="select(agent)"
          >
            <q-menu context-menu>
              <AgentActionMenu :agent="agent" />
            </q-menu>

            <div class="app-acard__top">
              <div class="app-acard__tile">
                <q-icon
                  :name="
                    agent.monitoring_type === 'server'
                      ? icons.server
                      : icons.workstation
                  "
                  size="18px"
                />
              </div>
              <div class="app-acard__title">
                <div class="app-acard__host">{{ agent.hostname }}</div>
                <div class="app-acard__where">
                  {{ agent.client_name }} · {{ agent.site_name }}
                </div>
              </div>
              <span class="app-pill" :class="`app-pill--${agent.status}`">
                <span class="app-pill__dot" />{{ statusLabel(agent.status) }}
              </span>
              <q-btn
                flat
                dense
                round
                size="sm"
                :icon="icons.more"
                class="app-acard__more"
                @click.stop="select(agent)"
              >
                <q-menu>
                  <AgentActionMenu :agent="agent" />
                </q-menu>
              </q-btn>
            </div>

            <div v-if="agent.description" class="app-acard__desc">
              {{ agent.description }}
            </div>

            <div class="app-acard__meta">
              <div class="app-acard__meta-item">
                <q-icon :name="icons.user" size="14px" />
                <span
                  :class="{ 'text-italic': agent.italic }"
                  class="ellipsis"
                  >{{ agent.logged_username || "No user" }}</span
                >
                <q-tooltip :delay="500">Logged in user</q-tooltip>
              </div>
              <div class="app-acard__meta-item">
                <q-icon :name="osIcon(agent.plat)" size="14px" />
                <span class="ellipsis">{{ osLabel(agent.plat) }}</span>
              </div>
              <div class="app-acard__meta-item">
                <q-icon :name="icons.clock" size="14px" />
                <span class="ellipsis">{{ lastSeen(agent.last_seen) }}</span>
                <q-tooltip :delay="500"
                  >Last response: {{ formatDate(agent.last_seen) }}</q-tooltip
                >
              </div>
              <div class="app-acard__meta-item">
                <q-icon :name="icons.boot" size="14px" />
                <span class="ellipsis">{{ bootTime(agent.boot_time) }}</span>
                <q-tooltip :delay="500">Last boot</q-tooltip>
              </div>
            </div>

            <div v-if="tags(agent).length" class="app-acard__tags">
              <span
                v-for="tag in tags(agent)"
                :key="tag.key"
                class="app-tag"
                :class="[`app-tag--${tag.tone}`, { 'cursor-pointer': tag.click }]"
                @click.stop="tag.click ? tag.click() : select(agent)"
              >
                <q-icon :name="tag.icon" size="13px" />{{ tag.label }}
              </span>
            </div>
          </div>
        </div>
        <template v-slot:loading>
          <div class="row justify-center q-my-md">
            <q-spinner-dots color="primary" size="32px" />
          </div>
        </template>
      </q-infinite-scroll>
    </div>

    <!-- details side panel -->
    <div
      v-if="selectedRow"
      class="app-agent-panel"
      :style="$q.screen.lt.md ? {} : { width: `${panelWidth}px` }"
    >
      <div
        v-if="!$q.screen.lt.md"
        class="app-agent-panel__resize"
        @pointerdown="startResize"
      >
        <q-tooltip :delay="800">Drag to resize</q-tooltip>
      </div>
      <div class="app-agent-panel__head">
        <div class="app-acard__tile">
          <q-icon
            :name="
              selectedAgent && selectedAgent.monitoring_type === 'server'
                ? icons.server
                : icons.workstation
            "
            size="18px"
          />
        </div>
        <div class="app-acard__title">
          <div class="app-agent-panel__title ellipsis">
            {{ selectedAgent ? selectedAgent.hostname : "Agent details" }}
          </div>
          <div v-if="selectedAgent" class="app-acard__where">
            {{ selectedAgent.client_name }} · {{ selectedAgent.site_name }}
          </div>
        </div>
        <span
          v-if="selectedAgent"
          class="app-pill"
          :class="`app-pill--${selectedAgent.status}`"
        >
          <span class="app-pill__dot" />{{ statusLabel(selectedAgent.status) }}
        </span>
        <q-btn
          flat
          dense
          round
          class="app-icon-btn"
          :icon="icons.maximize"
          @click="openFullPage"
        >
          <q-tooltip>Open full page</q-tooltip>
        </q-btn>
        <q-btn flat dense round class="app-icon-btn" icon="close" @click="close">
          <q-tooltip>Close (Esc)</q-tooltip>
        </q-btn>
      </div>
      <SubTableTabs :style="{ height: `${bodyHeight}px` }" />
    </div>
  </div>
</template>

<script>
import mixins from "@/mixins/mixins";
import { mapState } from "vuex";
import AgentActionMenu from "@/components/agents/AgentActionMenu.vue";
import SubTableTabs from "@/components/SubTableTabs.vue";
import EditAgent from "@/components/modals/agents/EditAgent.vue";
import PendingActions from "@/components/logs/PendingActions.vue";
import { runURLAction } from "@/api/core";
import { runTakeControl, runRemoteBackground } from "@/api/agents";
import { filterAgents, agentCellValue } from "@/utils/agentFilter";
import { navIcon } from "@/utils/iconMap";

const PAGE_SIZE = 60;
// dashboard header (56) + summary cards (96) + agent toolbar (44)
const CHROME_HEIGHT = 196;
// details panel title bar
const PANEL_HEAD_HEIGHT = 61;

function readPref(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v === null ? fallback : v;
  } catch {
    return fallback;
  }
}

function writePref(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // storage unavailable: preference just isn't remembered
  }
}

export default {
  name: "AgentCardView",
  components: { AgentActionMenu, SubTableTabs },
  mixins: [mixins],
  inject: ["refreshDashboard"],
  props: ["agents", "columns", "search", "visibleColumns"],
  data() {
    return {
      shown: PAGE_SIZE,
      sortBy: readPref("cd_card_sort", "hostname"),
      panelWidth: parseInt(readPref("cd_card_panel_w", "640"), 10) || 640,
      resizing: false,
      sortOptions: [
        { value: "hostname", label: "Hostname" },
        { value: "status", label: "Status (problems first)" },
        { value: "last_seen", label: "Last response" },
        { value: "client", label: "Client & site" },
      ],
      icons: {
        sort: navIcon("sort"),
        server: navIcon("server"),
        workstation: navIcon("workstation"),
        more: navIcon("more"),
        user: navIcon("user"),
        clock: navIcon("clock"),
        boot: navIcon("boot"),
        maximize: navIcon("maximize"),
        failing: navIcon("failing"),
        warning: navIcon("warning"),
        ok: navIcon("ok"),
        patches: navIcon("patches"),
        reboot: navIcon("reboot"),
        pending: navIcon("pending"),
        maint: navIcon("maint"),
      },
    };
  },
  computed: {
    ...mapState([
      "selectedRow",
      "agentTableLoading",
      "agentDblClickAction",
      "agentUrlAction",
    ]),
    formatDate() {
      return this.$store.getters.formatDate;
    },
    searchColumns() {
      return (this.columns || []).filter((c) =>
        (this.visibleColumns || []).includes(c.name),
      );
    },
    filtered() {
      return filterAgents(
        this.agents || [],
        this.search,
        this.searchColumns,
        agentCellValue,
      );
    },
    sorted() {
      const list = [...this.filtered];
      const byHost = (a, b) =>
        (a.hostname || "").localeCompare(b.hostname || "", undefined, {
          numeric: true,
        });
      const rank = { overdue: 0, offline: 1, online: 2 };
      switch (this.sortBy) {
        case "status":
          return list.sort(
            (a, b) =>
              (rank[a.status] ?? 3) - (rank[b.status] ?? 3) ||
              (b.checks?.failing || 0) - (a.checks?.failing || 0) ||
              byHost(a, b),
          );
        case "last_seen":
          return list.sort(
            (a, b) =>
              (Date.parse(b.last_seen) || 0) - (Date.parse(a.last_seen) || 0),
          );
        case "client":
          return list.sort(
            (a, b) =>
              (a.client_name || "").localeCompare(b.client_name || "") ||
              (a.site_name || "").localeCompare(b.site_name || "") ||
              byHost(a, b),
          );
        default:
          return list.sort(byHost);
      }
    },
    displayed() {
      return this.sorted.slice(0, this.shown);
    },
    sortLabel() {
      const opt = this.sortOptions.find((o) => o.value === this.sortBy);
      return opt ? opt.label.replace(" (problems first)", "") : "Hostname";
    },
    selectedAgent() {
      return (this.agents || []).find((a) => a.agent_id === this.selectedRow);
    },
    bodyHeight() {
      return Math.max(
        240,
        this.$q.screen.height - CHROME_HEIGHT - PANEL_HEAD_HEIGHT,
      );
    },
  },
  watch: {
    search() {
      this.resetList();
    },
    sortBy(val) {
      writePref("cd_card_sort", val);
      this.resetList();
    },
    bodyHeight: {
      immediate: true,
      handler(h) {
        // sizes the tables inside the detail tabs to fit the side panel
        this.$store.commit("SET_SPLITTER", h);
      },
    },
    selectedRow(id) {
      if (id) this.$nextTick(() => this.revealCard(id));
    },
  },
  mounted() {
    window.addEventListener("keydown", this.onKeydown);
  },
  beforeUnmount() {
    window.removeEventListener("keydown", this.onKeydown);
    this.stopResize();
  },
  methods: {
    resetList() {
      this.shown = PAGE_SIZE;
      if (this.$refs.scrollArea) this.$refs.scrollArea.scrollTop = 0;
    },
    loadMore(index, done) {
      this.shown += PAGE_SIZE;
      done();
    },
    select(agent) {
      this.$store.commit("setActiveRow", agent.agent_id);
      this.$store.commit("setAgentPlatform", agent.plat);
    },
    close() {
      this.$store.commit("destroySubTable");
    },
    openFullPage() {
      if (this.selectedRow) {
        this.$router.push({
          name: "Agent",
          params: { agent_id: this.selectedRow },
        });
      }
    },
    revealCard(id) {
      const el = this.$refs.root?.querySelector(`[data-agent="${id}"]`);
      if (el) el.scrollIntoView({ block: "nearest", behavior: "smooth" });
    },
    onKeydown(e) {
      if (e.key !== "Escape" || !this.selectedRow) return;
      // leave Esc to any open dialog or menu first
      if (document.querySelector(".q-dialog, .q-menu")) return;
      this.close();
    },
    statusLabel(status) {
      if (status === "online") return "Online";
      if (status === "overdue") return "Overdue";
      if (status === "offline") return "Offline";
      return status || "Unknown";
    },
    osIcon(plat) {
      if (plat === "linux") return "mdi-linux";
      if (plat === "darwin") return "mdi-apple";
      return "mdi-microsoft-windows";
    },
    osLabel(plat) {
      if (plat === "linux") return "Linux";
      if (plat === "darwin") return "macOS";
      if (plat === "windows") return "Windows";
      return plat || "Unknown OS";
    },
    lastSeen(value) {
      const t = Date.parse(value);
      return Number.isNaN(t) ? "Never" : this.bootTime(t / 1000);
    },
    tags(agent) {
      const out = [];
      const checks = agent.checks || {};
      if (agent.maintenance_mode) {
        out.push({
          key: "maint",
          tone: "green",
          icon: this.icons.maint,
          label: "Maintenance",
        });
      } else if (checks.failing > 0) {
        out.push({
          key: "checks",
          tone: "red",
          icon: this.icons.failing,
          label: `${checks.failing} failing`,
        });
      } else if (checks.warning > 0) {
        out.push({
          key: "checks",
          tone: "amber",
          icon: this.icons.warning,
          label: `${checks.warning} warning`,
        });
      } else if (checks.total > 0) {
        out.push({
          key: "checks",
          tone: "green",
          icon: this.icons.ok,
          label: "Checks OK",
        });
      }
      if (agent.has_patches_pending) {
        out.push({
          key: "patches",
          tone: "amber",
          icon: this.icons.patches,
          label: "Patches pending",
        });
      }
      if (agent.needs_reboot) {
        out.push({
          key: "reboot",
          tone: "amber",
          icon: this.icons.reboot,
          label: "Reboot needed",
        });
      }
      if (agent.pending_actions_count > 0) {
        out.push({
          key: "actions",
          tone: "neutral",
          icon: this.icons.pending,
          label: `${agent.pending_actions_count} pending`,
          click: () => this.showPendingActions(agent),
        });
      }
      return out;
    },
    showPendingActions(agent) {
      this.$q.dialog({
        component: PendingActions,
        componentProps: { agent: agent },
      });
    },
    // same behaviour as double-clicking a row in the agent table
    doubleClicked(agent) {
      this.select(agent);
      this.$q.loading.show();
      setTimeout(() => {
        this.$q.loading.hide();
        switch (this.agentDblClickAction) {
          case "editagent":
            this.showEditAgent(agent.agent_id);
            break;
          case "takecontrol":
            runTakeControl(agent.agent_id);
            break;
          case "remotebg":
            runRemoteBackground(agent.agent_id, agent.plat);
            break;
          case "urlaction":
            runURLAction({
              agent_id: agent.agent_id,
              action: this.agentUrlAction,
            });
            break;
        }
      }, 500);
    },
    showEditAgent(agent_id) {
      this.$q
        .dialog({
          component: EditAgent,
          componentProps: { agent_id: agent_id },
        })
        .onOk(() => {
          this.refreshDashboard();
          this.$store.commit("setRefreshSummaryTab", true);
        });
    },
    startResize(e) {
      e.preventDefault();
      this.resizing = true;
      window.addEventListener("pointermove", this.onResize);
      window.addEventListener("pointerup", this.stopResize);
    },
    onResize(e) {
      const rect = this.$refs.root.getBoundingClientRect();
      const max = Math.max(420, rect.width - 320);
      const width = Math.round(rect.right - e.clientX);
      this.panelWidth = Math.min(max, Math.max(420, width));
    },
    stopResize() {
      if (!this.resizing) return;
      this.resizing = false;
      window.removeEventListener("pointermove", this.onResize);
      window.removeEventListener("pointerup", this.stopResize);
      writePref("cd_card_panel_w", String(this.panelWidth));
    },
  },
};
</script>
