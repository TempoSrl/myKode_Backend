/**
 * @module ConfigDev
 * @description
 * Contains global variables used in test environment
 */
(function () {

    var configDev = {

        userName: "user1",
		password: "",
        email : 'info@tempo.it',
        codiceFiscale : 'cf',
        partitaIva :  '000888000888',
        cognome :  'xyzCognome',
        nome: 'xyzNome',
        dataNascita:  '02/10/1980',

        // dati per login e utente per reset password
        userNameResetPassword: '',
        passwordResetPassword: '',
        emailResetPassword: '',


        userName2: "user2test",
        password2:"",
        email2 : 'info@domain.it',
        codiceFiscale2 : 'cf',
        partitaIva2 :  '000888000888',
        cognome2 :  'surname2',
        nome2: 'name2',
        dataNascita2:  '02/10/1980',

        datacontabile : new Date()

    };

    // Le password degli utenti di test non stanno nel repository: le mette ConfigDev.local.js,
    // escluso da git e caricato prima di questo file (modello: ConfigDev.local.example.js).
    if (typeof window !== "undefined" && window.configDevLocal) {
        Object.assign(configDev, window.configDevLocal);
    } else {
        console.warn("ConfigDev.local.js mancante: copia client/components/metadata/ConfigDev.local.example.js in ConfigDev.local.js e mettici le password degli utenti di test");
    }

    appMeta.configDev = configDev;
}());


