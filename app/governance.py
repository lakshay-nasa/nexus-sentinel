from datetime import datetime # Add this import
from datahub.emitter.rest_emitter import DatahubRestEmitter
from datahub.emitter.mcp import MetadataChangeProposalWrapper
import datahub.metadata.schema_classes as models

class DataHubSentinel:
    def __init__(self, gms_url="http://localhost:8080"):
        self.emitter = DatahubRestEmitter(gms_url)

    # governance.py
    def emit_trust_metadata(self, data_context: dict):
        urn = data_context["urn"]
        
        # 1. Properties Aspect (Requires entityType and aspectName)
        props = MetadataChangeProposalWrapper(
            entityType="dataset", # Required
            entityUrn=urn,
            aspectName="datasetProperties", # Required
            aspect=models.DatasetPropertiesClass(
                customProperties={
                    "volatility_index": str(data_context["volatility"]),
                    "last_updated": datetime.now().isoformat(),
                    "data_source": "Yahoo Finance API"
                },
                description=f"Market data for {data_context['ticker']} monitored by Nexus Sentinel."
            )
        )

        # 2. Tags Aspect (Requires entityType and aspectName)
        tag_urn = "urn:li:tag:Verified" if data_context["is_trustworthy"] else "urn:li:tag:HighVolatilityRisk"
        tags = MetadataChangeProposalWrapper(
            entityType="dataset", # Required
            entityUrn=urn,
            aspectName="globalTags", # Required
            aspect=models.GlobalTagsClass(
                tags=[models.TagAssociationClass(tag=tag_urn)]
            )
        )

        self.emitter.emit(props)
        self.emitter.emit(tags)
        return tag_urn
