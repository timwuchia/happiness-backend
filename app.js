const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const openai = require('./config/openaiConfig');
// const cors = require('cors');
const axios = require('axios');

// app.use(cors({
//     origin: process.env.WEBSITE
// }))

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, GET");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    next();
})
//Initialize middleware
app.use(express.json({extended: false}));
app.use(bodyParser.urlencoded({extended: true}));

app.get('/', async (req, res) => {
    res.send('home page')
})

app.post('/api/generate-response', async (req, res) => {
    const { word, feeling, personality } = req.body;
    const description = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: [
            {
                role: 'user',
                content: `Come up with a YouTube search query given the user's ${feeling}, ${personality} and their chosen ${word}`
            }
        ],
        max_tokens: 30
    })
    const youtubePlayList = await axios.get(
        `https://www.googleapis.com/youtube/v3/search?q=${description.data.choices[0].message.content}&key=${process.env.YOUTUBE_API_KEY}&type=video&part=snippet`
    )
    res.json({
        youtube: youtubePlayList.data
    })
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
})