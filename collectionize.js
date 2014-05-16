(function () {

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

  function Collectionize(name) {
    var self = {
      db: [],
      listeners: [],
      name: name // used for localStorage property naming
    };

    var lodashMethods = ['at', 'each', 'every', 'filter', 'find', 'findIndex',
      'findLastIndex', 'first', 'last', 'map', 'max', 'min', 'pluck', 'reduce',
      'reduceRight', 'reject', 'sample', 'size', 'shuffle', 'some', 'sortBy', 'where'];

    _.each(lodashMethods, function (fn) {
      self[fn] = function () {
        var args = _.toArray(arguments);
        args.unshift(self.db);
        return _[fn].apply(this, args);
      };
    });

    self.on = function (eventName, fn) {
      self.listeners.push({ name: eventName, fn: fn });
    };

    self.trigger = function () {
      var args = _.toArray(arguments);
      var eventName = args.shift();
      _.each(self.listeners, function (listener) {
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

    self.isEmpty = function (query) {
      return self.filter(query).length === 0;
    };

    self.incr = function (query, prop) {
      var matches = self.filter(query);
      _.each(matches, function (obj) {
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
        self.trigger('beforeUpdate', obj);
        _.each(matches, function (match) {
          _.extend(match, obj);
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
      _.each(removed, function (obj) {
        self.trigger('removed', obj);
      });
    };

    self.flush = function (db) {
      self.db = db || [];
    };

    self.all = function () {
      return self.db;
    };

    self.clientSave = function () {
      var data = [];
      self.each(function (item, index) {
        data[index] = {};
        _.each(item, function (value, key) {
          if (_.isFunction(value)) {
            value = '(' + value + ');';
          }
          // Drop DOM elements, since they don't work with JSON.stringify.
          if (!_.isElement(value)) {
            data[index][key] = value;
          }
        });
      });

      window.localStorage.setItem('Collectionize.' + self.name, JSON.stringify(data));
    };

    self.clientLoad = function () {
      var data = window.localStorage.getItem('Collectionize.' + self.name);
      try {
        return JSON.parse(data);
      } catch (e) {
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

  // Expose

  window.Collectionize = Collectionize;

}());
