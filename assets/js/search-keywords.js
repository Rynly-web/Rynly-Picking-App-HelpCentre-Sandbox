/**
 * Rynly Help Centre: alternative wording for LOCAL search.
 *
 * Each key is the URL route after "#/". These are *search hints only*:
 * they are never displayed as article text and do not create new pages.
 *
 * Add phrases a store colleague might use, e.g. "close shop" for the
 * "How do I stop on-demand orders at my store?" FAQ.
 *
 * Missing routes are harmless; search.js also indexes every title and every
 * authored article, guide and support description automatically.
 */
window.RYNLY_SEARCH_KEYWORDS = {
  "": [
    "start", "home screen", "main menu", "picking app assistance", "help centre"
  ],
  "support": [
    "phone number", "telephone", "call support", "contact us", "service desk",
    "support email", "technical help", "technical support", "marketplace helpline", "Sainsbury's on demand"
  ],
  "guides": [
    "training videos", "watch tutorials", "how to use the app", "learn to pick",
    "training library", "instructional video"
  ],
  "faq": [
    "frequently asked questions", "questions and answers", "help articles",
    "common problems", "support information"
  ],

  // How-to guides: main rows and their individual video pages.
  "guides/logging-in-getting-started": [
    "login", "log in", "sign in", "getting started", "app navigation",
    "dashboard", "history", "new colleague induction"
  ],
  "guides/picking-completing-an-order": [
    "how to pick an order", "pick items", "start picking", "complete order",
    "finish picking", "accept order", "order picking tutorial", "picking process"
  ],
  "guides/troubleshooting-common-issues": [
    "troubleshooting", "problems", "errors", "things not working",
    "fix problems", "common technical issues"
  ],
  "guides/troubleshooting-common-issues/new-order-alerts-video": [
    "notifications not ringing", "no sound when order arrives", "new orders silent",
    "alert not working", "ringtone", "alarm", "notifications troubleshooting"
  ],
  "guides/troubleshooting-common-issues/cancelling-order-by-marketplace": [
    "cancel order video", "different marketplace cancellations", "cancel just eat order",
    "cancel uber eats order", "cancel deliveroo order", "cancellation procedure"
  ],
  "guides/troubleshooting-common-issues/missing-payments": [
    "missing payment", "payment failure", "payment declined", "failed to pay",
    "chop chop payment", "payment not going through", "unpaid order"
  ],
  "guides/requesting-an-extra-courier": [
    "extra driver", "second courier", "need another rider", "additional delivery driver",
    "large order courier", "two drivers", "more than one rider"
  ],
  "guides/batch-picking-bag-scanning": [
    "pick multiple orders", "bag barcode", "batching", "scan bags",
    "pick scan pack scan", "multiple orders training"
  ],
  "guides/batch-picking-bag-scanning/bag-scanning-video": [
    "bag scanning", "scan bag", "bag labels", "pick scan pack scan",
    "pack scan", "locker scanning", "bag barcode scanning"
  ],
  "guides/batch-picking-bag-scanning/batch-picking-video": [
    "batch pick", "multi picking", "pick several orders", "all tab",
    "multiple deliveries at once", "combined picking"
  ],
  "guides/substitutions-deep-dive": [
    "substitute item", "replace item", "unavailable item", "out of stock",
    "replacement", "customer substitution", "subs training"
  ],
  "guides/in-store-barcode-scanning": [
    "barcode", "scan product", "pack order", "item scanning",
    "in store scanning", "packing training", "barcode scanner"
  ],

  // FAQ article pages. Change these without editing or displaying article copy.
  "faq/identify-order": [
    "which marketplace", "which platform sent the order", "order origin",
    "recognise deliveroo", "identify uber eats", "just eat order", "order channel"
  ],
  "faq/cancel-order": [
    "cancel an order", "stop a single order", "customer cancellation",
    "order cancelled", "refund cancel", "how to cancel", "order cancellation"
  ],
  "faq/batch-picking-faq": [
    "pick two orders", "pick multiple orders", "batch picking",
    "multi pick", "all tab", "picking together"
  ],
  "faq/pick-scan-pack-scan": [
    "bag scan", "scanning bags", "pick scan pack scan",
    "scan at packing", "scan a bag", "packing barcode"
  ],
  "faq/stuck-order": [
    "stuck order", "old order", "hanging order", "pending order",
    "order won't disappear", "clear old order", "order not finishing"
  ],
  "faq/chop-chop-payment-failure": [
    "chop chop payment error", "card declined", "payment unsuccessful",
    "chop chop checkout", "order not paid", "payment processing failure"
  ],
  "faq/take-store-offline": [
    "close", "closure", "clousure", "close store", "closing the shop",
    "temporarily close store", "store closure", "shut store", "shut shop",
    "pause orders", "stop receiving orders", "stop online orders",
    "disable orders", "suspend deliveries", "switch off deliveries",
    "turn off on demand", "take store offline", "store unavailable",
    "stop taking orders", "pause just eat", "pause uber eats",
    "pause deliveroo", "online store closed", "on demand contingency"
  ],
  "faq/new-order-alerts": [
    "new order not ringing", "silent alerts", "notification not sounding",
    "device sound", "alarm off", "no order notifications", "incoming order alerts"
  ],
  "faq/find-signed-in-account": [
    "which account is logged in", "logged in as", "account email",
    "picker login", "user signed in", "check active account", "user profile"
  ],
  "faq/extra-driver": [
    "request more drivers", "additional courier", "extra rider",
    "need two drivers", "large delivery", "another driver for order"
  ],
  "faq/complete-picking-guide": [
    "all slides", "full manual", "complete guide", "41 slides",
    "picking documentation", "long picking guide", "training slides"
  ],
  "faq/contact-support-faq": [
    "how to contact support", "support numbers", "help desk",
    "contact partner", "technical support", "who do I call"
  ]
};
