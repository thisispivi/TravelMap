import getopt


def get_args(argumentList, logger):
    """
    Returns city name from command line arguments.

    Args:
        argumentList (list): The list of command line arguments.
        logger (Logger): The logger instance.

    Returns:
        dict: A dictionary with the city name.

    Raises:
        Exception: If no arguments provided or city name is missing.
    """
    argumentList = argumentList[1:]
    options = "c:C:"
    long_options = ["city=", "country="]

    try:
        arguments, _ = getopt.getopt(argumentList, options, long_options)

        if not arguments:
            raise Exception(
                "No arguments provided. Please provide the city name with -c/--city and country with -C/--country."
            )

        data = {}

        for currentArgument, currentValue in arguments:
            if currentArgument in ("-c", "--city"):
                city = currentValue
                data["city"] = city
            elif currentArgument in ("-C", "--country"):
                country = currentValue
                data["country"] = country

        if "city" not in data:
            raise Exception(
                "City argument missing. Use -c or --city to specify the city name."
            )

        if "country" not in data:
            raise Exception(
                "Country argument missing. Use -C or --country to specify the country name."
            )

        logger.info(
            "Generating JSON for city: %s, country: %s", data["city"], data["country"]
        )

        return data

    except getopt.GetoptError as err:
        logger.error(f"Argument parsing error: {err}")
        raise
    except ValueError as val_err:
        logger.error(f"Invalid argument value: {val_err}")
        raise
    except Exception as e:
        logger.error(f"Error: {e}")
        raise
