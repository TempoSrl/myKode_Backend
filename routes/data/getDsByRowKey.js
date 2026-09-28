const isAnonymousAllowed = require("../data/_AnonymousAllowed");
const express = require("express");
const asyncHandler = require("express-async-handler");
const q = require("./../../client/components/metadata/jsDataQuery");
const GetData = require("../../src/jsGetData");
const attachUtils = require("../../src/_attachmentutils");
const getDataUtils = require("./../../client/components/metadata/GetDataUtils");
const _ = require("lodash");

async function middleware(req,res,next){
    let ctx = req.app.locals.context;
    let tableName = req.body.tableName;
    let editType = req.body.editType;

    if (!isAnonymousAllowed(req, tableName,editType)){
        res.status(400).send("Anonymous not permitted, dataset "+tableName+" "+editType);
        return;
    }

    let jsonFilter= getDataUtils.getJsObjectFromJson(req.body.filter);
    let filter = q.fromObject(jsonFilter);

    let /*DataSet*/ ds = await ctx.getDataInvoke.createEmptyDataSet(tableName, editType);

    await ctx.getDataInvoke.readCached(ds);

    await  ctx.getDataInvoke.runSelectIntoTable(ds.tables[tableName],filter,null);

    if (!ds.tables[tableName].rows.length){
        res.status(200).send("No rows found in table "+tableName+" with filter "+filter);
    }

    await GetData.doGet(ctx, ds.tables[tableName], false,null);


    await attachUtils.sanitizeDsForAttach(ds, ctx);
    _.forOwn(ds.tables, t=> {if (t.rows.length===0){ ds.removeTable(t);}});
    res.status(200).send( getDataUtils.getJsonFromJsDataSet(ds,false)); //JSON.stringify(ds.serialize(true)));

}


let router = express.Router();
router.post('/getDsByRowKey', asyncHandler(middleware));


module.exports= router;
