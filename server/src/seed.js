import { pathToFileURL } from 'url'
import { connectDatabase, disconnectDatabase } from './config/db.js'
import { env } from './config/env.js'
import { DEFAULT_COMMISSION_RULES } from './config/constants.js'
import { Activity } from './models/Activity.js'
import { AuditLog } from './models/AuditLog.js'
import { CallLog } from './models/CallLog.js'
import { Commission } from './models/Commission.js'
import { Deal } from './models/Deal.js'
import { FollowUp } from './models/FollowUp.js'
import { Lead } from './models/Lead.js'
import { Membership } from './models/Membership.js'
import { Notification } from './models/Notification.js'
import { Organization } from './models/Organization.js'
import { Payment } from './models/Payment.js'
import { User } from './models/User.js'
import { createCommissionSnapshot } from './services/commission.service.js'

const DEMO_SLUG = 'northstar-studio'
const DEMO_DOMAIN = 'demo.leadpilot.test'
const DAY = 24 * 60 * 60 * 1000

const dateAt = (daysFromNow, hour = 10, minute = 0) => {
  const date = new Date(Date.now() + daysFromNow * DAY)
  date.setHours(hour, minute, 0, 0)
  return date
}

const paise = (rupees) => Math.round(rupees * 100)

export const seedDemoData = async () => {
  const existing = await Organization.findOne({ slug: DEMO_SLUG })
  if (existing) {
    return { seeded: false, organizationId: existing._id, reason: 'already-seeded' }
  }

  const [owner, manager, sana, rohit] = await User.create([
    {
      name: 'Meera Kapoor',
      email: env.seed.ownerEmail,
      passwordHash: env.seed.ownerPassword,
      avatarColor: '#f97316',
      lastLoginAt: dateAt(0, 9),
    },
    {
      name: 'Arjun Sethi',
      email: `manager@${DEMO_DOMAIN}`,
      passwordHash: env.seed.ownerPassword,
      avatarColor: '#8b5cf6',
    },
    {
      name: 'Sana Iqbal',
      email: `sana@${DEMO_DOMAIN}`,
      passwordHash: env.seed.ownerPassword,
      avatarColor: '#0ea5e9',
    },
    {
      name: 'Rohit Menon',
      email: `rohit@${DEMO_DOMAIN}`,
      passwordHash: env.seed.ownerPassword,
      avatarColor: '#10b981',
    },
  ])

  const organization = await Organization.create({
    name: 'Northstar Studio',
    slug: DEMO_SLUG,
    owner: owner._id,
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    commissionBasis: 'deal_value',
    commissionRules: DEFAULT_COMMISSION_RULES.map((rule) => ({ ...rule })),
    approvalRequired: true,
  })

  await Membership.create([
    {
      user: owner._id,
      organization: organization._id,
      role: 'owner',
      status: 'active',
      joinedAt: dateAt(-180),
    },
    {
      user: manager._id,
      organization: organization._id,
      role: 'manager',
      status: 'active',
      invitedBy: owner._id,
      joinedAt: dateAt(-120),
    },
    {
      user: sana._id,
      organization: organization._id,
      role: 'lead_generator',
      status: 'active',
      manager: manager._id,
      invitedBy: manager._id,
      joinedAt: dateAt(-90),
    },
    {
      user: rohit._id,
      organization: organization._id,
      role: 'lead_generator',
      status: 'active',
      manager: manager._id,
      invitedBy: manager._id,
      joinedAt: dateAt(-75),
    },
  ])

  const leadSeeds = [
    {
      businessName: 'Juniper Studio',
      contactPerson: 'Ananya Rao',
      phone: '+91 98450 11842',
      email: 'ananya@juniperstudio.example',
      website: 'juniperstudio.example',
      industry: 'Design studio',
      city: 'Bengaluru',
      source: 'Referral',
      assignedTo: sana._id,
      estimatedValuePaise: paise(180000),
      status: 'Won',
      priority: 'high',
      notes: 'Wants a complete brand and website refresh before their anniversary campaign.',
      lastContactedAt: dateAt(-3, 15),
      nextFollowUpAt: null,
      createdAt: dateAt(-24),
    },
    {
      businessName: 'Cedar Cafe',
      contactPerson: 'Karan Bhatia',
      phone: '+91 99872 44120',
      email: 'karan@cedarcafe.example',
      industry: 'Hospitality',
      city: 'Pune',
      source: 'Instagram',
      assignedTo: rohit._id,
      estimatedValuePaise: paise(45000),
      status: 'Won',
      priority: 'medium',
      notes: 'Single-location cafe. Paid in full after the first proposal.',
      lastContactedAt: dateAt(-6, 12),
      createdAt: dateAt(-19),
    },
    {
      businessName: 'Atlas Logistics',
      contactPerson: 'Nikhil Shah',
      phone: '+91 98201 77431',
      email: 'nikhil@atlaslogistics.example',
      industry: 'Logistics',
      city: 'Mumbai',
      source: 'LinkedIn',
      assignedTo: sana._id,
      estimatedValuePaise: paise(240000),
      status: 'Proposal Sent',
      priority: 'urgent',
      notes: 'Proposal includes a 12-week rollout and a three-person onboarding workshop.',
      lastContactedAt: dateAt(-2, 17),
      nextFollowUpAt: dateAt(0, 15, 30),
      createdAt: dateAt(-16),
    },
    {
      businessName: 'Harbor Dental',
      contactPerson: 'Dr. Rhea Dsouza',
      phone: '+91 98923 61005',
      email: 'rhea@harbordental.example',
      industry: 'Healthcare',
      city: 'Goa',
      source: 'Google Maps',
      assignedTo: rohit._id,
      estimatedValuePaise: paise(92000),
      status: 'Interested',
      priority: 'high',
      notes: 'Asked for a phased package with the landing page first.',
      lastContactedAt: dateAt(-1, 11),
      createdAt: dateAt(-12),
    },
    {
      businessName: 'Summit Fitness',
      contactPerson: 'Varun Malhotra',
      phone: '+91 98110 29088',
      email: 'varun@summitfitness.example',
      industry: 'Fitness',
      city: 'Delhi',
      source: 'Referral',
      assignedTo: sana._id,
      estimatedValuePaise: paise(120000),
      status: 'Contacted',
      priority: 'high',
      notes: 'Opening a second branch and needs a membership funnel before launch.',
      lastContactedAt: dateAt(-1, 16),
      nextFollowUpAt: dateAt(0, 11),
      createdAt: dateAt(-9),
    },
    {
      businessName: 'Northstar Interiors',
      contactPerson: 'Ira Sen',
      phone: '+91 98309 55417',
      email: 'ira@northstarinteriors.example',
      industry: 'Interior design',
      city: 'Kolkata',
      source: 'Manual',
      assignedTo: rohit._id,
      estimatedValuePaise: paise(80000),
      status: 'New Lead',
      priority: 'medium',
      notes: 'Imported from the founder network. No discovery call yet.',
      nextFollowUpAt: dateAt(-2, 10),
      createdAt: dateAt(-7),
    },
    {
      businessName: 'Bluewave Media',
      contactPerson: 'Aditya Nair',
      phone: '+91 99450 33876',
      email: 'aditya@bluewavemedia.example',
      industry: 'Media',
      city: 'Chennai',
      source: 'LinkedIn',
      assignedTo: sana._id,
      estimatedValuePaise: paise(65000),
      status: 'Meeting Scheduled',
      priority: 'medium',
      notes: 'Discovery meeting booked with the founder and marketing lead.',
      lastContactedAt: dateAt(-1, 14),
      nextFollowUpAt: dateAt(0, 17),
      createdAt: dateAt(-6),
    },
    {
      businessName: 'Greenfield Clinic',
      contactPerson: 'Dr. Sameer Kulkarni',
      phone: '+91 98812 44609',
      email: 'sameer@greenfieldclinic.example',
      industry: 'Healthcare',
      city: 'Hyderabad',
      source: 'Other',
      assignedTo: rohit._id,
      estimatedValuePaise: paise(150000),
      status: 'Negotiation',
      priority: 'urgent',
      notes: 'Comparing two scopes. Decision expected after the partner review.',
      lastContactedAt: dateAt(-2, 12),
      nextFollowUpAt: dateAt(4, 12),
      createdAt: dateAt(-21),
    },
    {
      businessName: 'Orbit Cafe',
      contactPerson: 'Meghna Pillai',
      phone: '+91 90040 77120',
      email: 'meghna@orbitcafe.example',
      industry: 'Hospitality',
      city: 'Kochi',
      source: 'Instagram',
      assignedTo: sana._id,
      estimatedValuePaise: paise(30000),
      status: 'Lost',
      priority: 'low',
      notes: 'Postponed the redesign and decided to use an in-house template.',
      lostReason: 'Timing and budget. They chose an in-house solution.',
      lastContactedAt: dateAt(-10, 13),
      createdAt: dateAt(-29),
    },
    {
      businessName: 'Paper Kite Events',
      contactPerson: 'Tanvi Desai',
      phone: '+91 98200 61734',
      email: 'tanvi@paperkite.example',
      industry: 'Events',
      city: 'Ahmedabad',
      source: 'Google Maps',
      assignedTo: rohit._id,
      estimatedValuePaise: paise(50000),
      status: 'New Lead',
      priority: 'medium',
      notes: 'Seasonal business. Best time to call is after 2 PM.',
      nextFollowUpAt: dateAt(2, 14),
      createdAt: dateAt(-4),
    },
    {
      businessName: 'Lumen Optics',
      contactPerson: 'Devika Iyer',
      phone: '+91 98402 30965',
      email: 'devika@lumenoptics.example',
      industry: 'Retail',
      city: 'Bengaluru',
      source: 'Referral',
      assignedTo: sana._id,
      estimatedValuePaise: paise(75000),
      status: 'Contacted',
      priority: 'medium',
      notes: 'Interested in a store locator and appointment booking flow.',
      lastContactedAt: dateAt(-4, 16),
      nextFollowUpAt: dateAt(-1, 15),
      createdAt: dateAt(-14),
    },
    {
      businessName: 'Verve Fitness',
      contactPerson: 'Kabir Anand',
      phone: '+91 98188 72031',
      email: 'kabir@vervefitness.example',
      industry: 'Fitness',
      city: 'Gurugram',
      source: 'LinkedIn',
      assignedTo: rohit._id,
      estimatedValuePaise: paise(110000),
      status: 'Interested',
      priority: 'high',
      notes: 'Wants a paid trial in one studio before rolling out to all locations.',
      lastContactedAt: dateAt(-3, 18),
      nextFollowUpAt: dateAt(3, 11),
      createdAt: dateAt(-11),
    },
  ]

  const leads = await Lead.create(
    leadSeeds.map((lead) => ({
      ...lead,
      organization: organization._id,
      createdBy: manager._id,
      country: 'India',
    })),
  )

  const byName = new Map(leads.map((lead) => [lead.businessName, lead]))

  await FollowUp.create([
    {
      organization: organization._id,
      lead: byName.get('Summit Fitness')._id,
      assignedTo: sana._id,
      type: 'follow_up',
      dueAt: dateAt(0, 11),
      priority: 'high',
      notes: 'Confirm the launch timeline and share the membership funnel outline.',
      createdBy: manager._id,
    },
    {
      organization: organization._id,
      lead: byName.get('Atlas Logistics')._id,
      assignedTo: sana._id,
      type: 'follow_up',
      dueAt: dateAt(0, 15, 30),
      priority: 'urgent',
      notes: 'Walk through the proposal and ask for the rollout decision date.',
      createdBy: manager._id,
    },
    {
      organization: organization._id,
      lead: byName.get('Bluewave Media')._id,
      assignedTo: sana._id,
      type: 'meeting',
      dueAt: dateAt(0, 17),
      meetingAt: dateAt(0, 17),
      priority: 'medium',
      notes: 'Discovery call with Aditya and the marketing lead.',
      createdBy: manager._id,
    },
    {
      organization: organization._id,
      lead: byName.get('Northstar Interiors')._id,
      assignedTo: rohit._id,
      type: 'follow_up',
      dueAt: dateAt(-2, 10),
      priority: 'medium',
      notes: 'First discovery call. Reschedule if the founder is unavailable.',
      createdBy: manager._id,
    },
    {
      organization: organization._id,
      lead: byName.get('Lumen Optics')._id,
      assignedTo: sana._id,
      type: 'follow_up',
      dueAt: dateAt(-1, 15),
      priority: 'medium',
      notes: 'Send the appointment booking examples and ask about store count.',
      createdBy: manager._id,
    },
    {
      organization: organization._id,
      lead: byName.get('Paper Kite Events')._id,
      assignedTo: rohit._id,
      type: 'follow_up',
      dueAt: dateAt(2, 14),
      priority: 'medium',
      notes: 'Call after 2 PM. Ask about their next event season.',
      createdBy: manager._id,
    },
    {
      organization: organization._id,
      lead: byName.get('Verve Fitness')._id,
      assignedTo: rohit._id,
      type: 'follow_up',
      dueAt: dateAt(3, 11),
      priority: 'high',
      notes: 'Agree on the paid trial scope and success criteria.',
      createdBy: manager._id,
    },
    {
      organization: organization._id,
      lead: byName.get('Greenfield Clinic')._id,
      assignedTo: rohit._id,
      type: 'meeting',
      dueAt: dateAt(4, 12),
      meetingAt: dateAt(4, 12),
      priority: 'urgent',
      notes: 'Partner review call. Bring both scope options and the implementation plan.',
      createdBy: manager._id,
    },
  ])

  await CallLog.create([
    {
      organization: organization._id,
      lead: byName.get('Summit Fitness')._id,
      user: sana._id,
      calledAt: dateAt(-1, 16),
      outcome: 'Interested',
      durationSeconds: 252,
      notes: 'Launch is six weeks away. They want the funnel live before the opening.',
      nextAction: 'Share the funnel outline and confirm the decision maker.',
      followUpAt: dateAt(0, 11),
      createdBy: sana._id,
    },
    {
      organization: organization._id,
      lead: byName.get('Harbor Dental')._id,
      user: rohit._id,
      calledAt: dateAt(-1, 11),
      outcome: 'Interested',
      durationSeconds: 186,
      notes: 'Rhea prefers a phased package. Landing page first, booking flow later.',
      nextAction: 'Prepare the phased scope and pricing.',
      followUpAt: dateAt(0, 14),
      createdBy: rohit._id,
    },
    {
      organization: organization._id,
      lead: byName.get('Atlas Logistics')._id,
      user: sana._id,
      calledAt: dateAt(-2, 17),
      outcome: 'Meeting Requested',
      durationSeconds: 431,
      notes: 'Proposal is with their COO. Rollout timeline is the main concern.',
      nextAction: 'Follow up on the decision date.',
      followUpAt: dateAt(0, 15, 30),
      createdBy: sana._id,
    },
    {
      organization: organization._id,
      lead: byName.get('Lumen Optics')._id,
      user: sana._id,
      calledAt: dateAt(-4, 16),
      outcome: 'Call Back Later',
      durationSeconds: 142,
      notes: 'Devika is travelling this week. Asked for a follow-up after Monday.',
      nextAction: 'Send examples and call back.',
      followUpAt: dateAt(-1, 15),
      createdBy: sana._id,
    },
    {
      organization: organization._id,
      lead: byName.get('Orbit Cafe')._id,
      user: sana._id,
      calledAt: dateAt(-10, 13),
      outcome: 'Not Interested',
      durationSeconds: 96,
      notes: 'They have postponed the redesign and will revisit next year.',
      nextAction: 'Mark the lead lost and keep the door open.',
      createdBy: sana._id,
    },
    {
      organization: organization._id,
      lead: byName.get('Verve Fitness')._id,
      user: rohit._id,
      calledAt: dateAt(-3, 18),
      outcome: 'Interested',
      durationSeconds: 318,
      notes: 'Kabir wants one paid trial studio before a full rollout.',
      nextAction: 'Define the trial scope and success metrics.',
      followUpAt: dateAt(3, 11),
      createdBy: rohit._id,
    },
    {
      organization: organization._id,
      lead: byName.get('Cedar Cafe')._id,
      user: rohit._id,
      calledAt: dateAt(-6, 12),
      outcome: 'Interested',
      durationSeconds: 205,
      notes: 'Approved the proposal immediately and asked for the payment link.',
      nextAction: 'Record payment and start onboarding.',
      createdBy: rohit._id,
    },
    {
      organization: organization._id,
      lead: byName.get('Juniper Studio')._id,
      user: sana._id,
      calledAt: dateAt(-3, 15),
      outcome: 'Interested',
      durationSeconds: 268,
      notes: 'Final review call. Ananya approved the final invoice.',
      nextAction: 'Close the deal and collect the balance.',
      createdBy: sana._id,
    },
  ])

  const dealSeeds = [
    {
      lead: byName.get('Juniper Studio'),
      businessName: 'Juniper Studio',
      contactPerson: 'Ananya Rao',
      amountPaise: paise(180000),
      assignedTo: sana._id,
      status: 'won',
      proposalDate: dateAt(-14),
      expectedClosingDate: dateAt(-4),
      actualClosingDate: dateAt(-3),
      notes: 'Brand, website and launch campaign. Full scope approved.',
      createdAt: dateAt(-14),
    },
    {
      lead: byName.get('Cedar Cafe'),
      businessName: 'Cedar Cafe',
      contactPerson: 'Karan Bhatia',
      amountPaise: paise(45000),
      assignedTo: rohit._id,
      status: 'won',
      proposalDate: dateAt(-9),
      expectedClosingDate: dateAt(-7),
      actualClosingDate: dateAt(-6),
      notes: 'Menu microsite and photography day.',
      createdAt: dateAt(-9),
    },
    {
      lead: byName.get('Atlas Logistics'),
      businessName: 'Atlas Logistics',
      contactPerson: 'Nikhil Shah',
      amountPaise: paise(240000),
      assignedTo: sana._id,
      status: 'open',
      proposalDate: dateAt(-8),
      expectedClosingDate: dateAt(6),
      notes: 'Twelve-week rollout with onboarding workshops for three teams.',
      createdAt: dateAt(-8),
    },
    {
      lead: byName.get('Harbor Dental'),
      businessName: 'Harbor Dental',
      contactPerson: 'Dr. Rhea Dsouza',
      amountPaise: paise(92000),
      assignedTo: rohit._id,
      status: 'open',
      proposalDate: dateAt(-3),
      expectedClosingDate: dateAt(10),
      notes: 'Phased package. Landing page first, booking flow in phase two.',
      createdAt: dateAt(-3),
    },
    {
      lead: byName.get('Summit Fitness'),
      businessName: 'Summit Fitness',
      contactPerson: 'Varun Malhotra',
      amountPaise: paise(120000),
      assignedTo: sana._id,
      status: 'open',
      proposalDate: null,
      expectedClosingDate: dateAt(14),
      notes: 'Membership funnel for the second branch launch.',
      createdAt: dateAt(-1),
    },
  ]

  const deals = []
  for (const seed of dealSeeds) {
    const deal = await Deal.create({
      organization: organization._id,
      lead: seed.lead._id,
      businessName: seed.businessName,
      contactPerson: seed.contactPerson,
      amountPaise: seed.amountPaise,
      assignedTo: seed.assignedTo,
      status: seed.status,
      proposalDate: seed.proposalDate,
      expectedClosingDate: seed.expectedClosingDate,
      actualClosingDate: seed.actualClosingDate,
      notes: seed.notes,
      commissionSnapshot: createCommissionSnapshot({
        amountPaise: seed.amountPaise,
        organization,
      }),
      createdBy: manager._id,
      createdAt: seed.createdAt,
    })
    deals.push(deal)
  }

  const [juniperDeal, cedarDeal, atlasDeal, harborDeal] = deals

  await Payment.create([
    {
      organization: organization._id,
      deal: juniperDeal._id,
      amountPaise: paise(90000),
      method: 'bank_transfer',
      receivedAt: dateAt(-12, 12),
      reference: 'NEFT-JNP-4821',
      notes: 'Advance payment for phase one.',
      recordedBy: owner._id,
    },
    {
      organization: organization._id,
      deal: juniperDeal._id,
      amountPaise: paise(90000),
      method: 'upi',
      receivedAt: dateAt(-3, 16),
      reference: 'UPI-JNP-9017',
      notes: 'Balance payment after final review.',
      recordedBy: owner._id,
    },
    {
      organization: organization._id,
      deal: cedarDeal._id,
      amountPaise: paise(45000),
      method: 'upi',
      receivedAt: dateAt(-6, 13),
      reference: 'UPI-CED-3382',
      notes: 'Paid in full.',
      recordedBy: owner._id,
    },
  ])

  const [juniperCommission, cedarCommission] = await Commission.create([
    {
      organization: organization._id,
      deal: juniperDeal._id,
      member: juniperDeal.assignedTo,
      basis: juniperDeal.commissionSnapshot.basis,
      dealAmountPaise: juniperDeal.amountPaise,
      ratePercent: juniperDeal.commissionSnapshot.ratePercent,
      calculatedCommissionPaise: juniperDeal.commissionSnapshot.calculatedCommissionPaise,
      receivedPaise: paise(180000),
      earnedCommissionPaise: paise(63000),
      pendingCommissionPaise: 0,
      approvedCommissionPaise: paise(31500),
      paidCommissionPaise: paise(15000),
      status: 'partially_approved',
      approvals: [
        {
          amountPaise: paise(31500),
          approvedBy: owner._id,
          approvedAt: dateAt(-2, 11),
          note: 'Half of the earned commission approved after the advance payment.',
        },
      ],
      payouts: [
        {
          amountPaise: paise(15000),
          paidBy: owner._id,
          paidAt: dateAt(-1, 17),
          method: 'upi',
          reference: 'UPI-COMM-7781',
          note: 'First commission payout.',
        },
      ],
    },
    {
      organization: organization._id,
      deal: cedarDeal._id,
      member: cedarDeal.assignedTo,
      basis: cedarDeal.commissionSnapshot.basis,
      dealAmountPaise: cedarDeal.amountPaise,
      ratePercent: cedarDeal.commissionSnapshot.ratePercent,
      calculatedCommissionPaise: cedarDeal.commissionSnapshot.calculatedCommissionPaise,
      receivedPaise: paise(45000),
      earnedCommissionPaise: paise(6750),
      pendingCommissionPaise: 0,
      approvedCommissionPaise: paise(6750),
      paidCommissionPaise: paise(6750),
      status: 'paid',
      approvals: [
        {
          amountPaise: paise(6750),
          approvedBy: owner._id,
          approvedAt: dateAt(-5, 15),
          note: 'Full commission approved.',
        },
      ],
      payouts: [
        {
          amountPaise: paise(6750),
          paidBy: owner._id,
          paidAt: dateAt(-5, 16),
          method: 'bank_transfer',
          reference: 'NEFT-COMM-6120',
          note: 'Commission paid in full.',
        },
      ],
    },
  ])

  const [atlasCommission, harborCommission] = await Commission.create([
    {
      organization: organization._id,
      deal: atlasDeal._id,
      member: atlasDeal.assignedTo,
      basis: atlasDeal.commissionSnapshot.basis,
      dealAmountPaise: atlasDeal.amountPaise,
      ratePercent: atlasDeal.commissionSnapshot.ratePercent,
      calculatedCommissionPaise: atlasDeal.commissionSnapshot.calculatedCommissionPaise,
      receivedPaise: 0,
      earnedCommissionPaise: 0,
      pendingCommissionPaise: atlasDeal.commissionSnapshot.calculatedCommissionPaise,
      status: 'pending',
    },
    {
      organization: organization._id,
      deal: harborDeal._id,
      member: harborDeal.assignedTo,
      basis: harborDeal.commissionSnapshot.basis,
      dealAmountPaise: harborDeal.amountPaise,
      ratePercent: harborDeal.commissionSnapshot.ratePercent,
      calculatedCommissionPaise: harborDeal.commissionSnapshot.calculatedCommissionPaise,
      receivedPaise: 0,
      earnedCommissionPaise: 0,
      pendingCommissionPaise: harborDeal.commissionSnapshot.calculatedCommissionPaise,
      status: 'pending',
    },
  ])

  await Activity.create([
    {
      organization: organization._id,
      lead: byName.get('Juniper Studio')._id,
      deal: juniperDeal._id,
      actor: owner._id,
      type: 'payment.recorded',
      message: '₹90,000 payment recorded for Juniper Studio.',
      createdAt: dateAt(-3, 16),
    },
    {
      organization: organization._id,
      deal: juniperDeal._id,
      actor: owner._id,
      type: 'commission.approved',
      message: '₹31,500 commission approved for Sana Iqbal.',
      createdAt: dateAt(-2, 11),
    },
    {
      organization: organization._id,
      lead: byName.get('Summit Fitness')._id,
      actor: sana._id,
      type: 'call.logged',
      message: 'Sana logged an interested call with Summit Fitness.',
      createdAt: dateAt(-1, 16),
    },
    {
      organization: organization._id,
      lead: byName.get('Harbor Dental')._id,
      actor: rohit._id,
      type: 'follow_up.scheduled',
      message: 'Rohit scheduled a follow-up with Harbor Dental.',
      createdAt: dateAt(-1, 11, 30),
    },
    {
      organization: organization._id,
      lead: byName.get('Atlas Logistics')._id,
      deal: atlasDeal._id,
      actor: sana._id,
      type: 'deal.updated',
      message: 'Atlas Logistics proposal sent for ₹2,40,000.',
      createdAt: dateAt(-2, 17, 30),
    },
    {
      organization: organization._id,
      lead: byName.get('Juniper Studio')._id,
      deal: juniperDeal._id,
      actor: owner._id,
      type: 'deal.won',
      message: 'Juniper Studio marked won for ₹1,80,000.',
      createdAt: dateAt(-3, 15, 30),
    },
    {
      organization: organization._id,
      lead: byName.get('Cedar Cafe')._id,
      deal: cedarDeal._id,
      actor: owner._id,
      type: 'deal.won',
      message: 'Cedar Cafe marked won for ₹45,000.',
      createdAt: dateAt(-6, 13, 30),
    },
  ])

  await Notification.create([
    {
      organization: organization._id,
      user: owner._id,
      type: 'system',
      title: 'Demo workspace ready',
      message: 'Northstar Studio is seeded with leads, calls, deals and commissions.',
      link: '/dashboard',
      dedupeKey: 'demo-seed-ready',
    },
    {
      organization: organization._id,
      user: owner._id,
      type: 'commission',
      title: 'Commission awaiting approval',
      message: 'Atlas Logistics has ₹84,000 in potential commission once payments are recorded.',
      link: '/commissions',
      dedupeKey: 'demo-atlas-commission',
    },
    {
      organization: organization._id,
      user: sana._id,
      type: 'follow_up',
      title: 'Three follow-ups in your queue',
      message: 'Start with Atlas Logistics at 3:30 PM.',
      link: '/follow-ups',
      dedupeKey: 'demo-sana-queue',
    },
  ])

  await AuditLog.create([
    {
      organization: organization._id,
      actor: owner._id,
      action: 'organization.updated',
      entityType: 'Organization',
      entityId: organization._id,
      after: { name: organization.name, currency: 'INR' },
      createdAt: dateAt(-5, 10),
    },
    {
      organization: organization._id,
      actor: owner._id,
      action: 'commission.approved',
      entityType: 'Commission',
      entityId: juniperCommission._id,
      after: { amountPaise: paise(31500) },
      createdAt: dateAt(-2, 11),
    },
    {
      organization: organization._id,
      actor: owner._id,
      action: 'commission.paid',
      entityType: 'Commission',
      entityId: juniperCommission._id,
      after: { amountPaise: paise(15000) },
      createdAt: dateAt(-1, 17),
    },
    {
      organization: organization._id,
      actor: owner._id,
      action: 'commission.paid',
      entityType: 'Commission',
      entityId: cedarCommission._id,
      after: { amountPaise: paise(6750) },
      createdAt: dateAt(-5, 16),
    },
    {
      organization: organization._id,
      actor: owner._id,
      action: 'organization.commission_rules_updated',
      entityType: 'Organization',
      entityId: organization._id,
      after: { rules: DEFAULT_COMMISSION_RULES },
      createdAt: dateAt(-30, 9),
    },
  ])

  return {
    seeded: true,
    organizationId: organization._id,
    ownerEmail: owner.email,
    counts: {
      users: 4,
      leads: leads.length,
      deals: deals.length,
      commissions: 4,
      pendingCommissionId: atlasCommission._id,
      openCommissionId: harborCommission._id,
    },
  }
}

const isDirectRun =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href

if (isDirectRun) {
  const run = async () => {
    try {
      if (env.useMemoryDb) {
        console.warn(
          '[seed] USE_MEMORY_DB=true starts a temporary database. Run the API with SEED_DEMO=true to keep the demo dataset in memory.',
        )
      }
      await connectDatabase()
      const result = await seedDemoData()
      if (result.seeded) {
        console.log(`[seed] Demo workspace created for ${result.ownerEmail}.`)
        console.log('[seed] All demo users use SEED_OWNER_PASSWORD.')
      } else {
        console.log(`[seed] Skipped: ${result.reason}.`)
      }
    } catch (error) {
      console.error('[seed] Failed:', error)
      process.exitCode = 1
    } finally {
      await disconnectDatabase()
    }
  }
  run()
}
