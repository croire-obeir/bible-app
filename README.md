# 📖 Bible App 

Bienvenue dans l'équipe ! Ce projet est standardisé à l'aide de **Docker** et **Node 24 (LTS)**. Vous n'avez pas besoin d'installer Node.js ou MySQL sur votre machine locale ; Docker s'occupe de tout.

---

## 🛠 Prérequis

Avant de commencer, assurez-vous d'avoir installé :
* **Docker Desktop** (Vérifiez que la "baleine" est bien active dans votre barre des tâches)
* **Git**

---

## 🏗️ Installation Initiale


```bash
# 1. Cloner le repo
git clone <votre-url-repo>

```
### Frontend
```bash
# 2. Accéder au dossier
cd bible-app/frontend

# 3. installer les bibliothèques frontales
npm install

# 4. Démarrer le serveur de développement React Native
npx expo start (ou npm start)

```

### Backend
```bash
# 5. Retourner au dossier racine
cd ..
```
*** N'exécutez pas npm install dans le backend ni aucune commande npm pour démarrer le serveur. 
*** demander les variables d'environnement, créer un fichier .env dans le dossier racine et saisir les variables
```bash
# 6. Construire des conteneurs Docker (Assurez-vous que Docker Desktop est installé et en cours d'exécution.)
docker-compose up -d --build
#Exécutez cette commande si un nouveau paquet est modifié/dossier modifié ou lorsque des modifications importantes sont apportées au backend.

#7. arrêter le serveur backend
docker-compose down

#7. redemare le serveur backend
docker-compose up
```









