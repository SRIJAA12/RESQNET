import json
import logging
import sys
from datetime import datetime, timezone


class JSONFormatter(logging.Formatter):
    """
    Format logs as JSON lines for ingestion into AWS CloudWatch, Datadog or local log aggregation.
    """
    def format(self, record: logging.LogRecord) -> str:
        log_obj = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "message": record.getMessage(),
            "logger": record.name,
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }
        if hasattr(record, "request_id"):
            log_obj["request_id"] = getattr(record, "request_id")
        if record.exc_info:
            log_obj["exception"] = self.formatException(record.exc_info)
        return json.dumps(log_obj)


def setup_logging(level: str = "INFO") -> logging.Logger:
    logger = logging.getLogger("resqnet")
    logger.setLevel(getattr(logging, level.upper(), logging.INFO))
    logger.propagate = False

    # Clear existing handlers
    if logger.handlers:
        logger.handlers.clear()

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(JSONFormatter())
    logger.addHandler(handler)
    return logger


logger = setup_logging()
