from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from opensearchpy import OpenSearch, ConnectionError
from models import LogEntry, LogResponse, LogSearchResponse
from datetime import datetime
import os
from typing import Optional

app = FastAPI(title="Log Management API", version="1.0.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# OpenSearch configuration
OPENSEARCH_HOST = os.getenv("OPENSEARCH_HOST", "localhost")
OPENSEARCH_PORT = int(os.getenv("OPENSEARCH_PORT", "9200"))
OPENSEARCH_USERNAME = os.getenv("OPENSEARCH_USERNAME", "admin")
OPENSEARCH_PASSWORD = os.getenv("OPENSEARCH_PASSWORD", "admin")

# Initialize OpenSearch client
client = OpenSearch(
    hosts=[{'host': OPENSEARCH_HOST, 'port': OPENSEARCH_PORT}],
    http_auth=(OPENSEARCH_USERNAME, OPENSEARCH_PASSWORD),
    use_ssl=False,
    verify_certs=False,
    ssl_assert_hostname=False,
    ssl_show_warn=False,
)

def get_index_name(timestamp: Optional[str] = None) -> str:
    """Generate index name based on date."""
    if timestamp:
        try:
            dt = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
        except ValueError:
            dt = datetime.now()
    else:
        dt = datetime.now()
    return f"logs-{dt.strftime('%Y.%m.%d')}"

def ensure_index_exists(index_name: str):
    """Ensure the index exists with proper mapping."""
    if not client.indices.exists(index=index_name):
        mapping = {
            "mappings": {
                "properties": {
                    "timestamp": {"type": "date"},
                    "level": {"type": "keyword"},
                    "message": {"type": "text"},
                    "service": {"type": "keyword"}
                }
            }
        }
        client.indices.create(index=index_name, body=mapping)

@app.get("/")
async def root():
    return {"message": "Log Management API", "version": "1.0.0"}

@app.post("/logs", response_model=LogResponse)
async def create_log(log: LogEntry):
    """Create a new log entry."""
    try:
        index_name = get_index_name(log.timestamp)
        ensure_index_exists(index_name)

        doc = {
            "timestamp": log.timestamp,
            "level": log.level,
            "message": log.message,
            "service": log.service
        }

        response = client.index(
            index=index_name,
            body=doc,
            refresh=True
        )

        return LogResponse(
            id=response["_id"],
            timestamp=log.timestamp,
            level=log.level,
            message=log.message,
            service=log.service
        )

    except ConnectionError:
        raise HTTPException(status_code=503, detail="OpenSearch connection failed")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create log: {str(e)}")

def perform_search(
    client,
    q: Optional[str] = None,
    level: Optional[str] = None,
    service: Optional[str] = None,
    size: int = 20,
    from_: int = 0
) -> LogSearchResponse:
    must_clauses = []

    if q is not None:
        must_clauses.append({"match": {"message": q}})
    if level is not None:
        must_clauses.append({"term": {"level": level}})
    if service is not None:
        must_clauses.append({"term": {"service": service}})

    if not must_clauses:
        query_body = {"query": {"match_all": {}}}
    else:
        query_body = {"query": {"bool": {"must": must_clauses}}}

    query_body.update({
        "sort": [{"timestamp": {"order": "desc"}}],
        "size": size,
        "from": from_
    })

    index_pattern = "logs-*"

    try:
        response = client.search(index=index_pattern, body=query_body)
    except ConnectionError:
        raise HTTPException(status_code=503, detail="OpenSearch connection failed")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

    logs = []
    for hit in response["hits"]["hits"]:
        source = hit["_source"]
        logs.append(LogResponse(
            id=hit["_id"],
            timestamp=source["timestamp"],
            level=source["level"],
            message=source["message"],
            service=source["service"]
        ))

    return LogSearchResponse(
        logs=logs,
        total=response["hits"]["total"]["value"],
        took=response["took"]
    )

@app.get("/logs/search", response_model=LogSearchResponse)
async def search_logs(
    q: Optional[str] = Query(None, description="Full-text search query"),
    level: Optional[str] = Query(None, description="Log level filter"),
    service: Optional[str] = Query(None, description="Service name filter"),
    size: int = Query(20, ge=1, description="Number of results to return"),
    from_: int = Query(0, alias="from", ge=0, description="Offset for pagination")
):
    # Appelle la fonction perform_search avec les valeurs extraites de la requête
    return perform_search(client, q=q, level=level, service=service, size=size, from_=from_)

@app.get("/logs/latest", response_model=LogSearchResponse)
async def get_latest_logs(
    size: int = Query(20, ge=1, description="Number of latest logs to return")
):
    # Appelle la recherche sans filtre, uniquement la taille et l'offset
    return perform_search(client, size=size, from_=0)
