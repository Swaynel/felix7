import supertokens from "supertokens-node";
import Session from "supertokens-node/recipe/session";
import EmailPassword from "supertokens-node/recipe/emailpassword";
import UserRoles from "supertokens-node/recipe/userroles";
let initialized = false;

export function ensureSuperTokensInit() {
  if (initialized) return;

  const connectionURI = process.env.SUPERTOKENS_CONNECTION_URI;
  const apiDomain = process.env.NEXT_PUBLIC_API_DOMAIN;
  const websiteDomain = process.env.NEXT_PUBLIC_WEBSITE_DOMAIN;

  if (!connectionURI || !apiDomain || !websiteDomain) {
    throw new Error("SuperTokens environment variables are not configured");
  }

  initialized = true;

  supertokens.init({
    framework: "custom", // required for Next.js App Router per current docs
    supertokens: {
      connectionURI,
      apiKey: process.env.SUPERTOKENS_API_KEY,
    },
    appInfo: {
      appName: "Musician Platform",
      apiDomain,
      websiteDomain,
      apiBasePath: "/api/auth",
      websiteBasePath: "/auth",
    },
    recipeList: [
      EmailPassword.init(),
      UserRoles.init(),
      Session.init({
        override: {
          functions: (originalImplementation) => ({
            ...originalImplementation,
            createNewSession: async (input) => {
             
              const roles = await UserRoles.getRolesForUser("public", input.userId);
              input.accessTokenPayload = {
                ...input.accessTokenPayload,
                roles: roles.roles,
              };
              return originalImplementation.createNewSession(input);
            },
          }),
        },
      }),
    ],
  });
}
