-- CreateTable
CREATE TABLE "spiders" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "authorId" INTEGER NOT NULL,
    "imageUrl" TEXT,

    CONSTRAINT "spiders_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "spiders" ADD CONSTRAINT "spiders_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
