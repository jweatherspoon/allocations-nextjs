'use server';

import { Container, CosmosClient, Database } from '@azure/cosmos';

import { DbConfig } from '@/config/db.config';

async function getCosmosDBClient(): Promise<CosmosClient> {
  const key = DbConfig.apiKey;
  const endpoint = DbConfig.endpoint;
  const client = new CosmosClient({
    endpoint,
    key,
  });

  return client;
}

async function getCosmosDBDatabase(client: CosmosClient): Promise<Database> {
  const databaseId = DbConfig.namespace;
  const database = client.database(databaseId);
  return database;
}

async function getCosmosDBContainer(database: Database): Promise<Container> {
  const containerId = DbConfig.containerId;
  const container = database.container(containerId);
  return container;
}

export async function getDbContainer(): Promise<Container> {
  const client = await getCosmosDBClient();
  const db = await getCosmosDBDatabase(client);
  return getCosmosDBContainer(db);
}
