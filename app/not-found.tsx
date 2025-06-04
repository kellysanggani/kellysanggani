import { AppProviders } from "@/components/providers/app-providers"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default function NotFound() {
  return (
    <AppProviders>
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 text-center">
          <div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">404 - Page Not Found</h2>
            <p className="mt-2 text-sm text-gray-600">The page you're looking for doesn't exist.</p>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </AppProviders>
  )
}
