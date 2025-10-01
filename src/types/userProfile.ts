export interface UserProfile {
  id?: string;
  user_id?: string;
  servings: number | null;
  equipment: Equipment;
  cuisines: string[];
  flavors: string[];
  comfort_foods: string[];
  dislikes: string[];
  dietary_filter: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Equipment {
  stovetop?: {
    type: string[];
    burners: number | null;
  };
  oven?: string[];
  microwave?: string[];
  grill?: string[];
  sousVide?: boolean;
  specialtyGear?: {
    slowCooker: boolean;
    airFryer: boolean;
    pressureCooker: boolean;
    pizzaOven: boolean;
    deepFryer: boolean;
  };
  baking?: {
    mixer: boolean;
    foodProcessor: boolean;
    blender: string[];
    breadEquipment: boolean;
    scale: boolean;
  };
}

export const defaultProfile: UserProfile = {
  servings: null,
  equipment: {
    stovetop: { type: [], burners: null },
    oven: [],
    microwave: [],
    grill: [],
    sousVide: false,
    specialtyGear: {
      slowCooker: false,
      airFryer: false,
      pressureCooker: false,
      pizzaOven: false,
      deepFryer: false,
    },
    baking: {
      mixer: false,
      foodProcessor: false,
      blender: [],
      breadEquipment: false,
      scale: false,
    },
  },
  cuisines: [],
  flavors: [],
  comfort_foods: [],
  dislikes: [],
  dietary_filter: null,
};
