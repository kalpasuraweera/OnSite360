/*
  Warnings:

  - You are about to drop the `chat_messages` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `chat_sessions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `document_embeddings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `llm_generations` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "chat_messages" DROP CONSTRAINT "chat_messages_sessionId_fkey";

-- DropForeignKey
ALTER TABLE "chat_sessions" DROP CONSTRAINT "chat_sessions_projectId_fkey";

-- DropForeignKey
ALTER TABLE "chat_sessions" DROP CONSTRAINT "chat_sessions_userId_fkey";

-- DropForeignKey
ALTER TABLE "document_embeddings" DROP CONSTRAINT "document_embeddings_documentId_fkey";

-- DropForeignKey
ALTER TABLE "llm_generations" DROP CONSTRAINT "llm_generations_userId_fkey";

-- DropTable
DROP TABLE "chat_messages";

-- DropTable
DROP TABLE "chat_sessions";

-- DropTable
DROP TABLE "document_embeddings";

-- DropTable
DROP TABLE "llm_generations";

-- DropEnum
DROP TYPE "GenerationStatus";

-- DropEnum
DROP TYPE "GenerationType";

-- DropEnum
DROP TYPE "MessageRole";
