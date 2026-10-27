import { getCookie } from 'hono/cookie'

export function getLoggedIn(c) {
    return getCookie(c, 'logged_in') || null
}

export function getToken(c) {
    return getCookie(c, 'logged_in') || null
}

export function getAccounts(c) {
    return (
        getCookie(c, 'accounts') || null
    )?.split("|") || []
}

export async function cookieHandler(c, string) {
    const rewriter = new HTMLRewriter()
    const response = new Response(string)

    var user = getLoggedIn(c)
    if (user) {        
        rewriter.on('#login-popup', {
            element(el) {
                el.remove()
            }
        })
    }

    return rewriter.transform(response).text();
}