const keywordTranslations = {
  en: {
    0: { upright: ['New beginnings', 'Freedom', 'Adventure'], reversed: ['Innocence', 'Foolishness', 'Recklessness'] },
    1: { upright: ['Willpower', 'Power', 'Skill'], reversed: ['Deception', 'Cunning', 'Trickery'] },
    2: { upright: ['Subconscious', 'Intuition', 'Spirituality'], reversed: ['Suppressed intuition', 'Hidden motives', 'Superficiality'] },
    3: { upright: ['Divine feminine', 'Sensuality', 'Abundance'], reversed: ['Insecurity', 'Neglect', 'Domination'] },
    4: { upright: ['Stability', 'Structure', 'Protection'], reversed: ['Tyranny', 'Arrogance', 'Rigidity'] },
    5: { upright: ['Tradition', 'Community', 'Conservatism'], reversed: ['Rebellion', 'Resistance', 'Nonconformity'] },
    6: { upright: ['Love', 'Union', 'Partnership'], reversed: ['Disharmony', 'Imbalance', 'Conflict'] },
    7: { upright: ['Success', 'Ambition', 'Determination'], reversed: ['Forcefulness', 'Aimlessness', 'Loss of control'] },
    8: { upright: ['Courage', 'Confidence', 'Compassion'], reversed: ['Self-doubt', 'Weakness', 'Low confidence'] },
    9: { upright: ['Self-reflection', 'Contemplation', 'Solitude'], reversed: ['Loneliness', 'Isolation', 'Withdrawal'] },
    10: { upright: ['Change', 'Cycles', 'Fate'], reversed: ['Bad luck', 'Loss of control', 'Unfavorable change'] },
    11: { upright: ['Justice', 'Karma', 'Consequences'], reversed: ['Injustice', 'Punishment', 'Falsehood'] },
    12: { upright: ['Sacrifice', 'Waiting', 'Suspension'], reversed: ['Delay', 'Disinterest', 'Stagnation'] },
    13: { upright: ['Endings', 'Transformation', 'Letting go'], reversed: ['Fear of change', 'Repeating patterns', 'Resistance to change'] },
    14: { upright: ['Balance', 'Patience', 'Moderation'], reversed: ['Imbalance', 'Excess', 'Extremes'] },
    15: { upright: ['Attachment', 'Addiction', 'Obsession'], reversed: ['Independence', 'Freedom', 'Awakening'] },
    16: { upright: ['Disaster', 'Destruction', 'Collapse'], reversed: ['Avoiding disaster', 'Bare survival', 'Resistance to change'] },
    17: { upright: ['Hope', 'Inspiration', 'Optimism'], reversed: ['Despair', 'Loss', 'Pessimism'] },
    18: { upright: ['Illusion', 'Intuition', 'Uncertainty'], reversed: ['Fear', 'Deception', 'Anxiety'] },
    19: { upright: ['Happiness', 'Success', 'Optimism'], reversed: ['Blocked happiness', 'Overenthusiasm', 'Pessimism'] },
    20: { upright: ['Self-reflection', 'Awakening', 'Renewal'], reversed: ['Self-doubt', 'Lack of self-awareness', 'Stagnation'] },
    21: { upright: ['Wholeness', 'Completion', 'Belonging'], reversed: ['Incompletion', 'No result', 'Sense of lack'] },
    22: { upright: ['Inspiration', 'Creativity', 'New momentum'], reversed: ['Delay', 'Bottleneck', 'Lack of passion'] },
    23: { upright: ['Planning', 'Decision-making', 'Stepping out of comfort zone'], reversed: ['Poor planning', 'Overthinking', 'Inaction'] },
    24: { upright: ['Drive', 'Confidence', 'Expansion'], reversed: ['Limits', 'Lack of progress', 'Obstacles'] },
    25: { upright: ['Family', 'Reunion', 'Community'], reversed: ['Poor communication', 'Instability', 'Conflict with loved ones'] },
    26: { upright: ['Competition', 'Conflict', 'Rivalry'], reversed: ['Avoiding conflict', 'Seeking common ground'] },
    27: { upright: ['Victory', 'Respect', 'Recognition'], reversed: ['Self-doubt', 'Lack of recognition', 'Punishment'] },
    28: { upright: ['Standing your ground', 'Defense', 'Maintaining control'], reversed: ['Giving up', 'Shaken confidence', 'Exhaustion'] },
    29: { upright: ['Swift action', 'Progress', 'Quick resolution'], reversed: ['Obstacles', 'Waiting', 'Slowdown'] },
    30: { upright: ['Resilience', 'Last stand', 'Giving it your all'], reversed: ['Depletion', 'Fatigue', 'Burnout'] },
    31: { upright: ['Achievement', 'Responsibility', 'Burden'], reversed: ['Lack of priorities', 'Pointless burden', 'Unable to delegate'] },
    32: { upright: ['Exploration', 'Excitement', 'Freedom'], reversed: ['Lack of direction', 'Negative energy', 'Restriction'] },
    33: { upright: ['Action', 'Adventure', 'Fearlessness'], reversed: ['Anger', 'Impulsiveness', 'Recklessness'] },
    34: { upright: ['Courage', 'Charm', 'Leadership'], reversed: ['Selfishness', 'Jealousy', 'Bossiness'] },
    35: { upright: ['Big-picture vision', 'Leadership', 'Overcoming difficulties'], reversed: ['Impulsiveness', 'Aggressive goals', 'Fury'] },
    36: { upright: ['Emotional abundance', 'Creativity', 'Fresh feelings'], reversed: ['Wasted emotions', 'Blocked creativity', 'Emptiness'] },
    37: { upright: ['Union', 'Partnership', 'Becoming one'], reversed: ['Imbalance', 'Communication breakdown', 'Tense relationship'] },
    38: { upright: ['Friendship', 'Social connection', 'Joy'], reversed: ['Blind conformity', 'Following the crowd', 'Solitude'] },
    39: { upright: ['Apathy', 'Introspection', 'Detachment'], reversed: ['Boredom', 'Taking for granted', 'Cold indifference'] },
    40: { upright: ['Loss', 'Grief', 'Disappointment'], reversed: ['Acceptance', 'Moving on', 'Inner peace'] },
    41: { upright: ['Nostalgia', 'Reunion', 'Fond memories'], reversed: ['Resistance to change', 'Clinging to the past', 'Unrealistic'] },
    42: { upright: ['Too many choices', 'Fantasy', 'Illusion'], reversed: ['Temptation', 'Variety', 'Confusion'] },
    43: { upright: ['Walking away', 'Disillusionment', 'Dissatisfaction'], reversed: ['Confusion', 'Fear of the unknown', 'Fear of loss'] },
    44: { upright: ['Comfort', 'Emotional stability', 'Luxury'], reversed: ['Greed', 'Arrogance', 'Dissatisfaction'] },
    45: { upright: ['Peace', 'Fulfillment', 'Belonging'], reversed: ['Shattered dreams', 'Family discord', 'Toxic relationship'] },
    46: { upright: ['Surprise', 'Inner child', 'Imagination'], reversed: ['Immaturity', 'Escapism', 'Lack of creativity'] },
    47: { upright: ['Mediation', 'Turning emotion into action', 'Romance'], reversed: ['Vanity', 'Conflict avoidance', 'Flattery'] },
    48: { upright: ['Kindness', 'Calm', 'Serenity'], reversed: ['Emotional detachment', 'Insecurity', 'Dependence'] },
    49: { upright: ['Compassion', 'Self-control', 'Wisdom'], reversed: ['Manipulation', 'Mood swings', 'Deception'] },
    50: { upright: ['Breakthrough', 'Strength', 'Mental clarity'], reversed: ['Confusion', 'Cruelty', 'Chaos'] },
    51: { upright: ['Difficult decision', 'Indecision', 'Stalemate'], reversed: ['Lose-lose', 'Smaller loss', 'No right answer'] },
    52: { upright: ['Heartbreak', 'Torment', 'Despair'], reversed: ['Recovery', 'Forgiveness', 'Moving forward'] },
    53: { upright: ['Rest', 'Healing', 'Recovery'], reversed: ['Restlessness', 'Fatigue', 'Pressure'] },
    54: { upright: ['Ruthless ambition', 'Victory at any cost', 'Cunning'], reversed: ['Lingering hatred', 'Hope for reconciliation', 'Hope for forgiveness'] },
    55: { upright: ['Transition', 'Leaving the past behind', 'Moving forward'], reversed: ['Emotional baggage', 'Unresolved issues', 'Resistance to change'] },
    56: { upright: ['Deceit', 'Cunning', 'Turning a blind eye'], reversed: ['Reform', 'Hope for change', 'Return after straying'] },
    57: { upright: ['Imprisonment', 'Powerlessness', 'Self-exile'], reversed: ['Self-acceptance', 'New perspective', 'Freedom'] },
    58: { upright: ['Anxiety', 'Despair', 'Nightmares'], reversed: ['Fear', 'Lack of objectivity', 'Despair'] },
    59: { upright: ['Betrayal', 'Failure'], reversed: ['Recovery', 'Renewed vitality', 'Inevitable ending'] },
    60: { upright: ['Curiosity', 'Restlessness', 'Mental energy'], reversed: ['Haste', 'Empty talk'] },
    61: { upright: ['Goal', 'Speed', 'Ambition'], reversed: ['Aimlessness', 'Disregard for consequences', 'Unpredictability'] },
    62: { upright: ['Unique perspective', 'Calm', 'Independence'], reversed: ['Coldness', 'Cruelty', 'Sharpness'] },
    63: { upright: ['Wisdom', 'Authority', 'Honor'], reversed: ['Manipulation', 'Harshness', 'Criticism'] },
    64: { upright: ['Opportunity', 'Prosperity', 'Enterprise'], reversed: ['Missed opportunity'] },
    65: { upright: ['Balance', 'Planning', 'Adapting to change'], reversed: ['Imbalance', 'Disorder', 'Overwhelm'] },
    66: { upright: ['Teamwork', 'Building', 'Productive results'], reversed: ['Lack of cooperation', 'Disorder', 'Interpersonal tension'] },
    67: { upright: ['Conservation', 'Security', 'Frugality'], reversed: ['Greed', 'Stinginess', 'Possessiveness'] },
    68: { upright: ['Need', 'Poverty', 'Insecurity'], reversed: ['Recovery', 'Renewed prosperity', 'Isolation'] },
    69: { upright: ['Charity', 'Generosity', 'Sharing'], reversed: ['Selfishness', 'Stinginess', 'Debt'] },
    70: { upright: ['Conscientiousness', 'Perseverance', 'Diligence'], reversed: ['Futility', 'Scattered attention', 'Wasted effort'] },
    71: { upright: ['Learning', 'Apprenticeship', 'Achievement'], reversed: ['Scattered attention', 'Lack of goals', 'Lack of motivation'] },
    72: { upright: ['Fruit of labor', 'Independence', 'Reward after effort'], reversed: ['Mistakes', 'Workaholism', 'Setbacks'] },
    73: { upright: ['Legacy', 'Inheritance', 'Peak achievement'], reversed: ['Failure', 'Instability', 'Lack of resources'] },
    74: { upright: ['Dreams', 'Passion', 'New opportunities'], reversed: ['Daydreaming', 'Impracticality', 'Laziness'] },
    75: { upright: ['Effort', 'Dedication', 'Daily work'], reversed: ['Laziness', 'Obsession', 'Futility'] },
    76: { upright: ['Practicality', 'Material enjoyment', 'Financial stability'], reversed: ['Life-work imbalance', 'Domineering', 'Futility'] },
    77: { upright: ['Abundance', 'Efficiency', 'Responsibility'], reversed: ['Greed', 'Material indulgence', 'Sensual temptation'] },
  },
  it: {
    0: { upright: ['Nuovi inizi', 'Liberta', 'Avventura'], reversed: ['Innocenza', 'Stoltezza', 'Sconsideratezza'] },
    1: { upright: ['Forza di volonta', 'Potere', 'Abilita'], reversed: ['Inganno', 'Astuzia', 'Raggiro'] },
    2: { upright: ['Inconscio', 'Intuizione', 'Spiritualita'], reversed: ['Intuizione repressa', 'Motivi nascosti', 'Superficialita'] },
    3: { upright: ['Femminile sacro', 'Sensualita', 'Abbondanza'], reversed: ['Insicurezza', 'Trascuratezza', 'Dominio'] },
    4: { upright: ['Stabilita', 'Struttura', 'Protezione'], reversed: ['Tirannia', 'Arroganza', 'Rigidita'] },
    5: { upright: ['Tradizione', 'Comunita', 'Conservatorismo'], reversed: ['Ribellione', 'Resistenza', 'Anticonformismo'] },
    6: { upright: ['Amore', 'Unione', 'Partenariato'], reversed: ['Disarmonia', 'Squilibrio', 'Conflitto'] },
    7: { upright: ['Successo', 'Ambizione', 'Determinazione'], reversed: ['Forzatura', 'Mancanza di direzione', 'Perdita di controllo'] },
    8: { upright: ['Coraggio', 'Fiducia', 'Compassione'], reversed: ['Dubbio di se', 'Debolezza', 'Scarsa fiducia'] },
    9: { upright: ['Auto-riflessione', 'Contemplazione', 'Solitudine'], reversed: ['Solitudine interiore', 'Isolamento', 'Ritiro'] },
    10: { upright: ['Cambiamento', 'Cicli', 'Destino'], reversed: ['Sfortuna', 'Perdita di controllo', 'Cambiamento sfavorevole'] },
    11: { upright: ['Giustizia', 'Karma', 'Conseguenze'], reversed: ['Ingiustizia', 'Punizione', 'Falsita'] },
    12: { upright: ['Sacrificio', 'Attesa', 'Sospensione'], reversed: ['Ritardo', 'Disinteresse', 'Stagnazione'] },
    13: { upright: ['Fine', 'Trasformazione', 'Lasciare andare'], reversed: ['Paura del cambiamento', 'Schemi ripetuti', 'Resistenza al cambiamento'] },
    14: { upright: ['Equilibrio', 'Pazienza', 'Moderazione'], reversed: ['Squilibrio', 'Eccesso', 'Estremi'] },
    15: { upright: ['Attaccamento', 'Dipendenza', 'Ossessione'], reversed: ['Indipendenza', 'Liberta', 'Risveglio'] },
    16: { upright: ['Disastro', 'Distruzione', 'Crollo'], reversed: ['Evitare il disastro', 'Sopravvivenza a stento', 'Resistenza al cambiamento'] },
    17: { upright: ['Speranza', 'Ispirazione', 'Ottimismo'], reversed: ['Disperazione', 'Perdita', 'Pessimismo'] },
    18: { upright: ['Illusione', 'Intuizione', 'Incertezza'], reversed: ['Paura', 'Inganno', 'Ansia'] },
    19: { upright: ['Felicita', 'Successo', 'Ottimismo'], reversed: ['Felicita bloccata', 'Entusiasmo eccessivo', 'Pessimismo'] },
    20: { upright: ['Auto-riflessione', 'Risveglio', 'Rinascita'], reversed: ['Dubbio di se', 'Scarsa consapevolezza di se', 'Stagnazione'] },
    21: { upright: ['Completezza', 'Compimento', 'Appartenenza'], reversed: ['Incompiutezza', 'Nessun risultato', 'Senso di mancanza'] },
    22: { upright: ['Ispirazione', 'Creativita', 'Nuovo slancio'], reversed: ['Ritardo', 'Collo di bottiglia', 'Mancanza di passione'] },
    23: { upright: ['Pianificazione', 'Decisione', 'Uscire dalla comfort zone'], reversed: ['Pianificazione scarsa', 'Pensare troppo', 'Inazione'] },
    24: { upright: ['Slancio', 'Fiducia', 'Espansione'], reversed: ['Limiti', 'Mancanza di progresso', 'Ostacoli'] },
    25: { upright: ['Famiglia', 'Riunione', 'Comunita'], reversed: ['Comunicazione carente', 'Instabilita', 'Conflitto con i propri cari'] },
    26: { upright: ['Competizione', 'Conflitto', 'Rivalita'], reversed: ['Evitare il conflitto', 'Cercare un terreno comune'] },
    27: { upright: ['Vittoria', 'Rispetto', 'Riconoscimento'], reversed: ['Dubbio di se', 'Mancanza di riconoscimento', 'Punizione'] },
    28: { upright: ['Difendere la propria posizione', 'Difesa', 'Mantenere il controllo'], reversed: ['Rinuncia', 'Fiducia scossa', 'Esaurimento'] },
    29: { upright: ['Azione rapida', 'Progresso', 'Soluzione rapida'], reversed: ['Ostacoli', 'Attesa', 'Rallentamento'] },
    30: { upright: ['Resilienza', 'Ultimo sforzo', 'Dare tutto'], reversed: ['Esaurimento', 'Stanchezza', 'Burnout'] },
    31: { upright: ['Risultato', 'Responsabilita', 'Peso'], reversed: ['Mancanza di priorita', 'Peso inutile', 'Impossibilita di delegare'] },
    32: { upright: ['Esplorazione', 'Entusiasmo', 'Liberta'], reversed: ['Mancanza di direzione', 'Energia negativa', 'Limitazione'] },
    33: { upright: ['Azione', 'Avventura', 'Impavidita'], reversed: ['Rabbia', 'Impulsivita', 'Sconsideratezza'] },
    34: { upright: ['Coraggio', 'Carisma', 'Leadership'], reversed: ['Egoismo', 'Gelosia', 'Autoritarismo'] },
    35: { upright: ['Visione d insieme', 'Leadership', 'Superare le difficolta'], reversed: ['Impulsivita', 'Obiettivi aggressivi', 'Furia'] },
    36: { upright: ['Abbondanza emotiva', 'Creativita', 'Sentimenti nuovi'], reversed: ['Emozioni sprecate', 'Creativita bloccata', 'Vuoto'] },
    37: { upright: ['Unione', 'Partenariato', 'Diventare uno'], reversed: ['Squilibrio', 'Rottura della comunicazione', 'Relazione tesa'] },
    38: { upright: ['Amicizia', 'Vita sociale', 'Gioia'], reversed: ['Conformismo cieco', 'Seguire la folla', 'Solitudine'] },
    39: { upright: ['Apatia', 'Introspezione', 'Distacco'], reversed: ['Noia', 'Dare per scontato', 'Fredda indifferenza'] },
    40: { upright: ['Perdita', 'Dolore', 'Delusione'], reversed: ['Accettazione', 'Andare avanti', 'Pace interiore'] },
    41: { upright: ['Nostalgia', 'Riunione', 'Bei ricordi'], reversed: ['Resistenza al cambiamento', 'Attaccamento al passato', 'Irrealismo'] },
    42: { upright: ['Troppe scelte', 'Fantasia', 'Illusione'], reversed: ['Tentazione', 'Varieta', 'Confusione'] },
    43: { upright: ['Allontanarsi', 'Disillusione', 'Insoddisfazione'], reversed: ['Confusione', 'Paura dell ignoto', 'Paura della perdita'] },
    44: { upright: ['Comodita', 'Stabilita emotiva', 'Lusso'], reversed: ['Avidita', 'Arroganza', 'Insoddisfazione'] },
    45: { upright: ['Pace', 'Appagamento', 'Appartenenza'], reversed: ['Sogni infranti', 'Disarmonia familiare', 'Relazione tossica'] },
    46: { upright: ['Sorpresa', 'Bambino interiore', 'Immaginazione'], reversed: ['Immaturita', 'Evasione', 'Mancanza di creativita'] },
    47: { upright: ['Mediazione', 'Trasformare l emozione in azione', 'Romanticismo'], reversed: ['Vanita', 'Evitamento del conflitto', 'Adulazione'] },
    48: { upright: ['Gentilezza', 'Calma', 'Serenita'], reversed: ['Distacco emotivo', 'Insicurezza', 'Dipendenza'] },
    49: { upright: ['Compassione', 'Autocontrollo', 'Saggezza'], reversed: ['Manipolazione', 'Sbalzi d umore', 'Inganno'] },
    50: { upright: ['Svolta', 'Forza', 'Chiarezza mentale'], reversed: ['Confusione', 'Crudelta', 'Caos'] },
    51: { upright: ['Decisione difficile', 'Indecisione', 'Stallo'], reversed: ['Perdita per tutti', 'Perdita minore', 'Nessuna risposta giusta'] },
    52: { upright: ['Cuore spezzato', 'Tormento', 'Disperazione'], reversed: ['Guarigione', 'Perdono', 'Andare avanti'] },
    53: { upright: ['Riposo', 'Guarigione', 'Recupero'], reversed: ['Irrequietezza', 'Stanchezza', 'Pressione'] },
    54: { upright: ['Ambizione spietata', 'Vittoria a ogni costo', 'Astuzia'], reversed: ['Odio persistente', 'Speranza di riconciliazione', 'Speranza di perdono'] },
    55: { upright: ['Transizione', 'Lasciare il passato', 'Andare avanti'], reversed: ['Bagaglio emotivo', 'Questioni irrisolte', 'Resistenza al cambiamento'] },
    56: { upright: ['Inganno', 'Astuzia', 'Far finta di non vedere'], reversed: ['Riforma', 'Speranza di cambiamento', 'Ritorno sulla retta via'] },
    57: { upright: ['Prigionia', 'Impotenza', 'Autoesilio'], reversed: ['Accettazione di se', 'Nuova prospettiva', 'Liberta'] },
    58: { upright: ['Ansia', 'Disperazione', 'Incubi'], reversed: ['Paura', 'Mancanza di obiettivita', 'Disperazione'] },
    59: { upright: ['Tradimento', 'Fallimento'], reversed: ['Ripresa', 'Vitalita ritrovata', 'Finale inevitabile'] },
    60: { upright: ['Curiosita', 'Irrequietezza', 'Energia mentale'], reversed: ['Fretta', 'Parole vuote'] },
    61: { upright: ['Obiettivo', 'Velocita', 'Ambizione'], reversed: ['Mancanza di meta', 'Disprezzo delle conseguenze', 'Imprevedibilita'] },
    62: { upright: ['Prospettiva unica', 'Calma', 'Indipendenza'], reversed: ['Freddezza', 'Crudelta', 'Asprezza'] },
    63: { upright: ['Saggezza', 'Autorita', 'Onore'], reversed: ['Manipolazione', 'Durezza', 'Critica'] },
    64: { upright: ['Opportunita', 'Prosperita', 'Intraprendenza'], reversed: ['Occasione persa'] },
    65: { upright: ['Equilibrio', 'Pianificazione', 'Adattarsi al cambiamento'], reversed: ['Squilibrio', 'Disordine', 'Smarrimento'] },
    66: { upright: ['Lavoro di squadra', 'Costruzione', 'Risultati concreti'], reversed: ['Mancanza di collaborazione', 'Disordine', 'Tensione interpersonale'] },
    67: { upright: ['Conservazione', 'Sicurezza', 'Frugalita'], reversed: ['Avidita', 'Tirchieria', 'Possessivita'] },
    68: { upright: ['Bisogno', 'Poverta', 'Insicurezza'], reversed: ['Ripresa', 'Prosperita ritrovata', 'Isolamento'] },
    69: { upright: ['Carita', 'Generosita', 'Condivisione'], reversed: ['Egoismo', 'Tirchieria', 'Debito'] },
    70: { upright: ['Senso del dovere', 'Perseveranza', 'Diligenza'], reversed: ['Inutilita', 'Attenzione dispersa', 'Sforzo sprecato'] },
    71: { upright: ['Apprendimento', 'Apprendistato', 'Risultato'], reversed: ['Attenzione dispersa', 'Mancanza di obiettivi', 'Mancanza di motivazione'] },
    72: { upright: ['Frutto del lavoro', 'Indipendenza', 'Ricompensa dopo lo sforzo'], reversed: ['Errori', 'Dipendenza dal lavoro', 'Battute d arresto'] },
    73: { upright: ['Eredita', 'Trasmissione', 'Massimo compimento'], reversed: ['Fallimento', 'Instabilita', 'Mancanza di risorse'] },
    74: { upright: ['Sogni', 'Passione', 'Nuove opportunita'], reversed: ['Fantasticheria', 'Irrealismo', 'Pigrizia'] },
    75: { upright: ['Impegno', 'Dedizione', 'Lavoro quotidiano'], reversed: ['Pigrizia', 'Ossessione', 'Inutilita'] },
    76: { upright: ['Praticita', 'Piaceri materiali', 'Stabilita economica'], reversed: ['Squilibrio vita-lavoro', 'Autoritarismo', 'Inutilita'] },
    77: { upright: ['Abbondanza', 'Efficienza', 'Responsabilita'], reversed: ['Avidita', 'Indulgenza materiale', 'Tentazione sensuale'] },
  },
};

export function getLocalizedTarotKeywords(cardId, isReversed, language, fallbackKeywords = []) {
  if (language === 'zh-CN') {
    return Array.isArray(fallbackKeywords) ? fallbackKeywords.slice(0, 3) : [];
  }

  const localeKeywords = keywordTranslations[language]?.[cardId];
  const orientation = isReversed ? 'reversed' : 'upright';
  const keywords = localeKeywords?.[orientation];

  if (Array.isArray(keywords) && keywords.length > 0) {
    return keywords;
  }

  return Array.isArray(fallbackKeywords) ? fallbackKeywords.slice(0, 3) : [];
}

function formatKeywordList(keywords, language) {
  const safeKeywords = Array.isArray(keywords) ? keywords.filter(Boolean).slice(0, 3) : [];
  if (safeKeywords.length === 0) return '';

  if (language === 'it') {
    if (safeKeywords.length === 1) return safeKeywords[0];
    if (safeKeywords.length === 2) return `${safeKeywords[0]} e ${safeKeywords[1]}`;
    return `${safeKeywords[0]}, ${safeKeywords[1]} e ${safeKeywords[2]}`;
  }

  if (safeKeywords.length === 1) return safeKeywords[0];
  if (safeKeywords.length === 2) return `${safeKeywords[0]} and ${safeKeywords[1]}`;
  return `${safeKeywords[0]}, ${safeKeywords[1]}, and ${safeKeywords[2]}`;
}

export function getLocalizedTarotReading(cardData, isReversed, language, fallbackReading = '') {
  if (language === 'zh-CN') {
    return fallbackReading;
  }

  const cardId = cardData?.id;
  const englishName = cardData?.englishName || 'this card';
  const localizedKeywords = getLocalizedTarotKeywords(
    cardId,
    Boolean(isReversed),
    language,
    isReversed ? cardData?.reversedKeywords : cardData?.uprightKeywords,
  );
  const keywordList = formatKeywordList(localizedKeywords, language);

  if (!keywordList) {
    return fallbackReading;
  }

  if (language === 'it') {
    if (isReversed) {
      return `${englishName} in posizione rovesciata mette in luce ${keywordList}. Osserva con calma dove questi temi stanno chiedendo attenzione prima di fare il prossimo passo.`;
    }

    return `${englishName} in posizione dritta mette in luce ${keywordList}. Lascia che questi temi guidino con chiarezza il tuo prossimo passo.`;
  }

  if (isReversed) {
    return `${englishName} reversed highlights ${keywordList}. Slow down and notice where these themes are asking for your attention before you take the next step.`;
  }

  return `${englishName} upright highlights ${keywordList}. Let these themes guide your next step with a clearer sense of direction.`;
}
