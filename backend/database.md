# Estructura de Base de Dades per Eraswap

## Descripció General
Aquest document defineix l'estructura de la base de dades de MongoDB per l'aplicació Eraswap.
Els models complets es troben a la carpeta `models/`


## Col·leccions

### Users
Informació bàsica dels usuaris, universitat d'origen i d'intercanvi. 

### Products
Articles que els estudiants posen a la venda. Inclou títol, descripció, imatges, preu i ubicació

### Transactions
Registre de les compres amb l'estat actual i les parts implicades (comprador i venedor)

### Conversaions i Messages
Gestionen el xat intern. Cada conversa pot tenir múltiples missatges.

### Posts
Conté les publicacions del feed social de l'aplicació

### AIAssistantLogs
Registre de les consultes realitzades a l'assisten IA.

### Altres col·leccions
- **Country**
- **Ciy**
- **University**


Totes les col·leccions disposen de camps `createdAt` i `updatedAt` així com referències mitjançat IDs de MongoDB.

Les relacions es basen en referències entre documents utilitzant ObjectId.