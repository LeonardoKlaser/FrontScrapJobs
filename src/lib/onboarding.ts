export function shouldStartWebOnboarding(
  onboardingCompleted: boolean | undefined,
  monitoredURLsCount: number
): boolean {
  // O count mantém compatibilidade com contas antigas migradas; o estado
  // explícito cobre fluxos multicanal e planos sem user_sites (como Ultra).
  return onboardingCompleted !== true && monitoredURLsCount === 0
}
