import { getAllReports, deleteReport } from "./localforage";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000; // 604800000ms

export async function cleanupExpiredRecords(): Promise<number> {
  const reports = await getAllReports();
  const now = Date.now();
  let deletedCount = 0;

  for (const report of reports) {
    if (now - report.createdAt > SEVEN_DAYS_MS) {
      await deleteReport(report.id);
      deletedCount++;
    }
  }

  return deletedCount;
}
