import { createClient } from "@supabase/supabase-js";

const storageBucket = process.env.SUPABASE_STORAGE_BUCKET?.trim() || "site-assets";

function getSupabaseUrl() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!url) {
    throw new Error("Supabase URL is not configured");
  }
  return url;
}

function getSupabaseServiceRoleKey() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!key) {
    throw new Error("Supabase service role key is not configured");
  }
  return key;
}

export function getStorageBucketName() {
  return storageBucket;
}

export async function getSupabaseStorageAdminClient() {
  const client = createClient(getSupabaseUrl(), getSupabaseServiceRoleKey(), {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const { data: buckets, error: listError } = await client.storage.listBuckets();
  if (listError) {
    throw new Error(`Unable to access storage buckets: ${listError.message}`);
  }

  const existingBucket = buckets.find((bucket) => bucket.name === storageBucket);

  if (!existingBucket) {
    const { error: createError } = await client.storage.createBucket(storageBucket, {
      public: true,
    });

    if (createError) {
      throw new Error(`Unable to create storage bucket: ${createError.message}`);
    }
  } else if (!existingBucket.public) {
    const { error: updateError } = await client.storage.updateBucket(storageBucket, {
      public: true,
    });

    if (updateError) {
      throw new Error(`Unable to configure storage bucket: ${updateError.message}`);
    }
  }

  return client;
}
