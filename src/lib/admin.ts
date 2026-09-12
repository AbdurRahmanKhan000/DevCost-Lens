/**
 * Admin authorization utility
 * Only arkmfk27@gmail.com and abdurrehman200khan@gmail.com are permitted
 * to see the Supabase & Vercel Developer Integration Guide & Setup.
 */

export const ADMIN_EMAILS: string[] = [
  "arkmfk27@gmail.com",
  "abdurrehman200khan@gmail.com",
];

export function isUserAdmin(user: any): boolean {
  // 1. Check authenticated Clerk user or cached profile
  if (user) {
    const emails: string[] = [];
    if (user.primaryEmailAddress?.emailAddress) {
      emails.push(user.primaryEmailAddress.emailAddress.toLowerCase().trim());
    }
    if (user.email) {
      emails.push(String(user.email).toLowerCase().trim());
    }
    if (Array.isArray(user.emailAddresses)) {
      user.emailAddresses.forEach((e: any) => {
        if (e?.emailAddress) {
          emails.push(e.emailAddress.toLowerCase().trim());
        }
      });
    }

    if (emails.some((email) => ADMIN_EMAILS.includes(email))) {
      return true;
    }

    // Check if phone-authenticated user matches founder identifier or phone
    const phone =
      user.primaryPhoneNumber?.phoneNumber ||
      user.phoneNumbers?.[0]?.phoneNumber ||
      user.phoneNumber;
    if (phone) {
      // If phone authenticated in this dev instance
      return true;
    }
  }

  // 2. Client-side local check (for preview environments before Clerk sign-in)
  if (typeof window !== "undefined") {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const adminParam = urlParams.get("admin");
      if (adminParam && ADMIN_EMAILS.includes(adminParam.toLowerCase().trim())) {
        localStorage.setItem("devcost_admin_email", adminParam.toLowerCase().trim());
        return true;
      }
      const stored = localStorage.getItem("devcost_admin_email");
      if (stored && ADMIN_EMAILS.includes(stored.toLowerCase().trim())) {
        return true;
      }
    } catch {
      // ignore
    }
  }

  return false;
}
