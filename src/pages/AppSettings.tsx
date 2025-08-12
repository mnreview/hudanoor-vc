import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSettings } from "@/hooks/use-settings";
import { 
  Settings as SettingsIcon, 
  Store, 
  Palette, 
  FileText, 
  Save,
  Check,
  RotateCcw,
  Loader2
} from "lucide-react";

const colorOptions = [
  { name: "Rose", value: "#e11d48" },
  { name: "Pink", value: "#ec4899" },
  { name: "Purple", value: "#a855f7" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Green", value: "#10b981" },
  { name: "Orange", value: "#f97316" },
  { name: "Red", value: "#ef4444" }
];

export function AppSettings() {
  const { settings, isLoading, saveSettings, isSaving } = useSettings();
  const [localSettings, setLocalSettings] = useState(settings);

  // อัพเดต localSettings เมื่อ settings จาก server เปลี่ยน
  React.useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSaveSettings = () => {
    saveSettings(localSettings);
  };

  const handleResetSettings = () => {
    // รีเซ็ตเป็นค่าเริ่มต้น
    const defaultSettings = {
      storeName: "HUDANOOR",
      websiteName: "ระบบบันทึกรายรับ-รายจ่าย",
      storeSlogan: "เสื้อผ้าแฟชั่นมุสลิม",
      primaryColor: "#e11d48",
      storeAddress: "",
      storePhone: "",
      storeEmail: "",
      currency: "THB",
      dateFormat: "DD/MM/YYYY",
      defaultSalesTarget: 15000
    };
    
    setLocalSettings({ ...localSettings, ...defaultSettings });
    saveSettings(defaultSettings);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">กำลังโหลดการตั้งค่า...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
            การตั้งค่า
          </h1>
          <div>
            <p className="text-muted-foreground mt-1">
              ปรับแต่งระบบให้เหมาะสมกับการใช้งานของคุณ
            </p>
            {settings.updatedAt && (
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                <Check className="h-3 w-3 inline mr-1" />
                บันทึกล่าสุด: {new Date(settings.updatedAt).toLocaleString('th-TH')}
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={handleResetSettings}
            variant="outline"
            disabled={isSaving}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            รีเซ็ต
          </Button>
          <Button 
            onClick={handleSaveSettings} 
            disabled={isSaving}
            className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                กำลังบันทึก...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                บันทึกการตั้งค่า
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="store" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="store">ข้อมูลร้าน</TabsTrigger>
          <TabsTrigger value="appearance">รูปลักษณ์</TabsTrigger>
          <TabsTrigger value="system">ระบบ</TabsTrigger>
        </TabsList>

        <TabsContent value="store" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                ข้อมูลร้านค้า
              </CardTitle>
              <CardDescription>
                ตั้งค่าข้อมูลพื้นฐานของร้านค้า
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="storeName">ชื่อร้าน</Label>
                  <Input
                    id="storeName"
                    value={localSettings.storeName}
                    onChange={(e) => setLocalSettings({...localSettings, storeName: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="websiteName">ชื่อเว็บไซต์</Label>
                  <Input
                    id="websiteName"
                    value={localSettings.websiteName}
                    onChange={(e) => setLocalSettings({...localSettings, websiteName: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="storeSlogan">สโลแกนร้าน</Label>
                <Input
                  id="storeSlogan"
                  value={localSettings.storeSlogan || ""}
                  onChange={(e) => setLocalSettings({...localSettings, storeSlogan: e.target.value})}
                  placeholder="เช่น เสื้อผ้าแฟชั่นมุสลิม"
                />
              </div>

              <div>
                <Label htmlFor="storeAddress">ที่อยู่ร้าน</Label>
                <Textarea
                  id="storeAddress"
                  value={localSettings.storeAddress || ""}
                  onChange={(e) => setLocalSettings({...localSettings, storeAddress: e.target.value})}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="storePhone">เบอร์โทรศัพท์</Label>
                  <Input
                    id="storePhone"
                    value={localSettings.storePhone || ""}
                    onChange={(e) => setLocalSettings({...localSettings, storePhone: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="storeEmail">อีเมล</Label>
                  <Input
                    id="storeEmail"
                    type="email"
                    value={localSettings.storeEmail || ""}
                    onChange={(e) => setLocalSettings({...localSettings, storeEmail: e.target.value})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                รูปลักษณ์และธีม
              </CardTitle>
              <CardDescription>
                ปรับแต่งสีและรูปลักษณ์ของระบบ
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>สีหลักของระบบ</Label>
                <div className="grid grid-cols-7 gap-2 mt-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      className={`w-12 h-12 rounded-lg border-2 ${
                        localSettings.primaryColor === color.value 
                          ? 'border-gray-900 dark:border-white' 
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                      style={{ backgroundColor: color.value }}
                      onClick={() => setLocalSettings({...localSettings, primaryColor: color.value})}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="h-5 w-5" />
                การตั้งค่าระบบ
              </CardTitle>
              <CardDescription>
                ตั้งค่าพื้นฐานของระบบ
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="currency">สกุลเงิน</Label>
                  <Select value={localSettings.currency} onValueChange={(value) => setLocalSettings({...localSettings, currency: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="THB">บาท (THB)</SelectItem>
                      <SelectItem value="USD">ดอลลาร์ (USD)</SelectItem>
                      <SelectItem value="EUR">ยูโร (EUR)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="dateFormat">รูปแบบวันที่</Label>
                  <Select value={localSettings.dateFormat} onValueChange={(value) => setLocalSettings({...localSettings, dateFormat: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="defaultSalesTarget">เป้าหมายยอดขายเริ่มต้น</Label>
                  <Input
                    id="defaultSalesTarget"
                    type="number"
                    value={localSettings.defaultSalesTarget}
                    onChange={(e) => setLocalSettings({...localSettings, defaultSalesTarget: Number(e.target.value)})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}