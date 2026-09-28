/**
 * @module CodiceFiscale
 * @description
 * Contains the common methods to check Italian CodiceFiscale
 */
(function () {

    // Deriva da MetaApp
    var MetaApp = appMeta.MetaApp;
    /**
     * @constructor CodiceFiscale
     * @description
     * Utilities for calculate  and validate CodiceFiscale on web app developed wth MDLW
     */
    function CodiceFiscale() {
        "use strict";
        this.month_codes = ['A','B','C','D','E','H','L','M','P','R','S','T'];
        this.omocodieTable =['L','M','N','P','Q','R','S','T','U','V'];
        this.tavola_carattere_di_controllo_valore_caratteri_dispari = {
            0:1,  1:0,  2:5,  3:7,  4:9,  5:13, 6:15, 7:17, 8:19,
            9:21, A:1,  B:0,  C:5,  D:7,  E:9,  F:13, G:15, H:17,
            I:19, J:21, K:2,  L:4,  M:18, N:20, O:11, P:3,  Q:6,
            R:8,  S:12, T:14, U:16, V:10, W:22, X:25, Y:24, Z:23
        };
        this.tavola_carattere_di_controllo_valore_caratteri_pari = {
            0:0,  1:1,   2:2,  3:3,   4:4,  5:5,  6:6,  7:7,  8:8,
            9:9,  A:0,   B:1,  C:2,   D:3,  E:4,  F:5,  G:6,  H:7,
            I:8,  J:9,   K:10, L:11,  M:12, N:13, O:14, P:15, Q:16,
            R:17, S:18,  T:19, U:20,  V:21, W:22, X:23, Y:24, Z:25
        };
        //this.codici_catastali = {
        //    "A001":"ABANO TERME (PD)",
        //    ....
        //    ....
        //    "M204":"ZUNGRI (VV)"
        //};

        this.tavola_carattere_di_controllo = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    }

    CodiceFiscale.prototype = {
        constructor: CodiceFiscale,

        /***************************************************
         *
         *  METODI porting c#
         *
         ***************************************************/

        /**
         * @method computes_comune_code
         * @private
         * @description SYNC
         * @param {string} pattern_comune
         * @returns {Object}
         */
        GetLastChar: function (codice) {
            var IsPair = true;
            var Somma = 0;
            for (var i = 0; i < codice.length; i++) {
                IsPair = !IsPair;
                if (IsPair) Somma += this.GetValueTabA(codice.charAt(i));
                else Somma += this.GetValueTabB(codice.charAt(i));
            }
            var Resto_int = parseInt(Somma) % 26;
            var TabC = this.GetValueTabC(Resto_int);

            var outobj = {};
            outobj.lastChar = TabC.lastChar;
            outobj.isValid = TabC.isValid;
            return outobj;
        },

        isCharNumber: function (c){
        return c >= '0' && c <= '9';
        },   
        /**
         * Restituisce il Codice Catastale del comune di nascita, a partire dal suo idgeo
         * @param idgeo
         * @param tipogeo
         */

        find_agencycode_dd: function (idgeo, tipogeo, q) {
            switch (tipogeo) {
                case "P":
                    filter = q.and(q.eq("idcountry", idgeo), q.eq("idagency", 1), q.eq("idcode", 1));
                    return appMeta.getData.doReadValue("geo_country_agency", filter, "value");

                    break;
                case "R":
                    filter = q.and(q.eq("idregion", idgeo), q.eq("idagency", 1), q.eq("idcode", 1));
                    return appMeta.getData.doReadValue("geo_region_agency", filter, "value");
                    break;
                case "N":
                    filter = q.and(q.eq("idnation", idgeo), q.eq("idagency", 1), q.eq("idcode", 1));
                    return appMeta.getData.doReadValue("geo_nation_agency", filter, "value");
                    break;
            }

            var filter = q.and(q.eq("idcity", idgeo), q.eq("idagency", 1), q.eq("idcode", 1));
            return appMeta.getData.doReadValue("geo_city_agency", filter, "value");

        },

        /**
        * Restituisce True se il codicefiscale privato/azienda risulta valido, false + errore in caso contrario.
        * 
        * @param { r } row of registry
        * torna outobj, un obj js : 
        * @returns { { isValid: bool, errMsg: string} }
         */

        //-----------------------------------  New ------------------------------------------

        CodiceFiscaleValido: function (r, q) {
            var def = appMeta.Deferred("CodiceFiscaleValido");
            var outobj = {};
            outobj.isValid = false;
            outobj.errMsg = "";
            outobj.errField = "cf";
            outobj.outCaption = "Codice Fiscale";
            outobj.row = r;

            if ((r.current.cf == null) || (r.current.cf == '')) {
                outobj.isValid = true;
                def.resolve(outobj);
                return def.promise();
                return;
            }

            var codicefiscale = r.current.cf;
            //per entità che hanno codice fiscale numerico da 11
            if (codicefiscale.length == 11) {
                var strcodicefiscaleing = codicefiscale.split('').join(',')
                for (var c of strcodicefiscaleing) {
                    if (!this.isCharNumber(c)) {
                        //return outobj;// con isValid che vale false
                        outobj.isValid = false;
                        outobj.errMsg = errori;
                        def.resolve(outobj);
                        return def.promise();
                        return;
                    }
                }
                outobj.isValid = true;
                def.resolve(outobj);
                return def.promise();
                return;
            }

            var errori = "Codice fiscale non valido ";
            ////Assolutamente non valido
            if (codicefiscale.length != 16) {
                errori += "(deve essere composto da 16 caratteri e non " + codicefiscale.length + ")";
                outobj.isValid = false;
                outobj.errMsg = errori;
                def.resolve(outobj);
                return def.promise();
                return;
            }
            ////persona fisica
            var tipogeo = "C";
            var idgeo = r.current.idcity;
            if ((r.current.idnation != null) && (r.current.idnation != 1)) {
                //Legge la nazione solo se veramente Estero(ossia se non è Italia)
                tipogeo = "N";
                idgeo = r.current.idnation;
            }
            if (idgeo == null) {
                errori += "(comune di nascita mancante)";
                outobj.isValid = false;
                outobj.errMsg = errori;
                def.resolve(outobj);
                return def.promise();
                return;
            }
            //Codice Catastale ricavato dal comune di nascita, ossia da idgeo.
            var cc_born_dd = this.find_agencycode_dd(idgeo, tipogeo, q);
            cc_born_dd.then((res) => {
                var cc_born = res;
                //deve leggere da DB, quindi fare datao il codice catastale la doreadvalue deve restituire il nom del comune
                //birthplace = _.find(this.codici_catastali, function (item, key) { return key === cc_born; });

                //if (birthplace == null) {
                //    errori += "(comune di nascita errato o mancante)";
                //    outobj.errMsg = errori;
                //    def.resolve(outobj).promise();
                //    return;
                //}

                if (cc_born == null)  {
                    errori += "(Codice Catastale errato)";
                    outobj.errMsg = errori;
                    def.resolve(outobj).promise();
                    return;
                }

                var carControllo = this.GetLastChar(codicefiscale.substr(0, 15));//.substr(0, 15));
                var cfNormal = this.normalizza(codicefiscale);
                //const cc = codicefiscale.substr(11, 4);
                if (!(r.current.birthdate instanceof Date)) {
                    errori += "(Non coerente con Data nascita)";
                    outobj.errMsg = errori;
                    def.resolve(outobj).promise();
                    return;
                }
                var month = String(r.current.birthdate.getMonth() + 1);
                var day = String(r.current.birthdate.getDate());
                var year = String(r.current.birthdate.getFullYear());

                var gender = r.current.gender;
                if ((day == null) ||(day <= 0) || (month <= 0) || (year <= 0)) {
                    errori += "(Non coerente con Data nascita)";
                    outobj.errMsg = errori;
                    def.resolve(outobj).promise();
                    return;
                }
                
                var codicefiscalecalcolato =
                    this.computes_codice_fiscale(r.current.forename, r.current.surname, gender, day, month, year, cc_born/*birthplace*/);

                if ((cfNormal.substr(0, 15) != codicefiscalecalcolato.substr(0, 15))
                    || (cfNormal[15] != carControllo.lastChar)) {
                    if (cfNormal.substr(0, 3) != codicefiscalecalcolato.substr(0, 3)) {
                        errori += "(non coerente con il cognome)\n";
                    }
                    if (cfNormal.substr(3, 3) != codicefiscalecalcolato.substr(3, 3)) {
                        errori += "(non coerente con il nome)\n";
                    }
                    if (cfNormal.substr(6, 2) != codicefiscalecalcolato.substr(6, 2)) {
                        errori += "(non coerente con l'anno di nascita)\n";
                    }
                    if (cfNormal.substr(8, 1) != codicefiscalecalcolato.substr(8, 1)) {
                        errori += "(non coerente con il mese di nascita)\n";
                    }
                    try {
                        var g1 = cfNormal.substr(9, 2);
                        var g2 = codicefiscalecalcolato.substr(9, 2);
                        var s1 = "M";
                        var s2 = "M";
                        if (g1 > 40) {
                            s1 = "F";
                            g1 -= 40;
                        }
                        if (g2 > 40) {
                            s2 = "F";
                            g2 -= 40;
                        }

                        if (g1 != g2) {
                            errori += "(non coerente con il giorno di nascita)\n";
                        }
                        if (s1 != s2) {
                            errori += "(non coerente con il sesso)\n";
                        }
                    }
                    catch (err) {
                        outobj.errMsg = errori;
                        def.resolve(outobj).promise();
                        return;
                    }


                    if (cfNormal.substr(11, 4) != codicefiscalecalcolato.substr(11, 4)) {
                        if (codicefiscalecalcolato[11] == 'Z') {
                            errori += "(non coerente con lo stato estero di nascita)\n";
                        }
                        else {
                            errori += "(non coerente con il comune di nascita)\n";
                        }
                    }

                    if ((cfNormal.substr(0, 15) == codicefiscalecalcolato.substr(0, 15))
                        && (cfNormal[15] != carControllo.lastChar)) {
                        errori += "(ultimo carattere errato)\n";
                    }

                    outobj.errMsg = errori;
                    def.resolve(outobj).promise();
                    return;
                }
                else {
                    outobj.isValid = true;
                    def.resolve(outobj).promise();
                    return;
                   
                }
                }) // fine then

            return def.promise();

        },


        /**
         *
         * @param {string} C
         * @returns {number}
         * @constructor
         */
        GetValueTabA: function (C) {
            var VA = 0;
            switch (C) {
                case '0':
                    VA = 0;
                    break;
                case '1':
                    VA = 1;
                    break;
                case '2':
                    VA = 2;
                    break;
                case '3':
                    VA = 3;
                    break;
                case '4':
                    VA = 4;
                    break;
                case '5':
                    VA = 5;
                    break;
                case '6':
                    VA = 6;
                    break;
                case '7':
                    VA = 7;
                    break;
                case '8':
                    VA = 8;
                    break;
                case '9':
                    VA = 9;
                    break;
                case 'A':
                    VA = 0;
                    break;
                case 'B':
                    VA = 1;
                    break;
                case 'C':
                    VA = 2;
                    break;
                case 'D':
                    VA = 3;
                    break;
                case 'E':
                    VA = 4;
                    break;
                case 'F':
                    VA = 5;
                    break;
                case 'G':
                    VA = 6;
                    break;
                case 'H':
                    VA = 7;
                    break;
                case 'I':
                    VA = 8;
                    break;
                case 'J':
                    VA = 9;
                    break;
                case 'K':
                    VA = 10;
                    break;
                case 'L':
                    VA = 11;
                    break;
                case 'M':
                    VA = 12;
                    break;
                case 'N':
                    VA = 13;
                    break;
                case 'O':
                    VA = 14;
                    break;
                case 'P':
                    VA = 15;
                    break;
                case 'Q':
                    VA = 16;
                    break;
                case 'R':
                    VA = 17;
                    break;
                case 'S':
                    VA = 18;
                    break;
                case 'T':
                    VA = 19;
                    break;
                case 'U':
                    VA = 20;
                    break;
                case 'V':
                    VA = 21;
                    break;
                case 'W':
                    VA = 22;
                    break;
                case 'X':
                    VA = 23;
                    break;
                case 'Y':
                    VA = 24;
                    break;
                case 'Z':
                    VA = 25;
                    break;
                default:

            }
            return VA;
        },

        /**
         *
         * @param {string} C
         * @returns {number}
         * @constructor
         */
        GetValueTabB: function (C) {
            var VA = 0;

            switch (C) {
                case '0':
                    VA = 1;
                    break;
                case '1':
                    VA = 0;
                    break;
                case '2':
                    VA = 5;
                    break;
                case '3':
                    VA = 7;
                    break;
                case '4':
                    VA = 9;
                    break;
                case '5':
                    VA = 13;
                    break;
                case '6':
                    VA = 15;
                    break;
                case '7':
                    VA = 17;
                    break;
                case '8':
                    VA = 19;
                    break;
                case '9':
                    VA = 21;
                    break;
                case 'A':
                    VA = 1;
                    break;
                case 'B':
                    VA = 0;
                    break;
                case 'C':
                    VA = 5;
                    break;
                case 'D':
                    VA = 7;
                    break;
                case 'E':
                    VA = 9;
                    break;
                case 'F':
                    VA = 13;
                    break;
                case 'G':
                    VA = 15;
                    break;
                case 'H':
                    VA = 17;
                    break;
                case 'I':
                    VA = 19;
                    break;
                case 'J':
                    VA = 21;
                    break;
                case 'K':
                    VA = 2;
                    break;
                case 'L':
                    VA = 4;
                    break;
                case 'M':
                    VA = 18;
                    break;
                case 'N':
                    VA = 20;
                    break;
                case 'O':
                    VA = 11;
                    break;
                case 'P':
                    VA = 3;
                    break;
                case 'Q':
                    VA = 6;
                    break;
                case 'R':
                    VA = 8;
                    break;
                case 'S':
                    VA = 12;
                    break;
                case 'T':
                    VA = 14;
                    break;
                case 'U':
                    VA = 16;
                    break;
                case 'V':
                    VA = 10;
                    break;
                case 'W':
                    VA = 22;
                    break;
                case 'X':
                    VA = 25;
                    break;
                case 'Y':
                    VA = 24;
                    break;
                case 'Z':
                    VA = 23;
                    break;
            }
            return VA;
        },

        /**
         *
         * @param C
         * @returns {{}}
         * @constructor
         */
        GetValueTabC: function (C) {
            var tabC = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            if ((C < 0) || (C > 25)) {
                var outobj = {};
                outobj.lastChar = "?";
                outobj.isValid = false;
                return outobj;
            }

            var outobj = {};
            outobj.lastChar = tabC[C];
            outobj.isValid = true;
            return outobj;
        },

        /**
         *
         * @param codicefiscale
         * @returns {*}
         */
        normalizza: function(codicefiscale) {
            codicefiscale = this.sostituisciLetteraConNumero(codicefiscale, 6);
            codicefiscale = this.sostituisciLetteraConNumero(codicefiscale, 7);
            codicefiscale = this.sostituisciLetteraConNumero(codicefiscale, 9);
            codicefiscale = this.sostituisciLetteraConNumero(codicefiscale, 10);
            codicefiscale = this.sostituisciLetteraConNumero(codicefiscale, 12);
            codicefiscale = this.sostituisciLetteraConNumero(codicefiscale, 13);
            return this.sostituisciLetteraConNumero(codicefiscale, 14);
        },

        /**
         *
         * @param cf
         * @param pos
         * @returns {*}
         */
        sostituisciLetteraConNumero: function (cf, pos) {
            var sostituzioni = "LMNPQRSTUV";
            var numero = sostituzioni.indexOf(cf[pos]);
            if (numero != -1) {
                cf = cf.substr(0, pos) + numero + cf.substr(pos + 1);
            }
            return cf;
        },

        /**
         *
         * @param codicefiscale
         * @returns {*}
         * @constructor
         */
        Sesso: function (codicefiscale) {
            if (codicefiscale.length != 16)
                return null;
            try {
                var giorno = parseInt(codicefiscale.substr(9, 2));
                if (giorno > 40) return "F";
                return "M";
            } catch (err) {
                return err.message;
            }
        },

        /**
         *
         * @param esercizio
         * @param codicefiscale
         * @returns {{}}
         * @constructor
         */
        DataNascita: function (esercizio, codicefiscale) {
            esercizio = esercizio.toString();
            var outobj = {};
            outobj.dataNascita = null;
            outobj.errMsg = null;

            if (codicefiscale.length != 16)
                return outobj;
            try {
                var corrente = parseInt(esercizio.substr(2, 2));
                var secolo = parseInt(esercizio.substr(0, 2)) * 100;
                var anno = parseInt(codicefiscale.substr(6, 2));
                if (anno > corrente)
                    anno += (secolo - 100);
                else
                    anno += secolo;

                var mese = this.NumeroMeseDaLettera(codicefiscale[8]);

                if (mese == 0) {
                    outobj.errMsg = "Lettera relativa al mese di nascita non valida";
                    return outobj;
                }

                var giorno = parseInt(codicefiscale.substr(9, 2));

                if (giorno > 40)
                    giorno -= 40;
                
                outobj.dataNascita = new Date(anno, mese, giorno);
                outobj.errMsg = null;
                return outobj;
            }
            catch (err)
            {
                outobj.dataNascita = null;
                outobj.errMsg = err.message;
                return outobj;
            }
        },

        /**
         *
         * @param lettera
         * @returns {number}
         * @constructor
         */
        NumeroMeseDaLettera: function (lettera) {
            return "ABCDEHLMPRST".indexOf(lettera) + 1;
        },

        /**
         * ASYNC
         * @param codicefiscale
         * @returns {Deferred}
         * @constructor
         */
        Comune: function(codicefiscale) {

            var def = appMeta.Deferred("comune");

            appMeta.callWebService("computeComune", { codicefiscale: codicefiscale })
                .then(function (res) {
                  def.resolve(res);
            });

            return def.promise();
        },

        /**
         * ASYNC
         * @param codicefiscale
         * @returns {Deferred}
         * @constructor
         */
        Nazione: function (codicefiscale) {

            var def =  appMeta.Deferred("nazione");

            appMeta.callWebService("computeNazione", { codicefiscale: codicefiscale }).then(function (res) {
                 def.resolve();
            });

            return def.promise();
        },

        /***************************************************
         *
         *  FINE metodi porting c#
         *
         ***************************************************/

        /***************************************************
         *
         *  INIZIO metodi calcolo lato js. (versione semplice)
         *
         ***************************************************/

        /**
         * @method computes_codice_fiscale
         * @public
         * @description SYNC
         * Computes an italian "codice fiscale" starting from user inputs
         * @param {string} name
         * @param {string} surname
         * @param {string} gender "F" or "M"
         * @param {string} day "DD"
         * @param {string} month "MM"
         * @param {string} year "YYYY"
         * @param {string} bornPlace
         * @returns {string} the "codice fiscale"
         */
        computes_codice_fiscale: function (name, surname, gender, day, month, year, cc_born/*bornPlace*/) {
            var cf =
                this.computes_surname_code(surname) +
                this.computes_name_code(name) +
                this.computes_birthdate_code(day, month, year, gender) +
                cc_born//this.computes_comune_code(bornPlace)
                ;

            cf += this.computes_control_character(cf);

            return cf;
        },

        /**
         * @method reverse_codice_fiscale
         * @public
         * @description SYNC
         * Starting from an italian "codice fiscale" return a plaintext js {name: string, surname: string, gender: string, birthday: Date, birthplace: string}
         * @param {string} cf the codice fiscale to revert
         * @returns {{name: string, surname: string, gender: string, birthday: Date, birthplace: string}}
         */
        // E' DA RIFARE, PERCHE' A PARTIRE DAL CODICE CATASTALE, DEVE RISALIRE AL COMUNE LEGGENDOLO DAL DB
        // Quindi dato il codice catastale, deve restituire l'idcity.
        reverse_codice_fiscale:function(cf) {
            var name = cf.substr(3, 3);
            var surname = cf.substr(0, 3);

            var yearCode = cf.substr(6, 2);
            var year19XX = parseInt('19' + yearCode, 10);
            var year20XX = parseInt('20' + yearCode, 10);
            var currentYear20XX = new Date().getFullYear();
            var year = year20XX > currentYear20XX ? year19XX : year20XX;
            var monthChar = cf.substr(8, 1);
            var month = this.month_codes.indexOf(monthChar);
            var gender = 'M';
            var day = parseInt(cf.substr(9, 2), 10);
            if (day > 31) {
                gender = 'F';
                day -= 40;
            }
            var birthday = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
            const cc = cf.substr(11, 4);
            var birthplace = cc;//_.find(this.codici_catastali, function(item, key) {return key === cc;});

            // torno obj js
            return {
                name: name,
                surname: surname,
                gender:  gender,
                birthday : birthday,
                birthplace: birthplace
            }

        },
        /**
         * @method computes_control_character
         * @private
         * @description SYNC
         * @param {string} cf the "codice fiscale"
         * @returns {string}
         */
        computes_control_character:function(cf){
            var i, val = 0;
            for(i=0; i<15 ;i++){
                var c = cf[i];
                if(i%2)
                    val += this.tavola_carattere_di_controllo_valore_caratteri_pari[c];
                else
                    val += this.tavola_carattere_di_controllo_valore_caratteri_dispari[c];
            }
            val = val%26;
            return this.tavola_carattere_di_controllo.charAt(val)
        },

        affronta_omocodia:function(codice_fiscale, numero_omocodia) {
            // non funziona
            var cifre_disponibili=[14,13,12,10,9,7,6];
            var cifre_da_cambiare = [];
            while(numero_omocodia>0 && cifre_disponibili.length){
                var i=numero_omocodia%cifre_disponibili.length;
                numero_omocodia=Math.floor(numero_omocodia/cifre_disponibili.length);
                cifre_da_cambiare.push(cifre_disponibili.splice(i-1,1)[0])
            }
        },

        /**
         * @method get_consonanti
         * @private
         * @description SYNC
         * @param {string} str
         * @returns {string}
         */
        get_consonanti:function(str) {
            return str.replace(/[^BCDFGHJKLMNPQRSTVWXYZ]/gi, '');
        },

        /**
         * @method get_vocali
         * @private
         * @description SYNC
         * @param {string} str
         * @returns {string}
         */
        get_vocali: function(str) {
            return str.replace(/[^AEIOU]/gi, '');
        },

        /**
         * @method computes_surname_code
         * @private
         * @description SYNC
         * @param {string} surname
         * @returns {string}
         */
        computes_surname_code:function(surname) {
            var surname_code = this.get_consonanti(surname);
            surname_code += this.get_vocali(surname);
            surname_code += 'XXX';
            surname_code = surname_code.substr(0, 3);
            return surname_code.toUpperCase();
        },

        /**
         * @method computes_name_code
         * @private
         * @description SYNC
         * @param {string} name
         * @returns {string}
         */
        computes_name_code:function(name) {
            var name_code = this.get_consonanti(name);
            if(name_code.length >= 4){
                name_code=
                    name_code.charAt(0)+
                    name_code.charAt(2)+
                    name_code.charAt(3)
            } else {
                name_code += this.get_vocali(name);
                name_code += 'XXX';
                name_code = name_code.substr(0,3);
            }
            return name_code.toUpperCase();
        },

        /**
         * @method computes_birthdate_code
         * @private
         * @description SYNC
         * @param {number} gg
         * @param {number} mm
         * @param {number} aa
         * @param {string} gender M or F
         * @returns {string}
         */
        computes_birthdate_code: function (gg, mm, aa, gender) {
            var d = new Date();
            d.setYear(aa);
            d.setMonth(mm - 1);
            d.setDate(gg);
            var year = "0" + d.getFullYear();
            year = year.substr(year.length-2, 2);
            var month = this.month_codes[d.getMonth()];
            var day = d.getDate();
            if (gender.toUpperCase() !== 'M' && gender.toUpperCase() !== 'F') throw new Error('Gender must be either \'M\' or \'F\'')
            if(gender.toUpperCase() === 'F') day += 40;
            day = "0" + day;
            day = day.substr(day.length - 2, 2);
            return "" + year + month + day
        },

        /**
         * @method find_comune
         * @private
         * @description SYNC
         * @param {string} pattern_comune
         * @returns {Array}
         */
        //find_comune:function(pattern_comune) {
        //    var ret = [];
        //    var quoted = pattern_comune.replace(/([\\\.\+\*\?\[\^\]\$\(\)\{\}\=\!\<\>\|\:])/g, "\\$1");
        //    var re = new RegExp(quoted, 'i');
        //    _.forOwn(this.codici_catastali, function (comune, code) {
        //        if(comune.match(re)) ret.push([comune, code])
        //    });
        //    return ret;
        //},

        /**
         * @method computes_comune_code
         * @private
         * @description SYNC
         * @param {string} pattern_comune
         * @returns {string}
         */
        //computes_comune_code: function (pattern_comune) {
            
        //    if (pattern_comune.match(/^[A-Z]\d\d\d$/i)) return pattern_comune;
        //    return this.find_comune(pattern_comune)[0][1];
        //},

    };

  
    appMeta.CodiceFiscale = new CodiceFiscale();
}());


