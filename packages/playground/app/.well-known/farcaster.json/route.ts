export async function GET() {
  return Response.json({
    accountAssociation: {
      header:
        'eyJmaWQiOjgxODAyNiwidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweDU4YjU1MTNjMzk5OTYzMjU0MjMzMmU0ZTJlRDAyOThFQzFmRjE4MzEifQ',
      payload: 'eyJkb21haW4iOiJ3ZWxsc3BhY2UuYXBwIn0',
      signature:
        'MHgxMTc4ZjYzNjQ1N2RhNTVmZDA1NmM4YmIxOWQyMTEzYzRiYWI5NDgwMjE4ODM2MTRjY2M4MmVlMmVhNzAzNGUwMDk1Yjg2YzM0YjdmZThmMTcyZWZlNTY5NmZkNjcxYmYyZTk2ZTJjNGVlMWJjMDljNTgxN2MxMjVkMWUxNzg0ZjFj',
    },
    frame: {
      version: 'next',
      name: 'WellSpace',
      homeUrl: 'https://wellspace.app',
      iconUrl: 'https://wellspace.app/logo.png',
      imageUrl: 'https://wellspace.app/hero.png',
      buttonTitle: 'Launch WellSpace',
      splashImageUrl: 'https://wellspace.app/hero.png',
      splashBackgroundColor: '#10B981',
      webhookUrl: 'https://wellspace.app/api/webhook',
    },
  });
}
