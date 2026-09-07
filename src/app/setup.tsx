import { useRouter } from 'expo-router';

import { appRoutes } from '@/navigation/routes';
import { initializeBudget } from '@/application/initialize-budget';
import { getDatabase } from '@/data/database/client';
import { BudgetSetupScreen } from '@/features/setup/budget-setup-screen';
import { useAppStore } from '@/state/app-store';

export default function SetupRoute() {
  const router = useRouter();
  const setPendingAnnouncement = useAppStore((state) => state.setPendingAnnouncement);

  return (
    <BudgetSetupScreen
      onSubmit={async (input) => {
        await initializeBudget(await getDatabase(), input);
        setPendingAnnouncement('Orçamento criado.');
        router.replace(appRoutes.dashboard);
      }}
    />
  );
}
