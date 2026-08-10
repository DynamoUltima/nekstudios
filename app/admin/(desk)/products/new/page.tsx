import type { Metadata } from "next";
import Link from "next/link";
import { AdminPageHead } from "@/components/admin/admin-shell";
import { NewProductForm } from "@/components/admin/new-product-form";

export const metadata: Metadata = { title: "New piece" };

export default function NewProductPage() {
  return (
    <>
      <AdminPageHead
        eyebrow={
          <Link href="/admin/products" className="transition-colors hover:text-ink">
            Pieces
          </Link>
        }
        title="New piece"
        lede="Photography, spec and the run. It is on the storefront the moment this saves."
        actions={
          <Link
            href="/admin/products"
            className="label border border-line px-4 py-3 text-ash transition-colors hover:border-ink hover:text-ink"
          >
            Cancel
          </Link>
        }
      />

      <div className="px-5 py-8 md:px-9">
        <NewProductForm />
      </div>
    </>
  );
}
