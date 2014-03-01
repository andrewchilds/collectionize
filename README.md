# Collectionize

![Build Status](https://travis-ci.org/andrewchilds/collectionize.png?branch=master)

A lightweight collection management library. Requires Lodash.

### Install

```js
bower install collectionize
```

```js
npm install collectionize
```

### Usage

```js
var Things = Collectionize('things');

Things.add({ id: 2, color: 'blue', shape: 'square' });
Things.add({ id: 3, color: 'red', shape: 'circle' });
Things.add({ id: 5, color: 'green', shape: 'polygon' });
Things.add({ id: 6, color: 'blue', shape: 'triangle' });

Things.size()
// 4

Things.get({ color: 'blue' })
// [{ id: 2, color: 'blue', shape: 'square' }, { id: 6, color: 'blue', shape: 'triangle' }]

Things.search({ color: 'blue' })
// [{ id: 2, color: 'blue', shape: 'square' }]

Things.index({ id: 3 })
// 1

Things.update({ id: 3, color: 'yellow' });
// [{ id: 3, color: 'yellow', shape: 'circle' }]
```

### Methods

Lodash Methods included:

`at`, `each`, `every`, `filter`, `find`, `findIndex`, `findLastIndex`, `first`, `last`, `map`, `max`, `min`, `pluck`, `reduce`, `reduceRight`, `reject`, `sample`, `size`, `shuffle`, `some`, `sortBy`, `where`

Collectionize simply decorates your collection with these methods, meaning instead of `_.filter(Things, query)` you would write `Things.filter(query)`.

#### `Things.isEmpty(query)`

Returns `true` if the filtered query returns empty, otherwise returns `false`.

```js
Things.isEmpty({ color: 'yellow' });
// true
```

#### `Things.incr(query, property)`

Increments the `property` number or sets it to zero if it doesn't exist.

```js
Things.incr({ id: 2 }, 'id');
// undefined
```

#### `Things.move(oldIndex, newIndex)`

Change the order of an object in the collection.

```js
Things.move(1, 2);
```

### Running the Tests

First install bower and npm dependencies:

```sh
npm install
bower install
```

```sh
npm test
```

### License

MIT. Copyright &copy; 2014 Andrew Childs.
