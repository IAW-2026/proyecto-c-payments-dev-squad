/*
  Warnings:

  - You are about to drop the `Transaccion` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Transaccion" DROP CONSTRAINT "Transaccion_pagoId_fkey";

-- DropTable
DROP TABLE "Transaccion";

-- CreateTable
CREATE TABLE "transacciones" (
    "id" TEXT NOT NULL,
    "pagoId" TEXT NOT NULL,
    "metodo" TEXT NOT NULL,
    "saleId" TEXT NOT NULL,
    "shipmentId" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transacciones_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "transacciones_pagoId_key" ON "transacciones"("pagoId");

-- AddForeignKey
ALTER TABLE "transacciones" ADD CONSTRAINT "transacciones_pagoId_fkey" FOREIGN KEY ("pagoId") REFERENCES "pagos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
