#!/usr/bin/env python3
"""
Rewrite black-diamond Stories so languages no longer share one
first-day-at-work / doctor / looking-for-a-room skeleton.

3× black per language, ~12 sentences, natural dialogue, local flavor.
"""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def S(foreign: str, en: str) -> dict:
    return {"foreign": foreign, "en": en}


def story(
    sid: str,
    title: str,
    subtitle: str,
    sentences: list[dict],
    glosses: dict[str, str],
    cat: str,
) -> dict:
    return {
        "id": sid,
        "title": title,
        "subtitle": subtitle,
        "trail": "black-diamond",
        "categoryId": cat,
        "sentences": sentences,
        "glosses": glosses,
    }


PLOTS: dict[str, list[dict]] = {}

# ─── Norwegian ────────────────────────────────────────────────────────────────
PLOTS["nb"] = [
    story(
        "nb-apotek",
        "På apoteket sent",
        "Late at the pharmacy",
        [
            S("Er det lenge til stenging? Resepten er i appen.", "Is it long until closing? The prescription is in the app."),
            S("Vi har åpent ti minutter til. Har du fødselsnummer?", "We're open ten more minutes. Do you have your national ID number?"),
            S("Ja. Legen sendte den i formiddag, men jeg ser den ikke her.", "Yes. The doctor sent it this morning, but I don't see it here."),
            S("Den ligger under en annen adresse. Oppdaterer du den?", "It's under another address. Will you update it?"),
            S("Gjerne. Kan jeg få smertestillende uten resept i mellomtiden?", "Gladly. Can I get painkillers without a prescription in the meantime?"),
            S("Ja, den vanlige pakken. Med mat, ikke på tom mage.", "Yes, the usual pack. With food, not on an empty stomach."),
            S("Takk. Hva koster det med rabattkort?", "Thanks. What does it cost with a discount card?"),
            S("Førti kroner. Vil du ha kvittering på e-post?", "Forty kroner. Do you want the receipt by email?"),
            S("På SMS er greit. Nummeret er det samme som i systemet.", "SMS is fine. The number is the same as in the system."),
            S("Ferdig. Ta to tabletter i kveld hvis det fortsatt verker.", "Done. Take two tablets tonight if it still hurts."),
            S("Hvis resepten ikke dukker opp i morgen, ringer jeg legen.", "If the prescription doesn't show up tomorrow, I'll call the doctor."),
            S("Godt. Ha en rolig kveld.", "Good. Have a quiet evening."),
        ],
        {
            "apoteket": "the pharmacy",
            "stenging": "closing",
            "Resepten": "the prescription",
            "fødselsnummer": "national ID number",
            "smertestillende": "painkillers",
            "tom mage": "empty stomach",
            "rabattkort": "discount card",
            "kvittering": "receipt",
            "tabletter": "tablets",
            "verker": "hurts / aches",
        },
        "nb-bokmal",
    ),
    story(
        "nb-intervju",
        "Etter intervjuet",
        "After the interview",
        [
            S("Hvordan gikk intervjuet? Du ser lettet ut.", "How did the interview go? You look relieved."),
            S("Bedre enn jeg trodde. De spurte mest om teamarbeid.", "Better than I thought. They asked mostly about teamwork."),
            S("Fikk du se kontoret, eller var det bare digitalt?", "Did you see the office, or was it only digital?"),
            S("Halvt om halvt. Vi startet på video, så en rask omvisning.", "Half and half. We started on video, then a quick tour."),
            S("Hva med lønn? Turte du å spørre?", "What about salary? Did you dare to ask?"),
            S("Ja, til slutt. De sa de sender et intervall i e-post.", "Yes, at the end. They said they'll send a range by email."),
            S("Når hører du fra dem?", "When will you hear from them?"),
            S("Innen fredag, lovet de. Jeg skal ikke mase før mandag.", "By Friday, they promised. I won't nag before Monday."),
            S("Lurt. Skal vi feire med middag uansett?", "Smart. Shall we celebrate with dinner either way?"),
            S("Gjerne. Et sted uten dresskode. Jeg er sliten i hodet.", "Gladly. Somewhere without a dress code. My head is tired."),
            S("Jeg booker bord klokka sju. Du betaler hvis du får jobben.", "I'll book a table at seven. You pay if you get the job."),
            S("Avtale. Takk for at du ventet i kaféen.", "Deal. Thanks for waiting in the café."),
        ],
        {
            "intervjuet": "the interview",
            "lettet": "relieved",
            "teamarbeid": "teamwork",
            "omvisning": "tour",
            "lønn": "salary",
            "intervall": "range / interval",
            "mase": "to nag / pester",
            "dresskode": "dress code",
            "booker": "book",
        },
        "nb-bokmal",
    ),
    story(
        "nb-flytte",
        "Flyttedag i blokka",
        "Moving day in the block",
        [
            S("Heisen er booket fra ti til to. Er bilen lastet?", "The lift is booked from ten to two. Is the car loaded?"),
            S("Nestn. Sofaen sitter fast i trappeoppgangen.", "Almost. The sofa is stuck in the stairwell."),
            S("Nesten. Sofaen sitter fast i trappeoppgangen.", "Almost. The sofa is stuck in the stairwell."),
            S("Vi tar av beina. Ellers treffer vi rekkverket.", "We'll take the legs off. Otherwise we'll hit the railing."),
            S("Har du teip til pappesker som rakner?", "Do you have tape for boxes that are falling apart?"),
            S("I kjøkkeneskene. Og bobleplast til speilet.", "In the kitchen boxes. And bubble wrap for the mirror."),
            S("Naboen under klaget på støy i går. Vi må være stille etter tolv.", "The neighbour below complained about noise yesterday. We must be quiet after twelve."),
            S("Greit. Tungt gods før lunsj, pynt etterpå.", "Fine. Heavy stuff before lunch, decor afterwards."),
            S("Hvor er nøkkelen til boden i kjelleren?", "Where is the key to the storage room in the basement?"),
            S("I den blå skålen ved ytterdøren. Ikke mist den.", "In the blue bowl by the front door. Don't lose it."),
            S("Når kommer vennene som skulle bære?", "When are the friends who were going to carry arriving?"),
            S("Om ti minutter. Sett kaffe på. Det redder humøret.", "In ten minutes. Put coffee on. That saves the mood."),
        ],
        {
            "Heisen": "the lift",
            "booket": "booked",
            "lastet": "loaded",
            "trappeoppgangen": "the stairwell",
            "rekkverket": "the railing",
            "pappesker": "cardboard boxes",
            "bobleplast": "bubble wrap",
            "støy": "noise",
            "boden": "the storage room",
            "kjelleren": "the basement",
        },
        "nb-bokmal",
    ),
]
# fix accidental duplicate line in nb-flytte
PLOTS["nb"][2]["sentences"] = [
    S("Heisen er booket fra ti til to. Er bilen lastet?", "The lift is booked from ten to two. Is the car loaded?"),
    S("Nesten. Sofaen sitter fast i trappeoppgangen.", "Almost. The sofa is stuck in the stairwell."),
    S("Vi tar av beina. Ellers treffer vi rekkverket.", "We'll take the legs off. Otherwise we'll hit the railing."),
    S("Har du teip til pappesker som rakner?", "Do you have tape for boxes that are falling apart?"),
    S("I kjøkkeneskene. Og bobleplast til speilet.", "In the kitchen boxes. And bubble wrap for the mirror."),
    S("Naboen under klaget på støy i går. Vi må være stille etter tolv.", "The neighbour below complained about noise yesterday. We must be quiet after twelve."),
    S("Greit. Tungt gods før lunsj, pynt etterpå.", "Fine. Heavy stuff before lunch, decor afterwards."),
    S("Hvor er nøkkelen til boden i kjelleren?", "Where is the key to the storage room in the basement?"),
    S("I den blå skålen ved ytterdøren. Ikke mist den.", "In the blue bowl by the front door. Don't lose it."),
    S("Når kommer vennene som skulle bære?", "When are the friends who were going to carry arriving?"),
    S("Om ti minutter. Sett kaffe på. Det redder humøret.", "In ten minutes. Put coffee on. That saves the mood."),
    S("Takk for hjelpen i dag. Middag hos meg når vi er ferdige.", "Thanks for the help today. Dinner at mine when we're done."),
]

# ─── Danish ───────────────────────────────────────────────────────────────────
PLOTS["da"] = [
    story(
        "da-bank",
        "MitID virker ikke",
        "MitID isn't working",
        [
            S("MitID virker ikke i netbanken. Kan I hjælpe?", "MitID isn't working in online banking. Can you help?"),
            S("Har du skiftet telefon for nylig?", "Have you changed phone recently?"),
            S("Ja, i weekenden. Koden kom ikke med over.", "Yes, at the weekend. The code didn't transfer over."),
            S("Så skal vi genaktivere dig. Har du pas eller sygesikring?", "Then we need to reactivate you. Do you have a passport or health card?"),
            S("Pas. Det ligger her.", "Passport. It's here."),
            S("Godt. Sæt dig ved skranken. Det tager cirka et kvarter.", "Good. Sit at the counter. It takes about a quarter of an hour."),
            S("Kan jeg betale regninger imens, eller er alt låst?", "Can I pay bills meanwhile, or is everything locked?"),
            S("Alt er midlertidigt spærret af sikkerhedshensyn.", "Everything is temporarily blocked for security reasons."),
            S("Så må huslejen vente til i eftermiddag.", "Then the rent will have to wait until this afternoon."),
            S("Når MitID er klar, får du en SMS.", "When MitID is ready, you'll get a text."),
            S("Tak. Er der gebyr for genaktivering?", "Thanks. Is there a fee for reactivation?"),
            S("Nej, ikke i dag. Velkommen tilbage til systemet.", "No, not today. Welcome back to the system."),
        ],
        {
            "netbanken": "online banking",
            "genaktivere": "reactivate",
            "sygesikring": "health insurance card",
            "skranken": "the counter",
            "spærret": "blocked",
            "huslejen": "the rent",
            "gebyr": "fee",
        },
        "da",
    ),
    story(
        "da-tand",
        "Hos tandlægen",
        "At the dentist",
        [
            S("Goddag. Det er til undersøgelse og en lille fyldning.", "Good day. It's for a check-up and a small filling."),
            S("Har du ondt nu, eller er det bare kontrol?", "Does it hurt now, or is it just a check?"),
            S("Lidt ømt når jeg tygger på venstre side.", "A bit sore when I chew on the left side."),
            S("Læg dig tilbage. Sig til hvis det bliver for meget.", "Lie back. Say if it gets too much."),
            S("Skal jeg have bedøvelse til fyldningen?", "Do I need anaesthetic for the filling?"),
            S("Ja, en lokal. Du mærker et lille stik, så ro.", "Yes, a local. You'll feel a small prick, then calm."),
            S("Hvor lang tid tager det hele?", "How long does the whole thing take?"),
            S("Cirka fyrre minutter. Du kan arbejde bagefter.", "About forty minutes. You can work afterwards."),
            S("Må jeg spise straks efter?", "May I eat right after?"),
            S("Vent til bedøvelsen er væk, ellers bider du dig i kinden.", "Wait until the anaesthetic is gone, or you'll bite your cheek."),
            S("Hvornår skal jeg booke næste tandrensning?", "When should I book the next cleaning?"),
            S("Om et halvt år. Receptionen finder en tid til dig.", "In six months. Reception will find a slot for you."),
        ],
        {
            "tandlægen": "the dentist",
            "undersøgelse": "examination / check-up",
            "fyldning": "filling",
            "ømt": "sore",
            "tygger": "chew",
            "bedøvelse": "anaesthetic",
            "tandrensning": "dental cleaning",
        },
        "da",
    ),
    story(
        "da-vaerksted",
        "På cykelværkstedet",
        "At the bike workshop",
        [
            S("Kæden hopper af, og bremserne bider skævt.", "The chain keeps coming off, and the brakes bite unevenly."),
            S("Lad mig se. Hvor gammel er cyklen cirka?", "Let me see. About how old is the bike?"),
            S("Tre år. Jeg kører til arbejde hver dag.", "Three years. I ride to work every day."),
            S("Så trænger den til service. Kæde, kabler og en ny klods.", "Then it needs a service. Chain, cables and a new pad."),
            S("Hvad koster det, og hvornår er den klar?", "What does it cost, and when is it ready?"),
            S("Omkring seks hundrede. Klar i overmorgen eftermiddag.", "Around six hundred. Ready the day after tomorrow afternoon."),
            S("Har I en lånecykel imens?", "Do you have a loaner bike meanwhile?"),
            S("Desværre nej. Der er en bycykelstation to gader væk.", "Unfortunately no. There's a city-bike station two streets away."),
            S("Kan I sende en SMS når den er færdig?", "Can you text me when it's done?"),
            S("Ja. Navn og nummer på sedlen her.", "Yes. Name and number on this slip."),
            S("Skal jeg betale nu eller ved afhentning?", "Should I pay now or on collection?"),
            S("Ved afhentning. Kort eller MobilePay er fint.", "On collection. Card or MobilePay is fine."),
        ],
        {
            "cykelværkstedet": "the bike workshop",
            "Kæden": "the chain",
            "bremserne": "the brakes",
            "service": "service",
            "kabler": "cables",
            "lånecykel": "loaner bike",
            "afhentning": "collection / pickup",
        },
        "da",
    ),
]

# ─── Swedish ──────────────────────────────────────────────────────────────────
PLOTS["sv"] = [
    story(
        "sv-frisor",
        "Dubbelbokad hos frisören",
        "Double-booked at the hairdresser",
        [
            S("Hej, jag har tid kvart över tre. Mitt namn är på listan.", "Hi, I have an appointment at quarter past three. My name is on the list."),
            S("Vi har tyvärr dubbelbokat den slotten. Kan du vänta tjugo minuter?", "We've unfortunately double-booked that slot. Can you wait twenty minutes?"),
            S("Jag har tåg klockan fem. Blir det knappt?", "I have a train at five. Will it be tight?"),
            S("Vi tar en snabbare klippning. Bara putsa kanterna.", "We'll do a quicker cut. Just tidy the edges."),
            S("Okej. Kan någon annan ta mig om min ordinarie är upptagen?", "Okay. Can someone else take me if my regular is busy?"),
            S("Ja, Alex är ledig om en stund. Vill du kaffe under tiden?", "Yes, Alex is free in a moment. Want coffee while you wait?"),
            S("Tack. Svart, ingen socker.", "Thanks. Black, no sugar."),
            S("Hur vill du ha det i nacken? Kortare än sist?", "How do you want it at the nape? Shorter than last time?"),
            S("Lite kortare, men behåll längden ovanpå.", "A bit shorter, but keep the length on top."),
            S("Klart. Betalning i appen eller kort vid kassan?", "Done. Payment in the app or card at the till?"),
            S("Kort. Och boka nästa tid om sex veckor, tack.", "Card. And book the next appointment in six weeks, please."),
            S("Bokat. Lycka till med tåget!", "Booked. Good luck with the train!"),
        ],
        {
            "frisören": "the hairdresser",
            "dubbelbokat": "double-booked",
            "klippning": "haircut",
            "putsa": "tidy / clean up",
            "nacken": "the nape / neck",
            "kassan": "the till / checkout",
            "Bokat": "booked",
        },
        "sv",
    ),
    story(
        "sv-nyckel",
        "Låst ute",
        "Locked out",
        [
            S("Jag har låst ute mig. Nycklarna ligger på köksbänken.", "I've locked myself out. The keys are on the kitchen counter."),
            S("Har du en reservnyckel hos grannen?", "Do you have a spare key with the neighbour?"),
            S("Hon är bortrest. Och hyresvärden svarar inte.", "She's away. And the landlord isn't answering."),
            S("Då ringer vi låssmed. Det blir dyrt efter fem.", "Then we call a locksmith. It gets expensive after five."),
            S("Hur dyrt ungefär?", "About how expensive?"),
            S("Mellan tusen och två tusen, beroende på låset.", "Between one and two thousand, depending on the lock."),
            S("Har du legitimation? De brukar be om det.", "Do you have ID? They usually ask for it."),
            S("Ja, passet sitter i jackan. Tur.", "Yes, the passport is in the jacket. Lucky."),
            S("Jag beställer nu. Vänta vid porten så de hittar dig.", "I'll order now. Wait at the entrance so they find you."),
            S("Kan de öppna utan att borra sönder cylindern?", "Can they open without drilling out the cylinder?"),
            S("Oftast ja på den här porten. Vi hoppas.", "Usually yes on this door. We hope."),
            S("Tack. Middagen är på mig när jag är inne igen.", "Thanks. Dinner is on me when I'm back inside."),
        ],
        {
            "låst ute": "locked out",
            "Nycklarna": "the keys",
            "reservnyckel": "spare key",
            "hyresvärden": "the landlord",
            "låssmed": "locksmith",
            "legitimation": "ID",
            "porten": "the entrance / door",
            "cylindern": "the cylinder",
        },
        "sv",
    ),
    story(
        "sv-skatt",
        "Hjälp med deklarationen",
        "Help with the tax return",
        [
            S("Förstår du den här rutan i deklarationen?", "Do you understand this box on the tax return?"),
            S("Det är avdrag för resor till jobbet. Har du sparat biljetter?", "It's a deduction for travel to work. Have you kept tickets?"),
            S("Bara i appen. Räcker skärmdumpar?", "Only in the app. Are screenshots enough?"),
            S("Oftast ja. Skatteverket kan be om mer senare.", "Usually yes. The tax agency can ask for more later."),
            S("Jag är rädd att kryssa fel och få efterkrav.", "I'm afraid of ticking wrong and getting a back claim."),
            S("Skicka in i tid. Du kan rätta dig inom tre år.", "Submit on time. You can correct yourself within three years."),
            S("Ska jag ringa supporten, eller klarar vi det här?", "Should I call support, or can we manage this?"),
            S("Vi tar rutan nu. Sen går vi igenom bilagor.", "We'll do the box now. Then we go through attachments."),
            S("Tack. Kaffe på mig när vi är klara.", "Thanks. Coffee on me when we're done."),
            S("Glöm inte e-legitimationen innan du signerar.", "Don't forget electronic ID before you sign."),
            S("BankID är öppet. Nu klickar jag skicka.", "BankID is open. Now I'm clicking send."),
            S("Bra. En sak mindre före deadline.", "Good. One less thing before the deadline."),
        ],
        {
            "deklarationen": "the tax return",
            "avdrag": "deduction",
            "Skatteverket": "the Swedish Tax Agency",
            "efterkrav": "back claim / demand",
            "bilagor": "attachments",
            "e-legitimationen": "electronic ID",
            "signerar": "sign",
        },
        "sv",
    ),
]

# ─── German ───────────────────────────────────────────────────────────────────
PLOTS["de"] = [
    story(
        "de-amt",
        "Nummer beim Bürgeramt",
        "A number at the citizens' office",
        [
            S("Ich brauche eine Meldebescheinigung. Ist heute noch möglich?", "I need a residence certificate. Is it still possible today?"),
            S("Ziehen Sie eine Nummer. Wartezeit ungefähr vierzig Minuten.", "Take a number. Waiting time about forty minutes."),
            S("Online war kein Termin frei vor nächster Woche.", "Online there was no appointment free before next week."),
            S("Ohne Termin nur dringende Fälle. Haben Sie einen Grund?", "Without appointment only urgent cases. Do you have a reason?"),
            S("Die Bank verlangt das Papier bis morgen früh.", "The bank needs the paper by tomorrow morning."),
            S("Dann bleiben Sie. Schalter drei, wenn Ihre Nummer erscheint.", "Then stay. Counter three when your number appears."),
            S("Brauche ich den Personalausweis im Original?", "Do I need the ID card in the original?"),
            S("Ja, und die aktuelle Adresse muss stimmen.", "Yes, and the current address must be correct."),
            S("Kostet die Bescheinigung etwas?", "Does the certificate cost anything?"),
            S("Zwölf Euro, bar oder Karte.", "Twelve euros, cash or card."),
            S("Danke. Darf ich hier im Flur telefonieren?", "Thanks. May I make a call here in the corridor?"),
            S("Leise, ja. Die Ansage kommt über Lautsprecher.", "Quietly, yes. The call comes over the loudspeaker."),
        ],
        {
            "Bürgeramt": "citizens' office",
            "Meldebescheinigung": "residence certificate",
            "Wartezeit": "waiting time",
            "Termin": "appointment",
            "Schalter": "counter",
            "Personalausweis": "ID card",
            "Bescheinigung": "certificate",
        },
        "de",
    ),
    story(
        "de-heizung",
        "Die Heizung spinnt",
        "The heating is broken",
        [
            S("Die Heizung bleibt kalt, obwohl das Thermostat auf fünf steht.", "The heating stays cold even though the thermostat is on five."),
            S("Seit wann? Nur bei dir oder im ganzen Haus?", "Since when? Only at yours or in the whole building?"),
            S("Seit gestern Abend. Die Nachbarn haben auch kein warmes Wasser.", "Since last night. The neighbours have no hot water either."),
            S("Dann ist es die zentrale Anlage. Ich rufe den Hausmeister.", "Then it's the central system. I'll call the caretaker."),
            S("Kommt er heute noch? Es ist fast null Grad draußen.", "Is he still coming today? It's almost zero outside."),
            S("Er schickt einen Notdienst. Rechnung geht an die Verwaltung.", "He's sending emergency service. The bill goes to management."),
            S("Soll ich die Fenster zu und Decken holen?", "Should I close the windows and get blankets?"),
            S("Ja. Und den Wasserhahn tropfen lassen, damit nichts einfriert.", "Yes. And leave the tap dripping so nothing freezes."),
            S("Wann ungefähr kommt der Techniker?", "About when is the technician coming?"),
            S("Innerhalb von zwei Stunden, haben sie gesagt.", "Within two hours, they said."),
            S("Ich bleibe zu Hause und lasse ihn rein.", "I'll stay home and let him in."),
            S("Gut. Schreib mir, wenn es wieder warm wird.", "Good. Message me when it gets warm again."),
        ],
        {
            "Heizung": "heating",
            "Thermostat": "thermostat",
            "Hausmeister": "caretaker",
            "Notdienst": "emergency service",
            "Verwaltung": "management",
            "einfriert": "freezes",
            "Techniker": "technician",
        },
        "de",
    ),
    story(
        "de-werkstatt",
        "In der Autowerkstatt",
        "At the car garage",
        [
            S("Das Auto macht ein Klopfen beim Bremsen. Können Sie hören?", "The car knocks when braking. Can you hear it?"),
            S("Kurz Probefahrt. Lassen Sie den Schlüssel und die Papiere hier.", "Quick test drive. Leave the key and the papers here."),
            S("Wie lange dauert die Diagnose ungefähr?", "About how long does the diagnosis take?"),
            S("Eine Stunde. Danach rufen wir an mit dem Kostenvoranschlag.", "One hour. Then we call with the estimate."),
            S("Ist es sicher noch zu fahren bis dahin?", "Is it still safe to drive until then?"),
            S("Im Stadtverkehr ja, nicht auf der Autobahn.", "In city traffic yes, not on the motorway."),
            S("Brauche ich einen Leihwagen?", "Do I need a courtesy car?"),
            S("Falls die Bremsen neu müssen, ja. Wir haben einen frei.", "If the brakes need replacing, yes. We have one free."),
            S("Zahlen Sie Rechnung per Überweisung oder sofort?", "Do you pay the invoice by transfer or immediately?"),
            S("Karte ist okay. Wann holen Sie das Auto ab?", "Card is fine. When will you collect the car?"),
            S("Morgen früh vor der Arbeit, wenn möglich.", "Tomorrow morning before work, if possible."),
            S("Passt. Wir melden uns heute Nachmittag.", "Fine. We'll be in touch this afternoon."),
        ],
        {
            "Werkstatt": "garage / workshop",
            "Klopfen": "knocking",
            "Bremsen": "brakes",
            "Probefahrt": "test drive",
            "Diagnose": "diagnosis",
            "Kostenvoranschlag": "cost estimate",
            "Leihwagen": "courtesy / rental car",
            "Überweisung": "bank transfer",
        },
        "de",
    ),
]

# ─── Dutch ────────────────────────────────────────────────────────────────────
PLOTS["nl"] = [
    story(
        "nl-gemeente",
        "Bij de gemeente",
        "At the city hall",
        [
            S("Ik moet mij inschrijven op een nieuw adres. Welk loket?", "I need to register at a new address. Which counter?"),
            S("Loket B, met afspraak. Heeft u de bevestiging in de mail?", "Counter B, with appointment. Do you have the confirmation in email?"),
            S("Ja. En het huurcontract plus legitimatie.", "Yes. And the rental contract plus ID."),
            S("Goed. De wachttijd is ongeveer twintig minuten.", "Good. The waiting time is about twenty minutes."),
            S("Krijg ik meteen een uittreksel, of later per post?", "Do I get an extract immediately, or later by post?"),
            S("Desgewenst meteen, tegen betaling.", "If you want, immediately, for a fee."),
            S("Dan nu. De bank vraagt erom voor de hypotheek.", "Then now. The bank asks for it for the mortgage."),
            S("Pin of contant bij de kassa na het gesprek.", "Card or cash at the till after the interview."),
            S("Mag ik hier fotokopieën maken van de papieren?", "May I make photocopies of the papers here?"),
            S("Er staat een automaat in de hal. Vijftig cent per blad.", "There's a machine in the hall. Fifty cents per sheet."),
            S("Dank u. Roep je mijn naam of een nummer?", "Thank you. Do you call my name or a number?"),
            S("Een nummer op het scherm. Succes.", "A number on the screen. Good luck."),
        ],
        {
            "gemeente": "municipality / city hall",
            "inschrijven": "to register",
            "loket": "counter",
            "afspraak": "appointment",
            "huurcontract": "rental contract",
            "uittreksel": "extract / certificate",
            "hypotheek": "mortgage",
            "legitimatie": "ID",
        },
        "nl",
    ),
    story(
        "nl-fietsenmaker",
        "Bij de fietsenmaker",
        "At the bike shop",
        [
            S("De versnellingen schakelen niet meer soepel. Kunt u kijken?", "The gears no longer shift smoothly. Can you take a look?"),
            S("Zet de fiets op de standaard. Hoe vaak rijdt u per week?", "Put the bike on the stand. How often do you ride per week?"),
            S("Elke dag naar kantoor, heen en terug.", "Every day to the office, there and back."),
            S("Dan slijt de ketting sneller. Ik zie ook een kromme velg.", "Then the chain wears faster. I also see a bent rim."),
            S("Wat kost een complete beurt ongeveer?", "About what does a full service cost?"),
            S("Tussen tachtig en honderdtwintig, onderdelen apart.", "Between eighty and one hundred twenty, parts separate."),
            S("Wanneer is hij klaar als ik hem nu laat?", "When is it ready if I leave it now?"),
            S("Donderdagmiddag. Wilt u een leenfiets?", "Thursday afternoon. Would you like a loaner bike?"),
            S("Graag, als die er is.", "Gladly, if there is one."),
            S("Hier de sleutel. Slotcode staat op het briefje.", "Here's the key. Lock code is on the note."),
            S("Betaal ik bij ophalen?", "Do I pay on pickup?"),
            S("Ja, pin is prima. We appen als hij klaar is.", "Yes, card is fine. We'll text when it's ready."),
        ],
        {
            "fietsenmaker": "bike mechanic / shop",
            "versnellingen": "gears",
            "ketting": "chain",
            "velg": "rim",
            "beurt": "service",
            "leenfiets": "loaner bike",
            "ophalen": "pickup",
        },
        "nl",
    ),
    story(
        "nl-terug",
        "Artikel terugbrengen",
        "Returning an item",
        [
            S("Ik wil deze jas terugbrengen. Bon en label zitten er nog aan.", "I want to return this jacket. Receipt and tag are still on it."),
            S("Binnen veertien dagen? Laat me de code scannen.", "Within fourteen days? Let me scan the code."),
            S("Ja, gekocht vorige week. Maat te klein.", "Yes, bought last week. Size too small."),
            S("Wilt u omruilen of geld terug op de kaart?", "Do you want an exchange or money back on the card?"),
            S("Geld terug, alstublieft. Geen andere kleur nodig.", "Money back, please. No other colour needed."),
            S("De retour gaat naar de oorspronkelijke betaalmethode.", "The return goes to the original payment method."),
            S("Hoe lang duurt dat op de rekening?", "How long does that take on the account?"),
            S("Drie tot vijf werkdagen meestal.", "Three to five working days usually."),
            S("Krijg ik een bewijs van retour?", "Do I get proof of return?"),
            S("Op de bon en per mail. Handtekening hier.", "On the receipt and by email. Signature here."),
            S("Dank u. Fijne dag nog.", "Thank you. Have a nice day."),
            S("Graag gedaan. Tot ziens.", "You're welcome. Goodbye."),
        ],
        {
            "terugbrengen": "to return",
            "Bon": "receipt",
            "omruilen": "to exchange",
            "retour": "return",
            "betaalmethode": "payment method",
            "werkdagen": "working days",
            "Handtekening": "signature",
        },
        "nl",
    ),
]

# ─── French ───────────────────────────────────────────────────────────────────
PLOTS["fr"] = [
    story(
        "fr-prefecture",
        "File à la préfecture",
        "Queue at the prefecture",
        [
            S("Je renouvelle mon titre de séjour. C'est le guichet quatre ?", "I'm renewing my residence permit. Is it counter four?"),
            S("Oui, avec rendez-vous. Montrez le QR code sur le téléphone.", "Yes, with appointment. Show the QR code on the phone."),
            S("Le voici. J'ai aussi les photocopies demandées.", "Here it is. I also have the photocopies requested."),
            S("Parfait. Asseyez-vous. L'attente est d'environ une demi-heure.", "Perfect. Sit down. The wait is about half an hour."),
            S("Si un document manque, je dois reprendre un rendez-vous ?", "If a document is missing, do I have to book another appointment?"),
            S("Souvent oui. Vérifiez la liste avant d'être appelé.", "Often yes. Check the list before you're called."),
            S("Le paiement se fait comment ? Carte ou timbre fiscal ?", "How is payment done? Card or tax stamp?"),
            S("Timbre fiscal en ligne, déjà acheté idéalement.", "Tax stamp online, ideally already bought."),
            S("Je l'ai sur le téléphone. Ça suffit ?", "I have it on the phone. Is that enough?"),
            S("Oui. Gardez aussi le justificatif de domicile.", "Yes. Also keep the proof of address."),
            S("Merci. On appelle par numéro ou par nom ?", "Thanks. Do they call by number or by name?"),
            S("Par numéro sur l'écran. Bonne chance.", "By number on the screen. Good luck."),
        ],
        {
            "préfecture": "prefecture",
            "titre de séjour": "residence permit",
            "guichet": "counter",
            "rendez-vous": "appointment",
            "timbre fiscal": "tax stamp",
            "justificatif": "proof / supporting document",
            "domicile": "home address",
        },
        "fr",
    ),
    story(
        "fr-garage",
        "Chez le garagiste",
        "At the mechanic",
        [
            S("La voiture tire à gauche au freinage. Vous pouvez regarder ?", "The car pulls left when braking. Can you take a look?"),
            S("Laissez les clés. On fait un essai dans le quartier.", "Leave the keys. We'll do a test in the neighbourhood."),
            S("Combien de temps pour le diagnostic ?", "How long for the diagnosis?"),
            S("Une heure. Ensuite je vous appelle avec le devis.", "One hour. Then I'll call you with the quote."),
            S("C'est encore roulant pour rentrer ce soir ?", "Is it still drivable to get home tonight?"),
            S("En ville oui, pas d'autoroute pour l'instant.", "In town yes, no motorway for now."),
            S("Si les plaquettes sont mortes, vous avez des pièces ?", "If the pads are shot, do you have parts?"),
            S("Oui, en stock pour ce modèle. Montage demain matin.", "Yes, in stock for this model. Fitting tomorrow morning."),
            S("Vous avez une voiture de prêt ?", "Do you have a courtesy car?"),
            S("Une petite, si vous réservez ce soir.", "A small one, if you book this evening."),
            S("D'accord. Je paie comment ? Carte sur place ?", "OK. How do I pay? Card on site?"),
            S("Carte ou virement. On vous prévient cet après-midi.", "Card or transfer. We'll let you know this afternoon."),
        ],
        {
            "garagiste": "mechanic",
            "freinage": "braking",
            "diagnostic": "diagnosis",
            "devis": "quote",
            "plaquettes": "brake pads",
            "prêt": "loan / courtesy",
            "virement": "transfer",
        },
        "fr",
    ),
    story(
        "fr-coiffeur",
        "Avant l'entretien",
        "Before the interview",
        [
            S("J'ai un entretien demain. Vous avez une place ce soir ?", "I have an interview tomorrow. Do you have a slot this evening?"),
            S("À dix-huit heures trente, juste une coupe simple.", "At half past six, just a simple cut."),
            S("Parfait. Pas de couleur, seulement égaliser.", "Perfect. No colour, only even it out."),
            S("Asseyez-vous. Comment voulez-vous la nuque ?", "Sit down. How do you want the nape?"),
            S("Propre, pas trop courte. Je dois rester sérieux.", "Clean, not too short. I need to look professional."),
            S("Compris. Un peu de produit pour tenir demain ?", "Understood. A bit of product to hold tomorrow?"),
            S("Oui, léger. Rien qui brille trop.", "Yes, light. Nothing that shines too much."),
            S("Vous payez maintenant ou après ?", "Do you pay now or after?"),
            S("Après, carte. Vous prenez les pourboires sur le terminal ?", "After, card. Do you take tips on the terminal?"),
            S("Oui. Je vous souhaite bon courage pour l'entretien.", "Yes. I wish you good luck for the interview."),
            S("Merci. Je repars à quelle heure environ ?", "Thanks. About what time will I leave?"),
            S("Vers dix-neuf heures. Vous serez tranquille.", "Around seven. You'll be fine."),
        ],
        {
            "entretien": "interview",
            "coupe": "cut",
            "égaliser": "to even out",
            "nuque": "nape",
            "produit": "product",
            "pourboires": "tips",
            "terminal": "card terminal",
        },
        "fr",
    ),
]

# ─── Spanish ──────────────────────────────────────────────────────────────────
PLOTS["es"] = [
    story(
        "es-banco",
        "La tarjeta está bloqueada",
        "The card is blocked",
        [
            S("Mi tarjeta está bloqueada y no puedo pagar el alquiler.", "My card is blocked and I can't pay the rent."),
            S("¿Ha viajado o ha introducido mal el PIN varias veces?", "Have you travelled or entered the PIN wrong several times?"),
            S("El PIN mal dos veces en el supermercado ayer.", "The PIN wrong twice at the supermarket yesterday."),
            S("Entonces es un bloqueo de seguridad. ¿Trae el DNI?", "Then it's a security block. Do you have your ID?"),
            S("Sí. ¿Pueden desbloquearla ahora mismo?", "Yes. Can you unblock it right now?"),
            S("Sí, en el mostrador. Tardará unos diez minutos.", "Yes, at the counter. It will take about ten minutes."),
            S("Mientras tanto, ¿puedo hacer una transferencia por ventanilla?", "Meanwhile, can I make a transfer at the window?"),
            S("Con comisión, sí. Escriba el IBAN con cuidado.", "With a fee, yes. Write the IBAN carefully."),
            S("¿Me dan un justificante para el casero?", "Will you give me a receipt for the landlord?"),
            S("Por supuesto. Correo o impreso, como prefiera.", "Of course. Email or printout, as you prefer."),
            S("Impreso, por favor. Gracias por la rapidez.", "Printout, please. Thanks for the speed."),
            S("Cuando suene el móvil, active la tarjeta en la app.", "When the phone pings, activate the card in the app."),
        ],
        {
            "tarjeta": "card",
            "bloqueada": "blocked",
            "alquiler": "rent",
            "desbloquearla": "unblock it",
            "mostrador": "counter",
            "transferencia": "transfer",
            "comisión": "fee",
            "justificante": "receipt / proof",
            "casero": "landlord",
        },
        "es",
    ),
    story(
        "es-cita",
        "Cita previa en el ayuntamiento",
        "Appointment at the town hall",
        [
            S("Vengo con cita previa para empadronarme. ¿Es esta cola?", "I have an appointment to register residency. Is this the queue?"),
            S("Sí. Enseñe el código de la cita en el móvil.", "Yes. Show the appointment code on your phone."),
            S("Aquí está. Llevo el contrato de alquiler y el pasaporte.", "Here it is. I have the rental contract and passport."),
            S("Perfecto. Espere a que llamen su número en la pantalla.", "Perfect. Wait until they call your number on the screen."),
            S("Si falta un papel, ¿hay que pedir otra cita?", "If a paper is missing, do I have to request another appointment?"),
            S("A veces sí. Revise la lista del correo.", "Sometimes yes. Check the list in the email."),
            S("¿Cuánto tarda el certificado de empadronamiento?", "How long does the residency certificate take?"),
            S("Hoy mismo si todo está bien, o en dos días por correo.", "Today if everything is fine, or in two days by post."),
            S("Lo necesito para la escuela de mi hija.", "I need it for my daughter's school."),
            S("Dígaselo al funcionario; a veces lo priorizan.", "Tell the clerk; sometimes they prioritise it."),
            S("Gracias. ¿Se paga aquí o en caja aparte?", "Thanks. Do you pay here or at a separate till?"),
            S("En caja, después del trámite. Buena suerte.", "At the till, after the procedure. Good luck."),
        ],
        {
            "cita previa": "prior appointment",
            "ayuntamiento": "town hall",
            "empadronarme": "to register residency",
            "cola": "queue",
            "certificado": "certificate",
            "funcionario": "clerk / official",
            "trámite": "procedure",
        },
        "es",
    ),
    story(
        "es-peluqueria",
        "Corte antes de la boda",
        "Haircut before the wedding",
        [
            S("Tengo la boda de mi hermana el sábado. ¿Podéis dejarme bien?", "I have my sister's wedding on Saturday. Can you fix me up?"),
            S("Claro. ¿Corte y barba, o solo corte?", "Of course. Cut and beard, or just cut?"),
            S("Los dos. Nada raro; traje formal.", "Both. Nothing wild; formal suit."),
            S("Siéntate. ¿Más corto en los laterales?", "Sit down. Shorter on the sides?"),
            S("Un poco, pero que no se vea el cuero cabelludo.", "A bit, but not so the scalp shows."),
            S("Entendido. ¿Lacas o cera ligera para el día?", "Understood. Spray or light wax for the day?"),
            S("Cera ligera. Voy a sudar de los nervios.", "Light wax. I'll be sweating from nerves."),
            S("Te dejo producto de viaje en la bolsa.", "I'll leave travel product in the bag."),
            S("¿Cuánto es? Pago con tarjeta.", "How much is it? I'll pay by card."),
            S("Veintiocho. ¿Quieres hora para dentro de un mes?", "Twenty-eight. Want an appointment in a month?"),
            S("Sí, el mismo día de la semana si se puede.", "Yes, the same weekday if possible."),
            S("Hecho. Que disfrutéis la boda.", "Done. Enjoy the wedding."),
        ],
        {
            "boda": "wedding",
            "barba": "beard",
            "laterales": "sides",
            "cuero cabelludo": "scalp",
            "cera": "wax",
            "tarjeta": "card",
        },
        "es",
    ),
]

# ─── Italian ──────────────────────────────────────────────────────────────────
PLOTS["it"] = [
    story(
        "it-poste",
        "Alla posta per un pacco",
        "At the post office for a parcel",
        [
            S("Devo ritirare un pacco. Ho il codice del preavviso.", "I need to pick up a parcel. I have the notice code."),
            S("Documento d'identità, per favore. È al bancone tre.", "ID, please. It's at counter three."),
            S("Ecco la carta d'identità. Il pacco è dall'estero?", "Here's the ID card. Is the parcel from abroad?"),
            S("Sì. C'è una piccola dogana da pagare.", "Yes. There's a small customs fee to pay."),
            S("Posso pagare con la carta?", "Can I pay by card?"),
            S("Carta o contanti. Lo scontrino va conservato.", "Card or cash. Keep the receipt."),
            S("Quanto tempo per lo sportello? La fila è lunga.", "How long for the counter? The queue is long."),
            S("Una ventina di minuti. C'è il biglietto numerato.", "About twenty minutes. There's a numbered ticket."),
            S("Se non fossi io il destinatario, potrei ritirarlo lo stesso?", "If I weren't the addressee, could I still pick it up?"),
            S("Solo con delega firmata e copia del documento suo.", "Only with a signed proxy and a copy of their ID."),
            S("Perfetto. Grazie per le indicazioni.", "Perfect. Thanks for the directions."),
            S("Prego. Il monitor chiama il suo numero.", "You're welcome. The screen will call your number."),
        ],
        {
            "pacco": "parcel",
            "preavviso": "notice / notification",
            "bancone": "counter",
            "dogana": "customs",
            "scontrino": "receipt",
            "sportello": "counter / window",
            "destinatario": "addressee",
            "delega": "proxy / authorisation",
        },
        "it",
    ),
    story(
        "it-segreteria",
        "In segreteria studenti",
        "At student services",
        [
            S("Devo iscrivermi all'esame di giugno. È qui?", "I need to register for the June exam. Is it here?"),
            S("Sì. Matricola e documento, per favore.", "Yes. Student number and ID, please."),
            S("Ecco. Il sistema online dava errore ieri sera.", "Here. The online system gave an error last night."),
            S("Succede spesso in scadenza. La registriamo a mano.", "It often happens near the deadline. We'll register you by hand."),
            S("C'è ancora posto nel laboratorio del giovedì?", "Is there still a place in Thursday's lab?"),
            S("Due posti. La conferma arriva via email entro stasera.", "Two places. Confirmation comes by email by tonight."),
            S("Devo pagare la tassa d'esame adesso?", "Do I have to pay the exam fee now?"),
            S("Entro tre giorni, con il bollettino che le stampo.", "Within three days, with the payment slip I'll print for you."),
            S("Posso cambiare corso opzionale dopo l'iscrizione?", "Can I change an optional course after registering?"),
            S("Fino a venerdì sì, poi no.", "Until Friday yes, then no."),
            S("Grazie. Lo sportello chiude a che ora?", "Thanks. What time does the counter close?"),
            S("Alle sedici. Non arrivi all'ultimo minuto.", "At four. Don't arrive at the last minute."),
        ],
        {
            "segreteria": "admin office / registry",
            "iscrivermi": "to register",
            "esame": "exam",
            "Matricola": "student number",
            "scadenza": "deadline",
            "laboratorio": "lab",
            "tassa": "fee",
            "bollettino": "payment slip",
        },
        "it",
    ),
    story(
        "it-officina",
        "In officina",
        "At the workshop",
        [
            S("La moto non parte a freddo. Potete controllare la batteria?", "The motorbike won't start cold. Can you check the battery?"),
            S("Lasci le chiavi. Facciamo un test in venti minuti.", "Leave the keys. We'll run a test in twenty minutes."),
            S("Se va sostituita, avete il pezzo oggi?", "If it needs replacing, do you have the part today?"),
            S("Per questo modello sì. Montaggio un'ora circa.", "For this model yes. Fitting about an hour."),
            S("Quanto costa il pezzo più manodopera?", "How much for the part plus labour?"),
            S("Le faccio un preventivo scritto prima di procedere.", "I'll give you a written quote before we proceed."),
            S("Va bene. Posso aspettare in sala o tornare dopo?", "Fine. Can I wait in the room or come back later?"),
            S("Come preferisce. C'è un bar di fronte.", "As you prefer. There's a café opposite."),
            S("Pago con carta a lavoro finito?", "Do I pay by card when the work is done?"),
            S("Carta o contanti. Scontrino elettronico via mail.", "Card or cash. Electronic receipt by email."),
            S("Perfetto. Mi avvisate sul cellulare.", "Perfect. Message me on the mobile."),
            S("Certo. Il numero è quello del modulo?", "Sure. Is the number the one on the form?"),
        ],
        {
            "officina": "workshop",
            "batteria": "battery",
            "sostituita": "replaced",
            "manodopera": "labour",
            "preventivo": "quote",
            "scontrino": "receipt",
        },
        "it",
    ),
]

# ─── Portuguese (BR) ──────────────────────────────────────────────────────────
PLOTS["pt"] = [
    story(
        "pt-banco",
        "Fila no banco",
        "Queue at the bank",
        [
            S("Preciso desbloquear o cartão e atualizar o cadastro.", "I need to unblock the card and update my registration."),
            S("Senha e documento com foto. Pegue a senha da fila prioritária?", "Password and photo ID. Take a priority queue ticket?"),
            S("Não sou prioridade. Fila normal está boa.", "I'm not priority. The normal queue is fine."),
            S("O sistema pede biometria. Apoie o dedo no leitor.", "The system asks for biometrics. Put your finger on the reader."),
            S("Pronto. O cartão volta a funcionar hoje?", "Done. Does the card work again today?"),
            S("Em alguns minutos na maquininha. Na internet, já.", "In a few minutes at the machine. Online, already."),
            S("Consigo pagar o boleto da luz aqui na hora?", "Can I pay the electricity bill here right now?"),
            S("Sim, no caixa eletrônico ou com o atendente.", "Yes, at the ATM or with the clerk."),
            S("Tem taxa para a segunda via do cartão?", "Is there a fee for a replacement card?"),
            S("Se for extravio, sim. Se for bloqueio temporário, não.", "If it's loss, yes. If temporary block, no."),
            S("Foi bloqueio. Obrigado pela ajuda.", "It was a block. Thanks for the help."),
            S("De nada. Qualquer coisa, use o chat do app.", "You're welcome. Anything else, use the app chat."),
        ],
        {
            "desbloquear": "to unblock",
            "cadastro": "registration",
            "biometria": "biometrics",
            "boleto": "payment slip",
            "caixa eletrônico": "ATM",
            "taxa": "fee",
            "extravio": "loss / misplacement",
        },
        "pt",
    ),
    story(
        "pt-cartorio",
        "No cartório",
        "At the notary office",
        [
            S("Preciso autenticar esta assinatura e reconhecer firma.", "I need to notarise this signature and certify it."),
            S("O documento está completo? Falta a segunda página.", "Is the document complete? The second page is missing."),
            S("Está no envelope. Desculpa. Aqui.", "It's in the envelope. Sorry. Here."),
            S("Certo. O reconhecimento é por semelhança ou verdadeira?", "Right. Is the certification by similarity or true signature?"),
            S("Verdadeira. Trouxe o RG e o CPF.", "True signature. I brought ID and tax number."),
            S("Assine no tablet na minha frente, por favor.", "Sign on the tablet in front of me, please."),
            S("Quanto fica o serviço?", "How much is the service?"),
            S("Cinquenta e dois reais. Cartão ou PIX.", "Fifty-two reais. Card or PIX."),
            S("PIX. O QR Code está no balcão?", "PIX. Is the QR code on the counter?"),
            S("Sim. Quando confirmar o pagamento, eu carimbo.", "Yes. When payment confirms, I'll stamp."),
            S("Pronto. Preciso de duas vias autenticadas.", "Done. I need two certified copies."),
            S("Já saem. Guarde o protocolo se precisar de segunda via.", "Coming right up. Keep the protocol if you need another copy."),
        ],
        {
            "cartório": "notary office",
            "autenticar": "to notarise / authenticate",
            "firma": "signature (legal)",
            "reconhecimento": "certification / recognition",
            "carimbo": "stamp",
            "protocolo": "protocol / reference number",
        },
        "pt",
    ),
    story(
        "pt-chip",
        "Troca de chip",
        "SIM card swap",
        [
            S("Meu chip parou de pegar rede depois da atualização do celular.", "My SIM stopped getting signal after the phone update."),
            S("Vamos testar em outro aparelho. Trouxe o documento?", "We'll test in another handset. Did you bring ID?"),
            S("Sim. E o número da linha está no meu nome.", "Yes. And the line number is in my name."),
            S("Aqui tem sinal. O problema é o chip antigo. Trocamos grátis.", "There's signal here. The problem is the old SIM. We swap free."),
            S("Quanto tempo fica sem linha durante a troca?", "How long is the line down during the swap?"),
            S("Alguns minutos. Salve os contatos na nuvem antes.", "A few minutes. Save contacts to the cloud first."),
            S("Já estão salvos. Ativa o eSIM ou chip físico?", "They're already saved. Activate eSIM or physical SIM?"),
            S("Físico, se o seu modelo for mais antigo.", "Physical, if your model is older."),
            S("É o caso. Pode cortar o chip agora?", "That's the case. Can you cut the SIM now?"),
            S("Pronto. Coloque, reinicie e teste uma ligação.", "Done. Insert, restart and test a call."),
            S("Funcionou. Preciso de comprovante para o trabalho.", "It worked. I need a receipt for work."),
            S("No email em cinco minutos. Boa sorte com a rede.", "In email in five minutes. Good luck with the network."),
        ],
        {
            "chip": "SIM card",
            "rede": "network",
            "aparelho": "device / handset",
            "nuvem": "cloud",
            "eSIM": "eSIM",
            "comprovante": "receipt / proof",
        },
        "pt",
    ),
]

# ─── Polish ───────────────────────────────────────────────────────────────────
PLOTS["pl"] = [
    story(
        "pl-poczta",
        "Na poczcie po paczkę",
        "At the post office for a parcel",
        [
            S("Mam awizo. Chcę odebrać paczkę. Które okienko?", "I have a notice. I want to pick up a parcel. Which window?"),
            S("Okienko drugie. Dowód osobisty proszę.", "Window two. ID card, please."),
            S("Proszę. Kod z SMS-a też mam.", "Here. I also have the code from the text."),
            S("Dobrze. Paczka jest z cłem. Dopłata trzydzieści złotych.", "Good. The parcel has customs. Surcharge thirty zloty."),
            S("Płacę kartą. Potrzebuję paragonu.", "I'll pay by card. I need a receipt."),
            S("Paragon i potwierdzenie odbioru. Podpis tutaj.", "Receipt and proof of collection. Signature here."),
            S("Jak długo jeszcze kolejka? Spieszę się do pracy.", "How long is the queue still? I'm rushing to work."),
            S("Z dziesięć minut. Numerki są na biletomacie.", "About ten minutes. Numbers are on the ticket machine."),
            S("Gdybym nie mógł przyjść, kto może odebrać za mnie?", "If I couldn't come, who can collect for me?"),
            S("Osoba z upoważnieniem i kopią Pana dowodu.", "Someone with authorisation and a copy of your ID."),
            S("Dziękuję. Miłego dnia.", "Thank you. Have a nice day."),
            S("Wzajemnie. Monitor wywoła Pana numer.", "Likewise. The screen will call your number."),
        ],
        {
            "poczcie": "post office",
            "awizo": "delivery notice",
            "paczkę": "parcel",
            "okienko": "window / counter",
            "cłem": "customs",
            "paragonu": "receipt",
            "upoważnieniem": "authorisation",
        },
        "pl",
    ),
    story(
        "pl-urzad",
        "W urzędzie miasta",
        "At the city office",
        [
            S("Chcę złożyć wniosek o dowód osobisty. Czy to to biuro?", "I want to file an application for an ID card. Is this the office?"),
            S("Tak. Numer z automatu i proszę czekać na wywołanie.", "Yes. Number from the machine and please wait to be called."),
            S("Jakie zdjęcie jest potrzebne? Biometryczne z automatu?", "What photo is needed? Biometric from the machine?"),
            S("Tak, na miejscu. Koszt osobno przy okienku.", "Yes, on site. Cost separate at the window."),
            S("Ile się czeka na nowy dowód?", "How long do you wait for a new ID?"),
            S("Około miesiąca. Odbierze Pan osobiście z numerkiem.", "About a month. You'll collect in person with a number."),
            S("Mogę dostać potwierdzenie złożenia wniosku dziś?", "Can I get confirmation of filing the application today?"),
            S("Tak, wydruk po opłacie skarbowej.", "Yes, a printout after the stamp duty."),
            S("Płatność kartą jest możliwa?", "Is card payment possible?"),
            S("Kartą lub BLIK-iem przy kasie.", "By card or BLIK at the till."),
            S("Dziękuję. Czy mogę tu na korytarzu rozmawiać przez telefon?", "Thanks. May I talk on the phone here in the corridor?"),
            S("Cicho tak. Głośne rozmowy prosimy na zewnątrz.", "Quietly yes. Loud calls outside, please."),
        ],
        {
            "urzędzie": "office / authority",
            "wniosek": "application",
            "dowód osobisty": "ID card",
            "biometryczne": "biometric",
            "opłacie skarbowej": "stamp duty",
            "kasie": "till / cash desk",
        },
        "pl",
    ),
    story(
        "pl-fryzjer",
        "U fryzjera przed ślubem",
        "At the hairdresser before a wedding",
        [
            S("W sobotę mam wesele kuzynki. Da radę dziś poprawić fryzurę?", "Saturday I have my cousin's wedding. Can you fix the hair today?"),
            S("O osiemnastej jest wolne. Tylko strzyżenie i lekki układ?", "At six there's a free slot. Just cut and light styling?"),
            S("Tak. Nic ekstrawaganckiego, garnitur formalny.", "Yes. Nothing extravagant, formal suit."),
            S("Siadaj. Krócej po bokach, góra bez zmian?", "Sit. Shorter on the sides, top unchanged?"),
            S("Dokładnie. Żebym nie wyglądał jak na wakacjach.", "Exactly. So I don't look like I'm on holiday."),
            S("Jasne. Żel czy pasta matowa na wesele?", "Clear. Gel or matte paste for the wedding?"),
            S("Pasta matowa. Będę się stresował i pocił.", "Matte paste. I'll be stressed and sweating."),
            S("Dam próbkę do kieszeni. Przyda się w sobotę rano.", "I'll put a sample in your pocket. Useful Saturday morning."),
            S("Ile płacę? Kartą.", "How much do I pay? By card."),
            S("Osiemdziesiąt. Umówić wizytę za miesiąc?", "Eighty. Book a visit in a month?"),
            S("Tak, ten sam dzień tygodnia jeśli wolne.", "Yes, the same weekday if free."),
            S("Zapisane. Udanej zabawy na weselu!", "Booked. Have fun at the wedding!"),
        ],
        {
            "fryzjera": "hairdresser",
            "wesele": "wedding party",
            "strzyżenie": "haircut",
            "garnitur": "suit",
            "pasta": "paste",
            "wizytę": "appointment",
        },
        "pl",
    ),
]


def replace_pack_black(path: Path, lang: str) -> None:
    text = path.read_text(encoding="utf-8")
    m = re.search(r"EXTRA_READ_STORIES\.push\(\.\.\.(\[[\s\S]*?\])\)", text)
    if not m:
        raise SystemExit(f"No EXTRA_READ_STORIES in {path}")
    raw = m.group(1)
    j = re.sub(r"([{,]\s*)([A-Za-z_][A-Za-z0-9_]*)\s*:", r'\1"\2":', raw)
    all_stories = json.loads(j)
    new_black = PLOTS[lang]
    kept = [s for s in all_stories if s.get("trail") != "black-diamond"]
    # order: green, blue, black, double-black
    greens = [s for s in kept if s["trail"] == "green-circle"]
    blues = [s for s in kept if s["trail"] == "blue-square"]
    dbs = [s for s in kept if s["trail"] == "double-black-diamond"]
    others = [s for s in kept if s["trail"] not in ("green-circle", "blue-square", "double-black-diamond")]
    merged = greens + blues + new_black + dbs + others
    trails = {}
    for s in merged:
        trails[s["trail"]] = trails.get(s["trail"], 0) + 1
    assert trails.get("black-diamond") == 3, trails
    assert len(merged) == 12, (len(merged), trails)
    new_raw = json.dumps(merged, ensure_ascii=False, separators=(",", ":"))
    new_text = text[: m.start(1)] + new_raw + text[m.end(1) :]
    path.write_text(new_text, encoding="utf-8")
    print(f"OK pack {path.name}: {[s['id'] for s in new_black]}")


def format_nb_story(s: dict) -> str:
    lines = ["  {"]
    lines.append(f'    id: "{s["id"]}",')
    lines.append(f'    categoryId: "{s["categoryId"]}",')
    lines.append(f'    title: "{s["title"]}",')
    lines.append(f'    subtitle: "{s["subtitle"]}",')
    lines.append(f'    trail: "black-diamond",')
    lines.append("    sentences: [")
    for sent in s["sentences"]:
        nb = sent["foreign"].replace("\\", "\\\\").replace('"', '\\"')
        en = sent["en"].replace("\\", "\\\\").replace('"', '\\"')
        lines.append(f'      {{ nb: "{nb}", en: "{en}" }},')
    lines.append("    ],")
    lines.append("    glosses: {")
    for k, v in s["glosses"].items():
        vv = v.replace("\\", "\\\\").replace('"', '\\"')
        if re.fullmatch(r"[A-Za-zÆØÅæøå0-9_]+", k):
            lines.append(f'      {k}: "{vv}",')
        else:
            kk = k.replace("\\", "\\\\").replace('"', '\\"')
            lines.append(f'      "{kk}": "{vv}",')
    lines.append("    },")
    lines.append("  },")
    return "\n".join(lines)


def replace_nb_black() -> None:
    path = ROOT / "read-stories.js"
    text = path.read_text(encoding="utf-8")
    positions = [m.start() for m in re.finditer(r'trail:\s*"black-diamond"', text)]
    if len(positions) < 3:
        raise SystemExit(f"Expected 3 black-diamond, found {len(positions)}")
    first_trail = positions[0]
    start = text.rfind("\n  {", 0, first_trail)
    if start < 0:
        start = text.rfind("{", 0, first_trail)
    else:
        start = start + 1
    third_trail = positions[2]
    third_open = text.rfind("\n  {", 0, third_trail)
    if third_open < 0:
        third_open = text.rfind("{", 0, third_trail)
    else:
        third_open = third_open + 1
    depth = 0
    i = third_open
    while i < len(text):
        c = text[i]
        if c == "{":
            depth += 1
        elif c == "}":
            depth -= 1
            if depth == 0:
                i += 1
                break
        i += 1
    if i < len(text) and text[i] == ",":
        i += 1
    end = i
    new_block = "\n".join(
        format_nb_story(s).rstrip().rstrip(",") + "," for s in PLOTS["nb"]
    )
    path.write_text(text[:start] + new_block + text[end:], encoding="utf-8")
    print(f"OK NB: {[s['id'] for s in PLOTS['nb']]}")


def main() -> None:
    packs = {
        "da": "lang/da-pack.js",
        "sv": "lang/sv-pack.js",
        "de": "lang/de-pack.js",
        "nl": "lang/nl-pack.js",
        "fr": "lang/fr-pack.js",
        "es": "lang/es-pack.js",
        "it": "lang/it-pack.js",
        "pt": "lang/pt-pack.js",
        "pl": "lang/pl-pack.js",
    }
    for lang, rel in packs.items():
        replace_pack_black(ROOT / rel, lang)
    replace_nb_black()
    print("Done. Bump caches; run enrich_story_glosses.py if desired.")


if __name__ == "__main__":
    main()
