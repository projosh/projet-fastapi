from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from opensearchpy import ConnectionError
from models import LogEntry, LogResponse, LogSearchResponse
from utils.opensearch_helpers import get_index_name, ensure_index_exists, perform_search
from ..opensearch_client import get_opensearch_client

router = APIRouter(prefix="/logs", tags=["Logs"])

# Initialiser une seule fois le client OpenSearch pour l’utiliser dans toutes les routes
client = get_opensearch_client()

@router.post("/", response_model=LogResponse)
async def create_log(log: LogEntry):
    try:
        index_name = get_index_name(log.timestamp)
        ensure_index_exists(index_name)

        doc = {
            "timestamp": log.timestamp,
            "level": log.level,
            "message": log.message,
            "service": log.service
        }

        response = client.index(index=index_name, body=doc, refresh=True)

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


@router.get("/search", response_model=LogSearchResponse)
async def search_logs(
    q: Optional[str] = Query(None, description="Full-text search"),
    level: Optional[str] = Query(None),
    service: Optional[str] = Query(None),
    size: int = Query(20, ge=1),
    from_: int = Query(0, alias="from", ge=0)
):
    return perform_search(client, q=q, level=level, service=service, size=size, from_=from_)


@router.get("/latest", response_model=LogSearchResponse)
async def get_latest_logs(size: int = Query(20, ge=1)):
    return perform_search(client, size=size, from_=0)
