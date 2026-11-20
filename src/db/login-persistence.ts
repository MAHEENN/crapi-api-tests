import { Client } from 'pg';

export async function readStoredLogin(
  email: string,
  databaseUrl: string,
  token: string,
) {
  let client: Client | undefined;
  try {
    client = new Client({
      connectionString: databaseUrl,
      connectionTimeoutMillis: 5_000,
      query_timeout: 5_000,
      statement_timeout: 4_000,
      options: '-c default_transaction_read_only=on',
    });
    await client.connect();
    const mode = await client.query<{ transaction_read_only: string }>(
      'SHOW transaction_read_only',
    );
    if (mode.rows[0]?.transaction_read_only !== 'on') {
      throw new Error('PostgreSQL session must be read-only.');
    }
    const { rows } = await client.query<{ jwt_token: string | null }>(
      'SELECT jwt_token FROM public.user_login WHERE email = $1 LIMIT 2',
      [email],
    );
    return {
      rowCount: rows.length,
      tokenMatches: rows.length === 1 && rows[0].jwt_token === token,
    };
  } catch (error) {
    throw new Error(
      'PostgreSQL verification failed. Check connectivity, read-only mode and column grants.',
      { cause: error },
    );
  } finally {
    await client?.end().catch(() => {
      throw new Error('Could not close the PostgreSQL connection.');
    });
  }
}
