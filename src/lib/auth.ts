import { NextRequest, NextResponse } from "next/server";
import { withSession } from "supertokens-node/nextjs";
import { SessionContainer } from "supertokens-node/recipe/session";
import { ensureSuperTokensInit } from "../../config/backend";
import { prisma } from "@/lib/prisma";

// ── Types ────────────────────────────────────────────────────────────────

export type StaffRole = "ADMIN" | "EDITOR";

export interface StaffSessionPayload {
  staffId: string;
  superTokensId: string;
  role: StaffRole;
}

export interface CustomerSessionPayload {
  customerId: string;
  superTokensId: string;
  email: string;
}

// ── Session helpers ──────────────────────────────────────────────────────

/**
 * Wraps a route handler with customer session verification.
 * The callback receives a verified CustomerSessionPayload — no DB call
 * needed in the route handler to check auth.
 *
 * Usage in a route:
 *   export function GET(req: NextRequest) {
 *     return withCustomerSession(req, async (session) => {
 *       // session.customerId is verified
 *     });
 *   }
 */
export function withCustomerSession(
  req: NextRequest,
  handler: (session: CustomerSessionPayload) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    ensureSuperTokensInit();
  } catch {
    return Promise.resolve(
      NextResponse.json({ error: "Authentication is not configured" }, { status: 503 })
    );
  }
  return withSession(req, async (err, session: SessionContainer | undefined) => {
    if (err) return NextResponse.json({ error: "session error" }, { status: 500 });
    if (!session) return new NextResponse("Authentication required", { status: 401 });

    const superTokensId = session.getUserId();
    const customer = await prisma.customer.findUnique({
      where: { superTokensId },
      select: { id: true, email: true, superTokensId: true },
    });

    if (!customer) {
      // Session exists in SuperTokens but no Customer row yet — auto-create.
      // This handles the case where a user signed up via SuperTokens but the
      // Customer record wasn't created (e.g. race condition or first login).
      const stUser = await import("supertokens-node").then((m) =>
        m.default.getUser(superTokensId)
      );
      const email = stUser?.emails?.[0] ?? "";
      const newCustomer = await prisma.customer.create({
        data: { superTokensId, email },
        select: { id: true, email: true, superTokensId: true },
      });
      return handler({ customerId: newCustomer.id, superTokensId, email: newCustomer.email });
    }

    return handler({ customerId: customer.id, superTokensId, email: customer.email });
  }) as Promise<NextResponse>;
}

/**
 * Wraps a route handler with staff session + role verification.
 * Returns 401 if no session, 403 if session exists but role is insufficient.
 *
 * Usage:
 *   export function POST(req: NextRequest) {
 *     return withStaffSession(req, ["ADMIN"], async (session) => {
 *       // session.role === "ADMIN" is guaranteed
 *     });
 *   }
 */
export function withStaffSession(
  req: NextRequest,
  allowedRoles: StaffRole[],
  handler: (session: StaffSessionPayload) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    ensureSuperTokensInit();
  } catch {
    return Promise.resolve(
      NextResponse.json({ error: "Authentication is not configured" }, { status: 503 })
    );
  }
  return withSession(req, async (err, session: SessionContainer | undefined) => {
    if (err) return NextResponse.json({ error: "session error" }, { status: 500 });
    if (!session) return new NextResponse("Authentication required", { status: 401 });

    const superTokensId = session.getUserId();
    // Roles are stamped onto the access token payload at session creation
    // (see config/backend.ts) — no extra DB call needed here.
    const tokenPayload = session.getAccessTokenPayload();
    const roles: string[] = tokenPayload?.roles ?? [];

    const matchedRole = allowedRoles.find((r) => roles.includes(r.toLowerCase()));
    if (!matchedRole) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const staff = await prisma.staffUser.findUnique({
      where: { superTokensId },
      select: { id: true, role: true, superTokensId: true },
    });

    if (!staff) return new NextResponse("Forbidden", { status: 403 });

    return handler({ staffId: staff.id, superTokensId, role: staff.role });
  }) as Promise<NextResponse>;
}
