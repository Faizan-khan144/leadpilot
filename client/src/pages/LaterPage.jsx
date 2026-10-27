import { Construction, Sparkles } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'

export const LaterPage = ({ title }) => (
  <div className="space-y-5">
    <PageHeader
      eyebrow="Live workspace"
      title={title}
      description="This route is connected to the live LeadPilot shell. The detailed workflow is being completed next."
    />
    <div className="panel grid min-h-[420px] place-items-center p-8 text-center">
      <div className="max-w-md">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[var(--accent-soft)] text-orange-500">
          <Construction className="h-6 w-6" />
        </span>
        <h2 className="mt-5 text-lg font-bold tracking-[-0.03em]">{title} is next</h2>
        <p className="mt-2 text-[12px] leading-relaxed text-muted">
          The authentication, organization context, navigation, theme and live API connection are working.
          This feature view is being finished in the current development pass.
        </p>
        <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-app px-3 py-1.5 text-[10.5px] text-muted">
          <Sparkles className="h-3 w-3 text-orange-500" />
          Hot reload is enabled
        </div>
      </div>
    </div>
  </div>
)
