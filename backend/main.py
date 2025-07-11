from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from opensearchpy import OpenSearch, ConnectionError
from models import LogEntry, LogResponse, LogSearchResponse
from datetime import datetime
import os

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
    hosts=[{
        'host': OPENSEARCH_HOST,
        'port': OPENSEARCH_PORT
    }],
    http_auth=(OPENSEARCH_USERNAME, OPENSEARCH_PASSWORD),
    use_ssl=False,
    verify_certs=False,
    ssl_assert_hostname=False,
    ssl_show_warn=False,
)

def get_index_name(timestamp: str = None):
    """Generate index name based on date"""
    if timestamp:
        try:
            dt = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
        except ValueError:
            dt = datetime.now()
    else:
        dt = datetime.now()
    return f"logs-{dt.strftime('%Y.%m.%d')}"

def ensure_index_exists(index_name: str):
    """Ensure the index exists with proper mapping"""
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
    """Create a new log entry"""
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

async def perform_search(
    q: str = None,
    level: str = None,
    service: str = None,
    size: int = 20,
    from_: int = 0
):
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
    response = client.search(index=index_pattern, body=query_body)

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
    q: str = Query(None, description="Full-text search query"),
    level: str = Query(None, description="Log level filter"),
    service: str = Query(None, description="Service name filter"),
    size: int = Query(20, description="Number of results to return", ge=1),
    from_: int = Query(0, alias="from", description="Offset for pagination", ge=0)
):
    try:
        return await perform_search(q, level, service, size, from_)
    except ConnectionError:
        raise HTTPException(status_code=503, detail="OpenSearch connection failed")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

@app.get("/logs/latest", response_model=LogSearchResponse)
async def get_latest_logs(size: int = Query(20, description="Number of latest logs to return")):
    try:
        return await perform_search(size=size)
    except ConnectionError:
        raise HTTPException(status_code=503, detail="OpenSearch connection failed")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get latest logs: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
