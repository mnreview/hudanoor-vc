import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getConfigurationStatus } from '@/lib/sheets-adapter';
import { CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react';

export function ConnectionStatus() {
  const [status, setStatus] = useState(getConfigurationStatus());

  useEffect(() => {
    setStatus(getConfigurationStatus());
  }, []);

  if (status.isConfigured) {
    return (
      <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 dark:bg-green-950 dark:text-green-400 dark:border-green-800 text-xs">
        <CheckCircle className="h-2 w-2 mr-1" />
        ออนไลน์
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50 dark:bg-red-950 dark:text-red-400 dark:border-red-800 text-xs">
      <AlertTriangle className="h-2 w-2 mr-1" />
      ออฟไลน์
    </Badge>
  );
}