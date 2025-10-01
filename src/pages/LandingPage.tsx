import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { MessageCircle, Clock, BookOpen, ChefHat, Utensils, Sparkles } from "lucide-react";
import heroDish from "@/assets/hero-dish.png";
import cookingProcess from "@/assets/cooking-process.png";
import kitchenPrep from "@/assets/kitchen-prep.png";
import culinaryAchievement from "@/assets/culinary-achievement.png";
import logo from "@/assets/logo.png";
const LandingPage = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@400;500;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);
  const handleStartCooking = () => {
    navigate('/chat');
  };
  return <div className="min-h-screen bg-[#F8F7F5]">
      {/* Hero Section */}
      <section className="min-h-screen lg:grid lg:grid-cols-2">
        {/* Video Side */}
        <div className="relative h-[400px] lg:h-screen overflow-hidden bg-[#2C2C2C]">
          <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
            <source src="/hero-video.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
        </div>

        {/* Content Side */}
        <div className="flex items-center justify-center px-6 py-16 lg:px-16 lg:py-24">
          <div className="max-w-xl text-center">
            <img src={logo} alt="Culinary Advisor" className="w-24 h-24 mx-auto mb-6" />
            <h1 className="font-['Playfair_Display'] text-[32px] md:text-[34px] font-semibold text-[#2C2C2C] leading-tight mb-6">
              CulinaryAdvisor.ai
              <br />
              <span className="block mt-2">Your Personal Culinary Mentor</span>
            </h1>
            <p className="font-['Inter'] text-[16px] md:text-[18px] text-[#6B6B6B] leading-relaxed mb-8">
              A Michelin-star chef in your pocket. Learn, cook, and master recipes with AI-powered guidance every step of the way.
            </p>
            <Button onClick={handleStartCooking} className="h-12 md:h-14 px-8 text-base font-medium bg-[#8B7355] hover:bg-[#8B7355]/90 text-white transition-all duration-200 shadow-refined mx-auto">
              Start Cooking
            </Button>
            <p className="font-['Inter'] text-sm text-[#6B6B6B]/70 mt-4">
              No account needed to start
            </p>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-16 md:py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-['Playfair_Display'] text-[18px] md:text-[20px] font-semibold text-[#2C2C2C] text-center mb-12">
            Cooking Shouldn't Feel This Hard
          </h2>
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            <div className="bg-[#E8E6E3] rounded-xl p-8 shadow-refined">
              <BookOpen className="w-8 h-8 text-[#8B7355] mb-4" strokeWidth={1.5} />
              <p className="font-['Inter'] text-[16px] md:text-[18px] text-[#2C2C2C] leading-relaxed">
                Recipes buried in endless blog posts and ads
              </p>
            </div>
            <div className="bg-[#E8E6E3] rounded-xl p-8 shadow-refined">
              <MessageCircle className="w-8 h-8 text-[#8B7355] mb-4" strokeWidth={1.5} />
              <p className="font-['Inter'] text-[16px] md:text-[18px] text-[#2C2C2C] leading-relaxed">
                No one to ask when things go wrong
              </p>
            </div>
            <div className="bg-[#E8E6E3] rounded-xl p-8 shadow-refined">
              <Utensils className="w-8 h-8 text-[#8B7355] mb-4" strokeWidth={1.5} />
              <p className="font-['Inter'] text-[16px] md:text-[18px] text-[#2C2C2C] leading-relaxed">
                Static instructions that can't adapt to your kitchen
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-16 md:py-24 px-6 bg-[#F8F7F5]">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-['Playfair_Display'] text-[18px] md:text-[20px] font-semibold text-[#2C2C2C] text-center mb-12">
            Meet Your AI Culinary Advisor
          </h2>
          
          {/* Feature Images Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-16">
            <img src={heroDish} alt="Beautiful plated dish" className="rounded-xl shadow-refined-md w-full h-64 object-cover" />
            <img src={cookingProcess} alt="Cooking process" className="rounded-xl shadow-refined-md w-full h-64 object-cover" />
          </div>

          {/* Benefits */}
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <MessageCircle className="w-10 h-10 text-[#8B7355] mx-auto mb-4" strokeWidth={1.5} />
              <h3 className="font-['Inter'] text-[16px] md:text-[18px] font-semibold text-[#2C2C2C] mb-2">
                Ask anything, anytime
              </h3>
              <p className="font-['Inter'] text-[14px] md:text-[16px] text-[#6B6B6B] leading-relaxed">
                Get instant answers and recipe modifications
              </p>
            </div>
            <div className="text-center">
              <Clock className="w-10 h-10 text-[#8B7355] mx-auto mb-4" strokeWidth={1.5} />
              <h3 className="font-['Inter'] text-[16px] md:text-[18px] font-semibold text-[#2C2C2C] mb-2">
                Cook with confidence
              </h3>
              <p className="font-['Inter'] text-[14px] md:text-[16px] text-[#6B6B6B] leading-relaxed">
                Step-by-step guidance with built-in timers
              </p>
            </div>
            <div className="text-center">
              <ChefHat className="w-10 h-10 text-[#8B7355] mx-auto mb-4" strokeWidth={1.5} />
              <h3 className="font-['Inter'] text-[16px] md:text-[18px] font-semibold text-[#2C2C2C] mb-2">
                Build your collection
              </h3>
              <p className="font-['Inter'] text-[14px] md:text-[16px] text-[#6B6B6B] leading-relaxed">
                Recipes adapt to your kitchen and preferences
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 md:py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-['Playfair_Display'] text-[18px] md:text-[20px] font-semibold text-[#2C2C2C] text-center mb-12">
            From Idea to Plate in Minutes
          </h2>
          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-[#8B7355] text-white flex items-center justify-center text-2xl font-['Playfair_Display'] font-semibold mx-auto mb-4">
                1
              </div>
              <h3 className="font-['Inter'] text-[16px] md:text-[18px] font-semibold text-[#2C2C2C] mb-2">
                Chat
              </h3>
              <p className="font-['Inter'] text-[14px] md:text-[16px] text-[#6B6B6B] leading-relaxed">
                Describe what you want to cook
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-[#8B7355] text-white flex items-center justify-center text-2xl font-['Playfair_Display'] font-semibold mx-auto mb-4">
                2
              </div>
              <h3 className="font-['Inter'] text-[16px] md:text-[18px] font-semibold text-[#2C2C2C] mb-2">
                Customize
              </h3>
              <p className="font-['Inter'] text-[14px] md:text-[16px] text-[#6B6B6B] leading-relaxed">
                Adapt to your preferences and equipment
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-[#8B7355] text-white flex items-center justify-center text-2xl font-['Playfair_Display'] font-semibold mx-auto mb-4">
                3
              </div>
              <h3 className="font-['Inter'] text-[16px] md:text-[18px] font-semibold text-[#2C2C2C] mb-2">
                Cook
              </h3>
              <p className="font-['Inter'] text-[14px] md:text-[16px] text-[#6B6B6B] leading-relaxed">
                Follow guided steps with timers and support
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative py-24 md:py-32 px-6 overflow-hidden">
        <div className="absolute inset-0">
          <img src={culinaryAchievement} alt="Culinary achievement" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/50" />
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <h2 className="font-['Playfair_Display'] text-[24px] md:text-[28px] font-semibold text-white mb-6">
            Ready to Transform Your Cooking?
          </h2>
          <p className="font-['Inter'] text-[16px] md:text-[18px] text-white/90 mb-8 leading-relaxed">
            Start your culinary journey today. No credit card required.
          </p>
          <Button onClick={handleStartCooking} className="h-14 px-10 text-base font-medium bg-[#8B7355] hover:bg-[#8B7355]/90 text-white transition-all duration-200 shadow-refined-md">
            Start Cooking Now
          </Button>
          <p className="font-['Inter'] text-sm text-white/70 mt-6">
            Free to try • Save recipes with an account • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-[#E8E6E3]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-center items-center gap-6 text-center">
            <a href="#" className="font-['Inter'] text-sm text-[#6B6B6B] hover:text-[#8B7355] transition-colors duration-200">
              About
            </a>
            <a href="#" className="font-['Inter'] text-sm text-[#6B6B6B] hover:text-[#8B7355] transition-colors duration-200">
              Privacy Policy
            </a>
            <a href="#" className="font-['Inter'] text-sm text-[#6B6B6B] hover:text-[#8B7355] transition-colors duration-200">
              Terms
            </a>
            <a href="#" className="font-['Inter'] text-sm text-[#6B6B6B] hover:text-[#8B7355] transition-colors duration-200">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>;
};
export default LandingPage;