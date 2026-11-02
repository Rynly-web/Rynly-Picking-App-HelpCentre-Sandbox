/* Rynly Help Centre – per-video presentation settings.
 * Edit this file to control orientation and reuse screenshots from FAQ articles.
 * These settings do not change video URLs in content.js.
 *
 * orientation: "landscape" (16:9) or "portrait" (9:16).
 * supportingFaqImage: stable FAQ ID containing the PNG to reuse.
 * supportingFaqImageIndex: 0 = first image in that FAQ, 1 = second, etc.
 *
 * Example for another portrait video:
 * "bag-scanning-video": { orientation: "portrait" }
 */
window.RYNLY_MEDIA_SETTINGS = {
    "new-order-alerts-video": {
        orientation: "portrait",
        supportingFaqImage: "new-order-alerts",
        supportingFaqImageIndex: 0
    }
};
