function textarea($interval) {
  return {
    restrict: 'E',
    require : '?ngModel',
    link    : function (scope, element, atts, ngModelCtl) {
      var height     = 500, repeatInt, minHeight;
      var blind      = angular.element('<div style="width:0;height:0;overflow:hidden;"></div>');
      var container  = angular.element('<pre class="input"></pre>');
      var lineHeight = parseInt(element.css('line-height'));

      var resize = function resize(extra) {
        container[ 0 ].innerHTML = element.val();
        if (/(^|\n)$/.test(container[ 0 ].innerHTML)) {
          container[ 0 ].innerHTML += ' ';
        }
        var newHeight = container.outerHeight();
        if (extra === true) {
          newHeight += lineHeight;
        } else if (extra === false && /\n$/.test(element.val())) {
          newHeight -= lineHeight;
        }
        if (newHeight > height) {
          height = newHeight;
          element.css('height', newHeight + 'px');
        }
        element.css('max-height', newHeight + 'px');
      };

      angular.element(document.body).append(blind.append(container));

      container[ 0 ].innerHTML = ' ';
      minHeight                = container.outerHeight();
      container.css('min-height', minHeight + 'px');
      element.css({
        'max-height'        : minHeight + 'px',
        '-webkit-transition': 'max-height 50ms',
        '-moz-transition'   : 'max-height 50ms',
        '-ms-transition'    : 'max-height 50ms',
        '-o-transition'     : 'max-height 50ms',
        'transition'        : 'max-height 50ms',
        'height'            : '500px',
        'resize'            : 'none',
        'overflow'          : 'hidden !important'
      });

      element.bind('mouseup', function (event) {
      });

      element.bind('keydown', function (event) {
        if (event.keyCode === 13) {
          resize(true);
        } else if (event.keyCode === 8) {
          resize(false);
        } else {
          resize();
        }
        if (!repeatInt) {
          repeatInt = $interval(resize, 75);
        }
      });

      element.bind('keyup', function () {
        resize();
        $interval.cancel(repeatInt);
      });

      element.bind('focus blur', resize);

      if (ngModelCtl.hasOwnProperty('$render')) {
        ngModelCtl.$render = function () {
          resize();
        };
      }
    }
  }
}

textarea.$inject = [ '$interval' ];

export default textarea;