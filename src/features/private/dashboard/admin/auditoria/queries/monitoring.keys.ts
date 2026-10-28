import type {
    EnergyAlertListParams,
    EnergyRecordListParams,
    AuditListParams,
} from "../validations";

export const adminMonitoringKeys = {
    allAlerts: ["admin-energy-alerts"] as const,
    alertsLists: () => [...adminMonitoringKeys.allAlerts, "list"] as const,
    alertsList: (params: EnergyAlertListParams) =>
        [...adminMonitoringKeys.alertsLists(), params] as const,

    allRecords: ["admin-energy-records"] as const,
    recordsLists: () => [...adminMonitoringKeys.allRecords, "list"] as const,
    recordsList: (params: EnergyRecordListParams) =>
        [...adminMonitoringKeys.recordsLists(), params] as const,

    allAudits: ["admin-audits"] as const,
    auditsLists: () => [...adminMonitoringKeys.allAudits, "list"] as const,
    auditsList: (params: AuditListParams) =>
        [...adminMonitoringKeys.auditsLists(), params] as const,
};
