"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import dynamic from "next/dynamic";
import { LabForm } from "@/components/lab-form";
import { HistoryTable } from "@/components/history-table";
import { NetworkStatus } from "@/components/network-status";
import { cleanupExpiredRecords } from "@/lib/ttl";
import { initSyncListeners } from "@/lib/sync";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, ClipboardList, Beaker, Droplet } from "lucide-react";
import type { PatientRecord } from "@/lib/types";

const PdfPreview = dynamic(() => import("@/components/pdf/pdf-preview"), {
  ssr: false,
});

export default function Dashboard() {
  const [pdfRecord, setPdfRecord] = useState<PatientRecord | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    cleanupExpiredRecords();
    const cleanup = initSyncListeners();
    return cleanup;
  }, []);

  const handleSaved = useCallback((record: PatientRecord, generatePdf: boolean) => {
    setRefreshTrigger((n) => n + 1);
    if (generatePdf) {
      setPdfRecord(record);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background font-sans text-foreground selection:bg-primary/10 flex flex-col">
      <NetworkStatus />
      
      {/* Top Navigation */}
      <header className="w-full bg-background">
        <div className="container mx-auto flex py-10 md:py-12 items-center justify-center px-4 md:px-8">
          <div className="flex items-center gap-4 font-bold tracking-tighter text-3xl md:text-4xl">
            <div className="flex h-12 w-12 items-center justify-center bg-foreground text-background">
              <Beaker className="h-7 w-7" />
            </div>
            Sondhani Lab
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container max-w-4xl px-4 md:px-8 py-10 md:py-16 mx-auto">
        <div className="flex flex-col gap-8">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Lab Operations</h1>
            <p className="text-muted-foreground mt-2">Manage patient test records and generate PDF reports.</p>
          </div>

          <Tabs defaultValue="new-report" className="w-full">
            <TabsList className="mb-8 flex w-full p-0 gap-0 border border-border bg-background h-14">
              <TabsTrigger value="new-report" className="flex flex-1 items-center justify-center gap-2 px-6 h-full text-sm font-medium border-r border-border text-muted-foreground hover:text-muted-foreground data-active:bg-foreground data-active:text-background data-active:hover:text-background transition-colors m-0 rounded-none !shadow-none">
                <Droplet className="h-4 w-4" />
                New Report
              </TabsTrigger>
              <TabsTrigger value="history" className="flex flex-1 items-center justify-center gap-2 px-6 h-full text-sm font-medium text-muted-foreground hover:text-muted-foreground data-active:bg-foreground data-active:text-background data-active:hover:text-background transition-colors m-0 rounded-none !shadow-none">
                <ClipboardList className="h-4 w-4" />
                Patient History
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="new-report" className="focus-visible:outline-none">
              <LabForm onSaved={handleSaved} />
            </TabsContent>
            
            <TabsContent value="history" className="focus-visible:outline-none">
              <HistoryTable onViewPdf={setPdfRecord} refreshTrigger={refreshTrigger} />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* PDF Overlay */}
      {pdfRecord && (
        <Suspense fallback={null}>
          <PdfPreview record={pdfRecord} onClose={() => setPdfRecord(null)} />
        </Suspense>
      )}
    </div>
  );
}
