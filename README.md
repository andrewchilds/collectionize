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

#### isEmpty(query)

Returns `true` if the filtered query returns empty, otherwise returns `false`.

```js
Things.isEmpty({ color: 'yellow' });
// true
```

#### incr(query, property)

Increments the `property` number or sets it to zero if it doesn't exist.

```js
Things.incr({ id: 2 }, 'id');
// undefined
```

#### move(oldIndex, newIndex)

Change the order of an object in the collection.

```js
Things.move(1, 2);
```

#### add(obj)

Add an object to the collection.

```js
Things.add({ id: 2, color: 'blue', shape: 'square' });
// undefined
```

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

#### remove(query)

Remove all matching elements from the collection.

```js
// Remove all squares
Things.remove({ shape: 'square' });
```

#### remove(query)

Remove all matching elements from the collection.

```js
// Remove object with id 3
Things.remove({ id: 3 });
// Remove all squares
Things.remove({ shape: 'square' });
```

#### flush()
#### flush(newCollection)

Flush out or replace the collection.

```js
Things.flush()
```

#### clientSave()

Save the collection to localStorage. Assumes localStorage exists, meaning there is no bundled polyfill. If the collection includes DOM elements, those are dropped, and functions are converted to strings.

```js
Things.clientSave()
```

#### clientLoad()

Load the collection from localStorage. Assumes localStorage exists, meaning there is no bundled polyfill.

```js
Things.clientSave()
Things.flush()
Things.db = Things.clientLoad()
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
