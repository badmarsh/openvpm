import { useState } from "react";
import { Mic, X, Search, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { useRouter } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";

export function ScribeWidget() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  // Zjednodušené vyhľadávanie pacientov pre rýchlu konzultáciu
  const { data: patients, isLoading } = trpc.patients.list.useQuery(
    { page: 1, limit: 5, search: debouncedSearch },
    { enabled: open }
  );

  const startConsultation = (patientId: string) => {
    setOpen(false);
    setSearch("");
    router.push(`/records/${patientId}/consultation`);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          size="lg" 
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-xl bg-primary hover:bg-primary/90 hover:scale-105 transition-all p-0 flex items-center justify-center z-50"
        >
          <Mic className="h-6 w-6 text-primary-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent side="top" align="end" className="w-80 p-0 shadow-2xl rounded-xl border-primary/20 mb-2">
        <div className="bg-primary/5 p-4 border-b flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-primary flex items-center gap-2">
              <Mic className="w-4 h-4" /> AI Voice Scribe
            </h3>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 rounded-full" onClick={() => setOpen(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Vyhľadajte pacienta pre začatie hlasovej konzultácie a generovanie SOAP.
          </p>
        </div>
        
        <div className="p-3 border-b">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Vyhľadať pacienta..."
              className="pl-9 bg-background"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="max-h-60 overflow-y-auto p-2 flex flex-col gap-1">
          {isLoading ? (
            <div className="text-center p-4 text-sm text-muted-foreground">Hľadám...</div>
          ) : patients?.items.length === 0 ? (
            <div className="text-center p-4 text-sm text-muted-foreground">Žiadni pacienti neboli nájdení.</div>
          ) : (
            patients?.items.map((patient: any) => (
              <Button 
                key={patient.id} 
                variant="ghost" 
                className="justify-between h-auto py-3 px-3 hover:bg-primary/10"
                onClick={() => startConsultation(patient.id)}
              >
                <div className="flex flex-col items-start gap-0.5 text-left">
                  <span className="font-medium text-sm">{patient.name}</span>
                  <span className="text-xs text-muted-foreground">{patient.species} • {patient.breed || "Neznáme plemeno"}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </Button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
