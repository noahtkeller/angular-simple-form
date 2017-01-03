function form($http) {
  return {
    restrict: 'E',
    scope   : {
      formModel      : '=',
      enableOnSuccess: '=',
      action         : '@',
      method         : '@',
      init           : '='
    },
    link    : function (scope, elem, attrs, ctl) {

      ctl = ctl || elem.parent().controller();

      // This is our response handler, used as the ajaxSubmit callback, and for client-side validation errors
      function responseHandler(res) {
        // re-enables the form if necessary to allow submission
        if ((res.success === true && enableOnSuccess !== false) || res.success === false) {
          form._enabled = true;
          // deactivate inputs
          for (var inputId in inputMap) {
            if (inputMap.hasOwnProperty(inputId)) {
              inputMap[ inputId ].removeClass('active');
            }
          }
        }
        if (res.success === true && model.hasOwnProperty('successHandler') && typeof model.successHandler === 'function') {
          // call the model successHandler
          model.successHandler.call(form, res);
        } else if (res.success === false && model.hasOwnProperty('errorHandler') && typeof model.errorHandler === 'function') {
          // call the model errorHandler
          model.errorHandler.call(form, res);
        }
      }

      // ajax submit subroutine - only called if this is an ajax form - ajax-post ajax-put ajax-get ajax-delete
      function ajaxSubmit() {
        $http({
          method: method.split('ajax-')[ 1 ],
          url   : action
        }).then(function (res) {
          // success
          // force success property to true for safe responseHandler action
          if (!res.hasOwnProperty('success') || res.success !== true) {
            res.success = true;
          }
          responseHandler(res);
        }, function (res) {
          // error
          // force success property to false for safe responseHandler action
          if (!res.hasOwnProperty('success') || res.success !== false) {
            res.success = false;
          }
          responseHandler(res);
        });
      }

      // This is our form submission function, it is used to trigger submissions, and as the submit event handler
      function submitForm(event) {
        // event will be undefined if this is used to trigger submission programatically
        function preventDefault() {
          if (event !== undefined) {
            event.preventDefault();
          }
          return false;
        }

        // if this form has already been submitted and is being processed we block resubmission
        if (!form._enabled) {
          return preventDefault();
        }
        // if the form does not pass client side validations we fail with error message
        if (form.$invalid) {
          // data should contain the error message
          responseHandler({ success: false, data: null });
          return preventDefault();
        }
        // if the form is ready to submit and validated we disable it to prevent resubmission
        form._enabled = false;
        // If this is a ajax method we call the ajaxSubmit subroutine and preventDefault in case this is fired
        // as a submit event handler
        if (method.indexOf('ajax-') === 0) {
          ajaxSubmit();
          return preventDefault();
        }
        // If event is undefined we know this was called manually, and we should trigger a submit event if it's
        // gotten this far without returning (this won't re-trigger this handler)
        if (event === undefined) {
          document.forms[ attrs.name ].submit();
        }
      }

      function deactivateBtn() {
        if ((form._enabled && this[ 0 ].type === 'submit') || this[ 0 ].type === 'button' || this[ 0 ].type === 'reset') {
          this.removeClass('active');
        }
      }

      function resetHandler() {
        scope.$emit('reset', true);
      }

      var model = scope.formModel || ctl[ attrs.name ];
      console.log(model);
      var form            = scope[ attrs.name ] || scope.$parent[ attrs.name ];
      var inputMap        = {};
      var tabMap          = [];
      var focus           = attrs.focus || model.focus || null;
      var inputs          = angular.element('input, button, select, textarea, .input, .btn, [ntk-select]', elem);
      var enableOnSuccess = true;
      var action          = model.action || scope.action;
      var init            = typeof scope.init === 'function' && scope.init || typeof model.init === 'function' && model.init;
      var method          = scope.method || 'ajax-post';
      if (typeof action === 'string') {
        if (action.indexOf('.') >= 0) {
          var parts = action.split('.');
          if (model.hasOwnProperty(parts[ parts.length - 1 ])) {
            action = model[ parts[ parts.length - 1 ] ];
          }
        }
      }

      form._enabled = true;

      // This defaults to true, sometimes we want to keep the form disabled in the case of redirects, and things
      // so that the form does not flash enabled before the redirect occurs, this can be set from the model
      // or as an attribute
      if (scope.hasOwnProperty('enableOnSuccess')) {
        enableOnSuccess = scope.enableOnSuccess;
      } else if (model.hasOwnProperty('enableOnSuccess')) {
        enableOnSuccess = model.enableOnSuccess;
      }

      // listen for submit events on the form
      elem.on('submit', submitForm);
      elem.on('reset', resetHandler);

      // iterate the form inputs
      for (let i = 0, tabIdx = 0; i < inputs.length; i++) {
        const input = angular.element(inputs[ i ]);
        const name  = input.attr('name');
        const type  = input[ 0 ].type;
        if (name || type === 'submit' || type === 'reset' || type === 'button') {
          input.attr('tabindex', tabIdx);
          tabMap[ tabIdx ] = input;

          // attach basic event listeners
          input.on('blur', function () {
            this.removeClass('focus');
            this.removeClass('hover');
            if ((this[ 0 ].type === 'submit' && form._enabled) || this[ 0 ].type !== 'submit') {
              this.removeClass('active');
            }
          }.bind(input));

          input.on('focus', function () {
            this.addClass('focus');
            if (this[ 0 ].type === 'button' || this[ 0 ].type === 'reset' || this[ 0 ].type === 'submit') {
              this.addClass('hover');
            }
          }.bind(input));

          input.on('mouseover', function () {
            this.addClass('hover');
          }.bind(input));

          input.on('mouseout', function () {
            this.removeClass('hover');
            // if this is a submit buttons and we mouseout we disable the active state unless the form is disabled
            deactivateBtn.call(this);
          }.bind(input));

          input.on('mousedown', function () {
            this.addClass('active');
          }.bind(input));

          input.on('mouseup', function () {
            // if this is a submit buttons and we mouseout we disable the active state unless the form is disabled
            deactivateBtn.call(this);
          }.bind(input));

          input.on('keydown', function (e) {
            if (e.keyCode === 9) {
              e.preventDefault();
              // if the shift key is down we want to move back
              var nextIdx = Number(input.attr('tabindex')) + (e.shiftKey === true ? -1 : 1);
              if (nextIdx >= tabMap.length) {
                nextIdx = 0;
              } else if (nextIdx < 0) {
                nextIdx = tabMap.length - 1;
              }
              if (!isNaN(nextIdx) && tabMap[ nextIdx ] && typeof tabMap[ nextIdx ].focus === 'function') {
                tabMap[ nextIdx ].focus();
              }
            } else if (e.keyCode === 13) {
              if (this[ 0 ].type === 'submit' || this[ 0 ].type === 'button' || this[ 0 ].type === 'reset') {
                this.addClass('active');
              }
            }
          }.bind(input));

          input.on('keyup', function (e) {
            if (e.keyCode === 13) {
              // if this is a submit buttons and we mouseout we disable the active state unless the form is disabled
              deactivateBtn.call(this);
            }
          }.bind(input));

          tabIdx++;
        }
      }

      // If there is a default focus element specified we give it focus
      if (focus) {
        angular.element('[name="' + focus + '"]', elem).focus();
      }

      // if there is an init function specified
      if (init !== false) {
        init();
      }
    }
  }
}

form.$inject = [ '$http' ];

export default form;