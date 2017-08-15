'use strict';


/**
*		@namespace Slideshow
*/

/**
 *    @copyright 2017
 *    @author Sebastian Conrad <http://www.sebcon.de/>
 *    @version 1.0 - 15. August 2017
 *    @see http://www.github.com/sebcon
 *    @license Available under MIT license <https://mths.be/mit>
 *    @fileoverview Light Framework for doing DOM and Layout stuff
 */


/**
*		@class lof
*
*		@constructor
*		@param {document}	document -
*		@param {window} window -
*		@param {performance} performance -
**/

var lof = (function(document, window, performance, console) {

  //this.config = config || {};
  var ELEMENT_ID = 'id';
  var ELEMENT_CLASS = 'class';
  var ELEMENT_TAG = 'tag';
  var ELEMENT_NAME = 'name';
  var ELEMENT_CSS = 'css';

  var STYLE_HIDE = 'none';
  var STYLE_SHOW = 'block';

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
            // @todo Element aus Array löschen ???
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
    // @todo Korrekturwert berechnen und davon abziehen!
    var dt = (delayTime || 0);
    console.log('delayTime: '+delayTime);
    console.log('timeStamp: ' + (Date.now() + dt));
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


  var hide = function() {
    var callback = function(elem) {
        elem.style.display = STYLE_HIDE;
        elem.style.opacity = '0';
      }
    };
    delayManager(callback);
    return this;
  };




  var getLast = function() {
    return elements ? this : null;
  };


  var save = function(id) {
    if (elements && !saveElems[id]) {
      saveElems[id] = elements;
    } else {
      console.log('ick speicher hier nüscht');
    }

    return this;
  };


  var getSave = function(id) {
    elements = saveElems[id] ? saveElems[id] : null;
    if (elements === null) {
      console.warn('found no set of saved elements');
    }
    return this;
  };


  var click = function(type) {
    var self = this;
    //var callback;
    if (elements && type) {
      //for (var i=0; i < elements.length; i++) {
      var callback = function(elem) {
        if (elem) {
          elem.addEventListener('click', function() {
            if (isFunction(type)) {
              type.call();
            } else {
              if (self[type] && isFunction(self[type])) {
                // in den delayManager ???
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


  var wait = function(time) {
    // check if is NUMBER
    if (time) {
      // möglich: wait(1000).wait(1000)
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


  var css = function(prop, value) {
    var back = [];
    if (prop && value !== undefined && value !== null) {
      prop = transformCSS(prop);
      console.warn(prop);
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
          console.log('prop: '+prop);
          console.warn(elem.style[prop]);
          back.push(elem.style[prop]);
        }
      };
      iterator(elements, callback2);
    }

    return back;
  };


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
    onclick : click,
    addClass : addClass,
    removeClass : removeClass,
    getVersion : getVersion,
    wait : wait,
    css : css
  };


})(document, window, performance, console);
