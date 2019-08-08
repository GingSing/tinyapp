const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail(testUsers, "user@example.com")
    const expectedOutput = "userRandomID";
    // Write your assert statement here
    assert.strictEqual(user.id, expectedOutput, "IDs are equal.");
  });

  it('should return undefined if email does not exist', function() {
    const user = getUserByEmail(testUsers, "user3@example.com");
    const expectedOutput = undefined;
    assert.strictEqual(user, expectedOutput, "Undefined has been returned.");
  });
});
