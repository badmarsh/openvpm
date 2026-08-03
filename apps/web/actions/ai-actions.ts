"use server";

import { google } from "@ai-sdk/google";
import { generateText, generateObject } from "ai";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

async function verifyAuth() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  const role = session.user.role;
  if (role !== "admin" && role !== "veterinarian") {
    throw new Error("Forbidden: Insufficient permissions");
  }
  return session;
}

export async function processVoiceScribe(transcription: string) {
  await verifyAuth();

  const { text } = await generateText({
    model: google(process.env.AI_MODEL || "gemini-flash-latest"),
    system: `You are an expert veterinary assistant. Your task is to extract meaningful clinical information from the raw voice transcription provided by the veterinarian.
Format the output as a clean SOAP note (Subjective, Objective, Assessment, Plan).
If the transcription is too short or unclear, summarize what you can and ask for clarification.
Respond ONLY with the formatted markdown.`,
    prompt: `Raw Transcription:\n${transcription}`,
  });

  return { text };
}

export async function analyzeMedicalImage(base64Image: string, prompt?: string) {
  await verifyAuth();

  const userPrompt = prompt || "Analyze this veterinary medical image. Describe any notable findings, abnormalities, or points of interest for a veterinarian.";

  const { text } = await generateText({
    model: google(process.env.AI_MODEL || "gemini-flash-latest"),
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: userPrompt },
          { type: "image", image: base64Image }
        ],
      }
    ],
  });

  return { text };
}

export async function analyzeClinicalCase(params: { symptoms: string; medications: string; info: string }) {
  await verifyAuth();

  const { symptoms, medications, info } = params;

  const { text } = await generateText({
    model: google(process.env.AI_MODEL || "gemini-flash-latest"),
    system: `You are a specialized veterinary clinical assistant.
Analyze the provided case information.
Provide:
1. Potential differential diagnoses based on symptoms.
2. Any severe drug interactions or contraindications with the current medications.
3. Recommended next diagnostic steps.
Format your response in clean markdown using headers and bullet points. Be concise and professional.`,
    prompt: `Patient Info: ${info || "None provided"}\nSymptoms: ${symptoms || "None provided"}\nCurrent Medications: ${medications || "None provided"}`,
  });

  return { text };
}

export async function generateDischargeReport(params: { petName: string; species: string; diagnosis: string; treatment: string; followUp: string }) {
  await verifyAuth();

  const { petName, species, diagnosis, treatment, followUp } = params;

  const { text } = await generateText({
    model: google(process.env.AI_MODEL || "gemini-flash-latest"),
    system: `You are a veterinary assistant writing a discharge report for a pet owner.
Translate the clinical diagnosis, treatment, and follow-up instructions into clear, empathetic, and easily understandable language for a non-medical pet owner.
Structure the report nicely with greetings, clear sections (Diagnosis, Treatment, Home Care, Follow-up), and a professional closing.`,
    prompt: `Pet Name: ${petName}\nSpecies/Breed: ${species}\nDiagnosis: ${diagnosis}\nTreatment/Medications Given: ${treatment}\nFollow-up Instructions: ${followUp}`,
  });

  return { text };
}
