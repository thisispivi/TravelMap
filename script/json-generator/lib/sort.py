def sort_images_by_index_in_filename(images):
    """
    Sorts the images by the index number on the file name.

    Args:
        images (list): The list of images.

    Returns:
        list: The sorted list of images.
    """
    return sorted(images, key=lambda x: float(x["original"].split(".")[0].split("/")[1]))
