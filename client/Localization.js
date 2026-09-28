/**global appMeta  **/
/**
 * @class localization
 * @description
 * Contains the logic for the localization of visual objects
 */
(function () {

    /**
     * @constructor localization
     * @description
     */
    function Localization() {
        Localization.prototype.defaultLanguage = appMeta.LocalResource.prototype.defaultLanguage;
        this.dictionary = {};
    }

    Localization.prototype = {
        supportedLanguages  : {},
        defaultLanguage: null,
        constructor: Localization,
        addSupportedLanguage(lanName, Dict){
            Localization.prototype.supportedLanguages[lanName]=Dict;

            let systemDict = appMeta.localResource.getDictionary(lanName);

            if (systemDict===undefined){
                console.log("System language resources wasn't found for language "+lanName);
                return;
            }

            let dict= _.extend(systemDict, Dict);
            appMeta.localResource.registerDictionary(lanName, dict);

            if (Localization.prototype.defaultLanguage===lanName){
                this.setLanguage(lanName);
            }
        },


        translate: function(str){
            let res = this.dictionary[str];
            if (res === undefined) return str;
            return res;
        },

        /**
         * 1. gets correct lang
         * 2. sets the lang for the framework mdl
         * 3. set sthe lang for the html+js of the app. in this[key] I will find the translated string for the kye
         * @param {string} lang
         */
        setLanguage:function (lang) {
            // bonifico il linguaggio, per esser sicuro che esista tra quelli supportati
            this.currLanguage = this.getAppLanguage(lang);

            //dictionary dal framework, ossia da LocalResourceXX
            this.dictionary = appMeta.localResource.getDictionary(this.currLanguage);

            // creo il nome del prototipo a runtime senza cablare la switch così se aggiungo una lingua
            // viene automaticamente presa
            try {
                if (appMeta){
                    //executed on client
                    appMeta.localResource.setLanguage(this.currLanguage);

                    if (appMeta.currApp && appMeta.currApp.toolBarManager) {
                        appMeta.currApp.toolBarManager.localize();
                    }

                    // localizza gli oggetti esterni che gestiscono i controlli data
                    this.localizeDatePicker(this.currLanguage);

                    // localizza stringhe presenti sul main, custom dell'applicativo
                    this.localizeCustomMain();

                    // localizza voci di menù
                    this.localizeMenuOnTheFly();

                    // localizzo pagina corrente. Controlli standard (tab, label, nomi colonna...)
                    if (appMeta.currApp && appMeta.currApp.currentMetaPage){
                        this.localizePage(appMeta.currApp.currentMetaPage);
                        this.localizeCustomControls(this.currLanguage);
                    }

                }


            } catch (e){
                console.log(e);
                console.log("Language " + lang + " doesn't exist! Go to i18n folder and create the file localResource " + lang + ".js");
            }

        },

        /**
         * localizes date picker
         * @param {string} lng
         */
        localizeDatePicker:function (lng) {
            if ($.datepicker){
                $.datepicker.setDefaults({
                    changeMonth: true,
                    changeYear: true,
                    yearRange: "1920:2030"
                });
                $.datepicker.setDefaults($.datepicker.regional[lng]);
            }
            if ($.timepicker){
                $.timepicker.setDefaults({
                    changeMonth: true,
                    changeYear: true,
                    yearRange: "1920:2030"
                });
                $.timepicker.setDefaults($.timepicker.regional[lng]);
            }
        },

        /**
         * Clean eventually the lang string, and if it is not supported return default lang
         * @param {string} lang
         * @returns string
         */
        getAppLanguage:function (lang) {
            if (lang) {
                // non supporto specifica cultura
                if (lang.length > 2) lang = lang.substring(0, 2);
                // metto lingua di default se non presente la traduzione
                if (Localization.prototype.supportedLanguages[lang]===undefined){
                    console.log("Language " + lang + " not supported. Used default " + this.defaultLanguage);
                    lang = this.defaultLanguage;
                }
            } else {
                lang = this.defaultLanguage;
            }
            return lang;
        },

        /**
         * Returns the lang of the browser, or  default if it no supported in the localizatio
         * @returns {string}. 'it' default, or any supoported lang, for example 'en', 'fr' etc..
         */
        getBrowserLanguage:function () {
            // cerca di recuperare le info sulla lingia dal browser
            let lang = window.navigator.userLanguage || window.navigator.language;
            return this.getAppLanguage(lang);
        },

        /**
         * Translates the metapage html linked + js variables
         * @param {MetaPage} metapage
         */
        localizePage:function (metapage) {
            if (!metapage) return console.log("localizePage: no metapage to localize");
            // 1. label: for
            this.labelPageLocalize(metapage);
            // 2. tab: data-target
            this.tabLocalize(metapage);
            // 3. contenuto div qualsiasi
            this.divGeneralLocalize(metapage);
            // 4. localizzo titolo, il name della metapage
            this.metaPageNameLocalize(metapage);
            // 5. localizzo nomi colonna "grid_<tableName>_<editType>_<columnName>"
            this.gridColumnsLocalize(metapage);
        },

        /**
         * Client function, only does some work on client environment
         */
        localizeCustomControls:function (lng) {
            if (typeof appMeta === undefined || typeof  $ === undefined){
                return;
            }
            $(appMeta.currApp.rootElement + " [data-custom-control] ")
            .each(function(index, el) {
                let ctrl = $(el).data("customController");
                if (!ctrl) return;
                if (!ctrl.localize) return;
                ctrl.localize(lng);
            });
        },

        /**
         * titolo metapage
         * @param {MetaPage} metapage
         */
        metaPageNameLocalize:function(metapage) {
            let nameKey = metapage.primaryTableName.toLowerCase() + "_" + metapage.editType.toLowerCase();
            let valueTranslated = this.translate(nameKey);
            metapage.name = valueTranslated || metapage.name;
        },

        /**
         * contenuto di qualsiasi div immerso
         * @param {MetaPage} metapage
         */
        divGeneralLocalize:function(metapage) {
            let dict= this.dictionary;
            $(metapage.rootElement)
            .find('.custom_lng_div')
            .each(function () {
                // recupero chiave
                var lockey = $(this).data('langkey');
                // prendo valore della traduzione
                var valueTranslated = dict[lockey];
                if(valueTranslated !== null && valueTranslated !== undefined) $(this).html(valueTranslated);
            });
        },

        /**
         * etichetta dei tab
         * @param {MetaPage} metapage
         */
        tabLocalize:function(metapage) {
            let dict= this.dictionary;
            $(metapage.rootElement)
            .find('.nav-link')
            .each(function () {
                // recupero chiave
                let lockey = $(this).data('target');
                // prendo valore della traduzione
                let valueTranslated = dict[lockey];

                if(valueTranslated !== null && valueTranslated !== undefined){
                    // prendo il 3o elemento poichè il primo è svg, il 2o tag "i" commentato, terzo il testo del tab
                    if ( $(this).contents().get(2)) {
                        $(this).contents().get(2).nodeValue = valueTranslated;
                    }
                }
            });
        },

        /**
         * etichette controlli
         * @param {MetaPage} metapage
         */
        labelPageLocalize:function(metapage) {
            let dict= this.dictionary;
            $(metapage.rootElement)
            .find('label')
            .each(function () {
                // recupero chiave
                let lockey = $(this).attr('for');
                // prendo valore della traduzione
                let valueTranslated = dict[lockey];
                if(valueTranslated !== null && valueTranslated !== undefined) $(this).text(valueTranslated);
            });
        },


        /**
         * nomi colonne. il pattern è "grid_" + tname + "_" + edittype + "_" + cname
         * @param {MetaPage} metapage
         */
        gridColumnsLocalize:function(metapage) {
            let dict= this.dictionary;
            _.forEach($("[data-custom-control=gridx]"), function (grid) {
                // recupero info di che tabella si tratti dal tag
                let eltag = $(grid).data("tag");
                let tagArray = eltag.split(".");
                let tname = tagArray[0];
                let edittype = tagArray[2];
                $(grid).find('th').each(function () {
                    // scorro le celle e recupero quella in cui la colonna è quella corrente sotto esame
                    let cname = $(this).data("mdlcolumnname");
                    if (cname) {
                        let nameKey = "grid_" + tname + "_" + edittype + "_" + cname;
                        let valueTranslated = dict[nameKey];
                        $(this).text(valueTranslated);
                    }
                });
            });
        },

        /**
         * Loops on menu rows, and localizes the label
         * columns: idmenuweb,idmenuwebparent,tableName,editType,label
         * @param {DataTable} dt. dt with the rows of the menu
         */
        localizeMenu:function (dt) {
            let dict= this.dictionary;
            _.forEach(dt.rows, function (rowitem) {
                // le chiavi nel file di risorse, o sono "tableName_editType" oppure "idmenuwebxxx" se non presenti
                let lockey = "idmenuweb" + rowitem.idmenuweb;
                if (rowitem.tableName && rowitem.editType) lockey = rowitem.tableName.toLowerCase() +
                        "_" + rowitem.editType.toLowerCase();
                let valueTranslated = dict[lockey];
                rowitem.label = valueTranslated || rowitem.label ;
            });
        },

        /**
         *
         */
        localizeMenuOnTheFly:function () {
            // localizzo voci di menù
            this.menuLocalize();
            // localizza le root del menù
            this.menuRootLocalize();
        },

        /**
         *
         */
        menuLocalize:function() {
            let dict= this.dictionary;
            $("#menu")
            .find('.nav-link > span')
            .each(function () {
                // recupero chiave
                let lockey = $(this).attr('id');
                // prendo valore della traduzione
                let valueTranslated = dict[lockey];
                if(valueTranslated !== null && valueTranslated !== undefined){
                    $(this).text(valueTranslated);
                }
            });
        },

        /**
         * Localozza le voci root non cliccabili del menu
         */
        menuRootLocalize:function() {
            let dict= this.dictionary;
            $("#menu")
            .find('.nav-item')
            .each(function () {
                // recupero chiave
                let lockey = $(this).attr('id');
                // prendo valore della traduzione
                let valueTranslated = dict[lockey];
                if(valueTranslated !== null && valueTranslated !== undefined){
                    $(this).find(".mdl_title_class").text(valueTranslated);
                }
            });
        },

        /**
         * Localizes html label and appMain string
         */
        localizeCustomMain:function () {
            let dict= this.dictionary;
            // inseriamo qui la localizzazione dei controlli esterni al framework. Custom dell'index dell'applicazione
            $("#menu_search_btn_id").text(dict["menu_search_btn_id"]);
            $("#menu_guide_btn_id").text(dict["menu_guide_btn_id"]);
            $("#menu_info_btn_id").text(dict["menu_info_btn_id"]);

            $('#logoutButton').text(dict["logoutButton"]);
            $('#welcome_lbl_id').text(dict["welcome_lbl_id"]);
            $('#loginButton').text(dict["loginButton"]);
            $('#gotoLogin_id').text(dict["gotoLogin_id"]);
            $('#gotoRegister_id').text(dict["gotoRegister_id"]);
        },

        /**
         * TODO. Continuare nel caso si traducano tutte le pagine della app in maniera statica  all'inizio
         */
        translateApp:function () {
            // Esempio di chiamata a metodo custom
            let def = appMeta.Deferred("translateApp");

            appMeta.getData.launchCustomServerMethod("getAllFilesToTranslate")
            .then(function (res) {
                alert(res);
                def.resolve();
            });

            return def.promise();
        },

        getLogSchedulerMaxHourPerDay:function (currday, maxTotPerDay, role) {
            return appMeta.localResource.replaceWordsInPhrase({
                currday : currday,
                maxTotPerDay: maxTotPerDay,
                role: role
            }, this.schedulerSkypDay);
        },


        getLogSchedulerMaxHourPerDayDiff:function (currday, maxTotPerDay, hoursSameDay, hoursToAdd, hoursWouldAdd, role) {
            return appMeta.localResource.replaceWordsInPhrase({
                currday : currday,
                maxTotPerDay: maxTotPerDay,
                hoursSameDay: hoursSameDay,
                hoursToAdd: hoursToAdd,
                hoursWouldAdd: hoursWouldAdd,
                role: role
            }, this.schedulerLogMaxHourPerDay);
        },

        getLogSchedulerLastDay:function (currday, maxTotPerDay) {
            return appMeta.localResource.replaceWordsInPhrase({
                currday : currday,
                maxTotPerDay: maxTotPerDay
            }, this.schedulerLastDay);
        },

        getLogSchedulerTooManyHours: function(remaininghours, endDate) {
            return appMeta.localResource.replaceWordsInPhrase({
                remaininghours : remaininghours,
                endDate: endDate
            }, this.schedulerTooManyHours);
        },

        getSospDay:function (currday) {
            return appMeta.localResource.replaceWordsInPhrase({
                currday : currday
            }, this.schedulerSospDay);
        }

    };

    appMeta.Localization =  Localization;
    appMeta.localization = new Localization();
}());
