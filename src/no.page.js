/**
 * Модуль управления "страницей" и переходами между ними.
 * @namespace
 */
no.page = {};

no.page.init = function() {
    var historySupport = !!window.history.pushState;
    var loc = window.location;
    var path = loc.pathname + loc.search;

    if (historySupport) {
        window.addEventListener('popstate', function(e) {
            e.preventDefault();
            no.page.go();
        }, false);
    } else {
        // старые браузеры редиректим с нормального урла на хешбенг
        if (no.page.urlPrepare(path) !== '/') {
            loc.href = '/#!' + path;
        }
    }
};

no.page.navigate = function(url) {
    window.history.pushState(null, null, url);
    return no.page.go(url);
};

/**
 * Осуществляем переход по ссылке.
 * @param {String} [url=location.pathname + location.search]
 * @return {no.Promise}
 */
no.page.go = function(url) {
    var loc = window.location;

    url = url || (loc.pathname + loc.search);

    // подготавливаем
    url = no.page.urlPrepare(url);

    // возможность заблокировать переход
    if (url === false) {
        return new no.Promise().reject();
    }

    var route = no.router(url);
    if (route === false) {
        return new no.Promise().reject();
    }
    var layout = no.layout.page(route.page, route.params);

    no.events.trigger('no:page-before-load', [no.page.current, route]);
    /**
     * Текущие параметры страницы.
     * @type {{page: string, params: Object}}
     */
    no.page.current = route;

    var update = new no.Update(no.MAIN_VIEW, layout, route.params);
    return update.start();
};

no.page.redirect = function(url) {
    window.history.replaceState(null, null, url);
    no.page.go(url);
};

/**
 * Подготавливает url.
 * @return {String}
 */
no.page.urlPrepare = function(url) {
    return url;
};
