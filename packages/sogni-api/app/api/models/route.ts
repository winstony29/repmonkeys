import { NextResponse } from "next/server";
import { SogniClient } from "@sogni-ai/sogni-client";

async function initSogniClient() {
  const client = await SogniClient.createInstance({
    appId: process.env.SOGNI_APP_ID!,
    network: "fast",
  });

  await client.account.login(
    process.env.SOGNI_USER!,
    process.env.SOGNI_PASS!
  );

  await client.projects.waitForModels();
  return client;
}

export async function OPTIONS(request: Request) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function GET() {
  try {
    console.log("Fetching available models...");

    const client = await initSogniClient();
    const models = client.projects.availableModels;

    console.log(`Found ${models.length} available models`);

    // Organize models by category for easier selection
    const categorizedModels = {
      recommended: models.filter(m => 
        m.name?.toLowerCase().includes('realistic') ||
        m.name?.toLowerCase().includes('artistic') ||
        m.name?.toLowerCase().includes('general')
      ),
      all: models.map(model => ({
        id: model.id,
        name: model.name,
        description: model.description || 'No description available',
        category: categorizeModel(model.name || ''),
        recommended: isRecommendedForWellness(model.name || '')
      }))
    };

    return NextResponse.json({ 
      models: categorizedModels,
      totalCount: models.length,
      fetchedAt: new Date().toISOString()
    });
  } catch (err: any) {
    console.error("Error fetching models:", err);
    return NextResponse.json({ 
      error: err.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

function categorizeModel(name: string): string {
  const lowerName = name.toLowerCase();
  
  if (lowerName.includes('realistic') || lowerName.includes('photo')) {
    return 'realistic';
  } else if (lowerName.includes('artistic') || lowerName.includes('art')) {
    return 'artistic';
  } else if (lowerName.includes('anime') || lowerName.includes('cartoon')) {
    return 'stylized';
  } else if (lowerName.includes('general') || lowerName.includes('base')) {
    return 'general';
  } else {
    return 'other';
  }
}

function isRecommendedForWellness(name: string): boolean {
  const lowerName = name.toLowerCase();
  const wellnessKeywords = ['realistic', 'artistic', 'general', 'professional', 'quality'];
  
  return wellnessKeywords.some(keyword => lowerName.includes(keyword));
}
