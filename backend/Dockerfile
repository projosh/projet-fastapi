FROM python:3.11-slim

# Installer pip et autres dépendances utiles (ex : pour psycopg2, opensearch, etc.)
RUN apt-get update && apt-get install -y gcc libpq-dev && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Installer les dépendances
COPY requirements.txt .
RUN pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt

# Copier les fichiers du projet
COPY . .

# Expose le port utilisé par uvicorn
EXPOSE 8000

# Commande de démarrage
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
