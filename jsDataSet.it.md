# jsDataSet
DataSet di .Net disponibile per JavaScript (e molto altro)

# Sommario
Un **DataSet** è una collezione di DataTable e relazioni tra tabelle (DataRelation).

I metodi del DataSet sono:

## DataSet

- **rejectChanges()**: chiama `rejectChanges()` su ogni DataTable del DataSet, riportando il DataSet all'ultimo stato raggiunto quando `acceptChanges()` è stato chiamato l’ultima volta.
- **acceptChanges()**: chiama `acceptChanges()` su ogni DataTable del DataSet, rendendo permanenti i cambiamenti e portando lo stato delle righe a `DataRowState.unchanged`.
- **hasChanges()**: restituisce `true` se una qualsiasi tabella contiene righe in stato diverso da `unchanged`.
- **newTable({string}tableName)**: crea una nuova DataTable e la aggiunge al DataSet. Restituisce la DataTable creata.
- **addTable({DataTable}t)**: aggiunge una tabella al DataSet.
- **newRelation()**: crea una nuova DataRelation nel DataSet (vedi dettagli nella jsDoc).
- **getParentChildRelation(parentName, childName)**: restituisce le relazioni in cui `parentName` è la tabella padre e `childName` la figlia.
- **clone()**: clona un DataSet replicandone la struttura, ma senza copiare alcuna ObjectRow.
- **copy()**: crea una copia del DataSet includendo struttura e righe. Ogni riga mantiene il proprio stato.
- **cascadeDelete(row)**: elimina una riga con tutte le subentità figlie. Le figlie che non sono subentità vengono scollegate.
- **serialize(serializeStructure)**: crea una versione serializzabile del DataSet (convertibile in JSON).
- **deserialize(d, serializeStructure)**: ripristina i dati da un oggetto ottenuto con `serialize()`.
- **mergeAsPut(d)**: unisce i cambiamenti da `d`. Le righe non esistenti vengono aggiunte, mentre quelle in conflitto aggiornate.
- **mergeAsPost(d)**: tutte le righe da `d` vengono aggiunte così come sono, nello stato `ADDED`.
- **mergeAsPatch(d)**: aggiorna le righe di questo DataSet rendendole uguali a quelle contenute in `d`. Solo le righe comuni vengono modificate.
- **merge(d)**: unisce tutte le righe da `d` nello stesso stato in cui si trovano in `d`.
- **importData(d)**: importa tutti i dati attuali da `d`, nello stato `unchanged`.

## DataRelation
Una **DataRelation** è un oggetto che permette di navigare da una riga di una tabella ad altre righe nella stessa o in un’altra tabella, confrontando i campi padre con quelli figli.

## DataTable
Una **DataTable** è un insieme di DataRow, e può (e dovrebbe) avere una chiave primaria. Sono disponibili funzioni per gestire colonne autoincrementali e valori di default per nuove righe.

Alcuni metodi di DataTable:

- **newRow(o, parentRow)**: aggiunge una nuova DataRow alla tabella, con valori in `o` e, se fornita, una riga padre. Vengono applicati i default prima della creazione e calcolati i valori temporanei dopo.
- **add(o)**: aggiunge un oggetto alla tabella impostandone lo stato su `added`, esattamente com'è.
- **acceptChanges()**: rende permanenti le modifiche in ogni riga e imposta lo stato su `unchanged`.
- **rejectChanges()**: annulla le modifiche in ogni riga, riportandole a `unchanged`.
- **hasChanges()**: restituisce `true` se esistono righe in stato diverso da `unchanged`.
- **select({sqlFun}filter)**: cerca le righe che soddisfano una condizione (righe eliminate escluse).
- **selectAll({sqlFun}filter)**: cerca le righe che soddisfano una condizione (righe eliminate incluse).
- **key()**: ottiene o imposta la chiave primaria della tabella.
- **clear()**: rimuove tutte le righe dalla tabella, che diventa `unchanged`.
- **detach(obj)**: rimuove una riga dalla tabella.
- **load(obj)**: carica un oggetto nella tabella impostando lo stato su `unchanged`.
- **getChanges()**: restituisce tutti gli oggetti modificati/eliminati/aggiunti.
- **getSortedRows(sortOrder)**: restituisce un array ordinato di righe, senza modificare la tabella.
- **autoIncrement(fieldName, autoIncrementInfo)**: ottiene o imposta le proprietà autoincrementali di una colonna.
- **serialize(serializeStructure)**: crea una versione serializzabile della DataTable (convertibile in JSON).
- **deserialize(d, serializeStructure)**: ripristina i dati da un oggetto serializzato.
- **parentRelations()**: restituisce tutte le relazioni in cui questa tabella è figlia.
- **childRelations()**: restituisce tutte le relazioni in cui questa tabella è padre.
- **mergeArray(arr, overwrite)**: aggiunge un array di oggetti come `unchanged`. Se `overwrite` è `true`, le righe esistenti vengono aggiornate, altrimenti ignorate.
- **mergeAsPut(t)**, **mergeAsPost(t)**, **mergeAsPatch(t)**, **merge(t)**: analoghi a quelli del DataSet.

* Se una riga non è presente, viene aggiunta. Se è presente, viene aggiornata.
* Si assume che questa tabella sia inizialmente `unchanged`.

## ObjectRow
Un **ObjectRow** è un oggetto semplice associato a una classe “fantasma” che lo osserva, ovvero un DataRow.  
Dato un oggetto `o`, chiamare `r = new DataRow(o)` crea un DataRow legato a `o`. In ogni caso, spesso non è necessario invocare direttamente il costruttore.

Dopo `new DataRow(o)`, `o` diventa un "objectRow" legato al DataRow creato. Chiamando `o.getRow()` otteniamo il DataRow collegato.

L’oggetto `o` può essere modificato liberamente.

## DataRow
L’oggetto DataRow ha molte funzioni utili che operano sull’ObjectRow collegato:

- **del()**: marca la riga come "deleted".
- **detach()**: elimina la riga perdendo tutte le modifiche.
- **rejectChanges()**: annulla tutte le modifiche fatte dall’ultimo `acceptChanges()`. Una riga `deleted` torna `unchanged`, una `added` diventa `detached`.
- **acceptChanges()**: rende le modifiche permanenti e porta lo stato a `unchanged`. Se era `deleted`, diventa `detached` e viene rimossa.
- **getValue(field, version)**: ottiene il valore di un campo. `version` può essere `original` o `current`.
- **originalRow()**: restituisce una copia dei valori originali. Se lo stato è `added`, restituisce `undefined`.
- **makeSameAs(r)**: rende questa riga identica a un’altra (stato, valori originali e attuali).
- **patchTo(o)** / **makeEqualTo(o)**: aggiorna i valori attuali della riga in base a `o`. La seconda rimuove anche i campi non presenti in `o`.
- **getAllParentRows()**, **getAllChildRows()**, **getParentsInTable()**, **getChildInTable()**, **getParentRows()**, **getChildRows()**: metodi per navigare tra righe correlate nel DataSet.
- **keySample()**: restituisce un oggetto con tutti i campi chiave della riga.

Una DataRow ha uno **stato**, che può essere:

- `added`
- `unchanged`
- `modified`
- `deleted`
- `detached`

È possibile accedere ai valori vecchi/nuovi usando `getValue(fieldName, dataRowVersion)`, dove `dataRowVersion` può essere `original` o `current`.

È anche possibile accettare/rifiutare modifiche a livello di DataTable o DataSet, o unire i cambiamenti da un DataSet a un altro (vedi `importData`, `mergeAsPatch`, `mergeAsPost`, `mergeAsPut`).

Un DataSet può essere serializzato/deserializzato in un oggetto semplice (inclusi valori originali/modificati). La versione serializzata può anche contenere la struttura (chiavi, relazioni, default, ordinamenti, colonne autoincrementali, ecc.).

È anche possibile eliminare una riga con tutte le sue figlie (in modo ricorsivo) tramite `cascadeDelete(row)`.

## objectRow e Proxy
Gli oggetti memorizzati in una DataTable sono "objectRow", cioè oggetti racchiusi in un Proxy che tiene traccia delle modifiche, per poter accedere sia ai valori attuali che a quelli originali.

Un objectRow si ottiene partendo da un oggetto semplice con il costruttore `DataRow`.  
Il DataRow aggiunge la funzione `getRow()` all’oggetto, che restituisce il DataRow collegato.

Quindi, dato un `DataRow DR`, `DR.current` è il proxy che racchiude l’oggetto `o`, mentre `o.getRow()` restituisce `DR`.

Una lista completa delle funzioni disponibili è nella documentazione YUI generata automaticamente.

Dettagli completi [qui](docs/module-DataSet.html)

Esempi con DataSet:

```js
    const dsSpace = require('../../client/components/metadata/jsDataSet'); 
    const q = require('../../client/components/metadata/jsDataQuery');
    let ds = new dsSpace.DataSet('temp');  
    t = ds.newTable('tab');
    const o1 = {a: 1, b: 2};
    t.add(o1); 
    expect(o1.getRow().state).toBe(dsSpace.dataRowState.added);
```

Quando un oggetto semplice viene aggiunto a una DataTable, viene arricchito con un oggetto DataRow e un metodo getRow() che lo restituisce.

È possibile operare direttamente con gli oggetti originali e lo stato del DataRow rimane sincronizzato automaticamente.

Test unitari completi sono disponibili [qui](test/client/jsDataSetSpec.js)

Esempio di rejectChanges():
```js
    t = ds.newTable('tt');
    p = t.load({a: 1, b: 2, c: 'a'});  // carica o nella tabella come unchanged
    o = p.current; // o è il valore corrente della riga
    o.a = 2
    expect(o.a).toBe(2);
    expect(o.getRow().originalRow().a).toBe(1); // valore originale del campo
    o.getRow().rejectChanges(); // oppure anche o.$rejectChanges;
    expect(o.a).toBe(1);
```

Esempio con select:

```js
    expect(t.select(q.eq('a', 1)).length).toBe(1);  //select selects a set of rows given a filter
```





![](https://travis-ci.org/gaelazzo/jsDataSet.svg?branch=master)



