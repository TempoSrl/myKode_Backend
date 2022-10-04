# jsDbList

Il modulo jsDbList dichiara due classi


# Context

E' una classe che serve da cruscotto per tutte le informazioni relative al contesto 
 di esecuzione di una sessione. 

Le proprietà di un oggetto Context sono assegnate da jsApplication quando accetta 
 l'esecuzione di una route, tra queste distinguiamo:

### {string} dbCode
Codice del db usato (usato per richiamare la funzione **getDbInfo**) 

### {DbDescriptor} dbDescriptor
Istanza del DbDescriptor per il db connesso (è un singleton per-db)

### {PostData} createPostData
Funzione che crea una classe che implementa l'interfaccia di [PostData](PostData.md), in particolare
 l'implementazione di default restituisce un'istanza di [BusinessPostData](jsBusinessLogic.md).


### {GetDataInvoke} getDataInvoke
Funzione che crea un'istanza della classe GetDataInvoke associata al contesto corrente.
Questa classe ha la particolarità di poter essere invocata anche dai metadati, che sono condivisi tra client 
e server. 

Quando usata lato server i metadati faranno riferimento alla classe presente in client/components/metadata.
Quando usata lato client i metadati faranno riferimento alla classe getData associata ad appMeta.
Tuttavia nel metadato questo meccanismo è tutto trasparente al momento dell'utilizzo, 
 infatti basta usare l'istanza in (this).getData ove this è il Metadato stesso. La classe utilizzata nel client
 espone la stessa interfaccia di quella usata lato server, quindi il codice può girare indifferentemente.

Questo non toglie che in classi non condivise con il client l'applicazione possa usare la classe 
 [GetData](jsGetData.md)


### {sqlFormatter} formatter

SqlFormatter associato al db connesso, non dovrebbe servire a meno che non si intenda comporre manualmente 
dei comandi sql.

###  {Connection} sqlConn

{Connection} associata al db corrente, la Connection è una classe di livello più basso rispetto al DataAccess.
Per i dettagli consultare la relativa documentazione: [jsSqlDriver](src/jsSqlServerDriver.md) e
  [jsMySqlDriver](src/jsMySqlDriver.md).


###  {Environment} environment
[Environment](Environment.md) associato alla richiesta.


###  {DataAccess} dataAccess
[DataAccess](DataAccess.md) associato alla richiesta


Complessivamente, il Context ha tutte le informazioni che servono per poter operare sul database e tutta la 
 conoscenza sull'utente connesso. In ogni middleware, è accessibile nella proprietà

            req.app.locals.context



# DbDescriptor

Classe che conosce la struttura delle tabelle e delle viste ed è utilizzabile, ad esempio, per creare DataTable
 da aggiungere ai DataSet o per sapere ogni tabella quali campi ha e di che tipo sono, e quali sono chiave.

Di ogni DataBase è conservato in memoria sul server un solo DbDescriptor, per motivi di efficienza.


Principali metodi del DbDescriptor:

- table(tableName,tableDescriptor): legge o imposta il TableDescriptor di una tabella o vista. Se si tenta di leggere 
 un TableDescriptor non precedentemente impostato, sarà invocato il metodo tableDescriptor della Connection sottostante
 per ottenere le informazioni desiderate direttamente dalle tabelle di sistema del database.
- {DataTable} createTable(tableName): crea un DataTable con le colonne di una determinata tabella o vista
- forgetTable(tableName): cancella le informazioni su un DataTable cosi che alla prossima richiesta possano eventualmente
 essere ricalcolate 


## init
Il metodo init di DbDescriptor prevede in input il nome di un file che di norma è criptato ma può anche non esserlo
a seconda dei parametri:
- encryptedFileName nome del file criptato da leggere
- fileName nome del file da eventualmente creare decriptato
- encrypt  se true, il file letto è da criptare
- decrypt  se true, va creata una copia del file criptato, in chiaro
- key,iv,pwd parametri per decriptare o criptare il file

questo metodo legge le informazioni sulle connessioni (di tipo DbInfo di cui tra poco) in blocco.

È poi possibile comunque utilizzare i metodi getDbInfo/setDbInfo/delDbInfo per gestire le informazioni
lette dal file.

Il file di configurazione viene automaticamente aggiornato con le modifiche.


### TableDescriptor

E' una classe che descrive una tabella ed espone:

- string[] columnNames(): array dei nomi delle colonne
- ColumnDescriptor column(columnName): descrittore della colonna data
- describeTable({DataTable}t): aggiunge al DataTable t le colonne di questa tabella, in particolare impostando il nome 
 della colonna e le proprietà ctype,is_nullable,max_length di ogni colonna. Inoltre imposta la chiave del DataTable.
- string[] getKey(): array dei nomi delle colonne chiave


### ColumnDescriptor

Descrittore di colonna. Ha i seguenti campi:

- {string} name - nome campo
- {string} type - db type
- {string} ctype - tipo javascript 
- {number} max_length  - dimensione max bytes se stringa 
- {number} precision - n. cifre totali gestite per i decimal
- {number} scale - n. cifre decimali per i decimal
- {boolean} is_nullable - true se ammette null
- {boolean} pk - true se chiave primaria
 



# getDbInfo, setDbInfo, delDbInfo, existsDbInfo

Metodi per leggere / scrivere / eliminare / verificare la presenza delle informazioni di accesso a un database (DbInfo)

DbInfo è una struttura del tipo:
```js
    {
     server: "nome server",
     useTrustedConnection: true/false, id true user/pwd are not used
     user: "user to connect to db",
     pwd: "password to connect to db",
     database: "data base name",
     sqlModule: 'jsMySqlDriver' or 'jsSqlServerDriver'
    }
```
ed è necessaria al modulo jsDbList per sapere come costruire connessioni (Connection).


# getConnection

Funzione che, dato un dbCode, ne restituisce la Connection. Per il suo funzionamento, necessita che
sia stata precedentemente invocata setDbInfo per quel dbCode.
Si osservi come non esiste una classe Connection, che rappresenta solo un'interfaccia astratta.

L'istanza restituita sarà in realtà di tipo SqlServerConnection o MySqlConnection (o altro) a seconda
 del tipo di database.


# getDescriptor

Funzione che, dato un dbCode, ne restituisce il DbDescriptor. Il DbDescriptor è inserito in una cache,
ove ne è presente solo uno per ogni dbCode. 
Se non è già presente lo calcola, ma necessita che sia stata precedentemente invocata la setDbInfo
 per quel dbCode  o che la connessione richiesta fosse comunque nel file di configurazione usato 
per inizializzare la dbList.



# getDataAccess

Funzione che, dato un dbCode, ne ottiene una connessione (DataAccess). La chiusura della connessione è
a carico del chiamante.
Per il corretto funzionamento, richiede che sia stata precedentemente invocata la setDbInfo o che la connessione
 richiesta fosse comunque nel file di configurazione usato per inizializzare la dbList.