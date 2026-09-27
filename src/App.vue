<template>
  <router-view />
</template>

<script>
import iconMapFn from "@/utils/iconMap";

export default {
  name: "App",
  created() {
    // swap Material / Font Awesome icons for the Lucide set
    this.$q.iconMapFn = iconMapFn;
  },
};
</script>

<style lang="sass">
body
  overflow-y: hidden

a
  color: var(--q-primary)

.tbl-sticky
  thead tr th
    position: sticky
    z-index: 1
  thead tr:first-child th
    top: 0

.tabs-tbl-sticky

  thead tr th
    position: sticky
    z-index: 1
  thead tr:first-child th
    top: 0

.remote-bg-tbl-sticky
  max-height: 70vh

  thead tr th
    position: sticky
    z-index: 1
  thead tr:first-child th
    top: 0

.audit-mgr-tbl-sticky
  max-height: 75vh

  thead tr th
    position: sticky
    z-index: 1
  thead tr:first-child th
    top: 0

.settings-tbl-sticky
  max-height: 60vh

  thead tr th
    position: sticky
    z-index: 1
  thead tr:first-child th
    top: 0

.agents-tbl-sticky
  thead tr th
    position: sticky
    z-index: 1
  thead tr:first-child th
    top: 0

.table-bgcolor
  .q-table__top,
  .q-table__bottom,
  thead tr:first-child th
    background-color: var(--app-surface-2, #f8f9fc)

.table-bgcolor-dark
  .q-table__top,
  .q-table__bottom,
  thead tr:first-child th
    background-color: var(--app-surface-2, #10151d)

.bg-dark
  background-color: --q-page-dark

.bg-light
  background-color: #ffffff

.highlight
  background-color: var(--app-selected-strong, #dfe3ff)
  td:first-child
    box-shadow: inset 3px 0 0 var(--app-amber, #F5B84F)

.highlight-dark
  background-color: var(--app-selected-strong, #2a3050)
  td:first-child
    box-shadow: inset 3px 0 0 var(--app-amber, #F5B84F)

.action-completed
  background-color: $positive

.agent-offline
  background: gray !important

.agent-overdue
  background: red !important

.min-width
  min-width: 0px !important
</style>
