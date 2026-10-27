import html from '../article/.html'

export function renderArticlePage(data, token) {
    const response = new Response(html)

    return new HTMLRewriter()
        .on('.article-title', {
            element(el) {
                el.setInnerContent(data.title)
            }
        })
        .on('.article-author', {
            element(el) {
                el.setInnerContent('by ' + data.author)
            }
        })
        .on('.article-content', {
            element(el) {
                el.setInnerContent(data.content)
            }
        })
    
    .transform(response).text()
}