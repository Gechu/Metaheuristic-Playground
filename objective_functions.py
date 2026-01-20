import numpy as np

# ============================
# 1. SPHERE
# ============================
def sphere_function(x: np.ndarray) -> float:
    return np.sum(x**2)

SPHERE_BOUNDS = (-10.0, 10.0)


# ============================
# 2. RASTRIGIN
# ============================
def rastrigin_function(x: np.ndarray, A: float = 10) -> float:
    n = len(x)
    return A * n + np.sum(x**2 - A * np.cos(2 * np.pi * x))

RASTRIGIN_BOUNDS = (-5.12, 5.12)


# ============================
# 3. ROSENBROCK
# ============================
def rosenbrock_function(x: np.ndarray) -> float:
    return np.sum(100.0 * (x[1:] - x[:-1]**2)**2 + (1 - x[:-1])**2)

ROSENBROCK_BOUNDS = (-5.0, 5.0)


# ============================
# 4. ACKLEY
# ============================
def ackley_function(x: np.ndarray) -> float:
    a = 20
    b = 0.2
    c = 2 * np.pi
    n = len(x)

    sum_sq = np.sum(x**2)
    sum_cos = np.sum(np.cos(c * x))

    term1 = -a * np.exp(-b * np.sqrt(sum_sq / n))
    term2 = -np.exp(sum_cos / n)

    return term1 + term2 + a + np.e

ACKLEY_BOUNDS = (-5.0, 5.0)


# ============================
# 5. GRIEWANK
# ============================
def griewank_function(x: np.ndarray) -> float:
    sum_sq = np.sum(x**2) / 4000
    prod_cos = np.prod(np.cos(x / np.sqrt(np.arange(1, len(x) + 1))))
    return sum_sq - prod_cos + 1

GRIEWANK_BOUNDS = (-600.0, 600.0)


# ============================
# 6. SCHWEFEL
# ============================
def schwefel_function(x: np.ndarray) -> float:
    return 418.9829 * len(x) - np.sum(x * np.sin(np.sqrt(np.abs(x))))

SCHWEFEL_BOUNDS = (-500.0, 500.0)


# ============================
# 7. ZAKHAROV
# ============================
def zakharov_function(x: np.ndarray) -> float:
    i = np.arange(1, len(x) + 1)
    return np.sum(x**2) + (np.sum(0.5 * i * x))**2 + (np.sum(0.5 * i * x))**4

ZAKHAROV_BOUNDS = (-5.0, 10.0)


# ============================
# MAPA FUNKCJI
# ============================

OBJECTIVE_FUNCTIONS = {
    "sphere": {
        "func": sphere_function,
        "bounds": SPHERE_BOUNDS,
        "name": "Sphere",
    },
    "rastrigin": {
        "func": rastrigin_function,
        "bounds": RASTRIGIN_BOUNDS,
        "name": "Rastrigin",
    },
    "rosenbrock": {
        "func": rosenbrock_function,
        "bounds": ROSENBROCK_BOUNDS,
        "name": "Rosenbrock",
    },
    "ackley": {
        "func": ackley_function,
        "bounds": ACKLEY_BOUNDS,
        "name": "Ackley",
    },
    "griewank": {
        "func": griewank_function,
        "bounds": GRIEWANK_BOUNDS,
        "name": "Griewank",
    },
    "schwefel": {
        "func": schwefel_function,
        "bounds": SCHWEFEL_BOUNDS,
        "name": "Schwefel",
    },
    "zakharov": {
        "func": zakharov_function,
        "bounds": ZAKHAROV_BOUNDS,
        "name": "Zakharov",
    },
}