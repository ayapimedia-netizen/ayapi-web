export const revalidate = 60;

import { getBranches, getAllSiteSettings } from "@/app/actions";
import KontakClient from "@/components/KontakClient";

export default async function KontakPage() {
  const [branchList, settingsData] = await Promise.all([
    getBranches().catch(() => []),
    getAllSiteSettings().catch((): Record<string, string> => ({})),
  ]);

  return (
    <KontakClient
      initialBranches={branchList || []}
      siteSettings={settingsData || {}}
    />
  );
}
