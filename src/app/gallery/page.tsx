export const revalidate = 60;

import { getGalleryItems, getAllSiteSettings } from "@/app/actions";
import GalleryClient from "@/components/GalleryClient";

export default async function GalleryPage() {
  const [items, siteSettings] = await Promise.all([
    getGalleryItems().catch(() => []),
    getAllSiteSettings().catch((): Record<string, string> => ({})),
  ]);

  return <GalleryClient initialItems={items || []} waNumber={siteSettings.wa_number} />;
}
