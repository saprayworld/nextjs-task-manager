import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    VERCEL_GIT_COMMIT_SHA: process.env.VERCEL_GIT_COMMIT_SHA,
    VERCEL_GIT_COMMIT_REF: process.env.VERCEL_GIT_COMMIT_REF,
    VERCEL_GIT_COMMIT_MESSAGE: process.env.VERCEL_GIT_COMMIT_MESSAGE,
    VERCEL_GIT_COMMIT_AUTHOR_NAME: process.env.VERCEL_GIT_COMMIT_AUTHOR_NAME,
    VERCEL_GIT_COMMIT_AUTHOR_EMAIL: process.env.VERCEL_GIT_COMMIT_AUTHOR_EMAIL,
    VERCEL_GIT_COMMIT_DATE: process.env.VERCEL_GIT_COMMIT_DATE,
    VERCEL_GIT_COMMIT_URL: process.env.VERCEL_GIT_COMMIT_URL,
    VERCEL_URL: process.env.VERCEL_URL,
    VERCEL_ENV: process.env.VERCEL_ENV,

    NEXT_PUBLIC_VERCEL_URL: process.env.VERCEL_URL,
    NEXT_PUBLIC_VERCEL_ENV: process.env.VERCEL_ENV,
  },
};

export default nextConfig;
