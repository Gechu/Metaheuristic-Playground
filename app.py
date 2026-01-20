from flask import Flask, render_template, request, jsonify
import time
import numpy as np

from ArtificialBeeColony import artificial_bee_colony_position
from BatAlgorithm import bat_algorithm_position
from GeneticAlgorithm import genetic_algorithm_position

from objective_functions import OBJECTIVE_FUNCTIONS
from helpers import generate_background_image

app = Flask(__name__)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/run", methods=["POST"])
def run_algorithm():
    start_time = time.time()
    data = request.json

    algorithm = data["algorithm"]
    objective_key = data["objective"]
    iterations = int(data["iterations"])
    dimensions = int(data["dimensions"])
    agents = int(data["agents"])
    params = data.get("params", {})

    errors = []

    # ============================
    # Walidacja głównych parametrów
    # ============================
    if iterations < 1:
        errors.append("Liczba iteracji musi być ≥ 1.")
    if dimensions < 1:
        errors.append("Wymiar przestrzeni musi być ≥ 1.")
    if agents < 1:
        errors.append("Liczba agentów musi być ≥ 1.")

    # ============================
    # Walidacja ABC
    # ============================
    if algorithm == "abc":
        try:
            limit = int(params.get("limit"))
            if limit < 1:
                errors.append("Parametr 'limit' (ABC) musi być ≥ 1.")
        except (TypeError, ValueError):
            errors.append("Parametr 'limit' (ABC) musi być liczbą całkowitą ≥ 1.")

    # ============================
    # Walidacja BAT
    # ============================
    elif algorithm == "bat":
        try:
            alpha = float(params.get("alpha"))
            if not (0 < alpha <= 1):
                errors.append("Parametr 'alpha' (Bat) musi być w przedziale (0, 1].")
        except (TypeError, ValueError):
            errors.append("Parametr 'alpha' (Bat) musi być liczbą z przedziału (0, 1].")

        try:
            gamma = float(params.get("gamma"))
            if not (0 < gamma <= 1):
                errors.append("Parametr 'gamma' (Bat) musi być w przedziale (0, 1].")
        except (TypeError, ValueError):
            errors.append("Parametr 'gamma' (Bat) musi być liczbą z przedziału (0, 1].")

        try:
            fmin = float(params.get("fmin"))
            if fmin < 0:
                errors.append("Parametr 'fmin' (Bat) musi być ≥ 0.")
        except (TypeError, ValueError):
            errors.append("Parametr 'fmin' (Bat) musi być liczbą ≥ 0.")

        try:
            fmax = float(params.get("fmax"))
            if "fmin" in locals():
                if fmax <= fmin:
                    errors.append("Parametr 'fmax' (Bat) musi być większy niż 'fmin'.")
            else:
                errors.append("Najpierw popraw parametr 'fmin' (Bat).")
        except (TypeError, ValueError):
            errors.append("Parametr 'fmax' (Bat) musi być liczbą większą niż 'fmin'.")

    # ============================
    # Walidacja GA
    # ============================
    elif algorithm == "ga":
        try:
            cr = float(params.get("crossover_rate"))
            if not (0 <= cr <= 1):
                errors.append("Crossover rate (GA) musi być w przedziale [0, 1].")
        except (TypeError, ValueError):
            errors.append("Crossover rate (GA) musi być liczbą z przedziału [0, 1].")

        try:
            mr = float(params.get("mutation_rate"))
            if not (0 <= mr <= 1):
                errors.append("Mutation rate (GA) musi być w przedziale [0, 1].")
        except (TypeError, ValueError):
            errors.append("Mutation rate (GA) musi być liczbą z przedziału [0, 1].")

        try:
            ms = float(params.get("mutation_scale"))
            if ms <= 0:
                errors.append("Mutation scale (GA) musi być > 0.")
        except (TypeError, ValueError):
            errors.append("Mutation scale (GA) musi być dodatnią liczbą.")

        try:
            er = float(params.get("elitism_rate"))
            if not (0 <= er <= 1):
                errors.append("Elitism rate (GA) musi być w przedziale [0, 1].")
        except (TypeError, ValueError):
            errors.append("Elitism rate (GA) musi być liczbą z przedziału [0, 1].")

        try:
            ts = int(params.get("tournament_size"))
            if ts < 1:
                errors.append("Tournament size (GA) musi być ≥ 1.")
        except (TypeError, ValueError):
            errors.append("Tournament size (GA) musi być liczbą całkowitą ≥ 1.")

    else:
        errors.append("Nieznany algorytm.")

    if errors:
        return jsonify({"error": " ".join(errors)}), 400

    # ============================
    # Pobranie funkcji celu
    # ============================
    objective_cfg = OBJECTIVE_FUNCTIONS[objective_key]
    objective_func = objective_cfg["func"]
    bounds = objective_cfg["bounds"]

    # ============================
    # Uruchomienie algorytmu
    # ============================
    if algorithm == "abc":
        best, best_val, history, positions_log = artificial_bee_colony_position(
            n_bees=agents,
            dim=dimensions,
            bounds=bounds,
            max_iter=iterations,
            objective_func=objective_func,
            limit=int(params["limit"]),
            save_every=1,
        )

    elif algorithm == "bat":
        best, best_val, history, positions_log = bat_algorithm_position(
            fn=objective_func,
            n_bats=agents,
            bounds=bounds,
            alpha=float(params["alpha"]),
            gamma=float(params["gamma"]),
            f_bounds=(float(params["fmin"]), float(params["fmax"])),
            max_iter=iterations,
            dims=dimensions,
            save_every=1,
        )

    elif algorithm == "ga":
        best, best_val, history, positions_log = genetic_algorithm_position(
            pop_size=agents,
            dim=dimensions,
            bounds=bounds,
            max_generations=iterations,
            objective_func=objective_func,
            crossover_rate=float(params["crossover_rate"]),
            mutation_rate=float(params["mutation_rate"]),
            mutation_scale=float(params["mutation_scale"]),
            elitism_rate=float(params["elitism_rate"]),
            tournament_size=int(params["tournament_size"]),
            crossover_type=params["crossover_type"],
            mutation_type=params["mutation_type"],
            save_every=1,
        )

    # ============================
    # Statystyki populacji
    # ============================
    # Jeśli algorytm nie zapisał pozycji (np. dla dim > 2)
    if not positions_log:
        # Tworzymy sztuczną populację z jednego punktu: najlepszego
        last_positions = [best]
    else:
        last_positions = positions_log[-1]

    values = [objective_func(np.array(p)) for p in last_positions]


    best_val = float(best_val)
    worst_val = float(max(values))
    mean_val = float(np.mean(values))
    var_val = float(np.var(values))

    best_point = np.array(best)
    distances = [np.linalg.norm(np.array(p) - best_point) for p in last_positions]
    mean_dist = float(np.mean(distances))

    elapsed = time.time() - start_time

    stats = {
        "best_value": best_val,
        "worst_value": worst_val,
        "mean_value": mean_val,
        "variance": var_val,
        "mean_distance_to_best": mean_dist,
        "execution_time": elapsed,
    }

    # ============================
    # Generowanie tła
    # ============================
    background_filename = f"static/background_{objective_key}.png"
    generate_background_image(
        objective_func=objective_func,
        bounds=bounds,
        resolution=400,
        filename=background_filename,
    )

    return jsonify(
        {
            "best": list(map(float, best)),
            "best_value": best_val,
            "history": list(map(float, history)),
            "positions": [p.tolist() for p in positions_log],
            "objective": objective_key,
            "dimensions": dimensions,
            "background": f"/static/background_{objective_key}.png",
            "bounds": [bounds[0], bounds[1]],
            "stats": stats,
        }
    )


if __name__ == "__main__":
    app.run(debug=True)