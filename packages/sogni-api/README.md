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

Generates wellness-themed artwork from a text prompt.

**Request:**
```json
{
  "prompt": "nature wellness NFT artwork, high quality, digital art"
}
```

**Response:**
```json
{
  "imageUrls": ["https://sogni-generated-image-url.jpg"]
}
```

**Error Response:**
```json
{
  "error": "Error message"
}
```

## Integration

This service is integrated with the wellness playground application. The playground calls this API when users generate their wellness NFT artwork during onboarding.

## Port Configuration

The service runs on port 3002 to avoid conflicts with other services:
- Playground: `localhost:3000`
- Sogni API: `localhost:3002`
- Backend: `localhost:3001`

## Troubleshooting

1. **Missing Dependencies**: Ensure `@sogni-ai/sogni-client` is installed
2. **CORS Issues**: Check that CORS headers are configured in `next.config.ts`
3. **API Credentials**: Verify your Sogni AI credentials in `.env.local`
4. **Network Issues**: Ensure the service is running on port 3002
