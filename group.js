const freecycle = require('./index')

function Group (groupName) {
  this.name = groupName
  this.getPosts = (cb, opts) => {
    return freecycle.getPosts(this.name, cb, opts)
  }
  this.getPostByURL = freecycle.getPostByURL
  this.getPostById = (postId, cb) => freecycle.getPostById(this.name, postId, cb)
}

module.exports = Group
