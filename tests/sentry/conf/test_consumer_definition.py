from sentry.conf.types.consumer_definition import validate_consumer_definition
from sentry.consumers import KAFKA_CONSUMERS
from sentry.testutils.cases import TestCase


class ConsumerDefinitionTest(TestCase):
    for definition in KAFKA_CONSUMERS.values():
        validate_consumer_definition(definition)
