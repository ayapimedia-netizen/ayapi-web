export const revalidate = 60;

import { getMenuItems, getBranches, getCategories, getAllSiteSettings } from "@/app/actions";
import MenuClient from "@/components/MenuClient";

export default async function MenuPage() {
  const [items, branchList, categoriesList, siteSettings] = await Promise.all([
    getMenuItems().catch(() => []),
    getBranches().catch(() => []),
    getCategories().catch(() => []),
    getAllSiteSettings().catch((): Record<string, string> => ({})),
  ]);

  return (
    <MenuClient
      initialMenuItems={items || []}
      initialBranches={branchList || []}
      initialCategories={categoriesList || []}
      waNumber={siteSettings.wa_number}
    />
  );
}
