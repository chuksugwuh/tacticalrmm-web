<template>
  <q-layout>
    <q-page-container>
      <q-page class="flex bg-image flex-center">
        <q-card
          class="login-card"
          v-bind:style="$q.screen.lt.sm ? { width: '90%' } : { width: '400px' }"
        >
          <q-card-section class="q-pt-xl q-pb-sm">
            <div class="column items-center text-center">
              <img
                class="login-logo"
                src="@/assets/brand/logo.png"
                alt="Carpe Diem Technology Services"
              />
              <div class="login-title q-mt-lg">Carpe Diem RMM</div>
              <div class="login-subtitle">Sign in to your dashboard</div>
            </div>
          </q-card-section>
          <q-card-section>
            <q-form ref="form" @submit.prevent="checkCreds" class="q-gutter-md">
              <q-input
                outlined
                v-model="credentials.username"
                label="Username"
                autocomplete="username"
                lazy-rules
                :rules="[
                  (val) => (val && val.length > 0) || 'This field is required',
                ]"
              />
              <q-input
                v-model="credentials.password"
                outlined
                :type="showPassword ? 'password' : 'text'"
                label="Password"
                autocomplete="current-password"
                lazy-rules
                :rules="[
                  (val) => (val && val.length > 0) || 'This field is required',
                ]"
              >
                <template v-slot:append>
                  <q-icon
                    :name="showPassword ? 'visibility_off' : 'visibility'"
                    class="cursor-pointer"
                    @click="showPassword = !showPassword"
                  />
                </template>
              </q-input>
              <div>
                <q-btn
                  label="Sign in"
                  type="submit"
                  color="primary"
                  unelevated
                  no-caps
                  size="md"
                  class="full-width login-btn"
                />
              </div>
            </q-form>
          </q-card-section>

          <q-card-section v-if="ssoProviders?.length > 0">
            <div class="text-h6 text-center q-mb-md">Log in with SSO</div>
            <q-separator />

            <q-list dense bordered class="q-pa-sm">
              <q-item
                v-for="provider in ssoProviders"
                :key="provider.id"
                @click="openSSOProviderRedirect(provider.id)"
                clickable
                class="q-pa-xs hover-bg"
              >
                <q-item-section avatar>
                  <q-icon
                    :name="provider.icon ?? 'mdi-key'"
                    size="sm"
                    class="text-primary"
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ provider.name }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
          <div class="login-notice">
            Built on Tactical RMM &middot; &copy; AmidaWare LLC
          </div>
        </q-card>

        <!-- 2 factor modal -->
        <q-dialog persistent v-model="prompt">
          <q-card style="min-width: 400px">
            <q-form ref="formToken" @submit.prevent="onSubmit">
              <q-card-section class="text-center text-h6"
                >Two-Factor Token</q-card-section
              >

              <q-card-section>
                <q-input
                  autofocus
                  outlined
                  autocomplete="one-time-code"
                  v-model="twofactor"
                  inputmode="numeric"
                  :rules="[
                    (val) =>
                      (val && val.length > 0) || 'This field is required',
                  ]"
                />
              </q-card-section>

              <q-card-actions align="right" class="text-primary">
                <q-btn flat label="Cancel" v-close-popup />
                <q-btn flat label="Submit" type="submit" />
              </q-card-actions>
            </q-form>
          </q-card>
        </q-dialog>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { type QForm, useQuasar } from "quasar";
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "vue-router";
import {
  openSSOProviderRedirect,
  getSSOConfig,
  type SSOProviderConfig,
} from "@/ee/sso/api/sso";

// setup quasar
const $q = useQuasar();
$q.dark.set(true);

// setup auth store
const auth = useAuthStore();

// setup router
const router = useRouter();

const form = ref<QForm | null>(null);
const formToken = ref<QForm | null>(null);

// login logic
const credentials = reactive({ username: "", password: "" });
const twofactor = ref("");
const prompt = ref(false);
const showPassword = ref(true);
const ssoProviders = ref([] as SSOProviderConfig[]);

async function checkCreds() {
  try {
    const { totp } = await auth.checkCredentials(credentials);

    if (!totp) {
      router.push({ name: "TOTPSetup" });
    } else {
      twofactor.value = "";
      prompt.value = true;
    }
  } catch (err) {
    console.error(err);
  }
}

async function onSubmit() {
  try {
    await auth.login({ ...credentials, twofactor: twofactor.value });
    if (auth.next) {
      router.push(auth.next);
      auth.next = null;
    } else {
      router.push({ name: "Dashboard" });
    }
  } catch (err) {
    console.error(err);
  } finally {
    form.value?.reset();
    formToken.value?.reset();
    prompt.value = false;
  }
}

onMounted(async () => {
  try {
    const result = await getSSOConfig();
    ssoProviders.value = result.data.socialaccount.providers;
  } catch (e) {
    console.error(e);
  }
});
</script>

<style>
.bg-image {
  background-color: #0b0f17;
  background-image:
    radial-gradient(
      ellipse 60% 50% at 50% 0%,
      rgba(245, 165, 36, 0.28) 0%,
      rgba(245, 165, 36, 0) 70%
    ),
    radial-gradient(
      ellipse 40% 40% at 85% 90%,
      rgba(217, 119, 6, 0.12) 0%,
      rgba(217, 119, 6, 0) 70%
    ),
    linear-gradient(rgba(255, 255, 255, 0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.025) 1px, transparent 1px);
  background-size:
    auto,
    auto,
    32px 32px,
    32px 32px;
}
.login-card {
  border-radius: 18px;
  padding: 4px 8px 12px;
  box-shadow:
    0 24px 64px -12px rgba(0, 0, 0, 0.6),
    0 0 0 1px rgba(255, 255, 255, 0.06);
}
.login-logo {
  width: 240px;
  max-width: 80%;
  height: auto;
}
.login-title {
  font-size: 22px;
  font-weight: 650;
  letter-spacing: -0.02em;
}
.login-subtitle {
  font-size: 13.5px;
  color: var(--app-text-muted);
  margin-top: 2px;
}
.login-notice {
  text-align: center;
  font-size: 11px;
  color: var(--app-text-muted);
  opacity: 0.8;
  padding-top: 4px;
}
.login-btn {
  height: 42px;
  border-radius: 10px;
  font-weight: 600;
}
</style>
