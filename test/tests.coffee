describe 'Collectionize', ->
  Things = Collectionize('Color')

  beforeEach ->
    Things.flush()

  describe 'we try to get a non-existing object', ->
    it 'should return undefined', ->
      expect(Things.get({ id: 999 })).toBe undefined

  describe 'we try to get the index of a non-existing object', ->
    it 'should return -1', ->
      expect(Things.index({ id: 999 })).toBe -1

  describe 'we add some objects', ->
    beforeEach ->
      Things.add({ id: 2, color: 'blue', shape: 'square' });
      Things.add({ id: 3, color: 'red', shape: 'circle' });
      Things.add({ id: 5, color: 'green', shape: 'polygon' });
      Things.add({ id: 6, color: 'blue', shape: 'triangle' });

    it 'should have stored those objects in the DB array', ->
      expect(Things.size()).toBe 4

    it 'should make those objects searchable by property', ->
      expect(Things.get({ id: 3 }).color).toBe 'red'

    it 'should tell us when a search is empty', ->
      expect(Things.isEmpty({ foo: true })).toBe true

    describe 'we try to remove multiple existing objects', ->
      beforeEach ->
        Things.remove({ color: 'blue' })

      it 'should no longer find that object', ->
        expect(Things.get({ color: 'blue' })).toBe undefined

      it 'should decrease the DB array length', ->
        expect(Things.size()).toBe 2

    describe 'we try to remove an existing object', ->
      beforeEach ->
        Things.remove({ color: 'green' })

      it 'should no longer find that object', ->
        expect(Things.get({ color: 'green' })).toBe undefined

      it 'should decrease the DB array length', ->
        expect(Things.size()).toBe 3

    describe 'we try to remove an object that does not exist', ->
      beforeEach ->
        Things.remove({ color: 'orange' })

      it 'should do nothing', ->
        expect(Things.size()).toBe 4

    describe 'we try to increment an existing property', ->
      beforeEach ->
        Things.incr({ color: 'blue' }, 'id')

      it 'should increment the property of the matching objects', ->
        expect(_.pluck(Things.filter({ color: 'blue' }), 'id')).toEqual [3, 7]

    describe 'we try to increment a non-existing property', ->
      beforeEach ->
        Things.incr({ color: 'blue' }, 'counter')

      it 'should increment the property of the matching objects', ->
        expect(Things.get({ id: 2 }).counter).toBe 0
        expect(Things.get({ id: 3 }).counter).toBe undefined
        expect(Things.get({ id: 6 }).counter).toBe 0

    describe 'we try to rearrange the order of existing objects', ->
      beforeEach ->
        Things.move(1, 3)

      it 'should be able to rearrange the order of existing objects', ->
        expect(Things.index({ id: 2 })).toBe 0
        expect(Things.index({ id: 5 })).toBe 1
        expect(Things.index({ id: 6 })).toBe 2
        expect(Things.index({ id: 3 })).toBe 3

    describe 'we try to update multiple existing objects', ->
      beforeEach ->
        Things.update({ shape: 'pentagon' }, { color: 'blue' })

      it 'should update the object', ->
        expect(Things.get({ id: 2 })).toEqual { id: 2, color: 'blue', shape: 'pentagon' }
        expect(Things.get({ id: 6 })).toEqual { id: 6, color: 'blue', shape: 'pentagon' }

    describe 'we try to update a single existing object', ->
      beforeEach ->
        Things.update({ id: 2, color: 'yellow' })

      it 'should update the object', ->
        expect(Things.get({ id: 2 })).toEqual { id: 2, color: 'yellow', shape: 'square' }

    describe 'we try to update a non-existing object', ->
      beforeEach ->
        Things.update({ id: 9, color: 'purple', shape: 'square' });

      it 'should add the object to the end of the array', ->
        expect(Things.size()).toBe 5
        expect(Things.at(4)[0].id).toBe 9

    describe 'we save to localStorage', ->
      original = null

      beforeEach ->
        Things.clientSave()
        original = Things.db

      describe 'we flush the database', ->
        beforeEach ->
          Things.flush()

        it 'should no longer exist', ->
          expect(Things.size()).toBe 0

        describe 'we load from localStorage', ->
          beforeEach ->
            copy = Things.clientLoad()
            Things.flush(copy)

          it 'should match the old version of itself', ->
            expect(Things.size()).toBe 4
            expect(Things.db).toEqual original

  describe 'we listen to multiple events', ->
    events = []
    obj = { id: 1, a: 1, b: 2}

    beforeEach ->
      Things.on 'added flushed', ->
        events.push('added or flushed')

    it 'should trigger those events', ->
      Things.flush([])
      Things.add(obj)
      expect(events.length).toBe 2
      expect(events[0]).toBe 'added or flushed'
      expect(events[1]).toBe 'added or flushed'

  describe 'we listen to add events', ->
    events = []
    obj = { id: 1, a: 1, b: 2}

    beforeEach ->
      Things.on 'beforeAdd', ->
        events.push({ name: 'beforeAdd', args: arguments })
      Things.on 'added', ->
        events.push({ name: 'added', args: arguments })

    it 'should trigger those events', ->
      Things.add(obj)
      expect(events.length).toBe 2
      expect(events[0].name).toBe 'beforeAdd'
      expect(events[1].name).toBe 'added'

  describe 'we listen to update events', ->
    events = []
    obj = { id: 1, a: 1, b: 2}

    beforeEach ->
      Things.add(obj)
      Things.on 'beforeUpdate', ->
        events.push({ name: 'beforeUpdate', args: arguments })
      Things.on 'updated', ->
        events.push({ name: 'updated', args: arguments })

    it 'should trigger those events', ->
      Things.update(obj)
      expect(events.length).toBe 2
      expect(events[0].name).toBe 'beforeUpdate'
      expect(events[1].name).toBe 'updated'

  describe 'we listen to remove events', ->
    events = []
    obj = { id: 1, a: 1, b: 2}

    beforeEach ->
      Things.add(obj)
      Things.on 'removed', ->
        events.push({ name: 'removed', args: arguments })

    it 'should trigger that event', ->
      Things.remove({ id: 1 })
      Things.remove({ id: 2 })
      expect(events.length).toBe 1
      expect(events[0].name).toBe 'removed'

    describe 'we remove the event listener', ->
      beforeEach ->
        Things.off('removed')

      it 'should not trigger that event', ->
        Things.add(obj)
        Things.remove({ id: 1 })
        expect(events.length).toBe 1
