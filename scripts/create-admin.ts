/**
 * Grant someone access to the studio desk.
 *
 *   npm run create-admin -- studio@nekstudios.com 'a-long-password'
 *
 * Creates the Firebase user if they don't exist, sets the `admin: true` custom
 * claim the app checks, and records them in the `admins` collection so there's
 * an auditable list. Safe to re-run: an existing user is promoted, not
 * duplicated, and their password is only changed if you pass a new one.
 *
 * Pass --revoke to take access away instead.
 */

import { FieldValue } from "firebase-admin/firestore";
import { auth, db, PROJECT_ID } from "./firebase-admin";

async function main() {
  const args = process.argv.slice(2).filter((a) => !a.startsWith("--"));
  const revoke = process.argv.includes("--revoke");

  const [email, password] = args;

  if (!email) {
    console.error(
      "Usage: npm run create-admin -- <email> [password] [--revoke]",
    );
    process.exit(1);
  }

  // Six is Firebase's own floor — below that the API rejects it outright.
  if (!revoke && password && password.length < 6) {
    console.error("Firebase requires at least 6 characters.");
    process.exit(1);
  }

  if (!revoke && password && password.length < 12) {
    console.warn(
      `\n⚠ That password is short. This account can change live prices and\n` +
        `  read every customer order. Lengthen it before /admin is public:\n` +
        `  npm run create-admin -- <email> '<longer-password>'\n`,
    );
  }

  const existing = await auth.getUserByEmail(email).catch(() => null);

  if (revoke) {
    if (!existing) {
      console.error(`No user with email ${email}.`);
      process.exit(1);
    }

    await auth.setCustomUserClaims(existing.uid, { admin: false });
    await auth.revokeRefreshTokens(existing.uid);
    await db.collection("admins").doc(existing.uid).delete();

    console.log(`Revoked admin access for ${email} on ${PROJECT_ID}.`);
    console.log("Their next request will be bounced to the sign-in screen.");
    return;
  }

  let uid: string;

  if (existing) {
    uid = existing.uid;
    if (password) await auth.updateUser(uid, { password });
    console.log(`Found existing user ${email}.`);
  } else {
    if (!password) {
      console.error("New users need a password: npm run create-admin -- <email> <password>");
      process.exit(1);
    }
    const created = await auth.createUser({ email, password, emailVerified: true });
    uid = created.uid;
    console.log(`Created user ${email}.`);
  }

  await auth.setCustomUserClaims(uid, { admin: true });

  await db.collection("admins").doc(uid).set(
    {
      email,
      grantedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  console.log(`\n${email} is now an admin on ${PROJECT_ID}.`);
  console.log("Sign in at /admin/login.");
}

main().catch((error) => {
  console.error("\nFailed:", error.message ?? error);
  process.exit(1);
});
