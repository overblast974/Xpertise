// Base de connaissances nutrition d'effort — générée par l'agent nutritionniste du sport (Jeukendrup, Burke).
export const NUTRI = {
 "meta": {
  "version": "1.0.0",
  "language": "fr",
  "createdAt": "2026-07-25",
  "description": "Base de connaissances nutrition sportive pendant et autour de l'effort (course, trail, vélo). Fondée sur les consensus scientifiques : Jeukendrup (2014, oxydation des glucides multi-transportables), Burke et al. (IOC Consensus 2019), ACSM Position Stand hydratation, Thomas/Erdman/Burke (2016), pratiques World Tour, UTMB et marathon élite.",
  "disclaimer": "Recommandations générales pour athlètes en bonne santé. Ne remplace pas un avis médical ou un suivi individualisé par un(e) diététicien(ne)-nutritionniste du sport, notamment en cas de diabète, troubles digestifs chroniques ou pathologie rénale.",
  "units": {
   "carbs": "g/h (grammes de glucides par heure)",
   "fluid": "ml/h (millilitres par heure)",
   "sodium": "mg/L et mg/h",
   "caffeine": "mg/kg de poids corporel"
  }
 },
 "carbRules": {
  "principle": "L'apport en glucides pendant l'effort dépend d'abord de la DURÉE, puis de l'INTENSITÉ. Au-delà de ~60 g/h, un seul transporteur intestinal (SGLT1, glucose) sature : il faut combiner glucose + fructose (transporteur GLUT5) pour oxyder jusqu'à 90-120 g/h (Jeukendrup 2010, 2014).",
  "byDuration": [
   {
    "durationKey": "lt1h",
    "durationLabel": "< 1 h",
    "carbsPerHour": {
     "min": 0,
     "max": 30
    },
    "byIntensity": {
     "low": {
      "gPerHour": 0,
      "note": "Aucun apport nécessaire. De l'eau suffit."
     },
     "moderate": {
      "gPerHour": 0,
      "note": "Aucun apport nécessaire si l'effort dure moins d'une heure et que le dernier repas date de moins de 3-4 h."
     },
     "high": {
      "gPerHour": 20,
      "note": "Pour une compétition intense de 45-60 min (10 km, contre-la-montre) : un simple rinçage de bouche glucidique (10 s toutes les 10-15 min) ou 20-30 g suffisent — l'effet est en partie central (récepteurs buccaux)."
     }
    },
    "displayText": "Effort < 1 h : pas de glucides indispensables. En compétition intense, un rinçage de bouche avec une boisson glucidée ou 20-30 g/h maximum."
   },
   {
    "durationKey": "1to2h",
    "durationLabel": "1-2 h",
    "carbsPerHour": {
     "min": 30,
     "max": 60
    },
    "byIntensity": {
     "low": {
      "gPerHour": 30,
      "note": "30 g/h suffisent en endurance fondamentale."
     },
     "moderate": {
      "gPerHour": 45,
      "note": "40-50 g/h, glucose seul acceptable (maltodextrine, saccharose)."
     },
     "high": {
      "gPerHour": 60,
      "note": "Viser 60 g/h dès la 20e minute en compétition (semi-marathon lent, cyclosportive courte)."
     }
    },
    "displayText": "Effort 1-2 h : 30 à 60 g/h selon l'intensité. Commencer à s'alimenter dès 20-30 min, pas quand la faim arrive."
   },
   {
    "durationKey": "2to3h",
    "durationLabel": "2-3 h",
    "carbsPerHour": {
     "min": 60,
     "max": 90
    },
    "byIntensity": {
     "low": {
      "gPerHour": 60,
      "note": "60 g/h en sortie longue tranquille ; bonne occasion de tester les produits de course."
     },
     "moderate": {
      "gPerHour": 75,
      "note": "70-80 g/h avec mélange glucose:fructose obligatoire au-delà de 60 g/h."
     },
     "high": {
      "gPerHour": 90,
      "note": "90 g/h en ratio 2:1 ou 1:0.8 glucose:fructose (marathon rapide, course sur route vélo). Nécessite un intestin entraîné."
     }
    },
    "displayText": "Effort 2-3 h : 60 à 90 g/h. Au-delà de 60 g/h, mélange glucose + fructose indispensable pour éviter la saturation intestinale."
   },
   {
    "durationKey": "3hplus",
    "durationLabel": "3-6 h",
    "carbsPerHour": {
     "min": 60,
     "max": 110
    },
    "byIntensity": {
     "low": {
      "gPerHour": 60,
      "note": "60-70 g/h, possibilité d'intégrer du solide (barres, banane)."
     },
     "moderate": {
      "gPerHour": 80,
      "note": "80-90 g/h glucose:fructose. Standard actuel des cyclistes World Tour sur les étapes."
     },
     "high": {
      "gPerHour": 100,
      "note": "90-110 g/h en ratio 1:0.8, réservé aux athlètes ayant suivi un entraînement intestinal (pratique Tour de France / Kona)."
     }
    },
    "displayText": "Effort 3-6 h : 60 à 110 g/h selon intensité et tolérance. Les pros du World Tour tournent à 90-120 g/h, mais cela s'entraîne pendant des semaines."
   },
   {
    "durationKey": "ultra6hplus",
    "durationLabel": "Ultra 6 h et +",
    "carbsPerHour": {
     "min": 45,
     "max": 90
    },
    "byIntensity": {
     "low": {
      "gPerHour": 50,
      "note": "45-60 g/h : sur 20-40 h, la tolérance digestive prime sur le débit maximal. Alterner sucré/salé, liquide/solide."
     },
     "moderate": {
      "gPerHour": 70,
      "note": "60-75 g/h, standard des ultra-trails type UTMB. Prévoir de la vraie nourriture (soupe, purée, riz) aux ravitaillements."
     },
     "high": {
      "gPerHour": 80,
      "note": "75-90 g/h uniquement pour les premières heures ou les athlètes élite ; réduire si nausées, revenir au liquide."
     }
    },
    "displayText": "Ultra 6 h+ : 45 à 90 g/h. L'objectif n'est plus le maximum théorique mais le débit SOUTENABLE sur la durée : varier textures et goûts, garder un plan B liquide en cas de troubles digestifs."
   }
  ],
  "caps": {
   "glucoseOnlyMaxGPerHour": 60,
   "glucoseFructoseMaxGPerHour": 120,
   "practicalCapNote": "Plafond physiologique : ~60 g/h avec glucose seul (saturation SGLT1) ; 90 g/h bien toléré avec glucose:fructose 2:1 ; jusqu'à 120 g/h documenté en ratio 1:0.8 chez des athlètes très entraînés (Podlogar & Wallis 2022, pratiques World Tour). Au-delà : aucun bénéfice démontré, risque digestif majeur."
  },
  "glucoseFructoseRatio": {
   "standard": "2:1",
   "highIntake": "1:0.8",
   "displayText": "Ratio conseillé : 2:1 glucose:fructose jusqu'à 90 g/h. Pour viser 90-120 g/h, le ratio 1:0.8 (ex. 60 g maltodextrine + 48 g fructose) améliore l'oxydation et le confort digestif. Vérifier les étiquettes : maltodextrine + fructose ou saccharose (déjà 1:1)."
  },
  "gutTraining": {
   "displayText": "L'intestin s'entraîne comme les jambes. Pour tolérer 90 g/h et plus : 1) s'alimenter systématiquement à l'entraînement (jamais à jeun sur les séances clés) ; 2) augmenter de +10 g/h toutes les 1-2 semaines sur les sorties longues ; 3) répéter la charge cible en conditions de course (même produits, même intensité) au moins 4-6 fois ; 4) s'entraîner occasionnellement l'estomac plein. Compter 4 à 8 semaines pour passer de 60 à 90 g/h (Jeukendrup 2017, 'training the gut').",
   "progressionExample": [
    "Semaines 1-2 : 60 g/h sur les sorties > 2 h",
    "Semaines 3-4 : 70 g/h",
    "Semaines 5-6 : 80 g/h",
    "Semaines 7-8 : 90 g/h avec les produits exacts du jour de course"
   ],
   "rule": "Rien de nouveau le jour de la course : tout produit doit avoir été validé au moins 3 fois à l'entraînement à intensité de course."
  }
 },
 "hydrationRules": {
  "principle": "Boire selon la soif est insuffisant en compétition longue et par temps chaud. Objectif : limiter la perte de poids à moins de 2-3 % du poids corporel, sans jamais boire au point de prendre du poids (risque d'hyponatrémie). Le débit de sudation varie de 0,4 à 2,5 L/h selon l'individu, l'intensité et la chaleur.",
  "byTemperature": [
   {
    "tempKey": "cool",
    "tempLabel": "Frais < 15°C",
    "range": {
     "minC": null,
     "maxC": 15
    },
    "fluidMlPerHour": {
     "min": 300,
     "max": 500
    },
    "displayText": "Temps frais (< 15°C) : 300-500 ml/h suffisent. Attention, on sous-estime les pertes par temps froid ; ne pas descendre sous 300 ml/h au-delà de 2 h d'effort."
   },
   {
    "tempKey": "temperate",
    "tempLabel": "Tempéré 15-24°C",
    "range": {
     "minC": 15,
     "maxC": 24
    },
    "fluidMlPerHour": {
     "min": 400,
     "max": 700
    },
    "displayText": "Temps tempéré (15-24°C) : 400-700 ml/h, par petites gorgées de 100-150 ml toutes les 10-15 min."
   },
   {
    "tempKey": "hot",
    "tempLabel": "Chaud 25-32°C",
    "range": {
     "minC": 25,
     "maxC": 32
    },
    "fluidMlPerHour": {
     "min": 600,
     "max": 1000
    },
    "displayText": "Temps chaud (25-32°C) : 600-1000 ml/h selon votre débit de sudation. Boisson fraîche (10-15°C), sodium obligatoire au-delà de 2 h. Pré-refroidissement utile (boisson glacée, glace pilée avant le départ)."
   },
   {
    "tempKey": "veryHot",
    "tempLabel": "Très chaud > 32°C",
    "range": {
     "minC": 32,
     "maxC": null
    },
    "fluidMlPerHour": {
     "min": 750,
     "max": 1200
    },
    "displayText": "Très chaud (> 32°C) : 750-1200 ml/h — rarement plus, l'estomac vidange au maximum ~1-1,2 L/h. Sodium systématique, glace/eau sur la tête et la nuque, réduire l'allure. Au-delà, on ne compense plus : on gère la dette hydrique et on ralentit."
   }
  ],
  "sodium": {
   "mgPerLiter": {
    "min": 400,
    "max": 1000,
    "recommendedText": "400 à 800 mg de sodium par litre de boisson en conditions normales ; jusqu'à 1000-1500 mg/L pour les gros sueurs salés (traces blanches sur les vêtements) ou par forte chaleur."
   },
   "mgPerHour": {
    "min": 300,
    "max": 1000,
    "recommendedText": "En pratique : 300-600 mg de sodium par heure au-delà de 2 h d'effort ; 600-1000 mg/h par forte chaleur ou pour les athlètes à sueur très salée. 1 g de sel de table = 400 mg de sodium. Une capsule d'électrolytes typique = 200-300 mg de sodium."
   },
   "displayText": "Le sodium est le seul électrolyte critique pendant l'effort. Repères : 400-800 mg/L de boisson, soit 300-600 mg/h (jusqu'à 1000 mg/h par forte chaleur). Le potassium, magnésium et calcium des boissons n'ont pas d'effet démontré pendant l'effort."
  },
  "dehydrationSigns": {
   "displayText": "Signes de déshydratation : soif intense, bouche sèche, urines rares et foncées, chute de performance et fréquence cardiaque anormalement haute pour l'allure (dérive cardiaque), maux de tête, vertiges, crampes, frissons paradoxaux par temps chaud. Perte > 2 % du poids = performance dégradée ; > 4 % = risque médical, ralentir et se réhydrater.",
   "list": [
    "Soif marquée, bouche et lèvres sèches",
    "Urines foncées ou absence d'envie d'uriner sur plusieurs heures",
    "Fréquence cardiaque élevée pour une allure habituelle (dérive cardiaque)",
    "Maux de tête, irritabilité, baisse de lucidité",
    "Crampes, chair de poule ou frissons par temps chaud (signe d'alerte grave : arrêt et refroidissement)"
   ]
  },
  "hyponatremiaSigns": {
   "displayText": "Signes d'hyponatrémie (sodium sanguin trop bas, souvent causée par un EXCÈS d'eau pure sur les efforts > 4 h) : prise de poids en course, mains/doigts/chevilles gonflés (bagues serrées), nausées et vomissements, maux de tête, confusion, ballonnements, urines claires et abondantes malgré la fatigue. C'est une urgence : NE PAS donner d'eau pure, donner du salé, consulter le poste médical. Prévention : ne jamais boire plus que ses pertes, saler ses apports au-delà de 3-4 h.",
   "list": [
    "Prise de poids pendant la course (le signe le plus fiable)",
    "Gonflement des mains, doigts, chevilles ; bague ou montre qui serre",
    "Nausées, vomissements, ballonnements malgré une bonne hydratation",
    "Maux de tête, confusion, désorientation (urgence médicale)",
    "Avoir bu de grandes quantités d'eau pure sans sodium sur plus de 4 h"
   ]
  },
  "weighingStrategy": {
   "displayText": "Mesurez VOTRE débit de sudation : pesez-vous nu(e) avant et après une sortie d'1 h à intensité et température représentatives, sans uriner entre les deux. Débit de sudation (L/h) = (poids avant − poids après + boisson bue en kg) ÷ durée en heures. Exemple : 70,0 kg avant, 69,2 kg après, 0,5 L bu en 1 h → 0,8 + 0,5 = 1,3 L/h. En course, visez 60-80 % de ce volume. Répétez le test par temps frais et par temps chaud pour construire votre profil.",
   "formula": "sweatRateLPerHour = (weightBeforeKg - weightAfterKg + fluidIntakeKg) / durationHours",
   "targetReplacementPercent": {
    "min": 60,
    "max": 80
   },
   "maxWeightLossPercent": 2
  }
 },
 "productEquivalents": {
  "displayText": "Table d'équivalences pour composer un plan : chaque unité ci-dessous apporte les glucides indiqués. Exemple pour 90 g/h : 2 gels + 500 ml de boisson iso (2×25 + 40 = 90 g).",
  "items": [
   {
    "id": "gel",
    "label": "Gel énergétique",
    "unit": "1 gel (~30-40 g de produit)",
    "carbsG": 25,
    "carbsRange": {
     "min": 20,
     "max": 30
    },
    "notes": "À prendre avec 100-150 ml d'eau (sauf gels isotoniques). Vérifier la composition glucose:fructose.",
    "sodiumMg": 20,
    "caffeineNote": "Existe en version caféinée (25-100 mg)."
   },
   {
    "id": "banana",
    "label": "Banane",
    "unit": "1 banane moyenne (~120 g)",
    "carbsG": 25,
    "carbsRange": {
     "min": 20,
     "max": 30
    },
    "notes": "Bien mûre pour la digestibilité. Pratique en vélo et aux ravitaillements trail, moins en courant.",
    "sodiumMg": 1
   },
   {
    "id": "fruitPaste",
    "label": "Pâte de fruits",
    "unit": "1 pâte de fruits (~20 g)",
    "carbsG": 15,
    "carbsRange": {
     "min": 12,
     "max": 18
    },
    "notes": "Naturellement riche en fructose : bon complément d'une boisson à base de maltodextrine.",
    "sodiumMg": 5
   },
   {
    "id": "isoDrink",
    "label": "Boisson isotonique 500 ml",
    "unit": "1 bidon de 500 ml dosé à 6-8 %",
    "carbsG": 35,
    "carbsRange": {
     "min": 30,
     "max": 40
    },
    "notes": "Hydrate ET nourrit. Concentration idéale 6-8 g/100 ml ; au-delà, la vidange gastrique ralentit.",
    "sodiumMg": 300
   },
   {
    "id": "bar",
    "label": "Barre énergétique",
    "unit": "1 barre (~30-50 g)",
    "carbsG": 30,
    "carbsRange": {
     "min": 20,
     "max": 40
    },
    "notes": "Réserver aux intensités basses (vélo, marche en côte en trail) : la mastication et les lipides/fibres ralentissent la digestion à haute intensité.",
    "sodiumMg": 50
   },
   {
    "id": "puree",
    "label": "Purée / compote énergétique",
    "unit": "1 gourde (~65-90 g)",
    "carbsG": 25,
    "carbsRange": {
     "min": 20,
     "max": 30
    },
    "notes": "Texture intermédiaire gel/solide, souvent mieux tolérée sur ultra. Compote de fruits classique : ~12-15 g par gourde de 90 g.",
    "sodiumMg": 10
   },
   {
    "id": "cola",
    "label": "Coca / cola",
    "unit": "1 verre de 240 ml (dégazé)",
    "carbsG": 25,
    "carbsRange": {
     "min": 24,
     "max": 27
    },
    "notes": "~10,6 g/100 ml + ~25 mg de caféine par 240 ml. Classique de la 2e moitié d'ultra : effet caféine + sucre + moral. À dégazer si possible.",
    "sodiumMg": 10,
    "caffeineMg": 25
   },
   {
    "id": "gummies",
    "label": "Gommes / chews énergétiques",
    "unit": "1 sachet (5-6 pièces)",
    "carbsG": 40,
    "carbsRange": {
     "min": 30,
     "max": 45
    },
    "notes": "Fractionnables : 1 gomme = 7-8 g, pratique pour lisser l'apport toutes les 10-15 min.",
    "sodiumMg": 60
   },
   {
    "id": "driedFruit",
    "label": "Fruits secs (dattes, abricots)",
    "unit": "3 dattes (~40 g)",
    "carbsG": 27,
    "carbsRange": {
     "min": 25,
     "max": 30
    },
    "notes": "Alternative naturelle riche en fructose et glucose. Attention aux fibres au-delà de quelques unités.",
    "sodiumMg": 2
   },
   {
    "id": "riceCake",
    "label": "Rice cake maison (façon World Tour)",
    "unit": "1 portion (~60 g)",
    "carbsG": 25,
    "carbsRange": {
     "min": 20,
     "max": 30
    },
    "notes": "Riz rond cuit sucré/salé — le classique des musettes pros, idéal sur vélo aux intensités basses.",
    "sodiumMg": 100
   },
   {
    "id": "brothSoup",
    "label": "Soupe / bouillon salé",
    "unit": "1 bol de 250 ml",
    "carbsG": 10,
    "carbsRange": {
     "min": 5,
     "max": 15
    },
    "notes": "Peu de glucides mais 600-900 mg de sodium par bol : précieux la nuit en ultra et par temps froid, casse l'écœurement du sucré.",
    "sodiumMg": 750
   }
  ],
  "planningNote": "Composer chaque heure comme une somme : ex. 60 g/h = 1 bidon iso (35 g) + 1 gel (25 g) ; 90 g/h = 1 bidon iso (35 g) + 2 gels (50 g) ou 1 bidon + 1 gel + 1 pâte de fruits + 1/2 sachet de gommes."
 },
 "timingTemplates": [
  {
   "key": "shortLt1h",
   "label": "Sortie < 1 h",
   "sports": [
    "running",
    "trail",
    "cycling"
   ],
   "before": "Repas normal 2-3 h avant, ou collation légère (banane, pain-miel, ~30-50 g de glucides) 1 h avant si séance intense. Hydratation : 300-500 ml dans les 2 h précédentes.",
   "during": "Eau uniquement (quelques gorgées si besoin). Si compétition intense : rinçage de bouche glucidique toutes les 10-15 min.",
   "after": "Repas normal dans les 2 h. Pas de produit de récupération nécessaire sauf si nouvelle séance < 8 h plus tard.",
   "timeline": [
    {
     "time": "H-2h",
     "action": "Dernier repas complet, riche en glucides, pauvre en fibres et en graisses"
    },
    {
     "time": "H-15min",
     "action": "150-300 ml d'eau"
    },
    {
     "time": "Pendant",
     "action": "Eau à la soif ; rien d'autre nécessaire"
    },
    {
     "time": "H+2h max",
     "action": "Repas normal"
    }
   ]
  },
  {
   "key": "medium1to2h",
   "label": "Sortie 1-2 h",
   "sports": [
    "running",
    "trail",
    "cycling"
   ],
   "before": "Repas 2-3 h avant (1-2 g/kg de glucides). Si séance matinale à jeun impossible : 30-60 g de glucides faciles 30-60 min avant (compote, pain blanc-miel).",
   "during": "30-60 g/h selon l'intensité, en commençant à la 20-30e minute : 1 bidon de boisson iso (35 g) par heure, complété par 1 gel ou 1 pâte de fruits si intensité élevée. 400-700 ml/h de liquide.",
   "after": "Si séance dure ou 2e séance prévue : 1 g/kg de glucides + 20-25 g de protéines dans l'heure (ex. 500 ml de lait chocolaté + 1 banane). Sinon repas normal dans les 2 h.",
   "timeline": [
    {
     "time": "H-3h à H-2h",
     "action": "Repas riche en glucides (1-2 g/kg), ex. riz/pâtes + protéine maigre"
    },
    {
     "time": "H-30min",
     "action": "200-300 ml d'eau ou de boisson iso"
    },
    {
     "time": "Toutes les 15min dès la 20e min",
     "action": "2-3 gorgées de boisson iso (100-150 ml)"
    },
    {
     "time": "Toutes les 30-40min (si intense)",
     "action": "1/2 à 1 gel avec de l'eau"
    },
    {
     "time": "H+30min à H+1h",
     "action": "Collation récup si séance exigeante : 20-25 g protéines + 50-80 g glucides"
    }
   ]
  },
  {
   "key": "long2to4h",
   "label": "Sortie longue 2-4 h",
   "sports": [
    "running",
    "trail",
    "cycling"
   ],
   "before": "J-1 : dîner riche en glucides. Jour J : repas 3 h avant, 2 g/kg de glucides, pauvre en fibres. 500 ml de boisson dans les 2 h avant le départ.",
   "during": "60-90 g/h dès la première heure (mélange glucose:fructose au-delà de 60 g/h). Exemple type 75 g/h : chaque heure = 1 bidon iso 500 ml (35 g) + 1 gel (25 g) + 1 pâte de fruits (15 g). Liquide : 400-750 ml/h selon la température ; sodium 300-500 mg/h au-delà de 2 h. C'est LA séance pour pratiquer l'entraînement intestinal.",
   "after": "Fenêtre de 30-60 min : 1-1,2 g/kg de glucides + 20-30 g de protéines (ex. pour 70 kg : bol de riz au lait + fromage blanc + miel, ou boisson de récup + sandwich). Réhydratation : 150 % du poids perdu en 4-6 h.",
   "timeline": [
    {
     "time": "H-3h",
     "action": "Repas : 2 g/kg de glucides (ex. 70 kg → 140 g : grand bol de riz + pain + compote + jus)"
    },
    {
     "time": "H-1h à H",
     "action": "300-500 ml de boisson, éventuellement 1 gel 5 min avant si départ rapide"
    },
    {
     "time": "Toutes les 15min",
     "action": "100-150 ml de boisson iso"
    },
    {
     "time": "Toutes les 25-30min",
     "action": "1 unité solide/gel en alternance : gel, pâte de fruits, 1/2 barre (vélo)"
    },
    {
     "time": "H+30min",
     "action": "Récup : 70-90 g de glucides + 25 g de protéines + 500-750 ml de liquide avec sodium"
    }
   ]
  },
  {
   "key": "marathon",
   "label": "Marathon",
   "sports": [
    "running"
   ],
   "before": "J-3 à J-1 : charge glucidique 8-12 g/kg/j (voir racedayRules). Jour J : petit-déjeuner 3 h avant, 2-3 g/kg de glucides pauvres en fibres (voir racedayRules.breakfast). H-15 min : 1 gel ou 200 ml de boisson iso.",
   "during": "Objectif 60-90 g/h selon entraînement intestinal (élites : 90+ g/h). Plan type 75 g/h pour 3h30 de course : 1 gel (25 g) toutes les 20 min OU 1 gel toutes les 25 min + boisson iso aux ravitaillements. Boire 400-600 ml/h par gorgées à chaque ravitaillement (tous les 5 km). Caféine : 3 mg/kg 45 min avant le départ, puis 1 mg/kg (gel caféiné) vers le 25-30e km.",
   "after": "Dès l'arrivée : 500 ml de boisson de récup ou lait chocolaté + banane. Puis 1-1,2 g/kg/h de glucides pendant 4 h + 25-30 g de protéines toutes les 3-4 h. Réhydratation 150 % des pertes avec sodium.",
   "timeline": [
    {
     "time": "H-3h",
     "action": "Petit-déjeuner : 2-3 g/kg de glucides (ex. 70 kg → 150-200 g)"
    },
    {
     "time": "H-45min",
     "action": "Caféine 3 mg/kg (200 mg pour 70 kg) si habitué"
    },
    {
     "time": "H-15min",
     "action": "1 gel ou 200 ml de boisson iso"
    },
    {
     "time": "km 5, puis tous les 5 km",
     "action": "Boire 100-200 ml ; 1 gel toutes les 20-25 min (à prendre juste avant un ravito pour boire avec)"
    },
    {
     "time": "km 25-30",
     "action": "1 gel caféiné (50-100 mg)"
    },
    {
     "time": "Arrivée +30min",
     "action": "500 ml boisson récup + 80-100 g glucides + 25-30 g protéines dans l'heure"
    }
   ]
  },
  {
   "key": "trailLong4to8h",
   "label": "Trail long 4-8 h",
   "sports": [
    "trail"
   ],
   "before": "J-2/J-1 : 8-10 g/kg/j de glucides, hydratation régulière. Jour J : petit-déjeuner 3 h avant (2 g/kg), digeste et testé. Vérifier le plan ravitos de la course.",
   "during": "60-80 g/h : alterner liquide (flasques de boisson iso ou mix maison maltodextrine+fructose), gels, purées et solide dans les montées marchées. Sodium 400-600 mg/h (capsules ou boisson). Utiliser les ravitos : coca dégazé, soupe, fruits — mais l'essentiel du plan doit être porté sur soi. Boire 500-800 ml/h (flasques 500 ml x2 entre chaque ravito).",
   "after": "30-60 min après l'arrivée : 1 g/kg de glucides + 25-30 g de protéines, puis vrai repas dans les 2-3 h. Réhydratation 150 % des pertes, saler les plats.",
   "timeline": [
    {
     "time": "H-3h",
     "action": "Petit-déjeuner testé : 2 g/kg de glucides (riz, pain blanc, miel, compote)"
    },
    {
     "time": "H-10min",
     "action": "1 gel ou quelques gorgées de boisson"
    },
    {
     "time": "Toutes les 15min",
     "action": "3-4 gorgées de flasque (100-150 ml)"
    },
    {
     "time": "Toutes les 30min",
     "action": "20-30 g de glucides : 1 gel OU 1 purée OU 1/2 barre en montée marchée"
    },
    {
     "time": "À chaque ravito",
     "action": "Remplir les flasques, 1 verre de coca dégazé, 1-2 morceaux salés (TUC, fromage) si envie"
    },
    {
     "time": "Toutes les heures",
     "action": "Check sodium : 1 capsule (250-300 mg) si chaleur ou sueur salée"
    },
    {
     "time": "Arrivée +45min",
     "action": "Récup : 70-90 g glucides + 25-30 g protéines + 600-900 ml liquide salé"
    }
   ]
  },
  {
   "key": "ultra8hplus",
   "label": "Ultra 8 h et + (100 km, 100 miles)",
   "sports": [
    "trail",
    "running",
    "cycling"
   ],
   "before": "J-3 à J-1 : 8-10 g/kg/j. Nuit courte probable : le dîner de la veille est le vrai dernier repas — riche en glucides, testé. Petit-déjeuner 2-3 h avant le départ (souvent nocturne) : 1,5-2 g/kg, digeste.",
   "during": "Cible 50-75 g/h SOUTENABLE. Règle des ultras : manger tôt, manger souvent, avant d'avoir faim — dès la 1re heure, toutes les 20-30 min. Alterner sucré/salé toutes les 2-3 h pour éviter l'écœurement : gels et boisson en courant, purée-soupe-riz-sandwich aux bases vie. La nuit : soupe chaude + coca (caféine 1-2 mg/kg par prise, total < 6 mg/kg/24h). Sodium 400-800 mg/h selon chaleur. En cas de nausées : ralentir 10 min, passer au 100 % liquide (coca dégazé, boisson diluée), gingembre ; reprendre le solide quand ça passe. Toujours avoir 2 h d'avance de nutrition sur soi.",
   "after": "Récup étalée : petites portions toutes les heures (l'appétit revient lentement) — viser 1 g/kg de glucides + 20-25 g de protéines dans les 2 h puis repas complets. Réhydratation 150 % sur 24 h, bouillons salés. Le sommeil est le premier outil de récupération.",
   "timeline": [
    {
     "time": "H-2h30",
     "action": "Petit-déjeuner : 1,5-2 g/kg (porridge riz/avoine, pain-miel, boisson)"
    },
    {
     "time": "Dès H+20min puis toutes les 20-30min",
     "action": "20-30 g de glucides (gel, gommes, purée, gorgées de boisson énergétique)"
    },
    {
     "time": "Toutes les 15min",
     "action": "Boire 100-150 ml (500-750 ml/h, plus si chaud)"
    },
    {
     "time": "Toutes les heures",
     "action": "250-400 mg de sodium (capsule ou boisson), doubler si forte chaleur"
    },
    {
     "time": "Bases vie (toutes les 2-4 h)",
     "action": "Vraie nourriture : soupe + riz/pâtes/purée salée, sandwich, 5-10 min assis maximum"
    },
    {
     "time": "Nuit",
     "action": "Coca ou gel caféiné 50-100 mg toutes les 2-3 h ; soupe chaude aux ravitos"
    },
    {
     "time": "Arrivée",
     "action": "Boisson récup + petites portions répétées ; bouillon salé ; 150 % des pertes hydriques sur 24 h"
    }
   ]
  },
  {
   "key": "cyclo3to5h",
   "label": "Cyclo / sortie vélo 3-5 h",
   "sports": [
    "cycling"
   ],
   "before": "J-1 : dîner riche en glucides (3-4 g/kg au dîner). Jour J : repas 2h30-3 h avant, 2 g/kg (pain, riz, porridge). Poches remplies avant le départ : 2 bidons + de quoi tenir 3 h minimum.",
   "during": "Le vélo tolère mieux le solide que la course : viser 80-100 g/h si allure soutenue (60-70 g/h en tranquille). Première moitié : solide (rice cakes, barres, bananes, sandwich) ; seconde moitié : gels et boisson (plus rapides à absorber quand l'intensité monte). 1 bidon (500-750 ml) par heure, 500-800 mg sodium/L par temps chaud. Manger toutes les 20 min sans attendre la faim — la fringale à vélo se joue 1 h avant qu'elle arrive.",
   "after": "Dans l'heure : 1-1,2 g/kg de glucides + 20-30 g de protéines (ex. 75 kg : grand bol de pâtes ou riz + œufs/poulet, ou boisson récup + sandwich). Réhydratation 150 % des pertes.",
   "timeline": [
    {
     "time": "H-3h",
     "action": "Repas 2 g/kg de glucides, café si habitué"
    },
    {
     "time": "H0-H2h30",
     "action": "1 solide toutes les 20-25 min (rice cake, 1/2 barre, banane) + bidon iso"
    },
    {
     "time": "H2h30-fin",
     "action": "Passer aux gels/gommes + boisson : 1 gel toutes les 20-30 min"
    },
    {
     "time": "Toutes les heures",
     "action": "1 bidon minimum (500-750 ml) ; 2 bidons par forte chaleur"
    },
    {
     "time": "H+30-60min",
     "action": "Récup : 80-90 g glucides + 25 g protéines + 500-750 ml"
    }
   ]
  }
 ],
 "caffeine": {
  "dosageMgPerKg": {
   "min": 3,
   "max": 6,
   "effective": "3-6 mg/kg améliore la performance d'endurance de 2-4 % (méta-analyses). 3 mg/kg suffit ; au-delà de 6 mg/kg : plus d'effets secondaires sans gain supplémentaire."
  },
  "lowDoseNote": "Des doses faibles (1-2 mg/kg, soit 70-150 mg) prises tard dans l'effort sont efficaces, surtout combinées aux glucides (gel caféiné, coca).",
  "timing": {
   "preRace": "3 mg/kg, 45-60 min avant le départ (pic plasmatique à ~60 min).",
   "duringLong": "Sur efforts > 2h30 : redose de 1-1,5 mg/kg toutes les 2-3 h, ou dose unique de 1,5-2 mg/kg au moment critique (dernier tiers : km 30 du marathon, dernière montée du trail).",
   "displayText": "Timing : 3 mg/kg 45-60 min avant le départ, puis 1-1,5 mg/kg dans le dernier tiers de course. En ultra avec nuit : petites doses régulières (50-100 mg toutes les 2-3 h) plutôt qu'une grosse dose."
  },
  "formats": [
   {
    "format": "Café expresso",
    "caffeineMg": "60-80 mg par tasse",
    "note": "Dose variable selon la préparation ; pratique avant course, pas pendant."
   },
   {
    "format": "Gel caféiné",
    "caffeineMg": "25-100 mg par gel",
    "note": "Le plus pratique pendant l'effort ; vérifier le dosage exact du produit."
   },
   {
    "format": "Coca (240 ml)",
    "caffeineMg": "~25 mg",
    "note": "Caféine + 25 g de glucides : le combo classique de fin de course et d'ultra."
   },
   {
    "format": "Comprimé / gomme à mâcher",
    "caffeineMg": "50-200 mg",
    "note": "Dosage précis ; les gommes agissent plus vite (absorption buccale, ~10-15 min)."
   }
  ],
  "capMgPerDay": 400,
  "capNote": "Plafond : ne pas dépasser ~6 mg/kg par 24 h en contexte sportif (soit ~400 mg pour 70 kg).",
  "warning": "Mise en garde : testez toujours la caféine à l'entraînement — la sensibilité est très individuelle (variantes du gène CYP1A2). Effets secondaires possibles : tachycardie, anxiété, troubles digestifs, insomnie (demi-vie 4-6 h : attention aux courses l'après-midi et au sommeil post-course, crucial en récupération). Déconseillée en cas de trouble cardiaque ou d'hypertension non contrôlée. Éviter chez les non-consommateurs le jour d'une course sans test préalable. Ne pas cumuler sans compter : café du matin + gels caféinés + coca s'additionnent."
 },
 "racedayRules": {
  "carbLoad": {
   "jMinus3ToJMinus1": {
    "gPerKgPerDay": {
     "min": 8,
     "max": 12
    },
    "displayText": "J-3 à J-1 pour un effort > 90 min : 8-12 g/kg/jour de glucides (ex. 70 kg → 560-840 g/jour). Pas besoin de phase de déplétion préalable. En pratique : augmenter riz, pâtes, pain, pommes de terre, jus, compotes, et RÉDUIRE fibres, crudités et graisses pour limiter le volume digestif. L'entraînement étant réduit (taper), le poids peut monter de 1-2 kg (eau stockée avec le glycogène : ~3 g d'eau par g de glycogène) — c'est normal et souhaitable.",
    "practicalExample": "Exemple J-1 pour 70 kg (~600 g de glucides) : petit-déj : porridge + banane + jus + pain-miel (150 g) ; collation : compote + gâteau de riz (60 g) ; déjeuner : grande assiette de riz + pain + dessert sucré (180 g) ; collation : jus + pâte de fruits (60 g) ; dîner : pâtes + pain + compote (150 g)."
   },
   "shorterEvents": "Pour un effort < 90 min : une seule journée à 7-8 g/kg la veille suffit."
  },
  "breakfast": {
   "when": "3 à 4 h avant le départ (jamais moins de 2 h pour un repas complet).",
   "what": "1-4 g/kg de glucides selon la tolérance et le délai — standard : 2-3 g/kg à H-3. Pauvre en fibres, en graisses et en protéines. Aliments types : pain blanc + miel/confiture, riz, semoule, porridge de flocons d'avoine ou crème de riz, banane mûre, compote, jus filtré, boisson glucidique.",
   "quantityExample": "Exemple pour 70 kg à H-3 (≈150-200 g de glucides) : 100 g de riz ou crème de riz (cuit sucré) + 60 g de pain blanc + 30 g de miel + 1 banane + 300 ml de jus. Version estomac sensible : porridge liquide + compotes + boisson glucidique.",
   "lastHour": "H-60 à H-15 min : 300-500 ml de boisson glucidée à siroter ; option 1 gel 5-15 min avant le départ (il sera utilisé dès les premières minutes, pas de risque d'hypoglycémie réactionnelle une fois l'effort lancé).",
   "displayText": "Petit-déjeuner d'avant course : 2-3 g/kg de glucides, 3 h avant le départ, pauvre en fibres et en graisses, 100 % testé à l'entraînement. Compléter par 300-500 ml de boisson dans la dernière heure et éventuellement 1 gel juste avant le départ."
  },
  "classicMistakes": [
   "Tester un nouveau produit, un nouveau petit-déjeuner ou de nouvelles chaussures le jour J — la règle d'or : rien de nouveau le jour de la course.",
   "Charge glucidique transformée en gavage : on augmente les glucides, pas les quantités totales — trop de fibres et de graisses J-1 = troubles digestifs garantis.",
   "Partir sur les ravitos de l'organisation sans les avoir vérifiés (marques, parfums, concentration inconnus) : porter sa propre nutrition.",
   "Attendre d'avoir faim ou soif pour s'alimenter : à ce stade le déficit est déjà installé. Manger dès la 20-30e minute, boire toutes les 10-15 min.",
   "Sauter le petit-déjeuner par stress ou départ matinal : au minimum une version liquide (boisson glucidique + compote) reste possible jusqu'à H-1h30.",
   "Boire des litres d'eau pure la veille et le matin 'pour faire des réserves' : on ne stocke pas l'eau ; risque de dilution du sodium. Boire normalement, saler les repas, urines jaune pâle = bon repère.",
   "S'élancer trop vite après le dernier gel pré-course, puis oublier de s'alimenter pendant la première heure d'euphorie.",
   "Doubler les doses de caféine le jour J sans jamais l'avoir testée à l'entraînement."
  ]
 },
 "adviceRules": [
  {
   "id": "R01",
   "condition": "duration_h < 1",
   "message": "Effort court (< 1 h) : de l'eau suffit. Pas besoin de gels ni de boisson énergétique — gardez-les pour les sorties longues."
  },
  {
   "id": "R02",
   "condition": "duration_h < 1 && intensity == 'high'",
   "message": "Compétition intense < 1 h : un rinçage de bouche avec une boisson glucidée toutes les 10-15 min (ou 20-30 g/h) peut faire gagner quelques secondes. Rien de plus n'est utile."
  },
  {
   "id": "R03",
   "condition": "duration_h >= 1 && duration_h < 2",
   "message": "Sortie de 1 à 2 h : visez 30-60 g de glucides/h selon l'intensité. Exemple simple : 1 bidon de 500 ml de boisson iso (35 g) + 1 gel (25 g) par heure si vous poussez."
  },
  {
   "id": "R04",
   "condition": "duration_h >= 2 && duration_h < 3",
   "message": "Sortie de 2 à 3 h : visez 60-90 g/h. Au-delà de 60 g/h, choisissez impérativement des produits mélangeant glucose (maltodextrine) et fructose — sinon l'intestin sature et les troubles digestifs arrivent."
  },
  {
   "id": "R05",
   "condition": "duration_h >= 3 && duration_h < 6",
   "message": "Effort de 3 à 6 h : 60-90 g/h (jusqu'à 100-110 g/h si intestin entraîné), ratio glucose:fructose 2:1 à 1:0.8. Commencez à manger dès la 1re heure, toutes les 20-30 min, sans jamais attendre la faim."
  },
  {
   "id": "R06",
   "condition": "duration_h >= 6",
   "message": "Ultra (6 h+) : visez 45-75 g/h SOUTENABLES plutôt qu'un maximum théorique. Alternez sucré/salé et liquide/solide toutes les 2-3 h ; gardez un plan B 100 % liquide (coca dégazé, boisson diluée) en cas de nausées."
  },
  {
   "id": "R07",
   "condition": "temperature_c > 25",
   "message": "Chaleur (> 25°C) : montez à 600-1000 ml/h de boisson avec 500-800 mg de sodium par litre. Boisson fraîche si possible, gorgées toutes les 10 min, et réduisez l'allure : par chaleur, la performance se gère, elle ne se force pas."
  },
  {
   "id": "R08",
   "condition": "temperature_c > 32",
   "message": "Chaleur extrême (> 32°C) : 750-1200 ml/h maximum (l'estomac ne vidange guère plus), sodium 600-1000 mg/h, glace/eau sur la nuque aux ravitos. Frissons ou chair de poule par temps chaud = signal d'alerte : arrêtez-vous et refroidissez-vous."
  },
  {
   "id": "R09",
   "condition": "temperature_c < 15 && duration_h >= 2",
   "message": "Temps frais : la soif est trompeuse, mais vous transpirez quand même. Maintenez au moins 300-500 ml/h et vos glucides habituels — les fringales par temps froid sont classiques car on oublie de manger."
  },
  {
   "id": "R10",
   "condition": "duration_h >= 2 && sodium_intake_planned == false",
   "message": "Au-delà de 2 h d'effort, ajoutez du sodium : 300-600 mg/h (boisson à 400-800 mg/L ou 1 capsule d'électrolytes par heure). Indispensable par chaleur ou si vos vêtements sèchent avec des traces blanches."
  },
  {
   "id": "R11",
   "condition": "duration_h >= 4 && drinking_plain_water_only == true",
   "message": "Attention hyponatrémie : plus de 4 h en ne buvant que de l'eau pure est dangereux. Ajoutez systématiquement du sodium (400-800 mg/L) et ne buvez jamais au point de prendre du poids. Mains gonflées + nausées + confusion = poste médical immédiatement."
  },
  {
   "id": "R12",
   "condition": "sport == 'running' && intensity == 'high'",
   "message": "En course à pied intense, privilégiez liquide et gels (pris avec de l'eau) : les secousses rendent le solide difficile à digérer. Prenez le gel juste avant un ravitaillement pour boire par-dessus."
  },
  {
   "id": "R13",
   "condition": "sport == 'cycling' && duration_h >= 3",
   "message": "À vélo, profitez de la position pour manger du solide (rice cakes, barres, bananes) en première moitié de sortie, puis passez aux gels et à la boisson quand l'intensité monte en fin de parcours. 1 bidon/h minimum."
  },
  {
   "id": "R14",
   "condition": "sport == 'trail' && duration_h >= 4",
   "message": "Trail long : mangez le solide dans les montées marchées (le cœur redescend, la digestion passe mieux) et le liquide/gels sur le plat et les descentes. Portez l'essentiel de votre plan : ne dépendez jamais des ravitos."
  },
  {
   "id": "R15",
   "condition": "target_carbs_g_per_h >= 90 && gut_training_done == false",
   "message": "Objectif 90 g/h et plus : votre intestin doit y être préparé. Progressez de +10 g/h toutes les 1-2 semaines sur vos sorties longues pendant 4-8 semaines, avec les produits exacts du jour J. Sans cet entraînement, restez à 60-70 g/h."
  },
  {
   "id": "R16",
   "condition": "event_duration_h >= 1.5 && days_to_event <= 3",
   "message": "J-3 à J-1 avant une course > 90 min : charge glucidique 8-12 g/kg/jour (ex. 70 kg → 560-840 g/j) : plus de riz, pâtes, pain, jus, compotes ; moins de fibres, crudités et graisses. Prendre 1-2 kg d'eau avec le glycogène est normal."
  },
  {
   "id": "R17",
   "condition": "is_race_day == true",
   "message": "Jour J : petit-déjeuner 3 h avant le départ, 2-3 g/kg de glucides pauvres en fibres (ex. 70 kg → 150-200 g : riz/porridge + pain-miel + banane + jus). Puis 300-500 ml de boisson dans la dernière heure et option 1 gel à H-10 min. Rien de nouveau aujourd'hui."
  },
  {
   "id": "R18",
   "condition": "duration_h >= 2.5 && caffeine_user == true",
   "message": "Caféine : 3 mg/kg 45-60 min avant le départ (200 mg pour 70 kg), puis 1-1,5 mg/kg dans le dernier tiers (gel caféiné ou coca). Plafond ~6 mg/kg/24 h. Uniquement si testée à l'entraînement."
  },
  {
   "id": "R19",
   "condition": "post_exercise == true && duration_h >= 2",
   "message": "Récupération : dans les 30-60 min, 1-1,2 g/kg de glucides + 20-30 g de protéines (ex. 70 kg : boisson récup ou lait chocolaté 500 ml + sandwich + banane). Buvez 150 % du poids perdu en 4-6 h, avec du sodium (soupe, eau + repas salé)."
  },
  {
   "id": "R20",
   "condition": "gi_distress == true",
   "message": "Troubles digestifs en course : réduisez l'intensité 10 min, passez au 100 % liquide et frais (coca dégazé, boisson diluée de moitié), petites gorgées fréquentes. Reprenez les gels progressivement quand les nausées passent. La cause classique : boisson trop concentrée ou dépassement de votre débit entraîné."
  },
  {
   "id": "R21",
   "condition": "morning_session == true && duration_h < 1.5 && intensity == 'low'",
   "message": "Séance courte et facile à jeun le matin : possible et sans danger — emportez quand même un gel de secours. Ne faites JAMAIS à jeun les séances longues ou intenses : qualité dégradée et adaptation intestinale sacrifiée."
  },
  {
   "id": "R22",
   "condition": "duration_h >= 8 && is_night == true",
   "message": "Ultra de nuit : la somnolence se combat avec 50-100 mg de caféine toutes les 2-3 h (coca, gel caféiné) et du chaud salé aux ravitos (soupe + bouillon = sodium + moral). L'écœurement du sucré la nuit est normal : basculez sur salé et liquide."
  }
 ],
 "recovery": {
  "window": {
   "displayText": "La fenêtre 30-60 min post-effort accélère la resynthèse du glycogène (elle est maximale les 2 premières heures). Elle est CRITIQUE si vous ré-enchaînez dans les 24 h (course à étapes, bloc d'entraînement) ; sinon, l'essentiel est d'atteindre vos totaux sur 24 h. Ne pas sauter le premier apport même sans appétit : commencer par du liquide.",
   "criticalIfNextSessionWithinH": 24
  },
  "carbs": {
   "gPerKgPerHour": {
    "min": 1.0,
    "max": 1.2
   },
   "durationHours": 4,
   "displayText": "Glucides : 1-1,2 g/kg par heure pendant les 4 premières heures après un effort long ou intense (ex. 70 kg → 70-85 g/h), en privilégiant des glucides à index glycémique élevé (riz blanc, pain, banane mûre, boisson de récupération, jus). Ensuite, retour à une alimentation normale riche en glucides."
  },
  "protein": {
   "gramsPerIntake": {
    "min": 20,
    "max": 30
   },
   "gPerKgReference": 0.3,
   "displayText": "Protéines : 20-30 g (≈0,3 g/kg) de protéines de bonne qualité dès la fin de l'effort, puis toutes les 3-4 h (y compris ~30-40 g au coucher, idéalement caséine, après un effort très dur). Sources : lait/fromage blanc, yaourt grec, œufs, poulet, poisson, whey."
  },
  "rehydration": {
   "percentOfLosses": 150,
   "displayText": "Réhydratation : boire 150 % du poids perdu, étalé sur 4-6 h (ex. 1 kg perdu → 1,5 L). Toujours AVEC du sodium (boisson de récup, soupe, repas salé), sinon l'eau est éliminée sans réhydrater. Contrôle simple : urines jaune pâle avant le coucher.",
   "example": "Exemple : pesée avant 70,0 kg, après 68,6 kg → 1,4 kg perdu → boire ~2,1 L sur l'après-midi, dont une soupe ou un bouillon salé."
  },
  "practicalExamples": [
   "Dans les 30 min (70 kg) : 500 ml de lait chocolaté + 1 banane + 1 barre de céréales ≈ 80 g de glucides + 20 g de protéines.",
   "Version boisson : 1 boisson de récupération (30 g glucides + 20 g protéines) + 1 grande compote + 500 ml d'eau + 1 pincée de sel.",
   "Repas H+2 : grande assiette de riz ou pâtes (150-200 g cuits secs équivalent 100-140 g de glucides) + 150 g de poulet/poisson/œufs + légumes cuits + pain + dessert lacté sucré.",
   "Après ultra : petites portions toutes les heures (l'estomac est fragile) — bouillon salé, riz, yaourt à boire, compotes ; les 24-48 h suivantes comptent plus que la première heure.",
   "Sans appétit après une course chaude : commencer 100 % liquide et froid (smoothie lait-banane-miel, yaourt à boire), le solide reviendra dans 1-2 h."
  ],
  "alcoholNote": "L'alcool post-course retarde la resynthèse du glycogène, la réparation musculaire et la réhydratation : si célébration, d'abord récupérer (boisson, repas, réhydratation), et modération."
 }
}
;
