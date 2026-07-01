import type { Metadata } from "next";
import { ShopCatalog } from "@/components/ShopCatalog";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Official feli7xrescent merch and music. Apparel, vinyl, and digital downloads. Ships worldwide.",
};

export default function ShopPage() {
  return <ShopCatalog />;
}
