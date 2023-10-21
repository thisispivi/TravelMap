import os
from PIL import Image
import json

# Get the json file with the image information

city = "Budapest/"


def get_max_common_divisor(a, b):
    if b == 0:
        return a
    return get_max_common_divisor(b, a % b)


def get_image_info(filename):
    image = {}
    image["original"] = city + filename
    image["alt"] = ""

    if filename.endswith(".jpg"):
        image["thumbnail"] = city + filename.replace(".jpg", "_thumb.jpg")
        width, height = Image.open(filename).size
        max_common_divisor = get_max_common_divisor(width, height)
        image["width"] = int(width / max_common_divisor)
        image["height"] = int(height / max_common_divisor)
    else:
        image["thumbnail"] = city + filename.split(".")[0] + "_thumb.jpg"
        image["width"], image["height"] = 1, 1

    return image


def custom_sorting_key(image):
    parts = image["original"].split(".")
    if len(parts) > 0:
        try:
            print(parts[0])
            return int(parts[0])
        except ValueError:
            return parts[0]
    return image["original"]


current_path = os.path.dirname(os.path.realpath(__file__))
images = []

for filename in os.listdir(current_path):
    if not (
        filename.endswith("_thumb.jpg")
        or filename.startswith("script")
        or filename.startswith("images")
    ):
        images.append(get_image_info(filename))

images = sorted(images, key=lambda x: float(x["original"].split(".")[0].split("/")[1]))

json_file_path = os.path.join(current_path, "images.json")
with open(json_file_path, "w") as outfile:
    json.dump(images, outfile, indent=4)
