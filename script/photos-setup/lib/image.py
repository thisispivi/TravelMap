from PIL import Image, ImageOps
import os
import shutil


def compress_image(
    image, max_size, min_size, max_resolution, output_path, quality_step=5, logger=None
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
        logger (Logger): Logger instance.

    Returns:
        int: File size in KB.
    """
    try:
        # Correct orientation and resize the image
        image = ImageOps.exif_transpose(image)
        image.thumbnail(max_resolution)

        for quality in range(100, 5, -quality_step):
            image.save(output_path, "WEBP", quality=quality)
            file_size = os.path.getsize(output_path) / 1024  # Convert bytes to KB

            # Logging file size for debugging
            logger.info(f"Quality: {quality}, File size: {file_size:.2f} KB")

            if quality == 100 and file_size <= max_size:
                break
            if min_size <= file_size <= max_size:
                break

        return file_size

    except Exception as e:
        logger.error(f"Error compressing image: {e}")
        return None


def duplicate_image(source_path, target_path, logger):
    """
    Duplicate the image without compression.

    Args:
        source_path (str): Path to the original image.
        target_path (str): Path to save the duplicated image.
        logger (Logger): Logger instance.

    Returns:
        None
    """
    try:
        shutil.copy2(source_path, target_path)
    except Exception as e:
        logger.error(f"Error duplicating image: {e}")


def handle_image_compression(
    img, original_size_kb, min_size, max_size, resolution, output_path, logger, filename
):
    """
    Helper function to handle image compression or duplication based on size constraints.

    Args:
        img (PIL.Image): Opened image object.
        original_size_kb (float): Original image size in KB.
        min_size (int): Minimum size in KB.
        max_size (int): Maximum size in KB.
        resolution (tuple): Resolution to resize the image to.
        output_path (str): Path to save the result.
        logger (Logger): Logger instance for logging.
        filename (str): Name of the file being processed.

    Returns:
        None
    """
    if original_size_kb < min_size:
        logger.info(f"Image {filename} is already compressed or smaller than required.")
        duplicate_image(img.filename, output_path, logger)
    else:
        logger.info(f"Compressing image {filename}...")
        file_size = compress_image(
            img.copy(),
            max_size=max_size,
            min_size=min_size,
            max_resolution=(resolution, resolution),
            output_path=output_path,
            logger=logger,
        )
        if file_size:
            logger.info(f"Compressed {filename} to {file_size:.2f} KB.")


def compress(data, filename, city_folder_path, results_city_folder_path, logger):
    """
    Compress the image to fit the size constraints.

    Args:
        data (dict): Dictionary with the size constraints.
        filename (str): Image filename.
        city_folder_path (str): Path to the city folder.
        results_city_folder_path (str): Path to save the compressed image.
        logger (Logger): Logger instance.

    Returns:
        None
    """
    thumbnail_min = data["thumbnail_min"]
    thumbnail_max = data["thumbnail_max"]
    thumbnail_resolution = data["thumbnail_resolution"]
    compressed_min = data["compressed_min"]
    compressed_max = data["compressed_max"]
    compressed_resolution = data["compressed_resolution"]

    input_path = os.path.join(city_folder_path, filename)
    base_filename = os.path.splitext(filename)[0]

    try:
        with Image.open(input_path) as img:
            original_size_kb = os.path.getsize(input_path) / 1024

            compressed_output_path = os.path.join(
                results_city_folder_path, f"{base_filename}c.webp"
            )
            thumbnail_output_path = os.path.join(
                results_city_folder_path, f"{base_filename}t.webp"
            )

            # Handle compression for the main compressed image
            handle_image_compression(
                img,
                original_size_kb,
                compressed_min,
                compressed_max,
                compressed_resolution,
                compressed_output_path,
                logger,
                filename,
            )

            # Handle compression for the thumbnail
            handle_image_compression(
                img,
                original_size_kb,
                thumbnail_min,
                thumbnail_max,
                thumbnail_resolution,
                thumbnail_output_path,
                logger,
                filename,
            )

            # Verify thumbnail is not larger than the compressed version
            if os.path.exists(thumbnail_output_path) and os.path.exists(
                compressed_output_path
            ):
                if os.path.getsize(thumbnail_output_path) > os.path.getsize(
                    compressed_output_path
                ):
                    logger.error(
                        f"Thumbnail size is larger than compressed image for {filename}"
                    )

    except Exception as e:
        logger.error(f"Error processing image {filename}: {e}")
