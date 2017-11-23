"use strict";



/**
 *!  CONSTANTES 
 */
const video = document.getElementById("Video1");

const button = document.getElementById("play");

const music = document.getElementById("music");

const view = window.location.href.split("/").slice(-1).toString().replace(".html", "");



/** 
 *! VARIABLES
 */
let pos = 1;

let armador = []; //contendra el tiempo inicial/final y el selector con los que se haran las validaciones y operaciones.

let json = null; //string

let height = window.innerHeight;

let width = window.innerWidth;

let device = "";



/** 
 *! FUNCIONES 
 */

/** 
 * INICIALIZE'
 * Se encarga iniciar el audio y video luego de quitar el loader, 
 * controlando el tiempo de inicio con la variable timeInit 
 * @param {number} timeInit tiempo de espera para quitar el loader e iniciar todo el flujo de trabajo.
 */
function initialize(timeInit) {

    setTimeout(function () {

        $('.loader').addClass('hidden');

        $('#Video1').removeClass('hidden');

        $('.container').css({

            // 'background': 'white', //! No es necesario.

            'border': 0

        }).removeClass('hidden');

        $('.buttonfooter').html('CERRAR');

        vidplay();

        music.play();

        // video.currentTime = 30; //! ideal para agilizar pruebas, inicia el video en el segundo que se indique

    }, timeInit);

    video.addEventListener("timeupdate", function () {

        TimeStop(video.currentTime);

        var end = video.ended;

        if (end == true) {

            $(video).fadeOut('slow', function () {

                $('body').css({

                    "background": "#444344",

                    "heigth": 1207

                });

                window.location = '/salud/';

            });

            music.pause();

        }

    });

}

/** 
 * TIMESTOP
 * Se encarga de recorrer la data del json, modificarlo y detener 
 * el video, todo dependiendo del tiempo definido en pauseStart o pauseFinish
 * @param {number} videoCurrentTime Es el segundo en el cual se va ejecutando el video.
 */
function TimeStop(videoCurrentTime) {

    for (var index in armador) {

        var pauseStart = parseFloat(armador[index].pauseStart).toFixed(2);

        var pauseFinish = parseFloat(armador[index].pauseFinish).toFixed(2);

        var startingAt = parseFloat(armador[index].startingAt).toFixed(2);

        var startingEnd = parseFloat(armador[index].startingEnd).toFixed(2);

        if (videoCurrentTime > pauseFinish) {

            delete armador[index];

        }

        if (videoCurrentTime >= startingAt && videoCurrentTime <= startingEnd) {

            $(armador[index].selector).removeClass('hidden');

        }

        if (videoCurrentTime >= pauseStart && videoCurrentTime <= pauseFinish) {

            video.pause();

            delete armador[index];

        }

    }

}

/** 
 * SET TIME STOP
 * Se encarga de añadir hidden a los elementos aisgnados y darle continuidad al video
 * @param {string} elem Es el elemento al cual se le aplicara la clase hidden
 * @param {number} sec Es el segundo en el cual se va a continuar el video.
 */
function SetTimeStop(elem, sec) {

    pos++;

    video.currentTime = sec;

    $(elem).addClass('hidden');

    video.play();

}

/** 
 * RESTART
 * Reinicia todo el video
 */
function restart() {

    video.currentTime = 0;

}

/** 
 * VIDPLAY
 * Continua el video o lo pausa si ya se encontraba corriendo
 */
function vidplay() {

    if (video.paused) {

        video.play();

        button.textContent = "PAUSA";

    } else {

        video.pause();

        button.textContent = "PLAY";

    }

}

/** 
 * TIME
 * Retorna el Tiempo actual del video (en segundos). 
 */
function time() {

    console.log(video.currentTime);

}

/** 
 * LOADJSON
 * Carga el Json dependiendo de la video a mostrar 
 */
function loadJson() {

    switch (view) {

        case 'myoxy':

        case 'myecg':

        case 'myscale':

        case 'mygluco':

        case 'mythermo':

        case 'mytensio':

            json = view + '.json';

            break;

    }

    $.getJSON(json, function (items) {

        armador = items;

        video.load();

    });

}

/** 
 * DEVICE RECOGNITION
 * Detecta cual es el dispositivo table que se esta utilizando por medio del width 
 * inicia el flujo del video. 
 */
function deviceRecognition() {

    if (width > 1300) {

        device = "Samsung";
        $('#asd').attr('content', 'width=device-width, initial-scale=1, maximum-scale=1');
        // $('#asd').attr('content', 'width=device-width, initial-scale=0.5, maximum-scale=0.5');
        $('.container').css('width', 'auto');

        $('#Video1').css({
            'margin': '0 auto',
            'display': 'block',
            'width': 665
        });

        $(`
            .circle1,
            .circle2,
            .circle3,
            .circle4,
        
            .capa1,
            .capa2,
            .capa3,
            .capa4,
            .capa5,
            .capa6,
            .capa7,
            .capa8,
            .capa9

        
        `).addClass("mobile");

    } else {

        device = "Lenovo";
        $('#asd').attr('content', 'width=device-width, initial-scale=1, maximum-scale=1');

    }

    loadJson();

    video.onloadedmetadata = function () {

        initialize(1500);

        // returnDimensions();

    };

}


/**
 * funcion returnDimensions
 * retorna las dimensiones del dispositivo; el ancho y alto del viewport
 */
function returnDimensions() {

    let dimensions = {

        'ancho': window.innerWidth,
        'alto': window.innerHeight

    };

    window.alert(dimensions.ancho); //!1920 px
    window.alert(dimensions.alto); //!1080 px
}


/**
 *! DOCUMENT READY!!!! Here is when the magic finally comes alive 
 */
$(document).ready(function () {

    deviceRecognition();

    if (device == "Lenovo") {

        $('#asd').attr('content', 'width=device-width, initial-scale=1, maximum-scale=1');

    }

});

$(window).on("orientationchange", function (event) {

    if (device == "Lenovo") {

        var a = window.innerHeight;
        var b = window.innerWidth;

        console.log(a);
        console.log(b);

        if (a < b) { //! tablet landscape

            $('.container').addClass('hidden');
            $('.cover').removeClass('hidden');

            video.pause();
            music.pause();

        } else { //! tablet portrait

            $('.container').removeClass('hidden');
            $('.cover').addClass('hidden');

            video.play();
            music.play();

        }

    }

});