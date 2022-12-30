import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: ["/", "/index"],
};

export function middleware(req: NextRequest) {
  const basicAuth = req.headers.get("authorization");
  const url = req.nextUrl;

  if (basicAuth) {
    const authValue = basicAuth.split(" ")[1];
    if (authValue === undefined) {
      url.pathname = "/403";
      return NextResponse.rewrite(url);
    }

    const [user, password] = Buffer.from(authValue, "base64").toString().split(":");
    if (user === process.env.BASIC_AUTH_USER && password === process.env.BASIC_AUTH_PASS) {
      return NextResponse.next();
    }
  }

  url.pathname = "/api/auth";
  return NextResponse.rewrite(url);
}
