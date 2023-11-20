[![en](https://img.shields.io/badge/lang-en-green.svg)](https://github.com/TempoSrl/myKode_Backend/tree/main/PostData.md)
# PostData

La classe PostData consente di salvare il contenuto di interi DataSet sul Database.

Le modifiche sono ricavate dal DataSet in base allo stato delle righe presenti nelle sue tabelle.


### Ordine di salvataggio delle righe e tabelle
L'ordine di salvataggio delle righe dipende dalle relazioni delle tabelle e dallo stato delle righe, per cui
 le righe in inserimento delle tabelle parent saranno scritte prima delle righe child in inserimento.

All'opposto le righe da cancellare child saranno eliminate prima delle parent eventualmente da cancellare.

### Calcolo dei campi ad autoincremento
In base alle propriet� di autoincremento definite sulle colonne del DataSet, al momento del salvataggio 
 sono effettuati dei calcoli e conseguenti letture sul database per consentire di gestire dei campi 
 con una logica incrementale anche discretamente complessa e dipendente dagli altri campi della riga che si sta
 salvando.

A riguardo dei campi ad autoincremento, questi si impostano tramite le propriet� della classe [DataTable](jsDataSet.md) 
 , in particolare con il metodo AutoIncrementColumn(columnName, options), specificando nelle options:

- columnName: nome del campo ad autoincremento, ossia un campo che quando si salva una riga che � in stato di inserimento
 viene calcolato come massimo del valore di quella colonna, con eventuali altre condizioni e modalit� aggiuntive che
 ora vedremo.
- {string[]} selector: array di nomi di colonne selettore per il calcolo di questo campo. I selettori sono campi che 
 vengono confrontati per calcolare il max()+1 di un campo ad autoincremento quando � effettuato un inserimento della riga. 
 Ad esempio se i campi selettori sono A e B e l'oggetto da inserire � {N:1, A:'x', B:'y'}, la query per il calcolo del max sar� 
 del tipo select max(N) from table where A='x' and B='y', supponendo che N sia ad autoincremento
- {number[]} selectorMask sono delle maschere da applicare ai campi selettori. La maschera � in AND bitwise con il valore
 del selettore
- {string} prefixField nome campo prefisso da usare come prefisso dopo aver calcolato il valore del massimo. 
 Ad esempio se il campo prefixField � C e la riga da inserire � {N:'AAA1', C:'AAA'} sar� effettuata una query del tipo
 SELECT MAX(convert(int, substring(N,4,12) where N like 'AAA%'. 
- {string} middleConst valore costante che si va ad accodare al valore prefisso ottenuto con prefixField
- {int} idLen dimensione del campo ad autoincremento in caratteri quando consiste in una sottostringa, di default
 � 12



### Applicazione della Business logic
La classe PostData � predisposta per l'applicazione della BusinessLogic, infatti per ottenere 
l'oggetto che se ne occupa invoca il metodo getBusinessLogic, che di default restituisce una classe che non 
effettua alcun controllo, ma � facilmente ridefinibile, e questo � stato fatto nella classe
[BusinessPostData](jsBusinessLogic.md)
 

### Applicazione della logica di sicurezza
Per ogni riga da salvare � invocato il metodo canPost della classe Security, 
 al fine di verificare se l'utente ha la possibilit� di effettuare quella operazione.
L'istanza della classe Security � presa dalla propriet� security del Context passato nel metodo init. 
Basta che una sola riga non risulti inseribile/cancellabile/modificabile in base a tale criterio
 per annullare tutta la transazione.


Per quanto PostData sia una classe che effettua una funzione piuttosto complessa, i suoi metodi sono essenzialmente due:

- init({[DataSet](jsDataSet.md)} d, {[Context](Context.md)}c) che istruisce l'istanza della classe a salvare i dati del 
 DataSet d usando il contesto Context. � possibile salvare diversi DataSet contemporaneamente chiamando questo metodo
 pi� volte prima di invocare il metodo doPost
- doPost(options): salva tutti i DataSet specificati, restituendo una serie di messaggi ove
 vi siano regole di Business violate oppure errori nella scrittura sul DataBase

Le opzioni di doPost includono:
- isolationLevel: di default DataAccess.isolationLevels.readCommitted, livello di isolamento da usare nella transazione
- OptimisticLocking: � un'istanza di OptimisticLocking, che � una classe definita in [jsDataSet](jsDataSet.md) e il cui
 default � impostato dal metodo [createPostData](jsApplication.md) della classe jsApplication. 
- previousRules: � un elenco di messaggi di business da ignorare, qualora dovessero risultarne di uguali in fase di 
 salvataggio. Come vengono definite identiche dipende dal metodo getId della classe BasicMessage, che di solito confronta
 semplicemente il campo msg del messaggio stesso


## Salvataggi annidati
E' anche possibile un uso pi� avanzato, e documentato negli unit test, della classe PostData, ed � il salvataggio
 annidato.
Pu� essere utile se uno dei due DataSet da salvare non � disponibile inizialmente ma si pu� calcolare solo 
 dopo aver scritto i dati del primo sul DataBase (ma prima di aver effettuato il commit della transazione).
Con la modalit� annidata, � la classe PostData esterna che apre e chiude la transazione, e la classe PostData
 "interna" salva i dati e restituisce dei messaggi che sono uniti a quelli della classe esterna.

Il metodo usato a tale scopo � setInnerPosting, da chiamarsi sulla classe esterna, che prevede due parametri:

- DataSet dati da salvare nel posting annidato (ma non sono esaminati sin quando non � salvato quello esterno)
- innerPoster (di tipo IInnerPoster), classe da usare per inizializzare la classe PostData interna quando 
 quella esterna ha scritto i dati sul db.

La classe IInnerPoster � scritta in modo tale da poter essere facilmente ridefinita, in particolare:

- il costruttore crea una semplice classe PostData e la mette nella propriet� p. Si pu� ridefinire per creare 
 una classe diversa, ad esempio BusinessPostData, che deriva da PostData
- il metodo init, che richiama semplicemente p.setAsInnerPoster() e poi il metodo init di p con il dataset passato
 dal chiamante. In questa fase � possibile modificare il DataSet e fare qualsiasi tipo di modifica prima di richiamare
 il metodo init della classe interna.





