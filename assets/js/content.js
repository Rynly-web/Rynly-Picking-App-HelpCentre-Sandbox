/**
 * EDIT CONTENT HERE. No framework or build step needed.
 * Each guide and FAQ has a stable ID used in bookmarkable URLs; avoid changing IDs once live.
 * Placeholders intentionally remain until approved videos/PDFs/images are supplied.
 * See the setup instructions supplied with this ZIP for file placement.
 */
window.RYNLY_CONTENT = {
  // IMPORTANT: Transcribed from the old Help Centre, not independently verified.
  // Confirm all phone numbers, scope and ownership before publishing to production.
  support: [
    {id:"just-eat",name:"Just Eat",phone:"0208 736 2000",description:"Just Eat order and courier support"},
    {id:"uber-eats",name:"Uber Eats",phone:"0808 178 5518",description:"Uber Eats orders, couriers and store availability"},
    {id:"deliveroo",name:"Deliveroo",phone:"020 3699 9977",description:"Deliveroo order and courier support"},
    {id:"chop-chop",name:"Chop Chop",phone:"0333 070 3602",description:"Chop Chop order support"},
    {id:"js-tech",name:"JS Tech Service Desk",phone:"0345 603 2638",description:"Store device, network and technical support"}
  ],

  // To add a video, change video.type to "local", "youtube", or "vimeo".
  // For MP4: video: {type:"local", src:"assets/videos/picking-an-order.mp4", poster:"assets/images/posters/picking-an-order.jpg"}
  // For YouTube: video: {type:"youtube", id:"YOUR_VIDEO_ID"}
  // For Vimeo: video: {type:"vimeo", id:"YOUR_NUMERIC_VIDEO_ID"}
  // To add a slide PDF, set pdf.src = "assets/pdf/picking-an-order.pdf".
  guides: [
    {
      id:"getting-started",title:"Getting started",description:"Getting familiar with the picking app and its main screens.",
      duration:"Introduction",icon:"device",video:{type:"none"},pdf:{src:"",filename:"getting-started.pdf"},
      videoText:"Add a short explanation of this video here.",
      relatedFaq:["identify-order","find-signed-in-account"]
    },
    {
      id:"picking-an-order",title:"How to pick an order",description:"Follow the picking journey from accepting an order to handoff.",
      duration:"Picking basics",icon:"bag",video:{type:"none"},pdf:{src:"",filename:"picking-an-order.pdf"},
      videoText:"Add a short explanation of this video here.",
      relatedFaq:["identify-order","cancel-order"]
    },
    {
      id:"substitutions",title:"Substitutions & unavailable items",description:"Understand replacements and handling items that cannot be picked.",
      duration:"Picking basics",icon:"refresh",video:{type:"none"},pdf:{src:"",filename:"substitutions.pdf"},
      videoText:"Add a short explanation of this video here.",
      relatedFaq:["identify-order","stuck-order"]
    },
    {
      id:"batch-picking",title:"Batch picking",description:"Pick several orders together while keeping them correctly separated.",
      duration:"Advanced picking",icon:"list",video:{type:"none"},pdf:{src:"",filename:"batch-picking.pdf"},
      videoText:"Add a short explanation of this video here.",
      relatedFaq:["batch-picking-faq","pick-scan-pack-scan"]
    },
    {
      id:"bag-scanning",title:"Pick scan / pack scan",description:"Scan products and bags on stores where scanning is enabled.",
      duration:"Advanced picking",icon:"bag",video:{type:"none"},pdf:{src:"",filename:"bag-scanning.pdf"},
      videoText:"Add a short explanation of this video here.",
      relatedFaq:["pick-scan-pack-scan"]
    },
    {
      id:"managing-orders",title:"Managing an order",description:"View details, handle changes and complete orders correctly.",
      duration:"Order management",icon:"list",video:{type:"none"},pdf:{src:"",filename:"managing-orders.pdf"},
      videoText:"Add a short explanation of this video here.",
      relatedFaq:["cancel-order","stuck-order","take-store-offline"]
    },
    {
      id:"courier-handoff",title:"Courier handoff & extra drivers",description:"Understand handoff and what to do when more courier capacity is needed.",
      duration:"Order management",icon:"headset",video:{type:"none"},pdf:{src:"",filename:"courier-handoff.pdf"},
      videoText:"Add a short explanation of this video here.",
      relatedFaq:["extra-driver","identify-order"]
    },
    {
      id:"resolving-issues",title:"Resolving common issues",description:"Handle errors, stuck orders and device difficulties.",
      duration:"Troubleshooting",icon:"alert",video:{type:"none"},pdf:{src:"",filename:"resolving-issues.pdf"},
      videoText:"Add a short explanation of this video here.",
      relatedFaq:["stuck-order","chop-chop-payment-failure","new-order-alerts"]
    }
  ],

  faqCategories: [
    {id:"order-management",title:"Orders & picking",description:"Identifying, picking, cancelling and completing orders.",icon:"bag"},
    {id:"substitutions-scanning",title:"Substitutions & scanning",description:"Batch picking, bag scanning and unavailable items.",icon:"refresh"},
    {id:"managing-issues",title:"Managing issues",description:"Stuck orders, payment failures and taking a store offline.",icon:"alert"},
    {id:"devices-alerts",title:"Devices & notifications",description:"Device alerts, ringing and troubleshooting.",icon:"device"},
    {id:"accounts-settings",title:"Accounts & settings",description:"Find device account details and settings.",icon:"list"},
    {id:"delivery-support",title:"Couriers & support",description:"Request extra drivers and contact the right support team.",icon:"headset"}
  ],

  /**
   * FAQ blocks: {type:"paragraph",text:"..."}, {type:"list",items:["..."]},
   * {type:"notice",title:"...",text:"..."}, {type:"image",src:"assets/images/faq/FAQ1.png",alt:"..."},
   * {type:"link",label:"...",url:"https://..."}, {type:"heading",text:"..."}.
   * Each FAQ has slide:{src:""}. Add a PDF at assets/pdf/name.pdf, or
   * an image at assets/images/slides/name.png. Empty src shows a placeholder.
   * relatedFaq:["other-question-id"] controls links under "Related questions".
   * relatedGuides:["guide-id"] controls links under "Related how-to guides".
   * Missing optional images show a labelled placeholder automatically; no broken image icons.
   */
  faqs: [
    {id:"identify-order",slide:{src:""},relatedFaq:["cancel-order", "contact-support-faq"],category:"order-management",title:"How do I identify which marketplace an order came from?",blocks:[
      {type:"paragraph",text:"The order channel is shown on the Rynly Picking App home screen. Check whether the order is from Just Eat, Uber Eats, Deliveroo or Chop Chop before taking further action."},
      {type:"paragraph",text:"This matters because substitutions, extra-driver requests and other order actions can work differently for each channel."},
      {type:"image",src:"assets/images/faq/FAQ1.png",alt:"Order identifiers on the Rynly picking app home screen"}
    ],relatedGuides:["getting-started","picking-an-order"]},

    {id:"cancel-order",slide:{src:""},relatedFaq:["stuck-order", "contact-support-faq"],category:"order-management",title:"How can I cancel an order?",blocks:[
      {type:"paragraph",text:"Cancellation steps vary by marketplace and order state. Follow the current approved procedure for the channel shown on the order."},
      {type:"image",src:"assets/images/faq/FAQ9.png",alt:"Original Rynly instructions for cancelling an order"},
      {type:"notice",title:"Need assistance?",text:"Use Contact support to find the relevant marketplace support line. Do not assume the same cancellation workflow applies to every channel."}
    ],relatedGuides:["managing-orders"]},

    {id:"batch-picking-faq",slide:{src:""},relatedFaq:["pick-scan-pack-scan"],category:"substitutions-scanning",title:"How can I pick multiple orders at the same time?",blocks:[
      {type:"paragraph",text:"Batch picking lets eligible orders be picked together. The original Help Centre included a three-slide walkthrough; the screenshots can be restored below."},
      {type:"image",src:"assets/images/faq/FAQ14.png",alt:"Batch picking instructions - slide 1"},
      {type:"image",src:"assets/images/faq/FAQ15.png",alt:"Batch picking instructions - slide 2"},
      {type:"image",src:"assets/images/faq/FAQ16.png",alt:"Batch picking instructions - slide 3"},
      {type:"notice",title:"Before publishing",text:"Review these slides against the latest batch-picking functionality and configuration."}
    ],relatedGuides:["batch-picking"]},

    {id:"pick-scan-pack-scan",slide:{src:""},relatedFaq:["batch-picking-faq"],category:"substitutions-scanning",title:"How do I use pick scan / pack scan?",blocks:[
      {type:"notice",title:"Selected stores only",text:"This functionality only applies to stores where pick scan / pack scan has been enabled."},
      {type:"paragraph",text:"The original Help Centre explains this process through the following slides. Restore and review the latest versions before production release."},
      {type:"image",src:"assets/images/faq/FAQ6.png",alt:"Pick scan pack scan instructions - slide 1"},
      {type:"image",src:"assets/images/faq/FAQ7.png",alt:"Pick scan pack scan instructions - slide 2"}
    ],relatedGuides:["bag-scanning"]},

    {id:"stuck-order",slide:{src:""},relatedFaq:["cancel-order", "chop-chop-payment-failure"],category:"managing-issues",title:"How do I clear an old or stuck order?",blocks:[
      {type:"paragraph",text:"Select the affected order using the picking account assigned to it. Follow the on-screen guidance; all items should have an appropriate picked, unavailable or substituted state before the order is completed."},
      {type:"image",src:"assets/images/faq/FAQ8.png",alt:"Original example of resolving a hanging order"},
      {type:"notice",title:"If the order remains stuck",text:"Contact the relevant support team rather than repeatedly changing the order status without guidance."}
    ],relatedGuides:["resolving-issues","managing-orders"]},

    {id:"chop-chop-payment-failure",slide:{src:""},relatedFaq:["stuck-order", "contact-support-faq"],category:"managing-issues",title:"What should I do with a Chop Chop payment failure?",blocks:[
      {type:"paragraph",text:"Follow the payment-failure procedure for Chop Chop orders. The illustrated process from the previous Help Centre is reserved below."},
      {type:"image",src:"assets/images/faq/FAQ18.png",alt:"Chop Chop payment failure instructions"},
      {type:"notice",title:"Procedure review required",text:"Confirm the current payment failure handling process with the responsible operational team before relying on this guide."}
    ],relatedGuides:["resolving-issues"]},

    {id:"take-store-offline",slide:{src:""},relatedFaq:["contact-support-faq", "new-order-alerts"],category:"managing-issues",title:"How do I stop on-demand orders at my store?",blocks:[
      {type:"paragraph",text:"Follow your store's approved on-demand contingency procedure for the affected services."},
      {type:"link",label:"Open Sainsbury's on-demand contingency procedure (requires access)",url:"https://jsainsbury.sharepoint.com/:w:/r/sites/DocCentre/Retail-Procedures/_layouts/15/Doc.aspx?sourcedoc=%7BE4D2EC1A-CB7B-45F6-A1DE-2C70D4E3E12A%7D&file=OnDemand_Contingency%20Procedure.docx&action=default&mobileredirect=true"},
      {type:"paragraph",text:"The previous Help Centre directs stores to the Just Eat and Deliveroo support lines where required, and to the JS Tech Service Desk for Chop Chop. For Uber Eats, it describes using the 'Take Store Offline' option in the Rynly app."},
      {type:"image",src:"assets/images/faq/FAQ12.png",alt:"Uber Eats Take Store Offline menu"},
      {type:"notice",title:"Important",text:"The Rynly support team cannot take a store offline from on-demand orders. Contact the appropriate marketplace support line or follow the approved contingency procedure."}
    ],relatedGuides:["resolving-issues"]},

    {id:"new-order-alerts",slide:{src:""},relatedFaq:["find-signed-in-account", "contact-support-faq"],category:"devices-alerts",title:"How can I keep new-order alerts ringing?",blocks:[
      {type:"paragraph",text:"The previous Help Centre recommends the following checks when device alerts are not ringing:"},
      {type:"list",items:[
        "Check that both the handset and app volumes are set appropriately.",
        "Keep the Rynly app open or running as required by the device configuration.",
        "Do not force-close the app by swiping it away.",
        "Check that the 'Rynly Hub Alerts Enabled' indication appears as expected on the device."
      ]},
      {type:"image",src:"assets/images/faq/FAQ2.png",alt:"Device alerts enabled example"},
      {type:"notice",title:"Still not receiving alerts?",text:"Report the device and store details to the JS Tech Service Desk using the Contact support page."}
    ],relatedGuides:["resolving-issues"]},

    {id:"find-signed-in-account",slide:{src:""},relatedFaq:["new-order-alerts"],category:"accounts-settings",title:"How can I see which account is signed in on a device?",blocks:[
      {type:"paragraph",text:"Open the account or settings area of the Rynly Picking App to check which picker account is active on the device."},
      {type:"image",src:"assets/images/faq/FAQ10.png",alt:"Rynly account settings and signed-in user"}
    ],relatedGuides:["getting-started"]},

    {id:"extra-driver",slide:{src:""},relatedFaq:["contact-support-faq", "identify-order"],category:"delivery-support",title:"How do I request an extra driver for a large order?",blocks:[
      {type:"paragraph",text:"The previous Help Centre states that the process differs by marketplace. Confirm the current policy before requesting additional courier capacity."},
      {type:"heading",text:"Just Eat"},
      {type:"paragraph",text:"For large orders, an extra courier may be requested automatically, with Just Eat contacting the store. If a second courier does not arrive, contact Just Eat support."},
      {type:"heading",text:"Deliveroo"},
      {type:"paragraph",text:"Contact Deliveroo support for assistance."},
      {type:"heading",text:"Uber Eats"},
      {type:"paragraph",text:"Follow the marketplace-specific workflow illustrated in the original guidance."},
      {type:"image",src:"assets/images/faq/FAQ4.png",alt:"Uber Eats request-extra-driver guidance"},
      {type:"heading",text:"Chop Chop"},
      {type:"paragraph",text:"The old procedure describes requesting an additional driver after the original courier request becomes eligible. Verify the current trigger before using this process."},
      {type:"image",src:"assets/images/faq/FAQ5.png",alt:"Chop Chop request-extra-driver guidance"},
      {type:"notice",title:"Who should I call?",text:"Use Contact support to see the latest published partner numbers."}
    ],relatedGuides:["courier-handoff"]},

    {id:"contact-support-faq",slide:{src:""},relatedFaq:["extra-driver", "take-store-offline"],category:"delivery-support",title:"How do I contact support?",blocks:[
      {type:"paragraph",text:"Choose the support team that matches your issue and marketplace. The Contact support page lists the numbers for Just Eat, Uber Eats, Deliveroo, Chop Chop and the JS Tech Service Desk."},
      {type:"notice",title:"Extra drivers or store availability",text:"For these requests, contact the dedicated marketplace support line rather than assuming Rynly can make the change."}
    ],relatedGuides:[],supportLink:true}
  ]
};
