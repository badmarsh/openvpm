"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { useAudioRecorder } from "@/hooks/use-audio-recorder";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Mic, Square, Loader2, Bot, FileText, CheckCircle2, Play, Pause, Save, Plus } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function ClinicalConsultationWorkspace() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.patientId as string;
  
  const { isRecording, isPaused, recordingTime, audioBase64, startRecording, stopRecording, pauseRecording, resumeRecording } = useAudioRecorder();
  
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<"record" | "review">("record");
  
  const startSessionMutation = trpc.clinicalAi.startSession.useMutation();
  const processAudioMutation = trpc.clinicalAi.uploadAndProcess.useMutation();
  const applySoapMutation = trpc.clinicalAi.applyToRecord.useMutation();
  
  // Zistenie informácií o pacientovi
  const { data: patient } = trpc.patients.getById.useQuery(patientId, { enabled: !!patientId });

  // Načítanie session detailov
  const { data: session, refetch: refetchSession } = trpc.clinicalAi.getSession.useQuery(
    { sessionId: sessionId! },
    { enabled: !!sessionId }
  );

  const [soapData, setSoapData] = useState({
    subjective: "",
    objective: "",
    assessment: "",
    plan: "",
  });

  const handleStartRecording = async () => {
    if (!sessionId) {
      try {
        const newSession = await startSessionMutation.mutateAsync({ patientId });
        setSessionId(newSession.id);
      } catch (error) {
        toast.error("Nepodarilo sa inicializovať AI konzultáciu");
        return;
      }
    }
    startRecording();
  };

  const handleStopRecording = () => {
    stopRecording();
  };

  useEffect(() => {
    if (audioBase64 && sessionId && !isRecording) {
      handleProcessAudio(audioBase64);
    }
  // eslint-disable-next-react-hooks/exhaustive-deps
  }, [audioBase64, isRecording, sessionId]);

  const handleProcessAudio = async (base64: string) => {
    setIsProcessing(true);
    setActiveTab("review");
    const loadingToastId = toast.loading("AI analyzuje nahrávku a extrahuje klinické dáta...");
    
    try {
      await processAudioMutation.mutateAsync({
        sessionId: sessionId!,
        audioBase64: base64,
        mimeType: "audio/webm", // Chrome default pre MediaRecorder
      });
      
      const updatedSession = await refetchSession();
      if (updatedSession.data?.generatedSoap) {
        const soap = updatedSession.data.generatedSoap as any;
        setSoapData({
          subjective: soap.subjective || "",
          objective: soap.objective || "",
          assessment: soap.assessment || "",
          plan: soap.plan || "",
        });
      }
      toast.success("AI analýza dokončená", { id: loadingToastId });
    } catch (error) {
      toast.error("Spracovanie zlyhalo", { id: loadingToastId });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveToRecord = async () => {
    if (!sessionId) return;
    try {
      await applySoapMutation.mutateAsync({
        patientId,
        sessionId,
        soapData,
      });
      toast.success("SOAP záznam bol úspešne uložený do karty pacienta!");
      router.push(`/records/${patientId}`);
    } catch (error) {
      toast.error("Chyba pri ukladaní záznamu");
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] p-4 md:p-6 gap-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AI Konzultácia</h1>
          {patient && <p className="text-muted-foreground">Pacient: {patient.name} ({patient.species})</p>}
        </div>
        {session?.status === "COMPLETED" && (
          <Button onClick={handleSaveToRecord} className="gap-2">
            <Save className="w-4 h-4" /> Uložiť do karty
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        
        {/* Ľavý panel: Nahrávanie a Surový prepis */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <Card className="flex-shrink-0">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Mic className="w-5 h-5 text-primary" /> Audio Záznam
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-6 gap-6">
              
              <div className="text-4xl font-mono tabular-nums text-primary font-light">
                {formatTime(recordingTime)}
              </div>

              <div className="flex gap-4">
                {!isRecording ? (
                  <Button
                    size="lg"
                    className="w-16 h-16 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-lg shadow-destructive/20"
                    onClick={handleStartRecording}
                    disabled={isProcessing}
                  >
                    <Mic className="w-6 h-6" />
                  </Button>
                ) : (
                  <>
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-16 h-16 rounded-full border-border"
                      onClick={isPaused ? resumeRecording : pauseRecording}
                    >
                      {isPaused ? <Play className="w-6 h-6" /> : <Pause className="w-6 h-6" />}
                    </Button>
                    <Button
                      size="lg"
                      className="w-16 h-16 rounded-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                      onClick={handleStopRecording}
                    >
                      <Square className="w-6 h-6 fill-current" />
                    </Button>
                  </>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {isRecording ? (isPaused ? "Pozastavené" : "Nahráva sa...") : "Kliknite pre začatie diktovania"}
              </p>
            </CardContent>
          </Card>

          <Card className="flex-1 min-h-0 flex flex-col">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                <FileText className="w-4 h-4" /> Surový prepis (Transcript)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-y-auto flex-1">
              {isProcessing ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3 p-6 text-center">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <p className="text-sm">Generujem presný prepis z nahrávky...</p>
                </div>
              ) : session?.rawTranscript ? (
                <div className="p-4 text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                  {session.rawTranscript}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground/50 text-sm p-6 text-center">
                  Zatiaľ žiadny prepis.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Pravý panel: Vygenerovaný SOAP a Návrhy na účtovanie */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card className="flex-1 flex flex-col min-h-0 border-primary/20 shadow-md">
            <CardHeader className="pb-3 border-b bg-primary/5">
              <CardTitle className="flex items-center gap-2 text-primary">
                <Bot className="w-5 h-5" /> Vygenerovaný Klinický Záznam (SOAP)
              </CardTitle>
              <CardDescription>Môžete ručne upraviť pred finálnym uložením do karty.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {isProcessing ? (
                <div className="flex flex-col items-center justify-center h-full text-primary gap-4">
                  <Loader2 className="w-10 h-10 animate-spin" />
                  <p>Analyzujem medicínske fakty a štruktúrujem SOAP správu...</p>
                </div>
              ) : session?.generatedSoap ? (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-muted-foreground uppercase">S - Subjektívne</label>
                    <textarea 
                      value={soapData.subjective} 
                      onChange={(e: any) => setSoapData({...soapData, subjective: e.target.value})}
                      className="min-h-[100px] resize-y w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-muted-foreground uppercase">O - Objektívne</label>
                    <textarea 
                      value={soapData.objective} 
                      onChange={(e: any) => setSoapData({...soapData, objective: e.target.value})}
                      className="min-h-[100px] resize-y w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-muted-foreground uppercase">A - Zhodnotenie (Assessment)</label>
                    <textarea 
                      value={soapData.assessment} 
                      onChange={(e: any) => setSoapData({...soapData, assessment: e.target.value})}
                      className="min-h-[80px] resize-y w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-muted-foreground uppercase">P - Plán</label>
                    <textarea 
                      value={soapData.plan} 
                      onChange={(e: any) => setSoapData({...soapData, plan: e.target.value})}
                      className="min-h-[100px] resize-y w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground/50 p-6 text-center border-2 border-dashed border-border rounded-xl">
                  <Bot className="w-12 h-12 mb-4 opacity-20" />
                  <p>Tu sa po zastavení nahrávania objaví štruktúrovaná veterinárna správa.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Návrhy na účtovanie */}
          {session?.suggestedBillingItems && (
            <Card className="flex-shrink-0 border-orange-500/20 shadow-sm bg-orange-500/5 dark:bg-orange-950/10">
              <CardHeader className="py-3 px-4 border-b border-orange-500/10">
                <CardTitle className="text-sm font-semibold flex items-center justify-between text-orange-600 dark:text-orange-400">
                  <span>Odporúčané položky na fakturáciu</span>
                  <Badge variant="outline" className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800">
                    AI Zistenia
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {(session.suggestedBillingItems as any[]).map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-background p-3 rounded-lg border border-border shadow-sm">
                      <div>
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{item.type} • Množstvo: {item.quantity}</p>
                      </div>
                      <Button size="sm" variant="secondary" className="gap-2 shrink-0">
                        <Plus className="w-4 h-4" /> Pridať na účet
                      </Button>
                    </div>
                  ))}
                  {(session.suggestedBillingItems as any[]).length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-2">V texte neboli nájdené žiadne zhodné položky na účtovanie.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

      </div>
    </div>
  );
}
