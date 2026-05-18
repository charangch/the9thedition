/**
 * admin_publishing_queue.status values.
 * Legacy DB constraint (010): pending | review | published
 * After migration 022: also draft | ready | archived | deleted
 */
export const QUEUE_STATUS = {
  /** Work-in-progress (shown as "draft" in admin UI). */
  DRAFT: "pending",
  REVIEW: "review",
  PUBLISHED: "published",
} as const;

export type QueueStatus = (typeof QUEUE_STATUS)[keyof typeof QUEUE_STATUS];
