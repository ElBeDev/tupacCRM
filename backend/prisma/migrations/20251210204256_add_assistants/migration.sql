-- CreateTable
CREATE TABLE "assistants" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "instructions" TEXT NOT NULL,
    "model" TEXT NOT NULL DEFAULT 'gpt-4-turbo-preview',
    "temperature" DOUBLE PRECISION NOT NULL DEFAULT 0.7,
    "openaiId" TEXT,
    "tools" JSONB,
    "fileIds" TEXT[],
    "metadata" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assistants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assistant_test_messages" (
    "id" TEXT NOT NULL,
    "assistantId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "assistant_test_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "assistants_openaiId_key" ON "assistants"("openaiId");

-- AddForeignKey
ALTER TABLE "assistant_test_messages" ADD CONSTRAINT "assistant_test_messages_assistantId_fkey" FOREIGN KEY ("assistantId") REFERENCES "assistants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
