/// <reference types="vite/client" />

declare interface ImportMeta {
  env: {
    VITE_API_URL?: string;
    VITE_API_KEY?: string;
    [key: string]: string | undefined;
  };
} 