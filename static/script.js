let convergenceChart = null;
let animationInterval = null;

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("startBtn").addEventListener("click", runAlgorithm);
    document.getElementById("algorithm").addEventListener("change", updateCustomParams);
    document.getElementById("objective").addEventListener("change", updateBoundsInfo);
    updateCustomParams();
    updateBoundsInfo();
});

/* ============================
   Informacje o bounds (UI)
============================ */

const OBJECTIVE_BOUNDS_INFO = {
    sphere: "Zakres: [-10, 10]",
    rastrigin: "Zakres: [-5.12, 5.12]",
    rosenbrock: "Zakres: [-5, 5]",
    ackley: "Zakres: [-5, 5]",
    griewank: "Zakres: [-600, 600]",
    schwefel: "Zakres: [-500, 500]",
    zakharov: "Zakres: [-5, 10]"
};

function updateBoundsInfo() {
    const objective = document.getElementById("objective").value;
    const info = OBJECTIVE_BOUNDS_INFO[objective] || "";
    const el = document.getElementById("boundsInfo");
    if (el) {
        el.textContent = info;
    }
}

/* ============================
   Parametry algorytmów
============================ */

function updateCustomParams() {
    const algo = document.getElementById("algorithm").value;
    const box = document.getElementById("customParams");

    if (algo === "abc") {
        box.innerHTML = `
            <h2>Parametry ABC</h2>
            <label>Limit prób:</label>
            <input id="limit" type="number" value="40" min="1">
        `;
    } else if (algo === "bat") {
        box.innerHTML = `
            <h2>Parametry Bat</h2>
            <label>Alpha:</label>
            <input id="alpha" type="number" value="0.9" step="0.1" min="0" max="1">
            <label>Gamma:</label>
            <input id="gamma" type="number" value="0.9" step="0.1" min="0" max="1">
            <label>Min freq:</label>
            <input id="fmin" type="number" value="0" min="0">
            <label>Max freq:</label>
            <input id="fmax" type="number" value="2" min="0">
        `;
    } else if (algo === "ga") {
        box.innerHTML = `
            <h2>Parametry GA</h2>
            <label>Crossover rate:</label>
            <input id="crossover_rate" type="number" value="0.8" step="0.1" min="0" max="1">
            <label>Mutation rate:</label>
            <input id="mutation_rate" type="number" value="0.1" step="0.01" min="0" max="1">
            <label>Mutation scale:</label>
            <input id="mutation_scale" type="number" value="0.1" step="0.01" min="0">
            <label>Elitism rate:</label>
            <input id="elitism_rate" type="number" value="0.1" step="0.01" min="0" max="1">
            <label>Tournament size:</label>
            <input id="tournament_size" type="number" value="3" min="1">
            <label>Crossover type:</label>
            <select id="crossover_type">
                <option value="arithmetic">Arithmetic</option>
                <option value="single_point">Single Point</option>
            </select>
            <label>Mutation type:</label>
            <select id="mutation_type">
                <option value="gaussian">Gaussian</option>
                <option value="uniform">Uniform</option>
            </select>
        `;
    } else {
        box.innerHTML = "";
    }

    updateBoundsInfo();
}

function getParams() {
    const algo = document.getElementById("algorithm").value;

    if (algo === "abc") {
        return { limit: parseInt(document.getElementById("limit").value) };
    }
    if (algo === "bat") {
        return {
            alpha: parseFloat(document.getElementById("alpha").value),
            gamma: parseFloat(document.getElementById("gamma").value),
            fmin: parseFloat(document.getElementById("fmin").value),
            fmax: parseFloat(document.getElementById("fmax").value)
        };
    }
    if (algo === "ga") {
        return {
            crossover_rate: parseFloat(document.getElementById("crossover_rate").value),
            mutation_rate: parseFloat(document.getElementById("mutation_rate").value),
            mutation_scale: parseFloat(document.getElementById("mutation_scale").value),
            elitism_rate: parseFloat(document.getElementById("elitism_rate").value),
            tournament_size: parseInt(document.getElementById("tournament_size").value),
            crossover_type: document.getElementById("crossover_type").value,
            mutation_type: document.getElementById("mutation_type").value
        };
    }
    return {};
}

/* ============================
   Walidacja frontendowa
============================ */

function validatePayload(payload) {
    const errors = [];
    const algo = payload.algorithm;
    const p = payload.params;

    if (!Number.isInteger(payload.iterations) || payload.iterations < 1) {
        errors.push("Liczba iteracji musi być liczbą całkowitą ≥ 1.");
    }
    if (!Number.isInteger(payload.dimensions) || payload.dimensions < 1) {
        errors.push("Wymiar przestrzeni musi być liczbą całkowitą ≥ 1.");
    }
    if (!Number.isInteger(payload.agents) || payload.agents < 1) {
        errors.push("Liczba agentów musi być liczbą całkowitą ≥ 1.");
    }

    if (algo === "abc") {
        if (!Number.isInteger(p.limit) || p.limit < 1) {
            errors.push("Parametr 'limit' (ABC) musi być liczbą całkowitą ≥ 1.");
        }
    } else if (algo === "bat") {
        if (!(p.alpha > 0 && p.alpha <= 1)) {
            errors.push("Parametr 'alpha' (Bat) musi być w przedziale (0, 1].");
        }
        if (!(p.gamma > 0 && p.gamma <= 1)) {
            errors.push("Parametr 'gamma' (Bat) musi być w przedziale (0, 1].");
        }
        if (!(p.fmin >= 0)) {
            errors.push("Parametr 'fmin' (Bat) musi być ≥ 0.");
        }
        if (!(p.fmax > p.fmin)) {
            errors.push("Parametr 'fmax' (Bat) musi być większy niż 'fmin'.");
        }
    } else if (algo === "ga") {
        if (!(p.crossover_rate >= 0 && p.crossover_rate <= 1)) {
            errors.push("Parametr 'crossover rate' (GA) musi być w przedziale [0, 1].");
        }
        if (!(p.mutation_rate >= 0 && p.mutation_rate <= 1)) {
            errors.push("Parametr 'mutation rate' (GA) musi być w przedziale [0, 1].");
        }
        if (!(p.mutation_scale > 0)) {
            errors.push("Parametr 'mutation scale' (GA) musi być > 0.");
        }
        if (!(p.elitism_rate >= 0 && p.elitism_rate <= 1)) {
            errors.push("Parametr 'elitism rate' (GA) musi być w przedziale [0, 1].");
        }
        if (!Number.isInteger(p.tournament_size) || p.tournament_size < 1) {
            errors.push("Parametr 'tournament size' (GA) musi być liczbą całkowitą ≥ 1.");
        }
    }

    return errors;
}

/* ============================
   Uruchamianie algorytmu
============================ */

async function runAlgorithm() {
    const payload = {
        algorithm: document.getElementById("algorithm").value,
        objective: document.getElementById("objective").value,
        iterations: parseInt(document.getElementById("iterations").value),
        dimensions: parseInt(document.getElementById("dimensions").value),
        agents: parseInt(document.getElementById("agents").value),
        params: getParams()
    };

    const status = document.getElementById("status");
    const resultsSection = document.getElementById("resultsSection");
    const results = document.getElementById("results");
    const statsSection = document.getElementById("statsSection");
    const errorSection = document.getElementById("errorSection");
    const errorMessage = document.getElementById("errorMessage");

    status.textContent = "";
    resultsSection.style.display = "none";
    statsSection.style.display = "none";
    errorSection.style.display = "none";
    results.innerHTML = "";
    errorMessage.innerHTML = "";

    if (animationInterval) {
        clearInterval(animationInterval);
        animationInterval = null;
    }

    const validationErrors = validatePayload(payload);
    if (validationErrors.length > 0) {
        errorSection.style.display = "block";
        errorMessage.innerHTML = `
            <ul>${validationErrors.map(e => `<li>${e}</li>`).join("")}</ul>
        `;
        status.textContent = "Popraw dane wejściowe.";
        return;
    }

    status.textContent = "Uruchamianie...";

    try {
        const response = await fetch("/run", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            let message = "Błąd po stronie serwera.";
            try {
                const err = await response.json();
                if (err.error) message = err.error;
            } catch {}

            errorSection.style.display = "block";
            errorMessage.innerHTML = message;
            status.textContent = "Wystąpił błąd.";
            return;
        }

        const data = await response.json();

        status.textContent = "Zakończono.";
        errorSection.style.display = "none";

        resultsSection.style.display = "block";
        results.innerHTML = `
            <div class="best-result-wrapper">
                <div class="best-result-box">
                    <h3>Najlepszy wynik</h3>
                    <p><span class="label">Wartość:</span> <span class="value">${Number(data.best_value).toExponential(4)}</span></p>
                    <p><span class="label">Rozwiązanie:</span> <span class="value">[${data.best.map(x => Number(x).toExponential(4)).join(", ")}]</span></p>
                </div>
            </div>
        `;



        updateStatsTable(data.stats);

        drawConvergence(data.history);

        if (data.dimensions === 2 && data.positions && data.positions.length > 0) {
            animateAgents(data.positions, data.background, data.bounds);
        } else {
            drawNoAnimationMessage(data.dimensions);
        }

    } catch (err) {
        console.error(err);
        errorSection.style.display = "block";
        errorMessage.innerHTML = "Wystąpił błąd przy komunikacji z backendem.";
        status.textContent = "Wystąpił błąd.";
    }
}

/* ============================
   Statystyki
============================ */

function updateStatsTable(stats) {
    const section = document.getElementById("statsSection");
    const body = document.getElementById("statsTableBody");

    if (!stats) {
        section.style.display = "none";
        return;
    }

    section.style.display = "block";

    body.innerHTML = `
        <tr><td>Najlepsza wartość</td><td>${stats.best_value.toExponential(4)}</td></tr>
        <tr><td>Najgorsza wartość</td><td>${stats.worst_value.toExponential(4)}</td></tr>
        <tr><td>Średnia wartość</td><td>${stats.mean_value.toExponential(4)}</td></tr>
        <tr><td>Wariancja populacji</td><td>${stats.variance.toExponential(4)}</td></tr>
        <tr><td>Średnia odległość od najlepszego</td><td>${stats.mean_distance_to_best.toFixed(4)}</td></tr>
        <tr><td>Czas wykonania</td><td>${stats.execution_time.toFixed(3)} s</td></tr>
    `;
}

/* ============================
   Convergence curve
============================ */

function drawConvergence(history) {
    const ctx = document.getElementById("convergenceChart").getContext("2d");

    if (convergenceChart) convergenceChart.destroy();

    convergenceChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: history.map((_, i) => i),
            datasets: [{
                label: "Najlepsza wartość",
                data: history,
                borderColor: "#007acc",
                backgroundColor: "rgba(0,122,204,0.1)",
                borderWidth: 2,
                pointRadius: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    type: "logarithmic",
                    ticks: {
                        callback: v => Number(v).toExponential(2)
                    }
                },
                x: {
                    title: { display: true, text: "Iteracja" }
                }
            }
        }
    });
}

/* ============================
   Animacja z tłem PNG
============================ */

function animateAgents(positionsLog, backgroundURL, bounds) {
    const canvas = document.getElementById("animationCanvas");
    const ctx = canvas.getContext("2d");

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    const width = canvas.width;
    const height = canvas.height;

    const minCoord = bounds[0];
    const maxCoord = bounds[1];

    if (!positionsLog || positionsLog.length === 0) {
        drawNoAnimationMessage(2);
        return;
    }

    const background = new Image();
    background.src = backgroundURL;

    let frame = 0;
    const totalFrames = positionsLog.length;

    if (animationInterval) clearInterval(animationInterval);

    background.onload = () => {
        function drawFrame() {
            ctx.clearRect(0, 0, width, height);

            ctx.drawImage(background, 0, 0, width, height);

            const positions = positionsLog[frame];
            ctx.fillStyle = "red";

            for (const pos of positions) {
                const x = pos[0];
                const y = pos[1];

                const sx = ((x - minCoord) / (maxCoord - minCoord)) * width;
                const sy = height - ((y - minCoord) / (maxCoord - minCoord)) * height;

                ctx.beginPath();
                ctx.arc(sx, sy, 4, 0, 2 * Math.PI);
                ctx.fill();
            }

            frame = (frame + 1) % totalFrames;
        }

        drawFrame();
        animationInterval = setInterval(drawFrame, 200);
    };
}

function drawNoAnimationMessage(dimensions) {
    const canvas = document.getElementById("animationCanvas");
    const ctx = canvas.getContext("2d");

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width || 300;
    canvas.height = rect.height || 300;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#333";
    ctx.font = "16px Segoe UI";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const msg = dimensions === 2
        ? "Brak danych do animacji."
        : "Animacja dostępna tylko dla 2 wymiarów.";

    ctx.fillText(msg, canvas.width / 2, canvas.height / 2);
}