/**
 * Retired audio pipeline. Do not restore the old raw-DB/provider implementation:
 * it lacked validated consent, bounded audio and request governance.
 * Reintroduction requires the local cases in docs/pilot/README.md.
 */
export async function processConsultationAudio(_params: {
  audioBase64: string;
  mimeType?: string;
  practiceId: string;
}): Promise<never> {
  throw new Error("Audio processing is unavailable. No audio was analyzed or saved.");
}
