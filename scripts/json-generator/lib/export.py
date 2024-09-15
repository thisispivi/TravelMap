import os
import json


def export_json(images, path, filename):
    """
    Export the images to a json file.

    Args:
        images (list): The list of images.
        path (str): The path where the json file will be exported.
        filename (str): The name of the json file.
    """
    json_file_path = os.path.join(path, filename + ".json")
    with open(json_file_path, "w") as outfile:
        json.dump(images, outfile, indent=4)
