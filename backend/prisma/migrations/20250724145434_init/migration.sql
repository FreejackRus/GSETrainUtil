-- CreateTable
CREATE TABLE "technicalWorkLog" (
    "id" SERIAL NOT NULL,
    "dataWork" TIMESTAMP(3) NOT NULL,
    "applicationNumber" INTEGER NOT NULL,
    "typeWorkId" INTEGER NOT NULL,

    CONSTRAINT "technicalWorkLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "typeWork" (
    "id" SERIAL NOT NULL,
    "typeWork" TEXT NOT NULL,

    CONSTRAINT "typeWork_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "login" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "typeWork_typeWork_key" ON "typeWork"("typeWork");

-- AddForeignKey
ALTER TABLE "typeWork" ADD CONSTRAINT "typeWork_id_fkey" FOREIGN KEY ("id") REFERENCES "technicalWorkLog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
