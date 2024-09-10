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

    def __init__(self, fmt):
        super().__init__()
        self.fmt = fmt
        self.FORMATS = {
            logging.DEBUG: self.grey + self.fmt + self.reset,
            logging.INFO: self.blue + self.fmt + self.reset,
            logging.WARNING: self.yellow + self.fmt + self.reset,
            logging.ERROR: self.red + self.fmt + self.reset,
            logging.CRITICAL: self.bold_red + self.fmt + self.reset,
            VIDEO: self.pink + self.fmt + self.reset,
            PHOTO: self.purple + self.fmt + self.reset,
        }

    def format(self, record):
        log_fmt = self.FORMATS.get(record.levelno)
        formatter = logging.Formatter(log_fmt)
        return formatter.format(record)


VIDEO = 25
PHOTO = 35

logging.addLevelName(VIDEO, "VIDEO")
logging.addLevelName(PHOTO, "PHOTO")


def video(self, message, *args, **kws):
    if self.isEnabledFor(VIDEO):
        self._log(VIDEO, message, args, **kws)


def photo(self, message, *args, **kws):
    if self.isEnabledFor(PHOTO):
        self._log(PHOTO, message, args, **kws)


logging.Logger.video = video
logging.Logger.photo = photo


def get_custom_logger():
    handler = logging.StreamHandler()
    handler.setFormatter(CustomFormatter("[%(levelname)s] - %(asctime)s - %(message)s"))
    logger = logging.getLogger()
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)
    return logger
