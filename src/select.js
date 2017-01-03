function select() {
  var tmplString = '<select name="{{name}}" ng-options="{{optString}}" ng-model="selectVal" ng-change="change()" ng-model-options="{ allowInvalid: true }"></select>';
  return {
    restrict: 'A',
    require : 'ngModel',
    scope   : {
      name     : "@",
      opts     : "=",
      optString: "@"
    },
    template: tmplString,
    link    : function (scope, elem, attrs, ngModelCtl) {

      console.log(scope.opts);

      var select = angular.element('select', elem);

      elem.on('focus', function () {
        select.focus();
      });

      scope.selectVal = '';

      scope.change = function () {
        ngModelCtl.$setViewValue(scope.selectVal);
      };

      // Overrides
      ngModelCtl.$render = function () {
        scope.selectVal = ngModelCtl.$viewValue;
      };

    }
  };
}

select.$inject = [];

export default select;