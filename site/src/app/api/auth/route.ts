import type { NextApiRequest, NextApiResponse } from "next";

export function GET(_: NextApiRequest, res: NextApiResponse) {
  res.setHeader("WWW-authenticate", 'Basic realm="Secure Area"').status(401).end("Authentication required");
}
