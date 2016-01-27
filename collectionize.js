(function () {

  var isBrowser = typeof window !== 'undefined';
  var isNode = typeof module !== 'undefined' && module.exports;

  function safeRequire(varName, moduleName) {
    if (isBrowser && window[varName]) {
      return window[varName];
    } else if (isNode && typeof require === 'function') {
      return require(moduleName);
    } else {
      throw new Error('Collectionize requires ' + moduleName + ' to be loaded.');
    }
  }

  var mockStorage = {};
  var _ = safeRequire('_', 'lodash');

  // http://jsperf.com/jquery-each-vs-for-loop/40
  function nativeEach(obj, cb) {
    if (obj && _.isFunction(cb)) {
      if (_.isPlainObject(obj)) {
        return eachObject(obj, cb);
      } else if (_.isArray(obj) || _.isString(obj)) {
        return eachArray(obj, cb);
      }
    }
  }

  function eachArray(obj, cb) {
    var i = 0, max = obj.length;
    for (; i < max; i++) {
      if (cb(obj[i], i, obj) === false) {
        break;
      }
    }
  }

  function eachObject(obj, cb) {
    var key;
    for (key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (cb(obj[key], key, obj) === false) {
          break;
        }
      }
    }
  }

  function arrayMove(arr, oldIndex, newIndex) {
    if (newIndex >= arr.length) {
      var k = newIndex - arr.length;
      while ((k--) + 1) {
        arr.push(undefined);
      }
    }
    arr.splice(newIndex, 0, arr.splice(oldIndex, 1)[0]);

    return arr;
  }

  function storageSet(name, data) {
    name = Collectionize.localStoragePrefix + name;

    if (isBrowser) {
      window.localStorage.setItem(name, data);
    } else {
      mockStorage[name] = data;
    }
  }

  function storageGet(name) {
    name = Collectionize.localStoragePrefix + name;

    if (isBrowser) {
      return window.localStorage.getItem(name);
    } else {
      return mockStorage[name];
    }
  }

  function Collectionize(name) {
    var self = {
      db: [],
      listeners: [],
      name: name // used for localStorage property naming
    };

    var lodashMethods = ['at', 'every', 'filter', 'find', 'findIndex',
      'findLastIndex', 'first', 'last', 'map', 'max', 'min', 'pluck', 'reduce',
      'reduceRight', 'reject', 'sample', 'size', 'shuffle', 'some', 'sortBy', 'where'];

    nativeEach(lodashMethods, function (methodName) {
      self[methodName] = function () {
        var args = _.toArray(arguments);
        args.unshift(self.db);
        return _[methodName].apply(this, args);
      };
    });

    self.on = function (eventNames, fn) {
      nativeEach(eventNames.split(' '), function (eventName) {
        self.listeners.push({ name: eventName, fn: fn });
      });
    };

    self.trigger = function () {
      var args = _.toArray(arguments);
      var eventName = args.shift();
      nativeEach(self.listeners, function (listener) {
        if (listener.name === eventName) {
          listener.fn.apply(this, args);
        }
      });
    };

    self.off = function (eventName) {
      _.remove(self.listeners, function (listener) {
        return listener.name === eventName;
      });
    };

    self.each = function (cb) {
      nativeEach(self.db, cb);
    };

    self.isEmpty = function (query) {
      return self.filter(query).length === 0;
    };

    self.incr = function (query, prop) {
      var matches = self.filter(query);
      nativeEach(matches, function (obj) {
        if (obj) {
          if (_.isNumber(obj[prop])) {
            obj[prop]++;
          } else {
            obj[prop] = 0;
          }
        }
      });
    };

    self.move = function (oldIndex, newIndex) {
      self.db = arrayMove(self.db, oldIndex, newIndex);
      self.trigger('moved');
    };

    self.add = function (obj) {
      self.trigger('beforeAdd', obj);
      self.db[self.db.length] = obj;
      self.trigger('added', obj);

      return obj;
    };

    self.update = function (obj, key) {
      key = key || 'id';

      var query = {};
      if (_.isString(key) && obj[key]) {
        query[key] = obj[key];
      } else if (_.isPlainObject(key)) {
        query = key;
      }

      var output = [];
      var matches = self.filter(query);

      if (matches.length > 0) {
        nativeEach(matches, function (match) {
          _.extend(match, obj);
          self.trigger('beforeUpdate', match);
          output[output.length] = match;
          self.trigger('updated', match);
        });
      } else {
        output[output.length] = self.add(obj);
      }

      return output;
    };

    self.remove = function (query) {
      var removed = self.filter(query);
      self.db = self.reject(query);
      nativeEach(removed, function (obj) {
        self.trigger('removed', obj);
      });
    };

    self.flush = function (db) {
      self.trigger('beforeFlush');
      self.db = db || [];
      self.trigger('flushed');
    };

    self.all = function () {
      return self.db;
    };

    self.clientSave = function () {
      var data = [];
      self.each(function (item, index) {
        data[index] = {};
        nativeEach(item, function (value, key) {
          if (_.isFunction(value)) {
            value = '(' + value + ');';
          }
          // Drop DOM elements, since they don't work with JSON.stringify.
          if (!_.isElement(value)) {
            data[index][key] = value;
          }
        });
      });

      storageSet(self.name, JSON.stringify(data));
    };

    self.clientLoad = function () {
      var data = storageGet(self.name);

      try {
        return JSON.parse(data);
      } catch (e) {
        self.trigger('parseError', data, e);
        return [];
      }
    };

    // Aliases

    self.get = self.find;
    self.index = self.findIndex;
    self.search = self.filter;
    self.length = self.size;

    return self;
  }

  Collectionize.localStoragePrefix = 'Collectionize.';

  // Expose

  if (isBrowser) {
    window.Collectionize = Collectionize;
  }

  if (isNode) {
    module.exports = Collectionize;
  }

}());
