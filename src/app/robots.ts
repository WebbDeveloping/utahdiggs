import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/account/", "/crm/", "/admin/", "/offer/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
