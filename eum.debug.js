(function () {
  'use strict';

  var pageLoad = 'pl';

  // aliasing globals for improved minifications
  var win = window;
  var doc = win.document;
  var nav = navigator;
  var inEncodeURIComponent = win.encodeURIComponent;
  var XMLHttpRequest = win.XMLHttpRequest;
  var originalFetch = win.fetch;
  var localStorage = function () {
    try {
      return win.localStorage;
    } catch (e) {
      // localStorage access is not permitted in certain security modes, e.g.
      // when cookies are completely disabled in web browsers.
      return null;
    }
  }();
  /**
   * Leverage's browser behavior to load image sources. Exposed via this module
   * to enable testing.
   */

  function executeImageRequest(url) {
    var image = new Image();
    image.src = url;
  }
  /**
   * Exposed via this module to enable testing.
   */

  function sendBeacon(url, data) {
    return nav.sendBeacon(url, data);
  }

  // protection against hasOwnProperty overrides.

  var globalHasOwnProperty = Object.prototype.hasOwnProperty;
  function hasOwnProperty(obj, key) {
    return globalHasOwnProperty.call(obj, key);
  }
  function now() {
    return new Date().getTime();
  }
  function noop() {// This function is intentionally empty.
  } // We are trying to stay close to common tracing architectures and use
  // a hex encoded 64 bit random ID.

  var validIdCharacters = '0123456789abcdef'.split('');

  var generateUniqueIdImpl = function generateUniqueIdViaRandom() {
    var result = '';

    for (var _i2 = 0; _i2 < 16; _i2++) {
      result += validIdCharacters[Math.round(Math.random() * 15)];
    }

    return result;
  };

  if (win.crypto && win.crypto.getRandomValues && win.Uint32Array) {
    generateUniqueIdImpl = function generateUniqueIdViaCrypto() {
      var array = new win.Uint32Array(2);
      win.crypto.getRandomValues(array);
      return array[0].toString(16) + array[1].toString(16);
    };
  }

  var generateUniqueId = generateUniqueIdImpl;
  function addEventListener$1(target, eventType, callback) {
    if (target.addEventListener) {
      target.addEventListener(eventType, callback, false);
    } else if (target.attachEvent) {
      target.attachEvent('on' + eventType, callback);
    }
  }
  function removeEventListener$1(target, eventType, callback) {
    if (target.removeEventListener) {
      target.removeEventListener(eventType, callback, false);
    } else if (target.detachEvent) {
      target.detachEvent('on' + eventType, callback);
    }
  }
  function matchesAny(regexp, s) {
    for (var _i4 = 0, _len2 = regexp.length; _i4 < _len2; _i4++) {
      if (regexp[_i4].test(s)) {
        return true;
      }
    }

    return false;
  }

  var log =  createLogger('log') ;
  var info =  createLogger('info') ;
  var warn =  createLogger('warn') ;
  var error =  createLogger('error') ;
  var debug =  createLogger('debug') ;

  function createLogger(method) {
    if (typeof console === 'undefined' || typeof console.log !== 'function' || typeof console.log.apply !== 'function') {
      return noop;
    }

    if (console[method] && typeof console[method].apply === 'function') {
      return function () {
        // eslint-disable-next-line prefer-rest-params, prefer-spread
        console[method].apply(console, arguments);
      };
    }

    return function () {
      // eslint-disable-next-line prefer-rest-params, prefer-spread
      console.log.apply(console, arguments);
    };
  }

  // ensure that execution of timers happens outside of any Angular specific zones. This in turn
  // means that this script will never disturb Angular's stabilization phase.
  // https://angular.io/api/core/ApplicationRef#isStable
  // Please note that it may sometimes be necessary to deliberately execute code inside of
  // Angular's Zones. Always take care to make a deliberate decision when to use and when not to
  // use these wrappers.
  // We take a copy of all globals to ensure that no other script will change them all of a sudden.
  // This ensures that when we register a timeout/interval on one global, that we will be able to
  // de-register it again in all cases.

  var globals = {
    'setTimeout': win.setTimeout,
    'clearTimeout': win.clearTimeout,
    'setInterval': win.setInterval,
    'clearInterval': win.clearInterval
  }; // If the globals don't exist at execution time of this file, then we know that the globals stored
  // above are not wrapped by Zone.js. This in turn can mean better performance for Angular users.

  var isRunningZoneJs = win['Zone'] != null && win['Zone']['root'] != null && typeof win['Zone']['root']['run'] === 'function';

  if ( isRunningZoneJs) {
    info('Discovered Zone.js globals. Will attempt to register all timers inside the root Zone.');
  }

  function setTimeout$1() {
    for (var _len = arguments.length, _args = new Array(_len), _key = 0; _key < _len; _key++) {
      _args[_key] = arguments[_key];
    }

    // eslint-disable-next-line prefer-rest-params
    return executeGlobally.apply('setTimeout', arguments);
  }
  function clearTimeout() {
    for (var _len2 = arguments.length, _args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      _args[_key2] = arguments[_key2];
    }

    // eslint-disable-next-line prefer-rest-params
    return executeGlobally.apply('clearTimeout', arguments);
  }
  function setInterval() {
    for (var _len3 = arguments.length, _args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      _args[_key3] = arguments[_key3];
    }

    // eslint-disable-next-line prefer-rest-params
    return executeGlobally.apply('setInterval', arguments);
  }

  function executeGlobally() {
    // We don't want to incur a performance penalty for all users just because some
    // users are relying on zone.js. This API looks quite ridiculous, but it
    // allows for concise and efficient code, e.g. arguments does not need to be
    // translated into an array.
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    var globalFunctionName = this;

    if (isRunningZoneJs) {
      try {
        // Incurr a performance overhead for Zone.js users that we just cannot avoid:
        // Copy the arguments passed in here so that we can use them inside the root
        // zone.
        // eslint-disable-next-line prefer-rest-params
        var _args2 = Array.prototype.slice.apply(arguments);

        return win['Zone']['root']['run'](globals[globalFunctionName], win, _args2);
      } catch (e) {
        {
          warn('Failed to execute %s inside of zone (via Zone.js). Falling back to execution inside currently ' + 'active zone.', globalFunctionName, e);
        } // failure – maybe zone js not properly initialized? Fall back to execution
        // outside of Zone.js as a last resort (outside of try/catch and if)

      }
    } // Note: Explicitly passing win as 'this' even though we are getting the function from 'globals'
    // eslint-disable-next-line prefer-rest-params


    return globals[globalFunctionName].apply(win, arguments);
  }

  var bus = {};
  function on(name, fn) {
    var listeners = bus[name] = bus[name] || [];
    listeners.push(fn);
  }
  function emit(name, value) {
    var listeners = bus[name];

    if (!listeners) {
      return;
    }

    for (var _i4 = 0, _length2 = listeners.length; _i4 < _length2; _i4++) {
      listeners[_i4](value);
    }
  }

  var event = {
    name: 'e:onLoad',
    time: null,
    initialize: function initialize() {
      if (document.readyState === 'complete') {
        return onReady();
      }

      addEventListener$1(win, 'load', function () {
        // we want to get timing data for loadEventEnd,
        // so asynchronously process this
        setTimeout$1(onReady, 0);
      });
    }
  };

  function onReady() {
    event.time = now();
    emit(event.name, event.time);
  }

  var states = {};
  var currentStateName;
  function registerState(name, impl) {
    states[name] = impl;
  }
  function transitionTo(nextStateName) {
    {
      info('Transitioning from %s to %s', currentStateName || '<no state>', nextStateName);
    }

    currentStateName = nextStateName;
    states[nextStateName].onEnter();
  }
  function getActiveTraceId() {
    return currentStateName ? states[currentStateName].getActiveTraceId() : null;
  }
  function getActivePhase() {
    return currentStateName ? states[currentStateName].getActivePhase() : null;
  }

  var performance$1 = win.performance || win.webkitPerformance || win.msPerformance || win.mozPerformance;
  var isTimingAvailable = !!(performance$1 && performance$1.timing);
  var isResourceTimingAvailable = !!(performance$1 && performance$1.getEntriesByType);
  var isPerformanceObserverAvailable = performance$1 && typeof win['PerformanceObserver'] === 'function' && typeof performance$1['now'] === 'function';

  var defaultVars = {
    nameOfLongGlobal: 'EumObject',
    trackingSnippetVersion: null,
    pageLoadTraceId: generateUniqueId(),
    pageLoadBackendTraceId: null,
    serverTimingBackendTraceIdEntryName: 'intid',
    referenceTimestamp: now(),
    highResTimestampReference: performance$1 && performance$1.now ? performance$1.now() : 0,
    initializerExecutionTimestamp: now(),
    reportingUrl: null,
    beaconBatchingTime: 500,
    maxWaitForResourceTimingsMillis: 10000,
    maxToleranceForResourceTimingsMillis: 3000,
    maxMaitForPageLoadMetricsMillis: 5000,
    apiKey: null,
    meta: {},
    ignoreUrls: [],
    ignorePings: true,
    ignoreErrorMessages: [],
    xhrTransmissionTimeout: 20000,
    allowedOrigins: [],
    page: undefined,
    wrapEventHandlers: false,
    autoPageDetection: false,
    wrappedEventHandlersOriginalFunctionStorageKey: '__weaselOriginalFunctions__',
    wrapTimers: false,
    secretPropertyKey: '__weaselSecretData__',
    userId: undefined,
    userName: undefined,
    userEmail: undefined,
    sessionId: undefined,
    sessionStorageKey: 'session',
    defaultSessionInactivityTimeoutMillis: 1000 * 60 * 60 * 3,
    defaultSessionTerminationTimeoutMillis: 1000 * 60 * 60 * 6,
    maxAllowedSessionTimeoutMillis: 1000 * 60 * 60 * 24,
    // The default ignore rules cover specific React and Angular patterns:
    //
    // React has a whole lot of user timings. Luckily all of them start with
    // the emojis for easy filtering. Let's ignore them by default as most of
    // them won't be valuable to many of our users (in production).
    //
    // Similar for Angular which uses zones with a ton of custom user
    // timings. https://angular.io/guide/zone
    //
    // We have also seen people use 'start xyz' / 'end xyz' as a common pattern to
    // name marks used to create measures. This is surely not a comprehensive
    // solution to identify these cases, but should for now be sufficient.
    ignoreUserTimings: [/^\u269B/, /^\u26D4/, /^Zone(:|$)/, /^start /i, /^end /i],
    urlsToCheckForGraphQlInsights: [/\/graphql/i],
    secrets: [/key/i, /password/i, /secret/i],
    fragment: [],
    headersToCapture: [],
    reportingBackends: [],
    agentVersion: '0.0.0',
    //0.0.0 will be replaced with version from package.json
    webvitalsInCustomEvent: false
  };

  var state = {
    onEnter: function onEnter() {
      on(event.name, onLoad);
      event.initialize();
    },
    getActiveTraceId: function getActiveTraceId() {
      return defaultVars.pageLoadTraceId;
    },
    getActivePhase: function getActivePhase() {
      return pageLoad;
    }
  };

  function onLoad() {
    transitionTo('pageLoaded');
  }

  var urlAnalysisElement = null;

  try {
    urlAnalysisElement = document.createElement('a');
  } catch (e) {
    {
      debug('Failed to create URL analysis element. Will not be able to normalize URLs.', e);
    }
  }

  function stripSecrets(url) {
    if (!url || url === '') {
      return url;
    }

    try {
      if (urlAnalysisElement) {
        urlAnalysisElement.href = url;
        url = urlAnalysisElement.href;
      }

      var _queryIndex = url.indexOf('?');

      var _hashIndex = url.indexOf('#');

      var _fragString = null;

      if (_hashIndex >= 0) {
        _fragString = url.substring(_hashIndex);

        if (url && matchesAny(defaultVars.fragment, url)) {
          _fragString = '#<redacted>';
        }

        url = url.substring(0, _hashIndex);
      }

      if (_queryIndex >= 0) {
        var _queryString = url.substring(_queryIndex).split('&').map(function (param) {
          var key = param.split('=')[0];

          if (key && matchesAny(defaultVars.secrets, key)) {
            return key + '=<redacted>';
          }

          return param;
        }).join('&');

        url = url.substring(0, _queryIndex) + _queryString + (_fragString ? _fragString : '');
      }
    } catch (e) {
      {
        debug('Failed to strip secret from ' + url);
      }
    }

    return url;
  }

  function _typeof(obj) {
    "@babel/helpers - typeof";

    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
  }

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArrayLimit(arr, i) {
    if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return;
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

    return arr2;
  }

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  function _createForOfIteratorHelper(o, allowArrayLike) {
    var it;

    if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) {
      if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
        if (it) o = it;
        var i = 0;

        var F = function () {};

        return {
          s: F,
          n: function () {
            if (i >= o.length) return {
              done: true
            };
            return {
              done: false,
              value: o[i++]
            };
          },
          e: function (e) {
            throw e;
          },
          f: F
        };
      }

      throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }

    var normalCompletion = true,
        didErr = false,
        err;
    return {
      s: function () {
        it = o[Symbol.iterator]();
      },
      n: function () {
        var step = it.next();
        normalCompletion = step.done;
        return step;
      },
      e: function (e) {
        didErr = true;
        err = e;
      },
      f: function () {
        try {
          if (!normalCompletion && it.return != null) it.return();
        } finally {
          if (didErr) throw err;
        }
      }
    };
  }

  function createExcessiveUsageIdentifier(opts) {
    var maxCalls = opts.maxCalls || 4096;
    var maxCallsPerTenMinutes = opts.maxCallsPerTenMinutes || 128;
    var maxCallsPerTenSeconds = opts.maxCallsPerTenSeconds || 32;
    var totalCalls = 0;
    var totalCallsInLastTenMinutes = 0;
    var totalCallsInLastTenSeconds = 0;
    setInterval(function () {
      totalCallsInLastTenMinutes = 0;
    }, 1000 * 60 * 10);
    setInterval(function () {
      totalCallsInLastTenSeconds = 0;
    }, 1000 * 10);
    return function isExcessiveUsage() {
      return ++totalCalls > maxCalls || ++totalCallsInLastTenMinutes > maxCallsPerTenMinutes || ++totalCallsInLastTenSeconds > maxCallsPerTenSeconds;
    };
  }

  var urlMaxLength = 255;
  var initiatorTypes = {
    'other': 0,
    'img': 1,
    // IMAGE element inside a SVG
    'image': 1,
    'link': 2,
    'script': 3,
    'css': 4,
    'xmlhttprequest': 5,
    'fetch': 5,
    'beacon': 5,
    'html': 6,
    'navigation': 6
  };
  var cachingTypes = {
    unknown: 0,
    cached: 1,
    validated: 2,
    fullLoad: 3
  };

  function isTransmitionRequest(url) {
    var lowerCaseUrl = url.toLowerCase();

    if (defaultVars.reportingBackends && defaultVars.reportingBackends.length > 0) {
      for (var _i2 = 0, _len2 = defaultVars.reportingBackends.length; _i2 < _len2; _i2++) {
        var _reportingBackend = defaultVars.reportingBackends[_i2];

        if (_reportingBackend['reportingUrl'] && _reportingBackend['reportingUrl'].length > 0) {
          var _lowerCaseReportingUrl = _reportingBackend['reportingUrl'].toLowerCase();

          if (lowerCaseUrl === _lowerCaseReportingUrl || lowerCaseUrl === _lowerCaseReportingUrl + '/') {
            return true;
          }
        }
      }
    } else if (defaultVars.reportingUrl) {
      var _lowerCaseReportingUrl2 = defaultVars.reportingUrl.toLowerCase();

      return lowerCaseUrl === _lowerCaseReportingUrl2 || lowerCaseUrl === _lowerCaseReportingUrl2 + '/';
    }

    return false;
  }

  var dataUrlPrefix = 'data:';
  var ignorePingsRegex = /.*\/ping(\/?$|\?.*)/i;
  function isUrlIgnored(url) {
    if (!url) {
      return true;
    } // Force string conversion. During runtime we have seen that some URLs passed into this code path aren't actually
    // strings. Reason currently unknown.


    url = String(url);

    if (!url) {
      return true;
    } // We never want to track data URLs. Instead of matching these via regular expressions (which might be expensive),
    // we are explicitly doing a startsWith ignore case check
    // https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs


    if (url.substring == null || url.substring(0, dataUrlPrefix.length).toLowerCase() === dataUrlPrefix) {
      return true;
    }

    if (defaultVars.ignorePings && ignorePingsRegex.test(url)) {
      return true;
    } // Disable monitoring of data transmission requests. The data transmission strategy already ensures
    // that data transmission requests are not picked up internally. However we have seen some users
    // leverage custom (broken) XMLHttpRequest instrumentations to implement application code which
    // then break the detection of data transmission requests.


    if (isTransmitionRequest(url)) {
      return true;
    }

    return matchesAny(defaultVars.ignoreUrls, url);
  }
  function isErrorMessageIgnored(message) {
    return !message || matchesAny(defaultVars.ignoreErrorMessages, message);
  }

  var INTERNAL_END_MARKER = '<END>';
  function createTrie() {
    return new Trie();
  }

  var Trie = function Trie() {
    this.root = {};
  };

  Trie.prototype.addItem = function addItem(key, value) {
    this.insertItem(this.root, key.split(''), 0, value);
    return this;
  };

  Trie.prototype.insertItem = function insertItem(node, keyCharacters, keyCharacterIndex, value) {
    var character = keyCharacters[keyCharacterIndex]; // Characters exhausted, add value to node

    if (character == null) {
      var _values = node[INTERNAL_END_MARKER] = node[INTERNAL_END_MARKER] || [];

      _values.push(value);

      return;
    }

    var nextNode = node[character] = node[character] || {};
    this.insertItem(nextNode, keyCharacters, keyCharacterIndex + 1, value);
  };

  Trie.prototype.toJs = function toJs(node) {
    node = node || this.root;
    var keys = getKeys(node);

    if (keys.length === 1 && keys[0] === INTERNAL_END_MARKER) {
      return node[INTERNAL_END_MARKER].slice();
    }

    var result = {};

    for (var _i2 = 0, _length2 = keys.length; _i2 < _length2; _i2++) {
      var _key2 = keys[_i2];

      if (_key2 === INTERNAL_END_MARKER) {
        result['$'] = node[INTERNAL_END_MARKER].slice();
        continue;
      }

      var _combinedKeys = _key2;
      var _child = node[_key2];

      var _childKeys = getKeys(_child);

      while (_childKeys.length === 1 && _childKeys[0] !== INTERNAL_END_MARKER) {
        _combinedKeys += _childKeys[0];
        _child = _child[_childKeys[0]];
        _childKeys = getKeys(_child);
      }

      result[_combinedKeys] = this.toJs(_child);
    }

    return result;
  };

  function getKeys(obj) {
    var result = [];

    for (var _key5 in obj) {
      if (hasOwnProperty(obj, _key5)) {
        result.push(_key5);
      }
    }

    return result;
  }

  // See https://www.w3.org/TR/hr-time/

  function addResourceTimings(beacon, minStartTime) {
    if (!!isResourceTimingAvailable && win.JSON) {
      var _entries = getEntriesTransferFormat(performance$1.getEntriesByType('resource'), minStartTime);

      storePerformanceMetrics();
      beacon['res'] = win.JSON.stringify(_entries);
    } else {
      info('Resource timing not supported.');
    }
  } // Helper to handle sessionStorage

  function storePerformanceMetricsData(performanceMetricsList) {
    sessionStorage.setItem('performanceMetrics', JSON.stringify(performanceMetricsList));
  } // Helper to generate metadata from a PerformanceResourceTiming entry

  function generateMetaData(entry) {
    return JSON.stringify({
      connectEnd: entry.connectEnd,
      connectStart: entry.connectStart,
      domainLookupEnd: entry.domainLookupEnd,
      domainLookupStart: entry.domainLookupStart,
      duration: entry.duration,
      entryType: entry.entryType,
      fetchStart: entry.fetchStart,
      initiatorType: entry.initiatorType,
      redirectEnd: entry.redirectEnd,
      redirectStart: entry.redirectStart,
      requestStart: entry.requestStart,
      responseEnd: entry.responseEnd,
      responseStart: entry.responseStart,
      secureConnectionStart: entry.secureConnectionStart,
      startTime: entry.startTime,
      transferSize: entry.transferSize
    });
  } // Generalized function to process entries and store metadata

  function processEntry(entry) {
    var key = "".concat(entry.name, "_").concat(generateUniqueId());

    var performanceMetrics = _defineProperty({}, key, generateMetaData(entry));

    return performanceMetrics;
  }
  function storePerformanceMetrics() {
    var _performance$getEntri;

    sessionStorage.removeItem('performanceMetrics');
    var performanceMetricsList = [];
    (_performance$getEntri = performance$1.getEntriesByType('resource')) === null || _performance$getEntri === void 0 || _performance$getEntri.forEach(function (entry) {
      performanceMetricsList.push(processEntry(entry));
    });
    storePerformanceMetricsData(performanceMetricsList);
  }
  function getEntriesTransferFormat(performanceEntries, minStartTime) {
    var trie = createTrie();

    for (var _i2 = 0, _len2 = performanceEntries.length; _i2 < _len2; _i2++) {
      var _entry = performanceEntries[_i2];

      if (minStartTime != null && _entry['startTime'] - defaultVars.highResTimestampReference + defaultVars.referenceTimestamp < minStartTime) {
        continue;
      } else if (_entry['duration'] < 0) {
        // Some old browsers do not properly implement resource timing. They report negative durations.
        // Ignore instead of reporting these, as the data isn't usable.
        continue;
      }

      var _url = _entry.name;

      if (isUrlIgnored(_url)) {
        {
          info('Will not include data about resource because resource URL is ignored via ignore rules.', _entry);
        }

        continue;
      }

      var _lowerCaseUrl = _url.toLowerCase();

      var _initiatorType = _entry['initiatorType'];

      if (_lowerCaseUrl === 'about:blank' || _lowerCaseUrl.indexOf('javascript:') === 0 || // some iframe cases
      // Data transmission can be visible as a resource. Do not report it.
      isTransmitionRequest(_url)) {
        continue;
      }

      if (_url.length > urlMaxLength) {
        _url = _url.substring(0, urlMaxLength);
      } // We provide more detailed XHR insights via our XHR instrumentation.
      // The XHR instrumentation is available once the initialization was executed
      // (which is completely synchronous).


      if (_initiatorType !== 'xmlhttprequest' && _initiatorType !== 'fetch' || _entry['startTime'] < defaultVars.highResTimestampReference) {
        trie.addItem(stripSecrets(_url), serializeEntry(_entry));
      }
    }

    return trie.toJs();
  }

  function serializeEntryToArray(entry) {
    var result = [Math.round(entry['startTime'] - defaultVars.highResTimestampReference), Math.round(entry['duration']), initiatorTypes[entry['initiatorType']] || initiatorTypes['other']]; // When timing data is available, we can provide additional information about
    // caching and resource sizes.

    if (typeof entry['transferSize'] === 'number' && typeof entry['encodedBodySize'] === 'number' && // All this information may not be available due to the timing allow origin check.
    entry['encodedBodySize'] > 0) {
      if (entry['transferSize'] === 0) {
        result.push(cachingTypes.cached);
      } else if (entry['transferSize'] > 0 && (entry['encodedBodySize'] === 0 || entry['transferSize'] < entry['encodedBodySize'])) {
        result.push(cachingTypes.validated);
      } else {
        result.push(cachingTypes.fullLoad);
      }

      if (entry['encodedBodySize'] != null) {
        result.push(entry['encodedBodySize']);
      } else {
        result.push('');
      }

      if (entry['decodedBodySize'] != null) {
        result.push(entry['decodedBodySize']);
      } else {
        result.push('');
      }

      if (entry['transferSize'] != null) {
        result.push(entry['transferSize']);
      } else {
        result.push('');
      }
    } else {
      result.push('');
      result.push('');
      result.push('');
      result.push('');
    }

    var hasValidTimings = entry['responseStart'] != null && // timing allow origin check may have failed
    entry['responseStart'] >= entry['fetchStart'];

    if (hasValidTimings) {
      result.push(calculateTiming(entry['redirectEnd'], entry['redirectStart']));
      result.push(calculateTiming(entry['domainLookupStart'], entry['fetchStart']));
      result.push(calculateTiming(entry['domainLookupEnd'], entry['domainLookupStart']));

      if (entry['connectStart'] > 0 && entry['connectEnd'] > 0) {
        if (entry['secureConnectionStart'] != null && entry['secureConnectionStart'] > 0) {
          result.push(calculateTiming(entry['secureConnectionStart'], entry['connectStart']));
          result.push(calculateTiming(entry['connectEnd'], entry['secureConnectionStart']));
        } else {
          result.push(calculateTiming(entry['connectEnd'], entry['connectStart']));
          result.push('');
        }
      } else {
        result.push('');
        result.push('');
      }

      result.push(calculateTiming(entry['responseStart'], entry['requestStart']));
      result.push(calculateTiming(entry['responseEnd'], entry['responseStart']));
      sessionStorage.removeItem('performanceMetrics');
      var _performanceMetricsList = [];

      _performanceMetricsList.push(processEntry(entry));

      storePerformanceMetricsData(_performanceMetricsList);
    }

    var backendTraceId = '';

    try {
      var _serverTimings = entry['serverTiming'];

      if (_serverTimings instanceof Array) {
        for (var _i2 = 0; _i2 < _serverTimings.length; _i2++) {
          var _serverTiming = _serverTimings[_i2];

          if (_serverTiming['name'] === defaultVars.serverTimingBackendTraceIdEntryName) {
            backendTraceId = _serverTiming['description'];
          }
        }
      }
    } catch (e) {// Some browsers may not grant access to the field when the Timing-Allow-Origin
      // check fails. Better be safe than sorry here.
    }

    result.push(backendTraceId);

    if (hasValidTimings) {
      result.push(calculateTiming(entry['responseStart'], entry['startTime']));
    } else {
      result.push('');
    }

    return result;
  }
  function serializeEntry(entry) {
    return serializeEntryToArray(entry).join(',') // remove empty trailing timings
    .replace(/,+$/, '');
  }

  function calculateTiming(a, b) {
    if (a == null || b == null || // the values being equal indicates for example that a network connection didn't need
    // to be established. Do not report a timing of '0' as this will skew the statistics.
    a === b) {
      return '';
    }

    var diff = Math.round(a - b);

    if (diff < 0) {
      return '';
    }

    return diff;
  }

  /*
   * This file exists to resolve circular dependencies between
   * lib/transmission/index.js -> lib/transmission/batched.js -> lib/hooks/XMLHttpRequest.js -> lib/transmission/index.js
   */

  function disableMonitoringForXMLHttpRequest(xhr) {
    var state = xhr[defaultVars.secretPropertyKey] = xhr[defaultVars.secretPropertyKey] || {};
    state.ignored = true;
  }
  function addResourceTiming(beacon, resource) {
    var timings = serializeEntryToArray(resource);
    var performanceMetrics = sessionStorage.getItem('performanceMetrics') || '[]';
    var performanceMetricsList = JSON.parse(performanceMetrics);
    performanceMetricsList === null || performanceMetricsList === void 0 || performanceMetricsList.forEach(function (element) {
      return addInternalMetaDataToBeacon(beacon, element);
    });
    beacon['s_ty'] = getTimingValue(timings[3]);
    beacon['s_eb'] = getTimingValue(timings[4]);
    beacon['s_db'] = getTimingValue(timings[5]);
    beacon['s_ts'] = getTimingValue(timings[6]);
    beacon['t_red'] = getTimingValue(timings[7]);
    beacon['t_apc'] = getTimingValue(timings[8]);
    beacon['t_dns'] = getTimingValue(timings[9]);
    beacon['t_tcp'] = getTimingValue(timings[10]);
    beacon['t_ssl'] = getTimingValue(timings[11]);
    beacon['t_req'] = getTimingValue(timings[12]);
    beacon['t_rsp'] = getTimingValue(timings[13]);

    if (timings[14]) {
      beacon['bt'] = timings[14];
      beacon['bc'] = 1;
    }

    beacon['t_ttfb'] = getTimingValue(timings[15]);
  }

  function getTimingValue(timing) {
    if (typeof timing === 'number') {
      return timing;
    }

    return undefined;
  }

  function addCorrelationHttpHeaders(fn, ctx, traceId) {
    fn.call(ctx, 'X-INSTANA-T', traceId);
    fn.call(ctx, 'X-INSTANA-S', traceId);
    fn.call(ctx, 'X-INSTANA-L', '1,correlationType=web;correlationId=' + traceId);
  }

  var isUnloading = false;
  function onLastChance(fn) {
    if (isUnloading) {
      fn();
    }

    addEventListener$1(doc, 'visibilitychange', function () {
      if (doc.visibilityState !== 'visible') {
        fn();
      }
    });
    addEventListener$1(win, 'pagehide', function () {
      isUnloading = true;
      fn();
    }); // According to the spec visibilitychange should be a replacement for
    // beforeunload, but the reality is different (as of 2019-04-17). Chrome will
    // close tabs without firing visibilitychange. beforeunload on the other hand
    // is fired.

    addEventListener$1(win, 'beforeunload', function () {
      isUnloading = true;
      fn();
    });
  }

  // very easy to parse in a streaming fashion on the server-side. This format is a basic
  // line-based encoding of key/value pairs. Each line contains a key/value pair.
  //
  // In contrast to form encoding, this encoding handles JSON much better.

  function encode(beacons) {
    var str = '';

    for (var _i2 = 0; _i2 < beacons.length; _i2++) {
      var _beacon = beacons[_i2]; // Multiple beacons are separated by an empty line

      str += '\n';

      for (var _key2 in _beacon) {
        if (hasOwnProperty(_beacon, _key2)) {
          var _value = _beacon[_key2];

          if (_value != null) {
            str += '\n' + encodePart(_key2) + '\t' + encodePart(_value);
          }
        }
      }
    }

    return str.substring(2);
  }

  function encodePart(part) {
    return String(part).replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/\t/g, '\\t');
  }

  var maxBatchedBeacons = 15;
  var pendingBeacons = [];
  var pendingBeaconTransmittingTimeout;
  var isVisibilityApiSupported = typeof doc.visibilityState === 'string';
  var isSupported = !!XMLHttpRequest && isVisibilityApiSupported && isSendBeaconApiSupported();
  function isEnabled() {
    return isSupported && defaultVars.beaconBatchingTime > 0;
  } // We attempt batching of messages to be more efficient on the client, network and
  // server-side. While the connection is either a persistent HTTP 2 connection or
  // a HTTP 1.1 connection with keep-alive, there is still some overhead involved
  // in having many small messages.
  //
  // For this reason we attempt batching. When batching we must be careful to
  // force a transmission when the document is unloaded.

  if (isSupported) {
    onLastChance(transmit);
  }

  function sendBeacon$1(beacon) {
    pendingBeacons.push(beacon);

    if (pendingBeacons.length >= maxBatchedBeacons) {
      transmit();
    } else if (!isWindowHidden() && defaultVars.beaconBatchingTime > 0) {
      // We cannot guarantee that we will ever get time to transmit data in a batched
      // format when the window is hidden, as this might occur while the document is
      // being unloaded. Immediately force a transmission in these cases.
      if (pendingBeaconTransmittingTimeout == null) {
        pendingBeaconTransmittingTimeout = setTimeout$1(transmit, defaultVars.beaconBatchingTime);
      }
    } else {
      transmit();
    }
  }

  function transmit() {
    if (pendingBeaconTransmittingTimeout != null) {
      clearTimeout(pendingBeaconTransmittingTimeout);
      pendingBeaconTransmittingTimeout = null;
    }

    if (pendingBeacons.length === 0) {
      return;
    }

    if (defaultVars.reportingBackends && defaultVars.reportingBackends.length > 0) {
      for (var _i2 = 0, _len2 = defaultVars.reportingBackends.length; _i2 < _len2; _i2++) {
        var _reportingBackend = defaultVars.reportingBackends[_i2];

        if (_i2 > 0) {
          for (var _j2 = 0, _length2 = pendingBeacons.length; _j2 < _length2; _j2++) {
            var _beacon = pendingBeacons[_j2];
            _beacon['k'] = _reportingBackend['key'];
          }
        }

        transmitBeacons(encode(pendingBeacons), _reportingBackend['reportingUrl']);
      }
    } else {
      transmitBeacons(encode(pendingBeacons), String(defaultVars.reportingUrl));
    } // clear the array


    pendingBeacons.length = 0;
  }

  function transmitBeacons(serializedBeacons, reportingUrl) {
    // Empty beacons. Should never happen, but better be safe.
    if (!serializedBeacons || serializedBeacons.length === 0 || !reportingUrl || reportingUrl.length === 0) {
      return;
    }

    var sendBeaconState = false;

    if (isSendBeaconApiSupported()) {
      try {
        // This will transmit a text/plain;charset=UTF-8 content type. This may not be what we
        // want, but changing the content type via the Blob constructor currently
        // breaks for cross-origin requests.
        // https://bugs.chromium.org/p/chromium/issues/detail?id=490015
        sendBeaconState = sendBeacon(String(reportingUrl), serializedBeacons);
      } catch (e) {
        // We have received reports that the navigator.sendBeacon API is failing in certain
        // Edge 14.x versions. Unfortunately, we cannot reproduce this with our existing
        // testing facilities. So we add a try/catch with logging and XMLHttpRequest
        // as a fallback.
        {
          warn('navigator.sendBeacon has thrown an unexpected error. Will fall back to other transmission strategy.', 'navigator.sendBeacon parameters:', String(defaultVars.reportingUrl), serializedBeacons);
        }
      }
    } // There are limits to the amount of data transmittable via the sendBeacon API.
    // If it doesn't work via the sendBeacon, try it via plain old AJAX APIs
    // as a last resort.


    if (sendBeaconState === false) {
      var _xhr = new XMLHttpRequest();

      disableMonitoringForXMLHttpRequest(_xhr);

      _xhr.open('POST', String(reportingUrl), true);

      _xhr.setRequestHeader('Content-type', 'text/plain;charset=UTF-8'); // Ensure that browsers do not try to automatically parse the response.


      _xhr.responseType = 'text';
      _xhr.timeout = defaultVars.xhrTransmissionTimeout;

      _xhr.send(serializedBeacons);
    }
  }

  function isWindowHidden() {
    return doc.visibilityState !== 'visible';
  }

  function isSendBeaconApiSupported() {
    return typeof nav.sendBeacon === 'function';
  }

  var maxLengthForImgRequest = 2000;
  function sendBeacon$2(data) {
    if (defaultVars.reportingBackends && defaultVars.reportingBackends.length > 0) {
      for (var _i2 = 0, _len2 = defaultVars.reportingBackends.length; _i2 < _len2; _i2++) {
        var _reportingBackend = defaultVars.reportingBackends[_i2];

        if (_i2 > 0) {
          data['k'] = _reportingBackend['key'];
        }

        var _str = stringify(data);

        if (_str.length != 0) {
          transmit$1(_str, _reportingBackend['reportingUrl']);
        }
      }
    } else {
      var _str2 = stringify(data);

      if (_str2.length != 0) {
        transmit$1(_str2, String(defaultVars.reportingUrl));
      }
    }
  }

  function transmit$1(str, reportingUrl) {
    if (XMLHttpRequest && str.length > maxLengthForImgRequest) {
      var _xhr = new XMLHttpRequest();

      disableMonitoringForXMLHttpRequest(_xhr);

      _xhr.open('POST', String(reportingUrl), true);

      _xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded;charset=UTF-8'); // Ensure that browsers do not try to automatically parse the response.


      _xhr.responseType = 'text';
      _xhr.timeout = defaultVars.xhrTransmissionTimeout;

      _xhr.send(str);
    } else {
      // Older browsers do not support the XMLHttpRequest API. This sucks and may
      // result in a variety of issues, e.g. URL length restrictions. "Luckily", older
      // browsers also lack support for advanced features such as resource timing.
      // This should make this transmission via a GET request possible.
      executeImageRequest(String(reportingUrl) + '?' + str);
    }
  }

  function stringify(data) {
    var str = '';

    for (var _key2 in data) {
      if (hasOwnProperty(data, _key2)) {
        var _value = data[_key2];

        if (_value != null) {
          str += '&' + inEncodeURIComponent(_key2) + '=' + inEncodeURIComponent(String(data[_key2]));
        }
      }
    }

    return str.substring(1);
  }

  var isExcessiveUsage = createExcessiveUsageIdentifier({
    maxCalls: 8096,
    maxCallsPerTenMinutes: 4096,
    maxCallsPerTenSeconds: 128
  });
  function sendBeacon$3(data) {
    if (isUrlIgnored(data['l'])) {
      // data['l'] is a standardized property across all beacons to ensure that we do not accidentally transmit data
      // about a page such as this.
      {
        info('Skipping transmission of beacon because document URL associated to the beacon is ignored by ignore rule.', data);
      }

      return;
    }

    {
      info('Transmitting beacon', data);
    }

    if (isExcessiveUsage()) {
      {
        info('Reached the maximum number of beacons to transmit.');
      }

      return;
    }

    try {
      if (isEnabled()) {
        sendBeacon$1(data);
      } else {
        sendBeacon$2(data);
      }
    } catch (e) {
      {
        error('Failed to transmit beacon', e);
      }
    }
  }

  var isExcessiveUsage$1 = createExcessiveUsageIdentifier({
    maxCallsPerTenMinutes: 128,
    maxCallsPerTenSeconds: 32
  });
  function setPage(page, internalMeta) {
    var previousPage = defaultVars.page;
    defaultVars.page = page;
    var isInitialPageDefinition = getActivePhase() === pageLoad && previousPage == null;

    if (!isInitialPageDefinition && previousPage !== page) {
      if (isExcessiveUsage$1()) {
        {
          info('Reached the maximum number of page changes to monitor.');
        }
      } else {
        reportPageChange(internalMeta);
      }
    }
  }

  function reportPageChange(internalMeta) {
    // Some properties deliberately left our for js file size reasons.
    var beacon = {
      'ty': 'pc',
      'ts': now()
    };
    addCommonBeaconProperties(beacon);

    if (internalMeta) {
      addInternalMetaDataToBeacon(beacon, internalMeta);
    }

    sendBeacon$3(beacon);
  }

  function isFunction (funktion) {
    return typeof funktion === 'function'
  }

  // Default to complaining loudly when things don't go according to plan.
  var logger = console.error.bind(console);

  // Sets a property on an object, preserving its enumerability.
  // This function assumes that the property is already writable.
  function defineProperty (obj, name, value) {
    var enumerable = !!obj[name] && obj.propertyIsEnumerable(name);
    Object.defineProperty(obj, name, {
      configurable: true,
      enumerable: enumerable,
      writable: true,
      value: value
    });
  }

  // Keep initialization idempotent.
  function shimmer (options) {
    if (options && options.logger) {
      if (!isFunction(options.logger)) logger("new logger isn't a function, not replacing");
      else logger = options.logger;
    }
  }

  function wrap (nodule, name, wrapper) {
    if (!nodule || !nodule[name]) {
      logger('no original function ' + name + ' to wrap');
      return
    }

    if (!wrapper) {
      logger('no wrapper function');
      logger((new Error()).stack);
      return
    }

    if (!isFunction(nodule[name]) || !isFunction(wrapper)) {
      logger('original object and wrapper must be functions');
      return
    }

    var original = nodule[name];
    var wrapped = wrapper(original, name);

    defineProperty(wrapped, '__original', original);
    defineProperty(wrapped, '__unwrap', function () {
      if (nodule[name] === wrapped) defineProperty(nodule, name, original);
    });
    defineProperty(wrapped, '__wrapped', true);

    defineProperty(nodule, name, wrapped);
    return wrapped
  }

  function massWrap (nodules, names, wrapper) {
    if (!nodules) {
      logger('must provide one or more modules to patch');
      logger((new Error()).stack);
      return
    } else if (!Array.isArray(nodules)) {
      nodules = [nodules];
    }

    if (!(names && Array.isArray(names))) {
      logger('must provide one or more functions to wrap on modules');
      return
    }

    nodules.forEach(function (nodule) {
      names.forEach(function (name) {
        wrap(nodule, name, wrapper);
      });
    });
  }

  function unwrap (nodule, name) {
    if (!nodule || !nodule[name]) {
      logger('no function to unwrap.');
      logger((new Error()).stack);
      return
    }

    if (!nodule[name].__unwrap) {
      logger('no original to unwrap to -- has ' + name + ' already been unwrapped?');
    } else {
      return nodule[name].__unwrap()
    }
  }

  function massUnwrap (nodules, names) {
    if (!nodules) {
      logger('must provide one or more modules to patch');
      logger((new Error()).stack);
      return
    } else if (!Array.isArray(nodules)) {
      nodules = [nodules];
    }

    if (!(names && Array.isArray(names))) {
      logger('must provide one or more functions to unwrap on modules');
      return
    }

    nodules.forEach(function (nodule) {
      names.forEach(function (name) {
        unwrap(nodule, name);
      });
    });
  }

  shimmer.wrap = wrap;
  shimmer.massWrap = massWrap;
  shimmer.unwrap = unwrap;
  shimmer.massUnwrap = massUnwrap;

  var shimmer_1 = shimmer;

  // Define a specific type for the functions
  // Define the params that are be added to the shimmer wrapped function
  function isWrapped(funk) {
    return typeof funk === 'function' && typeof funk.__original === 'function' && typeof funk.__unwrap === 'function' && funk.__wrapped === true;
  }

  var maximumHttpRequestUrlLength = 4096; // Asynchronously created a tag.

  var urlAnalysisElement$1 = null;

  try {
    urlAnalysisElement$1 = document.createElement('a');
  } catch (e) {
    {
      debug('Failed to create URL analysis element. Will not be able to normalize URLs.', e);
    }
  }

  function normalizeUrl(url, includeHash) {
    if (urlAnalysisElement$1) {
      try {
        // "a"-elements normalize the URL when setting a relative URL or URLs
        // that are missing a scheme
        urlAnalysisElement$1.href = url;
        url = urlAnalysisElement$1.href;
      } catch (e) {
        {
          debug('Failed to normalize URL' + url);
        }
      }
    } // in case of view detection, we still user a chance to extract useful information from hash strings


    if (!includeHash) {
      // Hashes are never transmitted to the server and they are also not included in resource
      // timings. Do not include them in the normalized URL.
      var _hashIndex = url.indexOf('#');

      if (_hashIndex >= 0) {
        url = url.substring(0, _hashIndex);
      }
    }

    if (url.length > maximumHttpRequestUrlLength) {
      url = url.substring(0, maximumHttpRequestUrlLength);
    }

    return url;
  }

  function initAutoPageDetection() {
    if (isAutoPageDetectionEnabled()) {
      setupAutoPageDetection();
    }
  }

  function setupAutoPageDetection() {
    unwrapHistoryMethods();
    wrapHistoryMethods();
    win.addEventListener('hashchange', function (event) {
      {
        info("hashchange to ".concat(event.newURL, " from ").concat(event.oldURL, ", current location ").concat(win.location));
      }

      handlePossibleUrlChange(event.newURL);
    });

    if (!ignorePopstateEvent()) {
      {
        info('handlePossibleUrlChange on popstate event received');
      }

      win.addEventListener('popstate', function (_event) {
        {
          info("popstate current location ".concat(win.location));
        }

        handlePossibleUrlChange(window.location.pathname);
      });
    }
  }
  /**
   * Do not need to wrap history.go, history.backward and history.forward
   * since they do not bring location information in time.
   * hashchange and popstate serve better roles here.
   * Old and new url information is carried by hashchange event.
   * For popstate event, window.location is already updated with new location.
   *
   * https://developer.mozilla.org/en-US/docs/Web/API/History/pushState#description
   * Note that pushState() never causes a hashchange event to be fired,
   * even if the new URL differs from the old URL only in its hash.
   */


  function wrapHistoryMethods() {
    shimmer_1.wrap(win.history, 'replaceState', _patchHistoryMethod('replaceState'));
    shimmer_1.wrap(win.history, 'pushState', _patchHistoryMethod('pushState'));
  }

  function unwrapHistoryMethods() {
    if (isWrapped(win.history.replaceState)) {
      {
        info('unwrap history.replaceState');
      }

      shimmer_1.unwrap(history, 'replaceState');
    }

    if (isWrapped(win.history.pushState)) {
      {
        info('unwrap history.pushState');
      }

      shimmer_1.unwrap(history, 'pushState');
    }
  }

  function _patchHistoryMethod(methodName) {
    return function (original) {
      {
        info("patching history ".concat(methodName));
      }

      return function patchHistoryMethod() {
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        {
          debug("history ".concat(methodName, " invoked with"), args);
        }

        updateLocation(args);
        return original.apply(this, args);
      };
    };
  }

  function updateLocation(args) {
    // pushState(state, unused)
    // pushState(state, unused, url)
    // replaceState(state, unused)
    // replaceState(state, unused, url)
    // replaceState:
    // For React, arguments length is 2, so no place for new url.
    // For Angular, arguments length is 3. 3rd argument is new url.
    // pushState: Observation is argument length is always 3.
    var newUrl = args.length > 2 ? args[2] : null;

    if (newUrl) {
      handlePossibleUrlChange(String(newUrl));
    }
  }

  function handlePossibleUrlChange(newUrl) {
    var normalizedUrl = normalizeUrl(newUrl, true);
    var customizedPageName = applyCustomPageMappings(removeUrlOrigin(normalizedUrl));

    if (!customizedPageName) {
      return;
    }

    setPage(customizedPageName, {
      'view.title': doc.title,
      'view.url': stripSecrets(normalizedUrl)
    });
  }

  function applyCustomPageMappings(urlPath) {
    var rules = getAutoPageDetectionMappingRule();
    var effectivePath = (titleAsPageNameInAutoPageDetection() ? doc.title : urlPath) || urlPath;

    if (!effectivePath || !rules.length) {
      return effectivePath;
    }

    var _iterator = _createForOfIteratorHelper(rules),
        _step;

    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var _step$value = _slicedToArray(_step.value, 2),
            pattern = _step$value[0],
            replacement = _step$value[1];

        if (!pattern || !pattern.test(effectivePath)) {
          continue;
        }

        if (!replacement) {
          return null;
        }

        return effectivePath.replace(pattern, replacement);
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }

    return effectivePath;
  }

  function removeUrlOrigin(fullUrl) {
    try {
      var _url = new URL(fullUrl);

      return "".concat(_url.pathname).concat(_url.search).concat(_url.hash);
    } catch (err) {
      // fallback to input string if it's not a valid full url
      {
        error('failed to remove origin from url', fullUrl, err);
      }
    }

    return fullUrl;
  }

  function isAutoPageDetectionEnabled() {
    return !!defaultVars.autoPageDetection;
  }
  function ignorePopstateEvent() {
    var _vars$autoPageDetecti;

    return _typeof(defaultVars.autoPageDetection) === 'object' && !!((_vars$autoPageDetecti = defaultVars.autoPageDetection) !== null && _vars$autoPageDetecti !== void 0 && _vars$autoPageDetecti.ignorePopstateEvent);
  }
  function titleAsPageNameInAutoPageDetection() {
    var _vars$autoPageDetecti2;

    return _typeof(defaultVars.autoPageDetection) === 'object' && !!((_vars$autoPageDetecti2 = defaultVars.autoPageDetection) !== null && _vars$autoPageDetecti2 !== void 0 && _vars$autoPageDetecti2.titleAsPageName);
  }

  function getAutoPageDetectionMappingRule() {
    var _vars$autoPageDetecti3;

    if (_typeof(defaultVars.autoPageDetection) !== 'object' || !((_vars$autoPageDetecti3 = defaultVars.autoPageDetection) !== null && _vars$autoPageDetecti3 !== void 0 && _vars$autoPageDetecti3.mappingRule)) {
      return [];
    }

    return defaultVars.autoPageDetection.mappingRule;
  }

  function processAutoPageDetectionCommand(input) {
    var guessCmd = input;

    if (!guessCmd) {
      return false;
    }

    if (_typeof(guessCmd) !== 'object') {
      return !!guessCmd;
    }

    return {
      ignorePopstateEvent: guessCmd['ignorePopstateEvent'],
      titleAsPageName: guessCmd['titleAsPageName'],
      mappingRule: guessCmd['mappingRule']
    };
  }

  var maximumNumberOfMetaDataFields = 25;
  var maximumLengthPerMetaDataField = 1024;
  var languages = determineLanguages(); // Internal Meta data

  var maximumNumberOfInternalMetaDataFields = 128;
  var maximumLengthPerInternalMetaDataField = 1024;
  function addCommonBeaconProperties(beacon) {
    if (defaultVars.reportingBackends && defaultVars.reportingBackends.length > 0) {
      var _reportingBackend = defaultVars.reportingBackends[0];
      beacon['k'] = _reportingBackend['key'];
    } else {
      beacon['k'] = defaultVars.apiKey;
    }

    beacon['sv'] = defaultVars.trackingSnippetVersion;
    beacon['r'] = defaultVars.referenceTimestamp;
    beacon['p'] = defaultVars.page;
    beacon['l'] = stripSecrets(win.location.href);
    beacon['pl'] = defaultVars.pageLoadTraceId;
    beacon['ui'] = defaultVars.userId;
    beacon['un'] = defaultVars.userName;
    beacon['ue'] = defaultVars.userEmail;
    beacon['ul'] = languages;
    beacon['ph'] = getActivePhase();
    beacon['sid'] = defaultVars.sessionId;
    beacon['ww'] = win.innerWidth;
    beacon['wh'] = win.innerHeight;
    beacon['agv'] = defaultVars.agentVersion; // Google Closure compiler is not yet aware of these globals. Make sure it doesn't
    // mangle them.

    var anyNav = nav;

    if (anyNav['connection'] && anyNav['connection']['effectiveType']) {
      beacon['ct'] = anyNav['connection']['effectiveType'];
    }

    if (doc.visibilityState) {
      beacon['h'] = doc.visibilityState === 'hidden' ? 1 : 0;
    }

    addMetaDataToBeacon(beacon, defaultVars.meta);

    if (isAutoPageDetectionEnabled()) {
      // uf field will be a comma separated string if more than one use features are supported
      beacon['uf'] = 'sn';
    }

    var performanceMetrics = sessionStorage.getItem('performanceMetrics') || '[]';
    var performanceMetricsList = JSON.parse(performanceMetrics);
    performanceMetricsList === null || performanceMetricsList === void 0 || performanceMetricsList.forEach(function (element) {
      return addInternalMetaDataToBeacon(beacon, element);
    });
  }

  function determineLanguages() {
    if (nav.languages && nav.languages.length > 0) {
      return nav.languages.slice(0, 5).join(',');
    }

    var anyNav = nav;

    if (typeof anyNav.userLanguage === 'string') {
      return [anyNav.userLanguage].join(',');
    }

    return undefined;
  }

  function addMetaDataToBeacon(beacon, meta) {
    addMetaDataImpl(beacon, meta);
  }
  function addInternalMetaDataToBeacon(beacon, meta) {
    var options = {
      keyPrefix: 'im_',
      maxFields: maximumNumberOfInternalMetaDataFields,
      maxLengthPerField: maximumLengthPerInternalMetaDataField,
      maxFieldsWarningMsg: 'Maximum number of internal meta data fields exceeded. Not all internal meta data fields will be transmitted.'
    };
    addMetaDataImpl(beacon, meta, options);
  }

  function addMetaDataImpl(beacon, meta, options) {
    var keyPrefix = (options === null || options === void 0 ? void 0 : options.keyPrefix) || 'm_';
    var maxFields = (options === null || options === void 0 ? void 0 : options.maxFields) || maximumNumberOfMetaDataFields;
    var maxLength = (options === null || options === void 0 ? void 0 : options.maxLengthPerField) || maximumLengthPerMetaDataField;
    var maxFieldsWarningMsg = (options === null || options === void 0 ? void 0 : options.maxFieldsWarningMsg) || 'Maximum number of meta data fields exceeded. Not all meta data fields will be transmitted.';
    var i = 0;

    for (var _key2 in meta) {
      if (hasOwnProperty(meta, _key2)) {
        i++;

        if (i > maxFields) {
          {
            warn(maxFieldsWarningMsg);
          }

          return;
        }

        var _serializedValue = null;

        if (typeof meta[_key2] === 'string') {
          _serializedValue = meta[_key2];
        } else if (meta[_key2] === undefined) {
          _serializedValue = 'undefined';
        } else if (meta[_key2] === null) {
          _serializedValue = 'null';
        } else if (win.JSON) {
          try {
            _serializedValue = win.JSON.stringify(meta[_key2]);
          } catch (e) {
            {
              warn('JSON serialization of meta data', _key2, meta[_key2], 'failed due to', e, '. This value will not be transmitted.');
            }

            continue;
          }
        } else {
          _serializedValue = String(meta[_key2]);
        }

        beacon[keyPrefix + _key2] = _serializedValue.substring(0, maxLength);
      }
    }
  }

  // https://www.w3.org/TR/navigation-timing/

  var pageLoadStartTimestamp = getPageLoadStartTimestamp();

  function getPageLoadStartTimestamp() {
    if (!isTimingAvailable) {
      return defaultVars.initializerExecutionTimestamp;
    }

    return performance$1.timing.navigationStart;
  }

  function addTimingToPageLoadBeacon(beacon) {
    if (!isTimingAvailable) {
      // This is our absolute fallback mode where we only have
      // approximations for speed information.
      beacon['ts'] = pageLoadStartTimestamp - defaultVars.referenceTimestamp;
      beacon['d'] = Number(event.time) - defaultVars.initializerExecutionTimestamp; // We add this as an extra property to the beacon so that
      // a backend can decide whether it should include timing
      // information in aggregated metrics. Since they are only
      // approximations, this is not always desirable.

      if (!isTimingAvailable) {
        beacon['tim'] = '0';
      }

      return;
    }

    var timing = performance$1.timing;
    var redirectTime = timing.redirectEnd - timing.redirectStart; // We don't use navigationStart since that includes unload times for the previous page.

    var start = pageLoadStartTimestamp;
    beacon['ts'] = start - defaultVars.referenceTimestamp; // This can happen when the user aborts the page load. In this case, the load event
    // timing information is not available and will have the default value of "0".

    if (timing.loadEventStart > 0) {
      beacon['d'] = timing.loadEventStart - (timing.fetchStart || timing.navigationStart);
    } else {
      beacon['d'] = Number(event.time) - defaultVars.initializerExecutionTimestamp; // We have partial timing information, but since the load was aborted, we will
      // mark it as missing to indicate that the information should be ignored in
      // statistics.

      beacon['tim'] = '0';
    }

    beacon['t_unl'] = timing.unloadEventEnd - timing.unloadEventStart;
    beacon['t_red'] = redirectTime;
    beacon['t_apc'] = timing.domainLookupStart - (timing.fetchStart || timing.redirectEnd || timing.unloadEventEnd || timing.navigationStart);
    beacon['t_dns'] = timing.domainLookupEnd - timing.domainLookupStart;

    if (timing.connectStart > 0 && timing.connectEnd > 0) {
      if (timing.secureConnectionStart != null && timing.secureConnectionStart > 0 && // Issue in the navigation timing spec: Secure connection start does not take
      // connection reuse into consideration. At the time of writing (2020-07-11)
      // the latest W3C Navigation Timing recommendation still contains this issue.
      // The latest editor draft has these fixed (by linking to the resource timing
      // spec instead of duplicating the information).
      // For now a workaround to avoid these wrong timings seems to be the following.
      timing.secureConnectionStart >= timing.connectStart) {
        beacon['t_tcp'] = timing.secureConnectionStart - timing.connectStart;
        beacon['t_ssl'] = timing.connectEnd - timing.secureConnectionStart;
      } else {
        beacon['t_tcp'] = timing.connectEnd - timing.connectStart;
        beacon['t_ssl'] = 0;
      }
    }

    beacon['t_req'] = timing.responseStart - timing.requestStart;
    beacon['t_rsp'] = timing.responseEnd - timing.responseStart;
    beacon['t_dom'] = timing.domContentLoadedEventStart - timing.domLoading;
    beacon['t_chi'] = timing.loadEventEnd - timing.domContentLoadedEventStart;
    beacon['t_bac'] = timing.responseStart - start;
    beacon['t_fro'] = timing.loadEventEnd - timing.responseStart;
    beacon['t_pro'] = timing.loadEventStart - timing.domLoading;
    beacon['t_loa'] = timing.loadEventEnd - timing.loadEventStart;
    beacon['t_ttfb'] = timing.responseStart - start;
    addFirstPaintTimings(beacon, start);
    var performanceMetrics = sessionStorage.getItem('performanceMetrics') || '[]';
    var performanceMetricsList = JSON.parse(performanceMetrics);
    performanceMetricsList === null || performanceMetricsList === void 0 || performanceMetricsList.forEach(function (element) {
      return addInternalMetaDataToBeacon(beacon, element);
    });
  }

  function addFirstPaintTimings(beacon, start) {
    if (!isResourceTimingAvailable) {
      addFirstPaintFallbacks(beacon, start);
      return;
    }

    var paintTimings = performance$1.getEntriesByType('paint');
    var firstPaintFound = false;

    for (var _i2 = 0; _i2 < paintTimings.length; _i2++) {
      var _paintTiming = paintTimings[_i2];

      switch (_paintTiming.name) {
        case 'first-paint':
          beacon['t_fp'] = _paintTiming.startTime | 0;
          firstPaintFound = true;
          break;

        case 'first-contentful-paint':
          beacon['t_fcp'] = _paintTiming.startTime | 0;
          break;
      }
    }

    if (!firstPaintFound) {
      addFirstPaintFallbacks(beacon, start);
    }
  }

  function addFirstPaintFallbacks(beacon, start) {
    var firstPaint = null; // Chrome

    if (win.chrome && win.chrome.loadTimes) {
      // Convert to ms
      firstPaint = win.chrome.loadTimes()['firstPaintTime'] * 1000;
    } // IE
    else if (typeof win.performance.timing['msFirstPaint'] === 'number') {
        firstPaint = win.performance.timing['msFirstPaint'];
      } // standard
      else if (typeof win.performance.timing['firstPaint'] === 'number') {
          firstPaint = win.performance.timing['firstPaint'];
        } // First paint may not be available -OR- the browser may have never
    // painted anything and thereby kept this value at 0.


    if (firstPaint != null && firstPaint !== 0) {
      beacon['t_fp'] = Math.round(firstPaint - start);
    }
  }

  // Find a way to define all properties beforehand so that flow doesn't complain about missing props.

  var beacon = {
    'ty': 'pl'
  };
  var state$1 = {
    onEnter: function onEnter() {
      addCommonBeaconProperties(beacon);
      beacon['t'] = defaultVars.pageLoadTraceId;
      beacon['bt'] = defaultVars.pageLoadBackendTraceId;
      beacon['u'] = stripSecrets(win.location.href);
      beacon['ph'] = pageLoad;
      addTimingToPageLoadBeacon(beacon);
      addResourceTimings(beacon);
      var beaconSent = false;

      if (doc.visibilityState !== 'visible') {
        {
          info('Will not wait for additional page load beacon data because document.visibilityState is', doc.visibilityState);
        }

        sendPageLoadBeacon();
        return;
      }

      setTimeout$1(sendPageLoadBeacon, defaultVars.maxMaitForPageLoadMetricsMillis);
      onLastChance(sendPageLoadBeacon);

      function sendPageLoadBeacon() {
        if (!beaconSent) {
          beaconSent = true;
          sendBeacon$3(beacon);
        }
      }
    },
    getActiveTraceId: function getActiveTraceId() {
      return null;
    },
    getActivePhase: function getActivePhase() {
      return undefined;
    }
  };

  var maxErrorsToReport = 100;
  var maxStackSize = 30;
  var reportedErrors = 0;
  var maxSeenErrorsTracked = 20;
  var numberOfDifferentErrorsSeen = 0;
  var seenErrors = {};
  var scheduledTransmissionTimeoutHandle; // We are wrapping global listeners. In these, we are catching and rethrowing errors.
  // In older browsers, rethrowing errors actually manipulates the error objects. As a
  // result, it is not possible to just mark an error as reported. The simplest way to
  // avoid double reporting is to temporarily disable the global onError handler…

  var ignoreNextOnError = false;
  function ignoreNextOnErrorEvent() {
    ignoreNextOnError = true;
  }
  function hookIntoGlobalErrorEvent() {
    var globalOnError = win.onerror;

    win.onerror = function (message, fileName, lineNumber, columnNumber, error) {
      if (ignoreNextOnError) {
        ignoreNextOnError = false;

        if (typeof globalOnError === 'function') {
          // eslint-disable-next-line prefer-rest-params
          return globalOnError.apply(this, arguments);
        }

        return;
      }

      var stack = error && error.stack;

      if (!stack) {
        stack = 'at ' + fileName + ' ' + lineNumber;

        if (columnNumber != null) {
          stack += ':' + columnNumber;
        }
      }

      onUnhandledError(String(message), stack);

      if (typeof globalOnError === 'function') {
        // eslint-disable-next-line prefer-rest-params
        return globalOnError.apply(this, arguments);
      }
    };
  }
  function reportError(error, opts) {
    if (!error) {
      return;
    }

    if (typeof error === 'string') {
      onUnhandledError(error, '', opts);
    } else {
      onUnhandledError(error['message'], error['stack'], opts);
    }
  }

  function onUnhandledError(message, stack, opts) {
    if (!message || reportedErrors > maxErrorsToReport) {
      return;
    }

    if (isErrorMessageIgnored(message)) {
      return;
    }

    if (numberOfDifferentErrorsSeen >= maxSeenErrorsTracked) {
      seenErrors = {};
      numberOfDifferentErrorsSeen = 0;
    }

    message = String(message).substring(0, 300);
    stack = shortenStackTrace(stack);
    var location = win.location.href;
    var parentId = getActiveTraceId();
    var key = message + stack + location + (parentId || '');
    var trackedError = seenErrors[key];

    if (trackedError) {
      trackedError.seenCount++;
      trackedError.beacon['c'] = trackedError.seenCount - trackedError.transmittedCount;
    } else {
      var _componentStack = undefined;

      if (opts && opts['componentStack']) {
        _componentStack = String(opts['componentStack']).substring(0, 4096);
      }

      var _spanId = generateUniqueId();

      var _traceId = parentId || _spanId;

      var _partialBeacon = {
        'ty': 'err',
        's': _spanId,
        't': _traceId,
        'ts': now(),
        // error beacon specific data
        'l': location,
        'e': message,
        'st': stack,
        'cs': _componentStack,
        'c': 1
      };
      trackedError = seenErrors[key] = {
        seenCount: 1,
        transmittedCount: 0,
        beacon: _partialBeacon
      }; // we cannot delay the creation of error beacon as common properties might be changed

      addCommonBeaconProperties(trackedError.beacon);

      if (opts && opts['meta']) {
        addMetaDataToBeacon(trackedError.beacon, opts['meta']);
      }

      numberOfDifferentErrorsSeen++;
    }

    scheduleTransmission();
  }

  function shortenStackTrace(stack) {
    return String(stack || '').split('\n').slice(0, maxStackSize).join('\n');
  }

  function scheduleTransmission() {
    if (scheduledTransmissionTimeoutHandle) {
      return;
    }

    scheduledTransmissionTimeoutHandle = setTimeout$1(send, 1000);
  }

  function send() {
    if (scheduledTransmissionTimeoutHandle) {
      clearTimeout(scheduledTransmissionTimeoutHandle);
      scheduledTransmissionTimeoutHandle = null;
    }

    for (var _key3 in seenErrors) {
      // eslint-disable-next-line no-prototype-builtins
      if (seenErrors.hasOwnProperty(_key3)) {
        var _seenError = seenErrors[_key3];

        if (_seenError.seenCount > _seenError.transmittedCount) {
          sendBeaconForError(_seenError);
          reportedErrors++;
        }
      }
    }

    seenErrors = {};
    numberOfDifferentErrorsSeen = 0;
  }

  function sendBeaconForError(error) {
    sendBeacon$3(error.beacon);
  }

  var messagePrefix = 'Unhandled promise rejection: ';
  var stackUnavailableMessage = '<unavailable because Promise wasn\'t rejected with an Error object>';
  function hookIntoGlobalUnhandledRejectionEvent() {
    if (typeof win.addEventListener === 'function') {
      win.addEventListener('unhandledrejection', onUnhandledRejection);
    }
  }
  function onUnhandledRejection(event) {
    if (event.reason == null) {
      reportError({
        message: messagePrefix + '<no reason defined>',
        stack: stackUnavailableMessage
      });
    } else if (typeof event.reason.message === 'string') {
      reportError({
        message: messagePrefix + event.reason.message,
        stack: typeof event.reason.stack === 'string' ? event.reason.stack : stackUnavailableMessage
      });
    } else if (_typeof(event.reason) !== 'object') {
      reportError({
        message: messagePrefix + event.reason,
        stack: stackUnavailableMessage
      });
    }
  }

  var ONE_DAY_IN_MILLIS = 1000 * 60 * 60 * 24;
  // Implements the capability to observe the performance data for a single entry on the performance timeline.
  // This is especially useful to make a connection between our beacon data and the performance timeline data.
  // Also see https://w3c.github.io/performance-timeline/#dom-performanceentrylist
  function observeResourcePerformance(opts) {
    if (!isPerformanceObserverAvailable) {
      return observeWithoutPerformanceObserverSupport(opts.onEnd);
    } // Used to calculate the duration when no resource was found.


    var startTime;
    var endTime; // The identified resource. To be used when calling opts.onEnd

    var resource; // global resources that will need to be disposed

    var observer;
    var fallbackNoResourceFoundTimerHandle;
    var fallbackEndNeverCalledTimerHandle;
    return {
      onBeforeResourceRetrieval: onBeforeResourceRetrieval,
      onAfterResourceRetrieved: onAfterResourceRetrieved,
      cancel: disposeGlobalResources
    };

    function onBeforeResourceRetrieval() {
      startTime = performance$1.now();

      try {
        observer = new win['PerformanceObserver'](onResource);
        observer['observe']({
          'entryTypes': opts.entryTypes
        });
      } catch (e) {// Some browsers may not support the passed entryTypes and decide to throw an error.
        // This would then result in an error with a message like:
        //
        // entryTypes only contained unsupported types
        //
        // Swallow and ignore the error. Treat it like unavailable performance observer data.
      }

      fallbackEndNeverCalledTimerHandle = setTimeout$1(disposeGlobalResources, 1000 * 60 * 10);
    }

    function onAfterResourceRetrieved() {
      endTime = performance$1.now();
      cancelFallbackEndNeverCalledTimerHandle();

      if (resource || !isWaitingAcceptable()) {
        end();
      } else {
        addEventListener$1(doc, 'visibilitychange', onVisibilityChanged);
        fallbackNoResourceFoundTimerHandle = setTimeout$1(end, opts.maxWaitForResourceMillis);
      }
    }

    function end() {
      disposeGlobalResources();
      var duration;

      if (resource && resource.duration != null && // In some old web browsers, e.g. Chrome 31, the value provided as the duration
      // can be very wrong. We have seen cases where this value is measured in years.
      // If this does seem be the case, then we will ignore the duration property and
      // instead prefer our approximation.
      resource.duration < ONE_DAY_IN_MILLIS) {
        duration = Math.round(resource.duration);
      } else {
        duration = Math.round(endTime - startTime);
      }

      opts.onEnd({
        resource: resource,
        duration: duration
      });
    }

    function onResource(list) {
      var entries = list.getEntries();

      for (var _i2 = 0; _i2 < entries.length; _i2++) {
        var _entry = entries[_i2];

        if (_entry.startTime >= startTime && (!endTime || endTime + opts.maxToleranceForResourceTimingsMillis >= _entry.responseEnd) && opts.resourceMatcher(_entry)) {
          resource = _entry;
          disconnectResourceObserver();

          if (endTime) {
            // End as quickly as possible to ensure that the data is transmitted to the server.
            end();
          }

          return;
        }
      }
    }

    function onVisibilityChanged() {
      if (!isWaitingAcceptable()) {
        end();
      }
    }

    function disposeGlobalResources() {
      disconnectResourceObserver();
      cancelFallbackNoResourceFoundTimer();
      cancelFallbackEndNeverCalledTimerHandle();
      stopVisibilityObservation();
    }

    function disconnectResourceObserver() {
      if (observer) {
        try {
          observer['disconnect']();
        } catch (e) {// Observer disconnect may throw when connect attempt wasn't successful. Ignore this.
        }

        observer = null;
      }
    }

    function cancelFallbackNoResourceFoundTimer() {
      if (fallbackNoResourceFoundTimerHandle) {
        clearTimeout(fallbackNoResourceFoundTimerHandle);
        fallbackNoResourceFoundTimerHandle = null;
      }
    }

    function cancelFallbackEndNeverCalledTimerHandle() {
      if (fallbackEndNeverCalledTimerHandle) {
        clearTimeout(fallbackEndNeverCalledTimerHandle);
        fallbackEndNeverCalledTimerHandle = null;
      }
    }

    function stopVisibilityObservation() {
      removeEventListener$1(doc, 'visibilitychange', onVisibilityChanged);
    }
  } // This variant of the performance observer is only used when the performance-timeline features
  // are not supported. See isPerformanceObserverAvailable

  function observeWithoutPerformanceObserverSupport(onEnd) {
    var start;
    return {
      onBeforeResourceRetrieval: onBeforeResourceRetrieval,
      onAfterResourceRetrieved: onAfterResourceRetrieved,
      cancel: noop
    };

    function onBeforeResourceRetrieval() {
      start = now();
    }

    function onAfterResourceRetrieved() {
      var end = now();
      onEnd({
        duration: end - start
      });
    }
  } // We may only wait for resource data to arrive as long as the document is visible or in the process
  // of becoming visible. In all other cases we might lose data when waiting, e.g. when the document
  // is in the process of being disposed.


  function isWaitingAcceptable() {
    return doc.visibilityState === 'visible' || doc.visibilityState === 'prerender';
  }

  function isAllowedOrigin(url) {
    return matchesAny(defaultVars.allowedOrigins, url);
  }

  // document.createElement('a')

  var urlAnalysisElement$2 = null;
  var documentOriginAnalysisElement = null;

  try {
    urlAnalysisElement$2 = document.createElement('a');
    documentOriginAnalysisElement = document.createElement('a');
    documentOriginAnalysisElement.href = win.location.href;
  } catch (e) {
    {
      debug('Failed to create URL analysis elements. Will not be able to execute same-origin check, i.e. all same-origin checks will fail.', e);
    }
  }

  function isSameOrigin(url) {
    if (!urlAnalysisElement$2 || !documentOriginAnalysisElement) {
      return false;
    }

    try {
      urlAnalysisElement$2.href = url;
      return (// Most browsers support this fallback logic out of the box. Not so the Internet explorer.
        // To make it work in Internet explorer, we need to add the fallback manually.
        // IE 9 uses a colon as the protocol when no protocol is defined
        (urlAnalysisElement$2.protocol && urlAnalysisElement$2.protocol !== ':' ? urlAnalysisElement$2.protocol : documentOriginAnalysisElement.protocol) === documentOriginAnalysisElement.protocol && (urlAnalysisElement$2.hostname || documentOriginAnalysisElement.hostname) === documentOriginAnalysisElement.hostname && (urlAnalysisElement$2.port || documentOriginAnalysisElement.port) === documentOriginAnalysisElement.port
      );
    } catch (e) {
      return false;
    }
  }

  var isExcessiveUsage$2 = createExcessiveUsageIdentifier({
    maxCallsPerTenMinutes: 256,
    maxCallsPerTenSeconds: 32
  }); // In addition to the common HTTP status codes, a bunch of
  // additional outcomes are possible. Mainly errors, the following
  // status codes denote internal codes which are used for beacons
  // to describe the XHR result.

  var additionalStatuses = {
    // https://xhr.spec.whatwg.org/#the-timeout-attribute
    timeout: -100,
    // Used when the request is aborted:
    // https://xhr.spec.whatwg.org/#the-abort()-method
    abort: -101,
    // Errors may occur when opening an XHR object for a variety of
    // reasons.
    // https://xhr.spec.whatwg.org/#the-open()-method
    openError: -102,
    // Non-HTTP errors, e.g. failed to establish connection.
    // https://xhr.spec.whatwg.org/#events
    error: -103
  };
  var traceIdHeaderRegEx = /^X-INSTANA-T$/i;
  function instrumentXMLHttpRequest() {
    if (!XMLHttpRequest || !new XMLHttpRequest().addEventListener) {
      {
        info('Browser does not support the features required for XHR instrumentation.');
      }

      return;
    }

    var originalOpen = XMLHttpRequest.prototype.open;
    var originalSetRequestHeader = XMLHttpRequest.prototype.setRequestHeader;
    var originalSend = XMLHttpRequest.prototype.send;

    if (!originalOpen || !originalSetRequestHeader || !originalSend) {
      {
        warn('The XMLHttpRequest prototype is in an unsupported state due to some missing XMLHttpRequest.prototype ' + 'properties. This is most likely caused by third-party libraries that are instrumenting/changing the ' + 'XMLHttpRequest API in a specification incompliant way.');
      }

      return;
    }

    XMLHttpRequest.prototype.open = function open(method, url, async) {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      var xhr = this;

      if (isExcessiveUsage$2()) {
        {
          info('Reached the maximum number of XMLHttpRequests to monitor.');
        } // eslint-disable-next-line prefer-rest-params


        return originalOpen.apply(xhr, arguments);
      }

      var state = xhr[defaultVars.secretPropertyKey] = xhr[defaultVars.secretPropertyKey] || {}; // probably ignored due to disableMonitoringForXMLHttpRequest calls

      if (state.ignored) {
        // eslint-disable-next-line prefer-rest-params
        return originalOpen.apply(xhr, arguments);
      }

      state.ignored = isUrlIgnored(url);

      if (state.ignored) {
        {
          debug('Not generating XHR beacon because it should be ignored according to user configuration. URL: ' + url);
        } // eslint-disable-next-line prefer-rest-params


        return originalOpen.apply(xhr, arguments);
      }

      state.spanAndTraceId = generateUniqueId();
      state.setBackendCorrelationHeaders = isSameOrigin(url) || isAllowedOrigin(url); // Some properties deliberately left our for js file size reasons.

      var beacon = {
        'ty': 'xhr',
        // general beacon data
        't': state.spanAndTraceId,
        's': state.spanAndTraceId,
        'ts': 0,
        'd': 0,
        // xhr beacon specific data
        // 's': '',
        'm': method,
        'u': stripSecrets(normalizeUrl(url)),
        'a': async === undefined || async ? 1 : 0,
        'st': 0,
        'e': undefined,
        'bc': state.setBackendCorrelationHeaders ? 1 : 0
      };
      state.beacon = beacon;
      state.performanceObserver = observeResourcePerformance({
        entryTypes: ['resource'],
        resourceMatcher: function resourceMatcher(resource) {
          return (resource.initiatorType === 'fetch' || resource.initiatorType === 'xmlhttprequest') && !!resource.name && resource.name.indexOf(beacon['u']) === 0;
        },
        maxWaitForResourceMillis: defaultVars.maxWaitForResourceTimingsMillis,
        maxToleranceForResourceTimingsMillis: defaultVars.maxToleranceForResourceTimingsMillis,
        onEnd: function onEnd(args) {
          beacon['d'] = args.duration;

          if (args.resource) {
            addResourceTiming(beacon, args.resource);
          }

          sendBeacon$3(beacon);
        }
      });

      try {
        // eslint-disable-next-line prefer-rest-params
        var _result = originalOpen.apply(xhr, arguments);

        xhr.addEventListener('timeout', onTimeout);
        xhr.addEventListener('error', onError);
        xhr.addEventListener('abort', onAbort);
        xhr.addEventListener('readystatechange', onReadystatechange);
        return _result;
      } catch (e) {
        state.performanceObserver.cancel();
        beacon['ts'] = now() - defaultVars.referenceTimestamp;
        beacon['st'] = additionalStatuses.openError;
        beacon['e'] = e.message;
        addCommonBeaconProperties(beacon);
        sendBeacon$3(beacon);
        xhr[defaultVars.secretPropertyKey] = null;
        throw e;
      }

      function onFinish(status) {
        if (state.ignored) {
          return;
        }

        if (beacon['st'] !== 0) {
          // Multiple finish events. Should only happen when we setup the event handlers
          // in a wrong way or when the XHR object is reused. We don't support this use
          // case.
          return;
        }

        beacon['st'] = status; // When accessing object properties as object['property'] instead of
        // object.property flow does not know the type and assumes string.
        // Arithmetic operations like addition are only allowed on numbers. OTOH,
        // we can not safely use beacon.property as the compilation/minification
        // step will rename the properties which results in JSON payloads with
        // wrong property keys.

        beacon['d'] = Math.max(0, now() - (beacon['ts'] + defaultVars.referenceTimestamp));

        if (defaultVars.headersToCapture.length > 0) {
          try {
            captureHttpHeaders(beacon, xhr.getAllResponseHeaders());
          } catch (e) {
            {
              //it is possible without CORS, the getAllResponseHeaders()
              //could throw errors with some browsers.
              warn('error during XMLHttpRequest.getAllResponseHeaders');
            }
          }
        }

        if (state.performanceObserver && status > 0) {
          state.performanceObserver.onAfterResourceRetrieved();
        } else {
          if (state.performanceObserver) {
            state.performanceObserver.cancel();
          }

          sendBeacon$3(beacon);
        }
      }

      function onTimeout() {
        onFinish(additionalStatuses.timeout);
      }

      function onError(e) {
        if (state.ignored) {
          return;
        }

        var anye = e;
        var message = e && (anye.error && anye.error.message || anye.message);

        if (typeof message === 'string') {
          beacon['e'] = message.substring(0, 300);
        }

        onFinish(additionalStatuses.error);
      }

      function onAbort() {
        onFinish(additionalStatuses.abort);
      }

      function onReadystatechange() {
        if (xhr.readyState === 4) {
          var _status;

          try {
            _status = xhr.status;
          } catch (e) {
            // IE 9 will throw errors when trying to access the status property
            // on aborted requests and timeouts. We can swallow the error
            // since we have separate event listeners for these types of
            // situations.
            onFinish(additionalStatuses.error);
            return;
          }

          if (_status !== 0) {
            onFinish(_status);
          }
        }
      }
    };

    XMLHttpRequest.prototype.setRequestHeader = function setRequestHeader(header, value) {
      var state = this[defaultVars.secretPropertyKey]; // If this request was initiated by a fetch polyfill, the Instana headers
      // will be set before xhr.send is called (by the fetch polyfill,
      // translating the headers from the request definition object into
      // XHR.setRequestHeader calls). We need to keep track of this so we can
      // set this XHR to ignored in xhr.send.

      if (state && traceIdHeaderRegEx.test(header)) {
        {
          debug('Not generating XHR beacon because correlation header is already set (possibly fetch polyfill applied).');
        }

        state.ignored = true;

        if (state.performanceObserver) {
          state.performanceObserver.cancel();
          state.performanceObserver = null;
        }
      } else {
        if (matchesAny(defaultVars.headersToCapture, header)) {
          state.beacon['h_' + header.toLowerCase()] = value;
        }
      } // eslint-disable-next-line prefer-rest-params


      return originalSetRequestHeader.apply(this, arguments);
    };

    XMLHttpRequest.prototype.send = function send() {
      var state = this[defaultVars.secretPropertyKey];

      if (!state || state.ignored) {
        // eslint-disable-next-line prefer-rest-params
        return originalSend.apply(this, arguments);
      }

      if (state.setBackendCorrelationHeaders) {
        addCorrelationHttpHeaders(originalSetRequestHeader, this, state.spanAndTraceId);
      }

      state.beacon['ts'] = now() - defaultVars.referenceTimestamp;
      addCommonBeaconProperties(state.beacon);
      state.performanceObserver.onBeforeResourceRetrieval(); // eslint-disable-next-line prefer-rest-params

      return originalSend.apply(this, arguments);
    };
  }
  function captureHttpHeaders(beacon, headerString) {
    var lines = headerString.trim().split(/[\r\n]+/);

    var _iterator = _createForOfIteratorHelper(lines),
        _step;

    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var _line = _step.value;

        var _items = _line.split(': ', 2);

        if (matchesAny(defaultVars.headersToCapture, _items[0])) {
          beacon['h_' + _items[0].toLowerCase()] = _items[1];
        }
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
  }

  function getPageLoadBackendTraceId() {
    if (!isResourceTimingAvailable) {
      return null;
    }

    var entries = performance$1.getEntriesByType('navigation');

    for (var _i2 = 0; _i2 < entries.length; _i2++) {
      var _entry = entries[_i2];

      if (_entry['serverTiming'] != null) {
        for (var _j2 = 0; _j2 < _entry['serverTiming'].length; _j2++) {
          var _serverTiming = _entry['serverTiming'][_j2];

          if (_serverTiming['name'] === defaultVars.serverTimingBackendTraceIdEntryName) {
            {
              info('Found page load backend trace ID %s in Server-Timing header.', _serverTiming['description']);
            }

            return _serverTiming['description'];
          }
        }
      }
    }

    return null;
  }

  // https://github.com/facebook/flow/blob/master/lib/dom.js

  // Asynchronous function wrapping: The process of wrapping a listener which goes into one function, e.g.
  //
  //  - EventTarget#addEventListener
  //  - EventEmitter#on
  //
  // and is removed via another function, e.g.
  //
  //  - EventTarget#removeEventListener
  //  - EventEmitter#off
  //
  // What is complicated about this, is that these methods identify registered listeners by function reference.
  // When we wrap a function, we naturally change the reference. We must therefore keep track of which
  // original function belongs to what wrapped function.
  //
  // This file provides helpers that help in the typical cases. It is removed from all browser specific APIs
  // in order to allow simple unit test execution.
  //
  // Note that this file follows the behavior outlined in DOM specification. Among others, this means that it is not
  // possible to register the same listener twice.
  // http://dom.spec.whatwg.org
  function addWrappedFunction(storageTarget, wrappedFunction, valuesForEqualityCheck) {
    var storage = storageTarget[defaultVars.wrappedEventHandlersOriginalFunctionStorageKey] = storageTarget[defaultVars.wrappedEventHandlersOriginalFunctionStorageKey] || [];
    var index = findInStorage(storageTarget, valuesForEqualityCheck);

    if (index !== -1) {
      // already registered. Do not allow re-registration
      return storage[index].wrappedFunction;
    }

    storage.push({
      wrappedFunction: wrappedFunction,
      valuesForEqualityCheck: valuesForEqualityCheck
    });
    return wrappedFunction;
  }

  function findInStorage(storageTarget, valuesForEqualityCheck) {
    var storage = storageTarget[defaultVars.wrappedEventHandlersOriginalFunctionStorageKey];

    for (var _i2 = 0; _i2 < storage.length; _i2++) {
      var _storageItem = storage[_i2];

      if (matchesEqualityCheck(_storageItem.valuesForEqualityCheck, valuesForEqualityCheck)) {
        return _i2;
      }
    }

    return -1;
  }

  function popWrappedFunction(storageTarget, valuesForEqualityCheck, fallback) {
    var storage = storageTarget[defaultVars.wrappedEventHandlersOriginalFunctionStorageKey];

    if (storage == null) {
      return fallback;
    }

    var index = findInStorage(storageTarget, valuesForEqualityCheck);

    if (index === -1) {
      return fallback;
    }

    var storageItem = storage[index];
    storage.splice(index, 1);
    return storageItem.wrappedFunction;
  }

  function matchesEqualityCheck(valuesForEqualityCheckA, valuesForEqualityCheckB) {
    if (valuesForEqualityCheckA.length !== valuesForEqualityCheckB.length) {
      return false;
    }

    for (var _i4 = 0; _i4 < valuesForEqualityCheckA.length; _i4++) {
      if (valuesForEqualityCheckA[_i4] !== valuesForEqualityCheckB[_i4]) {
        return false;
      }
    }

    return true;
  }

  function addWrappedDomEventListener(storageTarget, wrappedFunction, eventName, eventListener, optionsOrCapture) {
    return addWrappedFunction(storageTarget, wrappedFunction, getDomEventListenerValuesForEqualityCheck(eventName, eventListener, optionsOrCapture));
  }

  function getDomEventListenerValuesForEqualityCheck(eventName, eventListener, optionsOrCapture) {
    return [eventName, eventListener, getDomEventListenerCaptureValue(optionsOrCapture)];
  }

  function getDomEventListenerCaptureValue(optionsOrCapture) {
    // > Let capture, passive, and once be the result of flattening more options.
    // https://dom.spec.whatwg.org/#dom-eventtarget-addeventlistener
    //
    // > To flatten more options, run these steps:
    // > 1. Let capture be the result of flattening options.
    // https://dom.spec.whatwg.org/#event-flatten-more
    //
    // > To flatten options, run these steps:
    // > 1. If options is a boolean, then return options.
    // > 2. Return options’s capture.
    // https://dom.spec.whatwg.org/#concept-flatten-options
    //
    // > dictionary EventListenerOptions {
    // >   boolean capture = false;
    // > };
    // https://dom.spec.whatwg.org/#dom-eventlisteneroptions-capture
    if (optionsOrCapture == null) {
      return false;
    } else if (_typeof(optionsOrCapture) === 'object') {
      return Boolean(optionsOrCapture.capture);
    }

    return Boolean(optionsOrCapture);
  }
  function popWrappedDomEventListener(storageTarget, eventName, eventListener, optionsOrCapture, fallback) {
    return popWrappedFunction(storageTarget, getDomEventListenerValuesForEqualityCheck(eventName, eventListener, optionsOrCapture), fallback);
  }

  function wrapEventHandlers() {
    if (defaultVars.wrapEventHandlers) {
      wrapEventTarget(win.EventTarget);
    }
  }

  function wrapEventTarget(EventTarget) {
    if (!EventTarget || typeof EventTarget.prototype.addEventListener !== 'function' || typeof EventTarget.prototype.removeEventListener !== 'function') {
      return;
    }

    var originalAddEventListener = EventTarget.prototype.addEventListener;
    var originalRemoveEventListener = EventTarget.prototype.removeEventListener;

    EventTarget.prototype.addEventListener = function wrappedAddEventListener(eventName, fn, optionsOrCapture) {
      if (typeof fn !== 'function') {
        // eslint-disable-next-line prefer-rest-params
        return originalAddEventListener.apply(this, arguments);
      } // non-deopt arguments copy


      var args = new Array(arguments.length);

      for (var _i2 = 0; _i2 < arguments.length; _i2++) {
        // eslint-disable-next-line prefer-rest-params
        args[_i2] = arguments[_i2];
      }

      args[1] = function wrappedEventListener() {
        try {
          // eslint-disable-next-line prefer-rest-params
          return fn.apply(this, arguments);
        } catch (e) {
          reportError(e);
          ignoreNextOnErrorEvent();
          throw e;
        }
      };

      args[1] = addWrappedDomEventListener(this, args[1], eventName, fn, optionsOrCapture);
      return originalAddEventListener.apply(this, args);
    };

    EventTarget.prototype.removeEventListener = function wrappedRemoveEventListener(eventName, fn, optionsOrCapture) {
      if (typeof fn !== 'function') {
        // eslint-disable-next-line prefer-rest-params
        return originalRemoveEventListener.apply(this, arguments);
      } // non-deopt arguments copy


      var args = new Array(arguments.length);

      for (var _i4 = 0; _i4 < arguments.length; _i4++) {
        // eslint-disable-next-line prefer-rest-params
        args[_i4] = arguments[_i4];
      }

      args[1] = popWrappedDomEventListener(this, eventName, fn, optionsOrCapture, fn);
      return originalRemoveEventListener.apply(this, args);
    };
  }

  var isExcessiveUsage$3 = createExcessiveUsageIdentifier({
    maxCallsPerTenMinutes: 128,
    maxCallsPerTenSeconds: 32
  });
  function reportCustomEvent(eventName, opts) {
    if (isExcessiveUsage$3()) {
      {
        info('Reached the maximum number of custom events to monitor');
      }

      return;
    }

    var traceId = getActiveTraceId();
    var spanId = generateUniqueId();

    if (!traceId) {
      traceId = spanId;
    } // Some properties deliberately left our for js file size reasons.


    var beacon = {
      'ty': 'cus',
      's': spanId,
      't': traceId,
      'ts': now(),
      'n': eventName
    };
    addCommonBeaconProperties(beacon);

    if (opts) {
      enrich(beacon, opts);
    }

    sendBeacon$3(beacon);
  }

  function enrich(beacon, opts) {
    if (opts['meta']) {
      addMetaDataToBeacon(beacon, opts['meta']);
    }

    if (typeof opts['duration'] === 'number' && !isNaN(opts['duration'])) {
      beacon['d'] = opts['duration']; // add Math.round since duration could be a float
      // We know that both properties are numbers. Flow thinks they are strings because we access them via […].

      beacon['ts'] = Math.round(beacon['ts'] - opts['duration']);
    }

    if (typeof opts['timestamp'] === 'number' && !isNaN(opts['timestamp'])) {
      beacon['ts'] = opts['timestamp'];
    }

    if (typeof opts['backendTraceId'] === 'string' && (opts['backendTraceId'].length === 16 || opts['backendTraceId'].length === 32)) {
      beacon['bt'] = opts['backendTraceId'];
    }

    if (opts['error']) {
      beacon['e'] = String(opts['error']['message']).substring(0, 300);
      beacon['st'] = shortenStackTrace(opts['error']['stack']);
    }

    if (typeof opts['componentStack'] === 'string') {
      beacon['cs'] = opts['componentStack'].substring(0, 4096);
    }

    if (typeof opts['customMetric'] === 'number') {
      beacon['cm'] = opts['customMetric'];
    }
  }

  function hookIntoUserTimings() {
    if (performance$1 && performance$1['timeOrigin'] && isResourceTimingAvailable) {
      drainExistingPerformanceEntries();
      observeNewUserTimings();
    }
  }

  function drainExistingPerformanceEntries() {
    onUserTimings(performance$1.getEntriesByType('mark'));
    onUserTimings(performance$1.getEntriesByType('measure'));
  }

  function onUserTimings(performanceEntries) {
    for (var _i2 = 0; _i2 < performanceEntries.length; _i2++) {
      onUserTiming(performanceEntries[_i2]);
    }
  }

  function onUserTiming(performanceEntry) {
    if (matchesAny(defaultVars.ignoreUserTimings, performanceEntry.name)) {
      {
        info('Ignoring user timing "%s" because it is ignored via the configuration.', performanceEntry.name);
      }

      return;
    }

    var duration;

    if (performanceEntry.entryType !== 'mark') {
      duration = Math.round(performanceEntry.duration);
    } else {
      // timestamp for mark also equals to "performance['timeOrigin'] + performanceEntry.startTime"
      // otherwise we'll see all UserTiming cus events starting at 0 offset to timeOrigin
      // which will cause confusion while UI ordering beacons by timestamp.
      //
      // see also: https://github.com/instana/weasel/pull/91/files#diff-6bfdd81c3c734033fa8c5709e4faee07476683733f76c3d254fc03841a125d27R44
      // basically we keep the duration change in this PR but revert the timestamp
      duration = Math.round(performanceEntry.startTime);
    } // We have to write it this way because of the Closure compiler advanced mode.


    reportCustomEvent(performanceEntry.name, {
      // Do not allow the timestamp to be before our Notion of page load start.
      'timestamp': Math.max(pageLoadStartTimestamp, Math.round(performance$1['timeOrigin'] + performanceEntry.startTime)),
      'duration': duration,
      'meta': {
        'userTimingType': performanceEntry.entryType
      }
    });
  }

  function observeNewUserTimings() {
    if (isPerformanceObserverAvailable) {
      try {
        var _observer = new win['PerformanceObserver'](onObservedPerformanceEntries);

        _observer['observe']({
          'entryTypes': ['mark', 'measure']
        });
      } catch (e) {// Some browsers may not support the passed entryTypes and decide to throw an error.
        // This would then result in an error with a message like:
        //
        // entryTypes only contained unsupported types
        //
        // Swallow and ignore the error. Treat it like unavailable performance observer data.
      }
    }
  }

  function onObservedPerformanceEntries(list) {
    onUserTimings(list.getEntries());
  }

  /*
  object-assign
  (c) Sindre Sorhus
  @license MIT
  */
  /* eslint-disable no-unused-vars */
  var getOwnPropertySymbols = Object.getOwnPropertySymbols;
  var hasOwnProperty$1 = Object.prototype.hasOwnProperty;
  var propIsEnumerable = Object.prototype.propertyIsEnumerable;

  function toObject(val) {
  	if (val === null || val === undefined) {
  		throw new TypeError('Object.assign cannot be called with null or undefined');
  	}

  	return Object(val);
  }

  function shouldUseNative() {
  	try {
  		if (!Object.assign) {
  			return false;
  		}

  		// Detect buggy property enumeration order in older V8 versions.

  		// https://bugs.chromium.org/p/v8/issues/detail?id=4118
  		var test1 = new String('abc');  // eslint-disable-line no-new-wrappers
  		test1[5] = 'de';
  		if (Object.getOwnPropertyNames(test1)[0] === '5') {
  			return false;
  		}

  		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
  		var test2 = {};
  		for (var i = 0; i < 10; i++) {
  			test2['_' + String.fromCharCode(i)] = i;
  		}
  		var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
  			return test2[n];
  		});
  		if (order2.join('') !== '0123456789') {
  			return false;
  		}

  		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
  		var test3 = {};
  		'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
  			test3[letter] = letter;
  		});
  		if (Object.keys(Object.assign({}, test3)).join('') !==
  				'abcdefghijklmnopqrst') {
  			return false;
  		}

  		return true;
  	} catch (err) {
  		// We don't expect any of the above to throw, but better to be safe.
  		return false;
  	}
  }

  var objectAssign = shouldUseNative() ? Object.assign : function (target, source) {
  	var from;
  	var to = toObject(target);
  	var symbols;

  	for (var s = 1; s < arguments.length; s++) {
  		from = Object(arguments[s]);

  		for (var key in from) {
  			if (hasOwnProperty$1.call(from, key)) {
  				to[key] = from[key];
  			}
  		}

  		if (getOwnPropertySymbols) {
  			symbols = getOwnPropertySymbols(from);
  			for (var i = 0; i < symbols.length; i++) {
  				if (propIsEnumerable.call(from, symbols[i])) {
  					to[symbols[i]] = from[symbols[i]];
  				}
  			}
  		}
  	}

  	return to;
  };

  var isExcessiveUsage$4 = createExcessiveUsageIdentifier({
    maxCallsPerTenMinutes: 256,
    maxCallsPerTenSeconds: 32
  });
  function instrumentFetch() {
    if (!win.fetch || !win.Request) {
      {
        info('Browser does not support the Fetch API.');
      }

      return;
    }

    win.fetch = function (input, init) {
      if (isExcessiveUsage$4()) {
        {
          info('Reached the maximum number of fetch calls to monitor.');
        }

        return originalFetch(input, init);
      }

      var copyInit = init ? objectAssign({}, init) : init;
      var body;

      if (copyInit && copyInit.body) {
        body = copyInit.body;
        copyInit.body = undefined;
      }

      var request = new Request(input, copyInit);

      if (body && copyInit) {
        copyInit.body = body;
      }

      var url = request.url;

      if (isUrlIgnored(url)) {
        {
          debug('Not generating XHR beacon for fetch call because it is to be ignored according to user configuration. URL: ' + url);
        } // could not use the original Request as it would encounter error that
        // either "Request body is already used"
        // or "Cannot construct a Request with a Request object that has already been used"


        return originalFetch(input instanceof Request ? request : input, init);
      } // Some properties deliberately left our for js file size reasons.


      var beacon = {
        'ty': 'xhr',
        // 't': '',
        'ts': now() - defaultVars.referenceTimestamp,
        'd': 0,
        // xhr beacon specific data
        // 's': '',
        'm': '',
        'u': '',
        'a': 1,
        'st': 0,
        'e': undefined
      };
      addCommonBeaconProperties(beacon);
      addGraphQlProperties(beacon, input, copyInit);
      var spanAndTraceId = generateUniqueId();
      var setBackendCorrelationHeaders = isSameOrigin(url) || isAllowedOrigin(url);
      beacon['t'] = spanAndTraceId;
      beacon['s'] = spanAndTraceId;
      beacon['m'] = request.method;
      beacon['u'] = stripSecrets(normalizeUrl(url));
      beacon['a'] = 1;
      beacon['bc'] = setBackendCorrelationHeaders ? 1 : 0;

      if (setBackendCorrelationHeaders) {
        if (copyInit && copyInit.headers) {
          copyInit.headers = new Headers(copyInit.headers);
          addCorrelationHttpHeaders(copyInit.headers.append, copyInit.headers, spanAndTraceId);
        } else if (input instanceof Request) {
          addCorrelationHttpHeaders(request.headers.append, request.headers, spanAndTraceId);
        } else {
          if (!copyInit) {
            copyInit = {};
          }

          copyInit.headers = new Headers();
          addCorrelationHttpHeaders(copyInit.headers.append, copyInit.headers, spanAndTraceId);
        }
      }

      try {
        captureHttpHeaders$1(request.headers, beacon);
      } catch (e) {
        {
          //it is possible without CORS, the Headers.forEach()
          //could throw errors with some browsers.
          warn('error during request.headers.forEach()');
        }
      }

      var performanceObserver = observeResourcePerformance({
        entryTypes: ['resource'],
        resourceMatcher: resourceMatcher,
        maxWaitForResourceMillis: defaultVars.maxWaitForResourceTimingsMillis,
        maxToleranceForResourceTimingsMillis: defaultVars.maxToleranceForResourceTimingsMillis,
        onEnd: onEnd
      });
      performanceObserver.onBeforeResourceRetrieval();
      return originalFetch(input instanceof Request ? request : input, copyInit).then(function (response) {
        beacon['st'] = response.status;

        try {
          captureHttpHeaders$1(response.headers, beacon);
        } catch (e) {
          {
            //it is possible without CORS, the Headers.forEach()
            //could throw errors with some browsers.
            warn('error during response.headers.forEach()');
          }
        } // When accessing object properties as object['property'] instead of
        // object.property flow does not know the type and assumes string.
        // Arithmetic operations like addition are only allowed on numbers. OTOH,
        // we can not safely use beacon.property as the compilation/minification
        // step will rename the properties which results in JSON payloads with
        // wrong property keys.


        performanceObserver.onAfterResourceRetrieved();
        return response;
      }, function (e) {
        performanceObserver.cancel();
        beacon['d'] = now() - (beacon['ts'] + defaultVars.referenceTimestamp);
        beacon['e'] = e.message;
        beacon['st'] = -103;
        sendBeacon$3(beacon);
        throw e;
      });

      function resourceMatcher(resource) {
        return (resource.initiatorType === 'fetch' || resource.initiatorType === 'xmlhttprequest') && Boolean(resource.name) && resource.name.indexOf(beacon['u']) === 0;
      }

      function onEnd(args) {
        beacon['d'] = args.duration;

        if (args.resource) {
          addResourceTiming(beacon, args.resource);
        }

        sendBeacon$3(beacon);
      }
    };
  }
  var queryIdentification = /^\s*query(\s|\{)/i;
  var mutationIdentification = /^\s*mutation(\s|\{)/i;

  function addGraphQlProperties(beacon, input, init) {
    try {
      if (typeof input !== 'string' || !init || init.method !== 'POST' || typeof init.body !== 'string' || !matchesAny(defaultVars.urlsToCheckForGraphQlInsights, input)) {
        return;
      }

      var _body = JSON.parse(init.body);

      if (typeof _body['operationName'] === 'string') {
        beacon['gon'] = _body['operationName'];
      }

      if (typeof _body['query'] === 'string') {
        if (queryIdentification.test(_body['query'])) {
          beacon['got'] = 'query';
        } else if (mutationIdentification.test(_body['query'])) {
          beacon['got'] = 'mutation';
        } else if (_body['query'].indexOf('{') === 0 && _body['operationName'] === null) {
          beacon['got'] = 'query';
        }
      }
    } catch (e) {
      {
        debug('Failed to analyze request for GraphQL insights.', input, init);
      }
    }
  }

  function captureHttpHeaders$1(headers, beacon) {
    if (defaultVars.headersToCapture.length === 0) {
      return;
    }

    headers.forEach(function (value, name) {
      if (matchesAny(defaultVars.headersToCapture, name)) {
        beacon['h_' + name.toLowerCase()] = value;
      }
    });
  }

  // localStorage API re-exposed to allow testing.
  var isSupported$1 = localStorage != null && typeof localStorage.getItem === 'function' && typeof localStorage.setItem === 'function';
  function getItem(k) {
    if (isSupported$1 && localStorage) {
      return localStorage.getItem(k);
    }

    return null;
  }
  function setItem(k, v) {
    if (isSupported$1 && localStorage) {
      localStorage.setItem(k, v);
    }
  }
  function removeItem(k) {
    if (isSupported$1 && localStorage) {
      localStorage.removeItem(k);
    }
  }

  var storageSeparatorKey = '#';
  function trackSessions(sessionInactivityTimeoutMillis, sessionTerminationTimeoutMillis) {
    if (!isSupported$1) {
      {
        info('Storage API is not available and session tracking is therefore not supported.');
      }

      return;
    }

    if (!sessionInactivityTimeoutMillis) {
      sessionInactivityTimeoutMillis = defaultVars.defaultSessionInactivityTimeoutMillis;
    }

    if (!sessionTerminationTimeoutMillis) {
      sessionTerminationTimeoutMillis = defaultVars.defaultSessionTerminationTimeoutMillis;
    }

    sessionInactivityTimeoutMillis = Math.min(sessionInactivityTimeoutMillis, defaultVars.maxAllowedSessionTimeoutMillis);
    sessionTerminationTimeoutMillis = Math.min(sessionTerminationTimeoutMillis, defaultVars.maxAllowedSessionTimeoutMillis);

    try {
      var _storedValue = getItem(defaultVars.sessionStorageKey);

      var _session = parseSession(_storedValue);

      if (_session && !isSessionValid(_session, sessionInactivityTimeoutMillis, sessionTerminationTimeoutMillis)) {
        _session = null;
      }

      if (_session) {
        _session.lastActivityTime = now();
      } else {
        _session = {
          id: generateUniqueId(),
          startTime: now(),
          lastActivityTime: now()
        };
      }

      setItem(defaultVars.sessionStorageKey, serializeSession(_session));
      defaultVars.sessionId = _session.id;
    } catch (e) {
      {
        warn('Failed to record session information', e);
      }
    }
  }
  function terminateSession() {
    defaultVars.sessionId = undefined;

    if (!isSupported$1) {
      return;
    }

    try {
      removeItem(defaultVars.sessionStorageKey);
    } catch (e) {
      {
        info('Failed to terminate session', e);
      }
    }
  }

  function parseSession(storedValue) {
    if (!storedValue) {
      return null;
    }

    var values = storedValue.split(storageSeparatorKey);

    if (values.length < 3) {
      return null;
    }

    var id = values[0];
    var startTime = parseInt(values[1], 10);
    var lastActivityTime = parseInt(values[2], 10);

    if (!id || isNaN(startTime) || isNaN(lastActivityTime)) {
      return null;
    }

    return {
      id: id,
      startTime: startTime,
      lastActivityTime: lastActivityTime
    };
  }

  function serializeSession(session) {
    return session.id + storageSeparatorKey + session.startTime + storageSeparatorKey + session.lastActivityTime;
  }

  function isSessionValid(session, sessionInactivityTimeoutMillis, sessionTerminationTimeoutMillis) {
    var minAllowedLastActivityTime = now() - sessionInactivityTimeoutMillis;

    if (session.lastActivityTime < minAllowedLastActivityTime) {
      return false;
    }

    var minAllowedStartTime = now() - sessionTerminationTimeoutMillis;

    if (session.startTime < minAllowedStartTime) {
      return false;
    }

    return true;
  }

  function processCommand(command) {
    switch (command[0]) {
      case 'apiKey':
        defaultVars.apiKey = command[1];
        break;

      case 'key':
        defaultVars.apiKey = command[1];
        break;

      case 'reportingUrl':
        defaultVars.reportingUrl = command[1];
        break;

      case 'meta':
        defaultVars.meta[command[1]] = command[2];
        break;

      case 'traceId':
        defaultVars.pageLoadBackendTraceId = command[1];
        break;

      case 'ignoreUrls':
        {
          validateRegExpArray('ignoreUrls', command[1]);
        }

        defaultVars.ignoreUrls = command[1];
        break;

      case 'ignoreErrorMessages':
        {
          validateRegExpArray('ignoreErrorMessages', command[1]);
        }

        defaultVars.ignoreErrorMessages = command[1];
        break;

      case 'allowedOrigins':
      case 'whitelistedOrigins':
        // a deprecated alias for allowedOrigins
        {
          validateRegExpArray('allowedOrigins', command[1]);
        }

        defaultVars.allowedOrigins = command[1];
        break;

      case 'ignoreUserTimings':
        {
          validateRegExpArray('ignoreUserTimings', command[1]);
        }

        defaultVars.ignoreUserTimings = command[1];
        break;

      case 'xhrTransmissionTimeout':
        defaultVars.xhrTransmissionTimeout = command[1];
        break;

      case 'page':
        setPage(command[1]);
        break;

      case 'ignorePings':
        defaultVars.ignorePings = command[1];
        break;

      case 'reportError':
        reportError(command[1], command[2]);
        break;

      case 'wrapEventHandlers':
        defaultVars.wrapEventHandlers = command[1];
        break;

      case 'autoPageDetection':
        defaultVars.autoPageDetection = processAutoPageDetectionCommand(command[1]);
        break;

      case 'wrapTimers':
        defaultVars.wrapTimers = command[1];
        break;

      case 'getPageLoadId':
        return defaultVars.pageLoadTraceId;

      case 'user':
        if (command[1]) {
          defaultVars.userId = String(command[1]).substring(0, 128);
        }

        if (command[2]) {
          defaultVars.userName = String(command[2]).substring(0, 128);
        }

        if (command[3]) {
          defaultVars.userEmail = String(command[3]).substring(0, 128);
        }

        break;

      case 'reportEvent':
        reportCustomEvent(command[1], command[2]);
        break;

      case 'beaconBatchingTime':
        defaultVars.beaconBatchingTime = command[1];
        break;

      case 'maxWaitForResourceTimingsMillis':
        defaultVars.maxWaitForResourceTimingsMillis = command[1];
        break;

      case 'maxToleranceForResourceTimingsMillis':
        defaultVars.maxToleranceForResourceTimingsMillis = command[1];
        break;

      case 'maxMaitForPageLoadMetricsMillis':
        defaultVars.maxMaitForPageLoadMetricsMillis = command[1];
        break;

      case 'trackSessions':
        trackSessions(command[1], command[2]);
        break;

      case 'terminateSession':
        terminateSession();
        break;

      case 'urlsToCheckForGraphQlInsights':
        {
          validateRegExpArray('urlsToCheckForGraphQlInsights', command[1]);
        }

        defaultVars.urlsToCheckForGraphQlInsights = command[1];
        break;

      case 'secrets':
        {
          validateRegExpArray('secrets', command[1]);
        }

        defaultVars.secrets = command[1];
        break;

      case 'fragment':
        {
          validateRegExpArray('fragment', command[1]);
        }

        defaultVars.fragment = command[1];
        break;

      case 'captureHeaders':
        {
          validateRegExpArray('captureHeaders', command[1]);
        }

        defaultVars.headersToCapture = command[1];
        break;

      case 'debug':
        // Not using an if (true) {…} wrapper nor the integrated logging
        // facilities to keep the end-user impact as low as possible.
        // eslint-disable-next-line no-console
        console.log({
          vars: defaultVars
        });
        break;

      case 'reportingBackends':
        processReportingBackends(command[1]);
        break;

      case 'webvitalsInCustomEvent':
        defaultVars.webvitalsInCustomEvent = command[1];
        break;

      default:
        {
          warn('Unsupported command: ' + command[0]);
        }

        break;
    }
  }

  function validateRegExpArray(name, arr) {
    if (!(arr instanceof Array)) {
      return warn(name + ' is not an array. This will result in errors.');
    }

    for (var _i2 = 0, _len2 = arr.length; _i2 < _len2; _i2++) {
      if (!(arr[_i2] instanceof RegExp)) {
        return warn(name + '[' + _i2 + '] is not a RegExp. This will result in errors.');
      }
    }
  }

  function processReportingBackends(arr) {
    defaultVars.reportingBackends.length = 0;

    if (!(arr instanceof Array)) {
      {
        warn('reportingBackends is not an array. This command will be ignored.');
      }

      return;
    }

    for (var _i4 = 0, _len4 = arr.length; _i4 < _len4; _i4++) {
      var _item = arr[_i4];

      if (!_item || !_item['reportingUrl'] || !hasOwnProperty(_item, 'key')) {
        {
          warn('reportingBackends[' + _i4 + '] is not a ReportingBackend. It will be ignored.');
        }
      } else {
        defaultVars.reportingBackends.push(arr[_i4]);
      }
    }
  }

  function wrapTimers() {
    if (defaultVars.wrapTimers) {
      if (isRunningZoneJs) {
        {
          warn('We discovered a usage of Zone.js. In order to avoid any incompatibility issues timer wrapping is not going to be enabled.');
        }

        return;
      }

      wrapTimer('setTimeout');
      wrapTimer('setInterval');
    }
  }

  function wrapTimer(name) {
    var original = win[name];

    if (typeof original !== 'function') {
      // cannot wrap because fn is not a function – should actually never happen
      return;
    }

    win[name] = function wrappedTimerSetter(fn) {
      // non-deopt arguments copy
      var args = new Array(arguments.length);

      for (var _i2 = 0; _i2 < arguments.length; _i2++) {
        // eslint-disable-next-line prefer-rest-params
        args[_i2] = arguments[_i2];
      }

      args[0] = wrap$1(fn);
      return original.apply(this, args);
    };
  }

  function wrap$1(fn) {
    if (typeof fn !== 'function') {
      // cannot wrap because fn is not a function
      return fn;
    }

    return function wrappedTimerHandler() {
      try {
        // eslint-disable-next-line prefer-rest-params
        return fn.apply(this, arguments);
      } catch (e) {
        reportError(e);
        ignoreNextOnErrorEvent();
        throw e;
      }
    };
  }

  try {var e,n,t,i,r,a=-1,o=function(e){addEventListener("pageshow",(function(n){n.persisted&&(a=n.timeStamp,e(n));}),!0);},c=function(){return window.performance&&performance.getEntriesByType&&performance.getEntriesByType("navigation")[0]},u=function(){var e=c();return e&&e.activationStart||0},f=function(e,n){var t=c(),i="navigate";a>=0?i="back-forward-cache":t&&(document.prerendering||u()>0?i="prerender":document.wasDiscarded?i="restore":t.type&&(i=t.type.replace(/_/g,"-")));return {name:e,value:void 0===n?-1:n,rating:"good",delta:0,entries:[],id:"v3-".concat(Date.now(),"-").concat(Math.floor(8999999999999*Math.random())+1e12),navigationType:i}},s=function(e,n,t){try{if(PerformanceObserver.supportedEntryTypes.includes(e)){var i=new PerformanceObserver((function(e){Promise.resolve().then((function(){n(e.getEntries());}));}));return i.observe(Object.assign({type:e,buffered:!0},t||{})),i}}catch(e){}},d=function(e,n,t,i){var r,a;return function(o){n.value>=0&&(o||i)&&((a=n.value-(r||0))||void 0===r)&&(r=n.value,n.delta=a,n.rating=function(e,n){return e>n[1]?"poor":e>n[0]?"needs-improvement":"good"}(n.value,t),e(n));}},l=function(e){requestAnimationFrame((function(){return requestAnimationFrame((function(){return e()}))}));},p=function(e){var n=function(n){"pagehide"!==n.type&&"hidden"!==document.visibilityState||e(n);};addEventListener("visibilitychange",n,!0),addEventListener("pagehide",n,!0);},v=function(e){var n=!1;return function(t){n||(e(t),n=!0);}},m=-1,h=function(){return "hidden"!==document.visibilityState||document.prerendering?1/0:0},g=function(e){"hidden"===document.visibilityState&&m>-1&&(m="visibilitychange"===e.type?e.timeStamp:0,T());},y=function(){addEventListener("visibilitychange",g,!0),addEventListener("prerenderingchange",g,!0);},T=function(){removeEventListener("visibilitychange",g,!0),removeEventListener("prerenderingchange",g,!0);},E=function(){return m<0&&(m=h(),y(),o((function(){setTimeout((function(){m=h(),y();}),0);}))),{get firstHiddenTime(){return m}}},C=function(e){document.prerendering?addEventListener("prerenderingchange",(function(){return e()}),!0):e();},L=[1800,3e3],w=function(e,n){n=n||{},C((function(){var t,i=E(),r=f("FCP"),a=s("paint",(function(e){e.forEach((function(e){"first-contentful-paint"===e.name&&(a.disconnect(),e.startTime<i.firstHiddenTime&&(r.value=Math.max(e.startTime-u(),0),r.entries.push(e),t(!0)));}));}));a&&(t=d(e,r,L,n.reportAllChanges),o((function(i){r=f("FCP"),t=d(e,r,L,n.reportAllChanges),l((function(){r.value=performance.now()-i.timeStamp,t(!0);}));})));}));},b=[.1,.25],S=function(e,n){n=n||{},w(v((function(){var t,i=f("CLS",0),r=0,a=[],c=function(e){e.forEach((function(e){if(!e.hadRecentInput){var n=a[0],t=a[a.length-1];r&&e.startTime-t.startTime<1e3&&e.startTime-n.startTime<5e3?(r+=e.value,a.push(e)):(r=e.value,a=[e]);}})),r>i.value&&(i.value=r,i.entries=a,t());},u=s("layout-shift",c);u&&(t=d(e,i,b,n.reportAllChanges),p((function(){c(u.takeRecords()),t(!0);})),o((function(){r=0,i=f("CLS",0),t=d(e,i,b,n.reportAllChanges),l((function(){return t()}));})),setTimeout(t,0));})));},A={passive:!0,capture:!0},I=new Date,P=function(i,r){e||(e=r,n=i,t=new Date,k(removeEventListener),F());},F=function(){if(n>=0&&n<t-I){var r={entryType:"first-input",name:e.type,target:e.target,cancelable:e.cancelable,startTime:e.timeStamp,processingStart:e.timeStamp+n};i.forEach((function(e){e(r);})),i=[];}},M=function(e){if(e.cancelable){var n=(e.timeStamp>1e12?new Date:performance.now())-e.timeStamp;"pointerdown"==e.type?function(e,n){var t=function(){P(e,n),r();},i=function(){r();},r=function(){removeEventListener("pointerup",t,A),removeEventListener("pointercancel",i,A);};addEventListener("pointerup",t,A),addEventListener("pointercancel",i,A);}(n,e):P(n,e);}},k=function(e){["mousedown","keydown","touchstart","pointerdown"].forEach((function(n){return e(n,M,A)}));},D=[100,300],x=function(t,r){r=r||{},C((function(){var a,c=E(),u=f("FID"),l=function(e){e.startTime<c.firstHiddenTime&&(u.value=e.processingStart-e.startTime,u.entries.push(e),a(!0));},m=function(e){e.forEach(l);},h=s("first-input",m);a=d(t,u,D,r.reportAllChanges),h&&p(v((function(){m(h.takeRecords()),h.disconnect();}))),h&&o((function(){var o;u=f("FID"),a=d(t,u,D,r.reportAllChanges),i=[],n=-1,e=null,k(addEventListener),o=l,i.push(o),F();}));}));},B=0,R=1/0,H=0,N=function(e){e.forEach((function(e){e.interactionId&&(R=Math.min(R,e.interactionId),H=Math.max(H,e.interactionId),B=H?(H-R)/7+1:0);}));},O=function(){return r?B:performance.interactionCount||0},q=function(){"interactionCount"in performance||r||(r=s("event",N,{type:"event",buffered:!0,durationThreshold:0}));},j=[200,500],_=0,z=function(){return O()-_},G=[],J={},K=function(e){var n=G[G.length-1],t=J[e.interactionId];if(t||G.length<10||e.duration>n.latency){if(t)t.entries.push(e),t.latency=Math.max(t.latency,e.duration);else {var i={id:e.interactionId,latency:e.duration,entries:[e]};J[i.id]=i,G.push(i);}G.sort((function(e,n){return n.latency-e.latency})),G.splice(10).forEach((function(e){delete J[e.id];}));}},Q=function(e,n){n=n||{},C((function(){var t;q();var i,r=f("INP"),a=function(e){e.forEach((function(e){(e.interactionId&&K(e),"first-input"===e.entryType)&&(!G.some((function(n){return n.entries.some((function(n){return e.duration===n.duration&&e.startTime===n.startTime}))}))&&K(e));}));var n,t=(n=Math.min(G.length-1,Math.floor(z()/50)),G[n]);t&&t.latency!==r.value&&(r.value=t.latency,r.entries=t.entries,i());},c=s("event",a,{durationThreshold:null!==(t=n.durationThreshold)&&void 0!==t?t:40});i=d(e,r,j,n.reportAllChanges),c&&("PerformanceEventTiming"in window&&"interactionId"in PerformanceEventTiming.prototype&&c.observe({type:"first-input",buffered:!0}),p((function(){a(c.takeRecords()),r.value<0&&z()>0&&(r.value=0,r.entries=[]),i(!0);})),o((function(){G=[],_=O(),r=f("INP"),i=d(e,r,j,n.reportAllChanges);})));}));},U=[2500,4e3],V={},W=function(e,n){n=n||{},C((function(){var t,i=E(),r=f("LCP"),a=function(e){var n=e[e.length-1];n&&n.startTime<i.firstHiddenTime&&(r.value=Math.max(n.startTime-u(),0),r.entries=[n],t());},c=s("largest-contentful-paint",a);if(c){t=d(e,r,U,n.reportAllChanges);var m=v((function(){V[r.id]||(a(c.takeRecords()),c.disconnect(),V[r.id]=!0,t(!0));}));["keydown","click"].forEach((function(e){addEventListener(e,(function(){return setTimeout(m,0)}),!0);})),p(m),o((function(i){r=f("LCP"),t=d(e,r,U,n.reportAllChanges),l((function(){r.value=performance.now()-i.timeStamp,V[r.id]=!0,t(!0);}));}));}}));},X=[800,1800],Y=function e(n){document.prerendering?C((function(){return e(n)})):"complete"!==document.readyState?addEventListener("load",(function(){return e(n)}),!0):setTimeout(n,0);},Z=function(e,n){n=n||{};var t=f("TTFB"),i=d(e,t,X,n.reportAllChanges);Y((function(){var r=c();if(r){var a=r.responseStart;if(a<=0||a>performance.now())return;t.value=Math.max(a-u(),0),t.entries=[r],i(!0),o((function(){t=f("TTFB",0),(i=d(e,t,X,n.reportAllChanges))(!0);}));}}));};} catch (e) {}

  function reportExtraMetrics(metric) {
    if (!defaultVars.webvitalsInCustomEvent) {
      return;
    } // We have to write it this way because of the Closure compiler advanced mode.


    reportCustomEvent('instana-webvitals-' + metric.name, {
      'timestamp': pageLoadStartTimestamp + Math.round(metric.value),
      'duration': Math.round(metric.value),
      'meta': {
        'id': metric.id,
        'v': metric.value
      }
    });
  }

  function addWebVitals(beacon) {
    if (W) {
      W(onMetric, {
        reportAllChanges: true
      });
    }

    if (x) {
      x(onMetric, {
        reportAllChanges: true
      });
    }

    if (Q) {
      Q(onMetric, {
        reportAllChanges: true
      });
    }

    if (S) {
      S(onMetricWithoutRounding, {
        reportAllChanges: true
      });
    }

    function onMetric(metric) {
      beacon['t_' + metric.name.toLocaleLowerCase()] = Math.round(metric.value);
      reportExtraMetrics(metric);
    }

    function onMetricWithoutRounding(metric) {
      beacon['t_' + metric.name.toLocaleLowerCase()] = metric.value;
      reportExtraMetrics(metric);
    }
  }

  var state$2 = {
    onEnter: function onEnter() {
      if ( !fulfillsPrerequisites()) {
        warn('Browser does not have all the required features for web monitoring.');
      }

      var globalObjectName = win[defaultVars.nameOfLongGlobal];
      var globalObject = win[globalObjectName];

      if (!globalObject) {
        {
          warn('global ' + defaultVars.nameOfLongGlobal + ' not found. Did you use the initializer?');
        }

        return;
      }

      if (!globalObject.q) {
        {
          warn('Command queue not defined. Did you add the tracking script multiple times to your website?');
        }

        return;
      }

      if (typeof globalObject['l'] !== 'number') {
        {
          warn('Reference timestamp not set via EUM initializer. Was the initializer modified?');
        }

        return;
      }

      if (typeof globalObject['v'] === 'number') {
        var _version = String(Math.round(globalObject['v']));

        {
          info('Identified version of snippet to be:', _version);
        }

        defaultVars.trackingSnippetVersion = _version;
      } // Start observing web vitals as early as possible as it registers performance observers.


      try {
        addWebVitals(beacon);
      } catch (e) {
        {
          warn('Failed to capture web vitals. Will continue without web vitals', e);
        }
      }

      processCommands(globalObject.q); // prefer the backend trace ID which was explicitly set

      defaultVars.pageLoadBackendTraceId = defaultVars.pageLoadBackendTraceId || getPageLoadBackendTraceId();
      defaultVars.initializerExecutionTimestamp = globalObject['l'];
      addCommandAfterInitializationSupport();

      if (!defaultVars.reportingUrl && defaultVars.reportingBackends.length === 0) {
        {
          error('No reporting URL configured. Aborting EUM initialization.');
        }

        return;
      }

      hookIntoUserTimings();
      instrumentXMLHttpRequest();
      instrumentFetch();
      hookIntoGlobalErrorEvent();
      wrapTimers();
      wrapEventHandlers();
      hookIntoGlobalUnhandledRejectionEvent();
      initAutoPageDetection();
      transitionTo('waitForPageLoad');
    },
    getActiveTraceId: function getActiveTraceId() {
      return defaultVars.pageLoadTraceId;
    },
    getActivePhase: function getActivePhase() {
      return pageLoad;
    }
  };

  function processCommands(commands) {
    for (var _i2 = 0, _len2 = commands.length; _i2 < _len2; _i2++) {
      processCommand(commands[_i2]);
    }
  }

  function addCommandAfterInitializationSupport() {
    var globalObjectName = win[defaultVars.nameOfLongGlobal];

    win[globalObjectName] = function () {
      /* eslint-disable prefer-rest-params */
      return processCommand(arguments);
    };
  }

  function fulfillsPrerequisites() {
    return win.XMLHttpRequest && win.JSON;
  }

  registerState('init', state$2);
  registerState('waitForPageLoad', state);
  registerState('pageLoaded', state$1);
  transitionTo('init');

}());
//# sourceMappingURL=eum.debug.js.map
