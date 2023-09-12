-- CreateEnum
CREATE TYPE "VerificationTokenTypes" AS ENUM ('changeEmail', 'resetPassword', 'deleteAccount');

-- CreateTable
CREATE TABLE "verificationTokens" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "type" "VerificationTokenTypes" NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "verificationTokens_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "verificationTokens" ADD CONSTRAINT "verificationTokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
