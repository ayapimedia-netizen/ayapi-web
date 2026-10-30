import { getLinks, getThemeSetting, getBranches } from "@/app/actions";
import LinksClient from "@/components/LinksClient";

export const revalidate = 60;

export default async function WebAyapiLink() {
  const [linksData, themeData, branchesData] = await Promise.all([
    getLinks(),
    getThemeSetting(),
    getBranches(),
  ]);

  return (
    <LinksClient
      initialLinks={linksData}
      initialTheme={themeData}
      initialBranches={branchesData}
    />
  );
}
