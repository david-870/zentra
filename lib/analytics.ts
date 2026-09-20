export const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || "G-YXNPLPL3RF";

export const googleTagSnippet = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('consent', 'default', {
  analytics_storage: 'granted',
  functionality_storage: 'granted',
  security_storage: 'granted',
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied'
});
gtag('js', new Date());
gtag('config', '${GA_ID}', { anonymize_ip: true, send_page_view: true });
`.replace(/\s+/g, " ").trim();
