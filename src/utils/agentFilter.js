import { date } from "quasar";

// Shared agent search/filter used by the agent table and the card view.
// Supports free text plus "is:" filters (is:online, is:offline, is:overdue,
// is:expired, is:checksfailing, is:patchespending, is:actionspending,
// is:rebootneeded).
export function filterAgents(rows, terms, cols, cellValue) {
  const hiddenFields = [
    "version",
    "operating_system",
    "public_ip",
    "cpu_model",
    "graphics",
    "local_ips",
    "make_model",
    "physical_disks",
    "custom_fields",
    "serial_number",
  ];
  // quasar filter only does visible columns so this is a hack to add hidden columns we want to filter
  // originally I was modifying cols directly but this led to phantom colum so doing it this way now
  // https://github.com/amidaware/tacticalrmm/issues/1264
  const allColumns = [...cols, ...hiddenFields.map((field) => ({ field }))];

  const lowerTerms = terms ? terms.toLowerCase() : "";
  let advancedFilter = false;
  let availability = null;
  let checks = false;
  let patches = false;
  let actions = false;
  let reboot = false;
  let search = "";

  const params = lowerTerms.trim().split(" ");
  // parse search text and set variables
  params.forEach((param) => {
    if (param.includes("is:")) {
      advancedFilter = true;
      let filter = param.split(":")[1];
      if (filter === "patchespending") patches = true;
      if (filter === "actionspending") actions = true;
      else if (filter === "checksfailing") checks = true;
      else if (filter === "rebootneeded") reboot = true;
      else if (
        filter === "online" ||
        filter === "offline" ||
        filter === "expired" ||
        filter === "overdue"
      )
        availability = filter;
    } else {
      search = param + "";
    }
  });

  return rows.filter((row) => {
    if (advancedFilter) {
      if (checks && !row.checks.has_failing_checks) return false;
      if (patches && !row.has_patches_pending) return false;
      if (actions && row.pending_actions_count === 0) return false;
      if (reboot && !row.needs_reboot) return false;
      if (availability === "online" && row.status !== "online")
        return false;
      else if (availability === "offline" && row.status !== "offline")
        return false;
      else if (availability === "overdue" && row.status !== "overdue")
        return false;
      else if (availability === "expired") {
        let now = new Date();
        let last_seen = new Date(row.last_seen);
        let diff = date.getDateDiff(now, last_seen, "days");
        if (diff < 30) return false;
      }
    }

    // Normal text filter
    return allColumns.some((col) => {
      let valObj = cellValue(col, row);
      if (Array.isArray(valObj)) {
        valObj = valObj.map((item) => (item.value ? item.value : item));
      }
      const val = valObj + "";
      const haystack =
        val === "undefined" || val === "null" ? "" : val.toLowerCase();
      return haystack.indexOf(search) !== -1;
    });
  });
}

// Same cell lookup Quasar's q-table uses for its filter.
export function agentCellValue(col, row) {
  const val = typeof col.field === "function" ? col.field(row) : row[col.field];
  return col.format !== undefined ? col.format(val, row) : val;
}
