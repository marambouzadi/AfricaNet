# AfricaNet — Backend E-Commerce API

> API REST Spring Boot pour une plateforme e-commerce de vente de produits reconditionnés (téléphones, accessoires, etc.).

---

## 🏗️ Stack Technique

| Couche            | Technologie                          |
|-------------------|--------------------------------------|
| Framework         | Spring Boot 4.1.0                    |
| Sécurité          | Spring Security 6 + JWT (JJWT 0.12) |
| Base de données   | PostgreSQL + Liquibase               |
| ORM               | Hibernate 6 / Spring Data JPA        |
| Mapping           | MapStruct 1.5+ + Lombok              |
| Documentation API | Springdoc OpenAPI / Swagger UI       |
| PDF               | iText 7                              |
| Java              | 17                                   |

---

## 🚀 Démarrage rapide

```bash
# Cloner le projet
git clone https://github.com/brnsmrt/africanet.git
cd africanet

# Lancer (PostgreSQL requis — voir application.properties)
./mvnw spring-boot:run
```

- **Swagger UI** : [http://localhost:8090/swagger-ui.html](http://localhost:8090/swagger-ui.html)
- **OpenAPI JSON** : [http://localhost:8090/v3/api-docs](http://localhost:8090/v3/api-docs)

---

## 🔐 Module Authentification & Sécurité

### Endpoints — `/api/auth`

| Méthode | Endpoint    | Description                        | Auth requise |
|---------|-------------|------------------------------------|--------------|
| `POST`  | `/register` | Inscription d'un nouvel utilisateur | Non          |
| `POST`  | `/login`    | Connexion (retourne JWT + refresh)  | Non          |
| `POST`  | `/logout`   | Invalidation du refresh token       | Oui          |
| `POST`  | `/refresh`  | Rafraîchissement du JWT             | Non (refresh token) |
| `GET`   | `/me`       | Récupère le profil de l'utilisateur connecté | Oui |

### Notes d'implémentation

- **JWT** : Tokens HMAC-SHA256, access token de courte durée + refresh token persisté en base.
- **BCrypt** : Hachage des mots de passe avec un `strength` de 12.
- **Stateless** : Aucune session HTTP — chaque requête porte son propre token Bearer.
- **Rôles** : `USER` (client) et `ADMIN` (gestionnaire), vérifiés par `@PreAuthorize`.
- **Base de données** : Schéma PostgreSQL géré par **Liquibase** (migrations auto au démarrage).
- **Mapping** : **MapStruct 1.5+** pour la conversion DTO ↔ Entités, avec liaison Lombok configurée dans le `pom.xml`.

---

## 📦 Module Gestion des Produits

### Endpoints — `/api/products`

| Méthode  | Endpoint        | Description                                             | Auth requise  |
|----------|-----------------|---------------------------------------------------------|---------------|
| `GET`    | `/`             | Liste paginée des produits avec filtres multi-critères  | Non           |
| `GET`    | `/{id}`         | Détail d'un produit par ID                              | Non           |
| `GET`    | `/search`       | Recherche full-text par mot-clé                         | Non           |
| `POST`   | `/`             | Créer un nouveau produit                                | `ADMIN`       |
| `PUT`    | `/{id}`         | Mettre à jour un produit existant                       | `ADMIN`       |
| `DELETE` | `/{id}`         | Désactiver (soft delete) un produit                     | `ADMIN`       |

### Filtres disponibles sur `GET /api/products`

| Paramètre    | Type             | Description                              |
|--------------|------------------|------------------------------------------|
| `categoryId` | `Long`           | Filtrer par catégorie                    |
| `brandId`    | `Long`           | Filtrer par marque                       |
| `condition`  | `ProductCondition` | `NEW`, `LIKE_NEW`, `GOOD`, `FAIR`     |
| `minPrice`   | `BigDecimal`     | Prix minimum (TND)                       |
| `maxPrice`   | `BigDecimal`     | Prix maximum (TND)                       |
| `page`, `size`, `sort` | `Pageable` | Pagination & tri Spring Data         |

### Modèle Produit

```
Product
├── id, name, sku, slug, description
├── basePrice, salePrice (TND)
├── condition        → ProductCondition (NEW / LIKE_NEW / GOOD / FAIR)
├── isActive         → soft delete
├── brand            → Brand (ManyToOne)
├── category         → Category (ManyToOne)
├── images           → List<ProductImage>
├── specifications   → List<ProductSpecification>
└── tags             → Set<Tag> (ManyToMany via ProductTag)
```

### Notes d'implémentation

- Les prix sont stockés en `NUMERIC(10,3)` (3 décimales — standard TND).
- La recherche full-text utilise une requête JPQL `LIKE` sur le nom, la description et le SKU.
- Le slug est généré automatiquement à la création pour les URLs SEO-friendly.
- Les images sont stockées sous forme d'URLs (CDN externe).

---

## 📊 Module Gestion des Stocks (Inventaire en Temps Réel)

### Endpoints — `/api/stock`

> ⚠️ Tous les endpoints de ce module sont réservés aux administrateurs (`ADMIN`).

| Méthode | Endpoint           | Description                                         |
|---------|--------------------|-----------------------------------------------------|
| `GET`   | `/`                | Liste paginée de tout l'inventaire                  |
| `GET`   | `/{productId}`     | État du stock d'un produit précis                   |
| `GET`   | `/alerts`          | Produits en alerte de stock bas (< seuil minimum)   |
| `PUT`   | `/{productId}`     | Appliquer un mouvement de stock sur un produit      |

### Types de mouvements (`MovementType`)

| Type          | Effet sur l'inventaire                                           |
|---------------|------------------------------------------------------------------|
| `IN`          | Entrée de marchandise → incrémente `quantity`                   |
| `OUT`         | Sortie physique → décrémente `quantity`                         |
| `ADJUSTMENT`  | Régularisation manuelle (positif ou négatif) → modifie `quantity` |
| `RESERVATION` | Réservation lors d'une commande → incrémente `reservedQuantity` |
| `RELEASE`     | Libération d'une réservation (annulation) → décrémente `reservedQuantity` |

### Modèle Inventaire

```
Inventory
├── id
├── product          → Product (OneToOne)
├── quantity         → stock physique total
├── reservedQuantity → quantité bloquée par des commandes en cours
├── quantityAvailable = quantity - reservedQuantity  (calculé)
├── minThreshold     → seuil d'alerte stock bas
├── warehouseLocation → localisation en entrepôt
└── lastUpdated
```

### Historique des mouvements (`InventoryMovement`)

Chaque appel à `PUT /api/stock/{productId}` génère automatiquement une entrée dans `inventory_movements` :

```
InventoryMovement
├── id
├── product
├── movementType   → IN / OUT / ADJUSTMENT / RESERVATION / RELEASE
├── quantity       → delta appliqué (signé)
├── quantityAfter  → stock après mouvement
├── referenceType  → ORDER / TRADE_IN / MANUAL
├── referenceId    → ID de la commande ou du dossier trade-in
├── notes
├── createdBy      → User (admin ayant effectué le mouvement)
└── createdAt
```

### Intégration avec les Commandes

Le stock est **automatiquement géré** lors des transitions de statut des commandes :

| Événement                          | Mouvement déclenché                              |
|------------------------------------|--------------------------------------------------|
| Création d'une commande            | `RESERVATION` (quantité bloquée par article)    |
| Annulation par le client ou admin  | `RELEASE` (réservation libérée par article)     |
| Passage en statut `SHIPPED`        | `RELEASE` puis `OUT` (sortie physique effective) |

### Notes d'implémentation

- La validation empêche les réservations dépassant le stock disponible (`quantity - reservedQuantity`).
- Les stocks négatifs sont refusés avec une `InsufficientStockException` (HTTP 400).
- L'`Authentication` Spring Security est injectée dans le service pour tracer l'auteur de chaque mouvement.

---

## 🛒 Module Gestion des Commandes

### Endpoints Client — `/api/orders`

> 🔐 Tous les endpoints nécessitent une authentification (token Bearer).

| Méthode | Endpoint           | Description                                     |
|---------|--------------------|-------------------------------------------------|
| `POST`  | `/`                | Créer une nouvelle commande                     |
| `GET`   | `/me`              | Historique paginé des commandes du client       |
| `GET`   | `/{id}`            | Détail d'une commande (propriétaire uniquement) |
| `PUT`   | `/{id}/cancel`     | Annuler une commande (PENDING ou CONFIRMED)     |
| `GET`   | `/{id}/invoice`    | Télécharger la facture PDF (iText 7)            |

### Endpoints Admin — `/api/orders` (admin)

| Méthode | Endpoint                  | Description                                |
|---------|---------------------------|--------------------------------------------|
| `GET`   | `/` (+ param `status`)    | Liste toutes les commandes, filtrables par statut |
| `GET`   | `/{id}`                   | Détail d'une commande quelconque           |
| `PUT`   | `/{id}/status`            | Changer le statut d'une commande           |

### Cycle de vie d'une commande (`OrderStatus`)

```
PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED → REFUNDED
    ↘          ↘           ↘
   CANCELLED  CANCELLED  CANCELLED
```

| Statut       | Description                          |
|--------------|--------------------------------------|
| `PENDING`    | En attente de confirmation           |
| `CONFIRMED`  | Confirmée par l'admin                |
| `PROCESSING` | En cours de préparation              |
| `SHIPPED`    | Expédiée (stock décrémenté)          |
| `DELIVERED`  | Livrée au client                     |
| `CANCELLED`  | Annulée (stock libéré)               |
| `REFUNDED`   | Remboursée                           |

### Calcul financier

```
totalAmount = subtotal + taxAmount + shippingAmount - discountAmount

TVA          = 19% du subtotal
Frais livraison = 7.000 TND (offerts si subtotal ≥ 200.000 TND)
```

### Modèle Commande

```
Order
├── id, orderNumber (unique, auto-généré)
├── userId
├── status          → OrderStatus
├── paymentStatus   → PaymentStatus (PENDING / PAID / FAILED / REFUNDED)
├── paymentMethod   → PaymentMethod
├── subtotal, taxAmount, shippingAmount, discountAmount, totalAmount
├── shippingAddress → JSONB (Map<String, Object>)
├── billingAddress  → JSONB (Map<String, Object>)
├── couponCode, customerNotes, internalNotes
├── items           → List<OrderItem>
├── statusHistory   → List<OrderStatusHistory>
└── shipment        → Shipment (OneToOne)

OrderItem
├── productId
├── quantity, unitPrice, totalPrice
└── productSnapshot → JSONB (état du produit au moment de la commande)
```

### Notes d'implémentation

- **Product snapshot** : À chaque commande, les données du produit (nom, SKU, prix, image) sont copiées en JSONB dans `order_items` pour garantir la cohérence historique même si le produit est modifié.
- **Adresses JSONB** : `shipping_address` et `billing_address` sont stockées en `JSONB` PostgreSQL via `@JdbcTypeCode(SqlTypes.JSON)` (Hibernate 6 natif).
- **Numéro de commande** : Généré automatiquement par `OrderNumberGenerator` (format personnalisé).
- **Facture PDF** : Générée à la volée via `InvoiceService` (iText 7) et retournée en `application/pdf`.
- **Historique de statut** : Chaque changement de statut crée une entrée dans `order_status_history` avec l'ID de l'utilisateur ayant effectué la modification.
- **Annulation** : Uniquement possible en statut `PENDING` ou `CONFIRMED`.

---

## ⚙️ Configuration

Fichier `src/main/resources/application.properties` :

```properties
# Serveur
server.port=8090

# PostgreSQL
spring.datasource.url=jdbc:postgresql://localhost:5432/africanet
spring.datasource.username=your_user
spring.datasource.password=your_password

# JWT
app.jwt.secret=your_secret_key_256bits
app.jwt.expiration=900000       # 15 minutes (ms)
app.jwt.refresh-expiration=604800000  # 7 jours (ms)
```

---

## 📁 Structure du projet

```
src/main/java/com/brnsmrt/africanet/
├── config/           # SecurityConfig, OpenAPI, WebSocket, etc.
├── controller/       # AuthController, ProductController, StockController, OrderController
├── domain/           # Entités JPA + enums
├── dto/              # request/ et response/ DTOs
├── exception/        # GlobalExceptionHandler + exceptions métier
├── mapper/           # MapStruct mappers
├── repository/       # Spring Data JPA repositories
├── security/         # JwtTokenProvider, JwtAuthenticationFilter, UserDetailsServiceImpl
└── service/          # AuthService, ProductService, StockService, OrderService, InvoiceService
```
