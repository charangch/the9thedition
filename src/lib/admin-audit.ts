import { createInsForgeServerClient } from "@/lib/insforge-server";

export async function logAdminAction(params: {
  accessToken: string;
  adminUserId: string;
  action: string;
  entityType: string;
  entityId: string;
  payload?: Record<string, unknown>;
}) {
  const client = createInsForgeServerClient(params.accessToken);
  await client.database.from("admin_audit_log").insert([
    {
      admin_user_id: params.adminUserId,
      action: params.action,
      entity_type: params.entityType,
      entity_id: params.entityId,
      payload: params.payload ?? {},
    },
  ]);
}
