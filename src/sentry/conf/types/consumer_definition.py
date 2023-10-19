from __future__ import annotations

from typing import Any, Callable, Mapping, Sequence, TypedDict

import click
from typing_extensions import Required

from sentry.utils.kafka_config import get_topic_definition


class ConsumerDefinition(TypedDict, total=False):
    # Which logical topic from settings to use.
    topic: Required[str | Callable[[], str]]
    default_topic: str

    strategy_factory: Required[str]

    # Additional CLI options the consumer should accept. These arguments are
    # passed as kwargs to the strategy_factory.
    click_options: Sequence[click.Option]

    # Hardcoded additional kwargs for strategy_factory
    static_args: Mapping[str, Any]

    require_synchronization: bool
    synchronize_commit_group_default: str
    synchronize_commit_log_topic_default: str

    dlq_topic: str
    dlq_max_invalid_ratio: float | None
    dlq_max_consecutive_count: int | None


def validate_consumer_definition(consumer_definition: ConsumerDefinition) -> None:
    if "dlq_topic" in consumer_definition:
        dlq_topic = consumer_definition["dlq_topic"]
        try:
            get_topic_definition(dlq_topic)["cluster"]
        except ValueError:
            raise ValueError(
                f"Invalid DLQ topic: {dlq_topic}, all DLQ topics must have topic definition configured in settings"
            )
    elif (
        "dlq_max_invalid_ratio" in consumer_definition
        or "dlq_max_consecutive_count" in consumer_definition
    ):
        raise ValueError(
            "Invalid consumer definition, dlq_max_invalid_ratio/dlq_max_consecutive_count is configured, but dlq_topic is not"
        )
