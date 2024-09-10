import PIL
from PIL import Image, ImageOps
import os


def compress(filename, city_folder_path, results_city_folder_path, is_video=False):
    path = os.path.join(city_folder_path, filename)
    with Image.open(path) as my_image:
        image_height = my_image.height
        image_width = my_image.width

        thumbnail_width = image_width * 0.2
        thumbnail_height = image_height * 0.2
        thumbnail_image = my_image.resize(
            (int(thumbnail_width), int(thumbnail_height)), PIL.Image.NEAREST
        )
        thumbnail_savename = filename.split(".")[0] + "t.jpg"
        thumbnail_save_path = os.path.join(results_city_folder_path, thumbnail_savename)
        thumbnail_image.save(thumbnail_save_path, quality=40)

        compress_image = my_image.resize((image_width, image_height), PIL.Image.NEAREST)
        savename = filename.split(".")[0] + "c.jpg"
        save_path = os.path.join(results_city_folder_path, savename)
        compress_image.save(save_path, quality=40)
