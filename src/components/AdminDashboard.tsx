"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { CoverArt } from "@/components/CoverArt";
import type {
  SiteAdminSummary,
  SiteProduct,
  SiteRelease,
  SiteShow,
} from "@/lib/site-data";

const TABS = ["Releases", "Shows", "Merch", "Orders", "Inquiries", "Press Kit"] as const;
type Tab = (typeof TABS)[number];

type Notice = {
  kind: "idle" | "success" | "error";
  message: string;
};

type ReleaseDraft = {
  title: string;
  slug: string;
  releaseDate: string;
  coverPublicId: string;
  description: string;
  streamingLinks: string;
  tracks: string;
  published: boolean;
};

type ShowDraft = {
  date: string;
  venueName: string;
  city: string;
  country: string;
  ticketUrl: string;
  soldOut: boolean;
  published: boolean;
};

type ProductDraft = {
  title: string;
  slug: string;
  description: string;
  releaseId: string;
  deliveryType: "DIGITAL" | "PHYSICAL";
  priceMinor: string;
  currency: string;
  imagePublicIds: string;
  variants: string;
  active: boolean;
};

type PressDraft = {
  type: "photo" | "rider" | "bio" | "video_link";
  label: string;
  publicId: string;
  url: string;
};

type UploadResult = Record<string, unknown> | null;

type AdminOrder = SiteAdminSummary["orders"][number];
type AdminInquiry = SiteAdminSummary["inquiries"][number];
type AdminPressAsset = SiteAdminSummary["pressAssets"][number];

const buttonBase =
  "rounded-full border px-4 py-2 text-[11px] uppercase tracking-[0.25em] transition-colors disabled:cursor-not-allowed disabled:opacity-50";
const buttonPrimary =
  `${buttonBase} border-accent bg-accent text-background hover:bg-accent/80`;
const buttonSecondary =
  `${buttonBase} border-white/10 text-zinc-200 hover:border-accent hover:text-accent`;
const buttonDanger =
  `${buttonBase} border-red-500/30 text-red-200 hover:border-red-400 hover:text-red-100`;
const inputClass =
  "mt-2 w-full rounded-md border border-white/10 bg-surface/40 px-3 py-2 text-sm text-zinc-100 outline-none transition-colors focus:border-accent disabled:cursor-not-allowed disabled:opacity-60";
const textareaClass =
  "mt-2 w-full resize-none rounded-md border border-white/10 bg-surface/40 px-3 py-2 text-sm text-zinc-100 outline-none transition-colors focus:border-accent disabled:cursor-not-allowed disabled:opacity-60";
const selectClass =
  "mt-2 w-full rounded-md border border-white/10 bg-surface/40 px-3 py-2 text-sm text-zinc-100 outline-none transition-colors focus:border-accent disabled:cursor-not-allowed disabled:opacity-60";
const panelClass = "rounded-md border border-white/5 bg-surface/20";

export function AdminDashboard({ summary }: { summary: SiteAdminSummary }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("Releases");

  const refresh = () => {
    router.refresh();
  };

  const openInquiries = summary.inquiries.filter((inquiry) => !inquiry.handled).length;
  const activeOrders = summary.orders.filter((order) => order.status !== "REFUNDED").length;

  return (
    <section className="min-h-screen bg-background px-6 pt-32 pb-24">
      <div className="mx-auto max-w-7xl">
        <header className="border-b border-white/5 pb-6">
          <p className="text-eyebrow">Restricted</p>
          <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="font-display text-6xl text-accent md:text-7xl">Dashboard</h1>
              <p className="mt-2 max-w-2xl text-sm text-zinc-400">
                Connected to the live backend.
              </p>
            </div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              Backend protected
            </p>
          </div>
        </header>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
          <Stat label="Releases" value={summary.releases.length} />
          <Stat label="Shows" value={summary.shows.length} />
          <Stat label="Products" value={summary.products.length} />
          <Stat label="Orders" value={activeOrders} />
          <Stat label="Inquiries" value={openInquiries} />
          <Stat label="Press Assets" value={summary.pressAssets.length} />
        </div>

        <div className="mt-10 flex flex-wrap gap-2 border-b border-white/5 pb-3">
          {TABS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setTab(item)}
              className={`rounded-full border px-4 py-2 text-[11px] uppercase tracking-[0.25em] transition-colors ${
                tab === item
                  ? "border-accent bg-accent text-background"
                  : "border-white/10 text-muted-foreground hover:border-accent hover:text-accent"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="mt-8 space-y-10">
          <div className={tab === "Releases" ? "block" : "hidden"}>
            <ReleasePanel releases={summary.releases} onRefresh={refresh} />
          </div>
          <div className={tab === "Shows" ? "block" : "hidden"}>
            <ShowPanel shows={summary.shows} onRefresh={refresh} />
          </div>
          <div className={tab === "Merch" ? "block" : "hidden"}>
            <ProductPanel products={summary.products} releases={summary.releases} onRefresh={refresh} />
          </div>
          <div className={tab === "Orders" ? "block" : "hidden"}>
            <OrdersPanel orders={summary.orders} onRefresh={refresh} />
          </div>
          <div className={tab === "Inquiries" ? "block" : "hidden"}>
            <InquiryPanel inquiries={summary.inquiries} onRefresh={refresh} />
          </div>
          <div className={tab === "Press Kit" ? "block" : "hidden"}>
            <PressPanel assets={summary.pressAssets} onRefresh={refresh} />
          </div>
        </div>
      </div>
    </section>
  );
}

function ReleasePanel({
  releases,
  onRefresh,
}: {
  releases: SiteRelease[];
  onRefresh: () => void;
}) {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(releases[0]?.slug ?? null);
  const [draft, setDraft] = useState<ReleaseDraft>(() => makeReleaseDraft(releases[0]));
  const [notice, setNotice] = useState<Notice>({ kind: "idle", message: "" });

  const selectedRelease = selectedSlug
    ? releases.find((release) => release.slug === selectedSlug) ?? null
    : null;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!draft.title.trim() || !draft.slug.trim() || !draft.releaseDate.trim() || !draft.coverPublicId.trim()) {
      setNotice({ kind: "error", message: "Required release fields are missing." });
      return;
    }

    let streamingLinks: Record<string, string> | undefined;
    let tracks: ReturnType<typeof parseTracks> | undefined;

    try {
      streamingLinks = parseJsonRecord(draft.streamingLinks);
      tracks = selectedRelease ? undefined : parseTracks(draft.tracks);
    } catch (error) {
      setNotice({ kind: "error", message: errorMessage(error, "Invalid release data.") });
      return;
    }

    const payload = {
      title: draft.title.trim(),
      slug: draft.slug.trim(),
      releaseDate: toIsoDate(draft.releaseDate),
      coverPublicId: draft.coverPublicId.trim(),
      description: draft.description.trim() || undefined,
      published: draft.published,
      streamingLinks,
      ...(tracks ? { tracks } : {}),
    };

    const response = await sendJson(
      selectedRelease ? `/api/releases/${encodeURIComponent(selectedRelease.slug)}` : "/api/releases",
      {
        method: selectedRelease ? "PATCH" : "POST",
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      setNotice({ kind: "error", message: response.message });
      return;
    }

    setNotice({ kind: "success", message: selectedRelease ? "Release saved." : "Release created." });
    onRefresh();
  }

  async function remove() {
    if (!selectedRelease) return;
    if (!window.confirm("Delete this release?")) return;

    const response = await sendJson(`/api/releases/${encodeURIComponent(selectedRelease.slug)}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      setNotice({ kind: "error", message: response.message });
      return;
    }

    setSelectedSlug(null);
    setNotice({ kind: "success", message: "Release deleted." });
    onRefresh();
  }

  const coverHue = selectedRelease?.cover.hue ?? hueFromString(draft.coverPublicId || draft.slug || draft.title || "release");
  const coverLabel = selectedRelease?.cover.label ?? initials(draft.title || draft.slug || "FX");

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
      <section className={panelClass}>
        <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
          <div>
            <p className="text-eyebrow">Library</p>
            <h2 className="mt-1 font-display text-3xl text-accent">Releases</h2>
          </div>
          <button
            type="button"
            onClick={() => {
              setSelectedSlug(null);
              setDraft(makeReleaseDraft(null));
              setNotice({ kind: "idle", message: "" });
            }}
            className={buttonSecondary}
          >
            New
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-white/[0.02] text-left">
              <tr>
                <Th>Title</Th>
                <Th>Date</Th>
                <Th>Tracks</Th>
                <Th>Status</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {releases.map((release) => {
                const selected = release.slug === selectedSlug;
                return (
                  <tr
                    key={release.slug}
                    className={`transition-colors ${selected ? "bg-white/[0.03]" : "hover:bg-white/[0.02]"}`}
                    onClick={() => {
                      setSelectedSlug(release.slug);
                      setDraft(makeReleaseDraft(release));
                      setNotice({ kind: "idle", message: "" });
                    }}
                  >
                    <Td>
                      <button
                        type="button"
                        className="text-left text-zinc-100 hover:text-accent"
                        onClick={(event) => {
                          event.stopPropagation();
                          setSelectedSlug(release.slug);
                          setDraft(makeReleaseDraft(release));
                          setNotice({ kind: "idle", message: "" });
                        }}
                      >
                        {release.title}
                      </button>
                    </Td>
                    <Td>{release.releaseDate ?? `${release.year}-01-01`}</Td>
                    <Td>{release.tracks.length}</Td>
                    <Td>
                      <span
                        className={`rounded-full border px-2 py-1 text-[10px] uppercase tracking-[0.2em] ${
                          release.published
                            ? "border-accent/30 text-accent"
                            : "border-white/10 text-muted-foreground"
                        }`}
                      >
                        {release.published ? "Published" : "Draft"}
                      </span>
                    </Td>
                    <Td className="text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          className={buttonSecondary}
                          onClick={(event) => {
                            event.stopPropagation();
                            setSelectedSlug(release.slug);
                            setDraft(makeReleaseDraft(release));
                            setNotice({ kind: "idle", message: "" });
                          }}
                        >
                          Edit
                        </button>
                      </div>
                    </Td>
                  </tr>
                );
              })}
              {releases.length === 0 && (
                <tr>
                  <Td colSpan={5} className="py-8 text-center text-muted-foreground">
                    No releases yet.
                  </Td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className={panelClass}>
        <div className="border-b border-white/5 px-5 py-4">
          <p className="text-eyebrow">{selectedRelease ? "Edit release" : "Create release"}</p>
          <h3 className="mt-1 font-display text-4xl text-accent">
            {selectedRelease ? selectedRelease.title : "New release"}
          </h3>
        </div>

        <div className="space-y-6 p-5">
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_148px]">
            <div className="space-y-4">
              <form className="space-y-4" onSubmit={submit}>
                <div className="grid gap-4 md:grid-cols-2">
                  <TextField
                    label="Title"
                    value={draft.title}
                    onChange={(value) => setDraft((current) => ({ ...current, title: value }))}
                    required
                  />
                  <TextField
                    label="Slug"
                    value={draft.slug}
                    onChange={(value) => setDraft((current) => ({ ...current, slug: value }))}
                    required
                    disabled={selectedRelease !== null}
                  />
                  <TextField
                    label="Release date"
                    type="date"
                    value={draft.releaseDate}
                    onChange={(value) => setDraft((current) => ({ ...current, releaseDate: value }))}
                    required
                  />
                  <TextField
                    label="Cover key"
                    value={draft.coverPublicId}
                    onChange={(value) => setDraft((current) => ({ ...current, coverPublicId: value }))}
                    required
                  />
                </div>

                <TextAreaField
                  label="Description"
                  value={draft.description}
                  onChange={(value) => setDraft((current) => ({ ...current, description: value }))}
                  rows={4}
                />

                <TextAreaField
                  label="Streaming JSON"
                  value={draft.streamingLinks}
                  onChange={(value) => setDraft((current) => ({ ...current, streamingLinks: value }))}
                  rows={5}
                />

                {!selectedRelease && (
                  <TextAreaField
                    label="Tracks"
                    value={draft.tracks}
                    onChange={(value) => setDraft((current) => ({ ...current, tracks: value }))}
                    rows={6}
                  />
                )}

                <CheckboxField
                  label="Published"
                  checked={draft.published}
                  onChange={(checked) => setDraft((current) => ({ ...current, published: checked }))}
                />

                <div className="flex flex-wrap gap-3">
                  <button type="submit" className={buttonPrimary}>
                    {selectedRelease ? "Save release" : "Create release"}
                  </button>
                  {selectedRelease && (
                    <button type="button" onClick={remove} className={buttonDanger}>
                      Delete
                    </button>
                  )}
                </div>

                {notice.message && (
                  <p className={`text-sm ${notice.kind === "error" ? "text-red-300" : "text-zinc-300"}`}>
                    {notice.message}
                  </p>
                )}
              </form>

              {selectedRelease && (
                <div className="space-y-3 border-t border-white/5 pt-5">
                  <p className="text-eyebrow">Tracklist</p>
                  <div className="space-y-2">
                    {selectedRelease.tracks.map((track) => (
                      <div
                        key={`${selectedRelease.slug}-${track.no}`}
                        className="flex items-center justify-between rounded-md border border-white/5 px-3 py-2 text-sm"
                      >
                        <span className="text-zinc-100">
                          {track.no}. {track.title}
                        </span>
                        <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                          {track.length}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <CoverArt
                hue={coverHue}
                label={coverLabel}
                aspect="portrait"
                className="w-full"
              />
              <div className="rounded-md border border-white/5 bg-white/[0.02] p-3 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                {(selectedRelease?.slug ?? draft.slug) || "Unsaved"}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function ShowPanel({
  shows,
  onRefresh,
}: {
  shows: SiteShow[];
  onRefresh: () => void;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(shows[0]?.id ?? null);
  const [draft, setDraft] = useState<ShowDraft>(() => makeShowDraft(shows[0]));
  const [notice, setNotice] = useState<Notice>({ kind: "idle", message: "" });

  const selectedShow = selectedId ? shows.find((show) => show.id === selectedId) ?? null : null;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!draft.date.trim() || !draft.venueName.trim() || !draft.city.trim() || !draft.country.trim()) {
      setNotice({ kind: "error", message: "Required show fields are missing." });
      return;
    }

    const payload = {
      date: toIsoDate(draft.date),
      venueName: draft.venueName.trim(),
      city: draft.city.trim(),
      country: draft.country.trim(),
      ticketUrl: draft.ticketUrl.trim() || undefined,
      soldOut: draft.soldOut,
      published: draft.published,
    };

    const response = await sendJson(
      selectedShow ? `/api/shows/${encodeURIComponent(selectedShow.id ?? "")}` : "/api/shows",
      {
        method: selectedShow ? "PATCH" : "POST",
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      setNotice({ kind: "error", message: response.message });
      return;
    }

    setNotice({ kind: "success", message: selectedShow ? "Show saved." : "Show created." });
    onRefresh();
  }

  async function remove() {
    if (!selectedShow?.id) return;
    if (!window.confirm("Delete this show?")) return;

    const response = await sendJson(`/api/shows/${encodeURIComponent(selectedShow.id)}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      setNotice({ kind: "error", message: response.message });
      return;
    }

    setSelectedId(null);
    setNotice({ kind: "success", message: "Show deleted." });
    onRefresh();
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
      <section className={panelClass}>
        <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
          <div>
            <p className="text-eyebrow">Touring</p>
            <h2 className="mt-1 font-display text-3xl text-accent">Shows</h2>
          </div>
          <button
            type="button"
            onClick={() => {
              setSelectedId(null);
              setDraft(makeShowDraft(null));
              setNotice({ kind: "idle", message: "" });
            }}
            className={buttonSecondary}
          >
            New
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-white/[0.02] text-left">
              <tr>
                <Th>Date</Th>
                <Th>Venue</Th>
                <Th>City</Th>
                <Th>Status</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {shows.map((show) => {
                const selected = show.id === selectedId;
                const statusLabel = show.status === "sold_out" ? "Sold out" : show.status === "low" ? "Low" : "On sale";
                return (
                  <tr
                    key={show.id ?? `${show.date}-${show.venue}`}
                    className={`transition-colors ${selected ? "bg-white/[0.03]" : "hover:bg-white/[0.02]"}`}
                    onClick={() => {
                      if (!show.id) return;
                      setSelectedId(show.id);
                      setDraft(makeShowDraft(show));
                      setNotice({ kind: "idle", message: "" });
                    }}
                  >
                    <Td>{show.date}</Td>
                    <Td>{show.venue}</Td>
                    <Td>{show.city}</Td>
                    <Td>
                      <span
                        className={`rounded-full border px-2 py-1 text-[10px] uppercase tracking-[0.2em] ${
                          show.status === "sold_out"
                            ? "border-red-500/30 text-red-200"
                            : show.status === "low"
                              ? "border-amber-500/30 text-amber-200"
                              : "border-accent/30 text-accent"
                        }`}
                      >
                        {show.published === false ? "Hidden" : statusLabel}
                      </span>
                    </Td>
                    <Td className="text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          className={buttonSecondary}
                          onClick={(event) => {
                            event.stopPropagation();
                            if (!show.id) return;
                            setSelectedId(show.id);
                            setDraft(makeShowDraft(show));
                            setNotice({ kind: "idle", message: "" });
                          }}
                        >
                          Edit
                        </button>
                      </div>
                    </Td>
                  </tr>
                );
              })}
              {shows.length === 0 && (
                <tr>
                  <Td colSpan={5} className="py-8 text-center text-muted-foreground">
                    No shows yet.
                  </Td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className={panelClass}>
        <div className="border-b border-white/5 px-5 py-4">
          <p className="text-eyebrow">{selectedShow ? "Edit show" : "Create show"}</p>
          <h3 className="mt-1 font-display text-4xl text-accent">
            {selectedShow ? selectedShow.venue : "New show"}
          </h3>
        </div>

        <form className="space-y-4 p-5" onSubmit={submit}>
          <div className="grid gap-4 md:grid-cols-2">
            <TextField
              label="Date"
              type="date"
              value={draft.date}
              onChange={(value) => setDraft((current) => ({ ...current, date: value }))}
              required
            />
            <TextField
              label="Venue"
              value={draft.venueName}
              onChange={(value) => setDraft((current) => ({ ...current, venueName: value }))}
              required
            />
            <TextField
              label="City"
              value={draft.city}
              onChange={(value) => setDraft((current) => ({ ...current, city: value }))}
              required
            />
            <TextField
              label="Country"
              value={draft.country}
              onChange={(value) => setDraft((current) => ({ ...current, country: value }))}
              required
            />
          </div>

          <TextField
            label="Ticket URL"
            value={draft.ticketUrl}
            onChange={(value) => setDraft((current) => ({ ...current, ticketUrl: value }))}
          />

          <div className="grid gap-3 md:grid-cols-2">
            <CheckboxField
              label="Sold out"
              checked={draft.soldOut}
              onChange={(checked) => setDraft((current) => ({ ...current, soldOut: checked }))}
            />
            <CheckboxField
              label="Published"
              checked={draft.published}
              onChange={(checked) => setDraft((current) => ({ ...current, published: checked }))}
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <button type="submit" className={buttonPrimary}>
              {selectedShow ? "Save show" : "Create show"}
            </button>
            {selectedShow && (
              <button type="button" onClick={remove} className={buttonDanger}>
                Delete
              </button>
            )}
          </div>

          {notice.message && (
            <p className={`text-sm ${notice.kind === "error" ? "text-red-300" : "text-zinc-300"}`}>
              {notice.message}
            </p>
          )}
        </form>
      </section>
    </div>
  );
}

function ProductPanel({
  products,
  releases,
  onRefresh,
}: {
  products: SiteProduct[];
  releases: SiteRelease[];
  onRefresh: () => void;
}) {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(products[0]?.slug ?? null);
  const [draft, setDraft] = useState<ProductDraft>(() => makeProductDraft(products[0]));
  const [notice, setNotice] = useState<Notice>({ kind: "idle", message: "" });

  const selectedProduct = selectedSlug
    ? products.find((product) => product.slug === selectedSlug) ?? null
    : null;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!draft.title.trim() || !draft.slug.trim() || !draft.priceMinor.trim()) {
      setNotice({ kind: "error", message: "Required merch fields are missing." });
      return;
    }

    const priceMinor = Number.parseInt(draft.priceMinor, 10);
    if (!Number.isFinite(priceMinor) || priceMinor <= 0) {
      setNotice({ kind: "error", message: "Price must be a positive whole number." });
      return;
    }

    let imagePublicIds: string[];
    let variants: ReturnType<typeof parseVariants> | undefined;

    try {
      imagePublicIds = parseList(draft.imagePublicIds);
      variants = selectedProduct ? undefined : parseVariants(draft.variants);
    } catch (error) {
      setNotice({ kind: "error", message: errorMessage(error, "Invalid merch data.") });
      return;
    }

    const payload = selectedProduct
      ? {
          title: draft.title.trim(),
          description: draft.description.trim() || undefined,
          priceMinor,
          active: draft.active,
          imagePublicIds,
        }
      : {
          title: draft.title.trim(),
          slug: draft.slug.trim(),
          description: draft.description.trim() || undefined,
          releaseId: draft.releaseId.trim() || undefined,
          deliveryType: draft.deliveryType,
          priceMinor,
          currency: draft.currency.trim().toUpperCase() || "NGN",
          imagePublicIds,
          variants,
        };

    const response = await sendJson(
      selectedProduct ? `/api/products/${encodeURIComponent(selectedProduct.slug)}` : "/api/products",
      {
        method: selectedProduct ? "PATCH" : "POST",
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      setNotice({ kind: "error", message: response.message });
      return;
    }

    setNotice({ kind: "success", message: selectedProduct ? "Product saved." : "Product created." });
    onRefresh();
  }

  async function remove() {
    if (!selectedProduct) return;
    if (!window.confirm("Delete this product?")) return;

    const response = await sendJson(`/api/products/${encodeURIComponent(selectedProduct.slug)}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      setNotice({ kind: "error", message: response.message });
      return;
    }

    setSelectedSlug(null);
    setNotice({ kind: "success", message: "Product deleted." });
    onRefresh();
  }

  const coverHue = selectedProduct?.cover.hue ?? hueFromString(draft.imagePublicIds.split("\n")[0] || draft.title || draft.slug || "merch");
  const coverLabel = selectedProduct?.cover.label ?? initials(draft.title || draft.slug || "FX");
  const linkedRelease = selectedProduct?.releaseTitle
    ? `${selectedProduct.releaseTitle}${selectedProduct.releaseSlug ? ` (${selectedProduct.releaseSlug})` : ""}`
    : "None";
  const deliveryType = selectedProduct?.deliveryType ?? draft.deliveryType;

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
      <section className={panelClass}>
        <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
          <div>
            <p className="text-eyebrow">Merch</p>
            <h2 className="mt-1 font-display text-3xl text-accent">Products</h2>
          </div>
          <button
            type="button"
            onClick={() => {
              setSelectedSlug(null);
              setDraft(makeProductDraft(null));
              setNotice({ kind: "idle", message: "" });
            }}
            className={buttonSecondary}
          >
            New
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-sm">
            <thead className="bg-white/[0.02] text-left">
              <tr>
                <Th>Name</Th>
                <Th>Category</Th>
                <Th>Type</Th>
                <Th>Price</Th>
                <Th>Status</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {products.map((product) => {
                const selected = product.slug === selectedSlug;
                return (
                  <tr
                    key={product.slug}
                    className={`transition-colors ${selected ? "bg-white/[0.03]" : "hover:bg-white/[0.02]"}`}
                    onClick={() => {
                      setSelectedSlug(product.slug);
                      setDraft(makeProductDraft(product));
                      setNotice({ kind: "idle", message: "" });
                    }}
                  >
                    <Td>
                      <button
                        type="button"
                        className="text-left text-zinc-100 hover:text-accent"
                        onClick={(event) => {
                          event.stopPropagation();
                          setSelectedSlug(product.slug);
                          setDraft(makeProductDraft(product));
                          setNotice({ kind: "idle", message: "" });
                        }}
                      >
                        {product.name}
                      </button>
                    </Td>
                    <Td>{product.category}</Td>
                    <Td>{formatEnum(product.deliveryType ?? (product.digital ? "DIGITAL" : "PHYSICAL"))}</Td>
                    <Td>{product.priceLabel}</Td>
                    <Td>
                      <span
                        className={`rounded-full border px-2 py-1 text-[10px] uppercase tracking-[0.2em] ${
                          product.active === false
                            ? "border-white/10 text-muted-foreground"
                            : "border-accent/30 text-accent"
                        }`}
                      >
                        {product.active === false ? "Inactive" : "Active"}
                      </span>
                    </Td>
                    <Td className="text-right">
                      <button
                        type="button"
                        className={buttonSecondary}
                        onClick={(event) => {
                          event.stopPropagation();
                          setSelectedSlug(product.slug);
                          setDraft(makeProductDraft(product));
                          setNotice({ kind: "idle", message: "" });
                        }}
                      >
                        Edit
                      </button>
                    </Td>
                  </tr>
                );
              })}
              {products.length === 0 && (
                <tr>
                  <Td colSpan={6} className="py-8 text-center text-muted-foreground">
                    No products yet.
                  </Td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className={panelClass}>
        <div className="border-b border-white/5 px-5 py-4">
          <p className="text-eyebrow">{selectedProduct ? "Edit merch" : "Create merch"}</p>
          <h3 className="mt-1 font-display text-4xl text-accent">
            {selectedProduct ? selectedProduct.name : "New product"}
          </h3>
        </div>

        <div className="space-y-6 p-5">
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_148px]">
            <div className="space-y-4">
              <form className="space-y-4" onSubmit={submit}>
                <div className="grid gap-4 md:grid-cols-2">
                  <TextField
                    label="Title"
                    value={draft.title}
                    onChange={(value) => setDraft((current) => ({ ...current, title: value }))}
                    required
                  />
                  <TextField
                    label="Price minor"
                    type="number"
                    value={draft.priceMinor}
                    onChange={(value) => setDraft((current) => ({ ...current, priceMinor: value }))}
                    required
                    min={1}
                  />
                  {!selectedProduct ? (
                    <TextField
                      label="Slug"
                      value={draft.slug}
                      onChange={(value) => setDraft((current) => ({ ...current, slug: value }))}
                      required
                    />
                  ) : (
                    <TextField label="Slug" value={selectedProduct.slug} onChange={() => {}} disabled />
                  )}
                  {!selectedProduct ? (
                    <SelectField
                      label="Delivery type"
                      value={draft.deliveryType}
                      onChange={(value) =>
                        setDraft((current) => ({
                          ...current,
                          deliveryType: value as "DIGITAL" | "PHYSICAL",
                        }))
                      }
                      options={[
                        { value: "PHYSICAL", label: "Physical" },
                        { value: "DIGITAL", label: "Digital" },
                      ]}
                    />
                  ) : (
                    <TextField
                      label="Delivery type"
                      value={selectedProduct.deliveryType ?? (selectedProduct.digital ? "DIGITAL" : "PHYSICAL")}
                      onChange={() => {}}
                      disabled
                    />
                  )}
                  {!selectedProduct ? (
                    <TextField
                      label="Currency"
                      value={draft.currency}
                      onChange={(value) => setDraft((current) => ({ ...current, currency: value }))}
                      required
                      maxLength={3}
                    />
                  ) : (
                    <TextField label="Currency" value={selectedProduct.currency} onChange={() => {}} disabled />
                  )}
                </div>

                {!selectedProduct ? (
                  <SelectField
                    label="Linked release"
                    value={draft.releaseId}
                    onChange={(value) => setDraft((current) => ({ ...current, releaseId: value }))}
                    options={[
                      { value: "", label: "None" },
                      ...releases
                        .filter((release) => Boolean(release.id))
                        .map((release) => ({
                          value: release.id as string,
                          label: release.title,
                        })),
                    ]}
                  />
                ) : (
                  <TextField label="Linked release" value={linkedRelease} onChange={() => {}} disabled />
                )}

                <TextAreaField
                  label="Description"
                  value={draft.description}
                  onChange={(value) => setDraft((current) => ({ ...current, description: value }))}
                  rows={4}
                />

                <TextAreaField
                  label="Image keys"
                  value={draft.imagePublicIds}
                  onChange={(value) => setDraft((current) => ({ ...current, imagePublicIds: value }))}
                  rows={4}
                />

                {!selectedProduct ? (
                  <TextAreaField
                    label="Variants"
                    value={draft.variants}
                    onChange={(value) => setDraft((current) => ({ ...current, variants: value }))}
                    rows={5}
                  />
                ) : (
                  <div className="space-y-3">
                    <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                      Variants
                    </p>
                    <div className="space-y-2">
                      {selectedProduct.variants.map((variant) => (
                        <div
                          key={variant.id ?? variant.label}
                          className="rounded-md border border-white/5 px-3 py-2 text-sm"
                        >
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-zinc-100">{variant.label}</span>
                            <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                              {variant.sku ?? "SKU"}
                            </span>
                          </div>
                          <div className="mt-1 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                            {variant.stock ?? "Unlimited"}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <CheckboxField
                  label="Active"
                  checked={draft.active}
                  onChange={(checked) => setDraft((current) => ({ ...current, active: checked }))}
                />

                <div className="flex flex-wrap gap-3">
                  <button type="submit" className={buttonPrimary}>
                    {selectedProduct ? "Save product" : "Create product"}
                  </button>
                  {selectedProduct && (
                    <button type="button" onClick={remove} className={buttonDanger}>
                      Delete
                    </button>
                  )}
                </div>

                {notice.message && (
                  <p className={`text-sm ${notice.kind === "error" ? "text-red-300" : "text-zinc-300"}`}>
                    {notice.message}
                  </p>
                )}
              </form>
            </div>

            <div className="space-y-3">
              <CoverArt hue={coverHue} label={coverLabel} aspect="portrait" className="w-full" />
              <div className="rounded-md border border-white/5 bg-white/[0.02] p-3 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                {deliveryType === "DIGITAL" ? "Digital" : "Physical"} / {selectedProduct?.currency ?? draft.currency}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function OrdersPanel({
  orders,
  onRefresh,
}: {
  orders: AdminOrder[];
  onRefresh: () => void;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(orders[0]?.id ?? null);
  const [fulfillmentStatus, setFulfillmentStatus] = useState("UNFULFILLED");
  const [notice, setNotice] = useState<Notice>({ kind: "idle", message: "" });

  const selectedOrder = selectedId ? orders.find((order) => order.id === selectedId) ?? null : null;

  async function applyFulfillment() {
    if (!selectedOrder) return;

    const response = await sendJson(`/api/admin/orders/${encodeURIComponent(selectedOrder.id)}`, {
      method: "PATCH",
      body: JSON.stringify({ fulfillmentStatus }),
    });

    if (!response.ok) {
      setNotice({ kind: "error", message: response.message });
      return;
    }

    setNotice({ kind: "success", message: "Fulfillment updated." });
    onRefresh();
  }

  async function refundOrder() {
    if (!selectedOrder) return;
    if (!window.confirm("Mark this order as refunded?")) return;

    const response = await sendJson(`/api/admin/orders/${encodeURIComponent(selectedOrder.id)}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "REFUNDED" }),
    });

    if (!response.ok) {
      setNotice({ kind: "error", message: response.message });
      return;
    }

    setNotice({ kind: "success", message: "Order refunded." });
    onRefresh();
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
      <section className={panelClass}>
        <div className="border-b border-white/5 px-4 py-3">
          <p className="text-eyebrow">Commerce</p>
          <h2 className="mt-1 font-display text-3xl text-accent">Orders</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="bg-white/[0.02] text-left">
              <tr>
                <Th>Order</Th>
                <Th>Customer</Th>
                <Th>Total</Th>
                <Th>Status</Th>
                <Th>Items</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {orders.map((order) => {
                const selected = order.id === selectedId;
                return (
                  <tr
                    key={order.id}
                    className={`cursor-pointer transition-colors ${selected ? "bg-white/[0.03]" : "hover:bg-white/[0.02]"}`}
                    onClick={() => {
                      setSelectedId(order.id);
                      const physical = order.itemsDetailed.find((item) => item.deliveryType === "PHYSICAL");
                      setFulfillmentStatus(physical?.fulfillmentStatus ?? "UNFULFILLED");
                      setNotice({ kind: "idle", message: "" });
                    }}
                  >
                    <Td>{order.shortId}</Td>
                    <Td>{order.customer}</Td>
                    <Td>{order.total}</Td>
                    <Td>
                      <span
                        className={`rounded-full border px-2 py-1 text-[10px] uppercase tracking-[0.2em] ${
                          order.status === "REFUNDED"
                            ? "border-red-500/30 text-red-200"
                            : order.status === "FAILED"
                              ? "border-amber-500/30 text-amber-200"
                              : "border-accent/30 text-accent"
                        }`}
                      >
                        {formatEnum(order.status)}
                      </span>
                    </Td>
                    <Td className="max-w-[24rem] truncate text-zinc-300">{order.items}</Td>
                  </tr>
                );
              })}
              {orders.length === 0 && (
                <tr>
                  <Td colSpan={5} className="py-8 text-center text-muted-foreground">
                    No orders yet.
                  </Td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className={panelClass}>
        <div className="border-b border-white/5 px-5 py-4">
          <p className="text-eyebrow">Order detail</p>
          <h3 className="mt-1 font-display text-4xl text-accent">{selectedOrder?.shortId ?? "No order"}</h3>
        </div>

        {selectedOrder ? (
          <div className="space-y-5 p-5">
            <div className="grid gap-3 md:grid-cols-2">
              <KeyValue label="Customer" value={selectedOrder.customer} />
              <KeyValue label="Status" value={formatEnum(selectedOrder.status)} />
              <KeyValue label="Total" value={selectedOrder.total} />
              <KeyValue label="Ref" value={selectedOrder.paystackReference} />
              <KeyValue label="Created" value={formatDateTime(selectedOrder.createdAt)} />
              <KeyValue label="Order id" value={selectedOrder.id} mono />
            </div>

            <div>
              <p className="text-eyebrow">Shipping</p>
              <pre className="mt-3 overflow-x-auto rounded-md border border-white/5 bg-white/[0.02] p-4 text-xs leading-relaxed text-zinc-300">
                {selectedOrder.shippingAddress || "None"}
              </pre>
            </div>

            <div>
              <p className="text-eyebrow">Items</p>
              <div className="mt-3 space-y-2">
                {selectedOrder.itemsDetailed.map((item) => (
                  <div
                    key={`${selectedOrder.id}-${item.label}-${item.quantity}`}
                    className="rounded-md border border-white/5 px-3 py-2"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm text-zinc-100">{item.label}</span>
                      <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                        x{item.quantity}
                      </span>
                    </div>
                    <div className="mt-1 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                      {formatEnum(item.deliveryType)} / {formatEnum(item.fulfillmentStatus)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <SelectField
                label="Physical fulfillment"
                value={fulfillmentStatus}
                onChange={setFulfillmentStatus}
                disabled={!selectedOrder.itemsDetailed.some((item) => item.deliveryType === "PHYSICAL")}
                options={[
                  { value: "UNFULFILLED", label: "Unfulfilled" },
                  { value: "SHIPPED", label: "Shipped" },
                  { value: "DELIVERED", label: "Delivered" },
                ]}
              />
              <div className="flex flex-wrap gap-3">
                <button type="button" className={buttonPrimary} onClick={applyFulfillment}>
                  Apply
                </button>
                <button
                  type="button"
                  className={buttonDanger}
                  onClick={refundOrder}
                  disabled={selectedOrder.status === "REFUNDED"}
                >
                  Refund
                </button>
              </div>
            </div>

            {notice.message && (
              <p className={`text-sm ${notice.kind === "error" ? "text-red-300" : "text-zinc-300"}`}>
                {notice.message}
              </p>
            )}
          </div>
        ) : (
          <div className="p-5 text-sm text-muted-foreground">No order selected.</div>
        )}
      </section>
    </div>
  );
}

function InquiryPanel({
  inquiries,
  onRefresh,
}: {
  inquiries: AdminInquiry[];
  onRefresh: () => void;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(inquiries[0]?.id ?? null);
  const [notice, setNotice] = useState<Notice>({ kind: "idle", message: "" });

  const selectedInquiry = selectedId ? inquiries.find((inquiry) => inquiry.id === selectedId) ?? null : null;

  async function toggleHandled() {
    if (!selectedInquiry) return;

    const response = await sendJson(`/api/inquiries/${encodeURIComponent(selectedInquiry.id)}`, {
      method: "PATCH",
      body: JSON.stringify({ handled: !selectedInquiry.handled }),
    });

    if (!response.ok) {
      setNotice({ kind: "error", message: response.message });
      return;
    }

    setNotice({
      kind: "success",
      message: selectedInquiry.handled ? "Inquiry reopened." : "Inquiry handled.",
    });
    onRefresh();
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
      <section className={panelClass}>
        <div className="border-b border-white/5 px-4 py-3">
          <p className="text-eyebrow">Inbox</p>
          <h2 className="mt-1 font-display text-3xl text-accent">Inquiries</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="bg-white/[0.02] text-left">
              <tr>
                <Th>Type</Th>
                <Th>Name</Th>
                <Th>Email</Th>
                <Th>Handled</Th>
                <Th>Date</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {inquiries.map((inquiry) => {
                const selected = inquiry.id === selectedId;
                return (
                  <tr
                    key={inquiry.id}
                    className={`cursor-pointer transition-colors ${selected ? "bg-white/[0.03]" : "hover:bg-white/[0.02]"}`}
                    onClick={() => {
                      setSelectedId(inquiry.id);
                      setNotice({ kind: "idle", message: "" });
                    }}
                  >
                    <Td>{formatEnum(inquiry.type)}</Td>
                    <Td>{inquiry.name}</Td>
                    <Td>{inquiry.email}</Td>
                    <Td>
                      <span
                        className={`rounded-full border px-2 py-1 text-[10px] uppercase tracking-[0.2em] ${
                          inquiry.handled
                            ? "border-accent/30 text-accent"
                            : "border-white/10 text-muted-foreground"
                        }`}
                      >
                        {inquiry.handled ? "Handled" : "Open"}
                      </span>
                    </Td>
                    <Td>{formatDateTime(inquiry.createdAt)}</Td>
                  </tr>
                );
              })}
              {inquiries.length === 0 && (
                <tr>
                  <Td colSpan={5} className="py-8 text-center text-muted-foreground">
                    No inquiries yet.
                  </Td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className={panelClass}>
        <div className="border-b border-white/5 px-5 py-4">
          <p className="text-eyebrow">Message</p>
          <h3 className="mt-1 font-display text-4xl text-accent">
            {selectedInquiry ? selectedInquiry.name : "No inquiry"}
          </h3>
        </div>

        {selectedInquiry ? (
          <div className="space-y-5 p-5">
            <div className="grid gap-3 md:grid-cols-2">
              <KeyValue label="Type" value={formatEnum(selectedInquiry.type)} />
              <KeyValue label="Handled" value={selectedInquiry.handled ? "Yes" : "No"} />
              <KeyValue label="Email" value={selectedInquiry.email} />
              <KeyValue label="Created" value={formatDateTime(selectedInquiry.createdAt)} />
            </div>

            <div>
              <p className="text-eyebrow">Message</p>
              <pre className="mt-3 overflow-x-auto rounded-md border border-white/5 bg-white/[0.02] p-4 text-sm leading-relaxed text-zinc-300">
                {selectedInquiry.message}
              </pre>
            </div>

            {selectedInquiry.details && (
              <div>
                <p className="text-eyebrow">Details</p>
                <pre className="mt-3 overflow-x-auto rounded-md border border-white/5 bg-white/[0.02] p-4 text-xs leading-relaxed text-zinc-300">
                  {selectedInquiry.details}
                </pre>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <button type="button" className={buttonPrimary} onClick={toggleHandled}>
                {selectedInquiry.handled ? "Reopen" : "Mark handled"}
              </button>
            </div>

            {notice.message && (
              <p className={`text-sm ${notice.kind === "error" ? "text-red-300" : "text-zinc-300"}`}>
                {notice.message}
              </p>
            )}
          </div>
        ) : (
          <div className="p-5 text-sm text-muted-foreground">No inquiry selected.</div>
        )}
      </section>
    </div>
  );
}

function PressPanel({
  assets,
  onRefresh,
}: {
  assets: AdminPressAsset[];
  onRefresh: () => void;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(assets[0]?.id ?? null);
  const [draft, setDraft] = useState<PressDraft>({
    type: "photo",
    label: "",
    publicId: "",
    url: "",
  });
  const [notice, setNotice] = useState<Notice>({ kind: "idle", message: "" });

  const selectedAsset = selectedId ? assets.find((asset) => asset.id === selectedId) ?? null : null;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!draft.label.trim()) {
      setNotice({ kind: "error", message: "Label is required." });
      return;
    }

    if (draft.type === "video_link") {
      if (!draft.url.trim()) {
        setNotice({ kind: "error", message: "URL is required." });
        return;
      }
    } else if (!draft.publicId.trim()) {
      setNotice({ kind: "error", message: "Public id is required." });
      return;
    }

    const payload =
      draft.type === "video_link"
        ? {
            type: draft.type,
            label: draft.label.trim(),
            url: draft.url.trim(),
          }
        : {
            type: draft.type,
            label: draft.label.trim(),
            publicId: draft.publicId.trim(),
          };

    const response = await sendJson("/api/press", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      setNotice({ kind: "error", message: response.message });
      return;
    }

    setDraft({ type: "photo", label: "", publicId: "", url: "" });
    setNotice({ kind: "success", message: "Press asset created." });
    onRefresh();
  }

  async function remove() {
    if (!selectedAsset) return;
    if (!window.confirm("Delete this press asset?")) return;

    const response = await sendJson(`/api/press/${encodeURIComponent(selectedAsset.id)}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      setNotice({ kind: "error", message: response.message });
      return;
    }

    setSelectedId(assets.find((asset) => asset.id !== selectedAsset.id)?.id ?? null);
    setNotice({ kind: "success", message: "Press asset deleted." });
    onRefresh();
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
      <section className={panelClass}>
        <div className="border-b border-white/5 px-4 py-3">
          <p className="text-eyebrow">EPK</p>
          <h2 className="mt-1 font-display text-3xl text-accent">Press Kit</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="bg-white/[0.02] text-left">
              <tr>
                <Th>Asset</Th>
                <Th>Type</Th>
                <Th>Source</Th>
                <Th>Updated</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {assets.map((asset) => {
                const selected = asset.id === selectedId;
                return (
                  <tr
                    key={asset.id}
                    className={`cursor-pointer transition-colors ${selected ? "bg-white/[0.03]" : "hover:bg-white/[0.02]"}`}
                    onClick={() => {
                      setSelectedId(asset.id);
                      setNotice({ kind: "idle", message: "" });
                    }}
                  >
                    <Td>{asset.label}</Td>
                    <Td>{formatEnum(asset.type)}</Td>
                    <Td>{asset.fileKey ? "Cloudinary" : asset.url ? "Link" : asset.size}</Td>
                    <Td>{asset.updated}</Td>
                    <Td className="text-right">
                      <button
                        type="button"
                        className={buttonSecondary}
                        onClick={(event) => {
                          event.stopPropagation();
                          setSelectedId(asset.id);
                          setNotice({ kind: "idle", message: "" });
                        }}
                      >
                        View
                      </button>
                    </Td>
                  </tr>
                );
              })}
              {assets.length === 0 && (
                <tr>
                  <Td colSpan={5} className="py-8 text-center text-muted-foreground">
                    No press assets yet.
                  </Td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="space-y-6">
        <section className={panelClass}>
          <div className="border-b border-white/5 px-5 py-4">
            <p className="text-eyebrow">Create asset</p>
            <h3 className="mt-1 font-display text-4xl text-accent">New press item</h3>
          </div>

          <form className="space-y-4 p-5" onSubmit={submit}>
            <div className="grid gap-4 md:grid-cols-2">
              <SelectField
                label="Type"
                value={draft.type}
                onChange={(value) =>
                  setDraft((current) => ({
                    ...current,
                    type: value as PressDraft["type"],
                  }))
                }
                options={[
                  { value: "photo", label: "Photo" },
                  { value: "rider", label: "Rider" },
                  { value: "bio", label: "Bio" },
                  { value: "video_link", label: "Video link" },
                ]}
              />
              <TextField
                label="Label"
                value={draft.label}
                onChange={(value) => setDraft((current) => ({ ...current, label: value }))}
                required
              />
            </div>

            {draft.type === "video_link" ? (
              <TextField
                label="URL"
                value={draft.url}
                onChange={(value) => setDraft((current) => ({ ...current, url: value }))}
                required
              />
            ) : (
              <TextField
                label="Public id"
                value={draft.publicId}
                onChange={(value) => setDraft((current) => ({ ...current, publicId: value }))}
                required
              />
            )}

            <div className="flex flex-wrap gap-3">
              <button type="submit" className={buttonPrimary}>
                Create asset
              </button>
            </div>

            {notice.message && (
              <p className={`text-sm ${notice.kind === "error" ? "text-red-300" : "text-zinc-300"}`}>
                {notice.message}
              </p>
            )}
          </form>
        </section>

        <section className={panelClass}>
          <div className="border-b border-white/5 px-5 py-4">
            <p className="text-eyebrow">Selected asset</p>
            <h3 className="mt-1 font-display text-4xl text-accent">
              {selectedAsset ? selectedAsset.label : "None"}
            </h3>
          </div>

          {selectedAsset ? (
            <div className="space-y-4 p-5">
              <div className="grid gap-3 md:grid-cols-2">
                <KeyValue label="Type" value={formatEnum(selectedAsset.type)} />
                <KeyValue label="Updated" value={selectedAsset.updated} />
                <KeyValue label="Source" value={selectedAsset.fileKey ? "Cloudinary" : selectedAsset.url ? "Link" : selectedAsset.size} />
                <KeyValue label="ID" value={selectedAsset.id} mono />
              </div>

              {selectedAsset.fileKey && (
                <div>
                  <p className="text-eyebrow">Public id</p>
                  <pre className="mt-3 overflow-x-auto rounded-md border border-white/5 bg-white/[0.02] p-4 text-xs leading-relaxed text-zinc-300">
                    {selectedAsset.fileKey}
                  </pre>
                </div>
              )}

              {selectedAsset.url && (
                <div>
                  <p className="text-eyebrow">URL</p>
                  <pre className="mt-3 overflow-x-auto rounded-md border border-white/5 bg-white/[0.02] p-4 text-xs leading-relaxed text-zinc-300">
                    {selectedAsset.url}
                  </pre>
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <button type="button" className={buttonDanger} onClick={remove}>
                  Delete
                </button>
              </div>
            </div>
          ) : (
            <div className="p-5 text-sm text-muted-foreground">No asset selected.</div>
          )}
        </section>

        <UploadSignaturePanel />
      </div>
    </div>
  );
}

function UploadSignaturePanel() {
  const [assetType, setAssetType] = useState("photo");
  const [result, setResult] = useState<UploadResult>(null);
  const [notice, setNotice] = useState<Notice>({ kind: "idle", message: "" });

  async function requestSignature() {
    const response = await sendJson("/api/upload-signature", {
      method: "POST",
      body: JSON.stringify({ assetType }),
    });

    if (!response.ok) {
      setNotice({ kind: "error", message: response.message });
      return;
    }

    setResult(response.data as UploadResult);
    setNotice({ kind: "success", message: "Signature ready." });
  }

  return (
    <section className={panelClass}>
      <div className="border-b border-white/5 px-5 py-4">
        <p className="text-eyebrow">Uploads</p>
        <h3 className="mt-1 font-display text-4xl text-accent">Upload Signature</h3>
      </div>

      <div className="space-y-4 p-5">
        <SelectField
          label="Asset type"
          value={assetType}
          onChange={setAssetType}
          options={[
            { value: "cover", label: "Cover" },
            { value: "photo", label: "Photo" },
            { value: "preview", label: "Preview" },
            { value: "track", label: "Track" },
            { value: "rider", label: "Rider" },
            { value: "merch", label: "Merch" },
          ]}
        />

        <div className="flex flex-wrap gap-3">
          <button type="button" className={buttonPrimary} onClick={requestSignature}>
            Request
          </button>
        </div>

        {result && (
          <pre className="overflow-x-auto rounded-md border border-white/5 bg-white/[0.02] p-4 text-xs leading-relaxed text-zinc-300">
            {JSON.stringify(result, null, 2)}
          </pre>
        )}

        {notice.message && (
          <p className={`text-sm ${notice.kind === "error" ? "text-red-300" : "text-zinc-300"}`}>
            {notice.message}
          </p>
        )}
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-md border border-white/5 bg-surface/40 p-5">
      <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{label}</div>
      <div className="mt-2 font-display text-4xl text-accent">{value}</div>
    </div>
  );
}

function Th({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <th className={`px-4 py-3 text-[10px] uppercase tracking-[0.25em] text-muted-foreground ${className}`}>
      {children}
    </th>
  );
}

function Td({
  children,
  className = "",
  colSpan,
}: {
  children: ReactNode;
  className?: string;
  colSpan?: number;
}) {
  return (
    <td className={`px-4 py-3 text-zinc-200 ${className}`} colSpan={colSpan}>
      {children}
    </td>
  );
}

function TextField({
  label,
  value,
  onChange,
  type = "text",
  disabled = false,
  placeholder,
  required = false,
  min,
  max,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  disabled?: boolean;
  placeholder?: string;
  required?: boolean;
  min?: number | string;
  max?: number | string;
  maxLength?: number;
}) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        required={required}
        min={min}
        max={max}
        maxLength={maxLength}
        className={inputClass}
      />
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  rows = 4,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  disabled?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={rows}
        disabled={disabled}
        className={textareaClass}
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className={selectClass}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function CheckboxField({
  label,
  checked,
  onChange,
  disabled = false,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label className="flex items-center gap-3 rounded-md border border-white/5 bg-white/[0.02] px-3 py-3 text-sm text-zinc-200">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        disabled={disabled}
        className="h-4 w-4 rounded border-white/20 bg-surface/40 text-accent focus:ring-accent"
      />
      <span>{label}</span>
    </label>
  );
}

function KeyValue({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-md border border-white/5 bg-white/[0.02] px-3 py-2">
      <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{label}</div>
      <div className={`mt-1 text-sm ${mono ? "font-mono text-xs text-zinc-300" : "text-zinc-100"}`}>
        {value}
      </div>
    </div>
  );
}

function makeReleaseDraft(release?: SiteRelease | null): ReleaseDraft {
  return {
    title: release?.title ?? "",
    slug: release?.slug ?? "",
    releaseDate: release?.releaseDate ?? "",
    coverPublicId: release?.coverPublicId ?? "",
    description: release?.blurb ?? "",
    streamingLinks: release ? JSON.stringify(release.streaming, null, 2) : "",
    tracks: release ? release.tracks.map((track) => `${track.no} | ${track.title} | ${track.length}`).join("\n") : "",
    published: release?.published ?? false,
  };
}

function makeShowDraft(show?: SiteShow | null): ShowDraft {
  return {
    date: show?.date ?? "",
    venueName: show?.venue ?? "",
    city: show?.city ?? "",
    country: show?.country ?? "",
    ticketUrl: show?.ticketUrl && show.ticketUrl !== "#" ? show.ticketUrl : "",
    soldOut: show?.status === "sold_out",
    published: show?.published ?? true,
  };
}

function makeProductDraft(product?: SiteProduct | null): ProductDraft {
  return {
    title: product?.name ?? "",
    slug: product?.slug ?? "",
    description: product?.description ?? "",
    releaseId: product?.releaseId ?? "",
    deliveryType: product?.deliveryType ?? (product?.digital ? "DIGITAL" : "PHYSICAL"),
    priceMinor: String(product?.priceMinor ?? Math.round((product?.price ?? 0) * 100)),
    currency: product?.currency ?? "NGN",
    imagePublicIds: product?.imagePublicIds?.join("\n") ?? "",
    variants: product
      ? product.variants
          .map(
            (variant) =>
              `${variant.label} | ${variant.sku ?? slugify(variant.label)} | ${variant.stock ?? ""} | ${
                variant.digitalPublicId ?? ""
              }`
          )
          .join("\n")
      : "",
    active: product?.active ?? true,
  };
}

function parseJsonRecord(value: string): Record<string, string> | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  const parsed = JSON.parse(trimmed);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Expected a JSON object.");
  }

  return Object.fromEntries(
    Object.entries(parsed).map(([key, item]) => [key, String(item)])
  );
}

function parseList(value: string): string[] {
  return value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseTracks(value: string) {
  const rows = parseList(value);
  return rows.map((row, index) => {
    const [rawNumber, rawTitle, rawDuration, rawPreview, rawFull] = row.split("|").map((item) => item.trim());
    const trackNumber = Number.parseInt(rawNumber || String(index + 1), 10);
    if (!Number.isFinite(trackNumber) || trackNumber <= 0) {
      throw new Error(`Invalid track number on row ${index + 1}.`);
    }

    const durationSec = parseDuration(rawDuration);
    return {
      title: rawTitle || `Track ${trackNumber}`,
      trackNumber,
      ...(durationSec ? { durationSec } : {}),
      ...(rawPreview ? { previewPublicId: rawPreview } : {}),
      ...(rawFull ? { fullFilePublicId: rawFull } : {}),
    };
  });
}

function parseVariants(value: string) {
  const rows = parseList(value);
  if (rows.length === 0) {
    throw new Error("At least one variant is required.");
  }

  return rows.map((row, index) => {
    const [label, sku, stock, digitalPublicId] = row.split("|").map((item) => item.trim());
    if (!label || !sku) {
      throw new Error(`Variant ${index + 1} needs a label and sku.`);
    }

    const parsedStock = stock ? Number.parseInt(stock, 10) : null;
    if (stock && (parsedStock === null || !Number.isFinite(parsedStock) || parsedStock < 0)) {
      throw new Error(`Invalid stock on row ${index + 1}.`);
    }

    return {
      label,
      sku,
      ...(parsedStock !== null ? { stock: parsedStock } : {}),
      ...(digitalPublicId ? { digitalPublicId } : {}),
    };
  });
}

function parseDuration(value?: string) {
  if (!value) return undefined;
  if (value.includes(":")) {
    const [minutesRaw, secondsRaw] = value.split(":");
    const minutes = Number.parseInt(minutesRaw, 10);
    const seconds = Number.parseInt(secondsRaw, 10);
    if (Number.isFinite(minutes) && Number.isFinite(seconds)) {
      return minutes * 60 + seconds;
    }
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function toIsoDate(value: string) {
  return new Date(`${value}T00:00:00.000Z`).toISOString();
}

async function sendJson<T = unknown>(
  url: string,
  init: RequestInit = {}
): Promise<{ ok: true; data: T } | { ok: false; message: string }> {
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });

  const text = await response.text();
  const data = text ? safeJsonParse(text) : null;

  if (!response.ok) {
    return {
      ok: false,
      message: extractErrorMessage(data, `Request failed (${response.status})`),
    };
  }

  return {
    ok: true,
    data: data as T,
  };
}

function safeJsonParse(value: string) {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return value;
  }
}

function extractErrorMessage(body: unknown, fallback: string) {
  if (typeof body === "string" && body.trim()) {
    return body;
  }

  if (body && typeof body === "object") {
    const record = body as Record<string, unknown>;
    if (typeof record.error === "string") return record.error;
    if (record.error) return JSON.stringify(record.error);
  }

  return fallback;
}

function errorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return fallback;
}

function formatEnum(value: string) {
  return value.toLowerCase().replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
}

function hueFromString(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) % 24;
  }
  return 348 + hash;
}

function initials(value: string) {
  const words = value.match(/[a-z0-9]+/gi) ?? [value];
  return (
    words
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase() ?? "")
      .join("") || "FX"
  );
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
