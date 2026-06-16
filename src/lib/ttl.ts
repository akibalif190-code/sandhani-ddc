import { getAllPatients, deletePatient } from "./localforage";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000; // 604800000ms

export async function cleanupExpiredRecords(): Promise<number> {
  const patients = await getAllPatients();
  const now = Date.now();
  let deletedCount = 0;

  for (const patient of patients) {
    if (now - patient.createdAt > SEVEN_DAYS_MS) {
      await deletePatient(patient.id);
      deletedCount++;
    }
  }

  return deletedCount;
}
