import { useRouter } from 'expo-router';

import { appRoutes } from '@/navigation/routes';
import { initializeBudget } from '@/application/initialize-budget';
import { getDatabase } from '@/data/database/client';
import { BudgetSetupScreen } from '@/features/setup/budget-setup-screen';

export default function SetupRoute() {
  const router = useRouter();

  return (
    <BudgetSetupScreen
      onSubmit={async (input) => {
        await initializeBudget(await getDatabase(), input);
        router.replace(appRoutes.dashboard);
      }}
    />
  );
}
