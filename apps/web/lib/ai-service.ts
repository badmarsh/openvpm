export interface AIRequest {
  prompt: string;
  modelId?: string; // Legacy UI hint; server environment selects the model.
  maxTokens?: number;
  temperature?: number;
  context?: string;
}

export interface AIResponse {
  success: boolean;
  content?: string;
  error?: string;
  modelUsed: string;
  tokensUsed: number;
  responseTime: number;
  cost: number;
}

export interface MedicalAnalysisRequest {
  symptoms: string[];
  patientAge: number;
  patientGender: string;
  medicalHistory: string[];
  vitalSigns: Record<string, string | number>;
  modelId?: string; // Legacy UI hint; server environment selects the model.
}

export interface DrugInteractionRequest {
  medications: string[];
  patientAge: number;
  medicalConditions: string[];
  allergies: string[];
  modelId?: string; // Legacy UI hint; server environment selects the model.
}

export interface ImageAnalysisRequest {
  imageData: string; // base64 encoded
  imageType: 'xray' | 'ct' | 'mri' | 'ultrasound';
  analysisType: 'diagnosis' | 'abnormality' | 'measurement';
  modelId?: string; // Legacy UI hint; server environment selects the model.
  imageFormat?: string; // jpeg, png, etc.
}

/** Browser facade: no provider credentials, model records, or outbound URLs. */
export class AIService {
  private unavailable(): AIResponse {
    return { success: false, error: 'This clinical analysis feature is unavailable. Use clinician-reviewed workflows; no image was analyzed.', modelUsed: 'unavailable', tokensUsed: 0, responseTime: 0, cost: 0 };
  }

  async generateText(request: AIRequest): Promise<AIResponse> {
    const start = Date.now();
    try {
      const response = await fetch('/api/ai/text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: request.context ? `${request.context}\n\n${request.prompt}` : request.prompt,
          maxTokens: request.maxTokens ?? 1024,
          temperature: request.temperature ?? 0.1,
        }),
      });
      const data = await response.json();
      return {
        success: response.ok,
        content: response.ok ? data.text : undefined,
        error: response.ok ? undefined : (data.error ?? 'AI unavailable'),
        modelUsed: data.model ?? 'unavailable',
        tokensUsed: data.tokensUsed ?? 0,
        responseTime: Date.now() - start,
        // Not a price estimate. Use provider billing for actual spend.
        cost: 0,
      };
    } catch {
      return { ...this.unavailable(), error: 'AI unavailable. Continue without AI.', responseTime: Date.now() - start };
    }
  }

  async analyzeMedicalSymptoms(_request: MedicalAnalysisRequest): Promise<AIResponse> { return this.unavailable(); }
  async checkDrugInteractions(_request: DrugInteractionRequest): Promise<AIResponse> { return this.unavailable(); }
  async analyzeMedicalImage(_request: ImageAnalysisRequest): Promise<AIResponse> { return this.unavailable(); }
  async generateChatResponse(request: AIRequest): Promise<AIResponse> { return this.generateText(request); }
  async testModelConnection(_modelId: string): Promise<boolean> {
    // A configuration check is not a billable provider smoke test.
    return false;
  }
}
export const aiService = new AIService();
