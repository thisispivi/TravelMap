import getopt


def get_city_from_args(argumentList, logger):
    """
    Returns city name and compression settings from command line arguments.

    Args:
        argumentList (list): The list of command line arguments.
        logger (Logger): The logger instance.

    Returns:
        dict: A dictionary with city name and compression settings.

    Raises:
        Exception: If no arguments provided or city name is missing.
    """
    argumentList = argumentList[1:]
    options = "c:tmin:tmax:tres:cmin:cmax:cres:"
    long_options = [
        "city=",
        "thumbnail-min=",
        "thumbnail-max=",
        "thumbnail-resolution=",
        "compressed-min=",
        "compressed-max=",
        "compressed-resolution=",
    ]

    try:
        arguments, values = getopt.getopt(argumentList, options, long_options)

        if not arguments:
            raise Exception(
                "No arguments provided. Please provide at least the city name with -c or --city flag."
            )

        data = {
            "thumbnail_min": 70,
            "thumbnail_max": 250,
            "thumbnail_resolution": 900,
            "compressed_min": 750,
            "compressed_max": 1500,
            "compressed_resolution": 2000,
        }

        for currentArgument, currentValue in arguments:
            if currentArgument in ("-c", "--city"):
                city = currentValue
                logger.info("Generating JSON for city: %s", city)
                data["city"] = city
            elif currentArgument in ("-tmin", "--thumbnail-min"):
                data["thumbnail_min"] = int(currentValue)
            elif currentArgument in ("-tmax", "--thumbnail-max"):
                data["thumbnail_max"] = int(currentValue)
            elif currentArgument in ("-tres", "--thumbnail-resolution"):
                data["thumbnail_resolution"] = int(currentValue)
            elif currentArgument in ("-cmin", "--compressed-min"):
                data["compressed_min"] = int(currentValue)
            elif currentArgument in ("-cmax", "--compressed-max"):
                data["compressed_max"] = int(currentValue)
            elif currentArgument in ("-cres", "--compressed-resolution"):
                data["compressed_resolution"] = int(currentValue)

        if "city" not in data:
            raise Exception(
                "City argument missing. Use -c or --city to specify the city name."
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
