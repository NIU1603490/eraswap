# Backend d'Eraswap

Aquest directori conté la implementació del backend per a l'aplicació **Eraswap**, una plataforma de compra-venda de productes de segona mà dissenyada per a estudiants d'Erasmus.

Servidor API REST desenvolupat amb **Node.js** i **Express** connectat amb MongoDB.

## Tecnologies Utilitzades
- **Node.js**: Entorn d'execució per a JavaScript al costat del servidor.
- **Express**: Framework web per a Node.js.
- **MongoDB**: Base de dades NoSQL.
- **Mongoose**: ODM (Object Data Modeling) per a MongoDB.
- **Clerk**: Per l'autenticació d'usuaris
- **Cloudinary**: Gesió de les imatges
- **Socket.IO**: Comunicació en temps real per a la missatgeria

## Configuració ràpida
1. Instal·lar dependència
```bash
npm install
```
2. Crear un fitxer `.env`:
 ```bash
   MONGODB_URI=URL_de_mongo
   PORT=5000
   CLOUDINARY_CLOUD_NAME=el_teu_cloud
   CLOUDINARY_API_KEY=la_teva_api_key
   CLOUDINARY_API_SECRET=el_teu_api_secret
   CLERK_SECRET_KEY=clau_clerk
   OPENAI_API_KEY=opcional
   ```
3. Arrencar servidor


## Estructura bàsica

1. **Controladors**: Gestionen les sol·licituds  i retornen respostes.
2. **Rutes**: Defineixen els endpoints de l'API i els connecten amb els controladors.
3. **Models**: Defineixen l'estructura de les dades i la interacció amb la base de dades.
4. **Middlewares**: Processen les sol·licituds abans d'arribar als controladors per assegurar l'autenticació.

Consulta `database.md` per a informació sobre les col·leccions

## Executr les proves
Executa `npm test` per llançar Jest.