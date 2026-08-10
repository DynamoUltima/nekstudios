import Link from "next/link";
import { AdminPageHead } from "@/components/admin/admin-shell";
import { Panel } from "@/components/admin/ui";

export default function AdminNotFound() {
  return (
    <>
      <AdminPageHead
        eyebrow="404"
        title="Not on the desk"
        lede="That order or piece isn't in the store. It may have been refunded out of the window, or the reference is wrong."
      />

      <div className="px-5 py-8 md:px-9">
        <Panel title="Try instead">
          <ul className="space-y-3.5">
            {[
              { label: "Overview", href: "/admin" },
              { label: "Orders", href: "/admin/orders" },
              { label: "Pieces", href: "/admin/products" },
            ].map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="label group inline-flex items-center gap-2.5 transition-colors hover:text-red"
                >
                  {item.label}
                  <span className="transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  );
}
