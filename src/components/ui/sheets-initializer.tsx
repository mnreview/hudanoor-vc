import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { initializeSheets } from '@/lib/google-apps-script';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export function SheetsInitializer() {
  const [isInitializing, setIsInitializing] = useState(false);
  const [initStatus, setInitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleInitialize = async () => {
    setIsInitializing(true);
    setInitStatus('idle');
    setErrorMessage('');

    try {
      await initializeSheets();
      setInitStatus('success');
    } catch (error) {
      setInitStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'เกิดข้อผิดพลาดไม่ทราบสาเหตุ');
    } finally {
      setIsInitializing(false);
    }
  };

  return (
    <div className="mb-4">
      <div className="flex items-center justify-center">
        <Button 
          onClick={() => setIsExpanded(!isExpanded)}
          variant="ghost"
          size="sm"
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          ตั้งค่าเริ่มต้น
        </Button>
      </div>

      {isExpanded && (
        <div className="mt-2 space-y-2">
          <div className="flex justify-center">
            <Button 
              onClick={handleInitialize}
              disabled={isInitializing}
              variant="outline"
              size="sm"
            >
              {isInitializing ? (
                <>
                  <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                  กำลังตั้งค่า...
                </>
              ) : (
                'ตั้งค่า Headers ใน Google Sheets'
              )}
            </Button>
          </div>

          {initStatus === 'success' && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 text-sm">
                ตั้งค่า Headers สำเร็จแล้ว!
              </AlertDescription>
            </Alert>
          )}

          {initStatus === 'error' && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <strong>เกิดข้อผิดพลาด:</strong>
                <p className="mt-1">{errorMessage}</p>
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </div>
  );
}