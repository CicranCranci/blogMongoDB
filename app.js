const port = 3000;
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require('lodash');
const { MongoClient, ObjectId } = require('mongodb');
 // Import the MongoDB driver


const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// MongoDB Atlas connection string
const uri = 'mongodb+srv://CicranCranci:Spike2005.@atlascluster.kqyouqs.mongodb.net/';
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

let posts = []; // Initialize posts array (temporarily stores in-memory data)

const homeStartingContent = "Your home page content goes here.";
const aboutContent = "Your about page content goes here.";
const contactContent = "Your contact page content goes here.";


// Function to connect to MongoDB Atlas
async function connectToDB() {
    try {
        await client.connect();
        console.log('Connected to MongoDB Atlas');
        const db = client.db('blog_posts'); // Replace 'your_database_name' with the actual database name you created in MongoDB Atlas
        posts = db.collection('posts'); // Replace 'your_collection_name' with the actual collection name you created in MongoDB Atlas
    } catch (error) {
        console.error('Error connecting to MongoDB Atlas:', error);
    }
}

// Call the function to connect to the database
connectToDB();

// Existing route - Home page
app.get('/', async (req, res) => {
    try {
        const allPosts = await posts.find().toArray();
        res.render('home', { homeStartingContent, posts: allPosts });
    } catch (error) {
        console.error('Error retrieving posts from MongoDB:', error);
        res.status(500).send('Internal Server Error');
    }
});


// Existing route - About page
app.get('/about', (req, res) => {
    res.render('about', { aboutContent });
});

// Existing route - Contact page
app.get('/contact', (req, res) => {
    res.render('contact', { contactContent });
});

// Existing route - Compose page (GET)
app.get('/compose', (req, res) => {
    res.render('compose');
});

// Existing route - Compose page (POST)
app.post('/compose', async (req, res) => {
    try {
        const composeTitle = req.body.composeTitle;
        const composeContent = req.body.composeContent;
        await posts.insertOne({ composeTitle, composeContent });
        res.redirect('/');
    } catch (error) {
        console.error('Error creating a new post:', error);
        res.status(500).send('Internal Server Error');
    }
});



// Existing route - View a single post
app.get('/posts/:postId', async (req, res) => {
    const postId = req.params.postId.toLowerCase();

    try {
        const foundPost = await posts.findOne({ _id: new ObjectId(postId) });

        if (foundPost) {
            res.render('post', { post: foundPost });
        } else {
            res.send('No match found');
        }
    } catch (error) {
        console.error('Error retrieving post from MongoDB:', error);
        res.status(500).send('Internal Server Error');
    }
});



// Close MongoDB connection on app termination
process.on('SIGINT', async () => {
    try {
        await client.close();
        console.log('MongoDB connection closed.');
        process.exit(0);
    } catch (error) {
        console.error('Error closing MongoDB connection:', error);
        process.exit(1);
    }
});

// Start the server
app.listen(process.env.PORT || 3000, () => {
    console.log('Server is running on port', port);
});
