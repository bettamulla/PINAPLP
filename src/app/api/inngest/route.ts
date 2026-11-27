// Vercel Cron route — secured by CRON_SECRET env var
// Replace: Inngest serve handler with Vercel Cron endpoint
export const dynamic = 'force-dynamic'
export const revalidate = 0

// Cron handler — verify CRON_SECRET for security
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  const url = new URL(request.url)

  if (url.pathname === '/api/cron') {
    const providedSecret = url.searchParams.get('secret')

    if (!secret || providedSecret !== secret) {
      return new Response('Unauthorized', { status: 401 })
    }
  }

  // Return a simple success response for cron pings
  return new Response('Cron triggered successfully', { status: 200 })
}

export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET
  const url = new URL(request.url)
  const providedSecret = url.searchParams.get('secret')

  if (!secret || providedSecret !== secret) {
    return new Response('Unauthorized', { status: 401 })
  }

  // Process the cron job — verify secret and trigger
  return new Response(JSON.stringify({ status: 'triggered' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

export const PUT = async (request: Request) => {
  const secret = process.env.CRON_SECRET
  const url = new URL(request.url)
  const providedSecret = url.searchParams.get('secret')

  if (!secret || providedSecret !== secret) {
    return new Response('Unauthorized', { status: 401 })
  }

  // Update resource — verify secret and return success
  return new Response(JSON.stringify({ status: 'updated' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}