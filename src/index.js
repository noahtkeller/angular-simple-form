import angular from 'angular';

import form from './form.js';
import select from './select.js';
import textarea from './textarea.js';
import fileInput from './fileInput/fileInput.js';

angular.module('simpleForm', []);
angular.module('simpleForm').directive('form', form);
angular.module('simpleForm').directive('select', select);
angular.module('simpleForm').directive('textarea', textarea);
angular.module('simpleForm').directive('fileInput', fileInput);
