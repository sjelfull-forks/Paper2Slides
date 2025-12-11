import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'
import { sql } from 'drizzle-orm'

// Sessions table - tracks user sessions and their processing status
export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id'),
  status: text('status').notNull().default('pending'), // pending, processing, completed, failed
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
  error: text('error'),
  metadata: text('metadata', { mode: 'json' }),
})

// Uploads table - stores information about uploaded files
export const uploads = sqliteTable('uploads', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  sessionId: text('session_id')
    .references(() => sessions.id, { onDelete: 'cascade' })
    .notNull(),
  fileName: text('file_name').notNull(),
  fileSize: integer('file_size').notNull(),
  mimeType: text('mime_type').notNull(),
  storagePath: text('storage_path').notNull(),
  uploadedAt: integer('uploaded_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  metadata: text('metadata', { mode: 'json' }),
})

// Outputs table - stores information about generated slides/posters
export const outputs = sqliteTable('outputs', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  sessionId: text('session_id')
    .references(() => sessions.id, { onDelete: 'cascade' })
    .notNull(),
  outputType: text('output_type').notNull(), // slides, poster
  contentType: text('content_type').notNull(), // paper, general
  style: text('style').notNull(),
  length: text('length'), // for slides: short, medium, long
  density: text('density'), // for posters: sparse, medium, dense
  fastMode: integer('fast_mode', { mode: 'boolean' }).default(false).notNull(),
  parallelWorkers: integer('parallel_workers').default(1),
  storagePath: text('storage_path').notNull(),
  pdfPath: text('pdf_path'),
  thumbnailPath: text('thumbnail_path'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  metadata: text('metadata', { mode: 'json' }),
})

// Checkpoints table - stores pipeline checkpoints for resumption
export const checkpoints = sqliteTable('checkpoints', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  sessionId: text('session_id')
    .references(() => sessions.id, { onDelete: 'cascade' })
    .notNull(),
  stage: text('stage').notNull(), // rag, summary, plan, generate
  data: text('data', { mode: 'json' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

// Zod schemas for validation
export const insertSessionSchema = createInsertSchema(sessions)
export const selectSessionSchema = createSelectSchema(sessions)
export const insertUploadSchema = createInsertSchema(uploads)
export const selectUploadSchema = createSelectSchema(uploads)
export const insertOutputSchema = createInsertSchema(outputs)
export const selectOutputSchema = createSelectSchema(outputs)
export const insertCheckpointSchema = createInsertSchema(checkpoints)
export const selectCheckpointSchema = createSelectSchema(checkpoints)

export type Session = typeof sessions.$inferSelect
export type NewSession = typeof sessions.$inferInsert
export type Upload = typeof uploads.$inferSelect
export type NewUpload = typeof uploads.$inferInsert
export type Output = typeof outputs.$inferSelect
export type NewOutput = typeof outputs.$inferInsert
export type Checkpoint = typeof checkpoints.$inferSelect
export type NewCheckpoint = typeof checkpoints.$inferInsert
