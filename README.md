# researchal-api-comments
Full CRUD for comments with a foreign key-like relationship with posts and users

comment = {
    uid: id of the comment,
    postid: id of post,
    createdAt: new Date(),
    text: ""
}