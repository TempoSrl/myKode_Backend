[![en](https://img.shields.io/badge/lang-en-green.svg)](https://github.com/TempoSrl/myKode_Backend/tree/main/Security.md)

# Security

[Security](src/jsSecurity.md) � una classe che si occupa di raccogliere e fornire le condizioni 
di sicurezza sulle operazioni possibili sulle tabelle.
Per ogni combinazione tabella/operazione � possibile avere pi� condizioni, che complessivamente determinano
se l'utente ha o meno il diritto di effettuare una operazione.

La classe [SecurityProvider](src/jsSecurity.md#securitysecurityprovider) legge le righe della tabella
customgroupoperation del database e decodifica il suo contenuto nella classe Security.
In particolare, i campi testuali allow e deny sono convertiti in una [sqlFun](jsDataQuery.md), ossia una
funzione che data una riga calcola un valore, che sar� true o false a seconda che l'operazione richiesta sia
ammissibile o meno.

La tabella customgroupoperation ha 3 campi, che descrivono una condizione di sicurezza:
- defaultIsDeny: pu� valore S o N, se S il default � "vieta tutto", altrimenti � "consenti tutto"
- allowcondition: condizione di l'abilitazione
- denycondition: condizione di divieto
I tre campi di una riga si combinano in questo modo:
- se defaultIsDeny � "S" e c'� solo allowcondition, saranno abilitate solo le righe individuate dalla allowcondition. 
 Se � specificata anche la denycondition, le righe individuate dalla denycondition saranno comunque vietate
- se defaultIsDeny � "N" e c'� solo la denycondition, saranno vietate solo le righe individuate dalla denycondition. 
 Se � specificata anche la allowcondition, saranno anche consentite le righe individuate dalla allowcondition

In sintesi, se defaultIsDeny = 'S' il significato della terna �  allow and not deny, altrimenti � not deny or allow.

Tutte le righe che si riferiscono alla stessa combinazione tabella/operazione sono messe in un or logico, per cui basta 
 che una di esse autorizzi l'operazione ai fini della valutazione complessiva.

Ogni condizione denycondition e allowcondition � un'espressione pseudo-sql in cui � possibile utilizzare:
- nomi di campi dell'oggetto dell'autorizzazione
- costanti numeriche o stringhe 
- operatori sql come like, between, in, not in
- "list" per creare una lista con quello che segue tra parentesi tonde
- operatori aritmetici e di confronto 
- operatori booleani and or not
- operatori bitwise ~ & |

Il risultato dell'espressione deve essere un valore booleano.

Per dettagli sulle potenzialit� delle sqlFun leggere [jsDataQuery](jsDataQuery.md)

La classe Security espone il metodo canPost, che stabilisce se la modifica implicitamente
 individuata da una riga in base al suo stato e al valore dei suoi campi sia ammissibile 
 o meno.

Tale metodo � invocato dalla classe [PostData](PostData.md), per ogni riga oggetto di scrittura sul database,
 che annulla la transazione ove il metodo dovesse restituire false.



