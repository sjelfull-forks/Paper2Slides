import { pgTable, text, timestamp, jsonb, integer, boolean, uuid } from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'

// Sessions table - tracks user sessions and their processing status
export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id'),
  status: text('status').notNull().default('pending'), // pending, processing, completed, failed
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
  error: text('error'),
  metadata: jsonb('metadata'),
})

// Uploads table - stores information about uploaded files
export const uploads = pgTable('uploads', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id')
    .references(() => sessions.id, { onDelete: 'cascade' })
    .notNull(),
  fileName: text('file_name').notNull(),
  fileSize: integer('file_size').notNull(),
  mimeType: text('mime_type').notNull(),
  storagePath: text('storage_path').notNull(),
  uploadedAt: timestamp('uploaded_at').defaultNow().notNull(),
  metadata: jsonb('metadata'),
})

// Outputs table - stores information about generated slides/posters
export const outputs = pgTable('outputs', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id')
    .references(() => sessions.id, { onDelete: 'cascade' })
    .notNull(),
  outputType: text('output_type').notNull(), // slides, poster
  contentType: text('content_type').notNull(), // paper, general
  style: text('style').notNull(),
  length: text('length'), // for slides: short, medium, long
  density: text('density'), // for posters: sparse, medium, dense
  fastMode: boolean('fast_mode').default(false).notNull(),
  parallelWorkers: integer('parallel_workers').default(1),
  storagePath: text('storage_path').notNull(),
  pdfPath: text('pdf_path'),
  thumbnailPath: text('thumbnail_path'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  metadata: jsonb('metadata'),
})

// Checkpoints table - stores pipeline checkpoints for resumption
export const checkpoints = pgTable('checkpoints', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id')
    .references(() => sessions.id, { onDelete: 'cascade' })
    .notNull(),
  stage: text('stage').notNull(), // rag, summary, plan, generate
  data: jsonb('data').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
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
