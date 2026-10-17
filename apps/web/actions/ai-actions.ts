"use server";

import { aiRouter } from "@/server/routers/ai";
import { createTRPCContext } from "@/server/trpc";

async function draft(prompt: string) {
  const ctx = await createTRPCContext();
  const result = await aiRouter.createCaller(ctx).generalText({ prompt, maxTokens: 1024, temperature: 0.1 });
  return { text: result.text };
}

export async function processVoiceScribe(transcription: string) {
  return draft(`Create an UNSAVED SOAP draft using only this transcription. Do not invent clinical facts. Flag missing sections for clinician review.\n${transcription}`);
}

export async function analyzeMedicalImage(_base64Image: string, _prompt?: string): Promise<{ text: string }> {
  throw new Error("AI image analysis is unavailable. No image was analyzed.");
}

export async function analyzeClinicalCase(_params: { symptoms: string; medications: string; info: string }): Promise<{ text: string }> {
  throw new Error("Automated diagnosis and treatment recommendations are unavailable. Review the case with a veterinarian.");
}

export async function generateDischargeReport(params: { petName: string; species: string; diagnosis: string; treatment: string; followUp: string }) {
  return draft(`Create an UNSAVED plain-language discharge draft using only these staff-supplied facts. Do not add treatments or doses.\n${JSON.stringify(params)}`);
}
