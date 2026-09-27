<template>
  <div class="app-nav">
    <!-- brand -->
    <div class="app-nav__brand">
      <img
        class="app-nav__logo"
        src="@/assets/brand/mark.png"
        alt="Carpe Diem"
      />
      <div class="app-nav__brand-text">
        <div class="app-nav__brand-name">Carpe Diem</div>
        <div class="app-nav__brand-sub">
          Remote Management<span v-if="currentTRMMVersion">
            · v{{ currentTRMMVersion }}</span
          >
        </div>
      </div>
    </div>

    <!-- search -->
    <div
      class="app-nav__search"
      role="button"
      tabindex="0"
      @click="focusAgentSearch"
      @keydown.enter="focusAgentSearch"
    >
      <q-icon :name="icons.search" size="17px" />
      <span>Search agents…</span>
      <kbd>{{ isMac ? "⌘K" : "Ctrl K" }}</kbd>
    </div>

    <div class="app-nav__scroll">
      <!-- workspace -->
      <div class="app-nav__section">Workspace</div>
      <q-list class="app-nav__list">
        <q-item
          clickable
          :to="{ name: 'Dashboard' }"
          exact
          active-class="app-nav__item--active"
          class="app-nav__item"
        >
          <q-item-section avatar
            ><q-icon :name="icons.dashboard"
          /></q-item-section>
          <q-item-section>Dashboard</q-item-section>
        </q-item>
        <q-item clickable class="app-nav__item" @click="showPendingActions">
          <q-item-section avatar
            ><q-icon :name="icons.pending"
          /></q-item-section>
          <q-item-section>Pending actions</q-item-section>
        </q-item>
        <q-item clickable class="app-nav__item" @click="showAuditManager">
          <q-item-section avatar><q-icon :name="icons.audit" /></q-item-section>
          <q-item-section>Audit log</q-item-section>
        </q-item>
        <q-item clickable class="app-nav__item" @click="showDebugLog">
          <q-item-section avatar><q-icon :name="icons.debug" /></q-item-section>
          <q-item-section>Debug log</q-item-section>
        </q-item>
      </q-list>

      <!-- agents -->
      <div class="app-nav__section">Agents</div>
      <q-list class="app-nav__list">
        <q-item
          clickable
          class="app-nav__item"
          @click="showInstallAgent = true"
        >
          <q-item-section avatar
            ><q-icon :name="icons.install"
          /></q-item-section>
          <q-item-section>Install agent</q-item-section>
        </q-item>
        <q-item clickable class="app-nav__item" @click="showDeployments">
          <q-item-section avatar
            ><q-icon :name="icons.deploy"
          /></q-item-section>
          <q-item-section>Deployments</q-item-section>
        </q-item>
        <q-item
          clickable
          class="app-nav__item"
          @click="showUpdateAgentsModal = true"
        >
          <q-item-section avatar
            ><q-icon :name="icons.update"
          /></q-item-section>
          <q-item-section>Update agents</q-item-section>
        </q-item>
        <q-item clickable class="app-nav__item">
          <q-item-section avatar><q-icon :name="icons.bulk" /></q-item-section>
          <q-item-section>Bulk actions</q-item-section>
          <q-item-section side
            ><q-icon name="chevron_right" size="16px"
          /></q-item-section>
          <q-menu anchor="top end" self="top start" auto-close>
            <q-list dense style="min-width: 200px">
              <q-item clickable @click="showBulkAction('command')">
                <q-item-section>Bulk command</q-item-section>
              </q-item>
              <q-item clickable @click="showBulkAction('script')">
                <q-item-section>Bulk script</q-item-section>
              </q-item>
              <q-item clickable @click="showBulkAction('patch')">
                <q-item-section>Bulk patch management</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-item>
      </q-list>

      <!-- management -->
      <div class="app-nav__section">Management</div>
      <q-list class="app-nav__list">
        <q-item clickable class="app-nav__item" @click="showClientsManager">
          <q-item-section avatar
            ><q-icon :name="icons.clients"
          /></q-item-section>
          <q-item-section>Clients</q-item-section>
          <q-item-section side>
            <q-btn
              flat
              dense
              round
              size="sm"
              icon="add"
              class="app-nav__add"
              @click.stop
            >
              <q-tooltip>Add client or site</q-tooltip>
              <q-menu anchor="top end" self="top start" auto-close>
                <q-list dense style="min-width: 160px">
                  <q-item clickable @click="showAddClientModal">
                    <q-item-section>Add client</q-item-section>
                  </q-item>
                  <q-item clickable @click="showAddSiteModal">
                    <q-item-section>Add site</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </q-item-section>
        </q-item>
        <q-item clickable class="app-nav__item" @click="showScriptManager">
          <q-item-section avatar
            ><q-icon :name="icons.scripts"
          /></q-item-section>
          <q-item-section>Scripts</q-item-section>
        </q-item>
        <q-item clickable class="app-nav__item" @click="showAutomationManager">
          <q-item-section avatar
            ><q-icon :name="icons.automation"
          /></q-item-section>
          <q-item-section>Automation</q-item-section>
        </q-item>
        <q-item clickable class="app-nav__item" @click="showAlertsManager">
          <q-item-section avatar
            ><q-icon :name="icons.alerts"
          /></q-item-section>
          <q-item-section>Alerts</q-item-section>
        </q-item>
        <q-item clickable class="app-nav__item">
          <q-item-section avatar
            ><q-icon :name="icons.reporting"
          /></q-item-section>
          <q-item-section>Reporting</q-item-section>
          <q-item-section side
            ><q-icon name="chevron_right" size="16px"
          /></q-item-section>
          <q-menu anchor="top end" self="top start" auto-close>
            <q-list
              v-if="
                $integrations &&
                $integrations.fileBarIntegrations &&
                $integrations.fileBarIntegrations.length > 0
              "
              dense
              style="min-width: 180px"
            >
              <q-item
                v-for="integration in $integrations.fileBarIntegrations"
                :key="integration.name"
                @click="
                  integration.type === 'dialog'
                    ? $q.dialog({ component: integration.component })
                    : undefined
                "
                :to="integration.type === 'route' ? integration.uri : undefined"
                clickable
              >
                <q-item-section>{{ integration.name }}</q-item-section>
              </q-item>
            </q-list>
            <q-list v-else dense style="min-width: 180px">
              <q-item
                clickable
                @click="
                  notifyWarning(
                    'Reporting feature requires a Tier 2 or higher sponsorship. Please check the docs for more info.',
                    10000,
                  )
                "
              >
                <q-item-section>Reporting Manager</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-item>
      </q-list>

      <!-- administration -->
      <div class="app-nav__section">Administration</div>
      <q-list class="app-nav__list">
        <q-item
          clickable
          class="app-nav__item"
          @click="showAdminManager = true"
        >
          <q-item-section avatar><q-icon :name="icons.users" /></q-item-section>
          <q-item-section>User access</q-item-section>
        </q-item>
        <q-item
          clickable
          class="app-nav__item"
          @click="showPermissionsManager"
        >
          <q-item-section avatar
            ><q-icon :name="icons.permissions"
          /></q-item-section>
          <q-item-section>Permissions</q-item-section>
        </q-item>
        <q-item
          clickable
          class="app-nav__item"
          @click="showEditCoreSettingsModal = true"
        >
          <q-item-section avatar
            ><q-icon :name="icons.settings"
          /></q-item-section>
          <q-item-section>Global settings</q-item-section>
        </q-item>
        <q-item
          v-if="!hosted"
          clickable
          class="app-nav__item"
          @click="showCodeSign = true"
        >
          <q-item-section avatar
            ><q-icon :name="icons.codesign"
          /></q-item-section>
          <q-item-section>Code signing</q-item-section>
        </q-item>
        <q-item clickable class="app-nav__item">
          <q-item-section avatar
            ><q-icon :name="icons.maintenance"
          /></q-item-section>
          <q-item-section>Maintenance</q-item-section>
          <q-item-section side
            ><q-icon name="chevron_right" size="16px"
          /></q-item-section>
          <q-menu anchor="top end" self="top start" auto-close>
            <q-list dense style="min-width: 200px">
              <q-item clickable @click="showServerMaintenance = true">
                <q-item-section>Server maintenance</q-item-section>
              </q-item>
              <q-item clickable @click="clearCache">
                <q-item-section>Clear cache</q-item-section>
              </q-item>
              <q-item clickable @click="bulkRecoverAgents">
                <q-item-section>Recover all agents</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-item>
      </q-list>
    </div>

    <!-- help -->
    <div v-if="!hosted" class="app-nav__footer">
      <q-item clickable class="app-nav__item">
        <q-item-section avatar><q-icon :name="icons.help" /></q-item-section>
        <q-item-section>Help &amp; resources</q-item-section>
        <q-item-section side
          ><q-icon name="chevron_right" size="16px"
        /></q-item-section>
        <q-menu anchor="top end" self="bottom start" auto-close>
          <q-list dense style="min-width: 180px">
            <q-item clickable @click="openHelp('docs')">
              <q-item-section>Documentation</q-item-section>
            </q-item>
            <q-item clickable @click="openHelp('github')">
              <q-item-section>GitHub Repo</q-item-section>
            </q-item>
            <q-item clickable @click="openHelp('bug')">
              <q-item-section>Bug Report</q-item-section>
            </q-item>
            <q-item clickable @click="openHelp('feature')">
              <q-item-section>Feature Request</q-item-section>
            </q-item>
            <q-item clickable @click="openHelp('discord')">
              <q-item-section>Join Discord</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-item>
    </div>

    <!-- edit core settings modal -->
    <q-dialog v-model="showEditCoreSettingsModal">
      <EditCoreSettings @close="showEditCoreSettingsModal = false" />
    </q-dialog>
    <!-- Install Agents -->
    <q-dialog v-model="showInstallAgent">
      <InstallAgent @close="showInstallAgent = false" />
    </q-dialog>
    <!-- Update Agents Modal -->
    <q-dialog
      v-model="showUpdateAgentsModal"
      maximized
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <UpdateAgents @close="showUpdateAgentsModal = false" />
    </q-dialog>
    <!-- Admin Manager -->
    <q-dialog v-model="showAdminManager">
      <AdminManager @close="showAdminManager = false" />
    </q-dialog>
    <!-- Server Maintenance -->
    <q-dialog v-model="showServerMaintenance">
      <ServerMaintenance @close="showMaintenance = false" />
    </q-dialog>
    <!-- Code Sign -->
    <q-dialog v-model="showCodeSign">
      <CodeSign @close="showCodeSign = false" />
    </q-dialog>
  </div>
</template>

<script>
import mixins from "@/mixins/mixins";
import DialogWrapper from "@/components/ui/DialogWrapper.vue";
import DebugLog from "@/components/logs/DebugLog.vue";
import PendingActions from "@/components/logs/PendingActions.vue";
import ClientsManager from "@/components/clients/ClientsManager.vue";
import ClientsForm from "@/components/clients/ClientsForm.vue";
import SitesForm from "@/components/clients/SitesForm.vue";
import UpdateAgents from "@/components/modals/agents/UpdateAgents.vue";
import ScriptManager from "@/components/scripts/ScriptManager.vue";
import EditCoreSettings from "@/components/modals/coresettings/EditCoreSettings.vue";
import AlertsManager from "@/components/AlertsManager.vue";
import AutomationManager from "@/components/automation/AutomationManager.vue";
import AdminManager from "@/components/AdminManager.vue";
import InstallAgent from "@/components/modals/agents/InstallAgent.vue";
import AuditManager from "@/components/logs/AuditManager.vue";
import BulkAction from "@/components/modals/agents/BulkAction.vue";
import DeploymentTable from "@/components/clients/DeploymentTable.vue";
import ServerMaintenance from "@/components/modals/core/ServerMaintenance.vue";
import CodeSign from "@/components/modals/coresettings/CodeSign.vue";
import PermissionsManager from "@/components/accounts/PermissionsManager.vue";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { notifyWarning } from "@/utils/notify";
import { navIcon, lucide } from "@/utils/iconMap";

export default {
  name: "FileBar",
  mixins: [mixins],
  components: {
    UpdateAgents,
    EditCoreSettings,
    InstallAgent,
    AdminManager,
    ServerMaintenance,
    CodeSign,
  },
  data() {
    return {
      showServerMaintenance: false,
      showUpdateAgentsModal: false,
      showEditCoreSettingsModal: false,
      showAdminManager: false,
      showInstallAgent: false,
      showCodeSign: false,
      isMac: /Mac|iPhone|iPad/.test(navigator.platform || ""),
      icons: {
        search: lucide("search"),
        dashboard: navIcon("dashboard"),
        pending: navIcon("pending"),
        audit: navIcon("audit"),
        debug: navIcon("debug"),
        install: navIcon("install"),
        deploy: navIcon("deploy"),
        update: navIcon("update"),
        bulk: navIcon("bulk"),
        clients: navIcon("clients"),
        scripts: navIcon("scripts"),
        automation: navIcon("automation"),
        alerts: navIcon("alerts"),
        reporting: navIcon("reporting"),
        users: navIcon("users"),
        permissions: navIcon("permissions"),
        settings: navIcon("settings"),
        codesign: navIcon("codesign"),
        maintenance: navIcon("maintenance"),
        help: navIcon("help"),
      },
    };
  },
  computed: {
    hosted() {
      return this.$store.state.hosted;
    },
    currentTRMMVersion() {
      return this.$store.state.currentTRMMVersion;
    },
  },
  mounted() {
    window.addEventListener("keydown", this.onKeydown);
    window.addEventListener("cd:install-agent", this.openInstallAgent);
  },
  beforeUnmount() {
    window.removeEventListener("keydown", this.onKeydown);
    window.removeEventListener("cd:install-agent", this.openInstallAgent);
  },
  methods: {
    openInstallAgent() {
      this.showInstallAgent = true;
    },
    onKeydown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        this.focusAgentSearch();
      }
    },
    async focusAgentSearch() {
      if (this.$route.name !== "Dashboard") {
        await this.$router.push({ name: "Dashboard" });
      }
      this.$nextTick(() => {
        setTimeout(() => {
          const el = document.querySelector(".app-search input");
          if (el) el.focus();
        }, 50);
      });
    },
    clearCache() {
      this.$axios
        .get("/core/clearcache/")
        .then((r) => this.notifySuccess(r.data));
    },
    bulkRecoverAgents() {
      this.$q
        .dialog({
          title: "Bulk Recover All Agents?",
          message:
            "This will attempt to reinstall/repair the Tactical and Mesh Agents on all endpoints.",
          cancel: true,
        })
        .onOk(() => {
          this.$axios
            .get("/agents/bulkrecovery/")
            .then((r) => this.notifySuccess(r.data));
        });
    },
    openHelp(mode) {
      let url;
      switch (mode) {
        case "github":
          url = "https://github.com/amidaware/tacticalrmm/";
          break;
        case "docs":
          url = "https://docs.tacticalrmm.com";
          break;
        case "bug":
          url =
            "https://github.com/amidaware/tacticalrmm/issues/new?template=bug_report.md";
          break;
        case "feature":
          url =
            "https://github.com/amidaware/tacticalrmm/issues/new?template=feature_request.md";
          break;
        case "discord":
          url = "https://discord.gg/upGTkWp";
          break;
      }
      window.open(url, "_blank");
    },
    showAutomationManager() {
      this.$q.dialog({
        component: AutomationManager,
      });
    },
    showAlertsManager() {
      this.$q.dialog({
        component: AlertsManager,
      });
    },
    showClientsManager() {
      this.$q
        .dialog({
          component: ClientsManager,
        })
        .onDismiss(() => this.$store.dispatch("refreshDashboard", true));
    },
    showAddClientModal() {
      this.$q
        .dialog({
          component: ClientsForm,
        })
        .onOk(() => this.$store.dispatch("loadTree"));
    },
    showAddSiteModal() {
      this.$q
        .dialog({
          component: SitesForm,
        })
        .onOk(() => this.$store.dispatch("loadTree"));
    },
    showPermissionsManager() {
      this.$q.dialog({
        component: PermissionsManager,
      });
    },
    showAuditManager() {
      this.$q.dialog({
        component: DialogWrapper,
        componentProps: {
          vuecomponent: AuditManager,
          noCard: true,
          componentProps: {
            modal: true,
          },
          dialogProps: {
            maximized: true,
            ["transition-show"]: "slide-up",
            ["transition-hide"]: "slide-down",
          },
        },
      });
    },
    showScriptManager() {
      this.$q.dialog({
        component: ScriptManager,
      });
    },
    showBulkAction(mode) {
      this.$q.dialog({
        component: BulkAction,
        componentProps: {
          mode: mode,
        },
      });
    },
    showDebugLog() {
      this.$q.dialog({
        component: DialogWrapper,
        componentProps: {
          vuecomponent: DebugLog,
          noCard: true,
          componentProps: {
            modal: true,
          },
          dialogProps: {
            maximized: true,
            ["transition-show"]: "slide-up",
            ["transition-hide"]: "slide-down",
          },
        },
      });
    },
    showPendingActions() {
      this.$q.dialog({
        component: PendingActions,
      });
    },
    showDeployments() {
      this.$q.dialog({
        component: DeploymentTable,
      });
    },
    showReportsManager() {
      this.$q.dialog({
        component: ReportsManager,
      });
    },
  },
};
</script>
