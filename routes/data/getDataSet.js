const express = require('express');
const  isAnonymousAllowed = require("../data/_AnonymousAllowed");
const jsDataSet = require("./../../client/components/metadata/jsDataSet");
let DataSetPath = "./../../datasets";
const asyncHandler = require('express-async-handler'); //https://zellwk.com/blog/async-await-express/
const metaModel = require("../../client/components/metadata/MetaModel.js");
const {readFile} = require("fs/promises");

const path = require('path');

async function middleware(req,res,next){
    let ctx = req.app.locals.context;
    let tableName = req.body.tableName;
    let editType = req.body.editType;

    if (!isAnonymousAllowed(req, tableName,editType)){
        res.status(400).send("Anonymous not permitted, dataset "+tableName+" "+editType);
        return;
    }
    let /*DataSet*/ ds = await ctx.getDataInvoke.createEmptyDataSet(tableName,editType);
    res.send(JSON.stringify(ds.serialize(true)));
}


let router = express.Router();
router.post('/getDataSet', asyncHandler(middleware));


module.exports= router;
