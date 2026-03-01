declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_SUPABASE_URL: string;
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: string;
    SUPABASE_SECRET_KEY: string;
    CIRCLE_API_KEY: string;
    CIRCLE_ENTITY_SECRET: string;
    ARC_TESTNET_RPC_KEY: string;
  }
}
