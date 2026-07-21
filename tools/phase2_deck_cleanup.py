#!/usr/bin/env python3
"""Phase 2: replace placeholder deck cards (week N, chapter N, *-extra-N, course meta)."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

CARD_RE = re.compile(
    r"\{\s*foreign:\s*'((?:\\'|[^'])*)'\s*,\s*native:\s*'((?:\\'|[^'])*)'\s*,\s*"
    r"rank:\s*(\d+)\s*,\s*category:\s*'((?:\\'|[^'])*)'\s*,\s*band:\s*'((?:\\'|[^'])*)'\s*\}"
)


def parse_cards(text: str) -> list[dict]:
    cards = []
    for m in CARD_RE.finditer(text):
        f, n, r, c, b = m.groups()
        cards.append(
            {
                "foreign": f.replace("\\'", "'"),
                "native": n.replace("\\'", "'"),
                "rank": int(r),
                "category": c,
                "band": b,
            }
        )
    return cards


def is_junk(foreign: str, native: str = "") -> bool:
    fl = foreign.lower().strip()
    nl = native.lower().strip()
    if re.match(r"^(woche|uge|vecka)\s+\d+(\s+\d+)?$", fl):
        return True
    if fl in {
        "lese woche",
        "lesewoche",
        "einführungswoche",
        "läsvecka",
        "introduktionsvecka",
        "læseuge",
        "introduktionsuge",
    }:
        return True
    if re.match(r"^(kapitel|kapittel)\s+\d+(\s+\d+)?$", fl):
        return True
    if re.match(r"^cv[-\s]?\d+$", fl):
        return True
    if re.match(r"^(fr|es|it|de|da|sv|nl|pt|pl)-extra-\d+$", fl):
        return True
    if re.match(r"^extra term \d+$", nl):
        return True
    return False


def band_for(rank: int, multiword: bool) -> str:
    if multiword:
        return "phrase"
    if rank <= 100:
        return "A"
    if rank <= 200:
        return "B"
    if rank <= 350:
        return "C"
    if rank <= 500:
        return "D"
    if rank <= 700:
        return "E"
    if rank <= 850:
        return "F"
    return "G"


def category_for(foreign: str, suggested: str | None = None) -> str:
    if suggested in {"noun", "phrase"}:
        return suggested
    return "phrase" if " " in foreign.strip() else "noun"


def js_escape(s: str) -> str:
    return s.replace("\\", "\\\\").replace("'", "\\'")


def card_line(c: dict) -> str:
    return (
        f"    {{ foreign: '{js_escape(c['foreign'])}', native: '{js_escape(c['native'])}', "
        f"rank: {c['rank']}, category: '{c['category']}', band: '{c['band']}' }}"
    )


# ─── Replacement pools (everyday learner-useful; checked against existing deck) ─

REPLACEMENTS: dict[str, list[tuple[str, str, str]]] = {
    "de": [
        ("keine ahnung", "no idea", "phrase"),
        ("alles klar", "all good / okay", "phrase"),
        ("bis später", "see you later", "phrase"),
        ("gute reise", "have a good trip", "phrase"),
        ("guten appetit", "enjoy your meal", "phrase"),
        ("herzlichen glückwunsch", "congratulations", "phrase"),
        ("viel spaß", "have fun", "phrase"),
        ("mach's gut", "take care", "phrase"),
        ("passt schon", "it's fine / no worries", "phrase"),
        ("ich verstehe", "I understand", "phrase"),
        ("ich weiß nicht", "I don't know", "phrase"),
        ("wie bitte", "pardon? / sorry?", "phrase"),
        ("sprechen sie englisch", "do you speak English?", "phrase"),
        ("könnten sie mir helfen", "could you help me?", "phrase"),
        ("wie viel kostet das", "how much does that cost?", "phrase"),
        ("ich hätte gern", "I would like", "phrase"),
        ("einen moment bitte", "one moment please", "phrase"),
        ("das macht nichts", "that's okay / no problem", "phrase"),
        ("es tut mir leid", "I'm sorry", "phrase"),
        ("kassenbon", "receipt", "noun"),
        ("fahrkarte", "ticket (travel)", "noun"),
        ("fahrplan", "timetable", "noun"),
        ("umsteigen", "to change (trains)", "noun"),
        ("verspätung", "delay", "noun"),
        ("auskunft", "information desk / inquiry", "noun"),
        ("anmeldung", "registration / reception", "noun"),
        ("ausweis", "ID card", "noun"),
        ("führerschein", "driver's license", "noun"),
        ("apotheke", "pharmacy", "noun"),
        ("rezept", "prescription / recipe", "noun"),
        ("termin", "appointment", "noun"),
        ("notaufnahme", "emergency room", "noun"),
        ("wohnung", "apartment", "noun"),
        ("miete", "rent", "noun"),
        ("kaution", "deposit (rent)", "noun"),
        ("einkaufen", "to shop / shopping", "noun"),
        ("kasse", "checkout / cash register", "noun"),
        ("rabatt", "discount", "noun"),
        ("geöffnet", "open (for business)", "noun"),
        ("geschlossen", "closed", "noun"),
        ("frühstück", "breakfast", "noun"),
        ("mittagessen", "lunch", "noun"),
        ("abendessen", "dinner", "noun"),
        ("rechnung", "bill / invoice", "noun"),
        ("trinkgeld", "tip (gratuity)", "noun"),
        ("vegetarisch", "vegetarian", "noun"),
        ("bahnhof", "train station", "noun"),
        ("flughafen", "airport", "noun"),
        ("gepäck", "luggage", "noun"),
        ("ankunft", "arrival", "noun"),
        ("abflug", "departure (flight)", "noun"),
        ("wetter", "weather", "noun"),
        ("sonnig", "sunny", "noun"),
        ("bewölkt", "cloudy", "noun"),
        ("handy", "mobile phone", "noun"),
        ("ladegerät", "charger", "noun"),
        ("steckdose", "power outlet", "noun"),
        ("wlan", "Wi‑Fi", "noun"),
        ("passwort", "password", "noun"),
        ("nachricht", "message / news", "noun"),
        ("anruf", "phone call", "noun"),
        ("kollege", "colleague (m.)", "noun"),
        ("kollegin", "colleague (f.)", "noun"),
        ("feierabend", "end of workday", "noun"),
        ("urlaub", "vacation / leave", "noun"),
        ("schmerzen", "pain", "noun"),
        ("fieber", "fever", "noun"),
        ("husten", "cough", "noun"),
        ("kopfschmerzen", "headache", "noun"),
        ("notfall", "emergency", "noun"),
        ("feuerwehr", "fire department", "noun"),
        ("krankenwagen", "ambulance", "noun"),
        ("gefahr", "danger", "noun"),
        ("vorsicht", "caution", "noun"),
        ("verboten", "forbidden", "noun"),
        ("erlaubt", "allowed", "noun"),
        ("eingang", "entrance", "noun"),
        ("ausgang", "exit", "noun"),
        ("aufzug", "elevator", "noun"),
        ("schlüssel", "key", "noun"),
        ("briefkasten", "mailbox", "noun"),
        ("paket", "package", "noun"),
        ("lieferung", "delivery", "noun"),
        ("bestellung", "order", "noun"),
        ("kundenservice", "customer service", "noun"),
        ("beschwerde", "complaint", "noun"),
        ("meinung", "opinion", "noun"),
        ("entscheidung", "decision", "noun"),
        ("vertrag", "contract", "noun"),
        ("unterschrift", "signature", "noun"),
        ("formular", "form", "noun"),
        ("antrag", "application", "noun"),
        ("frist", "deadline", "noun"),
        ("einladung", "invitation", "noun"),
        ("geburtstag", "birthday", "noun"),
        ("geschenk", "gift", "noun"),
        ("geduld", "patience", "noun"),
        ("günstig", "cheap / favorable", "noun"),
        ("teuer", "expensive", "noun"),
        ("nützlich", "useful", "noun"),
        ("sofort", "immediately", "noun"),
        ("wochenende", "weekend", "noun"),
        ("feiertag", "public holiday", "noun"),
        ("frühling", "spring", "noun"),
        ("sommer", "summer", "noun"),
        ("herbst", "autumn", "noun"),
    ],
    "da": [
        ("ingen anelse", "no idea", "phrase"),
        ("alt i orden", "all good / okay", "phrase"),
        ("vi ses senere", "see you later", "phrase"),
        ("god tur", "have a good trip", "phrase"),
        ("velbekomme", "enjoy your meal", "phrase"),
        ("tillykke", "congratulations", "phrase"),
        ("god fornøjelse", "have fun", "phrase"),
        ("pas på dig", "take care", "phrase"),
        ("det er fint", "it's fine", "phrase"),
        ("jeg forstår", "I understand", "phrase"),
        ("jeg ved det ikke", "I don't know", "phrase"),
        ("hvad siger du", "pardon? / what did you say?", "phrase"),
        ("taler du engelsk", "do you speak English?", "phrase"),
        ("kan du hjælpe mig", "can you help me?", "phrase"),
        ("hvad koster det", "how much does it cost?", "phrase"),
        ("jeg vil gerne have", "I would like", "phrase"),
        ("et øjeblik", "one moment", "phrase"),
        ("det gør ikke noget", "that's okay / no problem", "phrase"),
        ("undskyld mig", "excuse me / I'm sorry", "phrase"),
        ("kvittering", "receipt", "noun"),
        ("billet", "ticket", "noun"),
        ("køreplan", "timetable", "noun"),
        ("skifte", "to change (trains)", "noun"),
        ("forsinkelse", "delay", "noun"),
        ("information", "information", "noun"),
        ("tilmelding", "registration", "noun"),
        ("legitimation", "ID", "noun"),
        ("kørekort", "driver's license", "noun"),
        ("apotek", "pharmacy", "noun"),
        ("recept", "prescription", "noun"),
        ("aftale", "appointment / agreement", "noun"),
        ("skadestue", "emergency room", "noun"),
        ("lejlighed", "apartment", "noun"),
        ("husleje", "rent", "noun"),
        ("depositum", "deposit", "noun"),
        ("indkøb", "shopping / groceries", "noun"),
        ("kasse", "checkout", "noun"),
        ("rabat", "discount", "noun"),
        ("åben", "open", "noun"),
        ("lukket", "closed", "noun"),
        ("morgenmad", "breakfast", "noun"),
        ("frokost", "lunch", "noun"),
        ("aftensmad", "dinner", "noun"),
        ("regning", "bill", "noun"),
        ("drikkepenge", "tip", "noun"),
        ("vegetarisk", "vegetarian", "noun"),
        ("station", "station", "noun"),
        ("lufthavn", "airport", "noun"),
        ("bagage", "luggage", "noun"),
        ("ankomst", "arrival", "noun"),
        ("afgang", "departure", "noun"),
        ("vejr", "weather", "noun"),
        ("solrigt", "sunny", "noun"),
        ("overskyet", "cloudy", "noun"),
        ("mobil", "mobile phone", "noun"),
        ("oplader", "charger", "noun"),
        ("stikkontakt", "power outlet", "noun"),
        ("wifi", "Wi‑Fi", "noun"),
        ("adgangskode", "password", "noun"),
        ("besked", "message", "noun"),
        ("opkald", "phone call", "noun"),
        ("kollega", "colleague", "noun"),
        ("chef", "boss", "noun"),
        ("fyraften", "end of workday", "noun"),
        ("ferie", "vacation", "noun"),
        ("smerter", "pain", "noun"),
        ("feber", "fever", "noun"),
        ("hoste", "cough", "noun"),
        ("hovedpine", "headache", "noun"),
        ("nødsituation", "emergency", "noun"),
        ("brandvæsen", "fire department", "noun"),
        ("ambulance", "ambulance", "noun"),
        ("fare", "danger", "noun"),
        ("forsigtig", "careful / caution", "noun"),
        ("forbudt", "forbidden", "noun"),
        ("tilladt", "allowed", "noun"),
        ("indgang", "entrance", "noun"),
        ("udgang", "exit", "noun"),
        ("elevator", "elevator", "noun"),
        ("nøgle", "key", "noun"),
        ("postkasse", "mailbox", "noun"),
        ("pakke", "package", "noun"),
        ("levering", "delivery", "noun"),
        ("bestilling", "order", "noun"),
        ("kundeservice", "customer service", "noun"),
        ("klage", "complaint", "noun"),
        ("mening", "opinion", "noun"),
        ("beslutning", "decision", "noun"),
        ("kontrakt", "contract", "noun"),
        ("underskrift", "signature", "noun"),
        ("formular", "form", "noun"),
        ("ansøgning", "application", "noun"),
        ("frist", "deadline", "noun"),
        ("invitation", "invitation", "noun"),
        ("fødselsdag", "birthday", "noun"),
        ("gave", "gift", "noun"),
        ("tålmodighed", "patience", "noun"),
        ("billig", "cheap", "noun"),
        ("dyr", "expensive", "noun"),
        ("nyttig", "useful", "noun"),
        ("straks", "immediately", "noun"),
        ("weekend", "weekend", "noun"),
        ("helligdag", "public holiday", "noun"),
        ("forår", "spring", "noun"),
        ("sommer", "summer", "noun"),
        ("efterår", "autumn", "noun"),
        ("vinter", "winter", "noun"),
        ("cv", "CV / resume", "noun"),
    ],
    "sv": [
        ("ingen aning", "no idea", "phrase"),
        ("allt bra", "all good", "phrase"),
        ("vi ses senare", "see you later", "phrase"),
        ("trevlig resa", "have a nice trip", "phrase"),
        ("smaklig måltid", "enjoy your meal", "phrase"),
        ("grattis", "congratulations", "phrase"),
        ("ha så kul", "have fun", "phrase"),
        ("sköt om dig", "take care", "phrase"),
        ("det är okej", "it's okay", "phrase"),
        ("jag förstår", "I understand", "phrase"),
        ("jag vet inte", "I don't know", "phrase"),
        ("hur sa du", "pardon?", "phrase"),
        ("talar du engelska", "do you speak English?", "phrase"),
        ("kan du hjälpa mig", "can you help me?", "phrase"),
        ("vad kostar det", "how much does it cost?", "phrase"),
        ("jag skulle vilja ha", "I would like", "phrase"),
        ("ett ögonblick", "one moment", "phrase"),
        ("det gör inget", "that's okay / no problem", "phrase"),
        ("förlåt", "sorry / excuse me", "phrase"),
        ("kvitto", "receipt", "noun"),
        ("biljett", "ticket", "noun"),
        ("tidtabell", "timetable", "noun"),
        ("byta", "to change (trains)", "noun"),
        ("försening", "delay", "noun"),
        ("information", "information", "noun"),
        ("anmälan", "registration", "noun"),
        ("legitimation", "ID", "noun"),
        ("körkort", "driver's license", "noun"),
        ("apotek", "pharmacy", "noun"),
        ("recept", "prescription", "noun"),
        ("tid", "appointment / time", "noun"),
        ("akuten", "emergency room", "noun"),
        ("lägenhet", "apartment", "noun"),
        ("hyra", "rent", "noun"),
        ("deposition", "deposit", "noun"),
        ("handla", "to shop", "noun"),
        ("kassa", "checkout", "noun"),
        ("rabatt", "discount", "noun"),
        ("öppet", "open", "noun"),
        ("stängt", "closed", "noun"),
        ("frukost", "breakfast", "noun"),
        ("lunch", "lunch", "noun"),
        ("middag", "dinner", "noun"),
        ("nota", "bill", "noun"),
        ("dricks", "tip", "noun"),
        ("vegetarisk", "vegetarian", "noun"),
        ("station", "station", "noun"),
        ("flygplats", "airport", "noun"),
        ("bagage", "luggage", "noun"),
        ("ankomst", "arrival", "noun"),
        ("avgång", "departure", "noun"),
        ("väder", "weather", "noun"),
        ("soligt", "sunny", "noun"),
        ("molnigt", "cloudy", "noun"),
        ("mobil", "mobile phone", "noun"),
        ("laddare", "charger", "noun"),
        ("eluttag", "power outlet", "noun"),
        ("wifi", "Wi‑Fi", "noun"),
        ("lösenord", "password", "noun"),
        ("meddelande", "message", "noun"),
        ("samtal", "phone call", "noun"),
        ("kollega", "colleague", "noun"),
        ("chef", "boss", "noun"),
        ("quitting time", "end of workday", "noun"),  # will replace carefully
        ("semester", "vacation", "noun"),
        ("smärta", "pain", "noun"),
        ("feber", "fever", "noun"),
        ("hosta", "cough", "noun"),
        ("huvudvärk", "headache", "noun"),
        ("nödsituation", "emergency", "noun"),
        ("brandkår", "fire department", "noun"),
        ("ambulans", "ambulance", "noun"),
        ("fara", "danger", "noun"),
        ("försiktighet", "caution", "noun"),
        ("förbjudet", "forbidden", "noun"),
        ("tillåtet", "allowed", "noun"),
        ("ingång", "entrance", "noun"),
        ("utgång", "exit", "noun"),
        ("hiss", "elevator", "noun"),
        ("nyckel", "key", "noun"),
        ("brevlåda", "mailbox", "noun"),
        ("paket", "package", "noun"),
        ("leverans", "delivery", "noun"),
        ("beställning", "order", "noun"),
        ("kundtjänst", "customer service", "noun"),
        ("klagomål", "complaint", "noun"),
        ("åsikt", "opinion", "noun"),
        ("beslut", "decision", "noun"),
        ("kontrakt", "contract", "noun"),
        ("underskrift", "signature", "noun"),
        ("formulär", "form", "noun"),
        ("ansökan", "application", "noun"),
        ("deadline", "deadline", "noun"),
        ("inbjudan", "invitation", "noun"),
        ("födelsedag", "birthday", "noun"),
        ("present", "gift", "noun"),
        ("tålamod", "patience", "noun"),
        ("billig", "cheap", "noun"),
        ("dyr", "expensive", "noun"),
        ("användbar", "useful", "noun"),
        ("genast", "immediately", "noun"),
        ("helg", "weekend", "noun"),
        ("helgdag", "public holiday", "noun"),
        ("vår", "spring", "noun"),
        ("sommar", "summer", "noun"),
        ("höst", "autumn", "noun"),
        ("vinter", "winter", "noun"),
        ("cv", "CV / resume", "noun"),
        ("feberfri", "fever-free", "noun"),
    ],
    "fr": [
        ("aucune idée", "no idea", "phrase"),
        ("tout va bien", "all good", "phrase"),
        ("à plus tard", "see you later", "phrase"),
        ("bon voyage", "have a good trip", "phrase"),
        ("bon appétit", "enjoy your meal", "phrase"),
        ("félicitations", "congratulations", "phrase"),
        ("amuse-toi bien", "have fun", "phrase"),
        ("prends soin de toi", "take care", "phrase"),
        ("ça va", "it's fine / okay", "phrase"),
        ("je comprends", "I understand", "phrase"),
        ("je ne sais pas", "I don't know", "phrase"),
        ("comment", "pardon?", "phrase"),
        ("parlez-vous anglais", "do you speak English?", "phrase"),
        ("pouvez-vous m'aider", "can you help me?", "phrase"),
        ("combien ça coûte", "how much does it cost?", "phrase"),
        ("je voudrais", "I would like", "phrase"),
        ("un instant", "one moment", "phrase"),
        ("ce n'est pas grave", "that's okay / no problem", "phrase"),
        ("je suis désolé", "I'm sorry", "phrase"),
        ("reçu", "receipt", "noun"),
        ("billet", "ticket", "noun"),
        ("horaire", "timetable", "noun"),
        ("correspondance", "connection / transfer", "noun"),
        ("retard", "delay", "noun"),
        ("renseignements", "information desk", "noun"),
        ("inscription", "registration", "noun"),
        ("pièce d'identité", "ID document", "phrase"),
        ("permis de conduire", "driver's license", "phrase"),
        ("pharmacie", "pharmacy", "noun"),
        ("ordonnance", "prescription", "noun"),
        ("rendez-vous", "appointment", "noun"),
        ("urgences", "emergency room", "noun"),
        ("appartement", "apartment", "noun"),
        ("loyer", "rent", "noun"),
        ("caution", "deposit", "noun"),
        ("courses", "errands / groceries", "noun"),
        ("caisse", "checkout", "noun"),
        ("réduction", "discount", "noun"),
        ("ouvert", "open", "noun"),
        ("fermé", "closed", "noun"),
        ("petit-déjeuner", "breakfast", "noun"),
        ("déjeuner", "lunch", "noun"),
        ("dîner", "dinner", "noun"),
        ("addition", "bill (restaurant)", "noun"),
        ("pourboire", "tip", "noun"),
        ("végétarien", "vegetarian", "noun"),
        ("gare", "train station", "noun"),
        ("aéroport", "airport", "noun"),
        ("bagages", "luggage", "noun"),
        ("arrivée", "arrival", "noun"),
        ("départ", "departure", "noun"),
        ("météo", "weather", "noun"),
        ("ensoleillé", "sunny", "noun"),
        ("nuageux", "cloudy", "noun"),
        ("portable", "mobile phone", "noun"),
        ("chargeur", "charger", "noun"),
        ("prise", "power outlet / plug", "noun"),
        ("wifi", "Wi‑Fi", "noun"),
        ("mot de passe", "password", "phrase"),
        ("message", "message", "noun"),
        ("appel", "phone call", "noun"),
        ("collègue", "colleague", "noun"),
        ("patron", "boss", "noun"),
        ("congés", "time off / leave", "noun"),
        ("douleur", "pain", "noun"),
        ("fièvre", "fever", "noun"),
        ("toux", "cough", "noun"),
        ("mal de tête", "headache", "phrase"),
        ("urgence", "emergency", "noun"),
        ("pompiers", "firefighters", "noun"),
        ("ambulance", "ambulance", "noun"),
        ("danger", "danger", "noun"),
        ("attention", "caution / attention", "noun"),
        ("interdit", "forbidden", "noun"),
        ("autorisé", "allowed", "noun"),
        ("entrée", "entrance", "noun"),
        ("sortie", "exit", "noun"),
        ("ascenseur", "elevator", "noun"),
        ("clé", "key", "noun"),
        ("boîte aux lettres", "mailbox", "phrase"),
        ("colis", "package", "noun"),
        ("livraison", "delivery", "noun"),
        ("commande", "order", "noun"),
        ("service client", "customer service", "phrase"),
        ("plainte", "complaint", "noun"),
        ("avis", "opinion / review", "noun"),
        ("décision", "decision", "noun"),
        ("contrat", "contract", "noun"),
        ("signature", "signature", "noun"),
        ("formulaire", "form", "noun"),
        ("demande", "application / request", "noun"),
        ("délai", "deadline / time limit", "noun"),
        ("invitation", "invitation", "noun"),
        ("anniversaire", "birthday", "noun"),
        ("cadeau", "gift", "noun"),
        ("patience", "patience", "noun"),
        ("pas cher", "cheap", "phrase"),
        ("cher", "expensive", "noun"),
        ("utile", "useful", "noun"),
        ("tout de suite", "immediately", "phrase"),
        ("week-end", "weekend", "noun"),
        ("jour férié", "public holiday", "phrase"),
        ("printemps", "spring", "noun"),
        ("été", "summer", "noun"),
        ("automne", "autumn", "noun"),
        ("hiver", "winter", "noun"),
    ],
    "es": [
        ("ni idea", "no idea", "phrase"),
        ("todo bien", "all good", "phrase"),
        ("hasta luego", "see you later", "phrase"),
        ("buen viaje", "have a good trip", "phrase"),
        ("buen provecho", "enjoy your meal", "phrase"),
        ("felicidades", "congratulations", "phrase"),
        ("diviértete", "have fun", "phrase"),
        ("cuídate", "take care", "phrase"),
        ("está bien", "it's fine", "phrase"),
        ("entiendo", "I understand", "phrase"),
        ("no sé", "I don't know", "phrase"),
        ("cómo dice", "pardon?", "phrase"),
        ("habla inglés", "do you speak English?", "phrase"),
        ("puede ayudarme", "can you help me?", "phrase"),
        ("cuánto cuesta", "how much does it cost?", "phrase"),
        ("quisiera", "I would like", "phrase"),
        ("un momento", "one moment", "phrase"),
        ("no pasa nada", "that's okay / no problem", "phrase"),
        ("lo siento", "I'm sorry", "phrase"),
        ("recibo", "receipt", "noun"),
        ("billete", "ticket", "noun"),
        ("horario", "timetable / schedule", "noun"),
        ("transbordo", "transfer (transport)", "noun"),
        ("retraso", "delay", "noun"),
        ("información", "information", "noun"),
        ("inscripción", "registration", "noun"),
        ("documento de identidad", "ID document", "phrase"),
        ("carnet de conducir", "driver's license", "phrase"),
        ("farmacia", "pharmacy", "noun"),
        ("receta", "prescription / recipe", "noun"),
        ("cita", "appointment", "noun"),
        ("urgencias", "emergency room", "noun"),
        ("piso", "apartment / flat", "noun"),
        ("alquiler", "rent", "noun"),
        ("fianza", "deposit", "noun"),
        ("compras", "shopping", "noun"),
        ("caja", "checkout / cash register", "noun"),
        ("descuento", "discount", "noun"),
        ("abierto", "open", "noun"),
        ("cerrado", "closed", "noun"),
        ("desayuno", "breakfast", "noun"),
        ("almuerzo", "lunch", "noun"),
        ("cena", "dinner", "noun"),
        ("cuenta", "bill", "noun"),
        ("propina", "tip", "noun"),
        ("vegetariano", "vegetarian", "noun"),
        ("estación", "station", "noun"),
        ("aeropuerto", "airport", "noun"),
        ("equipaje", "luggage", "noun"),
        ("llegada", "arrival", "noun"),
        ("salida", "departure / exit", "noun"),
        ("tiempo", "weather / time", "noun"),
        ("soleado", "sunny", "noun"),
        ("nublado", "cloudy", "noun"),
        ("móvil", "mobile phone", "noun"),
        ("cargador", "charger", "noun"),
        ("enchufe", "power outlet", "noun"),
        ("wifi", "Wi‑Fi", "noun"),
        ("contraseña", "password", "noun"),
        ("mensaje", "message", "noun"),
        ("llamada", "phone call", "noun"),
        ("compañero", "colleague / classmate", "noun"),
        ("jefe", "boss", "noun"),
        ("vacaciones", "vacation", "noun"),
        ("dolor", "pain", "noun"),
        ("fiebre", "fever", "noun"),
        ("tos", "cough", "noun"),
        ("dolor de cabeza", "headache", "phrase"),
        ("emergencia", "emergency", "noun"),
        ("bomberos", "firefighters", "noun"),
        ("ambulancia", "ambulance", "noun"),
        ("peligro", "danger", "noun"),
        ("precaución", "caution", "noun"),
        ("prohibido", "forbidden", "noun"),
        ("permitido", "allowed", "noun"),
        ("entrada", "entrance", "noun"),
        ("ascensor", "elevator", "noun"),
        ("llave", "key", "noun"),
        ("buzón", "mailbox", "noun"),
        ("paquete", "package", "noun"),
        ("entrega", "delivery", "noun"),
        ("pedido", "order", "noun"),
        ("atención al cliente", "customer service", "phrase"),
        ("queja", "complaint", "noun"),
        ("opinión", "opinion", "noun"),
        ("decisión", "decision", "noun"),
        ("contrato", "contract", "noun"),
        ("firma", "signature", "noun"),
        ("formulario", "form", "noun"),
        ("solicitud", "application", "noun"),
        ("plazo", "deadline", "noun"),
        ("invitación", "invitation", "noun"),
        ("cumpleaños", "birthday", "noun"),
        ("regalo", "gift", "noun"),
        ("paciencia", "patience", "noun"),
        ("barato", "cheap", "noun"),
        ("caro", "expensive", "noun"),
        ("útil", "useful", "noun"),
        ("inmediatamente", "immediately", "noun"),
        ("fin de semana", "weekend", "phrase"),
        ("festivo", "public holiday", "noun"),
        ("primavera", "spring", "noun"),
        ("verano", "summer", "noun"),
        ("otoño", "autumn", "noun"),
        ("invierno", "winter", "noun"),
    ],
    "it": [
        ("non ne ho idea", "no idea", "phrase"),
        ("tutto bene", "all good", "phrase"),
        ("a dopo", "see you later", "phrase"),
        ("buon viaggio", "have a good trip", "phrase"),
        ("buon appetito", "enjoy your meal", "phrase"),
        ("congratulazioni", "congratulations", "phrase"),
        ("divertiti", "have fun", "phrase"),
        ("abbi cura di te", "take care", "phrase"),
        ("va bene", "it's fine / okay", "phrase"),
        ("capisco", "I understand", "phrase"),
        ("non lo so", "I don't know", "phrase"),
        ("come dice", "pardon?", "phrase"),
        ("parla inglese", "do you speak English?", "phrase"),
        ("può aiutarmi", "can you help me?", "phrase"),
        ("quanto costa", "how much does it cost?", "phrase"),
        ("vorrei", "I would like", "phrase"),
        ("un momento", "one moment", "phrase"),
        ("non fa niente", "that's okay / no problem", "phrase"),
        ("mi dispiace", "I'm sorry", "phrase"),
        ("scontrino", "receipt", "noun"),
        ("biglietto", "ticket", "noun"),
        ("orario", "timetable", "noun"),
        ("cambio", "change / transfer", "noun"),
        ("ritardo", "delay", "noun"),
        ("informazioni", "information", "noun"),
        ("iscrizione", "registration", "noun"),
        ("documento d'identità", "ID document", "phrase"),
        ("patente", "driver's license", "noun"),
        ("farmacia", "pharmacy", "noun"),
        ("ricetta", "prescription / recipe", "noun"),
        ("appuntamento", "appointment", "noun"),
        ("pronto soccorso", "emergency room", "phrase"),
        ("appartamento", "apartment", "noun"),
        ("affitto", "rent", "noun"),
        ("caparra", "deposit", "noun"),
        ("spesa", "shopping / groceries", "noun"),
        ("cassa", "checkout", "noun"),
        ("sconto", "discount", "noun"),
        ("aperto", "open", "noun"),
        ("chiuso", "closed", "noun"),
        ("colazione", "breakfast", "noun"),
        ("pranzo", "lunch", "noun"),
        ("cena", "dinner", "noun"),
        ("conto", "bill", "noun"),
        ("mancia", "tip", "noun"),
        ("vegetariano", "vegetarian", "noun"),
        ("stazione", "station", "noun"),
        ("aeroporto", "airport", "noun"),
        ("bagaglio", "luggage", "noun"),
        ("arrivo", "arrival", "noun"),
        ("partenza", "departure", "noun"),
        ("tempo", "weather / time", "noun"),
        ("soleggiato", "sunny", "noun"),
        ("nuvoloso", "cloudy", "noun"),
        ("cellulare", "mobile phone", "noun"),
        ("caricabatterie", "charger", "noun"),
        ("presa", "power outlet", "noun"),
        ("wifi", "Wi‑Fi", "noun"),
        ("password", "password", "noun"),
        ("messaggio", "message", "noun"),
        ("chiamata", "phone call", "noun"),
        ("collega", "colleague", "noun"),
        ("capo", "boss", "noun"),
        ("ferie", "vacation / leave", "noun"),
        ("dolore", "pain", "noun"),
        ("febbre", "fever", "noun"),
        ("tosse", "cough", "noun"),
        ("mal di testa", "headache", "phrase"),
        ("emergenza", "emergency", "noun"),
        ("vigili del fuoco", "firefighters", "phrase"),
        ("ambulanza", "ambulance", "noun"),
        ("pericolo", "danger", "noun"),
        ("attenzione", "caution / attention", "noun"),
        ("vietato", "forbidden", "noun"),
        ("consentito", "allowed", "noun"),
        ("ingresso", "entrance", "noun"),
        ("uscita", "exit", "noun"),
        ("ascensore", "elevator", "noun"),
        ("chiave", "key", "noun"),
        ("cassetta della posta", "mailbox", "phrase"),
        ("pacco", "package", "noun"),
        ("consegna", "delivery", "noun"),
        ("ordine", "order", "noun"),
        ("servizio clienti", "customer service", "phrase"),
        ("reclamo", "complaint", "noun"),
        ("opinione", "opinion", "noun"),
        ("decisione", "decision", "noun"),
        ("contratto", "contract", "noun"),
        ("firma", "signature", "noun"),
        ("modulo", "form", "noun"),
        ("domanda", "application / question", "noun"),
        ("scadenza", "deadline", "noun"),
        ("invito", "invitation", "noun"),
        ("compleanno", "birthday", "noun"),
        ("regalo", "gift", "noun"),
        ("pazienza", "patience", "noun"),
        ("economico", "cheap / affordable", "noun"),
        ("costoso", "expensive", "noun"),
        ("utile", "useful", "noun"),
        ("subito", "immediately", "noun"),
        ("fine settimana", "weekend", "phrase"),
        ("festa", "holiday / party", "noun"),
        ("primavera", "spring", "noun"),
        ("estate", "summer", "noun"),
        ("autunno", "autumn", "noun"),
        ("inverno", "winter", "noun"),
    ],
}

# Fix the accidental English entry in Swedish pool
REPLACEMENTS["sv"] = [
    (f, n, c) for f, n, c in REPLACEMENTS["sv"] if f != "quitting time"
]
REPLACEMENTS["sv"].append(("slutet av arbetsdagen", "end of the workday", "phrase"))


def clean_pack(lang: str) -> tuple[int, int]:
    path = ROOT / "lang" / f"{lang}-pack.js"
    text = path.read_text(encoding="utf-8")
    cards = parse_cards(text)
    if not cards:
        raise SystemExit(f"No cards parsed for {lang}")

    existing = {c["foreign"].lower() for c in cards if not is_junk(c["foreign"], c["native"])}
    pool = []
    seen_pool = set()
    for f, n, cat in REPLACEMENTS.get(lang, []):
        key = f.lower()
        if key in existing or key in seen_pool:
            continue
        seen_pool.add(key)
        pool.append((f, n, cat))

    junk_idxs = [i for i, c in enumerate(cards) if is_junk(c["foreign"], c["native"])]
    if len(pool) < len(junk_idxs):
        raise SystemExit(
            f"{lang}: need {len(junk_idxs)} replacements, only have {len(pool)}"
        )

    replaced = 0
    for i, idx in enumerate(junk_idxs):
        f, n, cat = pool[i]
        rank = cards[idx]["rank"]
        multi = " " in f.strip()
        cards[idx] = {
            "foreign": f,
            "native": n,
            "rank": rank,
            "category": category_for(f, cat),
            "band": band_for(rank, multi),
        }
        replaced += 1

    # Rebuild STARTER_DECKS array in file
    m = re.search(r"(window\.STARTER_DECKS\[id\]\s*=\s*\[)", text)
    if not m:
        raise SystemExit(f"STARTER_DECKS not found in {path}")
    start = m.end()
    # find matching ]; after start - first ]; that closes the array after cards
    # Use the first occurrence of "\n  ];" after STARTER_DECKS
    end_m = re.search(r"\n  \];", text[start:])
    if not end_m:
        raise SystemExit(f"Could not find end of STARTER_DECKS in {path}")
    end = start + end_m.start()

    body = ",\n".join(card_line(c) for c in cards)
    new_text = text[:start] + "\n" + body + "\n" + text[end:]
    path.write_text(new_text, encoding="utf-8")

    # verify
    verify = parse_cards(path.read_text(encoding="utf-8"))
    remaining = [c for c in verify if is_junk(c["foreign"], c["native"])]
    if remaining:
        raise SystemExit(f"{lang}: still junk after clean: {remaining[:5]}")
    if len(verify) != len(cards):
        raise SystemExit(f"{lang}: card count changed {len(cards)} → {len(verify)}")
    # unique foreigns
    foreigns = [c["foreign"].lower() for c in verify]
    if len(foreigns) != len(set(foreigns)):
        from collections import Counter

        dups = [k for k, v in Counter(foreigns).items() if v > 1]
        raise SystemExit(f"{lang}: duplicate foreigns: {dups[:10]}")

    print(f"{lang}: replaced {replaced} junk cards; deck size {len(verify)}")
    return replaced, len(verify)


def main():
    total = 0
    for lang in ["de", "da", "sv", "fr", "es", "it"]:
        n, _ = clean_pack(lang)
        total += n
    print(f"Phase 2 cleanup complete: {total} cards replaced.")


if __name__ == "__main__":
    main()
