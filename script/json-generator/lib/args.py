import getopt


def get_city_from_args(argumentList, logger):
    """
    Returns city name from command line arguments

    Args:
        argumentList (list): The list of arguments.
        logger (Logger): The logger instance.

    Returns:
        dict: The dictionary with city name and cdn base folder path.

    Raises:
        Exception: If no arguments provided.
        Exception: If only one argument provided.
    """
    argumentList = argumentList[1:]
    options = "c:p:"
    long_options = ["city", "cdn-base-folder-path"]
    try:
        arguments, values = getopt.getopt(argumentList, options, long_options)

        if len(arguments) == 0:
            raise Exception(
                "No arguments provided. Please provide city name with -c or --city flag and cdn base folder path with -p or --cdn-base-folder-path flag"
            )

        if len(arguments) < 2:
            raise Exception(
                "Please provide both city name and cdn base folder path. City name with -c or --city flag and cdn base folder path with -p or --cdn-base-folder-path flag"
            )

        data = {}
        for currentArgument, currentValue in arguments:
            if currentArgument in ("-c", "--city"):
                city = currentValue.capitalize()
                logger.info("Generating json for city: %s", city)
                data["city"] = city
            if currentArgument in ("-p", "--cdn-base-folder-path"):
                path = currentValue
                logger.info("CDN base folder path: %s", path)
                data["cdn_base_folder_path"] = path

        return data
    except getopt.error as err:
        logger.error(str(err))
        exit(2)
