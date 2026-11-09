import { memoryStore, saveStoreToDisk } from './db.service.js';

export interface AuditEntry {
  id: string;
  timestamp: string; // ISO 8601 (UTC)
  actorType: 'ADMIN' | 'USER' | 'SYSTEM' | 'ANONYMOUS';
  actorId: string | null;
  action: string;
  targetType?: string;
  targetId?: string;
  status: 'SUCCESS' | 'FAILURE';
  ip?: string;
  details?: Record<string, unknown>;
}

const MAX_AUDIT_ENTRIES = 5000;

export function recordAudit(entry: Omit<AuditEntry, 'id' | 'timestamp'>): AuditEntry {
  const full: AuditEntry = {
    id: `aud-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
    ...entry,
  };
  memoryStore.auditLogs.unshift(full);
  if (memoryStore.auditLogs.length > MAX_AUDIT_ENTRIES) {
    memoryStore.auditLogs.length = MAX_AUDIT_ENTRIES;
  }
  saveStoreToDisk();
  return full;
}
