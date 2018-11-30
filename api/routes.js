const express = require("express");
const router = express.Router();
const dns = require("dns");
const dnsPromises = dns.promises;
const UrlModel = require("./urlModel");
const mongoose = require("mongoose");

//Post new url to be shortened
router.post("/new", async (req, res) => {
  let url = req.body.url;
  try {
    //1.Check the url with a regExp
    const urlTestRegExp = new RegExp(
      /^((http|https):\/\/)?(www\.)?[a-zA-Z0-9\-\.]+\.[a-z]+(\/[a-zA-Z0-9\-_\.]+)*\/?$/
    );
    if (!urlTestRegExp.test(url)) {
      throw new Error("invalid Url");
    }

    //2.Check the domain with dns.lookup
    const domain = url.replace(/^((http|https):\/\/)/, "").split("/")[0];
    const dnsResponse = await dnsPromises.lookup(domain);
  
    //3 Check to see if we already have it in the DB
    if(!(/^((http|https):\/\/)/).test(url)){
       url = 'https://' + url;
    }
    
    const isAlreadyRegistered = await UrlModel.findOne({ original_url: url });
    
        
    
    
    //if is allready in the db return data to client
    if (isAlreadyRegistered) {
      return res.status(200).json({
        original_url: isAlreadyRegistered.original_url,
        short_url: isAlreadyRegistered.short_url
      });
    }

    //4.Create a new entry in the DB for it
    //Get the number of documents in the collection
    const nShortnedUrls = await UrlModel.countDocuments();
    //Create the new model    
    const newDbEntry = new UrlModel({
      original_url: url,
      short_url: nShortnedUrls + 1
    });
    //Save it to the DB
    const dbResponse = await newDbEntry.save();

    //5.Return it to the user
    res.status(200).json({
      original_url: dbResponse.original_url,
      short_url: dbResponse.short_url
    });
  } catch (err) {
    res.status(400).json({ message: err.message});
  }
});

//Redirect to the original link
router.get("/:short_url", async (req, res) => {
  const short_url = req.params.short_url;
  
  try {
    //try to fetch it from the Db
    const dbResponse = await UrlModel.findOne({ short_url: short_url }).exec();
    //No data for this specific input.
    if (!dbResponse) {
      return res
        .status(404)
        .json({ error: "No short url found for given input." });
    }
    //Redirect user
    res.redirect(dbResponse.original_url)
    res.end();
  } catch (err) {
    res
      .status(500)
      .json({ error: "Some error occured, please try again later!" });
  }
});

module.exports = router;
