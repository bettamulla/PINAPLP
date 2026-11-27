import { serve } from 'inngest/next'
import { inngest } from '@/lib/inngest'
import { jobs } from '@/actions/jobs'

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: jobs,
})