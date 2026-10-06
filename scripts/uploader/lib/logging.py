"""Custom logging setup for the uploader.

Defines additional log levels (VIDEO/PHOTO/PROGRESS) and a colored formatter.
"""

import logging


class CustomFormatter(logging.Formatter):
    """Logging colored formatter, adapted from https://stackoverflow.com/a/56944256/3638629"""

    grey = "\x1b[38;21m"
    blue = "\x1b[38;5;39m"
    yellow = "\x1b[38;5;226m"
    red = "\x1b[38;5;196m"
    bold_red = "\x1b[31;1m"
    reset = "\x1b[0m"
    pink = "\x1b[38;5;200m"
    purple = "\x1b[38;5;141m"
    progress_highlight = "\x1b[1m\x1b[30m\x1b[48;5;46m"

    def __init__(self, fmt):
        """Create a formatter that colorizes output based on log level."""
        super().__init__()
        self.fmt = fmt
        self.FORMATS = {
            logging.DEBUG: self.grey + self.fmt + self.reset,
            logging.INFO: self.blue + self.fmt + self.reset,
            PROGRESS: self.progress_highlight + self.fmt + self.reset,
            logging.WARNING: self.yellow + self.fmt + self.reset,
            logging.ERROR: self.red + self.fmt + self.reset,
            logging.CRITICAL: self.bold_red + self.fmt + self.reset,
            VIDEO: self.pink + self.fmt + self.reset,
            PHOTO: self.purple + self.fmt + self.reset,
        }

    def format(self, record):
        """Format a log record using a level-specific colorized format."""
        log_fmt = self.FORMATS.get(record.levelno, self.fmt)
        formatter = logging.Formatter(log_fmt)
        return formatter.format(record)


VIDEO = 25
PROGRESS = 22
PHOTO = 35

logging.addLevelName(VIDEO, "VIDEO")
logging.addLevelName(PROGRESS, "PROGRESS")
logging.addLevelName(PHOTO, "PHOTO")


def video(self, message, *args, **kws):
    """Log a message at the custom VIDEO level."""
    if self.isEnabledFor(VIDEO):
        self._log(VIDEO, message, args, **kws)


def photo(self, message, *args, **kws):
    """Log a message at the custom PHOTO level."""
    if self.isEnabledFor(PHOTO):
        self._log(PHOTO, message, args, **kws)


logging.Logger.video = video


def progress(self, message, *args, **kws):
    """Log a message at the custom PROGRESS level."""
    if self.isEnabledFor(PROGRESS):
        self._log(PROGRESS, message, args, **kws)


logging.Logger.progress = progress
logging.Logger.photo = photo


def get_custom_logger():
    """Return a configured root logger with the uploader formatter attached."""
    logger = logging.getLogger()

    for h in logger.handlers:
        if isinstance(h, logging.StreamHandler) and isinstance(
            getattr(h, "formatter", None), CustomFormatter
        ):
            logger.setLevel(logging.INFO)
            return logger

    handler = logging.StreamHandler()
    handler.setFormatter(CustomFormatter("[%(levelname)s] - %(asctime)s - %(message)s"))
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)
    return logger
