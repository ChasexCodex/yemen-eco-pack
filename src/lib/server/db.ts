import { Pool } from "pg";

declare global {
  var __biopakPool: Pool | undefined;
}

function normalizeEnvValue(value: string | undefined) {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

function isValidPostgresUrl(value: string) {
  try {
    new URL(value, "postgres://base");
    return true;
  } catch {
    return false;
  }
}

function normalizePostgresUrl(value: string) {
  if (isValidPostgresUrl(value)) {
    return value;
  }

  const match = value.match(/^(postgres(?:ql)?:\/\/)([^:\/?#@]+):([^@]+)@(.+)$/i);
  if (!match) {
    throw new Error("DATABASE_URL is not a valid URL");
  }

  const [, prefix, username, rawPassword, hostAndPath] = match;
  const decodedPassword = (() => {
    try {
      return decodeURIComponent(rawPassword);
    } catch {
      return rawPassword;
    }
  })();

  const encoded = `${prefix}${username}:${encodeURIComponent(decodedPassword)}@${hostAndPath}`;
  if (!isValidPostgresUrl(encoded)) {
    throw new Error("DATABASE_URL is not a valid URL");
  }

  return encoded;
}

function maybeUseSupabasePooler(value: string) {
  const explicitPooler = normalizeEnvValue(process.env.SUPABASE_DB_POOLER_URL);
  if (explicitPooler) {
    return normalizePostgresUrl(explicitPooler);
  }

  const parsed = new URL(value, "postgres://base");
  const hostMatch = parsed.hostname.match(/^db\.([a-z0-9]+)\.supabase\.co$/i);
  if (!hostMatch) {
    return value;
  }

  const projectRef =
    normalizeEnvValue(process.env.SUPABASE_PROJECT_REF) ?? hostMatch[1];
  const region = normalizeEnvValue(process.env.SUPABASE_DB_REGION) ?? "ap-northeast-2";
  const poolerHost =
    normalizeEnvValue(process.env.SUPABASE_POOLER_HOST) ??
    `aws-0-${region}.pooler.supabase.com`;
  const poolerPort = normalizeEnvValue(process.env.SUPABASE_POOLER_PORT) ?? "6543";

  const decodedUser = decodeURIComponent(parsed.username);
  if (!decodedUser.includes(".")) {
    parsed.username = `${decodedUser}.${projectRef}`;
  }

  parsed.hostname = poolerHost;
  parsed.port = poolerPort;

  return parsed.toString();
}

function resolveConnectionString() {
  const directUrl = normalizeEnvValue(process.env.DIRECT_DATABASE_URL);
  let url = normalizeEnvValue(process.env.DATABASE_URL);

  if (url?.match(/^\$\{([A-Z0-9_]+)\}$/)) {
    const key = url.slice(2, -1);
    url = normalizeEnvValue(process.env[key]) ?? url;
  }

  if ((!url || url === "${DIRECT_DATABASE_URL}") && directUrl) {
    url = directUrl;
  }

  if (!url) {
    throw new Error("DATABASE_URL must be set");
  }

  if (!/^postgres(ql)?:\/\//i.test(url)) {
    throw new Error("DATABASE_URL must be a postgres connection URL");
  }

  return maybeUseSupabasePooler(normalizePostgresUrl(url));
}

const connectionString = resolveConnectionString();

export const dbPool =
  global.__biopakPool ??
  new Pool({
    connectionString,
    max: 10,
  });

if (process.env.NODE_ENV !== "production") {
  global.__biopakPool = dbPool;
}

