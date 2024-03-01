let fs =require("fs");
let path =require("path");

let dbConfigFileName= process.argv[2];
let scriptName= process.argv[3];

let dbCode= process.argv[4];

let content = fs.readFileSync(dbConfigFileName,"utf-8");
let dbConfig = JSON.parse(content.toString());

if (dbCode) {
    dbConfig= dbConfig[dbCode];
}
let driverKind = dbConfig.sqlModule;


const driverClass = require(path.join("..","src",driverKind));

let dbConn = new driverClass.Connection(dbConfig);
let stop=false;
let error = false;
dbConn.open().done(function (){
    process.stdout.write("running script "+scriptName+
        " on db "+dbConfig.database+
        " server "+dbConfig.server+
        "("+driverKind+")");
    dbConn.run(fs.readFileSync(scriptName).toString()).then((res,err)=>{
        stop=true;
        if (err) {
            process.stdout.write("Error:"+err+"\n");
            return;
        }
    }).fail((err)=>{
        error=true;
        process.stderr.write(" - Error:"+err+"\n");
        stop=true;
    }).done(()=>{
        dbConn.close();
        if(!error)process.stdout.write(".. Ok\n");
    });


    // start polling at an interval until the data is found at the global
    let intvl = setInterval(function() {
        if (stop) {
            clearInterval(intvl);
        }
    }, 100);
});

