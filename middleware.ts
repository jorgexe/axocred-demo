import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const MOBILE_USER_AGENT = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile|touch/i

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname !== "/") {
    return NextResponse.next()
  }

  const userAgent = request.headers.get("user-agent") ?? ""

  if (MOBILE_USER_AGENT.test(userAgent)) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = "/demo"
  redirectUrl.search = request.nextUrl.search
    return NextResponse.redirect(redirectUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/"]
}
