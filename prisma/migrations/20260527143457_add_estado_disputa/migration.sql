-- CreateEnum
CREATE TYPE "EstadoDisputa" AS ENUM ('ABIERTA', 'RESUELTA', 'PERDIDA');

-- AlterTable
ALTER TABLE "disputas" ADD COLUMN     "estado" "EstadoDisputa" NOT NULL DEFAULT 'ABIERTA',
ADD COLUMN     "origen" TEXT NOT NULL DEFAULT 'usuario';
