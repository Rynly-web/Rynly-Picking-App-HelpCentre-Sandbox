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
        {id:"just-eat",name:"Just Eat",phone:"0208 736 2000"},
        {id:"uber-eats",name:"Uber Eats",phone:"0808 178 5518"},
        {id:"deliveroo",name:"Deliveroo",phone:"020 3699 9977"},
        {id:"chop-chop",name:"Chop Chop",phone:"0333 070 3602"},
        {id:"js-tech",name:"JS Tech Service Desk",phone:"0345 603 2638"}
    ],

    // Seven top-level guide rows, in the order requested by the support team.
    // Two rows offer a choice of video; each child has its own video URL and PDF.
    // Unpublished videos use {type:"none"}. Insert a real video when it is ready.
    // Supported embeds: {type:"youtube",id:"VIDEO_ID"},
    // {type:"vimeo",id:"VIDEO_ID",hash:"OPTIONAL_UNLISTED_HASH"},
    // or {type:"local",src:"assets/videos/name.mp4"}.
    guides: [
        {
            id:"logging-in-getting-started", title:"Logging in & getting started",
            description:"Navigate the picking dashboard, deliveries, order history and help.",
            icon:"device", video:{type:"none"}, pdf:{src:"",filename:"logging-in-getting-started.pdf"},
            videoText:"Learn where to find the main sections of the Rynly Picking App.",
            topics:["Logging in and getting started", "Main dashboard and available orders", "Deliveries and order history", "Finding Help Centre"],
            relatedFaq:["find-signed-in-account","identify-order"]
        },
        {
            id:"picking-completing-an-order", title:"Pick an order",
            description:"Accept an order, pick the items and complete the picking process.",
            icon:"bag", video:{type:"none"}, pdf:{src:"",filename:"picking-an-order.pdf"},
            videoText:"A walkthrough of picking an order, including the steps before completion.",
            topics:["Accepting an order", "Scanning and manual item selection", "Unavailable items and substitutions", "Reviewing order details and completing the order"],
            relatedFaq:["identify-order","stuck-order"]
        },
        {
            id:"troubleshooting-common-issues", title:"Common issues",
            description:"Choose a problem to watch its troubleshooting video.",
            icon:"alert",
            videos:[
                {
                    id:"new-order-alerts-video", title:"How to troubleshoot new order alerts",
                    description:"Check the device and app when new-order notifications are not sounding.",
                    icon:"bell", video:{type:"vimeo", id:"1242425189" }, pdf:{src:"",filename:"new-order-alerts.pdf"},
                    videoText:"Troubleshooting the alert settings and device behaviour for incoming orders.",
                    topics:["Device sound settings", "Keeping the picking app active", "Checking order alert status"],
                    relatedFaq:["new-order-alerts","find-signed-in-account"]
                },
                {
                    id:"cancelling-order-by-marketplace", title:"How to cancel an order — by marketplace",
                    description:"Understand different cancellation processes for each marketplace.",
                    icon:"x-circle", video:{type:"none"}, pdf:{src:"",filename:"cancelling-an-order.pdf"},
                    videoText:"How order cancellation steps differ across marketplace partners.",
                    topics:["Identifying the order marketplace", "Marketplace-specific cancellation procedures", "Where to get partner support"],
                    relatedFaq:["cancel-order","identify-order","contact-support-faq"]
                },
                {
                    id:"missing-payments", title:"Missing payments",
                    description:"Recognise a missing or failed payment and find the correct support process.",
                    icon:"credit-card", video:{type:"none"}, pdf:{src:"",filename:"missing-payments.pdf"},
                    videoText:"The steps to investigate a missing or failed payment during an on-demand order.",
                    topics:["Identifying a payment problem", "Checking the relevant order", "When to escalate for support"],
                    relatedFaq:["chop-chop-payment-failure","contact-support-faq"]
                }
            ]
        },
        {
            id:"requesting-an-extra-courier", title:"Requesting an extra courier",
            description:"Learn how to request courier assistance for large orders.",
            icon:"truck", video:{type:"none"}, pdf:{src:"",filename:"requesting-an-extra-courier.pdf"},
            videoText:"How to request another courier or contact the partner team when required.",
            topics:["Chop Chop and Uber Eats extra-courier requests", "Contacting other marketplace partners"],
            relatedFaq:["extra-driver","contact-support-faq"]
        },
        {
            id:"batch-picking-bag-scanning", title:"Batching + bag scanning",
            description:"Choose the batch picking or bag scanning video.",
            icon:"layers",
            videos:[
                {
                    id:"bag-scanning-video", title:"Bag scanning",
                    description:"Pick scan / pack scan and keeping bags assigned to the correct order.",
                    icon:"scan", video:{type:"none"}, pdf:{src:"",filename:"bag-scanning.pdf"},
                    videoText:"How to use bag scanning when it is enabled at your store.",
                    topics:["Pick scan / pack scan", "Assigning bags to the correct order", "Locker order staging where available"],
                    relatedFaq:["pick-scan-pack-scan","batch-picking-faq"]
                },
                {
                    id:"batch-picking-video", title:"Batch picking",
                    description:"Pick multiple orders together while keeping items separated.",
                    icon:"layers", video:{type:"none"}, pdf:{src:"",filename:"batch-picking.pdf"},
                    videoText:"Using the ALL tab to work efficiently across more than one order.",
                    topics:["Finding orders in the ALL tab", "Picking multiple orders in one run", "Keeping items allocated to their own order"],
                    relatedFaq:["batch-picking-faq","pick-scan-pack-scan"]
                }
            ]
        },
        {
            id:"substitutions-deep-dive", title:"Substitutions",
            description:"Handle replacements and unavailable items across marketplaces.",
            icon:"refresh", video:{type:"none"}, pdf:{src:"",filename:"substitutions.pdf"},
            videoText:"How to handle substitutions and unavailability during picking.",
            topics:["Marketplace-specific substitution processes", "Selecting suitable replacements", "When items should be marked unavailable"],
            relatedFaq:["pick-scan-pack-scan","identify-order"]
        },
        {
            id:"in-store-barcode-scanning", title:"In-store barcode scanning & packing an order",
            description:"Scan items in store and prepare the completed order for handoff.",
            icon:"scan", video:{type:"none"}, pdf:{src:"",filename:"barcode-scanning-and-packing.pdf"},
            videoText:"A practical demonstration of scanning and packing items at store level.",
            topics:["Scanning item barcodes", "Checking picked items", "Packing the order for handoff"],
            relatedFaq:["pick-scan-pack-scan","batch-picking-faq"]
        }
    ],

    // FAQ articles form a single list on screen. "category" is retained only
    // to recognise old bookmarked URLs from before the simplified navigation.

    /**
     * FAQ blocks: {type:"paragraph",text:"..."}, {type:"list",items:["..."]},
     * {type:"notice",title:"...",text:"..."}, {type:"image",src:"assets/images/faq/FAQ1.png",alt:"..."},
     * {type:"link",label:"...",url:"https://..."}, {type:"heading",text:"..."}.
     * Each FAQ has slide:{src:""}. Add a PDF at assets/pdf/name.pdf, or
     * an image at assets/images/slides/name.png. Empty src shows a placeholder
     * only when the article has no existing screenshots.
     * relatedGuides:["video-id"] controls links directly to single or nested videos.
     * Guide relatedFaq entries link from a video back to individual FAQs.
     * Missing optional images show a labelled placeholder automatically; no broken image icons.
     */
    faqs: [
        {id:"identify-order",slide:{src:""},icon:"tag",category:"order-management",title:"How do I identify which marketplace an order came from?",blocks:[
                {type:"paragraph",text:"The order channel is shown on the Rynly Picking App home screen. Check whether the order is from Just Eat, Uber Eats, Deliveroo or Chop Chop before taking further action."},
                {type:"paragraph",text:"This matters because substitutions, extra-driver requests and other order actions can work differently for each channel."},
                {type:"image",src:"assets/images/faq/FAQ1.png",alt:"Order identifiers on the Rynly picking app home screen"}
            ],relatedGuides:["logging-in-getting-started","picking-completing-an-order"]},

        {id:"cancel-order",slide:{src:""},icon:"x-circle",category:"order-management",title:"How can I cancel an order?",blocks:[
                {type:"paragraph",text:"Cancellation steps vary by marketplace and order state. Follow the current approved procedure for the channel shown on the order."},
                {type:"image",src:"assets/images/faq/FAQ9.png",alt:"Original Rynly instructions for cancelling an order"},
                {type:"notice",title:"Need assistance?",text:"Use Contact support to find the relevant marketplace support line. Do not assume the same cancellation workflow applies to every channel."}
            ],relatedGuides:["cancelling-order-by-marketplace"]},

        {id:"batch-picking-faq",slide:{src:""},icon:"layers",category:"substitutions-scanning",title:"How can I pick multiple orders at the same time?",blocks:[
                {type:"paragraph",text:"Batch picking lets eligible orders be picked together. The original Help Centre included a three-slide walkthrough; the screenshots can be restored below."},
                {type:"image",src:"assets/images/faq/FAQ14.png",alt:"Batch picking instructions - slide 1"},
                {type:"image",src:"assets/images/faq/FAQ15.png",alt:"Batch picking instructions - slide 2"},
                {type:"image",src:"assets/images/faq/FAQ16.png",alt:"Batch picking instructions - slide 3"},
                {type:"notice",title:"Before publishing",text:"Review these slides against the latest batch-picking functionality and configuration."}
            ],relatedGuides:["batch-picking-video"]},

        {id:"pick-scan-pack-scan",slide:{src:""},icon:"scan",category:"substitutions-scanning",title:"How do I use pick scan / pack scan?",blocks:[
                {type:"notice",title:"Selected stores only",text:"This functionality only applies to stores where pick scan / pack scan has been enabled."},
                {type:"paragraph",text:"The original Help Centre explains this process through the following slides. Restore and review the latest versions before production release."},
                {type:"image",src:"assets/images/faq/FAQ6.png",alt:"Pick scan pack scan instructions - slide 1"},
                {type:"image",src:"assets/images/faq/FAQ7.png",alt:"Pick scan pack scan instructions - slide 2"}
            ],relatedGuides:["bag-scanning-video","in-store-barcode-scanning"]},

        {id:"stuck-order",slide:{src:""},icon:"clock",category:"managing-issues",title:"How do I clear an old or stuck order?",blocks:[
                {type:"paragraph",text:"Select the affected order using the picking account assigned to it. Follow the on-screen guidance; all items should have an appropriate picked, unavailable or substituted state before the order is completed."},
                {type:"image",src:"assets/images/faq/FAQ8.png",alt:"Original example of resolving a hanging order"},
                {type:"notice",title:"If the order remains stuck",text:"Contact the relevant support team rather than repeatedly changing the order status without guidance."}
            ],relatedGuides:["picking-completing-an-order"]},

        {id:"chop-chop-payment-failure",slide:{src:""},icon:"credit-card",category:"managing-issues",title:"What should I do with a Chop Chop payment failure?",blocks:[
                {type:"paragraph",text:"Follow the payment-failure procedure for Chop Chop orders. The illustrated process from the previous Help Centre is reserved below."},
                {type:"image",src:"assets/images/faq/FAQ18.png",alt:"Chop Chop payment failure instructions"},
                {type:"notice",title:"Procedure review required",text:"Confirm the current payment failure handling process with the responsible operational team before relying on this guide."}
            ],relatedGuides:["missing-payments"]},

        {id:"take-store-offline",slide:{src:""},icon:"power",category:"managing-issues",title:"How do I stop on-demand orders at my store?",blocks:[
                {type:"paragraph",text:"Follow your store's approved on-demand contingency procedure for the affected services."},
                {type:"link",label:"Open Sainsbury's on-demand contingency procedure (requires access)",url:"https://jsainsbury.sharepoint.com/:w:/r/sites/DocCentre/Retail-Procedures/_layouts/15/Doc.aspx?sourcedoc=%7BE4D2EC1A-CB7B-45F6-A1DE-2C70D4E3E12A%7D&file=OnDemand_Contingency%20Procedure.docx&action=default&mobileredirect=true"},
                {type:"paragraph",text:"The previous Help Centre directs stores to the Just Eat and Deliveroo support lines where required, and to the JS Tech Service Desk for Chop Chop. For Uber Eats, it describes using the 'Take Store Offline' option in the Rynly app."},
                {type:"image",src:"assets/images/faq/FAQ12.png",alt:"Uber Eats Take Store Offline menu"},
                {type:"notice",title:"Important",text:"The Rynly support team cannot take a store offline from on-demand orders. Contact the appropriate marketplace support line or follow the approved contingency procedure."}
            ],relatedGuides:[]},

        {id:"new-order-alerts",slide:{src:""},icon:"bell",category:"devices-alerts",title:"How can I keep new-order alerts ringing?",blocks:[
                {type:"paragraph",text:"The previous Help Centre recommends the following checks when device alerts are not ringing:"},
                {type:"list",items:[
                        "Check that both the handset and app volumes are set appropriately.",
                        "Keep the Rynly app open or running as required by the device configuration.",
                        "Do not force-close the app by swiping it away.",
                        "Check that the 'Rynly Hub Alerts Enabled' indication appears as expected on the device."
                    ]},
                {type:"image",src:"assets/images/faq/FAQ2.png",alt:"Device alerts enabled example"},
                {type:"notice",title:"Still not receiving alerts?",text:"Report the device and store details to the JS Tech Service Desk using the Contact support page."}
            ],relatedGuides:["new-order-alerts-video"]},

        {id:"find-signed-in-account",slide:{src:""},icon:"user",category:"accounts-settings",title:"How can I see which account is signed in on a device?",blocks:[
                {type:"paragraph",text:"Open the account or settings area of the Rynly Picking App to check which picker account is active on the device."},
                {type:"image",src:"assets/images/faq/FAQ10.png",alt:"Rynly account settings and signed-in user"}
            ],relatedGuides:["logging-in-getting-started"]},

        {id:"extra-driver",slide:{src:""},icon:"truck",category:"delivery-support",title:"How do I request an extra driver for a large order?",blocks:[
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
            ],relatedGuides:["requesting-an-extra-courier"]},

        // The original 41-slide picking reference guide (Slide 2 was deliberately omitted).
        // Images use their original names in images/Picking/ and open in the existing
        // pinch-to-zoom image viewer. This is a standalone FAQ resource, not a video.
        {id:"complete-picking-guide",slide:{src:""},icon:"book",category:"delivery-support",
            title:"Full picking app guide (41 slides)",
            slideDeck:{first:1,last:42,skip:[2]},
            blocks:[],relatedGuides:[]},

        {id:"contact-support-faq",slide:{src:""},icon:"headset",category:"delivery-support",title:"How do I contact support?",blocks:[
                {type:"paragraph",text:"Choose the support team that matches your issue and marketplace. The Contact support page lists the numbers for Just Eat, Uber Eats, Deliveroo, Chop Chop and the JS Tech Service Desk."},
                {type:"notice",title:"Extra drivers or store availability",text:"For these requests, contact the dedicated marketplace support line."}
            ],relatedGuides:["requesting-an-extra-courier","cancelling-order-by-marketplace"],supportLink:true}
    ]
};
