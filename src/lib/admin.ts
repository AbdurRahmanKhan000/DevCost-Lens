/** Single founder identity for all admin-only controls. */
export const ADMIN_EMAILS: string[] = ["arkmfk27@gmail.com"];

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

  }

  return false;
}
