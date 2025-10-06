import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper to convert PNG to WebP
async function convertToWebP(pngBuffer: Uint8Array): Promise<Uint8Array> {
  // Note: In production, you'd use a proper image processing library
  // For now, we'll return the buffer as-is and rely on browser conversion
  return pngBuffer;
}

// Helper to create thumbnail
async function createThumbnail(imageBuffer: Uint8Array): Promise<Uint8Array> {
  // Note: In production, you'd resize the image here
  // For now, we'll return the same image
  return imageBuffer;
}

// Background image generation task
async function generateImageInBackground(
  dishName: string,
  supabase: any,
  genAI: any
) {
  try {
    console.log(`[Background] Starting image generation for: ${dishName}`);
    
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-image-preview",
    });

    const prompt = `Hyper-realistic professional food photography of ${dishName}, captured with soft morning light from a north-facing window, creating subtle highlights and natural depth of field falloff. Michelin-star restaurant presentation on sleek modern porcelain with faint natural imperfections, placed on polished Carrara marble or honed concrete countertop with subtle dust motes. Shot with a professional full-frame DSLR, 85mm f/1.4 lens at f/2.8, creating creamy, organic bokeh with razor-sharp focus on the ${dishName} and subtle chromatic aberration. Photorealistic texture showing every detail - moisture, sheen, granular surfaces, and micro-details visible. Natural color accuracy with high dynamic range, showing true-to-life tones without artificial saturation. 45-degree overhead angle capturing depth and dimensionality. Styling emphasizes the actual appearance of fresh, high-quality ingredients with condensation, or natural imperfections that prove authenticity. Clean, contemporary minimalist composition with generous negative space. 8K resolution, untouched RAW file aesthetics with fine, organic film grain resembling Kodak Portra 400. Commercial food photography for editorial publications. Zero illustration or digital painting artifacts - pure photography realism with organic light behavior and realistic lens flare. do not add EXIF data to image`;

    let attempt = 0;
    let imageData: string | null = null;

    while (attempt < 3 && !imageData) {
      attempt++;
      try {
        console.log(`[Background] Attempt ${attempt} for: ${dishName}`);
        const result = await model.generateContent(prompt);
        const response = result.response;

        const parts = response.candidates?.[0]?.content?.parts || [];
        for (const part of parts) {
          if (part.inlineData?.mimeType?.startsWith("image/")) {
            imageData = part.inlineData.data;
            break;
          }
        }

        if (!imageData) {
          throw new Error("No image data in response");
        }
      } catch (error) {
        console.error(`[Background] Attempt ${attempt} failed:`, error);
        if (attempt === 3) throw error;
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
    }

    if (!imageData) {
      throw new Error("Failed to generate image after 3 attempts");
    }

    // Convert base64 to buffer
    const imageBuffer = Uint8Array.from(atob(imageData), (c) => c.charCodeAt(0));
    const baseName = dishName.toLowerCase().replace(/[^a-z0-9]/g, "-");
    const timestamp = Date.now();

    // Upload full-res WebP version
    const fullFileName = `${timestamp}-${baseName}.webp`;
    const { error: fullUploadError } = await supabase.storage
      .from("recipe-images")
      .upload(fullFileName, imageBuffer, {
        contentType: "image/webp",
        cacheControl: "public, max-age=31536000, immutable",
        upsert: false,
      });

    if (fullUploadError) {
      console.error("[Background] Full image upload error:", fullUploadError);
      throw fullUploadError;
    }

    // Upload thumbnail version
    const thumbnailBuffer = await createThumbnail(imageBuffer);
    const thumbFileName = `${timestamp}-${baseName}-thumb.webp`;
    await supabase.storage
      .from("recipe-images")
      .upload(thumbFileName, thumbnailBuffer, {
        contentType: "image/webp",
        cacheControl: "public, max-age=31536000, immutable",
        upsert: false,
      });

    // Get public URLs
    const { data: fullUrlData } = supabase.storage
      .from("recipe-images")
      .getPublicUrl(fullFileName);
    
    const { data: thumbUrlData } = supabase.storage
      .from("recipe-images")
      .getPublicUrl(thumbFileName);

    const fullUrl = fullUrlData.publicUrl;
    const thumbUrl = thumbUrlData.publicUrl;

    // Store in database
    await supabase.from("recipe_images").insert({
      dish_name: dishName.toLowerCase().trim(),
      image_url: fullUrl,
      thumbnail_url: thumbUrl,
      cost: 0.039,
    });

    console.log(`[Background] Successfully generated image for: ${dishName}`);
  } catch (error) {
    console.error(`[Background] Failed to generate image for ${dishName}:`, error);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { dishName, recipeId, async = false } = await req.json();

    if (!dishName) {
      throw new Error("dishName is required");
    }

    console.log(`Image request for: ${dishName}, async: ${async}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if image already exists
    const { data: existingImage } = await supabase
      .from("recipe_images")
      .select("image_url, thumbnail_url")
      .eq("dish_name", dishName.toLowerCase().trim())
      .single();

    if (existingImage?.image_url) {
      console.log(`Using cached image for: ${dishName}`);
      return new Response(
        JSON.stringify({ 
          imageUrl: existingImage.image_url,
          thumbnailUrl: existingImage.thumbnail_url,
          cached: true 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check storage for existing files
    const searchTerm = dishName.toLowerCase().replace(/[^a-z0-9]/g, "-");
    const { data: existingFiles } = await supabase.storage
      .from("recipe-images")
      .list('', { search: searchTerm });

    if (existingFiles && existingFiles.length > 0) {
      console.log(`File exists in storage for: ${dishName}`);
      const existingFile = existingFiles[0];
      const { data: urlData } = supabase.storage
        .from("recipe-images")
        .getPublicUrl(existingFile.name);
      
      return new Response(
        JSON.stringify({ 
          imageUrl: urlData.publicUrl,
          thumbnailUrl: urlData.publicUrl,
          cached: true 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If async mode, start background generation and return immediately
    if (async) {
      const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
      if (!geminiApiKey) {
        throw new Error("GEMINI_API_KEY not configured");
      }

      const genAI = new GoogleGenerativeAI(geminiApiKey);
      
      // Start background generation (fire and forget)
      generateImageInBackground(dishName, supabase, genAI).catch(err => {
        console.error(`Background generation failed for ${dishName}:`, err);
      });

      console.log(`Started background generation for: ${dishName}`);
      return new Response(
        JSON.stringify({ 
          imageUrl: null,
          thumbnailUrl: null,
          cached: false,
          generating: true 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Synchronous generation (fallback for backward compatibility)
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiApiKey) {
      throw new Error("GEMINI_API_KEY not configured");
    }

    const genAI = new GoogleGenerativeAI(geminiApiKey);
    await generateImageInBackground(dishName, supabase, genAI);

    // Fetch the newly created image
    const { data: newImage } = await supabase
      .from("recipe_images")
      .select("image_url, thumbnail_url")
      .eq("dish_name", dishName.toLowerCase().trim())
      .single();

    return new Response(
      JSON.stringify({ 
        imageUrl: newImage?.image_url || null,
        thumbnailUrl: newImage?.thumbnail_url || null,
        cached: false 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in generate-recipe-image:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        imageUrl: null,
        thumbnailUrl: null 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
