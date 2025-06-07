# Estructura de Base de Dades per Eraswap

## Descripció General
Aquest document defineix l'estructura de la base de dades de MongoDB
per l'aplicació Eraswap, una plataforma decompra-venda de productes de
segona mà per estudiants d'Erasmus.
La base de dades esta disenya per soportar les funcionalitats requerides, incloint la gestió d'usuaris, productes, transaccions, missatgería, feed social i el sistema d'assistència basat en intel·ligència artificial.



## Colecciones

### 1. Users
Recull informació sobre els usuaris registrats a la plataforma.

```javascript
{
  _id: ObjectId,
  email: String,
  password: String (hashed),
  name: String,
  profilePicture: String (URL),
  university: {
    home: String,
    exchange: String
  },
  country: {
    origin: String,
    exchange: String
  },
  languages: [String],
  bio: String,
  joinDate: Date,
  lastActive: Date,
  rating: {
    average: Number,
    count: Number
  },
  preferences: {
    notifications: Boolean,
    language: String,
    currency: String,
    privacySettings: {
      showEmail: Boolean,
      showPhone: Boolean,
      showUniversity: Boolean
    }
  },
  savedProducts: [ObjectId], // Referencias a productos guardados
  contactInfo: {
    phone: String,
    whatsapp: String,
    telegram: String
  },
  status: String, // "active", "inactive", "suspended"
  role: String, // "user", "admin"
  verificationStatus: {
    email: Boolean,
    studentId: Boolean
  }
}
```

### 2. Products
Almacena información sobre los productos disponibles para venta.

```javascript
{
  _id: ObjectId,
  seller: ObjectId, // Referencia al usuario vendedor
  title: String,
  description: String,
  category: String, // "furniture", "electronics", "books", "clothing", etc.
  condition: String, // "new", "like new", "good", "fair", "poor"
  price: {
    amount: Number,
    currency: String,
    negotiable: Boolean
  },
  images: [String], // URLs de imágenes
  location: {
    city: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    meetupPreferences: String
  },
  status: String, // "available", "reserved", "sold", "deleted"
  createdAt: Date,
  updatedAt: Date,
  expiresAt: Date,
  views: Number,
  saves: Number,
  tags: [String],
  originalPrice: Number, // Precio original (si aplica)
  shippingOptions: {
    pickup: Boolean,
    delivery: Boolean,
    shippingCost: Number
  }
}
```

### 3. Transactions
Registra las transacciones entre compradores y vendedores.

```javascript
{
  _id: ObjectId,
  product: ObjectId, // Referencia al producto
  seller: ObjectId, // Referencia al vendedor
  buyer: ObjectId, // Referencia al comprador
  price: {
    amount: Number,
    currency: String
  },
  status: String, // "initiated", "pending", "completed", "cancelled"
  createdAt: Date,
  updatedAt: Date,
  completedAt: Date,
  meetupDetails: {
    date: Date,
    location: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  paymentMethod: String, // "cash", "transfer", "other"
  notes: String
}
```

### 4. Messages
Almacena los mensajes entre usuarios.

```javascript
{
  _id: ObjectId,
  conversation: ObjectId, // Referencia a la conversación
  sender: ObjectId, // Referencia al remitente
  receiver: ObjectId, // Referencia al destinatario
  content: String,
  timestamp: Date,
  read: Boolean,
  attachments: [String], // URLs de archivos adjuntos
  relatedProduct: ObjectId // Referencia al producto (opcional)
}
```

### 5. Conversations
Gestiona las conversaciones entre usuarios.

```javascript
{
  _id: ObjectId,
  participants: [ObjectId], // Referencias a los usuarios participantes
  lastMessage: {
    content: String,
    timestamp: Date,
    sender: ObjectId
  },
  product: ObjectId, // Referencia al producto (opcional)
  createdAt: Date,
  updatedAt: Date,
  status: String // "active", "archived"
}
```

### 6. SocialPosts
Almacena publicaciones del feed social.

```javascript
{
  _id: ObjectId,
  author: ObjectId, // Referencia al usuario autor
  content: String,
  images: [String], // URLs de imágenes
  tags: [String],
  location: {
    city: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  createdAt: Date,
  updatedAt: Date,
  likes: Number,
  comments: [
    {
      user: ObjectId,
      content: String,
      timestamp: Date
    }
  ],
  category: String, // "experience", "question", "recommendation", "event"
  visibility: String, // "public", "university", "followers"
}
```

### 7. Notifications
Gestiona las notificaciones para los usuarios.

```javascript
{
  _id: ObjectId,
  recipient: ObjectId, // Referencia al usuario destinatario
  type: String, // "message", "transaction", "social", "system"
  content: String,
  relatedTo: {
    type: String, // "product", "message", "user", "post"
    id: ObjectId
  },
  read: Boolean,
  createdAt: Date,
  expiresAt: Date
}
```

### 8. Reviews
Almacena las valoraciones y comentarios de usuarios.

```javascript
{
  _id: ObjectId,
  reviewer: ObjectId, // Referencia al usuario que hace la valoración
  reviewed: ObjectId, // Referencia al usuario valorado
  transaction: ObjectId, // Referencia a la transacción (opcional)
  rating: Number, // 1-5
  comment: String,
  createdAt: Date,
  updatedAt: Date,
  helpful: Number, // Número de usuarios que encontraron útil esta valoración
  response: {
    content: String,
    timestamp: Date
  }
}
```

### 9. AIAssistantLogs
Registra las interacciones con el asistente de IA.

```javascript
{
  _id: ObjectId,
  user: ObjectId, // Referencia al usuario
  query: String,
  response: String,
  timestamp: Date,
  category: String, // "erasmus_info", "bureaucracy", "adaptation", "translation", "emotional_support"
  feedback: {
    helpful: Boolean,
    comments: String
  },
  context: [String] // Contexto previo de la conversación
}
```

### 10. Categories
Almacena las categorías de productos disponibles.

```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  icon: String, // URL del icono
  parent: ObjectId, // Referencia a categoría padre (opcional)
  subcategories: [ObjectId], // Referencias a subcategorías
  status: String // "active", "inactive"
}
```

### 11. Universities
Almacena información sobre universidades participantes en programas Erasmus.

```javascript
{
  _id: ObjectId,
  name: String,
  country: String,
  city: String,
  coordinates: {
    latitude: Number,
    longitude: Number
  },
  website: String,
  erasmusCode: String,
  contactInfo: {
    email: String,
    phone: String
  },
  studentsCount: Number // Número aproximado de estudiantes Erasmus
}
```