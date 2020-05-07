const express = require('express');
const Posts = require('../data/db.js');
const router = express.Router();

router.get("/", (req, res) => {
    Posts.find(req.query)
        .then(posts => {
            res.status(200).json(posts);
        })
        .catch(error => {
            console.log(error);
            res.status(500).json({
                message: "The posts information could not be retrieved.",
            });
        });
});

router.get("/:id", (req, res) => {
    const id = req.params.id;

    Posts.findById(id)
        .then(([post]) => {
            if (post) {
                res.status(201)
                    .json(post)
            } else {
                res.status(404)
                    .json({ message: "The post with the specified ID does not exist." })
            }
        })
        .catch(error => {
            res.status(500)
                .json({ error: "The post information could not be retrieved." })
        })
})

router.get("/:id/comments", (req, res) => {
    const id = req.params.id;

    Posts.findPostComments(id)
        .then(([comments]) => {
            if (comments) {
                res.status(200)
                    .json(comments)
            } else {
                res.status(404)
                    .json({ message: "The post with the specified ID does not exist." })
            }
        })
        .catch(error => {
            res.status(500)
                .json({ error: "The comments information could not be retrieved." })
        })

})

router.post('/', (req, res) => {
    const { title, contents } = req.body

    if (!title || !contents) {
        res.status(400)
            .json({ errorMessage: "Please provide title and contents for the post." })
    }
    Posts.insert({ title, contents })
        .then(({ id }) => {
            Posts.findById(id)
                .then(([posts]) => {
                    res.status(201)
                        .json(posts)
                })
                .catch(error => {
                    console.log(error)
                    res.status(500)
                        .json({ error: "There was an error while saving the post to the database" })
                })
        })
})

router.post('/:id/comments', (req, res) => {

    const { text } = req.body;
    const id = req.params.id;

    if (!text) {
        res.status(400)
            .json({ errorMessage: "Please provide text for the comment." })
    } else {
        Posts.findById(id)
            .then(post => {
                post[0] ? Posts.insertComment({ ...req.body, post_id: id })
                    .then(comment => {
                        res.status(201)
                            .json({ message: "Comment created" })
                    })
                    .catch(err => {
                        console.log(err.message)
                        res.status(500)
                            .json({ message: "Could not add comment." })
                    }) :
                    res.status(404)
                        .json({ message: "The post with the specified ID does not exist." })
            })

            .catch(err => {

                res.status(500)
                    .json({ error: "There was an error while saving the comment to the database" })
            })
    }
})

router.delete('/:id', (req, res) => {

    Posts.remove(req.params.id)
        .then((id) => {
            if (!id) {
                res.status(404)
                    .json({ message: "The post with the specified ID does not exist." })
            } else {
                res.status(200)
                    .json({ message: "Post deleted" })
            }
        })
        .catch(error => {
            res.status(500)
                .json({ error: "The post could not be removed" })
        })

})

router.put('/:id/', (req,res) => {

    const id = req.params.id;
    const { title, contents } = req.body;

    Posts.findById(id)
    .then(([post]) => {
        if(post){
            if(!title || !contents){
                res.status(400)
                .json({errorMessage: "Please provide title and contents for the post."})
            }else {
                Posts.update(id, {title, contents})
                .then( updatedPost => {
                    res.status(200)
                    .json(updatedPost)
                })
                .catch(error => {
                    res.status(500)
                    .json({ error: "The post information could not be modified." })
                })
            }
        } else {
            res.status(404)
            .json({ message: "The post with the specified ID does not exist."})
        }
    })
})




module.exports = router;