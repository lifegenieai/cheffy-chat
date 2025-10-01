import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, Settings, Key } from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useUpdateProfile } from "@/hooks/useUpdateProfile";
import { UserProfile, defaultProfile } from "@/types/userProfile";
import { cn } from "@/lib/utils";

interface ProfileSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenResetPassword: () => void;
  onOpenSettings: () => void;
}

export function ProfileSheet({
  open,
  onOpenChange,
  onOpenResetPassword,
  onOpenSettings,
}: ProfileSheetProps) {
  const { data: existingProfile, isLoading } = useUserProfile();
  const updateProfile = useUpdateProfile();
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);

  useEffect(() => {
    if (existingProfile) {
      setProfile(existingProfile);
    } else {
      setProfile(defaultProfile);
    }
  }, [existingProfile]);

  const calculateCompletion = () => {
    let score = 0;

    // Servings: 10%
    if (profile.servings) score += 10;

    // Equipment: 30% (10% each section)
    const hasStoretop = profile.equipment.stovetop?.type.length || 0;
    const hasOven = profile.equipment.oven?.length || 0;
    const hasMicrowave = profile.equipment.microwave?.length || 0;
    if (hasStoretop || hasOven || hasMicrowave) score += 10;

    const hasSpecialty = Object.values(profile.equipment.specialtyGear || {}).some(v => v);
    if (hasSpecialty) score += 10;

    const hasBaking = Object.entries(profile.equipment.baking || {}).some(([k, v]) =>
      Array.isArray(v) ? v.length > 0 : v === true
    );
    if (hasBaking) score += 10;

    // Preferences: 60% (12% each)
    if (profile.cuisines.length > 0) score += 12;
    if (profile.flavors.length > 0) score += 12;
    if (profile.comfort_foods.length > 0) score += 12;
    if (profile.dislikes.length > 0) score += 12;
    if (profile.dietary_filter) score += 12;

    return Math.min(100, Math.round(score));
  };

  const completion = calculateCompletion();

  const toggleArrayItem = (field: keyof UserProfile, value: string) => {
    setProfile(prev => {
      const array = (prev[field] as string[]) || [];
      const exists = array.includes(value);
      return {
        ...prev,
        [field]: exists
          ? array.filter(item => item !== value)
          : [...array, value],
      };
    });
  };

  const handleSave = () => {
    updateProfile.mutate(profile);
  };

  const PillButton = ({
    active,
    onClick,
    children,
  }: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200",
        active
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-muted-foreground hover:bg-muted/80"
      )}
    >
      {children}
    </button>
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-2xl font-serif">My Profile</SheetTitle>
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Profile {completion}% Complete</span>
              {completion < 100 && (
                <span className="text-xs text-muted-foreground">
                  Complete for better recommendations
                </span>
              )}
            </div>
            <Progress value={completion} className="h-2" />
          </div>
        </SheetHeader>

        <div className="mt-8 space-y-6">
          <Accordion type="multiple" className="space-y-4">
            {/* Servings */}
            <AccordionItem value="servings" className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  {profile.servings && <Check className="w-5 h-5 text-primary" />}
                  <span className="font-medium">Servings</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 pb-4">
                <Label htmlFor="servings" className="text-sm text-muted-foreground mb-2 block">
                  How many people do you usually cook for?
                </Label>
                <Input
                  id="servings"
                  type="number"
                  min={1}
                  max={12}
                  value={profile.servings || ""}
                  onChange={e => setProfile({ ...profile, servings: parseInt(e.target.value) || null })}
                  placeholder="Enter number"
                  className="w-32"
                />
              </AccordionContent>
            </AccordionItem>

            {/* Core Cooking & Heating */}
            <AccordionItem value="core-cooking" className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  {(profile.equipment.stovetop?.type.length || profile.equipment.oven?.length || profile.equipment.microwave?.length) ? (
                    <Check className="w-5 h-5 text-primary" />
                  ) : null}
                  <span className="font-medium">Core Cooking & Heating</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 pb-4 space-y-6">
                {/* Stovetop */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">Stovetop</Label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {["Gas", "Induction", "Electric"].map(type => (
                      <PillButton
                        key={type}
                        active={profile.equipment.stovetop?.type.includes(type) || false}
                        onClick={() => {
                          const current = profile.equipment.stovetop?.type || [];
                          const newTypes = current.includes(type)
                            ? current.filter(t => t !== type)
                            : [...current, type];
                          setProfile({
                            ...profile,
                            equipment: {
                              ...profile.equipment,
                              stovetop: { ...profile.equipment.stovetop, type: newTypes, burners: profile.equipment.stovetop?.burners || null },
                            },
                          });
                        }}
                      >
                        {type}
                      </PillButton>
                    ))}
                  </div>
                  <Select
                    value={profile.equipment.stovetop?.burners?.toString() || ""}
                    onValueChange={value => {
                      setProfile({
                        ...profile,
                        equipment: {
                          ...profile.equipment,
                          stovetop: { ...profile.equipment.stovetop, type: profile.equipment.stovetop?.type || [], burners: parseInt(value) },
                        },
                      });
                    }}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Burners" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6].map(num => (
                        <SelectItem key={num} value={num.toString()}>
                          {num === 6 ? "6+" : num} burners
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Oven */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">Oven</Label>
                  <div className="flex flex-wrap gap-2">
                    {["Conventional", "Convection"].map(type => (
                      <PillButton
                        key={type}
                        active={profile.equipment.oven?.includes(type) || false}
                        onClick={() => {
                          const current = profile.equipment.oven || [];
                          const newOven = current.includes(type)
                            ? current.filter(t => t !== type)
                            : [...current, type];
                          setProfile({
                            ...profile,
                            equipment: { ...profile.equipment, oven: newOven },
                          });
                        }}
                      >
                        {type}
                      </PillButton>
                    ))}
                  </div>
                </div>

                {/* Microwave */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">Microwave</Label>
                  <div className="flex flex-wrap gap-2">
                    {["Basic", "Convection Combo"].map(type => (
                      <PillButton
                        key={type}
                        active={profile.equipment.microwave?.includes(type) || false}
                        onClick={() => {
                          const current = profile.equipment.microwave || [];
                          const newMicrowave = current.includes(type)
                            ? current.filter(t => t !== type)
                            : [...current, type];
                          setProfile({
                            ...profile,
                            equipment: { ...profile.equipment, microwave: newMicrowave },
                          });
                        }}
                      >
                        {type}
                      </PillButton>
                    ))}
                  </div>
                </div>

                {/* Grill/Smoker */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">Grill/Smoker</Label>
                  <div className="flex flex-wrap gap-2">
                    {["Charcoal", "Gas", "Pellet", "Kamado", "Offset"].map(type => (
                      <PillButton
                        key={type}
                        active={profile.equipment.grill?.includes(type) || false}
                        onClick={() => {
                          const current = profile.equipment.grill || [];
                          const newGrill = current.includes(type)
                            ? current.filter(t => t !== type)
                            : [...current, type];
                          setProfile({
                            ...profile,
                            equipment: { ...profile.equipment, grill: newGrill },
                          });
                        }}
                      >
                        {type}
                      </PillButton>
                    ))}
                  </div>
                </div>

                {/* Sous Vide */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">Sous Vide</Label>
                  <div className="flex gap-2">
                    <PillButton
                      active={profile.equipment.sousVide === true}
                      onClick={() => setProfile({ ...profile, equipment: { ...profile.equipment, sousVide: true } })}
                    >
                      Yes
                    </PillButton>
                    <PillButton
                      active={profile.equipment.sousVide === false}
                      onClick={() => setProfile({ ...profile, equipment: { ...profile.equipment, sousVide: false } })}
                    >
                      No
                    </PillButton>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Specialty Cooking Gear */}
            <AccordionItem value="specialty-gear" className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  {Object.values(profile.equipment.specialtyGear || {}).some(v => v) && (
                    <Check className="w-5 h-5 text-primary" />
                  )}
                  <span className="font-medium">Specialty Cooking Gear</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 pb-4 space-y-4">
                {[
                  { key: "slowCooker", label: "Slow Cooker/Instant Pot" },
                  { key: "airFryer", label: "Air Fryer" },
                  { key: "pressureCooker", label: "Pressure Cooker" },
                  { key: "pizzaOven", label: "Pizza Oven" },
                  { key: "deepFryer", label: "Deep Fryer" },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <Label className="text-sm font-medium mb-2 block">{label}</Label>
                    <div className="flex gap-2">
                      <PillButton
                        active={profile.equipment.specialtyGear?.[key as keyof typeof profile.equipment.specialtyGear] === true}
                        onClick={() =>
                          setProfile({
                            ...profile,
                            equipment: {
                              ...profile.equipment,
                              specialtyGear: { ...profile.equipment.specialtyGear, [key]: true },
                            },
                          })
                        }
                      >
                        Yes
                      </PillButton>
                      <PillButton
                        active={profile.equipment.specialtyGear?.[key as keyof typeof profile.equipment.specialtyGear] === false}
                        onClick={() =>
                          setProfile({
                            ...profile,
                            equipment: {
                              ...profile.equipment,
                              specialtyGear: { ...profile.equipment.specialtyGear, [key]: false },
                            },
                          })
                        }
                      >
                        No
                      </PillButton>
                    </div>
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>

            {/* Baking & Pastry Essentials */}
            <AccordionItem value="baking" className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  {Object.entries(profile.equipment.baking || {}).some(([k, v]) =>
                    Array.isArray(v) ? v.length > 0 : v === true
                  ) && <Check className="w-5 h-5 text-primary" />}
                  <span className="font-medium">Baking & Pastry Essentials</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 pb-4 space-y-4">
                {[
                  { key: "mixer", label: "Stand/Hand Mixer" },
                  { key: "foodProcessor", label: "Food Processor" },
                  { key: "breadEquipment", label: "Bread Equipment" },
                  { key: "scale", label: "Kitchen Scale" },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <Label className="text-sm font-medium mb-2 block">{label}</Label>
                    <div className="flex gap-2">
                      <PillButton
                        active={profile.equipment.baking?.[key as keyof typeof profile.equipment.baking] === true}
                        onClick={() =>
                          setProfile({
                            ...profile,
                            equipment: {
                              ...profile.equipment,
                              baking: { ...profile.equipment.baking, [key]: true },
                            },
                          })
                        }
                      >
                        Yes
                      </PillButton>
                      <PillButton
                        active={profile.equipment.baking?.[key as keyof typeof profile.equipment.baking] === false}
                        onClick={() =>
                          setProfile({
                            ...profile,
                            equipment: {
                              ...profile.equipment,
                              baking: { ...profile.equipment.baking, [key]: false },
                            },
                          })
                        }
                      >
                        No
                      </PillButton>
                    </div>
                  </div>
                ))}

                {/* Blender Type */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Blender Type</Label>
                  <div className="flex flex-wrap gap-2">
                    {["Standard", "High-Speed", "Immersion"].map(type => (
                      <PillButton
                        key={type}
                        active={profile.equipment.baking?.blender?.includes(type) || false}
                        onClick={() => {
                          const current = profile.equipment.baking?.blender || [];
                          const newBlender = current.includes(type)
                            ? current.filter(t => t !== type)
                            : [...current, type];
                          setProfile({
                            ...profile,
                            equipment: {
                              ...profile.equipment,
                              baking: { ...profile.equipment.baking, blender: newBlender },
                            },
                          });
                        }}
                      >
                        {type}
                      </PillButton>
                    ))}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Favorite Cuisines */}
            <AccordionItem value="cuisines" className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  {profile.cuisines.length > 0 && <Check className="w-5 h-5 text-primary" />}
                  <span className="font-medium">Favorite Cuisines</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 pb-4">
                <div className="flex flex-wrap gap-2">
                  {[
                    "Italian",
                    "French",
                    "Mediterranean",
                    "Chinese",
                    "Japanese",
                    "Thai",
                    "Indian",
                    "Mexican",
                    "American",
                    "BBQ",
                    "Middle Eastern",
                    "North African",
                  ].map(cuisine => (
                    <PillButton
                      key={cuisine}
                      active={profile.cuisines.includes(cuisine)}
                      onClick={() => toggleArrayItem("cuisines", cuisine)}
                    >
                      {cuisine}
                    </PillButton>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Flavors Leaned Toward */}
            <AccordionItem value="flavors" className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  {profile.flavors.length > 0 && <Check className="w-5 h-5 text-primary" />}
                  <span className="font-medium">Flavors Leaned Toward</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 pb-4">
                <div className="flex flex-wrap gap-2">
                  {["Spicy & Bold", "Rich & Creamy", "Fresh & Bright", "Smoky & Earthy", "Sweet & Tangy"].map(
                    flavor => (
                      <PillButton
                        key={flavor}
                        active={profile.flavors.includes(flavor)}
                        onClick={() => toggleArrayItem("flavors", flavor)}
                      >
                        {flavor}
                      </PillButton>
                    )
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Go-To Comfort Foods */}
            <AccordionItem value="comfort-foods" className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  {profile.comfort_foods.length > 0 && <Check className="w-5 h-5 text-primary" />}
                  <span className="font-medium">Go-To Comfort Foods</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 pb-4">
                <div className="flex flex-wrap gap-2">
                  {[
                    "Pasta & Noodles",
                    "BBQ, Burgers & Roasts",
                    "Soups & Stews",
                    "Bread, Pizza & Pastries",
                    "Chocolate & Sweets",
                  ].map(food => (
                    <PillButton
                      key={food}
                      active={profile.comfort_foods.includes(food)}
                      onClick={() => toggleArrayItem("comfort_foods", food)}
                    >
                      {food}
                    </PillButton>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Dislikes / Avoids */}
            <AccordionItem value="dislikes" className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  {profile.dislikes.length > 0 && <Check className="w-5 h-5 text-primary" />}
                  <span className="font-medium">Dislikes / Avoids</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 pb-4">
                <div className="flex flex-wrap gap-2">
                  {[
                    "Spicy Heat",
                    "Seafood / Shellfish",
                    "Strong Flavors",
                    "Bitter or Earthy",
                    "Texture Issues",
                  ].map(dislike => (
                    <PillButton
                      key={dislike}
                      active={profile.dislikes.includes(dislike)}
                      onClick={() => toggleArrayItem("dislikes", dislike)}
                    >
                      {dislike}
                    </PillButton>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Dietary / Lifestyle Filters */}
            <AccordionItem value="dietary" className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  {profile.dietary_filter && <Check className="w-5 h-5 text-primary" />}
                  <span className="font-medium">Dietary / Lifestyle Filters</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 pb-4">
                <div className="flex flex-wrap gap-2">
                  {[
                    "No Restrictions",
                    "Vegetarian",
                    "Vegan",
                    "Health-Conscious",
                    "Protein-Focused / Low-Carb",
                  ].map(diet => (
                    <PillButton
                      key={diet}
                      active={profile.dietary_filter === diet}
                      onClick={() =>
                        setProfile({
                          ...profile,
                          dietary_filter: profile.dietary_filter === diet ? null : diet,
                        })
                      }
                    >
                      {diet}
                    </PillButton>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <Separator className="my-6" />

          {/* Quick Settings Links */}
          <div className="space-y-2">
            <button
              onClick={onOpenResetPassword}
              className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-muted transition-colors duration-200"
            >
              <div className="flex items-center gap-3">
                <Key className="w-5 h-5 text-muted-foreground" />
                <span className="text-foreground font-medium">Reset Password</span>
              </div>
            </button>

            <button
              onClick={onOpenSettings}
              className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-muted transition-colors duration-200"
            >
              <div className="flex items-center gap-3">
                <Settings className="w-5 h-5 text-muted-foreground" />
                <span className="text-foreground font-medium">Settings</span>
              </div>
            </button>
          </div>
        </div>

        {/* Save Button */}
        <div className="sticky bottom-0 bg-background pt-6 pb-4 border-t mt-8">
          <Button
            onClick={handleSave}
            disabled={updateProfile.isPending}
            className="w-full"
            size="lg"
          >
            {updateProfile.isPending ? "Saving..." : "Save Profile"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
