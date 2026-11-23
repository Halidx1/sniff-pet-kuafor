// Public API of the identity module (ADR-001): import only from here.
// Admin authentication: sign-in, mandatory 2FA, password flows, requireAdmin().
export {
  confirmSetup,
  requestPasswordReset,
  signIn,
  signOut,
  startSetup,
  updatePassword,
  verifyCode,
  verifyEmailLink,
  type FormState,
  type SetupState,
} from "./actions";
export { getAdmin, requireAdmin, type Admin } from "./data/session";
export { safeAdminNext } from "./domain/safe-next";
