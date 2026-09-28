[![en](https://img.shields.io/badge/lang-en-green.svg)](https://github.com/TempoSrl/myKode_Backend/tree/main/DbDescriptor.md)

# DbDescriptor

La classe DbDescriptor è la classe che "conosce" la struttura di un database.
Una tabella o vista del database è rappresentata dalla classe TableDescriptor, che ha le seguenti proprietà:

### TableDescriptor
- {string} name: nome della tabella o vista
- {string} xtype: T per tabelle, V per viste
- {boolean} dbo : true se è tabella DBO (comune a tutti gli schemi ove previsti dal db)
- {ColumnDescriptor[]} columns: array di descrittori di colonna

Un TableDescriptor espone un metodo getKey che restituisce l'array dei nomi dei campi chiave della tabella
 associata.

### ColumnDescriptor
Un ColumnDescriptor descrive una singola colonna e contiene i campi:

```
- {string} name        - nome campo
- {string} type        - tipo nel db
- {string} ctype       - tipo javascript
- {number} max_length  - dimensione in bytes
- {number} precision   - n. cifre intere
- {number} scale       - n. cifre decimali
- {boolean} is_nullable - true se può essere null
- {boolean} pk          - true se è parte della chiave primaria
```
 
La classe DbDescriptor gestisce un dictionary di TableDescriptor, che è condiviso tra tutte le connessioni allo 
 stesso Db.

- createTable(tableName): restituisce la promise per un DataTable avente la struttura (colonne, chiave) della
 tabella indicata. Questa DataTable avrà le proprietà maxLenght allowNull e cType dei DataColumn impostati, 
 e la chiave primaria
- table (tableName, tableDescriptor): legge o imposta il table descriptor associato ad un tableName. Se è richiesto il
 TableDescriptor di una tabella di cui non lo si è impostato manualmente prima, è richiesto al driver del database
 di ricavarlo dalle tabelle di sistema del db (che varieranno in base al db). 


Il modulo DbList si inizializza con il metodo init, che legge la configurazione dei db esistenti, in particolare, 
 è un file json che memorizza un dictionary del tipo "codice db"=> impostazioni del db, ad esempio:

```
{
    "main": {
    "server": "192.168.10.122,1434",
    "useTrustedConnection": false,
    "user": "nino ",
    "pwd": "yourPassword",
    "database": "dbName",
    "sqlModule": "jsSqlServerDriver", 
    "defaultSchema": "amministrazione",
    "persisting": true
   }
}
```

sqlModule è il nome del SqlDriver da caricare in corrispondenza di questo db. Potrebbe anche essere, ad esempio, 
 jsMySqlDriver. I dati contenuti in questo file saranno passati pari pari al costruttore del DataAccess quando
 sarà necessario creare una connessione al db.
 
Tale file potrà contenere anche più di una descrizione di database all'occorrenza.

Tramite la funzione getDbInfo esportata dal modulo jsDbList possiamo ottenere le informazioni relative ad un database.
Queste informazioni sono quelle lette con la funzione init, e possono includere anche altri campi custom ove desiderato.

Analogamente con setDbInfo le possiamo impostare. Le modifiche saranno anche salvate sul file utilizzato in fase di 
 init, quindi le ritroveremo alla prossima inizializzazione.

Con le funzioni getConnection(dbCode) e getDataAccess(dbCode) esposte dal modulo jsDbList è possibile ottenere 
 una connessione fisica (Connection) o un'istanza di un DataAccess al db avente uno specifico dbCode.
La classe Security associata ai DataAccess dello stesso DataBase è un singleton condiviso tra tutti DataAccess 
 connessi allo stesso dbCode, per motivi di efficienza.

Tuttavia di solito non richiamiamo direttamente le funzioni getConnection o getDataAccess di dbList, ma lo facciamo
 indirettamente tramite la classe JsConnectionPool. Quest'ultima gestisce un pool di connessioni
 allo stesso dbCode, ed espone un metodo getDataAccess che restituisce un JsConnectionPool, che espone a sua volta
 un metodo getDataAccess che  dà l'effettivo DataAccess. E' possibile poi rilasciare la connessione tramite il metodo
 release di JsConnectionPool.

E comunque normalmente queste operazioni sono tutte svolte dalla classe jsApplication e di solito non vengono usate
 visto che abbiamo già a disposizione la connessione al db in req.app.locals.context.sqlConn (la Connection fisica)
 req.app.locals.context.dataAccess (il [DataAccess](DataAccess.md)). 

Anche la deallocazione è effettuata automaticamente dalla jsApplication.


