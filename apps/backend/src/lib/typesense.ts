import { Client } from 'typesense';

export const typesenseClient = new Client({
  nodes: [
    {
      host: process.env.TYPESENSE_HOST || 'localhost',
      port: 8108,
      protocol: process.env.TYPESENSE_PROTOCOL || 'http',
    }
  ],
  apiKey: process.env.TYPESENSE_API_KEY || 'xyz',
  connectionTimeoutSeconds: 5
});

export async function initTypesense() {
  const collections = [
    {
      name: 'users',
      fields: [
        { name: 'id', type: 'string' as const },
        { name: 'name', type: 'string' as const },
        { name: 'email', type: 'string' as const },
      ]
    },
    {
      name: 'submissions',
      fields: [
        { name: 'id', type: 'string' as const },
        { name: 'title', type: 'string' as const },
        { name: 'description', type: 'string' as const },
        { name: 'status', type: 'string' as const },
      ]
    },
    {
      name: 'rooms',
      fields: [
        { name: 'id', type: 'string' as const },
        { name: 'name', type: 'string' as const },
        { name: 'topic', type: 'string' as const },
      ]
    }
  ];

  for (const schema of collections) {
    try {
      try {
        await typesenseClient.collections(schema.name).retrieve();
      } catch (err) {
        await typesenseClient.collections().create(schema);
        console.log(`Created Typesense collection: ${schema.name}`);
      }
    } catch (fatalError) {
      console.warn(`[Typesense] Could not initialize collection ${schema.name}. Is Typesense running?`);
    }
  }
}
