import React from "react";
import { CircleCheck, Plus, Calendar as CalendarIcon, ArrowRight, Link } from "lucide-react";
import { inviteStudentCopy } from "@/data/es/profesor/alumnos";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";

interface SuccessData {
    id: string;
    email: string;
    name: string;
    date: string;
    phone?: string;
}

interface Props {
    data: SuccessData | null;
    onShareWhatsApp: () => void;
    onCopyLink: () => void;
    turnosCount: number;
}

/**
 * InviteSuccessDialog: Feedback visual tras una invitación exitosa.
 * Centraliza las acciones post-creación en un diálogo industrial.
 */
export function InviteSuccessDialog({ data, onShareWhatsApp, onCopyLink, turnosCount }: Props) {
    if (!data) return null;

    return (
        <Dialog open={!!data} onOpenChange={(open) => !open && window.location.assign(`/profesor/alumnos/${data.id}`)}>
            <DialogContent className="sm:max-w-md text-center p-10 gap-8 border-none bg-white dark:bg-zinc-950 rounded-[3rem] shadow-2xl overflow-hidden scale-in-center">
                <div className="mx-auto bg-lime-500 text-zinc-950 p-4 rounded-2xl w-20 h-20 flex items-center justify-center shadow-lg shadow-lime-400/20 animate-bounce">
                    <CircleCheck className="w-10 h-10" />
                </div>

                <div className="space-y-4">
                    <DialogTitle className="text-3xl font-bold tracking-tighter text-center text-zinc-950 dark:text-zinc-50 leading-tight">
                        {inviteStudentCopy.messages.successModal.title.replace('{name}', data.name)}
                    </DialogTitle>
                    <p className="text-sm font-medium text-zinc-400 text-center leading-relaxed max-w-[280px] mx-auto pt-2">
                        {inviteStudentCopy.messages.successModal.description}
                    </p>
                </div>

                <DialogFooter className="flex-col sm:flex-col gap-3 w-full px-2 pt-4">
                    {data.phone && (
                        <Button onClick={onShareWhatsApp} variant="industrial" size="xl" className="w-full bg-[#25D366] hover:bg-[#20ba59] border-[#25D366] text-white shadow-lg shadow-[#25D366]/20 py-8 text-sm group">
                            <Plus className="w-5 h-5 mr-3 group-hover:rotate-90 transition-transform" />
                            {inviteStudentCopy.messages.successModal.btnWhatsApp}
                        </Button>
                    )}
                    {turnosCount > 0 && (
                        <Button
                            onClick={() => window.location.assign("/profesor/agenda")}
                            variant="outline"
                            size="xl"
                            className="w-full border-lime-200 dark:border-lime-900/30 bg-lime-50/30 dark:bg-lime-900/10 text-lime-700 dark:text-lime-400 font-bold h-14 hover:bg-lime-50 hover:border-lime-300 transition-all text-sm"
                        >
                            <CalendarIcon className="w-4 h-4 mr-2" />
                            {inviteStudentCopy.messages.successModal.btnAgenda}
                        </Button>
                    )}
                    <Button onClick={onCopyLink} variant="outline" size="xl" className="w-full border-zinc-100 dark:border-zinc-800 font-bold text-[10px] tracking-[0.2em] text-zinc-400 h-14 uppercase">
                        <Link className="w-4 h-4 mr-2" />
                        {inviteStudentCopy.messages.successModal.btnGuestLink}
                    </Button>
                    <Button
                        onClick={() => window.location.assign(`/profesor/alumnos/${data.id}`)}
                        variant="ghost"
                        size="lg"
                        className="w-full h-14 rounded-2xl font-bold text-[10px] tracking-[0.2em] text-zinc-400 hover:text-zinc-950 transition-all uppercase"
                    >
                        {inviteStudentCopy.messages.successModal.btnProfile}
                        <ArrowRight className="w-4 h-4 ml-2 animate-pulse" />
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
