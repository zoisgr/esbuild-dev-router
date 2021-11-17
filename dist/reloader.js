"use strict";
(function () {
    // console.log('reloader');
    var ev = new EventSource('/reloader');
    ev.addEventListener('open', function () {
        console.log('Reloader OK');
    });
    ev.addEventListener('reload', function () {
        console.log('RELOADING');
        window.location.reload();
    });
})();
