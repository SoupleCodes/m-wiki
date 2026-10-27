import { Hono } from 'hono'
import { handle } from 'hono/cloudflare-pages'

import { getLoggedIn, getAccounts, cookieHandler } from '../cookie.js'

import html from '../public/index.html'

import auth from '../page_routes/auth.js'
import article from '../page_routes/article.js'
import render from '../page_routes/render.js'



export async function httpFetch(route, method, body, responseType, token) {
    let link
    if (1) {
        link = 'http://localhost:8787'
    } else {
        link = 'https://mwiki.souple.workers.dev'
    }

    try {
        var json = {}
        json.method = method || "GET"
        json.headers = {}
        if (token) {
            json.headers['Authorization'] = 'Bearer ' + token
        }
        if (!(method=="GET") && !(method=="HEAD")) {
            if (responseType=='formdata') {
                json.body = body
            } else {
                json.body = JSON.stringify(body) || {}
            }
        }
        var response = await fetch(link + route, json)
        if (responseType == 'text') {
            return await response.text()
        } else {
            return await response.json()
        }
    } catch (error) {
        console.error(error)
    }
}

function toResponse(s) {
    const response = new Response(s)

    return response
}

async function returnHtmlResponse(c, string, handler) {
    const rewriter = new HTMLRewriter()
    const revisedHtml = await cookieHandler(c, string)
    const response = new Response(revisedHtml)

    if (handler) {
        return rewriter
                .on("*", handler)
                .transform(response)
                .text();
    } else {
        return rewriter
                .transform(response)
                .text();
    }
}


const app = new Hono();

app
    .route('/auth', auth)
    .route('/article', article)
    .route('/render', render)

    .get('/', async (c) => {
        const article = await httpFetch('/article/featured', 'GET')

        return c.html(
            new HTMLRewriter()
                .on("#featured-article *", {
                    element(el) {
                        let elClass = el.getAttribute("class")
                        if (elClass){elClass.split(" ")}else{elClass=[]}

                        if (elClass.includes('int-title')) el.setInnerContent(article.title)
                        if (elClass.includes('int-detail')) el.setInnerContent('by ' + article.author)
                        if (article.prev_img) {
                            if (el.tagName === 'img') el.setAttribute('src', article.prev_img)
                            if (elClass.includes('img-caption')) el.setInnerContent(article.prev_img_caption)
                            if (elClass.includes('read-more')) el.setAttribute('onclick', `openArticlePg(${article.id})`)
                        } else {
                            if (elClass.includes('img-wrapper')) el.remove()
                        }
                    }
                })
                .transform(
                    toResponse(await returnHtmlResponse(c, html))
                )
                .text()
        )
    })

export const onRequest = handle(app)