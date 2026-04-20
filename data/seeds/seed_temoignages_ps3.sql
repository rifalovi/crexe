-- ─────────────────────────────────────────────────────────────────────────────
-- Seed — Témoignages réels PS3 (PROJ_A15 à PROJ_A20)
-- Source : CREX PS3_V2.docx — OIF 2025
-- Photos : /public/images/temoignages/ (extraites du DOCX)
-- PRÉREQUIS : migration_add_photo_url.sql doit avoir été exécuté
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── Nettoyage des témoignages existants pour PS3 ───────────────────────────
DELETE FROM temoignages
WHERE projet_id IN ('PROJ_A15','PROJ_A16a','PROJ_A17','PROJ_A18','PROJ_A19','PROJ_A20');


-- ─── PROJ_A15 — Innovations et plaidoyers francophones ──────────────────────

INSERT INTO temoignages
  (projet_id, citation, auteur, fonction, pays, photo_url, source, type_media, mise_en_avant)
VALUES
(
  'PROJ_A15',
  'Le Réseau est un espace où la jeunesse francophone peut se rassembler, discuter, se faire entendre et surtout, agir pour la #Francophonie.',
  'Valérie Levesque',
  'Membre du Réseau jeunesse OIF',
  'Canada (Nouveau-Brunswick)',
  '/images/temoignages/a15_temoignage_valerie_levesque_1.jpg',
  'CREX 2025 — PS3, Projet 15',
  'rapport',
  true
),
(
  'PROJ_A15',
  'Le Réseau est une plateforme qui permet aux jeunes de l''espace francophone de réseauter et d''échanger, mais surtout, de parler d''une seule voix.',
  'Elisée N. Ditchare',
  'Membre du Réseau jeunesse OIF',
  'Bénin',
  '/images/temoignages/a15_temoignage_valerie_levesque_2.jpg',
  'CREX 2025 — PS3, Projet 15',
  'rapport',
  false
);


-- ─── PROJ_A16a — D-CLIC : Formez-vous au numérique ─────────────────────────

INSERT INTO temoignages
  (projet_id, citation, auteur, fonction, pays, photo_url, source, type_media, mise_en_avant)
VALUES
(
  'PROJ_A16a',
  'La formation m''a permis de développer des compétences techniques directement mobilisables, tout en gagnant en confiance. À l''issue du programme, j''ai intégré ITI (Infrastructure Télécom Informatique), où j''occupe aujourd''hui le poste de responsable du suivi de projet en fibre optique. Le projet D-CLIC a été une réponse concrète à mon besoin de progression. Aujourd''hui, je me sens utile et je contribue activement sur le terrain.',
  'Khadijetou Mohamedou',
  'Responsable suivi de projet en fibre optique, ITI',
  'Mauritanie',
  '/images/temoignages/a16a_temoignage_khadijetou_1.png',
  'CREX 2025 — PS3, Projet 16A (formation fibre optique)',
  'rapport',
  true
),
(
  'PROJ_A16a',
  'Grâce à ce projet de l''OIF, j''ai pu bénéficier d''une formation intensive qui a transformé ma vision en réalité technique. En quelques mois, j''ai acquis les compétences nécessaires pour concevoir et prototyper avec mes camarades une canne intelligente, un équipement dédié à l''assistance et à la santé.',
  'Looga Rose',
  'Bénéficiaire de la formation D-CLIC en Développement d''Objets Connectés',
  'Cameroun',
  '/images/temoignages/a16a_temoignage_khadijetou_2.png',
  'CREX 2025 — PS3, Projet 16A (formation IoT)',
  'rapport',
  false
),
(
  'PROJ_A16a',
  'Au cours de ma formation, j''ai acquis des compétences pratiques en création de contenus visuels, en élaboration de stratégies de communication, en gestion de projet ainsi qu''en adaptation des messages en fonction des publics cibles. À l''issue de ce stage, j''ai été retenue pour un contrat à durée déterminée en tant que facilitatrice sur le projet PARI-Alimentaire au Togo.',
  'Raoudatou Touré MOROU',
  'Facilitatrice projet PARI-Alimentaire — ancienne bénéficiaire D-CLIC marketing numérique',
  'Togo',
  '/images/temoignages/a16a_temoignage_khadijetou_3.png',
  'CREX 2025 — PS3, Projet 16A (marketing numérique)',
  'rapport',
  false
),
(
  'PROJ_A16a',
  'L''accompagnement offert par le projet D-CLIC m''a permis, en 4 mois, de perfectionner mes compétences en conception de sites avec différents langages de programmation, jusqu''au déploiement technique final. Grâce à D-CLIC, j''ai réussi aujourd''hui à structurer une offre de services que je propose à différentes structures locales.',
  'Adjété Alex WILSON',
  'Développeur web indépendant — ancienne bénéficiaire D-CLIC développement web et mobile',
  'Togo',
  '/images/temoignages/a16a_temoignage_khadijetou_4.png',
  'CREX 2025 — PS3, Projet 16A (développement web)',
  'rapport',
  false
);


-- ─── PROJ_A17 — Promotion des échanges économiques et commerciaux ───────────

INSERT INTO temoignages
  (projet_id, citation, auteur, fonction, pays, photo_url, source, type_media, mise_en_avant)
VALUES
(
  'PROJ_A17',
  'Guidafrica.com est née d''un constat simple : il n''existait pas de plateforme francophone dédiée au tourisme d''affaires en Afrique. La Mission économique de l''OIF nous a permis de rencontrer des partenaires stratégiques et de signer des accords concrets.',
  'Pascaline AGASSOUNON',
  'Cofondatrice de la plateforme Guidafrica.com',
  'Bénin',
  '/images/temoignages/a17_temoignage_pascaline_1.jpg',
  'CREX 2025 — PS3, Projet 17 (Mission économique Bénin)',
  'rapport',
  true
),
(
  'PROJ_A17',
  'Pharmaline opère dans un marché pharmaceutique en pleine reconstruction. La Mission économique de l''OIF au Liban nous a permis de tisser des liens avec des partenaires francophones de confiance et d''explorer de nouvelles voies d''approvisionnement pour la chaîne de santé libanaise.',
  'Dr. Carol Abi Karam',
  'Directrice générale de Pharmaline',
  'Liban',
  '/images/temoignages/a17_temoignage_carol_1.jpg',
  'CREX 2025 — PS3, Projet 17 (Mission économique Liban)',
  'rapport',
  false
);


-- ─── PROJ_A18 — Environnement et climat ─────────────────────────────────────

INSERT INTO temoignages
  (projet_id, citation, auteur, fonction, pays, photo_url, source, type_media, mise_en_avant)
VALUES
(
  'PROJ_A18',
  '« Monaco, pays développé très attaché à la Francophonie, prend part aux formations préparatoires de l''IFDD depuis quelques années. Ces moments sont riches d''échanges avec nos collègues de la famille francophone provenant de toutes les régions du monde. Elles permettent aussi à une petite délégation comme la nôtre (4 à 5 personnes seulement) de rapidement monter en compétence avant les sessions et de jauger les différentes positions des autres délégations francophones, au-delà des groupes habituels de négociation. Nous y sommes très attachés. »',
  'M. Carl Dudek',
  'Point focal national négociateur pour la Principauté de Monaco',
  'Monaco',
  '/images/temoignages/a18_temoignage_carl_dudek_1.jpg',
  'CREX 2025 — PS3, Projet 18 (formation IFDD)',
  'rapport',
  true
),
(
  'PROJ_A18',
  '« Les sessions de formation que j''ai suivies à Maurice et au Ghana se sont révélées particulièrement pertinentes et efficaces, les simulations de négociation reflétant les réalités rencontrées lors de la CdP30. »',
  'Mme Kaully Tirouvi',
  'Négociatrice bénéficiaire',
  'Maurice',
  '/images/temoignages/a18_temoignage_carl_dudek_2.jpg',
  'CREX 2025 — PS3, Projet 18 (CdP30)',
  'rapport',
  false
),
(
  'PROJ_A18',
  '« Cette année encore, l''OIF a permis à ma délégation à la COP 30, de porter la voix des communautés vulnérables face aux changements climatiques. Je suis fière d''avoir été impliquée dans l''organisation de la Journée de la Jeunesse qui a connu un franc succès. Dans un contexte largement dominé par l''anglais, le pavillon de l''OIF offre aux francophones un espace essentiel d''expression et de visibilité. »',
  'Mme Constance Genevée',
  'Membre de la délégation du Bénin à la COP 30',
  'Bénin',
  '/images/temoignages/a18_temoignage_carl_dudek_3.jpg',
  'CREX 2025 — PS3, Projet 18 (COP 30)',
  'rapport',
  false
),
(
  'PROJ_A18',
  '« Le changement climatique cause des dégâts : au fur et à mesure qu''on satisfait des besoins, il y en a d''autres qui naissent. J''ai senti l''engouement des personnes pendant ce renforcement de capacités. La notion de rationnel climatique était, par exemple, une nouveauté pour moi. »',
  'Mariam Amoudou Sidi',
  'Chargée d''études en adaptation au changement climatique et point focal genre à la CNC',
  'République centrafricaine',
  '/images/temoignages/a18_temoignage_carl_dudek_4.jpg',
  'CREX 2025 — PS3, Projet 18 (renforcement capacités)',
  'rapport',
  false
),
(
  'PROJ_A18',
  '« La vision du Québec repose sur la conviction que les jeunes sont des acteurs importants de l''action climatique et de la transition vers un avenir durable. Au sein de l''espace francophone, nous souhaitons amplifier leur voix, soutenir leur capacité d''innovation et créer des passerelles pour qu''ils puissent influencer les décisions. Miser sur la jeunesse, c''est investir dans des solutions courageuses, inclusives et ambitieuses qui façonneront le monde de demain. »',
  'Jean Lemire',
  'Émissaire aux changements climatiques et aux enjeux nordiques et arctiques',
  'Québec (Canada)',
  '/images/temoignages/a18_temoignage_carl_dudek_5.jpg',
  'CREX 2025 — PS3, Projet 18 (Initiative Jeunesse IFDD)',
  'rapport',
  false
);


-- ─── PROJ_A19 — Bassin du Congo ─────────────────────────────────────────────

INSERT INTO temoignages
  (projet_id, citation, auteur, fonction, pays, photo_url, source, type_media, mise_en_avant)
VALUES
(
  'PROJ_A19',
  '« Plus jeune, j''ai subi des moqueries liées à la couleur de ma peau et j''ai voulu tester la dépigmentation, mais j''ai réalisé à quel point c''était dangereux. J''ai eu cette vision de ne pas me détruire, ni détruire l''environnement. » Accompagnée par la Représentation de l''OIF pour l''Afrique centrale, elle est passée de la « production dans un couloir » à un atelier de fabrication digne de ce nom. Sa participation à la CdP30 lui a permis de recevoir de nombreux conseils sur les plans stratégiques et personnels : « J''ai été orientée vers de nouveaux partenaires, que ce soit pour le packaging ou la recherche de matières premières. »',
  'Duthie Chancel Mbombet',
  'Fondatrice de DutCh''M — cosmétiques naturels à base de noix de coco',
  'Gabon',
  '/images/temoignages/a19_temoignage_duthie_mbombet_1.jpg',
  'CREX 2025 — PS3, Projet 19 (éco-innovation, CdP30)',
  'rapport',
  true
),
(
  'PROJ_A19',
  '« Grâce aux sessions de coaching et aux formations, j''ai pu mieux structurer le volet financier de mon projet, développer des alliances stratégiques et renforcer mes capacités de communication. Le financement accordé m''a également permis de concrétiser un prototype aujourd''hui validé par la clientèle locale. Ce parcours a profondément influencé ma manière de travailler, en m''aidant à mieux anticiper et gérer les risques, à planifier mes activités et à organiser mes tâches. »',
  'Florianne Loba',
  'Co-autrice du projet Eco4Nature, bénéficiaire du programme d''innovations environnementales',
  'Guinée équatoriale',
  '/images/temoignages/a19_temoignage_duthie_mbombet_2.jpg',
  'CREX 2025 — PS3, Projet 19 (innovation environnementale)',
  'rapport',
  false
),
(
  'PROJ_A19',
  '« Le projet de jardin pédagogique, associé à la cantine scolaire, nous a permis d''apprendre autrement l''agriculture, l''élevage et l''artisanat, en mettant en pratique ce que nous voyons en classe. Nous avons aussi compris les effets négatifs des pesticides sur la santé et sur la nature. Grâce au projet, nous apprenons à pratiquer une agriculture saine, sans engrais chimiques, et à adopter des gestes simples pour protéger l''environnement. »',
  'Mindjan Mvondo Ryan Sofren',
  'Élève en Terminale et président du club agroécologique du lycée technique d''Ebolowa',
  'Cameroun',
  '/images/temoignages/a19_temoignage_duthie_mbombet_3.jpg',
  'CREX 2025 — PS3, Projet 19 (ferme pédagogique)',
  'rapport',
  false
),
(
  'PROJ_A19',
  '« Grâce à l''appui technique et financier de l''OIF, j''ai appris les différents processus de transformation des tubercules de manioc en ses dérivés (tapioca, gari, amidon, spaghettis, farine, gâteau de manioc), les processus de production des légumes séchés, des thés minceurs, la production des savons liquides et solides. Cela me permet aujourd''hui d''avoir une activité génératrice de revenus. »',
  'Zakari KOUOTOU',
  'Promoteur de KAGROB.3M — bénéficiaire du programme d''entrepreneuriat agricole',
  'Cameroun',
  '/images/temoignages/a19_temoignage_duthie_mbombet_4.jpg',
  'CREX 2025 — PS3, Projet 19 (entrepreneuriat agricole)',
  'rapport',
  false
);


-- ─── PROJ_A20 — Promotion du tourisme durable ───────────────────────────────

INSERT INTO temoignages
  (projet_id, citation, auteur, fonction, pays, photo_url, source, type_media, mise_en_avant)
VALUES
(
  'PROJ_A20',
  '« Avant la mise en place du projet, je n''avais aucune source de revenu et depuis les choses ont commencé à s''améliorer. Le projet nous a offert des formations en langues étrangères, pour faciliter le contact avec les clients, bénéficié d''améliorations dans notre maison Homestay pour être capable d''accueillir des clients. Nous avons également reçu des formations en cuisine. »',
  'Dercy Santos',
  'Gérante d''une maison Homestay — bénéficiaire du projet Homestay Maio',
  'Cabo Verde (Île de Maio)',
  '/images/temoignages/a20_temoignage_dercy_santos_1.jpg',
  'CREX 2025 — PS3, Projet 20 (Homestay Maio)',
  'rapport',
  true
),
(
  'PROJ_A20',
  '« Nous essayons de responsabiliser les jeunes pour qu''ils réfléchissent à l''environnement et à la culture, et qu''ils en fassent quelque chose de bénéfique pour l''économie et les communautés locales. Il y a un manque de jeunes travailleurs. Notre but n''est pas simplement de les retenir sur place, mais de renforcer leurs capacités. Ainsi, l''île s''enrichit de nouvelles ressources et ils n''ont plus besoin de partir. »',
  'Représentant',
  'Fundação Maio Biodiversidade',
  'Cabo Verde (Île de Maio)',
  '/images/temoignages/a20_temoignage_dercy_santos_2.jpg',
  'CREX 2025 — PS3, Projet 20 (tourisme communautaire)',
  'rapport',
  false
),
(
  'PROJ_A20',
  '« Depuis que je travaille ici depuis 3 mois à Kulen, j''ai appris et compris les potentiels, les défis et les contraintes des communautés, et je crois vraiment que notre projet mis en place est véritablement pertinent. Grâce au projet d''écotourisme de Kulen, nous allons soutenir les communautés pour un meilleur moyen de subsistance alternatif à travers des activités d''écotourisme, et je suis très heureuse de pouvoir les soutenir avec mes connaissances et mes compétences. »',
  'Sreymom Sean',
  'Chef de Projet Écotourisme à Sala Baï',
  'Cambodge',
  '/images/temoignages/a20_temoignage_dercy_santos_3.png',
  'CREX 2025 — PS3, Projet 20 (écotourisme Kulen)',
  'rapport',
  false
),
(
  'PROJ_A20',
  '« La formation de deux journées au développement du tourisme communautaire constitue pour notre commune de Dân Hòa une activité particulièrement significative et porteuse d''avenir. Le développement du tourisme communautaire, associé au programme de nouvelle ruralité et aux produits OCOP, représente pour nous une orientation pertinente et durable. Cette démarche nous permet de valoriser efficacement les potentialités et les atouts de notre territoire, tout en préservant nos traditions culturelles. »',
  'Mai Xuân Trường',
  'Secrétaire du Comité du Parti et Président du Conseil populaire de la commune Dân Hoà',
  'Viet Nam (Hanoï)',
  '/images/temoignages/a20_temoignage_dercy_santos_4.png',
  'CREX 2025 — PS3, Projet 20 (TRILAF Hanoï)',
  'rapport',
  false
),
(
  'PROJ_A20',
  '« Je suis très contente d''avoir participé à cette formation sur le tourisme durable et le tourisme communautaire. Après la formation, j''ai compris que garder notre métier traditionnel, c''est aussi garder l''âme de notre village. Le projet de développement du village des chapeaux coniques de Tri Lễ est une bonne chance pour nous. Nous pouvons gagner un peu plus d''argent tout en continuant le métier de nos ancêtres. »',
  'NGUYEN Thi Dieu',
  'Artisane du village de Tri Le',
  'Viet Nam (Hanoï)',
  '/images/temoignages/a20_temoignage_dercy_santos_5.jpg',
  'CREX 2025 — PS3, Projet 20 (TRILAF village chapeaux coniques)',
  'rapport',
  false
),
(
  'PROJ_A20',
  '« Issue d''une famille en grande difficulté financière et vivant en milieu rural, j''ai intégré une formation dans les métiers du tourisme dans l''espoir d''améliorer ma situation. Mon rêve d''avoir un emploi dans le secteur de l''hôtellerie et de gagner de l''argent pour soutenir ma famille a été réalisé. »',
  'Chun Soben',
  'Étudiante à SPOONS (hôtellerie et tourisme)',
  'Cambodge (Siem Reap)',
  '/images/temoignages/a20_temoignage_dercy_santos_6.jpg',
  'CREX 2025 — PS3, Projet 20 (formation SPOONS)',
  'rapport',
  false
),
(
  'PROJ_A20',
  '« Le secteur du tourisme durable ne manque pas de travail, il manque de main-d''œuvre. Chers étudiants, apprenez le français, nous vous assurons que vous aurez du travail. »',
  'Ha Duc Manh',
  'Directeur de l''agence de voyage Amica Travel',
  'Viet Nam',
  '/images/temoignages/a20_temoignage_dercy_santos_7.jpg',
  'CREX 2025 — PS3, Projet 20 (tourisme francophone)',
  'rapport',
  false
),
(
  'PROJ_A20',
  '« J''ai aussi beaucoup apprécié l''échange avec les participants, parce que chacun a pu partager son expérience et apprendre des autres. Je pense que ce type de formation est très important pour améliorer la qualité du tourisme au Cabo-Verde et pour aider les guides à se sentir plus confiants lorsqu''ils travaillent avec des touristes francophones. J''ai pu avoir des outils très importants qui ont changé ma manière de travailler. »',
  'Enick Fernandes Gomes',
  'Professeur, formateur de français et guide de tourisme',
  'Cabo Verde',
  '/images/temoignages/a20_temoignage_dercy_santos_8.jpg',
  'CREX 2025 — PS3, Projet 20 (formation guides touristiques)',
  'rapport',
  false
),
(
  'PROJ_A20',
  '« J''ai eu l''opportunité de participer à une formation en exploration marine organisée par le Parc national de Mitsamiouli-Ndroulé dans le cadre d''un projet de développement de l''écotourisme soutenu par l''OIF. Cette expérience m''a permis de prendre conscience de la richesse de notre patrimoine naturel et de l''importance de le préserver. Elle me donne aujourd''hui les compétences nécessaires pour contribuer au développement de l''écotourisme dans ma région. »',
  'Rafzati',
  'Bénéficiaire de la formation en exploration marine',
  'Comores (Mitsamiouli)',
  '/images/temoignages/a20_temoignage_dercy_santos_9.jpg',
  'CREX 2025 — PS3, Projet 20 (écotourisme Comores)',
  'rapport',
  false
);


-- ─── Vérification ────────────────────────────────────────────────────────────
SELECT
  projet_id,
  count(*)           AS nb_temoignages,
  count(photo_url)   AS avec_photo,
  count(*) FILTER (WHERE mise_en_avant) AS vedette
FROM temoignages
WHERE projet_id IN ('PROJ_A15','PROJ_A16a','PROJ_A17','PROJ_A18','PROJ_A19','PROJ_A20')
GROUP BY projet_id
ORDER BY projet_id;
