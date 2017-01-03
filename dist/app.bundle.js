webpackJsonp([0],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _angular = __webpack_require__(1);

	var _angular2 = _interopRequireDefault(_angular);

	var _form = __webpack_require__(3);

	var _form2 = _interopRequireDefault(_form);

	var _select = __webpack_require__(4);

	var _select2 = _interopRequireDefault(_select);

	var _textarea = __webpack_require__(5);

	var _textarea2 = _interopRequireDefault(_textarea);

	var _fileInput = __webpack_require__(6);

	var _fileInput2 = _interopRequireDefault(_fileInput);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	_angular2.default.module('simpleForm', []);
	/* injects from baggage-loader */

	_angular2.default.module('simpleForm').directive('form', _form2.default);
	_angular2.default.module('simpleForm').directive('select', _select2.default);
	_angular2.default.module('simpleForm').directive('textarea', _textarea2.default);
	_angular2.default.module('simpleForm').directive('fileInput', _fileInput2.default);

/***/ },
/* 1 */,
/* 2 */,
/* 3 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	/* injects from baggage-loader */

	function form($http) {
	  return {
	    restrict: 'E',
	    scope: {
	      formModel: '=',
	      enableOnSuccess: '=',
	      action: '@',
	      method: '@',
	      init: '='
	    },
	    link: function link(scope, elem, attrs, ctl) {

	      ctl = ctl || elem.parent().controller();

	      // This is our response handler, used as the ajaxSubmit callback, and for client-side validation errors
	      function responseHandler(res) {
	        // re-enables the form if necessary to allow submission
	        if (res.success === true && enableOnSuccess !== false || res.success === false) {
	          form._enabled = true;
	          // deactivate inputs
	          for (var inputId in inputMap) {
	            if (inputMap.hasOwnProperty(inputId)) {
	              inputMap[inputId].removeClass('active');
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
	          method: method.split('ajax-')[1],
	          url: action
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
	          document.forms[attrs.name].submit();
	        }
	      }

	      function deactivateBtn() {
	        if (form._enabled && this[0].type === 'submit' || this[0].type === 'button' || this[0].type === 'reset') {
	          this.removeClass('active');
	        }
	      }

	      function resetHandler() {
	        scope.$emit('reset', true);
	      }

	      var model = scope.formModel || ctl[attrs.name];
	      console.log(model);
	      var form = scope[attrs.name] || scope.$parent[attrs.name];
	      var inputMap = {};
	      var tabMap = [];
	      var focus = attrs.focus || model.focus || null;
	      var inputs = angular.element('input, button, select, textarea, .input, .btn, [ntk-select]', elem);
	      var enableOnSuccess = true;
	      var action = model.action || scope.action;
	      var init = typeof scope.init === 'function' && scope.init || typeof model.init === 'function' && model.init;
	      var method = scope.method || 'ajax-post';
	      if (typeof action === 'string') {
	        if (action.indexOf('.') >= 0) {
	          var parts = action.split('.');
	          if (model.hasOwnProperty(parts[parts.length - 1])) {
	            action = model[parts[parts.length - 1]];
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

	      var _loop = function _loop(i, _tabIdx) {
	        var input = angular.element(inputs[i]);
	        var name = input.attr('name');
	        var type = input[0].type;
	        if (name || type === 'submit' || type === 'reset' || type === 'button') {
	          input.attr('tabindex', _tabIdx);
	          tabMap[_tabIdx] = input;

	          // attach basic event listeners
	          input.on('blur', function () {
	            this.removeClass('focus');
	            this.removeClass('hover');
	            if (this[0].type === 'submit' && form._enabled || this[0].type !== 'submit') {
	              this.removeClass('active');
	            }
	          }.bind(input));

	          input.on('focus', function () {
	            this.addClass('focus');
	            if (this[0].type === 'button' || this[0].type === 'reset' || this[0].type === 'submit') {
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
	              if (!isNaN(nextIdx) && tabMap[nextIdx] && typeof tabMap[nextIdx].focus === 'function') {
	                tabMap[nextIdx].focus();
	              }
	            } else if (e.keyCode === 13) {
	              if (this[0].type === 'submit' || this[0].type === 'button' || this[0].type === 'reset') {
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

	          _tabIdx++;
	        }
	        tabIdx = _tabIdx;
	      };

	      for (var i = 0, tabIdx = 0; i < inputs.length; i++) {
	        _loop(i, tabIdx);
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
	  };
	}

	form.$inject = ['$http'];

	exports.default = form;

/***/ },
/* 4 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	/* injects from baggage-loader */

	function select() {
	  var tmplString = '<select name="{{name}}" ng-options="{{optString}}" ng-model="selectVal" ng-change="change()" ng-model-options="{ allowInvalid: true }"></select>';
	  return {
	    restrict: 'A',
	    require: 'ngModel',
	    scope: {
	      name: "@",
	      opts: "=",
	      optString: "@"
	    },
	    template: tmplString,
	    link: function link(scope, elem, attrs, ngModelCtl) {

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

	exports.default = select;

/***/ },
/* 5 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	/* injects from baggage-loader */

	function textarea($interval) {
	  return {
	    restrict: 'E',
	    require: '?ngModel',
	    link: function link(scope, element, atts, ngModelCtl) {
	      var height = 500,
	          repeatInt,
	          minHeight;
	      var blind = angular.element('<div style="width:0;height:0;overflow:hidden;"></div>');
	      var container = angular.element('<pre class="input"></pre>');
	      var lineHeight = parseInt(element.css('line-height'));

	      var resize = function resize(extra) {
	        container[0].innerHTML = element.val();
	        if (/(^|\n)$/.test(container[0].innerHTML)) {
	          container[0].innerHTML += ' ';
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

	      container[0].innerHTML = ' ';
	      minHeight = container.outerHeight();
	      container.css('min-height', minHeight + 'px');
	      element.css({
	        'max-height': minHeight + 'px',
	        '-webkit-transition': 'max-height 50ms',
	        '-moz-transition': 'max-height 50ms',
	        '-ms-transition': 'max-height 50ms',
	        '-o-transition': 'max-height 50ms',
	        'transition': 'max-height 50ms',
	        'height': '500px',
	        'resize': 'none',
	        'overflow': 'hidden !important'
	      });

	      element.bind('mouseup', function (event) {});

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
	  };
	}

	textarea.$inject = ['$interval'];

	exports.default = textarea;

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	/* injects from baggage-loader */
	__webpack_require__(7);
	__webpack_require__(8);

	function fileInput() {
	  return {
	    restrict: 'A',
	    require: 'ngModel',
	    scope: {
	      placeholder: "@",
	      allowedTypes: "=",
	      fileSizeLimit: "=",
	      maxSizeLimit: "=",
	      name: "@"
	    },
	    templateUrl: __webpack_require__(7),
	    link: function link(scope, elem, attrs, ngModelCtl) {

	      scope.$parent.$on('reset', function () {
	        angular.copy([], scope.files);
	        scope.$apply();
	      });

	      // DOM Elements
	      var fileInput = angular.element("input[type='file']", elem);
	      var addFileButton = angular.element(".plus", elem);

	      elem.addClass('input');

	      scope.fileInputContents = {};

	      // Scope defaults
	      scope.fileSizeLimit = scope.fileSizeLimit === undefined || typeof scope.fileSizeLimit !== 'number' ? 0 : scope.fileSizeLimit;
	      scope.fileSizeLimit = scope.fileSizeLimit < 0 ? 0 : scope.fileSizeLimit;

	      scope.maxSizeLimit = scope.maxSizeLimit === undefined || typeof scope.maxSizeLimit !== 'number' ? 0 : scope.maxSizeLimit;
	      scope.maxSizeLimit = scope.maxSizeLimit < 0 ? 0 : scope.maxSizeLimit;

	      scope.allowedTypes = scope.allowedTypes === undefined ? [] : scope.allowedTypes;
	      scope.allowedTypes = typeof scope.allowedTypes === 'string' ? [scope.allowedTypes] : scope.allowedTypes;
	      scope.allowedTypes = scope.allowedTypes instanceof RegExp ? [scope.allowedTypes] : scope.allowedTypes;
	      scope.allowedTypes = Array.isArray(scope.allowedTypes) ? scope.allowedTypes : [];

	      // Control functions
	      var addFiles = function addFiles(changeEvent) {
	        for (var i = 0; i < changeEvent.target.files.length; i++) {
	          var file = changeEvent.target.files[i];
	          file.removeFile = removeFile;
	          scope.files.push(file);
	        }
	        elem.toggleClass('expanded', scope.files.length > 1);
	        ngModelCtl.$setDirty(true);
	        ngModelCtl.$validate();
	        fileInput[0].value = "";
	        scope.$apply();
	      };

	      var removeFile = function removeFile(index) {
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
	            if (scope.files[i].size >= scope.fileSizeLimit) {
	              valid = false;
	              scope.files[i].error = true;
	            }
	          }
	        }
	        return valid;
	      };

	      ngModelCtl.$validators.maxSize = function (modelValue, viewValue) {
	        if (scope.maxSizeLimit > 0) {
	          var combinedSize = 0;
	          for (var i = 0; i < scope.files.length; i++) {
	            if ((combinedSize += scope.files[i].size) > scope.maxSizeLimit) {
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
	              if (scope.allowedTypes[ii] instanceof RegExp && scope.files[i].type.match(scope.allowedTypes[ii]) !== null || typeof scope.allowedTypes[ii] === 'string' && scope.files[i].type === scope.allowedTypes[ii]) {
	                found = true;
	              }
	            }
	            if (!found) {
	              valid = false;
	              scope.files[i].error = true;
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

	exports.default = fileInput;

/***/ },
/* 7 */
/***/ function(module, exports) {

	var path = 'src/fileInput/fileInput.html';
	var html = "<div ng-mouseleave=\"hover($event)\">\n  <div ng-show=\"files.length === 0\" class=\"placeholder\">{{placeholder}}</div>\n  <div ng-repeat=\"f in files track by $index\" class=\"listItem\" ng-class=\"{error: f.error, remove: f.remove}\">\n    <span class=\"x\" ng-mouseup=\"focus($event); hover($event); f.removeFile($index);\" ng-mousedown=\"focus($event);\"\n          ng-mouseenter=\"f.remove = true; hover($event);\" ng-mouseleave=\"f.remove = false;hover($event);\">&times;</span>\n    <span class=\"fileName\">{{f.name}}</span>\n  </div>\n</div>\n<span class=\"plus\">&plus;</span>\n<input type=\"file\" name=\"{{name}}\" class=\"fileInput-invisible\" multiple ng-model=\"fileInputContents\"/>";
	window.angular.module('ng').run(['$templateCache', function(c) { c.put(path, html) }]);
	module.exports = path;

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(9);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(11)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../node_modules/css-loader/index.js!./../../node_modules/less-loader/index.js!./fileInput.less", function() {
				var newContent = require("!!./../../node_modules/css-loader/index.js!./../../node_modules/less-loader/index.js!./fileInput.less");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(10)();
	// imports


	// module
	exports.push([module.id, "form > [file-input=\"\"] {\n  text-align: left;\n  margin-top: 3px;\n  position: relative;\n}\nform > [file-input=\"\"].expanded {\n  height: auto;\n}\nform > [file-input=\"\"] > input[type=\"file\"].fileInput-invisible {\n  padding: 0px;\n  margin: 0px;\n  position: absolute;\n  cursor: default;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 100%;\n  outline: 0;\n  opacity: 0;\n  z-index: 100;\n}\nform > [file-input=\"\"] > div {\n  margin: 0px;\n  padding: 0px;\n  font-size: 14px;\n  line-height: 17px;\n}\nform > [file-input=\"\"] > div > div > span.x {\n  padding-left: 2px;\n  vertical-align: bottom;\n  z-index: 101;\n  position: relative;\n  cursor: pointer;\n}\nform > [file-input=\"\"] > div > .listItem,\nform > [file-input=\"\"] > div > .placeHolder {\n  padding: 0;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  color: inherit;\n}\nform > [file-input=\"\"] > div > .placeholder {\n  position: relative;\n  vertical-align: baseline;\n}\nform > [file-input=\"\"] > div > .listItem {\n  position: relative;\n  vertical-align: baseline;\n}\nform > [file-input=\"\"] > div > .listItem.remove {\n  font-weight: 600;\n}\nform > [file-input=\"\"] > div > .listItem:not(:nth-child(2)) {\n  padding-top: 1px;\n}\nform > [file-input=\"\"] > div > .listItem.error {\n  color: #9C2311;\n}\nform > [file-input=\"\"] > span.plus {\n  position: absolute;\n  cursor: pointer;\n  right: 10px;\n  font-weight: bold;\n  top: 2px;\n  z-index: 101;\n  font-size: 17px;\n  line-height: 20px;\n}\n", ""]);

	// exports


/***/ },
/* 10 */
/***/ function(module, exports) {

	
	/* injects from baggage-loader */

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	// css base code, injected by the css-loader
	module.exports = function() {
		var list = [];

		// return the list of modules as css string
		list.toString = function toString() {
			var result = [];
			for(var i = 0; i < this.length; i++) {
				var item = this[i];
				if(item[2]) {
					result.push("@media " + item[2] + "{" + item[1] + "}");
				} else {
					result.push(item[1]);
				}
			}
			return result.join("");
		};

		// import a list of modules into the list
		list.i = function(modules, mediaQuery) {
			if(typeof modules === "string")
				modules = [[null, modules, ""]];
			var alreadyImportedModules = {};
			for(var i = 0; i < this.length; i++) {
				var id = this[i][0];
				if(typeof id === "number")
					alreadyImportedModules[id] = true;
			}
			for(i = 0; i < modules.length; i++) {
				var item = modules[i];
				// skip already imported module
				// this implementation is not 100% perfect for weird media query combinations
				//  when a module is imported multiple times with different media queries.
				//  I hope this will never occur (Hey this way we have smaller bundles)
				if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
					if(mediaQuery && !item[2]) {
						item[2] = mediaQuery;
					} else if(mediaQuery) {
						item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
					}
					list.push(item);
				}
			}
		};
		return list;
	};


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	
	/* injects from baggage-loader */

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	var stylesInDom = {},
		memoize = function(fn) {
			var memo;
			return function () {
				if (typeof memo === "undefined") memo = fn.apply(this, arguments);
				return memo;
			};
		},
		isOldIE = memoize(function() {
			return /msie [6-9]\b/.test(window.navigator.userAgent.toLowerCase());
		}),
		getHeadElement = memoize(function () {
			return document.head || document.getElementsByTagName("head")[0];
		}),
		singletonElement = null,
		singletonCounter = 0;

	module.exports = function(list, options) {
		if(false) {
			if(typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
		}

		options = options || {};
		// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
		// tags it will allow on a page
		if (typeof options.singleton === "undefined") options.singleton = isOldIE();

		var styles = listToStyles(list);
		addStylesToDom(styles, options);

		return function update(newList) {
			var mayRemove = [];
			for(var i = 0; i < styles.length; i++) {
				var item = styles[i];
				var domStyle = stylesInDom[item.id];
				domStyle.refs--;
				mayRemove.push(domStyle);
			}
			if(newList) {
				var newStyles = listToStyles(newList);
				addStylesToDom(newStyles, options);
			}
			for(var i = 0; i < mayRemove.length; i++) {
				var domStyle = mayRemove[i];
				if(domStyle.refs === 0) {
					for(var j = 0; j < domStyle.parts.length; j++)
						domStyle.parts[j]();
					delete stylesInDom[domStyle.id];
				}
			}
		};
	}

	function addStylesToDom(styles, options) {
		for(var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];
			if(domStyle) {
				domStyle.refs++;
				for(var j = 0; j < domStyle.parts.length; j++) {
					domStyle.parts[j](item.parts[j]);
				}
				for(; j < item.parts.length; j++) {
					domStyle.parts.push(addStyle(item.parts[j], options));
				}
			} else {
				var parts = [];
				for(var j = 0; j < item.parts.length; j++) {
					parts.push(addStyle(item.parts[j], options));
				}
				stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
			}
		}
	}

	function listToStyles(list) {
		var styles = [];
		var newStyles = {};
		for(var i = 0; i < list.length; i++) {
			var item = list[i];
			var id = item[0];
			var css = item[1];
			var media = item[2];
			var sourceMap = item[3];
			var part = {css: css, media: media, sourceMap: sourceMap};
			if(!newStyles[id])
				styles.push(newStyles[id] = {id: id, parts: [part]});
			else
				newStyles[id].parts.push(part);
		}
		return styles;
	}

	function createStyleElement() {
		var styleElement = document.createElement("style");
		var head = getHeadElement();
		styleElement.type = "text/css";
		head.appendChild(styleElement);
		return styleElement;
	}

	function createLinkElement() {
		var linkElement = document.createElement("link");
		var head = getHeadElement();
		linkElement.rel = "stylesheet";
		head.appendChild(linkElement);
		return linkElement;
	}

	function addStyle(obj, options) {
		var styleElement, update, remove;

		if (options.singleton) {
			var styleIndex = singletonCounter++;
			styleElement = singletonElement || (singletonElement = createStyleElement());
			update = applyToSingletonTag.bind(null, styleElement, styleIndex, false);
			remove = applyToSingletonTag.bind(null, styleElement, styleIndex, true);
		} else if(obj.sourceMap &&
			typeof URL === "function" &&
			typeof URL.createObjectURL === "function" &&
			typeof URL.revokeObjectURL === "function" &&
			typeof Blob === "function" &&
			typeof btoa === "function") {
			styleElement = createLinkElement();
			update = updateLink.bind(null, styleElement);
			remove = function() {
				styleElement.parentNode.removeChild(styleElement);
				if(styleElement.href)
					URL.revokeObjectURL(styleElement.href);
			};
		} else {
			styleElement = createStyleElement();
			update = applyToTag.bind(null, styleElement);
			remove = function() {
				styleElement.parentNode.removeChild(styleElement);
			};
		}

		update(obj);

		return function updateStyle(newObj) {
			if(newObj) {
				if(newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap)
					return;
				update(obj = newObj);
			} else {
				remove();
			}
		};
	}

	var replaceText = (function () {
		var textStore = [];

		return function (index, replacement) {
			textStore[index] = replacement;
			return textStore.filter(Boolean).join('\n');
		};
	})();

	function applyToSingletonTag(styleElement, index, remove, obj) {
		var css = remove ? "" : obj.css;

		if (styleElement.styleSheet) {
			styleElement.styleSheet.cssText = replaceText(index, css);
		} else {
			var cssNode = document.createTextNode(css);
			var childNodes = styleElement.childNodes;
			if (childNodes[index]) styleElement.removeChild(childNodes[index]);
			if (childNodes.length) {
				styleElement.insertBefore(cssNode, childNodes[index]);
			} else {
				styleElement.appendChild(cssNode);
			}
		}
	}

	function applyToTag(styleElement, obj) {
		var css = obj.css;
		var media = obj.media;
		var sourceMap = obj.sourceMap;

		if(media) {
			styleElement.setAttribute("media", media)
		}

		if(styleElement.styleSheet) {
			styleElement.styleSheet.cssText = css;
		} else {
			while(styleElement.firstChild) {
				styleElement.removeChild(styleElement.firstChild);
			}
			styleElement.appendChild(document.createTextNode(css));
		}
	}

	function updateLink(linkElement, obj) {
		var css = obj.css;
		var media = obj.media;
		var sourceMap = obj.sourceMap;

		if(sourceMap) {
			// http://stackoverflow.com/a/26603875
			css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
		}

		var blob = new Blob([css], { type: "text/css" });

		var oldSrc = linkElement.href;

		linkElement.href = URL.createObjectURL(blob);

		if(oldSrc)
			URL.revokeObjectURL(oldSrc);
	}


/***/ }
]);