"""
Name translations between public API names and MRIs.
"""

from dataclasses import replace
from typing import Dict, Optional

from .pipeline import QueryLayer
from .transform import QueryTransform
from .types import Column, SeriesQuery, SeriesResult, parse_mri

# TODO: Support dynamic lookup for measurements


class NameRegistry:
    """
    Registry for name translations between public API names and internal names.

    Internal names of metrics are MRIs (Metric Resource Identifiers). Internal
    names of metric tags do not have a special structure.
    """

    def __init__(self):
        self._public_to_internal: Dict[str, str] = {}
        self._internal_to_public: Dict[str, str] = {}

    def register(self, internal: str, public: str):
        """
        Register a public name for translation to an MRI.
        """

        if public in self._public_to_internal or internal in self._internal_to_public:
            raise ValueError(f"Name {public} or MRI {internal} already registered")

        parse_mri(internal)
        self._public_to_internal[public] = internal
        self._internal_to_public[internal] = public

    def get_public(self, internal: str) -> str:
        """
        Get the public name for an internal name.
        """
        return self._internal_to_public[internal]

    def get_internal(self, public: str) -> str:
        """
        Get the internal name for a public name.
        """
        return self._public_to_internal[public]


_REGISTRY: NameRegistry = NameRegistry()


def register_public_name(internal: str, public: str):
    """
    Register a public name for translation to an MRI in the global registry.

    Use ``map_query_names`` and ``map_result_names`` to map names in queries and
    results. This is done automatically by ``get_series``.
    """
    _REGISTRY.register(internal, public)


class NamingLayer(QueryLayer):
    """
    Layer for the query pipeline that public metric names to MRIs and vice
    versa.

    Use ``register_public_name`` to register derived metrics.
    """

    def __init__(self, registry: Optional[NameRegistry] = None):
        self.registry = registry

    def transform_query(self, query: SeriesQuery) -> SeriesQuery:
        return map_query_names(query, registry=self.registry)

    def transform_result(self, result: SeriesResult) -> SeriesResult:
        return map_result_names(result, registry=self.registry)


def map_query_names(query: SeriesQuery, registry: Optional[NameRegistry] = None) -> SeriesQuery:
    """
    Map public metric names in a series query to MRIs and map tag names.
    """

    transform = NameTransform(_REGISTRY if registry is None else registry)
    return transform.visit(query)


def map_result_names(result: SeriesResult, registry: Optional[NameRegistry] = None) -> SeriesResult:
    """
    Map MRIs in a series result to public metric names and map tag names.
    """

    if registry is None:
        registry = _REGISTRY

    raise NotImplementedError()


class NameTransform(QueryTransform):
    """
    Transform for mapping public metric names to MRIs and vice versa.
    """

    def __init__(self, registry: NameRegistry):
        self.registry = registry

    def _visit_column(self, column: Column) -> Column:
        return replace(column, name=self.registry.get_public(column.name))