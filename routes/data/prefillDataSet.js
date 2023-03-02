const isAnonymousAllowed = require("../data/_AnonymousAllowed");
const express = require("express");
const asyncHandler = require("express-async-handler");
const q = require("./../../client/components/metadata/jsDataQuery");
const getDataUtils = require("./../../client/components/metadata/GetDataUtils");

async function middleware(req,res,next){
    let ctx = req.app.locals.context;
    let tableName = req.query.tableName;
    let editType = req.query.editType;

    if (!isAnonymousAllowed(req, tableName,editType)){
        res.status(400).send("Anonymous not permitted, dataset "+tableName+" "+editType);
        return;
    }

    let /*DataSet*/ ds = await ctx.getDataInvoke.createEmptyDataSet( tableName,editType);
    let selList = [];

    //array of key/value pairs. key:tableName, value:filter jsDataQuery serialized in json
    let pairTableFilter = getDataUtils.getJsObjectFromJson(req.query.pairTableFilter);
    pairTableFilter.forEach(p =>{
        let tableName = p.key;
        selList.push( {
            table:ds.tables[tableName],
            //top:s.top,
            tableName:tableName,
            filter:q.fromObject( getDataUtils.getJsObjectFromJson(p.filter))
        });
    });
    this.mergeMultiSelect(selList, ds, ctx.app.locals.environment)
        .then(()=>{
            //dovrebbe essere equivalente a  res.send(JSON.stringify(ds.serialize()));
            res.json(getDataUtils.getJsonFromJsDataSet(ds,false));
        })
        .fail(err=>{
            res.status(410).send("multiRunSelect: Error selecting tables "+err);
        });
}


let router = express.Router();
router.get('/prefillDataSet', asyncHandler(middleware));


module.exports= router;

