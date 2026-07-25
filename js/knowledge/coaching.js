// Base de connaissances entraînement — générée par l'agent coach expert (Seiler, Coggan, Daniels, Billat).
export const COACH = {
 "meta": {
  "version": "1.0.0",
  "language": "fr",
  "generatedAt": "2026-07-25",
  "description": "Base de connaissances d'entraînement endurance (course, trail, vélo) pour analyse de charge, extrapolation de performance et génération de plans personnalisés.",
  "scientificBasis": [
   "Seiler (distribution polarisée 80/20)",
   "Coggan & Allen (TSS, CTL/ATL/TSB, zones puissance)",
   "Banister (TRIMP, modèle impulsion-réponse)",
   "Daniels (VDOT, allures d'entraînement)",
   "Billat (VMA, fractions de vVO2max soutenables)",
   "Riegel (endurance exponent)",
   "Gabbett (ratio charge aiguë:chronique)",
   "Foster (monotonie et contrainte d'entraînement)",
   "Millet (physiologie du trail et de l'ultra-endurance)"
  ]
 },
 "zones": {
  "heartRate": {
   "model": "5 zones, définies en % FCmax et % de FC de réserve (Karvonen : FC cible = FCrepos + %reserve x (FCmax - FCrepos))",
   "notes": "Privilégier la FC de réserve si la FC de repos est connue. La dérive cardiaque rend la FC peu fiable sur les efforts courts (< 3 min) : utiliser allure ou puissance pour la Z5.",
   "zones": [
    {
     "id": "Z1",
     "name": "Récupération active",
     "pctHRmax": [
      50,
      60
     ],
     "pctHRreserve": [
      40,
      55
     ],
     "description": "Effort très facile, respiration nasale possible, conversation totalement aisée. Aucune sensation d'effort.",
     "physiologicalGoal": "Favoriser la récupération par augmentation du flux sanguin sans stress métabolique. Régénération active après séances dures."
    },
    {
     "id": "Z2",
     "name": "Endurance fondamentale",
     "pctHRmax": [
      60,
      75
     ],
     "pctHRreserve": [
      55,
      70
     ],
     "description": "Allure de conversation confortable, effort que l'on peut tenir plusieurs heures. C'est la zone qui doit représenter la majorité du volume (~80 % du temps).",
     "physiologicalGoal": "Développement des mitochondries et de la densité capillaire, amélioration de l'oxydation des lipides, économie de course, base aérobie."
    },
    {
     "id": "Z3",
     "name": "Endurance active / Tempo",
     "pctHRmax": [
      75,
      85
     ],
     "pctHRreserve": [
      70,
      80
     ],
     "description": "Effort soutenu mais contrôlé, phrases courtes seulement. Zone 'grise' à doser : utile en tempo structuré, contre-productive si subie tous les jours.",
     "physiologicalGoal": "Amélioration de l'endurance au seuil aérobie, capacité à soutenir un effort prolongé (allure marathon/cyclosportive)."
    },
    {
     "id": "Z4",
     "name": "Seuil anaérobie",
     "pctHRmax": [
      85,
      92
     ],
     "pctHRreserve": [
      80,
      90
     ],
     "description": "Effort dur, à la limite de l'accumulation de lactate (~allure tenable 60 min). Parler est très difficile. Séances en blocs de 8 à 20 min.",
     "physiologicalGoal": "Élévation du seuil lactique (LT2), amélioration de la clairance du lactate, vitesse/puissance critique."
    },
    {
     "id": "Z5",
     "name": "VO2max / Puissance maximale aérobie",
     "pctHRmax": [
      92,
      100
     ],
     "pctHRreserve": [
      90,
      100
     ],
     "description": "Effort très dur, tenable 2 à 6 min par répétition. La FC est en retard sur l'effort : piloter à l'allure (VMA) ou à la puissance (PMA), pas au cardio.",
     "physiologicalGoal": "Développement du VO2max (débit cardiaque maximal, extraction d'O2), puissance aérobie maximale, tolérance lactique."
    }
   ]
  },
  "runningPace": {
   "model": "Zones d'allure basées sur le % de VMA (vitesse maximale aérobie, ~vitesse à VO2max, tenable 4 à 6 min)",
   "zones": [
    {
     "id": "RP1",
     "name": "Récupération",
     "pctVMA": [
      50,
      60
     ],
     "description": "Footing très lent, jambes légères, sans contrainte d'allure.",
     "physiologicalGoal": "Récupération active, décrassage, maintien de la fréquence gestuelle sans fatigue."
    },
    {
     "id": "RP2",
     "name": "Endurance fondamentale",
     "pctVMA": [
      60,
      72
     ],
     "description": "Allure de footing conversationnelle. Ex. VMA 16 km/h : courir entre 9,6 et 11,5 km/h (5:13 à 6:15 /km).",
     "physiologicalGoal": "Base aérobie, économie de course, adaptation musculo-tendineuse au volume."
    },
    {
     "id": "RP3",
     "name": "Allure marathon / Tempo",
     "pctVMA": [
      72,
      82
     ],
     "description": "Allure spécifique marathon (78-82 % VMA pour un coureur entraîné) et tempo continu de 20 à 60 min.",
     "physiologicalGoal": "Endurance spécifique, capacité à oxyder les glucides efficacement sur effort prolongé, calage de l'allure objectif."
    },
    {
     "id": "RP4",
     "name": "Seuil / Allure 10 km - semi",
     "pctVMA": [
      82,
      90
     ],
     "description": "Allure semi (82-86 % VMA) à allure 10 km (86-90 % VMA). Fractions de 6 à 20 min, récupérations courtes (1-3 min).",
     "physiologicalGoal": "Élévation du seuil anaérobie, tolérance et recyclage du lactate."
    },
    {
     "id": "RP5",
     "name": "VMA",
     "pctVMA": [
      95,
      105
     ],
     "description": "Intervalles courts (30/30, 200-400 m à 100-105 % VMA) ou longs (600-1000 m à 95-100 % VMA).",
     "physiologicalGoal": "Développement du VO2max, vitesse gestuelle, coût énergétique à haute vitesse."
    }
   ]
  },
  "cyclingPower": {
   "model": "Zones de puissance en % de FTP (Functional Threshold Power, puissance moyenne maximale ~60 min), d'après Coggan",
   "zones": [
    {
     "id": "P1",
     "name": "Récupération active",
     "pctFTP": [
      0,
      55
     ],
     "description": "Pédalage très souple, jambes qui tournent sans forcer.",
     "physiologicalGoal": "Récupération, circulation sanguine, décrassage post-course."
    },
    {
     "id": "P2",
     "name": "Endurance",
     "pctFTP": [
      56,
      75
     ],
     "description": "Rythme de sortie longue, tenable plusieurs heures. Cœur du volume hivernal.",
     "physiologicalGoal": "Adaptations mitochondriales, utilisation des graisses, endurance de base."
    },
    {
     "id": "P3",
     "name": "Tempo",
     "pctFTP": [
      76,
      87
     ],
     "description": "Rythme soutenu 'gros braquet contrôlé', blocs de 20 à 90 min.",
     "physiologicalGoal": "Endurance musculaire, capacité à rouler fort longtemps sans creuser la dette."
    },
    {
     "id": "P3b",
     "name": "Sweet Spot",
     "pctFTP": [
      88,
      94
     ],
     "description": "Juste sous le seuil : meilleur rapport stress/adaptations. Blocs de 2 x 20 min à 3 x 15 min.",
     "physiologicalGoal": "Montée efficace de la FTP et de la CTL avec une fatigue modérée."
    },
    {
     "id": "P4",
     "name": "Seuil",
     "pctFTP": [
      95,
      105
     ],
     "description": "Autour de la FTP, blocs de 8 à 30 min. Effort de contre-la-montre.",
     "physiologicalGoal": "Élévation directe de la FTP, tolérance à l'effort au seuil lactique."
    },
    {
     "id": "P5",
     "name": "PMA / VO2max",
     "pctFTP": [
      106,
      120
     ],
     "description": "Intervalles de 2 à 6 min (ex. 5 x 4 min à 110-115 % FTP, récup 4 min).",
     "physiologicalGoal": "Développement du VO2max et de la puissance maximale aérobie."
    },
    {
     "id": "P6",
     "name": "Capacité anaérobie",
     "pctFTP": [
      121,
      150
     ],
     "description": "Efforts de 30 s à 2 min, très intenses (attaques, bosses courtes).",
     "physiologicalGoal": "Capacité anaérobie lactique, répétition d'efforts au-dessus de la PMA."
    },
    {
     "id": "P7",
     "name": "Sprint neuromusculaire",
     "pctFTP": [
      151,
      300
     ],
     "description": "Sprints maximaux de 5 à 15 s, récupération complète.",
     "physiologicalGoal": "Puissance neuromusculaire, recrutement des fibres rapides, force explosive."
    }
   ]
  }
 },
 "loadModel": {
  "sessionLoad": {
   "preferredMetricBySport": {
    "cycling_with_power": "TSS",
    "running_with_pace": "rTSS ou TRIMP",
    "trail_or_hr_only": "hrTRIMP ou hrTSS"
   },
   "tss": {
    "formula": "TSS = (durée_s x NP x IF) / (FTP x 3600) x 100, avec IF = NP / FTP",
    "simplified": "TSS ≈ durée_h x IF² x 100. 1 h à FTP = 100 TSS.",
    "referencePoints": "Sortie facile 1 h ≈ 40-50 TSS ; sortie tempo 1 h ≈ 70-80 TSS ; course 1 h à fond ≈ 100 TSS."
   },
   "hrTss": {
    "formula": "hrTSS ≈ durée_h x IF_fc² x 100, avec IF_fc = FC_moyenne_reserve / FC_seuil_reserve (FC seuil ≈ 88-90 % FCmax)",
    "note": "À utiliser quand on n'a ni puissance ni allure fiable (trail technique)."
   },
   "trimp": {
    "formula": "TRIMP (Banister) = durée_min x ΔFCratio x 0,64 x e^(1,92 x ΔFCratio) pour les hommes ; 0,86 x e^(1,67 x ΔFCratio) pour les femmes, avec ΔFCratio = (FCmoy - FCrepos)/(FCmax - FCrepos)",
    "zonalSimplified": "TRIMP zonal simplifié = Σ (minutes en zone x coefficient) avec coefficients Z1=1, Z2=2, Z3=3, Z4=4, Z5=5."
   },
   "trailAdjustment": "Pour le trail, majorer la charge de la composante D+ : charge ajustée = charge x (1 + D+_m / (distance_km x 100) x 0,4). Ex. 20 km / 1000 m D+ : +20 % de charge."
  },
  "chronicAcute": {
   "ctl": {
    "name": "Charge chronique (CTL, 'Fitness')",
    "definition": "Moyenne mobile exponentielle de la charge quotidienne, constante de temps 42 jours.",
    "formula": "CTL_aujourd'hui = CTL_hier + (charge_du_jour - CTL_hier) / 42"
   },
   "atl": {
    "name": "Charge aiguë (ATL, 'Fatigue')",
    "definition": "Moyenne mobile exponentielle de la charge quotidienne, constante de temps 7 jours.",
    "formula": "ATL_aujourd'hui = ATL_hier + (charge_du_jour - ATL_hier) / 7"
   },
   "tsb": {
    "name": "Balance de forme (TSB, 'Forme')",
    "formula": "TSB_aujourd'hui = CTL_hier - ATL_hier",
    "interpretationBands": [
     {
      "range": [
       -999,
       -30
      ],
      "label": "Surcharge",
      "interpretationFr": "Fatigue très élevée : risque de surmenage et de blessure. À réserver aux blocs de surcharge planifiés de quelques jours, suivis d'une récupération. Sinon, lever le pied immédiatement."
     },
     {
      "range": [
       -30,
       -10
      ],
      "label": "Entraînement productif",
      "interpretationFr": "Zone de travail idéale en période de développement : la charge dépasse l'habitude et provoque des adaptations. Surveiller le sommeil et les sensations."
     },
     {
      "range": [
       -10,
       5
      ],
      "label": "Zone neutre",
      "interpretationFr": "Équilibre entre fraîcheur et charge. Correct en maintien, mais peu stimulant en phase de développement : soit augmenter la charge, soit finaliser une récupération."
     },
     {
      "range": [
       5,
       25
      ],
      "label": "Fraîcheur / forme optimale",
      "interpretationFr": "Fraîcheur idéale pour performer : c'est la fenêtre cible le jour de la course (TSB +5 à +15 pour un marathon, jusqu'à +20/+25 pour un ultra ou une cyclosportive longue)."
     },
     {
      "range": [
       25,
       999
      ],
      "label": "Désentraînement",
      "interpretationFr": "Trop de fraîcheur trop longtemps : la condition physique (CTL) décroît. Hors convalescence ou coupure planifiée, reprendre progressivement l'entraînement."
     }
    ]
   },
   "safeProgression": {
    "ctlRampRatePerWeek": {
     "recommended": [
      3,
      5
     ],
     "max": 8,
     "unit": "points CTL / semaine",
     "textFr": "Augmenter la CTL de 3 à 5 points par semaine (≈ +5 à +8 % de charge hebdomadaire). Au-delà de 8 points/semaine sur plusieurs semaines, le risque de blessure et de surmenage augmente fortement."
    },
    "acuteChronicRatio": {
     "formula": "ACWR = charge des 7 derniers jours / charge moyenne hebdomadaire des 28 derniers jours (≈ ATL/CTL)",
     "sweetSpot": [
      0.8,
      1.3
     ],
     "caution": [
      1.3,
      1.5
     ],
     "danger": 1.5,
     "undertraining": 0.8,
     "textFr": "Maintenir le ratio charge aiguë:chronique entre 0,8 et 1,3. Entre 1,3 et 1,5 : vigilance, ne pas enchaîner deux semaines ainsi. Au-delà de 1,5 : risque de blessure multiplié par 2 à 4. Sous 0,8 durablement : désentraînement."
    },
    "monotony": {
     "formula": "Monotonie (Foster) = charge quotidienne moyenne sur 7 j / écart-type des charges quotidiennes sur 7 j",
     "warning": 2.0,
     "danger": 2.5,
     "strainFormula": "Contrainte = charge hebdomadaire x monotonie",
     "textFr": "Une monotonie > 2,0 (charges trop semblables chaque jour) augmente le risque de surmenage même à charge modérée. Alterner jours durs, jours faciles et repos complet."
    },
    "weeklyVolumeRule": "Ne pas augmenter le volume hebdomadaire de plus de 10 % d'une semaine sur l'autre en course à pied (contrainte ostéo-articulaire) ; jusqu'à 15 % tolérés à vélo (pas d'impact)."
   }
  }
 },
 "performanceModels": {
  "riegel": {
   "formula": "T2 = T1 x (D2 / D1)^k",
   "exponents": {
    "road": 1.06,
    "trailRolling": 1.08,
    "trailMountain": 1.1,
    "cyclingFlat": 1.05
   },
   "notesFr": "k = 1,06 sur route pour un coureur entraîné (valide de 3 km au marathon). En trail, la fatigue musculaire (excentrique en descente) dégrade davantage la performance : k = 1,08 en trail roulant, 1,10 en trail montagne technique. Au-delà de 4-5 h d'effort, Riegel devient optimiste : ajouter 5 à 10 % au temps prédit pour les ultras. Utiliser une performance de référence récente (< 8 semaines) et sur une distance d'au moins 1/4 de la distance cible."
  },
  "vmaEstimation": {
   "fromField": [
    {
     "test": "Demi-Cooper (distance max en 6 min)",
     "formula": "VMA (km/h) = distance_en_mètres / 100"
    },
    {
     "test": "Depuis un chrono 5 km",
     "formula": "VMA ≈ vitesse moyenne 5 km / 0,92"
    },
    {
     "test": "Depuis un chrono 10 km",
     "formula": "VMA ≈ vitesse moyenne 10 km / 0,88"
    },
    {
     "test": "Depuis un semi-marathon",
     "formula": "VMA ≈ vitesse moyenne semi / 0,84"
    },
    {
     "test": "Depuis un marathon",
     "formula": "VMA ≈ vitesse moyenne marathon / 0,79"
    }
   ],
   "sustainableFractions": {
    "commentFr": "Fraction de VMA soutenable selon la durée (coureur entraîné ; retirer 2-3 points de % pour un débutant)",
    "table": [
     {
      "duration": "6 min",
      "pctVMA": 100
     },
     {
      "duration": "15 min",
      "pctVMA": 95
     },
     {
      "duration": "20 min (5 km)",
      "pctVMA": 92
     },
     {
      "duration": "45 min (10 km)",
      "pctVMA": 88
     },
     {
      "duration": "1 h 30 (semi)",
      "pctVMA": 84
     },
     {
      "duration": "3 h (marathon)",
      "pctVMA": 79
     },
     {
      "duration": "5 h et +",
      "pctVMA": 70
     }
    ]
   }
  },
  "equivalences": {
   "commentFr": "Temps équivalents calculés avec Riegel k=1,06 (route) depuis un 10 km de référence ; 50 km trail roulant avec k=1,08 puis correction D+ à appliquer séparément.",
   "referenceDistancesKm": [
    5,
    10,
    21.097,
    42.195,
    50
   ],
   "examples": [
    {
     "ref10k": "60:00",
     "eq5k": "28:52",
     "eqSemi": "2:13:24",
     "eqMarathon": "4:38:26",
     "eq50kFlatTrail": "5:47:00"
    },
    {
     "ref10k": "50:00",
     "eq5k": "24:03",
     "eqSemi": "1:51:10",
     "eqMarathon": "3:52:02",
     "eq50kFlatTrail": "4:49:10"
    },
    {
     "ref10k": "45:00",
     "eq5k": "21:39",
     "eqSemi": "1:40:03",
     "eqMarathon": "3:28:50",
     "eq50kFlatTrail": "4:20:15"
    },
    {
     "ref10k": "40:00",
     "eq5k": "19:15",
     "eqSemi": "1:28:56",
     "eqMarathon": "3:05:38",
     "eq50kFlatTrail": "3:51:20"
    },
    {
     "ref10k": "35:00",
     "eq5k": "16:50",
     "eqSemi": "1:17:49",
     "eqMarathon": "2:42:26",
     "eq50kFlatTrail": "3:22:25"
    }
   ]
  },
  "trailElevationCorrection": {
   "kmEffortRule": "Kilomètre-effort : distance équivalente (km-effort) = distance_km + D+_m / 100. Ex. 30 km / 1500 m D+ = 45 km-effort. Estimer ensuite le temps avec l'allure à plat sur la distance-effort via Riegel.",
   "timePerHundredMetersDplus": {
    "commentFr": "Surcoût de temps approximatif par 100 m de D+ (par rapport au même kilométrage à plat), descentes incluses, selon le niveau du coureur :",
    "byLevel": [
     {
      "level": "Débutant",
      "minutesPer100mDplus": 6.5
     },
     {
      "level": "Intermédiaire",
      "minutesPer100mDplus": 5.0
     },
     {
      "level": "Confirmé",
      "minutesPer100mDplus": 4.0
     },
     {
      "level": "Avancé",
      "minutesPer100mDplus": 3.0
     },
     {
      "level": "Élite",
      "minutesPer100mDplus": 2.2
     }
    ],
    "noteFr": "Majorer de 15-25 % sur terrain très technique (pierriers, single alpin) et au-delà de 2000 m d'altitude (+6-7 % de coût énergétique par 1000 m au-dessus de 1500 m)."
   },
   "descentNote": "La descente ne 'rend' que ~30-50 % du temps perdu en montée, et son coût musculaire excentrique domine la fatigue en fin d'ultra : intégrer un entraînement spécifique de descente."
  },
  "cyclingPerformance": {
   "ftpEstimation": [
    {
     "test": "Test 20 min",
     "formula": "FTP = puissance moyenne 20 min x 0,95"
    },
    {
     "test": "Test ramp",
     "formula": "FTP ≈ 75 % de la puissance du dernier palier tenu 1 min"
    },
    {
     "test": "2 x 8 min",
     "formula": "FTP ≈ moyenne des 2 blocs x 0,90"
    }
   ],
   "wPerKg": {
    "formula": "w/kg = FTP / poids_kg",
    "commentFr": "Le w/kg à FTP prédit la performance en montée ; la puissance brute (et l'aéro) prédit la performance sur le plat."
   },
   "climbingSpeed": "Vitesse ascensionnelle (m/h) ≈ (w/kg x 3600) / (g x (1 + coût roulage/aéro ≈ 1,1)) ≈ w/kg x 340 sur pente à 8 %. Ex. 3,5 w/kg ≈ 1150-1200 m/h.",
   "granFondoIF": "Intensité cible cyclosportive : IF 0,75-0,80 pour 3-4 h, 0,70-0,75 pour 5-6 h, 0,65-0,70 au-delà."
  }
 },
 "sessionTypes": [
  {
   "id": "run_recovery",
   "sport": "running",
   "name": "Footing de récupération",
   "description": "20 à 40 min en Z1 (50-60 % VMA), allure très lente, idéalement sur sol souple. Aucune contrainte de rythme : s'arrêter de courir si les jambes sont lourdes et marcher.",
   "targetZone": "Z1 / RP1",
   "typicalDurationMin": [
    20,
    40
   ],
   "physiologicalBenefit": "Accélère la récupération par le flux sanguin, entretient la gestuelle sans ajouter de fatigue. À placer le lendemain d'une séance dure."
  },
  {
   "id": "run_easy",
   "sport": "running",
   "name": "Endurance fondamentale",
   "description": "40 à 75 min en Z2 (60-72 % VMA), conversation aisée en permanence. Si la FC dérive au-dessus de Z2, ralentir ou marcher dans les côtes. Doit constituer 70-80 % du volume de course.",
   "targetZone": "Z2 / RP2",
   "typicalDurationMin": [
    40,
    75
   ],
   "physiologicalBenefit": "Développe la densité mitochondriale et capillaire, l'oxydation des graisses et l'économie de course. C'est le socle de toute progression durable."
  },
  {
   "id": "run_long",
   "sport": "running",
   "name": "Sortie longue",
   "description": "1 h 15 à 2 h 45 majoritairement en Z2, avec éventuellement des blocs à allure spécifique en fin de sortie (ex. 3 x 15 min allure marathon sur les 60 dernières minutes en phase spécifique). Progression de +10-15 min par semaine, plafonner à 30-35 % du volume hebdomadaire.",
   "targetZone": "Z2 (+ blocs RP3 en phase spécifique)",
   "typicalDurationMin": [
    75,
    165
   ],
   "physiologicalBenefit": "Endurance structurale (tendons, muscles), déplétion/reconstitution du glycogène, mental et stratégie nutritionnelle de course."
  },
  {
   "id": "run_tempo",
   "sport": "running",
   "name": "Tempo / Seuil aérobie",
   "description": "Échauffement 20 min, puis 20 à 40 min continus à 78-84 % VMA (allure marathon à semi), retour au calme 10 min. Variante en blocs : 2-3 x 15 min récup 3 min.",
   "targetZone": "RP3 / Z3",
   "typicalDurationMin": [
    50,
    80
   ],
   "physiologicalBenefit": "Améliore l'endurance à allure soutenue et cale l'allure objectif marathon/semi. Charge modérée, récupération rapide."
  },
  {
   "id": "run_threshold",
   "sport": "running",
   "name": "Seuil anaérobie",
   "description": "Échauffement 20 min + gammes, puis 3 x 8-10 min ou 5 x 6 min à 85-90 % VMA (allure 10-15 km), récupération 90 s à 2 min trot. Volume total au seuil : 20 à 40 min.",
   "targetZone": "RP4 / Z4",
   "typicalDurationMin": [
    55,
    80
   ],
   "physiologicalBenefit": "Élève le seuil lactique : on court plus vite au même coût. Séance clé n°1 du semi et du 10 km."
  },
  {
   "id": "run_vma_short",
   "sport": "running",
   "name": "VMA courte (30/30 et 200-300 m)",
   "description": "Échauffement 20 min + 3 lignes droites. Corps de séance : 2 x (8 à 12 x 30 s vite / 30 s trot) à 100-105 % VMA, récup 3 min entre séries. Ou 2 x 8 x 200 m à 105 % VMA récup 30 s.",
   "targetZone": "RP5 / Z5",
   "typicalDurationMin": [
    45,
    65
   ],
   "physiologicalBenefit": "Sollicite le VO2max avec un temps de soutien élevé à haute vitesse et une fatigue lactique limitée. Idéale pour (re)construire la VMA en début de cycle."
  },
  {
   "id": "run_vma_long",
   "sport": "running",
   "name": "VMA longue (400-1000 m)",
   "description": "Échauffement 20 min + gammes. Corps de séance : 5-6 x 800-1000 m à 92-98 % VMA, récupération = 50-75 % du temps d'effort en trot. Volume total : 4 à 6 km à haute intensité.",
   "targetZone": "RP5 / Z5",
   "typicalDurationMin": [
    55,
    75
   ],
   "physiologicalBenefit": "Temps long passé à VO2max, développe la puissance aérobie et la tolérance à l'acidose. Prépare directement le 5-10 km."
  },
  {
   "id": "run_hills",
   "sport": "running",
   "name": "Côtes courtes",
   "description": "Échauffement 20 min, puis 8 à 12 x 30-45 s en côte à 5-8 % à intensité quasi maximale, redescente en marchant/trottinant (récup complète ~2 min). Concentration sur la posture et la poussée.",
   "targetZone": "Z5 (force)",
   "typicalDurationMin": [
    45,
    60
   ],
   "physiologicalBenefit": "Force spécifique, raideur tendineuse utile (stiffness), puissance et économie de course avec un impact articulaire réduit par rapport à la piste."
  },
  {
   "id": "run_fartlek",
   "sport": "running",
   "name": "Fartlek",
   "description": "45 à 70 min nature : après 15 min d'échauffement, alterner librement des accélérations de 30 s à 3 min (RP4-RP5) et des phases faciles, au ressenti et selon le terrain. Ex. 10 x 1 min vite / 1 min lent.",
   "targetZone": "RP2 à RP5",
   "typicalDurationMin": [
    45,
    70
   ],
   "physiologicalBenefit": "Développe VO2max et changement de rythme de façon ludique, sans contrainte de piste. Parfait en période de base ou en trail."
  },
  {
   "id": "run_race_pace",
   "sport": "running",
   "name": "Allure spécifique course",
   "description": "Séance clé de phase spécifique : ex. marathon = 3 x 4 km à allure marathon récup 800 m Z2 ; 10 km = 5 x 2 km à allure cible récup 400 m. Volume spécifique croissant à l'approche de l'objectif.",
   "targetZone": "Allure cible (RP3 marathon, RP4 10 km/semi)",
   "typicalDurationMin": [
    60,
    100
   ],
   "physiologicalBenefit": "Calage neuromusculaire et métabolique de l'allure de course, confiance, répétition de la nutrition de course."
  },
  {
   "id": "trail_vert",
   "sport": "trail",
   "name": "Séance de D+ (montées)",
   "description": "Sur une côte longue ou en station : 4 à 8 x 5-10 min de montée à intensité seuil (Z3-Z4), descente en récupération active technique. Marche rapide avec ou sans bâtons si pente > 20 %. Cumuler 400 à 1000 m D+ selon le niveau.",
   "targetZone": "Z3-Z4 en montée",
   "typicalDurationMin": [
    60,
    120
   ],
   "physiologicalBenefit": "Vitesse ascensionnelle, force spécifique de montée, technique de marche/course en pente, économie gestuelle avec bâtons."
  },
  {
   "id": "trail_long",
   "sport": "trail",
   "name": "Sortie longue trail (D+ et technique)",
   "description": "2 à 5 h sur terrain proche de l'objectif (pente, technicité, altitude), en Z1-Z2, en travaillant la nutrition (40-90 g glucides/h), le matériel et les descentes. Cibler un % du D+ de course croissant au fil des semaines.",
   "targetZone": "Z1-Z2",
   "typicalDurationMin": [
    120,
    300
   ],
   "physiologicalBenefit": "Endurance spécifique montagne, résistance musculaire excentrique en descente, autonomie (nutrition, orientation, gestion)."
  },
  {
   "id": "trail_downhill",
   "sport": "trail",
   "name": "Travail de descente",
   "description": "Après échauffement, 4 à 6 descentes de 3-6 min à allure engagée mais maîtrisée sur sentier technique, remontée tranquille. À introduire progressivement (courbatures fortes les 2 premières fois : effet 'repeated bout').",
   "targetZone": "Technique (FC libre)",
   "typicalDurationMin": [
    60,
    90
   ],
   "physiologicalBenefit": "Protection contre les dommages musculaires excentriques (facteur limitant n°1 en ultra), pied, proprioception et confiance en descente."
  },
  {
   "id": "bike_recovery",
   "sport": "cycling",
   "name": "Récupération vélo",
   "description": "30 à 60 min en P1 (< 55 % FTP), cadence souple 90-100 rpm, parcours plat. Home trainer accepté.",
   "targetZone": "P1",
   "typicalDurationMin": [
    30,
    60
   ],
   "physiologicalBenefit": "Récupération active sans impact, entretien de la fluidité de pédalage."
  },
  {
   "id": "bike_endurance",
   "sport": "cycling",
   "name": "Endurance vélo (Z2)",
   "description": "1 h 30 à 4 h en P2 (56-75 % FTP), cadence 85-95 rpm, en continu. Rester discipliné dans les bosses (ne pas dépasser P3).",
   "targetZone": "P2",
   "typicalDurationMin": [
    90,
    240
   ],
   "physiologicalBenefit": "Base aérobie, oxydation lipidique, endurance de longue durée : le fondement du cyclisme de fond."
  },
  {
   "id": "bike_sweet_spot",
   "sport": "cycling",
   "name": "Sweet Spot",
   "description": "Échauffement 15-20 min, puis 2-3 x 15-20 min à 88-94 % FTP, récupération 5 min P1, retour au calme. Progresser vers 2 x 30 min. Excellente séance home trainer.",
   "targetZone": "P3b (88-94 % FTP)",
   "typicalDurationMin": [
    60,
    100
   ],
   "physiologicalBenefit": "Meilleur ratio adaptation/fatigue pour élever la FTP et construire la CTL quand le temps est limité."
  },
  {
   "id": "bike_threshold",
   "sport": "cycling",
   "name": "Seuil vélo",
   "description": "Échauffement 20 min, puis 2-4 x 8-15 min à 95-105 % FTP, récupération = moitié du temps d'effort. Volume au seuil : 20 à 40 min. En côte régulière idéalement.",
   "targetZone": "P4",
   "typicalDurationMin": [
    70,
    100
   ],
   "physiologicalBenefit": "Élévation directe de la FTP, endurance au seuil pour cols et chronos."
  },
  {
   "id": "bike_pma",
   "sport": "cycling",
   "name": "PMA / VO2max vélo",
   "description": "Échauffement 20 min avec 3 accélérations. Corps : 5-6 x 3-4 min à 108-115 % FTP, récup 3-4 min P1 ; ou 2 x (6 x 40 s à 120 % / 20 s souple). Arrêter la série si la puissance chute de > 10 %.",
   "targetZone": "P5",
   "typicalDurationMin": [
    60,
    90
   ],
   "physiologicalBenefit": "Développe la PMA et le VO2max, plafond qui conditionne toute la pyramide de puissance."
  },
  {
   "id": "bike_force",
   "sport": "cycling",
   "name": "Force vélo (basse cadence)",
   "description": "Dans une côte à 5-8 % : 4-6 x 5 min à 80-90 % FTP en cadence 50-60 rpm, assis, gainé, récupération 5 min en cadence libre. Jamais en cas de douleur de genou.",
   "targetZone": "P3 en basse cadence",
   "typicalDurationMin": [
    70,
    100
   ],
   "physiologicalBenefit": "Force maximale appliquée à la pédale, recrutement des fibres, économie de pédalage — utile avant les blocs d'intensité."
  },
  {
   "id": "bike_long",
   "sport": "cycling",
   "name": "Sortie longue vélo",
   "description": "3 à 6 h en P2 avec, en phase spécifique, des cols ou blocs en P3 simulant le profil de l'objectif. Tester nutrition (60-90 g glucides/h), hydratation et matériel.",
   "targetZone": "P2 + blocs P3",
   "typicalDurationMin": [
    180,
    360
   ],
   "physiologicalBenefit": "Endurance longue distance, gestion de l'effort et de la nutrition pour cyclosportive/gran fondo."
  },
  {
   "id": "strength_training",
   "sport": "all",
   "name": "Renforcement musculaire",
   "description": "2 x 30-45 min/semaine : squats, fentes, soulevé de terre jambes tendues, mollets, gainage, pliométrie légère (course) ou force max 4-6 reps (vélo). Réduire à 1 séance d'entretien en phase spécifique.",
   "targetZone": "Hors zones cardio",
   "typicalDurationMin": [
    30,
    45
   ],
   "physiologicalBenefit": "Économie de course/pédalage (+2-4 %), prévention des blessures, maintien de la puissance en fin d'épreuve. Bénéfice démontré chez les endurants."
  }
 ],
 "planRules": {
  "periodization": {
   "model": "Périodisation linéaire-bloc en 4 phases, part de chaque phase en % de la durée totale du plan",
   "phases": [
    {
     "id": "base",
     "name": "Base (fondation aérobie)",
     "pctOfPlan": [
      35,
      40
     ],
     "contentFr": "Volume majoritairement Z2, 1 séance de VMA courte ou côtes/semaine pour entretenir la vitesse, renforcement 2x/sem, progression du volume +5-8 %/sem."
    },
    {
     "id": "build",
     "name": "Développement (build)",
     "pctOfPlan": [
      25,
      30
     ],
     "contentFr": "Introduction de 2 séances de qualité/sem (VO2max puis seuil), volume stabilisé à ~90-100 % du max, sortie longue qui s'allonge."
    },
    {
     "id": "specific",
     "name": "Spécifique",
     "pctOfPlan": [
      20,
      25
     ],
     "contentFr": "La qualité bascule vers l'allure/le profil de course (allure marathon, D+ trail, cols au tempo). Sorties longues maximales. Simulation de course à J-21/J-28."
    },
    {
     "id": "taper",
     "name": "Affûtage",
     "pctOfPlan": [
      8,
      12
     ],
     "contentFr": "Réduction du volume, maintien de l'intensité et de la fréquence. Voir règles taper."
    }
   ]
  },
  "intensityDistribution": {
   "rule": "Distribution polarisée / pyramidale : 75-85 % du temps en Z1-Z2, 5-10 % en Z3, 10-15 % en Z4-Z5 (mesuré en temps passé en zone).",
   "textFr": "La règle 80/20 (Seiler) : environ 80 % des séances faciles, 20 % dures. Erreur classique à corriger : trop de Z3 subie ('zone grise') qui fatigue sans stimuler autant que la vraie intensité."
  },
  "sessionsPerWeek": [
   {
    "availableHoursPerWeek": [
     0,
     4
    ],
    "sessions": 3,
    "qualitySessions": 1,
    "textFr": "3 séances : 1 qualité, 1 endurance, 1 sortie longue."
   },
   {
    "availableHoursPerWeek": [
     4,
     6
    ],
    "sessions": 4,
    "qualitySessions": 2,
    "textFr": "4 séances : 2 qualités (dont 1 légère), 1 endurance, 1 sortie longue."
   },
   {
    "availableHoursPerWeek": [
     6,
     9
    ],
    "sessions": 5,
    "qualitySessions": 2,
    "textFr": "5 séances : 2 qualités, 2 endurances, 1 sortie longue."
   },
   {
    "availableHoursPerWeek": [
     9,
     12
    ],
    "sessions": 6,
    "qualitySessions": 2,
    "textFr": "6 séances : 2 qualités, 3 endurances (dont récup), 1 sortie longue. Envisager du cross-training."
   },
   {
    "availableHoursPerWeek": [
     12,
     99
    ],
    "sessions": 7,
    "qualitySessions": 3,
    "textFr": "6-8 séances, doubles possibles : 2-3 qualités max, le reste en Z1-Z2. Jamais plus de 3 séances dures/semaine, quel que soit le volume."
   }
  ],
  "volumeProgression": {
   "weeklyIncreaseMaxPct": {
    "running": 10,
    "cycling": 15
   },
   "deload": {
    "frequency": "1 semaine sur 4 (athlète jeune/confirmé) à 1 sur 3 (masters 45+, débutants, historique de blessure)",
    "reductionPct": [
     30,
     45
    ],
    "textFr": "Semaine de décharge : volume réduit de 30 à 45 %, garder 1 rappel d'intensité court (ex. 6 x 30/30). C'est pendant l'assimilation que les adaptations se consolident."
   }
  },
  "longRun": {
   "progression": "+10 à +15 min par semaine (ou +10 % de durée), jamais plus de 2 augmentations consécutives sans palier.",
   "maxPctOfWeeklyVolume": 35,
   "maxDurationByGoal": {
    "10k": "1 h 15",
    "semi": "1 h 45",
    "marathon": "2 h 45 (ne pas dépasser 3 h même pour les lents : le coût dépasse le bénéfice)",
    "trail_50k": "3 h 30 - 4 h, ou week-end choc 2 x 3 h",
    "ultra_100k_plus": "4-5 h max en simple, privilégier les week-ends chocs (2 jours consécutifs de 3-5 h) plutôt qu'une sortie unique de 7 h"
   },
   "pctOfRaceTimeRule": "La sortie longue plafonne à 60-75 % du temps de course visé pour un marathon, 50-60 % pour un ultra."
  },
  "trailSpecifics": {
   "weeklyDplusTarget": "En phase spécifique, D+ hebdomadaire cible = D+ de la course x facteur : course < 1500 m D+ : x1,2-1,5 ; 1500-3000 m : x0,8-1,2 ; ultra > 3000 m : x0,5-0,8. Monter progressivement depuis 40-50 % de cette cible en phase de base.",
   "rules": [
    "Au moins 1 séance de montées structurée par semaine dès la phase build.",
    "Travail de descente spécifique toutes les 1-2 semaines en phase spécifique (protection excentrique).",
    "Reconnaissance ou simulation sur profil similaire à J-28/J-21.",
    "Entraîner la marche rapide en pente et l'usage des bâtons si la course le justifie (pentes > 15-20 %).",
    "Tester intégralement nutrition, chaussures et matériel obligatoire en sortie longue."
   ]
  },
  "raceSpecifics": {
   "10k": "Cycle de 8-10 semaines. Séances clés : VMA longue (build) puis allure spécifique 10 km (ex. 5 x 2 km) et seuil. 2 qualités/sem suffisent. Course de préparation 5 km à J-14/J-21.",
   "semi": "Cycle de 10-12 semaines. Séance clé : seuil long (3 x 3 km à allure semi) et sortie longue avec fin à allure. Course de prép 10 km à J-21.",
   "marathon": "Cycle de 12-16 semaines. Séance reine : sortie longue avec blocs allure marathon (jusqu'à 2 x 8 km ou 3 x 5 km à AM). Volume spécifique AM cumulé 60-80 km sur les 6 dernières semaines. Semi de prép à J-28/J-42 (pas plus proche). Répétition générale nutrition sur chaque sortie > 1 h 45.",
   "granFondo": "Cycle de 12-16 semaines. Progression du volume le week-end jusqu'à 80 % de la durée cible, blocs tempo/sweet spot en côte, 1 séance PMA/sem en build, week-end choc (2 grosses sorties consécutives) à J-28. Travail de la nutrition 60-90 g glucides/h obligatoire."
  },
  "taper": {
   "durationByGoal": {
    "10k": "7 jours",
    "semi": "10-14 jours",
    "marathon": "14-21 jours",
    "trail_ultra": "14-21 jours",
    "granFondo": "10-14 jours"
   },
   "volumeReduction": "Réduction exponentielle du volume de 40 à 60 % (par rapport à la plus grosse semaine), en gardant la même fréquence de séances (-1 max).",
   "intensity": "MAINTENIR l'intensité : rappels courts à allure course ou légèrement plus vite (ex. 3 x 3 min allure 10 km à J-4), c'est le volume qu'on coupe, jamais la qualité.",
   "targetTSB": "Viser TSB entre +5 et +15 le jour J (+15 à +25 pour un ultra), sans laisser la CTL chuter de plus de 10 %."
  },
  "weeklyPlacement": {
   "rules": [
    "48 h minimum entre deux séances dures (qualité ou sortie longue exigeante).",
    "Jamais de séance VMA/PMA le lendemain de la sortie longue.",
    "Sortie longue le week-end par défaut, précédée d'un jour facile ou repos.",
    "Séance de récupération ou repos complet le lendemain de la séance la plus dure de la semaine.",
    "Au moins 1 jour de repos complet par semaine (2 pour les débutants et masters 50+).",
    "Le renforcement musculaire lourd se place le même jour qu'une séance dure (jour dur = dur, jour facile = facile), jamais la veille de la qualité clé.",
    "Semaine type 5 séances : Mar qualité 1, Mer endurance, Jeu repos, Ven qualité 2 ou tempo, Sam endurance courte, Dim sortie longue, Lun repos."
   ]
  }
 },
 "adviceRules": [
  {
   "id": "overload_acute",
   "condition": "tsb < -30",
   "message": "Fatigue très élevée (TSB < -30) : réduisez immédiatement la charge. Prenez 2-3 jours faciles (Z1-Z2 courts ou repos), dormez davantage, et ne reprenez l'intensité que lorsque le TSB repasse au-dessus de -20."
  },
  {
   "id": "injury_risk_acwr",
   "condition": "acRatio > 1.5",
   "message": "Votre charge des 7 derniers jours dépasse de plus de 50 % votre habitude (ratio A:C > 1,5) : risque de blessure élevé. Supprimez une séance dure cette semaine et revenez sous un ratio de 1,3."
  },
  {
   "id": "acwr_caution",
   "condition": "acRatio >= 1.3 && acRatio <= 1.5",
   "message": "Charge en forte hausse (ratio A:C entre 1,3 et 1,5) : acceptable une semaine, mais prévoyez une semaine plus légère juste après. N'enchaînez pas deux semaines à ce niveau."
  },
  {
   "id": "ramp_too_fast",
   "condition": "rampCTL > 8",
   "message": "Votre forme (CTL) grimpe de plus de 8 points/semaine : c'est trop rapide pour être durable. Limitez la progression à +5 points/semaine et insérez une semaine de décharge (-35 % de volume) dans les 10 jours."
  },
  {
   "id": "monotony_high",
   "condition": "monotony > 2.0",
   "message": "Votre entraînement est trop monotone (charges quasi identiques chaque jour) : alternez franchement jours durs et jours très faciles, et gardez au moins un jour de repos complet. La monotonie élevée précède souvent le surmenage."
  },
  {
   "id": "strain_danger",
   "condition": "monotony > 2.5 && tsb < -15",
   "message": "Monotonie et fatigue élevées simultanément : profil typique de pré-surmenage. Prenez 48 h de repos complet, puis une semaine à -40 % de volume avec un seul rappel d'intensité court."
  },
  {
   "id": "undertrained",
   "condition": "acRatio < 0.8 && daysToRace > 21",
   "message": "Votre charge récente est nettement sous votre habitude (ratio A:C < 0,8) : vous vous désentraînez. Reprenez progressivement : +1 séance d'endurance cette semaine, puis réintroduisez la qualité la semaine suivante."
  },
  {
   "id": "detraining_tsb",
   "condition": "tsb > 25 && daysToRace > 14",
   "message": "Beaucoup de fraîcheur mais une condition en baisse (TSB > +25 hors affûtage) : c'est le moment de relancer la machine avec un bloc structuré — 2 séances de qualité et une sortie longue cette semaine."
  },
  {
   "id": "not_polarized",
   "condition": "pctLowIntensity < 70",
   "message": "Moins de 70 % de votre temps se passe en basse intensité (Z1-Z2) : vous êtes dans la 'zone grise'. Ralentissez vos footings (conversation aisée) et concentrez l'intensité sur 2 vraies séances de qualité par semaine. Objectif : 80 % facile / 20 % dur."
  },
  {
   "id": "no_intensity",
   "condition": "pctLowIntensity > 95 && daysToRace < 42",
   "message": "Quasiment aucune intensité ces dernières semaines alors que l'objectif approche : ajoutez une séance à allure de course et une séance de seuil ou VMA par semaine. Sans stimulus intense, la vitesse spécifique ne viendra pas."
  },
  {
   "id": "long_run_missing",
   "condition": "daysSinceLongRun > 14 && goalDistanceKm >= 21",
   "message": "Plus de 2 semaines sans sortie longue alors que votre objectif est une épreuve d'endurance : replanifiez-la ce week-end, en reprenant 15-20 % plus court que votre dernière sortie longue, puis reconstruisez progressivement."
  },
  {
   "id": "no_rest_day",
   "condition": "daysSinceRest > 13",
   "message": "Aucun jour de repos complet depuis 2 semaines : programmez-en un dans les 48 h. Les adaptations se produisent pendant la récupération, pas pendant l'effort."
  },
  {
   "id": "trail_dplus_deficit",
   "condition": "phase == 'specific' && weeklyDplus < 0.5 * weeklyDplusTarget && goalType == 'trail'",
   "message": "Votre D+ hebdomadaire est inférieur à 50 % de la cible pour votre course de trail : ajoutez une séance de montées (ex. 6 x 6 min en côte au seuil) et orientez la sortie longue vers un parcours vallonné. Sans jambes de montée, l'allure à plat ne suffira pas."
  },
  {
   "id": "race_ready",
   "condition": "tsb >= 5 && tsb <= 25 && daysToRace <= 7",
   "message": "Fraîcheur idéale à l'approche de la course (TSB entre +5 et +25) : ne changez rien. Gardez des rappels courts d'allure course (ex. 3 x 3 min à J-4), dormez, mangez normalement et faites confiance au travail accompli."
  },
  {
   "id": "taper_too_soft",
   "condition": "daysToRace <= 14 && pctHighIntensity7d < 5",
   "message": "Vous avez coupé toute intensité pendant l'affûtage : erreur classique qui laisse les jambes 'éteintes'. Réintroduisez 2 rappels courts (ex. 4 x 2 min allure course, récup 2 min) : on réduit le volume, jamais la qualité."
  },
  {
   "id": "ctl_declining",
   "condition": "rampCTL < -2 && daysToRace > 28 && acRatio < 1.0",
   "message": "Votre condition (CTL) baisse depuis plusieurs semaines hors période d'affûtage. Si c'est volontaire (récupération, contrainte), très bien ; sinon, restaurez d'abord la régularité : mieux vaut 4 séances modestes chaque semaine qu'une grosse semaine isolée."
  },
  {
   "id": "long_run_dependency",
   "condition": "longRunPctOfWeek > 40",
   "message": "Votre sortie longue représente plus de 40 % de votre volume hebdomadaire : le risque de blessure augmente et la semaine est déséquilibrée. Ajoutez une séance courte en semaine ou raccourcissez la sortie longue (plafond conseillé : 35 %)."
  },
  {
   "id": "post_race_recovery",
   "condition": "daysSinceRace < 7 && lastRaceDurationH >= 3",
   "message": "Course longue récente : respectez la récupération — comptez environ 1 jour facile par 10 km courus à fond (ou par heure d'ultra). Cette semaine : marche, vélo souple, natation, aucune intensité, même si les jambes semblent bien."
  },
  {
   "id": "zone2_quality_ok",
   "condition": "pctLowIntensity >= 75 && pctLowIntensity <= 88 && acRatio >= 0.8 && acRatio <= 1.3 && tsb >= -25",
   "message": "Distribution d'intensité et progression de charge exemplaires : continuez ainsi. Prochaine optimisation possible : vérifier que vos 2 séances dures hebdomadaires ciblent bien la filière prioritaire de votre objectif."
  }
 ],
 "levelGrids": {
  "vma": {
   "unit": "km/h",
   "commentFr": "VMA indicative par niveau (adultes ; à moduler selon l'âge).",
   "men": [
    {
     "level": "Débutant",
     "range": [
      11,
      14
     ]
    },
    {
     "level": "Intermédiaire",
     "range": [
      14,
      16
     ]
    },
    {
     "level": "Confirmé",
     "range": [
      16,
      18
     ]
    },
    {
     "level": "Avancé",
     "range": [
      18,
      20
     ]
    },
    {
     "level": "Élite",
     "range": [
      20,
      24
     ]
    }
   ],
   "women": [
    {
     "level": "Débutante",
     "range": [
      10,
      12.5
     ]
    },
    {
     "level": "Intermédiaire",
     "range": [
      12.5,
      14.5
     ]
    },
    {
     "level": "Confirmée",
     "range": [
      14.5,
      16.5
     ]
    },
    {
     "level": "Avancée",
     "range": [
      16.5,
      18
     ]
    },
    {
     "level": "Élite",
     "range": [
      18,
      21
     ]
    }
   ]
  },
  "marathonPace": {
   "unit": "min/km et temps final",
   "levels": [
    {
     "level": "Débutant",
     "paceMinPerKm": [
      6.4,
      7.8
     ],
     "finishTime": "4 h 30 - 5 h 30"
    },
    {
     "level": "Intermédiaire",
     "paceMinPerKm": [
      5.3,
      6.4
     ],
     "finishTime": "3 h 45 - 4 h 30"
    },
    {
     "level": "Confirmé",
     "paceMinPerKm": [
      4.6,
      5.3
     ],
     "finishTime": "3 h 15 - 3 h 45"
    },
    {
     "level": "Avancé",
     "paceMinPerKm": [
      4.0,
      4.6
     ],
     "finishTime": "2 h 50 - 3 h 15"
    },
    {
     "level": "Élite",
     "paceMinPerKm": [
      2.9,
      4.0
     ],
     "finishTime": "2 h 05 - 2 h 50"
    }
   ]
  },
  "ftpWkg": {
   "unit": "w/kg à FTP",
   "men": [
    {
     "level": "Débutant",
     "range": [
      1.5,
      2.5
     ]
    },
    {
     "level": "Intermédiaire",
     "range": [
      2.5,
      3.2
     ]
    },
    {
     "level": "Confirmé",
     "range": [
      3.2,
      3.9
     ]
    },
    {
     "level": "Avancé",
     "range": [
      3.9,
      4.7
     ]
    },
    {
     "level": "Élite",
     "range": [
      4.7,
      6.0
     ]
    }
   ],
   "women": [
    {
     "level": "Débutante",
     "range": [
      1.2,
      2.1
     ]
    },
    {
     "level": "Intermédiaire",
     "range": [
      2.1,
      2.8
     ]
    },
    {
     "level": "Confirmée",
     "range": [
      2.8,
      3.4
     ]
    },
    {
     "level": "Avancée",
     "range": [
      3.4,
      4.2
     ]
    },
    {
     "level": "Élite",
     "range": [
      4.2,
      5.5
     ]
    }
   ]
  },
  "verticalSpeed": {
   "unit": "m/h (vitesse ascensionnelle soutenable ~30-60 min en montée continue)",
   "levels": [
    {
     "level": "Débutant",
     "range": [
      400,
      600
     ]
    },
    {
     "level": "Intermédiaire",
     "range": [
      600,
      800
     ]
    },
    {
     "level": "Confirmé",
     "range": [
      800,
      1000
     ]
    },
    {
     "level": "Avancé",
     "range": [
      1000,
      1300
     ]
    },
    {
     "level": "Élite",
     "range": [
      1300,
      2000
     ]
    }
   ],
   "commentFr": "Référence : les meilleurs mondiaux dépassent 1800-2000 m/h sur kilomètre vertical. Retirer 10-15 % pour un effort d'ultra."
  }
 }
}
;
