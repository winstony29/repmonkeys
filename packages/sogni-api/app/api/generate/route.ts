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
    });

    const imageUrls = await project.waitForCompletion();

    return NextResponse.json({ imageUrls });
  } catch (err: any) {
    console.error("Error in /api/generate:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
