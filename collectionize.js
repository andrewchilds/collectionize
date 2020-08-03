(function () {

  var LODASH_METHODS = [
    'at', 'every', 'filter', 'find', 'findIndex',
    'findLastIndex', 'head', 'last', 'map', 'max', 'min',
    'maxBy', 'minBy', 'reduce', 'reduceRight', 'reject',
    'sample', 'size', 'shuffle', 'some', 'sortBy'
  ];

  let windowExport = false;
  function safeRequire(varName, moduleName) {
    // attempt to find module, either on the window of a browser or by requiring it via node/webpack
    if (typeof window !== 'undefined' && window[varName]) {
      windowExport = true;
      return window[varName];
    } else {
      return require(moduleName);
    }
  }

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
  }

  function Collectionize(name, self) {
    self = self || {};

    self.db = [];
    self.listeners = [];
    self.name = name; // Used for localStorage property naming.
    self.idIndex = {};

    nativeEach(LODASH_METHODS, function (methodName) {
      self[methodName] = function () {
        var args = _.toArray(arguments);
        args.unshift(self.db);
        return _[methodName].apply(this, args);
      };
    });

    self.first = self.head;

    self.on = function (eventNames, fn) {
      nativeEach(eventNames.split(' '), function (eventName) {
        self.listeners.push({ name: eventName, fn: fn });
      });
    };

    self.uniqueOn = function (eventNames, fn) {
      var namespace = _.uniqueId();
      var namespacedEventNames = eventNames.split(' ').map(function (eventName) {
        return eventName + '.' + namespace;
      }).join(' ');

      self.on(namespacedEventNames, fn);

      return namespace;
    };

    self.trigger = function () {
      var args = _.toArray(arguments);
      var eventName = args.shift();
      nativeEach(self.listeners, function (listener) {
        if (listener.name === eventName || listener.name.indexOf(eventName + '.') === 0) {
          listener.fn.apply(this, args);
        }
      });
    };

    self.off = function (eventName) {
      _.remove(self.listeners, function (listener) {
        return listener.name === eventName || listener.name.indexOf(eventName + '.') === 0;
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
      arrayMove(self.db, oldIndex, newIndex);
      self.trigger('moved');
    };

    self.add = function (obj) {
      self.trigger('beforeAdd', obj);
      self.db[self.db.length] = obj;
      _addToIndex(obj);
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
          _update(match, obj, output);
        });
      } else {
        output[output.length] = self.add(obj);
      }

      return output;
    };

    function _update(match, obj, output) {
      _.extend(match, obj);
      self.trigger('beforeUpdate', match);
      if (output) {
        output[output.length] = match;
      }
      _addToIndex(match);
      self.trigger('updated', match);
    }

    function _addToIndex(obj) {
      if (obj && obj.id) {
        self.idIndex[obj.id + ''] = obj;
      }
    }

    function _removeFromIndex(obj) {
      if (obj && obj.id) {
        self.idIndex[obj.id + ''] = null;
      }
    }

    function _resetIndex() {
      nativeEach(self.idIndex, function (v, k) {
        self.idIndex[k] = null;
      });
      self.each(function (obj) {
        _addToIndex(obj);
      });
    }

    self.getById = function (id) {
      return self.idIndex[id + ''];
    };

    self.updateById = function (obj) {
      if (!obj.id) {
        return self.update(obj);
      }

      var existing = self.getById(obj.id);
      if (existing) {
        _update(existing, obj);
      } else {
        self.add(obj);
      }
    };

    self.remove = function (query) {
      var removed = _.remove(self.db, query);
      nativeEach(removed, function (obj) {
        _removeFromIndex(obj);
        self.trigger('removed', obj);
      });
    };

    self.flush = function (db) {
      self.trigger('beforeFlush');
      self.db = db || [];
      _resetIndex();
      self.trigger('flushed');
    };

    self.all = function () {
      return self.db;
    };

    // Aliases

    self.get = self.find;
    self.index = self.findIndex;
    self.search = self.filter;
    self.length = self.size;

    return self;
  }

  // Expose
  if (windowExport) {
    window.Collectionize = Collectionize;
  } else {
    module.exports = Collectionize;
  }

}());
