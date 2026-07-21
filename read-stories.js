/**
 * Parallel reading texts for the Read tab.
 * Trail marks follow ski-run difficulty (green → double black).
 * Subtitles: short English labels only — no meta, no attribution fluff.
 */
const READ_TRAIL_ORDER = [
  "green-circle",
  "blue-square",
  "black-diamond",
  "double-black-diamond",
];

const READ_TRAIL_LEVELS = {
  "green-circle": {
    id: "green-circle",
    label: "Beginner",
  },
  "blue-square": {
    id: "blue-square",
    label: "Intermediate",
  },
  "black-diamond": {
    id: "black-diamond",
    label: "Advanced",
  },
  "double-black-diamond": {
    id: "double-black-diamond",
    label: "Expert",
  },
};

function getReadTrailLevel(id) {
  if (id === "Starter") return READ_TRAIL_LEVELS["green-circle"];
  if (id === "blue-circle") return READ_TRAIL_LEVELS["blue-square"];
  return READ_TRAIL_LEVELS[id] || READ_TRAIL_LEVELS["green-circle"];
}

function sortStoriesByTrail(stories) {
  return [...stories].sort(
    (a, b) => READ_TRAIL_ORDER.indexOf(a.trail) - READ_TRAIL_ORDER.indexOf(b.trail)
  );
}

const READ_STORIES = [
  {
  id: "nb-morgen",
  categoryId: "nb-bokmal",
  title: "Morgen i byen",
  subtitle: "Morning in the city",
  trail: "green-circle",
  sentences: [
    { nb: "God morgen.", en: "Good morning." },
    { nb: "Jeg har nettopp kommet fram.", en: "I just arrived." },
    { nb: "Det er kaldt, men sola skinner.", en: "It is cold, but the sun is shining." },
    { nb: "Jeg ser folk og sykler overalt.", en: "I see people and bikes everywhere." },
    { nb: "Unnskyld, hvor er stasjonen?", en: "Excuse me, where is the station?" },
    { nb: "Rett fram og så til venstre.", en: "Straight ahead and then left." },
    { nb: "Tusen takk. Jeg lærer fortsatt norsk.", en: "Thank you. I am still learning Norwegian." },
    { nb: "Ingen problem. Lykke til!", en: "No problem. Good luck!" },
    { nb: "Ha det!", en: "Goodbye!" }
  ],
  glosses: {"kommet fram": "arrived", "overalt": "everywhere"}
  },
  {
  id: "nb-kaffe",
  categoryId: "nb-bokmal",
  title: "En kaffe, takk",
  subtitle: "Ordering coffee",
  trail: "green-circle",
  sentences: [
    { nb: "Hei! En kaffe, takk.", en: "Hi! One coffee, please." },
    { nb: "Med melk eller uten?", en: "With milk or without?" },
    { nb: "Med litt melk, takk.", en: "With a little milk, please." },
    { nb: "Vil du ha noe å spise også?", en: "Would you also like something to eat?" },
    { nb: "Et ostesmørbrød, takk.", en: "A cheese sandwich, please." },
    { nb: "Det blir førtifem kroner.", en: "That will be forty-five kroner." },
    { nb: "Kan jeg betale med kort?", en: "Can I pay by card?" },
    { nb: "Ja, selvfølgelig.", en: "Yes, of course." },
    { nb: "Takk. Ha en fin dag!", en: "Thanks. Have a nice day!" }
  ],
  glosses: {"ostesmørbrød": "cheese sandwich", "kroner": "kroner (currency)"}
  },
  {
  id: "nb-tog",
  categoryId: "nb-bokmal",
  title: "På toget",
  subtitle: "On the train",
  trail: "green-circle",
  sentences: [
    { nb: "Går dette toget til Oslo?", en: "Does this train go to Oslo?" },
    { nb: "Ja, det stemmer.", en: "Yes, that's right." },
    { nb: "Hvor kjøper jeg billett?", en: "Where do I buy a ticket?" },
    { nb: "I appen eller i automaten.", en: "In the app or at the machine." },
    { nb: "En billett, en vei, takk.", en: "One ticket, one-way, please." },
    { nb: "Vindu eller midtgang?", en: "Window or aisle?" },
    { nb: "Vindu, takk. Hvor lang tid tar det?", en: "Window, please. How long does it take?" },
    { nb: "Omtrent to timer.", en: "About two hours." },
    { nb: "Takk for hjelpen.", en: "Thank you for the help." }
  ],
  glosses: {"en vei": "one-way", "automat": "ticket machine"}
  },
  {
  id: "nb-bibliotek",
  categoryId: "nb-bokmal",
  title: "På biblioteket",
  subtitle: "At the library",
  trail: "blue-square",
  sentences: [
    { nb: "Hei, jeg leter etter et stille sted å studere.", en: "Hi, I'm looking for a quiet place to study." },
    { nb: "Oppe er det ledige bord.", en: "Upstairs there are free tables." },
    { nb: "Hvor lenge har dere åpent?", en: "How long are you open?" },
    { nb: "Til klokka ni i kveld.", en: "Until nine o'clock this evening." },
    { nb: "Kan jeg også låne bøker her?", en: "Can I also borrow books here?" },
    { nb: "Ja, med studentkort.", en: "Yes, with a student card." },
    { nb: "Perfekt. Jeg har eksamen neste uke.", en: "Perfect. I have an exam next week." },
    { nb: "Lykke til med lesingen!", en: "Good luck with studying!" }
  ],
  glosses: {"ledige": "free / available", "eksamen": "exam"}
  },
  {
  id: "nb-marked",
  categoryId: "nb-bokmal",
  title: "På markedet",
  subtitle: "At the market",
  trail: "blue-square",
  sentences: [
    { nb: "Hva koster den osten?", en: "How much is that cheese?" },
    { nb: "Tretti kroner stykket.", en: "Thirty kroner each." },
    { nb: "Jeg tar to, takk.", en: "I'll take two, please." },
    { nb: "Vil du ha en pose?", en: "Would you like a bag?" },
    { nb: "Ja, gjerne. Og litt frukt også.", en: "Yes, please. And some fruit too." },
    { nb: "Epler eller appelsiner?", en: "Apples or oranges?" },
    { nb: "Epler, fire stykker.", en: "Apples, four of them." },
    { nb: "Det blir hundre kroner til sammen.", en: "That will be a hundred kroner altogether." },
    { nb: "Her er pengene. Ha det!", en: "Here's the money. Goodbye!" }
  ],
  glosses: {"stykket": "each", "pose": "bag"}
  },
  {
  id: "nb-venner",
  categoryId: "nb-bokmal",
  title: "Nye venner",
  subtitle: "New friends",
  trail: "blue-square",
  sentences: [
    { nb: "Hei, jeg heter Sam.", en: "Hi, my name is Sam." },
    { nb: "Hyggelig. Jeg er Noor.", en: "Nice to meet you. I'm Noor." },
    { nb: "Hvor kommer du fra?", en: "Where are you from?" },
    { nb: "Fra Canada, men jeg bor her nå.", en: "From Canada, but I live here now." },
    { nb: "Hva studerer du?", en: "What do you study?" },
    { nb: "Informatikk. Og du?", en: "Computer science. And you?" },
    { nb: "Historie. Kaffe etter timen?", en: "History. Coffee after class?" },
    { nb: "Ja, gjerne! Vi ses snart.", en: "Yes, gladly! See you soon." }
  ],
  glosses: {"hyggelig": "nice (to meet you)", "timen": "the class"}
  },
  {
  id: "nb-jobb",
  categoryId: "nb-bokmal",
  title: "Første arbeidsdag",
  subtitle: "First day at work",
  trail: "black-diamond",
  sentences: [
    { nb: "Velkommen til teamet, Sam.", en: "Welcome to the team, Sam." },
    { nb: "Takk. Jeg er litt nervøs.", en: "Thanks. I'm a bit nervous." },
    { nb: "Det er normalt. Vi starter halv ni.", en: "That's normal. We start at half past eight." },
    { nb: "Hvor kan jeg sette tingene mine?", en: "Where can I put my things?" },
    { nb: "Her ved vinduet er pulten din.", en: "Here by the window is your desk." },
    { nb: "Hvis du har spørsmål, bare spør.", en: "If you have questions, just ask." },
    { nb: "Forstått. Hvem er veilederen min?", en: "Understood. Who is my supervisor?" },
    { nb: "Det er jeg i dag. Kom, jeg viser deg kjøkkenet.", en: "That's me today. Come, I'll show you the kitchen." }
  ],
  glosses: {"nervøs": "nervous", "veileder": "supervisor"}
  },
  {
  id: "nb-lege",
  categoryId: "nb-bokmal",
  title: "Hos legen",
  subtitle: "At the doctor's",
  trail: "black-diamond",
  sentences: [
    { nb: "Hva er det som er galt?", en: "What's the matter?" },
    { nb: "Jeg har hatt vondt i halsen i to dager.", en: "I've had a sore throat for two days." },
    { nb: "Har du feber også?", en: "Do you also have a fever?" },
    { nb: "Litt, i morges.", en: "A little, this morning." },
    { nb: "Jeg ser litt på det. Si aaa.", en: "I'll take a look. Say ah." },
    { nb: "Det ser ut som en mild infeksjon.", en: "It looks like a mild infection." },
    { nb: "Trenger jeg antibiotika?", en: "Do I need antibiotics?" },
    { nb: "Ikke ennå. Hvile, vann og paracetamol.", en: "Not yet. Rest, water, and paracetamol." },
    { nb: "Tusen takk, doktor.", en: "Thank you, doctor." }
  ],
  glosses: {"vondt i halsen": "sore throat", "feber": "fever", "infeksjon": "infection"}
  },
  {
  id: "nb-bolig",
  categoryId: "nb-bokmal",
  title: "Leter etter et rom",
  subtitle: "Looking for a room",
  trail: "black-diamond",
  sentences: [
    { nb: "Hei, jeg ringer om rommet på nettet.", en: "Hi, I'm calling about the room online." },
    { nb: "Ja, det er fortsatt ledig. Når vil du se det?", en: "Yes, it's still free. When would you like to see it?" },
    { nb: "I ettermiddag går, rundt tre.", en: "This afternoon works, around three." },
    { nb: "Fint. Det ligger i sentrum, tredje etasje.", en: "Fine. It's in the centre, third floor." },
    { nb: "Er det heis?", en: "Is there a lift?" },
    { nb: "Nei, bare trapper. Leia inkluderer internett.", en: "No, only stairs. Rent includes internet." },
    { nb: "Og er det depositum?", en: "And is there a deposit?" },
    { nb: "Ja, en måned på forskudd. Vi ses!", en: "Yes, one month in advance. See you!" }
  ],
  glosses: {"ledig": "available", "leie": "rent", "depositum": "deposit"}
  },
  {
  id: "nb-streik",
  categoryId: "nb-bokmal",
  title: "Streik i T-banen",
  subtitle: "Subway strike",
  trail: "double-black-diamond",
  sentences: [
    { nb: "Så du nyheten?", en: "Did you see the news?" },
    { nb: "Nei, hva har skjedd?", en: "No, what happened?" },
    { nb: "I morgen er det streik i T-banen.", en: "Tomorrow there's a subway strike." },
    { nb: "Så går ikke togene?", en: "So the trains won't run?" },
    { nb: "Mange stopper, særlig om morgenen.", en: "Many will stop, especially in the morning." },
    { nb: "Jeg tar sykkelen, selv om det regner.", en: "I'll take the bike, even if it rains." },
    { nb: "Smart. Eller jobber du hjemmefra?", en: "Smart. Or are you working from home?" },
    { nb: "Kanskje. Jeg skal snakke med sjefen først.", en: "Maybe. I'll talk to the boss first." }
  ],
  glosses: {"streik": "strike", "T-banen": "the subway"}
  },
  {
  id: "nb-debatt",
  categoryId: "nb-bokmal",
  title: "En kort debatt",
  subtitle: "A short debate",
  trail: "double-black-diamond",
  sentences: [
    { nb: "Jeg synes kollektivtransport er kjempeviktig.", en: "I think public transport is really important." },
    { nb: "Hvorfor det?", en: "Why?" },
    { nb: "Fordi ikke alle kan ha bil.", en: "Because not everyone can have a car." },
    { nb: "Men bussene er alltid fulle og forsinka.", en: "But the buses are always full and late." },
    { nb: "Hvis vi investerer mer, blir det bedre.", en: "If we invest more, it gets better." },
    { nb: "På lang sikt, kanskje. Akkurat nå er det dyrt.", en: "In the long run, maybe. Right now it's expensive." },
    { nb: "Sant. Likevel synes jeg det er verdt det.", en: "True. Even so I think it's worth it." },
    { nb: "La oss lese mer om det før vi bestemmer.", en: "Let's read more about it before we decide." }
  ],
  glosses: {"kollektivtransport": "public transport", "verdt det": "worth it"}
  },
  {
  id: "nb-planer",
  categoryId: "nb-bokmal",
  title: "Planer for sommeren",
  subtitle: "Summer plans",
  trail: "double-black-diamond",
  sentences: [
    { nb: "Hva skal du gjøre i sommer?", en: "What are you going to do in the summer?" },
    { nb: "Jeg vil reise noen uker, hvis det går.", en: "I want to travel a few weeks, if it works out." },
    { nb: "Hvor da?", en: "Where to?" },
    { nb: "Kanskje til Lofoten. Og du?", en: "Maybe to Lofoten. And you?" },
    { nb: "Jeg blir og jobber overtid.", en: "I'll stay and work overtime." },
    { nb: "Kjedelig? Eller praktisk?", en: "Boring? Or practical?" },
    { nb: "Praktisk. Jeg sparer til neste år.", en: "Practical. I'm saving for next year." },
    { nb: "Hvis du vil bli med senere, si ifra.", en: "If you want to join later, say so." },
    { nb: "Gjerne. Hold meg oppdatert.", en: "Gladly. Keep me posted." }
  ],
  glosses: {"overtid": "overtime", "spare": "save (money)"}
  }
];
