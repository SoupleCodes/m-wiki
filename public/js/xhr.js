function http(method, route, body, callback, fallback, formData) {
    var xhr = null;
    if (window.XMLHttpRequest) {
        xhr = new XMLHttpRequest();
    } else {
        if (window.ActiveXObject) {
            try {
                xhr = new ActiveXObject("Msxml2.XMLHTTP");
            } catch (e) {
                try {
                    xhr = new ActiveXObject("Microsoft.XMLHTTP");
                } catch (e) {}
            }
        }
    }
    if (!xhr) {
        return false;
    }
    xhr.open(method, route, true)
    if (formData) {
        xhr.send(formData)
    } else {
        xhr.setRequestHeader('Content-Type', 'text/html; charset=utf-8')
        xhr.send()
    }

    xhr.onload = function() {
        if (xhr.status !== 200) {
            if (fallback && typeof fallback == 'function') {
                fallback(xhr.responseText)
            }
        } else {
            if (callback && typeof callback == 'function') {
                callback(xhr.responseText)
            }
        }
    }
    xhr.onerror = function() {
        // Something
    }

    // xhr.send()
}