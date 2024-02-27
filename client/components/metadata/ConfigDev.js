/**
 * @module ConfigDev
 * @description
 * Contains global variables used in test environment
 */
(function () {

    var configDev = {

        //userName: "vis_psuma",
        //password: "vis_psuma",
        userName: "user1",
		password: "user1user1",
        email : 'info@tempo.it',
        codiceFiscale : 'cf',
        partitaIva :  '000888000888',
        cognome :  'xyzCognome',
        nome: 'xyzNome',
        dataNascita:  '02/10/1980',

        // dati per login e utente per reset password
        userNameResetPassword: 'user2',
        passwordResetPassword: 'user2',
        emailResetPassword: 'user2@domain.it',


        userName2: "user2test",
        password2:"user2test",
        email2 : 'info@domain.it',
        codiceFiscale2 : 'cf',
        partitaIva2 :  '000888000888',
        cognome2 :  'surname2',
        nome2: 'name2',
        dataNascita2:  '02/10/1980',

        datacontabile : new Date()

    };

    appMeta.configDev = configDev;
}());


