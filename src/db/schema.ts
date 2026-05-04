import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
  pgEnum,
  date,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── Enums ───────────────────────────────────────────────────────────────────

export const userRoleEnum = pgEnum("user_role", ["owner", "builder", "client"]);

export const projectStatusEnum = pgEnum("project_status", [
  "active",
  "paused",
  "completed",
  "archived",
]);

export const requirementSourceEnum = pgEnum("requirement_source", [
  "document",
  "meeting",
  "email",
  "verbal",
]);

export const requirementClassificationEnum = pgEnum(
  "requirement_classification",
  ["mvp", "post_mvp", "out_of_scope"]
);

export const requirementStatusEnum = pgEnum("requirement_status", [
  "draft",
  "pending_approval",
  "approved",
  "disputed",
]);

export const taskPriorityEnum = pgEnum("task_priority", [
  "p0_critical",
  "p1_high",
  "p2_medium",
  "p3_low",
]);

export const taskStatusEnum = pgEnum("task_status", [
  "not_started",
  "in_progress",
  "blocked",
  "done",
  "cut",
]);

export const demoClientStatusEnum = pgEnum("demo_client_status", [
  "pending",
  "approved",
  "rejected",
  "no_response",
]);

export const scopeChangeSourceEnum = pgEnum("scope_change_source", [
  "client_request",
  "meeting",
  "internal",
]);

export const scopeChangeStatusEnum = pgEnum("scope_change_status", [
  "pending",
  "accepted",
  "rejected",
  "deferred",
]);

export const clientPingTypeEnum = pgEnum("client_ping_type", [
  "requirement_review",
  "demo_review",
  "scope_decision",
  "feedback_request",
  "general",
]);

export const clientPingStatusEnum = pgEnum("client_ping_status", [
  "pending",
  "responded",
  "overdue",
  "auto_escalated",
]);

export const statusEmailTypeEnum = pgEnum("status_email_type", [
  "weekly_status",
  "ping_reminder",
  "escalation",
  "auto_accept_notice",
]);

// ─── Tables ───────────────────────────────────────────────────────────────────

export const organizations = pgTable("organizations", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  orgId: text("org_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  role: userRoleEnum("role").notNull(),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastActiveAt: timestamp("last_active_at").defaultNow().notNull(),
});

export const projects = pgTable("projects", {
  id: text("id").primaryKey(),
  orgId: text("org_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  slug: text("slug").notNull().default(""),
  description: text("description"),
  status: projectStatusEnum("status").notNull().default("active"),
  mvpDeadline: date("mvp_deadline"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const requirements = pgTable("requirements", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  refCode: text("ref_code").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  source: requirementSourceEnum("source").notNull(),
  sourceDetail: text("source_detail"),
  classification: requirementClassificationEnum("classification").notNull(),
  status: requirementStatusEnum("status").notNull().default("draft"),
  clientApprovedBy: text("client_approved_by").references(() => users.id),
  clientApprovedAt: timestamp("client_approved_at"),
  autoApproved: boolean("auto_approved").notNull().default(false),
  autoApproveDeadline: timestamp("auto_approve_deadline"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const tasks = pgTable("tasks", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  requirementId: uuid("requirement_id").references(() => requirements.id),
  refCode: text("ref_code").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  ownerId: text("owner_id")
    .notNull()
    .references(() => users.id),
  priority: taskPriorityEnum("priority").notNull(),
  status: taskStatusEnum("status").notNull().default("not_started"),
  week: text("week"),
  blockedBy: text("blocked_by"),
  blockedReason: text("blocked_reason"),
  dodRef: text("dod_ref"),
  testCaseId: text("test_case_id"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const demoVideos = pgTable("demo_videos", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  taskId: uuid("task_id").references(() => tasks.id),
  requirementId: uuid("requirement_id").references(() => requirements.id),
  title: text("title").notNull(),
  videoUrl: text("video_url").notNull(),
  durationSeconds: integer("duration_seconds"),
  testCaseId: text("test_case_id"),
  recordedAt: timestamp("recorded_at").notNull(),
  sentToClient: boolean("sent_to_client").notNull().default(false),
  sentAt: timestamp("sent_at"),
  clientStatus: demoClientStatusEnum("client_status").notNull().default("pending"),
  clientResponseAt: timestamp("client_response_at"),
  clientComment: text("client_comment"),
  autoApproved: boolean("auto_approved").notNull().default(false),
  autoApproveDeadline: timestamp("auto_approve_deadline"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const dodItems = pgTable("dod_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  requirementId: uuid("requirement_id")
    .notNull()
    .references(() => requirements.id, { onDelete: "cascade" }),
  dodRef: text("dod_ref").notNull(),
  criterion: text("criterion").notNull(),
  taskId: uuid("task_id").references(() => tasks.id),
  demoVideoId: uuid("demo_video_id").references(() => demoVideos.id),
  met: boolean("met").notNull().default(false),
  metAt: timestamp("met_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const scopeChanges = pgTable("scope_changes", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  source: scopeChangeSourceEnum("source").notNull(),
  sourceDetail: text("source_detail"),
  impactDescription: text("impact_description").notNull(),
  estimatedDays: integer("estimated_days"),
  status: scopeChangeStatusEnum("status").notNull().default("pending"),
  acknowledgedBy: text("acknowledged_by").references(() => users.id),
  acknowledgedAt: timestamp("acknowledged_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const standups = pgTable("standups", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  date: date("date").notNull(),
  didYesterday: text("did_yesterday").notNull(),
  doingToday: text("doing_today").notNull(),
  blockers: text("blockers"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const clientPings = pgTable("client_pings", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  type: clientPingTypeEnum("type").notNull(),
  referenceId: uuid("reference_id"),
  referenceType: text("reference_type"),
  sentAt: timestamp("sent_at").notNull(),
  deadline: timestamp("deadline").notNull(),
  responseAt: timestamp("response_at"),
  status: clientPingStatusEnum("status").notNull().default("pending"),
  escalatedAt: timestamp("escalated_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  userId: text("user_id").references(() => users.id),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: uuid("entity_id").notNull(),
  oldValue: jsonb("old_value"),
  newValue: jsonb("new_value"),
  metadata: jsonb("metadata"),
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const clientReviewDecisionEnum = pgEnum("client_review_decision", [
  "approved",
  "disputed",
  "rejected",
]);

export const clientReviews = pgTable("client_reviews", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  pingId: uuid("ping_id")
    .notNull()
    .references(() => clientPings.id),
  requirementId: uuid("requirement_id").references(() => requirements.id),
  demoVideoId: uuid("demo_video_id").references(() => demoVideos.id),
  reviewerName: text("reviewer_name").notNull(),
  reviewerEmail: text("reviewer_email").notNull(),
  decision: clientReviewDecisionEnum("decision").notNull(),
  comment: text("comment"),
  scopeCreepDetected: boolean("scope_creep_detected").notNull().default(false),
  scopeCreepSummary: text("scope_creep_summary"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const statusEmails = pgTable("status_emails", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  type: statusEmailTypeEnum("type").notNull(),
  recipients: jsonb("recipients").notNull(),
  subject: text("subject").notNull(),
  bodyHtml: text("body_html").notNull(),
  sentAt: timestamp("sent_at").notNull(),
  openedAt: timestamp("opened_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Better Auth tables ───────────────────────────────────────────────────────
// These are managed by Better Auth. Defined here for Drizzle migrations.

export const authUsers = pgTable("auth_users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const authSessions = pgTable("auth_sessions", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => authUsers.id, { onDelete: "cascade" }),
});

export const authAccounts = pgTable("auth_accounts", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => authUsers.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const authVerifications = pgTable("auth_verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

// ─── Relations ────────────────────────────────────────────────────────────────

export const organizationsRelations = relations(organizations, ({ many }) => ({
  users: many(users),
  projects: many(projects),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [users.orgId],
    references: [organizations.id],
  }),
  ownedTasks: many(tasks),
  standups: many(standups),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [projects.orgId],
    references: [organizations.id],
  }),
  requirements: many(requirements),
  tasks: many(tasks),
  demoVideos: many(demoVideos),
  scopeChanges: many(scopeChanges),
  standups: many(standups),
  clientPings: many(clientPings),
  auditLogs: many(auditLogs),
}));

export const requirementsRelations = relations(requirements, ({ one, many }) => ({
  project: one(projects, {
    fields: [requirements.projectId],
    references: [projects.id],
  }),
  approvedBy: one(users, {
    fields: [requirements.clientApprovedBy],
    references: [users.id],
  }),
  tasks: many(tasks),
  demoVideos: many(demoVideos),
  dodItems: many(dodItems),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  project: one(projects, {
    fields: [tasks.projectId],
    references: [projects.id],
  }),
  requirement: one(requirements, {
    fields: [tasks.requirementId],
    references: [requirements.id],
  }),
  owner: one(users, {
    fields: [tasks.ownerId],
    references: [users.id],
  }),
}));

export const demoVideosRelations = relations(demoVideos, ({ one }) => ({
  project: one(projects, {
    fields: [demoVideos.projectId],
    references: [projects.id],
  }),
  task: one(tasks, {
    fields: [demoVideos.taskId],
    references: [tasks.id],
  }),
  requirement: one(requirements, {
    fields: [demoVideos.requirementId],
    references: [requirements.id],
  }),
}));

export const dodItemsRelations = relations(dodItems, ({ one }) => ({
  project: one(projects, {
    fields: [dodItems.projectId],
    references: [projects.id],
  }),
  requirement: one(requirements, {
    fields: [dodItems.requirementId],
    references: [requirements.id],
  }),
  task: one(tasks, {
    fields: [dodItems.taskId],
    references: [tasks.id],
  }),
  demoVideo: one(demoVideos, {
    fields: [dodItems.demoVideoId],
    references: [demoVideos.id],
  }),
}));

export const scopeChangesRelations = relations(scopeChanges, ({ one }) => ({
  project: one(projects, {
    fields: [scopeChanges.projectId],
    references: [projects.id],
  }),
  acknowledgedByUser: one(users, {
    fields: [scopeChanges.acknowledgedBy],
    references: [users.id],
  }),
}));

export const clientReviewsRelations = relations(clientReviews, ({ one }) => ({
  project: one(projects, {
    fields: [clientReviews.projectId],
    references: [projects.id],
  }),
  ping: one(clientPings, {
    fields: [clientReviews.pingId],
    references: [clientPings.id],
  }),
  requirement: one(requirements, {
    fields: [clientReviews.requirementId],
    references: [requirements.id],
  }),
  demoVideo: one(demoVideos, {
    fields: [clientReviews.demoVideoId],
    references: [demoVideos.id],
  }),
}));
