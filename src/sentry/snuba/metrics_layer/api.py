import re
from dataclasses import dataclass
from datetime import datetime
from typing import Any, List, Mapping, Optional, Sequence, Tuple, Union

from snuba_sdk import (
    AliasedExpression,
    Column,
    Metric,
    MetricsQuery,
    MetricsScope,
    Request,
    Rollup,
    Timeseries,
)
from snuba_sdk.conditions import Condition, ConditionGroup, Op

from sentry.models import Organization, Project
from sentry.search.utils import parse_datetime_string
from sentry.sentry_metrics.use_case_id_registry import UseCaseID
from sentry.snuba.metrics.naming_layer.mapping import is_mri
from sentry.snuba.metrics_layer.query import run_query
from sentry.utils.dates import parse_stats_period

GRANULARITIES = [
    10,  # 10 seconds
    60,  # 1 minute
    60 * 60,  # 1 hour
    60 * 60 * 24,  # 24 hours
]

FIELD_REGEX = re.compile(r"(\w+)\(([^\s]+)\)(?:\s*)")
QUERY_REGEX = re.compile(r"(\w+):([^\s]+)(?:\s*)")
GROUP_BY_REGEX = re.compile(r"(\w+)(?:\s*)")


@dataclass
class Field:
    aggregate: str
    metric_name: str

    def refers_to_mri(self) -> bool:
        return is_mri(self.metric_name)


@dataclass
class Filter:
    key: str
    value: Union[str, int, float]


@dataclass
class GroupBy:
    key: str


def _parse_fields(field: str) -> Sequence[Field]:
    """
    This function supports parsing in the form:
    aggregate(metric_name) (_ aggregate(metric_name))?
    """
    fields = []

    matches = FIELD_REGEX.findall(field)
    for aggregate, metric_name in matches:
        fields.append(Field(aggregate=aggregate, metric_name=metric_name))

    return fields


def _parse_query(query: str) -> Sequence[Filter]:
    """
    This function supports parsing in the form:
    key:value (_ key:value)?
    in which the only supported operator is AND.
    """
    filters = []

    matches = QUERY_REGEX.findall(query)
    for key, value in matches:
        filters.append(Filter(key=key, value=value))

    return filters


def _parse_group_by(group_by: str) -> Sequence[GroupBy]:
    """
    This function supports parsing in the form:
    value (_ value)?
    """
    group_bys = []

    matches = GROUP_BY_REGEX.findall(group_by)
    for key in matches:
        group_bys.append(GroupBy(key=key))

    return group_bys


def _field_to_snql(
    field: Field,
    snql_filters: Optional[ConditionGroup],
    snql_group_bys: Optional[List[Union[Column, AliasedExpression]]],
) -> Timeseries:
    if field.refers_to_mri():
        metric = Metric(mri=field.metric_name)
    else:
        metric = Metric(public_name=field.metric_name)

    return Timeseries(
        metric=metric,
        aggregate=field.aggregate,
        filters=snql_filters,
        groupby=snql_group_bys,
    )


def _filters_to_snql(filters: Sequence[Filter]) -> Optional[ConditionGroup]:
    condition_group = []

    for _filter in filters:
        condition = Condition(lhs=Column(name=_filter.key), op=Op.EQ, rhs=_filter.value)
        condition_group.append(condition)

    return condition_group


def _group_bys_to_snql(
    group_bys: Sequence[GroupBy],
) -> Optional[List[Union[Column, AliasedExpression]]]:
    columns = []

    for group_by in group_bys:
        columns.append(Column(name=group_by.key))

    return columns


def _get_granularity(interval: int) -> int:
    best_granularity: Optional[int] = None

    for granularity in sorted(GRANULARITIES):
        if granularity <= interval:
            best_granularity = granularity

    if best_granularity is None:
        raise Exception("The interval specified is lower than the minimum granularity")

    return best_granularity


def _get_date_range(interval: str, start: str, end: str) -> Tuple[datetime, datetime, int, int]:
    interval = parse_stats_period(interval)
    interval = int(3600 if interval is None else interval.total_seconds())

    start = parse_datetime_string(start)
    end = parse_datetime_string(end)

    return start, end, interval, _get_granularity(interval)


def _translate_result(result: Mapping[str, Any]) -> Mapping[str, Any]:
    """
    from

    {'aggregate_value': 4.0,
    'time': '2023-10-03T10:00:00+00:00',
    'transaction': '/hello'}

    to

    {
        "by": {"val": 1, "val": 2},
        "series": {},
        "totals": {},
    }
    """
    data = result["data"]
    return result


def run_metrics_query(
    field: str,
    query: str,
    group_by: str,
    interval: str,
    start: str,
    end: str,
    use_case_id: UseCaseID,
    organization: Organization,
    projects: Sequence[Project],
):
    # Build the basic query that contains the metadata.
    start, end, interval, granularity = _get_date_range(interval, start, end)
    base_query = MetricsQuery(
        start=start,
        end=end,
        rollup=Rollup(interval=interval, granularity=granularity),
        scope=MetricsScope(
            org_ids=[organization.id],
            project_ids=[project.id for project in projects],
            use_case_id=use_case_id.value,
        ),
    )

    # Build the filters and group bys to inject into each query generated by a field.
    snql_filters = _filters_to_snql(_parse_query(query))
    snql_group_bys = _group_bys_to_snql(_parse_group_by(group_by))

    # Parse the fields and create queries for each of them.
    results = []
    fields = _parse_fields(field)
    for field in fields:
        base_query.query = _field_to_snql(field, snql_filters, snql_group_bys)
        request = Request(
            dataset="generic_metrics",
            app_id="default",
            query=base_query,
            tenant_ids={"referrer": "metrics.data", "organization_id": organization.id},
        )
        result = run_query(request=request, zero_fill=True)
        results.append(_translate_result(result))

    return results
