# Sogni AI API Service

This service provides AI-powered image generation for the wellness NFT platform using Sogni AI.

## Features

- **AI Image Generation**: Creates wellness-themed artwork using Sogni AI
- **CORS Enabled**: Allows cross-origin requests from the playground
- **Error Handling**: Robust error handling with detailed logging
- **Custom Prompts**: Supports custom user prompts for personalized artwork

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Copy the environment template and add your Sogni AI credentials:

```bash
cp env.example .env.local
```

Edit `.env.local` with your Sogni AI credentials:

```env
SOGNI_APP_ID=your_sogni_app_id_here
SOGNI_USER=your_sogni_username_here  
SOGNI_PASS=your_sogni_password_here
```

### 3. Run the Service

```bash
npm run dev
```

The API will be available at `http://localhost:3002`

## API Endpoints

### POST /api/generate

Generates wellness-themed artwork with advanced customization options.

**Request:**
```json
{
  "prompt": "serene natural landscape, peaceful zen garden",
  "negativePrompt": "blurry, low quality, distorted, ugly, bad anatomy",
  "stylePrompt": "wellness, peaceful, calming, high quality, professional",
  "steps": 35,
  "guidance": 8.0,
  "numberOfImages": 1,
  "aspectRatio": "1:1",
  "modelId": "optional-specific-model-id",
  "seed": 12345
}
```

**Parameters:**
- `prompt` (required): Main description of the image
- `negativePrompt` (optional): Things to avoid in the image
- `stylePrompt` (optional): Style and quality descriptors
- `steps` (optional): Number of generation steps (10-100, default: 30)
- `guidance` (optional): How closely to follow the prompt (1-20, default: 7.5)
- `numberOfImages` (optional): How many images to generate (1-4, default: 1)
- `aspectRatio` (optional): Image aspect ratio (default: "1:1")
- `modelId` (optional): Specific model to use
- `seed` (optional): For reproducible results

**Response:**
```json
{
  "imageUrls": ["https://sogni-generated-image-url.jpg"],
  "metadata": {
    "projectId": "sogni-project-id",
    "modelUsed": "Model Name",
    "modelId": "model-id",
    "prompt": "serene natural landscape...",
    "parameters": {
      "steps": 35,
      "guidance": 8.0,
      "aspectRatio": "1:1"
    },
    "generatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### GET /api/models

Gets available Sogni AI models for selection.

**Response:**
```json
{
  "models": {
    "recommended": [...],
    "all": [
      {
        "id": "model-id",
        "name": "Model Name",
        "description": "Model description",
        "category": "realistic|artistic|stylized|general|other",
        "recommended": true
      }
    ]
  },
  "totalCount": 10,
  "fetchedAt": "2024-01-01T00:00:00.000Z"
}
```

**Error Response:**
```json
{
  "error": "Error message",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Integration

This service is integrated with the wellness playground application. The playground calls this API when users generate their wellness NFT artwork during onboarding.

## Port Configuration

The service runs on port 3002 to avoid conflicts with other services:
- Playground: `localhost:3000`
- Sogni API: `localhost:3002`
- Backend: `localhost:3001`

## Testing

### Test Image Generation
```bash
node test-api.js
```

### Test Available Models
```bash
node test-models.js
```

### Manual API Testing
```bash
# Test image generation with enhanced parameters
curl -X POST http://localhost:3002/api/generate \
  -H 'Content-Type: application/json' \
  -d '{
    "prompt": "serene zen garden with flowing water",
    "stylePrompt": "wellness, peaceful, high quality",
    "steps": 35,
    "guidance": 8.0
  }'

# Test models endpoint
curl -X GET http://localhost:3002/api/models
```

## Troubleshooting

1. **Missing Dependencies**: Ensure `@sogni-ai/sogni-client` is installed
2. **CORS Issues**: Check that CORS headers are configured in `next.config.ts`
3. **API Credentials**: Verify your Sogni AI credentials in `.env.local`
4. **Network Issues**: Ensure the service is running on port 3002
5. **Model Selection**: Use `/api/models` to see available models
6. **Parameter Validation**: Check that steps (10-100) and guidance (1-20) are in valid ranges
