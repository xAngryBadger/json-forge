export const SAMPLE_JSON = `{
  "store": {
    "name": "Ollivanders Wand Shop",
    "location": "Diagon Alley South, London",
    "founded": 382,
    "magical": true,
    "owner": null,
    "inventory": [
      {
        "id": "w-001",
        "wood": "Holly",
        "core": "Phoenix feather",
        "length": 11,
        "flexibility": "Nice and supple",
        "inStock": true,
        "price": 7,
        "tags": ["defensive", "charm-oriented"]
      },
      {
        "id": "w-002",
        "wood": "Yew",
        "core": "Dragon heartstring",
        "length": 13.5,
        "flexibility": "Unyielding",
        "inStock": false,
        "price": 12,
        "tags": ["dueling", "dark-arts"]
      },
      {
        "id": "w-003",
        "wood": "Vine",
        "core": "Dragon heartstring",
        "length": 10.75,
        "flexibility": "Quite flexible",
        "inStock": true,
        "price": 9,
        "tags": ["transfiguration", "charm-oriented"]
      },
      {
        "id": "w-004",
        "wood": "Elder",
        "core": "Thestral tail hair",
        "length": 15,
        "flexibility": "Rigid",
        "inStock": true,
        "price": null,
        "tags": ["legendary", "deathly-hallows"]
      }
    ],
    "customers": {
      "active": 342,
      "vip": ["Harry Potter", "Hermione Granger", "Ron Weasley"],
      "waitlist": []
    },
    "metadata": {
      "lastInventoryCheck": "2024-07-15T08:30:00Z",
      "currency": "Galleons",
      "exchangeRate": {
        "Galleons_to_Sickles": 17,
        "Sickles_to_Knuts": 29
      }
    }
  }
}`
