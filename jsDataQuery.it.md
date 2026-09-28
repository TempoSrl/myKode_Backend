# jsDataQuery
Funzioni di query convertibili in espressioni SQL

La documentazione jsDoc è disponibile [qui](client/components/metadata/jsDataQuery.md)

jsDataQuery consente di costruire espressioni generiche **{*sqlFun*}** che possono essere applicate a oggetti JavaScript.  
È poi possibile convertire tali espressioni in stringhe leggibili da SQL, semplicemente invocando il metodo `toSql` sull’oggetto.

Rappresentando un'espressione, una **sqlFun** è una composizione ad albero di altre sqlFun, dove le foglie sono espressioni costanti.

Una sqlFun, nel suo complesso, è essenzialmente una funzione `f(o)` che prende un oggetto `o` e applica un'espressione che coinvolge le proprietà dell'oggetto.  
Nell’espressione possiamo accedere alle proprietà di `o` usando la funzione `field(fieldName)`, dove `field` è essa stessa una sqlFun.

### Alcuni esempi di sqlFun:

```js
f = q.const(3); // funzione costante con valore 3, quindi f(x)=3 per ogni x
f = q.eq("a", 3); // funzione che confronta il campo "a" con 3 e restituisce true se sono uguali  quindi f(x) è true se x.a == 3
f = q.and(q.ge("b", 2), q.le("b", 4)); // f(x) è true quando x.b >= 2 e x.b <= 4
f = q.or(q.eq("a", 2), q.gt("b", 3)); // f(x) è true se x.a === 2 oppure x.b > 3
```
Cercare un valore in un array:

```js
    let x = [{a:1,b:2}, {a:2,b:2}, {a:3,b:1}];
    let el = x.find(q.and(q.eq("a", 2))); // el = {a:2,b:2}
```

Quindi una sqlFun si comporta come una normale espressione, con il vantaggio che è componibile e può essere passata come parametro come un qualsiasi altro oggetto.

Una sqlFun può quindi essere:

- applicata ad altri oggetti per valutarne l'espressione rappresentata
- convertita in stringa per visualizzarla
- convertita in stringa per essere utilizzata come espressione SQL
- serializzata e deserializzata per essere trasferita a client o servizi remoti


Come ulteriore vantaggio, esiste anche una [classe di utilità] (src/jsDataQueryParser.js) capace di convertire stringhe in sqlFun.


Il metodo **toSql** non è specifico di un singolo provider di database, infatti utilizza un formatter esterno alla classe.
Quindi è possibile interrogare qualsiasi tipo di database con la stessa {*sqlFun*}, purché venga fornito il formatter adatto per il database specifico.
In questo modo non ci si deve preoccupare del dialetto SQL specifico durante la costruzione della query.
Inoltre, la stessa query è anche applicabile ad oggetti JavaScript.

Esempio:

```js
    it('comparing values through field not equal', function () {
    var 	x = {a: 1, b: 2, c: 3},
    f = $q.eq($q.field('a'), 2);
    expect(f(x)).toBeFalsy();
    x.a=2;
    expect(f(x)).toBeTruthy();
    });
```

Le **sqlFun** sono anche altamente ottimizzate: se il motore rileva che possono essere semplificate, le tratta come costanti, ignorando la forma originale:

```js
    it('and of false function with other function should be the always false function', 	function(){
        var xx = {a: 'AABBCC', q: '1'},
            cond1 = $q.like('a', 'AAB_CC'),
            cond2 = $q.eq('q', 1),
            cond3 = $q.constant(false),
        f = $q.and(cond1, cond2, cond3);
        expect(f.isFalse).toBe(true);
    });
```

Nota che f.isFalse è una proprietà della funzione, non il risultato dell'applicazione della funzione a un argomento specifico.
Il motore ha rilevato che f è una funzione costante.

Se alcune parti di un'espressione sono undefined, l’espressione può comunque essere valutata correttamente:

```js
     it('and of a series of function including one undefined and one dinamically-false gives false', function () {
      	var xx = {a: 'AABBCC', q: '1'},
    		f = $q.and($q.like('a', 'AAB_CC'), $q.eq('q', 2), undefined);
      		expect(f(xx)).toBe(false);
    });
```

In questo caso f(xx) è false perché xx['q'] !== 2, quindi l'AND con l’altra funzione sarà comunque false, anche se alcune sono undefined.

Operatori con **"auto-field"**
Per comodità d'uso, molti operatori interpretano automaticamente il primo operando come nome di campo, se è una stringa. Ad esempio:

```js
    $q.eq('a',2)` 
```
significa: "dammi la funzione che confronta il campo chiamato 'a' con il valore 2".

Internamente, viene interpretato come:

```js
    $q.eq($q.field('a'), 2)
```

Dove $q.field(x) è la funzione che, applicata a un oggetto, restituisce il campo dell’oggetto chiamato x.

Esempio completo:

```js
     it('comparing values through field equal', function () {
      var 	x = {a: 1, b: 2, c: 3},
    		f = $q.eq($q.field('a'), 1);
			g = $q.eq('a', 1);
      	expect(f(x)).toBeTruthy();
      	expect(g(x)).toBeTruthy();
      	x.a=2;
      	expect(f(x)).toBeFalsy();
      	expect(g(x)).toBeFalsy();
    });
```
Qui f e g sono funzioni che confrontano il campo a dell’oggetto con il valore costante 1.

Una sqlFun è necessaria per usare molti metodi di [GetData](jsGetData.it.md), [DataAccess](DataAccess.it.md),
[PostData](PostData.it.md).
In altre parole, le sqlFun sono usate nel framework ogni volta che è richiesto un filtro o un'espressione.



![](https://travis-ci.org/gaelazzo/jsDataQuery.svg?branch=master)     










