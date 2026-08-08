/// <reference types="vite/client" />
import React from 'react';

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_CLERK_PUBLISHABLE_KEY: string;
  readonly VITE_ADMIN_USER_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
