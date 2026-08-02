import { NextRequest, NextResponse } from 'next/server';
import { db } from '@openpims/db/client';
import { aiModels } from '@openpims/db';

// Test endpoint to verify database connection and basic operations
export async function GET() {
  try {
    console.log('Testing database connection...');
    const allModels = await db.select().from(aiModels);
    console.log('Database connected successfully');
    
    const count = allModels.length;
    console.log('Current AI models in database:', count);
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      modelCount: count,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database test failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Database connection failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Test endpoint to create a sample model
export async function POST(request: NextRequest) {
  try {
    console.log('Testing model creation...');
    
    const modelData = {
      id: Date.now().toString(),
      name: 'Test Model',
      provider: 'OpenAI',
      type: 'llm',
      status: 'inactive',
      apiKey: 'test-key',
      endpoint: 'https://api.openai.com/v1/chat/completions',
      model: 'gpt-4o',
      maxTokens: 4000,
      temperature: 0.3,
      accuracy: 90,
      speed: 80,
      cost: 0.005,
      features: ['test'],
      testResults: { accuracy: 90, responseTime: 2.0, reliability: 90 },
      isActive: false
    };

    const [savedModel] = await db.insert(aiModels).values(modelData).returning();
    console.log('Test model saved:', savedModel);

    return NextResponse.json({
      success: true,
      message: 'Test model created successfully',
      data: savedModel
    });
  } catch (error) {
    console.error('Test model creation failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Test model creation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
