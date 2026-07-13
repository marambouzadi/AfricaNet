# AfricaNet — Backend E-Commerce API

## Notes d'implémentation (Module Authentification & Sécurité)

- **Endpoints implémentés (`/api/auth`)** : Inscription (`/register`), Connexion (`/login`), Déconnexion (`/logout`), Rafraîchissement (`/refresh`) et Profil courant (`/me`).
- **Sécurité** : Intégration de Spring Security 6 en mode stateless avec validation par tokens JWT (HMAC-SHA256) et hachage BCrypt (force 12) des mots de passe.
- **Base de données** : Schéma PostgreSQL géré par Liquibase (exécution automatique au démarrage).
- **Mapping & Compilation** : MapStruct 1.5+ pour le mapping DTO ↔ Entités, avec liaison Lombok configurée dans le `pom.xml`.
- **Documentation** : API interactive documentée avec Swagger UI disponible sur `http://localhost:8090/swagger-ui.html` une fois l'application démarrée.
