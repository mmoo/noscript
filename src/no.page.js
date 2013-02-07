(function() {

//  ---------------------------------------------------------------------------------------------------------------  //

/**
 * Модуль управления "страницей" и переходами между ними.
 * @namespace
 */
no.page = {};

//  ---------------------------------------------------------------------------------------------------------------  //

var hashBang = '#!';

/**
 * Путь к корню приложения - например, '/neo2'.
 * @type {String}
 */
no.page.root = '';

/**
 *
 */
no.page.init = function() {
    this.historySupport = !!window.history.pushState;

    var loc = window.location;

    if (this.historySupport) {
        // нормальные браузеры редиректим с хешбенга на правильный урл
        if (loc.hash && loc.hash.indexOf(hashBang) === 0) {
            var url = no.page.root + no.page.getHash();
            window.history.replaceState(null, null, url);
        }

        window.addEventListener('popstate', function(e) {
            e.preventDefault();
            no.page.go();
        }, false);
    } else {
        // старые браузеры редиректим с нормального урла на хешбенг
        var path = no.page.urlPrepare(loc.pathname + loc.search);
        if (path && path !== '/') {
            loc.href = no.page.root + '/' + hashBang + path;
        }

        $(window).on('hashchange', function() {
            no.page.go();
            return false;
        });
    }

    no.page.go();
};


/**
 *
 */
no.page.navigate = function(url) {
    if (this.historySupport) {
        window.history.pushState(null, null, url);
        no.page.go(url);
    } else {
        window.location.hash = hashBang + url;
    }
};

/**
 * Осуществляем переход по ссылке.
 * @param {String} [url=location.pathname + location.search]
 * @return {no.Promise}
 */
no.page.go = function(url) {
    var loc = window.location;

    url = url || no.page.getCurrentUrl();

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

no.page.getHash = function() {
    return window.location.hash.replace(hashBang, '');
};

no.page.getCurrentUrl = function() {
   var loc = window.location;
   if (this.historySupport) {
       return loc.pathname + loc.search;
   } else {
       return no.page.getHash();
   }
};

no.page.redirect = function(url) {
    if (this.historySupport) {
        window.history.replaceState(null, null, url);
        no.page.go(url);
    } else {
        window.location.replace(hashBang + url);
    }
};

/**
 * Подготавливает url.
 * @return {String}
 */
no.page.urlPrepare = function(url) {
    return url;
};

})();
