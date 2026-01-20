import numpy as np
import matplotlib.pyplot as plt
import os

def wrap_objective_for_meshgrid(objective_func):
    """
    Adapter: pozwala wywołać funkcję celu f(x) na siatce meshgrid (X, Y).
    """
    def wrapped(X, Y):
        XY = np.stack([X, Y], axis=-1)
        Z = np.zeros_like(X)

        it = np.nditer(X, flags=['multi_index'])
        for _ in it:
            i, j = it.multi_index
            point = XY[i, j]
            Z[i, j] = objective_func(point)

        return Z

    return wrapped


def generate_background_image(
    objective_func,
    bounds,
    resolution=400,
    cmap="viridis",
    filename="static/background.png"
):
    """
    Generuje statyczne tło funkcji celu — bez osi, bez marginesów, idealnie dopasowane.
    """
    min_val, max_val = bounds
    x = np.linspace(min_val, max_val, resolution)
    y = np.linspace(min_val, max_val, resolution)
    X, Y = np.meshgrid(x, y)

    wrapped = wrap_objective_for_meshgrid(objective_func)
    Z = wrapped(X, Y)

    os.makedirs(os.path.dirname(filename), exist_ok=True)

    # Rysujemy heatmapę BEZ osi i BEZ marginesów
    fig, ax = plt.subplots(figsize=(4, 4))

    ax.contourf(X, Y, Z, levels=40, cmap=cmap)

    # Usuwamy wszystko, co mogłoby przesunąć obraz
    ax.set_xticks([])
    ax.set_yticks([])
    ax.set_xlim(min_val, max_val)
    ax.set_ylim(min_val, max_val)
    ax.set_aspect("equal", adjustable="box")

    plt.tight_layout(pad=0)
    plt.savefig(filename, dpi=150, bbox_inches="tight", pad_inches=0)
    plt.close()

    return filename
