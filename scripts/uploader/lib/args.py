import getopt
from logging import Logger
from typing import Sequence


def get_args(argumentList: Sequence[str], logger: Logger) -> dict[str, str]:
    """
    Parse command-line arguments.

    Args:
        argumentList: Full argv sequence (including program name).
        logger (Logger): The logger instance.

    Returns:
        A dict containing required keys: `city`, `country`.

    Raises:
        ValueError: If required args are missing.
        getopt.GetoptError: If invalid options are provided.
        SystemExit: If `-h/--help` is requested.
    """

    usage = (
        "Usage: python main.py -c <city> -C <country>\n"
        "\n"
        "Options:\n"
        "  -c, --city       City folder name under photos/\n"
        "  -C, --country    Country slug used for CDN paths\n"
        "  -h, --help       Show this help and exit\n"
    )

    argument_list = list(argumentList)[1:]
    options = "hc:C:"
    long_options = ["help", "city=", "country="]

    try:
        arguments, _ = getopt.getopt(argument_list, options, long_options)

        for currentArgument, _currentValue in arguments:
            if currentArgument in ("-h", "--help"):
                print(usage)
                raise SystemExit(0)

        if not arguments:
            raise ValueError(
                "No arguments provided. Please provide the city name with -c/--city and country with -C/--country."
            )

        data: dict[str, str] = {}

        for currentArgument, currentValue in arguments:
            if currentArgument in ("-c", "--city"):
                data["city"] = currentValue
            elif currentArgument in ("-C", "--country"):
                data["country"] = currentValue

        if "city" not in data:
            raise ValueError(
                "City argument missing. Use -c or --city to specify the city name."
            )

        if "country" not in data:
            raise ValueError(
                "Country argument missing. Use -C or --country to specify the country name."
            )

        logger.info(
            "Generating JSON for city: %s, country: %s", data["city"], data["country"]
        )

        return data

    except getopt.GetoptError as err:
        logger.error("Argument parsing error: %s", err)
        raise
    except Exception as e:
        logger.error("Error: %s", e)
        raise
