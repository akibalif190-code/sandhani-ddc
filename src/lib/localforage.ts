import localforage from "localforage";
import type { PatientRecord } from "./types";

const patientStore = localforage.createInstance({
  name: "SondhaniLabDB",
  storeName: "patients",
  driver: [localforage.INDEXEDDB, localforage.LOCALSTORAGE],
});

export async function savePatient(record: PatientRecord): Promise<void> {
  await patientStore.setItem(record.id, record);
}

export async function getPatient(id: string): Promise<PatientRecord | null> {
  return await patientStore.getItem<PatientRecord>(id);
}

export async function getAllPatients(): Promise<PatientRecord[]> {
  const patients: PatientRecord[] = [];
  await patientStore.iterate<PatientRecord, void>((value) => {
    if (value) patients.push(value);
  });
  return patients.sort((a, b) => b.createdAt - a.createdAt);
}

export async function deletePatient(id: string): Promise<void> {
  await patientStore.removeItem(id);
}

function fuzzyMatch(pattern: string, str: string): boolean {
  const p = pattern.toLowerCase();
  const s = str.toLowerCase();
  let i = 0, j = 0;
  while (i < p.length && j < s.length) {
    if (p[i] === s[j]) i++;
    j++;
  }
  return i === p.length;
}

export async function searchPatients(query: string): Promise<PatientRecord[]> {
  const all = await getAllPatients();
  if (!query.trim()) return all;
  const q = query.trim();
  return all.filter(
    (p) =>
      fuzzyMatch(q, p.name) ||
      p.mobile.includes(q) ||
      p.refId.toLowerCase().includes(q.toLowerCase())
  );
}

export async function updatePatientSync(
  id: string,
  synced: boolean
): Promise<void> {
  const patient = await patientStore.getItem<PatientRecord>(id);
  if (patient) {
    patient.synced = synced;
    await patientStore.setItem(id, patient);
  }
}

export async function getUnsyncedPatients(): Promise<PatientRecord[]> {
  const all = await getAllPatients();
  return all.filter((p) => !p.synced);
}

export async function clearAllPatients(): Promise<void> {
  await patientStore.clear();
}
