import type {VillaContent} from '../schemas/content';
// Isolated comparison seed: contacts/travel values are reference demo content.
export const referenceLocation:NonNullable<VillaContent['signatureLocation']>={
  "id": "getting-here-editorial",
  "enabled": true,
  "title": "Getting Here",
  "description": "Tandjung Sari is located in the center of Sanur, offering convenient access to the airport and other destinations in Bali.",
  "hero": {
    "src": "/reference-location/2ff0014d03d7f4a75e64.webp",
    "alt": "Aerial view of Tandjung Sari gardens and winding paths",
    "category": "Nature",
    "focalPoint": {
      "x": 50,
      "y": 50
    }
  },
  "heading": "Tandjung Sari is located in the center of Sanur, offering convenient access to the airport and other destinations in Bali.",
  "contacts": {
    "phone": {
      "enabled": true,
      "label": "Phone",
      "display": "+62 361 288441",
      "number": "+62361288441"
    },
    "email": {
      "enabled": true,
      "label": "Mail",
      "address": "info@tandjungsarihotel.com"
    },
    "address": {
      "enabled": true,
      "label": "Location",
      "lines": [
        "Jalan Danau Tamblingan No. 41 Sanur, Denpasar - 80228 Bali, Indonesia"
      ]
    }
  },
  "small": {
    "src": "/reference-location/7f78d66f19cbad109402.webp",
    "alt": "Tandjung Sari entrance gate surrounded by tropical plants",
    "category": "Nature",
    "focalPoint": {
      "x": 50,
      "y": 50
    }
  },
  "map": {
    "src": "/reference-location/b48259c1ac530ff8e34d.webp",
    "alt": "Static Sanur street map with the Tandjung Sari marker near the coast",
    "category": "Nature",
    "focalPoint": {
      "x": 50,
      "y": 50
    }
  },
  "directionsUrl": "https://maps.app.goo.gl/5KhdAD7hAERJsFAX9",
  "destinations": [
    {
      "id": "destination-1",
      "enabled": true,
      "name": "Bali International Hospital",
      "distance": "2.1 km"
    },
    {
      "id": "destination-2",
      "enabled": true,
      "name": "Sanur Harbour",
      "distance": "5.6 km"
    },
    {
      "id": "destination-3",
      "enabled": true,
      "name": "Art Center",
      "distance": "6.3 km"
    },
    {
      "id": "destination-4",
      "enabled": true,
      "name": "Benoa Harbour",
      "distance": "11 km"
    },
    {
      "id": "destination-5",
      "enabled": true,
      "name": "Bali Ngurah Rai Airport",
      "distance": "16 km"
    },
    {
      "id": "destination-6",
      "enabled": true,
      "name": "Tanjung Benoa",
      "distance": "24 km"
    }
  ],
  "notes": [
    {
      "id": "travel-note-1",
      "enabled": true,
      "text": "53 restaurants are within a 0.5km radius"
    },
    {
      "id": "travel-note-2",
      "enabled": true,
      "text": "To Ubud 1h 20 minute (23 km) via Jl. By Pass Ngurah Rai"
    },
    {
      "id": "travel-note-3",
      "enabled": true,
      "text": "To Seminyak 1h (16 km) via Jl. By Pass Ngurah Rai dan Jl. Sunset Road"
    },
    {
      "id": "travel-note-4",
      "enabled": true,
      "text": "To Airport 37 minute (16 km) via Jl. By Pass Ngurah Rai"
    },
    {
      "id": "travel-note-5",
      "enabled": true,
      "text": "To Canggu 1h 19 minute (20 km) via Jl. Raya Canggu"
    }
  ],
  "newsletter": {
    "enabled": false,
    "referenceDemoVisual": true,
    "eyebrow": "Join Us",
    "heading": "Sign up to hear the latest from Tandjung Sari",
    "image": {
      "src": "/reference-location/52b0da91d4b79d632f79.webp",
      "alt": "Postcard lettering and a red flower",
      "category": "Nature",
      "focalPoint": {
        "x": 50,
        "y": 50
      }
    },
    "fieldLabel": "Email",
    "actionLabel": "Sign Up"
  }
};
