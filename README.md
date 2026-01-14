# 📖 Bible App 

Bienvenue dans l'équipe ! Ce projet est standardisé à l'aide de **Docker** et **Node 24 (LTS)**. Vous n'avez pas besoin d'installer Node.js ou MySQL sur votre machine locale ; Docker s'occupe de tout.

---

## 🛠 Prérequis

Avant de commencer, assurez-vous d'avoir installé :
* **Docker Desktop** (Vérifiez que la "baleine" est bien active dans votre barre des tâches)
* **Git**

---

## 🏗️ Installation Initiale

Choisissez l'option qui correspond à votre situation actuelle :

### Option A : Vous n'avez pas encore cloné le projet
```bash
# 1. Cloner le repo
git clone <votre-url-repo>

# 2. Accéder au dossier
cd bible-app


### Option B : Vous avez déjà cloné le projet localement
```bash


# 1. Mettre à jour la liste des branches depuis le serveur
git fetch origin

# 2. Basculer sur la branche Docker
git checkout initilise-docker

# 3. exécutez la commande suivante pour lancer la compilation initiale (de l'emplacement où se trouve votre fichier docker-compose.yml)
docker-compose up -d --build

# Important : NE PAS exécuter « npm start ou npm run dev ou npm run build etc» pour le backend. Le backend est entièrement conteneurisé et doit être exécuté uniquement via Docker. Après la compilation initiale : 
#Pour commence le backend
```bash
docker-compose up -d
#Pour arreter le backend
```bash
docker-compose down







