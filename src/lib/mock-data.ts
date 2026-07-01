export type Release = {
  slug: string;
  title: string;
  type: "Single" | "EP" | "LP" | "Album";
  year: number;
  cover: { hue: number; label: string };
  blurb: string;
  tracks: { no: number; title: string; length: string }[];
  streaming: { spotify: string; apple: string; bandcamp: string };
  featured?: boolean;
};

export type Show = {
  date: string;
  city: string;
  country: string;
  venue: string;
  ticketUrl: string;
  status: "on_sale" | "low" | "sold_out";
};

export type Product = {
  slug: string;
  name: string;
  category: "Apparel" | "Vinyl" | "Digital" | "Accessory";
  price: number;
  cover: { hue: number; label: string };
  description: string;
  variants?: string[];
  digital?: boolean;
};

export type PressItem = {
  slug: string;
  title: string;
  source: string;
  date: string;
  excerpt: string;
  url: string;
  type: "review" | "interview" | "news";
};

export const releases: Release[] = [
  {
    slug: "vesper-hour",
    title: "Vesper Hour",
    type: "LP",
    year: 2024,
    cover: { hue: 0, label: "VH" },
    blurb:
      "A nine-track descent through industrial liturgy and crimson static. Recorded in a converted chapel in Lille across the long winter of 2023.",
    tracks: [
      { no: 1, title: "Aethelred", length: "4:12" },
      { no: 2, title: "Vesper Hour", length: "5:48" },
      { no: 3, title: "Bone Choir", length: "3:55" },
      { no: 4, title: "Iron Vow", length: "6:21" },
      { no: 5, title: "Crimson Tide", length: "4:38" },
      { no: 6, title: "Nocturnal Habit", length: "5:02" },
      { no: 7, title: "Fracture", length: "3:11" },
      { no: 8, title: "Relic 07", length: "7:24" },
      { no: 9, title: "After Compline", length: "8:50" },
    ],
    streaming: {
      spotify: "https://open.spotify.com/",
      apple: "https://music.apple.com/",
      bandcamp: "https://bandcamp.com/",
    },
    featured: true,
  },
  {
    slug: "nocturnal-habit",
    title: "Nocturnal Habit",
    type: "Single",
    year: 2024,
    cover: { hue: 12, label: "NH" },
    blurb: "Lead single off Vesper Hour. A slow-pulse procession.",
    tracks: [
      { no: 1, title: "Nocturnal Habit", length: "5:02" },
      { no: 2, title: "Nocturnal Habit (Ambient Rite)", length: "8:11" },
    ],
    streaming: {
      spotify: "https://open.spotify.com/",
      apple: "https://music.apple.com/",
      bandcamp: "https://bandcamp.com/",
    },
  },
  {
    slug: "fracture-ep",
    title: "Fracture EP",
    type: "EP",
    year: 2023,
    cover: { hue: 350, label: "FR" },
    blurb: "Four-track EP. The first record under the feli7xrescent name.",
    tracks: [
      { no: 1, title: "Fracture", length: "3:11" },
      { no: 2, title: "Glass Sermon", length: "4:44" },
      { no: 3, title: "Low Mass", length: "5:09" },
      { no: 4, title: "Seven", length: "6:00" },
    ],
    streaming: {
      spotify: "https://open.spotify.com/",
      apple: "https://music.apple.com/",
      bandcamp: "https://bandcamp.com/",
    },
  },
  {
    slug: "crimson-tide",
    title: "Crimson Tide",
    type: "Single",
    year: 2023,
    cover: { hue: 8, label: "CT" },
    blurb: "Stand-alone single. A study in red.",
    tracks: [{ no: 1, title: "Crimson Tide", length: "4:38" }],
    streaming: {
      spotify: "https://open.spotify.com/",
      apple: "https://music.apple.com/",
      bandcamp: "https://bandcamp.com/",
    },
  },
  {
    slug: "aethelred",
    title: "Aethelred",
    type: "Single",
    year: 2022,
    cover: { hue: 355, label: "AE" },
    blurb: "Debut single. Self-released.",
    tracks: [{ no: 1, title: "Aethelred", length: "4:12" }],
    streaming: {
      spotify: "https://open.spotify.com/",
      apple: "https://music.apple.com/",
      bandcamp: "https://bandcamp.com/",
    },
  },
];

export const shows: Show[] = [
  {
    date: "2026-10-12",
    city: "London",
    country: "UK",
    venue: "Electric Ballroom",
    ticketUrl: "#",
    status: "on_sale",
  },
  {
    date: "2026-10-15",
    city: "Paris",
    country: "FR",
    venue: "Le Trianon",
    ticketUrl: "#",
    status: "low",
  },
  {
    date: "2026-10-19",
    city: "Berlin",
    country: "DE",
    venue: "Berghain Kantine",
    ticketUrl: "#",
    status: "sold_out",
  },
  {
    date: "2026-10-24",
    city: "Amsterdam",
    country: "NL",
    venue: "Paradiso Tolhuistuin",
    ticketUrl: "#",
    status: "on_sale",
  },
  {
    date: "2026-11-02",
    city: "Brooklyn",
    country: "US",
    venue: "Elsewhere Hall",
    ticketUrl: "#",
    status: "on_sale",
  },
  {
    date: "2026-11-06",
    city: "Los Angeles",
    country: "US",
    venue: "The Regent",
    ticketUrl: "#",
    status: "on_sale",
  },
];

export const products: Product[] = [
  {
    slug: "shroud-hoodie",
    name: "Shroud Hoodie",
    category: "Apparel",
    price: 85,
    cover: { hue: 0, label: "SH" },
    description:
      "Heavyweight 14oz black cotton hoodie. Crimson chain-stitch embroidery on chest. Oversized fit.",
    variants: ["S", "M", "L", "XL", "XXL"],
  },
  {
    slug: "blood-moon-vinyl",
    name: "Blood Moon Vinyl",
    category: "Vinyl",
    price: 40,
    cover: { hue: 5, label: "BM" },
    description:
      "Vesper Hour pressed on 180g blood-marbled vinyl. Limited to 500. Gatefold sleeve with foil-stamped sigil.",
  },
  {
    slug: "vesper-hour-digital",
    name: "Vesper Hour (Digital)",
    category: "Digital",
    price: 12,
    cover: { hue: 350, label: "VH" },
    description: "FLAC + MP3 download of the full LP. Includes 24-page digital booklet.",
    digital: true,
  },
  {
    slug: "artifact-tote",
    name: "Artifact Tote",
    category: "Accessory",
    price: 25,
    cover: { hue: 355, label: "AT" },
    description: "Heavy canvas tote. Blackletter wordmark in blood red. Reinforced straps.",
  },
  {
    slug: "iron-vow-tee",
    name: "Iron Vow Tee",
    category: "Apparel",
    price: 45,
    cover: { hue: 10, label: "IV" },
    description: "Premium ringspun cotton. Front-and-back screen print. Boxy unisex cut.",
    variants: ["S", "M", "L", "XL"],
  },
  {
    slug: "fracture-ep-digital",
    name: "Fracture EP (Digital)",
    category: "Digital",
    price: 7,
    cover: { hue: 358, label: "FR" },
    description: "Four-track EP. FLAC + MP3.",
    digital: true,
  },
];

export const press: PressItem[] = [
  {
    slug: "the-quietus-vesper-review",
    title: "Vesper Hour - A liturgy for the burned-out",
    source: "The Quietus",
    date: "2024-09-14",
    excerpt:
      "feli7xrescent's debut LP is a stunning act of architectural restraint. Nine tracks that move like a procession through a building you did not know you had been living in.",
    url: "#",
    type: "review",
  },
  {
    slug: "crack-magazine-interview",
    title: "Inside the chapel sessions",
    source: "Crack Magazine",
    date: "2024-08-22",
    excerpt:
      "We spoke to feli7xrescent about recording in a deconsecrated chapel, the architecture of grief, and why the seventh track on every record matters.",
    url: "#",
    type: "interview",
  },
  {
    slug: "boiler-room-debut",
    title: "Boiler Room debut announced - London, October",
    source: "Boiler Room",
    date: "2024-08-01",
    excerpt: "The European tour will be capped by a Boiler Room broadcast set from Electric Ballroom.",
    url: "#",
    type: "news",
  },
  {
    slug: "pitchfork-best-new-track",
    title: '"Nocturnal Habit" - Best New Track',
    source: "Pitchfork",
    date: "2024-07-11",
    excerpt:
      "An exercise in slow-pulse menace. The kind of single that re-draws the room around it.",
    url: "#",
    type: "review",
  },
];

export function formatShowDate(iso: string) {
  const date = new Date(`${iso}T00:00:00`);
  const month = date.toLocaleString("en-US", { month: "short" }).toUpperCase();
  const day = String(date.getDate()).padStart(2, "0");
  return { month, day };
}
