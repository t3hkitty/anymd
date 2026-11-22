"""
plugin_registry.py — Calibre-Style Sub-Plugin Harness for Kittlibr
Models extension lifecycle hooks after calibre.customize:
  - MetadataReaderPlugin
  - MetadataWriterPlugin
  - CatalogTransformPlugin
Enables librget, librscrape, librfind, and libr_ai to plug into the same pipeline.
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, List


class MetadataReaderPlugin(ABC):
    @abstractmethod
    def read_metadata(self, file_path: str) -> Dict[str, Any]:
        pass


class MetadataWriterPlugin(ABC):
    @abstractmethod
    def write_metadata(self, file_path: str, metadata: Dict[str, Any]) -> bool:
        pass


class CatalogTransformPlugin(ABC):
    @abstractmethod
    def transform_catalog(self, catalog: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        pass


class SubPluginRegistry:
    def __init__(self):
        self.readers: List[MetadataReaderPlugin] = []
        self.writers: List[MetadataWriterPlugin] = []
        self.transformers: List[CatalogTransformPlugin] = []

    def register_reader(self, plugin: MetadataReaderPlugin):
        self.readers.append(plugin)

    def register_writer(self, plugin: MetadataWriterPlugin):
        self.writers.append(plugin)

    def register_transformer(self, plugin: CatalogTransformPlugin):
        self.transformers.append(plugin)
