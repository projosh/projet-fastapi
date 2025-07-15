from datetime import datetime
from opensearch_client import get_opensearch_client

client = get_opensearch_client()

def get_index_name(timestamp: str) -> str:
    # Exemple simple : index par année et mois
    dt = datetime.fromisoformat(timestamp)
    return f"logs-{dt.strftime('%Y-%m')}"

def ensure_index_exists(index_name: str):
    if not client.indices.exists(index=index_name):
        client.indices.create(index=index_name)

def perform_search(client, q=None, level=None, service=None, size=20, from_=0):
    query = {"bool": {"must": []}}

    if q:
        query["bool"]["must"].append({"match": {"message": q}})
    if level:
        query["bool"]["must"].append({"match": {"level": level}})
    if service:
        query["bool"]["must"].append({"match": {"service": service}})

    response = client.search(
        index="logs-*",
        body={
            "query": query,
            "size": size,
            "from": from_,
            "sort": [{"timestamp": {"order": "desc"}}],
        },
    )
    return response
