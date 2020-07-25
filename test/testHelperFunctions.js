const { extractInitials, parseTimeStamp } = require('./../lib/helperFunctions');
const { assert } = require('chai');

describe('#Helper Functions', () => {
  describe('extractInitials()', () => {
    it('should extract the initials when name is 1 word long', () => {
      assert.equal(extractInitials('john'), 'J');
    });
    it('should extract the initials when name is 2 word long', () => {
      assert.equal(extractInitials('john samuel'), 'JS');
    });
    it('should extract the initials when name is more than 2 word long', () => {
      assert.equal(extractInitials('john samuel brad'), 'JS');
    });
  });

  describe('parseTimeStamp()', () => {
    it('it should give a few seconds ago for current time', () => {
      assert.strictEqual(parseTimeStamp(new Date()), 'a few seconds ago');
    });
    it('it should give formatted date for date before/after 24hrs', () => {
      const timestamp = new Date('2020-07-24');
      assert.strictEqual(parseTimeStamp(timestamp), 'Jul 24, 2020');
    });
  });
});
