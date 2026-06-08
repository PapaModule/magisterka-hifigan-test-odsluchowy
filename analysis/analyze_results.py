#!/usr/bin/env python3
"""Szybka analiza wyników testu odsłuchowego.

Wejściem jest eksport arkusza "Wyniki" do CSV (Plik -> Pobierz -> CSV
w Arkuszach Google). Arkusz ma format "długi" — jeden wiersz na próbę,
z kolumnami: timestamp, ageRange, audioExperience, equipment,
medicalHasExperience, medicalDetails, trialId, trialClass, isGenerated,
answer, correct, orderIndex.

Użycie:
    python3 analysis/analyze_results.py wyniki.csv
"""
import sys
import csv
from collections import defaultdict

TRUE_VALUES = {'true', 'prawda', '1', 'tak'}


def parse_bool(value):
    return value.strip().lower() in TRUE_VALUES


def load_rows(path):
    with open(path, newline='', encoding='utf-8-sig') as f:
        return list(csv.DictReader(f))


def percent(correct, total):
    return 0.0 if total == 0 else 100 * correct / total


def print_breakdown(counts, title):
    print(f"\n{title}")
    print('-' * len(title))
    for key in sorted(counts):
        correct, total = counts[key]
        print(f"  {key:<28} {correct:>3}/{total:<3}  ({percent(correct, total):5.1f}%)")


def main():
    if len(sys.argv) != 2:
        print('Użycie: python3 analyze_results.py <eksport_wynikow.csv>')
        sys.exit(1)

    rows = load_rows(sys.argv[1])
    if not rows:
        print('Brak danych w pliku.')
        return

    sessions = defaultdict(list)
    for row in rows:
        sessions[row['timestamp']].append(row)

    breakdowns = {
        'Trafność: prawdziwe vs wygenerowane': defaultdict(lambda: [0, 0]),
        'Trafność per klasa nagrania': defaultdict(lambda: [0, 0]),
        'Trafność: klasa x pochodzenie': defaultdict(lambda: [0, 0]),
        'Trafność wg przedziału wieku': defaultdict(lambda: [0, 0]),
        'Trafność wg doświadczenia ze słuchem': defaultdict(lambda: [0, 0]),
        'Trafność wg sprzętu odsłuchowego': defaultdict(lambda: [0, 0]),
        'Trafność wg doświadczenia medycznego': defaultdict(lambda: [0, 0]),
    }

    total_correct = 0
    for row in rows:
        correct = parse_bool(row['correct'])
        total_correct += correct
        origin = 'wygenerowane' if parse_bool(row['isGenerated']) else 'prawdziwe'
        cls = row['trialClass']
        medical = 'tak' if parse_bool(row['medicalHasExperience']) else 'nie'

        keyed_buckets = (
            ('Trafność: prawdziwe vs wygenerowane', origin),
            ('Trafność per klasa nagrania', cls),
            ('Trafność: klasa x pochodzenie', f'{cls} / {origin}'),
            ('Trafność wg przedziału wieku', row['ageRange']),
            ('Trafność wg doświadczenia ze słuchem', row['audioExperience']),
            ('Trafność wg sprzętu odsłuchowego', row['equipment']),
            ('Trafność wg doświadczenia medycznego', medical),
        )
        for title, key in keyed_buckets:
            bucket = breakdowns[title][key]
            bucket[1] += 1
            if correct:
                bucket[0] += 1

    print('=' * 60)
    print('ANALIZA WYNIKÓW TESTU ODSŁUCHOWEGO')
    print('=' * 60)
    print(f'\nLiczba ukończonych sesji testowych: {len(sessions)}')
    print(f'Łączna liczba prób:                 {len(rows)}')
    print(f'Ogólna trafność:                    {total_correct}/{len(rows)} '
          f'({percent(total_correct, len(rows)):.1f}%)')

    for title, counts in breakdowns.items():
        print_breakdown({k: tuple(v) for k, v in counts.items()}, title)

    print('\n' + '=' * 60)
    print('WYNIKI PER SESJA (uczestnik)')
    print('=' * 60)
    for timestamp in sorted(sessions):
        session_rows = sessions[timestamp]
        s_correct = sum(parse_bool(r['correct']) for r in session_rows)
        s_total = len(session_rows)
        print(f'  {timestamp:<26} {s_correct:>2}/{s_total:<2}  '
              f'({percent(s_correct, s_total):5.1f}%)')


if __name__ == '__main__':
    main()
