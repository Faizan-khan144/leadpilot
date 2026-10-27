import {
  CalendarClock,
  Check,
  ChevronRight,
  IndianRupee,
  KanbanSquare,
  PhoneCall,
  Target,
  Wallet,
} from 'lucide-react'
import { Reveal } from './Reveal'

const stages = [
  {
    key: 'capture',
    label: 'Capture',
    icon: Target,
    title: 'A lead lands with context',
    text: 'Source, estimated value, priority and owner are attached from the start. No orphan records, no “who was supposed to call this person?”',
    points: ['CSV import with deduplication', 'Source and priority captured', 'One accountable owner'],
  },
  {
    key: 'connect',
    label: 'Connect',
    icon: PhoneCall,
    title: 'The conversation becomes a record',
    text: 'Log the call outcome, notes and next step. The follow-up queue updates immediately, so the promise survives the day.',
    points: ['Outcome and duration logged', 'Next action is explicit', 'Follow-up appears in the queue'],
  },
  {
    key: 'close',
    label: 'Close',
    icon: KanbanSquare,
    title: 'The pipeline reflects reality',
    text: 'Stage changes are deliberate. Meetings, proposals and negotiations are visible to the manager without a status meeting.',
    points: ['Seven clear stages', 'Drag-and-drop movement', 'Lost reasons are required'],
  },
  {
    key: 'collect',
    label: 'Collect',
    icon: Wallet,
    title: 'Cash and commission stay in sync',
    text: 'Record payments against the deal. Earned commission grows from actual cash, and the owner releases it with a clear audit trail.',
    points: ['Integer-paise payment tracking', 'Commission captured per deal', 'Owner approval before payout'],
  },
]

const Visual = ({ stage }) => {
  if (stage === 0) {
    return (
      <div className="rounded-2xl border border-orange-100 bg-white p-5 shadow-[0_20px_60px_rgba(249,115,22,0.1)]">
        <div className="flex items-center justify-between">
          <p className="text-[8px] font-bold uppercase tracking-[0.1em] text-orange-500">New lead</p>
          <span className="rounded-full bg-orange-50 px-2 py-1 text-[7px] font-semibold text-orange-700">High priority</span>
        </div>
        <p className="mt-3 text-[17px] font-bold tracking-[-0.03em] text-slate-900">Summit Fitness</p>
        <p className="mt-1 text-[9px] text-slate-400">Referral · Bengaluru · ₹1,20,000</p>
        <div className="mt-5 grid grid-cols-2 gap-2">
          {[['Contact', 'Ananya Rao'], ['Owner', 'Meera Kapoor'], ['Source', 'Referral'], ['Next step', 'First call']].map(([label, value]) => (
            <div key={label} className="rounded-lg border border-slate-100 bg-slate-50 p-2.5">
              <p className="text-[6.5px] uppercase tracking-[0.07em] text-slate-400">{label}</p>
              <p className="mt-0.5 text-[8.5px] font-semibold text-slate-700">{value}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-orange-50 px-3 py-2">
          <Check className="h-3 w-3 text-orange-600" />
          <p className="text-[8px] font-medium text-orange-800/70">Lead is assigned and ready for outreach.</p>
        </div>
      </div>
    )
  }
  if (stage === 1) {
    return (
      <div className="rounded-2xl border border-orange-100 bg-white p-5 shadow-[0_20px_60px_rgba(249,115,22,0.1)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-orange-500 text-white"><PhoneCall className="h-3.5 w-3.5" /></span>
            <div>
              <p className="text-[9.5px] font-bold text-slate-800">Call logged</p>
              <p className="text-[7.5px] text-slate-400">Summit Fitness · 4m 12s</p>
            </div>
          </div>
          <span className="rounded-full bg-emerald-50 px-2 py-1 text-[7px] font-bold text-emerald-700">Interested</span>
        </div>
        <div className="mt-5 flex h-14 items-center gap-0.5 rounded-lg bg-orange-50 px-3">
          {[20, 42, 68, 36, 54, 80, 46, 64, 30, 72, 44, 58, 26, 62, 38, 50, 24, 60, 40, 68].map((height, index) => (
            <span key={index} className="w-1 rounded-full bg-orange-400/70" style={{ height: `${height}%` }} />
          ))}
        </div>
        <div className="mt-4 rounded-lg border border-slate-100 p-3">
          <p className="text-[6.5px] uppercase tracking-[0.07em] text-slate-400">Notes</p>
          <p className="mt-1 text-[8.5px] leading-relaxed text-slate-600">Owner is evaluating the annual plan. Send proposal by Friday and confirm the decision maker.</p>
        </div>
        <div className="mt-3 flex items-center justify-between rounded-lg border border-orange-100 bg-orange-50 px-3 py-2">
          <div className="flex items-center gap-1.5">
            <CalendarClock className="h-3 w-3 text-orange-600" />
            <p className="text-[8px] font-medium text-orange-800">Follow-up · tomorrow 11:00</p>
          </div>
          <ChevronRight className="h-3 w-3 text-orange-500" />
        </div>
      </div>
    )
  }
  if (stage === 2) {
    return (
      <div className="rounded-2xl border border-orange-100 bg-white p-5 shadow-[0_20px_60px_rgba(249,115,22,0.1)]">
        <div className="flex items-center justify-between">
          <p className="text-[8px] font-bold uppercase tracking-[0.1em] text-orange-500">Pipeline</p>
          <span className="text-[7px] text-slate-400">₹12.8L open</span>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {[
            ['Interested', ['Cedar Cafe', 'Atlas Logistics'], 'bg-orange-100 text-orange-700'],
            ['Negotiation', ['Summit Fitness'], 'bg-amber-100 text-amber-700'],
            ['Won', ['Juniper Studio'], 'bg-emerald-100 text-emerald-700'],
          ].map(([name, cards, tone], columnIndex) => (
            <div key={name} className={`rounded-lg border p-1.5 ${columnIndex === 1 ? 'border-orange-200 bg-orange-50/40' : 'border-slate-100'}`}>
              <span className={`rounded px-1.5 py-0.5 text-[6.5px] font-bold ${tone}`}>{name}</span>
              <div className="mt-1.5 space-y-1.5">
                {cards.map((card) => (
                  <div key={card} className="rounded-md border border-slate-100 bg-white p-1.5 shadow-sm">
                    <p className="truncate text-[7px] font-semibold text-slate-700">{card}</p>
                    <div className="mt-1 h-1 w-8 rounded-full bg-orange-100" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2">
          <p className="text-[7.5px] text-slate-500">Move a card to update the stage.</p>
          <span className="rounded bg-orange-500 px-2 py-1 text-[6.5px] font-bold text-white">Audited</span>
        </div>
      </div>
    )
  }
  return (
    <div className="rounded-2xl border border-orange-100 bg-white p-5 shadow-[0_20px_60px_rgba(249,115,22,0.1)]">
      <div className="flex items-center justify-between">
        <p className="text-[8px] font-bold uppercase tracking-[0.1em] text-orange-500">Deal finance</p>
        <span className="rounded-full bg-emerald-50 px-2 py-1 text-[7px] font-bold text-emerald-700">Won</span>
      </div>
      <p className="mt-3 text-[17px] font-bold tracking-[-0.03em] text-slate-900">₹1,80,000</p>
      <p className="mt-1 text-[8px] text-slate-400">Juniper Studio · 35% captured</p>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-orange-400 to-orange-500" />
      </div>
      <div className="mt-2 flex justify-between text-[7px] text-slate-400"><span>₹90,000 received</span><span>₹90,000 outstanding</span></div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="rounded-lg border border-slate-100 bg-slate-50 p-2.5">
          <p className="text-[6.5px] uppercase tracking-[0.07em] text-slate-400">Earned commission</p>
          <p className="mt-1 text-[12px] font-bold text-slate-800">₹31,500</p>
        </div>
        <div className="rounded-lg border border-orange-100 bg-orange-50 p-2.5">
          <p className="text-[6.5px] uppercase tracking-[0.07em] text-orange-500">Approved</p>
          <p className="mt-1 text-[12px] font-bold text-orange-700">₹15,750</p>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2">
        <IndianRupee className="h-3 w-3 text-orange-400" />
        <p className="text-[7.5px] font-medium text-white/70">Owner approval recorded with actor and timestamp.</p>
      </div>
    </div>
  )
}

export const JourneyScroll = () => (
  <section id="journey" className="relative overflow-hidden border-y border-orange-100 bg-[#fff8f0]">
    <div className="pointer-events-none absolute inset-0 opacity-50" style={{ backgroundImage: 'radial-gradient(rgba(251,146,60,0.16) 1px, transparent 1px)', backgroundSize: '26px 26px', maskImage: 'radial-gradient(ellipse 75% 70% at 50% 30%, black, transparent)' }} />
    <div className="landing-aurora pointer-events-none absolute -left-24 top-40 h-96 w-96 rounded-full bg-orange-200/40 blur-[110px]" />
    <div className="landing-glow pointer-events-none absolute -right-24 bottom-24 h-96 w-96 rounded-full bg-amber-200/40 blur-[110px]" />

    <div className="relative mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/70 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-orange-600 backdrop-blur">
          <span className="landing-ticker-dot h-1.5 w-1.5 rounded-full bg-orange-500" />
          Lead to cash
        </p>
        <h2 className="mt-4 text-[clamp(2.4rem,5vw,4.2rem)] font-extrabold leading-[0.98] tracking-[-0.07em] text-slate-950">
          One record.<br />
          <span className="landing-gradient-text bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600 bg-[length:220%_auto] bg-clip-text text-transparent">Four moments that matter.</span>
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-[13px] leading-relaxed text-slate-600">
          The work moves in one direction: a lead is captured, the conversation is recorded, the pipeline moves, and the money is reconciled. No handoff loses the story.
        </p>
      </Reveal>

      <div className="mt-16 space-y-14 lg:mt-20 lg:space-y-24">
        {stages.map((stage, index) => {
          const Icon = stage.icon
          const flipped = index % 2 === 1
          return (
            <Reveal key={stage.key} delay={index * 40}>
              <div className="grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-16">
                <div className={flipped ? 'lg:order-2' : ''}>
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-orange-500 text-white shadow-[0_10px_24px_rgba(249,115,22,0.24)]"><Icon className="h-4 w-4" /></span>
                    <div>
                      <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-orange-500">Moment 0{index + 1}</p>
                      <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">{stage.label}</p>
                    </div>
                    <div className="landing-flow-line ml-2 h-px flex-1" />
                  </div>
                  <h3 className="mt-5 max-w-md text-[clamp(1.8rem,3.2vw,2.8rem)] font-extrabold leading-[1.04] tracking-[-0.055em] text-slate-950">{stage.title}</h3>
                  <p className="mt-3 max-w-md text-[12.5px] leading-relaxed text-slate-600">{stage.text}</p>
                  <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
                    {stage.points.map((point) => (
                      <div key={point} className="flex items-center gap-2 rounded-lg border border-orange-100 bg-white/60 px-2.5 py-2">
                        <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-orange-100 text-orange-600"><Check className="h-2.5 w-2.5" strokeWidth={3} /></span>
                        <span className="text-[10px] font-medium text-slate-600">{point}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={flipped ? 'lg:order-1' : ''}>
                  <div className="relative mx-auto max-w-md">
                    <span className="pointer-events-none absolute -top-10 right-0 select-none text-[7rem] font-black leading-none tracking-[-0.1em] text-orange-200/50">0{index + 1}</span>
                    <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-orange-200/50 to-transparent blur-2xl" />
                    <div className="landing-float-soft relative transition duration-500 hover:-translate-y-1">
                      <Visual stage={index} />
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          )
        })}
      </div>

      <Reveal delay={100} className="mt-16">
        <div className="flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-orange-100 bg-white/70 px-4 py-4 backdrop-blur sm:gap-3">
          {stages.map(({ key, label }, index) => (
            <div key={key} className="flex items-center gap-2 sm:gap-3">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[9.5px] font-bold ${index === 0 ? 'bg-orange-500 text-white' : 'bg-orange-50 text-orange-700'}`}>
                {label}
              </span>
              {index < stages.length - 1 && <ChevronRight className="h-3.5 w-3.5 text-orange-300" />}
            </div>
          ))}
          <span className="ml-1 hidden text-[9px] font-medium text-slate-400 sm:inline">one continuous record</span>
        </div>
      </Reveal>
    </div>
  </section>
)
