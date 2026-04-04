-- CreateTable
CREATE TABLE "Sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshTokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "RefreshTokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResetPassword" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "used_at" TIMESTAMP(3),
    "invalid" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ResetPassword_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Sessions_user_id_idx" ON "Sessions"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshTokens_token_key" ON "RefreshTokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshTokens_session_id_key" ON "RefreshTokens"("session_id");

-- CreateIndex
CREATE UNIQUE INDEX "ResetPassword_token_key" ON "ResetPassword"("token");

-- CreateIndex
CREATE INDEX "ResetPassword_email_idx" ON "ResetPassword"("email");

-- AddForeignKey
ALTER TABLE "Sessions" ADD CONSTRAINT "Sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshTokens" ADD CONSTRAINT "RefreshTokens_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "Sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
