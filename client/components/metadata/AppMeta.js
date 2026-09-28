


/**
* Namespace for myKode application
* @constructor
*/
function AppMeta() {
    // console.log("creating a new AppMeta - should only happen once");
    this.allMeta = {};

    /**
     * @summary All user defined custom control manager
     */
    this.customControls = {};

    /**
     * @summary All user defined custom container control manager
     */
    this.customContainers = {};

    /**
     * Path to files in the web application
     */
    this.basePath = '';

    this.dbClickTimeout = 200;

        /**
         * @summary List of all html pages of the application
         */
        /* {tableName:null,editType:null,html:null}[] */ this.htmlPages = [
        //{tableName:null,editType:null,html:null}
    ];

    /**
     * @summary List of all metaPages of the application
     */
    this.metaPages = [
        //{tableName:null,editType:null,MetaPage:null}
    ];

    this.metaLoading = {};
}

AppMeta.prototype = {
    constructor: AppMeta,
    /**
     * @method addMeta
     * @public
     * @description SYNC
     * Adds a metadata to the application. This should be called from the defining javascript
     * @param {string} tableName
     * @param {MetaData} meta
     */
    addMeta: function (tableName, meta) {
        if (!this.allMeta[tableName]) {
            this.allMeta[tableName] = meta;
        }
    },

    /**
     * @method getMeta
     * @public
     * @description SYNC
     * Returns a singleton instance of MetaData for a specified "tableName"
     * @param {string} tableName
     * @returns {MetaData}
     */
    getMeta: function (tableName) {
        let meta = this.allMeta[tableName];
        if (!meta) {
            meta = new this.MetaData(tableName);
        }
        meta.setLanguage(this.localResource.currLanguage);
        return meta;
    },

    /**
     * @method loadMetasAsync
     * @public
     * @param {List<string>} metas
     * @returns {Promise<MetaData[]>}
     */
    loadMetasAsync(metas) {
        const promises = metas.map(name =>
            this.allMeta[name]
                ? this.Deferred().resolve(this.allMeta[name]).promise()
                : this.metaLoading[name] || appMeta.getMetaAsync(name)
        );

        return $.when.apply($, promises).then(function () {
            return Array.from(arguments);
        });
    },


    /**
     * @method preloadMetas
     * @public
     * @param {DataSet} dataset
     * @returns {Promise<MetaData[]>}
     */
    preloadMetas(dataset) {
        const tableNames = new Set(
            Object.values(dataset.tables).map(t => t.postingTable())
        );

        return this.loadMetasAsync([...tableNames]);
    },


    /**
     * @method getMeta
     * @public
     * @description ASYNC
     * Returns a singleton instance of MetaData for a specified "tableName"
     * @param {string} tableName
     * @returns {Promise<MetaData>}
     */
    getMetaAsync: function (tableName) {
        let meta = this.allMeta[tableName];

        if (meta) {
            meta.setLanguage(this.localResource.currLanguage);
            return this.Deferred().resolve(meta).promise();
        }

        if (this.metaLoading[tableName]) {
            return this.metaLoading[tableName];
        }

        let res = this.Deferred("getMeta");
        this.metaLoading[tableName] = res.promise();
        let self = this;
        let jsFileName = this.getMetaPagePath(tableName) + "/meta_" + tableName + ".js";

        $.getScript(jsFileName)
            .done(function () {
                let meta = self.allMeta[tableName];
                if (!meta) {                    
                    meta = new this.MetaData(tableName);
                }

                meta.setLanguage(self.localResource.currLanguage);
                delete self.metaLoading[tableName];
                res.resolve(meta);

            })
            .fail( (err) =>res.reject("Failed to load " + jsFileName + " " + JSON.stringify(err)))                            
            .always(()=>delete self.metaLoading[tableName]);

        return res.promise();
    },


    /**
     * @method CustomControl
     * @public
     * @description SYNC
     * Gets/Sets the "control" for the "controlName". Saves it in the class variable "customControls"
     * @param {string} controlName
     * @param {CustomControl} control it can be GridControl, ComboControl
     * @returns {constructor|this}
     */
    CustomControl: function (controlName, control) {
        if (control === undefined) {
            return this.customControls[controlName];
        }
        this.customControls[controlName] = control;
        return this.customControls[controlName];
    },

    /**
     * @method CustomContainer
     * @private
     * @description SYNC
     * Gets/Sets the "control" container for the "controlName". Saves it in the class variable "customContainers"
     * @param {string} controlName
     * @param {CustomControl} control
     * @returns {constructor|this}
     */
    CustomContainer: function (controlName, control) {
        if (control === undefined) {
            return this.customContainers[controlName];
        }
        this.customContainers[controlName] = control;
        return this;
    },

    /**
     * @method getPage
     * @public
     * @description ASYNC
     * Loads and caches an html page from server and renders in rootElement of current page
     * @param {element} rootElement
     * @param {string} tableName
     * @param {string} editType
     * @returns Promise<string>
     */
    getPage: function (rootElement, tableName, editType) {
        let res = this.Deferred("getPage");
        /*{tableName:null,editType:null,html:null}*/
        let page = _.find(this.htmlPages, { "tableName": tableName, "editType": editType });

        let self = this;
        if (page) {
            $(rootElement).html(page.html);
            return res.resolve(page.html).promise();
        }

        let htmlFileName = this.getMetaPagePath(tableName) + "/" + tableName + "_" + editType + ".html";
        $.get(htmlFileName)
            .done(
                function (data) {
                    self.htmlPages.push({ tableName: tableName, editType: editType, html: data });
                    $(rootElement).html(data);
                    res.resolve(data);
                })
            .fail(
                function (err) {
                    res.reject('Failed to load ' + htmlFileName + ' ' + JSON.stringify(err.responseText));
                });

        return res.promise();
    },

    /**
     * @method addMetaPage
     * @public
     * @description SYNC
     * Adds to the metaPage collection the "metaPage"
     * @param {string} tableName
     * @param {string} editType
     * @param {MetaPage} metaPage is the constructor of a metaPage
     */
    addMetaPage: function (tableName, editType, metaPage) {
        /*{tableName:null,editType:null,html:null}*/
        let found = _.find(this.metaPages, { "tableName": tableName, "editType": editType });

        if (found) {
            //console.log("page "+tableName+":"+editType+" already exists");
            return;
        }
        this.metaPages.push({ tableName: tableName, editType: editType, MetaPage: metaPage });
    },


    /**
     * @method getMetaPage
     * @public
     * @description ASYNC
     * Returns a deferred resolved with a new instance of a MetaPage
     * @param {string} tableName
     * @param {string} editType
     * @returns Promise<MetaPage>
     */
    getMetaPage: function (tableName, editType) {
        let res = this.Deferred("getMetaPage");
        /*{tableName:null,editType:null,html:null}*/
        let found = _.find(this.metaPages, { "tableName": tableName, "editType": editType });
        let self = this;
        if (found) {
            // console.log("metapage found in cache");
            let isDetail = found.MetaPage.prototype.detailPage;
            let page = new found.MetaPage(tableName, editType, isDetail);
            // console.log("page obtained:",typeof (page));
            return res.resolve(page); //non aggiunge due volte la metaPage
        }
        // console.log("metapage not found in cache");
        let jsFileName = this.getMetaPagePath(tableName) + "/" + tableName + "_" + editType + ".js";
        //console.log("to get file"+jsFileName);
        $.getScript(jsFileName) // questo esegue il js caricato
            .done(
                function () { //mi attendo che il js caricato abbia effettuato la addMetaPage
                    // console.log("metapage retrieved from server:",jsFileName);
                    found = _.find(self.metaPages, { "tableName": tableName, "editType": editType });
                    if (found) {
                        let isDetail = found.MetaPage.prototype.detailPage;
                        res.resolve(new found.MetaPage(tableName, editType, isDetail));
                        return;
                    }

                    res.reject('Failed to load metaPage ' + jsFileName + ' edittype:' + editType + ". Compile wrong or missing file.");
                })
            .fail(
                function (err) {
                    res.reject('Failed to load ' + jsFileName + ' edittype:' + editType + ". Compile wrong or missing file." + err);
                });

        return res.promise();

    },
    /**
     * @method getMetaPagePath
     * @public
     * @description SYNC
     * Returns the path are the MetaPages and html.
     * It mustn't end with "/"
     * Overridable
     * @param {string} tableName, represents the main table of the page which we have to find page.js and html
     * @returns {string} the path where to found metaPages and html
     */
    getMetaPagePath: function (tableName) {
        let bPath = this.basePathMetadata ? this.basePathMetadata : this.basePath;
        return bPath + tableName;
    },
};

// console.log("creating new AppMeta - this should be a singleton");
window.appMeta = new AppMeta();
window.appMeta.currApp = undefined;