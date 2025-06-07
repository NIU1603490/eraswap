# Backend d'Eraswap

Aquest directori conté la implementació del backend per a l'aplicació **Eraswap**, una plataforma de compra-venda de productes de segona mà dissenyada per a estudiants d'Erasmus, amb un enfocament especial en facilitar l'intercanvi de productes dins de comunitats acadèmiques.

## Tecnologies Utilitzades

- **Node.js**: Entorn d'execució per a JavaScript al costat del servidor.
- **Express**: Framework web per a Node.js.
- **MongoDB**: Base de dades NoSQL.
- **Mongoose**: ODM (Object Data Modeling) per a MongoDB.
- **JWT**: JSON Web Tokens per a l'autenticació.


## Arquitectura

El backend segueix un patró MVC (Model-Vista-Controlador) adaptat per a APIs RESTful:

1. **Models**: Defineixen l'estructura de les dades i la interacció amb la base de dades.
2. **Controladors**: Gestionen les sol·licituds HTTP i retornen respostes.
3. **Rutes**: Defineixen els endpoints de l'API i els connecten amb els controladors.
4. **Middlewares**: Processen les sol·licituds abans d'arribar als controladors (per exemple, autenticació).