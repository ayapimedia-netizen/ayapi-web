export const dynamic = "force-dynamic";

import {
  getPartnershipPackages,
  getFaqs,
  getAllSiteSettings,
  getTestimonials,
} from "@/app/actions";
import KemitraanClient from "@/components/KemitraanClient";

export default async function KemitraanPage() {
  const [pkgs, faqsData, settingsData, reviews] = await Promise.all([
    getPartnershipPackages().catch(() => []),
    getFaqs().catch(() => []),
    getAllSiteSettings().catch(() => ({})),
    getTestimonials().catch(() => []),
  ]);

  return (
    <KemitraanClient
      initialPackages={pkgs || []}
      initialFaqs={faqsData || []}
      initialTestimonials={reviews || []}
      initialSiteSettings={settingsData || {}}
    />
  );
}
