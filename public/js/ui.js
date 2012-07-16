$(function () {
    var DROP_SPEED = 250;

    $('.gh-watch')
        .append('<i class="icon-eye-open"></i>')
        .ghRepo({ data: 'watchers' });

    $('.sidebar h3.categories a, .sidebar h3.tags a').click(function (e) {
        e.preventDefault();
        var $ul = $(this).closest('h3').next();
        $ul[ $ul.is(':visible') ? 'slideUp' : 'slideDown' ](DROP_SPEED);
    });
});
