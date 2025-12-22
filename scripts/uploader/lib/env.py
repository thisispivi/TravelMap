from pathlib import Path
from typing import Mapping, Union, Optional

from dotenv import dotenv_values


PathLike = Union[str, Path]


def get_env(root_path: PathLike) -> dict[str, str]:
    """
    Load and return .env data as a dict from a repo root path.

    - root_path: repository root directory
    - env_path: optional path to a .env file; if relative, it's resolved under root_path
    """
    root = Path(root_path)

    env_file = root / "env" / ".env"

    if not env_file.exists():
        raise FileNotFoundError(f".env file not found: {env_file}")

    values: Mapping[str, Optional[str]] = dotenv_values(env_file)
    return {k: v for k, v in values.items() if v is not None}
