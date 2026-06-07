# Test odsłuchowy — cHiFi-GAN (real vs. generated)

Samodzielna strona do przeprowadzenia testu percepcyjnego: ankieta uczestnika,
osłuchanie kalibracyjne z oryginalnym datasetem, a następnie 30-próbowy test,
w którym uczestnik ocenia, czy nagranie dźwięku serca jest prawdziwe czy
wygenerowane przez model cHiFi-GAN. Wyniki trafiają do Arkusza Google.

Dwa warianty wizualne — `test1.html` (spójny z demo treningu) i `test2.html`
(stonowany, "naukowy") — używają tej samej logiki (`js/app.js`, `js/logic.js`,
`js/data.js`) i różnią się wyłącznie arkuszem CSS. Po wybraniu wariantu usuń
po prostu nieużywany plik HTML i jego arkusz CSS.

## Uruchomienie lokalne

Strona używa modułów ES (`<script type="module">`), które wymagają serwera
HTTP (nie działają z `file://`):

```bash
python3 -m http.server 8000
```

Otwórz `http://localhost:8000/test1.html` lub `http://localhost:8000/test2.html`.

## Testy jednostkowe

Logika wyboru prób, oceniania odpowiedzi i budowy raportu (`js/logic.js`)
oraz integralność manifestu danych (`js/data.js`) są pokryte testami
uruchamianymi wbudowanym test runnerem Node.js (Node 18+):

```bash
npm test
# albo bezpośrednio:
node --test js/*.test.js
```

## Pochodzenie próbek testowych

Próbki w `audio/test/real/` to nagrania z `dataset_exp9` (po 5 na klasę,
różne nagrania/pacjenci). Próbki w `audio/test/generated/` to nagrania
wygenerowane przez model cHiFi-GAN w eksperymencie exp9 — `_01`–`_04` z
checkpointu `epoch_0085`, `_05` z checkpointu `epoch_0080`.

Aby podmienić dowolny zestaw próbek na nowy:

1. Podmień pliki w `audio/test/real/` lub `audio/test/generated/`,
   zachowując te same nazwy (`normal_01.wav`…`normal_05.wav`, analogicznie
   dla pozostałych klas) — wtedy `js/data.js` nie wymaga żadnych zmian.
2. (Opcjonalnie) Jeśli zmienisz nazwy plików, zaktualizuj odpowiadające
   wpisy `file` w `TEST_TRIAL_POOL` w `js/data.js`.
3. Uruchom `npm test` — test `data.test.js` sprawdzi, że nadal masz co
   najmniej 5 prawdziwych i 5 wygenerowanych próbek na klasę z unikalnymi `id`.

Liczbę prób oraz proporcję prawdziwych/wygenerowanych zmienisz w jednym
miejscu — stała `TEST_CONFIG` w `js/data.js`.

## Wdrożenie zbierania wyników (Google Apps Script + Arkusz Google)

1. Utwórz nowy Arkusz Google.
2. W menu wybierz **Rozszerzenia → Apps Script**.
3. Wklej zawartość `google-apps-script.gs` do edytora, zastępując domyślny kod.
   Jeśli chcesz otrzymywać powiadomienia e-mail na inny adres niż domyślny,
   zmień wartość stałej `NOTIFICATION_EMAIL` na górze skryptu.
4. Kliknij **Wdróż → Nowe wdrożenie**, wybierz typ **Aplikacja internetowa**,
   ustaw "Kto ma dostęp" na **Każdy** (anonimowy dostęp jest wymagany,
   żeby strona mogła wysyłać wyniki bez logowania uczestnika).
5. Skopiuj wygenerowany URL aplikacji internetowej (kończy się na `/exec`).
6. Wklej ten URL jako wartość stałej `GAS_WEBHOOK_URL` na górze `js/app.js`
   (zastępując `'PASTE_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE'`).
7. Sprawdź działanie: przejdź przez cały test na stronie i kliknij
   "Wyślij wyniki" — w arkuszu powinien pojawić się arkusz "Wyniki"
   z 30 nowymi wierszami (po jednym na próbę), a na adres z
   `NOTIFICATION_EMAIL` powinien przyjść e-mail z podsumowaniem wyniku.

Jeśli wysyłka się nie powiedzie (np. brak internetu), strona zaproponuje
pobranie wyników jako plik JSON — to zabezpieczenie awaryjne, żeby dane
uczestnika nie przepadły.

## Powiadomienia e-mail o ukończonych testach

Po każdym udanym przesłaniu wyników skrypt `google-apps-script.gs` wysyła
e-mail (przez `MailApp.sendEmail`) na adres z `NOTIFICATION_EMAIL`. Treść
zawiera: znacznik czasu, łączny wynik (x/n + procent), rozbicie wyniku na
klasy (`normal` / `murmur` / `extrastole`) oraz dane z ankiety uczestnika
(wiek, doświadczenie ze słuchem, sprzęt, doświadczenie medyczne).
