'use server';

import { TransactionDetails } from '@/app/lib/models/funds/transaction.model';
import { auth0, getUserId } from '../auth/auth0';
import { FundDetails } from '../models/funds/fund.model';
import { UserData } from '../models/userData.model';
import { Container, CosmosClient, Database, SqlQuerySpec } from '@azure/cosmos';

async function getCosmosDBClient(): Promise<CosmosClient> {
  const endpoint = process.env.COSMOS_DB_ENDPOINT || '';
  const key = process.env.COSMOS_DB_KEY || '';
  const client = new CosmosClient({
    endpoint,
    key,
  });

  return client;
}

async function getCosmosDBDatabase(client: CosmosClient): Promise<Database> {
  const databaseId = process.env.COSMOS_DB_DATABASE_ID || '';
  const database = client.database(databaseId);
  return database;
}

async function getCosmosDBContainer(
  database: Database,
  containerId: string
): Promise<Container> {
  const container = database.container(containerId);
  return container;
}

export async function queryItems<T>(
  container: Container,
  query: SqlQuerySpec
): Promise<T[]> {
  const { resources } = await container.items.query<T>(query).fetchAll();
  return resources;
}

export async function fetchFundDetails(
  fundIds: string[]
): Promise<FundDetails[] | null> {
  const userId = await getUserId();

  const client = await getCosmosDBClient();
  const db = await getCosmosDBDatabase(client);
  const container = await getCosmosDBContainer(db, 'allocations-db');

  const querySpec: SqlQuerySpec = {
    query:
      'SELECT VALUE f FROM c JOIN f IN c.funds WHERE c.id = @userId AND ARRAY_CONTAINS(@fundIds, f.id)',
    parameters: [
      { name: '@userId', value: userId },
      { name: '@fundIds', value: fundIds },
    ],
  };

  const results = await queryItems<FundDetails>(container, querySpec);

  if (results.length > 0) {
    return results;
  } else {
    return null;
  }
}

export async function addFund(
  userId: string,
  fundDetails: FundDetails
): Promise<boolean> {
  const client = await getCosmosDBClient();
  const db = await getCosmosDBDatabase(client);
  const container = await getCosmosDBContainer(db, 'allocations-db');

  try {
    // Check if user document exists
    const { resource: existingUser } = await container
      .item(userId, userId)
      .read();

    if (existingUser) {
      // User exists, add fund to funds array
      const updatedFunds = existingUser.funds
        ? [...existingUser.funds, fundDetails]
        : [fundDetails];
      await container.item(userId, userId).replace({
        ...existingUser,
        funds: updatedFunds,
      });
    } else {
      // User doesn't exist, create new document
      await container.items.create({
        id: userId,
        userId,
        funds: [fundDetails],
      });
    }
    return true;
  } catch (error) {
    console.error('Error adding fund:', error);
    return false;
  }
}

export async function addTransaction(
  userId: string,
  fundId: string,
  transaction: TransactionDetails
): Promise<boolean> {
  const container = await getAllocationsDbContext();

  try {
    // Check if user document exists
    const { resource: existingUser } = await container
      .item(userId, userId)
      .read();

    if (existingUser) {
      // User exists, add transaction to fund
      let fundFound = false;
      const updatedFunds = existingUser.funds.map((fund: FundDetails) => {
        if (fund.id === fundId) {
          fundFound = true;

          // calculate the new current amount
          let newCurrentAmount = fund.currentAmount;
          if (
            transaction.type === 'deposit' ||
            transaction.type === 'transfer'
          ) {
            newCurrentAmount += transaction.value;
          } else if (transaction.type === 'withdrawal') {
            newCurrentAmount -= transaction.value;
          }

          return {
            ...fund,
            currentAmount: newCurrentAmount,
            transactions: [...(fund.transactions || []), transaction],
          };
        }

        return fund;
      });

      if (!fundFound) {
        console.error('Fund not found when adding transaction');
        return false;
      }

      await container.item(userId, userId).replace({
        ...existingUser,
        funds: updatedFunds,
      });
    } else {
      // User doesn't exist, create new document
      console.error('User not found when adding transaction');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error adding fund:', error);
    return false;
  }
}

export async function getAllocationsDbContext(): Promise<Container> {
  const client = await getCosmosDBClient();
  const db = await getCosmosDBDatabase(client);
  const container = await getCosmosDBContainer(db, 'allocations-db');
  return container;
}

export async function getUserData(): Promise<UserData | null> {
  const session = await auth0.getSession();
  if (!session) {
    return null;
  }

  const { user } = session;
  if (!user?.sub) {
    return null;
  }

  const container = await getAllocationsDbContext();
  const querySpec: SqlQuerySpec = {
    query: 'SELECT * FROM c WHERE c.id = @id',
    parameters: [{ name: '@id', value: user.sub }],
  };

  const { resources } = await container.items
    .query<UserData>(querySpec)
    .fetchAll();
  console.log(resources);
  return resources.length > 0 ? resources[0] : null;
}
