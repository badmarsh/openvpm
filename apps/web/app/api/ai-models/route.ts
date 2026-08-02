import { NextRequest, NextResponse } from 'next/server';
import { db } from '@openpims/db/client';
import { aiModels } from '@openpims/db';
import { eq, desc } from 'drizzle-orm';

// GET all AI models
export async function GET() {
  try {
    const models = await db.select().from(aiModels).orderBy(desc(aiModels.createdAt));
    
    return NextResponse.json({
      success: true,
      data: models,
      count: models.length
    });
  } catch (error) {
    console.error('Error fetching AI models:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch AI models',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST new AI model
export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/ai-models - Starting model creation...');
    
    const body = await request.json();
    console.log('Request body:', { ...body, apiKey: body.apiKey ? '[HIDDEN]' : 'MISSING' });

    // Validate required fields
    if (!body.name || !body.provider || !body.apiKey) {
      console.log('Validation failed:', { name: !!body.name, provider: !!body.provider, apiKey: !!body.apiKey });
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: name, provider, and apiKey are required' 
        },
        { status: 400 }
      );
    }

    // Generate unique ID
    const id = Date.now().toString();
    console.log('Generated ID:', id);

    // If making this active, deactivate others
    if (body.isActive) {
      await db.update(aiModels).set({ isActive: false });
    }

    const modelData = {
      ...body,
      id,
      isActive: body.isActive || false,
      features: body.features || [],
      testResults: body.testResults || { accuracy: 90, responseTime: 2.0, reliability: 90 },
    };
    
    console.log('Model data to save:', { ...modelData, apiKey: '[HIDDEN]' });

    const [savedModel] = await db.insert(aiModels).values(modelData).returning();
    console.log('Model saved successfully:', { id: savedModel.id, name: savedModel.name });

    return NextResponse.json({
      success: true,
      data: savedModel,
      message: 'AI model created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating AI model:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create AI model',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT update AI model
export async function PUT(request: NextRequest) {
  try {
    console.log('PUT /api/ai-models - Starting model update...');
    
    const body = await request.json();
    console.log('Request body:', { ...body, apiKey: body.apiKey ? '[HIDDEN]' : 'MISSING' });

    if (!body.id) {
      console.log('Validation failed: Model ID is missing');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Model ID is required' 
        },
        { status: 400 }
      );
    }

    if (body.isActive) {
      await db.update(aiModels).set({ isActive: false }).where(eq(aiModels.isActive, true));
    }

    const [updatedModel] = await db.update(aiModels)
      .set({ ...body, updatedAt: new Date().toISOString() })
      .where(eq(aiModels.id, body.id))
      .returning();

    if (!updatedModel) {
      console.log('Model not found after update attempt');
      return NextResponse.json(
        { 
          success: false, 
          error: 'AI model not found' 
        },
        { status: 404 }
      );
    }

    console.log('Model updated successfully:', { id: updatedModel.id, name: updatedModel.name });
    return NextResponse.json({
      success: true,
      data: updatedModel,
      message: 'AI model updated successfully'
    });

  } catch (error) {
    console.error('Error updating AI model:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update AI model',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE AI model
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Model ID is required' 
        },
        { status: 400 }
      );
    }

    const [deletedModel] = await db.delete(aiModels).where(eq(aiModels.id, id)).returning();

    if (!deletedModel) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'AI model not found' 
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'AI model deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting AI model:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete AI model',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
