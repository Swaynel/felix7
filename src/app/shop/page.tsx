import type { Metadata } from "next";
import { ShopCatalog } from "@/components/ShopCatalog";
import { getProducts } from "@/lib/site-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Official feli7xrescent merch and music. Apparel, vinyl, and digital downloads. Ships worldwide.",
};

export default async function ShopPage() {
  const products = await getProducts();
  return <ShopCatalog products={products} />;
}
