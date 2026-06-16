"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Save, Phone, Calendar, Droplet, FileText, User } from "lucide-react";
import { savePatient } from "@/lib/localforage";
import { syncToCloud } from "@/lib/sync";
import type { PatientRecord, TestName } from "@/lib/types";
import { TEST_LABELS, TEST_OPTIONS } from "@/lib/types";

function generateRefId(): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `SG-${dateStr}-${rand}`;
}

interface LabFormProps {
  onSaved: (record: PatientRecord, generatePdf: boolean) => void;
}

export function LabForm({ onSaved }: LabFormProps) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [mobile, setMobile] = useState("");
  const [bloodGlucose, setBloodGlucose] = useState("");
  const [tests, setTests] = useState<Record<TestName, "Negative" | "Positive">>({
    hbsAg: "Negative",
    hcv: "Negative",
    malaria: "Negative",
    hiv: "Negative",
    vdrl: "Negative",
  });
  const [savingMode, setSavingMode] = useState<"save" | "pdf" | null>(null);

  const handleTestChange = (test: TestName, value: string) => {
    setTests((prev) => ({ ...prev, [test]: value as "Negative" | "Positive" }));
  };

  const handleSave = async (generatePdf: boolean) => {
    if (!name.trim()) {
      toast.error("Patient name is required");
      return;
    }
    if (!age || Number(age) <= 0) {
      toast.error("Valid age is required");
      return;
    }
    if (!mobile.trim()) {
      toast.error("Mobile number is required");
      return;
    }

    setSavingMode(generatePdf ? "pdf" : "save");

    try {
      const now = new Date();
      const record: PatientRecord = {
        id: crypto.randomUUID(),
        refId: generateRefId(),
        name: name.trim(),
        age: Number(age),
        mobile: mobile.trim(),
        date: now.toISOString().slice(0, 10),
        time: now.toTimeString().slice(0, 5),
        hbsAg: tests.hbsAg,
        hcv: tests.hcv,
        malaria: tests.malaria,
        hiv: tests.hiv,
        vdrl: tests.vdrl,
        bloodGlucose: bloodGlucose.trim() || "N/A",
        createdAt: Date.now(),
        synced: false,
      };

      await savePatient(record);
      
      if (generatePdf) {
        toast.success("Record saved. Generating PDF...", {
          description: `Patient ${record.refId} has been securely stored.`,
        });
      } else {
        toast.success("Record saved", {
          description: `Patient ${record.refId} has been securely stored.`,
        });
      }

      // Background sync
      syncToCloud(record).catch(() => {});

      // Reset form
      setName("");
      setAge("");
      setMobile("");
      setBloodGlucose("");
      setTests({
        hbsAg: "Negative",
        hcv: "Negative",
        malaria: "Negative",
        hiv: "Negative",
        vdrl: "Negative",
      });

      onSaved(record, generatePdf);
    } catch (err) {
      toast.error("Failed to save", {
        description: "An unexpected error occurred.",
      });
    } finally {
      setSavingMode(null);
    }
  };

  const testNames: TestName[] = ["hbsAg", "hcv", "malaria", "hiv", "vdrl"];
  const [glucoseUnit, setGlucoseUnit] = useState<"mmol/L" | "mg/dL">("mmol/L");

  return (
    <div className="mx-auto max-w-4xl pb-16">
      <div className="border border-border bg-card flex flex-col">
        
        {/* Patient Details Section */}
        <section className="p-6 md:p-10">
          <div className="grid gap-x-8 gap-y-8 sm:grid-cols-2">
            <div className="space-y-3">
              <Label htmlFor="name" className="text-xs font-medium text-muted-foreground uppercase tracking-wide ml-1">Full Name</Label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="name"
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-12 pl-12 text-base bg-muted border border-border/30 hover:border-border focus-visible:bg-background transition-colors"
                />
              </div>
            </div>
            <div className="space-y-3">
              <Label htmlFor="mobile" className="text-xs font-medium text-muted-foreground uppercase tracking-wide ml-1">Mobile Number</Label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="mobile"
                  placeholder="01XXXXXXXXX"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="h-12 pl-12 text-base bg-muted border border-border/30 hover:border-border focus-visible:bg-background transition-colors"
                />
              </div>
            </div>
            <div className="space-y-3">
              <Label htmlFor="age" className="text-xs font-medium text-muted-foreground uppercase tracking-wide ml-1">Age</Label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="age"
                  type="number"
                  placeholder="Years"
                  min={0}
                  max={150}
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="h-12 pl-12 text-base bg-muted border border-border/30 hover:border-border focus-visible:bg-background transition-colors"
                />
              </div>
            </div>
            <div className="space-y-3">
              <Label htmlFor="glucose" className="text-xs font-medium text-muted-foreground uppercase tracking-wide ml-1">Blood Glucose</Label>
              <div className="flex">
                <div className="relative flex-1">
                  <Droplet className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="glucose"
                    placeholder="Value"
                    value={bloodGlucose}
                    onChange={(e) => setBloodGlucose(e.target.value)}
                    className="h-12 pl-12 text-base bg-muted border border-border/30 hover:border-border focus-visible:bg-background transition-colors rounded-none border-r-0"
                  />
                </div>
                <Select value={glucoseUnit} onValueChange={(v) => setGlucoseUnit(v as "mmol/L" | "mg/dL")}>
                  <SelectTrigger className="!h-12 w-[90px] px-3 text-sm font-medium bg-muted border border-border/30 hover:border-border transition-colors rounded-none flex-shrink-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mmol/L">mmol/L</SelectItem>
                    <SelectItem value="mg/dL">mg/dL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </section>

        <div className="h-px bg-border/40 w-full" />

        {/* Test Results Section */}
        <section className="p-6 md:p-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {testNames.map((test) => (
              <div key={test} className="space-y-1">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide ml-1">{TEST_LABELS[test]}</Label>
                <Select
                  value={tests[test]}
                  onValueChange={(v) => v && handleTestChange(test, v)}
                >
                  <SelectTrigger className="!h-12 w-full text-base px-4 font-medium transition-colors bg-muted border-transparent hover:bg-muted/80 focus:bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TEST_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt} className="h-10">
                        <span
                          className={
                            opt === "Positive"
                              ? "text-destructive font-semibold"
                              : "text-foreground font-medium"
                          }
                        >
                          {opt}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </section>

        {/* Footer Action Bar */}
        <div className="h-px bg-border/40 w-full" />
        <section className="p-6 md:px-10 md:py-8 bg-secondary/10 flex flex-col sm:flex-row items-center justify-end gap-6">
          <div className="flex w-full sm:w-auto items-center -space-x-px">
            <Button
              variant="outline"
              size="lg"
              className="flex-1 sm:flex-none h-12 px-6 font-medium relative z-0 hover:z-10 focus:z-10"
              onClick={() => handleSave(false)}
              disabled={!!savingMode}
            >
              {savingMode === "save" ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-foreground/30 border-t-foreground" />
                  Saving...
                </span>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save
                </>
              )}
            </Button>
            
            <Button
              size="lg"
              className="flex-1 sm:flex-none h-12 px-8 font-medium shadow-none relative z-0 hover:z-10 focus:z-10 border border-primary hover:border-primary/90"
              onClick={() => handleSave(true)}
              disabled={!!savingMode}
            >
              {savingMode === "pdf" ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                  Processing...
                </span>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Generate PDF
                </>
              )}
            </Button>
          </div>
        </section>

      </div>
    </div>
  );
}
