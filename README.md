# Collectionize

![Build Status](https://travis-ci.org/andrewchilds/collectionize.png?branch=master)

A lightweight JS model/collection management library, built on top of Lodash.

### Installation

```js
bower install collectionize
```

```js
npm install collectionize
```

### Example Usage

```js
var Things = Collectionize('things');

Things.add({ id: 2, color: 'blue', shape: 'square' });
Things.add({ id: 3, color: 'red', shape: 'circle' });
Things.add({ id: 5, color: 'green', shape: 'polygon' });
Things.add({ id: 6, color: 'blue', shape: 'triangle' });

Things.size();
// 4

Things.search({ color: 'blue' });
// [{ id: 2, color: 'blue', shape: 'square' }, { id: 6, color: 'blue', shape: 'triangle' }]

Things.get({ color: 'blue' });
// [{ id: 2, color: 'blue', shape: 'square' }]

Things.index({ id: 3 });
// 1

Things.update({ id: 3, color: 'yellow' });
// [{ id: 3, color: 'yellow', shape: 'circle' }]
```

### Methods

#### add(obj)

Add an object to the collection.

```js
Things.add({ id: 2, color: 'blue', shape: 'square' });
// undefined
```

#### flush(), flush(newCollection)

Flush out and optionally replace the collection.

```js
Things.flush()
```

#### get

Alias for the Lodash `find` method.

#### getById(id)

Uses an ID-based index to get a single object. This can be faster than `get` for larger collections.

```js
Things.getById(123);
// { id: 123, color: 'green', shape: 'triangle' }
```

#### incr(query, property)

Increments the `property` number or sets it to zero if it doesn't exist.

```js
Things.incr({ id: 2 }, 'id');
// undefined
```

#### index

Alias for the Lodash `findIndex` method.

#### isEmpty(query)

Returns `true` if the filtered query returns empty, otherwise returns `false`.

```js
Things.isEmpty({ color: 'yellow' });
// true
```

#### length

Alias for the Lodash `size` method.

#### move(oldIndex, newIndex)

Change the order of an object in the collection.

```js
Things.move(1, 2);
```

#### remove(query)

Remove all matching elements from the collection.

```js
// Remove object with id 3
Things.remove({ id: 3 });
// Remove all squares
Things.remove({ shape: 'square' });
```

#### search

Alias for the Lodash `filter` method.

#### update(obj, property)

Updates all matching objects by property, or adds object if no matches are found.

```js
// Change color to 'red' for object with id '2'
Things.update({ id: 2, color: 'red' });
// Change all squares to color 'red'
Things.update({ shape: 'square', color: 'red' }, 'shape');
// Change all 'blue' colors to 'green'
Things.update({ color: 'green' }, { color: 'blue' });
```

#### updateById(obj)

Searches the ID index for a matching object and updates it, otherwise adds it to the collection. This can be faster than `update` for larger collections.

```js
// Change color to 'red' for object with id '2'
Things.updateById({ id: 2, color: 'red' });
```

### Lodash Methods

`at`, `each`, `every`, `filter`, `find`, `findIndex`, `findLastIndex`, `first`, `last`, `map`, `max`, `min`, `pluck`, `reduce`, `reduceRight`, `reject`, `sample`, `size`, `shuffle`, `some`, `sortBy`, `where`

Collectionize simply decorates your collection with these methods, meaning instead of `_.filter(Things, query)` you would write `Things.filter(query)`.

### Event Methods

#### `on(eventName, fn)`

#### `off(eventName)`

#### `trigger(eventName)`

### Events

#### `beforeAdd`

Decorate the object before it's added to the collection.

```js
Things.on('beforeAdd', function (thing) {
  thing.initialized = true;
});
```

#### `added`

Do something after an object has been added to the collection, such as save the new object on the server.

```js
Things.on('added', function (thing) {
  $.ajax({ url: '/thing', type: 'POST', data: thing });
});
```

#### `beforeUpdate`

Decorate the object before it's updated.

```js
Things.on('beforeUpdate', function (thing) {
  thing.initialized = true;
});
```

#### `updated`

Do something after an object has been updated, such as save the new object on the server.

```js
Things.on('updated', function (thing) {
  $.ajax({ url: '/thing/' + thing.id, type: 'PUT', data: thing });
});
```

#### `removed`

Do something after an object has been removed from the collection.

```js
Things.on('removed', function (thing) {
  $.ajax({ url: '/thing/' + thing.id, type: 'DELETE' });
});
```

### Running the Tests

```sh
yarn
yarn test
```

### License

MIT. Copyright &copy; 2017 Andrew Childs.
