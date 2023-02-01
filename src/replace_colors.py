"""
Takes a tsv with space separated color scheme
Takes a JSON that contains strings from that color scheme
Replaces the strings with the color scheme from a user provided row
Uses typer to create a CLI
"""

import typer

def replace_colors(
    tsv_file: str = typer.Option("src/color_schemes.tsv", help="Tab separated file with color schemes"),
    json_file: str = typer.Option("src/clades.json", help="JSON file with strings to replace"),
    prev_row: int = typer.Option(..., help="Row number to use from tsv file"),
    future_row: int = typer.Option(..., help="Row number to use from tsv file"),
):
    """
    Takes a tsv with space separated color scheme
    Takes a JSON that contains strings from that color scheme
    Replaces the strings with the color scheme from a user provided row
    Uses typer to create a CLI
    """
    prev_row -= 1
    future_row -= 1
    assert future_row > prev_row, "future_row must be greater than prev_row"
    with open(tsv_file, "r") as f:
        lines = f.readlines()
        for i, line in enumerate(lines):
          if i == prev_row:
            old_colors = line.strip().split("\t")
          if i == future_row:
            new_colors = line.strip().split("\t")
    with open(json_file, "r") as f:
        # Read as string
        string = f.read()
    for old, new in zip(old_colors, new_colors):
        # Replace all instances of old with new
        old_string = string
        string = string.replace(old, new)
        if old_string == string:
            if old != new:
              print(f"{old} not replaced in {json_file}")
            else:
              print(f"{old} equal to {new}, no replacement needed")

    print(f"New color(s) to use: {new_colors[len(old_colors):]}")

    with open(json_file, "w") as f:
        # Write string to file
        f.write(string)

if __name__ == "__main__":
    typer.run(replace_colors)
