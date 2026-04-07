import * as React from "react";
import * as XLSX from "xlsx";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Plus
} from "lucide-react";
import { actions } from "astro:actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { exerciseLibraryCopy } from "@/data/es/profesor/ejercicios";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface ImportExercisesModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (count: number) => void;
}

interface RawData {
  Nombre?: string;
  nombre?: string;
  Descripcion?: string;
  descripcion?: string;
  Media?: string;
  media?: string;
  Video?: string;
  video?: string;
}

interface ParsedExercise {
  nombre: string;
  descripcion?: string | null;
  media_url?: string | null;
}

export function ImportExercisesModal({ isOpen, onOpenChange, onSuccess }: ImportExercisesModalProps) {
  const [file, setFile] = React.useState<File | null>(null);
  const [data, setData] = React.useState<ParsedExercise[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [processing, setProcessing] = React.useState(false);
  const copy = exerciseLibraryCopy.import;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setProcessing(true);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const raw = XLSX.utils.sheet_to_json(ws) as RawData[];

        // Mapeo flexible de columnas
        const parsed = raw.map(row => {
          const nombre = row.Nombre || row.nombre;
          if (!nombre) return null;

          return {
            nombre: String(nombre).trim(),
            descripcion: String(row.Descripcion || row.descripcion || "").trim() || null,
            media_url: String(row.Media || row.media || row.Video || row.video || "").trim() || null,
          };
        }).filter(Boolean) as ParsedExercise[];

        setData(parsed);
      } catch (err) {
        toast.error(copy.error);
        setFile(null);
      } finally {
        setProcessing(false);
      }
    };
    reader.readAsBinaryString(selectedFile);
  };

  const handleImport = async () => {
    if (data.length === 0) {
      toast.error(copy.empty);
      return;
    }

    setLoading(true);
    try {
      const { data: res, error } = await actions.profesor.importExercises(data);
      if (error) throw error;

      if (res.success) {
        toast.success(copy.success.replace("{count}", res.count.toString()));
        onSuccess(res.count);
        onOpenChange(false);
        reset();
      }
    } catch (err: any) {
      toast.error(err.message || copy.error);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setData([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) reset();
      onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden rounded-t-[2.5rem] sm:rounded-3xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl sm:text-2xl font-bold uppercase tracking-tight flex items-center gap-2">
            <div className="p-2 bg-lime-500/10 rounded-xl">
              <FileSpreadsheet className="w-5 h-5 sm:w-6 sm:h-6 text-lime-500" />
            </div>
            {copy.title}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm font-medium">
            {copy.description}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {!file ? (
            <label className="group relative flex flex-col items-center justify-center w-full h-48 sm:h-64 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl hover:bg-zinc-50 dark:hover:bg-zinc-900/50 hover:border-lime-400 transition-all cursor-pointer">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <div className="p-3 sm:p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800 mb-4 group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-zinc-400 group-hover:text-lime-500" />
                </div>
                <p className="mb-2 text-xs sm:text-sm font-bold text-center px-4">{copy.dropzone}</p>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">{copy.hint}</p>
              </div>
              <input type="file" className="hidden" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} />
            </label>
          ) : (
            <div className="space-y-6">
              {/* File Header */}
              <div className="flex items-center justify-between p-3 sm:p-4 bg-zinc-100 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white dark:bg-zinc-950 rounded-lg shadow-sm">
                    <FileSpreadsheet className="w-4 h-4 sm:w-5 sm:h-5 text-lime-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-bold truncate max-w-[150px] sm:max-w-[200px]">{file.name}</p>
                    <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                      {data.length} ejercicios detectados
                    </p>
                  </div>
                </div>
                <button onClick={reset} className="p-2 hover:bg-white dark:hover:bg-zinc-800 rounded-full transition-colors flex-shrink-0">
                  <X className="w-4 h-4 text-zinc-400" />
                </button>
              </div>

              {/* Preview Table */}
              <div className="space-y-3">
                <h4 className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-zinc-400 px-1">{copy.preview}</h4>
                <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden bg-white dark:bg-zinc-950">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[500px] sm:min-w-0">
                      <thead className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
                        <tr>
                          <th className="px-4 py-3 text-left font-bold uppercase tracking-widest text-[9px] text-zinc-500">Nombre</th>
                          <th className="px-4 py-3 text-left font-bold uppercase tracking-widest text-[9px] text-zinc-500">Descripción</th>
                          <th className="px-4 py-3 text-left font-bold uppercase tracking-widest text-[9px] text-zinc-500">Media</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
                        {data.slice(0, 5).map((row, i) => (
                          <tr key={i} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                            <td className="px-4 py-3 font-bold text-zinc-900 dark:text-zinc-100 whitespace-nowrap">{row.nombre}</td>
                            <td className="px-4 py-3 text-zinc-500 truncate max-w-[150px] whitespace-nowrap">{row.descripcion || "-"}</td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              {row.media_url ? (
                                <div className="w-6 h-6 bg-lime-100 dark:bg-lime-900/30 rounded flex items-center justify-center">
                                  <CheckCircle2 className="w-3 h-3 text-lime-600" />
                                </div>
                              ) : "-"}
                            </td>
                          </tr>
                        ))}
                        {data.length > 5 && (
                          <tr>
                            <td colSpan={3} className="px-4 py-3 text-center text-[10px] font-bold uppercase text-zinc-400 bg-zinc-50/50 whitespace-nowrap">
                              +{data.length - 5} ejercicios más...
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 sm:p-6 bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto rounded-xl font-bold uppercase tracking-widest text-[10px] h-12 px-6 order-2 sm:order-1">
            {copy.cancel}
          </Button>
          <Button
            onClick={handleImport}
            disabled={loading || data.length === 0}
            className="w-full sm:w-auto rounded-xl bg-lime-500 hover:bg-lime-500 text-zinc-950 font-bold uppercase tracking-widest text-[10px] h-12 px-6 shadow-lg shadow-lime-400/20 order-1 sm:order-2"
          >
            {loading || processing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                {copy.confirm}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
