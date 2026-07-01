import { cache } from "react";
import {
  formatShowDate,
  press as fallbackPress,
  products as fallbackProducts,
  releases as fallbackReleases,
  shows as fallbackShows,
  type PressItem,
} from "@/lib/mock-data";
import { hasDatabaseUrl, prisma } from "@/lib/prisma";
import type { DeliveryType, Product as DbProduct, Release as DbRelease, Show as DbShow, Track, Variant } from "@/generated/prisma/client";

export { formatShowDate };

export type SiteRelease = {
  id?: string;
  slug: string;
  title: string;
  releaseDate?: string;
  type: "Single" | "EP" | "LP" | "Album";
  year: number;
  cover: { hue: number; label: string };
  coverPublicId?: string;
  blurb: string;
  tracks: { no: number; title: string; length: string }[];
  streaming: { spotify: string; apple: string; bandcamp: string };
  featured?: boolean;
  published?: boolean;
};

export type SiteShow = {
  id?: string;
  date: string;
  city: string;
  country: string;
  venue: string;
  ticketUrl: string;
  status: "on_sale" | "low" | "sold_out";
  published?: boolean;
};

export type SiteProductVariant = {
  id?: string;
  label: string;
  stock?: number | null;
  sku?: string;
  digitalPublicId?: string;
};

export type SiteProduct = {
  id?: string;
  slug: string;
  name: string;
  category: "Apparel" | "Vinyl" | "Digital" | "Accessory";
  deliveryType?: "DIGITAL" | "PHYSICAL";
  price: number;
  priceMinor?: number;
  priceLabel: string;
  currency: string;
  cover: { hue: number; label: string };
  imagePublicIds?: string[];
  description: string;
  variants: SiteProductVariant[];
  digital?: boolean;
  checkoutEnabled: boolean;
  active?: boolean;
  releaseId?: string;
  releaseTitle?: string;
  releaseSlug?: string;
};

export type SiteAdminSummary = {
  releases: SiteRelease[];
  shows: SiteShow[];
  products: SiteProduct[];
  orders: {
    id: string;
    shortId: string;
    customer: string;
    items: string;
    itemsDetailed: {
      label: string;
      quantity: number;
      deliveryType: "DIGITAL" | "PHYSICAL";
      fulfillmentStatus: string;
    }[];
    total: string;
    status: string;
    createdAt: string;
    shippingAddress: string;
    paystackReference: string;
  }[];
  inquiries: SiteInquiry[];
  pressAssets: {
    id: string;
    label: string;
    type: string;
    size: string;
    updated: string;
    fileKey?: string | null;
    url?: string | null;
  }[];
};

export type SiteInquiry = {
  id: string;
  type: "BOOKING" | "FAN" | "PRESS";
  name: string;
  email: string;
  message: string;
  handled: boolean;
  createdAt: string;
  details: string;
};

type DbReleaseWithTracks = DbRelease & { tracks: Track[] };
type DbProductWithVariants = DbProduct & {
  variants: Variant[];
  release?: { title: string; slug: string } | null;
};

const fallbackSiteReleases: SiteRelease[] = fallbackReleases.map((release) => ({
  ...release,
  releaseDate: `${release.year}-01-01`,
  coverPublicId: "",
  published: true,
}));

const fallbackSiteShows: SiteShow[] = fallbackShows.map((show) => ({
  ...show,
  published: true,
}));

const fallbackSiteProducts: SiteProduct[] = fallbackProducts.map((product) => ({
  id: product.slug,
  slug: product.slug,
  name: product.name,
  category: product.category,
  price: product.price,
  priceLabel: `$${product.price}`,
  currency: "USD",
  cover: product.cover,
  imagePublicIds: [],
  description: product.description,
  variants: (product.variants ?? (product.digital ? ["Digital"] : [])).map((label) => ({
    label,
    sku: label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
  })),
  digital: product.digital,
  deliveryType: product.digital ? "DIGITAL" : "PHYSICAL",
  checkoutEnabled: false,
  active: true,
}));

export const getReleases = cache(async (): Promise<SiteRelease[]> => {
  if (!hasDatabaseUrl()) {
    return fallbackSiteReleases;
  }

  const rows = await prisma.release.findMany({
    where: { published: true },
    include: { tracks: { orderBy: { trackNumber: "asc" } } },
    orderBy: { releaseDate: "desc" },
  });

  if (rows.length === 0) {
    return fallbackSiteReleases;
  }

  return rows.map((release, index) => mapRelease(release, index === 0));
});

export const getRelease = cache(async (slug: string): Promise<SiteRelease | null> => {
  if (!hasDatabaseUrl()) {
    return fallbackSiteReleases.find((release) => release.slug === slug) ?? null;
  }

  const release = await prisma.release.findFirst({
    where: { slug, published: true },
    include: { tracks: { orderBy: { trackNumber: "asc" } } },
  });

  if (!release) {
    return fallbackSiteReleases.find((item) => item.slug === slug) ?? null;
  }

  return mapRelease(release, false);
});

export const getShows = cache(async (): Promise<SiteShow[]> => {
  if (!hasDatabaseUrl()) {
    return fallbackSiteShows;
  }

  const rows = await prisma.show.findMany({
    where: { published: true },
    orderBy: { date: "asc" },
  });

  if (rows.length === 0) {
    return fallbackSiteShows;
  }

  return rows.map(mapShow);
});

export const getProducts = cache(async (): Promise<SiteProduct[]> => {
  if (!hasDatabaseUrl()) {
    return fallbackSiteProducts;
  }

  const rows = await prisma.product.findMany({
    where: { active: true },
    include: { variants: true, release: { select: { title: true, slug: true } } },
    orderBy: { createdAt: "desc" },
  });

  if (rows.length === 0) {
    return fallbackSiteProducts;
  }

  return rows.map(mapProduct);
});

export const getProduct = cache(async (slug: string): Promise<SiteProduct | null> => {
  if (!hasDatabaseUrl()) {
    return fallbackSiteProducts.find((product) => product.slug === slug) ?? null;
  }

  const product = await prisma.product.findFirst({
    where: { slug, active: true },
    include: { variants: true, release: { select: { title: true, slug: true } } },
  });

  if (!product) {
    return fallbackSiteProducts.find((item) => item.slug === slug) ?? null;
  }

  return mapProduct(product);
});

export const getPressItems = cache(async (): Promise<PressItem[]> => fallbackPress);

export const getPressItem = cache(async (slug: string): Promise<PressItem | null> => {
  return fallbackPress.find((item) => item.slug === slug) ?? null;
});

export const getAdminSummary = cache(async (): Promise<SiteAdminSummary> => {
  if (!hasDatabaseUrl()) {
    return {
      releases: fallbackSiteReleases,
      shows: fallbackSiteShows,
      products: fallbackSiteProducts,
      orders: [
        {
          id: "ord_1024",
          shortId: "#1024",
          customer: "j.morel@...",
          items: "Shroud Hoodie x1",
          itemsDetailed: [
            {
              label: "Shroud Hoodie / XL",
              quantity: 1,
              deliveryType: "PHYSICAL",
              fulfillmentStatus: "UNFULFILLED",
            },
          ],
          total: "$85.00",
          status: "PAID",
          createdAt: "2024-09-01T12:00:00.000Z",
          shippingAddress: "Lagos, NG",
          paystackReference: "ref_1024",
        },
        {
          id: "ord_1023",
          shortId: "#1023",
          customer: "a.knox@...",
          items: "Blood Moon Vinyl x1",
          itemsDetailed: [
            {
              label: "Blood Moon Vinyl / Black",
              quantity: 1,
              deliveryType: "PHYSICAL",
              fulfillmentStatus: "SHIPPED",
            },
          ],
          total: "$40.00",
          status: "PAID",
          createdAt: "2024-08-29T12:00:00.000Z",
          shippingAddress: "Berlin, DE",
          paystackReference: "ref_1023",
        },
        {
          id: "ord_1022",
          shortId: "#1022",
          customer: "-",
          items: "Vesper Hour (Digital) x1",
          itemsDetailed: [
            {
              label: "Vesper Hour (Digital)",
              quantity: 1,
              deliveryType: "DIGITAL",
              fulfillmentStatus: "NOT_APPLICABLE",
            },
          ],
          total: "$12.00",
          status: "PAID",
          createdAt: "2024-08-25T12:00:00.000Z",
          shippingAddress: "",
          paystackReference: "ref_1022",
        },
      ],
      inquiries: [],
      pressAssets: [
        { id: "asset-1", label: "Bio - long.pdf", type: "PDF", size: "412 KB", updated: "2024-09-01", fileKey: "musician/bio/bio-long.pdf" },
        { id: "asset-2", label: "Press photo 01.jpg", type: "Image", size: "8.2 MB", updated: "2024-08-22", fileKey: "musician/press/photos/photo-01.jpg" },
        { id: "asset-3", label: "Tech rider v2.3.pdf", type: "PDF", size: "208 KB", updated: "2024-07-30", fileKey: "musician/riders/tech-rider-v2-3.pdf" },
      ],
    };
  }

  const [releaseRows, showRows, productRows, orderRows, inquiryRows, pressRows] = await Promise.all([
    prisma.release.findMany({
      include: { tracks: { orderBy: { trackNumber: "asc" } } },
      orderBy: { releaseDate: "desc" },
    }),
    prisma.show.findMany({ orderBy: { date: "asc" } }),
    prisma.product.findMany({
      include: { variants: true, release: { select: { title: true, slug: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.order.findMany({
      take: 10,
      include: {
        customer: { select: { email: true } },
        items: {
          include: {
            variant: {
              include: {
                product: { select: { title: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.inquiry.findMany({ orderBy: { createdAt: "desc" }, take: 20 }),
    prisma.pressAsset.findMany({ orderBy: { createdAt: "desc" }, take: 20 }),
  ]);

  return {
    releases: releaseRows.length ? releaseRows.map((release, index) => mapRelease(release, index === 0)) : fallbackSiteReleases,
    shows: showRows.length ? showRows.map(mapShow) : fallbackSiteShows,
    products: productRows.length ? productRows.map(mapProduct) : fallbackSiteProducts,
    orders: orderRows.map((order) => ({
      id: order.id,
      shortId: `#${order.id.slice(0, 8).toUpperCase()}`,
      customer: order.guestEmail ?? order.customer?.email ?? "Customer account",
      items: order.items
        .map((item) => `${item.variant.product.title}${item.variant.label ? ` / ${item.variant.label}` : ""} x${item.quantity}`)
        .join(", "),
      itemsDetailed: order.items.map((item) => ({
        label: `${item.variant.product.title}${item.variant.label ? ` / ${item.variant.label}` : ""}`,
        quantity: item.quantity,
        deliveryType: item.deliveryType,
        fulfillmentStatus: item.fulfillmentStatus,
      })),
      total: formatMoney(order.totalMinor, order.currency),
      status: order.status,
      createdAt: order.createdAt.toISOString(),
      shippingAddress: stringifyJson(order.shippingAddress),
      paystackReference: order.paystackReference,
    })),
    inquiries: inquiryRows.map((inquiry) => ({
      id: inquiry.id,
      type: inquiry.type,
      name: inquiry.name,
      email: inquiry.email,
      message: inquiry.message,
      handled: inquiry.handled,
      createdAt: inquiry.createdAt.toISOString(),
      details: inquiry.metadata ? JSON.stringify(inquiry.metadata, null, 2) : "",
    })),
    pressAssets: pressRows.map((asset) => ({
      id: asset.id,
      label: asset.label,
      type: asset.type,
      size: asset.fileKey ? "Cloudinary" : asset.url ? "Link" : "File",
      updated: asset.createdAt.toISOString().slice(0, 10),
      fileKey: asset.fileKey,
      url: asset.url,
    })),
  };
});

function mapRelease(release: DbReleaseWithTracks, featured: boolean): SiteRelease {
  const trackCount = release.tracks.length;
  return {
    id: release.id,
    slug: release.slug,
    title: release.title,
    releaseDate: release.releaseDate.toISOString().slice(0, 10),
    type: trackCount >= 7 ? "LP" : trackCount > 1 ? "EP" : "Single",
    year: release.releaseDate.getFullYear(),
    cover: {
      hue: hueFromString(release.coverArtKey || release.title),
      label: initials(release.title),
    },
    coverPublicId: release.coverArtKey,
    blurb: release.description ?? "",
    tracks: release.tracks.map((track) => ({
      no: track.trackNumber,
      title: track.title,
      length: formatDuration(track.durationSec),
    })),
    streaming: normalizeStreaming(release.streamingLinks),
    featured,
    published: release.published,
  };
}

function mapShow(show: DbShow): SiteShow {
  return {
    id: show.id,
    date: show.date.toISOString().slice(0, 10),
    city: show.city,
    country: show.country,
    venue: show.venueName,
    ticketUrl: show.ticketUrl ?? "#",
    status: show.soldOut ? "sold_out" : "on_sale",
    published: show.published,
  };
}

function mapProduct(product: DbProductWithVariants): SiteProduct {
  const price = product.priceMinor / 100;
  return {
    id: product.id,
    slug: product.slug,
    name: product.title,
    category: inferCategory(product.title, product.deliveryType),
    price,
    priceMinor: product.priceMinor,
    priceLabel: formatMoney(product.priceMinor, product.currency),
    currency: product.currency,
    deliveryType: product.deliveryType,
    cover: {
      hue: hueFromString(product.imageKeys[0] || product.title),
      label: initials(product.title),
    },
    imagePublicIds: product.imageKeys,
    description: product.description ?? "",
    variants: product.variants.map((variant) => ({
      id: variant.id,
      label: variant.label,
      stock: variant.stock,
      sku: variant.sku,
      digitalPublicId: variant.digitalFileKey ?? undefined,
    })),
    digital: product.deliveryType === "DIGITAL",
    checkoutEnabled: product.variants.length > 0,
    active: product.active,
    releaseId: product.releaseId ?? undefined,
    releaseTitle: product.release?.title ?? undefined,
    releaseSlug: product.release?.slug ?? undefined,
  };
}

function normalizeStreaming(value: unknown): SiteRelease["streaming"] {
  const links = value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
  return {
    spotify: stringUrl(links.spotify) ?? "https://open.spotify.com/",
    apple: stringUrl(links.apple) ?? stringUrl(links.appleMusic) ?? "https://music.apple.com/",
    bandcamp: stringUrl(links.bandcamp) ?? "https://bandcamp.com/",
  };
}

function stringUrl(value: unknown) {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function formatDuration(seconds?: number | null) {
  if (!seconds) {
    return "--:--";
  }
  const minutes = Math.floor(seconds / 60);
  const rest = String(seconds % 60).padStart(2, "0");
  return `${minutes}:${rest}`;
}

function formatMoney(minor: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(minor / 100);
}

function stringifyJson(value: unknown) {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function initials(value: string) {
  const words = value.match(/[a-z0-9]+/gi) ?? [value];
  return words
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("") || "FX";
}

function hueFromString(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) % 24;
  }
  return 348 + hash;
}

function inferCategory(title: string, deliveryType: DeliveryType): SiteProduct["category"] {
  const lower = title.toLowerCase();
  if (deliveryType === "DIGITAL") return "Digital";
  if (lower.includes("vinyl")) return "Vinyl";
  if (lower.includes("tote") || lower.includes("pin") || lower.includes("patch")) return "Accessory";
  return "Apparel";
}
