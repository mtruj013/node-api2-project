const express = require('express');
const Posts = require('../data/db.js');
const router = express.Router();

router.get("/", (req,res) => {
    Posts.find(req.query)
    .then(posts => {
        res.status(200).json(posts);
    })
    .catch(error => {
        console.log(error);
        res.status(500).json({
            message: "Error retrieving posts",
        });
    });
});

router.post('/', (req,res) => {
    const {title, contents} = req.body

    if(!title || !contents){
        res.status(400)
        .json({errorMessage: "Please provide title and contents for the post."})
    }
    Posts.insert({ title , contents})
    .then(({id}) => {
        Posts.findById(id)
        .then(([posts])=> {
            res.status(201)
            .json(posts)
        })
        .catch(error => {
            console.log(error)
            res.status(500)
            .json({error: "There was an error while saving the post to the database"})
        })
    })
})

router.post('/:id/comments', (req,res) => {
    
    const {text} = req.body;
    const id = req.params.id;

    if(!text){
        res.status(400)
        .json({errorMessage: "Please provide text for the comment."})
    } else {
        Posts.findById(id)
        .then(post => {
            post[0] ? Posts.insertComment({...req.body, post_id: id}) 
            .then(comment => {
                res.status(201)
                .json({message: "Comment created"})
            })
            .catch(err => {
                console.log(err.message)
                res.status(500)
                .json({message: "Could not add comment."})
            }) :
            res.status(404)
            .json({message: "The post with the specified ID does not exist."})
        })
        
        .catch(err => {
            
            res.status(500)
            .json({ error: "There was an error while saving the comment to the database" })
        })
    }
    


    
})



module.exports = router;