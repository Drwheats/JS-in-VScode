var express = require("express");
// server is 3001 for local, 4k for vercel.
const PORT = process.env.PORT || 4000;
const fs = require("fs");
const pathToJSON = './theatreJSON.json'

const theatreInfo = require(pathToJSON);


var cors = require('cors')
var app = express();

// Rate Limiter Below. Needs to be tweaked and must be turned off for testing, and searchbar is broken ofc.

// For PROD : Set proper limiter values, remove refresh le app from searchbar.

app.use(
    cors({
      allowedHeaders: ["authorization", "Content-Type"], // you can change the headers
      exposedHeaders: ["authorization"], // you can change the headers
      origin: "*",
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
      preflightContinue: false
    })
);


// receive the highscores from the server
app.post("/hellofuggomayihaveyourtheatrespliasixd", (req, res) => {
    console.log("This function is being called so you are GETting my API");
  let meme = req.body;
    console.log(meme);
  res.json(theatreInfo);
  });

app.get("/images", (req, res) => {
  let imageToSend = pathToImages
  res.sendFile(imageToSend)
})

// request the main page of topics from the server
app.post("/postNumber/", (req, res) => {
  // let onPage = req.body.postPage;
  // onPage = onPage*10;
  // let pageReturned = (highScores.slice(onPage, onPage+9))
  // console.log(pageReturned);
  res.json(highScores);
});

// request a page of posts, including replies, from the server
app.post('/pageInfo', function (req, res) {
  // const highScores = require(pathToJSON);
  let checkPost = req.body;
  checkPost = checkPost.pageLoc;
  checkPost = Number(checkPost);
  for (let i = 0; i < highScores.length; i++) {
    if (highScores[i].postNumber === checkPost) {
      console.log("success")
      res.json(highScores[i]);
    }
  }
})
// Takes the reply from the server, checks list of posts, adds the reply to the post with correct pageloc. sends the post to top of list if bumped.
app.post('/submitReply', function (req, res) {
  let checkPost = req.body;
  let ip_address = req.socket.remoteAddress;
  console.log(checkPost)
  if (checkPost.replyBody.length < 2000) {
    for (var i = 0; i < highScores.length; i++) {
      if (highScores[i].postNumber === Number(req.body.pageLoc)) {
        lastPostNumber += 1;

        //date here
        let timePosted = new Date();

        checkPost.postTime = timePosted;
        checkPost.postNumber = lastPostNumber;
        checkPost.ip = ip_address;
        highScores[i].postReplies.push(checkPost);
        console.log("success")
        console.log(highScores[i].postReplies)
        let temp = highScores[i];
        highScores.splice(i, 1)
        highScores.unshift(temp)
        res.json(highScores[i].postReplies);
      }
    }
    fs.writeFile(pathToJSON, JSON.stringify(highScores), err => {
      if (err) {
        console.log('Error', err)
      } else {
        console.log('Post has been logged.')
      }
    })
  }
  else {      res.json("Post too long - Try again!");
  }

})

// submit a post topic to the server
app.post('/submit', function (req, res) {
  let newScore = req.body;
  let ip_address = req.socket.remoteAddress;
  console.log(ip_address)
  lastPostNumber += 1;

  //date here
  let timePosted = new Date();
  newScore["timePosted"] = timePosted;
  newScore["userIP"] = ip_address;
  newScore["postNumber"] = lastPostNumber;
  newScore["postReplies"] = [];
  highScores.unshift(newScore);
  if (highScores.length > 3000){
    highScores.pop();
  }
  console.log(newScore);
  fs.writeFile(pathToJSON, JSON.stringify(highScores), err => {
    if (err) {
        console.log('Error', err)
    } else {
        console.log('Post has been logged.')
      res.send("Post has been Logged!")

    }
})
})

// delete either a post or a reply. works with both.
app.post('/delete', function (req, res) {
  let checkPost = req.body;
      console.log(req.socket.remoteAddress + " is requesting to delete post number " + checkPost.motherPost + " which was written by the IP : " + req.ip)

  if (checkPost.isReply){
    for (let i = 0; i < highScores.length; i++) {
      if (highScores[i].postNumber === Number(req.body.motherPost)) {
        for (let j =0; j < highScores[i].postReplies.length; j++) {
          if (highScores[i].postReplies[j].postNumber === Number(req.body.postNumber)){
            console.log(req.socket.remoteAddress + " ______ " + highScores[i].userIP)
            console.log(highScores[i].postReplies[j] + "has been deleted.");
            highScores[i].postReplies.splice(j, 1);
          }
        }
      }}
    fs.writeFile(pathToJSON, JSON.stringify(highScores), err => {
      if (err) {
        console.log('Error', err)
      } else {
        console.log('Post has been deleted.')
      }
    })
  }
  else console.log('auth issue.')
      if (!checkPost.isReply) {
        for (let i = 0; i < highScores.length; i++) {
          if (highScores[i].postNumber === Number(req.body.postNumber)) {
            highScores.splice(i, 1);
          }}
        fs.writeFile(pathToJSON, JSON.stringify(highScores), err => {
          if (err) {
            console.log('Error', err)
          } else {
            console.log('Post has been logged.')
            res.send('Post has been logged!')
          }
        })
      }

          }
  )

  app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
  });