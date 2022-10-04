# MetaData

La classe MetaData  è usata per centralizzare le informazioni relative alle tabelle del database, in particolare
 ogni classe derivata, che deve chiamarsi meta_[tablename] contiene le informazioni sulla tabella tablename.

È importante il nome della classe e del file per come questo viene poi caricato da disco quando richiesto, in modo lazy.

Le istanze delle classi derivanti da MetaData in questo documento sono chiamate metadati.

I metodi della classe MetaData sono perlopiù dei segnaposti dove inserire determinate informazioni su una tabella o 
 vista, che poi saranno eventualmente utilizzati dal framework e dal resto del proprio applicativo alla bisogna.

Sono pertanto un meccanismo per far si che esista un posto unico e noto a tutti gli sviluppatori e manutentori per
 descrivere i vari aspetti di ogni tabella, in modo che sia unico e accessibile ovunque.


## Uso trasversale 
La classe MetaData è gestita in modo tale da poter essere usata sia sul client che sul server.
Nel codice un metadato comune a client e server è quindi impossibile accedere a proprietà della classe AppMeta del 
 client.


### Istanziare un metadato
Il metodo d'istanziazione di un oggetto di tipo MetaData cambia a seconda del contesto:

- nel codice di un metadato il metodo corretto per istanziare un metadato è invocare this.getMeta. Questo in modo 
  identico sia lato client che lato server, cosi da poter usare e manutenere un unico file per metadato.
- al di fuori del codice di un metadato:
    - nel client: invocare il metodo getMeta dell'oggetto appMeta, che è l'applicativo del frontend myKode_Frontend
    - lato server il metodo corretto per instanziare un metadato è invocare la funzione getMeta del Context

### Accesso ai dati
I metodi che intendono accedere ai dati lo fanno mediante la proprietà getData della classe, che a seconda del contesto
di esecuzione sarà una classe che si interfaccia ai web service del server (se eseguita lato client) oppure una
classe con identica interfaccia che invoca i metodi della classe [GetData](jsGetData.md).


La classe MetaData espone quindi una serie di metodi che descrivono specifiche proprietà delle tabelle:

#### {object} isValid({DataRow}r)
Stabilisce se una riga è valida o meno. Si intende contenere delle verifiche semplici, da eseguirsi sul client
 senza uso di web services, altrimenti potrebbe essere meglio implementato come logica di Business.

Restituisce un Deferred a un oggetto così strutturato:
```js
{  
    {string} warningMsg,  //messaggio di avviso se trattasi di messaggio ignorabile
    {string} errMsg,      //messaggio di errore se trattasi di messaggio non ignorabile
    {string} errField,    //campo che ha generato il problema 
    {object} row          //riga che ha generato il problema
}
```
lato client, ove vi sia un messaggio ignorabile, di solito è mostrato per conferma. I messaggi non ignorabili invece
 determinano implicitamente una condizione di non validità.
Lato server è possibile inserire un'invocazione del metodo isValid ma di solito questa è effettuata sul client. 

### getNewRow ({objectRow} parentRow, {DataTable} dtDest)
Crea una riga nella tabella dtDest (che sarà del tipo associato al metadato corrente), avente come riga parent
(opzionale) la riga parentRow.

In questo metodo è possibile definire tutte le proprietà dei campi ad autoincremento specifiche della tabella.

Le proprietà ad autoincremento sono descritte nel documento [PostData](PostData.md) e si impostano
 tramite il metodo AutoIncrementColumn della classe DataTable.

Le proprietà vanno impostate prima di richiamare il metodo getNewRow della classe base.

Tipicamente quindi il metodo getNewRow di un metadato (derivato da MetaData) imposterà alcune proprietà delle colonne 
 del DataTable dtDest e poi richiamerà il metodo getNewRow della classe base, girando il risultato al chiamante. 

La classe base (MetaData) di suo si occupa d'impostare i default sulle colonne ove siano stati definiti, di 
 richiamare il metodo newRow del DataTable e calcolare tutti i valori temporanei per le colonne definite come
 ad autoincremento.


Volendo impostare ad esempio la colonna idorder come autoincremento, il metodo potrebbe essere ridefinito come:
```js
    getNewRow: function (parentRow, dt, editType){ 
        dt.autoIncrement('idorder', { });	
        return this.superClass.getNewRow(parentRow, dt, editType);
    }
```
Volendo invece avere anche una colonna nOrder che parte da 1 ogni anno (yOrder) potremmo avere:
```js
    getNewRow: function (parentRow, dt, editType){ 
        dt.autoIncrement('idorder', { });
        dt.autoIncrement('nOrder', {selector:['yOrder']});
        return this.superClass.getNewRow(parentRow, dt, editType);
    }
```
Se poi volessimo far variare la numerazione in base al campo "tipo ordine", idOrderKind, avremmo:
```js
    getNewRow: function (parentRow, dt, editType){ 
        dt.autoIncrement('idorder', { });
        dt.autoIncrement('nOrder', {selector:['yOrder','idOrderKind']});
        return this.superClass.getNewRow(parentRow, dt, editType);
    }
```
Se volessimo inserire un certo numero di ordini nella stessa transazione e volessimo essere sicuri che la numerazione
 ottenuta nel salvataggio non andrà mai in conflitto con quella nelle righe ancora da inserire potremmo impostare
 un valore minimo per i valori temporanei (in memoria):
 ```js
    getNewRow: function (parentRow, dt, editType){
        dt.autoIncrement('idorder', { });
        dt.autoIncrement('nOrder', {minimum:99990001, selector:['yOrder','idOrderKind']});
        return this.superClass.getNewRow(parentRow, dt, editType);
    }
```
Questo accorgimento non è mai necessario se si inserisce una riga alla volta nella stessa tabella. Viceversa,
 i valori effettivi ottenuti in fase di salvataggio potrebbero andare in conflitto con i valori temporanei delle altre
 righe nel dataset ancora non inviate al database.

### {string[]} primaryKey
Restituisce l'elenco dei campi chiave della tabella o vista. Per le viste risulta indispensabile poiché il
 DbDescriptor non è in grado in autonomia di ricavare la chiave di una vista. 

A ogni modo quando si disegna il DataSet è bene impostare la chiave primaria di ogni tabella/vista inserita in esso.


### describeAColumn()
Imposta le informazioni su una colonna, quali se ammette null, la caption etc.
Queste informazioni sono valutate quando è visualizzata la colonna in un determinato elenco.

### {[sqlFun](jsDataQuery.md)} insertFilter
Deve restituire un filtro da usare quando una riga di questa tabella è ricercata nell'ambito di una riga 
 (di un'altra tabella) è in inserimento. Ossia come riferimento esterno di una riga in stato di inserimento.

Ad esempio, è possibile che solo le righe marcate come "attive" di una tabella siano attribuibili ad altre tabelle
 quando si creano in esse nuove righe. 

In questo caso sarà possibile ridefinire questo metodo per restituire il filtro sul campo attivo.


### {[sqlFun](jsDataQuery.md)} searchFilter
Deve restituire un filtro da usare quando un valore di un campo di questa tabella è usato per filtrare un'altra tabella
 in una maschera di ricerca, ossia come riferimento esterno in fase di ricerca sulle altre tabelle.

### {Promise<DataTable>} describeColumns({DataTable} table, {string} listType)
Descrive le proprietà di uno o più elenchi, ossia modi di visualizzazione di una tabella o vista.
Le proprietà sono descritte attraverso le proprietà delle colonne del DataTable.
Consiste di solito in una serie di chiamate alla funzione describeAColumn prima citata.

### {[sqlFun](jsDataQuery.md)} getStaticFilter({string} listType)
Restituisce un filtro da applicare sempre quando c'è da effettuare la lettura di un elenco "listType" sulla tabella
 o vista relative al metadato.

È usata nei servizi esposti al client che restituiscono degli elenchi, ed eventualmente anche nel client.

### {string} getName
Restituisce il nome applicativo della tabella o vista, da usare ad esempio nei messaggi.

### setDefaults({DataTable} t)
Imposta i valori di default per le colonne quando sono create nuove righe della tabella. Tali valori sono memorizzati
 nelle proprietà del  [DataTable](jsDataSet.md) stesso e sono utilizzati quando si richiama il metodo newRow del 
 [DataTable](jsDataSet.md)

La classe MetaPage di myKode invocano questo metodo, per ogni entità e subentità, all'avvio di ogni maschera, 
 in modo che i default siano applicati nei successivi inserimenti di righe.


### {string} getSorting(t)

Restituisce l'ordinamento da applicare alla tabella quando viene letta. Ove restituisca undefined, solitamente è 
 considerato il risultato di t.orderBy() ossia l'ordinamento associato al [DataTable](jsDataSet.md)


setOrderBy





