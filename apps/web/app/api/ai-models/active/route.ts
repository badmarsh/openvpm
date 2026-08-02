import { NextRequest, NextResponse } from 'next/server';
import { db } from '@openpims/db/client';
import { aiModels } from '@openpims/db';
import { eq } from 'drizzle-orm';

// GET active AI model
export async function GET() {
  try {
    const [activeModel] = await db.select().from(aiModels).where(eq(aiModels.isActive, true)).limit(1);
    
    return NextResponse.json({
      success: true,
      data: activeModel || null
    });
  } catch (error) {
    console.error('Error fetching active AI model:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch active AI model',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST set active AI model
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.id) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Model ID is required' 
        },
        { status: 400 }
      );
    }

    // First, set all models to inactive
    await db.update(aiModels).set({ isActive: false });

    // Then, set the specified model as active
    const [activeModel] = await db.update(aiModels)
      .set({ isActive: true })
      .where(eq(aiModels.id, body.id))
      .returning();

    if (!activeModel) {
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
      data: activeModel,
      message: 'Active AI model set successfully'
    });

  } catch (error) {
    console.error('Error setting active AI model:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to set active AI model',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
