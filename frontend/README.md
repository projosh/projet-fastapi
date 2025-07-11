# Système de Gestion de Logs

Une application complète de gestion de logs avec un backend FastAPI et un frontend React.

## Fonctionnalités

### Backend (FastAPI)
- **POST /logs** - Créer un nouveau log avec validation Pydantic
- **GET /logs/search** - Rechercher des logs avec filtres
- **GET /logs/latest** - Récupérer les 20 derniers logs
- Intégration avec OpenSearch pour l'indexation
- Support des index dynamiques (logs-YYYY.MM.DD)

### Frontend (React + TypeScript)
- Interface de visualisation des logs
- Recherche en temps réel sans rechargement
- Filtres par niveau et service
- Formulaire de création de logs
- Design responsive avec Tailwind CSS

## Installation et Démarrage

### Avec Docker (Recommandé)

```bash
# Démarrer tous les services
docker-compose up -d

# Accéder aux services
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# OpenSearch: http://localhost:9200
# OpenSearch Dashboards: http://localhost:5601
```

### Développement Local

#### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

#### Frontend
```bash
npm install
npm run dev
```

## Architecture

### Backend
- **FastAPI** - Framework web moderne
- **Pydantic** - Validation des données
- **OpenSearch** - Moteur de recherche et indexation
- **Docker** - Conteneurisation

### Frontend
- **React** - Interface utilisateur
- **TypeScript** - Typage statique
- **Tailwind CSS** - Styling
- **Axios** - Requêtes HTTP
- **Lucide React** - Icônes

## API Endpoints

### POST /logs
Créer un nouveau log.

**Body:**
```json
{
  "timestamp": "2024-01-01T12:00:00Z",
  "level": "INFO",
  "message": "Application started",
  "service": "api-gateway"
}
```

### GET /logs/search
Rechercher des logs avec filtres optionnels.

**Query Parameters:**
- `q` - Recherche textuelle dans le message
- `level` - Filtrer par niveau (INFO, WARNING, ERROR, DEBUG)
- `service` - Filtrer par service
- `size` - Nombre de résultats (défaut: 20)
- `from` - Offset pour pagination (défaut: 0)

## Structure du Projet

```
/
├── backend/
│   ├── main.py           # API FastAPI
│   ├── models.py         # Modèles Pydantic
│   ├── requirements.txt  # Dépendances Python
│   └── Dockerfile        # Image Docker backend
├── src/
│   ├── components/       # Composants React
│   ├── services/         # Services API
│   ├── types/           # Types TypeScript
│   ├── hooks/           # Hooks React personnalisés
│   └── App.tsx          # Composant principal
├── docker-compose.yml    # Configuration Docker
└── README.md
```

## Variables d'Environnement

### Backend (.env)
```
OPENSEARCH_HOST=localhost
OPENSEARCH_PORT=9200
OPENSEARCH_USERNAME=admin
OPENSEARCH_PASSWORD=admin
```

## Gestion des Logs

### Niveaux de Log
- **INFO** - Informations générales
- **WARNING** - Avertissements
- **ERROR** - Erreurs
- **DEBUG** - Informations de débogage

### Indexation
Les logs sont automatiquement indexés dans OpenSearch avec le pattern `logs-YYYY.MM.DD`.

## Développement

### Scripts NPM
- `npm run dev` - Démarrer le serveur de développement
- `npm run build` - Construire l'application
- `npm run lint` - Linter le code
- `npm run preview` - Prévisualiser la build

### API de Développement
Le backend est accessible sur `http://localhost:8000` avec documentation automatique sur `/docs`.