import { ArrowRight, BarChart3, Check, ChevronRight, PhoneCall, ShieldCheck, Sparkles, Users } from 'lucide-react'
import { Link, Outlet } from 'react-router-dom'
import { Logo } from '../../components/Logo'

const features = [
  {
    icon: PhoneCall,
    title: 'Call with context',
    text: 'Every lead, conversation and follow-up in one place.',
  },
  {
    icon: BarChart3,
    title: 'Know what is working',
    text: 'Live pipeline, revenue and team performance from real records.',
  },
  {
    icon: Users,
    title: 'One shared rhythm',
    text: 'Assignments, reminders and manager oversight that stay aligned.',
  },
]

export const AuthLayout = () => (
  <div className="auth-light grid min-h-screen bg-[#fffaf5] lg:grid-cols-[1.02fr_.98fr]">
    <aside className="relative hidden overflow-hidden bg-[#fff4e8] p-10 text-slate-900 lg:flex lg:flex-col lg:justify-between xl:p-14">
      <div className="pointer-events-none absolute inset-0 opacity-60" style={{ backgroundImage: 'radial-gradient(rgba(249,115,22,0.16) 1px, transparent 1px)', backgroundSize: '28px 28px', maskImage: 'radial-gradient(ellipse 80% 70% at 40% 30%, black, transparent)' }} />
      <div className="landing-aurora pointer-events-none absolute -left-24 top-1/4 h-96 w-96 rounded-full bg-orange-200/60 blur-[100px]" />
      <div className="landing-glow pointer-events-none absolute -bottom-24 right-0 h-96 w-96 rounded-full bg-amber-200/50 blur-[100px]" />
      <div className="landing-orbit pointer-events-none absolute right-[12%] top-[16%] hidden h-32 w-32 rounded-full border border-orange-300/50 xl:block" />
      <div className="landing-orbit pointer-events-none absolute right-[14%] top-[19%] hidden h-16 w-16 rounded-full border border-dashed border-amber-400/60 xl:block" style={{ animationDirection: 'reverse', animationDuration: '18s' }} />

      <div className="relative z-10">
        <Link to="/" className="inline-flex">
          <Logo tone="orange" />
        </Link>
      </div>

      <div className="relative z-10 max-w-lg py-12">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/75 px-3 py-1.5 text-[10.5px] font-semibold text-orange-700 shadow-sm backdrop-blur">
          <Sparkles className="h-3 w-3" />
          A calmer operating system for revenue teams
        </div>
        <h1 className="text-[clamp(2.5rem,4.1vw,3.7rem)] font-extrabold leading-[1.01] tracking-[-0.065em] text-slate-950">
          Turn conversations into
          <span className="landing-gradient-text block bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600 bg-[length:220%_auto] bg-clip-text text-transparent">
            closed revenue.
          </span>
        </h1>
        <p className="mt-5 max-w-md text-[13px] leading-relaxed text-slate-600">
          LeadPilot gives every conversation a next step, every deal a clear owner, and every manager a live view of the business.
        </p>

        <div className="mt-9 space-y-4">
          {features.map(({ icon: Icon, title, text }, index) => (
            <div key={title} className="flex gap-3.5" style={{ animationDelay: `${index * 120}ms` }}>
              <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-orange-100 bg-white text-orange-600 shadow-sm">
                <Icon className="h-3.5 w-3.5" />
              </span>
              <div>
                <p className="text-xs font-bold text-slate-800">{title}</p>
                <p className="mt-0.5 text-[11.5px] leading-relaxed text-slate-500">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10">
        <div className="rounded-2xl border border-orange-200/80 bg-white/80 p-4 shadow-[0_20px_50px_rgba(249,115,22,0.08)] backdrop-blur">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">Pipeline overview</p>
            <span className="badge border border-emerald-200 bg-emerald-50 text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Live
            </span>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2.5">
            {[
              ['Interested', ['Summit Fitness', 'Cedar Cafe'], 'bg-orange-50 text-orange-700'],
              ['Proposal', ['Atlas Logistics', 'Harbor Dental'], 'bg-amber-50 text-amber-700'],
              ['Won', ['Juniper Studio'], 'bg-emerald-50 text-emerald-700'],
            ].map(([stage, cards, tone]) => (
              <div key={stage} className="rounded-xl border border-orange-100 bg-white/80 p-2.5">
                <p className={`inline-flex rounded px-1.5 py-0.5 text-[8px] font-bold ${tone}`}>{stage}</p>
                <div className="mt-2 space-y-1.5">
                  {cards.map((card) => (
                    <div key={card} className="rounded-lg border border-orange-50 bg-white p-2 shadow-sm">
                      <p className="truncate text-[8px] font-semibold text-slate-700">{card}</p>
                      <div className="mt-1.5 flex items-center justify-between">
                        <div className="h-1 w-8 rounded-full bg-orange-100" />
                        <span className="h-3 w-3 rounded-full bg-gradient-to-br from-orange-200 to-amber-100" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between rounded-lg bg-orange-50 px-2.5 py-2">
            <span className="text-[8px] font-semibold text-orange-800/70">8 follow-ups due today</span>
            <ArrowRight className="h-3 w-3 text-orange-500" />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[8.5px] font-semibold text-slate-400">
          {['Tenant-isolated', 'Role-aware access', 'Audit-ready'].map((item) => (
            <span key={item} className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3 w-3 text-orange-500" /> {item}</span>
          ))}
        </div>
      </div>
    </aside>

    <main className="relative flex min-h-screen flex-col overflow-hidden bg-[#fffaf5]">
      <div className="landing-float-soft pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-orange-100/60 blur-[90px]" />
      <header className="relative z-10 flex items-center justify-between px-5 py-5 lg:hidden">
        <Logo tone="orange" />
        <Link to="/login" className="text-[11px] font-medium text-slate-500">
          Sign in
        </Link>
      </header>
      <div className="relative z-10 flex flex-1 items-center justify-center px-5 pb-10 pt-4 sm:px-8 lg:px-12">
        <div className="w-full max-w-[430px] animate-fade-in rounded-[26px] border border-orange-100 bg-white/85 p-6 shadow-[0_30px_80px_rgba(249,115,22,0.08)] backdrop-blur-sm sm:p-8">
          <Outlet />
        </div>
      </div>
      <footer className="relative z-10 px-5 py-4 text-center text-[10px] text-slate-400">
        Secure by default · Tenant-isolated data · Built for growing teams
      </footer>
    </main>
  </div>
)

export const AuthHeading = ({ eyebrow, title, description }) => (
  <div className="mb-7">
    {eyebrow && (
      <div className="mb-3 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-orange-600">
        <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
        {eyebrow}
        <ChevronRight className="h-3 w-3" />
      </div>
    )}
    <h2 className="text-[28px] font-extrabold leading-[1.05] tracking-[-0.05em] text-slate-950">{title}</h2>
    {description && <p className="mt-2.5 text-[12.5px] leading-relaxed text-slate-500">{description}</p>}
  </div>
)

export const AuthSuccessNote = ({ children }) => (
  <div className="flex gap-2.5 rounded-xl border border-[var(--success)]/20 bg-[var(--success-soft)] p-3 text-[11.5px] leading-relaxed text-[var(--success)]">
    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" />
    <div>{children}</div>
  </div>
)
