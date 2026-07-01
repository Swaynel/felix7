// scripts/seed-admin.ts
/**
 * Seed script: creates the first admin staff user in SuperTokens + Prisma.
 *
 * Run once during initial deploy:
 *   npx ts-node -P tsconfig.json --skip-project scripts/seed-admin.ts
 *
 * Do NOT automate this in CI or expose a public signup path that grants
 * admin/editor roles. Staff accounts are created exclusively here or via
 * an invite flow you build in the admin panel.
 */
import EmailPassword from "supertokens-node/recipe/emailpassword";
import UserRoles from "supertokens-node/recipe/userroles";
import { ensureSuperTokensInit } from "../config/backend";
import { prisma } from "../src/lib/prisma";

async function main() {
  ensureSuperTokensInit();

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD env vars before running this script");
  }

  // Create roles if they don't exist yet
  await UserRoles.createNewRoleOrAddPermissions("admin",  ["read", "write", "delete"]);
  await UserRoles.createNewRoleOrAddPermissions("editor", ["read", "write"]);

  // Sign up the user in SuperTokens
  const signUpResult = await EmailPassword.signUp("public", email, password);
  if (signUpResult.status !== "OK") {
    throw new Error(`SuperTokens signup failed: ${signUpResult.status}`);
  }

  const superTokensId = signUpResult.user.id;

  // Assign admin role
  await UserRoles.addRoleToUser("public", superTokensId, "admin");

  // Create the StaffUser row
  await prisma.staffUser.create({
    data: {
      superTokensId,
      email,
      name: "Admin",
      role: "ADMIN",
    },
  });

  console.log(`✓ Admin created: ${email} (SuperTokens ID: ${superTokensId})`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
