const freecycle = require('./index')

function Group (groupName) {
  this.name = groupName
  this.getPosts = (cb, type = freecycle.TYPE.offer) => {
    return freecycle.getPosts(this.name, cb, type)
  }
  this.getPostByURL = freecycle.getPostByURL
  this.getPostById = (postId, cb) => freecycle.getPostById(this.name, postId, cb)
}

module.exports = Group
