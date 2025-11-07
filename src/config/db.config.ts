export class DbConfig {
  static get endpoint(): string {
    const endpoint = process.env.COSMOS_DB_ENDPOINT;
    if (!endpoint) {
      throw new Error('COSMOS_DB_ENDPOINT is not defined');
    }

    return endpoint;
  }

  static get apiKey(): string {
    const apiKey = process.env.COSMOS_DB_KEY;
    if (!apiKey) {
      throw new Error('COSMOS_DB_KEY is not defined');
    }

    return apiKey;
  }

  static get namespace(): string {
    const namespace = process.env.COSMOS_DB_DATABASE_ID;
    if (!namespace) {
      throw new Error('COSMOS_DB_DATABASE_ID is not defined');
    }

    return namespace;
  }

  static get containerId(): string {
    const containerId = process.env.COSMOS_DB_CONTAINER_ID;
    if (!containerId) {
      throw new Error('COSMOS_DB_CONTAINER_ID is not defined');
    }

    return containerId;
  }
}
