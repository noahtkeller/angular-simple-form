import angular from 'angular';

import form from './form.js';
import select from './select.js';
import textarea from './textarea.js';
import fileInput from './fileInput/fileInput.js';

export default angular.module('simpleForm', [])
  .directive('form', form)
  .directive('select', select)
  .directive('textarea', textarea)
  .directive('fileInput', fileInput);
