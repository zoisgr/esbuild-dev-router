(() => {
    // if (window.reloader_active)
    //     return
    // window.reloader_active = true;
    
    const ev = new EventSource('/reloader');

    ev.addEventListener('open', () => {
        console.log('Reloader OK');
    });

    ev.addEventListener('reload', () => {
        console.log('RELOADING');
        window.location.reload();
    })


})();