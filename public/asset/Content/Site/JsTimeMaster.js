(function (jQuery) {

    var datetime = null,
        date = null;

    var update = function () {
        date = moment(new Date());
        datetime.html(date.format('hh:mm A'));
        var meses = new Array("Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre");
        var fecha = new Date();
        datetime2.html(fecha.getDate() + " de " + meses[fecha.getMonth()] + " de " + fecha.getFullYear());
    };

    $(document).ready(function () {
        datetime = $('.time h5');
        datetime2 = $('.time span');
        update();
        setInterval(update, 1000);
    });

})(jQuery);