from opensearchpy import OpenSearch

def get_opensearch_client():
    client = OpenSearch(
        hosts=[{'host': 'opensearch-node', 'port': 9200}],
        http_auth=('admin', 'admin'),  # adapter si tu as une auth
        use_ssl=False,
        verify_certs=False,
        ssl_show_warn=False,
    )
    return client
