export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/invoices", "/invoices/(.*)", "/estimates", "/estimates/(.*)"],
};
