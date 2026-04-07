import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Clock, ShieldCheck, Lock } from "lucide-react";
import { usePlans } from "@/hooks/usePlans";
import { PATHS } from "@/router/paths";

export function PricingSection() {
  const { t } = useTranslation("landing");
  const { data: plans, isLoading } = usePlans();
  const navigate = useNavigate();

  useEffect(() => {
    if (plans && window.location.hash === "#pricing") {
      const timer = setTimeout(() => {
        const el = document.getElementById("pricing");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [plans]);

  const handleChoosePlan = (planId: number) => {
    navigate(PATHS.checkout(planId.toString()));
  };

  if (isLoading) {
    return (
      <section id="pricing" className="py-20 sm:py-24 px-4">
        <div className="container mx-auto text-center text-muted-foreground">
          {t("pricing.loading")}
        </div>
      </section>
    );
  }

  const sortedPlans = plans ? [...plans].sort((a, b) => a.price - b.price) : [];

  return (
    <section id="pricing" className="py-20 sm:py-24 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6 tracking-tight text-balance">
            {t("pricing.title")}
          </h2>
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {sortedPlans.map((plan, index) => {
              const displayPrice = plan.price.toFixed(2);

              return (
                <Card
                  key={plan.id}
                  className="bg-card border-border/50 transition-all duration-300 animate-fade-in-up hover-lift relative overflow-visible hover:border-primary/30"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <CardHeader className="text-center pb-4">
                    <CardTitle className="text-2xl font-bold text-foreground">
                      {t("pricing.planName", { name: plan.name })}
                    </CardTitle>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-foreground">
                        R$ {displayPrice}
                      </span>
                      <span className="text-muted-foreground">
                        {t("pricing.perMonth")}
                      </span>
                    </div>
                    <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground mt-3">
                      <Clock className="w-3.5 h-3.5 text-primary" />
                      {t("pricing.savingsAnchor")}
                    </p>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    <ul className="space-y-3">
                      {plan.features.map((feature, featureIndex) => (
                        <li
                          key={featureIndex}
                          className="flex items-center space-x-3"
                        >
                          <Check className="w-5 h-5 text-primary flex-shrink-0" />
                          <span className="text-muted-foreground">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      className="w-full py-3 text-lg font-medium"
                      onClick={() => handleChoosePlan(plan.id)}
                    >
                      {t("pricing.cta")}
                    </Button>

                    {/* Risk-Free Guarantee */}
                    <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground text-center pt-2 border-t border-border/50">
                      <ShieldCheck className="w-4 h-4 text-primary flex-shrink-0" />
                      {t("pricing.guarantee")}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* LGPD/GDPR Badge */}
          <div
            className="mt-12 flex flex-col items-center gap-2 animate-fade-in-up"
            style={{ animationDelay: "400ms" }}
          >
            <div className="flex items-center gap-4 rounded-xl border border-border/50 bg-card px-6 py-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Lock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  {t("lgpd.badge")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("lgpd.encryption")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
