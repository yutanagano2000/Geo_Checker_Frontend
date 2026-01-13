import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Copy, Check } from "lucide-react";

interface JudgmentResult {
  宅地造成等工事規制区域: boolean;
  特定盛土等規制区域: boolean;
}

const TEMPLATES = {
  宅地造成等工事規制区域: "宅地造成規制区域。造成の規模によっては許可申請が必要。現調結果次第で判断いたします。",
  特定盛土等規制区域: "特定盛土規制区域。造成の規模によっては届出 / 許可申請が必要。現調結果次第で判断いたします。",
};

export function GeoSearchView() {
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [prefecture, setPrefecture] = useState("");
  const [result, setResult] = useState<JudgmentResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleSearch = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch("https://geo-checker-backend-aj4j.onrender.com/api/v1/check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          prefecture: prefecture,
        }),
      });

      const data: JudgmentResult = await response.json();
      setResult(data);
    } catch (error) {
      console.error("判定エラー:", error);
      alert("判定に失敗しました。もう一度お試しください。");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      setTimeout(() => setCopiedText(null), 2000);
    } catch (error) {
      console.error("コピーに失敗しました:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-8">
      {/* GeOロゴ */}
      <div className="mb-8">
        <h1 className="text-6xl font-bold tracking-tight">
          <span className="text-[#4285F4]">G</span>
          <span className="text-[#EA4335]">e</span>
          <span className="text-[#34A853]">O</span>
        </h1>
      </div>

      {/* 検索フォーム */}
      <div className="w-full max-w-2xl space-y-4">
        {/* 入力フィールドコンテナ */}
        <div className="bg-card rounded-4xl border border-border shadow-lg p-6 space-y-4">
          {/* 緯度入力 */}
          <div className="space-y-2">
            <label htmlFor="latitude" className="text-sm font-medium text-foreground">
              緯度
            </label>
            <Input
              id="latitude"
              type="number"
              step="any"
              placeholder="例: 34.3853"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              className="w-full [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
          </div>

          {/* 経度入力 */}
          <div className="space-y-2">
            <label htmlFor="longitude" className="text-sm font-medium text-foreground">
              経度
            </label>
            <Input
              id="longitude"
              type="number"
              step="any"
              placeholder="例: 132.4553"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              className="w-full [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
          </div>

          {/* 都道府県選択 */}
          <div className="space-y-2">
            <label htmlFor="prefecture" className="text-sm font-medium text-foreground">
              都道府県
            </label>
            <Select value={prefecture} onValueChange={setPrefecture}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="都道府県を選択してください" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hiroshima">広島県</SelectItem>
                <SelectItem value="okayama">岡山県</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 検索ボタン */}
          <div className="pt-2">
            <Button
              onClick={handleSearch}
              size="lg"
              className="w-full"
              disabled={!latitude || !longitude || !prefecture || isLoading}
            >
              {isLoading ? "判定中..." : "盛土規制区域を判定"}
            </Button>
          </div>
        </div>

        {/* 判定結果表示 */}
        {result && (
          <div className="bg-card rounded-4xl border border-border shadow-lg p-6 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-semibold text-foreground mb-4">判定結果</h2>
            
            {/* 宅地造成等工事規制区域 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/50 border border-border">
                <div className="flex-1">
                  <p className="font-medium text-foreground">宅地造成等工事規制区域</p>
                </div>
                <div className="flex items-center gap-2">
                  {result.宅地造成等工事規制区域 ? (
                    <>
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                      <span className="font-semibold text-green-500">該当します</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-6 h-6 text-red-500" />
                      <span className="font-semibold text-muted-foreground">該当しません</span>
                    </>
                  )}
                </div>
              </div>
              
              {/* テンプレート文言（該当する場合のみ表示） */}
              {result.宅地造成等工事規制区域 && (
                <div className="flex items-start gap-2 p-4 rounded-2xl bg-muted/50 border border-border">
                  <p className="flex-1 text-sm text-foreground leading-relaxed">
                    {TEMPLATES.宅地造成等工事規制区域}
                  </p>
                  <button
                    onClick={() => handleCopy(TEMPLATES.宅地造成等工事規制区域)}
                    className="shrink-0 p-2 rounded-lg hover:bg-accent transition-colors"
                    title="コピー"
                  >
                    {copiedText === TEMPLATES.宅地造成等工事規制区域 ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* 特定盛土等規制区域 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/50 border border-border">
                <div className="flex-1">
                  <p className="font-medium text-foreground">特定盛土等規制区域</p>
                </div>
                <div className="flex items-center gap-2">
                  {result.特定盛土等規制区域 ? (
                    <>
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                      <span className="font-semibold text-green-500">該当します</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-6 h-6 text-red-500" />
                      <span className="font-semibold text-muted-foreground">該当しません</span>
                    </>
                  )}
                </div>
              </div>
              
              {/* テンプレート文言（該当する場合のみ表示） */}
              {result.特定盛土等規制区域 && (
                <div className="flex items-start gap-2 p-4 rounded-2xl bg-muted/50 border border-border">
                  <p className="flex-1 text-sm text-foreground leading-relaxed">
                    {TEMPLATES.特定盛土等規制区域}
                  </p>
                  <button
                    onClick={() => handleCopy(TEMPLATES.特定盛土等規制区域)}
                    className="shrink-0 p-2 rounded-lg hover:bg-accent transition-colors"
                    title="コピー"
                  >
                    {copiedText === TEMPLATES.特定盛土等規制区域 ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* 入力情報表示 */}
            <div className="pt-2 border-t border-border mt-4">
              <p className="text-sm text-muted-foreground">
                判定座標: 緯度 {latitude}, 経度 {longitude} ({prefecture === "hiroshima" ? "広島県" : "岡山県"})
              </p>
            </div>
          </div>
        )}

        {/* 規制区域図のリンクを表示 */}
        {result && (prefecture === "okayama" || prefecture === "hiroshima") && (
          <div className="bg-card rounded-4xl border border-border shadow-lg p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  {prefecture === "hiroshima" ? "広島県" : "岡山県"} 規制区域図
                </h3>
                <p className="text-sm text-muted-foreground">
                  詳細な規制区域図は{prefecture === "hiroshima" ? "広島県" : "岡山県"}の公式ページでご確認ください
                </p>
              </div>
              <Button
                onClick={() => window.open(
                  prefecture === "hiroshima" 
                    ? 'https://www.pref.hiroshima.lg.jp/soshiki/262/moridokeihatsu.html'
                    : 'https://www.pref.okayama.jp/page/915358.html',
                  '_blank'
                )}
              >
                規制区域図を見る
              </Button>
            </div>
          </div>
        )}

        {/* 説明テキスト */}
        <p className="text-center text-sm text-muted-foreground">
          緯度・経度・都道府県を入力して、その座標が盛土等規制区域内かどうかを判定します
        </p>
      </div>
    </div>
  );
}
