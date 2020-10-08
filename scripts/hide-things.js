$("#banner-orange").hide()
$("#call-modal").hide()
$("#video-container").hide()
$("#username").focus()
var connectButton = 'hidden'
function showButton() {
    if (connectButton == 'hidden') {
        $("#banner-orange").show();
        connectButton = 'shown';
        $("#banner").hide()
    } 
}
$("#username").keydown(() => {
    showButton()
})