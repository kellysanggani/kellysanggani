export const env = {
  DATABASE_URL: process.env.DATABASE_URL || process.env.POSTGRES_URL || "",
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || "http://localhost:3000",
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || "development-secret",
  NODE_ENV: process.env.NODE_ENV || "development",
}

export const isDevelopment = env.NODE_ENV === "development"
export const isProduction = env.NODE_ENV === "production"
