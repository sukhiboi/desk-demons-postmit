const { extractInitials } = require('./../lib/helperFunctions');
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
});
