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
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function POST(req: Request) {
  try {
    const { 
      prompt, 
      negativePrompt = "blurry, low quality, distorted, ugly, bad anatomy",
      stylePrompt = "wellness, peaceful, calming, digital art, high quality, professional",
      steps = 30,
      guidance = 7.5,
      numberOfImages = 1,
      aspectRatio = "1:1",
      modelId,
      seed
    } = await req.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: "Prompt is required and must be a string" }, { status: 400 });
    }

    console.log("Generating image with enhanced parameters:");
    console.log("- Prompt:", prompt);
    console.log("- Negative Prompt:", negativePrompt);
    console.log("- Style Prompt:", stylePrompt);
    console.log("- Steps:", steps);
    console.log("- Guidance:", guidance);
    console.log("- Aspect Ratio:", aspectRatio);

    const client = await initSogniClient();

    if (!client.projects.availableModels.length) {
      throw new Error("No models available");
    }

    // Use specified model or select best available model
    let selectedModel;
    if (modelId) {
      selectedModel = client.projects.availableModels.find(m => m.id === modelId);
      if (!selectedModel) {
        throw new Error(`Model ${modelId} not found`);
      }
    } else {
      // Select the best model for wellness/artistic content
      selectedModel = client.projects.availableModels.find(m => 
        m.name?.toLowerCase().includes('artistic') || 
        m.name?.toLowerCase().includes('realistic') ||
        m.name?.toLowerCase().includes('general')
      ) || client.projects.availableModels[0];
    }

    console.log("Using model:", selectedModel.id, selectedModel.name);

    // Enhanced project configuration
    const projectConfig = {
      modelId: selectedModel.id,
      positivePrompt: prompt,
      negativePrompt,
      stylePrompt,
      steps: Math.min(Math.max(steps, 10), 100), // Clamp between 10-100
      guidance: Math.min(Math.max(guidance, 1), 20), // Clamp between 1-20
      numberOfImages: Math.min(Math.max(numberOfImages, 1), 4), // Max 4 images
      aspectRatio,
      ...(seed && { seed }), // Include seed if provided for reproducibility
    };

    console.log("Project configuration:", projectConfig);

    const project = await client.projects.create(projectConfig);

    console.log("Project created with ID:", project.id);
    console.log("Waiting for completion...");

    const imageUrls = await project.waitForCompletion();
    console.log("Image generation completed successfully!");
    console.log("Generated URLs:", imageUrls);

    // Enhanced response with metadata
    return NextResponse.json({ 
      imageUrls,
      metadata: {
        projectId: project.id,
        modelUsed: selectedModel.name,
        modelId: selectedModel.id,
        prompt,
        negativePrompt,
        stylePrompt,
        parameters: {
          steps,
          guidance,
          aspectRatio,
          numberOfImages,
          ...(seed && { seed })
        },
        generatedAt: new Date().toISOString()
      }
    });
  } catch (err: any) {
    console.error("Error in /api/generate:", err);
    return NextResponse.json({ 
      error: err.message,
      timestamp: new Date().toISOString(),
      // Include helpful context for debugging
      context: {
        hasPrompt: !!req.body,
        errorType: err.constructor.name
      }
    }, { status: 500 });
  }
}
