import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// No incremental cache binding yet: the app has no ISR pages that need one.
export default defineCloudflareConfig();
