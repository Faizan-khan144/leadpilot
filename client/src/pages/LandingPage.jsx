import { useEffect, useRef, useState } from 'react'
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Bell,
  Building2,
  CalendarClock,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock3,
  Download,
  Eye,
  FileSpreadsheet,
  Filter,
  Flame,
  IndianRupee,
  KanbanSquare,
  Layers,
  ListChecks,
  Lock,
  MapPin,
  Menu,
  MessageSquareText,
  PhoneCall,
  PieChart,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Wallet,
  X,
  Zap,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { JourneyScroll } from '../components/JourneyScroll'
import { Logo } from '../components/Logo'
import { Reveal } from '../components/Reveal'
import { useAuth } from '../context/AuthContext'

const features = [
  {
    icon: Target,
    title: 'Capture every opportunity',
    text: 'Import, deduplicate and assign leads with source, value, priority and ownership kept intact.',
    tag: 'Leads',
  },
  {
    icon: KanbanSquare,
    title: 'A pipeline that actually moves',
    text: 'Drag deals through seven clear stages. Lost reasons are captured, never guessed.',
    tag: 'Pipeline',
  },
  {
    icon: PhoneCall,
    title: 'Calls with full context',
    text: 'Log outcomes, notes and next actions so nobody calls the same prospect twice.',
    tag: 'Calls',
  },
  {
    icon: CalendarClock,
    title: 'Follow-ups that land',
    text: 'Today, overdue and upcoming queues keep commitments visible across the whole team.',
    tag: 'Follow-ups',
  },
  {
    icon: Wallet,
    title: 'Money you can trust',
    text: 'Integer-paise accounting, payment tracking and captured commission rates on every deal.',
    tag: 'Finance',
  },
  {
    icon: BarChart3,
    title: 'Reports from real records',
    text: 'Live source, conversion, revenue and team performance. No manually typed dashboard numbers.',
    tag: 'Analytics',
  },
  {
    icon: Users,
    title: 'The right view for every role',
    text: 'Owners see everything, managers see their pod, lead generators see their assigned queue.',
    tag: 'Access',
  },
  {
    icon: FileSpreadsheet,
    title: 'Bring your data with you',
    text: 'Import lead lists from CSV, export filtered views, and keep your operating history portable.',
    tag: 'Data',
  },
  {
    icon: ShieldCheck,
    title: 'An audit trail you can inspect',
    text: 'Sensitive changes record who did what, when, and the before/after values.',
    tag: 'Trust',
  },
]

const roles = [
  {
    icon: ShieldCheck,
    title: 'Owners',
    text: 'See the full business, control commission policy and approve every payout.',
    bullets: ['Company-wide revenue view', 'Commission policy control', 'Approval + payout trail'],
    tone: 'from-orange-50 to-amber-50 border-orange-100',
  },
  {
    icon: BarChart3,
    title: 'Managers',
    text: 'Coach the team, manage assignments and watch pipeline health in real time.',
    bullets: ['Team pipeline & calls', 'Lead assignment', 'Member performance'],
    tone: 'from-amber-50 to-white border-amber-100',
  },
  {
    icon: Users,
    title: 'Lead generators',
    text: 'Focus on the next call with a clean queue of assigned leads and reminders.',
    bullets: ['Only assigned leads', 'Daily follow-up queue', 'Fast call logging'],
    tone: 'from-white to-orange-50/70 border-slate-200',
  },
]

const steps = [
  { number: '01', title: 'Create your workspace', text: 'Sign up and get a private, multi-tenant organization ready in seconds.' },
  { number: '02', title: 'Bring your leads in', text: 'Import a CSV or add leads manually, then assign owners and priorities.' },
  { number: '03', title: 'Work the pipeline', text: 'Call, follow up, close deals and release commission as payments arrive.' },
]

const industries = [
  {
    icon: Building2,
    title: 'Real estate teams',
    text: 'Long consideration cycles, site visits and high-value follow-ups stay attached to the right property and person.',
  },
  {
    icon: MessageSquareText,
    title: 'Agencies & studios',
    text: 'Turn inbound enquiries into scoped proposals, with every revision, call and decision in one timeline.',
  },
  {
    icon: ShieldCheck,
    title: 'Clinics & wellness',
    text: 'Keep appointment requests, callbacks and treatment enquiries moving without exposing the whole patient list to everyone.',
  },
  {
    icon: Users,
    title: 'Coaching & education',
    text: 'Give counsellors a clean assigned queue, then see which source and conversation pattern produces enrolments.',
  },
  {
    icon: Layers,
    title: 'B2B services',
    text: 'Multi-stakeholder deals, proposals and payment milestones have a shared owner and a visible next step.',
  },
  {
    icon: MapPin,
    title: 'Local businesses',
    text: 'Google Maps leads, walk-in enquiries and referrals become one searchable pipeline instead of scattered notes.',
  },
]

const firstWeek = [
  { day: 'Day 1', title: 'Create the workspace', text: 'Set the organization name and invite the first manager.', icon: Building2 },
  { day: 'Day 2', title: 'Import the lead list', text: 'Bring in a CSV, check the first records and assign owners.', icon: FileSpreadsheet },
  { day: 'Day 3', title: 'Set the rules', text: 'Configure commission bands and reporting lines.', icon: ShieldCheck },
  { day: 'Day 4', title: 'Work the queue', text: 'Log calls, schedule follow-ups and move the pipeline.', icon: PhoneCall },
  { day: 'Day 5', title: 'Review the truth', text: 'Open reports and see where the motion is coming from.', icon: BarChart3 },
]

const pipelinePreview = [
  {
    stage: 'New lead',
    tone: 'bg-slate-100 text-slate-600',
    value: '₹2.4L',
    cards: [
      { name: 'Northstar Interiors', detail: 'Google Maps · High', value: '₹65,000' },
      { name: 'Harbor Dental', detail: 'Referral · Medium', value: '₹48,000' },
    ],
  },
  {
    stage: 'Interested',
    tone: 'bg-orange-100 text-orange-700',
    value: '₹4.1L',
    cards: [
      { name: 'Summit Fitness', detail: 'Call back · Today', value: '₹1,20,000' },
      { name: 'Cedar Cafe', detail: 'LinkedIn · High', value: '₹92,000' },
    ],
  },
  {
    stage: 'Won',
    tone: 'bg-emerald-100 text-emerald-700',
    value: '₹3.8L',
    cards: [
      { name: 'Juniper Studio', detail: 'Paid · Commission ready', value: '₹1,80,000' },
    ],
  },
]

const faqs = [
  {
    q: 'Can I bring my existing lead list?',
    a: 'Yes. LeadPilot supports CSV import with column mapping and duplicate checks against existing phone numbers and emails. Filtered lead views can also be exported back to CSV.',
  },
  {
    q: 'How does the commission engine work?',
    a: 'Each new deal captures the commission band and rate active at the moment it is created. As payments are recorded, earned commission grows. Existing deals keep their captured rate even when the organization policy changes later.',
  },
  {
    q: 'Can lead generators see everyone else’s pipeline?',
    a: 'No. Lead generators see only leads, calls, deals and follow-ups assigned to them. Managers see their own records and their reporting team. Owners see the full organization.',
  },
  {
    q: 'Is each company isolated from the others?',
    a: 'Yes. LeadPilot is multi-tenant by design. Every lead, deal, payment, commission, follow-up and activity belongs to an organization, and the active organization is verified on every request.',
  },
  {
    q: 'What happens after a deal is won?',
    a: 'The linked lead moves to Won, payments can still be recorded against the outstanding balance, and commission continues to release according to your configured basis. Owners then approve and pay out commission in the finance view.',
  },
  {
    q: 'Does it work on a phone?',
    a: 'The entire workspace is responsive. The sidebar becomes a drawer, tables scroll safely, and the pipeline board can be navigated horizontally on smaller screens.',
  },
]

const dayMoments = [
  {
    time: '9:00',
    icon: CalendarClock,
    title: 'The day starts with a queue',
    text: 'Open Follow-ups and see exactly what is due today, what slipped, and what is coming next. No hunting through notes.',
    accent: 'bg-orange-500',
  },
  {
    time: '11:30',
    icon: PhoneCall,
    title: 'Every call has a next step',
    text: 'Log the outcome, duration and notes. Schedule the follow-up in the same flow so the promise does not disappear.',
    accent: 'bg-amber-500',
  },
  {
    time: '14:00',
    icon: KanbanSquare,
    title: 'The pipeline tells the truth',
    text: 'Move a lead to Interested, Meeting Scheduled or Negotiation. Managers see movement as it happens.',
    accent: 'bg-orange-400',
  },
  {
    time: '16:30',
    icon: TrendingUp,
    title: 'Close the loop on money',
    text: 'Record a payment, watch earned commission update, and give the owner a clean approval queue.',
    accent: 'bg-emerald-500',
  },
]

const trustCards = [
  { icon: Lock, title: 'Organization isolation', text: 'Every query is scoped to the active tenant. Cross-company access is rejected at the membership layer.' },
  { icon: Eye, title: 'Role-aware visibility', text: 'Owner, manager and lead-generator scopes are enforced by the API, not hidden only in the UI.' },
  { icon: ListChecks, title: 'Auditable changes', text: 'Sensitive actions capture actor, entity and before/after values for inspection.' },
  { icon: IndianRupee, title: 'Paise-accurate money', text: 'Amounts are stored as integers. Commission math never drifts through floating-point rounding.' },
]

const metricsLine = ['Leads', 'Calls', 'Follow-ups', 'Deals', 'Payments', 'Commission', 'Reports', 'Team', 'Audit']

export const LandingPage = () => {
  const { user } = useAuth()
  const cursorRef = useRef(null)
  const progressRef = useRef(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState(0)
  const startHref = user ? '/dashboard' : '/register'

  useEffect(() => {
    let frame = 0
    const onMove = (event) => {
      if (frame) return
      frame = requestAnimationFrame(() => {
        if (cursorRef.current) {
          cursorRef.current.style.transform = `translate3d(${event.clientX - 300}px, ${event.clientY - 300}px, 0)`
        }
        frame = 0
      })
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const max = document.documentElement.scrollHeight - window.innerHeight
      if (progressRef.current) {
        progressRef.current.style.width = `${max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0}%`
      }
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#fffaf5] text-slate-900">
      <div ref={cursorRef} className="pointer-events-none fixed left-0 top-0 z-30 hidden h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,rgba(251,146,60,0.16),rgba(253,186,116,0.05)_45%,transparent_70%)] [will-change:transform] lg:block" style={{ transform: 'translate3d(-1000px, -1000px, 0)' }} />
      <div className="fixed inset-x-0 top-0 z-[60] h-0.5 bg-transparent">
        <div ref={progressRef} className="h-full w-0 bg-gradient-to-r from-orange-400 via-orange-500 to-amber-400" />
      </div>

      <header className="sticky top-0 z-50 border-b border-orange-100/70 bg-[#fffaf5]/95">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link to="/" className="shrink-0">
            <Logo tone="orange" />
          </Link>

          <nav className="hidden items-center gap-7 md:flex">
            <a href="#features" className="text-[12px] font-medium text-slate-600 transition hover:text-orange-600">Features</a>
            <a href="#workspace" className="text-[12px] font-medium text-slate-600 transition hover:text-orange-600">Workspace</a>
            <a href="#pipeline" className="text-[12px] font-medium text-slate-600 transition hover:text-orange-600">Pipeline</a>
            <a href="#commission" className="text-[12px] font-medium text-slate-600 transition hover:text-orange-600">Commission</a>
            <a href="#roles" className="text-[12px] font-medium text-slate-600 transition hover:text-orange-600">For your team</a>
            <a href="#faq" className="text-[12px] font-medium text-slate-600 transition hover:text-orange-600">FAQ</a>
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            {user ? (
              <Link to="/dashboard" className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-orange-500 px-4 text-[11.5px] font-semibold text-white shadow-[0_8px_24px_rgba(249,115,22,0.25)] transition hover:bg-orange-600">
                Open dashboard <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <>
                <Link to="/login" className="rounded-lg px-3 py-2 text-[11.5px] font-medium text-slate-600 transition hover:text-slate-950">Sign in</Link>
                <Link to="/register" className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-orange-500 px-4 text-[11.5px] font-semibold text-white shadow-[0_8px_24px_rgba(249,115,22,0.25)] transition hover:bg-orange-600">
                  Start free <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </>
            )}
          </div>

          <button type="button" className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-600 md:hidden" onClick={() => setMenuOpen((current) => !current)} aria-label="Toggle menu">
            {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-slate-200 bg-white px-5 py-4 md:hidden">
            <div className="flex flex-col gap-1">
              {[['Features', '#features'], ['Workspace', '#workspace'], ['Pipeline', '#pipeline'], ['Commission', '#commission'], ['For your team', '#roles'], ['FAQ', '#faq']].map(([label, href]) => (
                <a key={href} href={href} onClick={() => setMenuOpen(false)} className="rounded-lg px-2 py-2.5 text-[12px] font-medium text-slate-600 hover:bg-orange-50 hover:text-orange-600">{label}</a>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
              <Link to={user ? '/dashboard' : '/login'} className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 text-[11.5px] font-medium text-slate-700">{user ? 'Dashboard' : 'Sign in'}</Link>
              <Link to={startHref} className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-orange-500 text-[11.5px] font-semibold text-white">Start free <ArrowRight className="h-3.5 w-3.5" /></Link>
            </div>
          </div>
        )}
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: 'linear-gradient(to right, rgba(15,23,42,0.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,23,42,0.045) 1px, transparent 1px)', backgroundSize: '48px 48px', maskImage: 'radial-gradient(ellipse 75% 65% at 50% 20%, black, transparent)' }} />
          <div className="landing-glow pointer-events-none absolute -right-40 -top-40 h-[36rem] w-[36rem] rounded-full bg-orange-200/55 blur-[120px]" />
          <div className="landing-float-soft pointer-events-none absolute -left-52 top-56 h-[28rem] w-[28rem] rounded-full bg-amber-100/70 blur-[110px]" />
          <div className="landing-aurora pointer-events-none absolute bottom-0 left-1/3 h-[24rem] w-[24rem] rounded-full bg-orange-100/60 blur-[100px]" />
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
            {[
              'left-[5%] top-[18%] h-2 w-2 bg-orange-300/70',
              'left-[14%] top-[72%] h-1.5 w-1.5 bg-amber-400/70',
              'left-[29%] top-[12%] h-1 w-1 bg-orange-400/60',
              'left-[38%] top-[84%] h-2.5 w-2.5 bg-orange-200/70',
              'left-[52%] top-[9%] h-1.5 w-1.5 bg-amber-300/70',
              'left-[63%] top-[76%] h-1 w-1 bg-orange-400/60',
              'left-[72%] top-[16%] h-2 w-2 bg-orange-300/60',
              'left-[86%] top-[62%] h-2.5 w-2.5 bg-amber-300/50',
              'left-[93%] top-[28%] h-1.5 w-1.5 bg-orange-400/60',
              'left-[47%] top-[46%] h-1 w-1 bg-orange-300/60',
            ].map((particle, index) => (
              <span
                key={particle}
                className={`landing-float absolute rounded-full ${particle}`}
                style={{ animationDelay: `${index * 340}ms`, animationDuration: `${6 + (index % 4)}s` }}
              />
            ))}
          </div>
          <div className="landing-orbit pointer-events-none absolute right-[8%] top-[13%] hidden h-28 w-28 rounded-full border border-orange-200/60 lg:block" />
          <div className="landing-orbit pointer-events-none absolute right-[10%] top-[16%] hidden h-16 w-16 rounded-full border border-dashed border-amber-300/60 lg:block" style={{ animationDirection: 'reverse', animationDuration: '18s' }} />

          <div className="relative mx-auto grid max-w-7xl gap-14 px-5 pb-20 pt-16 sm:px-8 sm:pt-20 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:gap-10 lg:pb-28 lg:pt-24">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-[10.5px] font-semibold text-orange-700">
                <Sparkles className="h-3 w-3" />
                The CRM built for how sales teams actually work
              </div>
              <h1 className="mt-6 max-w-[660px] text-[clamp(2.9rem,5.8vw,5.4rem)] font-extrabold leading-[0.96] tracking-[-0.068em] text-slate-950">
                Turn cold leads into
                <span className="landing-gradient-text relative ml-2 inline-block bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600 bg-[length:220%_auto] bg-clip-text text-transparent">
                  closed revenue.
                  <svg className="absolute -bottom-3 left-0 w-full" viewBox="0 0 300 12" fill="none" aria-hidden="true">
                    <path d="M2 9C61 3 188 2 298 6" stroke="#fdba74" strokeWidth="4" strokeLinecap="round" />
                  </svg>
                </span>
              </h1>
              <p className="mt-8 max-w-xl text-[14px] leading-relaxed text-slate-600 sm:text-[15px]">
                LeadPilot keeps your leads, calls, follow-ups, deals and commissions in one clean workspace — with every next step owned by a real person.
              </p>

              <div className="mt-9 flex flex-col gap-2.5 sm:flex-row">
                <Link to={startHref} className="landing-scan group inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-orange-500 px-7 text-[12.5px] font-bold text-white shadow-[0_16px_40px_rgba(249,115,22,0.3)] transition hover:-translate-y-0.5 hover:bg-orange-600">
                  {user ? 'Open your dashboard' : 'Create your workspace'} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </Link>
                <a href="#how-it-works" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 text-[12.5px] font-semibold text-slate-700 transition hover:border-orange-200 hover:text-orange-600">
                  See how it works <ChevronRight className="h-4 w-4" />
                </a>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2">
                {['No credit card required', 'Private workspace', 'Set up in minutes'].map((item) => (
                  <span key={item} className="inline-flex items-center gap-1.5 text-[10.5px] font-medium text-slate-500">
                    <span className="grid h-4 w-4 place-items-center rounded-full bg-orange-100 text-orange-600"><Check className="h-2.5 w-2.5" strokeWidth={3} /></span>
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[610px] lg:mx-0">
              <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-orange-200/60 via-amber-100/40 to-transparent blur-2xl" />
              <div className="landing-float relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_40px_100px_rgba(15,23,42,0.18)]">
                <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3">
                  <span className="h-2 w-2 rounded-full bg-red-300" />
                  <span className="h-2 w-2 rounded-full bg-amber-300" />
                  <span className="h-2 w-2 rounded-full bg-emerald-300" />
                  <div className="ml-2 flex flex-1 items-center gap-2 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[8.5px] text-slate-400">
                    <Lock className="h-2.5 w-2.5" /> app.leadpilot.com/dashboard
                  </div>
                </div>

                <div className="flex">
                  <div className="hidden w-[118px] shrink-0 border-r border-slate-100 bg-slate-50/70 p-3 sm:block">
                    <div className="flex items-center gap-1.5">
                      <span className="grid h-5 w-5 place-items-center rounded-md bg-orange-500 text-white"><Target className="h-2.5 w-2.5" /></span>
                      <span className="text-[8.5px] font-bold text-slate-700">LeadPilot</span>
                    </div>
                    <div className="mt-5 space-y-1">
                      {['Overview', 'Leads', 'Pipeline', 'Calls', 'Follow-ups', 'Deals', 'Commissions'].map((item, index) => (
                        <div key={item} className={`rounded-md px-2 py-1.5 text-[7.5px] font-medium ${index === 2 ? 'bg-orange-100 text-orange-700' : 'text-slate-400'}`}>{item}</div>
                      ))}
                    </div>
                    <div className="mt-6 rounded-lg border border-orange-100 bg-orange-50 p-2">
                      <p className="text-[6px] font-semibold uppercase tracking-[0.06em] text-orange-500">Live</p>
                      <p className="mt-1 text-[6.5px] leading-relaxed text-orange-800/70">Every change appears in the audit trail.</p>
                    </div>
                  </div>

                  <div className="min-w-0 flex-1 bg-[#fafaf9] p-3 sm:p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-[7.5px] font-semibold uppercase tracking-[0.08em] text-orange-500">Pipeline</p>
                        <p className="mt-0.5 text-[13px] font-bold tracking-[-0.03em] text-slate-900">Deals in motion</p>
                      </div>
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-[7px] font-semibold text-emerald-700"><span className="h-1 w-1 rounded-full bg-emerald-500" /> Live</span>
                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {pipelinePreview.map((column) => (
                        <div key={column.stage} className="rounded-lg border border-slate-200 bg-white p-1.5">
                          <div className="flex items-center justify-between gap-1">
                            <span className={`rounded px-1 py-0.5 text-[6.5px] font-bold ${column.tone}`}>{column.stage}</span>
                            <span className="text-[6px] font-medium text-slate-400">{column.value}</span>
                          </div>
                          <div className="mt-1.5 space-y-1.5">
                            {column.cards.map((card) => (
                              <div key={card.name} className="rounded-md border border-slate-100 bg-white p-1.5 shadow-sm">
                                <p className="truncate text-[7px] font-semibold text-slate-700">{card.name}</p>
                                <p className="mt-0.5 truncate text-[5.8px] text-slate-400">{card.detail}</p>
                                <div className="mt-1 flex items-center justify-between">
                                  <span className="text-[6.5px] font-bold text-slate-700">{card.value}</span>
                                  <span className="h-3.5 w-3.5 rounded-full bg-orange-100" />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {[
                        ['Follow-ups due', '12'],
                        ['Won this month', '₹3.8L'],
                        ['Commission earned', '₹68K'],
                      ].map(([label, value]) => (
                        <div key={label} className="rounded-lg border border-slate-200 bg-white p-2">
                          <p className="text-[5.8px] text-slate-400">{label}</p>
                          <p className="mt-0.5 text-[9px] font-bold tracking-[-0.02em] text-slate-800">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="landing-float-soft absolute -bottom-5 -left-3 flex items-center gap-2 rounded-xl border border-orange-100 bg-white px-3 py-2 shadow-[0_16px_40px_rgba(15,23,42,0.14)] sm:-left-7">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-50 text-emerald-600"><BadgeCheck className="h-4 w-4" /></span>
                <div>
                  <p className="text-[8px] font-semibold text-slate-800">Payment recorded</p>
                  <p className="text-[7px] text-slate-400">Commission recalculated</p>
                </div>
              </div>
              <div className="absolute -right-2 -top-5 hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-[0_16px_40px_rgba(15,23,42,0.1)] sm:flex">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-orange-50 text-orange-600"><Bell className="h-3.5 w-3.5" /></span>
                <div>
                  <p className="text-[8px] font-semibold text-slate-800">3 follow-ups due</p>
                  <p className="text-[7px] text-slate-400">Today’s queue is ready</p>
                </div>
              </div>
            </div>
          </div>
          <div className="pointer-events-none absolute bottom-5 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-1.5 lg:flex">
            <span className="text-[8px] font-bold uppercase tracking-[0.14em] text-orange-900/30">Scroll to explore</span>
            <span className="landing-cue grid h-7 w-7 place-items-center rounded-full border border-orange-200/80 bg-white/60 text-orange-500 backdrop-blur"><ChevronDown className="h-3.5 w-3.5" /></span>
          </div>
        </section>

        <div className="overflow-hidden border-y border-slate-200 bg-orange-50/60 py-3.5">
          <div className="landing-marquee-track flex w-max items-center gap-8">
            {[...metricsLine, ...metricsLine].map((item, index) => (
              <span key={`${item}-${index}`} className="flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-[0.13em] text-orange-900/45">
                <span className="landing-ticker-dot h-1.5 w-1.5 rounded-full bg-orange-400" style={{ animationDelay: `${index * 120}ms` }} />
                {item}
              </span>
            ))}
          </div>
        </div>

        <section className="relative overflow-hidden bg-white">
          <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-[42rem] -translate-x-1/2 rounded-full bg-orange-100/50 blur-[80px]" />
          <div className="relative mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
            <Reveal className="mx-auto max-w-2xl text-center">
              <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-orange-600">Why teams switch</p>
              <h2 className="mt-3 text-[clamp(2.1rem,4.2vw,3.5rem)] font-extrabold leading-[1.03] tracking-[-0.06em] text-slate-950">
                Stop stitching your day<br />together with tabs.
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-[13px] leading-relaxed text-slate-600">
                Spreadsheets, call notes, chat reminders and a separate commission file all tell a different story. LeadPilot gives the team one shared version of the truth.
              </p>
            </Reveal>

            <div className="mt-12 grid gap-4 lg:grid-cols-2">
              <Reveal>
                <div className="h-full rounded-2xl border border-slate-200 bg-slate-50/70 p-6 sm:p-7">
                  <div className="flex items-center gap-2">
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-slate-200 text-slate-500"><X className="h-4 w-4" /></span>
                    <p className="text-[12px] font-bold text-slate-700">Without a shared system</p>
                  </div>
                  <div className="mt-6 space-y-4">
                    {[
                      'Leads live in three spreadsheets and someone’s WhatsApp.',
                      'Follow-ups disappear when the spreadsheet is closed.',
                      'Managers ask for updates that are already stale.',
                      'Commission is rebuilt manually at month-end.',
                      'Nobody can explain why a deal was marked lost.',
                    ].map((item) => (
                      <div key={item} className="flex gap-3">
                        <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-slate-200 text-slate-500"><X className="h-3 w-3" /></span>
                        <p className="text-[11.5px] leading-relaxed text-slate-500">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
              <Reveal delay={120}>
                <div className="relative h-full overflow-hidden rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 via-white to-amber-50 p-6 shadow-[0_24px_60px_rgba(249,115,22,0.1)] sm:p-7">
                  <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-orange-200/50 blur-2xl" />
                  <div className="relative flex items-center gap-2">
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-orange-500 text-white shadow-[0_8px_20px_rgba(249,115,22,0.25)]"><Check className="h-4 w-4" /></span>
                    <p className="text-[12px] font-bold text-slate-800">With LeadPilot</p>
                  </div>
                  <div className="relative mt-6 space-y-4">
                    {[
                      'Every lead has an owner, source, value and next step.',
                      'Follow-ups surface before they become apologies.',
                      'Managers see live movement without asking.',
                      'Commission is calculated from actual payments.',
                      'Lost reasons and decisions stay searchable.',
                    ].map((item) => (
                      <div key={item} className="flex gap-3">
                        <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-orange-100 text-orange-600"><Check className="h-3 w-3" strokeWidth={3} /></span>
                        <p className="text-[11.5px] leading-relaxed text-slate-700">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            </div>

            <div className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 sm:grid-cols-4">
              {[
                ['7', 'pipeline stages'],
                ['3', 'role-based views'],
                ['100%', 'audited changes'],
                ['₹', 'paise-accurate finance'],
              ].map(([value, label], index) => (
                <Reveal key={label} delay={index * 80} className="bg-white py-7 text-center lg:py-8">
                  <p className="text-[26px] font-extrabold tracking-[-0.05em] text-slate-950 sm:text-[30px]">{value}</p>
                  <p className="mt-1 text-[9.5px] font-semibold uppercase tracking-[0.08em] text-slate-400">{label}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="border-y border-slate-200 bg-gradient-to-b from-orange-50/70 via-white to-white">
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
            <Reveal className="max-w-2xl">
              <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-orange-600">Everything in one place</p>
              <h2 className="mt-3 text-[clamp(2.1rem,4.2vw,3.5rem)] font-extrabold leading-[1.03] tracking-[-0.06em] text-slate-950">
                Less tab-hopping.<br />More closing.
              </h2>
              <p className="mt-4 text-[13px] leading-relaxed text-slate-600">
                Built around the real rhythm of a revenue team: source, call, follow up, close and get paid.
              </p>
            </Reveal>

            <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {features.map(({ icon: Icon, title, text, tag }, index) => (
                <Reveal key={title} delay={(index % 3) * 90}>
                  <div className="group h-full rounded-2xl border border-slate-200 bg-white p-5 transition duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-[0_20px_50px_rgba(249,115,22,0.1)]">
                    <div className="flex items-start justify-between gap-2">
                      <span className="grid h-10 w-10 place-items-center rounded-xl bg-orange-50 text-orange-600 transition duration-300 group-hover:bg-orange-500 group-hover:text-white">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="rounded-full border border-slate-200 px-2 py-0.5 text-[8.5px] font-semibold text-slate-400">{tag}</span>
                    </div>
                    <h3 className="mt-5 text-[13.5px] font-bold tracking-[-0.02em] text-slate-900">{title}</h3>
                    <p className="mt-2 text-[11.5px] leading-relaxed text-slate-500">{text}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section id="workspace" className="relative overflow-hidden border-y border-orange-100 bg-[#fffaf5]">
          <div className="landing-glow pointer-events-none absolute -left-32 top-24 h-96 w-96 rounded-full bg-orange-200/40 blur-[110px]" />
          <div className="pointer-events-none absolute -right-32 bottom-24 h-96 w-96 rounded-full bg-amber-100/70 blur-[110px]" />
          <div className="relative mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-28">
            <Reveal className="mx-auto max-w-2xl text-center">
              <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-orange-600">Inside the workspace</p>
              <h2 className="mt-3 text-[clamp(2.2rem,4.4vw,3.7rem)] font-extrabold leading-[1.02] tracking-[-0.06em] text-slate-950">
                Three screens that<br />replace the chaos.
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-[13px] leading-relaxed text-slate-600">
                A lead inbox that narrows quickly, a follow-up queue that keeps its promises, and a team view that does not require a status meeting.
              </p>
            </Reveal>

            <div className="mt-20 space-y-20 lg:space-y-28">
              <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
                <Reveal>
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-orange-600">01 · Leads</p>
                  <h3 className="mt-3 text-[clamp(1.8rem,3.2vw,2.8rem)] font-extrabold leading-[1.05] tracking-[-0.055em] text-slate-950">Find the right lead<br />before the next call.</h3>
                  <p className="mt-4 max-w-md text-[12.5px] leading-relaxed text-slate-600">Filter by status, source, priority, owner or estimated value. Search across names, companies and notes without exporting anything.</p>
                  <div className="mt-6 space-y-2.5">
                    {['Server-side search and filters', 'Assigned-only views for lead generators', 'Deduplication on import'].map((item) => (
                      <div key={item} className="flex items-center gap-2.5 text-[11px] font-medium text-slate-600">
                        <span className="grid h-5 w-5 place-items-center rounded-full bg-orange-100 text-orange-600"><Check className="h-3 w-3" strokeWidth={3} /></span>
                        {item}
                      </div>
                    ))}
                  </div>
                </Reveal>
                <Reveal delay={120}>
                  <div className="relative">
                    <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-orange-200/40 to-transparent blur-2xl" />
                    <div className="relative rounded-2xl border border-orange-100 bg-white p-4 shadow-[0_30px_80px_rgba(249,115,22,0.1)] sm:p-5">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="text-[8px] font-bold uppercase tracking-[0.1em] text-orange-500">Leads</p>
                          <p className="mt-0.5 text-[14px] font-bold tracking-[-0.03em] text-slate-900">All opportunities</p>
                        </div>
                        <span className="rounded-lg bg-orange-500 px-2.5 py-1.5 text-[8px] font-bold text-white">Add lead</span>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <div className="flex flex-1 items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-2 text-[8px] text-slate-400"><Search className="h-3 w-3" /> Search leads, companies, notes...</div>
                        <span className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 text-[8px] text-slate-500"><Filter className="h-3 w-3" /> Filters</span>
                      </div>
                      <div className="mt-3 overflow-hidden rounded-xl border border-slate-100">
                        <div className="grid grid-cols-[1.5fr_0.8fr_0.9fr_0.6fr] gap-2 bg-slate-50 px-3 py-2 text-[6.5px] font-bold uppercase tracking-[0.07em] text-slate-400">
                          <span>Lead</span><span>Source</span><span>Status</span><span className="text-right">Value</span>
                        </div>
                        {[
                          ['Summit Fitness', 'Referral', 'Interested', '₹1.2L', 'bg-orange-100 text-orange-700'],
                          ['Cedar Cafe', 'Google Maps', 'Contacted', '₹45K', 'bg-sky-100 text-sky-700'],
                          ['Atlas Logistics', 'LinkedIn', 'Proposal', '₹2.4L', 'bg-amber-100 text-amber-700'],
                          ['Juniper Studio', 'Website', 'Won', '₹1.8L', 'bg-emerald-100 text-emerald-700'],
                          ['Northstar Interiors', 'Referral', 'New Lead', '₹80K', 'bg-slate-100 text-slate-600'],
                        ].map(([name, source, status, value, tone], index) => (
                          <div key={name} className={`grid grid-cols-[1.5fr_0.8fr_0.9fr_0.6fr] items-center gap-2 border-t border-slate-100 px-3 py-2.5 ${index === 0 ? 'bg-orange-50/40' : ''}`}>
                            <div className="flex min-w-0 items-center gap-2"><span className="h-5 w-5 shrink-0 rounded-full bg-gradient-to-br from-orange-200 to-amber-100" /><span className="truncate text-[8px] font-semibold text-slate-700">{name}</span></div>
                            <span className="truncate text-[7.5px] text-slate-400">{source}</span>
                            <span><span className={`rounded px-1.5 py-0.5 text-[6.5px] font-bold ${tone}`}>{status}</span></span>
                            <span className="text-right text-[8px] font-bold text-slate-700">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Reveal>
              </div>

              <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
                <Reveal className="lg:order-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-orange-600">02 · Follow-ups</p>
                  <h3 className="mt-3 text-[clamp(1.8rem,3.2vw,2.8rem)] font-extrabold leading-[1.05] tracking-[-0.055em] text-slate-950">The queue that keeps<br />the promise.</h3>
                  <p className="mt-4 max-w-md text-[12.5px] leading-relaxed text-slate-600">Today, overdue and upcoming are separated automatically. Completing a follow-up asks for the outcome and the next date, so the record never goes cold.</p>
                  <div className="mt-6 space-y-2.5">
                    {['Overdue work is impossible to miss', 'Complete or reschedule with context', 'Every action lands in the timeline'].map((item) => (
                      <div key={item} className="flex items-center gap-2.5 text-[11px] font-medium text-slate-600">
                        <span className="grid h-5 w-5 place-items-center rounded-full bg-orange-100 text-orange-600"><Check className="h-3 w-3" strokeWidth={3} /></span>
                        {item}
                      </div>
                    ))}
                  </div>
                </Reveal>
                <Reveal delay={120} className="lg:order-1">
                  <div className="relative">
                    <div className="landing-float-soft absolute -left-6 -top-6 h-40 w-40 rounded-full bg-orange-200/40 blur-2xl" />
                    <div className="relative rounded-2xl border border-orange-100 bg-white p-4 shadow-[0_30px_80px_rgba(249,115,22,0.1)] sm:p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[8px] font-bold uppercase tracking-[0.1em] text-orange-500">Follow-ups</p>
                          <p className="mt-0.5 text-[14px] font-bold tracking-[-0.03em] text-slate-900">Today’s queue</p>
                        </div>
                        <span className="rounded-full bg-red-50 px-2 py-1 text-[7px] font-bold text-red-600">3 overdue</span>
                      </div>
                      <div className="mt-4 flex gap-1.5">
                        {[['Overdue', '3'], ['Today', '8'], ['Upcoming', '14']].map(([label, count], index) => (
                          <span key={label} className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border py-1.5 text-[7.5px] font-semibold ${index === 1 ? 'border-orange-200 bg-orange-50 text-orange-700' : 'border-slate-100 text-slate-400'}`}>{label}<span className={`rounded-full px-1.5 ${index === 1 ? 'bg-orange-500 text-white' : 'bg-slate-100'}`}>{count}</span></span>
                        ))}
                      </div>
                      <div className="mt-3 space-y-2">
                        {[
                          ['09:30', 'Harbor Dental', 'Confirm proposal review', 'Overdue', 'bg-red-50 text-red-600'],
                          ['11:00', 'Summit Fitness', 'Send annual plan', 'Today', 'bg-orange-50 text-orange-600'],
                          ['14:15', 'Cedar Cafe', 'Check decision maker', 'Today', 'bg-orange-50 text-orange-600'],
                          ['16:00', 'Atlas Logistics', 'Negotiate payment terms', 'Today', 'bg-orange-50 text-orange-600'],
                        ].map(([time, lead, action, tag, tone]) => (
                          <div key={`${time}-${lead}`} className="flex items-center gap-2.5 rounded-xl border border-slate-100 p-2.5">
                            <span className="w-8 text-[7px] font-bold text-slate-400">{time}</span>
                            <span className="h-6 w-6 rounded-lg bg-gradient-to-br from-orange-200 to-amber-100" />
                            <div className="min-w-0 flex-1"><p className="truncate text-[8px] font-semibold text-slate-700">{lead}</p><p className="truncate text-[6.5px] text-slate-400">{action}</p></div>
                            <span className={`rounded px-1.5 py-0.5 text-[6px] font-bold ${tone}`}>{tag}</span>
                            <span className="grid h-5 w-5 place-items-center rounded-md bg-emerald-50 text-emerald-600"><Check className="h-2.5 w-2.5" strokeWidth={3} /></span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 rounded-xl border border-dashed border-orange-200 bg-orange-50/50 px-3 py-2 text-center text-[7.5px] font-medium text-orange-700">No follow-up gets lost in a notebook.</div>
                    </div>
                  </div>
                </Reveal>
              </div>

              <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
                <Reveal>
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-orange-600">03 · Team</p>
                  <h3 className="mt-3 text-[clamp(1.8rem,3.2vw,2.8rem)] font-extrabold leading-[1.05] tracking-[-0.055em] text-slate-950">See the motion,<br />not just the numbers.</h3>
                  <p className="mt-4 max-w-md text-[12.5px] leading-relaxed text-slate-600">Calls, meetings, wins and commission by teammate. Managers spot effort and conversion separately, then coach with actual examples.</p>
                  <div className="mt-6 space-y-2.5">
                    {['Per-member calls and outcomes', 'Won and lost deal counts', 'Commission position by person'].map((item) => (
                      <div key={item} className="flex items-center gap-2.5 text-[11px] font-medium text-slate-600">
                        <span className="grid h-5 w-5 place-items-center rounded-full bg-orange-100 text-orange-600"><Check className="h-3 w-3" strokeWidth={3} /></span>
                        {item}
                      </div>
                    ))}
                  </div>
                </Reveal>
                <Reveal delay={120}>
                  <div className="relative">
                    <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-amber-200/40 to-transparent blur-2xl" />
                    <div className="relative rounded-2xl border border-orange-100 bg-white p-4 shadow-[0_30px_80px_rgba(249,115,22,0.1)] sm:p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[8px] font-bold uppercase tracking-[0.1em] text-orange-500">Team performance</p>
                          <p className="mt-0.5 text-[14px] font-bold tracking-[-0.03em] text-slate-900">This month</p>
                        </div>
                        <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-[7px] text-slate-400"><Clock3 className="h-2.5 w-2.5" /> Last 30 days</span>
                      </div>
                      <div className="mt-4 grid grid-cols-3 gap-2">
                        {[['Calls', '184'], ['Won', '12'], ['Commission', '₹68K']].map(([label, value]) => (
                          <div key={label} className="rounded-lg border border-slate-100 bg-slate-50 p-2.5"><p className="text-[6.5px] text-slate-400">{label}</p><p className="mt-0.5 text-[11px] font-bold text-slate-800">{value}</p></div>
                        ))}
                      </div>
                      <div className="mt-4 space-y-3">
                        {[
                          ['Meera Kapoor', 'Owner', 86, '₹28,400'],
                          ['Arjun Sethi', 'Manager', 71, '₹21,900'],
                          ['Sana Iqbal', 'Lead gen', 58, '₹11,700'],
                          ['Rohit Menon', 'Lead gen', 43, '₹6,000'],
                        ].map(([name, role, width, commission]) => (
                          <div key={name} className="flex items-center gap-2.5">
                            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gradient-to-br from-orange-200 to-amber-100 text-[7px] font-bold text-orange-800">{name.split(' ').map((part) => part[0]).join('')}</span>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-2"><p className="truncate text-[8px] font-semibold text-slate-700">{name}</p><p className="text-[7px] font-bold text-slate-500">{commission}</p></div>
                              <div className="mt-1 flex items-center gap-2"><span className="w-8 text-[6px] text-slate-400">{role}</span><div className="h-1 flex-1 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-amber-300 to-orange-500" style={{ width: `${width}%` }} /></div></div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-900 px-3 py-2.5">
                        <p className="text-[7.5px] font-medium text-white/55">Effort and revenue, side by side.</p>
                        <TrendingUp className="h-3 w-3 text-orange-400" />
                      </div>
                    </div>
                  </div>
                </Reveal>
              </div>
            </div>
          </div>
        </section>

        <section id="import" className="relative overflow-hidden border-y border-orange-100 bg-white">
          <div className="landing-glow pointer-events-none absolute -right-32 top-10 h-80 w-80 rounded-full bg-orange-100/70 blur-[100px]" />
          <div className="relative mx-auto grid max-w-7xl gap-14 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <Reveal>
              <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-orange-600">Import without the mess</p>
              <h2 className="mt-3 text-[clamp(2.2rem,4.4vw,3.7rem)] font-extrabold leading-[1.02] tracking-[-0.06em] text-slate-950">
                Your spreadsheet,<br />ready for real work.
              </h2>
              <p className="mt-4 max-w-md text-[13px] leading-relaxed text-slate-600">
                Upload a CSV, map the columns and let LeadPilot reject malformed rows and flag duplicates against existing phone numbers and emails. Nothing silently overwrites a record.
              </p>
              <div className="mt-8 space-y-3">
                {[
                  { number: '01', title: 'Upload', text: 'Choose a CSV and map business name, phone, email, source and value.' },
                  { number: '02', title: 'Validate', text: 'Malformed rows are reported. Duplicate phone numbers and emails are skipped.' },
                  { number: '03', title: 'Assign', text: 'Import once, then assign owners, priorities and first follow-up dates.' },
                ].map(({ number, title, text }) => (
                  <div key={number} className="flex gap-3">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-orange-100 bg-orange-50 text-[8px] font-extrabold text-orange-600">{number}</span>
                    <div><p className="text-[11px] font-bold text-slate-800">{title}</p><p className="mt-0.5 text-[10.5px] leading-relaxed text-slate-500">{text}</p></div>
                  </div>
                ))}
              </div>
              <div className="landing-flow-line mt-7 h-0.5 w-full rounded-full" />
              <Link to={startHref} className="mt-5 inline-flex items-center gap-1.5 text-[12px] font-bold text-orange-600 hover:text-orange-700">Import your first list <ArrowRight className="h-3.5 w-3.5" /></Link>
            </Reveal>

            <Reveal delay={140}>
              <div className="relative">
                <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-orange-200/50 to-transparent blur-2xl" />
                <div className="relative rounded-2xl border border-orange-100 bg-[#fffaf5] p-4 shadow-[0_30px_80px_rgba(249,115,22,0.1)] sm:p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="grid h-9 w-9 place-items-center rounded-xl bg-orange-500 text-white"><FileSpreadsheet className="h-4 w-4" /></span>
                      <div><p className="text-[10px] font-bold text-slate-800">leads-export.csv</p><p className="text-[7.5px] text-slate-400">148 rows · 34 KB</p></div>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-[7px] font-bold text-emerald-700"><CheckCircle2 className="h-2.5 w-2.5" /> Ready</span>
                  </div>

                  <div className="landing-scan mt-4 overflow-hidden rounded-xl border border-slate-100 bg-white">
                    <div className="grid grid-cols-[1.4fr_0.8fr_0.8fr] gap-2 bg-slate-50 px-3 py-2 text-[6.5px] font-bold uppercase tracking-[0.07em] text-slate-400"><span>Business</span><span>Phone</span><span className="text-right">Status</span></div>
                    {[
                      ['Summit Fitness', '98••••1204', 'Valid', 'text-emerald-600'],
                      ['Cedar Cafe', '99••••8812', 'Valid', 'text-emerald-600'],
                      ['Harbor Dental', '98••••1204', 'Duplicate', 'text-amber-600'],
                      ['Atlas Logistics', '90••••4431', 'Valid', 'text-emerald-600'],
                      ['Northstar Interiors', '—', 'Missing phone', 'text-red-500'],
                      ['Juniper Studio', '91••••7740', 'Valid', 'text-emerald-600'],
                    ].map(([name, phone, status, tone], index) => (
                      <div key={`${name}-${index}`} className="grid grid-cols-[1.4fr_0.8fr_0.8fr] items-center gap-2 border-t border-slate-100 px-3 py-2">
                        <span className="truncate text-[8px] font-semibold text-slate-700">{name}</span>
                        <span className="text-[7px] text-slate-400">{phone}</span>
                        <span className={`text-right text-[6.5px] font-bold ${tone}`}>{status}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {[['142', 'Imported'], ['3', 'Duplicates skipped'], ['3', 'Rows rejected']].map(([value, label], index) => (
                      <div key={label} className={`rounded-xl border p-2.5 ${index === 0 ? 'border-emerald-100 bg-emerald-50' : index === 1 ? 'border-amber-100 bg-amber-50' : 'border-red-100 bg-red-50'}`}>
                        <p className={`text-[14px] font-extrabold tracking-[-0.04em] ${index === 0 ? 'text-emerald-700' : index === 1 ? 'text-amber-700' : 'text-red-600'}`}>{value}</p>
                        <p className="mt-0.5 text-[6.5px] font-medium text-slate-500">{label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex items-center justify-between rounded-xl border border-orange-100 bg-orange-50 px-3 py-2.5">
                    <p className="text-[8px] font-semibold text-orange-800/75">Assign all 142 leads to a teammate.</p>
                    <span className="inline-flex items-center gap-1 rounded-lg bg-orange-500 px-2 py-1 text-[7px] font-bold text-white">Continue <ArrowRight className="h-2.5 w-2.5" /></span>
                  </div>
                </div>

                <div className="landing-float absolute -right-2 -top-4 flex items-center gap-2 rounded-xl border border-orange-100 bg-white px-3 py-2 shadow-[0_16px_40px_rgba(15,23,42,0.12)] sm:-right-5">
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-orange-50 text-orange-600"><Search className="h-3.5 w-3.5" /></span>
                  <div><p className="text-[7.5px] font-semibold text-slate-800">Duplicate check</p><p className="text-[6.5px] text-slate-400">Phone + email matched</p></div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <section id="pipeline" className="relative overflow-hidden bg-white">
          <div className="landing-glow pointer-events-none absolute -left-40 top-1/4 h-[28rem] w-[28rem] rounded-full bg-orange-100/60 blur-[100px]" />
          <div className="relative mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
            <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <Reveal>
                <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-orange-600">Pipeline</p>
                <h2 className="mt-3 text-[clamp(2.1rem,4.2vw,3.5rem)] font-extrabold leading-[1.03] tracking-[-0.06em] text-slate-950">
                  Every stage.<br />One source of truth.
                </h2>
                <p className="mt-4 max-w-md text-[13px] leading-relaxed text-slate-600">
                  Move a lead between seven clear stages with drag and drop. Each move is written to the activity trail, so the board reflects what really happened.
                </p>
                <div className="mt-7 space-y-2.5">
                  {['New Lead', 'Contacted', 'Interested', 'Meeting Scheduled', 'Proposal Sent', 'Negotiation', 'Won'].map((stage, index) => (
                    <div key={stage} className="flex items-center gap-3">
                      <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-orange-100 text-[8px] font-bold text-orange-700">{index + 1}</span>
                      <div className="h-px flex-1 bg-gradient-to-r from-orange-200 to-transparent" />
                      <span className="w-32 text-right text-[10.5px] font-medium text-slate-600 sm:w-40">{stage}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-7 inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-3 py-1.5 text-[10px] font-semibold text-orange-700">
                  <Flame className="h-3 w-3" /> Lost deals require a reason
                </div>
              </Reveal>

              <Reveal delay={140}>
                <div className="relative">
                  <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-orange-200/50 to-amber-100/20 blur-2xl" />
                  <div className="relative rounded-2xl border border-slate-200 bg-[#fafaf9] p-3 shadow-[0_30px_80px_rgba(15,23,42,0.12)] sm:p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-orange-500">Conversion board</p>
                        <p className="mt-0.5 text-[15px] font-bold tracking-[-0.03em] text-slate-900">Pipeline</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-[7.5px] text-slate-400"><Filter className="h-2.5 w-2.5" /> All owners</span>
                        <span className="inline-flex items-center gap-1 rounded-md bg-orange-500 px-2 py-1 text-[7.5px] font-semibold text-white">New lead</span>
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {[
                        { name: 'New Lead', count: 12, tone: 'bg-slate-100 text-slate-600', cards: ['Harbor Dental', 'Northstar Interiors', 'Pinewood School'] },
                        { name: 'Interested', count: 8, tone: 'bg-orange-100 text-orange-700', cards: ['Summit Fitness', 'Cedar Cafe'] },
                        { name: 'Proposal', count: 5, tone: 'bg-amber-100 text-amber-700', cards: ['Atlas Logistics', 'Oakline Realty'] },
                        { name: 'Won', count: 4, tone: 'bg-emerald-100 text-emerald-700', cards: ['Juniper Studio', 'Bluebird Foods'] },
                      ].map((column, columnIndex) => (
                        <div key={column.name} className={`rounded-xl border border-slate-200 bg-white p-2 ${columnIndex === 1 ? 'ring-2 ring-orange-200' : ''}`}>
                          <div className="flex items-center justify-between gap-1">
                            <span className={`rounded px-1.5 py-0.5 text-[7px] font-bold ${column.tone}`}>{column.name}</span>
                            <span className="text-[7px] font-semibold text-slate-400">{column.count}</span>
                          </div>
                          <div className="mt-2 space-y-1.5">
                            {column.cards.map((card, cardIndex) => (
                              <div
                                key={card}
                                className={`rounded-lg border border-slate-100 bg-white p-2 shadow-sm ${columnIndex === 1 && cardIndex === 0 ? 'landing-float border-orange-200 shadow-[0_10px_25px_rgba(249,115,22,0.15)]' : ''}`}
                              >
                                <p className="truncate text-[7.5px] font-semibold text-slate-700">{card}</p>
                                <div className="mt-1.5 flex items-center justify-between">
                                  <span className="text-[6.5px] text-slate-400">Owner</span>
                                  <span className="h-3 w-3 rounded-full bg-orange-100" />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 flex items-center justify-between rounded-xl border border-orange-100 bg-orange-50 px-3 py-2">
                      <p className="text-[8px] font-medium text-orange-800/70">Drag a card to move the deal. Every move is audited.</p>
                      <ArrowRight className="h-3 w-3 text-orange-500" />
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        <JourneyScroll />

        <section className="border-y border-slate-200 bg-slate-50/70">
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
            <Reveal className="mx-auto max-w-2xl text-center">
              <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-orange-600">A day with LeadPilot</p>
              <h2 className="mt-3 text-[clamp(2.1rem,4.2vw,3.5rem)] font-extrabold leading-[1.03] tracking-[-0.06em] text-slate-950">
                The rhythm of a<br />revenue team, in one flow.
              </h2>
            </Reveal>

            <div className="relative mt-14">
              <div className="absolute left-[27px] top-0 hidden h-full w-px bg-gradient-to-b from-orange-200 via-orange-300 to-transparent sm:block" />
              <div className="space-y-4">
                {dayMoments.map((moment, index) => {
                  const Icon = moment.icon
                  return (
                    <Reveal key={moment.time} delay={index * 80}>
                      <div className="relative flex flex-col gap-3 sm:flex-row sm:items-stretch sm:gap-6">
                        <div className="relative z-10 flex items-center gap-3 sm:w-14 sm:flex-col sm:gap-2">
                          <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${moment.accent} text-white shadow-[0_10px_25px_rgba(249,115,22,0.2)] sm:h-14 sm:w-14`}>
                            <Icon className="h-5 w-5" />
                          </span>
                          <span className="text-[10px] font-bold text-slate-400">{moment.time}</span>
                        </div>
                        <div className="flex-1 rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-orange-200 hover:shadow-[0_18px_40px_rgba(249,115,22,0.06)] sm:p-6">
                          <h3 className="text-[14px] font-bold tracking-[-0.025em] text-slate-900">{moment.title}</h3>
                          <p className="mt-2 max-w-2xl text-[11.5px] leading-relaxed text-slate-500">{moment.text}</p>
                        </div>
                      </div>
                    </Reveal>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="overflow-hidden bg-white">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-2 lg:items-center">
            <Reveal>
              <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-orange-600">Call intelligence</p>
              <h2 className="mt-3 text-[clamp(2.1rem,4.2vw,3.5rem)] font-extrabold leading-[1.03] tracking-[-0.06em] text-slate-950">
                Context before<br />you dial.
              </h2>
              <p className="mt-4 max-w-md text-[13px] leading-relaxed text-slate-600">
                Every lead carries its history: previous calls, outcomes, notes and the next action. Log a call once and the timeline updates everywhere.
              </p>
              <div className="mt-7 grid gap-2 sm:grid-cols-2">
                {[
                  ['Outcome', 'Interested'],
                  ['Duration', '4m 12s'],
                  ['Next step', 'Send proposal'],
                  ['Follow-up', 'Tomorrow, 11:00'],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3">
                    <p className="text-[8.5px] font-semibold uppercase tracking-[0.08em] text-slate-400">{label}</p>
                    <p className="mt-1 text-[11px] font-semibold text-slate-700">{value}</p>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal delay={140}>
              <div className="relative">
                <div className="landing-float-soft absolute -right-8 -top-8 h-44 w-44 rounded-full bg-orange-100/70 blur-2xl" />
                <div className="relative rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_30px_80px_rgba(15,23,42,0.1)] sm:p-5">
                  <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-2.5">
                      <span className="grid h-9 w-9 place-items-center rounded-xl bg-orange-500 text-white"><PhoneCall className="h-4 w-4" /></span>
                      <div>
                        <p className="text-[11px] font-bold text-slate-800">Call with Summit Fitness</p>
                        <p className="text-[8.5px] text-slate-400">Today · 4m 12s · Interested</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-emerald-100 px-2 py-1 text-[7.5px] font-bold text-emerald-700">Logged</span>
                  </div>
                  <div className="mt-4 flex h-20 items-center justify-center gap-1 rounded-xl bg-orange-50/70 px-4">
                    {[18, 34, 52, 28, 64, 42, 76, 38, 58, 30, 66, 46, 72, 34, 50, 24, 60, 40, 30, 48, 22, 56, 36, 44].map((height, index) => (
                      <span
                        key={index}
                        className="landing-wave-bar w-1 rounded-full bg-gradient-to-t from-orange-300 to-orange-500"
                        style={{ height: `${height}%`, animationDelay: `${index * 70}ms` }}
                      />
                    ))}
                  </div>
                  <div className="mt-4 space-y-2.5">
                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                      <p className="text-[8px] font-semibold uppercase tracking-[0.08em] text-slate-400">Notes</p>
                      <p className="mt-1 text-[10px] leading-relaxed text-slate-600">Wants a proposal for the annual plan. Decision maker is the owner. Budget confirmed.</p>
                    </div>
                    <div className="flex items-center justify-between gap-2 rounded-xl border border-orange-100 bg-orange-50 p-3">
                      <div className="flex items-center gap-2">
                        <CalendarClock className="h-3.5 w-3.5 text-orange-500" />
                        <p className="text-[9.5px] font-medium text-orange-800">Follow-up scheduled for tomorrow</p>
                      </div>
                      <ArrowRight className="h-3 w-3 text-orange-500" />
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="relative overflow-hidden border-y border-orange-100 bg-gradient-to-b from-[#fff5ea] via-[#fffaf5] to-white">
          <div className="landing-glow pointer-events-none absolute -left-24 top-1/3 h-80 w-80 rounded-full bg-orange-200/50 blur-[100px]" />
          <div className="pointer-events-none absolute -right-24 bottom-1/4 h-80 w-80 rounded-full bg-amber-200/30 blur-[100px]" />
          <div className="relative mx-auto grid max-w-7xl gap-16 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <Reveal>
              <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-orange-600">Always within reach</p>
              <h2 className="mt-3 text-[clamp(2.2rem,4.4vw,3.7rem)] font-extrabold leading-[1.02] tracking-[-0.06em] text-slate-950">
                Your next follow-up<br />is in your pocket.
              </h2>
              <p className="mt-4 max-w-md text-[13px] leading-relaxed text-slate-600">
                The workspace is responsive from the first pixel: the same pipeline, the same queue, the same permissions. Check the day from a phone without losing the desktop context.
              </p>
              <div className="mt-7 space-y-3">
                {[
                  { icon: CalendarClock, title: 'The day, in order', text: 'Overdue and today are separated before anything else competes for attention.' },
                  { icon: PhoneCall, title: 'Call from the queue', text: 'Tap a lead, scan the history and log the outcome without jumping apps.' },
                  { icon: TrendingUp, title: 'A live pulse', text: 'Revenue, follow-ups and commission update as the team records real work.' },
                ].map(({ icon: Icon, title, text }) => (
                  <div key={title} className="flex gap-3">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-orange-100 bg-white text-orange-600 shadow-sm"><Icon className="h-3.5 w-3.5" /></span>
                    <div><p className="text-[11px] font-bold text-slate-800">{title}</p><p className="mt-0.5 text-[10.5px] leading-relaxed text-slate-500">{text}</p></div>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal delay={140} className="relative mx-auto w-full max-w-[330px]">
              <div className="pointer-events-none absolute inset-0 scale-125 rounded-full bg-orange-200/40 blur-3xl" />
              <div className="landing-float-soft relative rounded-[2.4rem] border border-slate-800 bg-slate-950 p-2.5 shadow-[0_40px_100px_rgba(15,23,42,0.35)]">
                <div className="relative overflow-hidden rounded-[1.9rem] bg-[#fffaf5]">
                  <div className="flex items-center justify-between px-5 pt-3 text-[7px] font-bold text-slate-500"><span>9:41</span><span className="flex items-center gap-1"><span className="h-1 w-3 rounded-sm bg-slate-500" /><span className="h-1.5 w-3 rounded-sm border border-slate-400" /></span></div>
                  <div className="mt-2 flex items-center justify-between px-4">
                    <div className="flex items-center gap-2">
                      <span className="grid h-7 w-7 place-items-center rounded-lg bg-orange-500 text-white"><Target className="h-3 w-3" /></span>
                      <div><p className="text-[9px] font-extrabold tracking-[-0.03em] text-slate-900">LeadPilot</p><p className="text-[6px] text-slate-400">Meera’s workspace</p></div>
                    </div>
                    <span className="grid h-7 w-7 place-items-center rounded-full border border-orange-100 bg-white text-orange-500"><Bell className="h-3 w-3" /></span>
                  </div>
                  <div className="mx-4 mt-4 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 p-4 text-white shadow-[0_14px_30px_rgba(249,115,22,0.25)]">
                    <p className="text-[6.5px] font-semibold uppercase tracking-[0.1em] text-white/65">Good morning</p>
                    <p className="mt-1 text-[13px] font-bold leading-tight">8 follow-ups.<br />3 need attention.</p>
                    <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-white/15 px-2 py-1.5 text-[6.5px] font-semibold"><Sparkles className="h-2.5 w-2.5" /> Start with the overdue queue</div>
                  </div>
                  <div className="mx-4 mt-4 flex items-center justify-between">
                    <p className="text-[8px] font-bold text-slate-800">Today</p>
                    <span className="text-[6.5px] font-semibold text-orange-600">See all</span>
                  </div>
                  <div className="mx-4 mt-2 space-y-1.5">
                    {[
                      ['09:30', 'Harbor Dental', 'Overdue', 'bg-red-50 text-red-600'],
                      ['11:00', 'Summit Fitness', 'Today', 'bg-orange-50 text-orange-600'],
                      ['14:15', 'Cedar Cafe', 'Today', 'bg-orange-50 text-orange-600'],
                    ].map(([time, name, tag, tone]) => (
                      <div key={name} className="flex items-center gap-2 rounded-xl border border-slate-100 bg-white p-2">
                        <span className="w-7 text-[6px] font-bold text-slate-400">{time}</span>
                        <span className="h-5 w-5 rounded-md bg-gradient-to-br from-orange-200 to-amber-100" />
                        <span className="flex-1 text-[7px] font-semibold text-slate-700">{name}</span>
                        <span className={`rounded px-1 py-0.5 text-[5.5px] font-bold ${tone}`}>{tag}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mx-4 mt-3 rounded-xl border border-slate-100 bg-white p-3">
                    <div className="flex items-center justify-between"><p className="text-[6.5px] font-semibold text-slate-400">Won this month</p><p className="text-[7px] font-bold text-emerald-600">+18%</p></div>
                    <p className="mt-1 text-[14px] font-extrabold tracking-[-0.04em] text-slate-900">₹3.8L</p>
                    <div className="mt-2 flex items-end gap-1">{([26, 42, 34, 56, 48, 66, 58, 78, 70, 88]).map((height, index) => <span key={index} className="flex-1 rounded-sm bg-orange-300 last:bg-orange-500" style={{ height: `${height / 3}px` }} />)}</div>
                  </div>
                  <div className="mt-4 flex items-center justify-around border-t border-slate-100 bg-white px-2 py-2.5">
                    {[Target, KanbanSquare, CalendarClock, Wallet].map((Icon, index) => (
                      <span key={index} className={`grid h-7 w-7 place-items-center rounded-lg ${index === 0 ? 'bg-orange-50 text-orange-600' : 'text-slate-300'}`}><Icon className="h-3.5 w-3.5" /></span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="landing-float absolute -right-2 top-24 hidden items-center gap-2 rounded-xl border border-orange-100 bg-white px-3 py-2 shadow-[0_16px_40px_rgba(15,23,42,0.12)] sm:flex">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-50 text-emerald-600"><PhoneCall className="h-3.5 w-3.5" /></span>
                <div><p className="text-[7.5px] font-semibold text-slate-800">Call logged</p><p className="text-[6.5px] text-slate-400">4m 12s · Interested</p></div>
              </div>
              <div className="landing-float-soft absolute -left-4 bottom-24 hidden items-center gap-2 rounded-xl border border-orange-100 bg-white px-3 py-2 shadow-[0_16px_40px_rgba(15,23,42,0.12)] sm:flex">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-orange-50 text-orange-600"><Wallet className="h-3.5 w-3.5" /></span>
                <div><p className="text-[7.5px] font-semibold text-slate-800">₹31,500 released</p><p className="text-[6.5px] text-slate-400">Owner approved</p></div>
              </div>
            </Reveal>
          </div>
        </section>

        <section id="commission" className="border-y border-slate-200 bg-gradient-to-b from-orange-50/80 via-orange-50/30 to-white">
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
            <Reveal className="mx-auto max-w-2xl text-center">
              <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-orange-600">Commission clarity</p>
              <h2 className="mt-3 text-[clamp(2.1rem,4.2vw,3.5rem)] font-extrabold leading-[1.03] tracking-[-0.06em] text-slate-950">
                No more month-end<br />commission archaeology.
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-[13px] leading-relaxed text-slate-600">
                The rate is captured when the deal is created. Earned commission grows with recorded payments. Approval and payout are explicit steps — not guesswork.
              </p>
            </Reveal>

            <div className="mt-12 grid gap-3 lg:grid-cols-3">
              {[
                { step: '01', icon: Target, title: 'Deal created', value: '₹1,80,000', note: '35% band captured', detail: 'The active band and rate are frozen to this deal. Later policy changes do not rewrite history.' },
                { step: '02', icon: IndianRupee, title: 'Payment received', value: '₹90,000', note: '50% collected', detail: 'Earned commission releases proportionally. Every payment recalculates the live commission record.' },
                { step: '03', icon: Wallet, title: 'Commission released', value: '₹31,500', note: '50% of ₹63,000', detail: 'The owner approves the releaseable amount, then records a payout with method and reference.' },
              ].map(({ step, icon: Icon, title, value, note, detail }, index) => (
                <Reveal key={step} delay={index * 110}>
                  <div className="relative h-full rounded-2xl border border-orange-100 bg-white p-6 shadow-[0_18px_45px_rgba(249,115,22,0.06)]">
                    <div className="flex items-center justify-between">
                      <span className="grid h-9 w-9 place-items-center rounded-xl bg-orange-500 text-white"><Icon className="h-4 w-4" /></span>
                      <span className="text-[9px] font-bold tracking-[0.1em] text-orange-300">{step}</span>
                    </div>
                    <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">{title}</p>
                    <p className="mt-1 text-[24px] font-extrabold tracking-[-0.05em] text-slate-950">{value}</p>
                    <span className="mt-1.5 inline-flex rounded-full bg-orange-50 px-2 py-0.5 text-[8.5px] font-semibold text-orange-700">{note}</span>
                    <p className="mt-4 text-[10.5px] leading-relaxed text-slate-500">{detail}</p>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal delay={100} className="mt-6">
              <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:p-6">
                <div className="flex items-start gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-600"><ShieldCheck className="h-4 w-4" /></span>
                  <div>
                    <p className="text-[11.5px] font-bold text-slate-800">Owner approval before any payout</p>
                    <p className="mt-1 max-w-2xl text-[10.5px] leading-relaxed text-slate-500">Managers and lead generators can see their commission position. Only the owner can approve and release money.</p>
                  </div>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-[9px] font-semibold text-emerald-700"><CheckCircle2 className="h-3 w-3" /> Fully audited</span>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="overflow-hidden bg-white">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <Reveal className="order-2 lg:order-1">
              <div className="relative rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_30px_80px_rgba(15,23,42,0.1)] sm:p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[8.5px] font-bold uppercase tracking-[0.1em] text-orange-500">Reports</p>
                    <p className="mt-0.5 text-[14px] font-bold tracking-[-0.03em] text-slate-900">Revenue collected</p>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-[7.5px] text-slate-400"><Download className="h-2.5 w-2.5" /> Export CSV</span>
                </div>
                <div className="mt-4 flex items-end gap-1.5 sm:gap-2">
                  {[24, 38, 30, 52, 44, 68, 58, 82, 66, 92, 74, 100, 88, 96].map((height, index) => (
                    <div key={index} className="flex flex-1 flex-col items-center gap-1">
                      <div className={`w-full rounded-t-sm ${index > 9 ? 'bg-orange-500' : index > 6 ? 'bg-orange-400' : 'bg-orange-200'}`} style={{ height: `${height * 1.25}px` }} />
                      <span className="text-[5.5px] text-slate-300">{index + 1}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {[
                    ['Won', '₹8.4L'],
                    ['Collected', '₹6.9L'],
                    ['Outstanding', '₹1.5L'],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-lg border border-slate-100 bg-slate-50 p-2.5">
                      <p className="text-[6.5px] text-slate-400">{label}</p>
                      <p className="mt-0.5 text-[10px] font-bold text-slate-800">{value}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-100 p-3">
                    <p className="text-[7.5px] font-semibold uppercase tracking-[0.08em] text-slate-400">Top source</p>
                    <div className="mt-2.5 space-y-2">
                      {[['Referral', 82], ['LinkedIn', 63], ['Google Maps', 48]].map(([source, width]) => (
                        <div key={source}>
                          <div className="flex justify-between text-[7px] text-slate-500"><span>{source}</span><span>{width}%</span></div>
                          <div className="mt-1 h-1 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-orange-400" style={{ width: `${width}%` }} /></div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-100 p-3">
                    <p className="text-[7.5px] font-semibold uppercase tracking-[0.08em] text-slate-400">Team activity</p>
                    <div className="mt-2.5 space-y-2">
                      {[['Meera', 46], ['Arjun', 38], ['Sana', 31]].map(([name, calls]) => (
                        <div key={name} className="flex items-center gap-2">
                          <span className="h-4 w-4 rounded-full bg-orange-100" />
                          <span className="w-10 text-[7px] text-slate-500">{name}</span>
                          <div className="h-1 flex-1 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-orange-300" style={{ width: `${(calls / 50) * 100}%` }} /></div>
                          <span className="text-[6.5px] text-slate-400">{calls}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal delay={120} className="order-1 lg:order-2">
              <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-orange-600">Analytics</p>
              <h2 className="mt-3 text-[clamp(2.1rem,4.2vw,3.5rem)] font-extrabold leading-[1.03] tracking-[-0.06em] text-slate-950">
                Answers, not<br />vanity charts.
              </h2>
              <p className="mt-4 max-w-md text-[13px] leading-relaxed text-slate-600">
                See where leads come from, which teammate is moving the needle, what is stuck in the pipeline and how much cash actually arrived.
              </p>
              <div className="mt-7 space-y-3">
                {[
                  { icon: PieChart, text: 'Lead source and industry breakdown' },
                  { icon: TrendingUp, text: 'Revenue collected over the selected range' },
                  { icon: BarChart3, text: 'Calls, interested outcomes and meetings by member' },
                  { icon: Wallet, text: 'Commission calculated, earned, approved and paid' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-3">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-orange-50 text-orange-600"><Icon className="h-3.5 w-3.5" /></span>
                    <p className="text-[11px] text-slate-600">{text}</p>
                  </div>
                ))}
              </div>
              <Link to={startHref} className="mt-7 inline-flex items-center gap-1.5 text-[12px] font-bold text-orange-600 hover:text-orange-700">
                Explore the workspace <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Reveal>
          </div>
        </section>

        <section id="roles" className="border-y border-slate-200 bg-slate-50/70">
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
            <Reveal className="mx-auto max-w-2xl text-center">
              <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-orange-600">Built for the whole team</p>
              <h2 className="mt-3 text-[clamp(2.1rem,4.2vw,3.5rem)] font-extrabold leading-[1.03] tracking-[-0.06em] text-slate-950">
                One workspace.<br />The right view for every role.
              </h2>
            </Reveal>
            <div className="mt-10 grid gap-4 lg:grid-cols-3">
              {roles.map(({ icon: Icon, title, text, bullets, tone }, index) => (
                <Reveal key={title} delay={index * 100}>
                  <div className={`h-full rounded-2xl border bg-gradient-to-b p-6 ${tone}`}>
                    <span className="grid h-11 w-11 place-items-center rounded-xl border border-white bg-white text-orange-600 shadow-sm"><Icon className="h-4.5 w-4.5" /></span>
                    <h3 className="mt-4 text-[15px] font-bold tracking-[-0.025em] text-slate-900">{title}</h3>
                    <p className="mt-2 text-[11.5px] leading-relaxed text-slate-500">{text}</p>
                    <div className="mt-5 space-y-2.5 border-t border-slate-200/70 pt-4">
                      {bullets.map((item) => (
                        <div key={item} className="flex items-center gap-2">
                          <Check className="h-3.5 w-3.5 text-orange-500" strokeWidth={2.5} />
                          <span className="text-[10.5px] font-medium text-slate-600">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-[#fffaf5]">
          <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-[46rem] -translate-x-1/2 rounded-full bg-orange-100/60 blur-[100px]" />
          <div className="relative mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
            <Reveal className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
              <div>
                <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-orange-600">Built for real teams</p>
                <h2 className="mt-3 text-[clamp(2.2rem,4.4vw,3.7rem)] font-extrabold leading-[1.02] tracking-[-0.06em] text-slate-950">
                  If the follow-up<br />matters, it fits.
                </h2>
              </div>
              <p className="max-w-xl text-[13px] leading-relaxed text-slate-600 lg:justify-self-end">
                LeadPilot is intentionally not a bloated enterprise suite. It is a focused revenue workspace for teams where one missed callback can cost a deal.
              </p>
            </Reveal>

            <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {industries.map(({ icon: Icon, title, text }, index) => (
                <Reveal key={title} delay={(index % 3) * 80}>
                  <div className="group h-full overflow-hidden rounded-2xl border border-orange-100/80 bg-white p-5 transition duration-300 hover:-translate-y-1 hover:border-orange-300 hover:shadow-[0_24px_55px_rgba(249,115,22,0.1)]">
                    <div className="flex items-center justify-between">
                      <span className="grid h-10 w-10 place-items-center rounded-xl bg-orange-50 text-orange-600 transition duration-300 group-hover:bg-orange-500 group-hover:text-white"><Icon className="h-4 w-4" /></span>
                      <span className="text-[8px] font-bold tracking-[0.1em] text-orange-200">0{index + 1}</span>
                    </div>
                    <h3 className="mt-5 text-[13px] font-bold tracking-[-0.02em] text-slate-900">{title}</h3>
                    <p className="mt-2 text-[11px] leading-relaxed text-slate-500">{text}</p>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal delay={100} className="mt-8">
              <div className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 px-5 py-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-orange-500 text-white"><Sparkles className="h-3.5 w-3.5" /></span>
                  <p className="text-[11px] font-semibold text-slate-700">Not seeing your industry? The workflow is intentionally flexible.</p>
                </div>
                <Link to={startHref} className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-600 hover:text-orange-700">Build your workspace <ArrowRight className="h-3 w-3" /></Link>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="bg-white">
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
            <Reveal className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
              <div>
                <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-orange-600">Trust by design</p>
                <h2 className="mt-3 text-[clamp(2.1rem,4.2vw,3.5rem)] font-extrabold leading-[1.03] tracking-[-0.06em] text-slate-950">
                  Serious about<br />the details.
                </h2>
                <p className="mt-4 max-w-md text-[13px] leading-relaxed text-slate-600">
                  The features that protect the business are not add-ons. They are part of the data model, the API and the UI.
                </p>
                <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-[9.5px] font-semibold text-slate-500">
                  <Zap className="h-3 w-3 text-orange-500" /> Built for multi-tenant teams
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {trustCards.map(({ icon: Icon, title, text }, index) => (
                  <Reveal key={title} delay={index * 70}>
                    <div className="h-full rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-orange-200 hover:shadow-[0_16px_40px_rgba(249,115,22,0.06)]">
                      <span className="grid h-8 w-8 place-items-center rounded-lg bg-orange-50 text-orange-600"><Icon className="h-3.5 w-3.5" /></span>
                      <h3 className="mt-4 text-[11.5px] font-bold text-slate-800">{title}</h3>
                      <p className="mt-1.5 text-[10.5px] leading-relaxed text-slate-500">{text}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        <section id="how-it-works" className="relative overflow-hidden border-y border-slate-200 bg-gradient-to-b from-orange-50/70 to-white">
          <div className="landing-glow pointer-events-none absolute -right-24 top-10 h-80 w-80 rounded-full bg-orange-100/60 blur-[90px]" />
          <div className="relative mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
            <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
              <Reveal>
                <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-orange-600">Up and running</p>
                <h2 className="mt-3 text-[clamp(2.1rem,4.2vw,3.5rem)] font-extrabold leading-[1.03] tracking-[-0.06em] text-slate-950">
                  From sign-up to<br />first follow-up.
                </h2>
                <p className="mt-4 max-w-md text-[13px] leading-relaxed text-slate-600">
                  No consultants, no brittle spreadsheets, no month-long rollout. Your workspace is ready immediately.
                </p>
                <Link to={startHref} className="mt-6 inline-flex items-center gap-1.5 text-[12px] font-bold text-orange-600 hover:text-orange-700">
                  Start your workspace <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Reveal>

              <div className="space-y-3">
                {steps.map((step, index) => (
                  <Reveal key={step.number} delay={index * 90}>
                    <div className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-orange-200 hover:shadow-[0_16px_40px_rgba(249,115,22,0.06)] sm:p-5">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-orange-500 text-[10px] font-extrabold text-white">{step.number}</span>
                      <div>
                        <h3 className="text-[13px] font-bold tracking-[-0.02em] text-slate-900">{step.title}</h3>
                        <p className="mt-1 text-[11.5px] leading-relaxed text-slate-500">{step.text}</p>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden border-y border-orange-100 bg-[#fffaf5]">
          <div className="pointer-events-none absolute inset-0 opacity-[0.5]" style={{ backgroundImage: 'radial-gradient(rgba(251,146,60,0.18) 1px, transparent 1px)', backgroundSize: '28px 28px', maskImage: 'radial-gradient(ellipse 70% 80% at 50% 50%, black, transparent)' }} />
          <div className="relative mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
            <Reveal className="mx-auto max-w-2xl text-center">
              <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-orange-600">The first week</p>
              <h2 className="mt-3 text-[clamp(2.2rem,4.4vw,3.7rem)] font-extrabold leading-[1.02] tracking-[-0.06em] text-slate-950">
                Five days to a<br />calmer revenue engine.
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-[13px] leading-relaxed text-slate-600">
                No migration project. Start with the list you already have, set the rules once, and let the workspace do the remembering.
              </p>
            </Reveal>

            <div className="relative mt-14">
              <div className="absolute left-0 right-0 top-8 hidden h-px bg-gradient-to-r from-transparent via-orange-300 to-transparent lg:block" />
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {firstWeek.map(({ day, title, text, icon: Icon }, index) => (
                  <Reveal key={day} delay={index * 80}>
                    <div className="group relative h-full rounded-2xl border border-orange-100 bg-white p-4 transition duration-300 hover:-translate-y-1 hover:border-orange-300 hover:shadow-[0_20px_45px_rgba(249,115,22,0.1)]">
                      <div className="flex items-center justify-between">
                        <span className="grid h-9 w-9 place-items-center rounded-xl bg-orange-500 text-white shadow-[0_8px_18px_rgba(249,115,22,0.22)]"><Icon className="h-4 w-4" /></span>
                        <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[7.5px] font-bold uppercase tracking-[0.08em] text-orange-600">{day}</span>
                      </div>
                      <h3 className="mt-5 text-[12px] font-bold tracking-[-0.02em] text-slate-900">{title}</h3>
                      <p className="mt-1.5 text-[10.5px] leading-relaxed text-slate-500">{text}</p>
                      <div className="mt-4 h-1 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-amber-300 to-orange-500 transition-all duration-500 group-hover:w-full" style={{ width: `${20 * (index + 1)}%` }} /></div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>

            <Reveal delay={120} className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
              {['No credit card required', 'Import in minutes', 'Owner-approved money movement', 'Audit trail from day one'].map((item) => (
                <span key={item} className="inline-flex items-center gap-1.5 text-[10px] font-medium text-slate-500"><CheckCircle2 className="h-3 w-3 text-orange-500" /> {item}</span>
              ))}
            </Reveal>
          </div>
        </section>

        <section id="faq" className="bg-white">
          <div className="mx-auto max-w-4xl px-5 py-20 sm:px-8 sm:py-24">
            <Reveal className="text-center">
              <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-orange-600">Questions, answered</p>
              <h2 className="mt-3 text-[clamp(2.1rem,4.2vw,3.5rem)] font-extrabold leading-[1.03] tracking-[-0.06em] text-slate-950">
                Before you jump in.
              </h2>
            </Reveal>
            <div className="mt-10 space-y-2.5">
              {faqs.map((faq, index) => (
                <Reveal key={faq.q} delay={index * 40}>
                  <div className={`overflow-hidden rounded-xl border transition ${openFaq === index ? 'border-orange-200 bg-orange-50/40' : 'border-slate-200 bg-white'}`}>
                    <button
                      type="button"
                      className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left sm:px-5"
                      onClick={() => setOpenFaq((current) => (current === index ? -1 : index))}
                      aria-expanded={openFaq === index}
                    >
                      <span className="text-[12px] font-semibold text-slate-800">{faq.q}</span>
                      <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-300 ${openFaq === index ? 'rotate-180 text-orange-500' : ''}`} />
                    </button>
                    <div className={`grid transition-all duration-300 ${openFaq === index ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                      <div className="overflow-hidden">
                        <p className="px-4 pb-4 text-[11.5px] leading-relaxed text-slate-500 sm:px-5">{faq.a}</p>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 pb-20 sm:px-8 sm:pb-24">
          <Reveal className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-14 sm:px-12 sm:py-20">
            <div className="landing-glow pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-orange-500/30 blur-[100px]" />
            <div className="pointer-events-none absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-amber-400/15 blur-[90px]" />
            <div className="pointer-events-none absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.7) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
            <div className="relative flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-semibold text-orange-200">
                  <Sparkles className="h-3 w-3" /> Your next closed deal starts here
                </div>
                <h2 className="mt-5 text-[clamp(2.2rem,4.4vw,3.8rem)] font-extrabold leading-[1.02] tracking-[-0.06em] text-white">
                  Give every lead<br />a clear next step.
                </h2>
                <p className="mt-4 max-w-xl text-[12.5px] leading-relaxed text-white/55">
                  Bring your team, leads and commission rules into one calm operating system for revenue.
                </p>
              </div>
              <div className="flex w-full flex-col gap-2.5 sm:w-auto sm:flex-row lg:flex-col">
                <Link to={startHref} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-orange-500 px-7 text-[12.5px] font-bold text-white shadow-[0_14px_35px_rgba(249,115,22,0.3)] transition hover:-translate-y-0.5 hover:bg-orange-600">
                  {user ? 'Open LeadPilot' : 'Start free today'} <ArrowRight className="h-4 w-4" />
                </Link>
                {!user && <Link to="/login" className="inline-flex h-12 items-center justify-center rounded-xl border border-white/15 bg-white/5 px-7 text-[12.5px] font-semibold text-white/80 transition hover:bg-white/10">Sign in</Link>}
              </div>
            </div>
            <div className="relative mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-white/10 pt-6">
              {['Leads, calls and follow-ups', 'Deals and payments', 'Owner-approved commission'].map((item) => (
                <span key={item} className="inline-flex items-center gap-2 text-[9.5px] font-medium text-white/45">
                  <CheckCircle2 className="h-3 w-3 text-orange-400" /> {item}
                </span>
              ))}
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Logo tone="orange" />
            <p className="mt-3 max-w-sm text-[10.5px] leading-relaxed text-slate-400">The multi-tenant CRM for lead generation, calls, pipelines, deals and commission control.</p>
            <div className="mt-4 flex items-center gap-2 text-[9px] font-medium text-slate-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Built for teams that move
            </div>
          </div>
          <div>
            <p className="text-[9.5px] font-bold uppercase tracking-[0.1em] text-slate-400">Product</p>
            <div className="mt-3 flex flex-col gap-2 text-[10.5px] font-medium text-slate-500">
              <a href="#features" className="hover:text-orange-600">Features</a>
              <a href="#pipeline" className="hover:text-orange-600">Pipeline</a>
              <a href="#commission" className="hover:text-orange-600">Commission</a>
              <a href="#roles" className="hover:text-orange-600">For teams</a>
            </div>
          </div>
          <div>
            <p className="text-[9.5px] font-bold uppercase tracking-[0.1em] text-slate-400">Get started</p>
            <div className="mt-3 flex flex-col gap-2 text-[10.5px] font-medium text-slate-500">
              <Link to={startHref} className="hover:text-orange-600">Create workspace</Link>
              <Link to="/login" className="hover:text-orange-600">Sign in</Link>
              <a href="#faq" className="hover:text-orange-600">FAQ</a>
            </div>
          </div>
        </div>
        <div className="border-t border-slate-100 px-5 py-4 text-center text-[9.5px] text-slate-400 sm:px-8">
          © {new Date().getFullYear()} LeadPilot. Built for revenue teams that move.
        </div>
      </footer>
    </div>
  )
}

