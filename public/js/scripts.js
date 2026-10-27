function init() {
    // Dropdown
    document.querySelectorAll('.dropdown-wrapper').forEach((el) => {
        
        el.addEventListener("click", function(e) {
            e.preventDefault()

            var targEl = e.target
            var targClass = e.target.classList
            var ul = el.querySelector('ul')
            var input = el.querySelector('input')
            var button = el.querySelector('button')

            if (targClass.contains('dropdown')) {
                ul.classList.toggle('hidden')
            }
            if (targEl.tagName === 'LI') {
                var value = targEl.getAttribute('data-value')
                ul.classList.add('hidden')
                input.value = value
                button.textContent = targEl.innerText
                if (el.classList.contains('redirect')) {
                    window.location.href = '/' + value
                }
            }
        })

    })
}


function goBack() {
    var scrol_parent = document.all['scrollable-content']
    var curr_page = Number(scrol_parent.getAttribute('data-page'))
    var prev_page = document.querySelectorAll('.slide')[curr_page - 1]

    if (curr_page > 0) {
        prev_page.classList.remove('hidden')
        prev_page.setAttribute('data-current-slide', true)
        document.querySelectorAll('.slide')[curr_page].setAttribute('data-current-slide', false)
        scrol_parent.style.transform = "translateX(" + ((curr_page - 1) * 100) + "%)"

        setTimeout(function() {
            document.querySelectorAll('.slide')[curr_page + 1].classList.add('hidden')
        }, 450)

        curr_page--
        scrol_parent.setAttribute('data-page', curr_page)
        scrol_parent.style.left = (curr_page * -100) + "%"
        document.body.setAttribute('curr-page', prev_page.id || 'Home')
    }
}

function goRight(title, content, color) {
    var new_slide
    var scrol_parent = document.all['scrollable-content']
    var curr_page = Number(scrol_parent.getAttribute('data-page'))
    var curr_slide = document.querySelectorAll('.slide')[curr_page]

    if (document.getElementById(title)) {
        new_slide = document.getElementById(title)
        new_slide.classList.remove('hidden')
        new_slide.setAttribute('data-current-slide', true)
        curr_slide.insertAdjacentHTML("afterend", new_slide.outerHTML)
        new_slide.remove()
    } else {
        new_slide = document.createElement('div')
        new_slide.id = title
        new_slide.classList.add('slide', color)
        new_slide.setAttribute('data-current-slide', true)

        var new_slide_topbar = document.createElement('div')
        new_slide_topbar.classList.add('topbar')

        var new_slide_title = document.createElement('div')
        new_slide_title.classList.add('topbar-title')
        new_slide_title.textContent = title
        new_slide_topbar.appendChild(new_slide_title)

        var new_slide_content = document.createElement('div')
        new_slide_content.classList.add('main-content')
        new_slide_content.innerHTML = content || ''
        new_slide.appendChild(new_slide_topbar)
        new_slide.appendChild(new_slide_content)

        curr_slide.insertAdjacentHTML("afterend", new_slide.outerHTML)
    }

    if (new_slide) {
        curr_slide.setAttribute('data-current-slide', false)

        setTimeout(function() {
            document.querySelectorAll('.slide')[curr_page].classList.remove('hidden')
            document.querySelectorAll('.slide')[curr_page - 1].classList.add('hidden')
            scrol_parent.style.transform = "translateX(" + (curr_page * 100) + "%)"
        }, 450)

        curr_page++
        scrol_parent.setAttribute('data-page', curr_page)
        scrol_parent.style.left = (curr_page * -100) + "%"
        document.body.setAttribute('curr-page', title)
    }

    if (document.getElementById(title)) {

    } else {
        return new_slide_content
    }
}

function leaveSlide(to_new_slide) {
    var scrol_parent = document.all['scrollable-content']
    var curr_page = Number(scrol_parent.getAttribute('data-page'))
    var curr_slide = document.querySelectorAll('.slide')[curr_page]
    var cloned_slide = curr_slide.cloneNode(true)
    
    var clone_slide_wrapper = document.createElement('div')
    clone_slide_wrapper.classList.add('old-slide')
    clone_slide_wrapper.innerHTML = '<div class="topbar-back"></div>'

    var container = document.createElement('div')
    container.classList.add('container')
    container.appendChild(cloned_slide)
    clone_slide_wrapper.appendChild(container)

    var body = document.body
    body.appendChild(clone_slide_wrapper)
    body.style.top = '100%'

    setTimeout(function() {
        body.classList.add('transition-top')
        body.style = ''
    }, 450)
}

function composeNew() {
    var composeSlide = goRight('compose', null, 'blue')
}

function getVal(id) {
    return document.all[id].value ||
           document.all[id].value.innerText
}

function submitArticle() {
    var formData = new FormData();
        formData.append("title", getVal('compose-article-title'));
        formData.append("content", getVal('compose-article-content'));
        formData.append("category", 'compose-article-category');

    http("POST", '/article', null, function(response) {
        console.log('Article id: ' + response);
    }, 
    function(response) {
        alert(response)
    }, formData)
}

function openArticlePg(id) {
    http("GET", '/render/article/' + id, null, function(response) {
        var articleSlide = goRight('Article #' + id, response, 'brown')
    }, 
    function(response) {
        alert(response)
    }, null)
}


document.addEventListener("DOMContentLoaded", init())