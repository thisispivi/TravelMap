from PIL import Image, ImageOps
import os
import shutil


def compress_image(
    image, max_size, min_size, max_resolution, output_path, quality_step=5
):
    """
    Compress image to ensure it fits the size constraints.

    Args:
        image (PIL.Image): Image to compress.
        max_size (int): Maximum size in KB.
        min_size (int): Minimum size in KB.
        max_resolution (tuple): Maximum resolution (width, height).
        output_path (str): Path to save the compressed image.
        quality_step (int): Quality step to reduce the image quality.

    Returns:
        int: File size in KB.
    """
    image = ImageOps.exif_transpose(image)
    image.thumbnail(max_resolution)
    for quality in range(100, 5, -quality_step):
        image.save(output_path, "WEBP", quality=quality)
        file_size = os.path.getsize(output_path) / 1024
        if quality == 100 and file_size <= max_size:
            break
        if min_size <= file_size <= max_size:
            break
    return file_size


def duplicate_image(source_path, target_path):
    """
    Duplicate the image without compression.

    Args:
        source_path (str): Path to the original image.
        target_path (str): Path to save the duplicated image.

    Returns:
        None
    """
    shutil.copy2(source_path, target_path)


def compress(filename, city_folder_path, results_city_folder_path, logger):
    """
    Compress the image to fit the size constraints.

    Args:
        filename (str): Image filename.
        city_folder_path (str): Path to the city folder.
        results_city_folder_path (str): Path to save the compressed image.
        logger (Logger): Logger instance.

    Returns:
        None
    """
    input_path = os.path.join(city_folder_path, filename)
    base_filename = os.path.splitext(filename)[0]

    with Image.open(input_path) as img:
        original_size_kb = os.path.getsize(input_path) / 1024

        compressed_output_path = os.path.join(
            results_city_folder_path, f"{base_filename}c.webp"
        )
        if original_size_kb < 750:
            logger.info("Image %s is already compressed", filename)
            duplicate_image(input_path, compressed_output_path)
        else:
            logger.info("Compressing image %s", filename)
            compress_image(
                img.copy(),
                max_size=1500,
                min_size=750,
                max_resolution=(2000, 2000),
                output_path=compressed_output_path,
            )

        thumbnail_output_path = os.path.join(
            results_city_folder_path, f"{base_filename}t.webp"
        )
        if original_size_kb < 70:
            logger.info("Image %s is already compressed", filename)
            duplicate_image(input_path, thumbnail_output_path)
        else:
            logger.info("Compressing thumbnail %s", filename)
            compress_image(
                img.copy(),
                max_size=250,
                min_size=70,
                max_resolution=(900, 900),
                output_path=thumbnail_output_path,
            )

        # if thumbnail size is larger than compressed image, throw an error
        if os.path.getsize(thumbnail_output_path) > os.path.getsize(
            compressed_output_path
        ):
            logger.error(
                "Thumbnail size is larger than compressed image for %s", filename
            )
