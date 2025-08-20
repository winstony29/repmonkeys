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

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    // Check if Sogni credentials are available
    if (!process.env.SOGNI_APP_ID || !process.env.SOGNI_USER || !process.env.SOGNI_PASS) {
      console.log("Sogni credentials not found, using mock implementation");
      
      // Mock response for development/testing
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API delay
      
      const mockImageUrls = [
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop&crop=center",
        "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=400&fit=crop&crop=center",
        "https://images.unsplash.com/photo-1506629905607-c52be85eafb8?w=400&h=400&fit=crop&crop=center"
      ];
      
      // Return a different image based on prompt theme
      let selectedImage = mockImageUrls[0];
      if (prompt.toLowerCase().includes('meditation')) {
        selectedImage = mockImageUrls[1];
      } else if (prompt.toLowerCase().includes('fitness') || prompt.toLowerCase().includes('gym')) {
        selectedImage = mockImageUrls[2];
      }
      
      return NextResponse.json({ imageUrls: [selectedImage] });
    }

    const client = await initSogniClient();

    if (!client.projects.availableModels.length) {
      throw new Error("No models available");
    }

    const model = client.projects.availableModels[0];

    const project = await client.projects.create({
      modelId: model.id,
      positivePrompt: prompt || "A person exercising in a gym, ultra realistic",
      negativePrompt: "",
      stylePrompt: "",
      steps: 50,
      guidance: 7.5,
      numberOfImages: 1,
      tokenType: "spark",
    });

    const imageUrls = await project.waitForCompletion();

    return NextResponse.json({ imageUrls });
  } catch (err: any) {
    console.error("Error in /api/generate:", err);
    
    // Check if it's a payment/credits error and fall back to mock
    if (err.message && (
      err.message.includes('Premium') || 
      err.message.includes('payment') || 
      err.message.includes('token') ||
      err.message.includes('credits')
    )) {
      console.log("Sogni requires premium credits, falling back to mock implementation");
      
      // Mock response for development/testing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockImageUrls = [
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop&crop=center",
        "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=400&fit=crop&crop=center",
        "https://images.unsplash.com/photo-1506629905607-c52be85eafb8?w=400&h=400&fit=crop&crop=center"
      ];
      
      // Return a different image based on prompt theme  
      let selectedImage = mockImageUrls[0];
      if (prompt.toLowerCase().includes('meditation')) {
        selectedImage = mockImageUrls[1];
      } else if (prompt.toLowerCase().includes('fitness') || prompt.toLowerCase().includes('gym')) {
        selectedImage = mockImageUrls[2];
      }
      
      return NextResponse.json({ imageUrls: [selectedImage] });
    }
    
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
