const line = require('@line/bot-sdk');
const express = require('express');
const serverless = require('serverless-http');
const app = express();
const dotenv = require('dotenv');
const dictionaryAPI = require('./controller/dictionary/api.js');

//setup .env in case that cloud service provider don't have environment variables management feature.
const env = dotenv.config().parsed;
const lineConfig = {
    channelAccessToken: env.ACCESS_TOKEN,
    channelSecret: env.SECRET_TOKEN
}
const client = new line.Client(lineConfig);

//request event from line service via webhook.
app.post('/webhook', line.middleware(lineConfig), async (req, res) =>{
    try{
        const events = req.body.events;
        return events.length > 0 ? await events.map(item => handleEvent(item)) : res.status(200).send("OK");
    } catch (error) {
        console.log(error.message);
        res.status(500).end();
    }
});

//get event and perform action to reply the information users need as a message.
const handleEvent = async (event) =>{
    //check event type if it's a text message or not.
    if(event.type !== 'message' || event.message.type !== 'text')
        replyMessage = 'Sorry, please enter any words.';
    else if (event.type === 'message'){
        try{
            replyMessage = await dictionaryAPI(event.message.text);
        }catch(error){
            //If the word from user input is not inclue in Free Dictionary API then reply the message below.
            console.log(error.message);
            replyMessage = error.message;
        }
    }

    return client.replyMessage(event.replyToken, {type: 'text', text: replyMessage});
}

module.exports.handler = serverless(app);
