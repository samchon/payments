-- CreateTable
CREATE TABLE "payment_reservations" (
    "id" UUID NOT NULL,
    "source_schema" VARCHAR NOT NULL,
    "source_table" VARCHAR NOT NULL,
    "source_id" VARCHAR NOT NULL,
    "vendor_code" VARCHAR NOT NULL,
    "vendor_uid" VARCHAR NOT NULL,
    "vendor_store_id" VARCHAR NOT NULL,
    "title" VARCHAR NOT NULL,
    "data" TEXT NOT NULL,
    "password" VARCHAR NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "payment_reservations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_histories" (
    "id" UUID NOT NULL,
    "source_schema" VARCHAR NOT NULL,
    "source_table" VARCHAR NOT NULL,
    "source_id" VARCHAR NOT NULL,
    "vendor_code" VARCHAR NOT NULL,
    "vendor_uid" VARCHAR NOT NULL,
    "vendor_store_id" VARCHAR NOT NULL,
    "currency" VARCHAR NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "refund" DOUBLE PRECISION,
    "webhook_url" VARCHAR(1024) NOT NULL,
    "data" TEXT NOT NULL,
    "password" VARCHAR NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL,
    "paid_at" TIMESTAMPTZ,
    "cancelled_at" TIMESTAMPTZ,

    CONSTRAINT "payment_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_history_cancels" (
    "id" UUID NOT NULL,
    "payment_history_id" UUID NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "reason" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "payment_history_cancels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_history_webhooks" (
    "id" UUID NOT NULL,
    "payment_history_id" UUID NOT NULL,
    "previous" TEXT NOT NULL,
    "current" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "payment_history_webhooks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_history_webhook_responses" (
    "id" UUID NOT NULL,
    "payment_history_webhook_id" UUID NOT NULL,
    "status" INTEGER,
    "body" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "payment_history_webhook_responses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "payment_reservations_created_at_idx" ON "payment_reservations"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "payment_reservations_source_schema_source_table_source_id_key" ON "payment_reservations"("source_schema", "source_table", "source_id");

-- CreateIndex
CREATE UNIQUE INDEX "payment_reservations_vendor_code_vendor_uid_key" ON "payment_reservations"("vendor_code", "vendor_uid");

-- CreateIndex
CREATE INDEX "payment_histories_created_at_idx" ON "payment_histories"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "payment_histories_source_schema_source_table_source_id_key" ON "payment_histories"("source_schema", "source_table", "source_id");

-- CreateIndex
CREATE UNIQUE INDEX "payment_histories_vendor_code_vendor_uid_key" ON "payment_histories"("vendor_code", "vendor_uid");

-- CreateIndex
CREATE INDEX "payment_history_cancels_payment_history_id_idx" ON "payment_history_cancels"("payment_history_id");

-- CreateIndex
CREATE INDEX "payment_history_webhooks_payment_history_id_idx" ON "payment_history_webhooks"("payment_history_id");

-- CreateIndex
CREATE INDEX "payment_history_webhook_responses_payment_history_webhook_i_idx" ON "payment_history_webhook_responses"("payment_history_webhook_id");

-- AddForeignKey
ALTER TABLE "payment_history_cancels" ADD CONSTRAINT "payment_history_cancels_payment_history_id_fkey" FOREIGN KEY ("payment_history_id") REFERENCES "payment_histories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_history_webhooks" ADD CONSTRAINT "payment_history_webhooks_payment_history_id_fkey" FOREIGN KEY ("payment_history_id") REFERENCES "payment_histories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_history_webhook_responses" ADD CONSTRAINT "payment_history_webhook_responses_payment_history_webhook__fkey" FOREIGN KEY ("payment_history_webhook_id") REFERENCES "payment_history_webhooks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
