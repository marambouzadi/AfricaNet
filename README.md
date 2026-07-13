# AfricaNet — Backend E-Commerce API

API REST Spring Boot pour une plateforme e-commerce de produits reconditionnés.

**Stack :** Spring Boot 4.1.0 · Spring Security 6 + JWT · PostgreSQL + Liquibase · Hibernate 7 · MapStruct · iText 7  
**Swagger UI :** `http://localhost:8090/swagger-ui.html`

---

## Modules implémentés

### Authentification — `/api/auth`
| Endpoint | Description |
|---|---|
| `POST /register` | Inscription |
| `POST /login` | Connexion (JWT + refresh token) |
| `POST /logout` | Invalidation du refresh token |
| `POST /refresh` | Renouvellement du JWT |
| `GET  /me` | Profil utilisateur connecté |

> JWT HMAC-SHA256 · BCrypt strength 12 · stateless · rôles `USER` / `ADMIN`

---

### Produits — `/api/products`
| Endpoint | Auth |
|---|---|
| `GET /` — liste paginée avec filtres (catégorie, marque, condition, prix) | Public |
| `GET /{id}` — détail | Public |
| `GET /search?query=` — recherche full-text | Public |
| `POST / · PUT /{id} · DELETE /{id}` — CRUD | `ADMIN` |

---

### Stock — `/api/stock` *(ADMIN uniquement)*
| Endpoint | Description |
|---|---|
| `GET /` | Tout l'inventaire paginé |
| `GET /{productId}` | Stock d'un produit |
| `GET /alerts` | Produits en alerte stock bas |
| `PUT /{productId}` | Mouvement : `IN / OUT / ADJUSTMENT / RESERVATION / RELEASE` |

> Le stock est automatiquement réservé à la création d'une commande, libéré à l'annulation, et décrémenté au passage en `SHIPPED`.

---

### Commandes — `/api/orders`
| Endpoint | Auth |
|---|---|
| `POST /` — créer une commande | Connecté |
| `GET /me` — mes commandes | Connecté |
| `GET /{id}` — détail | Connecté (propriétaire) |
| `PUT /{id}/cancel` — annuler | Connecté |
| `GET /{id}/invoice` — facture PDF | Connecté |
| `GET / · PUT /{id}/status` — gestion admin | `ADMIN` |

**Cycle :** `PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED → REFUNDED` (annulation possible jusqu'à `CONFIRMED`)  
**Tarification :** TVA 19% · livraison 7 TND (offerte ≥ 200 TND)

---

## Configuration minimale

```properties
server.port=8090
spring.datasource.url=jdbc:postgresql://localhost:5432/africanet_db
spring.datasource.username=...
spring.datasource.password=...
app.jwt.secret=...
```
