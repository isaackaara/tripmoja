-- AlterTable
ALTER TABLE "Trip" ADD COLUMN     "departureStatus" TEXT NOT NULL DEFAULT 'SCHEDULED',
ADD COLUMN     "isAcceptingRequests" BOOLEAN NOT NULL DEFAULT true;
