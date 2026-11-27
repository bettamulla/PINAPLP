import { authMiddleware } from '@clerk/nextjs/server'

// Skip auth in development if Clerk keys are not configured
const isDev = process.env.NODE_ENV === 'development'
const hasClerkKeys = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY

export default isDev && !hasClerkKeys
  ? () => undefined // No-op middleware for development without Clerk
  : authMiddleware({
      publicRoutes: ['/', '/api/webhooks(.*)'],
      ignoredRoutes: ['/api/webhooks(.*)'],
    })

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}