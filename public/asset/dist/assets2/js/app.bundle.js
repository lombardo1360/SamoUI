/* eslint-disable */
/** File generated using gulp task: Please do not edit manually */

 const themeColors =  {
    "blue": "#084b83",
    "indigo": "#414288",
    "purple": "#6200ee",
    "pink": "#f06c9b",
    "red": "#e63946",
    "orange": "#f06449",
    "yellow": "#fdbb2d",
    "green": "#5fb49c",
    "teal": "#009688",
    "cyan": "#00bcd4",
    "black": "#011627",
    "white": "#ffffff",
    "specialPink": "#d81b60",
    "specialParadisePink": "#e5446d",
    "specialRuby": "#8b2635",
    "specialEggplant": "#4c2b36",
    "specialSienna": "#3d0814",
    "specialJet": "#353238",
    "specialDark": "#2a2b2a",
    "specialCedarChest": "#be5a38",
    "specialGunmetal": "#143642",
    "specialBlue": "#0b3954",
    "specialRed": "#f05454",
    "specialOrange": "#f9813a",
    "specialGreen": "#4caf50",
    "specialLightgreen": "#16a596",
    "specialBrown": "#92817a",
    "specialCoffee": "#8d6346",
    "themeColors": {
        "specialPink": "#d81b60",
        "specialParadisePink": "#e5446d",
        "specialRuby": "#8b2635",
        "specialEggplant": "#4c2b36",
        "specialSienna": "#3d0814",
        "specialJet": "#353238",
        "specialDark": "#2a2b2a",
        "specialCedarChest": "#be5a38",
        "specialGunmetal": "#143642",
        "specialBlue": "#0b3954",
        "specialRed": "#f05454",
        "specialOrange": "#f9813a",
        "specialGreen": "#4caf50",
        "specialLightgreen": "#16a596",
        "specialBrown": "#92817a",
        "specialCoffee": "#8d6346"
    },
    "primary": "#414288"
};
(function (root) {
    function calcStep(currentWidth){
        if (currentWidth < 30)
            return 5;
        if (currentWidth < 60)
            return 1;
        if (currentWidth < 85)
            return 0.8;
        if (currentWidth < 90)
            return 0.7;
        if (currentWidth < 95)
            return 0.3;
        return 0.01;
    }

    function addClass (el, cls) {
        if (el.classList) el.classList.add(cls);
        else el.className += ' ' + cls;
    }

    function progressBar(options){
        options = options || {};
        let nanobar = new Nanobar(options);
        nanobar.el.classList.remove('loaded');
        addClass(nanobar.el, 'loading');
        nanobar.loaded = false;
        nanobar.autoProgress = function() {
            let apTimer = setInterval(function() {
                nanobar.stepup();
                if (nanobar.loaded){
                    clearInterval(apTimer);
                    nanobar.go(100);
                }
            }, 200);
        };
        nanobar.stepup = function() {
            let me = this;
            let width = parseFloat(me.el.children[0].style.width) || 0;
            width = width + calcStep(width);
            if (width >= 100) width = 99.9;
            nanobar.go(width);
        };
        nanobar.done = function() {
            nanobar.loaded = true;
            addClass(nanobar.el, 'loaded');
            nanobar.el.classList.remove('loading');
            setTimeout(function() {
                nanobar.el.remove();
            }, 300);
        };
        if (options.autoProgress){
            nanobar.autoProgress();
        }
        return nanobar;
    }

    if (typeof exports === 'object') {
        // CommonJS
        module.exports = progressBar;
    // eslint-disable-next-line no-undef
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        // eslint-disable-next-line no-undef
        define([], function () { return progressBar; });
    } else {
        // Browser globals
        root.progressBar = progressBar;
    }
}(this));
/* Create global variables that can be used elsewhere */

// set variables  
let xs;
let sm;
let md;
let lg;
let xl;
let breakpoint;

// Checks if the span is set to display lock via CSS
function checkIfBlock (target) {
    return $(target).css('display') === 'block';
}

// function to check the sizes
function checkSize (){
    // Set some variables to use with the if checks below
    xs = checkIfBlock('.breakpoint-check .xs');
    sm = checkIfBlock('.breakpoint-check .sm');
    md = checkIfBlock('.breakpoint-check .md');
    lg = checkIfBlock('.breakpoint-check .lg');
    xl = checkIfBlock('.breakpoint-check .xl');
    // add the breakpoint to the console
    if ( xs == true) {
        breakpoint = 'xs';
    } 
    if ( sm == true) {
        breakpoint = 'sm';
    } 
    if ( md == true) {
        breakpoint = 'md';
    } 
    if ( lg == true) {
        breakpoint = 'lg';
    } 
    if ( xl == true) {
        breakpoint = 'xl';
    }
	
    $('body').removeClass('xs sm md lg xl').addClass( breakpoint );
}

$(function(){
    // Add some invisible elements with Bootstrap CSS visibile utility classes
    $( 'body' ).append( '<div style=\' :none;\' class=\'breakpoint-check\'><span class=\'xs d-block d-sm-inline\'></span><span class=\'sm d-sm-block d-md-inline\'></span><span class=\'md d-md-block d-lg-inline\'></span><span class=\'lg d-lg-block d-xl-inline\'></span><span class=\'xl d-xl-block\'></span></div>' );
    checkSize();
});

// Recheck on window resize
$( window ).on('resize', function(){
    checkSize();
});
'use strict';

$(function () {
    const mainWrapper = $('.main-wrapper');
    const isRTL = $('html').hasClass('rtl');

    $(document).on('mouseenter', '.navigation li', function () {
        if (mainWrapper.hasClass('mini')) {
            const currentPos = this.getBoundingClientRect().top;
            $(this).find('a').first().css('top', currentPos);
            $(this).find('ul').css('top', currentPos);
            const isSpaceAvailable = checkSpaceAvaibility(currentPos, this);
            if (!isSpaceAvailable.below) {
                if (isSpaceAvailable.above) {
                    // Show submenu on top
                    $(this).find('ul').addClass('reversed').css('marginTop', -isSpaceAvailable.requiredSpace + 'px');
                } else {
                    // Show scroll
                    $(this).find('ul').css('height', isSpaceAvailable.availableBottomPosition + 'px');
                }
            }
        } else {
            const currentPos = this.getBoundingClientRect().left;
            if (!isRTL) $(this).find('ul').css('left', currentPos);
        }
    }).on('mouseleave', '.navigation li', function () {
        $(this).find('ul').removeClass('reversed').css('marginTop', '').css('height', '');
        $(this).find('ul').css('top', '');
        $(this).find('ul').css('left', '');
    });

    $(document).on('click', '.navigation-arrow', function() {
        const ul = $('.navigation').find('ul').first().get(0);
        let newPos;
        if ($(this).hasClass('right')) {
            newPos = ul.scrollLeft + 150;
        } else {
            newPos = ul.scrollLeft - 150;
        }
        ul.scrollTo({left: newPos, behavior: 'smooth' });
    });

    $(document).on('click', '#hamburger-btn', function () {
        mainWrapper.toggleClass('collapsed');
        if (mainWrapper.hasClass('overlay-menu')) {
            if (mainWrapper.hasClass('collapsed')) {
                $('.overlay-mask').removeClass('open');
            } else {
                $('.overlay-mask').addClass('open');
            }
        }
    });
    $(document).on('click', '.overlay-mask', function () {
        $('#hamburger-btn').trigger('click');
        $('.overlay-mask').removeClass('open');
    });
});

function checkSpaceAvaibility(currentPos, that) {
    /* check if there is available space at bottom and top*/
    // since element would be hidden determine expected height;
    const requiredSpace = $(that).find('ul').find('li').length * 31;
    const totalHeight = $(window).height();
    const availableBottomPosition = totalHeight - currentPos - 40;
    const availableTopPosition = currentPos;
    let below = false,
        above = false;
    if (availableBottomPosition >= requiredSpace) {
        below = true;
    }
    if (availableTopPosition >= requiredSpace) {
        above = true;
    }
    return {
        below, above, availableBottomPosition, availableTopPosition, requiredSpace
    };
}
'use strict';
$(function() {
    $(document).on('click', '.card .toggle-fullscreen', function(e) {
        e.preventDefault();
        $(this).parents('.card').toggleClass('fullscreen');
    });

    $(document).on('click', '.card .close', function(e) {
        e.preventDefault();
        $(this).parents('.card').remove();
    });

    $(document).on('click', '.card .reload', function(e) {
        e.preventDefault();
        const card = $(this).parents('.card').get();
        const nanobar = new progressBar({
            classname: 'loading-bar',
            target: card[0],
            autoProgress: true,
        });
        nanobar.go(30);
        // Simulate Loading
       
        if ($(this).hasClass('simulate')) {
            console.log('simulate');
            setTimeout(nanobar.done, 5000);
        }
    });
    // To prevent toggleing of already open Panel
    $(document).on('click', '.card [data-toggle]', function(e) {
        $(this).parents('.card').find('button').removeClass('active');
        $(this).addClass('active');
        if ($($(this).data('target')).hasClass('show')) {
            e.stopPropagation();
        }
    });
    if (!screenfull.isEnabled) {
        $('#fullscreen-btn').parent('li').remove();
    }

    screenfull.on('change', function() {
        if (!screenfull.isFullscreen) {
            $('#fullscreen-btn').find('span').html('fullscreen');
        } else {
            $('#fullscreen-btn').find('span').html('fullscreen_exit');
        }
    });
    $(document).on('click', '#fullscreen-btn', function(e) {
        e.preventDefault();

        if (screenfull.isEnabled) {
            screenfull.toggle();
        }
    });

    $(document).on('click', '#searchBtn, #closeSearchBtn', function() {
        $('#search-bar').toggleClass('open');
        if ( $('#search-bar').hasClass('open')) {
            setTimeout(() => {
                $('#search-bar').find('input').trigger('focus');
            });
        }
    });

    $(document).on('keyup', '#search-bar input', function(e) {
        e.stopPropagation();
        // https://github.com/jquery/jquery/issues/4755#issuecomment-664501730
        if (e.which === 27) { // ESC key
            $('#search-bar').removeClass('open');
        }
    });

    $(document).on('click', '#search-bar .backdrop', function() {
        $('#search-bar').removeClass('open');
    });

    $(document).on('shown.bs.modal', '.modal', function() {
        $('[data-toggle="tooltip"]').tooltip();
        $('[data-toggle="popover"]').popover();
    });

    $('[data-toggle="tooltip"]').tooltip();
    $('[data-toggle="popover"]').popover();
});

$(function (){
    'use strict';
    let openMenu = null;
    window.showContextMenu = function (x, y, contextMenu) {
        const newTempElement = document.createElement('div');
        newTempElement.style.position = 'absolute';
        newTempElement.style.top = y+'px';
        newTempElement.style.left = x+'px';
        document.body.appendChild(newTempElement);
        if (openMenu) hideContextMenu(openMenu);
        openMenu = new Popper(newTempElement, contextMenu, {
            strategy: 'fixed',
            placement: 'bottom-start'
        });
        $(contextMenu).addClass('show');
    };

    function hideContextMenu(popperMenu) {
        $(popperMenu.popper).removeClass('show');
        popperMenu.reference.remove();
    };
    
    $(document).on('click', function () {
        try {
            if (openMenu) {
                this.hideContextMenu(openMenu);
                openMenu = null;
            }
        } catch (e) {
            // Something might have gone wrong. Let click event bubble
        }
    });
});


$(function() {
    $(document).on('click', '.settings-btn', function() {
        $('.settings-panel').toggleClass('open');
    });

    $(document).on('change', 'input[type=radio][name=menu-switch]', function() {
        switch (this.value) {
        case 'default':
            $('.main-wrapper').removeClass('mini overlay-menu horizontal collapsed');
            break;
        case 'horizontal':
            $('.main-wrapper').removeClass('mini overlay-menu without-icon collapsed').addClass('horizontal');
            break;
        case 'horizontal-no-icon':
            $('.main-wrapper').removeClass('mini overlay-menu without-icon collapsed').addClass('horizontal without-icon');
            break;
        case 'mini':
            $('.main-wrapper').removeClass('horizontal overlay-menu without-icon collapsed').addClass('mini');
            break;
        case 'overlay':
            $('.main-wrapper').removeClass('mini horizontal').addClass('overlay-menu collapsed');
            break;
        }
    });
    $(document).on('change', 'input[type=radio][name=layout-switch]', function() {
        switch (this.value) {
        case 'box':
            $('.right-area .main-content').removeClass('container-fluid').addClass('container');
            break;
        case 'full-width':
            $('.right-area .main-content').removeClass('container').addClass('container-fluid');
            break;
        }
    });
    $(document).on('click', '.color-pellate .btn', function () {
        document.getElementsByTagName('head')[0].getElementsByTagName('link')[0].href = $(this).data('href');
    });
    $(document).on('change', 'input[type=radio][name=direction-switch]', function() {
        switch (this.value) {
        case 'ltr':
            $('html').removeClass('rtl');
            break;
        case 'rtl':
            $('html').addClass('rtl');
            break;
        }
    });
});
