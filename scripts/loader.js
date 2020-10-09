if (window.location.hash !== '#load') {
    window.location.hash = 'load';
    window.location.href = window.location
} 

window.location.hash = '#app-2';

window.addEventListener('beforeunload', function(e) {
    try {
        call.close()
    } catch {}
    try {
        peer.disconnect();
    } catch {}
    try {
        peer.destroy()
    } catch {}
    //e.returnValue = ''
})