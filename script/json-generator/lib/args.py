import getopt


def get_city_from_args(argumentList, logger):
    """
    Returns city name from command line arguments

    Args:
        argumentList (list): The list of arguments.
        logger (Logger): The logger instance.

    Returns:
        str: The city name.

    Raises:
        Exception: If no arguments provided.
    """
    argumentList = argumentList[1:]
    options = "c:"
    long_options = ["city"]
    try:
        arguments, values = getopt.getopt(argumentList, options, long_options)

        if (len(arguments) == 0):
            raise Exception(
                "No arguments provided. Please provide city name with -c or --city flag")

        for currentArgument, currentValue in arguments:
            if currentArgument in ("-c", "--city"):
                city = currentValue.capitalize()
                logger.info("Generating json for city: %s", city)
                return city
    except getopt.error as err:
        logger.error(str(err))
        exit(2)
