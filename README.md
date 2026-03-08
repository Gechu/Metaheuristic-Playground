# Metaheuristic Playground

Aplikacja webowa umożliwiająca interaktywne eksperymentowanie z wybranymi algorytmami metaheurystycznymi. Projekt łączy implementacje algorytmów w Pythonie z wizualizacjami generowanymi w JavaScript, tworząc środowisko do obserwacji procesu optymalizacji na prostych funkcjach testowych.

## Zaimplementowane algorytmy
- **Artificial Bee Colony (ABC)**
- **Genetic Algorithm (GA)**
- **Bat Algorithm**

Każdy algorytm został zaimplementowany od podstaw w Pythonie, z możliwością konfiguracji parametrów i obserwacji przebiegu optymalizacji.

## Architektura aplikacji
- **Backend (Python)**  
  Logika algorytmów, funkcje celu oraz generowanie tła funkcji (map wysokości) z wykorzystaniem `matplotlib`.  
  Kluczowe moduły:
  - `ArtificialBeeColony.py`
  - `GeneticAlgorithm.py`
  - `BatAlgorithm.py`
  - `objective_functions.py`
  - `helpers.py`
  - `app.py` – aplikacja webowa oparta na Flasku

- **Frontend (JavaScript + HTML/CSS)**  
  Animacja ruchu populacji/agentów realizowana jest po stronie przeglądarki.  
  Pliki statyczne znajdują się w katalogu `static/`, a szablony w `templates/`.

## Funkcjonalności
- wybór algorytmu i funkcji testowej,
- konfiguracja parametrów optymalizacji,
- generowanie tła funkcji (krajobrazu) po stronie backendu,
- animacja przebiegu optymalizacji w czasie rzeczywistym,
- wizualna obserwacja zachowania populacji i procesu konwergencji.

## Cel projektu
Celem projektu jest stworzenie przejrzystego środowiska do wizualnego zrozumienia działania metaheurystyk. Aplikacja pozwala obserwować, jak różne algorytmy przeszukują przestrzeń rozwiązań, jak reagują na parametry oraz jak przebiega ich konwergencja na klasycznych funkcjach testowych.

