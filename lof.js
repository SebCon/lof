'use strict';


/**
*		@namespace lof
*/

/**
 *    @copyright 2017
 *    @author Sebastian Conrad <http://www.sebcon.de/>
 *    @version 1.0 - 15. August 2017
 *    @see http://www.github.com/sebcon
 *    @license Available under MIT license <https://mths.be/mit>
 *    @fileoverview Light Framework for doing DOM and Layout stuff like JQuery
 */


/**
*		@class lof
*
*		@constructor
*		@param {document}	document document object
*		@param {window} window window object
*		@param {performance} performance performance object
**/

var lof = (function(document, window, performance, console) {

  /** @constant {string} */
  var ELEMENT_ID = 'id';
  /** @constant {string} */
  var ELEMENT_CLASS = 'class';
  /** @constant {string} */
  var ELEMENT_TAG = 'tag';
  /** @constant {string} */
  var ELEMENT_NAME = 'name';
  /** @constant {string} */
  var ELEMENT_CSS = 'css';

/** @constant {string} */
  var STYLE_HIDE = 'none';
  /** @constant {string} */
  var STYLE_SHOW = 'block';

/** @constant {string} */
  var VERSION = '1.0';

  var elements = [];
  var saveElems = {};
  //var waitingQueue = [];

  // waiting queue for animation, delay
  var fx = [];
  var queueHandling = false;
  var delay = 0;


  var setQueueHandling = function(bool) {
    if (bool) {
      queueHandling = bool;
    }
  };


  var isQueueHandling = function() {
    return queueHandling;
  };


  var queueManager = function() {
    var loop = function() {
      if (fx.length > 0) {
        var i = 0;
        setQueueHandling(true);
        //while (fx.length > 0) {
          var current = Date.now();
          if (current >= fx[i].timeStamp) {
            iterator(elements, fx[i].callback);
            fx.splice(i,1);
          } else {
            i++;
            if (i >= fx.length) {
              i = 0;
            }
          }
          if (fx.length > 0) {
            window.requestAnimationFrame(loop);
          } else {
            delay = 0;
          }
        }
    };
    window.requestAnimationFrame(loop);
    setQueueHandling(false);
  };


  var startQueueManager = function() {
    if (fx.length > 0 && !isQueueHandling()) {
      queueManager();
    }
  };


  var generateTimeStamp = function(delayTime) {
    var dt = (delayTime || 0);
    return (Date.now() + dt);
  };


  // constructor for Queue Object
  var QObject = function(config) {
    this.id = (config.id || 'something');
    this.callback = (config.callback || function() { console.warn('holy shit'); });
    this.timeStamp = (config.timeStamp || generateTimeStamp());
  };

  var isFunction = function(callback) {
    return (typeof callback === 'function');
  };


  var iterator = function(list, callback) {
    if (list && Array.isArray(list) && callback) {
      var func = function() {
        for (var i=0; i < list.length; i++) {
          callback(list[i]);
        }
      };

      func.call();
    }
  };


  var getElemItems = function(elemItems) {
    var elem = null;
    if (elemItems) {
      elem = [];
      for (var i=0; i < elemItems.length; i++) {
        elem.push(elemItems.item(i));
      }
    }

    return elem;
  };


  var getFactory = function(type, search) {
    var elem = null;

    if (type) {
      switch(type) {
        case ELEMENT_ID:
        elem = document.getElementById(search);
        break;

        case ELEMENT_CLASS:
        elem = getElemItems(document.getElementsByClassName(search));
        break;

        case ELEMENT_TAG:
        elem = getElemItems(document.getElementsByTagName(search));
        break;

        case ELEMENT_NAME:
        elem = getElemItems(document.getElementsByName(search));
        break;

        case ELEMENT_CSS:
        elem = getElemItems(document.querySelectorAll(search));
        break;

        default:
          console.warn('type ' + type + ' not found');
      }
    }

    return elem;

  };


  var transformArray = function(ref) {
    if (!Array.isArray(ref)) {

      var temp = ref;
      ref = [];
      ref.push(temp);
    }

    return ref;
  };


  /** get elements via id, class, tag, name or css
  *		@function get
  *		@param {Object} list config list
  *   @param {string} list.id element id
  *   @param {string} list.class element class
  *   @param {string} list.tag element tag
  *   @param {string} list.name element name
  *   @param {string} list.css css selector
  *
  *   @return {this} lof object
  **/
  var get = function(list) {
    if (list) {
      var references = {};
      references[ELEMENT_ID] = (list.id || null);
      references[ELEMENT_CLASS] = (list.class || null);
      references[ELEMENT_TAG] = (list.tag || null);
      references[ELEMENT_NAME] = (list.name || null);
      references[ELEMENT_CSS] = (list.css || null);
      elements = [];

      for (var key in references) {
        if (references[key] !== null) {
          references[key] = transformArray(references[key]);
          for (var k=0; k < references[key].length; k++) {
            var elem = getFactory(key, references[key][k]);
            if (elem) {
              if (Array.isArray(elem)) {
                elements = elements.concat(elem);
              } else {
                elements.push(elem);
              }
            }
          }
        }
      }

    }

    return this;
  };


  var existsClass = function(elem, cName) {
    return (elem && cName && elem.className && elem.className.indexOf(cName) >= 0);
  };


  /** remove class from elements
  *		@function removeClass
  *		@param {string} classes classes
  *
  *   @return {this} lof object
  **/
  var removeClass = function(classes) {
    var temp = transformArray(classes);

    // bisher nur eine classe hinzufügen möglich, nicht als Array !
    var callback = function(elem) {
      if (elem && elem.classList && elem.classList.length > 0) {
        elem.classList.remove(classes);
      }
    };

    delayManager(callback);
    return this;
  };


  /** add class from elements
  *		@function addClass
  *		@param {string} classes classes
  *
  *   @return {this} lof object
  **/
  var addClass = function(classes) {
    var temp = transformArray(classes);

    // bisher nur eine classe hinzufügen möglich, nicht als Array !
    var callback = function(elem) {
      if (elem && elem.classList && elem.classList.length > 0) {
        elem.classList.add(classes);
      }
    };

    delayManager(callback);
    return this;
  };



  var toogleClass = function(elem, oldClass, newClass) {
    if (elem && elem.classList && elem.classList.length > 0) {
      elem.classList.remove(oldClass);
      elem.classList.add(newClass);
    }
  };


  var delayManager = function(callback) {
    if (delay > 0) {
      fx.push(new QObject({timeStamp : generateTimeStamp(delay), callback : callback}));
      //delay = 0;
      startQueueManager();
    } else {
      iterator(elements, callback);
    }
  };


  /** show elements via display show
  *		@function show
  *
  *   @return {this} lof object
  **/
  var show = function() {
    var callback = function(elem) {
      if (elem) {
        elem.style.display = STYLE_SHOW;
        elem.style.opacity = '1';
      }
    };

    delayManager(callback);
    return this;
  };


  /** hide elements via display none
  *		@function hide
  *
  *   @return {this} lof object
  **/
  var hide = function() {
    var callback = function(elem) {
        elem.style.display = STYLE_HIDE;
        elem.style.opacity = '0';
    };
    delayManager(callback);
    return this;
  };



  /** get the last choosen elements
  *		@function getLast
  *
  *   @return {(this|null)} lof object or null
  **/
  var getLast = function() {
    return elements ? this : null;
  };


  /** save elements via id number
  *		@function save
  *		@param {(string|number)} id id for saving
  *
  *   @return {this} lof object
  **/
  var save = function(id) {
    if (elements && !saveElems[id]) {
      saveElems[id] = elements;
    } else {
      console.log('ick speicher hier nüscht');
    }

    return this;
  };


  /** get the save elements via id number
  *		@function getSave
  *		@param {(string|number)} id saved id
  *
  *   @return {this} lof object
  **/
  var getSave = function(id) {
    elements = saveElems[id] ? saveElems[id] : null;
    if (elements === null) {
      console.warn('found no set of saved elements');
    }
    return this;
  };


  /** register lof function if you click on choosen elements
  *		@function onclick
  *		@param {string} type function name
  *
  *   @return {this} lof object
  **/
  var onclick = function(type) {
    var self = this;
    if (elements && type) {
      var callback = function(elem) {
        if (elem) {
          // @todo: change event Listener -> EventHandler module
          elem.addEventListener('click', function() {
            if (isFunction(type)) {
              type.call();
            } else {
              if (self[type] && isFunction(self[type])) {
                self[type].call();
              }
            }
          });
        }
        };

      delayManager(callback);
    }

    return self;
  };


  var isWaiting = function() {
    return (delay > 0);
  };


  /** set delay time
  *		@function wait
  *		@param {number} time delay time
  *
  *   @return {this} lof object
  **/
  var wait = function(time) {
    // @todo: check if is NUMBER
    if (time && time > 0) {
      delay += time;
    }

    return this;
  };



  var transformCSS = function(prop) {
    var newProp = '';
    var mGreat = false;
    for (var i=0; i < prop.length; i++) {
      if (prop[i] === '-') {
        mGreat = true;
      } else {
          if (mGreat) {
            mGreat = false;
            newProp += prop[i].toUpperCase();
          } else {
            if (prop[i] !== ' ') {
              newProp += prop[i].toLowerCase();
            }
          }
      }
    }

    return newProp;
  };


  /** get the value of the property | set the value of the property
  *		@function css
  *		@param {string} prop element property
  *   @param {string} [value] property value
  *
  *   @return {string} value of property
  **/
  var css = function(prop, value) {
    var back = [];
    if (prop && value !== undefined && value !== null) {
      prop = transformCSS(prop);
      var callback = function(elem) {
        if (elem) {
          elem.style[prop] = value;
        }
      };
      delayManager(callback);
    } else if (prop) {
      // props von den elementen ermitteln
      var callback2 = function(elem) {
        if (elem) {
          back.push(elem.style[prop]);
        }
      };
      iterator(elements, callback2);
    }

    return back;
  };


  /** get version number
  *		@function getVersion
  *
  *   @return {string} version number
  **/
  var getVersion = function() {
    return VERSION;
  };


  return {
    get : get,
    save : save,
    getSave : getSave,
    show : show,
    hide : hide,
    getLast : getLast,
    onclick : onclick,
    addClass : addClass,
    removeClass : removeClass,
    getVersion : getVersion,
    wait : wait,
    css : css
  };


})(document, window, performance, console);
