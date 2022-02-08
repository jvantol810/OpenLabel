const express = require('express');
const { JSDOM } = require('jsdom');
const fetch = require('node-fetch');
const Sentiment = require('sentiment');
const sentiment = new Sentiment();
const mysql = require('mysql');
const fetchnews = require('./fetchnews.js');
const { getLabel } = require('./fetchNews.js');
const { JavascriptModulesPlugin } = require('webpack');

let url_map = new Map();

let app = express();
//Open the local webserver
app.listen(3000);

app.get("/label/*", async (req, res) => {
	try {
        let url = req.url.substring(req.url.indexOf("/label/") + 7);
        console.log(url);
        
        
        let label_promise = url_map.get(url);
        if (!label_promise){
            console.log("Not found in hashmap, creating promise.")
            label_promise = getLabel(url);
            url_map.set(url, label_promise);
        }
        
        res.type('application/json');
        res.status(200);
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.send(JSON.stringify(await label_promise));
    } finally {
	    res.end();
    }
});


