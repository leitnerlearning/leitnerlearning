#!/usr/bin/env python3
"""
Rewrite double-black Stories so languages no longer share one
strike / public-transport debate / summer-plans skeleton.

Keeps 3× double-black per language, ~12 sentences, natural dialogue.
Seed glosses are content-heavy; run enrich_story_glosses.py after if desired.
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
        "trail": "double-black-diamond",
        "categoryId": cat,
        "sentences": sentences,
        "glosses": glosses,
    }


# ─── Unique plot trios per language ───────────────────────────────────────────
# Goal: no shared EN skeleton across languages for the DB slot.

PLOTS: dict[str, list[dict]] = {}

# Norwegian (NB uses nb: key — converted at write time)
PLOTS["nb"] = [
    story(
        "nb-ferge",
        "Fergen går ikke",
        "The ferry is cancelled",
        [
            S("Har du sjekket rutetabellen i dag?", "Have you checked the timetable today?"),
            S("Ja. Fergen til øya er innstilt på grunn av storm.", "Yes. The ferry to the island is cancelled because of the storm."),
            S("Så vi sitter fast her til i morgen?", "So we're stuck here until tomorrow?"),
            S("Ikke nødvendigvis. Det går en buss langs kysten klokka fire.", "Not necessarily. There's a bus along the coast at four."),
            S("Tar den oss helt til kaien?", "Does it take us all the way to the quay?"),
            S("Nesten. Så går det en liten båt hvis bølgene roer seg.", "Almost. Then a small boat runs if the waves calm down."),
            S("Skal vi booke billetter nå, eller vente?", "Should we book tickets now, or wait?"),
            S("Nå. Køen blir lang hvis flere hører det samme.", "Now. The queue will be long if more people hear the same thing."),
            S("Hvor er bussholdeplassen fra hotellet?", "Where is the bus stop from the hotel?"),
            S("Ti minutter til fots, rett forbi butikken.", "Ten minutes on foot, straight past the shop."),
            S("Greit. Jeg tar sekkene, du sjekker appen.", "Alright. I'll take the bags, you check the app."),
            S("Vi snakkes når bussen er bekreftet.", "We'll talk when the bus is confirmed."),
        ],
        {
            "rutetabellen": "the timetable",
            "Fergen": "the ferry",
            "innstilt": "cancelled",
            "storm": "storm",
            "øya": "the island",
            "kysten": "the coast",
            "kaien": "the quay",
            "bølgene": "the waves",
            "booke": "to book",
            "Køen": "the queue",
            "bussholdeplassen": "the bus stop",
            "bekreftet": "confirmed",
            "sekkene": "the bags",
        },
        "nb-bokmal",
    ),
    story(
        "nb-hytte",
        "Hytta før vinteren",
        "The cabin before winter",
        [
            S("Vi må stenge hytta før frosten kommer.", "We have to close the cabin before the frost comes."),
            S("Jeg kan tømme vannet i rørene på lørdag.", "I can drain the water in the pipes on Saturday."),
            S("Flott. Hvem tar ut søpla og låser vedskjulet?", "Great. Who takes out the trash and locks the woodshed?"),
            S("Det kan jeg gjøre, hvis du sjekker taket for løv.", "I can do that, if you check the roof for leaves."),
            S("Taket ser greit ut. Men nøkkelen til boden mangler.", "The roof looks fine. But the key to the shed is missing."),
            S("Den ligger i skuffen under stearinlysene.", "It's in the drawer under the candles."),
            S("Skal vi invitere naboene til en siste kaffe?", "Should we invite the neighbors for a last coffee?"),
            S("Gjerne. De passet på hunden da vi var borte.", "Gladly. They looked after the dog while we were away."),
            S("Når kjører du oppover?", "When are you driving up?"),
            S("Fredag ettermiddag, hvis det ikke snør for hardt.", "Friday afternoon, if it doesn't snow too hard."),
            S("Send melding når du er framme.", "Send a message when you arrive."),
            S("Det gjør jeg. Så sees vi ved peisen.", "I will. Then we'll see each other by the fireplace."),
        ],
        {
            "Hytta": "the cabin",
            "stenge": "to close / shut",
            "frosten": "the frost",
            "tømme": "to empty / drain",
            "rørene": "the pipes",
            "søpla": "the trash",
            "vedskjulet": "the woodshed",
            "boden": "the shed",
            "ste stearinlysene": "the candles",
            "stearinlysene": "the candles",
            "passet på": "looked after",
            "snør": "snows",
            "peisen": "the fireplace",
            "oppover": "up (the road / inland)",
        },
        "nb-bokmal",
    ),
    story(
        "nb-nordlys",
        "Nordlys i Tromsø",
        "Northern lights in Tromsø",
        [
            S("Vil du bli med til Tromsø i helga?", "Do you want to come to Tromsø this weekend?"),
            S("For nordlyset? Er det realistisk nå?", "For the northern lights? Is that realistic now?"),
            S("Værmeldingen lover klar himmel to netter.", "The forecast promises clear sky two nights."),
            S("Jeg har bare en gammel dunjakke.", "I only have an old down jacket."),
            S("Lån den tykke fra meg. Og ta ullundertøy.", "Borrow the thick one from me. And bring wool base layers."),
            S("Hvor overnatter vi? Hotell er dyrt midt i sesongen.", "Where do we stay? Hotels are expensive mid-season."),
            S("Jeg fant en enkel Airbnb nær sentrum.", "I found a simple Airbnb near the centre."),
            S("Kan vi ta nattbussen fra Oslo for å spare?", "Can we take the night bus from Oslo to save money?"),
            S("Fly er raskere, men bussen er halv pris.", "Flying is faster, but the bus is half price."),
            S("Da tar jeg bussen. Du flyr, så møtes vi der.", "Then I'll take the bus. You fly, and we meet there."),
            S("Avtalt. Si ifra når du lander.", "Agreed. Let me know when you land."),
            S("Og du melder hvis nordlyset kommer tidlig.", "And you report if the lights come early."),
        ],
        {
            "nordlyset": "the northern lights",
            "realistisk": "realistic",
            "Værmeldingen": "the weather forecast",
            "himmel": "sky",
            "dunjakke": "down jacket",
            "ullundertøy": "wool underwear / base layers",
            "overnatter": "stay overnight",
            "sesongen": "the season",
            "nattbussen": "the night bus",
            "halv pris": "half price",
            "Avtalt": "agreed",
            "lander": "land",
        },
        "nb-bokmal",
    ),
]

PLOTS["da"] = [
    story(
        "da-cykel",
        "Cyklen er stjålet",
        "The bike is stolen",
        [
            S("Min cykel stod låst her i går aftes. Nu er den væk.", "My bike was locked here last night. Now it's gone."),
            S("Er låsen brækket, eller tog de hele hjulet?", "Is the lock broken, or did they take the whole wheel?"),
            S("Låsen ligger på fortovet. De har klippet den over.", "The lock is on the pavement. They cut it."),
            S("Har du anmeldt det til politiet?", "Have you reported it to the police?"),
            S("Ikke endnu. Jeg skal også ringe til forsikringen.", "Not yet. I also have to call the insurance."),
            S("Tag et billede af stedet først. Det hjælper sagen.", "Take a photo of the spot first. It helps the case."),
            S("God idé. Tror du jeg finder den på Den Blå Avis?", "Good idea. Do you think I'll find it on the classifieds site?"),
            S("Måske. Nogle tyve sælger dem hurtigt videre.", "Maybe. Some thieves resell them quickly."),
            S("Hvordan kommer jeg på arbejde i morgen?", "How do I get to work tomorrow?"),
            S("Tag metroen, eller lån min ekstra cykel.", "Take the metro, or borrow my spare bike."),
            S("Tak. Jeg henter nøglerne efter frokost.", "Thanks. I'll pick up the keys after lunch."),
            S("Sig til, hvis politiet ringer dig op.", "Let me know if the police call you back."),
        ],
        {
            "cykel": "bike",
            "stjålet": "stolen",
            "låst": "locked",
            "låsen": "the lock",
            "fortovet": "the pavement",
            "anmeldt": "reported",
            "forsikringen": "the insurance",
            "tyve": "thieves",
            "metroen": "the metro",
            "ekstra": "extra / spare",
            "nøglerne": "the keys",
        },
        "da",
    ),
    story(
        "da-vaskeri",
        "Vaskerummet igen",
        "The laundry room again",
        [
            S("Nogen har taget mit tøj ud af maskinen midt i programmet.", "Someone took my laundry out of the machine mid-cycle."),
            S("Igen? Det er tredje gang denne måned.", "Again? That's the third time this month."),
            S("Det lå vådt på bordet. En strømpe manglede.", "It was wet on the table. One sock was missing."),
            S("Vi burde indføre en bookingtavle i kælderen.", "We should put up a booking board in the basement."),
            S("Bestyrelsen sagde nej sidste gang. For bøvlet, sagde de.", "The board said no last time. Too much hassle, they said."),
            S("Så skriver jeg en seddel med navn og tid næste gang.", "Then I'll leave a note with name and time next time."),
            S("Gør det høfligt. Ellers bliver stemningen værre.", "Do it politely. Otherwise the mood gets worse."),
            S("Jeg er høflig. Men jeg vil have mine sokker tilbage.", "I'm polite. But I want my socks back."),
            S("Skal vi tage det op på næste husmøde?", "Should we raise it at the next building meeting?"),
            S("Ja. Jeg tager et billede af det våde tøj som bevis.", "Yes. I'll take a photo of the wet laundry as proof."),
            S("Godt. Jeg støtter dig, hvis nogen bliver sure.", "Good. I'll back you if anyone gets annoyed."),
            S("Tak. Vasketøj skal ikke starte en krig.", "Thanks. Laundry shouldn't start a war."),
        ],
        {
            "Vaskerummet": "the laundry room",
            "maskinen": "the machine",
            "programmet": "the cycle / programme",
            "vådt": "wet",
            "bookingtavle": "booking board",
            "kælderen": "the basement",
            "Bestyrelsen": "the board (housing)",
            "seddel": "note / slip",
            "husmøde": "building meeting",
            "bevis": "proof / evidence",
            "Vasketøj": "laundry",
        },
        "da",
    ),
    story(
        "da-festival",
        "Ingen billetter tilbage",
        "No tickets left",
        [
            S("Festivalbilletterne er udsolgt. Alle tre dage.", "The festival tickets are sold out. All three days."),
            S("Seriøst? Jeg havde regnet med at købe i dag.", "Seriously? I was counting on buying today."),
            S("Der er kun dyre gensalg online. Det er for vildt.", "There are only expensive resales online. It's crazy."),
            S("Skal vi droppe det og tage til stranden i stedet?", "Should we drop it and go to the beach instead?"),
            S("Gerne. Vejret ser stabilt ud hele weekenden.", "Gladly. The weather looks steady all weekend."),
            S("Jeg booker et teltplads ved vandet i aften.", "I'll book a tent pitch by the water tonight."),
            S("Tag solcreme og et ekstra tæppe. Det bliver køligt om natten.", "Bring sunscreen and an extra blanket. It gets cool at night."),
            S("Har du en kogeplade, eller køber vi mad ude?", "Do you have a camping stove, or do we buy food out?"),
            S("Vi tager grill og brød. Simpelt er fint.", "We'll take a grill and bread. Simple is fine."),
            S("Hvornår kører toget derned?", "When does the train leave for there?"),
            S("Lørdag morgen klokken ni. Mød mig på perron tre.", "Saturday morning at nine. Meet me on platform three."),
            S("Aftalt. Så får vi festival uden billetter.", "Agreed. Then we get a festival without tickets."),
        ],
        {
            "udsolgt": "sold out",
            "gensalg": "resale",
            "stranden": "the beach",
            "teltplads": "tent pitch",
            "solcreme": "sunscreen",
            "tæppe": "blanket",
            "kogeplade": "camping stove / hotplate",
            "grill": "grill",
            "perron": "platform",
            "Aftalt": "agreed",
        },
        "da",
    ),
]

PLOTS["sv"] = [
    story(
        "sv-nattag",
        "Nattåget är fullt",
        "The night train is full",
        [
            S("Nattåget till Åre är fullbokat hela veckan.", "The night train to Åre is fully booked all week."),
            S("Även liggplatserna? Jag bokade för sent igen.", "Even the berths? I booked too late again."),
            S("Ja. Det finns sittplatser på dagståget i morgon.", "Yes. There are seats on the day train tomorrow."),
            S("Hur lång tid tar det utan sovvagn?", "How long does it take without a sleeper car?"),
            S("Ungefär elva timmar. Ta mat och hörlurar.", "About eleven hours. Bring food and headphones."),
            S("Kan vi dela kupé med någon vi känner?", "Can we share a compartment with someone we know?"),
            S("Min kusin tar samma tåg. Hon har plats vid fönstret.", "My cousin is on the same train. She has a window seat."),
            S("Perfekt. Jag byter biljett i appen nu.", "Perfect. I'll change the ticket in the app now."),
            S("Kom ihåg sittvagnens nummer innan perrongen.", "Remember the coach number before the platform."),
            S("Var möts vi om tåget blir försenat?", "Where do we meet if the train is delayed?"),
            S("Vid biljettautomaten i hallen.", "At the ticket machine in the hall."),
            S("Bra. Då ses vi i snön på lördag.", "Good. Then we'll see each other in the snow on Saturday."),
        ],
        {
            "Nattåget": "the night train",
            "fullbokat": "fully booked",
            "liggplatserna": "the berths / couchettes",
            "sovvagn": "sleeper car",
            "kupé": "compartment",
            "kusin": "cousin",
            "sittvagnens": "the seating coach's",
            "perrongen": "the platform",
            "försenat": "delayed",
            "biljettautomaten": "the ticket machine",
        },
        "sv",
    ),
    story(
        "sv-granne",
        "Grannen festar sent",
        "The neighbour parties late",
        [
            S("Hörde du basen i natt? Klockan var två.", "Did you hear the bass last night? It was two o'clock."),
            S("Ja. Jag sov med kudden över huvudet.", "Yes. I slept with the pillow over my head."),
            S("Ska vi knacka på, eller skriva en lapp först?", "Should we knock, or write a note first?"),
            S("En lapp känns mjukare. Vi bor ju vägg i vägg.", "A note feels softer. We do live wall to wall."),
            S("Vad skriver vi utan att låta arga?", "What do we write without sounding angry?"),
            S("Att vi jobbar tidigt, och ber om lägre volym efter elva.", "That we work early, and ask for lower volume after eleven."),
            S("Om det fortsätter kan hyresvärden hjälpa.", "If it continues the landlord can help."),
            S("Hoppas det inte behövs. De verkade trevliga i hissen.", "Hope it isn't needed. They seemed nice in the lift."),
            S("Jag sätter lappen i deras brevlåda i kväll.", "I'll put the note in their letterbox tonight."),
            S("Vill du att jag följer med om de ringer på?", "Do you want me to come along if they knock?"),
            S("Gärna. Då blir det mindre pinsamt.", "Gladly. Then it's less awkward."),
            S("Bra. Vi tar det lugnt och vänligt.", "Good. We'll keep it calm and friendly."),
        ],
        {
            "Grannen": "the neighbour",
            "basen": "the bass",
            "knacka": "to knock",
            "lapp": "note",
            "vägg i vägg": "wall to wall / next door",
            "hyresvärden": "the landlord",
            "brevlåda": "letterbox",
            "pinsamt": "awkward / embarrassing",
            "volym": "volume",
        },
        "sv",
    ),
    story(
        "sv-skargard",
        "Skärgården i morgon",
        "The archipelago tomorrow",
        [
            S("Vill du ut i skärgården i morgon bitti?", "Do you want to go out to the archipelago early tomorrow?"),
            S("Om vinden lugnar sig. I dag är det för hårda vågor.", "If the wind calms down. Today the waves are too rough."),
            S("SMHI lovar sol efter nio. Båten går kvart i tio.", "The forecast promises sun after nine. The boat leaves at quarter to ten."),
            S("Tar vi matsäck, eller äter vi på bryggan?", "Do we bring a packed lunch, or eat on the jetty?"),
            S("Matsäck. Kaféet på holmen är stängt på måndagar.", "Packed lunch. The café on the islet is closed on Mondays."),
            S("Glöm inte badkläder. Vattnet är kallt men fint.", "Don't forget swimwear. The water is cold but nice."),
            S("Jag tar också en extra tröja till färjan hem.", "I'll also take an extra jumper for the ferry home."),
            S("Hur länge stannar vi på ön?", "How long do we stay on the island?"),
            S("Tills sista båten, runt sex, om vi inte missar den.", "Until the last boat, around six, unless we miss it."),
            S("Var köper vi biljetterna?", "Where do we buy the tickets?"),
            S("I appen i kväll, så slipper vi kö.", "In the app tonight, so we avoid the queue."),
            S("Toppen. Då ses vi vid kajen i morgon.", "Great. Then we'll meet at the quay tomorrow."),
        ],
        {
            "skärgården": "the archipelago",
            "vinden": "the wind",
            "vågor": "waves",
            "matsäck": "packed lunch",
            "bryggan": "the jetty",
            "holmen": "the islet",
            "badkläder": "swimwear",
            "färjan": "the ferry",
            "kajen": "the quay",
            "kö": "queue",
        },
        "sv",
    ),
]

PLOTS["de"] = [
    story(
        "de-bahn",
        "Der ICE fällt aus",
        "The ICE is cancelled",
        [
            S("Hast du die Durchsage gehört? Unser ICE fällt aus.", "Did you hear the announcement? Our ICE is cancelled."),
            S("Wegen Bauarbeiten oder wegen Personalmangel?", "Because of construction or staff shortage?"),
            S("Beides, sagt die App. Nächster Zug erst in drei Stunden.", "Both, the app says. Next train only in three hours."),
            S("Sollen wir den Flixbus nehmen? Der fährt in zwanzig Minuten.", "Should we take the Flixbus? It leaves in twenty minutes."),
            S("Sitze sind hart, aber wir kommen heute noch an.", "Seats are hard, but we still arrive today."),
            S("Oder Hotel hier und morgen früh weiter?", "Or a hotel here and continue early tomorrow?"),
            S("Hotel kostet mehr als der Bus. Ich nehme den Bus.", "A hotel costs more than the bus. I'll take the bus."),
            S("Ich auch. Kaufst du zwei Tickets, ich hole Wasser.", "Me too. You buy two tickets, I'll get water."),
            S("Wo steht der Bus? Welcher Bahnsteig?", "Where does the bus stand? Which platform?"),
            S("Vor dem Bahnhof, Haltestelle C. Nicht im Tunnel.", "In front of the station, stop C. Not in the tunnel."),
            S("Gut. Melde dich, wenn du den Bus siehst.", "Good. Message me when you see the bus."),
            S("Mach ich. Dann sitzen wir bald wieder.", "Will do. Then we'll be sitting again soon."),
        ],
        {
            "Durchsage": "announcement",
            "fällt aus": "is cancelled",
            "Bauarbeiten": "construction work",
            "Personalmangel": "staff shortage",
            "Sitze": "seats",
            "Bahnsteig": "platform",
            "Haltestelle": "bus stop",
            "Bahnhof": "station",
        },
        "de",
    ),
    story(
        "de-wg",
        "Das WG-Casting",
        "The flatshare casting",
        [
            S("Ich habe um fünf ein Casting in einer WG in Kreuzberg.", "I have a flatshare casting at five in Kreuzberg."),
            S("Bist du nervös? Die fragen oft nach Ordnung und Ruhe.", "Are you nervous? They often ask about tidiness and quiet."),
            S("Ein bisschen. Ich putze gern, aber ich übe abends Gitarre.", "A bit. I like cleaning, but I practise guitar in the evenings."),
            S("Sag ehrlich, und biete Kopfhörer an.", "Be honest, and offer to use headphones."),
            S("Wie viele Leute bewerben sich noch?", "How many other people are applying?"),
            S("Fünf heute. Zimmer ist hell, Miete fair, Küche klein.", "Five today. Room is bright, rent fair, kitchen small."),
            S("Nimm Kuchen mit. Kleine Gesten helfen.", "Bring cake. Small gestures help."),
            S("Gute Idee. Und Lebenslauf? Wirklich?", "Good idea. And a CV? Really?"),
            S("Manchmal ja. Zumindest Kontaktdaten und Beruf.", "Sometimes yes. At least contact details and job."),
            S("Wann hörst du Bescheid?", "When will you hear back?"),
            S("Sie melden sich bis Sonntag, haben sie geschrieben.", "They'll get in touch by Sunday, they wrote."),
            S("Drück die Daumen. Ruf an, wenn du den Schlüssel hast.", "Fingers crossed. Call when you have the key."),
        ],
        {
            "WG": "shared flat",
            "Casting": "casting / interview",
            "nervös": "nervous",
            "Ordnung": "order / tidiness",
            "bewerben": "apply",
            "Miete": "rent",
            "Gesten": "gestures",
            "Lebenslauf": "CV / résumé",
            "Bescheid": "news / decision",
            "Schlüssel": "key",
        },
        "de",
    ),
    story(
        "de-alpen",
        "Leichte oder schwere Tour?",
        "Easy or hard hike?",
        [
            S("Für Samstag: leichte Alm oder steiler Gipfel?", "For Saturday: easy alpine pasture or steep summit?"),
            S("Ich will den Gipfel, aber das Wetter wirkt instabil.", "I want the summit, but the weather looks unstable."),
            S("Die App warnt vor Gewitter ab Nachmittag.", "The app warns of thunderstorms from the afternoon."),
            S("Dann starten wir früh und kehren bis zwei um.", "Then we start early and turn back by two."),
            S("Brauchst du Steigeisen, oder reichen gute Schuhe?", "Do you need crampons, or are good shoes enough?"),
            S("Nur Schuhe und Stöcke. Der Schnee ist fast weg.", "Just shoes and poles. The snow is almost gone."),
            S("Ich packe Erste Hilfe und extra Schokolade ein.", "I'll pack first aid and extra chocolate."),
            S("Wasser teilen wir. Quellen oben sind unsicher.", "We'll share water. Springs higher up are unreliable."),
            S("Wo treffen wir uns?", "Where do we meet?"),
            S("Am Parkplatz unter der Seilbahn, sieben Uhr.", "At the car park under the cable car, seven o'clock."),
            S("Wenn es blitzt, brechen wir sofort ab. Einverstanden?", "If there's lightning, we abort immediately. Agreed?"),
            S("Einverstanden. Sicherheit vor Gipfelfoto.", "Agreed. Safety before summit photo."),
        ],
        {
            "Alm": "alpine pasture",
            "Gipfel": "summit",
            "instabil": "unstable",
            "Gewitter": "thunderstorm",
            "Steigeisen": "crampons",
            "Stöcke": "poles",
            "Seilbahn": "cable car",
            "blitzt": "there's lightning",
            "Einverstanden": "agreed",
        },
        "de",
    ),
]

PLOTS["nl"] = [
    story(
        "nl-accu",
        "Accu leeg op de dijk",
        "Battery dead on the dyke",
        [
            S("Mijn e-bike-accu is leeg, midden op de dijk.", "My e-bike battery is empty, in the middle of the dyke."),
            S("Kun je nog trappen zonder trapondersteuning?", "Can you still pedal without assist?"),
            S("Ja, maar tegen de wind gaat het traag.", "Yes, but against the wind it's slow."),
            S("Er is een oplaadpunt bij het station, drie kilometer verder.", "There's a charging point at the station, three kilometres further."),
            S("Haal ik dat voor mijn vergadering om half elf?", "Will I make that before my meeting at half past ten?"),
            S("Krap. Pak de sprinter vanaf het volgende dorp.", "Tight. Take the sprinter from the next village."),
            S("En de fiets? Die kan ik niet meenemen in de spits.", "And the bike? I can't take it on at rush hour."),
            S("Zet hem op slot bij de brug. Ik haal hem straks op.", "Lock it at the bridge. I'll pick it up later."),
            S("Echt? Je redt me.", "Really? You're saving me."),
            S("Geen probleem. Stuur je locatie in de app.", "No problem. Send your location in the app."),
            S("Gedaan. Ik ren naar het perron.", "Done. I'm running to the platform."),
            S("Succes in de vergadering. Fiets later!", "Good luck in the meeting. Bike later!"),
        ],
        {
            "accu": "battery",
            "dijk": "dyke",
            "trapondersteuning": "pedal assist",
            "oplaadpunt": "charging point",
            "vergadering": "meeting",
            "sprinter": "local train",
            "spits": "rush hour",
            "slot": "lock",
            "perron": "platform",
        },
        "nl",
    ),
    story(
        "nl-markt",
        "Op de markt",
        "At the market",
        [
            S("Zullen we naar de markt voor groente en kaas?", "Shall we go to the market for vegetables and cheese?"),
            S("Graag. De tomaten van vorige week waren top.", "Gladly. Last week's tomatoes were great."),
            S("Ik zoek ook verse kruiden. Basilicum is op thuis.", "I'm also looking for fresh herbs. We're out of basil at home."),
            S("Bij de kaaskraam hebben ze korting na twaalf uur.", "At the cheese stall they have a discount after twelve."),
            S("Dan gaan we eerst groente, daarna kaas.", "Then vegetables first, then cheese."),
            S("Heb je contant geld? Sommige kramen nemen geen pin.", "Do you have cash? Some stalls don't take card."),
            S("Een beetje. Ik pin bij de bakker ernaast als het moet.", "A little. I'll withdraw at the baker next door if needed."),
            S("Neem een tas mee. Plastic geven ze nauwelijks.", "Bring a bag. They hardly give plastic."),
            S("Wat koken we vanavond met dit alles?", "What are we cooking tonight with all this?"),
            S("Pasta met tomaat, of een simpele soep.", "Pasta with tomato, or a simple soup."),
            S("Soep. Het is koud genoeg.", "Soup. It's cold enough."),
            S("Afgesproken. Jij kiest de appels, ik de ui.", "Agreed. You pick the apples, I the onion."),
        ],
        {
            "markt": "market",
            "groente": "vegetables",
            "kruiden": "herbs",
            "kaaskraam": "cheese stall",
            "korting": "discount",
            "contant": "cash",
            "kramen": "stalls",
            "pin": "card payment / ATM",
            "Afgesproken": "agreed",
        },
        "nl",
    ),
    story(
        "nl-wad",
        "Wadlopen afgelast",
        "Mudflat walk cancelled",
        [
            S("Het wadlopen is afgelast. Het tij klopt niet.", "The mudflat walk is cancelled. The tide doesn't line up."),
            S("Echt? Ik had al laarzen en een thermos klaar.", "Really? I already had boots and a thermos ready."),
            S("De gids belt: te veel wind en te weinig tijd tussen eb.", "The guide called: too much wind and too little time between low tides."),
            S("Kunnen we de duinenwandeling doen in plaats daarvan?", "Can we do the dune walk instead?"),
            S("Ja. Korter, maar het uitzicht op zee blijft mooi.", "Yes. Shorter, but the sea view stays beautiful."),
            S("Neem ik nog steeds de verrekijker mee?", "Should I still bring the binoculars?"),
            S("Doe maar. Er zitten vaak vogels bij de geul.", "Do. There are often birds by the channel."),
            S("Eten we in het dorp na afloop?", "Shall we eat in the village afterwards?"),
            S("Vissoep bij de haven, als er tafels vrij zijn.", "Fish soup at the harbour, if there are free tables."),
            S("Hoe laat vertrekt de bus terug naar de stad?", "What time does the bus leave back to the city?"),
            S("Om half vijf. Mis die niet, de volgende is pas laat.", "At half past four. Don't miss it; the next is only late."),
            S("Notitie gezet. Dan toch een dag aan zee.", "Note made. Still a day by the sea then."),
        ],
        {
            "wadlopen": "mudflat walking",
            "afgelast": "cancelled",
            "tij": "tide",
            "laarzen": "boots",
            "eb": "low tide",
            "duinenwandeling": "dune walk",
            "verrekijker": "binoculars",
            "geul": "channel / gully",
            "haven": "harbour",
        },
        "nl",
    ),
]

PLOTS["fr"] = [
    story(
        "fr-rer",
        "La ligne est fermée",
        "The line is closed",
        [
            S("La ligne 4 est fermée entre Châtelet et Montparnasse.", "Line 4 is closed between Châtelet and Montparnasse."),
            S("À cause de travaux ? L'appli n'est pas claire.", "Because of works? The app isn't clear."),
            S("Travaux et un incident voyageur, dit l'annonce.", "Works and a passenger incident, the announcement says."),
            S("On prend le RER B puis on change ?", "Do we take the RER B then change?"),
            S("Oui. Compte vingt minutes de plus aux correspondances.", "Yes. Allow twenty extra minutes for connections."),
            S("Et si on marche jusqu'au bus 91 ?", "And if we walk to the 91 bus?"),
            S("Possible, mais il pleut. Je préfère le RER.", "Possible, but it's raining. I prefer the RER."),
            S("D'accord. Tu as un ticket Navigo chargé ?", "OK. Do you have a loaded Navigo ticket?"),
            S("Oui. Toi, prends un ticket t+ à la machine.", "Yes. You, get a t+ ticket at the machine."),
            S("Où se trouve la sortie vers le RER ici ?", "Where is the exit toward the RER here?"),
            S("Suis le panneau bleu, tout droit après les tourniquets.", "Follow the blue sign, straight after the gates."),
            S("Parfait. On se retrouve sur le quai direction sud.", "Perfect. We'll meet on the platform going south."),
        ],
        {
            "ligne": "line",
            "fermée": "closed",
            "travaux": "works / construction",
            "incident": "incident",
            "correspondances": "connections",
            "pleut": "rains",
            "ticket": "ticket",
            "sortie": "exit",
            "quai": "platform",
            "tourniquets": "turnstiles",
        },
        "fr",
    ),
    story(
        "fr-diner",
        "Qui amène quoi ?",
        "Who brings what?",
        [
            S("Pour samedi soir, qui amène l'entrée et le dessert ?", "For Saturday night, who brings the starter and dessert?"),
            S("Je peux faire une salade et un gâteau simple.", "I can make a salad and a simple cake."),
            S("Parfait. Marc s'occupe du vin, Léa du fromage.", "Perfect. Marc handles the wine, Léa the cheese."),
            S("Y a-t-il des allergies à connaître ?", "Are there any allergies to know about?"),
            S("Paul ne mange pas de fruits de mer. Rien d'autre.", "Paul doesn't eat seafood. Nothing else."),
            S("Combien serons-nous autour de la table ?", "How many will we be around the table?"),
            S("Huit, si ta cousine confirme demain matin.", "Eight, if your cousin confirms tomorrow morning."),
            S("J'ai assez d'assiettes, mais il manque des verres.", "I have enough plates, but we're short of glasses."),
            S("J'en apporte six. On mélange, ce n'est pas grave.", "I'll bring six. We mix, it's fine."),
            S("À quelle heure on commence vraiment ?", "What time do we actually start?"),
            S("Dix-neuf heures trente pour l'apéro, dîner vers vingt heures.", "Seven thirty for apéro, dinner around eight."),
            S("Noté. J'arrive un peu en avance pour dresser la table.", "Noted. I'll arrive a bit early to set the table."),
        ],
        {
            "amène": "brings",
            "entrée": "starter",
            "dessert": "dessert",
            "allergies": "allergies",
            "fruits de mer": "seafood",
            "assiettes": "plates",
            "verres": "glasses",
            "apéro": "aperitif / pre-dinner drinks",
            "dresser": "to set (the table)",
        },
        "fr",
    ),
    story(
        "fr-tgv",
        "Mauvaise date sur le billet",
        "Wrong date on the ticket",
        [
            S("Mon billet TGV est pour mardi, pas pour mercredi.", "My TGV ticket is for Tuesday, not Wednesday."),
            S("Tu t'es trompé en réservant, ou c'est le site ?", "Did you mess up booking, or was it the site?"),
            S("Moi. J'ai cliqué trop vite après une réunion.", "Me. I clicked too fast after a meeting."),
            S("Tu peux échanger sans frais jusqu'à ce soir.", "You can exchange free of charge until this evening."),
            S("Il reste des places en seconde pour mercredi ?", "Are there still second-class seats for Wednesday?"),
            S("Oui, mais seulement le train de seize heures.", "Yes, but only the four o'clock train."),
            S("Ça me va. La réunion à Lyon finit à quatorze heures.", "That works. The meeting in Lyon ends at two."),
            S("Fais la modification dans l'appli avant minuit.", "Make the change in the app before midnight."),
            S("Et mon siège côté fenêtre ?", "And my window seat?"),
            S("Pas garanti. Tu choisiras à nouveau après l'échange.", "Not guaranteed. You'll choose again after the exchange."),
            S("D'accord. Je m'en occupe tout de suite.", "OK. I'll handle it right away."),
            S("Envoie-moi le nouveau numéro de train après.", "Send me the new train number afterwards."),
        ],
        {
            "billet": "ticket",
            "réservant": "booking",
            "échanger": "to exchange",
            "frais": "fees / charge",
            "places": "seats / places",
            "seconde": "second class",
            "modification": "change",
            "siège": "seat",
            "échange": "exchange",
        },
        "fr",
    ),
]

PLOTS["es"] = [
    story(
        "es-vuelo",
        "El vuelo lleva cinco horas",
        "The flight is five hours late",
        [
            S("El vuelo a Madrid lleva ya cinco horas de retraso.", "The flight to Madrid is already five hours late."),
            S("¿Te han dado un bono de hotel o solo un sándwich?", "Did they give you a hotel voucher or only a sandwich?"),
            S("Solo un cupón de comida. El hotel lo negocian aún.", "Only a meal coupon. They're still negotiating the hotel."),
            S("Si pasamos la noche aquí, pierdo la reunión de mañana.", "If we spend the night here, I miss tomorrow's meeting."),
            S("¿Hay otro vuelo con otra compañía esta noche?", "Is there another flight with another airline tonight?"),
            S("Hay uno a las once, pero el billete es caro.", "There's one at eleven, but the ticket is expensive."),
            S("Pide la compensación por escrito en el mostrador.", "Ask for compensation in writing at the counter."),
            S("Ya hice la fila dos veces. Ahora toca esperar el anuncio.", "I already queued twice. Now we wait for the announcement."),
            S("¿Dónde está la zona de recarga de móviles?", "Where is the phone charging area?"),
            S("Junto a la puerta doce, después de los baños.", "By gate twelve, after the bathrooms."),
            S("Vale. Aviso en cuanto sepamos la nueva hora.", "OK. I'll message as soon as we know the new time."),
            S("Gracias. Yo miro trenes por si el vuelo se cancela.", "Thanks. I'll check trains in case the flight is cancelled."),
        ],
        {
            "vuelo": "flight",
            "retraso": "delay",
            "bono": "voucher",
            "cupón": "coupon",
            "compañía": "airline / company",
            "compensación": "compensation",
            "mostrador": "counter",
            "anuncio": "announcement",
            "cancela": "is cancelled",
        },
        "es",
    ),
    story(
        "es-obras",
        "Obras en la siesta",
        "Works during siesta",
        [
            S("Llevan tres días taladrando justo en la siesta.", "They've been drilling for three days right at siesta time."),
            S("¿En el piso de arriba o en la calle?", "In the flat above or in the street?"),
            S("Arriba. Reforman el baño sin avisar del horario.", "Upstairs. They're renovating the bathroom without posting hours."),
            S("Habla con el portero. A veces media en estas cosas.", "Talk to the doorman. He sometimes mediates."),
            S("Ya le dije. Dice que tienen permiso hasta las seis.", "I already told him. He says they have a permit until six."),
            S("Pero la siesta es sagrada. ¿No hay franja más suave?", "But siesta is sacred. Isn't there a gentler window?"),
            S("Puedo dejar una nota educada en su puerta.", "I can leave a polite note on their door."),
            S("Hazlo. Ofrece un café y pide una hora sin taladro.", "Do it. Offer a coffee and ask for an hour without the drill."),
            S("Si sigue igual, llamo a la comunidad de vecinos.", "If it continues, I'll call the residents' association."),
            S("Yo te acompaño a la reunión si hace falta.", "I'll go with you to the meeting if needed."),
            S("Gracias. Esta noche pruebo la nota primero.", "Thanks. Tonight I'll try the note first."),
            S("Bien. La calma vuelve, o al menos lo intentamos.", "Good. Calm returns, or at least we try."),
        ],
        {
            "taladrando": "drilling",
            "siesta": "siesta / afternoon rest",
            "Reforman": "they're renovating",
            "portero": "doorman",
            "permiso": "permit",
            "franja": "time slot / window",
            "comunidad": "residents' association",
            "vecinos": "neighbours",
        },
        "es",
    ),
    story(
        "es-camino",
        "Un tramo del Camino",
        "A stretch of the Camino",
        [
            S("¿Hacemos un tramo del Camino el fin de semana?", "Shall we walk a stretch of the Camino this weekend?"),
            S("Solo dos etapas, ¿no? No estoy en forma plena.", "Just two stages, right? I'm not in full shape."),
            S("Dos días. Pueblo a pueblo, con mochila ligera.", "Two days. Village to village, with a light pack."),
            S("¿Dormimos en albergue o reservamos pensión?", "Do we sleep in a hostel or book a guesthouse?"),
            S("Albergue el viernes, pensión el sábado si hay sitio.", "Hostel Friday, guesthouse Saturday if there's room."),
            S("Necesito botas ya usadas. Las nuevas me hacen ampollas.", "I need already-worn boots. New ones give me blisters."),
            S("Llévate también bastones. El descenso es empinado.", "Bring poles too. The descent is steep."),
            S("¿Hay fuente en el tramo, o cargamos mucha agua?", "Is there a fountain on the stretch, or do we carry lots of water?"),
            S("Hay dos fuentes. Aun así, dos botellas mínimo.", "There are two fountains. Still, two bottles minimum."),
            S("¿A qué hora salimos del primer pueblo?", "What time do we leave the first village?"),
            S("A las siete, antes del calor. Desayuno en la plaza.", "At seven, before the heat. Breakfast in the square."),
            S("Hecho. Yo miro el mapa esta noche.", "Done. I'll check the map tonight."),
        ],
        {
            "tramo": "stretch / section",
            "etapas": "stages",
            "mochila": "backpack",
            "albergue": "hostel",
            "pensión": "guesthouse",
            "ampollas": "blisters",
            "bastones": "poles",
            "descenso": "descent",
            "fuente": "fountain / spring",
        },
        "es",
    ),
]

PLOTS["it"] = [
    story(
        "it-museo",
        "Il museo è chiuso",
        "The museum is closed",
        [
            S("Il museo è chiuso il lunedì. L'avevo dimenticato.", "The museum is closed on Mondays. I had forgotten."),
            S("Anche io. E ora? La coda di domenica era infinita.", "Me too. And now? Sunday's queue was endless."),
            S("Possiamo vedere la galleria privata qui accanto.", "We can see the private gallery next door."),
            S("Costa di più, ma è aperta e c'è poca gente.", "It costs more, but it's open and there are few people."),
            S("Oppure andiamo al mercato dell'antiquariato.", "Or we go to the antiques market."),
            S("Preferisco la galleria. Poi un caffè in piazza.", "I prefer the gallery. Then a coffee in the square."),
            S("Compriamo i biglietti online per mercoledì, così non sbagliamo di nuovo.", "Let's buy tickets online for Wednesday so we don't mess up again."),
            S("Buona idea. Prenoto per le undici.", "Good idea. I'll book for eleven."),
            S("Dove ci incontriamo se ci perdiamo nel quartiere?", "Where do we meet if we get lost in the neighbourhood?"),
            S("Davanti alla fontana grande, lato sud.", "In front of the big fountain, south side."),
            S("Perfetto. Tu guardi la mappa, io guardo l'orario dei treni di ritorno.", "Perfect. You watch the map, I'll check the return train times."),
            S("Affare fatto. Almeno la giornata non è rovinata.", "Deal. At least the day isn't ruined."),
        ],
        {
            "museo": "museum",
            "chiuso": "closed",
            "coda": "queue",
            "galleria": "gallery",
            "mercato": "market",
            "biglietti": "tickets",
            "Prenoto": "I book",
            "fontana": "fountain",
            "orario": "timetable",
        },
        "it",
    ),
    story(
        "it-pranzo",
        "Il pranzo della domenica",
        "Sunday lunch",
        [
            S("Domenica pranzo da zia Maria. Dobbiamo portare qualcosa.", "Sunday lunch at Aunt Maria's. We have to bring something."),
            S("Io preparo una torta. Tu ti occupi del vino?", "I'll make a cake. Will you handle the wine?"),
            S("Sì. Rosso per il ragù e un bianco leggero per l'antipasto.", "Yes. Red for the ragù and a light white for the starter."),
            S("Quanti siamo a tavola quest'anno?", "How many at the table this year?"),
            S("Dodici, se arriva anche il cugino da Bologna.", "Twelve, if the cousin from Bologna comes too."),
            S("Allora non basta una torta. Aggiungo biscotti.", "Then one cake isn't enough. I'll add biscuits."),
            S("A che ora si mangia davvero? Dicevano l'una.", "What time do we actually eat? They said one."),
            S("L'una e mezza, realistica. L'antipasto parte prima.", "Half past one, realistically. Starters start earlier."),
            S("Porto anche fiori per la zia. Le piacciono i girasoli.", "I'll also bring flowers for auntie. She likes sunflowers."),
            S("Perfetto. Ci troviamo alla stazione alle undici e mezza?", "Perfect. Shall we meet at the station at half past eleven?"),
            S("Sì. Il treno locale è più lento ma comodo.", "Yes. The local train is slower but comfortable."),
            S("A domenica allora. Non dimenticare il regalo piccolo per i bambini.", "See you Sunday then. Don't forget a small gift for the kids."),
        ],
        {
            "pranzo": "lunch",
            "zia": "aunt",
            "torta": "cake",
            "ragù": "meat sauce",
            "antipasto": "starter",
            "cugino": "cousin",
            "girasoli": "sunflowers",
            "regalo": "gift",
        },
        "it",
    ),
    story(
        "it-treno",
        "Corrispondenza persa",
        "Missed connection",
        [
            S("Abbiamo perso la coincidenza per Roma. Il regionale era in ritardo.", "We missed the connection to Rome. The regional was late."),
            S("Di quanto? Dieci minuti o mezz'ora?", "By how much? Ten minutes or half an hour?"),
            S("Quindici. Il Frecciarossa è partito mentre scendevamo.", "Fifteen. The Frecciarossa left while we were getting off."),
            S("C'è un altro treno entro due ore?", "Is there another train within two hours?"),
            S("Sì, ma solo posti in seconda senza prenotazione garantita.", "Yes, but only second-class seats without a guaranteed reservation."),
            S("Prendiamolo. Meglio in piedi che un albergo qui.", "Let's take it. Better standing than a hotel here."),
            S("Chiedo il rimborso del tratto non usato allo sportello.", "I'll ask for a refund of the unused leg at the counter."),
            S("Io compro due bottiglie d'acqua e panini.", "I'll buy two bottles of water and sandwiches."),
            S("Quale binario per il prossimo treno?", "Which platform for the next train?"),
            S("Binario sette, ma controlla i tabelloni: spesso cambia.", "Platform seven, but check the boards: it often changes."),
            S("Avvisa la famiglia che arriviamo più tardi.", "Tell the family we'll arrive later."),
            S("Già scritto. Ci vediamo sul treno se ci separiamo in stazione.", "Already written. See you on the train if we split up in the station."),
        ],
        {
            "coincidenza": "connection",
            "regionale": "regional train",
            "ritardo": "delay",
            "posti": "seats",
            "prenotazione": "reservation",
            "rimborso": "refund",
            "sportello": "counter",
            "binario": "platform / track",
            "tabelloni": "display boards",
        },
        "it",
    ),
]

PLOTS["pt"] = [
    story(
        "pt-chuva",
        "Ônibus lotado na chuva",
        "Bus full in the rain",
        [
            S("O ônibus passou lotado três vezes. Está chovendo forte.", "The bus went by full three times. It's raining hard."),
            S("O app do transporte mostra atraso em todas as linhas.", "The transit app shows delay on every line."),
            S("Pegamos um carro por aplicativo? O preço subiu o dobro.", "Shall we get a rideshare? The price doubled."),
            S("Dobro é absurdo. Esperamos mais um ônibus?", "Double is absurd. Do we wait for one more bus?"),
            S("Tenho reunião em meia hora. Não posso me molhar toda.", "I have a meeting in half an hour. I can't get completely soaked."),
            S("Então dividimos o carro. Metade cada um.", "Then we split the car. Half each."),
            S("Combinado. Você chama, eu confirmo o endereço.", "Deal. You call it, I confirm the address."),
            S("O motorista está a quatro minutos. Embaixo da marquise.", "The driver is four minutes away. Under the awning."),
            S("Leva o guarda-chuva aberto até a porta do carro.", "Keep the umbrella open until the car door."),
            S("E o cartão de ponto? Chego atrasada de qualquer jeito.", "And the time clock? I'm late either way."),
            S("Manda mensagem para a equipe agora. Transparência ajuda.", "Message the team now. Transparency helps."),
            S("Pronto. Vamos. Depois a gente reclama do sistema.", "Done. Let's go. Later we can complain about the system."),
        ],
        {
            "ônibus": "bus",
            "lotado": "full / packed",
            "chovendo": "raining",
            "atraso": "delay",
            "aplicativo": "app",
            "reunião": "meeting",
            "marquise": "awning / canopy",
            "guarda-chuva": "umbrella",
            "atrasada": "late (fem.)",
        },
        "pt",
    ),
    story(
        "pt-churrasco",
        "Lista do churrasco",
        "The barbecue guest list",
        [
            S("Para o churrasco de sábado, quem a gente convida de verdade?", "For Saturday's barbecue, who do we actually invite?"),
            S("Família chegada e três amigos do trabalho. Só.", "Close family and three work friends. That's it."),
            S("E o vizinho que sempre aparece com refrigerante?", "And the neighbour who always shows up with soft drinks?"),
            S("Convida. Ele ajuda na brasa e não reclama da música.", "Invite him. He helps with the grill and doesn't complain about the music."),
            S("Carne eu compro sexta. Você cuida da farofa e da salada?", "I'll buy the meat on Friday. You handle the farofa and salad?"),
            S("Sim. Alguém leva bebida sem álcool também.", "Yes. Someone should bring non-alcoholic drinks too."),
            S("Quantas cadeiras temos no quintal?", "How many chairs do we have in the yard?"),
            S("Oito. Se vierem doze, usamos bancos da cozinha.", "Eight. If twelve come, we use kitchen benches."),
            S("Hora de começar o fogo?", "Time to start the fire?"),
            S("Meio-dia o fogo, uma hora a carne. Clássico.", "Fire at noon, meat at one. Classic."),
            S("Aviso no grupo da família agora, antes que inventem planos.", "I'll message the family group now, before they invent other plans."),
            S("Perfeito. Sábado a gente celebra sem pressa.", "Perfect. Saturday we celebrate without rushing."),
        ],
        {
            "churrasco": "barbecue",
            "convida": "invite",
            "vizinho": "neighbour",
            "brasa": "embers / grill heat",
            "farofa": "toasted cassava flour side",
            "quintal": "yard",
            "cadeiras": "chairs",
            "fogo": "fire",
        },
        "pt",
    ),
    story(
        "pt-praia",
        "Praia depois do pagamento",
        "Beach after payday",
        [
            S("O pagamento caiu. Bora para a praia no domingo?", "Payday landed. Shall we go to the beach on Sunday?"),
            S("Sim. Longe o bastante para sair da cidade, perto o bastante de ônibus.", "Yes. Far enough to leave the city, close enough by bus."),
            S("Levo protetor, canga e dinheiro miúdo para água de coco.", "I'll bring sunscreen, a beach wrap, and small change for coconut water."),
            S("Eu levo o cooler com gelo. Refrigerante e fruta.", "I'll bring the cooler with ice. Soft drinks and fruit."),
            S("Tem sombra natural lá, ou alugamos barraca?", "Is there natural shade there, or do we rent an umbrella tent?"),
            S("Tem algumas árvores. Chegando cedo pegamos lugar bom.", "There are a few trees. Arriving early we get a good spot."),
            S("Que horas sai o ônibus da rodoviária?", "What time does the bus leave the bus station?"),
            S("Sete e meia. Se perdermos, o próximo é só às nove.", "Half past seven. If we miss it, the next is only at nine."),
            S("Volta a que horas, para não pegar trânsito pesado?", "What time do we return, so we don't hit heavy traffic?"),
            S("Quatro da tarde no máximo. Segunda é dia cheio.", "Four in the afternoon at the latest. Monday is a full day."),
            S("Combinado. Eu compro as passagens no app hoje.", "Deal. I'll buy the tickets in the app today."),
            S("E eu confirmo o tempo. Se chover, a gente muda para o parque.", "And I'll check the weather. If it rains, we switch to the park."),
        ],
        {
            "pagamento": "payday / payment",
            "praia": "beach",
            "protetor": "sunscreen",
            "canga": "beach wrap",
            "cooler": "cooler",
            "barraca": "beach tent / umbrella",
            "rodoviária": "bus station",
            "trânsito": "traffic",
            "passagens": "tickets",
        },
        "pt",
    ),
]

PLOTS["pl"] = [
    story(
        "pl-tramwaj",
        "Tramwaj zepsuty zimą",
        "Tram broken in winter",
        [
            S("Tramwaj stanął na środku trasy. Silnik nie ciągnie.", "The tram stopped in the middle of the route. The engine won't pull."),
            S("Znów? Na zewnątrz jest minus osiem.", "Again? It's minus eight outside."),
            S("Motorniczy prosi, żeby wysiąść i czekać na zastępczy autobus.", "The driver asks us to get off and wait for a replacement bus."),
            S("Gdzie ma stanąć ten autobus? Przy następnym skrzyżowaniu?", "Where is that bus supposed to stop? At the next intersection?"),
            S("Tak mówi aplikacja. Pięć minut piechotą po lodzie.", "That's what the app says. Five minutes on foot on ice."),
            S("Uważaj na schody przy peronie. Są oblodzone.", "Watch the steps at the platform. They're icy."),
            S("Mogę iść do biura na piechotę. To tylko kilometr.", "I can walk to the office. It's only a kilometre."),
            S("Ja wolę autobus. Mam teczki i laptop.", "I prefer the bus. I have folders and a laptop."),
            S("Napisz do zespołu, że się spóźnisz.", "Write to the team that you'll be late."),
            S("Już piszę. Ty trzymasz miejsce w kolejce do autobusu.", "I'm writing now. You hold a place in the bus queue."),
            S("Dobrze. Jak wsiądziemy, sprawdzimy ogrzewanie.", "Good. When we get on, we'll check the heating."),
            S("Oby działało. Zima nie pyta o rozkład jazdy.", "Hope it works. Winter doesn't ask about the timetable."),
        ],
        {
            "Tramwaj": "tram",
            "zepsuty": "broken",
            "Motorniczy": "tram driver",
            "zastępczy": "replacement",
            "skrzyżowaniu": "intersection",
            "piechotą": "on foot",
            "oblodzone": "icy",
            "spóźnisz": "you'll be late",
            "rozkład jazdy": "timetable",
        },
        "pl",
    ),
    story(
        "pl-imieniny",
        "Prezent na imieniny",
        "A name-day gift",
        [
            S("W czwartek są imieniny cioci. Co kupujemy?", "Thursday is auntie's name day. What are we buying?"),
            S("Ona lubi książki i dobre mydło. Nic z plastiku.", "She likes books and good soap. Nothing plastic."),
            S("Może zestaw herbat i mały bukiet?", "Maybe a tea set and a small bouquet?"),
            S("Herbaty ma pełną szafkę. Bukiet i kartka wystarczą.", "She has a cupboard full of tea. A bouquet and a card are enough."),
            S("Kto pisze w kartce? Twoje pismo jest ładniejsze.", "Who writes in the card? Your handwriting is nicer."),
            S("Ja napiszę. Ty wybierasz kwiaty u florysty.", "I'll write. You choose the flowers at the florist."),
            S("O której idziemy? Po pracy czy wcześniej?", "What time do we go? After work or earlier?"),
            S("O osiemnastej. Kolacja u niej o dziewiętnastej.", "At six. Dinner at hers at seven."),
            S("Nie zapomnij o torcie z cukierni na rogu.", "Don't forget the cake from the bakery on the corner."),
            S("Zamówię dziś, odbiorę jutro po południu.", "I'll order today, pick it up tomorrow afternoon."),
            S("Świetnie. Imieniny bez pośpiechu smakują lepiej.", "Great. Name day without rush tastes better."),
            S("I bez kłótni o prezent. Już zdecydowaliśmy.", "And without arguing about the gift. We've already decided."),
        ],
        {
            "imieniny": "name day",
            "cioci": "auntie's",
            "bukiet": "bouquet",
            "kartka": "card",
            "florysty": "florist",
            "cukierni": "cake shop / bakery",
            "prezent": "gift",
        },
        "pl",
    ),
    story(
        "pl-tatry",
        "Weekend w Tatrach",
        "Weekend in the Tatras",
        [
            S("Jedziemy w Tatry w sobotę, jeśli pogoda dotrzyma słowa.", "We're going to the Tatras on Saturday if the weather keeps its word."),
            S("Prognoza mówi o wietrze na grani po południu.", "The forecast mentions wind on the ridge in the afternoon."),
            S("Więc krótszy szlak doliną, bez grani.", "So a shorter valley trail, no ridge."),
            S("Biorę rakiety? Śniegu ma być mało.", "Shall I take snowshoes? There's supposed to be little snow."),
            S("Raczej dobre buty i kije. Rakiety zostaw.", "Rather good boots and poles. Leave the snowshoes."),
            S("Schronisko ma wolne miejsca, czy śpimy w mieście?", "Does the mountain hut have free beds, or do we sleep in town?"),
            S("Dwa miejsca w schronisku, rezerwacja potwierdzona.", "Two beds in the hut, reservation confirmed."),
            S("O której wyjazd z parkingu?", "What time do we leave the car park?"),
            S("Siódma rano. Później korki przy drodze do Kuźnic.", "Seven in the morning. Later there are jams on the road to Kuźnice."),
            S("Pakuję latarkę czołową. Schodzimy może po zmroku.", "I'll pack a headlamp. We may come down after dark."),
            S("Dobrze. I powerbank. Zasięg bywa słaby.", "Good. And a power bank. Signal is often weak."),
            S("Trzymam kciuki za pogodę. Tatra uczy pokory.", "Fingers crossed for the weather. The Tatras teach humility."),
        ],
        {
            "Tatry": "the Tatras",
            "prognoza": "forecast",
            "grani": "ridge",
            "szlak": "trail",
            "schronisko": "mountain hut",
            "rezerwacja": "reservation",
            "korki": "traffic jams",
            "latarkę": "torch / lamp",
            "zasięg": "signal / coverage",
        },
        "pl",
    ),
]

# Fix typo in nb gloss
PLOTS["nb"][1]["glosses"].pop("ste stearinlysene", None)


def stories_to_json_fragment(stories: list[dict]) -> str:
    return json.dumps(stories, ensure_ascii=False, separators=(",", ":"))


def replace_pack_double_black(path: Path, lang: str) -> None:
    text = path.read_text(encoding="utf-8")
    m = re.search(r"EXTRA_READ_STORIES\.push\(\.\.\.(\[[\s\S]*?\])\)", text)
    if not m:
        raise SystemExit(f"No EXTRA_READ_STORIES in {path}")
    raw = m.group(1)
    j = re.sub(r"([{,]\s*)([A-Za-z_][A-Za-z0-9_]*)\s*:", r'\1"\2":', raw)
    all_stories = json.loads(j)
    new_db = PLOTS[lang]
    kept = [s for s in all_stories if s.get("trail") != "double-black-diamond"]
    # preserve order: greens/blues/blacks then DB
    merged = kept + new_db
    # verify counts
    trails = {}
    for s in merged:
        trails[s["trail"]] = trails.get(s["trail"], 0) + 1
    assert trails.get("double-black-diamond") == 3, trails
    assert len(merged) == 12, len(merged)
    new_raw = json.dumps(merged, ensure_ascii=False, separators=(",", ":"))
    new_text = text[: m.start(1)] + new_raw + text[m.end(1) :]
    path.write_text(new_text, encoding="utf-8")
    print(f"OK pack {path.name}: {[s['id'] for s in new_db]}")


def format_nb_story(s: dict) -> str:
    """Pretty READ_STORIES object for read-stories.js (nb: keys)."""
    lines = ["  {"]
    lines.append(f'    id: "{s["id"]}",')
    lines.append(f'    categoryId: "{s["categoryId"]}",')
    lines.append(f'    title: "{s["title"]}",')
    lines.append(f'    subtitle: "{s["subtitle"]}",')
    lines.append(f'    trail: "double-black-diamond",')
    lines.append("    sentences: [")
    for sent in s["sentences"]:
        nb = sent["foreign"].replace("\\", "\\\\").replace('"', '\\"')
        en = sent["en"].replace("\\", "\\\\").replace('"', '\\"')
        lines.append(f'      {{ nb: "{nb}", en: "{en}" }},')
    lines.append("    ],")
    lines.append("    glosses: {")
    for k, v in s["glosses"].items():
        kk = k.replace("\\", "\\\\").replace('"', '\\"')
        vv = v.replace("\\", "\\\\").replace('"', '\\"')
        if re.fullmatch(r"[A-Za-zÆØÅæøå0-9_]+", k):
            lines.append(f'      {k}: "{vv}",')
        else:
            lines.append(f'      "{kk}": "{vv}",')
    lines.append("    },")
    lines.append("  },")
    return "\n".join(lines)


def replace_nb_double_black() -> None:
    path = ROOT / "read-stories.js"
    text = path.read_text(encoding="utf-8")
    # Find first double-black story through end of last one before closing of READ_STORIES
    # Match from nb-streik (or first db id) — replace block of three DB stories
    # Locate start of first double-black-diamond story object
    # Prefer known old ids; fall back to first double-black object
    start = text.find('id: "nb-streik"')
    if start < 0:
        start = text.find('id: "nb-ferge"')
    if start < 0:
        # find trail double-black and walk back to {
        idx = text.find('trail: "double-black-diamond"')
        if idx < 0:
            raise SystemExit("No double-black in read-stories.js")
        start = text.rfind("{", 0, idx)
    # include leading whitespace/newline before {
    line_start = text.rfind("\n", 0, start) + 1
    # end: after third double-black story's closing },
    # Find all double-black positions and take end of third story
    positions = [m.start() for m in re.finditer(r'trail:\s*"double-black-diamond"', text)]
    if len(positions) < 3:
        raise SystemExit(f"Expected 3 double-black, found {len(positions)}")
    # end of third story: from third trail, find matching glosses close + },
    third = positions[2]
    # find closing of this object: glosses: { ... }, \n  },
    gloss_start = text.find("glosses:", third)
    # brace match from glosses {
    brace_i = text.find("{", gloss_start)
    depth = 0
    i = brace_i
    while i < len(text):
        if text[i] == "{":
            depth += 1
        elif text[i] == "}":
            depth -= 1
            if depth == 0:
                break
        i += 1
    # after glosses }, expect ,\n  },
    rest = text[i + 1 :]
    m_end = re.match(r"\s*,?\s*\n\s*\},?", rest)
    if not m_end:
        # simpler: find next \n  },
        end_rel = rest.find("},")
        end = i + 1 + end_rel + 2
    else:
        end = i + 1 + m_end.end()
    # Actually we need to replace all three stories. Start from first story object.
    first_trail = positions[0]
    start = text.rfind("\n  {", 0, first_trail)
    if start < 0:
        start = text.rfind("{", 0, first_trail)
    else:
        start = start + 1  # keep newline out, start at spaces+{

    # end after third story
    third_trail = positions[2]
    # from third story opening
    third_open = text.rfind("\n  {", 0, third_trail)
    if third_open < 0:
        third_open = text.rfind("{", 0, third_trail)
    else:
        third_open = third_open + 1
    # match braces from third_open
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
    # include trailing comma if present
    if i < len(text) and text[i] == ",":
        i += 1
    end = i

    new_block = "\n".join(format_nb_story(s).rstrip().rstrip(",") + "," for s in PLOTS["nb"])
    # last comma OK inside array
    new_text = text[:start] + new_block + text[end:]
    path.write_text(new_text, encoding="utf-8")
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
        replace_pack_double_black(ROOT / rel, lang)
    replace_nb_double_black()
    print("Done. Bump cache ?v= on packs + read-stories in index.html.")


if __name__ == "__main__":
    main()
