import type { Metadata } from "next";
import Link from "next/link";
import { AdminPageHead } from "@/components/admin/admin-shell";
import { FabricEditor } from "@/components/admin/fabric-editor";
import { getFabricContent } from "@/lib/fabric";

export const metadata: Metadata = { title: "Fabric page" };

export default async function FabricAdminPage() {
  const content = await getFabricContent();

  return (
    <>
      <AdminPageHead
        eyebrow="Catalogue"
        title="Fabric page"
        lede="The fabric points and the sizing table. Changes show on the home page band and /fabric the moment this saves."
        actions={
          <Link
            href="/fabric"
            className="label border border-ink px-4 py-3 transition-colors hover:bg-ink hover:text-bone"
          >
            View on store ↗
          </Link>
        }
      />

      <div className="px-5 py-8 md:px-9">
        <FabricEditor initial={content} />
      </div>
    </>
  );
}
