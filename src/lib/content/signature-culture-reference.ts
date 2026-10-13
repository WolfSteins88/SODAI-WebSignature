import type { VillaContent } from "@/lib/schemas/content";

/** Replaceable private comparison seed; public rendering reads published snapshots. */
export const referenceCulture: NonNullable<VillaContent["culture"]> = {
  "enabled": true,
  "title": "Cultures",
  "hero": {
    "src": "/reference-culture/ab393444c4123aa8c18b.webp",
    "alt": "Balinese ceremonial procession",
    "category": "Living"
  },
  "introTitle": "Bali, with its enchanting charm, presents a tapestry of unique and authentic cultural experiences waiting to be discovered across the island.",
  "intro": [
    "Some are just around the corner, while others invite you to embark on an adventure, requiring a tour or transportation to reach their distant beauty.",
    "The Balinese cultural calendar, following the Saka/local calendar, unfolds throughout the year, offering a journey of inspiration and wonder."
  ],
  "introImages": [
    {
      "src": "/reference-culture/0b53fbd7e1c7785fafe7.webp",
      "alt": "Map of Bali",
      "category": "Living"
    },
    {
      "src": "/reference-culture/80456c8e17d1b49c9da0.webp",
      "alt": "Balinese ceremonial carving",
      "category": "Living"
    }
  ],
  "entries": [
    {
      "id": "galungan",
      "enabled": true,
      "slug": "galungan",
      "title": "Galungan",
      "summary": "The Galungan holiday, one of Bali’s most important, falls once every 210 days, in the Balinese week of Dunggulan, always on a Wednesday.",
      "image": {
        "src": "/reference-culture/d1861ff92e521db9b46a.webp",
        "alt": "Galungan",
        "category": "Living"
      },
      "heading": "The essence of Galungan is to defeat evil in oneself so that we can live in peace and harmony.",
      "body": [
        "According to old written records, Galungan was first celebrated on the 15th full moon of the year 804 in the Balinese Saka calendar, or 882 AD, to honor the triumph of Lord Indra over the evil king Mayadenawa, seen as a victory of good over evil. The term Galungan comes from Old Javanese and means ‘battle, combat’."
      ],
      "signature": {
        "hero": {
          "src": "/reference-culture/d1861ff92e521db9b46a.webp",
          "alt": "Galungan",
          "category": "Living"
        },
        "nextSlug": "kuningan-and-mekotek",
        "sections": [
          {
            "id": "galungan-portrait-editorial",
            "enabled": true,
            "layout": "portraitEditorial",
            "image": {
              "src": "/reference-culture/e0b55b7a8293115c0db1.webp",
              "alt": "Galungan editorial photograph",
              "category": "Living"
            },
            "heading": "The essence of Galungan is to defeat evil in oneself so that we can live in peace and harmony.",
            "body": [
              "According to old written records, Galungan was first celebrated on the 15th full moon of the year 804 in the Balinese Saka calendar, or 882 AD, to honor the triumph of Lord Indra over the evil king Mayadenawa, seen as a victory of good over evil. The term Galungan comes from Old Javanese and means ‘battle, combat’."
            ]
          },
          {
            "id": "galungan-red-editorial",
            "enabled": true,
            "layout": "redOverlay",
            "image": {
              "src": "/reference-culture/dfe0b83899ba31583d4f.webp",
              "alt": "Galungan cultural ceremony",
              "category": "Living"
            },
            "heading": "On Galungan day, the island takes on an even more magical atmosphere",
            "body": [
              "with the towering penjor (decorated bamboo poles) standing at the gate of every house.",
              "The Balinese believe that the spirits of the ancestors return home during Galungan. Therefore, prayers and offerings are prepared to welcome the spirits."
            ]
          }
        ]
      }
    },
    {
      "id": "kuningan-and-mekotek",
      "enabled": true,
      "slug": "kuningan-and-mekotek",
      "title": "Kuningan & Mekotek",
      "summary": "Kuningan is a Balinese holy day celebrated ten days after Galungan. It derives from ka-uningan, meaning wisdom, and the ritual aim is to attain spiritual elevation through introspection.",
      "image": {
        "src": "/reference-culture/5b7d0c5e7dac9045e6e5.webp",
        "alt": "Kuningan & Mekotek",
        "category": "Living"
      },
      "heading": "Kuningan is a Balinese holy day celebrated ten days after Galungan.",
      "body": [
        "On Kuningan day, we can witness an unusual rite called mekotekan in the village of Munggu, once the seat of the powerful kingdom of Mengwi. In this purification ritual, the young men of the village each carry a pole, from two to 3.5 meters long, made of pulet wood. They process around the village to the temple Pura Luhur Beten Bingin, where they pile the poles together to create a pyramid-like construction, in which teams compete to climb."
      ],
      "signature": {
        "hero": {
          "src": "/reference-culture/5b7d0c5e7dac9045e6e5.webp",
          "alt": "Kuningan & Mekotek",
          "category": "Living"
        },
        "nextSlug": "melasti",
        "sections": [
          {
            "id": "kuningan-and-mekotek-portrait-editorial",
            "enabled": true,
            "layout": "portraitEditorial",
            "image": {
              "src": "/reference-culture/3d18647fe94d9db35207.webp",
              "alt": "Kuningan & Mekotek editorial photograph",
              "category": "Living"
            },
            "heading": "Kuningan is a Balinese holy day celebrated ten days after Galungan.",
            "body": [
              "On Kuningan day, we can witness an unusual rite called mekotekan in the village of Munggu, once the seat of the powerful kingdom of Mengwi. In this purification ritual, the young men of the village each carry a pole, from two to 3.5 meters long, made of pulet wood. They process around the village to the temple Pura Luhur Beten Bingin, where they pile the poles together to create a pyramid-like construction, in which teams compete to climb."
            ]
          },
          {
            "id": "kuningan-and-mekotek-red-editorial",
            "enabled": true,
            "layout": "redOverlay",
            "image": {
              "src": "/reference-culture/a03e07274ca0e02df89f.webp",
              "alt": "Kuningan & Mekotek cultural ceremony",
              "category": "Living"
            },
            "heading": "As the sticks crash together, they make a sound like tek tek tek, thus the term mekotekan.",
            "body": [
              "The rite is said to have roots in the victory of Mengwi over Blambangan in East Java in the 17th century. It is held to honor ancestral heroes, and with the hope of protection from unexpected misfortune."
            ]
          }
        ]
      }
    },
    {
      "id": "nyepi",
      "enabled": true,
      "slug": "nyepi",
      "title": "Nyepi",
      "summary": "The Balinese New Year is known as Nyepi and is celebrated according to the Saka lunar calendar, on the dark of the moon of the spring equinox, usually falling in March or early April.",
      "image": {
        "src": "/reference-culture/90ff749fbcbbd0df686d.webp",
        "alt": "Nyepi",
        "category": "Living"
      },
      "heading": "The word nyepi comes from ‘sepi’, meaning ‘empty’.",
      "body": [
        "Although Nyepi is a traditional Balinese Hindu celebration, it has become a national holiday in Indonesia. The folk idea is to make the world appear as if deserted, so that disruptive spirits will abandon the island and look elsewhere to cause mischief."
      ],
      "signature": {
        "hero": {
          "src": "/reference-culture/90ff749fbcbbd0df686d.webp",
          "alt": "Nyepi",
          "category": "Living"
        },
        "nextSlug": "piodalan",
        "sections": [
          {
            "id": "nyepi-portrait-editorial",
            "enabled": true,
            "layout": "portraitEditorial",
            "image": {
              "src": "/reference-culture/f2dbeec750059c34c5e5.webp",
              "alt": "Nyepi editorial photograph",
              "category": "Living"
            },
            "heading": "The word nyepi comes from ‘sepi’, meaning ‘empty’.",
            "body": [
              "Although Nyepi is a traditional Balinese Hindu celebration, it has become a national holiday in Indonesia. The folk idea is to make the world appear as if deserted, so that disruptive spirits will abandon the island and look elsewhere to cause mischief."
            ]
          },
          {
            "id": "nyepi-red-editorial",
            "enabled": true,
            "layout": "redOverlay",
            "image": {
              "src": "/reference-culture/a859db4cc69dde54c8db.webp",
              "alt": "Nyepi cultural ceremony",
              "category": "Living"
            },
            "heading": "There is no traffic on the roads, and in the evening, lights are not to be turned on. Ngurah Rai Airport is closed to all flights.",
            "body": [
              "On Nyepi, everyone is asked to stay inside their\nhome compound for 24 hours, from dawn to the following dawn. Visitors, too,\nmust comply with this custom and are asked not to stray from the hotel grounds.Many visitors remark on the extraordinary quiet and peacefulness of this day of silence.",
              "The Balinese people treat Nyepi as an opportunity to meditate and fast. The importance of this holy day is to detach oneself from the world and seek inward peace."
            ]
          }
        ]
      }
    },
    {
      "id": "melasti",
      "enabled": true,
      "slug": "melasti",
      "title": "Melasti",
      "summary": "Three days before Nyepi, a large purification\nceremony called melasti is held by villages all over Bali.",
      "image": {
        "src": "/reference-culture/ab5435506ce86cc67fa9.webp",
        "alt": "Melasti",
        "category": "Living"
      },
      "heading": "The sea is a significant element for Balinese Hindus, who believe that it is the realm where all spiritual impurities are destroyed.",
      "body": [
        "Each household erects a triangular altar for\nofferings by the roadside, and holy objects from the temples are brought in\nprocession to the sea to be cleansed in a special ritual.",
        "Massive community processions gather on beaches\nall around the island to participate in this ritual cleansing. Guests can witness this inspiring ceremony on Sanur Beach."
      ],
      "signature": {
        "hero": {
          "src": "/reference-culture/ab5435506ce86cc67fa9.webp",
          "alt": "Melasti",
          "category": "Living"
        },
        "nextSlug": "ogoh-ogoh",
        "sections": [
          {
            "id": "melasti-portrait-editorial",
            "enabled": true,
            "layout": "portraitEditorial",
            "image": {
              "src": "/reference-culture/7e5c7ef865bbd2c6bfc9.webp",
              "alt": "Melasti editorial photograph",
              "category": "Living"
            },
            "heading": "The sea is a significant element for Balinese Hindus, who believe that it is the realm where all spiritual impurities are destroyed.",
            "body": [
              "Each household erects a triangular altar for\nofferings by the roadside, and holy objects from the temples are brought in\nprocession to the sea to be cleansed in a special ritual.",
              "Massive community processions gather on beaches\nall around the island to participate in this ritual cleansing. Guests can witness this inspiring ceremony on Sanur Beach."
            ]
          },
          {
            "id": "melasti-red-editorial",
            "enabled": true,
            "layout": "redOverlay",
            "image": {
              "src": "/reference-culture/f9c2fa78bbd9daac70fe.webp",
              "alt": "Melasti cultural ceremony",
              "category": "Living"
            },
            "heading": "Guests can witness this inspiring ceremony on Sanur Beach.",
            "body": [
              "Hindus people believe that it is the realm where all spiritual impurities are destroyed. Massive community processions gather on beaches all around the island to participate in this ritual cleansing."
            ]
          }
        ]
      }
    },
    {
      "id": "ogoh-ogoh",
      "enabled": true,
      "slug": "ogoh-ogoh",
      "title": "Ogoh-ogoh",
      "summary": "In the evening of Pengrupukan, the day before\nNyepi, villages parade ogoh-ogoh—giant effigies of demons, designed and\nbuilt by the youth of each community.",
      "image": {
        "src": "/reference-culture/b80d8290bd0c4d05b2ef.webp",
        "alt": "Ogoh-ogoh",
        "category": "Living"
      },
      "heading": "The ogoh-ogoh parade is intense—noisy and wild, accompanied by torches and orchestras of cymbals and gongs.",
      "body": [
        "In household ceremonies, the people will bang\ngongs, pots and pans, and bamboo sticks to chase the evil spirits from the\nisland.",
        "It takes place in village streets and centers. Traditionally, the procession ends up at the cemetery where the effigies are burned, and all the negative energies are dispersed, preparing the way for the peace of Nyepi."
      ],
      "signature": {
        "hero": {
          "src": "/reference-culture/b80d8290bd0c4d05b2ef.webp",
          "alt": "Ogoh-ogoh",
          "category": "Living"
        },
        "nextSlug": "nyepi",
        "sections": [
          {
            "id": "ogoh-ogoh-portrait-editorial",
            "enabled": true,
            "layout": "portraitEditorial",
            "image": {
              "src": "/reference-culture/dcd762c7cf9356097560.webp",
              "alt": "Ogoh-ogoh editorial photograph",
              "category": "Living"
            },
            "heading": "The ogoh-ogoh parade is intense—noisy and wild, accompanied by torches and orchestras of cymbals and gongs.",
            "body": [
              "In household ceremonies, the people will bang\ngongs, pots and pans, and bamboo sticks to chase the evil spirits from the\nisland.",
              "It takes place in village streets and centers. Traditionally, the procession ends up at the cemetery where the effigies are burned, and all the negative energies are dispersed, preparing the way for the peace of Nyepi."
            ]
          },
          {
            "id": "ogoh-ogoh-red-editorial",
            "enabled": true,
            "layout": "redOverlay",
            "image": {
              "src": "/reference-culture/0079bad9b0beec2dfd26.webp",
              "alt": "Ogoh-ogoh cultural ceremony",
              "category": "Living"
            },
            "heading": "Creating an ogoh-ogoh—usually from bamboo, wood, and paper—takes two to three months and involves all the men in the banjar, or community unit.",
            "body": [
              "Some ogoh-ogoh have mechanized movements. Every year there is creative suspense to see what new forms will emerge and what materials are used. Recently there was a trend for dried banana leaves and used plastic bottles."
            ]
          }
        ]
      }
    },
    {
      "id": "piodalan",
      "enabled": true,
      "slug": "piodalan",
      "title": "Piodalan",
      "summary": "A piodalan is a temple’s anniversary,\nwhen the deities are believed to come down from heaven to the temple shrines,\npartake of offerings, and convey blessings through the medium of holy water.",
      "image": {
        "src": "/reference-culture/cf5a2c6bca0d3d5f8372.webp",
        "alt": "Piodalan",
        "category": "Living"
      },
      "heading": "Temple anniversaries date from their founding and occur all around the year, whether on the 210-day Balinese calendar or the Saka lunar calendar.",
      "body": [
        "The gods are welcomed with offerings of food, flowers, traditional music, and dances. People wear their best temple clothes, and it is a very happy time."
      ],
      "signature": {
        "hero": {
          "src": "/reference-culture/cf5a2c6bca0d3d5f8372.webp",
          "alt": "Piodalan",
          "category": "Living"
        },
        "nextSlug": "bali-art-festival",
        "sections": [
          {
            "id": "piodalan-portrait-editorial",
            "enabled": true,
            "layout": "portraitEditorial",
            "image": {
              "src": "/reference-culture/eb27cd01d7bac1b2fc45.webp",
              "alt": "Piodalan editorial photograph",
              "category": "Living"
            },
            "heading": "Temple anniversaries date from their founding and occur all around the year, whether on the 210-day Balinese calendar or the Saka lunar calendar.",
            "body": [
              "The gods are welcomed with offerings of food, flowers, traditional music, and dances. People wear their best temple clothes, and it is a very happy time."
            ]
          },
          {
            "id": "piodalan-red-editorial",
            "enabled": true,
            "layout": "redOverlay",
            "image": {
              "src": "/reference-culture/ff289cfb6703228b333f.webp",
              "alt": "Piodalan cultural ceremony",
              "category": "Living"
            },
            "heading": "The piodalan ceremony is also held at Pura Tandjung Sari—the beachfront temple for which the hotel is named—on Purnama Sasih Kedasa.",
            "body": [
              "Purnama sasih kedasa is the full moon of the tenth month of the Saka lunar calendar. It is a particularly holy day in Bali and usually falls in March or April.",
              "You are welcome to witness this beautiful religious occasion. As with any Balinese ceremony, a sarong, and a sash, with a kebaya blouse for women, are required to be worn by those attending the ceremony."
            ]
          }
        ]
      }
    },
    {
      "id": "bali-art-festival",
      "enabled": true,
      "slug": "bali-art-festival",
      "title": "Bali Art Festival",
      "summary": "The island’s largest and most spectacular\ncultural event, the Bali Arts Festival (Pesta Kesenian Bali), is an annual\nprogram organized by the government of Bali Province.",
      "image": {
        "src": "/reference-culture/7403d9c7763d195fe7f5.webp",
        "alt": "Bali Art Festival",
        "category": "Living"
      },
      "heading": "The festival is held in Denpasar at the Werdhi Budaya Art Centre.",
      "body": [
        "It lasts for a month and takes place every year from mid-June to the middle of July. It showcases the variety and richness of\nperforming arts traditions from the different regions in Bali, as well as other\nprovinces in Indonesia and a number of foreign countries."
      ],
      "signature": {
        "hero": {
          "src": "/reference-culture/7403d9c7763d195fe7f5.webp",
          "alt": "Bali Art Festival",
          "category": "Living"
        },
        "nextSlug": "perang-pandan-and-ayunan-jantra",
        "sections": [
          {
            "id": "bali-art-festival-portrait-editorial",
            "enabled": true,
            "layout": "portraitEditorial",
            "image": {
              "src": "/reference-culture/a83d7f3c72e417a26e15.webp",
              "alt": "Bali Art Festival editorial photograph",
              "category": "Living"
            },
            "heading": "The festival is held in Denpasar at the Werdhi Budaya Art Centre.",
            "body": [
              "It lasts for a month and takes place every year from mid-June to the middle of July. It showcases the variety and richness of\nperforming arts traditions from the different regions in Bali, as well as other\nprovinces in Indonesia and a number of foreign countries."
            ]
          },
          {
            "id": "bali-art-festival-red-editorial",
            "enabled": true,
            "layout": "redOverlay",
            "image": {
              "src": "/reference-culture/55b03ac5a999ba0999e7.webp",
              "alt": "Bali Art Festival cultural ceremony",
              "category": "Living"
            },
            "heading": "On the opening day, an enormous parade of all the performing groups is held in Renon, Denpasar.",
            "body": [
              "The festival is traditionally opened by the President of Indonesia."
            ]
          }
        ]
      }
    },
    {
      "id": "perang-pandan-and-ayunan-jantra",
      "enabled": true,
      "slug": "perang-pandan-and-ayunan-jantra",
      "title": "Perang Pandan & Ayunan Jantra",
      "summary": "The Bali Aga village of Tenganan Dauh Tukad in Karangasem Regency has a unique tradition of a ritual battle with spiny pandan leaves, known as mekare-kare or mageret pandan.",
      "image": {
        "src": "/reference-culture/d44b7226bb8f18301535.webp",
        "alt": "Perang Pandan & Ayunan Jantra",
        "category": "Living"
      },
      "heading": "The Perang Pandan ritual battle is carried out to honor the god Indra, the deity of war, and is part of the Sasih Sembah ceremonies, an important series of religious celebrations in Tenganan Village.",
      "body": [
        "This ceremony lasts for two days, held every fifth month or Sasih Kalima on Tenganan’s village calendar (around June)."
      ],
      "signature": {
        "hero": {
          "src": "/reference-culture/d44b7226bb8f18301535.webp",
          "alt": "Perang Pandan & Ayunan Jantra",
          "category": "Living"
        },
        "nextSlug": "purnama-and-tilem",
        "sections": [
          {
            "id": "perang-pandan-and-ayunan-jantra-portrait-editorial",
            "enabled": true,
            "layout": "portraitEditorial",
            "image": {
              "src": "/reference-culture/f5dc41504a0b1b70bbd4.webp",
              "alt": "Perang Pandan & Ayunan Jantra editorial photograph",
              "category": "Living"
            },
            "heading": "The Perang Pandan ritual battle is carried out to honor the god Indra, the deity of war, and is part of the Sasih Sembah ceremonies, an important series of religious celebrations in Tenganan Village.",
            "body": [
              "This ceremony lasts for two days, held every fifth month or Sasih Kalima on Tenganan’s village calendar (around June)."
            ]
          },
          {
            "id": "perang-pandan-and-ayunan-jantra-red-editorial",
            "enabled": true,
            "layout": "redOverlay",
            "image": {
              "src": "/reference-culture/8e5c0cef5f24f749bad6.webp",
              "alt": "Perang Pandan & Ayunan Jantra cultural ceremony",
              "category": "Living"
            },
            "heading": "Following the Perang Pandan, the Ayunan Jantra (on a wooden circular swing) will grace the late afternoon.",
            "body": [
              "This tradition describes the continuous life cycle, inspiring young people to embrace the journey ahead. The swing’s ups and downs are a powerful reminder to prepare for the realities that await.",
              "Please contact our reservations desk if you are interested in witnessing these cultural events."
            ]
          }
        ]
      }
    },
    {
      "id": "purnama-and-tilem",
      "enabled": true,
      "slug": "purnama-and-tilem",
      "title": "Purnama & Tilem",
      "summary": "The full moon (Purnama) and the dark of the moon (Tilem) are always sacred days for Balinese Hindus.",
      "image": {
        "src": "/reference-culture/121cce936dd20c4f007d.webp",
        "alt": "Purnama & Tilem",
        "category": "Living"
      },
      "heading": "Purnama is generally marked by a high tide.",
      "body": [
        "To protect the self from negative effects, people are advised to take time for introspection and self-purification."
      ],
      "signature": {
        "hero": {
          "src": "/reference-culture/121cce936dd20c4f007d.webp",
          "alt": "Purnama & Tilem",
          "category": "Living"
        },
        "nextSlug": "offerings",
        "sections": [
          {
            "id": "purnama-and-tilem-portrait-editorial",
            "enabled": true,
            "layout": "portraitEditorial",
            "image": {
              "src": "/reference-culture/aef29ec2291b9a602257.webp",
              "alt": "Purnama & Tilem editorial photograph",
              "category": "Living"
            },
            "heading": "Purnama is generally marked by a high tide.",
            "body": [
              "To protect the self from negative effects, people are advised to take time for introspection and self-purification."
            ]
          },
          {
            "id": "purnama-and-tilem-red-editorial",
            "enabled": true,
            "layout": "redOverlay",
            "image": {
              "src": "/reference-culture/902e495f74f887d9d1e4.webp",
              "alt": "Purnama & Tilem cultural ceremony",
              "category": "Living"
            },
            "heading": "Tilem is the darkest night of the month.",
            "body": [
              "On Purnama and on Tilem, special offerings are placed in significant places around houses and temples and in local shrines everywhere.",
              "Both stages of the moon are believed to have\nambivalent mystical energy."
            ]
          }
        ]
      }
    },
    {
      "id": "offerings",
      "enabled": true,
      "slug": "offerings",
      "title": "Offerings",
      "summary": "In Bali, all religious rites, large and small, are carried out with offerings, called banten in Balinese.",
      "image": {
        "src": "/reference-culture/b6dd788b515d2eeb761b.webp",
        "alt": "Offerings",
        "category": "Living"
      },
      "heading": "The knowledge of offerings is held by priestly families, and the art of making them is traditionally carried out by women, taught from one generation to the next.",
      "body": [
        "Most basically, these are symbolic amounts of food placed on a leaf container. But the variety of food and leaf containers—as well as the flowers and palm leaf ornaments, cut and pinned in myriad ways—is uncountably complex."
      ],
      "signature": {
        "hero": {
          "src": "/reference-culture/b6dd788b515d2eeb761b.webp",
          "alt": "Offerings",
          "category": "Living"
        },
        "sections": [
          {
            "id": "offerings-portrait-editorial",
            "enabled": true,
            "layout": "portraitEditorial",
            "image": {
              "src": "/reference-culture/1dda2b9e8893fc7ad095.webp",
              "alt": "Offerings editorial photograph",
              "category": "Living"
            },
            "heading": "The knowledge of offerings is held by priestly families, and the art of making them is traditionally carried out by women, taught from one generation to the next.",
            "body": [
              "Most basically, these are symbolic amounts of food placed on a leaf container. But the variety of food and leaf containers—as well as the flowers and palm leaf ornaments, cut and pinned in myriad ways—is uncountably complex."
            ]
          },
          {
            "id": "offerings-red-editorial",
            "enabled": true,
            "layout": "redOverlay",
            "image": {
              "src": "/reference-culture/717c76a00ce0c9ee3369.webp",
              "alt": "Offerings cultural ceremony",
              "category": "Living"
            },
            "heading": "It is the profusion of offerings that give Bali its particular festive look and mystical feel.",
            "body": [
              "Each offering has a special form and meaning according to the custom of the particular place, and each one is offered with incense, holy water, and a prayer. And there is no room for improvisation.",
              "Guests interested in learning Balinese offering-making can book through our reservations desk."
            ]
          }
        ]
      }
    }
  ]
};
