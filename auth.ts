import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { CredentialsSignin } from "next-auth";
import authConfig from "@/auth.config";
import { authenticate, register } from "@/lib/users";

class LoginError extends CredentialsSignin {
  code = "invalid_credentials";
}

class TakenError extends CredentialsSignin {
  code = "email_taken";
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    ...authConfig.providers,
    Credentials({
      credentials: {
        email: { type: "email" },
        password: { type: "password" },
        name: { type: "text" },
        mode: { type: "text" },
      },
      async authorize(credentials) {
        const email = String(credentials.email ?? "")
          .trim()
          .toLowerCase();
        const password = String(credentials.password ?? "");
        const name = String(credentials.name ?? "").trim();
        const mode = String(credentials.mode ?? "signin");

        if (!email || !password || password.length < 6) {
          throw new LoginError();
        }

        if (mode === "signup") {
          const result = await register({
            email,
            password,
            name: name || email.split("@")[0],
          });
          if (result === "taken") throw new TakenError();
          return result;
        }

        const user = await authenticate(email, password);
        if (!user) throw new LoginError();
        return user;
      },
    }),
  ],
});

export { oauthFlags } from "@/auth.config";
