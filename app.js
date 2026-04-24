/**
 * ============================================
 * PREBID SERVER TRAINING SIMULATOR
 * Main Application JavaScript
 * ============================================
 */

// ============================================
// STATE MANAGEMENT
// ============================================

/**
 * Application State
 * Central state object that tracks all configuration and simulation data
 */
const AppState = {
  // Simulation state
  simulation: {
    isRunning: false,
    isPaused: false,
    currentPhase: null,
    speed: 1,
    timeElapsed: 0,
    timer: null,
    completedUpTo: -1, // highest phase index (0-4) that has been completed
    displayedPhaseIndex: null, // phase stage currently shown in UI
  },

  // Configuration state
  config: {
    timeout: 1000,
    auctionType: "first-price",
    priceGranularity: "medium",
    floorsEnabled: false,
    floorPrice: 0.5,
    primaryCurrency: "USD",
    currencyConversionEnabled: true,
  },

  // Bidder definitions with simulated behavior
  bidders: [
    {
      id: "appnexus",
      name: "AppNexus",
      enabled: true,
      color: "#FF6B35",
      avgResponseTime: 450,
      responseTimeVariance: 200,
      avgBidPrice: 2.5,
      bidPriceVariance: 1.0,
      currency: "USD",
      placementId: "12345678",
    },
    {
      id: "rubicon",
      name: "Rubicon",
      enabled: true,
      color: "#00A878",
      avgResponseTime: 380,
      responseTimeVariance: 150,
      avgBidPrice: 2.3,
      bidPriceVariance: 0.8,
      currency: "USD",
      accountId: "9876",
    },
    {
      id: "pubmatic",
      name: "PubMatic",
      enabled: true,
      color: "#5E60CE",
      avgResponseTime: 520,
      responseTimeVariance: 250,
      avgBidPrice: 2.1,
      bidPriceVariance: 0.9,
      currency: "USD",
      publisherId: "156789",
    },
    {
      id: "openx",
      name: "OpenX",
      enabled: false,
      color: "#F72585",
      avgResponseTime: 600,
      responseTimeVariance: 300,
      avgBidPrice: 1.8,
      bidPriceVariance: 0.7,
      currency: "EUR",
      unitId: "540599520",
    },
    {
      id: "index",
      name: "Index Exchange",
      enabled: false,
      color: "#4361EE",
      avgResponseTime: 350,
      responseTimeVariance: 100,
      avgBidPrice: 2.4,
      bidPriceVariance: 0.85,
      currency: "USD",
      siteId: "123456",
    },
    {
      id: "triplelift",
      name: "TripleLift",
      enabled: false,
      color: "#7209B7",
      avgResponseTime: 700,
      responseTimeVariance: 350,
      avgBidPrice: 1.95,
      bidPriceVariance: 0.75,
      currency: "GBP",
      inventoryCode: "SITENAME_728x90",
    },
  ],

  // Exchange rates (relative to USD)
  exchangeRates: {
    USD: 1.0,
    EUR: 0.92,
    GBP: 0.79,
  },

  // Auction results
  auction: {
    bids: [],
    winner: null,
    clearingPrice: 0,
  },

  // Preset configurations
  presets: {
    basic: {
      name: "Basic Setup",
      description: "Simple configuration with 3 bidders and standard timeout",
      config: {
        timeout: 1000,
        auctionType: "first-price",
        priceGranularity: "medium",
        floorsEnabled: false,
        floorPrice: 0.5,
        primaryCurrency: "USD",
        currencyConversionEnabled: true,
      },
      enabledBidders: ["appnexus", "rubicon", "pubmatic"],
    },
    timeout: {
      name: "Timeout Impact",
      description:
        "Demonstrates how aggressive timeout affects bid participation",
      config: {
        timeout: 400,
        auctionType: "first-price",
        priceGranularity: "medium",
        floorsEnabled: false,
        floorPrice: 0.5,
        primaryCurrency: "USD",
        currencyConversionEnabled: true,
      },
      enabledBidders: [
        "appnexus",
        "rubicon",
        "pubmatic",
        "openx",
        "triplelift",
      ],
    },
    floor: {
      name: "Price Floor Enforcement",
      description: "Shows bids being filtered by floor prices",
      config: {
        timeout: 1500,
        auctionType: "first-price",
        priceGranularity: "high",
        floorsEnabled: true,
        floorPrice: 2.0,
        primaryCurrency: "USD",
        currencyConversionEnabled: true,
      },
      enabledBidders: ["appnexus", "rubicon", "pubmatic", "index"],
    },
    currency: {
      name: "Multi-Currency Auction",
      description:
        "Demonstrates currency conversion with bidders in USD, EUR, and GBP",
      config: {
        timeout: 1200,
        auctionType: "second-price",
        priceGranularity: "medium",
        floorsEnabled: false,
        floorPrice: 0.5,
        primaryCurrency: "USD",
        currencyConversionEnabled: true,
      },
      enabledBidders: ["appnexus", "rubicon", "openx", "triplelift"],
    },
  },
};

// ============================================
// DOM ELEMENT REFERENCES
// ============================================

const DOM = {
  // Help panel
  helpToggle: null,
  helpSidebar: null,
  closeHelp: null,

  // Configuration elements
  bidderList: null,
  timeoutSlider: null,
  timeoutValue: null,
  auctionTypeButtons: null,
  priceGranularity: null,
  enableFloors: null,
  floorSettings: null,
  floorPrice: null,
  floorValue: null,
  primaryCurrency: null,
  enableCurrencyConversion: null,
  presetButtons: null,

  // Config actions
  resetConfig: null,

  // Simulation controls
  startSimulation: null,
  resetSimulation: null,
  simulationSpeed: null,

  // Phase indicators
  phases: null,
  phaseConnectors: null,

  // Workflow stages
  requestStage: null,
  bidderStage: null,
  auctionStage: null,
  postAuctionStage: null,
  renderStage: null,

  // Stage status elements
  requestStatus: null,
  bidderStatus: null,
  auctionStatus: null,
  postAuctionStatus: null,
  renderStatus: null,

  // Request stage elements
  requestArrow: null,
  requestDetails: null,
  requestJson: null,

  // Bidder stage elements
  bidderRequests: null,

  // Auction stage elements
  timeoutMarker: null,
  timelineProgress: null,
  timeoutLine: null,
  bidResponses: null,
  bidTableBody: null,

  // Post-auction stage elements
  floorCheck: null,
  floorCheckDetail: null,
  currencyConvert: null,
  currencyConvertDetail: null,
  winnerSelect: null,
  winnerSelectDetail: null,

  // Render stage elements
  winningBidInfo: null,
  winnerDetails: null,
  renderedAd: null,
  impressionEvent: null,
  billingEvent: null,

  // Results panel elements
  feedbackMessages: null,
  totalBidders: null,
  bidsReceived: null,
  timedOut: null,
  belowFloor: null,
  winningBid: null,
  clearingPrice: null,
  resultsTableBody: null,
  impactAnalysis: null,

  // Tooltip
  tooltip: null,

  // Notification container
  notificationContainer: null,

  // Phase navigation + proceed elements
  phaseNavBanner: null,
  phaseNavText: null,
  phaseNavReturn: null,
  phaseProceedFooter: null,
  phaseProceedBtn: null,
  phaseProceedText: null,

  // Request params modal
  requestExpandBtn: null,
  requestModalOverlay: null,
  requestModalClose: null,
  requestJsonModal: null,

  // S2S config (Phase 1)
  requestCodeBlocks: null,
  s2sConfigDetails: null,
  s2sConfigJson: null,
  s2sExpandBtn: null,
  s2sModalOverlay: null,
  s2sModalClose: null,
  s2sJsonModal: null,

  // Bid response (Phase 2)
  bidResponseDetails: null,
  bidResponseJson: null,
  bidResponseExpandBtn: null,
  bidResponseModalOverlay: null,
  bidResponseModalClose: null,
  bidResponseJsonModal: null,
};

// ============================================
// INITIALIZATION
// ============================================

/**
 * Initialize the application when DOM is ready
 */
document.addEventListener("DOMContentLoaded", () => {
  initializeDOMReferences();
  initializeEventListeners();
  renderBidderList();

  updateUIFromState();
  addInitialFeedback();
});

/**
 * Cache DOM element references for performance
 */
function initializeDOMReferences() {
  // Help panel
  DOM.helpToggle = document.getElementById("helpToggle");
  DOM.helpSidebar = document.getElementById("helpSidebar");
  DOM.closeHelp = document.getElementById("closeHelp");

  // Configuration elements
  DOM.bidderList = document.getElementById("bidderList");
  DOM.timeoutSlider = document.getElementById("timeoutSlider");
  DOM.timeoutValue = document.getElementById("timeoutValue");
  DOM.priceGranularity = document.getElementById("priceGranularity");
  DOM.enableFloors = document.getElementById("enableFloors");
  DOM.floorSettings = document.getElementById("floorSettings");
  DOM.floorPrice = document.getElementById("floorPrice");
  DOM.floorValue = document.getElementById("floorValue");
  DOM.primaryCurrency = document.getElementById("primaryCurrency");
  DOM.enableCurrencyConversion = document.getElementById(
    "enableCurrencyConversion",
  );

  // Config actions
  DOM.resetConfig = document.getElementById("resetConfig");

  // Simulation controls
  DOM.startSimulation = document.getElementById("startSimulation");
  DOM.resetSimulation = document.getElementById("resetSimulation");
  DOM.simulationSpeed = document.getElementById("simulationSpeed");

  // Phase indicators
  DOM.phases = document.querySelectorAll(".phase");
  DOM.phaseConnectors = document.querySelectorAll(".phase-connector");

  // Workflow stages
  DOM.requestStage = document.getElementById("requestStage");
  DOM.bidderStage = document.getElementById("bidderStage");
  DOM.auctionStage = document.getElementById("auctionStage");
  DOM.postAuctionStage = document.getElementById("postAuctionStage");
  DOM.renderStage = document.getElementById("renderStage");

  // Stage status elements
  DOM.requestStatus = document.getElementById("requestStatus");
  DOM.bidderStatus = document.getElementById("bidderStatus");
  DOM.auctionStatus = document.getElementById("auctionStatus");
  DOM.postAuctionStatus = document.getElementById("postAuctionStatus");
  DOM.renderStatus = document.getElementById("renderStatus");

  // Request stage elements
  DOM.requestArrow = document.getElementById("requestArrow");
  DOM.requestDetails = document.getElementById("requestDetails");
  DOM.requestJson = document.getElementById("requestJson");

  // Bidder stage elements
  DOM.bidderRequests = document.getElementById("bidderRequests");

  // Auction stage elements
  DOM.timeoutMarker = document.getElementById("timeoutMarker");
  DOM.timelineProgress = document.getElementById("timelineProgress");
  DOM.timeoutLine = document.getElementById("timeoutLine");
  DOM.bidResponses = document.getElementById("bidResponses");
  DOM.bidTableBody = document.getElementById("bidTableBody");

  // Post-auction stage elements
  DOM.floorCheck = document.getElementById("floorCheck");
  DOM.floorCheckDetail = document.getElementById("floorCheckDetail");
  DOM.currencyConvert = document.getElementById("currencyConvert");
  DOM.currencyConvertDetail = document.getElementById("currencyConvertDetail");
  DOM.winnerSelect = document.getElementById("winnerSelect");
  DOM.winnerSelectDetail = document.getElementById("winnerSelectDetail");

  // Render stage elements
  DOM.winningBidInfo = document.getElementById("winningBidInfo");
  DOM.winnerDetails = document.getElementById("winnerDetails");
  DOM.renderedAd = document.getElementById("renderedAd");
  DOM.impressionEvent = document.getElementById("impressionEvent");
  DOM.billingEvent = document.getElementById("billingEvent");

  // Results panel elements
  DOM.feedbackMessages = document.getElementById("feedbackMessages");
  DOM.totalBidders = document.getElementById("totalBidders");
  DOM.bidsReceived = document.getElementById("bidsReceived");
  DOM.timedOut = document.getElementById("timedOut");
  DOM.belowFloor = document.getElementById("belowFloor");
  DOM.winningBid = document.getElementById("winningBid");
  DOM.clearingPrice = document.getElementById("clearingPrice");
  DOM.resultsTableBody = document.getElementById("resultsTableBody");
  DOM.impactAnalysis = document.getElementById("impactAnalysis");

  // Tooltip
  DOM.tooltip = document.getElementById("tooltip");

  // Notification container
  DOM.notificationContainer = document.getElementById("notificationContainer");

  // Phase navigation + proceed elements
  DOM.phaseNavBanner = document.getElementById("phaseNavBanner");
  DOM.phaseNavText = document.getElementById("phaseNavText");
  DOM.phaseNavReturn = document.getElementById("phaseNavReturn");
  DOM.phaseProceedFooter = document.getElementById("phaseProceedFooter");
  DOM.phaseProceedBtn = document.getElementById("phaseProceedBtn");
  DOM.phaseProceedText = document.getElementById("phaseProceedText");

  // Request params modal
  DOM.requestExpandBtn = document.getElementById("requestExpandBtn");
  DOM.requestModalOverlay = document.getElementById("requestModalOverlay");
  DOM.requestModalClose = document.getElementById("requestModalClose");
  DOM.requestJsonModal = document.getElementById("requestJsonModal");

  // S2S config (Phase 1)
  DOM.requestCodeBlocks = document.getElementById("requestCodeBlocks");
  DOM.s2sConfigDetails = document.getElementById("s2sConfigDetails");
  DOM.s2sConfigJson = document.getElementById("s2sConfigJson");
  DOM.s2sExpandBtn = document.getElementById("s2sExpandBtn");
  DOM.s2sModalOverlay = document.getElementById("s2sModalOverlay");
  DOM.s2sModalClose = document.getElementById("s2sModalClose");
  DOM.s2sJsonModal = document.getElementById("s2sJsonModal");

  // Bid response (Phase 2)
  DOM.bidResponseDetails = document.getElementById("bidResponseDetails");
  DOM.bidResponseJson = document.getElementById("bidResponseJson");
  DOM.bidResponseExpandBtn = document.getElementById("bidResponseExpandBtn");
  DOM.bidResponseModalOverlay = document.getElementById(
    "bidResponseModalOverlay",
  );
  DOM.bidResponseModalClose = document.getElementById("bidResponseModalClose");
  DOM.bidResponseJsonModal = document.getElementById("bidResponseJsonModal");
}

/**
 * Set up all event listeners
 */
function initializeEventListeners() {
  // Help panel
  DOM.helpToggle.addEventListener("click", toggleHelpPanel);
  DOM.closeHelp.addEventListener("click", toggleHelpPanel);

  // Preset buttons
  document.querySelectorAll(".preset-btn").forEach((btn) => {
    btn.addEventListener("click", () => loadPreset(btn.dataset.preset));
  });

  // Timeout slider
  DOM.timeoutSlider.addEventListener("input", handleTimeoutChange);

  // Auction type buttons
  document.querySelectorAll("[data-auction-type]").forEach((btn) => {
    btn.addEventListener("click", () =>
      handleAuctionTypeChange(btn.dataset.auctionType),
    );
  });

  // Price granularity
  DOM.priceGranularity.addEventListener("change", handlePriceGranularityChange);

  // Floor settings
  DOM.enableFloors.addEventListener("change", handleFloorsToggle);
  DOM.floorPrice.addEventListener("input", handleFloorPriceChange);

  // Currency settings
  DOM.primaryCurrency.addEventListener("change", handleCurrencyChange);
  DOM.enableCurrencyConversion.addEventListener(
    "change",
    handleCurrencyConversionToggle,
  );

  // Config actions
  DOM.resetConfig.addEventListener("click", resetConfiguration);

  // Simulation controls
  DOM.startSimulation.addEventListener("click", startSimulation);
  DOM.resetSimulation.addEventListener("click", resetSimulation);
  DOM.simulationSpeed.addEventListener("change", handleSpeedChange);

  // Proceed to next phase
  DOM.phaseProceedBtn.addEventListener("click", onProceedClicked);

  // Return to current phase from history view
  DOM.phaseNavReturn.addEventListener("click", returnToCurrentPhase);

  // Phase indicator click — navigate to any completed phase
  DOM.phases.forEach((phaseEl, i) => {
    phaseEl.addEventListener("click", () => navigateToPhase(i));
  });

  // Tooltip triggers
  document.querySelectorAll(".tooltip-trigger").forEach((trigger) => {
    trigger.addEventListener("mouseenter", showTooltip);
    trigger.addEventListener("mouseleave", hideTooltip);
  });

  // Request params modal — expand button and pre are both clickable
  DOM.requestExpandBtn.addEventListener("click", openRequestModal);
  DOM.requestJson.addEventListener("click", openRequestModal);
  DOM.requestModalClose.addEventListener("click", closeRequestModal);
  DOM.requestModalOverlay.addEventListener("click", (e) => {
    if (e.target === DOM.requestModalOverlay) closeRequestModal();
  });

  // S2S config modal
  DOM.s2sExpandBtn.addEventListener("click", openS2SModal);
  DOM.s2sConfigJson.addEventListener("click", openS2SModal);
  DOM.s2sModalClose.addEventListener("click", closeS2SModal);
  DOM.s2sModalOverlay.addEventListener("click", (e) => {
    if (e.target === DOM.s2sModalOverlay) closeS2SModal();
  });

  // Bid response modal
  DOM.bidResponseExpandBtn.addEventListener("click", openBidResponseModal);
  DOM.bidResponseJson.addEventListener("click", openBidResponseModal);
  DOM.bidResponseModalClose.addEventListener("click", closeBidResponseModal);
  DOM.bidResponseModalOverlay.addEventListener("click", (e) => {
    if (e.target === DOM.bidResponseModalOverlay) closeBidResponseModal();
  });

  // Escape closes whichever modal is open
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (!DOM.requestModalOverlay.classList.contains("hidden"))
      closeRequestModal();
    if (!DOM.s2sModalOverlay.classList.contains("hidden")) closeS2SModal();
    if (!DOM.bidResponseModalOverlay.classList.contains("hidden"))
      closeBidResponseModal();
  });
}

// ============================================
// HELP PANEL FUNCTIONS
// ============================================

/**
 * Toggle the help sidebar visibility
 */
function toggleHelpPanel() {
  DOM.helpSidebar.classList.toggle("open");
}

// ============================================
// REQUEST PARAMS MODAL
// ============================================

/**
 * Open the expanded request-params code modal.
 * Only opens when there is JSON content to show.
 */
function openRequestModal() {
  const json = DOM.requestJson.textContent.trim();
  if (!json) return;
  renderAnnotatedJson(DOM.requestJsonModal, json);
  DOM.requestModalOverlay.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

/**
 * Close the request-params code modal.
 */
function closeRequestModal() {
  DOM.requestModalOverlay.classList.add("hidden");
  document.body.style.overflow = "";
}

// ============================================
// S2S CONFIG MODAL
// ============================================

function openS2SModal() {
  const json = DOM.s2sConfigJson.textContent.trim();
  if (!json) return;
  renderAnnotatedJson(DOM.s2sJsonModal, json);
  DOM.s2sModalOverlay.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeS2SModal() {
  DOM.s2sModalOverlay.classList.add("hidden");
  document.body.style.overflow = "";
}

// ============================================
// BID RESPONSE MODAL
// ============================================

function openBidResponseModal() {
  const json = DOM.bidResponseJson.textContent.trim();
  if (!json) return;
  renderAnnotatedJson(DOM.bidResponseJsonModal, json);
  DOM.bidResponseModalOverlay.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeBidResponseModal() {
  DOM.bidResponseModalOverlay.classList.add("hidden");
  document.body.style.overflow = "";
}

// ============================================
// BIDDER MANAGEMENT
// ============================================

/**
 * Render the bidder list in the configuration panel
 */
function renderBidderList() {
  DOM.bidderList.innerHTML = "";

  AppState.bidders.forEach((bidder) => {
    const bidderItem = document.createElement("div");
    bidderItem.className = "bidder-item";
    bidderItem.innerHTML = `
            <div class="bidder-toggle ${bidder.enabled ? "active" : ""}" data-bidder-id="${bidder.id}"></div>
            <div class="bidder-info">
                <div class="bidder-name">${bidder.name}</div>
                <div class="bidder-details">Avg: $${bidder.avgBidPrice.toFixed(2)} | ~${bidder.avgResponseTime}ms</div>
            </div>
            <div class="bidder-color" style="background-color: ${bidder.color}"></div>
        `;

    const toggle = bidderItem.querySelector(".bidder-toggle");
    toggle.addEventListener("click", () => toggleBidder(bidder.id));

    DOM.bidderList.appendChild(bidderItem);
  });
}

/**
 * Toggle a bidder's enabled state
 * @param {string} bidderId - The bidder's unique identifier
 */
function toggleBidder(bidderId) {
  const bidder = AppState.bidders.find((b) => b.id === bidderId);
  if (bidder) {
    bidder.enabled = !bidder.enabled;

    const toggle = document.querySelector(`[data-bidder-id="${bidderId}"]`);
    toggle.classList.toggle("active", bidder.enabled);

    updateImpactAnalysis();
    addFeedback(
      "info",
      `${bidder.name} ${bidder.enabled ? "enabled" : "disabled"}`,
    );
  }
}

// ============================================
// CONFIGURATION HANDLERS
// ============================================

/**
 * Handle timeout slider changes
 */
function handleTimeoutChange() {
  AppState.config.timeout = parseInt(DOM.timeoutSlider.value);
  DOM.timeoutValue.textContent = AppState.config.timeout;
  DOM.timeoutMarker.textContent = `Timeout: ${AppState.config.timeout}ms`;
  updateTimeoutLine();
  updateImpactAnalysis();
}

/**
 * Handle auction type button clicks
 * @param {string} type - The auction type ('first-price' or 'second-price')
 */
function handleAuctionTypeChange(type) {
  AppState.config.auctionType = type;

  document.querySelectorAll("[data-auction-type]").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.auctionType === type);
  });

  addFeedback("info", `Auction type set to ${type}`);
}

/**
 * Handle price granularity selection changes
 */
function handlePriceGranularityChange() {
  AppState.config.priceGranularity = DOM.priceGranularity.value;
  addFeedback(
    "info",
    `Price granularity set to ${AppState.config.priceGranularity}`,
  );
}

/**
 * Handle floors toggle
 */
function handleFloorsToggle() {
  AppState.config.floorsEnabled = DOM.enableFloors.checked;
  DOM.floorSettings.classList.toggle("visible", AppState.config.floorsEnabled);
  updateImpactAnalysis();
}

/**
 * Handle floor price slider changes
 */
function handleFloorPriceChange() {
  AppState.config.floorPrice = parseFloat(DOM.floorPrice.value);
  DOM.floorValue.textContent = AppState.config.floorPrice.toFixed(2);
  updateImpactAnalysis();
}

/**
 * Handle primary currency changes
 */
function handleCurrencyChange() {
  AppState.config.primaryCurrency = DOM.primaryCurrency.value;
  addFeedback(
    "info",
    `Primary currency set to ${AppState.config.primaryCurrency}`,
  );
}

/**
 * Handle currency conversion toggle
 */
function handleCurrencyConversionToggle() {
  AppState.config.currencyConversionEnabled =
    DOM.enableCurrencyConversion.checked;
}

/**
 * Handle simulation speed changes
 */
function handleSpeedChange() {
  AppState.simulation.speed = parseFloat(DOM.simulationSpeed.value);
}

// ============================================
// PRESET MANAGEMENT
// ============================================

/**
 * Load a preset configuration
 * @param {string} presetId - The preset identifier
 */
function loadPreset(presetId) {
  const preset = AppState.presets[presetId];
  if (!preset) return;

  // Update config state
  Object.assign(AppState.config, preset.config);

  // Update bidder states
  AppState.bidders.forEach((bidder) => {
    bidder.enabled = preset.enabledBidders.includes(bidder.id);
  });

  // Update UI
  updateUIFromState();
  renderBidderList();

  // Update preset button states
  document.querySelectorAll(".preset-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.preset === presetId);
  });

  showNotification(
    "success",
    "Preset Loaded",
    `"${preset.name}" configuration applied`,
  );
  addFeedback("success", `Loaded preset: ${preset.name}`);
  updateImpactAnalysis();
}

// ============================================
// CONFIGURATION PERSISTENCE
// ============================================

/**
 * Reset configuration to defaults
 */
function resetConfiguration() {
  // Reset config
  AppState.config = {
    timeout: 1000,
    auctionType: "first-price",
    priceGranularity: "medium",
    floorsEnabled: false,
    floorPrice: 0.5,
    primaryCurrency: "USD",
    currencyConversionEnabled: true,
  };

  // Reset bidders to defaults
  AppState.bidders.forEach((bidder) => {
    bidder.enabled = ["appnexus", "rubicon", "pubmatic"].includes(bidder.id);
  });

  updateUIFromState();
  renderBidderList();

  // Clear preset selection
  document.querySelectorAll(".preset-btn").forEach((btn) => {
    btn.classList.remove("active");
  });

  showNotification(
    "info",
    "Configuration Reset",
    "All settings restored to defaults",
  );
}

/**
 * Update all UI elements from current state
 */
function updateUIFromState() {
  // Update timeout
  DOM.timeoutSlider.value = AppState.config.timeout;
  DOM.timeoutValue.textContent = AppState.config.timeout;
  DOM.timeoutMarker.textContent = `Timeout: ${AppState.config.timeout}ms`;
  updateTimeoutLine();

  // Update auction type
  document.querySelectorAll("[data-auction-type]").forEach((btn) => {
    btn.classList.toggle(
      "active",
      btn.dataset.auctionType === AppState.config.auctionType,
    );
  });

  // Update price granularity
  DOM.priceGranularity.value = AppState.config.priceGranularity;

  // Update floors
  DOM.enableFloors.checked = AppState.config.floorsEnabled;
  DOM.floorSettings.classList.toggle("visible", AppState.config.floorsEnabled);
  DOM.floorPrice.value = AppState.config.floorPrice;
  DOM.floorValue.textContent = AppState.config.floorPrice.toFixed(2);

  // Update currency
  DOM.primaryCurrency.value = AppState.config.primaryCurrency;
  DOM.enableCurrencyConversion.checked =
    AppState.config.currencyConversionEnabled;
}

/**
 * Update the timeout line position in the auction timeline
 */
function updateTimeoutLine() {
  const maxTime = 3000;
  const position = (AppState.config.timeout / maxTime) * 100;
  DOM.timeoutLine.style.left = `${position}%`;
}

// ============================================
// SIMULATION CONTROL
// ============================================

/** Labels and titles for each phase */
const PHASE_LABELS = [
  {
    title: "Request Initiation",
    proceedLabel: "Continue to Phase 2: Bidder Adapters →",
  },
  { title: "Bidder Adapters", proceedLabel: "Continue to Phase 3: Auction →" },
  { title: "Auction", proceedLabel: "Continue to Phase 4: Post-Auction →" },
  {
    title: "Post-Auction Processing",
    proceedLabel: "Continue to Phase 5: Ad Rendering →",
  },
  { title: "Ad Rendering", proceedLabel: "View Final Results" },
];

/** All workflow stage DOM nodes in order */
function getAllStages() {
  return [
    DOM.requestStage,
    DOM.bidderStage,
    DOM.auctionStage,
    DOM.postAuctionStage,
    DOM.renderStage,
  ];
}

/** Original Material Icons for each phase indicator (index 0–4) */
const PHASE_ICONS = ["send", "hub", "gavel", "tune", "web"];

/** Resolve/reject for the current waitForProceed promise */
let proceedResolve = null;
let proceedReject = null;

/**
 * Start the auction simulation
 */
async function startSimulation() {
  if (AppState.simulation.isRunning) return;

  // Check if any bidders are enabled
  const enabledBidders = AppState.bidders.filter((b) => b.enabled);
  if (enabledBidders.length === 0) {
    showNotification(
      "error",
      "No Bidders",
      "Please enable at least one bidder",
    );
    return;
  }

  AppState.simulation.isRunning = true;
  AppState.simulation.timeElapsed = 0;

  // Reset auction state
  AppState.auction = {
    bids: [],
    winner: null,
    clearingPrice: 0,
  };

  // Update button states
  DOM.startSimulation.disabled = true;

  // Clear previous results
  clearResults();

  // Run simulation phases — one at a time, gate on user clicking "Proceed"
  try {
    showOnlyPhase(0);
    await runPhase1_RequestInitiation();
    showPhaseSummary(0);
    await waitForProceed(0);

    showOnlyPhase(1);
    await runPhase2_BidderAdapters();
    showPhaseSummary(1);
    await waitForProceed(1);

    showOnlyPhase(2);
    await runPhase3_Auction();
    showPhaseSummary(2);
    await waitForProceed(2);

    showOnlyPhase(3);
    await runPhase4_PostAuction();
    showPhaseSummary(3);
    await waitForProceed(3);

    showOnlyPhase(4);
    await runPhase5_Rendering();
    showPhaseSummary(4);
    await waitForProceed(4);

    // Complete
    addFeedback("success", "Auction simulation completed");
    updateResultsSummary();
  } catch (error) {
    if (error?.message === "SIMULATION_RESET") {
      return; // clean abort — resetSimulation() already handled all cleanup
    }
    console.error("Simulation error:", error);
    addFeedback("error", "Simulation error occurred");
  }

  AppState.simulation.isRunning = false;
  DOM.startSimulation.disabled = false;
}

/**
 * Reset the simulation to initial state
 */
function resetSimulation() {
  // Abort any pending "proceed" promise so the async chain exits cleanly
  if (proceedReject) {
    proceedReject(new Error("SIMULATION_RESET"));
    proceedResolve = null;
    proceedReject = null;
  }

  AppState.simulation.isRunning = false;
  AppState.simulation.currentPhase = null;
  AppState.simulation.timeElapsed = 0;
  AppState.simulation.completedUpTo = -1;
  AppState.simulation.displayedPhaseIndex = null;

  if (AppState.simulation.timer) {
    clearInterval(AppState.simulation.timer);
    AppState.simulation.timer = null;
  }

  // Reset auction state
  AppState.auction = {
    bids: [],
    winner: null,
    clearingPrice: 0,
  };

  // Reset button states
  DOM.startSimulation.disabled = false;

  // Reset phase indicators and restore original icons
  DOM.phases.forEach((phase, i) => {
    phase.classList.remove("active", "completed", "viewing");
    const icon = phase.querySelector(".phase-icon");
    if (icon) icon.textContent = PHASE_ICONS[i];
  });
  DOM.phaseConnectors.forEach((conn) => {
    conn.classList.remove("active", "completed");
  });

  // Hide navigation banner and proceed footer
  DOM.phaseNavBanner.classList.add("hidden");
  DOM.phaseProceedFooter.classList.add("hidden");

  // Reset all stages
  resetAllStages();

  // Clear results
  clearResults();

  addFeedback("info", "Simulation reset - ready to start");
}

/**
 * Reset all workflow stages to initial state
 */
function resetAllStages() {
  // Hide all stages and strip their dynamic inline summaries
  getAllStages().forEach((stage) => {
    stage.classList.remove(
      "active",
      "completed",
      "visible",
      "exiting-left",
      "exiting-right",
      "entering-right",
      "entering-left",
    );
    stage.querySelector(".phase-summary")?.remove();
  });

  [
    DOM.requestStatus,
    DOM.bidderStatus,
    DOM.auctionStatus,
    DOM.postAuctionStatus,
    DOM.renderStatus,
  ].forEach((status) => {
    status.textContent = "Waiting";
    status.classList.remove("active", "completed");
  });

  // Reset request stage
  DOM.requestArrow.classList.remove("active");
  DOM.requestCodeBlocks.classList.remove("visible");
  DOM.bidResponseDetails.classList.remove("visible");

  // Reset bidder stage
  DOM.bidderRequests.innerHTML = "";

  // Reset auction stage
  DOM.timelineProgress.style.width = "0%";
  DOM.bidResponses.innerHTML = "";
  DOM.bidTableBody.innerHTML = "";

  // Reset post-auction stage
  [DOM.floorCheck, DOM.currencyConvert, DOM.winnerSelect].forEach((step) => {
    step.classList.remove("active", "completed");
  });
  DOM.floorCheckDetail.textContent = "-";
  DOM.currencyConvertDetail.textContent = "-";
  DOM.winnerSelectDetail.textContent = "-";

  // Reset render stage
  DOM.winnerDetails.textContent = "-";
  DOM.renderedAd.classList.remove("active");
  document.querySelector(".render-arrow")?.classList.remove("active");
  DOM.impressionEvent.textContent = "Pending";
  DOM.impressionEvent.classList.remove("fired");
  DOM.billingEvent.textContent = "Pending";
  DOM.billingEvent.classList.remove("fired");
}

/**
 * Clear all results displays
 */
function clearResults() {
  DOM.totalBidders.textContent = "-";
  DOM.bidsReceived.textContent = "-";
  DOM.timedOut.textContent = "-";
  DOM.belowFloor.textContent = "-";
  DOM.winningBid.textContent = "-";
  DOM.clearingPrice.textContent = "-";
  DOM.resultsTableBody.innerHTML =
    '<tr><td colspan="5" class="empty-state">Running simulation...</td></tr>';
}

// ============================================
// SIMULATION PHASES
// ============================================

/**
 * Phase 1: Request Initiation
 */
async function runPhase1_RequestInitiation() {
  setActivePhase(0);
  DOM.requestStage.classList.add("active");
  DOM.requestStatus.textContent = "Active";
  DOM.requestStatus.classList.add("active");

  addFeedback("info", "Phase 1: Initiating ad request from publisher page");

  // Animate request arrow
  await delay(500);
  DOM.requestArrow.classList.add("active");

  // Show request parameters and S2S config side-by-side
  await delay(500);
  renderAnnotatedJson(DOM.requestJson, generateOpenRTBRequest());
  renderAnnotatedJson(DOM.s2sConfigJson, generateS2SConfig());
  DOM.requestCodeBlocks.classList.add("visible");

  await delay(1000);

  // Mark phase complete
  completePhase(0);
  DOM.requestStage.classList.remove("active");
  DOM.requestStage.classList.add("completed");
  DOM.requestStatus.textContent = "Complete";
  DOM.requestStatus.classList.remove("active");
  DOM.requestStatus.classList.add("completed");
}

/**
 * Generate a sample OpenRTB request
 */
function generateOpenRTBRequest() {
  const enabledBidders = AppState.bidders.filter((b) => b.enabled);

  const request = {
    id: generateRequestId(),
    imp: [
      {
        id: "1",
        banner: {
          w: 300,
          h: 250,
          format: [
            { w: 300, h: 250 },
            { w: 320, h: 50 },
          ],
        },
        bidfloor: AppState.config.floorsEnabled
          ? AppState.config.floorPrice
          : 0,
        bidfloorcur: AppState.config.primaryCurrency,
        ext: {
          prebid: {
            bidder: Object.fromEntries(
              enabledBidders.map((b) => [
                b.id,
                { placement: Math.floor(Math.random() * 90000) + 10000 },
              ]),
            ),
          },
        },
      },
    ],
    site: {
      page: "[example.com](https://example.com/article)",
      domain: "example.com",
    },
    device: {
      ua: "Mozilla/5.0...",
      ip: "192.168.x.x",
    },
    tmax: AppState.config.timeout,
    cur: [AppState.config.primaryCurrency],
    ext: {
      prebid: {
        targeting: {
          pricegranularity: AppState.config.priceGranularity,
        },
        bidders: enabledBidders.map((b) => b.id),
      },
    },
  };

  return annotateJson(JSON.stringify(request, null, 2), [
    { ws: "  ", key: "id", comment: "Unique ID for this auction request" },
    {
      ws: "  ",
      key: "imp",
      comment: "Impression objects — each represents an ad slot to fill",
    },
    {
      ws: "      ",
      key: "bidfloor",
      comment:
        "Minimum acceptable bid price; bids below this are rejected by PBS",
    },
    {
      ws: "      ",
      key: "ext",
      comment:
        "Impression-level extensions — routes bidder-specific params to each adapter via ext.prebid.bidder",
    },
    {
      ws: "              ",
      key: "placement",
      comment:
        "Bidder-specific placement ID passed opaquely to the adapter; format varies per demand partner",
    },
    {
      ws: "  ",
      key: "tmax",
      comment:
        "Deadline (ms) — bidders must respond before this or be excluded",
    },
    {
      ws: "        ",
      key: "pricegranularity",
      comment:
        "How bid prices are bucketed into ad server key-values (e.g. hb_pb)",
    },
    {
      ws: "      ",
      key: "bidders",
      comment: "Adapter IDs PBS will call server-side for demand",
    },
  ]);
}

/**
 * Generate a unique request ID
 */
function generateRequestId() {
  return "req_" + Math.random().toString(36).substr(2, 9);
}

/**
 * Render annotated JSON into a <pre> element, colouring // comment lines.
 * Escapes HTML entities on every line, then wraps comment lines in a span.
 * Uses innerHTML so the colour span is parsed; textContent on the same
 * element still returns plain text, which is what the modal open functions rely on.
 */
function renderAnnotatedJson(pre, json) {
  pre.innerHTML = json
    .split("\n")
    .map((line) => {
      const escaped = line
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      return /^\s*\/\//.test(line)
        ? `<span class="json-comment">${escaped}</span>`
        : escaped;
    })
    .join("\n");
}

/**
 * Insert `// comment` lines into a JSON.stringify output.
 * Uses exact string matching (whitespace + key) so the same key name at
 * different nesting depths are annotated independently.
 *
 * @param {string} json   - output of JSON.stringify(obj, null, 2)
 * @param {Array<{ws:string, key:string, comment:string}>} notes
 *   ws = exact leading whitespace for that line, key = field name (no quotes)
 */
function annotateJson(json, notes) {
  let out = json;
  for (const { ws, key, comment } of notes) {
    const target = `\n${ws}"${key}":`;
    const replacement = `\n${ws}// ${comment}\n${ws}"${key}":`;
    out = out.replace(target, replacement); // replaces first occurrence only
  }
  return out;
}

/**
 * Map a price granularity label to its OpenRTB ranges definition.
 * Returns a plain string for "auto", an object otherwise.
 */
function priceGranularityRanges(label) {
  switch (label) {
    case "low":
      return { ranges: [{ max: 5.0, increment: 0.5 }] };
    case "high":
      return { ranges: [{ max: 20.0, increment: 0.01 }] };
    case "dense":
      return {
        ranges: [
          { min: 0, max: 3.0, increment: 0.01 },
          { min: 3.0, max: 8.0, increment: 0.05 },
        ],
      };
    case "auto":
      return "auto";
    case "medium":
    default:
      return { ranges: [{ max: 20.0, increment: 0.1 }] };
  }
}

/**
 * Generate a Prebid Server S2S configuration object, formatted as a
 * pbjs.setConfig() call matching the Prebid docs style.
 */
function generateS2SConfig() {
  const enabledBidders = AppState.bidders.filter((b) => b.enabled);
  const accountId = "d0cd3243-716f-4f9c-b074-f72637de26f3";

  const config = {
    accountId,
    bidders: enabledBidders.map((b) => b.id),
    adapter: "prebidServer",
    enabled: true,
    endpoint: "https://prebid-server.example.com/openrtb2/auction",
    syncEndpoint: "https://prebid-server.example.com/cookie_sync",
    timeout: AppState.config.timeout,
    extPrebid: {
      targeting: {
        pricegranularity: priceGranularityRanges(
          AppState.config.priceGranularity,
        ),
      },
    },
    ...(AppState.config.currencyConversionEnabled && {
      currency: {
        adServerCurrency: AppState.config.primaryCurrency,
      },
    }),
    ...(AppState.config.floorsEnabled && {
      floors: {
        enforcement: { enforceJS: true, floorDeals: false },
        data: {
          currency: AppState.config.primaryCurrency,
          modelGroups: [
            {
              modelWeight: 100,
              values: { "*|*|*": AppState.config.floorPrice },
            },
          ],
        },
      },
    }),
  };

  // Indent each line of the stringified config by 4 spaces so it sits
  // correctly inside the  s2sConfig: [ ... ]  array wrapper.
  const innerJson = JSON.stringify(config, null, 2);
  const indented = innerJson
    .split("\n")
    .map((l) => "    " + l)
    .join("\n");

  const wrapped = `pbjs.setConfig({\n  s2sConfig: [\n${indented}\n  ]\n})`;

  // ws values account for the 4-space wrapper indent + JSON's own indentation.
  // Top-level config keys: 4 (wrapper) + 2 (JSON level-1) = 6 spaces.
  // extPrebid children:    4 + 4 = 8 spaces.
  // targeting children:    4 + 6 = 10 spaces.
  return annotateJson(wrapped, [
    {
      ws: "      ",
      key: "accountId",
      comment: "Publisher account ID registered with Prebid Server",
    },
    {
      ws: "      ",
      key: "bidders",
      comment:
        "Demand partners PBS contacts server-side, bypassing client-side JS",
    },
    {
      ws: "      ",
      key: "adapter",
      comment: "Client-side Prebid.js module that handles S2S communication",
    },
    {
      ws: "      ",
      key: "endpoint",
      comment: "PBS auction URL — receives the OpenRTB request",
    },
    {
      ws: "      ",
      key: "syncEndpoint",
      comment: "PBS cookie-sync URL — aligns user IDs across demand partners",
    },
    {
      ws: "      ",
      key: "timeout",
      comment:
        "Max time (ms) PBS waits for bidder responses before closing the auction",
    },
    {
      ws: "      ",
      key: "extPrebid",
      comment:
        "Prebid-specific server extensions — targeting, caching, and feature flags",
    },
    {
      ws: "          ",
      key: "pricegranularity",
      comment:
        "How bid prices are bucketed into ad server key-values (e.g. hb_pb)",
    },
    {
      ws: "      ",
      key: "currency",
      comment:
        "Converts all bids to adServerCurrency for consistent comparison",
    },
    {
      ws: "      ",
      key: "floors",
      comment:
        "Server-enforced price floors — bids below threshold are dropped",
    },
  ]);
}

/**
 * Generate a representative OpenRTB bid response from the first enabled bidder
 */
function generateBidResponse() {
  const enabledBidders = AppState.bidders.filter((b) => b.enabled);
  const bidder = enabledBidders[0] || {
    id: "appnexus",
    name: "AppNexus",
    avgBidPrice: 1.5,
    avgResponseTime: 150,
    currency: "USD",
  };
  const price = parseFloat(bidder.avgBidPrice.toFixed(2));
  const reqId = generateRequestId();

  const response = {
    id: reqId,
    seatbid: [
      {
        bid: [
          {
            id: "bid-" + Math.random().toString(36).substr(2, 6),
            impid: "1",
            price: price,
            adid: "ad-" + Math.random().toString(36).substr(2, 6),
            adm: "<!-- creative markup (HTML/VAST) -->",
            adomain: ["advertiser.example.com"],
            crid: "cr-" + Math.random().toString(36).substr(2, 4),
            w: 300,
            h: 250,
            ext: {
              prebid: {
                targeting: {
                  hb_pb: price.toFixed(2),
                  hb_bidder: bidder.id,
                  hb_size: "300x250",
                  hb_cache_id: generateRequestId(),
                },
                type: "banner",
                cache: {
                  bids: {
                    url: `https://prebid-cache.example.com/cache?uuid=${generateRequestId()}`,
                  },
                },
              },
              bidder: {
                [bidder.id]: {
                  brand_id: 1,
                  auction_id: Math.floor(Math.random() * 9e18) + 1e18,
                  bidder_id: Math.floor(Math.random() * 9) + 1,
                  bid_ad_type: 0,
                },
              },
            },
          },
        ],
        seat: bidder.id,
        group: 0,
      },
    ],
    cur: bidder.currency || AppState.config.primaryCurrency,
    ext: {
      responsetimemillis: { [bidder.id]: bidder.avgResponseTime },
      prebid: { auctiontimestamp: Date.now() },
    },
  };

  return annotateJson(JSON.stringify(response, null, 2), [
    {
      ws: "  ",
      key: "id",
      comment: "Echoes the auction request ID for correlation",
    },
    {
      ws: "  ",
      key: "seatbid",
      comment: "Bids returned, grouped by buyer seat (SSP/DSP)",
    },
    {
      ws: "          ",
      key: "price",
      comment: "Bid CPM — what the advertiser pays if this bid wins",
    },
    {
      ws: "          ",
      key: "adm",
      comment:
        "Ad markup rendered in the browser; retrieved from Prebid Cache at win time",
    },
    {
      ws: "          ",
      key: "adomain",
      comment:
        "Advertiser domain — used for brand safety and competitive exclusions",
    },
    {
      ws: "              ",
      key: "bidder",
      comment:
        "Bidder-proprietary metadata (brand ID, auction ID, creative type) passed through opaquely by PBS",
    },
    {
      ws: "                ",
      key: "hb_pb",
      comment: "Price bucket sent to the ad server as the hb_pb targeting key",
    },
    {
      ws: "                ",
      key: "hb_cache_id",
      comment:
        "Cache key to retrieve the creative from Prebid Cache at render time",
    },
    {
      ws: "    ",
      key: "responsetimemillis",
      comment: "Bidder latency in ms — informs timeout tuning decisions",
    },
  ]);
}

/**
 * Phase 2: Bidder Adapters
 */
async function runPhase2_BidderAdapters() {
  setActivePhase(1);
  DOM.bidderStage.classList.add("active");
  DOM.bidderStatus.textContent = "Active";
  DOM.bidderStatus.classList.add("active");

  addFeedback("info", "Phase 2: Sending requests to bidder adapters");

  const enabledBidders = AppState.bidders.filter((b) => b.enabled);

  // Create bidder request items
  DOM.bidderRequests.innerHTML = "";
  enabledBidders.forEach((bidder) => {
    const item = document.createElement("div");
    item.className = "bidder-request-item";
    item.id = `bidder-request-${bidder.id}`;
    item.innerHTML = `
            <div class="request-line">
                <div class="request-progress" style="background: ${bidder.color}"></div>
            </div>
            <div class="bidder-endpoint">
                <div class="endpoint-name">${bidder.name}</div>
                <div class="endpoint-status">Waiting...</div>
            </div>
        `;
    DOM.bidderRequests.appendChild(item);
  });

  // Animate requests being sent
  for (const bidder of enabledBidders) {
    await delay(200 / AppState.simulation.speed);
    const item = document.getElementById(`bidder-request-${bidder.id}`);
    item.classList.add("active");
    item.querySelector(".endpoint-status").textContent = "Sending...";
  }

  await delay(500);

  // Show requests sent
  enabledBidders.forEach((bidder) => {
    const item = document.getElementById(`bidder-request-${bidder.id}`);
    const progress = item.querySelector(".request-progress");
    progress.style.width = "100%";
    item.querySelector(".endpoint-status").textContent = "Awaiting response";
  });

  await delay(500);

  // Show a sample bid response once all requests are sent
  renderAnnotatedJson(DOM.bidResponseJson, generateBidResponse());
  DOM.bidResponseDetails.classList.add("visible");

  await delay(400);

  // Mark phase complete
  completePhase(1);
  DOM.bidderStage.classList.remove("active");
  DOM.bidderStage.classList.add("completed");
  DOM.bidderStatus.textContent = "Complete";
  DOM.bidderStatus.classList.remove("active");
  DOM.bidderStatus.classList.add("completed");
}

/**
 * Phase 3: Auction
 */
async function runPhase3_Auction() {
  setActivePhase(2);
  DOM.auctionStage.classList.add("active");
  DOM.auctionStatus.textContent = "Active";
  DOM.auctionStatus.classList.add("active");

  addFeedback("info", "Phase 3: Collecting bids from bidders");

  const enabledBidders = AppState.bidders.filter((b) => b.enabled);
  const timeout = AppState.config.timeout;
  const maxDisplayTime = 3000;

  // Generate simulated bids
  const bids = enabledBidders.map((bidder) => {
    const responseTime = Math.max(
      50,
      bidder.avgResponseTime +
        (Math.random() - 0.5) * 2 * bidder.responseTimeVariance,
    );
    const bidPrice = Math.max(
      0.1,
      bidder.avgBidPrice + (Math.random() - 0.5) * 2 * bidder.bidPriceVariance,
    );

    return {
      bidder: bidder,
      responseTime: Math.round(responseTime),
      originalPrice: parseFloat(bidPrice.toFixed(2)),
      originalCurrency: bidder.currency,
      convertedPrice: 0,
      status: "pending",
      reason: "",
    };
  });

  // Sort by response time
  bids.sort((a, b) => a.responseTime - b.responseTime);

  // Initialize bid table
  DOM.bidTableBody.innerHTML = bids
    .map(
      (bid) => `
        <tr id="bid-row-${bid.bidder.id}">
            <td>
                <span style="display: inline-block; width: 8px; height: 8px; 
                      background: ${bid.bidder.color}; border-radius: 50%; margin-right: 8px;"></span>
                ${bid.bidder.name}
            </td>
            <td>-</td>
            <td>${bid.originalCurrency}</td>
            <td>-</td>
            <td><span class="status-badge pending">Pending</span></td>
        </tr>
    `,
    )
    .join("");

  // Animate timeline
  const startTime = Date.now();
  const animationDuration =
    ((timeout / maxDisplayTime) * 3000) / AppState.simulation.speed;

  // Progress animation
  const progressAnimation = animateProgress(
    DOM.timelineProgress,
    animationDuration,
  );

  // Process bids as they "arrive"
  for (const bid of bids) {
    const scaledResponseTime =
      ((bid.responseTime / maxDisplayTime) * 3000) / AppState.simulation.speed;
    const waitTime = Math.max(0, scaledResponseTime - (Date.now() - startTime));

    await delay(waitTime);

    // Check if bid is within timeout
    if (bid.responseTime <= timeout) {
      bid.status = "received";

      // Update bidder request status
      const requestItem = document.getElementById(
        `bidder-request-${bid.bidder.id}`,
      );
      if (requestItem) {
        requestItem.querySelector(".endpoint-status").textContent =
          "Response received";
        requestItem.classList.add("sent");
      }

      // Update bid table
      const row = document.getElementById(`bid-row-${bid.bidder.id}`);
      if (row) {
        row.children[1].textContent = `$${bid.originalPrice.toFixed(2)}`;
        row.children[3].textContent = `${bid.responseTime}ms`;
        row.children[4].innerHTML =
          '<span class="status-badge pending">Received</span>';
      }

      // Add bid marker
      const marker = document.createElement("div");
      marker.className = "bid-marker";
      marker.innerHTML = `
                <span class="bid-marker-color" style="background: ${bid.bidder.color}"></span>
                <span>${bid.bidder.name}: $${bid.originalPrice.toFixed(2)}</span>
            `;
      DOM.bidResponses.appendChild(marker);
      await delay(50);
      marker.classList.add("visible");

      addFeedback(
        "info",
        `${bid.bidder.name} responded in ${bid.responseTime}ms with $${bid.originalPrice.toFixed(2)} ${bid.originalCurrency}`,
      );
    } else {
      bid.status = "timeout";
      bid.reason = `Response time (${bid.responseTime}ms) exceeded timeout (${timeout}ms)`;

      // Update bidder request status
      const requestItem = document.getElementById(
        `bidder-request-${bid.bidder.id}`,
      );
      if (requestItem) {
        requestItem.querySelector(".endpoint-status").textContent = "Timed out";
      }

      // Update bid table
      const row = document.getElementById(`bid-row-${bid.bidder.id}`);
      if (row) {
        row.children[3].textContent = `${bid.responseTime}ms`;
        row.children[4].innerHTML =
          '<span class="status-badge timeout">Timeout</span>';
      }

      addFeedback(
        "warning",
        `${bid.bidder.name} timed out (${bid.responseTime}ms > ${timeout}ms)`,
      );
    }
  }

  // Wait for progress animation to complete
  await progressAnimation;

  // Store bids in state
  AppState.auction.bids = bids;

  await delay(500);

  // Mark phase complete
  completePhase(2);
  DOM.auctionStage.classList.remove("active");
  DOM.auctionStage.classList.add("completed");
  DOM.auctionStatus.textContent = "Complete";
  DOM.auctionStatus.classList.remove("active");
  DOM.auctionStatus.classList.add("completed");
}

/**
 * Animate progress bar
 */
function animateProgress(element, duration) {
  return new Promise((resolve) => {
    const startTime = Date.now();

    function update() {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, (elapsed / duration) * 100);
      element.style.width = `${progress}%`;

      if (progress < 100) {
        requestAnimationFrame(update);
      } else {
        resolve();
      }
    }

    requestAnimationFrame(update);
  });
}

/**
 * Phase 4: Post-Auction Processing
 */
async function runPhase4_PostAuction() {
  setActivePhase(3);
  DOM.postAuctionStage.classList.add("active");
  DOM.postAuctionStatus.textContent = "Active";
  DOM.postAuctionStatus.classList.add("active");

  addFeedback("info", "Phase 4: Processing auction results");

  let validBids = AppState.auction.bids.filter((b) => b.status === "received");

  // Step 1: Floor enforcement
  DOM.floorCheck.classList.add("active");
  await delay(500 / AppState.simulation.speed);

  if (AppState.config.floorsEnabled) {
    const floor = AppState.config.floorPrice;
    let filtered = 0;

    validBids.forEach((bid) => {
      // Convert bid to primary currency for floor comparison
      let priceInPrimary = bid.originalPrice;
      if (
        bid.originalCurrency !== AppState.config.primaryCurrency &&
        AppState.config.currencyConversionEnabled
      ) {
        priceInPrimary = convertCurrency(
          bid.originalPrice,
          bid.originalCurrency,
          AppState.config.primaryCurrency,
        );
      }

      if (priceInPrimary < floor) {
        bid.status = "floor";
        bid.reason = `Bid $${priceInPrimary.toFixed(2)} below floor $${floor.toFixed(2)}`;
        filtered++;

        // Update table
        const row = document.getElementById(`bid-row-${bid.bidder.id}`);
        if (row) {
          row.children[4].innerHTML =
            '<span class="status-badge floor">Below Floor</span>';
        }

        // Update marker
        const markers = DOM.bidResponses.querySelectorAll(".bid-marker");
        markers.forEach((marker) => {
          if (marker.textContent.includes(bid.bidder.name)) {
            marker.classList.add("floor");
          }
        });

        addFeedback(
          "warning",
          `${bid.bidder.name} bid rejected: below floor ($${priceInPrimary.toFixed(2)} < $${floor.toFixed(2)})`,
        );
      }
    });

    validBids = validBids.filter((b) => b.status === "received");
    DOM.floorCheckDetail.textContent = `${filtered} bid(s) below $${floor.toFixed(2)} floor`;
  } else {
    DOM.floorCheckDetail.textContent = "Floors disabled";
  }

  DOM.floorCheck.classList.remove("active");
  DOM.floorCheck.classList.add("completed");
  await delay(300 / AppState.simulation.speed);

  // Step 2: Currency conversion
  DOM.currencyConvert.classList.add("active");
  await delay(500 / AppState.simulation.speed);

  if (AppState.config.currencyConversionEnabled) {
    let converted = 0;

    validBids.forEach((bid) => {
      if (bid.originalCurrency !== AppState.config.primaryCurrency) {
        bid.convertedPrice = convertCurrency(
          bid.originalPrice,
          bid.originalCurrency,
          AppState.config.primaryCurrency,
        );
        converted++;
        addFeedback(
          "info",
          `${bid.bidder.name}: ${bid.originalCurrency} $${bid.originalPrice.toFixed(2)} → ${AppState.config.primaryCurrency} $${bid.convertedPrice.toFixed(2)}`,
        );
      } else {
        bid.convertedPrice = bid.originalPrice;
      }
    });

    DOM.currencyConvertDetail.textContent =
      converted > 0
        ? `Converted ${converted} bid(s) to ${AppState.config.primaryCurrency}`
        : "All bids in primary currency";
  } else {
    validBids.forEach((bid) => {
      bid.convertedPrice = bid.originalPrice;
    });
    DOM.currencyConvertDetail.textContent = "Conversion disabled";
  }

  DOM.currencyConvert.classList.remove("active");
  DOM.currencyConvert.classList.add("completed");
  await delay(300 / AppState.simulation.speed);

  // Step 3: Winner selection
  DOM.winnerSelect.classList.add("active");
  await delay(500 / AppState.simulation.speed);

  if (validBids.length > 0) {
    // Sort by converted price (highest first)
    validBids.sort((a, b) => b.convertedPrice - a.convertedPrice);

    const winner = validBids[0];
    winner.status = "won";

    // Determine clearing price
    let clearingPrice;
    if (
      AppState.config.auctionType === "second-price" &&
      validBids.length > 1
    ) {
      clearingPrice = validBids[1].convertedPrice + 0.01;
      addFeedback(
        "info",
        `Second-price auction: Winner pays $${clearingPrice.toFixed(2)} (2nd bid + $0.01)`,
      );
    } else {
      clearingPrice = winner.convertedPrice;
      addFeedback(
        "info",
        `First-price auction: Winner pays $${clearingPrice.toFixed(2)}`,
      );
    }

    AppState.auction.winner = winner;
    AppState.auction.clearingPrice = clearingPrice;

    // Mark other valid bids as lost
    validBids.slice(1).forEach((bid) => {
      bid.status = "lost";
      bid.reason = "Outbid by higher offer";
    });

    // Update table and markers
    AppState.auction.bids.forEach((bid) => {
      const row = document.getElementById(`bid-row-${bid.bidder.id}`);
      const markers = DOM.bidResponses.querySelectorAll(".bid-marker");

      if (bid.status === "won") {
        if (row) {
          row.children[4].innerHTML =
            '<span class="status-badge won">Winner</span>';
        }
        markers.forEach((marker) => {
          if (marker.textContent.includes(bid.bidder.name)) {
            marker.classList.add("won");
          }
        });
      } else if (bid.status === "lost") {
        if (row) {
          row.children[4].innerHTML =
            '<span class="status-badge lost">Lost</span>';
        }
        markers.forEach((marker) => {
          if (marker.textContent.includes(bid.bidder.name)) {
            marker.classList.add("lost");
          }
        });
      }
    });

    DOM.winnerSelectDetail.textContent = `${winner.bidder.name} wins at $${clearingPrice.toFixed(2)}`;
    addFeedback(
      "success",
      `Winner: ${winner.bidder.name} at $${clearingPrice.toFixed(2)} ${AppState.config.primaryCurrency}`,
    );
  } else {
    DOM.winnerSelectDetail.textContent = "No valid bids - no winner";
    addFeedback("warning", "No valid bids received - auction failed");
  }

  DOM.winnerSelect.classList.remove("active");
  DOM.winnerSelect.classList.add("completed");
  await delay(300 / AppState.simulation.speed);

  // Mark phase complete
  completePhase(3);
  DOM.postAuctionStage.classList.remove("active");
  DOM.postAuctionStage.classList.add("completed");
  DOM.postAuctionStatus.textContent = "Complete";
  DOM.postAuctionStatus.classList.remove("active");
  DOM.postAuctionStatus.classList.add("completed");
}

/**
 * Convert currency using exchange rates
 */
function convertCurrency(amount, fromCurrency, toCurrency) {
  if (fromCurrency === toCurrency) return amount;

  // Convert to USD first (base currency)
  const inUSD = amount / AppState.exchangeRates[fromCurrency];

  // Then convert to target currency
  const result = inUSD * AppState.exchangeRates[toCurrency];

  return parseFloat(result.toFixed(2));
}

/**
 * Phase 5: Ad Rendering
 */
async function runPhase5_Rendering() {
  setActivePhase(4);
  DOM.renderStage.classList.add("active");
  DOM.renderStatus.textContent = "Active";
  DOM.renderStatus.classList.add("active");

  const winner = AppState.auction.winner;

  if (winner) {
    addFeedback("info", "Phase 5: Rendering winning creative");

    // Show winning bid info
    DOM.winnerDetails.innerHTML = `
            <div>${winner.bidder.name}</div>
            <div style="font-size: 0.875rem; color: var(--text-secondary);">
                $${AppState.auction.clearingPrice.toFixed(2)} ${AppState.config.primaryCurrency}
            </div>
        `;

    await delay(500 / AppState.simulation.speed);

    // Animate render arrow
    document.querySelector(".render-arrow").classList.add("active");
    await delay(300 / AppState.simulation.speed);

    // Show rendered ad
    DOM.renderedAd.classList.add("active");
    DOM.renderedAd.querySelector(".ad-placeholder").style.background =
      `linear-gradient(135deg, ${winner.bidder.color}66 0%, ${winner.bidder.color} 100%)`;

    await delay(500 / AppState.simulation.speed);

    // Fire impression event
    DOM.impressionEvent.textContent = "Fired ✓";
    DOM.impressionEvent.classList.add("fired");
    addFeedback("info", "Impression event fired");

    await delay(300 / AppState.simulation.speed);

    // Fire billing event
    DOM.billingEvent.textContent = "Fired ✓";
    DOM.billingEvent.classList.add("fired");
    addFeedback("info", "Billing event fired");
  } else {
    addFeedback("warning", "Phase 5: No ad to render - auction had no winner");
    DOM.winnerDetails.textContent = "No winner";
  }

  await delay(500 / AppState.simulation.speed);

  // Mark phase complete
  completePhase(4);
  DOM.renderStage.classList.remove("active");
  DOM.renderStage.classList.add("completed");
  DOM.renderStatus.textContent = "Complete";
  DOM.renderStatus.classList.remove("active");
  DOM.renderStatus.classList.add("completed");
}

// ============================================
// PHASE DISPLAY & NAVIGATION
// ============================================

/** Duration (ms) for the enter/exit slide animations */
const PHASE_ANIM_MS = 280;

/**
 * Show only the stage for phaseIndex with a directional slide animation.
 * @param {number} phaseIndex - index of stage to show (0-4)
 * @param {'forward'|'backward'} direction - slide direction
 */
function showOnlyPhase(phaseIndex, direction = "forward") {
  const stages = getAllStages();
  const oldIndex = AppState.simulation.displayedPhaseIndex;

  // Animate out the currently visible stage (if any)
  if (oldIndex !== null && oldIndex !== phaseIndex && stages[oldIndex]) {
    const oldStage = stages[oldIndex];
    const exitClass =
      direction === "forward" ? "exiting-left" : "exiting-right";
    oldStage.classList.add(exitClass);
    setTimeout(() => {
      oldStage.classList.remove("visible", exitClass);
    }, PHASE_ANIM_MS);
  }

  // Animate in the new stage
  const newStage = stages[phaseIndex];
  const enterClass =
    direction === "forward" ? "entering-right" : "entering-left";
  newStage.classList.add("visible", enterClass);
  setTimeout(() => {
    newStage.classList.remove(enterClass);
  }, PHASE_ANIM_MS + 60);

  AppState.simulation.displayedPhaseIndex = phaseIndex;

  // Update "viewing" indicator highlight
  DOM.phases.forEach((ph, i) => {
    ph.classList.toggle("viewing", i === phaseIndex);
  });
}

/**
 * Append the inline phase-summary block to a completed stage and animate it in.
 * Also marks this phase as completed in state and makes its indicator clickable.
 */
function showPhaseSummary(phaseIndex) {
  const stage = getAllStages()[phaseIndex];

  // Remove any existing summary (safety)
  stage.querySelector(".phase-summary")?.remove();

  const summary = document.createElement("div");
  summary.className = "phase-summary";
  summary.innerHTML = buildPhaseSummaryContent(phaseIndex);
  stage.appendChild(summary);

  // Trigger slide-in animation next tick
  requestAnimationFrame(() => summary.classList.add("visible"));

  // Update state
  AppState.simulation.completedUpTo = phaseIndex;
  DOM.phases[phaseIndex].classList.add("completed");
}

/**
 * Show the proceed-footer and resolve once the user clicks it.
 * @param {number} phaseIndex - the phase that was just completed
 */
function waitForProceed(phaseIndex) {
  return new Promise((resolve, reject) => {
    proceedResolve = resolve;
    proceedReject = reject;
    const isLast = phaseIndex === 4;
    DOM.phaseProceedText.textContent = PHASE_LABELS[phaseIndex].proceedLabel;
    DOM.phaseProceedBtn.classList.toggle("complete", isLast);
    DOM.phaseProceedFooter.classList.remove("hidden");
  });
}

/** Called when the user clicks the proceed button */
function onProceedClicked() {
  DOM.phaseProceedFooter.classList.add("hidden");
  if (proceedResolve) {
    proceedResolve();
    proceedResolve = null;
    proceedReject = null;
  }
}

/**
 * Navigate to a past (or current) completed phase for review.
 * Ignores clicks on phases not yet completed.
 */
function navigateToPhase(phaseIndex) {
  if (phaseIndex > AppState.simulation.completedUpTo) return;

  const currentDisplayed = AppState.simulation.displayedPhaseIndex;
  const direction =
    currentDisplayed === null || phaseIndex >= currentDisplayed
      ? "forward"
      : "backward";

  showOnlyPhase(phaseIndex, direction);

  const isWaitingPhase =
    phaseIndex === AppState.simulation.completedUpTo && proceedResolve !== null;

  if (isWaitingPhase) {
    // The phase that's currently awaiting "proceed" — show the button
    hidePhaseNavBanner();
    DOM.phaseProceedFooter.classList.remove("hidden");
  } else {
    // A completed past phase — show the nav banner instead
    showPhaseNavBanner(phaseIndex);
    DOM.phaseProceedFooter.classList.add("hidden");
  }
}

/** Jump back to the phase that is currently awaiting proceed (or running) */
function returnToCurrentPhase() {
  const current = AppState.simulation.completedUpTo;
  if (current < 0) return;
  const currentDisplayed = AppState.simulation.displayedPhaseIndex;
  const direction =
    currentDisplayed === null || current >= currentDisplayed
      ? "forward"
      : "backward";
  showOnlyPhase(current, direction);
  hidePhaseNavBanner();
  if (proceedResolve !== null) {
    DOM.phaseProceedFooter.classList.remove("hidden");
  }
}

function showPhaseNavBanner(phaseIndex) {
  DOM.phaseNavText.textContent = `Viewing Phase ${phaseIndex + 1}: ${PHASE_LABELS[phaseIndex].title}`;
  DOM.phaseNavBanner.classList.remove("hidden");
}

function hidePhaseNavBanner() {
  DOM.phaseNavBanner.classList.add("hidden");
}

// ============================================
// INLINE PHASE SUMMARY CONTENT BUILDERS
// ============================================

function buildPhaseSummaryContent(phaseIndex) {
  const inner = [
    buildPhase1SummaryInner,
    buildPhase2SummaryInner,
    buildPhase3SummaryInner,
    buildPhase4SummaryInner,
    buildPhase5SummaryInner,
  ][phaseIndex]();

  return `
    <div class="phase-summary-header">
      <span class="material-icons-round phase-summary-badge">check_circle</span>
      <span class="phase-summary-title">Phase ${phaseIndex + 1} Complete — Key Takeaways</span>
    </div>
    <div class="phase-summary-body">
      ${inner}
    </div>
  `;
}

function buildPhase1SummaryInner() {
  const enabledBidders = AppState.bidders.filter((b) => b.enabled);
  const floor = AppState.config.floorsEnabled
    ? `$${AppState.config.floorPrice.toFixed(2)}`
    : "Disabled";
  return `
    <p class="summary-description">
      The publisher page constructed a standardized <strong>OpenRTB bid request</strong>
      and sent it to Prebid Server — describing the ad slot, timeout, and which demand
      partners should compete.
    </p>
    <div class="summary-facts">
      <div class="summary-fact">
        <span class="summary-fact-label">Bidders</span>
        <span class="summary-fact-value">${enabledBidders.length}</span>
      </div>
      <div class="summary-fact">
        <span class="summary-fact-label">Timeout</span>
        <span class="summary-fact-value">${AppState.config.timeout}ms</span>
      </div>
      <div class="summary-fact">
        <span class="summary-fact-label">Ad Slot</span>
        <span class="summary-fact-value">300×250</span>
      </div>
      <div class="summary-fact">
        <span class="summary-fact-label">Price Floor</span>
        <span class="summary-fact-value">${floor}</span>
      </div>
    </div>
    <div class="summary-insight">
      <span class="material-icons-round summary-insight-lamp">lightbulb</span>
      <span>OpenRTB is the lingua franca of programmatic advertising — a standardized
      format that lets publishers and demand partners communicate without custom
      integrations for every pair.</span>
    </div>
  `;
}

function buildPhase2SummaryInner() {
  const enabled = AppState.bidders.filter((b) => b.enabled);
  const items = enabled
    .map(
      (b) => `
    <div class="summary-event-item success">
      <span class="event-dot" style="background:${b.color}"></span>
      <span><strong>${b.name}</strong> — avg ~${b.avgResponseTime}ms, avg bid $${b.avgBidPrice.toFixed(2)} ${b.currency}</span>
    </div>`,
    )
    .join("");
  return `
    <p class="summary-description">
      Prebid Server simultaneously dispatched <strong>${enabled.length} adapter request(s)</strong>
      — translating the OpenRTB payload into each bidder's proprietary API format and
      firing them all in parallel.
    </p>
    <div class="summary-event-list">${items}</div>
    <div class="summary-insight">
      <span class="material-icons-round summary-insight-lamp">lightbulb</span>
      <span>Sending all adapter requests in parallel keeps total latency equal to the
      slowest single bidder, not the sum of all bidders.</span>
    </div>
  `;
}

function buildPhase3SummaryInner() {
  const bids = AppState.auction.bids;
  const received = bids.filter(
    (b) => b.status !== "timeout" && b.status !== "pending",
  );
  const timedOut = bids.filter((b) => b.status === "timeout");
  const items = bids
    .map((bid) => {
      const isTimeout = bid.status === "timeout";
      const cls = isTimeout ? "warning" : "success";
      const detail = isTimeout
        ? `Timed out (${bid.responseTime}ms &gt; ${AppState.config.timeout}ms)`
        : `$${bid.originalPrice.toFixed(2)} ${bid.originalCurrency} in ${bid.responseTime}ms`;
      return `
      <div class="summary-event-item ${cls}">
        <span class="event-dot" style="background:${bid.bidder.color}"></span>
        <span><strong>${bid.bidder.name}</strong> — ${detail}</span>
      </div>`;
    })
    .join("");
  return `
    <p class="summary-description">
      <strong>${received.length}</strong> bid(s) arrived within the
      <strong>${AppState.config.timeout}ms timeout</strong>;
      <strong>${timedOut.length}</strong> bid(s) timed out and were excluded.
    </p>
    <div class="summary-facts">
      <div class="summary-fact">
        <span class="summary-fact-label">Received</span>
        <span class="summary-fact-value">${received.length}</span>
      </div>
      <div class="summary-fact">
        <span class="summary-fact-label">Timed Out</span>
        <span class="summary-fact-value">${timedOut.length}</span>
      </div>
    </div>
    <div class="summary-event-list">${items}</div>
    <div class="summary-insight">
      <span class="material-icons-round summary-insight-lamp">lightbulb</span>
      <span>Timeout is a key trade-off: shorter values reduce page latency but may exclude
      slower bidders with valuable demand.</span>
    </div>
  `;
}

function buildPhase4SummaryInner() {
  const bids = AppState.auction.bids;
  const winner = AppState.auction.winner;
  const floorRejects = bids.filter((b) => b.status === "floor");
  const converted = bids.filter(
    (b) =>
      b.status !== "timeout" &&
      b.originalCurrency !== AppState.config.primaryCurrency,
  );
  const steps = [
    {
      cls: floorRejects.length > 0 ? "warning" : "success",
      text: AppState.config.floorsEnabled
        ? `<span class="material-icons-round" style="font-size:1rem;vertical-align:middle">price_check</span> <strong>Floor Enforcement:</strong> ${floorRejects.length} bid(s) rejected below $${AppState.config.floorPrice.toFixed(2)}`
        : `<span class="material-icons-round" style="font-size:1rem;vertical-align:middle">price_check</span> <strong>Floor Enforcement:</strong> Disabled — all bids passed`,
    },
    {
      cls: "success",
      text: AppState.config.currencyConversionEnabled
        ? converted.length > 0
          ? `<span class="material-icons-round" style="font-size:1rem;vertical-align:middle">currency_exchange</span> <strong>Currency Conversion:</strong> ${converted.length} bid(s) converted to ${AppState.config.primaryCurrency}`
          : `<span class="material-icons-round" style="font-size:1rem;vertical-align:middle">currency_exchange</span> <strong>Currency Conversion:</strong> All bids already in ${AppState.config.primaryCurrency}`
        : `<span class="material-icons-round" style="font-size:1rem;vertical-align:middle">currency_exchange</span> <strong>Currency Conversion:</strong> Disabled`,
    },
    {
      cls: winner ? "success" : "error",
      text: winner
        ? `<span class="material-icons-round" style="font-size:1rem;vertical-align:middle">emoji_events</span> <strong>Winner:</strong> ${winner.bidder.name} at $${AppState.auction.clearingPrice.toFixed(2)} ${AppState.config.primaryCurrency} (${AppState.config.auctionType})`
        : `<span class="material-icons-round" style="font-size:1rem;vertical-align:middle">emoji_events</span> <strong>Winner:</strong> No valid bids — auction had no winner`,
    },
  ];
  const items = steps
    .map(
      (s) =>
        `<div class="summary-event-item ${s.cls}"><span class="event-dot"></span><span>${s.text}</span></div>`,
    )
    .join("");
  return `
    <p class="summary-description">
      Three post-auction steps were applied: price floor enforcement, currency
      normalisation, and winner selection.
    </p>
    <div class="summary-event-list">${items}</div>
    <div class="summary-insight">
      <span class="material-icons-round summary-insight-lamp">lightbulb</span>
      <span>Post-auction processing ensures every bid is compared fairly — floors protect
      publisher revenue and currency conversion lets global demand compete equally.</span>
    </div>
  `;
}

function buildPhase5SummaryInner() {
  const winner = AppState.auction.winner;
  if (!winner) {
    return `
      <p class="summary-description">No valid bids — the auction had no winner and no creative was rendered.</p>
      <div class="summary-insight">
        <span class="material-icons-round summary-insight-lamp">lightbulb</span>
        <span>When Prebid finds no winner, the publisher's ad server waterfall serves a
        fallback or house ad.</span>
      </div>`;
  }
  return `
    <p class="summary-description">
      The winning bid from <strong>${winner.bidder.name}</strong> was returned to the
      publisher page, the creative was rendered in the slot, and tracking events were
      fired to close the reporting loop.
    </p>
    <div class="summary-facts">
      <div class="summary-fact">
        <span class="summary-fact-label">Winner</span>
        <span class="summary-fact-value">${winner.bidder.name}</span>
      </div>
      <div class="summary-fact">
        <span class="summary-fact-label">Clearing Price</span>
        <span class="summary-fact-value">$${AppState.auction.clearingPrice.toFixed(2)}</span>
      </div>
      <div class="summary-fact">
        <span class="summary-fact-label">Auction Type</span>
        <span class="summary-fact-value">${AppState.config.auctionType === "first-price" ? "1st Price" : "2nd Price"}</span>
      </div>
    </div>
    <div class="summary-event-list">
      <div class="summary-event-item success">
        <span class="event-dot"></span>
        <span><span class="material-icons-round" style="font-size:1rem;vertical-align:middle">analytics</span> <strong>Impression event fired</strong> — ad displayed in slot</span>
      </div>
      <div class="summary-event-item success">
        <span class="event-dot"></span>
        <span><span class="material-icons-round" style="font-size:1rem;vertical-align:middle">payments</span> <strong>Billing event fired</strong> — publisher revenue recorded</span>
      </div>
    </div>
    <div class="summary-insight">
      <span class="material-icons-round summary-insight-lamp">lightbulb</span>
      <span>Impression and billing events close the programmatic loop — they trigger
      revenue reporting, frequency capping, and campaign pacing for the buyer.</span>
    </div>
  `;
}

// ============================================
// PHASE INDICATOR HELPERS
// ============================================

/**
 * Set a phase as active
 * @param {number} index - Phase index (0-4)
 */
function setActivePhase(index) {
  AppState.simulation.currentPhase = index;

  DOM.phases.forEach((phase, i) => {
    phase.classList.remove("active");
    if (i === index) {
      phase.classList.add("active");
    }
  });
}

/**
 * Mark a phase as completed
 * @param {number} index - Phase index (0-4)
 */
function completePhase(index) {
  DOM.phases[index].classList.remove("active");
  DOM.phases[index].classList.add("completed");

  // Swap phase icon to checkmark
  const icon = DOM.phases[index].querySelector(".phase-icon");
  if (icon) icon.textContent = "check";

  if (index < DOM.phaseConnectors.length) {
    DOM.phaseConnectors[index].classList.add("completed");
  }
}

// ============================================
// RESULTS AND FEEDBACK
// ============================================

/**
 * Add initial feedback message
 */
function addInitialFeedback() {
  DOM.feedbackMessages.innerHTML = `
        <div class="feedback-item info">
            <span class="feedback-icon material-icons-round">info</span>
            <span class="feedback-text">Configure settings and click "Start Auction" to begin the simulation.</span>
        </div>
    `;
}

/**
 * Add a feedback message
 * @param {string} type - Message type (info, success, warning, error)
 * @param {string} message - The message text
 */
function addFeedback(type, message) {
  const icons = {
    info: "info",
    success: "check_circle",
    warning: "warning",
    error: "cancel",
  };

  const item = document.createElement("div");
  item.className = `feedback-item ${type}`;
  item.innerHTML = `
        <span class="feedback-icon material-icons-round">${icons[type]}</span>
        <span class="feedback-text">${message}</span>
    `;

  DOM.feedbackMessages.insertBefore(item, DOM.feedbackMessages.firstChild);

  // Limit messages
  while (DOM.feedbackMessages.children.length > 20) {
    DOM.feedbackMessages.removeChild(DOM.feedbackMessages.lastChild);
  }
}

/**
 * Update the results summary after simulation
 */
function updateResultsSummary() {
  const bids = AppState.auction.bids;
  const enabledBidders = AppState.bidders.filter((b) => b.enabled);

  DOM.totalBidders.textContent = enabledBidders.length;
  DOM.bidsReceived.textContent = bids.filter(
    (b) => b.status !== "timeout" && b.status !== "pending",
  ).length;
  DOM.timedOut.textContent = bids.filter((b) => b.status === "timeout").length;
  DOM.belowFloor.textContent = bids.filter((b) => b.status === "floor").length;

  if (AppState.auction.winner) {
    DOM.winningBid.textContent = `$${AppState.auction.winner.convertedPrice.toFixed(2)}`;
    DOM.clearingPrice.textContent = `$${AppState.auction.clearingPrice.toFixed(2)}`;
  } else {
    DOM.winningBid.textContent = "None";
    DOM.clearingPrice.textContent = "-";
  }

  // Update results table
  DOM.resultsTableBody.innerHTML = bids
    .map((bid) => {
      const statusClass =
        bid.status === "won"
          ? "won"
          : bid.status === "lost"
            ? "lost"
            : bid.status === "timeout"
              ? "timeout"
              : bid.status === "floor"
                ? "floor"
                : "pending";

      return `
            <tr>
                <td>
                    <span style="display: inline-block; width: 8px; height: 8px; 
                          background: ${bid.bidder.color}; border-radius: 50%; margin-right: 8px;"></span>
                    ${bid.bidder.name}
                </td>
                <td>${bid.originalPrice > 0 ? `$${bid.originalPrice.toFixed(2)} ${bid.originalCurrency}` : "-"}</td>
                <td>${bid.convertedPrice > 0 ? `$${bid.convertedPrice.toFixed(2)} ${AppState.config.primaryCurrency}` : "-"}</td>
                <td><span class="status-badge ${statusClass}">${capitalizeFirst(bid.status)}</span></td>
                <td>${bid.reason || "-"}</td>
            </tr>
        `;
    })
    .join("");
}

/**
 * Update the impact analysis based on current configuration
 */
function updateImpactAnalysis() {
  const enabledBidders = AppState.bidders.filter((b) => b.enabled);
  const timeout = AppState.config.timeout;
  const floor = AppState.config.floorsEnabled ? AppState.config.floorPrice : 0;

  let impacts = [];

  // Timeout impact
  const potentialTimeouts = enabledBidders.filter(
    (b) => b.avgResponseTime + b.responseTimeVariance > timeout,
  );

  if (potentialTimeouts.length > 0) {
    impacts.push({
      icon: "timer",
      text: `Timeout of ${timeout}ms may exclude ${potentialTimeouts.length} bidder(s): ${potentialTimeouts.map((b) => b.name).join(", ")}`,
    });
  }

  // Floor impact
  if (AppState.config.floorsEnabled) {
    const potentialRejects = enabledBidders.filter(
      (b) => b.avgBidPrice - b.bidPriceVariance < floor,
    );

    if (potentialRejects.length > 0) {
      impacts.push({
        icon: "price_check",
        text: `Floor of $${floor.toFixed(2)} may filter ${potentialRejects.length} bidder(s): ${potentialRejects.map((b) => b.name).join(", ")}`,
      });
    }
  }

  // Currency impact
  if (AppState.config.currencyConversionEnabled) {
    const foreignCurrencyBidders = enabledBidders.filter(
      (b) => b.currency !== AppState.config.primaryCurrency,
    );

    if (foreignCurrencyBidders.length > 0) {
      impacts.push({
        icon: "currency_exchange",
        text: `${foreignCurrencyBidders.length} bidder(s) will need currency conversion: ${foreignCurrencyBidders.map((b) => `${b.name} (${b.currency})`).join(", ")}`,
      });
    }
  }

  // Auction type impact
  impacts.push({
    icon: "emoji_events",
    text:
      AppState.config.auctionType === "first-price"
        ? "First-price auction: Winner pays their exact bid"
        : "Second-price auction: Winner pays second-highest bid + $0.01",
  });

  // Render impacts
  if (impacts.length === 0) {
    DOM.impactAnalysis.innerHTML =
      '<p class="impact-placeholder">No significant configuration impacts detected.</p>';
  } else {
    DOM.impactAnalysis.innerHTML = impacts
      .map(
        (impact) => `
            <div class="impact-item">
                <span class="impact-icon material-icons-round">${impact.icon}</span>
                <span>${impact.text}</span>
            </div>
        `,
      )
      .join("");
  }
}

// ============================================
// TOOLTIP FUNCTIONS
// ============================================

/**
 * Show tooltip
 * @param {Event} event - Mouse event
 */
function showTooltip(event) {
  const trigger = event.target;
  const text = trigger.dataset.tooltip;

  if (!text) return;

  DOM.tooltip.textContent = text;
  DOM.tooltip.classList.add("visible");

  // Position tooltip
  const rect = trigger.getBoundingClientRect();
  const tooltipRect = DOM.tooltip.getBoundingClientRect();

  let left = rect.left + rect.width / 2 - tooltipRect.width / 2;
  let top = rect.bottom + 8;

  // Keep within viewport
  if (left < 10) left = 10;
  if (left + tooltipRect.width > window.innerWidth - 10) {
    left = window.innerWidth - tooltipRect.width - 10;
  }

  DOM.tooltip.style.left = `${left}px`;
  DOM.tooltip.style.top = `${top}px`;
}

/**
 * Hide tooltip
 */
function hideTooltip() {
  DOM.tooltip.classList.remove("visible");
}

// ============================================
// NOTIFICATION FUNCTIONS
// ============================================

/**
 * Show a notification
 * @param {string} type - Notification type (success, error, info)
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 */
function showNotification(type, title, message) {
  const icons = {
    success: "check_circle",
    error: "cancel",
    info: "info",
  };

  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.innerHTML = `
        <span class="notification-icon material-icons-round">${icons[type]}</span>
        <div class="notification-content">
            <div class="notification-title">${title}</div>
            <div class="notification-message">${message}</div>
        </div>
        <button class="notification-close">&times;</button>
    `;

  DOM.notificationContainer.appendChild(notification);

  // Auto-remove after 5 seconds
  const autoRemove = setTimeout(() => {
    removeNotification(notification);
  }, 5000);

  // Close button
  notification
    .querySelector(".notification-close")
    .addEventListener("click", () => {
      clearTimeout(autoRemove);
      removeNotification(notification);
    });
}

/**
 * Remove a notification with animation
 * @param {HTMLElement} notification - The notification element
 */
function removeNotification(notification) {
  notification.style.animation = "slideIn 0.25s ease reverse";
  setTimeout(() => {
    notification.remove();
  }, 250);
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Delay execution
 * @param {number} ms - Milliseconds to delay
 */
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Capitalize first letter
 * @param {string} str - String to capitalize
 */
function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
