const { assert } = require('chai');

const {generateRandomString, emailLookup, filterUrlByUser} = require('../helpers.js');

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
  it('should return true with a valid email', function() {
    const userExists = emailLookup("user@example.com", testUsers)
    // Write your assert statement here
    assert.isTrue(userExists);
  });

  it('should return false for an invalid email', function() {
    const userExists = emailLookup("non-user@example.com", testUsers)
    // Write your assert statement here
    assert.isFalse(userExists);
  });
});