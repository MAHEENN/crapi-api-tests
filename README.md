# crAPI API automation

Playwright and TypeScript tests for the OWASP crAPI login contract and its PostgreSQL persistence. The suite targets a controlled crAPI lab with dedicated test accounts. The PostgreSQL scenario builds on Investigation 007, which observed a stored token after login. This test checks the stronger invariant that the exact token returned by the API is visible to a separate database connection.

## Quick start

1. Use Node.js 26 (`nvm use` if you use nvm) and run `npm ci`. API tests do not need browser binaries.
2. Start an [OWASP crAPI lab](https://github.com/OWASP/crAPI/blob/develop/docs/setup.md) with the gateway bound to loopback if running locally. Check gateway readiness at `http://localhost:8888/health`.
3. Create a dedicated, active test account without MFA in the lab. Copy `.env.example` to `.env` and enter the account values there or inject them through the shell or a secret store. Shell environment values take precedence. The default base URL is `http://localhost:8888`. Remote lab URLs require HTTPS with trusted certificates.
4. Run `npm test`.

| Command                                   | Purpose                                                                      |
| ----------------------------------------- | ---------------------------------------------------------------------------- |
| `npm test`                                | Run the positive and negative login tests against crAPI.                     |
| `npm run test:integration`                | Run the API-to-PostgreSQL test with its own fixture and database connection. |
| `npm run test:list`                       | Discover both projects without a service or credentials.                     |
| `npm run check`                           | Run type checking, linting, format verification, and test discovery.         |
| `npm run typecheck` / `npm run lint`      | Run the individual static checks.                                            |
| `npm run format` / `npm run format:check` | Apply or verify Prettier formatting.                                         |

## Structure and coverage

| Path                               | Responsibility                                                                             |
| ---------------------------------- | ------------------------------------------------------------------------------------------ |
| `src/api/`                         | Endpoint calls, typed request and response contracts, and runtime response classification. |
| `src/config/`, `src/data/`         | Environment handling and test-account construction.                                        |
| `src/db/`                          | Bounded, parameterized read of the login persistence record.                               |
| `tests/api/`, `tests/integration/` | Scenarios and assertions for the two Playwright projects.                                  |

The positive test checks HTTP 200, a compact three-part JWT, Bearer type, the success message, and the absence of an MFA challenge. The negative case supplies one random incorrect password for the dedicated account and checks HTTP 401, the invalid-credentials message, and the absence of an issued token. These expectations were reviewed against crAPI source revision `b5fc307`. The JWT format assertion covers shape only. Signature verification, revocation, MFA flows, and broader endpoint coverage are outside this suite.

The lockfile and `.nvmrc` keep installs repeatable. TypeScript 6 is within the supported range of typescript-eslint. The strict type check runs separately because Playwright discovers and runs TypeScript without checking its types. ESLint covers code-quality rules and Prettier owns formatting.

## PostgreSQL integration

Set `CRAPI_INTEGRATION_EMAIL` and `CRAPI_INTEGRATION_PASSWORD` for a second dedicated account. Give this test exclusive use of the account while it runs, since another login can overwrite the stored token. Provide `CRAPI_DATABASE_URL` for a restricted PostgreSQL role, through a local private connection or trusted encrypted connection. The official Compose stack keeps PostgreSQL on its internal network by default. Prefer running the test from a runner on the lab network or using a loopback-only connection to the lab.

Have a lab administrator provision the role securely. It needs database CONNECT, schema USAGE, and column-level SELECT on `public.user_login(email, jwt_token)`. Verify its effective grants, including inherited and PUBLIC grants. Use no write or ownership grants. The test requests and checks a read-only session in addition to the role restrictions. It reads at most two matching rows to detect duplicates and reports only row count and token equality. The exact match is a point-in-time observation of persistence. It provides no evidence of token revocation or the implementation's transaction boundaries.

## CI and debugging

GitHub Actions runs a clean install, type checking, linting, formatting verification, and discovery for both projects. Pull request jobs require neither credentials nor crAPI. Live tests can be added to a separate job when an isolated lab, readiness check, and fixture provisioning are available. The current workflow uploads no artifacts.

For a login failure, check the base URL and gateway health, then confirm the fixture can log in on the deployed build. HTTP status and contract outcome identify which check failed. For a persistence failure, check connectivity, read-only role permissions, and competing use of the fixture account. Server-side logs can contain sensitive data. Treat them as private and redact any diagnostic excerpts before sharing.

Traces, screenshots, and video are disabled. Client and database failures use fixed diagnostic messages, and assertions report only status, contract outcome, row count, or equality. Keep verbose Node and Playwright debugging off for credentialed runs. Ignored files include local env files and generated test output. Before committing, review the staged diff for credentials, tokens, connection strings, or copied payloads. Git ignore rules cover known file paths and can be bypassed by force-adding or pasting into tracked files.
