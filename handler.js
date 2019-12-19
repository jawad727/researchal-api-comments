'use strict';
const AWS = require('aws-sdk')
const db = new AWS.DynamoDB.DocumentClient({ apiVersion: "2012-08-10"})
const uuid = require("uuid/v4")


const commentsTable = process.env.COMMENTS_TABLE

// Sort function

function sortByDate(a, b){
  if (a.createdAt > b.createdAt){
    return -1
  } else return 1
}

// Create a response

function response(statusCode, message) {
  return {
    statusCode: statusCode,
    body: JSON.stringify(message),
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    }
  }
}

module.exports.postComment = (event, context, callback) => {
  const reqBody = JSON.parse(event.body)

  const post = {
    uid: uuid(),
    postid: reqBody.postid,
    createdAt: new Date().toISOString(),
    text: reqBody.text,
    username: reqBody.username
  }

  return db.put({
    TableName: commentsTable,
    Item: post
  }).promise().then(() => {
    callback(null, response(200, post))
  })
  .catch(err => response(null, response(err.statusCode, err)));
}

// Get all posts
module.exports.getAllComments = (event, context, callback) => {
  return db.scan({
    TableName: commentsTable
  }).promise()
  .then(res => {
    callback(null, response(201, res.Items.sort(sortByDate)))
  }).catch(err => callback(null, response(err.statusCode, err)))
} 

// Get post comments

module.exports.getPostComments = (event, context, callback) => {
  const postid = event.pathParameters.postid;

  const params = {
    
    ExpressionAttributeNames: {
      "#postid": "postid"
    },
    ExpressionAttributeValues: {
      ":postid": postid
    },
    FilterExpression: "#postid = :postid",
    TableName: commentsTable
  }

  return db.scan(params)
  .promise()
  .then(res => {
    callback(null, response(200, res.Items.sort(sortByDate)))
  }).catch(err => callback(null, response(err.statusCode, err)))
  
}