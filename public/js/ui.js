$(function () {

    $('a').twitch();
    $('.gh-watch')
        .append('<i class="icon-eye-open"></i>')
        .ghRepo({ data: 'watchers' });
/*    $('.gh-fork')
        .append('<i class="icon-eye-open"></i>')
        .ghRepo({ data: 'forks' });
*/
});
