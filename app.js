const listings = [
  {
    id: 1,
    name: "Dubai Marina Loft",
    city: "Dubai",
    neighborhood: "Dubai Marina",
    bedrooms: 1,
    guests: 2,
    price: 2100,
    tags: ["Work ready", "Eco"],
    rating: 4.8,
  },
  {
    id: 2,
    name: "Olaya Family Apartment",
    city: "Riyadh",
    neighborhood: "Olaya",
    bedrooms: 3,
    guests: 6,
    price: 3600,
    tags: ["Family", "Pet friendly"],
    rating: 4.9,
  },
  {
    id: 3,
    name: "Zamalek Skyline Studio",
    city: "Cairo",
    neighborhood: "Zamalek",
    bedrooms: 1,
    guests: 2,
    price: 3900,
    tags: ["Work ready"],
    rating: 4.7,
  },
  {
    id: 4,
    name: "West Bay Workspace",
    city: "Doha",
    neighborhood: "West Bay",
    bedrooms: 2,
    guests: 4,
    price: 2400,
    tags: ["Work ready", "Pet friendly"],
    rating: 4.6,
  },
  {
    id: 5,
    name: "Jabal Amman Calm Flat",
    city: "Amman",
    neighborhood: "Jabal Amman",
    bedrooms: 2,
    guests: 4,
    price: 2800,
    tags: ["Eco", "Family"],
    rating: 4.9,
  },
  {
    id: 6,
    name: "Business Bay Penthouse",
    city: "Dubai",
    neighborhood: "Business Bay",
    bedrooms: 2,
    guests: 4,
    price: 3200,
    tags: ["Work ready"],
    rating: 4.8,
  },
];

const listingsContainer = document.getElementById("listings");
const priceFilter = document.getElementById("priceFilter");
const priceValue = document.getElementById("priceValue");
const cityFilter = document.getElementById("cityFilter");
const bedFilter = document.getElementById("bedFilter");
const guestFilter = document.getElementById("guestFilter");
const chips = document.querySelectorAll(".chip");

let activeTag = "All";

const roles = ["Tenant", "Landlord", "Admin", "Ops (field manager)", "Support"];
const authStack = [
  "Phone/email OTP",
  "Device binding",
  "Session management",
  "Optional KYC hooks",
];
const permissionMatrix = {
  "Tenant анкеты": {
    Tenant: "Self",
    Landlord: "View assigned",
    Admin: "All",
    "Ops (field manager)": "View assigned",
    Support: "View assigned",
  },
  Documents: {
    Tenant: "Upload/view",
    Landlord: "Lease-only",
    Admin: "All",
    "Ops (field manager)": "Field docs",
    Support: "Read-only",
  },
  "Payout details": {
    Tenant: "None",
    Landlord: "Own payouts",
    Admin: "All",
    "Ops (field manager)": "None",
    Support: "Masked",
  },
};

const getRolePermissions = (role) =>
  Object.entries(permissionMatrix).map(([area, permissions]) => ({
    area,
    permission: permissions[role] ?? "None",
  }));

const canAccess = (role, area) => {
  const permission = permissionMatrix[area]?.[role] ?? "None";
  return permission !== "None";
};

const getIdentitySummary = () => ({
  roles: [...roles],
  auth: [...authStack],
  permissionAreas: Object.keys(permissionMatrix),
});

window.EasyFlatIdentity = {
  roles,
  authStack,
  permissionMatrix,
  getRolePermissions,
  canAccess,
  getIdentitySummary,
};

const generateId = (prefix) => `${prefix}_${crypto.randomUUID?.() ?? Date.now()}`;

const createProperty = (input = {}) => ({
  id: input.id ?? generateId("property"),
  name: input.name ?? "",
  address: input.address ?? "",
  units: input.units ?? [],
  media: input.media ?? [],
  status: input.status ?? "draft",
  createdAt: input.createdAt ?? new Date().toISOString(),
});

const createUnit = (input = {}) => ({
  id: input.id ?? generateId("unit"),
  label: input.label ?? "",
  rooms: input.rooms ?? [],
  amenities: input.amenities ?? [],
  rules: input.rules ?? [],
  availability: input.availability ?? [],
});

const createRoom = (input = {}) => ({
  id: input.id ?? generateId("room"),
  name: input.name ?? "",
  sizeSqm: input.sizeSqm ?? null,
  type: input.type ?? "bedroom",
});

const createAmenity = (input = {}) => ({
  id: input.id ?? generateId("amenity"),
  name: input.name ?? "",
  category: input.category ?? "general",
});

const createRule = (input = {}) => ({
  id: input.id ?? generateId("rule"),
  title: input.title ?? "",
  description: input.description ?? "",
});

const createAvailability = (input = {}) => ({
  startDate: input.startDate ?? null,
  endDate: input.endDate ?? null,
  status: input.status ?? "available",
});

const uploadMedia = (file = {}, { type, uploadedBy } = {}) => ({
  id: generateId("media"),
  type: type ?? "image",
  fileName: file.name ?? "untitled",
  uploadedBy: uploadedBy ?? "unknown",
  status: "uploaded",
  createdAt: new Date().toISOString(),
});

const queueMediaModeration = (mediaItem) => ({
  ...mediaItem,
  status: "in_moderation",
  moderationJobId: `mod_${mediaItem.id}`,
});

const storeOnCdn = (mediaItem, { cdnUrl }) => ({
  ...mediaItem,
  status: "stored",
  cdnUrl,
});

const enqueueTranscode = (mediaItem, { profile }) => ({
  ...mediaItem,
  transcodeJobId: `transcode_${mediaItem.id}`,
  transcodeProfile: profile,
});

const attachTour = (property, { provider, url }) => ({
  ...property,
  tour: {
    provider,
    url,
    status: "linked",
  },
});

const createListingDraft = (property, template = {}) => ({
  id: generateId("listing"),
  propertyId: property?.id ?? "",
  status: "draft",
  content: {
    title: template.title ?? property?.name ?? "",
    description: template.description ?? "",
    highlights: template.highlights ?? [],
  },
  auditLog: [
    {
      action: "draft_created",
      at: new Date().toISOString(),
    },
  ],
  versions: [
    {
      version: 1,
      contentSnapshot: { ...template },
      editedBy: "system",
      editedAt: new Date().toISOString(),
    },
  ],
});

const applyManagerEdits = (listing, edits, managerId) => ({
  ...listing,
  content: {
    ...listing.content,
    ...edits,
  },
  auditLog: [
    ...listing.auditLog,
    {
      action: "manager_edit",
      at: new Date().toISOString(),
      by: managerId,
    },
  ],
  versions: [
    ...listing.versions,
    {
      version: listing.versions.length + 1,
      contentSnapshot: { ...listing.content, ...edits },
      editedBy: managerId,
      editedAt: new Date().toISOString(),
    },
  ],
});

const setListingStatus = (listing, nextStatus, actorId) => {
  const allowedTransitions = {
    draft: ["review", "archived"],
    review: ["live", "draft", "archived"],
    live: ["paused", "archived"],
    paused: ["live", "archived"],
    archived: [],
  };
  if (!allowedTransitions[listing.status]?.includes(nextStatus)) {
    throw new Error(`Invalid transition from ${listing.status} to ${nextStatus}`);
  }
  return {
    ...listing,
    status: nextStatus,
    auditLog: [
      ...listing.auditLog,
      {
        action: "status_change",
        at: new Date().toISOString(),
        by: actorId,
        details: `${listing.status} → ${nextStatus}`,
      },
    ],
  };
};

window.EasyFlatProperty = {
  createProperty,
  createUnit,
  createRoom,
  createAmenity,
  createRule,
  createAvailability,
  uploadMedia,
  queueMediaModeration,
  storeOnCdn,
  enqueueTranscode,
  attachTour,
  createListingDraft,
  applyManagerEdits,
  setListingStatus,
};

const searchListings = ({ listingsData, geo, price, rooms, metro, filters, negotiable }) => {
  const matchesGeo = (listing) => {
    if (!geo) return true;
    if (geo.city && listing.city !== geo.city) return false;
    if (geo.neighborhood && listing.neighborhood !== geo.neighborhood) return false;
    return true;
  };

  const matchesPrice = (listing) => {
    if (!price) return true;
    const minOk = price.min ? listing.price >= price.min : true;
    const maxOk = price.max ? listing.price <= price.max : true;
    return minOk && maxOk;
  };

  const matchesRooms = (listing) => {
    if (!rooms) return true;
    if (rooms.min && listing.bedrooms < rooms.min) return false;
    if (rooms.max && listing.bedrooms > rooms.max) return false;
    return true;
  };

  const matchesMetro = (listing) => {
    if (!metro) return true;
    return listing.metroStations?.includes(metro);
  };

  const matchesFilters = (listing) => {
    if (!filters || filters.length === 0) return true;
    return filters.every((tag) => listing.tags.includes(tag));
  };

  const matchesNegotiable = (listing) =>
    negotiable === undefined ? true : listing.negotiable === negotiable;

  return listingsData.filter(
    (listing) =>
      matchesGeo(listing) &&
      matchesPrice(listing) &&
      matchesRooms(listing) &&
      matchesMetro(listing) &&
      matchesFilters(listing) &&
      matchesNegotiable(listing)
  );
};

const buildListingPageData = (listing, { gallery, rules, fees, tour }) => ({
  id: listing.id,
  title: listing.name,
  gallery: gallery ?? listing.media ?? [],
  rules: rules ?? listing.rules ?? [],
  fees: fees ?? listing.fees ?? [],
  tour: tour ?? listing.tour ?? null,
  transparencyNote: "All fees are itemized before checkout.",
});

const toggleFavorite = (state, listingId) => {
  const next = new Set(state ?? []);
  if (next.has(listingId)) {
    next.delete(listingId);
  } else {
    next.add(listingId);
  }
  return next;
};

const toggleComparison = (state, listingId) => {
  const next = new Set(state ?? []);
  if (next.has(listingId)) {
    next.delete(listingId);
  } else {
    next.add(listingId);
  }
  return next;
};

const buildShareLink = (listing, { baseUrl }) =>
  `${baseUrl}/listing/${listing.id}?share=true`;

const createLeadFunnel = (listingId) => ({
  listingId,
  status: "view",
  timeline: [
    {
      event: "view",
      at: new Date().toISOString(),
    },
  ],
});

const trackFunnelEvent = (funnel, event) => ({
  ...funnel,
  status: event,
  timeline: [
    ...funnel.timeline,
    {
      event,
      at: new Date().toISOString(),
    },
  ],
});

const analyticsEvents = {
  view: "view",
  tourStart: "3d-tour-start",
  applyStart: "apply-start",
  applySubmit: "apply-submit",
};

window.EasyFlatDiscovery = {
  searchListings,
  buildListingPageData,
  toggleFavorite,
  toggleComparison,
  buildShareLink,
  createLeadFunnel,
  trackFunnelEvent,
  analyticsEvents,
};

const createAnketa = ({ tenantId, forms, requiredDocuments, consent } = {}) => ({
  id: generateId("anketa"),
  tenantId: tenantId ?? "",
  forms: forms ?? [],
  requiredDocuments: requiredDocuments ?? [],
  consent: consent ?? {
    accepted: false,
    acceptedAt: null,
    acceptedBy: null,
  },
  status: "draft",
  createdAt: new Date().toISOString(),
});

const createAnketaBuilder = ({ sections, requiredDocuments, consent } = {}) => ({
  id: generateId("anketa_builder"),
  sections: sections ?? [],
  requiredDocuments: requiredDocuments ?? [],
  consent: consent ?? {
    required: true,
    text: "I consent to the processing of my application data.",
  },
  createdAt: new Date().toISOString(),
});

const addAnketaSection = (builder, section) => ({
  ...builder,
  sections: [...builder.sections, section],
});

const requireDocument = (builder, document) => ({
  ...builder,
  requiredDocuments: [...builder.requiredDocuments, document],
});

const finalizeAnketa = (builder, tenantId) =>
  createAnketa({
    tenantId,
    forms: builder.sections,
    requiredDocuments: builder.requiredDocuments,
    consent: {
      accepted: false,
      acceptedAt: null,
      acceptedBy: null,
    },
  });

const addFormField = (anketa, field) => ({
  ...anketa,
  forms: [...anketa.forms, field],
});

const addRequiredDocument = (anketa, document) => ({
  ...anketa,
  requiredDocuments: [...anketa.requiredDocuments, document],
});

const recordConsent = (anketa, { acceptedBy }) => ({
  ...anketa,
  consent: {
    accepted: true,
    acceptedAt: new Date().toISOString(),
    acceptedBy,
  },
});

const submitAnketa = (anketa) => ({
  ...anketa,
  status: "submitted",
  submittedAt: new Date().toISOString(),
});

const createCandidate = ({ tenantId, listingId, score } = {}) => ({
  id: generateId("candidate"),
  tenantId: tenantId ?? "",
  listingId: listingId ?? "",
  score: score ?? null,
  notes: [],
  status: "new",
  timeline: [
    {
      status: "new",
      at: new Date().toISOString(),
    },
  ],
});

const scoreCandidate = (candidate, { affordability, stability, references } = {}) => {
  const parts = [
    affordability ?? 0,
    stability ?? 0,
    references ?? 0,
  ];
  const total = parts.reduce((sum, value) => sum + value, 0);
  return {
    ...candidate,
    score: Math.min(100, Math.max(0, total)),
  };
};

const addCandidateNote = (candidate, { note, authorId }) => ({
  ...candidate,
  notes: [
    ...candidate.notes,
    {
      note,
      authorId,
      at: new Date().toISOString(),
    },
  ],
});

const updateCandidateStatus = (candidate, nextStatus) => {
  const allowedTransitions = {
    new: ["under_review", "rejected"],
    under_review: ["invited", "approved", "rejected"],
    invited: ["approved", "rejected"],
    approved: [],
    rejected: [],
  };
  if (!allowedTransitions[candidate.status]?.includes(nextStatus)) {
    throw new Error(`Invalid status change from ${candidate.status} to ${nextStatus}`);
  }
  return {
    ...candidate,
    status: nextStatus,
    timeline: [
      ...candidate.timeline,
      {
        status: nextStatus,
        at: new Date().toISOString(),
      },
    ],
  };
};

const listCandidatesByStatus = (candidates, status) =>
  candidates.filter((candidate) => candidate.status === status);

const createSupportThread = ({ tenantId, subject } = {}) => ({
  id: generateId("support"),
  tenantId: tenantId ?? "",
  subject: subject ?? "",
  messages: [],
  createdAt: new Date().toISOString(),
});

const sendSupportMessage = (thread, { senderRole, message }) => ({
  ...thread,
  messages: [
    ...thread.messages,
    {
      senderRole,
      message,
      at: new Date().toISOString(),
    },
  ],
});

const createFaqThread = ({ tenantId, topic } = {}) => ({
  id: generateId("faq"),
  tenantId: tenantId ?? "",
  topic: topic ?? "General FAQs",
  messages: [],
  createdAt: new Date().toISOString(),
});

window.EasyFlatTenant = {
  createAnketa,
  createAnketaBuilder,
  addAnketaSection,
  requireDocument,
  finalizeAnketa,
  addFormField,
  addRequiredDocument,
  recordConsent,
  submitAnketa,
  createCandidate,
  scoreCandidate,
  addCandidateNote,
  updateCandidateStatus,
  listCandidatesByStatus,
  createSupportThread,
  createFaqThread,
  sendSupportMessage,
};

const extractListingFeatures = (listing = {}) => ({
  locationBucket: listing.city ?? "unknown",
  neighborhoodBucket: listing.neighborhood ?? "unknown",
  budgetBand: listing.price
    ? listing.price < 2000
      ? "budget"
      : listing.price < 3200
        ? "mid"
        : "premium"
    : "unknown",
  petPolicy: (listing.tags ?? []).includes("Pet friendly") ? "pets_ok" : "no_pets",
  bedrooms: listing.bedrooms ?? 0,
  workReady: (listing.tags ?? []).includes("Work ready"),
});

const extractCandidateFeatures = (candidate = {}, preferences = {}) => ({
  locationBucket: preferences.city ?? candidate.city ?? "unknown",
  neighborhoodBucket: preferences.neighborhood ?? candidate.neighborhood ?? "unknown",
  budgetBand: preferences.budgetBand ?? "mid",
  petPolicy: preferences.petPolicy ?? "no_pets",
  bedrooms: preferences.bedrooms ?? 1,
  workReady: preferences.workReady ?? false,
});

const createCandidatePool = ({ listingId, candidates } = {}) => ({
  id: generateId("candidate_pool"),
  listingId: listingId ?? "",
  candidates: candidates ?? [],
  createdAt: new Date().toISOString(),
});

const addCandidateToPool = (pool, candidate) => ({
  ...pool,
  candidates: [...pool.candidates, candidate],
});

const scoreMatch = (listingFeatures, candidateFeatures) => {
  let score = 0;
  const reasons = [];

  if (listingFeatures.locationBucket === candidateFeatures.locationBucket) {
    score += 30;
    reasons.push("Matches your city");
  }
  if (listingFeatures.neighborhoodBucket === candidateFeatures.neighborhoodBucket) {
    score += 15;
    reasons.push("Matches your neighborhood preference");
  }
  if (listingFeatures.budgetBand === candidateFeatures.budgetBand) {
    score += 25;
    reasons.push("Matches your budget band");
  }
  if (listingFeatures.petPolicy === candidateFeatures.petPolicy) {
    score += 10;
    reasons.push("Matches your pet policy");
  }
  if (listingFeatures.bedrooms >= candidateFeatures.bedrooms) {
    score += 10;
    reasons.push("Has enough bedrooms");
  }
  if (candidateFeatures.workReady && listingFeatures.workReady) {
    score += 10;
    reasons.push("Work-ready setup included");
  }

  return { score, reasons };
};

const rankCandidatesForListing = (listing, candidates, preferencesByCandidate = {}) => {
  const listingFeatures = extractListingFeatures(listing);
  return candidates
    .map((candidate) => {
      const candidateFeatures = extractCandidateFeatures(
        candidate,
        preferencesByCandidate[candidate.id]
      );
      const { score, reasons } = scoreMatch(listingFeatures, candidateFeatures);
      return {
        candidateId: candidate.id,
        score,
        reasons,
      };
    })
    .sort((a, b) => b.score - a.score);
};

const rankCandidates = (listings, candidates, preferencesByCandidate = {}) =>
  candidates
    .map((candidate) => {
      const candidateFeatures = extractCandidateFeatures(
        candidate,
        preferencesByCandidate[candidate.id]
      );
      const rankedListings = listings
        .map((listing) => {
          const listingFeatures = extractListingFeatures(listing);
          const { score, reasons } = scoreMatch(listingFeatures, candidateFeatures);
          return {
            listingId: listing.id,
            score,
            reasons,
          };
        })
        .sort((a, b) => b.score - a.score);
      return {
        candidateId: candidate.id,
        rankedListings,
      };
    })
    .sort((a, b) => b.rankedListings[0]?.score - a.rankedListings[0]?.score);

const buildNotification = ({ candidateId, listingId, channel, reasons } = {}) => ({
  id: generateId("notification"),
  candidateId: candidateId ?? "",
  listingId: listingId ?? "",
  channel: channel ?? "push",
  reasons: reasons ?? [],
  status: "queued",
  createdAt: new Date().toISOString(),
});

const notifyHighFitCandidates = (rankedResults, { threshold = 70, channel = "push" }) =>
  rankedResults.flatMap((result) =>
    result.rankedListings
      .filter((listing) => listing.score >= threshold)
      .map((listing) =>
        buildNotification({
          candidateId: result.candidateId,
          listingId: listing.listingId,
          channel,
          reasons: listing.reasons,
        })
      )
  );

const notifyHighFitForListing = (
  listingId,
  rankedCandidates,
  { threshold = 70, channel = "email" } = {}
) =>
  rankedCandidates
    .filter((candidate) => candidate.score >= threshold)
    .map((candidate) =>
      buildNotification({
        candidateId: candidate.candidateId,
        listingId,
        channel,
        reasons: candidate.reasons,
      })
    );

window.EasyFlatMatching = {
  extractListingFeatures,
  extractCandidateFeatures,
  createCandidatePool,
  addCandidateToPool,
  scoreMatch,
  rankCandidatesForListing,
  rankCandidates,
  buildNotification,
  notifyHighFitCandidates,
  notifyHighFitForListing,
};

const createDeal = ({ landlordId, tenantId, propertyId, terms } = {}) => ({
  id: generateId("deal"),
  landlordId: landlordId ?? "",
  tenantId: tenantId ?? "",
  propertyId: propertyId ?? "",
  terms: terms ?? {
    rent: null,
    deposit: null,
    startDate: null,
    endDate: null,
    utilitiesIncluded: [],
    billsResponsibility: "tenant",
  },
  status: "draft",
  createdAt: new Date().toISOString(),
});

const updateDealTerms = (deal, termsUpdate) => ({
  ...deal,
  terms: {
    ...deal.terms,
    ...(termsUpdate ?? {}),
  },
  updatedAt: new Date().toISOString(),
});

const leaseTemplates = [
  {
    id: "monthly-standard",
    name: "Monthly Standard Lease",
    variables: ["landlordName", "tenantName", "propertyAddress", "rent", "startDate", "endDate"],
  },
  {
    id: "corporate-short",
    name: "Corporate Short-Term Lease",
    variables: [
      "landlordName",
      "tenantName",
      "companyName",
      "propertyAddress",
      "rent",
      "startDate",
      "endDate",
    ],
  },
];

const getLeaseTemplate = (templateId) =>
  leaseTemplates.find((template) => template.id === templateId);

const previewLeaseDocument = (templateId, variables = {}) => ({
  templateId,
  variables,
  previewHtml: `Lease preview for ${templateId}`,
  generatedAt: new Date().toISOString(),
});

const generateLeaseDocument = (templateId, variables = {}) => ({
  id: generateId("document"),
  templateId,
  variables,
  status: "generated",
  immutableStorageUrl: null,
  createdAt: new Date().toISOString(),
  versions: [
    {
      version: 1,
      variables,
      createdAt: new Date().toISOString(),
    },
  ],
  auditTrail: [
    {
      action: "generated",
      at: new Date().toISOString(),
    },
  ],
});

const storeSignedPdf = (document, { storageUrl, signedBy } = {}) => ({
  ...document,
  status: "signed",
  immutableStorageUrl: storageUrl ?? null,
  signedBy: signedBy ?? "unknown",
  signedAt: new Date().toISOString(),
  auditTrail: [
    ...document.auditTrail,
    {
      action: "signed_pdf_stored",
      at: new Date().toISOString(),
      by: signedBy ?? "unknown",
    },
  ],
});

const captureSignature = ({ signerId, signerName, method } = {}) => ({
  id: generateId("signature"),
  signerId: signerId ?? "",
  signerName: signerName ?? "",
  method: method ?? "drawn",
  capturedAt: new Date().toISOString(),
});

const applySignature = (document, signature, { certificateId } = {}) => ({
  ...document,
  status: "signed_pending_storage",
  signature: {
    ...signature,
    certificateId: certificateId ?? null,
    timestampedAt: new Date().toISOString(),
  },
  auditTrail: [
    ...document.auditTrail,
    {
      action: "signature_applied",
      at: new Date().toISOString(),
      by: signature.signerId ?? "unknown",
    },
  ],
});

const createDocumentCenter = ({ dealId } = {}) => ({
  id: generateId("doc_center"),
  dealId: dealId ?? "",
  documents: [],
  auditTrail: [],
  createdAt: new Date().toISOString(),
});

const addDocumentVersion = (document, variables) => ({
  ...document,
  versions: [
    ...document.versions,
    {
      version: document.versions.length + 1,
      variables,
      createdAt: new Date().toISOString(),
    },
  ],
  auditTrail: [
    ...document.auditTrail,
    {
      action: "version_added",
      at: new Date().toISOString(),
    },
  ],
});

const addDocumentToCenter = (center, document) => ({
  ...center,
  documents: [...center.documents, document],
  auditTrail: [
    ...center.auditTrail,
    {
      action: "document_added",
      at: new Date().toISOString(),
      documentId: document.id,
    },
  ],
});

const logLegalEvent = (center, { action, actorId, details } = {}) => ({
  ...center,
  auditTrail: [
    ...center.auditTrail,
    {
      action: action ?? "event",
      actorId: actorId ?? "system",
      details: details ?? "",
      at: new Date().toISOString(),
    },
  ],
});

window.EasyFlatDeals = {
  createDeal,
  updateDealTerms,
  leaseTemplates,
  getLeaseTemplate,
  previewLeaseDocument,
  generateLeaseDocument,
  storeSignedPdf,
  captureSignature,
  applySignature,
  createDocumentCenter,
  addDocumentVersion,
  addDocumentToCenter,
  logLegalEvent,
};

const calculateProration = ({ monthlyRent, startDate, billingDay = 1 } = {}) => {
  if (!monthlyRent || !startDate) return null;
  const start = new Date(startDate);
  const periodStart = new Date(start.getFullYear(), start.getMonth(), billingDay);
  if (start < periodStart) {
    periodStart.setMonth(periodStart.getMonth() - 1);
  }
  const periodEnd = new Date(periodStart.getFullYear(), periodStart.getMonth() + 1, billingDay);
  const daysInPeriod = Math.round((periodEnd - periodStart) / (1000 * 60 * 60 * 24));
  const daysCharged = Math.max(0, Math.round((periodEnd - start) / (1000 * 60 * 60 * 24)));
  const prorated = (monthlyRent / daysInPeriod) * daysCharged;
  return Math.round(prorated * 100) / 100;
};

const buildPaymentSchedule = ({
  monthlyRent,
  startDate,
  endDate,
  billingDay = 1,
  gracePeriodDays = 3,
  penaltyPercent = 2,
} = {}) => {
  if (!monthlyRent || !startDate || !endDate) return [];
  const schedule = [];
  let dueDate = new Date(startDate);
  dueDate.setDate(billingDay);
  if (new Date(startDate) > dueDate) {
    dueDate.setMonth(dueDate.getMonth() + 1);
  }
  const end = new Date(endDate);
  let installment = 1;
  while (dueDate <= end) {
    schedule.push({
      id: generateId("payment"),
      installment,
      dueDate: dueDate.toISOString(),
      amount: monthlyRent,
      gracePeriodDays,
      penaltyPercent,
      status: "due",
    });
    installment += 1;
    dueDate = new Date(dueDate.getFullYear(), dueDate.getMonth() + 1, billingDay);
  }
  const proratedAmount = calculateProration({ monthlyRent, startDate, billingDay });
  if (proratedAmount !== null && schedule.length > 0) {
    schedule[0].amount = proratedAmount;
    schedule[0].prorated = true;
  }
  return schedule;
};

const applyLatePenalty = (payment, paidAt) => {
  const due = new Date(payment.dueDate);
  const paid = new Date(paidAt);
  const grace = new Date(due);
  grace.setDate(grace.getDate() + (payment.gracePeriodDays ?? 0));
  if (paid <= grace) return { ...payment, penaltyAmount: 0 };
  const penaltyAmount = (payment.amount * (payment.penaltyPercent ?? 0)) / 100;
  return {
    ...payment,
    penaltyAmount: Math.round(penaltyAmount * 100) / 100,
  };
};

const recordPayment = (payment, { method, paidAt, reference } = {}) => ({
  ...payment,
  status: "paid",
  paidAt: paidAt ?? new Date().toISOString(),
  method: method ?? "card",
  reference: reference ?? "",
});

const issueReceipt = (payment, { recipientId } = {}) => ({
  id: generateId("receipt"),
  paymentId: payment.id,
  recipientId: recipientId ?? "",
  amount: payment.amount,
  issuedAt: new Date().toISOString(),
});

const requestRefund = (payment, { amount, reason } = {}) => ({
  id: generateId("refund"),
  paymentId: payment.id,
  amount: amount ?? payment.amount,
  reason: reason ?? "",
  status: "requested",
  createdAt: new Date().toISOString(),
});

const createLedgerEntry = ({ landlordId, paymentId, amount, type } = {}) => ({
  id: generateId("ledger"),
  landlordId: landlordId ?? "",
  paymentId: paymentId ?? "",
  amount: amount ?? 0,
  type: type ?? "credit",
  createdAt: new Date().toISOString(),
});

const batchPayouts = (entries, { batchId } = {}) => ({
  id: batchId ?? generateId("payout_batch"),
  entries: entries ?? [],
  status: "batched",
  createdAt: new Date().toISOString(),
});

const reconcilePayoutBatch = (batch, { reconciledAt } = {}) => ({
  ...batch,
  status: "reconciled",
  reconciledAt: reconciledAt ?? new Date().toISOString(),
});

const generateStatement = (entries, { landlordId, periodStart, periodEnd } = {}) => ({
  id: generateId("statement"),
  landlordId: landlordId ?? "",
  periodStart: periodStart ?? null,
  periodEnd: periodEnd ?? null,
  entries: entries ?? [],
  generatedAt: new Date().toISOString(),
});

const createMeterReading = ({ propertyId, unitId, value, readingDate } = {}) => ({
  id: generateId("meter"),
  propertyId: propertyId ?? "",
  unitId: unitId ?? "",
  value: value ?? 0,
  readingDate: readingDate ?? new Date().toISOString(),
});

const validateMeterReading = (reading, { min = 0, max = Number.MAX_SAFE_INTEGER } = {}) =>
  reading.value >= min && reading.value <= max;

const addMeterReading = (history, reading) => [...(history ?? []), reading];

const buildMeterReminder = ({ propertyId, dueDate } = {}) => ({
  id: generateId("meter_reminder"),
  propertyId: propertyId ?? "",
  dueDate: dueDate ?? new Date().toISOString(),
  status: "scheduled",
});

const exportMeterHistory = (history) =>
  (history ?? []).map((reading) => ({
    id: reading.id,
    propertyId: reading.propertyId,
    unitId: reading.unitId,
    value: reading.value,
    readingDate: reading.readingDate,
  }));

window.EasyFlatPayments = {
  calculateProration,
  buildPaymentSchedule,
  applyLatePenalty,
  recordPayment,
  issueReceipt,
  requestRefund,
  createLedgerEntry,
  batchPayouts,
  reconcilePayoutBatch,
  generateStatement,
  createMeterReading,
  validateMeterReading,
  addMeterReading,
  buildMeterReminder,
  exportMeterHistory,
};

const createDeliveryOrder = ({ dealId, address, timeSlot, courier } = {}) => ({
  id: generateId("delivery"),
  dealId: dealId ?? "",
  address: address ?? "",
  timeSlot: timeSlot ?? {
    start: null,
    end: null,
  },
  courier: courier ?? {
    provider: "internal",
    trackingId: null,
  },
  status: "scheduled",
  trackingEvents: [],
  proofOfDelivery: [],
  createdAt: new Date().toISOString(),
});

const updateDeliveryStatus = (order, status, { note } = {}) => ({
  ...order,
  status,
  trackingEvents: [
    ...order.trackingEvents,
    {
      status,
      note: note ?? "",
      at: new Date().toISOString(),
    },
  ],
});

const addProofOfDelivery = (order, { photoUrl, uploadedBy } = {}) => ({
  ...order,
  proofOfDelivery: [
    ...order.proofOfDelivery,
    {
      id: generateId("delivery_photo"),
      photoUrl: photoUrl ?? "",
      uploadedBy: uploadedBy ?? "courier",
      uploadedAt: new Date().toISOString(),
    },
  ],
});

const createVisitChecklist = ({ propertyId, unitId, items } = {}) => ({
  id: generateId("visit"),
  propertyId: propertyId ?? "",
  unitId: unitId ?? "",
  items: items ?? [],
  photos: [],
  meterReadings: [],
  inventoryChecklist: [],
  status: "pending",
  createdAt: new Date().toISOString(),
});

const addChecklistItem = (checklist, item) => ({
  ...checklist,
  items: [...checklist.items, item],
});

const addChecklistPhoto = (checklist, { photoUrl, caption } = {}) => ({
  ...checklist,
  photos: [
    ...checklist.photos,
    {
      id: generateId("visit_photo"),
      photoUrl: photoUrl ?? "",
      caption: caption ?? "",
      uploadedAt: new Date().toISOString(),
    },
  ],
});

const addChecklistMeterReading = (checklist, reading) => ({
  ...checklist,
  meterReadings: [...checklist.meterReadings, reading],
});

const addInventoryItem = (checklist, item) => ({
  ...checklist,
  inventoryChecklist: [...checklist.inventoryChecklist, item],
});

const updateChecklistStatus = (checklist, status) => ({
  ...checklist,
  status,
  updatedAt: new Date().toISOString(),
});

const createHandoverReport = ({ dealId, type, issues, signatures } = {}) => ({
  id: generateId("handover"),
  dealId: dealId ?? "",
  type: type ?? "move_in",
  issues: issues ?? [],
  signatures: signatures ?? [],
  status: "draft",
  createdAt: new Date().toISOString(),
});

const addHandoverIssue = (report, issue) => ({
  ...report,
  issues: [...report.issues, issue],
});

const signHandoverReport = (report, signature) => ({
  ...report,
  signatures: [...report.signatures, signature],
  status: "signed",
  signedAt: new Date().toISOString(),
});

const updateHandoverStatus = (report, status) => ({
  ...report,
  status,
  updatedAt: new Date().toISOString(),
});

window.EasyFlatOperations = {
  createDeliveryOrder,
  updateDeliveryStatus,
  addProofOfDelivery,
  createVisitChecklist,
  addChecklistItem,
  addChecklistPhoto,
  addChecklistMeterReading,
  addInventoryItem,
  updateChecklistStatus,
  createHandoverReport,
  addHandoverIssue,
  signHandoverReport,
  updateHandoverStatus,
};

const createCoveragePolicy = ({
  name,
  qualifyingIncidents,
  exclusions,
  limits,
  deductible = 0,
  lateRentGuarantee = false,
} = {}) => ({
  id: generateId("coverage"),
  name: name ?? "Standard Protection",
  qualifyingIncidents: qualifyingIncidents ?? ["damage", "theft", "utility"],
  exclusions: exclusions ?? ["normal_wear", "pets"],
  limits: limits ?? { perClaim: 2000, annual: 10000 },
  deductible,
  lateRentGuarantee,
  createdAt: new Date().toISOString(),
});

const evaluateIncidentCoverage = (policy, incident) => {
  if (!policy || !incident) return { eligible: false, reason: "missing_data" };
  if (!policy.qualifyingIncidents.includes(incident.type)) {
    return { eligible: false, reason: "not_covered" };
  }
  if (policy.exclusions.includes(incident.type)) {
    return { eligible: false, reason: "excluded" };
  }
  return {
    eligible: true,
    limit: policy.limits?.perClaim ?? 0,
    deductible: policy.deductible ?? 0,
  };
};

const calculateCoveragePayout = ({ incidentAmount, limit, deductible } = {}) => {
  if (incidentAmount == null) return 0;
  const capped = Math.min(incidentAmount, limit ?? incidentAmount);
  return Math.max(0, Math.round((capped - (deductible ?? 0)) * 100) / 100);
};

const createIncidentReport = ({
  claimId,
  tenantId,
  propertyId,
  incidentType,
  description,
  occurredAt,
  media,
} = {}) => ({
  id: generateId("incident"),
  claimId: claimId ?? "",
  tenantId: tenantId ?? "",
  propertyId: propertyId ?? "",
  type: incidentType ?? "damage",
  description: description ?? "",
  occurredAt: occurredAt ?? new Date().toISOString(),
  media: media ?? [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const addIncidentMedia = (report, mediaItem) => ({
  ...report,
  media: [...report.media, mediaItem],
  updatedAt: new Date().toISOString(),
});

const createAdjusterChat = ({ claimId, participants, topic } = {}) => ({
  id: generateId("claim_chat"),
  claimId: claimId ?? "",
  participants: participants ?? [],
  topic: topic ?? "Claim review",
  messages: [],
  createdAt: new Date().toISOString(),
});

const addAdjusterMessage = (chat, { senderId, body } = {}) => ({
  ...chat,
  messages: [
    ...chat.messages,
    {
      id: generateId("claim_msg"),
      senderId: senderId ?? "",
      body: body ?? "",
      sentAt: new Date().toISOString(),
    },
  ],
});

const createClaimCase = ({ report, policy, requestedAmount } = {}) => ({
  id: generateId("claim"),
  report,
  policyId: policy?.id ?? "",
  requestedAmount: requestedAmount ?? 0,
  status: "open",
  decision: null,
  payouts: [],
  createdAt: new Date().toISOString(),
});

const approveClaim = (claim, { approvedAmount, notes } = {}) => ({
  ...claim,
  status: "approved",
  decision: {
    status: "approved",
    approvedAmount: approvedAmount ?? claim.requestedAmount,
    notes: notes ?? "",
    decidedAt: new Date().toISOString(),
  },
});

const denyClaim = (claim, { reason, notes } = {}) => ({
  ...claim,
  status: "denied",
  decision: {
    status: "denied",
    reason: reason ?? "not_covered",
    notes: notes ?? "",
    decidedAt: new Date().toISOString(),
  },
});

const issueClaimPayout = (claim, { amount, recipientId } = {}) => ({
  ...claim,
  payouts: [
    ...claim.payouts,
    {
      id: generateId("claim_payout"),
      amount: amount ?? 0,
      recipientId: recipientId ?? "",
      issuedAt: new Date().toISOString(),
    },
  ],
});

const createLateRentCase = ({ landlordId, tenantId, paymentId, rentAmount, dueDate } = {}) => ({
  id: generateId("late_rent"),
  landlordId: landlordId ?? "",
  tenantId: tenantId ?? "",
  paymentId: paymentId ?? "",
  rentAmount: rentAmount ?? 0,
  dueDate: dueDate ?? new Date().toISOString(),
  status: "monitoring",
  recoveryPlan: null,
  createdAt: new Date().toISOString(),
});

const applyLateRentGuarantee = (caseFile, { guaranteePercent = 100 } = {}) => ({
  ...caseFile,
  status: "paid_to_landlord",
  landlordPayout: Math.round((caseFile.rentAmount * guaranteePercent) / 100),
  paidAt: new Date().toISOString(),
});

const createRecoveryPlan = (caseFile, { installments = 3 } = {}) => {
  if (!caseFile) return caseFile;
  const amountPerInstallment = caseFile.rentAmount / installments;
  return {
    ...caseFile,
    recoveryPlan: {
      installments,
      amountPerInstallment: Math.round(amountPerInstallment * 100) / 100,
      status: "active",
      createdAt: new Date().toISOString(),
    },
  };
};

window.EasyFlatProtection = {
  createCoveragePolicy,
  evaluateIncidentCoverage,
  calculateCoveragePayout,
  createIncidentReport,
  addIncidentMedia,
  createAdjusterChat,
  addAdjusterMessage,
  createClaimCase,
  approveClaim,
  denyClaim,
  issueClaimPayout,
  createLateRentCase,
  applyLateRentGuarantee,
  createRecoveryPlan,
};

const formatPrice = (price) =>
  `$${price.toLocaleString("en-US", { maximumFractionDigits: 0 })}/mo`;

const renderListings = (data) => {
  listingsContainer.innerHTML = "";

  data.forEach((listing) => {
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <div class="card__media">${listing.neighborhood}</div>
      <div class="card__body">
        <div>
          <h3>${listing.name}</h3>
          <p class="card__meta">${listing.city} · ${listing.bedrooms} bd · up to ${listing.guests} guests</p>
        </div>
        <div class="card__tags">
          ${listing.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}
        </div>
        <p class="price">${formatPrice(listing.price)} · ${listing.rating} ★</p>
      </div>
    `;
    listingsContainer.appendChild(card);
  });

  if (data.length === 0) {
    listingsContainer.innerHTML = `
      <div class="card">
        <div class="card__body">
          <h3>No stays match those filters.</h3>
          <p class="card__meta">Try expanding your budget or selecting a different city.</p>
        </div>
      </div>
    `;
  }
};

const applyFilters = () => {
  const maxPrice = Number(priceFilter.value);
  const cityValue = cityFilter.value;
  const bedValue = bedFilter.value;
  const guestValue = guestFilter.value;
  const guestLimit = Number.parseInt(guestValue, 10);

  const filtered = listings.filter((listing) => {
    const matchesPrice = listing.price <= maxPrice;
    const matchesCity = cityValue === "All" || listing.city === cityValue;
    const matchesBeds =
      bedValue === "All" || listing.bedrooms >= Number.parseInt(bedValue, 10);
    const matchesGuests =
      guestValue === "All" ||
      (guestValue === "6" ? listing.guests >= guestLimit : listing.guests <= guestLimit);
    const matchesTag = activeTag === "All" || listing.tags.includes(activeTag);

    return matchesPrice && matchesCity && matchesBeds && matchesGuests && matchesTag;
  });

  renderListings(filtered);
};

priceFilter.addEventListener("input", () => {
  priceValue.textContent = formatPrice(Number(priceFilter.value)).replace("/mo", "");
  applyFilters();
});

[cityFilter, bedFilter, guestFilter].forEach((control) =>
  control.addEventListener("change", applyFilters)
);

chips.forEach((chip) => {
  chip.addEventListener("click", () => {
    chips.forEach((button) => button.classList.remove("is-active"));
    chip.classList.add("is-active");
    activeTag = chip.dataset.tag;
    applyFilters();
  });
});

renderListings(listings);
