function fileInput() {
  return {
    restrict   : 'A',
    require    : 'ngModel',
    scope      : {
      placeholder  : "@",
      allowedTypes : "=",
      fileSizeLimit: "=",
      maxSizeLimit : "=",
      name         : "@"
    },
    templateUrl: require('./fileInput.html'),
    link       : function (scope, elem, attrs, ngModelCtl) {

      scope.$parent.$on('reset', function () {
        angular.copy([], scope.files);
        scope.$apply();
      });

      // DOM Elements
      var fileInput     = angular.element("input[type='file']", elem);
      var addFileButton = angular.element(".plus", elem);

      elem.addClass('input');

      scope.fileInputContents = {};

      // Scope defaults
      scope.fileSizeLimit = scope.fileSizeLimit === undefined || typeof scope.fileSizeLimit !== 'number' ? 0 : scope.fileSizeLimit;
      scope.fileSizeLimit = scope.fileSizeLimit < 0 ? 0 : scope.fileSizeLimit;

      scope.maxSizeLimit = scope.maxSizeLimit === undefined || typeof scope.maxSizeLimit !== 'number' ? 0 : scope.maxSizeLimit;
      scope.maxSizeLimit = scope.maxSizeLimit < 0 ? 0 : scope.maxSizeLimit;

      scope.allowedTypes = scope.allowedTypes === undefined ? [] : scope.allowedTypes;
      scope.allowedTypes = typeof scope.allowedTypes === 'string' ? [ scope.allowedTypes ] : scope.allowedTypes;
      scope.allowedTypes = scope.allowedTypes instanceof RegExp ? [ scope.allowedTypes ] : scope.allowedTypes;
      scope.allowedTypes = Array.isArray(scope.allowedTypes) ? scope.allowedTypes : [];

      // Control functions
      var addFiles = function (changeEvent) {
        for (var i = 0; i < changeEvent.target.files.length; i++) {
          var file        = changeEvent.target.files[ i ];
          file.removeFile = removeFile;
          scope.files.push(file);
        }
        elem.toggleClass('expanded', scope.files.length > 1);
        ngModelCtl.$setDirty(true);
        ngModelCtl.$validate();
        fileInput[ 0 ].value = "";
        scope.$apply();
      };

      var removeFile = function (index) {
        scope.files.splice(index, 1);
        elem.toggleClass('expanded', scope.files.length > 1);
        ngModelCtl.$validate();
      };

      // Overrides
      ngModelCtl.$isEmpty = function () {
        return ngModelCtl.$viewValue.length === 0;
      };

      ngModelCtl.$render = function () {
        scope.files = ngModelCtl.$viewValue;
      };

      // Validators
      ngModelCtl.$validators.fileSize = function (modelValue, viewValue) {
        var valid = true;
        if (scope.fileSizeLimit > 0) {
          for (var i = 0; i < scope.files.length; i++) {
            if (scope.files[ i ].size >= scope.fileSizeLimit) {
              valid                  = false;
              scope.files[ i ].error = true;
            }
          }
        }
        return valid;
      };

      ngModelCtl.$validators.maxSize = function (modelValue, viewValue) {
        if (scope.maxSizeLimit > 0) {
          var combinedSize = 0;
          for (var i = 0; i < scope.files.length; i++) {
            if ((combinedSize += scope.files[ i ].size) > scope.maxSizeLimit) {
              return false;
            }
          }
        }
        return true;
      };

      ngModelCtl.$validators.type = function (modelValue, viewValue) {
        var valid = true;
        if (scope.allowedTypes.length > 0) {
          for (var i = 0; i < scope.files.length; i++) {
            var found = false;
            for (var ii = 0; ii < scope.allowedTypes.length; ii++) {
              if ((scope.allowedTypes[ ii ] instanceof RegExp && scope.files[ i ].type.match(scope.allowedTypes[ ii ]) !== null) ||
                (typeof scope.allowedTypes[ ii ] === 'string' && scope.files[ i ].type === scope.allowedTypes[ ii ])) {
                found = true;
              }
            }
            if (!found) {
              valid                  = false;
              scope.files[ i ].error = true;
            }
          }
        }
        return valid;
      };

      // Event bindings
      scope.hover = function ($event) {
        elem.toggleClass('hover', $event.type === 'mouseenter');
      };

      scope.focus = function ($event) {
        elem.toggleClass('focus', $event.type === 'mousedown');
      };

      fileInput.bind('click', function ($event) {
        if ($event.originalEvent) {
          $event.preventDefault();
          $event.stopPropagation();
        }
      });

      addFileButton.bind('click', function () {
        fileInput.trigger('click');
      });

      addFileButton.bind('mouseenter mouseleave', scope.hover);
      addFileButton.bind('mousedown mouseup mouseleave', scope.focus);

      fileInput.bind('blur', function () {
        scope.$apply(function () {
          ngModelCtl.$setDirty(true);
        });
      });

      fileInput.bind('change', addFiles);
    }
  };
}

export default fileInput;