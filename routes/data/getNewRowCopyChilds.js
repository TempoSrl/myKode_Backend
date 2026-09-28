const express = require('express');
const  isAnonymousAllowed = require("../data/_AnonymousAllowed");
const jsDataSet = require("./../../client/components/metadata/jsDataSet");
let DataSetPath = "./../../datasets";
const asyncHandler = require('express-async-handler'); //https://zellwk.com/blog/async-await-express/
const metaModel = require("./../../client/components/metadata/MetaModel");
const {readFile} = require("fs/promises");
const q = require("./../../client/components/metadata/jsDataQuery");
const GetDataSet = require("./../../client/components/metadata/GetDataSet");
const {DataSet} = require("./../../client/components/metadata/jsDataSet");
const getDataUtils = require("./../../client/components/metadata/GetDataUtils");

async function getNewRowCopyChilds(req,res,next){
    let ctx = req.app.locals.context;



    let editType = req.body.editType;

    let conn = ctx.dataAccess;

    /****************** Costrusci dt principale e ds di output ************************/
    let  myDtParent = new jsDataSet.DataTable("dummy");
    // deserializzo riga nuova padre inserita
    myDtParent.deSerialize(JSON.parse(req.body.dtPrimary));

    let rowToInsert = null;
    if (req.body.filterInsertRow) {
        let jsonFilter =  getDataUtils.getJsObjectFromJson(req.body.filterInsertRow);
        let filterRow = q.fromObject(jsonFilter);

        if (filterRow) {
            let rr = myDtParent.select(filterRow);
            if (rr.length>0) rowToInsert= rr[0];
        }
    }
    let tableName = myDtParent.name;
    let outDs = await GetDataSet.createEmptyDataSet(ctx,tableName,editType);

    // travaso i miei dati su questo dataset, poi invocher? la Get_New_Row su questi nuovi oggetti, che sono per? linkati al giusto DataSet
    // travaso la riga parent
    let newParentDataTable = outDs.tables[tableName];
    // inizializzo prm da passare alla get_new_row di mdl.
    // ---> Se esiste la riga parent,
    // allora devo calcolare il ds giusto poiché servono le relazioni etc..
    let newRowParent =  newParentDataTable.importRow(rowToInsert);
    // FINE calcolo ds outDs nuovo con i dati del client
    //********************************************************************************

    /********** DS e riga principale di input da copiare ******************************/
    // 1. deserializzo strutture dati
    let DSin = getDataUtils.getJsDataSetFromJson(req.body.dsIn);

    // deserializzo riga padre
    let myDtParentIn = DSin.tables[tableName];

    // recupero la riga Parent tramite il nome tabella e il filtro su di essa, passato dal client
    let jsonFilter = getDataUtils.getJsObjectFromJson(req.body.filterPrimary);
    let metaExprFilter = q.fromObject(jsonFilter);

    // recupero la riga tramite la tabella e il filtro su di essa, passato dal client
    let primaryRowCopy = myDtParentIn.select(metaExprFilter)[0];

    let metaParent = ctx.getMeta(tableName);
    try {
        await metaParent.recursiveNewCopyChilds(newRowParent,primaryRowCopy);
        res.json(getDataUtils.getJsonFromJsDataSet(outDs,false));
    }
    catch (err){
        res.status(500).send({ error: err});
    }

}


let router = express.Router();
router.post('/getNewRowCopyChilds', asyncHandler(getNewRowCopyChilds));

module.exports= router;
